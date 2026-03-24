import React from 'react';

const BillPrint = React.forwardRef(({ billData }, ref) => {
    if (!billData) {
        return <div>No bill data</div>;
    }

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

    return (
        <div ref={ref} style={{ fontFamily: 'Arial, sans-serif', padding: '20px', fontSize: '14px' }}>
            <div style={{ textAlign: 'center', marginBottom: '15px', borderBottom: '2px dashed #000', paddingBottom: '10px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase' }}>LIGHT COFFEE</div>
                <div style={{ fontSize: '12px', margin: '3px 0' }}>123 Đường ABC, Quận 1, TP.HCM</div>
                <div style={{ fontSize: '12px' }}>Hotline: 0123 456 789</div>
            </div>

            <div style={{ textAlign: 'center', margin: '10px 0', fontWeight: 'bold', fontSize: '16px' }}>
                {isPaid ? 'HÓA ĐƠN BÁN HÀNG' : 'HÓA ĐƠN TẠM TÍNH'}
            </div>

            <div style={{ margin: '10px 0', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                    <span>Số hóa đơn:</span>
                    <span>#{billId || orderId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                    <span>Ngày:</span>
                    <span>{dateStr}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                    <span>Giờ:</span>
                    <span>{timeStr}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                    <span>Vị trí:</span>
                    <span>{isTakeaway ? 'Mang đi' : `Bàn ${table?.number}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                    <span>Nhân viên:</span>
                    <span>{employeeName}</span>
                </div>
            </div>

            <table style={{ width: '100%', margin: '15px 0', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left', borderBottom: '1px solid #000', padding: '5px', fontWeight: 'bold' }}>SP</th>
                        <th style={{ textAlign: 'left', borderBottom: '1px solid #000', padding: '5px', fontWeight: 'bold' }}>Tên</th>
                        <th style={{ textAlign: 'right', borderBottom: '1px solid #000', padding: '5px', fontWeight: 'bold' }}>SL</th>
                        <th style={{ textAlign: 'right', borderBottom: '1px solid #000', padding: '5px', fontWeight: 'bold' }}>Đ.Giá</th>
                        <th style={{ textAlign: 'right', borderBottom: '1px solid #000', padding: '5px', fontWeight: 'bold' }}>T.Tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {items && items.length > 0 ? (
                        items.map((item, index) => {
                            const itemName = item.name || item.product?.name || 'Sản phẩm';
                            const quantity = item.qty || item.quantity || 1;
                            const price = item.price || 0;
                            const itemTotal = price * quantity;

                            return (
                                <tr key={index}>
                                    <td style={{ padding: '4px 2px', borderBottom: '1px dashed #ccc' }}>{index + 1}</td>
                                    <td style={{ padding: '4px 2px', borderBottom: '1px dashed #ccc' }}>{itemName}</td>
                                    <td style={{ padding: '4px 2px', borderBottom: '1px dashed #ccc', textAlign: 'right' }}>{quantity}</td>
                                    <td style={{ padding: '4px 2px', borderBottom: '1px dashed #ccc', textAlign: 'right' }}>{price.toLocaleString('vi-VN')}</td>
                                    <td style={{ padding: '4px 2px', borderBottom: '1px dashed #ccc', textAlign: 'right' }}>{itemTotal.toLocaleString('vi-VN')}</td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '10px' }}>Không có sản phẩm</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div style={{ margin: '15px 0', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
                    <span>Tạm tính:</span>
                    <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>

                {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
                        <span>Giảm giá{promotion?.name ? ` (${promotion.name})` : ''}:</span>
                        <span>-{discountAmount.toLocaleString('vi-VN')}đ</span>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', fontWeight: 'bold', fontSize: '14px', borderTop: '2px solid #000', paddingTop: '8px' }}>
                    <span>TỔNG CỘNG:</span>
                    <span>{total.toLocaleString('vi-VN')}đ</span>
                </div>
            </div>

            {isPaid && (
                <div style={{ margin: '15px 0', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                        <span>Phương thức:</span>
                        <span>{paymentMethodText[paymentMethod] || paymentMethod}</span>
                    </div>

                    {paymentMethod === 'CASH' && customerPaid > 0 && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                                <span>Khách đưa:</span>
                                <span>{customerPaid.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                                <span>Tiền thừa:</span>
                                <span>{changeAmount.toLocaleString('vi-VN')}đ</span>
                            </div>
                        </>
                    )}

                    <div style={{ textAlign: 'center', fontWeight: 'bold', margin: '10px 0', padding: '8px', background: '#e8f5e8', border: '2px solid #4caf50' }}>
                        ✓ ĐÃ THANH TOÁN
                    </div>
                </div>
            )}

            {!isPaid && (
                <div style={{ margin: '15px 0' }}>
                    <div style={{ textAlign: 'center', fontWeight: 'bold', margin: '10px 0', padding: '8px', background: '#fff3e0', border: '2px solid #ff9800' }}>
                        ⚠ CHƯA THANH TOÁN
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '11px', marginTop: '5px' }}>
                        Vui lòng thanh toán tại quầy
                    </div>
                </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '10px', borderTop: '1px dashed #000', fontSize: '11px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    Cảm ơn quý khách! Hẹn gặp lại!
                </div>
                <div>
                    Mọi thắc mắc vui lòng liên hệ hotline
                </div>
            </div>
        </div>
    );
});

BillPrint.displayName = 'BillPrint';
export default BillPrint;