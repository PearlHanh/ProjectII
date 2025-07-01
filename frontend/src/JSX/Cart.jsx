import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../CSS/Cart.css";
export default function Cart() {
  const { tableID } = useParams();
  const [cartOrders, setCartOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartOrders = async () => {
      try {
        const res = await fetch(`https://projectii-production.up.railway.app/api/api/ordertable/TB${tableID}`);
        const data = await res.json();
        setCartOrders(data);
      } catch (error) {
        console.error("Lỗi khi lấy cart orders:", error);
      }
    };

    fetchCartOrders();
  }, [tableID]);

  const totalPrice = cartOrders.reduce(
    (acc, order) => acc + order.dish_cost * order.dish_quantity,
    0
  );

  return (
    <div className="container">
      <header className="header">🛒 Giỏ Hàng - Table {tableID}</header>
      <main>
        {cartOrders.length === 0 ? (
          <p>Chưa có món nào trong giỏ hàng.</p>
        ) : (
          cartOrders.map((order) => (
            <div key={order.id_dish} className="cart-item">
              <img src={order.dish_image} alt={order.dish_name} className="cart-image" />
              <div className="cart-info">
                <h3>{order.dish_name}</h3>
                <p>Số lượng: {order.dish_quantity}</p>
                <p>Giá đơn vị: {order.dish_cost.toLocaleString("de-DE")}đ</p>
                <p>Tổng: {(order.dish_cost * order.dish_quantity).toLocaleString("de-DE")}đ</p>
              </div>
            </div>
          ))
        )}
        <hr />
        <h2 className="total-price">Tổng tiền: {totalPrice.toLocaleString("de-DE")}đ</h2>
      </main>

      <nav className="navbar2">
      <button onClick={() => navigate(`/order/${tableID}`)}>⬅️ Quay lại đặt món</button>
      </nav>
    </div>
  );
}