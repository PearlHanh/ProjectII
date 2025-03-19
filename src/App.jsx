import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md p-4 text-center text-xl font-bold">
        🍔 Food Order
      </header>

      {/* Danh sách món ăn */}
      <main className="flex-1 p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="bg-white p-4 shadow-md rounded-lg text-center">
            <img
              src={`https://source.unsplash.com/200x150/?food&sig=${item}`}
              alt="Món ăn"
              className="w-full h-40 object-cover rounded-md"
            />
            <h2 className="text-lg font-semibold mt-2">Món ăn {item}</h2>
            <p className="text-gray-600">Giá: {item * 10}.000đ</p>
            <button className="mt-2 w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-700">
              Đặt ngay
            </button>
          </div>
        ))}
      </main>

      {/* Navbar */}
      <nav className="fixed bottom-0 left-0 w-full bg-white shadow-md p-4 flex justify-around text-gray-700">
        <button className="text-blue-500">🏠 Trang chủ</button>
        <button className="text-blue-500">🛒 Đặt hàng</button>
        <button className="text-blue-500">👤 Tài khoản</button>
      </nav>
    </div>
  );
}
