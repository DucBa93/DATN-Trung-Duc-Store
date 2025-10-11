import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const CheckAuth = ({ isAuthenticated, user, children }) => {

    const location = useLocation()
    console.log(location.pathname, isAuthenticated);
    
    //useLocation là một hook của React Router v6+ cho phép bạn lấy thông tin về đường dẫn hiện tại (URL) và state được truyền khi navigate.
    // location là một object có dạng:

    // {
    //   pathname: "/profile",   // đường dẫn hiện tại
    //   search: "?tab=info",    // query string
    //   hash: "#section1",      // hash (nếu có)
    //   state: { userId: 123 }, // state được truyền từ navigate()
    //   key: "abc123"           // unique key cho navigation
    // }
    if (
        !isAuthenticated && // nếu chưa đăng nhập
        !(location.pathname.includes('/login') || location.pathname.includes('/register'))) // và đường dẫn hiện tại KHÔNG phải login/register
    {
        return <Navigate to="/auth/login" /> // thì ép điều hướng về /auth/login
    }

    if (isAuthenticated && (location.pathname.includes('/login') || location.pathname.includes('/register'))) {
        if (user?.role === "admin")
            // user?.role dùng Optional Chaining(?.):

            // Nếu user khác null / undefined → lấy user.role.

            // Nếu user = null hoặc undefined → toàn bộ biểu thức trả về undefined
        {
            return <Navigate to="/admin/dashboard" />
        } else {
            return <Navigate to="/shop/home" />
        }
    }

    if(isAuthenticated && user?.role !== "admin" && (location.pathname.includes('admin'))){
        return <Navigate to="/unauth-page"/>
    }

    if(isAuthenticated && user?.role === "admin" && (location.pathname.includes('shop'))){
        return <Navigate to="/admin/dashboard"/>
    }

    return <>{children}</>;
}

export default CheckAuth