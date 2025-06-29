import express from "express";
import mysql from "mysql";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


// Kết nối MySQL cho Order
const db2 = mysql.createConnection({
    host: process.env.DB_ORDER_HOST,
    user: process.env.DB_ORDER_USER,
    password: process.env.DB_ORDER_PASS,
    database: process.env.DB_ORDER_NAME,
  });
  
  db2.connect((err) =>{
    if (err) {
      console.error("Lỗi kết nối MySQL:", err);
      return;
    }
    console.log("Đã kết nối MySQL!");
  });
  
  // Export ket noi de co the su dung o cac file khac
export default db2;

//Lay list cac mon an
  app.get('/api/orderlist', (req, res) => {
    const sql = "SELECT * FROM dish";
    db2.query(sql, (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json(result); // Trả về dưới dạng array of object (dict)
    });
  });

  // Insert cac mon an cho tung ban sau khi order
  app.post("/api/ordertable", (req, res) => {
    let { id_table, id_dish, quantity } = req.body;
    quantity = typeof quantity === 'number' ? quantity : 0;

    if (!id_table || !id_dish || typeof quantity !== 'number') {
      return res.status(400).json({ error: "Thiếu dữ liệu cần thiết" });
    }
  
    const sql = `
      INSERT INTO ordertable (id_table, id_dish, dish_quantity)
      VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE dish_quantity = dish_quantity + VALUES(dish_quantity)
    `;
    
    db2.query(sql, [id_table, id_dish, quantity], (err, result) => {
      if (err) {
        console.error("Lỗi khi insert vào tableorder:", err);
        return res.status(500).json({ error: "Lỗi khi insert" });
      }
    });
      const updateTotalSql = `
      INSERT INTO total (id_dish, quantity, time)
      VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
    `;

    db2.query(updateTotalSql, [id_dish, quantity], (err2, result2) => {
      if (err2) {
        console.error("Lỗi khi cập nhật bảng total:", err2);
        return res.status(500).json({ error: "Lỗi khi cập nhật bảng thống kê" });
      }
      res.status(200).json({ message: "Đã lưu order thành công" });
    });
  });


  app.listen(4000, () => {
    console.log("Backend đang chạy tại http://localhost:4000");
  });


  app.get('/api/ordertable/:id_table', (req, res) => {  
    const id_table = req.params.id_table;
    const sql = `
      SELECT o.id_table, o.id_dish, o.dish_quantity,
             d.dish_name, d.dish_cost, d.dish_image
      FROM ordertable o
      JOIN dish d ON o.id_dish = d.id_dish
      WHERE o.id_table = ?
    `;
    
    db2.query(sql, [id_table], (err, results) => {
      if (err) {
        console.error("Lỗi khi lấy order:", err);
        return res.status(500).json({ error: "Lỗi server" });
      }
      res.json(results);
    });
  });
  app.get('/api/tablename', (req, res) => {
    const sql = `SELECT * FROM tablename
ORDER BY CAST(SUBSTRING(id_table, 3) AS UNSIGNED);`; // Giả sử bảng có tên là tables
    db2.query(sql, (err, result) => {
      if (err) {
        console.error("Lỗi khi lấy danh sách bàn:", err);
        return res.status(500).json({ error: "Lỗi server" });
      }
      res.json(result);
    });
  });

  app.get('/api/order/:id_table', (req, res) => {
    const id_table = req.params.id_table;
    const query = `
      SELECT 
        o.id_dish, 
        d.dish_name, 
        d.dish_cost, 
        o.dish_quantity,
        d.dish_image,
        (d.dish_cost * o.dish_quantity) AS total_cost
      FROM ordertable o
      JOIN dish d ON o.id_dish = d.id_dish
      WHERE o.id_table = ?
    `;
  
    db2.query(query, [id_table], (err, results) => {
      if (err) {
        console.error('Lỗi truy vấn:', err);
        return res.status(500).json({ error: 'Lỗi máy chủ' });
      }
      res.json(results);
    });
  });

  // lay thong tin so luong mon an ban duoc
  app.get('/api/statistics/dish', (req, res) => {
    const period = req.query.period || 'thismonth';
  
    let dateCondition = '';
    switch (period) {
      case 'premonth': // tháng trước
        dateCondition = `MONTH(t.time) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
                         AND YEAR(t.time) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)`;
        break;
      case 'thisweek':
        dateCondition = `YEARWEEK(t.time, 1) = YEARWEEK(CURDATE(), 1)`;
        break;
      case 'thisday':
        dateCondition = `DATE(t.time) = CURDATE()`;
        break;
      default: // thismonth
        dateCondition = `MONTH(t.time) = MONTH(CURDATE())
                         AND YEAR(t.time) = YEAR(CURDATE())`;
    }
  
    const sql = `
      SELECT 
        t.id_dish, 
        d.dish_name, 
        d.dish_image, 
        SUM(t.quantity) AS total_quantity,
        (d.dish_cost * SUM(t.quantity)) AS total_cost
      FROM total t
      JOIN dish d ON t.id_dish = d.id_dish
      WHERE ${dateCondition}
      GROUP BY t.id_dish, d.dish_name, d.dish_image
      ORDER BY total_quantity DESC
    `;
  
    db2.query(sql, (err, results) => {
      if (err) {
        console.error("Lỗi khi lấy thống kê món ăn:", err);
        return res.status(500).json({ error: "Lỗi server" });
      }
      res.json(results); // Trả về array các dict như: { id_dish, dish_name, total_quantity, dish_image }
    });
  });
  

  