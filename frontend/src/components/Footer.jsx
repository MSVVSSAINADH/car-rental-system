import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
    <footer className="footer">
        <div className="container footer-content">
            <div className="footer-brand">
                <Link to="/" className="footer-logo">
                    CarRental<span>X</span>
                </Link>
                <p className="footer-description">
                    Browse the current fleet, choose your dates and send a rental request
                    for administrator review.
                </p>
            </div>

            <nav className="footer-column" aria-label="Browse">
                <h4>Browse</h4>
                <Link to="/cars">Cars</Link>
                <a href="/#how-it-works">How it works</a>
                <a href="/#faq">FAQ</a>
            </nav>

            <nav className="footer-column" aria-label="Account">
                <h4>Account</h4>
                <Link to="/login">Sign in</Link>
                <Link to="/signup">Create account</Link>
                <Link to="/customer/bookings">My bookings</Link>
            </nav>

            <div className="footer-column">
                <h4>Good to know</h4>
                <ul className="footer-list">
                    <li>No online payment — an administrator reviews every request.</li>
                    <li>Self-drive bookings need a driving licence on your profile.</li>
                </ul>
            </div>
        </div>

        <div className="footer-bottom">
            <div className="container footer-bottom-inner">
                <p>© {new Date().getFullYear()} CarRentalX</p>
                <p>Demo fleet · Prices in INR per day</p>
            </div>
        </div>
    </footer>
);

export default Footer;
