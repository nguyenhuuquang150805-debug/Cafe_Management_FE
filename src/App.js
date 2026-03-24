import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "../src/assets/scss/style.scss";
import Header from "./layouts/Header";
import Footer from "./layouts/Footer";
import Main from "./layouts/Main";
import Dashboard from "./admin/Dashboard";

import Menu from "./layouts/Menu";
import Login from "./pages/Login";
import StaffPOS from "./pages/staff/StaffPOS";
import PayOSReturn from "./pages/staff/PayOSReturn";
import Register from "./pages/Register";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.role !== "ADMIN") {
      return <Navigate to="/login" />;
    }
  } catch (error) {
    localStorage.removeItem("token");
    return <Navigate to="/login" />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      {/* Trang chủ mở được không cần đăng nhập */}
      <Route
        path="/"
        element={
          <>
            <Header />
            <Main />
            <Footer />
          </>
        }
      />

      <Route
        path="/home/*"
        element={
          <>
            <Header />
            <Main />
            <Footer />
          </>
        }
      />

      <Route path="/menu" element={<Menu />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/admin/*"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route path="/staff" element={<StaffPOS />} />
      <Route path="/staff/payos-return" element={<PayOSReturn />} />

      {/* Fallback về trang chủ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;