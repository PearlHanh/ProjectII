import express from "express";
import { Pool } from "pg";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors(
  {origin: ["https://hoanganhbui2110.netlify.app"], // ← đúng domain frontend
    methods: ["GET", "POST", "OPTIONS"],             // ← cho phép các method
    credentials: true}
));
app.use(express.json());

// Kết nối đến cùng 1 DATABASE_URL nhưng phân biệt schema bằng search_path
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

db.connect()
  .then(() => console.log("✅ Đã kết nối PostgreSQL!"))
  .catch((err) => console.error("❌ Lỗi kết nối PostgreSQL:", err));

// LOGIN
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query(`SELECT * FROM login.username WHERE username = $1 AND password = $2`, [username, password]);
    if (result.rows.length > 0) {
      res.json({ success: true, message: "1" });
    } else {
      res.json({ success: false, message: "0" });
    }
  } catch (err) {
    console.error("Lỗi truy vấn login:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ORDER - lấy danh sách món ăn
app.get('/api/orderlist', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM "order".dish');
    res.json(result.rows);
  } catch (err) {
    console.error("Lỗi truy vấn orderlist:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ORDER - thêm món vào order
app.post("/api/ordertable", async (req, res) => {
  let { id_table, id_dish, quantity } = req.body;
  quantity = typeof quantity === 'number' ? quantity : 0;

  if (!id_table || !id_dish || typeof quantity !== 'number') {
    return res.status(400).json({ error: "Thiếu dữ liệu cần thiết" });
  }

  try {
    await db.query(`
      INSERT INTO "order".ordertable (id_table, id_dish, dish_quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (id_table, id_dish)
      DO UPDATE SET dish_quantity = "order".ordertable.dish_quantity + EXCLUDED.dish_quantity
    `, [id_table, id_dish, quantity]);

    await db.query(`
      INSERT INTO "order".total (id_dish, quantity, time)
      VALUES ($1, $2, NOW())
      ON CONFLICT (id_dish, time::date)
      DO UPDATE SET quantity = "order".total.quantity + EXCLUDED.quantity
    `, [id_dish, quantity]);

    res.status(200).json({ message: "Đã lưu order thành công" });
  } catch (err) {
    console.error("Lỗi khi insert order:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ORDER - lấy order theo bàn
app.get('/api/ordertable/:id_table', async (req, res) => {
  const id_table = req.params.id_table;
  try {
    const result = await db.query(`
      SELECT o.id_table, o.id_dish, o.dish_quantity,
             d.dish_name, d.dish_cost, d.dish_image
      FROM "order".ordertable o
      JOIN "order".dish d ON o.id_dish = d.id_dish
      WHERE o.id_table = $1
    `, [id_table]);
    res.json(result.rows);
  } catch (err) {
    console.error("Lỗi khi lấy order:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ORDER - lấy danh sách bàn
app.get('/api/tablename', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM "order".tablename
      ORDER BY CAST(SUBSTRING(id_table FROM 3) AS INTEGER)
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách bàn:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ORDER - chi tiết order và tổng giá
app.get('/api/order/:id_table', async (req, res) => {
  const id_table = req.params.id_table;
  try {
    const result = await db.query(`
      SELECT 
        o.id_dish, 
        d.dish_name, 
        d.dish_cost, 
        o.dish_quantity,
        d.dish_image,
        (d.dish_cost * o.dish_quantity) AS total_cost
      FROM "order".ordertable o
      JOIN "order".dish d ON o.id_dish = d.id_dish
      WHERE o.id_table = $1
    `, [id_table]);
    res.json(result.rows);
  } catch (err) {
    console.error("Lỗi truy vấn:", err);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
});

// ORDER - thống kê
app.get('/api/statistics/dish', async (req, res) => {
  const period = req.query.period || 'thismonth';
  let dateCondition = '';

  switch (period) {
    case 'premonth':
      dateCondition = `EXTRACT(MONTH FROM t.time) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month')
                       AND EXTRACT(YEAR FROM t.time) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month')`;
      break;
    case 'thisweek':
      dateCondition = `EXTRACT(WEEK FROM t.time) = EXTRACT(WEEK FROM CURRENT_DATE)
                       AND EXTRACT(YEAR FROM t.time) = EXTRACT(YEAR FROM CURRENT_DATE)`;
      break;
    case 'thisday':
      dateCondition = `DATE(t.time) = CURRENT_DATE`;
      break;
    default:
      dateCondition = `EXTRACT(MONTH FROM t.time) = EXTRACT(MONTH FROM CURRENT_DATE)
                       AND EXTRACT(YEAR FROM t.time) = EXTRACT(YEAR FROM CURRENT_DATE)`;
  }

  try {
    const result = await db.query(`
      SELECT 
        t.id_dish, 
        d.dish_name, 
        d.dish_image, 
        SUM(t.quantity) AS total_quantity,
        (d.dish_cost * SUM(t.quantity)) AS total_cost
      FROM "order".total t
      JOIN "order".dish d ON t.id_dish = d.id_dish
      WHERE ${dateCondition}
      GROUP BY t.id_dish, d.dish_name, d.dish_image, d.dish_cost
      ORDER BY total_quantity DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Lỗi thống kê món ăn:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});
app.options('*', cors());
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Backend đang chạy tại http://localhost:${PORT}`);
});
