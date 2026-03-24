import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IonIcon } from "@ionic/react";
import { personOutline, lockClosedOutline, eyeOutline, eyeOffOutline } from "ionicons/icons";
import { apiService } from "../api/apiService";
import "../assets/scss/login.scss";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // ⚠️ Kiểm tra trước khi gửi API
        if (!username.trim() && !password.trim()) {
            setError("Vui lòng nhập tên đăng nhập và mật khẩu!");
            return;
        } else if (!username.trim()) {
            setError("Vui lòng nhập tên đăng nhập!");
            return;
        } else if (!password.trim()) {
            setError("Vui lòng nhập mật khẩu!");
            return;
        }

        setIsLoading(true);

        try {
            const res = await apiService.LOGIN(username, password);
            const token = res.data.token;

            // ✅ Lưu token và user data vào localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            const payload = JSON.parse(atob(token.split(".")[1]));
            const role = payload.role;

            console.log("✅ Đăng nhập thành công:", { username, role });

            // ✅ Chuyển trang theo role
            setTimeout(() => {
                if (role === "ADMIN") {
                    navigate("/admin");
                } else if (role === "STAFF") {
                    navigate("/staff");
                } else {
                    navigate("/");
                }
            }, 500);
        } catch (err) {
            console.error("❌ Đăng nhập thất bại:", err);
            // ⚠️ Thông báo lỗi đăng nhập không đúng
            if (err.response?.status === 401) {
                setError("Tên đăng nhập hoặc mật khẩu không đúng!");
            } else if (err.response?.status === 403) {
                setError("Tài khoản đã bị vô hiệu hóa!");
            } else {
                setError("Đăng nhập thất bại! Vui lòng thử lại.");
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Logo Section */}
                <div className="login-header">
                    <div className="cafe-header__brand" role="presentation">
                        <img
                            src={`/logo_shopcf.png`}
                            alt="Light Coffee Logo"
                            className="cafe-logo"
                        />
                    </div>
                    <p className="login-subtitle">Hệ thống quản lý cafe</p>
                </div>

                {/* Login Form */}
                <form
                    id="loginForm"
                    name="loginForm"
                    className="login-form"
                    onSubmit={handleSubmit}
                    data-testid="login-form"
                >
                    <h2 className="form-title">Đăng nhập</h2>

                    {error && (
                        <div className="login-error">
                            <span>⚠️</span>
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Username Input */}
                    <div className="input-group">
                        <div className="input-icon">
                            <IonIcon icon={personOutline} />
                        </div>
                        <input
                            id="username"
                            name="username"
                            data-testid="login-username"
                            type="text"
                            placeholder="Tên đăng nhập"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Password Input */}
                    <div className="input-group">
                        <div className="input-icon">
                            <IonIcon icon={lockClosedOutline} />
                        </div>
                        <input
                            id="password"
                            name="password"
                            data-testid="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            id="togglePassword"
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                            data-testid="toggle-password"
                        >
                            <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} />
                        </button>
                    </div>

                    {/* Submit Button */}
                    <button
                        id="btnLogin"
                        name="btnLogin"
                        type="submit"
                        className="login-btn"
                        disabled={isLoading}
                        data-testid="login-button"
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner"></span>
                                <span>Đang đăng nhập...</span>
                            </>
                        ) : (
                            "Đăng nhập"
                        )}
                    </button>

                    {/* Register Link */}
                    <div className="form-footer">
                        <p>
                            Chưa có tài khoản?{" "}
                            <Link to="/register" className="register-link">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>
                </form>

                {/* Footer */}
                <div className="login-footer">
                    <p>© 2025 Light Coffee. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}

export default Login;