import React, { useState, useEffect } from "react";
import apiService from "../../../api/apiService";

const EditPromotion = ({ promotion, onClose, onSuccess }) => {
    const [form, setForm] = useState({
        id: promotion.id,
        name: promotion.name || "",
        discountPercentage: promotion.discountPercentage || "",
        discountAmount: promotion.discountAmount || "",
        startDate: promotion.startDate || "",
        endDate: promotion.endDate || "",
        isActive: !!promotion.isActive,
        productIds: promotion.products ? promotion.products.map(p => p.id) : []
    });

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await apiService.GET_ALL("products");
            setProducts(res.data || res);
        } catch (error) {
            console.error("❌ Lỗi tải sản phẩm:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    };

    const toggleProduct = (productId) => {
        setForm(prev => ({
            ...prev,
            productIds: prev.productIds.includes(productId)
                ? prev.productIds.filter(id => id !== productId)
                : [...prev.productIds, productId]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!form.name.trim()) {
            alert("⚠️ Vui lòng nhập tên khuyến mãi!");
            return;
        }

        if (!form.startDate || !form.endDate) {
            alert("⚠️ Vui lòng chọn ngày bắt đầu và kết thúc!");
            return;
        }

        if (new Date(form.startDate) > new Date(form.endDate)) {
            alert("⚠️ Ngày bắt đầu phải trước ngày kết thúc!");
            return;
        }

        try {
            console.log("📤 Đang gửi data:", form);

            const response = await apiService.PUT_EDIT(`promotions/${form.id}`, {
                id: form.id,
                name: form.name,
                discountPercentage: parseFloat(form.discountPercentage) || 0,
                discountAmount: parseFloat(form.discountAmount) || 0,
                startDate: form.startDate,
                endDate: form.endDate,
                isActive: form.isActive,
                productIds: form.productIds
            });

            console.log("✅ Response:", response);
            alert("✅ Cập nhật khuyến mãi thành công!");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("❌ Lỗi cập nhật khuyến mãi:", error);
            alert("❌ Không thể cập nhật khuyến mãi! " + (error.message || ""));
        }
    };

    return (
        <div className="admin-modal-backdrop" onClick={onClose}>
            <div className="admin-modal promotion-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>✏️ Chỉnh sửa khuyến mãi</h3>
                </div>

                <form className="admin-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tên khuyến mãi *</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Ví dụ: Giảm giá mùa hè"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Giảm theo % (0-100)</label>
                            <input
                                type="number"
                                name="discountPercentage"
                                placeholder="10"
                                min="0"
                                max="100"
                                step="0.01"
                                value={form.discountPercentage}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Giảm theo số tiền (VNĐ)</label>
                            <input
                                type="number"
                                name="discountAmount"
                                placeholder="5000"
                                min="0"
                                step="1000"
                                value={form.discountAmount}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Ngày bắt đầu *</label>
                            <input
                                type="date"
                                name="startDate"
                                value={form.startDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Ngày kết thúc *</label>
                            <input
                                type="date"
                                name="endDate"
                                value={form.endDate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Chọn sản phẩm áp dụng</label>
                        {loading ? (
                            <div className="loading-products">⏳ Đang tải sản phẩm...</div>
                        ) : (
                            <div className="products-selection-grid">
                                {products.map((product) => (
                                    <div
                                        key={product.id}
                                        className={`product-card ${form.productIds.includes(product.id) ? 'selected' : ''}`}
                                        onClick={() => toggleProduct(product.id)}
                                    >
                                        <div className="product-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={form.productIds.includes(product.id)}
                                                onChange={() => { }}
                                            />
                                        </div>
                                        <div className="product-image">
                                            <img
                                                src={`http://localhost:8080/uploads/${product.imageUrl}`}
                                                alt={product.name}
                                                onError={(e) => {
                                                    e.target.src = '/placeholder.jpg';
                                                }}
                                            />
                                        </div>
                                        <div className="product-info">
                                            <h4>{product.name}</h4>
                                            <p className="product-category">
                                                {product.category?.name || 'Chưa phân loại'}
                                            </p>
                                            <p className="product-price">
                                                {product.price?.toLocaleString()}₫
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <small className="form-hint">
                            ✅ Đã chọn: {form.productIds.length} sản phẩm
                        </small>
                    </div>

                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={!!form.isActive}
                                onChange={handleChange}
                            />
                            <span>Đang hoạt động</span>
                        </label>
                    </div>

                    <div className="form-buttons">
                        <button type="submit" className="btn btn-success">
                            💾 Cập nhật
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            ✕ Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPromotion;