import React, { useEffect, useState } from "react";
import { apiService } from "../../../api/apiService";
import "../../../assets/scss/admin.scss";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const getUserFromToken = () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return null;
                const payload = JSON.parse(atob(token.split(".")[1]));
                return {
                    id: payload.userId || payload.id,
                    username: payload.username || payload.sub,
                    fullName: payload.fullName || payload.name || "Unknown",
                    role: payload.role || payload.authorities?.[0] || "EMPLOYEE",
                };
            } catch {
                return null;
            }
        };
        setCurrentUser(getUserFromToken());
    }, []);

    // 🟢 Load danh sách đơn hàng
    const loadOrders = async () => {
        try {
            setLoading(true);
            const res = await apiService.GET_ALL("orders");
            setOrders(res.data);
        } catch (err) {
            console.error("❌ Lỗi tải đơn hàng:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    // 🟡 Xem chi tiết đơn hàng
    const handleView = async (order) => {
        setSelectedOrder(order);
        setOrderItems([]);
        try {
            setLoadingItems(true);
            const res = await apiService.GET_ALL("order-items");
            const filtered = res.data.filter((item) => item.order.id === order.id);
            setOrderItems(filtered);
        } catch (err) {
            console.error("❌ Lỗi tải order items:", err);
        } finally {
            setLoadingItems(false);
        }
    };

    // 🗑️ Xóa đơn hàng
    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa đơn hàng này không?")) {
            try {
                await apiService.DELETE_ID("orders", id);
                setOrders((prev) => prev.filter((o) => o.id !== id));
                alert("✅ Đã xóa đơn hàng!");
            } catch (err) {
                console.error("❌ Lỗi xóa:", err);
                alert("❌ Lỗi xóa đơn. Vui lòng thử lại!");
            }
        }
    };

    if (loading) return <p>Đang tải dữ liệu...</p>;

    const statusLabels = {
        PENDING: "Đang chờ",
        CONFIRMED: "Đã xác nhận",
        PREPARING: "Đang chuẩn bị",
        SERVED: "Đã phục vụ",
        PAID: "Đã thanh toán",
        CANCELLED: "Đã hủy",
    };


    return (
        <div className="admin-orders">
            <div className="orders-header">
                <h2>📋 Quản lý Đơn hàng</h2>
                {currentUser && (
                    <span className="current-user-badge">
                        👤 {currentUser.fullName} ({currentUser.role})
                    </span>
                )}
            </div>

            <table className="table table-bordered mt-3">
                <thead className="table-light">
                    <tr>
                        <th>Mã</th>
                        <th>Bàn</th>
                        <th>Nhân viên</th>
                        <th>Trạng thái</th>
                        <th>Khuyến mãi</th>
                        <th>Tổng tiền</th>
                        <th>Ghi chú</th>
                        <th>Ngày tạo</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.length === 0 ? (
                        <tr>
                            <td colSpan="9" className="text-center text-muted">
                                Không có đơn hàng nào
                            </td>
                        </tr>
                    ) : (
                        orders.map((o) => (
                            <tr key={o.id}>
                                <td>#{o.id}</td>
                                <td>{o.table ? `Bàn ${o.table.number}` : "🚶 Mang đi"}</td>
                                <td>
                                    {o.employee?.fullName || "-"}
                                </td>
                                <td>
                                    <span
                                        className={`badge bg-${o.status === "PAID"
                                            ? "success"
                                            : o.status === "CANCELLED"
                                                ? "danger"
                                                : o.status === "PREPARING"
                                                    ? "info"
                                                    : o.status === "CONFIRMED"
                                                        ? "primary"
                                                        : "warning"
                                            }`}
                                    >
                                        {statusLabels[o.status] || o.status}
                                    </span>
                                </td>
                                <td>{o.promotion?.name || "-"}</td>
                                <td>
                                    <strong>{o.totalAmount?.toLocaleString() || 0}₫</strong>
                                </td>
                                <td>
                                    <small>{o.notes || "-"}</small>
                                </td>
                                <td>
                                    {o.createdAt
                                        ? new Date(o.createdAt).toLocaleString("vi-VN")
                                        : "-"}
                                </td>
                                <td>
                                    <button
                                        className="btn btn-outline-primary btn-sm me-2"
                                        onClick={() => handleView(o)}
                                    >
                                        👁️
                                    </button>
                                    <button
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => handleDelete(o.id)}
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* 🟢 Modal xem chi tiết đơn */}
            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div
                        className="modal-content order-detail-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3>🧾 Chi tiết đơn #{selectedOrder.id}</h3>
                            <button className="close-btn" onClick={() => setSelectedOrder(null)}>
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="order-info">
                                <div className="info-row">
                                    <span>🪑 Bàn:</span>
                                    <strong>
                                        {selectedOrder.table
                                            ? `Bàn ${selectedOrder.table.number} (${selectedOrder.table.capacity} chỗ)`
                                            : "🚶 Khách mang đi"}
                                    </strong>
                                </div>
                                <div className="info-row">
                                    <span>👤 Nhân viên:</span>
                                    <strong>
                                        {selectedOrder.employee?.fullName || "-"}
                                        <small className="text-muted">
                                            {" "}
                                        </small>
                                    </strong>
                                </div>
                                <div className="info-row">
                                    <span>📊 Trạng thái:</span>
                                    <span
                                        className={`badge bg-${selectedOrder.status === "PAID"
                                            ? "success"
                                            : selectedOrder.status === "CANCELLED"
                                                ? "danger"
                                                : "warning"
                                            }`}
                                    >
                                        {statusLabels[selectedOrder.status] || selectedOrder.status}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span>💰 Tổng tiền:</span>
                                    <strong className="text-success">
                                        {selectedOrder.totalAmount?.toLocaleString() || 0}₫
                                    </strong>
                                </div>
                                {selectedOrder.promotion && (
                                    <div className="info-row">
                                        <span>🎁 Khuyến mãi:</span>
                                        <strong>{selectedOrder.promotion.name}</strong>
                                    </div>
                                )}
                                {selectedOrder.notes && (
                                    <div className="info-row">
                                        <span>📝 Ghi chú:</span>
                                        <span>{selectedOrder.notes}</span>
                                    </div>
                                )}
                            </div>

                            <h5 className="products-title">🛒 Danh sách sản phẩm:</h5>

                            {loadingItems ? (
                                <p className="loading-text">Đang tải sản phẩm...</p>
                            ) : orderItems.length === 0 ? (
                                <p className="empty-text">Không có sản phẩm nào.</p>
                            ) : (
                                <div className="table-wrapper">
                                    <table className="order-items-table">
                                        <thead>
                                            <tr>
                                                <th>Sản phẩm</th>
                                                <th>Số lượng</th>
                                                <th>Giá</th>
                                                <th>Tạm tính</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderItems.map((item) => (
                                                <tr key={item.id}>
                                                    <td>{item.product?.name || "-"}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>{item.price?.toLocaleString() || 0}₫</td>
                                                    <td>
                                                        <strong>
                                                            {item.subtotal?.toLocaleString() || 0}₫
                                                        </strong>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setSelectedOrder(null)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
