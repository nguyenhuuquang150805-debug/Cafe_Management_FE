import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { path: "/admin", label: "📊 Thống kê" },
        { path: "/admin/products", label: "🍽 Sản phẩm" },
        { path: "/admin/categories", label: "📂 Danh mục" },
        { path: "/admin/promotions", label: "🎁 Khuyến mãi" },
        { path: "/admin/tables", label: "🪑 Quản lý bàn " },
        { path: "/admin/orders", label: "🧾 Đơn hàng" },
        { path: "/admin/users", label: "👥 Nhân viên" },
    ];

    const handleNavigateToStaff = () => {
        navigate("/staff/pos");
    };

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

            {/* Nút chuyển hướng về trang staff */}
            <div className="sidebar-footer">
                <button
                    className="staff-nav-btn"
                    onClick={handleNavigateToStaff}
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#c49b63',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease',
                        marginTop: '20px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#d4a574';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#c49b63';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <span>👨‍🍳</span>
                    Chuyển sang trang Staff
                    <span>→</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;