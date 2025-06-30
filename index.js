import express from "express";
import { Pool } from "pg";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối PostgreSQL cho Login
const db1 = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Bắt buộc với Neon
  },
});

// Kiểm tra kết nối
(async () => {
  try {
    await db1.connect();
    console.log("Đã kết nối PostgreSQL (login)!");
  } catch (err) {
    console.error("Lỗi kết nối PostgreSQL:", err);
  }
})();

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const query = "SELECT * FROM login.username WHERE username = $1 AND password = $2";
    const { rows } = await db1.query(query, [username, password]);

    if (rows.length > 0) {
      res.json({ success: true, message: "1" });
    } else {
      res.json({ success: false, message: "0" });
    }
  } catch (err) {
    console.error("Lỗi truy vấn:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});
console.log("📦 DATABASE_URL:", process.env.DATABASE_URL);
// Chạy server
app.listen(5000, () => {
  console.log("Backend đang chạy tại http://localhost:5000");
});

export default db1;