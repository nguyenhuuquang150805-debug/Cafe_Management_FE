import React, { useState, useEffect } from "react";
import { IonIcon } from "@ionic/react";
import { cartOutline, checkmarkOutline, star, closeOutline, walletOutline } from "ionicons/icons";
import { io } from "socket.io-client";
import "../assets/scss/menu.scss";
import apiService from "../api/apiService";

const socket = io("http://localhost:3001");

const Menu = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [notification, setNotification] = useState(null);
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [showTableModal, setShowTableModal] = useState(false);

    // 📦 Đơn hàng của khách (nếu đã có đơn từ staff)
    const [myOrder, setMyOrder] = useState(null);
    const [orderStatus, setOrderStatus] = useState(null);

    // 💳 Thanh toán
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // 🧠 Load categories + products + tables từ API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cateRes, prodRes, tableRes] = await Promise.all([
                    apiService.GET_ALL("categories"),
                    apiService.GET_ALL("products"),
                    apiService.GET_ALL("tables"),
                ]);
                setCategories(cateRes.data);
                setProducts(prodRes.data);

                // Chỉ lấy các bàn trống
                const freeTables = tableRes.data.filter(t => t.status === "FREE");
                setTables(freeTables);
            } catch (err) {
                console.error("❌ Lỗi tải dữ liệu:", err);
            }
        };
        fetchData();
    }, []);

    // 🔄 WebSocket - Đồng bộ trạng thái đơn hàng real-time
    useEffect(() => {
        // ✅ Nhận thông báo đơn hàng đã được staff tạo
        socket.on("order-created-for-customer", (data) => {
            console.log("✅ Staff đã tạo đơn hàng:", data);

            // Kiểm tra đơn có phải của mình không (dựa vào bàn)
            if (data.tableId === selectedTable?.id) {
                setMyOrder(data);
                setOrderStatus(data.status);
                showNotification(`✅ Đơn hàng #${data.id} đã được tạo!`);
            }
        });

        // ✅ Nhận cập nhật trạng thái đơn hàng
        socket.on("order-status-updated", (data) => {
            console.log("📢 Trạng thái đơn hàng cập nhật:", data);

            if (myOrder && data.orderId === myOrder.id) {
                setOrderStatus(data.status);
                showNotification(`📢 ${getStatusMessage(data.status)}`);

                // Nếu đơn đã hoàn thành, reset
                if (data.status === "COMPLETED" || data.status === "PAID") {
                    setTimeout(() => {
                        setMyOrder(null);
                        setOrderStatus(null);
                        setSelectedTable(null);
                    }, 3000);
                }
            }
        });

        // ✅ Nhận thông báo món đã sẵn sàng
        socket.on("item-ready", (data) => {
            console.log("🍽️ Món đã sẵn sàng:", data);
            showNotification(`🍽️ ${data.itemName} đã sẵn sàng!`);
        });

        // ✅ Nhận xác nhận thanh toán thành công
        socket.on("payment-confirmed", (data) => {
            console.log("✅ Thanh toán thành công:", data);

            if (myOrder && data.orderId === myOrder.id) {
                showNotification("✅ Thanh toán thành công! Cảm ơn quý khách!");
                setShowPaymentModal(false);

                // Reset sau 2 giây
                setTimeout(() => {
                    setMyOrder(null);
                    setOrderStatus(null);
                    setSelectedTable(null);
                }, 2000);
            }
        });

        return () => {
            socket.off("order-created-for-customer");
            socket.off("order-status-updated");
            socket.off("item-ready");
            socket.off("payment-confirmed");
        };
    }, [selectedTable, myOrder]);

    const getStatusMessage = (status) => {
        const messages = {
            PENDING: "Đơn hàng đang chờ xác nhận",
            CONFIRMED: "Đơn hàng đã được xác nhận",
            PREPARING: "Đang chuẩn bị món ăn",
            READY: "Món ăn đã sẵn sàng, vui lòng đến quầy",
            SERVING: "Đang phục vụ",
            COMPLETED: "Đơn hàng hoàn thành",
            PAID: "Đã thanh toán"
        };
        return messages[status] || "Đang xử lý";
    };

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    // 📤 Gửi món đến staff (GIỮ NGUYÊN)
    const sendToStaff = (item) => {
        if (!selectedTable) {
            alert("⚠️ Vui lòng chọn bàn trước khi đặt món!");
            setShowTableModal(true);
            return;
        }

        // Gửi món kèm thông tin bàn đến staff
        socket.emit("add-item-to-order", {
            ...item,
            table: selectedTable
        });

        showNotification(`${item.name} đã gửi đến nhân viên!`);
    };

    // 💳 Khởi tạo thanh toán online
    const initiatePayment = async (method) => {
        if (!myOrder) {
            alert("❌ Chưa có đơn hàng để thanh toán!\nVui lòng đợi nhân viên xác nhận đơn.");
            return;
        }

        try {
            const response = await apiService.POST("payments/create", {
                orderId: myOrder.id,
                amount: myOrder.totalAmount,
                method: method,
                tableNumber: selectedTable?.number,
                returnUrl: `${window.location.origin}/payment-result`,
                cancelUrl: `${window.location.origin}/menu`
            });

            if (response.data.paymentUrl) {
                // Redirect đến cổng thanh toán
                window.location.href = response.data.paymentUrl;
            } else if (method === "CASH") {
                // Thanh toán tiền mặt - gửi yêu cầu đến staff
                socket.emit("payment-cash-request", {
                    orderId: myOrder.id,
                    tableId: selectedTable?.id,
                    tableNumber: selectedTable?.number,
                    amount: myOrder.totalAmount
                });
                showNotification("✅ Yêu cầu thanh toán tiền mặt đã gửi đến nhân viên!");
                setShowPaymentModal(false);
            }

        } catch (err) {
            console.error("❌ Lỗi thanh toán:", err);
            alert("Không thể khởi tạo thanh toán. Vui lòng thử lại!");
        }
    };

    const getImageUrl = (imageName) => {
        if (!imageName) return "/fallback.jpg";
        return `http://localhost:8080/uploads/${imageName}`;
    };

    const renderCategory = (category) => {
        const items = products.filter((p) => p.category?.id === category.id);
        if (items.length === 0) return null;

        return (
            <div key={category.id} className="menu__category">
                <h3 className="menu__category-title">{category.name}</h3>
                <div className="menu__items-grid">
                    {items.map((item) => (
                        <div key={item.id} className="menu__item">
                            <div className="menu__item-image">
                                <img
                                    src={getImageUrl(item.imageUrl)}
                                    alt={item.name}
                                    onError={(e) => (e.target.src = "/fallback.jpg")}
                                />
                                <div className="menu__item-overlay">
                                    <button
                                        className="menu__item-add-btn"
                                        onClick={() => sendToStaff(item)}
                                    >
                                        <IonIcon icon={cartOutline} />
                                        <span className="text-black">Thêm</span>
                                    </button>
                                </div>
                            </div>
                            <div className="menu__item-content">
                                <div className="menu__item-rating">
                                    {[...Array(5)].map((_, i) => (
                                        <IonIcon
                                            key={i}
                                            icon={star}
                                            className={`menu__star ${i < 4 ? "menu__star--active" : ""}`}
                                        />
                                    ))}
                                </div>
                                <h4 className="menu__item-name">{item.name}</h4>
                                <p className="menu__item-desc">{item.description}</p>
                                <div className="menu__item-footer">
                                    <span className="menu__item-price">
                                        {item.price.toLocaleString()}₫
                                    </span>
                                    <button
                                        className="menu__item-add-inline"
                                        onClick={() => sendToStaff(item)}
                                    >
                                        <IonIcon icon={cartOutline} />
                                        <span>Thêm</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            {/* 🔔 Notification */}
            {notification && (
                <div className="menu__notification">
                    <IonIcon icon={checkmarkOutline} />
                    <span>{notification}</span>
                </div>
            )}

            {/* 🎯 Main Menu Section */}
            <section className="menu" id="menu">
                <div className="menu__header-section">
                    <div className="menu__header-content">
                        <h2 className="menu__main-title">Thực đơn</h2>
                        <p className="menu__main-subtitle">Hãy chọn món bạn yêu thích</p>

                        {/* Bàn + Trạng thái đơn + Thanh toán */}
                        <div className="menu__actions">
                            <button
                                className="menu__table-btn"
                                onClick={() => setShowTableModal(true)}
                                disabled={!!myOrder}
                            >
                                {selectedTable
                                    ? `🪑 Bàn ${selectedTable.number}`
                                    : "🪑 Chọn bàn"}
                            </button>

                            {myOrder && (
                                <>
                                    <div className="menu__order-info">
                                        📦 Đơn #{myOrder.id} - {myOrder.totalAmount.toLocaleString()}₫
                                    </div>

                                    <div className="menu__order-status">
                                        {getStatusMessage(orderStatus)}
                                    </div>

                                    {(orderStatus === "READY" || orderStatus === "SERVING" || orderStatus === "COMPLETED") && (
                                        <button
                                            className="menu__payment-btn"
                                            onClick={() => setShowPaymentModal(true)}
                                        >
                                            <IonIcon icon={walletOutline} /> Thanh toán
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="menu__header-divider"></div>
                    </div>
                </div>

                <div className="container menu__container">
                    {categories.map(renderCategory)}
                </div>
            </section>

            {/* 🪑 Modal chọn bàn */}
            {showTableModal && (
                <div className="modal-overlay" onClick={() => setShowTableModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h4>🪑 Chọn bàn của bạn</h4>
                            <button
                                className="close-btn"
                                onClick={() => setShowTableModal(false)}
                            >
                                <IonIcon icon={closeOutline} />
                            </button>
                        </div>
                        <div className="table-grid">
                            {tables.length === 0 ? (
                                <div className="no-tables">
                                    <p>😔 Hiện tại không có bàn trống</p>
                                </div>
                            ) : (
                                tables.map((table) => (
                                    <div
                                        key={table.id}
                                        className={`table-card ${selectedTable?.id === table.id ? "selected" : ""}`}
                                        onClick={() => {
                                            setSelectedTable(table);
                                            setShowTableModal(false);
                                        }}
                                    >
                                        <div className="table-number">Bàn {table.number}</div>
                                        <div className="table-capacity">👥 {table.capacity} chỗ</div>
                                        <div className="table-status">✓ Trống</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 💳 Payment Modal */}
            {showPaymentModal && myOrder && (
                <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
                    <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h4>💳 Chọn phương thức thanh toán</h4>
                            <button onClick={() => setShowPaymentModal(false)}>
                                <IonIcon icon={closeOutline} />
                            </button>
                        </div>

                        <div className="payment-info">
                            <p>Đơn hàng: <strong>#{myOrder.id}</strong></p>
                            <p>Bàn: <strong>{selectedTable?.number}</strong></p>
                            <p>Số tiền: <strong>{myOrder.totalAmount.toLocaleString()}₫</strong></p>
                            <p>Trạng thái: <strong>{getStatusMessage(orderStatus)}</strong></p>
                        </div>

                        <div className="payment-methods">
                            <button
                                className="payment-method-btn vnpay"
                                onClick={() => initiatePayment("VNPAY")}
                            >
                                <span>🏦 VNPay</span>
                            </button>
                            <button
                                className="payment-method-btn momo"
                                onClick={() => initiatePayment("MOMO")}
                            >
                                <span>🎀 MoMo</span>
                            </button>
                            <button
                                className="payment-method-btn payos"
                                onClick={() => initiatePayment("PAYOS")}
                            >
                                <span>💎 PayOS</span>
                            </button>
                            <button
                                className="payment-method-btn cash"
                                onClick={() => initiatePayment("CASH")}
                            >
                                <span>💵 Tiền mặt</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Menu;