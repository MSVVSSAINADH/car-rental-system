import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser?.id) {
            setUser(storedUser);
            if (storedUser.role !== 'ADMIN') {
                api.get(`/customer/profile/${storedUser.id}`)
                    .then(res => {
                        const fresh = { ...res.data, token: storedUser.token };
                        setUser(fresh);
                        localStorage.setItem('user', JSON.stringify(fresh));
                    })
                    .catch(() => {});
                api.get(`/customer/notifications/${storedUser.id}/unread-count`)
                    .then(res => setUnreadCount(res.data || 0))
                    .catch(() => {});
            }
        } else {
            setUser(null);
        }
    }, [location]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    const handleLogoClick = (e) => {
        e.preventDefault();
        if (user?.role === 'ADMIN') navigate('/admin/dashboard');
        else if (user) navigate('/customer/dashboard');
        else navigate('/');
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container navbar-container">
                <a href="/" onClick={handleLogoClick} className="navbar-logo">
                    CarRental<span className="logo-accent">X</span>
                </a>

                <div className={`navbar-links ${mobileOpen ? 'mobile-open' : ''}`}>
                    {user ? (
                        <>
                            {user.role === 'ADMIN' ? (
                                <>
                                    <Link to="/admin/dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>Fleet</Link>
                                    <Link to="/admin/bookings" className="nav-link" onClick={() => setMobileOpen(false)}>Bookings</Link>
                                    <Link to="/admin/users" className="nav-link" onClick={() => setMobileOpen(false)}>Users</Link>
                                    <Link to="/admin/add-car" className="nav-link" onClick={() => setMobileOpen(false)}>Add Car</Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/customer/dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>Browse Cars</Link>
                                    <Link to="/customer/bookings" className="nav-link" onClick={() => setMobileOpen(false)}>My Bookings</Link>
                                    <Link
                                        to="/customer/notifications"
                                        className="nav-link notif-link"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        🔔
                                        {unreadCount > 0 && (
                                            <span className="notif-badge">{unreadCount}</span>
                                        )}
                                    </Link>
                                </>
                            )}

                            <div className="profile-wrapper" ref={dropdownRef}>
                                <button
                                    className="avatar-btn"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    aria-label="Profile menu"
                                >
                                    {user.profileImage ? (
                                        <img src={user.profileImage} alt={user.name} className="avatar-img" />
                                    ) : (
                                        <span className="avatar-initial">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                                    )}
                                </button>

                                {dropdownOpen && (
                                    <div className="profile-dropdown scale-in">
                                        <div className="dropdown-header">
                                            <p className="dropdown-name">{user.name}</p>
                                            <span className={`badge ${user.role === 'ADMIN' ? 'badge-primary' : 'badge-success'}`}>
                                                {user.role}
                                            </span>
                                        </div>
                                        {user.role !== 'ADMIN' && (
                                            <Link
                                                to="/customer/profile"
                                                className="dropdown-item"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                👤 My Profile
                                            </Link>
                                        )}
                                        <button className="dropdown-item danger" onClick={handleLogout}>
                                            🚪 Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/#how-it-works" className="nav-link">How it Works</Link>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
                        </>
                    )}
                </div>

                <button
                    className="hamburger"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    <span className={mobileOpen ? 'bar open' : 'bar'}></span>
                    <span className={mobileOpen ? 'bar open' : 'bar'}></span>
                    <span className={mobileOpen ? 'bar open' : 'bar'}></span>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
