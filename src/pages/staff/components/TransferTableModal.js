import React, { useState } from 'react';

const TransferTableModal = ({
    order,
    tables,
    onClose,
    onTransfer
}) => {
    const [selectedNewTable, setSelectedNewTable] = useState(null);
    const [isTransferring, setIsTransferring] = useState(false);

    const availableTables = tables.filter(t =>
        t.status === 'FREE' && t.id !== order.table?.id
    );

    const handleConfirmTransfer = async () => {
        if (!selectedNewTable) {
            alert('⚠️ Vui lòng chọn bàn muốn chuyển đến!');
            return;
        }

        const confirmTransfer = window.confirm(
            `🔄 XÁC NHẬN CHUYỂN BÀN\n\n` +
            `Từ: Bàn ${order.table.number}\n` +
            `Đến: Bàn ${selectedNewTable.number}\n\n` +
            `Đơn hàng #${order.id} sẽ được chuyển sang bàn mới.\n` +
            `Bạn có chắc chắn muốn thực hiện?`
        );

        if (!confirmTransfer) return;

        setIsTransferring(true);
        try {
            await onTransfer(order.id, order.table.id, selectedNewTable.id);
            alert(
                `✅ CHUYỂN BÀN THÀNH CÔNG!\n\n` +
                `Đơn hàng #${order.id}\n` +
                `Từ: Bàn ${order.table.number}\n` +
                `Đến: Bàn ${selectedNewTable.number}`
            );
            onClose();
        } catch (error) {
            console.error('❌ Lỗi chuyển bàn:', error);
            alert('❌ Không thể chuyển bàn. Vui lòng thử lại!');
        } finally {
            setIsTransferring(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content transfer-table-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h4>🔄 Chuyển bàn</h4>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="transfer-info">
                    <div className="current-table-info">
                        <div className="info-label">Đơn hàng hiện tại:</div>
                        <div className="info-value">
                            <strong>#{order.id}</strong> - Bàn {order.table.number}
                        </div>
                    </div>

                    <div className="order-summary">
                        <div className="summary-row">
                            <span>Số món:</span>
                            <span>{order.items.length} món</span>
                        </div>
                        <div className="summary-row">
                            <span>Tổng tiền:</span>
                            <strong>{order.totalAmount.toLocaleString()}₫</strong>
                        </div>
                    </div>
                </div>

                <div className="transfer-arrow">
                    <div className="arrow-icon">⬇️</div>
                    <div className="arrow-text">Chọn bàn muốn chuyển đến</div>
                </div>

                {availableTables.length === 0 ? (
                    <div className="no-tables-available">
                        <div className="empty-icon">🚫</div>
                        <p>Không có bàn trống để chuyển</p>
                        <small>Tất cả các bàn khác đang được sử dụng hoặc đã đặt</small>
                    </div>
                ) : (
                    <div className="tables-grid">
                        {availableTables.map(table => (
                            <div
                                key={table.id}
                                className={`table-card ${selectedNewTable?.id === table.id ? 'selected' : ''}`}
                                onClick={() => setSelectedNewTable(table)}
                            >
                                <div className="table-number">Bàn {table.number}</div>
                                <div className="table-capacity">👥 {table.capacity} người</div>
                                <div className="table-status free">● Trống</div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="action-buttons">
                    <button
                        className="btn-confirm-transfer"
                        onClick={handleConfirmTransfer}
                        disabled={!selectedNewTable || isTransferring}
                    >
                        {isTransferring ? '⏳ Đang chuyển...' : '✅ Xác nhận chuyển bàn'}
                    </button>
                    <button
                        className="btn-cancel"
                        onClick={onClose}
                        disabled={isTransferring}
                    >
                        ❌ Hủy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransferTableModal;