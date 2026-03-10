import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2800,
          style: {
            background: "#FFFFFF",
            color: "#1E2433",
            border: "1px solid #D9E2F2",
            boxShadow: "0 12px 28px rgba(82,112,178,0.16)"
          }
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
