import React, { useState } from 'react';

const EditOrderItemsModal = ({ order, onClose, onUpdateItems }) => {
    const [editedItems, setEditedItems] = useState(
        order.items.map(item => ({
            id: item.id,
            productId: item.product.id,
            productName: item.product.name,
            price: item.price,
            quantity: item.quantity,
            originalQuantity: item.quantity,
            isDeleted: false  // 🔥 THÊM FLAG XÓA
        }))
    );

    const updateQuantity = (itemId, newQty) => {
        if (newQty < 0) return;

        setEditedItems(prev =>
            prev.map(item => {
                if (item.id === itemId) {
                    return {
                        ...item,
                        quantity: newQty,
                        isDeleted: newQty === 0  // 🔥 TỰ ĐỘNG ĐÁNH DẤU XÓA NẾU QTY = 0
                    };
                }
                return item;
            })
        );
    };

    // 🔥 HÀM XÓA MÓN
    const handleDeleteItem = (itemId) => {
        if (window.confirm('❌ Bạn có chắc muốn xóa món này?')) {
            setEditedItems(prev =>
                prev.map(item => {
                    if (item.id === itemId) {
                        return {
                            ...item,
                            quantity: 0,
                            isDeleted: true
                        };
                    }
                    return item;
                })
            );
        }
    };

    // 🔥 HÀM KHÔI PHỤC MÓN
    const handleRestoreItem = (itemId) => {
        setEditedItems(prev =>
            prev.map(item => {
                if (item.id === itemId) {
                    return {
                        ...item,
                        quantity: item.originalQuantity,
                        isDeleted: false
                    };
                }
                return item;
            })
        );
    };

    const handleConfirm = () => {
        // Kiểm tra có thay đổi không
        const hasChanges = editedItems.some(
            item => item.quantity !== item.originalQuantity || item.isDeleted
        );

        if (!hasChanges) {
            return alert('⚠️ Không có thay đổi nào!');
        }

        // Kiểm tra có ít nhất 1 món còn lại
        const activeItems = editedItems.filter(item => !item.isDeleted && item.quantity > 0);

        if (activeItems.length === 0) {
            return alert('⚠️ Không thể xóa hết tất cả món! Hãy hủy đơn hàng nếu muốn.');
        }

        onUpdateItems(editedItems);
    };

    const calculateNewTotal = () => {
        return editedItems.reduce((sum, item) => {
            if (!item.isDeleted) {
                return sum + item.price * item.quantity;
            }
            return sum;
        }, 0);
    };

    const getActiveItems = () => {
        return editedItems.filter(item => !item.isDeleted);
    };

    const getDeletedItems = () => {
        return editedItems.filter(item => item.isDeleted);
    };

    const currentTotal = order.totalAmount;
    const newTotal = calculateNewTotal();
    const difference = newTotal - currentTotal;
    const activeItems = getActiveItems();
    const deletedItems = getDeletedItems();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content edit-items-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h4>
                        ✏️ Sửa đơn hàng {order.table
                            ? `Bàn ${order.table.number}`
                            : 'Khách mang đi'}
                    </h4>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="edit-items-content">
                    <div className="order-info">
                        <div className="info-row">
                            <span>📝 Mã đơn:</span>
                            <strong>#{order.id}</strong>
                        </div>
                        <div className="info-row">
                            <span>📅 Thời gian:</span>
                            <span>{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                        </div>
                        <div className="info-row">
                            <span>🍽️ Số món:</span>
                            <strong>
                                {activeItems.length} món
                                {deletedItems.length > 0 && (
                                    <span style={{ color: '#f44336', marginLeft: '8px' }}>
                                        ({deletedItems.length} đã xóa)
                                    </span>
                                )}
                            </strong>
                        </div>
                    </div>

                    {/* DANH SÁCH MÓN ĐANG CÒN */}
                    {activeItems.length > 0 && (
                        <div className="items-list">
                            <h5>🍽️ Danh sách món ({activeItems.length})</h5>
                            {activeItems.map((item) => (
                                <div key={item.id} className="edit-item">
                                    <div className="item-info">
                                        <span className="item-name">{item.productName}</span>
                                        <span className="item-price">{item.price.toLocaleString()}₫</span>
                                    </div>
                                    <div className="item-controls">
                                        <button
                                            className="qty-btn"
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            className="qty-input"
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                                            min="0"
                                        />
                                        <button
                                            className="qty-btn"
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className="item-total">
                                        {(item.price * item.quantity).toLocaleString()}₫
                                    </div>
                                    <div className="item-change">
                                        {item.quantity !== item.originalQuantity && (
                                            item.quantity > item.originalQuantity ? (
                                                <span className="increased">
                                                    +{item.quantity - item.originalQuantity}
                                                </span>
                                            ) : (
                                                <span className="decreased">
                                                    {item.quantity - item.originalQuantity}
                                                </span>
                                            )
                                        )}
                                    </div>
                                    {/* 🔥 NÚT XÓA */}
                                    <button
                                        className="btn-delete-item"
                                        onClick={() => handleDeleteItem(item.id)}
                                        title="Xóa món"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* DANH SÁCH MÓN ĐÃ XÓA */}
                    {deletedItems.length > 0 && (
                        <div className="items-list deleted-items-list">
                            <h5>🗑️ Món đã xóa ({deletedItems.length})</h5>
                            {deletedItems.map((item) => (
                                <div key={item.id} className="edit-item deleted-item">
                                    <div className="item-info">
                                        <span className="item-name" style={{ textDecoration: 'line-through', opacity: 0.6 }}>
                                            {item.productName}
                                        </span>
                                        <span className="item-price" style={{ opacity: 0.6 }}>
                                            {item.price.toLocaleString()}₫
                                        </span>
                                    </div>
                                    <div className="deleted-badge">
                                        🗑️ Đã xóa (SL: {item.originalQuantity})
                                    </div>
                                    {/* 🔥 NÚT KHÔI PHỤC */}
                                    <button
                                        className="btn-restore-item"
                                        onClick={() => handleRestoreItem(item.id)}
                                        title="Khôi phục món"
                                    >
                                        ↩️ Khôi phục
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="total-summary">
                        <div className="summary-row">
                            <span>Tổng hiện tại:</span>
                            <span>{currentTotal.toLocaleString()}₫</span>
                        </div>
                        {difference !== 0 && (
                            <div className={`summary-row ${difference > 0 ? 'increase' : 'decrease'}`}>
                                <span>Thay đổi:</span>
                                <span className="difference">
                                    {difference > 0 ? '+' : ''}{difference.toLocaleString()}₫
                                </span>
                            </div>
                        )}
                        <div className="summary-divider"></div>
                        <div className="summary-row total">
                            <strong>Tổng mới:</strong>
                            <strong className="amount">{newTotal.toLocaleString()}₫</strong>
                        </div>
                    </div>
                </div>

                <div className="action-buttons">
                    <button
                        className="btn-confirm"
                        onClick={handleConfirm}
                        disabled={difference === 0 && deletedItems.length === 0}
                    >
                        ✅ Cập nhật đơn hàng
                    </button>
                    <button className="btn-cancel" onClick={onClose}>
                        ❌ Hủy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditOrderItemsModal;