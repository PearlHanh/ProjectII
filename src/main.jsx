import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import React from "react";
import App from './JSX/App.jsx'
import "./CSS/Login.css"; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <BrowserRouter basename="/ProjectII">
         <App />
      </BrowserRouter>  
      </React.StrictMode>
);
