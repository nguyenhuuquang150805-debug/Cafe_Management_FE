import React from 'react';
import { getImageUrl } from '../utils/orderUtils';

const AddItemsModal = ({
    order,
    products,
    addItemsCart,
    addItemsSearch,
    setAddItemsSearch,
    onAddItem,
    onUpdateQty,
    onConfirmAdd,
    onClose
}) => {
    const filteredProducts = products.filter((p) => {
        if (!addItemsSearch) return true;
        const term = addItemsSearch.toLowerCase();
        return (
            p.name.toLowerCase().includes(term) ||
            p.description?.toLowerCase().includes(term)
        );
    });

    const addItemsTotal = addItemsCart.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content add-items-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h4>
                        ➕ Thêm món cho {order.table
                            ? `Bàn ${order.table.number}`
                            : 'Khách mang đi'}
                    </h4>
                    <button className="close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="add-items-content">
                    <div className="current-order-info">
                        <h5>📋 Order hiện tại (#{order.id})</h5>
                        <div className="order-items-summary">
                            {order.items.map((item) => (
                                <div key={item.id} className="summary-item">
                                    <span>{item.product.name} x{item.quantity}</span>
                                    <span>
                                        {(item.price * item.quantity).toLocaleString()}₫
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="current-total">
                            <strong>Tổng hiện tại:</strong>
                            <strong className="amount">
                                {order.totalAmount.toLocaleString()}₫
                            </strong>
                        </div>
                    </div>

                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="🔍 Tìm kiếm món để thêm..."
                            value={addItemsSearch}
                            onChange={(e) => setAddItemsSearch(e.target.value)}
                        />
                        {addItemsSearch && (
                            <button
                                className="clear-search"
                                onClick={() => setAddItemsSearch('')}
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <div className="add-items-menu-grid">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((item) => (
                                <div
                                    key={item.id}
                                    className="menu-card-small"
                                    onClick={() => onAddItem(item)}
                                >
                                    <div className="card-image">
                                        <img
                                            src={getImageUrl(item.imageUrl)}
                                            alt={item.name}
                                            onError={(e) =>
                                                (e.target.src = '/fallback.jpg')
                                            }
                                        />
                                    </div>
                                    <div className="card-body">
                                        <h6>{item.name}</h6>
                                        <p className="price">
                                            {item.price.toLocaleString()}₫
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-results">
                                <div className="icon">🔍</div>
                                <p>Không tìm thấy sản phẩm</p>
                            </div>
                        )}
                    </div>

                    {addItemsCart.length > 0 && (
                        <div className="add-items-cart">
                            <h5>🛒 Món cần thêm ({addItemsCart.length})</h5>
                            <div className="cart-items-small">
                                {addItemsCart.map((item) => (
                                    <div key={item.id} className="cart-item-small">
                                        <div className="item-info">
                                            <span className="item-name">
                                                {item.name}
                                            </span>
                                            <span className="item-price">
                                                {item.price.toLocaleString()}₫
                                            </span>
                                        </div>
                                        <div className="item-controls">
                                            <button
                                                className="qty-btn"
                                                onClick={() =>
                                                    onUpdateQty(item.id, item.qty - 1)
                                                }
                                            >
                                                −
                                            </button>
                                            <span className="qty">{item.qty}</span>
                                            <button
                                                className="qty-btn"
                                                onClick={() =>
                                                    onUpdateQty(item.id, item.qty + 1)
                                                }
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="item-total">
                                            {(item.price * item.qty).toLocaleString()}₫
                                        </div>
                                        <button
                                            className="remove-btn"
                                            onClick={() => onUpdateQty(item.id, 0)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="add-items-summary">
                                <div className="summary-row">
                                    <span>Tổng hiện tại:</span>
                                    <span>
                                        {order.totalAmount.toLocaleString()}₫
                                    </span>
                                </div>
                                <div className="summary-row">
                                    <span>Thêm:</span>
                                    <span className="add-amount">
                                        +{addItemsTotal.toLocaleString()}₫
                                    </span>
                                </div>
                                <div className="summary-divider"></div>
                                <div className="summary-row total">
                                    <strong>Tổng mới:</strong>
                                    <strong>
                                        {(
                                            order.totalAmount + addItemsTotal
                                        ).toLocaleString()}₫
                                    </strong>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="action-buttons">
                    <button
                        className="btn-confirm-add"
                        onClick={onConfirmAdd}
                        disabled={addItemsCart.length === 0}
                    >
                        ✅ Xác nhận thêm món
                    </button>
                    <button className="btn-cancel" onClick={onClose}>
                        ❌ Hủy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddItemsModal;