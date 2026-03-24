export const calculateCartTotal = (cart) => {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
};

export const calculateDiscount = (subtotal, promotion) => {
    if (!promotion) return 0;

    if (promotion.discountPercentage) {
        return (subtotal * promotion.discountPercentage) / 100;
    }

    return promotion.discountAmount || 0;
};

export const getImageUrl = (imagePath) => {
    if (!imagePath) return '/fallback.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:8080/uploads/${imagePath}`;
};

export const validateOrder = (cart, selectedTable, isTakeaway) => {
    if (!cart.length) {
        return { valid: false, message: '⚠️ Giỏ hàng trống!' };
    }

    if (!isTakeaway && !selectedTable) {
        return { valid: false, message: '⚠️ Vui lòng chọn bàn hoặc chọn "Khách mang đi"!' };
    }

    return { valid: true };
};

export const validatePayment = (paymentMethod, customerPaid, totalAmount) => {
    if (paymentMethod === 'CASH' && customerPaid && Number(customerPaid) < totalAmount) {
        return { valid: false, message: '⚠️ Số tiền không đủ!' };
    }

    return { valid: true };
};

export const formatOrderData = (cart, selectedTable, isTakeaway, employeeId, total, selectedPromotion, orderNotes) => {
    return {
        tableId: isTakeaway ? null : selectedTable?.id,
        employeeId: employeeId,
        status: 'PENDING',
        totalAmount: total,
        promotionId: selectedPromotion?.id || null,
        notes: orderNotes || null,
        items: cart.map(item => ({
            productId: item.id,
            quantity: item.qty,
            price: item.price,
            subtotal: item.price * item.qty
        }))
    };
};

export const getStatusMessages = () => ({
    CONFIRMED: '✅ XÁC NHẬN đơn hàng',
    PREPARING: '👨‍🍳 CHUẨN BỊ món',
    SERVED: '🍽️ ĐÃ PHỤC VỤ',
    CANCELLED: '❌ HỦY đơn hàng'
});

export const getStatusEmojis = () => ({
    CONFIRMED: '✅',
    PREPARING: '👨‍🍳',
    SERVED: '🍽️',
    CANCELLED: '❌',
    PAID: '💰'
});