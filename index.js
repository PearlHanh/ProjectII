  import express from "express";
  import mysql from "mysql";
  import cors from "cors";
  import dotenv from "dotenv";

  dotenv.config();

  const app = express();
  app.use(cors());
  app.use(express.json());

  // Kết nối MySQL cho Login
  const db1 = mysql.createConnection({
      host: process.env.DB_LOGIN_HOST,
      user: process.env.DB_LOGIN_USER,
      password: process.env.DB_LOGIN_PASS,
      database: process.env.DB_LOGIN_NAME,
  });

  db1.connect((err) => {
    if (err) {
      console.error("Lỗi kết nối MySQL:", err);
      return;
    }
    console.log("Đã kết nối MySQL!");
  });

  // Export ket noi de co the su dung o cac file khac
  export default db1;

  //Login
  app.post("/login", (req, res) => {
      const { username, password } = req.body;
      const sql = "SELECT * FROM username WHERE username = ? AND password = ?";
      db1.query(sql, [username, password], (err, result) => {
        if (err) return res.status(500).json({ error: "Lỗi server" });
        if (result.length > 0) {
          res.json({ success: true, message: "1" });
        } else {
          res.json({ success: false, message: "0" });
        }
      });
    });
  // Chay server
  app.listen(5000, () => {
    console.log("Backend đang chạy tại http://localhost:5000");
  });
