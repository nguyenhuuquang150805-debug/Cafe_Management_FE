import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../../../api/apiService';

const MenuSection = ({
    currentUser,
    cart,
    pendingOrders,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    filteredProducts,
    onAddToCart,
    onShowOrders,
    onShowBillsHistory,
    onLogout
}) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [avatarSrc, setAvatarSrc] = useState("");

    // Hàm tạo avatar từ chữ cái
    const getInitials = useCallback((name) => {
        if (!name) return "?";
        const words = name.trim().split(" ");
        if (words.length >= 2) {
            return (words[0][0] + words[words.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }, []);

    const getAvatarColor = useCallback((name) => {
        const colors = [
            "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A",
            "#98D8C8", "#6C5CE7", "#A29BFE", "#FD79A8",
            "#FDCB6E", "#00B894", "#0984E3", "#E17055"
        ];
        const index = name ? name.charCodeAt(0) % colors.length : 0;
        return colors[index];
    }, []);

    const generateAvatarImage = useCallback((name) => {
        const initials = getInitials(name);
        const bgColor = getAvatarColor(name);

        const svg = `
            <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="50" fill="${bgColor}"/>
                <text x="50" y="50" font-size="40" font-weight="bold" 
                      text-anchor="middle" dominant-baseline="central" 
                      fill="white" font-family="Arial, sans-serif">
                    ${initials}
                </text>
            </svg>
        `;

        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }, [getInitials, getAvatarColor]);

    useEffect(() => {
        if (currentUser) {
            if (currentUser.imageUrl) {
                setAvatarSrc(apiService.GET_IMG(currentUser.imageUrl));
            } else {
                setAvatarSrc(generateAvatarImage(currentUser.fullName));
            }
        }
    }, [currentUser, generateAvatarImage]);

    const handleImageError = useCallback(() => {
        console.log("❌ Lỗi load ảnh, chuyển sang avatar chữ cái");
        if (currentUser) {
            setAvatarSrc(generateAvatarImage(currentUser.fullName));
        }
    }, [currentUser, generateAvatarImage]);

    return (
        <div className="menu-section">
            <div className="menu-header">
                <div className="cafe-header__brand" role="presentation">
                    <img
                        src="/logo_shopcf.png"
                        alt="Light Coffee Logo"
                        className="cafe-logo"
                    />
                    Light Coffee
                </div>
                <div className="header-actions">
                    <span className="cart-badge">{cart.length}</span>
                    <button className="orders-btn" onClick={onShowOrders}>
                        📋 Đơn hàng ({pendingOrders.length})
                    </button>
                    {/* 🔥 NÚT XEM BILLS MỚI */}
                    <button className="bills-btn" onClick={onShowBillsHistory}>
                        🧾 Bills
                    </button>

                    {/* User Dropdown */}
                    <div className="user-dropdown">
                        <div
                            className="user-avatar-btn"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            <img
                                src={avatarSrc}
                                alt={currentUser?.fullName || 'User'}
                                onError={handleImageError}
                                className="user-avatar"
                            />
                        </div>

                        {showUserMenu && (
                            <>
                                <div
                                    className="dropdown-overlay"
                                    onClick={() => setShowUserMenu(false)}
                                />
                                <div className="user-dropdown-menu">
                                    <div className="dropdown-header">
                                        <img
                                            src={avatarSrc}
                                            alt={currentUser?.fullName || 'User'}
                                            onError={handleImageError}
                                            className="dropdown-avatar"
                                        />
                                        <div className="dropdown-user-info">
                                            <div className="dropdown-name">
                                                {currentUser?.fullName || 'Không rõ'}
                                            </div>
                                            <div className="dropdown-role">
                                                Nhân viên
                                            </div>
                                        </div>
                                    </div>
                                    <div className="dropdown-divider" />
                                    <button
                                        className="dropdown-logout-btn"
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            onLogout();
                                        }}
                                    >
                                        <span className="logout-icon">🚪</span>
                                        Đăng xuất
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="search-box">
                <input
                    type="text"
                    placeholder="🔍 Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button className="clear-search" onClick={() => setSearchTerm('')}>
                        ✕
                    </button>
                )}
            </div>

            <div className="category-filter">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        className={`cat-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat.id)}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            <div className="menu-grid">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((item) => (
                        <div
                            key={item.id}
                            className="menu-card"
                            onClick={() => onAddToCart(item)}
                        >
                            <img
                                src={item.imageUrl ? apiService.GET_IMG(item.imageUrl) : '/fallback.jpg'}
                                alt={item.name}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/fallback.jpg';
                                }}
                            />
                            <div className="card-body">
                                <h5>{item.name}</h5>
                                <p className="desc">{item.description}</p>
                                <p className="price">{item.price.toLocaleString()}₫</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-results">
                        <div className="icon">🔍</div>
                        <p>Không tìm thấy sản phẩm</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuSection;