import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../assets/scss/admin.scss";
import { apiService } from "../../../api/apiService";
import AddUser from "./AddUser";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const navigate = useNavigate();

    const loadUsers = async () => {
        try {
            setLoading(true);
            const res = await apiService.GET_ALL("users");
            setUsers(res.data);
        } catch (error) {
            console.error("❌ Lỗi tải danh sách nhân viên:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa nhân viên này không?")) {
            try {
                await apiService.DELETE_ID("users", id);
                setUsers((prev) => prev.filter((u) => u.id !== id));
            } catch (error) {
                console.error("❌ Lỗi xóa nhân viên:", error);
            }
        }
    };

    const handleEdit = (id) => {
        navigate(`/admin/edit-user/${id}`);
    };

    const getInitials = (name) => {
        if (!name) return "?";
        const words = name.trim().split(" ");
        if (words.length >= 2) {
            return (words[0][0] + words[words.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const getAvatarColor = (name) => {
        const colors = [
            "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A",
            "#98D8C8", "#6C5CE7", "#A29BFE", "#FD79A8",
            "#FDCB6E", "#00B894", "#0984E3", "#E17055"
        ];
        const index = name ? name.charCodeAt(0) % colors.length : 0;
        return colors[index];
    };

    if (loading) return <p>Đang tải dữ liệu...</p>;

    return (
        <div className="admin-products">
            <div className="products-header">
                <h2>👥 Quản lý nhân viên</h2>
                <button
                    className="btn btn-success btn-sm"
                    onClick={() => setShowAddModal(true)}
                >
                    + Thêm nhân viên
                </button>
            </div>

            <div className="products-grid">
                {users.map((u) => (
                    <div key={u.id} className="product-card shadow-sm">
                        {u.imageUrl ? (
                            <img
                                src={`http://localhost:8080/uploads/${u.imageUrl}`}
                                alt={u.fullName}
                                className="product-img"
                                onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display = "flex";
                                }}
                                style={{
                                    width: "100%",
                                    height: "160px",
                                    objectFit: "cover",
                                    borderRadius: "10px",
                                }}
                            />
                        ) : null}

                        <div
                            className="avatar-placeholder"
                            style={{
                                display: u.imageUrl ? "none" : "flex",
                                width: "100%",
                                height: "160px",
                                borderRadius: "10px",
                                backgroundColor: getAvatarColor(u.fullName),
                                color: "white",
                                fontSize: "48px",
                                fontWeight: "bold",
                                alignItems: "center",
                                justifyContent: "center",
                                textTransform: "uppercase"
                            }}
                        >
                            {getInitials(u.fullName)}
                        </div>

                        <div className="product-info">
                            <h5>{u.fullName}</h5>
                            <p className="text-muted small">@{u.username}</p>
                            <p className="fw-bold text-primary">{u.role || "Chưa có vai trò"}</p>
                            <p className="small text-secondary">{u.email}</p>
                            <p className="small text-secondary">{u.phone}</p>
                            <p className="small">
                                Trạng thái: {u.isActive ? "✅ Hoạt động" : "❌ Khóa"}
                            </p>
                        </div>

                        <div className="product-actions">
                            <button
                                className="btn btn-outline-primary btn-sm me-2"
                                onClick={() => handleEdit(u.id)}
                            >
                                ✏️ Sửa
                            </button>
                            <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDelete(u.id)}
                            >
                                🗑️ Xóa
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showAddModal && (
                <AddUser
                    onClose={() => setShowAddModal(false)}
                    onAdded={loadUsers}
                />
            )}
        </div>
    );
};

export default Users;