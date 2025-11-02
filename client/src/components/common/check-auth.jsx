import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const CheckAuth = ({ isAuthenticated, user, children }) => {
  const location = useLocation();

  // 1️⃣ Chưa đăng nhập mà không phải trang login/register thì ép về login
  if (
    !isAuthenticated &&
    !(location.pathname.includes("/login") || location.pathname.includes("/register"))
  ) {
    return <Navigate to="/auth/login" />;
  }

  // 2️⃣ Đã đăng nhập mà vẫn vào login/register thì điều hướng theo role
  if (
    isAuthenticated &&
    (location.pathname.includes("/login") || location.pathname.includes("/register"))
  ) {
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" />;
    } else if (user?.role === "shipper") {
      return <Navigate to="/shipper/orders" />;
    } else {
      return <Navigate to="/shop/home" />;
    }
  }

  // 3️⃣ Nếu user là thường mà cố vào admin → chặn
  if (isAuthenticated && user?.role !== "admin" && location.pathname.includes("admin")) {
    return <Navigate to="/unauth-page" />;
  }

  // 4️⃣ Nếu admin mà vào shop → chặn
  if (isAuthenticated && user?.role === "admin" && location.pathname.includes("shop")) {
    return <Navigate to="/admin/dashboard" />;
  }

  // 5️⃣ Nếu shipper mà vào admin hoặc shop → chặn
  if (
    isAuthenticated &&
    user?.role === "shipper" &&
    (location.pathname.includes("admin") || location.pathname.includes("shop"))
  ) {
    return <Navigate to="/shipper/dashboard" />;
  }

  // 6️⃣ Mặc định render children
  return <>{children}</>;
};

export default CheckAuth;
