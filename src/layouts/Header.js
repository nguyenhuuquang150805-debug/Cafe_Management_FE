import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IonIcon } from "@ionic/react";
import { logInOutline, logOutOutline, personCircleOutline } from "ionicons/icons";

import "../assets/scss/header.scss";
import Menu from "./Menu";

const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    const checkAuth = () => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                setIsLoggedIn(true);
                setUserRole(payload.role);
                setUsername(payload.sub || "");
            } catch {
                setIsLoggedIn(false);
                setUserRole(null);
                setUsername("");
            }
        } else {
            setIsLoggedIn(false);
            setUserRole(null);
            setUsername("");
        }
    };

    useEffect(() => {
        checkAuth();
        window.addEventListener("storage", checkAuth);
        return () => window.removeEventListener("storage", checkAuth);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("username");
        setIsLoggedIn(false);
        setUserRole(null);
        setUsername("");
        navigate("/");
    };

    const handleDashboard = () => {
        if (userRole === "ADMIN") {
            navigate("/admin");
        } else if (userRole === "STAFF") {
            navigate("/staff");
        }
    };

    return (
        <section>
            <header className="cafe-header">
                <div className="cafe-header__container">
                    {/* Logo */}
                    <Link className="cafe-header__brand" to="/">
                        <img
                            src={`${process.env.PUBLIC_URL}/logo_shopcf.png`}
                            alt="Light Coffee Logo"
                            className="cafe-logo"
                        />
                        Light Coffee
                    </Link>

                    {/* Title */}
                    <h1 className="cafe-header__title">Hệ thống đặt món</h1>

                    {/* Auth Section */}
                    <div className="cafe-header__auth">
                        {isLoggedIn ? (
                            <div className="cafe-header__user">
                                <button
                                    className="cafe-header__btn cafe-header__btn--dashboard"
                                    onClick={handleDashboard}
                                    title="Vào trang quản lý"
                                >
                                    <IonIcon icon={personCircleOutline} />
                                    <span>{username}</span>
                                </button>
                                <button
                                    className="cafe-header__btn cafe-header__btn--logout"
                                    onClick={handleLogout}
                                    title="Đăng xuất"
                                >
                                    <IonIcon icon={logOutOutline} />
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="cafe-header__btn cafe-header__btn--login">
                                <IonIcon icon={logInOutline} />
                                <span>Đăng nhập</span>
                            </Link>
                        )}
                    </div>
                </div>
            </header>
            <section>
                <Menu />
            </section>
        </section>
    );
};

export default Header;