import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IonIcon } from "@ionic/react";
import {
    personOutline,
    lockClosedOutline,
    eyeOutline,
    eyeOffOutline,
    mailOutline,
    callOutline,
    checkmarkCircleOutline
} from "ionicons/icons";
import { apiService } from "../api/apiService";
import "../assets/scss/register.scss";

function Register() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        phone: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(""); // Clear error when user types
    };

    const validateForm = () => {
        // Check empty fields
        if (!formData.email.trim()) {
            setError("Vui lòng nhập email!");
            return false;
        }
        if (!formData.password.trim()) {
            setError("Vui lòng nhập mật khẩu!");
            return false;
        }
        if (!formData.confirmPassword.trim()) {
            setError("Vui lòng xác nhận mật khẩu!");
            return false;
        }
        if (!formData.fullName.trim()) {
            setError("Vui lòng nhập họ và tên!");
            return false;
        }
        if (!formData.phone.trim()) {
            setError("Vui lòng nhập số điện thoại!");
            return false;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError("Email không hợp lệ!");
            return false;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự!");
            return false;
        }

        // Validate password match
        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp!");
            return false;
        }

        // Validate phone format (Vietnamese phone number)
        const phoneRegex = /^(0|\+84)[0-9]{9}$/;
        if (!phoneRegex.test(formData.phone)) {
            setError("Số điện thoại không hợp lệ!");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const registerData = {
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName,
                phone: formData.phone
            };

            const response = await apiService.POST_ADD("auth/register", registerData);

            console.log("✅ Đăng ký thành công:", response.data);

            setSuccess("Đăng ký thành công! Đang chuyển đến trang đăng nhập...");

            // Reset form
            setFormData({
                email: "",
                password: "",
                confirmPassword: "",
                fullName: "",
                phone: ""
            });

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (err) {
            console.error("❌ Đăng ký thất bại:", err);

            if (err.response?.status === 409) {
                setError("Email đã được sử dụng!");
            } else if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError("Đăng ký thất bại! Vui lòng thử lại.");
            }

            setIsLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                {/* Logo Section */}
                <div className="register-header">
                    <div className="cafe-header__brand" role="presentation">
                        <img
                            src={`/logo_shopcf.png`}
                            alt="Light Coffee Logo"
                            className="cafe-logo"
                        />
                    </div>
                    <p className="register-subtitle">Hệ thống quản lý cafe</p>
                </div>

                {/* Register Form */}
                <form
                    id="registerForm"
                    name="registerForm"
                    className="register-form"
                    onSubmit={handleSubmit}
                    data-testid="register-form"
                >
                    <h2 className="form-title">Đăng ký tài khoản</h2>

                    {error && (
                        <div className="register-error">
                            <span>⚠️</span>
                            <p>{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="register-success">
                            <IonIcon icon={checkmarkCircleOutline} />
                            <p>{success}</p>
                        </div>
                    )}

                    {/* Full Name Input */}
                    <div className="input-group">
                        <div className="input-icon">
                            <IonIcon icon={personOutline} />
                        </div>
                        <input
                            id="fullName"
                            name="fullName"
                            data-testid="register-fullname"
                            type="text"
                            placeholder="Họ và tên"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Email Input */}
                    <div className="input-group">
                        <div className="input-icon">
                            <IonIcon icon={mailOutline} />
                        </div>
                        <input
                            id="email"
                            name="email"
                            data-testid="register-email"
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Phone Input */}
                    <div className="input-group">
                        <div className="input-icon">
                            <IonIcon icon={callOutline} />
                        </div>
                        <input
                            id="phone"
                            name="phone"
                            data-testid="register-phone"
                            type="tel"
                            placeholder="Số điện thoại"
                            value={formData.phone}
                            onChange={handleInputChange}
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
                            data-testid="register-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                            value={formData.password}
                            onChange={handleInputChange}
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

                    {/* Confirm Password Input */}
                    <div className="input-group">
                        <div className="input-icon">
                            <IonIcon icon={lockClosedOutline} />
                        </div>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            data-testid="register-confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Xác nhận mật khẩu"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            id="toggleConfirmPassword"
                            className="toggle-password"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isLoading}
                            data-testid="toggle-confirm-password"
                        >
                            <IonIcon icon={showConfirmPassword ? eyeOffOutline : eyeOutline} />
                        </button>
                    </div>

                    {/* Submit Button */}
                    <button
                        id="btnRegister"
                        name="btnRegister"
                        type="submit"
                        className="register-btn"
                        disabled={isLoading}
                        data-testid="register-button"
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner"></span>
                                <span>Đang đăng ký...</span>
                            </>
                        ) : (
                            "Đăng ký"
                        )}
                    </button>

                    {/* Login Link */}
                    <div className="form-footer">
                        <p>
                            Đã có tài khoản?{" "}
                            <Link to="/login" className="login-link">
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </div>
                </form>

                {/* Footer */}
                <div className="register-footer">
                    <p>© 2025 Light Coffee. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}

export default Register;