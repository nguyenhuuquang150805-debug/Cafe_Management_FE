import React from 'react';
import '../../../assets/scss/billExportModal.scss';

const BillExportModal = ({
    billData,
    onClose,
    onViewOrders
}) => {
    const {
        orderId,
        billId,
        table,
        isTakeaway,
        total,
        isPaid,
        items = [],
        employeeName = 'N/A',
        paymentMethod = 'CASH',
        customerPaid = 0,
        subtotal = total,
        discountAmount = 0,
        promotion = null,
        createdAt = new Date().toISOString()
    } = billData;

    // Format date & time
    const billDate = new Date(createdAt);
    const dateStr = billDate.toLocaleDateString('vi-VN');
    const timeStr = billDate.toLocaleTimeString('vi-VN');

    const paymentMethodText = {
        CASH: 'Tiền mặt',
        CARD: 'Thẻ ngân hàng',
        MOBILE: 'Chuyển khoản',
        PAYOS: 'PayOS (QR Code)'
    };

    const changeAmount = paymentMethod === 'CASH' && customerPaid > 0
        ? customerPaid - total
        : 0;

    // 🖨️ HÀM IN ĐƠN GIẢN - Sử dụng window.print() trực tiếp
    const handlePrint = () => {
        // Thêm class print-mode để kích hoạt CSS in
        document.body.classList.add('print-mode');

        // Đợi một chút để CSS được áp dụng
        setTimeout(() => {
            window.print();

            // Sau khi in xong, remove class
            setTimeout(() => {
                document.body.classList.remove('print-mode');
            }, 500);
        }, 100);
    };

    return (
        <div className="bill-export-modal">
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content bill-modal-optimized" onClick={(e) => e.stopPropagation()}>

                    {/* Header với gradient - Ẩn khi in */}
                    <div className={`modal-header no-print ${isPaid ? 'paid' : 'pending'}`}>
                        <div className="header-content">
                            <div className="header-icon">
                                {isPaid ? '✅' : '📝'}
                            </div>
                            <div className="header-text">
                                <h3>{isPaid ? 'Thanh toán thành công!' : 'Hóa đơn tạm tính'}</h3>
                                <p className="header-subtitle">
                                    {isPaid ? 'Hóa đơn đã được lưu vào hệ thống' : 'Vui lòng hoàn tất thanh toán'}
                                </p>
                            </div>
                        </div>
                        <button className="close-btn" onClick={onClose}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>

                    {/* BILL PREVIEW - Sẽ được in */}
                    <div className="bill-invoice-container">
                        <div className="invoice-paper printable-content">
                            {/* Restaurant Header */}
                            <div className="invoice-header">
                                <h2 className="restaurant-name">LIGHT COFFEE</h2>
                                <p className="restaurant-address">123 Đường ABC, Quận 1, TP.HCM</p>
                                <p className="restaurant-phone">Hotline: 0123 456 789</p>
                                <div className="invoice-divider"></div>
                            </div>

                            {/* Invoice Title */}
                            <div className="invoice-title">
                                <h3>{isPaid ? 'HÓA ĐƠN BÁN HÀNG' : 'HÓA ĐƠN TẠM TÍNH'}</h3>
                                <span className={`status-badge ${isPaid ? 'paid' : 'pending'}`}>
                                    {isPaid ? '● Đã thanh toán' : '● Chưa thanh toán'}
                                </span>
                            </div>

                            {/* Invoice Info */}
                            <div className="invoice-info">
                                <div className="info-row">
                                    <span className="label">Số hóa đơn:</span>
                                    <span className="value">#{billId || orderId}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Ngày:</span>
                                    <span className="value">{dateStr}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Giờ:</span>
                                    <span className="value">{timeStr}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Vị trí:</span>
                                    <span className="value">
                                        {isTakeaway ? 'Khách mang đi' : `Bàn số ${table?.number}`}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Nhân viên:</span>
                                    <span className="value">{employeeName}</span>
                                </div>
                            </div>

                            <div className="invoice-divider"></div>

                            {/* Items Table */}
                            <div className="invoice-items">
                                <div className="items-header">
                                    <span className="col-stt">STT</span>
                                    <span className="col-name">Sản phẩm</span>
                                    <span className="col-qty">SL</span>
                                    <span className="col-price">Đơn giá</span>
                                    <span className="col-total">Thành tiền</span>
                                </div>

                                {items && items.length > 0 ? (
                                    items.map((item, index) => {
                                        const itemName = item.name || item.product?.name || 'Sản phẩm';
                                        const quantity = item.qty || item.quantity || 1;
                                        const price = item.price || 0;
                                        const itemTotal = price * quantity;

                                        return (
                                            <div key={index} className="items-row">
                                                <span className="col-stt">{index + 1}</span>
                                                <span className="col-name">{itemName}</span>
                                                <span className="col-qty">{quantity}</span>
                                                <span className="col-price">{price.toLocaleString('vi-VN')}đ</span>
                                                <span className="col-total">{itemTotal.toLocaleString('vi-VN')}đ</span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="items-row empty">
                                        <span>Không có sản phẩm</span>
                                    </div>
                                )}
                            </div>

                            <div className="invoice-divider"></div>

                            {/* Summary */}
                            <div className="invoice-summary">
                                <div className="summary-row">
                                    <span className="label">Tạm tính:</span>
                                    <span className="value">{subtotal.toLocaleString('vi-VN')}đ</span>
                                </div>

                                {discountAmount > 0 && (
                                    <div className="summary-row discount">
                                        <span className="label">
                                            Giảm giá {promotion?.name ? `(${promotion.name})` : ''}:
                                        </span>
                                        <span className="value">-{discountAmount.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                )}

                                <div className="summary-row total">
                                    <span className="label">TỔNG CỘNG:</span>
                                    <span className="value">{total.toLocaleString('vi-VN')}đ</span>
                                </div>
                            </div>

                            {/* Payment Info */}
                            {isPaid && (
                                <>
                                    <div className="invoice-divider"></div>
                                    <div className="payment-info">
                                        <div className="payment-row">
                                            <span className="label">Phương thức thanh toán:</span>
                                            <span className="value">{paymentMethodText[paymentMethod] || paymentMethod}</span>
                                        </div>

                                        {paymentMethod === 'CASH' && customerPaid > 0 && (
                                            <>
                                                <div className="payment-row">
                                                    <span className="label">Khách đưa:</span>
                                                    <span className="value">{customerPaid.toLocaleString('vi-VN')}đ</span>
                                                </div>
                                                <div className="payment-row">
                                                    <span className="label">Tiền thừa:</span>
                                                    <span className="value change">{changeAmount.toLocaleString('vi-VN')}đ</span>
                                                </div>
                                            </>
                                        )}

                                        <div className="payment-status paid">
                                            <span className="status-text">✓ ĐÃ THANH TOÁN</span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {!isPaid && (
                                <>
                                    <div className="invoice-divider"></div>
                                    <div className="payment-info">
                                        <div className="payment-status pending">
                                            <span className="status-text">⚠ CHƯA THANH TOÁN</span>
                                        </div>
                                        <p className="payment-note">Vui lòng thanh toán tại quầy</p>
                                    </div>
                                </>
                            )}

                            {/* Footer */}
                            <div className="invoice-footer">
                                <p className="thank-you">Cảm ơn quý khách! Hẹn gặp lại!</p>
                                <p className="contact">Mọi thắc mắc vui lòng liên hệ hotline</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons - Ẩn khi in */}
                    <div className="action-buttons no-print">
                        {/* Nút In - Sử dụng window.print() trực tiếp */}
                        <button className="btn-action btn-print" onClick={handlePrint}>
                            <span className="btn-icon">🖨️</span>
                            <span className="btn-text">In hóa đơn</span>
                        </button>

                        {/* Nút Xem đơn hàng */}
                        <button className="btn-action btn-view-orders" onClick={() => {
                            onClose();
                            onViewOrders();
                        }}>
                            <span className="btn-icon">📋</span>
                            <span className="btn-text">Xem đơn hàng</span>
                        </button>

                        {/* Nút Đóng */}
                        <button className="btn-action btn-close-modal" onClick={onClose}>
                            <span className="btn-icon">✓</span>
                            <span className="btn-text">Hoàn tất</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillExportModal;