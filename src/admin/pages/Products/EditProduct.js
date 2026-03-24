import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../../assets/scss/admin.scss";
import apiService from "../../../api/apiService";

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        categoryId: "",
        stockQuantity: "",
    });
    const [categories, setCategories] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState("");
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) navigate("/admin/login");
    }, [token, navigate]);

    useEffect(() => {
        if (!token) return;

        const fetchProduct = async () => {
            try {
                const res = await apiService.GET_ID("products", id);
                const p = res.data;

                setForm({
                    name: p.name || "",
                    description: p.description || "",
                    price: p.price || "",
                    categoryId: p.category?.id || "",
                    stockQuantity: p.stockQuantity || "",
                });

                if (p.imageUrl) {
                    const isAbsolute = /^https?:\/\//i.test(p.imageUrl);
                    const fullUrl = isAbsolute
                        ? p.imageUrl
                        : apiService.GET_IMG(p.imageUrl);
                    setPreview(fullUrl);
                } else {
                    setPreview("");
                }
            } catch (err) {
                console.error("❌ Lỗi tải sản phẩm:", err);
                if (err?.response?.status === 401 || err?.response?.status === 403) {
                    localStorage.removeItem("token");
                    alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
                    navigate("/admin/login");
                }
            }
        };

        const fetchCategories = async () => {
            try {
                const res = await apiService.GET_ALL("categories");
                setCategories(res.data);
            } catch (err) {
                console.error("❌ Lỗi tải danh mục:", err);
            }
        };

        fetchProduct();
        fetchCategories();
    }, [id, token, navigate]);

    // 🟢 Xử lý thay đổi input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // 🟢 Xử lý chọn ảnh mới
    const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null;
        setImageFile(file);
        if (file) setPreview(URL.createObjectURL(file));
    };

    // 🟢 Gửi form cập nhật
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name?.trim() || !form.price || !form.categoryId) {
            alert("⚠️ Vui lòng điền đầy đủ thông tin!");
            return;
        }

        const data = new FormData();
        Object.entries(form).forEach(([k, v]) => data.append(k, v));
        if (imageFile) data.append("imageFile", imageFile);

        try {
            await apiService.PUT_EDIT(`products/${id}`, data);
            alert("✅ Cập nhật sản phẩm thành công!");
            navigate("/admin/products");
        } catch (err) {
            console.error("❌ Lỗi cập nhật:", err);
            if (err.response?.status === 403) {
                alert("⚠️ Không có quyền cập nhật!");
            } else if (err.response?.status === 401) {
                alert("⚠️ Token hết hạn! Vui lòng đăng nhập lại.");
            } else {
                alert("⚠️ Cập nhật thất bại!");
            }
        }
    };

    return (
        <div className="admin-edit-page">
            <h3>✏️ Sửa sản phẩm</h3>
            <form onSubmit={handleSubmit} className="admin-form">
                <label>Tên sản phẩm</label>
                <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                />

                <label>Mô tả</label>
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                />

                <label>Giá (₫)</label>
                <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    required
                />

                <label>Danh mục</label>
                <select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                    required
                >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>

                <label>Ảnh sản phẩm</label>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {preview && (
                    <div className="image-preview">
                        <p>Ảnh hiện tại:</p>
                        <img
                            src={preview}
                            alt="preview"
                            className="preview-img"
                            onError={(e) => (e.target.src = "/fallback.jpg")}
                        />
                    </div>
                )}

                <label>Số lượng tồn kho</label>
                <input
                    type="number"
                    name="stockQuantity"
                    value={form.stockQuantity}
                    onChange={handleChange}
                />

                <div className="form-buttons">
                    <button type="submit" className="btn btn-success">
                        Lưu thay đổi
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate("/admin/products")}
                    >
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProduct;
