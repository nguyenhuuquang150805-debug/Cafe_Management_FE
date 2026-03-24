import axios from 'axios';

const BASE_URL = 'https://cafe-management-be-5flk.onrender.com/api/payment';

const paymentService = {
    /**
     * Tạo link thanh toán PayOS
     */
    createPayOSPayment: async (
        orderId,
        amount,
        productName = 'Thanh toán đơn hàng',
        quantity = 1,
        description = '',
        returnUrl = null,
        cancelUrl = null
    ) => {
        try {
            console.log('🔄 Đang tạo link thanh toán PayOS...', {
                orderId,
                amount,
                productName,
                returnUrl,
                cancelUrl
            });

            const paymentData = {
                orderId: orderId,
                amount: amount,
                productName: productName,
                quantity: quantity,
                price: amount,
                description: description || `Thanh toán đơn hàng #${orderId}`,
                returnUrl: returnUrl || `${window.location.origin}/staff/payos-return`,
                cancelUrl: cancelUrl || `${window.location.origin}/staff/payos-return`,
                expiredAt: null
            };

            console.log('📤 Gửi request:', paymentData);

            const response = await axios.post(`${BASE_URL}/create`, paymentData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Response từ server:', response.data);

            if (response.data && response.data.data && response.data.data.checkoutUrl) {
                return {
                    success: true,
                    data: {
                        checkoutUrl: response.data.data.checkoutUrl,
                        orderCode: response.data.data.orderCode,
                        paymentLinkId: response.data.data.paymentLinkId,
                        qrCode: response.data.data.qrCode
                    }
                };
            }

            throw new Error('Không tìm thấy checkoutUrl trong response');

        } catch (error) {
            console.error('❌ Lỗi tạo thanh toán PayOS:', error.response?.data || error.message);
            throw error;
        }
    },

    getPaymentInfo: async (orderCode) => {
        try {
            const response = await axios.get(`${BASE_URL}/status/${orderCode}`);
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi lấy thông tin thanh toán:', error);
            throw error;
        }
    },

    cancelPayment: async (orderCode, reason = 'Hủy bởi người dùng') => {
        try {
            const response = await axios.post(`${BASE_URL}/cancel/${orderCode}`);
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi hủy thanh toán:', error);
            throw error;
        }
    },

    parseResponseCode: (code) => {
        const responseCodes = {
            '00': { success: true, message: 'Giao dịch thành công' },
            '01': { success: false, message: 'Giao dịch thất bại' },
            '02': { success: false, message: 'Giao dịch đã bị hủy' },
            '03': { success: false, message: 'Giao dịch hết hạn' },
            '04': { success: false, message: 'Không đủ số dư' },
            '05': { success: false, message: 'Thông tin thanh toán không hợp lệ' },
            '99': { success: false, message: 'Lỗi hệ thống' }
        };

        return responseCodes[code] || { success: false, message: 'Mã lỗi không xác định' };
    }
};

export default paymentService;