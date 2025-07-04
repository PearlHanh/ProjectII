import { useState, useEffect } from "react";
import dayjs from "dayjs";
import "../CSS/HomePage.css"; // Đường dẫn CSS tuỳ theo cấu trúc dự án

const [activedId, setActiveId] = useState(null);
const [tables, setTables] = useState([]); // danh sách bàn
const [selectedTable, setSelectedTable] = useState(null);
const [orderedDishes, setOrderedDishes] = useState([]);


// Khi click vào một bàn
const handleTableClick = (id) => {
  setSelectedTable(id);
  console.log(`Clicked table ${id}`);
  fetch(`https://projectii-production.up.railway.app/api/order/${id}`)
    .then((res) => res.json())
    .then((data) => {
      console.log("Dữ liệu JSON trả về từ server:", data);
      setOrderedDishes(data);
    })
    .catch((err) => console.error("Lỗi khi lấy dữ liệu món ăn:", err));
};

// Lấy danh sách bàn khi load trang
useEffect(() => {
  fetch("https://projectii-production.up.railway.app/api/tablename")
    .then((res) => res.json())
    .then((data) => setTables(data))
    .catch((err) => console.error("Lỗi khi lấy danh sách bàn:", err));
}, []);

// Hàm thanh toán
const handlePay = async () => {
  const total = orderedDishes.reduce((sum, d) => sum + d.total_cost, 0);
  try {
    const res = await fetch("https://projectii-production.up.railway.app/api/create-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderCode: Date.now(),
        amount: total,
        description: `Thanh toán bàn ${selectedTable}`,
      }),
    });

    const data = await res.json();
    console.log("Link thanh toán:", data);

    if (data.checkoutUrl) {
      window.localStorage.setItem("pendingClearTable", selectedTable);
      window.location.href = data.checkoutUrl;
    } else {
      throw new Error(data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Thanh toán thất bại");
  }
};

// Xóa order sau khi thanh toán (nếu quay lại từ PayOS)
useEffect(() => {
  const tableToClear = localStorage.getItem("pendingClearTable");
  if (tableToClear) {
    fetch(`https://projectii-production.up.railway.app/api/ordertable/delete/${tableToClear}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Đã xoá món sau thanh toán:", data);
        setOrderedDishes([]);
        setSelectedTable(null);
        localStorage.removeItem("pendingClearTable");
      })
      .catch((err) => {
        console.error("Lỗi khi xóa món sau thanh toán:", err);
      });
  }
}, []);

// JSX hiển thị nếu activedId === 1
{activedId === 1 && (
  <div className="ordertable">
    <div className="table">
      <div className="content">
        <div className="table-list-container">
          <div className="table-list">
            {tables.map((table) => (
              <div
                key={table.id_table}
                className={`table-item ${selectedTable === table.id_table ? "selected" : ""}`}
                onClick={() => handleTableClick(table.id_table)}
              >
                <img src={'/table.png'} alt={table.table_name} className="table-image" />
                <h2>{table.table_name}</h2>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    <div className="detail">
      <div className="listOfDishes">
        {orderedDishes.length === 0 ? (
          <p>Chưa có món nào được đặt.</p>
        ) : (
          orderedDishes.map((dish) => (
            <div key={dish.id_dish} className="dish-item">
              <img src={dish.dish_image} alt={dish.dish_name} className="dish-image" />
              <div className="dish-info">
                <h4>{dish.dish_name}</h4>
                <p>Số lượng: {dish.dish_quantity}</p>
                <p>Đơn giá: {dish.dish_cost.toLocaleString("vi-VN")}đ</p>
                <p>Thành tiền: {dish.total_cost.toLocaleString("vi-VN")}đ</p>
              </div>
            </div>
          ))
        )}
        <button className="pay" onClick={handlePay}>Thanh toán</button>
      </div>
    </div>
  </div>
)}
