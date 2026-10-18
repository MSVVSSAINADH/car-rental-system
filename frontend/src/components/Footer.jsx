import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
    <footer className="footer">
        <div className="footer-content container">
            <div className="footer-section">
                <h3 className="footer-logo">CarRental<span className="text-primary">X</span></h3>
                <p className="footer-description">Browse available cars and submit rental requests for review.</p>
            </div>
            <div className="footer-section">
                <h4>Quick Links</h4>
                <ul className="footer-links">
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/login">Login</Link></li>
                    <li><Link to="/signup">Sign Up</Link></li>
                    <li><a href="/#how-it-works">How It Works</a></li>
                    <li><a href="/#faq">FAQ</a></li>
                </ul>
            </div>
            <div className="footer-section">
                <h4>Booking information</h4>
                <p className="footer-description">Online payment is not configured. Booking requests require administrator review.</p>
            </div>
        </div>
        <div className="footer-bottom">
            <div className="container">
                <p>CarRentalX</p>
            </div>
        </div>
    </footer>
);

export default Footer;
