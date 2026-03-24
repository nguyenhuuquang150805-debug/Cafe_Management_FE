import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { path: "/admin", label: "📊 Thống kê" },
        { path: "/admin/products", label: "🍽 Sản phẩm" },
        { path: "/admin/categories", label: "📂 Danh mục" },
        { path: "/admin/promotions", label: "🎁 Khuyến mãi" },
        { path: "/admin/tables", label: "🪑 Quản lý bàn " },
        { path: "/admin/orders", label: "🧾 Đơn hàng" },
        { path: "/admin/users", label: "👥 Nhân viên" },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="cafe-header__brand" role="presentation">
                    <img
                        src={`/logo_shopcf.png`}
                        alt="Light Coffee Logo"
                        className="cafe-logo"
                    />
                </div>
            </div>
            <ul className="sidebar-menu">
                {menuItems.map((item) => (
                    <li
                        key={item.path}
                        className={location.pathname === item.path ? "active" : ""}
                    >
                        <Link to={item.path}>{item.label}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
