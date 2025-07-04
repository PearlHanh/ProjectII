import "../CSS/Login.css";
import { useState, useEffect} from "react";
import Image1 from "../Image/LogoLogin.png";
import { useNavigate } from "react-router-dom";
import bg from "/BackgroundLogin.png"
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hasBackground, setHasBackground] = useState(true);
  const navigate = useNavigate();
    const loginOnClick = async () => {
      const res = await fetch("https://projectii-production.up.railway.app/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });
  
      const data = await res.json();
  
      if (data.success) {
        // ✅ Có id_office thì xử lý route tại đây
        switch (data.id_office) {
          case "QL":
            navigate("/manage-dashboard");
            break;
          case "NV":
            navigate("/homepageNV");
            break;
          default:
            navigate("/login");
        }
      } else {
        alert("Sai tài khoản hoặc mật khẩu");
      }
    };
  
    useEffect(() => {
      setHasBackground(true);
      return () => {
        setHasBackground(false);
      };
    }, []);
  
// Chinh background
  
  useEffect(() => {
    // Khi component Login được mount
    setHasBackground(true);

    // Cleanup function khi component unmount (ra khỏi Login)
    return () => {
      setHasBackground(false);
    };
  }, []);

  return (
    <div id="screen" style={{
      backgroundImage: hasBackground? `url(${bg})`: "none" ,
    }}>
    <div id="fullscreen">
      <div className="flex-container">

        <div id="image-container">
          <img id="login-image" src={Image1} alt="Login Image" />
        </div>

        <div id="login-container">
          <h2 id="login-title">Login</h2>
          <input
            id="account-input"
            type="text"
            placeholder="Account"
            className="input-field" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            id="password-input"
            type="password"
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button id="login-button" onClick={loginOnClick}>Log In</button>
        </div>
      </div>
    </div>
    </div>
  );
}
  