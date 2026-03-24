import React, { useState } from "react";
import "../../../assets/scss/admin.scss";
import apiService from "../../../api/apiService";

const AddTable = ({ onClose, onAdded }) => {
    const [number, setNumber] = useState("");
    const [capacity, setCapacity] = useState("");
    const [status, setStatus] = useState("FREE");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const newTable = {
                number: Number(number),
                capacity: Number(capacity),
                status,
            };
            await apiService.POST_ADD("tables", newTable);
            onAdded?.();
            onClose?.();
        } catch (err) {
            console.error("❌ Lỗi thêm bàn:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content add-table">
                <h4>➕ Thêm bàn mới</h4>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Số bàn</label>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Nhập số bàn..."
                            min="1"
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
                            placeholder="Nhập số chỗ ngồi..."
                            min="1"
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
                            {loading ? "💾 Đang lưu..." : "✅ Lưu"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTable;
