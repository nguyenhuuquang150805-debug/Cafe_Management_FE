import React from 'react';

const PaymentModal = ({
    order,
    paymentMethod,
    setPaymentMethod,
    customerPaid,
    setCustomerPaid,
    onConfirmPayment,
    onConfirmPayOSPayment,
    onClose
}) => {
    const getChangeAmount = () => {
        if (!customerPaid || paymentMethod !== 'CASH') return null;
        return Number(customerPaid) - order.totalAmount;
    };

    const changeAmount = getChangeAmount();
    const isInsufficient = changeAmount !== null && changeAmount < 0;

    const handlePaymentClick = () => {
        // Chỉ xử lý thanh toán thường (CASH/CARD/MOBILE)
        onConfirmPayment();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h4>
                        💳 Thanh toán {order.table
                            ? `Bàn ${order.table.number}`
                            : 'Khách mang đi'}
                    </h4>
                    <button className="close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="payment-info">
                    <div className="info-row">
                        <span>Mã đơn:</span>
                        <strong>#{order.id}</strong>
                    </div>
                    <div className="info-row">
                        <span>Nhân viên:</span>
                        <strong>{order.employee.fullName}</strong>
                    </div>
                    <div className="info-row">
                        <span>Tổng tiền:</span>
                        <strong className="total-amount">
                            {order.totalAmount.toLocaleString()}₫
                        </strong>
                    </div>
                </div>

                <div className="form-group">
                    <label>💳 Phương thức thanh toán (Tiền mặt/Thẻ/CK)</label>
                    <div className="payment-methods" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {['CASH', 'CARD', 'MOBILE'].map((method) => (
                            <button
                                key={method}
                                className={`payment-btn ${paymentMethod === method ? 'active' : ''}`}
                                onClick={() => setPaymentMethod(method)}
                            >
                                {method === 'CASH'
                                    ? '💵 Tiền mặt'
                                    : method === 'CARD'
                                        ? '💳 Thẻ'
                                        : '📱 Chuyển khoản'}
                            </button>
                        ))}
                    </div>
                </div>

                {paymentMethod === 'CASH' && (
                    <div className="form-group">
                        <label>💵 Khách đưa</label>
                        <input
                            type="text"
                            className="cash-input"
                            value={
                                customerPaid
                                    ? Number(customerPaid.replace(/\D/g, '')).toLocaleString()
                                    : ''
                            }
                            onChange={(e) => setCustomerPaid(e.target.value.replace(/\D/g, ''))}
                            placeholder="Nhập số tiền..."
                        />
                        <div className="quick-amount">
                            {[order.totalAmount, 100000, 200000, 500000].map((amount, i) => (
                                <button
                                    key={i}
                                    className="quick-btn"
                                    onClick={() => setCustomerPaid(amount.toString())}
                                >
                                    {i === 0 ? 'Vừa đủ' : `${amount / 1000}K`}
                                </button>
                            ))}
                        </div>
                        {customerPaid && Number(customerPaid) !== order.totalAmount && (
                            <div
                                className={`change-amount ${isInsufficient ? 'insufficient' : 'sufficient'
                                    }`}
                            >
                                <span>
                                    {isInsufficient ? 'Thiếu:' : 'Tiền thừa:'}
                                </span>
                                <span className="amount">
                                    {Math.abs(changeAmount).toLocaleString()}₫
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {(paymentMethod === 'CARD' || paymentMethod === 'MOBILE') && (
                    <div className="other-payment-notice">
                        <div className="notice-box">
                            <span className="notice-icon">💳</span>
                            <div className="notice-content">
                                <p>Vui lòng xác nhận khách hàng đã thanh toán thành công</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="action-buttons">
                    <button
                        className="btn-confirm-payment"
                        onClick={handlePaymentClick}
                        disabled={paymentMethod === 'CASH' && isInsufficient}
                    >
                        ✅ Xác nhận thanh toán
                    </button>

                    {/* 🔥 NÚT PAYOS RIÊNG BIỆT */}
                    <button
                        className="btn-payos-payment"
                        onClick={onConfirmPayOSPayment}
                        style={{
                            backgroundColor: '#0088cc',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            marginTop: '10px',
                            width: '100%'
                        }}
                    >
                        🏦 Thanh toán PayOS
                    </button>
                    <button className="btn-cancel" onClick={onClose}>
                        ❌ Hủy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;