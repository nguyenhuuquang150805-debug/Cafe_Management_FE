import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../assets/scss/staff.scss';
import apiService from '../../api/apiService';
import paymentService from './utils/paymentService';

// Custom Hooks
import { useAuth } from './hooks/useAuth';
import { useProducts } from './hooks/useProducts';
import { useTables } from './hooks/useTables';
import { useOrders } from './hooks/useOrders';

// Components
import MenuSection from './components/MenuSection';
import CartSection from './components/CartSection';
import TableSelectionModal from './components/TableSelectionModal';
import OrdersModal from './components/OrdersModal';
import PaymentModal from './components/PaymentModal';
import AddItemsModal from './components/AddItemsModal';
import EditOrderItemsModal from './components/EditOrderItemsModal';
import BillExportModal from './components/BillExportModal';
import PayOSReturn from './PayOSReturn';
import TransferTableModal from './components/TransferTableModal';
import BillsHistoryModal from './components/BillsHistoryModal';

// Utils
import {
    calculateCartTotal,
    calculateDiscount,
    validateOrder,
    validatePayment,
    formatOrderData,
    getStatusMessages,
    getStatusEmojis
} from './utils/orderUtils';
import {
    generateInvoiceContent,
    downloadInvoice,
    generateInvoiceFilename
} from './utils/invoiceGenerator';

const socket = io('https://cafe-management-be-5flk.onrender.com');

const StaffPOS = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Auth
    const { currentUser, isLoggedIn, isLoading, handleLogout } = useAuth();

    // State quản lý
    const [cart, setCart] = useState([]);
    const [selectedPromotion, setSelectedPromotion] = useState(null);
    const [orderNotes, setOrderNotes] = useState('');
    const [soundEnabled] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Payment
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [customerPaid, setCustomerPaid] = useState('');

    // Add Items Modal
    const [showAddItemsModal, setShowAddItemsModal] = useState(false);
    const [addItemsCart, setAddItemsCart] = useState([]);
    const [addItemsSearch, setAddItemsSearch] = useState('');

    // Edit Items Modal
    const [showEditItemsModal, setShowEditItemsModal] = useState(false);

    // Bill Export Modal
    const [showBillModal, setShowBillModal] = useState(false);
    const [billModalData, setBillModalData] = useState(null);

    // Transfer Table Modal
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferOrder, setTransferOrder] = useState(null);

    // Bills History Modal
    const [showBillsHistoryModal, setShowBillsHistoryModal] = useState(false);

    // PayOS Return
    const [showPayOSReturn, setShowPayOSReturn] = useState(false);

    // Custom Hooks
    const { products, categories, promotions, selectedCategory, setSelectedCategory, searchTerm, setSearchTerm, filteredProducts } = useProducts(isLoggedIn);

    const { tables, setTables, selectedTable, setSelectedTable, isTakeaway, setIsTakeaway, showTableModal, setShowTableModal, updateTableStatus, handleTableSelect, resetTableSelection, refreshTables } = useTables(isLoggedIn, refreshTrigger);

    const { pendingOrders, selectedOrder, setSelectedOrder, showOrdersModal, setShowOrdersModal, createOrder, updateOrderStatus, addItemsToOrder, editOrderItems, getOrderStatusInfo } = useOrders(isLoggedIn, refreshTrigger);

    // Check PayOS params
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.has('code') || params.has('orderCode')) {
            console.log('🔍 Phát hiện PayOS params trong URL');
            setShowPayOSReturn(true);
        }
    }, [location.search]);

    // WebSocket
    useEffect(() => {
        socket.on('new-item-for-staff', (itemData) => {
            console.log('📦 Nhận món mới từ khách:', itemData);

            if (itemData.table) {
                setSelectedTable(itemData.table);
                setIsTakeaway(false);
                alert(`🆕 Món mới từ Bàn ${itemData.table.number}:\n${itemData.name}`);
            } else {
                alert(`🆕 Món mới từ khách: ${itemData.name}`);
            }

            setCart((prevCart) => {
                const exist = prevCart.find((p) => p.id === itemData.id);
                if (exist) {
                    return prevCart.map((p) =>
                        p.id === itemData.id ? { ...p, qty: p.qty + 1 } : p
                    );
                }
                return [...prevCart, { ...itemData, qty: 1 }];
            });

            if (soundEnabled) {
                const sound = new Audio(
                    'https://cdn.pixabay.com/download/audio/2022/03/15/audio_b74f12dc94.mp3?filename=notification-1-126507.mp3'
                );
                sound.play().catch(() => { });
            }
        });

        return () => socket.off('new-item-for-staff');
    }, [soundEnabled]);

    useEffect(() => {
        const checkPaymentCompletion = () => {
            const lastPayment = sessionStorage.getItem('lastPaymentCompleted');
            const lastChecked = sessionStorage.getItem('lastCheckedPayment');

            if (lastPayment && lastPayment !== lastChecked) {
                console.log('🔄 Phát hiện thanh toán mới - Force refresh data');
                sessionStorage.setItem('lastCheckedPayment', lastPayment);
                setRefreshTrigger((prev) => prev + 1);
            }
        };

        checkPaymentCompletion();
        const interval = setInterval(checkPaymentCompletion, 2000);
        return () => clearInterval(interval);
    }, []);

    // PayOS Return callbacks
    const handleClosePayOSReturn = () => {
        setShowPayOSReturn(false);
        navigate('/staff', { replace: true });
    };

    const handlePayOSReturnComplete = () => {
        setShowPayOSReturn(false);
        navigate('/staff', { replace: true });
        setRefreshTrigger((prev) => prev + 1);
    };

    // Cart Functions
    const addToCart = (item) => {
        const exist = cart.find((p) => p.id === item.id);
        if (exist) {
            setCart(cart.map((p) => (p.id === item.id ? { ...p, qty: p.qty + 1 } : p)));
        } else {
            setCart([...cart, { ...item, qty: 1 }]);
        }
    };

    const updateQty = (id, qty) => {
        if (qty <= 0) {
            setCart(cart.filter((p) => p.id !== id));
        } else {
            setCart(cart.map((p) => (p.id === id ? { ...p, qty } : p)));
        }
    };

    const clearCart = () => {
        if (window.confirm('Xóa toàn bộ giỏ hàng?')) {
            setCart([]);
            setSelectedPromotion(null);
            setOrderNotes('');
            resetTableSelection();
        }
    };

    // Add Items Functions
    const addToAddItemsCart = (item) => {
        const exist = addItemsCart.find((p) => p.id === item.id);
        if (exist) {
            setAddItemsCart(
                addItemsCart.map((p) => (p.id === item.id ? { ...p, qty: p.qty + 1 } : p))
            );
        } else {
            setAddItemsCart([...addItemsCart, { ...item, qty: 1 }]);
        }
    };

    const updateAddItemsQty = (id, qty) => {
        if (qty <= 0) {
            setAddItemsCart(addItemsCart.filter((p) => p.id !== id));
        } else {
            setAddItemsCart(addItemsCart.map((p) => (p.id === id ? { ...p, qty } : p)));
        }
    };

    // Order Functions
    const handleCreateOrder = async () => {
        const validation = validateOrder(cart, selectedTable, isTakeaway);
        if (!validation.valid) return alert(validation.message);

        try {
            const subtotal = calculateCartTotal(cart);
            const discountAmount = calculateDiscount(subtotal, selectedPromotion);
            const total = subtotal - discountAmount;

            const orderData = formatOrderData(
                cart,
                selectedTable,
                isTakeaway,
                currentUser?.id || 2,
                total,
                selectedPromotion,
                orderNotes
            );

            const response = await createOrder(orderData);

            if (!isTakeaway && selectedTable) {
                await updateTableStatus(selectedTable.id, 'OCCUPIED');
            }

            alert(
                `✅ ĐÃ TẠO ĐƠN HÀNG!\n\n` +
                `${isTakeaway ? '🚶 Khách mang đi' : `🪑 Bàn: ${selectedTable.number}`}\n` +
                `💰 Tổng: ${total.toLocaleString()}₫\n` +
                `📝 Mã đơn: #${response.id || response}\n` +
                `🔄 Trạng thái: CHỜ XÁC NHẬN`
            );

            setCart([]);
            setSelectedPromotion(null);
            setOrderNotes('');
            resetTableSelection();
            setRefreshTrigger((prev) => prev + 1);
        } catch (err) {
            alert('❌ Lỗi tạo đơn hàng. Vui lòng thử lại!');
        }
    };

    const handleExportInvoice = async () => {
        const validation = validateOrder(cart, selectedTable, isTakeaway);
        if (!validation.valid) return alert(validation.message);

        try {
            const subtotal = calculateCartTotal(cart);
            const discountAmount = calculateDiscount(subtotal, selectedPromotion);
            const total = subtotal - discountAmount;

            const orderData = formatOrderData(
                cart,
                selectedTable,
                isTakeaway,
                currentUser?.id || 2,
                total,
                selectedPromotion,
                orderNotes
            );

            const response = await createOrder(orderData);
            const orderId = response.id || response;

            if (!isTakeaway && selectedTable) {
                await updateTableStatus(selectedTable.id, 'OCCUPIED');
            }

            const billData = {
                orderId: orderId,
                totalAmount: total,
                paymentMethod: 'CASH',
                paymentStatus: 'PENDING',
                issuedAt: new Date().toISOString(),
                notes: 'Hóa đơn tạm tính - Chưa thanh toán'
            };

            const billResponse = await apiService.POST_ADD('bills', billData);

            const invoiceContent = generateInvoiceContent({
                orderId,
                billId: billResponse.data.id || billResponse.data,
                items: cart,
                table: selectedTable,
                isTakeaway,
                employeeName: currentUser?.fullName || 'N/A',
                subtotal,
                discountAmount,
                promotion: selectedPromotion,
                total,
                isPaid: false
            });

            const filename = generateInvoiceFilename(orderId, selectedTable, isTakeaway);
            downloadInvoice(invoiceContent, filename);

            setBillModalData({
                orderId,
                billId: billResponse.data.id || billResponse.data,
                table: selectedTable,
                isTakeaway,
                total,
                isPaid: false,
                items: cart || [],
                employeeName: currentUser?.fullName || 'N/A',
                paymentMethod: 'CASH',
                customerPaid: 0,
                subtotal: subtotal,
                discountAmount: discountAmount,
                promotion: selectedPromotion,
                createdAt: new Date().toISOString()
            });
            setShowBillModal(true);

            setCart([]);
            setSelectedPromotion(null);
            setOrderNotes('');
            resetTableSelection();
            setRefreshTrigger((prev) => prev + 1);
        } catch (err) {
            console.error('❌ Lỗi xuất hóa đơn:', err);
            alert('❌ Lỗi xuất hóa đơn. Vui lòng thử lại!');
        }
    };

    const handleUpdateOrderStatus = async (order, newStatus) => {
        const statusMessages = getStatusMessages();
        const statusEmojis = getStatusEmojis();

        if (newStatus === 'CANCELLED') {
            if (!window.confirm(`❌ Bạn có chắc muốn HỦY đơn hàng #${order.id}?`)) {
                return;
            }
        }

        try {
            await updateOrderStatus(order.id, newStatus);

            if (newStatus === 'CANCELLED' && order.table) {
                await updateTableStatus(order.table.id, 'FREE');
            }

            alert(
                `${statusEmojis[newStatus]} ${statusMessages[newStatus].toUpperCase()}!\n\n` +
                `📝 Mã đơn: #${order.id}\n` +
                `${order.table ? `🪑 Bàn: ${order.table.number}\n` : '🚶 Khách mang đi\n'}` +
                `🔄 Trạng thái mới: ${newStatus}`
            );

            setRefreshTrigger((prev) => prev + 1);
        } catch (err) {
            alert('❌ Lỗi cập nhật trạng thái. Vui lòng thử lại!');
        }
    };

    // Transfer Table Function
    const handleTransferTable = async (orderId, oldTableId, newTableId) => {
        try {
            console.log('🔄 Bắt đầu chuyển bàn:', { orderId, oldTableId, newTableId });

            // 1. Lấy thông tin order
            const orderRes = await apiService.GET_ID('orders', orderId);
            const order = orderRes.data;

            // 2. Cập nhật order với bàn mới
            const updatedOrderData = {
                tableId: newTableId,
                totalAmount: order.totalAmount,
                notes: order.notes || '',
                promotionId: order.promotion?.id || null,
                status: order.status
            };

            await apiService.PUT_EDIT(`orders/${orderId}`, updatedOrderData);
            console.log('✅ Đã cập nhật order sang bàn mới');

            // 3. Cập nhật bàn cũ về FREE
            const oldTableRes = await apiService.GET_ID('tables', oldTableId);
            const oldTable = oldTableRes.data;
            await apiService.PUT_EDIT(`tables/${oldTableId}`, {
                ...oldTable,
                status: 'FREE'
            });
            console.log('✅ Bàn cũ đã FREE');

            // 4. Cập nhật bàn mới thành OCCUPIED
            const newTableRes = await apiService.GET_ID('tables', newTableId);
            const newTable = newTableRes.data;
            await apiService.PUT_EDIT(`tables/${newTableId}`, {
                ...newTable,
                status: 'OCCUPIED'
            });
            console.log('✅ Bàn mới đã OCCUPIED');

            // 5. Refresh data
            await refreshTables();
            setRefreshTrigger(prev => prev + 1);

            return true;
        } catch (error) {
            console.error('❌ Lỗi chuyển bàn:', error);
            throw error;
        }
    };

    const handlePayOSPayment = async () => {
        try {
            const confirmPayment = window.confirm(
                `🏦 THANH TOÁN PAYOS\n\n` +
                `Mã đơn: #${selectedOrder.id}\n` +
                `Tổng tiền: ${selectedOrder.totalAmount.toLocaleString()}₫\n\n` +
                `Bạn sẽ được chuyển đến trang thanh toán PayOS.\n` +
                `Sau khi thanh toán thành công, hệ thống sẽ tự động cập nhật.\n\n` +
                `Nhấn OK để tiếp tục`
            );

            if (!confirmPayment) return;

            console.log('💳 Bắt đầu thanh toán PayOS cho Order:', selectedOrder.id);

            const returnUrl = `${window.location.origin}/staff?orderId=${selectedOrder.id}`;
            const cancelUrl = `${window.location.origin}/staff?orderId=${selectedOrder.id}`;

            console.log('📍 Return URL:', returnUrl);

            const paymentResponse = await paymentService.createPayOSPayment(
                selectedOrder.id,
                selectedOrder.totalAmount,
                'Thanh toán đơn hàng',
                1,
                `Thanh toán đơn hàng #${selectedOrder.id}`,
                returnUrl,
                cancelUrl
            );

            if (paymentResponse.success && paymentResponse.data?.checkoutUrl) {
                console.log('✅ Link PayOS:', paymentResponse.data.checkoutUrl);

                setSelectedOrder(null);
                setCustomerPaid('');

                window.location.href = paymentResponse.data.checkoutUrl;
            } else {
                throw new Error('Không thể tạo link thanh toán PayOS');
            }
        } catch (error) {
            console.error('❌ Lỗi thanh toán PayOS:', error);
            alert('❌ Không thể kết nối đến PayOS. Vui lòng thử lại hoặc chọn phương thức khác!');
        }
    };

    const handlePayOrder = async () => {
        const validation = validatePayment(paymentMethod, customerPaid, selectedOrder.totalAmount);
        if (!validation.valid) return alert(validation.message);

        const shouldExportInvoice = window.confirm(
            `💳 Xác nhận thanh toán\n\n` +
            `Mã đơn: #${selectedOrder.id}\n` +
            `Tổng tiền: ${selectedOrder.totalAmount.toLocaleString()}₫\n` +
            `Phương thức: ${paymentMethod === 'CASH' ? '💵 Tiền mặt' : paymentMethod === 'CARD' ? '💳 Thẻ' : '📱 Chuyển khoản'}\n\n` +
            `Nhấn OK để THANH TOÁN & XUẤT HÓA ĐƠN\n` +
            `Nhấn Cancel để CHỈ THANH TOÁN (không xuất)`
        );

        try {
            const tableBackup = selectedOrder.table ? { ...selectedOrder.table } : null;
            console.log('💾 Backup thông tin bàn:', tableBackup);

            await updateOrderStatus(selectedOrder.id, 'PAID');

            let billId = null;
            try {
                const billData = {
                    orderId: selectedOrder.id,
                    totalAmount: selectedOrder.totalAmount,
                    paymentMethod: paymentMethod,
                    paymentStatus: 'COMPLETED',
                    issuedAt: new Date().toISOString(),
                    notes:
                        paymentMethod === 'CASH' && customerPaid
                            ? `Khách đưa: ${Number(customerPaid).toLocaleString()}₫ - Thừa: ${(Number(customerPaid) - selectedOrder.totalAmount).toLocaleString()}₫`
                            : `Thanh toán bằng ${paymentMethod === 'CARD' ? 'thẻ' : 'Chuyển khoản'}`
                };

                const billResponse = await apiService.POST_ADD('bills', billData);
                billId = billResponse.data.id || billResponse.data;
                console.log('✅ Bill đã được tạo:', billId);
            } catch (billError) {
                console.error('⚠️ Lỗi xử lý bill:', billError);
            }

            const freshOrderRes = await apiService.GET_ID('orders', selectedOrder.id);
            const freshOrder = freshOrderRes.data;

            console.log('🔄 Order sau khi thanh toán:', freshOrder);

            const tableToUpdate = freshOrder.table || tableBackup;

            if (tableToUpdate?.id) {
                const tableId = tableToUpdate.id;
                console.log('🪑 Bắt đầu cập nhật bàn:', tableId);

                try {
                    const tableRes = await apiService.GET_ID('tables', tableId);
                    const updatedTable = { ...tableRes.data, status: 'FREE' };
                    await apiService.PUT_EDIT(`tables/${tableId}`, updatedTable);

                    setTables(prev => prev.map(t => (t.id === tableId ? { ...t, status: 'FREE' } : t)));

                    console.log(`✅ Bàn #${tableId} đã được cập nhật về FREE`);
                } catch (e) {
                    console.error('❌ Lỗi cập nhật bàn:', e);
                }
            } else {
                console.log('🚶‍♂️ Order không có bàn (mang đi), bỏ qua cập nhật bàn.');
            }

            if (shouldExportInvoice) {
                const invoiceContent = generateInvoiceContent({
                    orderId: selectedOrder.id,
                    billId,
                    items: selectedOrder.items,
                    table: tableBackup || selectedOrder.table,
                    isTakeaway: !tableBackup && !selectedOrder.table,
                    employeeName: currentUser?.fullName || 'N/A',
                    total: selectedOrder.totalAmount,
                    paymentMethod,
                    customerPaid,
                    isPaid: true
                });

                const filename = generateInvoiceFilename(
                    selectedOrder.id,
                    tableBackup || selectedOrder.table,
                    !tableBackup && !selectedOrder.table
                );
                downloadInvoice(invoiceContent, filename);
            }

            setBillModalData({
                orderId: selectedOrder.id,
                billId: billId,
                table: tableBackup || selectedOrder.table,
                isTakeaway: !tableBackup && !selectedOrder.table,
                total: selectedOrder.totalAmount,
                isPaid: true,
                items: selectedOrder.items || [],
                employeeName: currentUser?.fullName || 'N/A',
                paymentMethod: paymentMethod,
                customerPaid: customerPaid ? Number(customerPaid) : 0,
                subtotal: selectedOrder.totalAmount,
                discountAmount: 0,
                promotion: selectedOrder.promotion || null,
                createdAt: new Date().toISOString()
            });
            setShowBillModal(true);

            setSelectedOrder(null);
            setCustomerPaid('');
            setShowOrdersModal(false);
            setRefreshTrigger((prev) => prev + 1);
        } catch (err) {
            console.error('❌ Lỗi thanh toán:', err);
            alert('❌ Lỗi thanh toán. Vui lòng thử lại!');
        }
    };

    const handleAddItemsToOrder = async () => {
        if (!addItemsCart.length) return alert('⚠️ Chưa chọn món nào để thêm!');

        try {
            const newTotal = await addItemsToOrder(
                selectedOrder.id,
                addItemsCart,
                selectedOrder.totalAmount
            );

            alert(
                `✅ ĐÃ THÊM MÓN!\n` +
                `🆕 ${addItemsCart.length} món được thêm.\n` +
                `💰 Tổng mới: ${newTotal.toLocaleString()}₫`
            );

            setAddItemsCart([]);
            setShowAddItemsModal(false);
            setAddItemsSearch('');
            setSelectedOrder(null);
            setRefreshTrigger((prev) => prev + 1);
        } catch (err) {
            alert('❌ Lỗi thêm món. Vui lòng thử lại!');
        }
    };

    const handleEditOrderItems = async (editedItems) => {
        try {
            const newTotal = await editOrderItems(selectedOrder.id, editedItems);

            const changedCount = editedItems.filter(
                item => item.quantity !== item.originalQuantity
            ).length;

            alert(
                `✅ ĐÃ CẬP NHẬT ĐƠN HÀNG!\n` +
                `📝 ${changedCount} món đã được thay đổi.\n` +
                `💰 Tổng mới: ${newTotal.toLocaleString()}₫`
            );

            setShowEditItemsModal(false);
            setSelectedOrder(null);
            setRefreshTrigger((prev) => prev + 1);
        } catch (err) {
            alert('❌ Lỗi cập nhật đơn hàng. Vui lòng thử lại!');
        }
    };

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner">⏳</div>
                <p>Đang tải...</p>
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <div className="login-required">
                <div className="login-box">
                    <h2>🔐 Vui lòng đăng nhập</h2>
                    <p>Bạn cần đăng nhập để sử dụng hệ thống POS</p>
                    <button className="btn-login" onClick={() => (window.location.href = '/login')}>
                        Đăng nhập
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="staff-pos">
            <MenuSection
                currentUser={currentUser}
                cart={cart}
                pendingOrders={pendingOrders}
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filteredProducts={filteredProducts}
                onAddToCart={addToCart}
                onShowOrders={() => setShowOrdersModal(true)}
                onShowBillsHistory={() => setShowBillsHistoryModal(true)}
                onLogout={handleLogout}
            />

            <CartSection
                cart={cart}
                isTakeaway={isTakeaway}
                setIsTakeaway={(checked) => {
                    setIsTakeaway(checked);
                    if (checked) setSelectedTable(null);
                }}
                selectedTable={selectedTable}
                promotions={promotions}
                selectedPromotion={selectedPromotion}
                setSelectedPromotion={setSelectedPromotion}
                orderNotes={orderNotes}
                setOrderNotes={setOrderNotes}
                onUpdateQty={updateQty}
                onShowTableModal={() => setShowTableModal(true)}
                onCreateOrder={handleCreateOrder}
                onExportInvoice={handleExportInvoice}
                onClearCart={clearCart}
            />

            {showTableModal && (
                <TableSelectionModal
                    tables={tables}
                    selectedTable={selectedTable}
                    onClose={() => setShowTableModal(false)}
                    onSelectTable={handleTableSelect}
                />
            )}

            {showOrdersModal && (
                <OrdersModal
                    pendingOrders={pendingOrders}
                    onClose={() => setShowOrdersModal(false)}
                    onUpdateStatus={handleUpdateOrderStatus}
                    onPayOrder={(order) => {
                        setSelectedOrder(order);
                        setShowOrdersModal(false);
                    }}
                    onAddItems={(order) => {
                        setSelectedOrder(order);
                        setAddItemsCart([]);
                        setShowAddItemsModal(true);
                        setShowOrdersModal(false);
                    }}
                    onEditItems={(order) => {
                        setSelectedOrder(order);
                        setShowEditItemsModal(true);
                        setShowOrdersModal(false);
                    }}
                    onTransferTable={(order) => {
                        setTransferOrder(order);
                        setShowTransferModal(true);
                        setShowOrdersModal(false);
                    }}
                    getOrderStatusInfo={getOrderStatusInfo}
                />
            )}

            {selectedOrder && !showAddItemsModal && !showEditItemsModal && (
                <PaymentModal
                    order={selectedOrder}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    customerPaid={customerPaid}
                    setCustomerPaid={setCustomerPaid}
                    onConfirmPayment={handlePayOrder}
                    onConfirmPayOSPayment={handlePayOSPayment}
                    onClose={() => {
                        setSelectedOrder(null);
                        setCustomerPaid('');
                    }}
                />
            )}

            {showAddItemsModal && selectedOrder && (
                <AddItemsModal
                    order={selectedOrder}
                    products={products}
                    addItemsCart={addItemsCart}
                    addItemsSearch={addItemsSearch}
                    setAddItemsSearch={setAddItemsSearch}
                    onAddItem={addToAddItemsCart}
                    onUpdateQty={updateAddItemsQty}
                    onConfirmAdd={handleAddItemsToOrder}
                    onClose={() => {
                        setShowAddItemsModal(false);
                        setAddItemsCart([]);
                        setAddItemsSearch('');
                    }}
                />
            )}

            {showEditItemsModal && selectedOrder && (
                <EditOrderItemsModal
                    order={selectedOrder}
                    onClose={() => {
                        setShowEditItemsModal(false);
                        setSelectedOrder(null);
                    }}
                    onUpdateItems={handleEditOrderItems}
                />
            )}

            {showBillModal && billModalData && (
                <BillExportModal
                    billData={billModalData}
                    onClose={() => {
                        setShowBillModal(false);
                        setBillModalData(null);
                    }}
                    onViewOrders={() => {
                        setShowBillModal(false);
                        setBillModalData(null);
                        setShowOrdersModal(true);
                    }}
                />
            )}

            {showTransferModal && transferOrder && (
                <TransferTableModal
                    order={transferOrder}
                    tables={tables}
                    onClose={() => {
                        setShowTransferModal(false);
                        setTransferOrder(null);
                    }}
                    onTransfer={handleTransferTable}
                />
            )}

            {showBillsHistoryModal && (
                <BillsHistoryModal
                    onClose={() => setShowBillsHistoryModal(false)}
                    currentUser={currentUser}
                />
            )}

            {showPayOSReturn && (
                <PayOSReturn
                    onClose={handleClosePayOSReturn}
                    onComplete={handlePayOSReturnComplete}
                />
            )}
        </div>
    );
};

export default StaffPOS;