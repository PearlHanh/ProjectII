import express from "express";
import { Pool } from "pg";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const corsOptions = {
  origin: "https://hoanganhbui2110.netlify.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20, // Số kết nối tối đa
  idleTimeoutMillis: 30000, // Thời gian chờ kết nối không hoạt động
  connectionTimeoutMillis: 2000, // Thời gian chờ kết nối
});

db.connect()
  .then(() => console.log("✅ Đã kết nối PostgreSQL!"))
  .catch((err) => console.error("❌ Lỗi kết nối PostgreSQL:", err));

// LOGIN
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query(
      `SELECT * FROM login.username WHERE username = $1 AND password = $2`,
      [username, password]
    );
    if (result.rows.length > 0) {
      return res.json({ success: true, message: "1" });
    } else {
      return res.json({ success: false, message: "0" });
    }
  } catch (err) {
    console.error("Lỗi truy vấn login:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
});

// ORDER - lấy danh sách món ăn
app.get("/api/orderlist", async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM "order".dish`);
    return res.json(result.rows);
  } catch (err) {
    console.error("Lỗi truy vấn orderlist:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
});

// ORDER - thêm món vào order
app.post("/api/ordertable", async (req, res) => {
  let { id_table, id_dish, quantity } = req.body;
  quantity = typeof quantity === "number" ? quantity : 0;

  if (!id_table || !id_dish || typeof quantity !== "number") {
    return res.status(400).json({ error: "Thiếu dữ liệu cần thiết" });
  }

  try {
    await db.query(
      `
      INSERT INTO "order".ordertable (id_table, id_dish, dish_quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (id_table, id_dish)
      DO UPDATE SET dish_quantity = "order".ordertable.dish_quantity + EXCLUDED.dish_quantity
    `,
      [id_table, id_dish, quantity]
    );

    await db.query(
      `
      INSERT INTO "order".total (id_dish, quantity, time)
      VALUES ($1, $2, NOW())
      ON CONFLICT (id_dish, time)
      DO UPDATE SET quantity = "order".total.quantity + EXCLUDED.quantity
    `,
      [id_dish, quantity]
    );

    return res.status(200).json({ message: "Đã lưu order thành công" });
  } catch (err) { 
    console.error("Lỗi khi insert order:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
});

// Delete order
app.delete("/api/ordertable/delete/:id_table", async (req, res) => {
  const { id_table } = req.params;

  try {
    await db.query(`DELETE FROM "order".ordertable WHERE id_table = $1`, [id_table]);
    return res.status(200).json({ message: "Đã xoá order cho bàn " + id_table });
  } catch (err) {
    console.error("Lỗi khi xoá order:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
});
// ORDER - lấy order theo bàn
app.get("/api/ordertable/:id_table", async (req, res) => {
  const id_table = req.params.id_table;
  try {
    const result = await db.query(
      `
      SELECT o.id_table, o.id_dish, o.dish_quantity,
             d.dish_name, d.dish_cost, d.dish_image
      FROM "order".ordertable o
      JOIN "order".dish d ON o.id_dish = d.id_dish
      WHERE o.id_table = $1
    `,
      [id_table]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("Lỗi khi lấy order:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
});

// ORDER - lấy danh sách bàn
app.get("/api/tablename", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM "order".tablename
      ORDER BY CAST(SUBSTRING(id_table FROM 3) AS INTEGER)
    `);
    return res.json(result.rows);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách bàn:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
});

// ORDER - chi tiết order và tổng giá
app.get("/api/order/:id_table", async (req, res) => {
  const id_table = req.params.id_table;
  try {
    const result = await db.query(
      `
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
    `,
      [id_table]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("Lỗi truy vấn:", err);
    return res.status(500).json({ error: "Lỗi máy chủ" });
  }
});

// ORDER - thống kê
app.get("/api/statistics/dish", async (req, res) => {
  const period = req.query.period || "thismonth";
  let dateCondition = "";

  switch (period) {
    case "premonth":
      dateCondition = `
        EXTRACT(MONTH FROM t.time) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month') AND
        EXTRACT(YEAR FROM t.time) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month')
      `;
      break;
    case "thisweek":
      dateCondition = `
        EXTRACT(WEEK FROM t.time) = EXTRACT(WEEK FROM CURRENT_DATE) AND
        EXTRACT(YEAR FROM t.time) = EXTRACT(YEAR FROM CURRENT_DATE)
      `;
      break;
    case "thisday":
      dateCondition = `DATE(t.time) = CURRENT_DATE`;
      break;
    default:
      dateCondition = `
        EXTRACT(MONTH FROM t.time) = EXTRACT(MONTH FROM CURRENT_DATE) AND
        EXTRACT(YEAR FROM t.time) = EXTRACT(YEAR FROM CURRENT_DATE)
      `;
  }

  try {
    const result = await db.query(
      `
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
    `
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("Lỗi thống kê món ăn:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
});

// Cap nhat thong tin nhan vien
app.put("/api/employee/:id", async (req, res) => {
  const { id } = req.params;
  const { employee_name, birthday, gender, phone, office_name } = req.body;

  try {
    // Lấy id_office tương ứng với office_name
    const officeRes = await db.query(
      `SELECT id_office FROM login.office WHERE office_name = $1`,
      [office_name]
    );
    if (officeRes.rows.length === 0) {
      return res.status(400).json({ error: "Không tìm thấy office_name." });
    }

    const id_office = officeRes.rows[0].id_office;

    // Cập nhật thông tin nhân viên
    await db.query(
      `UPDATE login.employee
       SET employee_name = $1,
           birthday = $2,
           gender = $3,
           phone = $4,
           id_office = $5
       WHERE id_employee = $6`,
      [employee_name, birthday, gender, phone, id_office, id]
    );

    return res.status(200).json({ message: "Cập nhật nhân viên thành công!" });
  } catch (err) {
    console.error("Lỗi cập nhật nhân viên:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
});
// Lấy danh sách nhân viên
app.get("/api/employee", async (req, res) => {
  try {
    const result = await db.query(`SELECT 
  e.id_employee, 
  e.employee_name, 
  e.birthday, 
  e.gender, 
  e.phone, 
  o.office_name
FROM 
  login.employee e
JOIN 
  login.office o 
ON 
  e.id_office = o.id_office;`);
    return res.json(result.rows);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách nhân viên:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
});

// Ping dinh ky de tranh crash
setInterval(async () => {
  try {
    await db.query("SELECT 1");
    console.log("✅ Keep-alive ping to PostgreSQL succeeded");
  } catch (error) {
    console.error("❌ Keep-alive ping to PostgreSQL failed:", error);
  }
}, 5 * 60 * 1000);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Backend đang chạy tại http://localhost:${PORT}`);
});
