import "./App.css";

export default function App() {
  return (
    <div className="container">
      {/* Header */}
      <header className="header">🍔 Food Order</header>

      {/* Danh sách món ăn */}
      <main className="food-list">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="food-item">
            <img
              src={`https://source.unsplash.com/200x150/?food&sig=${item}`}
              alt="Món ăn"
              className="food-image"
            />
            <h2 className="food-title">Món ăn {item}</h2>
            <p className="food-price">Giá: {item * 10}.000đ</p>
            <button className="order-button">Đặt ngay</button>
          </div>
        ))}
      </main>

      {/* Navbar */}
      <nav className="navbar">
        <button className="nav-button">🏠 Trang chủ</button>
        <button className="nav-button">🛒 Đặt hàng</button>
        <button className="nav-button">👤 Tài khoản</button>
      </nav>
    </div>
  );
}
