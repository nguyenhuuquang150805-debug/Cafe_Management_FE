import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import apiService from '../../api/apiService';
import {
    generateInvoiceContent,
    downloadInvoice,
    generateInvoiceFilename
} from './utils/invoiceGenerator';


import '../../assets/scss/payos-return.scss';

const PayOSReturn = ({ onClose, onComplete }) => {
    const location = useLocation();
    const [paymentResult, setPaymentResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showExportModal, setShowExportModal] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [billId, setBillId] = useState(null);

    useEffect(() => {
        const processPaymentResult = async () => {
            try {
                const params = new URLSearchParams(location.search);

                const code = params.get('code');
                const id = params.get('id');
                const orderCode = params.get('orderCode') || id;
                const status = params.get('status');
                const cancel = params.get('cancel');
                const orderId = params.get('orderId');

                console.log('🔍 PayOS Params:', {
                    code,
                    id,
                    orderCode,
                    status,
                    cancel,
                    orderId,
                    allParams: Object.fromEntries(params.entries())
                });

                // 🔥 KIỂM TRA HỦY TRƯỚC - ƯU TIÊN TUYỆT ĐỐI
                // PayOS có thể trả về cancel=true ngay cả khi code=00
                if (cancel === 'true' || status === 'CANCELLED') {
                    console.error('❌ PAYMENT CANCELLED BY USER');
                    setPaymentResult({
                        success: false,
                        code: code || '97',
                        orderCode: orderCode,
                        status: 'CANCELLED',
                        message: 'Giao dịch đã bị hủy bởi người dùng'
                    });
                    setLoading(false);
                    return; // 🛑 DỪNG NGAY - KHÔNG XỬ LÝ GÌ THÊM
                }

                // 🔥 KIỂM TRA MÃ LỖI ĐẶC BIỆT
                if (code === '97') {
                    console.error('❌ PAYMENT CANCELLED - Code 97');
                    setPaymentResult({
                        success: false,
                        code: code,
                        orderCode: orderCode,
                        status: 'CANCELLED',
                        message: 'Giao dịch bị hủy (Mã lỗi: 97)'
                    });
                    setLoading(false);
                    return; // 🛑 DỪNG NGAY
                }

                // 🔥 KIỂM TRA MÃ THÀNH CÔNG
                const isSuccess = code === '00';

                console.log('🎯 Payment Status Check:', {
                    code,
                    isSuccess,
                    decision: isSuccess ? '✅ THÀNH CÔNG' : '❌ THẤT BẠI'
                });

                if (!isSuccess) {
                    console.warn('⚠️ Payment FAILED - code:', code);
                    setPaymentResult({
                        success: false,
                        code: code,
                        orderCode: orderCode,
                        status: 'FAILED',
                        message: `Giao dịch thất bại (Mã lỗi: ${code})`
                    });
                    setLoading(false);
                    return;
                }

                // 🔥 CHỈ XỬ LÝ KHI code === '00'
                if (!orderId) {
                    throw new Error('Không tìm thấy orderId trong URL. Vui lòng liên hệ nhân viên.');
                }

                console.log('✅ Payment SUCCESS (code=00) - Processing Order #', orderId);

                setPaymentResult({
                    success: true,
                    code: code,
                    orderCode: orderCode,
                    status: 'PAID',
                    message: 'Giao dịch thành công'
                });

                // 1️⃣ LẤY THÔNG TIN ORDER
                console.log('📦 Đang lấy thông tin order...');
                const orderResponse = await apiService.GET_ID('orders', orderId);
                const order = orderResponse.data;
                setOrderData(order);

                console.log('📦 Order data:', order);

                // 2️⃣ CẬP NHẬT ORDER = PAID
                console.log('💾 Đang cập nhật Order thành PAID...');
                const updatedOrderData = {
                    tableId: order.table?.id || null,
                    totalAmount: order.totalAmount,
                    notes: order.notes || '',
                    promotionId: order.promotion?.id || null,
                    status: 'PAID'
                };

                await apiService.PUT_EDIT(`orders/${orderId}`, updatedOrderData);
                console.log('✅ Order đã được cập nhật thành PAID');

                // 3️⃣ TẠO HOẶC CẬP NHẬT BILL
                console.log('💳 Đang tạo bill...');
                try {
                    const billData = {
                        orderId: parseInt(orderId),
                        totalAmount: order.totalAmount,
                        paymentMethod: 'PAYOS',
                        paymentStatus: 'COMPLETED',
                        issuedAt: new Date().toISOString(),
                        notes: `Thanh toán qua PayOS - Mã GD: ${orderCode}`
                    };

                    const billResponse = await apiService.POST_ADD('bills', billData);
                    const createdBill = billResponse.data;
                    setBillId(createdBill.id || createdBill);
                    console.log('✅ Bill đã được tạo:', createdBill.id || createdBill);
                } catch (billError) {
                    console.error('⚠️ Lỗi xử lý bill:', billError);
                }

                // 4️⃣ CẬP NHẬT TABLE = FREE
                if (order.table && order.table.id) {
                    console.log('🪑 Đang cập nhật bàn thành FREE...');
                    try {
                        const tableResponse = await apiService.GET_ID('tables', order.table.id);
                        const currentTable = tableResponse.data;

                        const updatedTableData = {
                            number: currentTable.number,
                            capacity: currentTable.capacity,
                            status: 'FREE',
                            description: currentTable.description
                        };

                        await apiService.PUT_EDIT(`tables/${order.table.id}`, updatedTableData);
                        console.log('✅ Bàn đã được cập nhật thành FREE');
                    } catch (tableError) {
                        console.error('⚠️ Lỗi cập nhật bàn:', tableError);
                        setError('Cập nhật bàn thất bại nhưng thanh toán thành công');
                    }
                }

                // 5️⃣ LƯU DẤU HIỆU ĐÃ THANH TOÁN
                try {
                    sessionStorage.setItem('lastPaymentCompleted', Date.now().toString());
                    console.log('💾 Đã lưu payment flag vào sessionStorage');
                } catch (e) {
                    console.warn('⚠️ Không thể lưu vào sessionStorage:', e);
                }

                // 6️⃣ HIỂN THỊ MODAL HỎI CÓ MUỐN XUẤT HÓA ĐƠN
                console.log('🎯 Hiển thị modal xuất hóa đơn');
                setShowExportModal(true);

                console.log('🎉 Hoàn tất xử lý thanh toán!');

            } catch (error) {
                console.error('❌ Lỗi:', error);
                setPaymentResult({
                    success: false,
                    message: error.message || 'Lỗi xử lý kết quả thanh toán'
                });
                setError(error.message || 'Không thể xử lý kết quả thanh toán. Vui lòng liên hệ nhân viên.');
            } finally {
                setLoading(false);
            }
        };

        processPaymentResult();
    }, [location]);

    const handleExportInvoice = async () => {
        if (!orderData || !billId) {
            alert('⚠️ Không có dữ liệu để xuất hóa đơn');
            return;
        }

        try {
            const invoiceContent = generateInvoiceContent({
                orderId: orderData.id,
                billId: billId,
                items: orderData.items,
                table: orderData.table,
                isTakeaway: !orderData.table,
                employeeName: orderData.employee?.fullName || 'N/A',
                total: orderData.totalAmount,
                paymentMethod: 'PAYOS',
                isPaid: true,
                notes: `Thanh toán PayOS - Mã GD: ${paymentResult.orderCode}`
            });

            const filename = generateInvoiceFilename(
                orderData.id,
                orderData.table,
                !orderData.table
            );

            downloadInvoice(invoiceContent, filename);
            console.log('📄 Đã xuất hóa đơn');

            alert('✅ Hóa đơn đã được tải xuống!');

            // GỌI CALLBACK ĐỂ ĐÓNG VÀ REFRESH
            if (onComplete) onComplete();
        } catch (error) {
            console.error('⚠️ Lỗi xuất hóa đơn:', error);
            alert('❌ Không thể xuất hóa đơn. Vui lòng thử lại!');
        }
    };

    const handleSkipExport = () => {
        if (onComplete) onComplete();
    };

    const handleBackToHome = () => {
        if (onClose) onClose();
    };

    if (loading) {
        return (
            <div className="payos-return-container">
                <div className="loading-box">
                    <div className="spinner"></div>
                    <h3>Đang xử lý kết quả thanh toán...</h3>
                    <p className="loading-text">Vui lòng đợi trong giây lát</p>
                </div>
            </div>
        );
    }

    if (showExportModal && paymentResult?.success) {
        return (
            <div className="payos-return-container">
                <div className="result-box success">
                    <div className="icon">✅</div>
                    <h2>Thanh toán thành công!</h2>

                    <div className="payment-details">
                        <div className="detail-row">
                            <span>Mã giao dịch PayOS:</span>
                            <strong>{paymentResult.orderCode}</strong>
                        </div>
                        <div className="detail-row">
                            <span>Mã đơn hàng:</span>
                            <strong>#{orderData?.id}</strong>
                        </div>
                        <div className="detail-row">
                            <span>Số tiền:</span>
                            <strong className="amount">
                                {orderData?.totalAmount?.toLocaleString()}₫
                            </strong>
                        </div>
                    </div>

                    <div className="export-invoice-section">
                        <div className="export-icon">🧾</div>
                        <h3>Bạn có muốn xuất hóa đơn?</h3>
                        <p>Hóa đơn đã được lưu vào hệ thống. Bạn có thể tải về ngay bây giờ hoặc xem lại sau.</p>

                        <div className="export-actions">
                            <button className="btn-export-now" onClick={handleExportInvoice}>
                                📄 Xuất hóa đơn ngay
                            </button>
                            <button className="btn-skip-export" onClick={handleSkipExport}>
                                ⏭️ Bỏ qua
                            </button>
                        </div>
                    </div>

                    <button className="btn-back" onClick={handleBackToHome}>
                        🏠 Quay lại trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="payos-return-container">
            <div className={`result-box ${paymentResult?.success ? 'success' : 'failed'}`}>
                <div className="icon">
                    {paymentResult?.success ? '✅' : '❌'}
                </div>

                <h2>
                    {paymentResult?.success
                        ? 'Thanh toán thành công!'
                        : paymentResult?.status === 'CANCELLED'
                            ? 'Giao dịch đã bị hủy'
                            : 'Thanh toán thất bại'}
                </h2>

                {error && (
                    <div className="error-notice">
                        <span className="error-icon">⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                <div className="payment-details">
                    <div className="detail-row">
                        <span>Phương thức:</span>
                        <strong>🏦 PayOS</strong>
                    </div>
                    <div className="detail-row">
                        <span>Mã giao dịch:</span>
                        <strong>{paymentResult?.orderCode || 'N/A'}</strong>
                    </div>
                    <div className="detail-row">
                        <span>Mã đơn hàng:</span>
                        <strong>#{orderData?.id || 'N/A'}</strong>
                    </div>
                    <div className="detail-row">
                        <span>Số tiền:</span>
                        <strong className="amount">
                            {orderData?.totalAmount
                                ? orderData.totalAmount.toLocaleString()
                                : '0'}₫
                        </strong>
                    </div>
                    <div className="detail-row">
                        <span>Trạng thái:</span>
                        <strong>{paymentResult?.status || 'N/A'}</strong>
                    </div>
                    <div className="detail-row">
                        <span>Mã phản hồi:</span>
                        <strong>{paymentResult?.code || 'N/A'}</strong>
                    </div>
                </div>

                <div className="message">
                    <p>{paymentResult?.message}</p>
                    {paymentResult?.success && !error && (
                        <p className="success-note">
                            ✅ Đơn hàng đã hoàn thành. Cảm ơn quý khách đã sử dụng dịch vụ!
                        </p>
                    )}
                    {paymentResult?.status === 'CANCELLED' && (
                        <p className="cancel-note">
                            ℹ️ Vui lòng chọn phương thức thanh toán khác hoặc liên hệ nhân viên.
                        </p>
                    )}
                </div>

                <button className="btn-back" onClick={handleBackToHome}>
                    🏠 Quay lại trang chủ
                </button>
            </div>
        </div>
    );
};

export default PayOSReturn;