import React, { useState, useEffect } from "react";
import apiService from "../../../api/apiService";
import "../../../assets/scss/category.scss";

const EditCategory = ({ category, onClose, onSuccess }) => {
    const [form, setForm] = useState({
        id: "",
        name: "",
        description: "",
    });
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);

    // 🟢 Khi mở modal — load thông tin danh mục
    useEffect(() => {
        if (category) {
            setForm({
                id: category.id,
                name: category.name || "",
                description: category.description || "",
            });

            // ✅ Hiển thị ảnh cũ nếu có
            if (category.imageUrl) {
                const isAbsolute = /^https?:\/\//i.test(category.imageUrl);
                const fullUrl = isAbsolute
                    ? category.imageUrl
                    : apiService.GET_IMG(category.imageUrl);
                setPreview(fullUrl);
            } else {
                setPreview(null);
            }
        }
    }, [category]);

    // 🟢 Xử lý thay đổi input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // 🟢 Xử lý khi chọn ảnh mới
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        setImageFile(file);

        if (file) {
            setPreview(URL.createObjectURL(file)); // Xem trước ảnh mới
        } else if (category?.imageUrl) {
            const fullUrl = apiService.GET_IMG(category.imageUrl);
            setPreview(fullUrl); // Giữ lại ảnh cũ
        } else {
            setPreview(null);
        }
    };

    // 🟢 Gửi form cập nhật danh mục
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
            await apiService.PUT_EDIT(`categories/${form.id}`, data);
            alert("✅ Cập nhật danh mục thành công!");
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("❌ Lỗi cập nhật danh mục:", error);
            alert("❌ Không thể cập nhật danh mục!");
        }
    };

    return (
        <div className="admin-modal-backdrop">
            <div className="admin-modal">
                <h3>✏️ Sửa danh mục</h3>

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

                    {/* ✅ Ảnh xem trước (mới hoặc cũ) */}
                    {preview && (
                        <div className="image-preview">
                            <img
                                src={preview}
                                alt="preview"
                                onError={(e) => (e.target.src = "/fallback.jpg")}
                            />
                        </div>
                    )}

                    <div className="form-buttons">
                        <button type="submit" className="btn btn-success">
                            Lưu thay đổi
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

export default EditCategory;
