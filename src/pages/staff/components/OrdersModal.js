import React from 'react';

const OrdersModal = ({
    pendingOrders,
    onClose,
    onUpdateStatus,
    onPayOrder,
    onAddItems,
    onEditItems,
    onTransferTable,
    getOrderStatusInfo
}) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content orders-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h4>📋 Quản lý đơn hàng</h4>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="orders-list">
                    {pendingOrders.length === 0 ? (
                        <div className="empty-orders">
                            <div className="icon">📭</div>
                            <p>Chưa có đơn hàng nào</p>
                        </div>
                    ) : (
                        pendingOrders.map((order) => {
                            const statusInfo = getOrderStatusInfo(order.status);
                            return (
                                <div key={order.id} className={`order-card status-${statusInfo.class}`}>
                                    <div className="order-header-info">
                                        <div className="order-title">
                                            <h5>
                                                {order.table
                                                    ? `🪑 Bàn ${order.table.number}`
                                                    : '🚶 Khách mang đi'} - #{order.id}
                                            </h5>
                                            <span className={`order-status-badge ${statusInfo.class}`}>
                                                {statusInfo.icon} {statusInfo.label}
                                            </span>
                                        </div>
                                        <span className="order-time">
                                            {new Date(order.createdAt).toLocaleString('vi-VN')}
                                        </span>
                                    </div>

                                    <div className="order-items">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="order-item">
                                                <span>{item.product.name} x{item.quantity}</span>
                                                <span>{(item.price * item.quantity).toLocaleString()}₫</span>
                                            </div>
                                        ))}
                                    </div>

                                    {order.promotion && (
                                        <div className="order-promo">
                                            🎁 {order.promotion.name}
                                        </div>
                                    )}

                                    <div className="order-total">
                                        <strong>Tổng:</strong>
                                        <strong className="amount">
                                            {order.totalAmount.toLocaleString()}₫
                                        </strong>
                                    </div>

                                    {/* Buttons chuyển trạng thái */}
                                    <div className="order-status-actions">
                                        {order.status === 'PENDING' && (
                                            <>
                                                <button
                                                    className="btn-status-action confirm"
                                                    onClick={() => onUpdateStatus(order, 'CONFIRMED')}
                                                >
                                                    ✅ Xác nhận
                                                </button>
                                                <button
                                                    className="btn-status-action cancel"
                                                    onClick={() => onUpdateStatus(order, 'CANCELLED')}
                                                >
                                                    ❌ Hủy
                                                </button>
                                            </>
                                        )}

                                        {order.status === 'CONFIRMED' && (
                                            <button
                                                className="btn-status-action prepare"
                                                onClick={() => onUpdateStatus(order, 'PREPARING')}
                                            >
                                                👨‍🍳 Bắt đầu chuẩn bị
                                            </button>
                                        )}

                                        {order.status === 'PREPARING' && (
                                            <button
                                                className="btn-status-action serve"
                                                onClick={() => onUpdateStatus(order, 'SERVED')}
                                            >
                                                🍽️ Đã phục vụ
                                            </button>
                                        )}

                                        {order.status === 'SERVED' && (
                                            <button
                                                className="btn-status-action pay"
                                                onClick={() => onPayOrder(order)}
                                            >
                                                💳 Thanh toán
                                            </button>
                                        )}
                                    </div>

                                    {/* Buttons thao tác với món ăn */}
                                    {['PENDING', 'CONFIRMED', 'PREPARING', 'SERVED'].includes(order.status) && (
                                        <div className="order-actions">
                                            <button
                                                className="btn-edit-items"
                                                onClick={() => onEditItems(order)}
                                                title="Sửa số lượng món"
                                            >
                                                ✏️ Sửa món
                                            </button>
                                            <button
                                                className="btn-add-items"
                                                onClick={() => onAddItems(order)}
                                                title="Thêm món mới"
                                            >
                                                ➕ Thêm món
                                            </button>
                                            {/* 🔥 NÚT CHUYỂN BÀN MỚI */}
                                            {order.table && (
                                                <button
                                                    className="btn-transfer-table"
                                                    onClick={() => onTransferTable(order)}
                                                    title="Chuyển sang bàn khác"
                                                >
                                                    🔄 Chuyển bàn
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrdersModal;