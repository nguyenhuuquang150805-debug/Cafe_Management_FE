import React, { useState } from "react";
import apiService from "../../../api/apiService";
import "../../../assets/scss/category.scss";

const AddCategory = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState({
        name: "",
        description: "",
    });
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // 🟢 Xử lý chọn ảnh
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        setImageFile(file);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    // 🚀 Gửi dữ liệu thêm danh mục
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name.trim()) {
            alert("⚠️ Vui lòng nhập tên danh mục!");
            return;
        }

        const data = new FormData();
        data.append("name", form.name);
        data.append("description", form.description);
        if (imageFile) data.append("imageFile", imageFile);

        try {
            await apiService.POST_ADD("categories/upload", data);

            alert("✅ Thêm danh mục thành công!");
            setForm({ name: "", description: "" });
            setImageFile(null);
            setPreview(null);

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("❌ Lỗi thêm danh mục:", error);

            if (error.response?.status === 403) {
                alert("⚠️ Bạn không có quyền thêm danh mục!");
            } else if (error.response?.status === 401) {
                alert("⚠️ Token hết hạn! Vui lòng đăng nhập lại.");
            } else {
                alert("❌ Lỗi khi thêm danh mục!");
            }
        }
    };

    return (
        <div className="admin-modal-backdrop">
            <div className="admin-modal">
                <h3>➕ Thêm danh mục mới</h3>

                <form className="admin-form" onSubmit={handleSubmit}>
                    <label>Tên danh mục</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Nhập tên danh mục..."
                        required
                    />

                    <label>Mô tả</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Nhập mô tả chi tiết..."
                    />

                    <label>Ảnh danh mục</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    {preview && (
                        <div className="image-preview">
                            <img src={preview} alt="preview" />
                        </div>
                    )}

                    <div className="form-buttons">
                        <button type="submit" className="btn btn-success">
                            Lưu
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCategory;
