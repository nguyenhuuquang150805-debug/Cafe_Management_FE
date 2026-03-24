import React, { useEffect, useState } from "react";
import apiService from "../../../api/apiService";
import AddPromotion from "./AddPromotion";
import EditPromotion from "./EditPromotion";
import "../../../assets/scss/category.scss";

const Promotion = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState(null);

    const fetchPromotions = async () => {
        try {
            const res = await apiService.GET_ALL("promotions");
            setPromotions(res.data);
        } catch (error) {
            console.error("❌ Lỗi tải khuyến mãi:", error);
            alert("Không thể tải danh sách khuyến mãi!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa khuyến mãi này không?")) {
            try {
                await apiService.DELETE_ID("promotions", id);
                setPromotions((prev) => prev.filter((p) => p.id !== id));
                alert("✅ Xóa khuyến mãi thành công!");
            } catch (error) {
                console.error("❌ Lỗi xóa khuyến mãi:", error);
                alert("Không thể xóa khuyến mãi!");
            }
        }
    };

    const handleEdit = (promotion) => {
        setSelectedPromotion(promotion);
        setShowEditForm(true);
    };

    if (loading) return <div className="loading">⏳ Đang tải khuyến mãi...</div>;

    return (
        <div className="admin-promotions">
            <div className="promotions-header">
                <h2>🎁 Quản lý Khuyến mãi</h2>
                <button
                    className="btn btn-success btn-sm"
                    onClick={() => setShowAddForm(true)}
                >
                    + Thêm khuyến mãi
                </button>
            </div>

            <div className="promotions-table-wrapper">
                <table className="promotions-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên khuyến mãi</th>
                            <th>Giảm giá</th>
                            <th>Thời gian</th>
                            <th>Sản phẩm áp dụng</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {promotions.length > 0 ? (
                            promotions.map((p) => (
                                <tr key={p.id}>
                                    <td className="text-bold">#{p.id}</td>
                                    <td className="promo-name">{p.name}</td>
                                    <td>
                                        <div className="discount-info">
                                            {p.discountPercentage > 0 && (
                                                <span className="discount-badge percent">
                                                    -{p.discountPercentage}%
                                                </span>
                                            )}
                                            {p.discountAmount > 0 && (
                                                <span className="discount-badge amount">
                                                    -{p.discountAmount?.toLocaleString()}đ
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="date-range">
                                            <span>📅 {p.startDate}</span>
                                            <span className="date-separator">→</span>
                                            <span>📅 {p.endDate}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="products-count">
                                            {p.products && p.products.length > 0 ? (
                                                <span className="badge-products">
                                                    {p.products.length} sản phẩm
                                                </span>
                                            ) : (
                                                <span className="text-muted">Chưa có</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        {p.isActive ? (
                                            <span className="status-badge active">
                                                ✓ Đang hoạt động
                                            </span>
                                        ) : (
                                            <span className="status-badge inactive">
                                                ✕ Ngừng hoạt động
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn btn-outline-primary btn-sm me-2"
                                                onClick={() => handleEdit(p)}
                                                title="Chỉnh sửa"
                                            >
                                                Sửa ✏️
                                            </button>
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => handleDelete(p.id)}
                                                title="Xóa"
                                            >
                                                Xóa 🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center empty-state">
                                    <div className="empty-content">
                                        <span className="empty-icon">📭</span>
                                        <p>Chưa có khuyến mãi nào</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showAddForm && (
                <AddPromotion
                    onClose={() => setShowAddForm(false)}
                    onSuccess={fetchPromotions}
                />
            )}

            {showEditForm && selectedPromotion && (
                <EditPromotion
                    promotion={selectedPromotion}
                    onClose={() => setShowEditForm(false)}
                    onSuccess={fetchPromotions}
                />
            )}
        </div>
    );
};

export default Promotion;