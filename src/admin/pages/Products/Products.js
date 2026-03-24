import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../assets/scss/admin.scss";
import AddProduct from "./AddProduct";
import apiService from "../../../api/apiService";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const navigate = useNavigate();

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await apiService.GET_ALL("products");
            setProducts(response.data);
        } catch (error) {
            console.error("❌ Lỗi tải dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa món này không?")) {
            try {
                await apiService.DELETE_ID("products", id);
                setProducts((prev) => prev.filter((p) => p.id !== id));
            } catch (error) {
                console.error("❌ Lỗi xóa sản phẩm:", error);
            }
        }
    };

    const handleEdit = (id) => {
        navigate(`/admin/edit-product/${id}`);
    };

    if (loading) return <p>Đang tải dữ liệu...</p>;

    return (
        <div className="admin-products">
            <div className="products-header">
                <h2>🍽 Quản lý Menu</h2>
                <button
                    className="btn btn-success btn-sm"
                    onClick={() => setShowAddModal(true)}
                >
                    + Thêm món
                </button>
            </div>

            <div className="products-grid">
                {products.map((p) => (
                    <div key={p.id} className="product-card shadow-sm">
                        <img
                            src={apiService.GET_IMG(p.imageUrl)}
                            alt={p.name}
                            className="product-img"
                            onError={(e) => (e.target.src = "/fallback.jpg")}
                        />

                        <div className="product-info">
                            <h5>{p.name}</h5>
                            <p className="text-muted small">{p.category?.name}</p>
                            <p className="fw-bold text-primary">
                                {p.price.toLocaleString()} ₫
                            </p>
                            <p className="small text-secondary">{p.description}</p>
                        </div>

                        <div className="product-actions">
                            <button
                                className="btn btn-outline-primary btn-sm me-2"
                                onClick={() => handleEdit(p.id)}
                            >
                                ✏️ Sửa
                            </button>
                            <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDelete(p.id)}
                            >
                                🗑️ Xóa
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal thêm sản phẩm */}
            {showAddModal && (
                <AddProduct
                    onClose={() => setShowAddModal(false)}
                    onAdded={loadProducts}
                />
            )}
        </div>
    );
};

export default Products;
