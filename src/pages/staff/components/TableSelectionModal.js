import React from 'react';

const TableSelectionModal = ({ tables, selectedTable, onClose, onSelectTable }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h4>🪑 Chọn bàn</h4>
                    <button className="close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className="table-grid">
                    {tables.map((table) => (
                        <div
                            key={table.id}
                            className={`table-card ${table.status.toLowerCase()} ${selectedTable?.id === table.id ? 'selected' : ''
                                }`}
                            onClick={() => onSelectTable(table)}
                        >
                            <div className="table-number">Bàn {table.number}</div>
                            <div className="table-capacity">👥 {table.capacity}</div>
                            <div className="table-status">
                                {table.status === 'FREE'
                                    ? '✓ Trống'
                                    : table.status === 'OCCUPIED'
                                        ? '✗ Có khách'
                                        : '⏱ Đã đặt'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TableSelectionModal;