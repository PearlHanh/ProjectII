import Login from "./Login.jsx";
import Order from "./Order.jsx";
import PrivateRoute  from "./PrivateRoute.jsx";
import HomePage  from "./HomePage.jsx";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Cart from "./Cart.jsx";

export default function App() {
  return (
    <Routes>
    <Route path="/" element={<Login />} />    
    <Route
          path="/homepage"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<Login />}/>         
        <Route path="/order/:tableID" element={<Order />} />
        <Route path='/order/:tableID/cart' element={<Cart />}  />
  </Routes>
  );
}
