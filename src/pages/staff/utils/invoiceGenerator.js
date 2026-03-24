export const generateInvoiceContent = ({
    orderId,
    billId,
    items,
    table,
    isTakeaway,
    employeeName,
    subtotal,
    discountAmount,
    promotion,
    total,
    paymentMethod,
    customerPaid,
    isPaid = false,
    notes
}) => {
    const paymentMethodText = {
        CASH: 'Tiền mặt',
        CARD: 'Thẻ ngân hàng',
        MOBILE: 'Chuyển khoản',
        PAYOS: 'PayOS (QR Code)'
    };

    const now = new Date();
    const dateStr = now.toLocaleDateString('vi-VN');
    const timeStr = now.toLocaleTimeString('vi-VN');

    return `
════════════════════════════════════════
       NHÀ HÀNG QUẢN LÝ BÀN ĂN
════════════════════════════════════════
    Địa chỉ: 123 Đường ABC, Quận 1
         TP. Hồ Chí Minh
      Hotline: 0123 456 789
────────────────────────────────────────

         ${isPaid ? '*** HÓA ĐƠN BÁN HÀNG ***' : '*** HÓA ĐƠN TẠM TÍNH ***'}

Ngày: ${dateStr}              Giờ: ${timeStr}
Số hóa đơn: ${billId ? `#${billId}` : `#${orderId}`}
${isTakeaway ? 'Loại: MANG ĐI' : `Bàn số: ${table?.number || 'N/A'}`}
${!isTakeaway && table?.capacity ? `Sức chứa: ${table.capacity} người` : ''}
Nhân viên: ${employeeName}

════════════════════════════════════════
              CHI TIẾT ĐƠN HÀNG
════════════════════════════════════════
${items.map((item, index) => {
        const itemName = item.name || item.product?.name || 'Sản phẩm';
        const quantity = item.qty || item.quantity || 1;
        const price = item.price || 0;
        const itemTotal = price * quantity;

        return `${index + 1}. ${itemName}
   ${quantity} x ${price.toLocaleString('vi-VN')}đ = ${itemTotal.toLocaleString('vi-VN')}đ`;
    }).join('\n\n')}

────────────────────────────────────────
                THANH TOÁN
────────────────────────────────────────
${subtotal ? `Tạm tính:              ${subtotal.toLocaleString('vi-VN')}đ` : `Tạm tính:              ${total.toLocaleString('vi-VN')}đ`}
${discountAmount && discountAmount > 0 ? `Giảm giá (${promotion?.name || 'KM'}):       -${discountAmount.toLocaleString('vi-VN')}đ` : ''}

════════════════════════════════════════
TỔNG TIỀN:             ${total.toLocaleString('vi-VN')}đ
════════════════════════════════════════

${isPaid ? `
PHƯƠNG THỨC THANH TOÁN
${paymentMethodText[paymentMethod] || paymentMethod}
${paymentMethod === 'CASH' && customerPaid ? `
Khách đưa:             ${Number(customerPaid).toLocaleString('vi-VN')}đ
Tiền thừa:             ${(Number(customerPaid) - total).toLocaleString('vi-VN')}đ
` : ''}
${notes ? `Ghi chú: ${notes}\n` : ''}
┌──────────────────────────────────────┐
│       ✓ ĐÃ THANH TOÁN THÀNH CÔNG     │
└──────────────────────────────────────┘
` : `
┌──────────────────────────────────────┐
│      ⚠ CHƯA THANH TOÁN               │
│   Vui lòng thanh toán tại quầy       │
└──────────────────────────────────────┘
${notes ? `Ghi chú: ${notes}\n` : ''}
`}
────────────────────────────────────────
    Cảm ơn quý khách đã sử dụng dịch vụ!
         Hẹn gặp lại quý khách!
────────────────────────────────────────
  Mọi thắc mắc vui lòng liên hệ hotline
         hoặc quét mã QR phản hồi
════════════════════════════════════════
`;
};

export const downloadInvoice = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

export const generateInvoiceFilename = (orderId, table, isTakeaway) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
    const tableInfo = isTakeaway ? 'MangDi' : `Ban${table?.number || 'XX'}`;

    return `HoaDon_${tableInfo}_${orderId}_${dateStr}_${timeStr}.txt`;
};