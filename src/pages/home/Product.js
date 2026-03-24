import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function Product() {
    const [activeTab, setActiveTab] = useState(null);
    const [cart, setCart] = useState({});
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cateRes, prodRes] = await Promise.all([
                    axios.get("http://localhost:8080/api/categories"),
                    axios.get("http://localhost:8080/api/products"),
                ]);
                setCategories(cateRes.data);
                setProducts(prodRes.data);
                if (cateRes.data.length > 0) setActiveTab(cateRes.data[0].id);
            } catch (err) {
                console.error("❌ Lỗi tải dữ liệu:", err);
            }
        };
        fetchData();
    }, []);

    const addToCart = (product) => {
        setCart((prev) => ({
            ...prev,
            [product.id]: (prev[product.id] || 0) + 1,
        }));
    };

    const getImageUrl = (imageName) => {
        if (!imageName) return "/fallback.jpg";
        return `http://localhost:8080/uploads/${imageName}`;
    };

    const renderProductCard = (product) => {
        const inCart = cart[product.id] || 0;
        return (
            <div key={product.id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                <div
                    className="card h-100 border-0 shadow-sm"
                    style={{
                        backgroundColor: "#2a2a2a",
                        borderRadius: "15px",
                        overflow: "hidden",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-10px)";
                        e.currentTarget.style.boxShadow =
                            "0 10px 30px rgba(196, 155, 99, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                            "0 4px 6px rgba(0,0,0,0.1)";
                    }}
                >
                    <div style={{ position: "relative", overflow: "hidden" }}>
                        <img
                            src={getImageUrl(product.imageUrl)}
                            alt={product.name}
                            className="card-img-top"
                            style={{
                                height: "220px",
                                objectFit: "cover",
                                transition: "transform 0.3s ease",
                            }}
                            onError={(e) => (e.target.src = "/fallback.jpg")}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.transform = "scale(1.1)")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.transform = "scale(1)")
                            }
                        />
                        {inCart > 0 && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "10px",
                                    right: "10px",
                                    backgroundColor: "#c49b63",
                                    color: "#000",
                                    borderRadius: "50%",
                                    width: "35px",
                                    height: "35px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "bold",
                                    fontSize: "14px",
                                }}
                            >
                                {inCart}
                            </div>
                        )}
                    </div>
                    <div
                        className="card-body d-flex flex-column"
                        style={{ padding: "20px" }}
                    >
                        <h5
                            className="card-title mb-2"
                            style={{
                                color: "#fff",
                                fontWeight: "600",
                                fontSize: "18px",
                            }}
                        >
                            {product.name}
                        </h5>
                        <p
                            className="card-text small mb-3"
                            style={{
                                color: "rgba(255,255,255,0.6)",
                                flex: 1,
                            }}
                        >
                            {product.description}
                        </p>
                        <div className="d-flex justify-content-between align-items-center mt-auto">
                            <span
                                style={{
                                    color: "#c49b63",
                                    fontSize: "20px",
                                    fontWeight: "bold",
                                }}
                            >
                                {product.price.toLocaleString()}₫
                            </span>
                            <button
                                className="btn btn-sm px-3"
                                onClick={() => addToCart(product)}
                                style={{
                                    backgroundColor: "#c49b63",
                                    color: "#000",
                                    border: "none",
                                    borderRadius: "20px",
                                    fontWeight: "600",
                                    transition: "all 0.3s ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        "#d4a574";
                                    e.currentTarget.style.transform =
                                        "scale(1.05)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        "#c49b63";
                                    e.currentTarget.style.transform =
                                        "scale(1)";
                                }}
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section
            className="ftco-menu py-5"
            style={{
                backgroundColor: "#1a1a1a",
                minHeight: "100vh",
                paddingTop: "120px",
            }}
        >
            <div className="container">
                {/* Tiêu đề */}
                <div className="row mb-5">
                    <div className="col-12 text-center">
                        <h2
                            className="display-4 fw-bold mb-3"
                            style={{ color: "#fff" }}
                        >
                            Thực đơn
                        </h2>
                        <p
                            className="lead"
                            style={{ color: "rgba(255,255,255,0.7)" }}
                        >
                            Hãy chọn món bạn yêu thích
                        </p>
                        <div
                            style={{
                                width: "80px",
                                height: "3px",
                                backgroundColor: "#c49b63",
                                margin: "20px auto",
                            }}
                        ></div>
                    </div>
                </div>

                {/* Tabs danh mục */}
                <div className="row mb-5">
                    <div className="col-12">
                        <div className="d-flex justify-content-center flex-wrap gap-3">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    className={`btn btn-lg px-4 py-2 ${activeTab === cat.id ? "active" : ""
                                        }`}
                                    onClick={() => setActiveTab(cat.id)}
                                    style={{
                                        backgroundColor:
                                            activeTab === cat.id
                                                ? "#c49b63"
                                                : "transparent",
                                        color:
                                            activeTab === cat.id
                                                ? "#000"
                                                : "#fff",
                                        border:
                                            activeTab === cat.id
                                                ? "none"
                                                : "2px solid rgba(255,255,255,0.2)",
                                        borderRadius: "30px",
                                        fontWeight: "600",
                                        transition: "all 0.3s ease",
                                        minWidth: "150px",
                                    }}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Danh sách sản phẩm */}
                <div className="row">
                    {products
                        .filter((p) => p.category?.id === activeTab)
                        .map((product) => renderProductCard(product))}
                </div>

                {/* Giỏ hàng */}
                {Object.keys(cart).length > 0 && (
                    <div
                        className="position-fixed bottom-0 end-0 m-4 p-3 shadow-lg"
                        style={{
                            backgroundColor: "#2a2a2a",
                            borderRadius: "15px",
                            border: "2px solid #c49b63",
                            minWidth: "200px",
                            zIndex: 1000,
                        }}
                    >
                        <h6 className="text-white mb-2">Cart Summary</h6>
                        <p className="text-warning mb-0">
                            Items:{" "}
                            {Object.values(cart).reduce((a, b) => a + b, 0)}
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}

export default Product;
