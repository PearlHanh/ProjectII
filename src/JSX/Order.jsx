  import { useNavigate, useParams } from "react-router-dom";
  import "../CSS/Order.css";
  import React, { useState, useEffect } from "react";

  export default function Order() {
    const [orders, setOrders] = useState([]);
    const [quantities, setQuantities] = useState({});
    const navigate = useNavigate();
    const {tableID} = useParams();
    
    //Tang so luong mon
    const increase = (id) => {
      setQuantities((prev) => ({
        ...prev,
        [id]: (prev[id] || 0) + 1,
      }));
    };

    //Giam so luong mon
    const decrease = (id) => {
      setQuantities((prev) => ({
        ...prev,
        [id]: Math.max((prev[id] || 0) - 1, 0),
      }));
    };


    //Lay 
    useEffect(() => {
      const fetchOrders = async () => {
        try {
          const res = await fetch("http://localhost:4000/api/orderlist", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const data = await res.json();
          setOrders(data);

          // Khoi tao quantities de luu gia tri khi tang giam
          const initialQuantities = {};
          data.forEach((order) => {
            initialQuantities[order.id_dish] = 0;
          });
          setQuantities(initialQuantities);
        } catch (err) {
          console.error("Error", err);
        }
      };

      fetchOrders();
    }, []);

    //Gui dat mon
    const handleOrderSingle = async (id_dish) => {
      const quantity = quantities[id_dish] || 0;
      const id_table = `TB${tableID}`; // Gắn cố định hoặc lấy từ props/state
    
      if (quantity === 0) {
        alert("Vui lòng chọn số lượng lớn hơn 0.");
        return;
      }
    
      const orderData = {
        id_table,
        id_dish,
        quantity,
      };
    
      try {
        const res = await fetch("http://localhost:4000/api/ordertable", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        });
    
        const result = await res.json();
        if (res.ok) {
          alert(`Đã đặt món ${id_dish} thành công!`);
          // Reset số lượng món đã đặt
          setQuantities((prev) => ({
            ...prev,
            [id_dish]: 0,
          }));
        } else {
          alert(`Lỗi: ${result.error}`);
        }
      } catch (err) {
        console.error("Lỗi khi gửi order:", err);
        alert("Không thể gửi order.");
      }
    };

  const type_of_dish = ["Các loại thịt", "Các loại rau ăn kèm", "Đồ uống"];

    return (
      <div className="container">
        <header className="header">🍔 Table {tableID}</header>

        <main className="food-list">
    {type_of_dish.map((type) => (
      <section key={type}>

        <div className="category-header">
          <hr className="line" />
          <h2 className="category-title">{type}</h2>
          <hr className="line2" />
          </div>
        <div className="category-items">
          {orders
            .filter((order) => order.type_of_dish === type)
            .map((order) => (
              <div key={order.id_dish} className="food-item">
                <img
                  src={order.dish_image}
                  alt={order.dish_name}
                  className="food-image"
                />
                <h2 className="food-title">{order.dish_name}</h2>
                <p className="food-price">
                  Giá: {order.dish_cost.toLocaleString("de-DE")}đ
                </p>
                <p className="quantity">
                  Số lượng: {quantities[order.id_dish] || 0}
                </p>
                <button
                  className="incre-button"
                  onClick={() => increase(order.id_dish)}
                >
                  +
                </button>
                <button
                  className="decre-button"
                  onClick={() => decrease(order.id_dish)}
                >
                  -
                </button>
                <button
                  className="order-button"
                  onClick={() => handleOrderSingle(order.id_dish)}
                >
                  Đặt Hàng
                </button>
              </div>
            ))}
        </div>
      </section>
    ))}
    <hr></hr>
  </main>

        <nav className="navbar">
          <button className="nav-button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}    >🏠 Trang chủ</button>
          <button className="nav-button" onClick={() => navigate(`/order/${tableID}/cart`)}>🛒 Giỏ Hàng</button>
        </nav>
      </div>
    );
  } 