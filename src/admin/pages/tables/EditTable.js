import React, { useState } from "react";
import "../../../assets/scss/admin.scss";
import apiService from "../../../api/apiService";

const EditTable = ({ table, onClose, onUpdated }) => {
    const [number, setNumber] = useState(table.number);
    const [capacity, setCapacity] = useState(table.capacity);
    const [status, setStatus] = useState(table.status);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const updatedTable = {
                ...table,
                number: Number(number),
                capacity: Number(capacity),
                status,
            };
            await apiService.PUT_EDIT(`tables/${table.id}`, updatedTable);
            onUpdated?.();
            onClose?.();
        } catch (err) {
            console.error("❌ Lỗi cập nhật bàn:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content add-table">
                <h4>✏️ Cập nhật bàn</h4>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Số bàn</label>
                        <input
                            type="number"
                            className="form-control"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Sức chứa</label>
                        <input
                            type="number"
                            className="form-control"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Trạng thái</label>
                        <select
                            className="form-control"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="FREE">🪑 Trống</option>
                            <option value="OCCUPIED">🧍‍♂️ Có khách</option>
                            <option value="RESERVED">📅 Đặt trước</option>
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            ❌ Hủy
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? "💾 Đang lưu..." : "✅ Cập nhật"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTable;
