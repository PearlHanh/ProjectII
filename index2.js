import express from "express";
import { Pool } from "pg";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối PostgreSQL cho Order
const db2 = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

db2.connect()
  .then(() => console.log("✅ Đã kết nối PostgreSQL Order!"))
  .catch((err) => console.error("❌ Lỗi kết nối PostgreSQL:", err));

// ✅ GET danh sách món ăn
app.get('/api/orderlist', async (req, res) => {
  try {
    const result = await db2.query('SELECT * FROM "order".dish');
    res.json(result.rows);
  } catch (err) {
    console.error("Lỗi truy vấn:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ✅ POST: đặt món ăn cho từng bàn
app.post("/api/ordertable", async (req, res) => {
  let { id_table, id_dish, quantity } = req.body;
  quantity = typeof quantity === 'number' ? quantity : 0;

  if (!id_table || !id_dish || typeof quantity !== 'number') {
    return res.status(400).json({ error: "Thiếu dữ liệu cần thiết" });
  }

  try {
    await db2.query(`
      INSERT INTO "order".ordertable (id_table, id_dish, dish_quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (id_table, id_dish)
      DO UPDATE SET dish_quantity = "order".ordertable.dish_quantity + EXCLUDED.dish_quantity
    `, [id_table, id_dish, quantity]);

    await db2.query(`
      INSERT INTO "order".total (id_dish, quantity, time)
      VALUES ($1, $2, NOW())
      ON CONFLICT (id_dish, time::date)
      DO UPDATE SET quantity = "order".total.quantity + EXCLUDED.quantity
    `, [id_dish, quantity]);

    res.status(200).json({ message: "Đã lưu order thành công" });
  } catch (err) {
    console.error("Lỗi khi insert:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ✅ GET order của bàn
app.get('/api/ordertable/:id_table', async (req, res) => {
  const id_table = req.params.id_table;

  try {
    const result = await db2.query(`
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

// ✅ GET danh sách bàn
app.get('/api/tablename', async (req, res) => {
  try {
    const result = await db2.query(`
      SELECT * FROM "order".tablename
      ORDER BY CAST(SUBSTRING(id_table FROM 3) AS INTEGER)
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách bàn:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ✅ GET chi tiết order và tổng giá
app.get('/api/order/:id_table', async (req, res) => {
  const id_table = req.params.id_table;

  try {
    const result = await db2.query(`
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

// ✅ GET thống kê món ăn
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
    const result = await db2.query(`
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
    console.error("Lỗi khi lấy thống kê món ăn:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

app.listen(4000, () => {
  console.log("✅ Backend đang chạy tại http://localhost:4000");
});
