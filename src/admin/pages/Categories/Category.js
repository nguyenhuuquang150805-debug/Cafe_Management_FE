import React, { useEffect, useState } from "react";
import apiService from "../../../api/apiService";
import AddCategory from "./AddCategory";
import EditCategory from "./EditCategory";
import "../../../assets/scss/category.scss";

const Category = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const fetchCategories = async () => {
        try {
            const res = await apiService.GET_ALL("categories");
            setCategories(res.data);
        } catch (error) {
            console.error("❌ Lỗi tải danh mục:", error);
            alert("Không thể tải danh mục!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa danh mục này không?")) {
            try {
                await apiService.DELETE_ID("categories", id);
                setCategories((prev) => prev.filter((c) => c.id !== id));
            } catch (error) {
                console.error("❌ Lỗi xóa danh mục:", error);
                alert("Không thể xóa danh mục!");
            }
        }
    };

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setShowEditForm(true);
    };

    if (loading) return <div className="loading">⏳ Đang tải danh mục...</div>;

    return (
        <div className="admin-categories">
            <div className="categories-header">
                <h2>📂 Quản lý Danh mục</h2>
                <button
                    className="btn btn-success btn-sm"
                    onClick={() => setShowAddForm(true)}
                >
                    + Thêm danh mục
                </button>
            </div>

            <table className="table table-striped table-bordered mt-3">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Hình ảnh</th>
                        <th>Tên danh mục</th>
                        <th>Mô tả</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.length > 0 ? (
                        categories.map((c) => (
                            <tr key={c.id}>
                                <td>{c.id}</td>
                                <td>
                                    <img
                                        src={apiService.GET_IMG(c.imageUrl)}
                                        alt={c.name}
                                        className="category-thumb"
                                        onError={(e) =>
                                            (e.target.src = "/fallback.jpg")
                                        }
                                    />
                                </td>
                                <td>{c.name}</td>
                                <td>{c.description}</td>
                                <td>
                                    <button
                                        className="btn btn-outline-primary btn-sm me-2"
                                        onClick={() => handleEdit(c)}
                                    >
                                        ✏️ Sửa
                                    </button>
                                    <button
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => handleDelete(c.id)}
                                    >
                                        🗑️ Xóa
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center text-muted">
                                Không có danh mục nào.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Form thêm */}
            {showAddForm && (
                <AddCategory
                    onClose={() => setShowAddForm(false)}
                    onSuccess={fetchCategories}
                />
            )}

            {/* Form sửa */}
            {showEditForm && selectedCategory && (
                <EditCategory
                    category={selectedCategory}
                    onClose={() => setShowEditForm(false)}
                    onSuccess={fetchCategories}
                />
            )}
        </div>
    );
};

export default Category;
