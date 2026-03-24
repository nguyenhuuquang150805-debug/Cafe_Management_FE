import React, { useState, useEffect } from "react";
import "../../../assets/scss/admin.scss";
import { apiService } from "../../../api/apiService";
import AddTable from "./AddTable"; // 🟢 Thêm dòng này
import EditTable from "./EditTable";

const Tables = () => {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);

    // 🟢 Tải danh sách bàn
    const loadTables = async () => {
        try {
            setLoading(true);
            const res = await apiService.GET_ALL("tables");
            setTables(res.data);
        } catch (err) {
            console.error("❌ Lỗi tải danh sách bàn:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTables();
    }, []);

    // 🗑️ Xóa bàn
    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa bàn này không?")) {
            try {
                await apiService.DELETE_ID("tables", id);
                setTables((prev) => prev.filter((t) => t.id !== id));
            } catch (err) {
                console.error("❌ Lỗi khi xóa bàn:", err);
            }
        }
    };

    if (loading) return <p>Đang tải danh sách bàn...</p>;

    return (
        <div className="admin-tables">
            <div className="tables-header">
                <h2>🪑 Quản lý Bàn</h2>
                <button
                    className="btn btn-success btn-sm"
                    onClick={() => setShowAddModal(true)}
                >
                    + Thêm bàn
                </button>
            </div>

            <div className="tables-grid">
                {tables.map((t) => (
                    <div
                        key={t.id}
                        className={`table-card shadow-sm ${t.status === "OCCUPIED" ? "table-occupied" : "table-free"
                            }`}
                    >
                        <div className="table-info">
                            <h5>Bàn {t.number}</h5>
                            <p className="text-muted">Sức chứa: {t.capacity} người</p>
                            <p
                                className={`fw-bold ${t.status === "OCCUPIED"
                                    ? "text-danger"
                                    : "text-success"
                                    }`}
                            >
                                {t.status === "OCCUPIED"
                                    ? "🧍‍♂️ Đang có khách"
                                    : "🪑 Trống"}
                            </p>
                            <p className="small text-secondary">
                                Cập nhật: {new Date(t.updatedAt).toLocaleString()}
                            </p>
                        </div>

                        <div className="table-actions">
                            <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => {
                                    setSelectedTable(t);
                                    setShowEditModal(true);
                                }}
                            >
                                ✏️ Sửa
                            </button>

                            <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDelete(t.id)}
                            >
                                🗑️ Xóa
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 🟢 Modal thêm bàn */}
            {showAddModal && (
                <AddTable
                    onClose={() => setShowAddModal(false)}
                    onAdded={loadTables}
                />
            )}

            {showEditModal && selectedTable && (
                <EditTable
                    table={selectedTable}
                    onClose={() => setShowEditModal(false)}
                    onUpdated={loadTables}
                />
            )}
        </div>
    );
};

export default Tables;
