import React, { useState, useEffect } from "react";
import "../../../assets/scss/admin.scss";
import { apiService } from "../../../api/apiService";

const AddUser = ({ onClose, onAdded }) => {
    const [roles, setRoles] = useState([]);
    const [form, setForm] = useState({
        username: "",
        fullName: "",
        email: "",
        phone: "",
        role: "",
        password: "",
        isActive: true,
    });
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);

    // 🟢 Dùng enum Role trực tiếp thay vì gọi API
    useEffect(() => {
        const roleOptions = ["ADMIN", "EMPLOYEE", "STAFF"];
        setRoles(roleOptions);
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.username.trim() || !form.fullName.trim() || !form.role || !form.password) {
            alert("⚠️ Vui lòng điền đầy đủ thông tin!");
            return;
        }

        const data = new FormData();
        Object.entries(form).forEach(([k, v]) => data.append(k, v));
        if (imageFile) data.append("avatarFile", imageFile);

        try {
            await apiService.POST_ADD("users/upload", data);
            alert("✅ Thêm nhân viên thành công!");
            setForm({
                username: "",
                fullName: "",
                email: "",
                phone: "",
                role: "",
                password: "",
                isActive: true,
            });
            setImageFile(null);
            setPreview(null);
            onAdded();
            onClose();
        } catch (error) {
            console.error("❌ Lỗi thêm nhân viên:", error);
            if (error.response?.status === 403) {
                alert("⚠️ Không có quyền truy cập!");
            } else if (error.response?.status === 401) {
                alert("⚠️ Token hết hạn! Vui lòng đăng nhập lại.");
            } else {
                alert("❌ Lỗi khi thêm nhân viên!");
            }
        }
    };

    return (
        <div className="admin-modal-backdrop">
            <div className="admin-modal">
                <h3>➕ Thêm nhân viên mới</h3>
                <form onSubmit={handleSubmit} className="admin-form">
                    <label>Tên đăng nhập</label>
                    <input
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="Nhập tên đăng nhập..."
                        required
                    />

                    <label>Họ tên</label>
                    <input
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="Nhập họ tên..."
                        required
                    />

                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Nhập email..."
                    />

                    <label>Số điện thoại</label>
                    <input
                        type="text"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Nhập số điện thoại..."
                    />

                    <label>Vai trò</label>
                    <select name="role" value={form.role} onChange={handleChange} required>
                        <option value="">-- Chọn vai trò --</option>
                        {roles.map((r) => (
                            <option key={r} value={r}>
                                {r}
                            </option>
                        ))}
                    </select>

                    <label>Mật khẩu</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Nhập mật khẩu..."
                        required
                    />

                    <label>Ảnh đại diện</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                    {preview && (
                        <div className="image-preview">
                            <img src={preview} alt="preview" />
                        </div>
                    )}

                    <label>
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={form.isActive}
                            onChange={handleChange}
                        />{" "}
                        Hoạt động
                    </label>

                    <div className="form-buttons">
                        <button type="submit" className="btn btn-success">Lưu</button>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUser;
