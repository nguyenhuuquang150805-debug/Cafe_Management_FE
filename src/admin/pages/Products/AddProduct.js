import React, { useEffect, useState } from "react";
import "../../../assets/scss/admin.scss";
import apiService from "../../../api/apiService";

const AddProduct = ({ onClose, onAdded }) => {
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        categoryId: "",
        stockQuantity: 0,
    });
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await apiService.GET_ALL("categories");
                setCategories(res.data);
            } catch (err) {
                console.error("❌ Lỗi tải danh mục:", err);
            }
        };
        fetchCategories();
    }, []);

    // 🟢 Xử lý thay đổi input text/number/select
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // 🟢 Xử lý thay đổi ảnh (file)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    // 🟢 Xử lý submit form thêm sản phẩm
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name.trim() || !form.price || !form.categoryId) {
            alert("⚠️ Vui lòng điền đầy đủ thông tin!");
            return;
        }

        const data = new FormData();
        data.append("name", form.name);
        data.append("description", form.description);
        data.append("price", form.price);
        data.append("categoryId", form.categoryId);
        data.append("stockQuantity", form.stockQuantity);
        if (imageFile) data.append("imageFile", imageFile);

        try {
            await apiService.POST_ADD("products/upload", data);

            alert("✅ Thêm sản phẩm thành công!");
            setForm({
                name: "",
                description: "",
                price: "",
                categoryId: "",
                stockQuantity: 0,
            });
            setImageFile(null);
            setPreview(null);
            onAdded();
            onClose();
        } catch (error) {
            console.error("❌ Lỗi thêm sản phẩm:", error);
            if (error.response?.status === 403) {
                alert("⚠️ Không có quyền truy cập!");
            } else if (error.response?.status === 401) {
                alert("⚠️ Token hết hạn! Vui lòng đăng nhập lại.");
            } else {
                alert("❌ Lỗi khi thêm sản phẩm!");
            }
        }
    };

    return (
        <div className="admin-modal-backdrop">
            <div className="admin-modal">
                <h3>➕ Thêm sản phẩm mới</h3>
                <form onSubmit={handleSubmit} className="admin-form">
                    <label>Tên sản phẩm</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Nhập tên sản phẩm..."
                        required
                    />

                    <label>Mô tả</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Nhập mô tả chi tiết..."
                    />

                    <label>Giá (₫)</label>
                    <input
                        type="number"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        placeholder="Nhập giá..."
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
                            <img src={preview} alt="preview" />
                        </div>
                    )}

                    <label>Số lượng tồn kho</label>
                    <input
                        type="number"
                        name="stockQuantity"
                        value={form.stockQuantity}
                        onChange={handleChange}
                        placeholder="Nhập số lượng..."
                    />

                    <div className="form-buttons">
                        <button type="submit" className="btn btn-success">Lưu</button>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;
