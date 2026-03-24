import React, { useEffect } from "react";
import { Link } from "react-router-dom";

import "../assets/scss/header.scss";
import Menu from "./Menu";

const Header = () => {
    useEffect(() => {
        const checkLogin = () => {
            // Nếu bạn cần làm gì đó khi có sự kiện storage, thêm vào đây
            console.log("Storage changed");
        };
        window.addEventListener("storage", checkLogin);
        return () => window.removeEventListener("storage", checkLogin);
    }, []);

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
                </div>
            </header>
            <section>
                <Menu />
            </section>
        </section>
    );
};

export default Header;