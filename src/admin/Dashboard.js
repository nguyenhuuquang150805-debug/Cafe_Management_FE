import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Statistics from "./pages/Statistics";
import "../assets/scss/admin.scss";
import Products from "./pages/Products/Products";
import Category from "./pages/Categories/Category";
import EditProduct from "./pages/Products/EditProduct";
import Tables from "./pages/tables/Tables";
import Orders from "./pages/Orders/orders";
import Promotion from "./pages/promotion/Promotion";
import Users from "./pages/Users/Users";
import AddUser from "./pages/Users/AddUser";
import EditUser from "./pages/Users/EditUser";

function Dashboard() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/admin/login");
        }
    }, [navigate]);

    return (
        <div className="admin-dashboard">
            <Sidebar />
            <div className="admin-content">
                <Topbar />
                <Routes>
                    <Route path="/" element={<Statistics />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/statistics" element={<Statistics />} />
                    <Route path="/categories" element={<Category />} />
                    <Route path="/tables" element={<Tables />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/promotions" element={<Promotion />} />

                    <Route path="/users" element={<Users />} />
                    <Route path="/add-user" element={<AddUser />} />
                    <Route path="/edit-user/:id" element={<EditUser />} />
                    <Route path="/edit-product/:id" element={<EditProduct />} />

                </Routes>
            </div>
        </div>
    );
}

export default Dashboard;
