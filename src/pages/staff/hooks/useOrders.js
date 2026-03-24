import { useState, useEffect } from 'react';
import apiService from '../../../api/apiService';

export const useOrders = (isLoggedIn, refreshTrigger) => {
    const [pendingOrders, setPendingOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrdersModal, setShowOrdersModal] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            fetchOrders();
        }
    }, [isLoggedIn, refreshTrigger]);

    const fetchOrders = async () => {
        try {
            const orderRes = await apiService.GET_ALL('orders');
            // 🔥 SỬA: Lọc bỏ các đơn đã thanh toán (PAID) và đã hủy (CANCELLED)
            const pending = orderRes.data.filter((o) =>
                ['PENDING', 'CONFIRMED', 'PREPARING', 'SERVED'].includes(o.status)
            );
            setPendingOrders(pending);
            console.log(`📋 Đơn hàng chờ xử lý: ${pending.length}/${orderRes.data.length}`);
        } catch (err) {
            console.error('❌ Lỗi tải orders:', err);
        }
    };

    const createOrder = async (orderData) => {
        try {
            const response = await apiService.POST_ADD('orders', orderData);
            await fetchOrders();
            return response.data;
        } catch (err) {
            console.error('❌ Lỗi tạo order:', err);
            throw err;
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const currentOrderRes = await apiService.GET_ID('orders', orderId);
            const currentOrder = currentOrderRes.data;

            const updateData = {
                tableId: currentOrder.table?.id || null,
                totalAmount: currentOrder.totalAmount,
                notes: currentOrder.notes,
                promotionId: currentOrder.promotion?.id || null,
                status: newStatus
            };

            console.log(`📤 Cập nhật trạng thái order #${orderId}:`, updateData);
            await apiService.PUT_EDIT(`orders/${orderId}`, updateData);
            await fetchOrders();
            return true;
        } catch (err) {
            console.error('❌ Lỗi cập nhật order status:', err);
            throw err;
        }
    };

    const addItemsToOrder = async (orderId, newItems, currentTotal) => {
        try {
            const currentOrderRes = await apiService.GET_ID('orders', orderId);
            const currentOrder = currentOrderRes.data;

            const itemPromises = newItems.map(item =>
                apiService.POST_ADD('order-items', {
                    orderId: orderId,
                    productId: item.id,
                    quantity: item.qty,
                    price: item.price,
                    subtotal: item.price * item.qty
                })
            );

            await Promise.all(itemPromises);

            const addItemsTotal = newItems.reduce((sum, p) => sum + p.price * p.qty, 0);
            const newTotalAmount = currentTotal + addItemsTotal;

            const updateData = {
                tableId: currentOrder.table?.id || null,
                totalAmount: newTotalAmount,
                notes: currentOrder.notes,
                promotionId: currentOrder.promotion?.id || null,
                status: currentOrder.status
            };

            console.log(`📤 Cập nhật order #${orderId} sau khi thêm món:`, updateData);
            await apiService.PUT_EDIT(`orders/${orderId}`, updateData);

            await fetchOrders();
            return newTotalAmount;
        } catch (err) {
            console.error('❌ Lỗi thêm món vào order:', err);
            throw err;
        }
    };

    const getOrderStatusInfo = (status) => {
        const statusMap = {
            PENDING: { label: 'Chờ xác nhận', icon: '⏳', class: 'pending' },
            CONFIRMED: { label: 'Đã xác nhận', icon: '✅', class: 'confirmed' },
            PREPARING: { label: 'Đang chuẩn bị', icon: '👨‍🍳', class: 'preparing' },
            SERVED: { label: 'Đã phục vụ', icon: '🍽️', class: 'served' },
            PAID: { label: 'Đã thanh toán', icon: '💰', class: 'paid' },
            CANCELLED: { label: 'Đã hủy', icon: '❌', class: 'cancelled' }
        };
        return statusMap[status] || { label: status, icon: '❓', class: 'unknown' };
    };

    const editOrderItems = async (orderId, editedItems) => {
        try {
            const currentOrderRes = await apiService.GET_ID('orders', orderId);
            const currentOrder = currentOrderRes.data;

            console.log('📝 Bắt đầu sửa đơn hàng #', orderId);
            console.log('📋 Danh sách món đã chỉnh sửa:', editedItems);

            // 🔥 BƯỚC 1: XÓA CÁC MÓN BỊ ĐÁNH DẤU XÓA
            const deletedItems = editedItems.filter(item => item.isDeleted || item.quantity === 0);
            for (const item of deletedItems) {
                try {
                    await apiService.DELETE_ID('order-items', item.id);
                    console.log(`✅ Đã xóa món: ${item.productName} (ID: ${item.id})`);
                } catch (err) {
                    console.error(`❌ Lỗi xóa món ${item.productName}:`, err);
                }
            }

            // 🔥 BƯỚC 2: CẬP NHẬT SỐ LƯỢNG CÁC MÓN CÒN LẠI
            const activeItems = editedItems.filter(item => !item.isDeleted && item.quantity > 0);
            for (const item of activeItems) {
                if (item.quantity !== item.originalQuantity) {
                    try {
                        await apiService.PUT_EDIT(`order-items/${item.id}`, {
                            orderId: orderId,
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                            subtotal: item.price * item.quantity
                        });
                        console.log(`✅ Cập nhật món: ${item.productName} (${item.originalQuantity} → ${item.quantity})`);
                    } catch (err) {
                        console.error(`❌ Lỗi cập nhật món ${item.productName}:`, err);
                    }
                }
            }

            // 🔥 BƯỚC 3: TÍNH LẠI TỔNG TIỀN
            const newTotal = activeItems.reduce((sum, item) => {
                return sum + (item.price * item.quantity);
            }, 0);

            console.log(`💰 Tổng tiền mới: ${newTotal.toLocaleString()}₫`);

            // 🔥 BƯỚC 4: CẬP NHẬT ORDER
            const updateData = {
                tableId: currentOrder.table?.id || null,
                totalAmount: newTotal,
                notes: currentOrder.notes,
                promotionId: currentOrder.promotion?.id || null,
                status: currentOrder.status
            };

            await apiService.PUT_EDIT(`orders/${orderId}`, updateData);
            console.log(`✅ Đã cập nhật order #${orderId} thành công`);

            await fetchOrders();
            return newTotal;
        } catch (err) {
            console.error('❌ Lỗi sửa món trong order:', err);
            throw err;
        }
    };

    return {
        pendingOrders,
        selectedOrder,
        setSelectedOrder,
        showOrdersModal,
        setShowOrdersModal,
        createOrder,
        updateOrderStatus,
        addItemsToOrder,
        editOrderItems,
        getOrderStatusInfo,
        refreshOrders: fetchOrders
    };
};