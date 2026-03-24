import React from 'react';

const OrderCard = ({ order, statusInfo, onUpdateStatus, onPayOrder, onAddItems }) => {
    return (
        <div className={`order-card status-${statusInfo.class}`}>
            <div className="order-header-info">
                <div className="order-title">
                    <h5>
                        {order.table
                            ? `🪑 Bàn ${order.table.number}`
                            : '🚶 Khách mang đi'}
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

            {['PENDING', 'CONFIRMED', 'PREPARING', 'SERVED'].includes(order.status) && (
                <div className="order-actions">
                    <button
                        className="btn-add-items"
                        onClick={() => onAddItems(order)}
                    >
                        ➕ Thêm món
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrderCard;