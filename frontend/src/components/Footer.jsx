import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content container">
                <div className="footer-section">
                    <h3 className="footer-logo">CarRental<span className="text-primary">X</span></h3>
                    <p className="footer-description">
                        India's most trusted self-drive car rental platform.
                        Experience freedom on wheels with our premium fleet.
                    </p>
                    <div className="social-links">
                        <a href="#" className="social-icon" aria-label="Facebook">
                            <i className="fab fa-facebook-f">f</i>
                        </a>
                        <a href="#" className="social-icon" aria-label="Twitter">
                            <i className="fab fa-twitter">𝕏</i>
                        </a>
                        <a href="#" className="social-icon" aria-label="Instagram">
                            <i className="fab fa-instagram">📷</i>
                        </a>
                        <a href="#" className="social-icon" aria-label="LinkedIn">
                            <i className="fab fa-linkedin-in">in</i>
                        </a>
                    </div>
                </div>

                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <ul className="footer-links">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/signup">Sign Up</Link></li>
                        <li><a href="#how-it-works">How It Works</a></li>
                        <li><a href="#faq">FAQ</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4>Services</h4>
                    <ul className="footer-links">
                        <li><a href="#">Self Drive Cars</a></li>
                        <li><a href="#">Long Term Rentals</a></li>
                        <li><a href="#">Corporate Bookings</a></li>
                        <li><a href="#">Airport Transfers</a></li>
                        <li><a href="#">Subscription Plans</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4>Contact Us</h4>
                    <ul className="footer-contact">
                        <li>📞 +91 98765 43210</li>
                        <li>📧 support@carrentalx.com</li>
                        <li>📍 Mumbai, Maharashtra, India</li>
                        <li>🕒 24/7 Customer Support</li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <p>&copy; 2024 CarRentalX. All rights reserved.</p>
                    <div className="footer-bottom-links">
                        <a href="#">Privacy Policy</a>
                        <span>•</span>
                        <a href="#">Terms of Service</a>
                        <span>•</span>
                        <a href="#">Cancellation Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
