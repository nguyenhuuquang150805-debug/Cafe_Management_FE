import React from "react";
import image1 from "../assets/images/image_1.jpg";
import image2 from "../assets/images/image_2.jpg";
import { IonIcon } from '@ionic/react';
import { heartOutline, logoTwitter, logoFacebook, logoInstagram } from 'ionicons/icons';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const blogPosts = [
        {
            id: 1,
            image: image1,
            title: "Even the all-powerful Pointing has no control about",
            date: "Sept 15, 2018",
            author: "Admin",
            comments: 19
        },
        {
            id: 2,
            image: image2,
            title: "Behind the word mountains from the countries",
            date: "Oct 22, 2018",
            author: "Admin",
            comments: 24
        }
    ];

    const services = [
        "Fresh Coffee",
        "Quality Foods",
        "Fast Delivery",
        "Catering Service"
    ];

    const socialLinks = [
        { icon: logoTwitter, url: "#", label: "Twitter" },
        { icon: logoFacebook, url: "#", label: "Facebook" },
        { icon: logoInstagram, url: "#", label: "Instagram" }
    ];

    return (
        <footer
            className="ftco-footer ftco-section"
            style={{
                backgroundColor: '#1a1a1a',
                color: '#fff',
                paddingTop: '80px',
                paddingBottom: '30px',
                position: 'relative'
            }}
        >
            <div className="container">
                <div className="row mb-5 pb-4">
                    {/* About Us Section */}
                    <div className="col-lg-3 col-md-6 mb-4 mb-md-0">
                        <div className="ftco-footer-widget">
                            <h2
                                className="ftco-heading-2 mb-4 pb-2"
                                style={{
                                    color: '#c49b63',
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    borderBottom: '2px solid rgba(196, 155, 99, 0.3)',
                                    paddingBottom: '10px'
                                }}
                            >
                                About Us
                            </h2>
                            <p style={{
                                color: 'rgba(255,255,255,0.6)',
                                lineHeight: '1.8',
                                fontSize: '14px'
                            }}>
                                Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.
                            </p>
                            <ul className="ftco-footer-social list-unstyled d-flex gap-3 mt-4">
                                {socialLinks.map((social, index) => (
                                    <li key={index}>
                                        <a
                                            href={social.url}
                                            aria-label={social.label}
                                            className="d-flex align-items-center justify-content-center"
                                            style={{
                                                width: '45px',
                                                height: '45px',
                                                backgroundColor: 'rgba(196, 155, 99, 0.1)',
                                                borderRadius: '50%',
                                                border: '1px solid rgba(196, 155, 99, 0.3)',
                                                transition: 'all 0.3s ease',
                                                textDecoration: 'none'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#c49b63';
                                                e.currentTarget.style.transform = 'translateY(-3px)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(196, 155, 99, 0.1)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            <IonIcon
                                                icon={social.icon}
                                                style={{
                                                    fontSize: '20px',
                                                    color: '#fff'
                                                }}
                                            />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Recent Blog Section */}
                    <div className="col-lg-4 col-md-6 mb-4 mb-md-0">
                        <div className="ftco-footer-widget">
                            <h2
                                className="ftco-heading-2 mb-4 pb-2"
                                style={{
                                    color: '#c49b63',
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    borderBottom: '2px solid rgba(196, 155, 99, 0.3)',
                                    paddingBottom: '10px'
                                }}
                            >
                                Recent Blog
                            </h2>
                            {blogPosts.map((post) => (
                                <div key={post.id} className="mb-4 d-flex">
                                    <button
                                        className="blog-img"
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            minWidth: '80px',
                                            backgroundImage: `url(${post.image})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            borderRadius: '8px',
                                            marginRight: '15px',
                                            transition: 'transform 0.3s ease',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: 0
                                        }}
                                        onClick={() => window.location.href = '#'}
                                        aria-label="View blog post image"
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    ></button>
                                    <div className="text">
                                        <h3 className="heading mb-2">
                                            <a
                                                href="/blog"
                                                style={{
                                                    color: '#fff',
                                                    fontSize: '14px',
                                                    textDecoration: 'none',
                                                    lineHeight: '1.5',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    transition: 'color 0.3s ease'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.color = '#c49b63'}
                                                onMouseLeave={(e) => e.currentTarget.style.color = '#fff'}
                                            >
                                                {post.title}
                                            </a>
                                        </h3>
                                        <div className="meta d-flex flex-wrap gap-2" style={{ fontSize: '12px' }}>
                                            <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                                                <i className="fa fa-calendar me-1"></i> {post.date}
                                            </span>
                                            <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                                                <i className="fa fa-user me-1"></i> {post.author}
                                            </span>
                                            <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                                                <i className="fa fa-comment me-1"></i> {post.comments}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>


                    {/* Services Section */}
                    <div className="col-lg-2 col-md-6 mb-4 mb-md-0">
                        <div className="ftco-footer-widget">
                            <h2
                                className="ftco-heading-2 mb-4 pb-2"
                                style={{
                                    color: '#c49b63',
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    borderBottom: '2px solid rgba(196, 155, 99, 0.3)',
                                    paddingBottom: '10px'
                                }}
                            >
                                Services
                            </h2>
                            <ul className="list-unstyled">
                                {services.map((service, index) => (
                                    <li key={index} className="mb-2">
                                        <a
                                            href="/services"
                                            style={{
                                                color: 'rgba(255,255,255,0.6)',
                                                textDecoration: 'none',
                                                fontSize: '14px',
                                                transition: 'all 0.3s ease',
                                                display: 'inline-block'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.color = '#c49b63';
                                                e.currentTarget.style.paddingLeft = '5px';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                                                e.currentTarget.style.paddingLeft = '0';
                                            }}
                                        >
                                            → {service}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="col-lg-3 col-md-6 mb-4 mb-md-0">
                        <div className="ftco-footer-widget">
                            <h2
                                className="ftco-heading-2 mb-4 pb-2"
                                style={{
                                    color: '#c49b63',
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    borderBottom: '2px solid rgba(196, 155, 99, 0.3)',
                                    paddingBottom: '10px'
                                }}
                            >
                                Have Questions?
                            </h2>
                            <ul className="list-unstyled" style={{ fontSize: '14px' }}>
                                <li className="mb-3 d-flex align-items-start">
                                    <i
                                        className="fa fa-map-marker-alt mt-1"
                                        style={{
                                            color: '#c49b63',
                                            marginRight: '12px',
                                            fontSize: '16px'
                                        }}
                                    ></i>
                                    <span style={{ color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>
                                        203 Fake St. Mountain View, San Francisco, USA
                                    </span>
                                </li>
                                <li className="mb-3 d-flex align-items-center">
                                    <i
                                        className="fa fa-phone"
                                        style={{
                                            color: '#c49b63',
                                            marginRight: '12px',
                                            fontSize: '16px'
                                        }}
                                    ></i>
                                    <a
                                        href="tel:+23923929210"
                                        style={{
                                            color: 'rgba(255,255,255,0.6)',
                                            textDecoration: 'none',
                                            transition: 'color 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#c49b63'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                                    >
                                        +2 392 3929 210
                                    </a>
                                </li>
                                <li className="d-flex align-items-center">
                                    <i
                                        className="fa fa-envelope"
                                        style={{
                                            color: '#c49b63',
                                            marginRight: '12px',
                                            fontSize: '16px'
                                        }}
                                    ></i>
                                    <a
                                        href="mailto:info@yourdomain.com"
                                        style={{
                                            color: 'rgba(255,255,255,0.6)',
                                            textDecoration: 'none',
                                            transition: 'color 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#c49b63'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                                    >
                                        info@yourdomain.com
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div
                    className="row pt-4 mt-4"
                    style={{
                        borderTop: '1px solid rgba(255,255,255,0.1)'
                    }}
                >
                    <div className="col-md-12 text-center">
                        <p
                            className="mb-0"
                            style={{
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: '14px'
                            }}
                        >
                            Copyright &copy; {currentYear} All rights reserved | This template is made with{' '}
                            <IonIcon
                                icon={heartOutline}
                                style={{
                                    color: '#c49b63',
                                    fontSize: '16px',
                                    verticalAlign: 'middle'
                                }}
                            />{' '}
                            by{' '}
                            <a
                                href="https://colorlib.com"
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    color: '#c49b63',
                                    textDecoration: 'none',
                                    fontWeight: '600',
                                    transition: 'color 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#d4a574'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#c49b63'}
                            >
                                Colorlib
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;