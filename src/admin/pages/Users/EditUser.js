import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../../assets/scss/admin.scss";
import { apiService } from "../../../api/apiService";

const EditUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: "",
        fullName: "",
        email: "",
        phone: "",
        role: "",
        isActive: true,
    });
    const [roles] = useState(["ADMIN", "EMPLOYEE", "STAFF"]);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState("");
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) navigate("/admin/login");
    }, [token, navigate]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await apiService.GET_ID("users", id);
                const u = res.data;

                setForm({
                    username: u.username || "",
                    fullName: u.fullName || "",
                    email: u.email || "",
                    phone: u.phone || "",
                    role: u.role || "",
                    isActive: u.isActive ?? true,
                });

                if (u.imageUrl) {
                    const isAbsolute = /^https?:\/\//i.test(u.imageUrl);
                    const fullUrl = isAbsolute
                        ? u.imageUrl
                        : `http://localhost:8080/uploads/${u.imageUrl}`;
                    setPreview(fullUrl);
                }
            } catch (err) {
                console.error("❌ Lỗi tải người dùng:", err);
            }
        };

        fetchUser();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null;
        setImageFile(file);
        if (file) setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.username.trim() || !form.fullName.trim() || !form.role) {
            alert("⚠️ Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        const data = new FormData();
        Object.entries(form).forEach(([k, v]) => data.append(k, v));
        if (imageFile) data.append("avatarFile", imageFile);

        try {
            await apiService.PUT_EDIT(`users/${id}`, data);
            alert("✅ Cập nhật nhân viên thành công!");
            navigate("/admin/users");
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
            <h3>✏️ Sửa nhân viên</h3>
            <form onSubmit={handleSubmit} className="admin-form">
                <label>Tên đăng nhập</label>
                <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                />

                <label>Họ tên</label>
                <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                />

                <label>Email</label>
                <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                />

                <label>Số điện thoại</label>
                <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
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

                <label>Ảnh đại diện</label>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {preview && (
                    <div className="image-preview">
                        <img src={preview} alt="preview" className="preview-img" />
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
                    <button type="submit" className="btn btn-success">
                        Lưu thay đổi
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate("/admin/users")}
                    >
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditUser;
