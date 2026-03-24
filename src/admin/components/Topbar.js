import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../api/apiService";

const Topbar = () => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [avatarSrc, setAvatarSrc] = useState("");

    useEffect(() => {
        const loadUserInfo = async () => {
            try {
                const username = localStorage.getItem("username");
                if (username) {
                    // Gọi API lấy thông tin user theo username
                    const res = await apiService.GET_ALL("users");
                    const currentUser = res.data.find(u => u.username === username);
                    if (currentUser) {
                        setUserInfo(currentUser);
                        // Nếu có imageUrl, set URL ảnh thật
                        if (currentUser.imageUrl) {
                            setAvatarSrc(`http://localhost:8080/uploads/${currentUser.imageUrl}`);
                        } else {
                            // Nếu không có ảnh, tạo avatar chữ cái
                            setAvatarSrc(generateAvatarImage(currentUser.fullName));
                        }
                    }
                }
            } catch (error) {
                console.error("❌ Lỗi tải thông tin user:", error);
            }
        };

        loadUserInfo();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate("/login");
    };

    // Hàm lấy chữ cái đầu của tên
    const getInitials = (name) => {
        if (!name) return "?";
        const words = name.trim().split(" ");
        if (words.length >= 2) {
            return (words[0][0] + words[words.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Hàm tạo màu nền ngẫu nhiên dựa trên tên
    const getAvatarColor = (name) => {
        const colors = [
            "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A",
            "#98D8C8", "#6C5CE7", "#A29BFE", "#FD79A8",
            "#FDCB6E", "#00B894", "#0984E3", "#E17055"
        ];
        const index = name ? name.charCodeAt(0) % colors.length : 0;
        return colors[index];
    };

    // Hàm tạo ảnh avatar từ chữ cái (SVG Data URL)
    const generateAvatarImage = (name) => {
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
    };

    const handleImageError = () => {
        console.log("❌ Lỗi load ảnh, chuyển sang avatar chữ cái");
        if (userInfo) {
            setAvatarSrc(generateAvatarImage(userInfo.fullName));
        }
    };

    const username = localStorage.getItem("username");

    return (
        <div className="topbar">
            <h3>Trang quản lý quán cafe</h3>
            <div className="topbar-right">
                {userInfo && (
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginRight: "15px"
                    }}>
                        {/* Avatar - Luôn dùng img */}
                        <img
                            src={avatarSrc}
                            alt={userInfo.fullName}
                            onError={handleImageError}
                            style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "2px solid #fff",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                            }}
                        />

                        {/* Thông tin user */}
                        <div className="user-info">
                            <div className="user-name">
                                {userInfo.fullName}
                            </div>
                        </div>
                    </div>
                )}

                {!userInfo && username && <span>Xin chào, {username}</span>}

                <button onClick={handleLogout} className="logout-btn">
                    Đăng xuất
                </button>
            </div>
        </div>
    );
};

export default Topbar;