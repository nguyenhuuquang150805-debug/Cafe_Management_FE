import React from 'react';
import { calculateCartTotal, calculateDiscount } from '../utils/orderUtils';
import apiService from '../../../api/apiService';

const CartSection = ({
    cart,
    isTakeaway,
    setIsTakeaway,
    selectedTable,
    promotions,
    selectedPromotion,
    setSelectedPromotion,
    orderNotes,
    setOrderNotes,
    onUpdateQty,
    onShowTableModal,
    onCreateOrder,
    onExportInvoice,
    onClearCart
}) => {
    const subtotal = calculateCartTotal(cart);
    const discountAmount = calculateDiscount(subtotal, selectedPromotion);
    const total = subtotal - discountAmount;

    return (
        <div className="cart-section">
            <div className="cart-header">
                <h3>🧾 Đơn hàng</h3>
                {cart.length > 0 && <span className="cart-count">{cart.length} món</span>}
            </div>

            <div className="form-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={isTakeaway}
                        onChange={(e) => setIsTakeaway(e.target.checked)}
                    />
                    <span>🚶 Khách mang đi</span>
                </label>
            </div>

            {!isTakeaway && (
                <div className="form-group">
                    <label>🪑 Chọn bàn</label>
                    <button className="select-table-btn" onClick={onShowTableModal}>
                        {selectedTable
                            ? `Bàn ${selectedTable.number} (${selectedTable.capacity} chỗ)`
                            : '-- Chọn bàn --'}
                    </button>
                </div>
            )}

            {!cart.length ? (
                <div className="empty-cart">
                    <div className="empty-icon">🛒</div>
                    <p>Chưa có món nào</p>
                    <small>Chọn món từ menu bên trái</small>
                </div>
            ) : (
                <>
                    <div className="cart-items">
                        {cart.map((item) => (
                            <div key={item.id} className="cart-item">
                                <div className="item-image">
                                    <img
                                        src={item.imageUrl ? apiService.GET_IMG(item.imageUrl) : '/fallback.jpg'}
                                        alt={item.name}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/fallback.jpg';
                                        }}
                                    />
                                </div>
                                <div className="item-info">
                                    <h6>{item.name}</h6>
                                    <small className="item-price">
                                        {item.price.toLocaleString()}₫
                                    </small>
                                </div>
                                <div className="item-controls">
                                    <button
                                        className="qty-btn"
                                        onClick={() => onUpdateQty(item.id, item.qty - 1)}
                                    >
                                        −
                                    </button>
                                    <span className="qty">{item.qty}</span>
                                    <button
                                        className="qty-btn"
                                        onClick={() => onUpdateQty(item.id, item.qty + 1)}
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="item-total">
                                    {(item.price * item.qty).toLocaleString()}₫
                                </div>
                                <button
                                    className="remove-btn"
                                    onClick={() => onUpdateQty(item.id, 0)}
                                    title="Xóa"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="form-group">
                        <label>🎁 Khuyến mãi</label>
                        <select
                            value={selectedPromotion?.id || ''}
                            onChange={(e) =>
                                setSelectedPromotion(
                                    promotions.find((p) => p.id === +e.target.value) || null
                                )
                            }
                            className="promotion-select"
                        >
                            <option value="">-- Không áp dụng --</option>
                            {promotions.map((p) => {
                                const endDate = new Date(p.endDate);
                                const today = new Date();
                                const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

                                return (
                                    <option key={p.id} value={p.id}>
                                        {p.name} -
                                        {p.discountPercentage > 0
                                            ? ` Giảm ${p.discountPercentage}%`
                                            : ` Giảm ${p.discountAmount.toLocaleString()}₫`}
                                        {daysLeft <= 3 && daysLeft > 0 ? ` (Còn ${daysLeft} ngày)` : ''}
                                    </option>
                                );
                            })}
                        </select>
                        {selectedPromotion && (
                            <div className="promotion-info">
                                <span className="promo-badge">🎁 {selectedPromotion.name}</span>
                                <span className="promo-dates">
                                    Từ {new Date(selectedPromotion.startDate).toLocaleDateString('vi-VN')}
                                    {' đến '}
                                    {new Date(selectedPromotion.endDate).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>📝 Ghi chú</label>
                        <textarea
                            value={orderNotes}
                            onChange={(e) => setOrderNotes(e.target.value)}
                            placeholder="Thêm ghi chú cho đơn hàng..."
                            rows="2"
                        />
                    </div>

                    <div className="total-summary">
                        <div className="summary-row">
                            <span>Tạm tính:</span>
                            <span>{subtotal.toLocaleString()}₫</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="summary-row discount">
                                <span>Giảm giá:</span>
                                <span>-{discountAmount.toLocaleString()}₫</span>
                            </div>
                        )}
                        <div className="summary-divider"></div>
                        <div className="summary-row total">
                            <span>Tổng cộng:</span>
                            <span>{total.toLocaleString()}₫</span>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button className="btn-create-order" onClick={onCreateOrder}>
                            📝 Tạo đơn
                        </button>
                        <button className="btn-export" onClick={onExportInvoice}>
                            📄 Xuất HĐ
                        </button>
                        <button className="btn-clear" onClick={onClearCart}>
                            🗑️ Xóa
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartSection;