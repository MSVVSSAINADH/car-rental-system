import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { clearSession, useSession } from '../services/session';
import './Navbar.css';

const BellIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
        <path
            d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7M13.7 20a2 2 0 0 1-3.4 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSession();

    const [scrolled, setScrolled] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (user?.id && user.role !== 'ADMIN') {
            api.get(`/customer/notifications/${user.id}/unread-count`)
                .then(res => setUnreadCount(res.data || 0))
                .catch(() => {});
        }
    }, [user?.id, user?.role]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setDropdownOpen(false);
                setMobileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    useEffect(() => {
        if (!mobileOpen) return undefined;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previous; };
    }, [mobileOpen]);

    const closeMenus = () => {
        setDropdownOpen(false);
        setMobileOpen(false);
    };

    const handleLogout = () => {
        clearSession();
        closeMenus();
        navigate('/login');
    };

    const handleLogoClick = (e) => {
        e.preventDefault();
        if (user?.role === 'ADMIN') navigate('/admin/dashboard');
        else if (user) navigate('/customer/dashboard');
        else navigate('/');
    };

    const isActive = (path) => location.pathname === path;
    const linkClass = (path) => `nav-link${isActive(path) ? ' is-active' : ''}`;

    return (
        <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <nav className="container navbar-container" aria-label="Main">
                <a href="/" onClick={handleLogoClick} className="navbar-logo">
                    <span className="logo-mark" aria-hidden="true">C</span>
                    CarRental<span className="logo-accent">X</span>
                </a>

                <div id="primary-navigation" className={`navbar-links ${mobileOpen ? 'mobile-open' : ''}`}>
                    {user ? (
                        <>
                            {user.role === 'ADMIN' ? (
                                <>
                                    <Link to="/admin/dashboard" className={linkClass('/admin/dashboard')} onClick={closeMenus}>Fleet</Link>
                                    <Link to="/admin/bookings" className={linkClass('/admin/bookings')} onClick={closeMenus}>Bookings</Link>
                                    <Link to="/admin/users" className={linkClass('/admin/users')} onClick={closeMenus}>Users</Link>
                                    <Link to="/admin/add-car" className={linkClass('/admin/add-car')} onClick={closeMenus}>Add car</Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/customer/dashboard" className={linkClass('/customer/dashboard')} onClick={closeMenus}>Browse cars</Link>
                                    <Link to="/customer/bookings" className={linkClass('/customer/bookings')} onClick={closeMenus}>My bookings</Link>
                                    <Link
                                        to="/customer/notifications"
                                        className={`nav-link notif-link${isActive('/customer/notifications') ? ' is-active' : ''}`}
                                        onClick={closeMenus}
                                        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
                                    >
                                        <BellIcon />
                                        {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                                    </Link>
                                </>
                            )}

                            <div className="profile-wrapper" ref={dropdownRef}>
                                <button
                                    className="avatar-btn"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    aria-label="Profile menu"
                                    aria-expanded={dropdownOpen}
                                >
                                    {user.profileImage ? (
                                        <img src={user.profileImage} alt="" className="avatar-img" />
                                    ) : (
                                        <span className="avatar-initial">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                                    )}
                                </button>

                                {dropdownOpen && (
                                    <div className="profile-dropdown scale-in">
                                        <div className="dropdown-header">
                                            <p className="dropdown-name">{user.name}</p>
                                            <p className="dropdown-email">{user.email}</p>
                                            <span className={`badge ${user.role === 'ADMIN' ? 'badge-primary' : 'badge-success'}`}>
                                                {user.role === 'ADMIN' ? 'Administrator' : 'Customer'}
                                            </span>
                                        </div>
                                        {user.role !== 'ADMIN' && (
                                            <Link to="/customer/profile" className="dropdown-item" onClick={closeMenus}>
                                                My profile
                                            </Link>
                                        )}
                                        <button className="dropdown-item danger" onClick={handleLogout}>
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/cars" className={linkClass('/cars')} onClick={closeMenus}>Cars</Link>
                            <Link to="/#how-it-works" className="nav-link" onClick={closeMenus}>How it works</Link>
                            <Link to="/login" className={linkClass('/login')} onClick={closeMenus}>Login</Link>
                            <Link to="/signup" className="btn btn-primary btn-sm navbar-cta" onClick={closeMenus}>Get started</Link>
                        </>
                    )}
                </div>

                <button
                    className={`hamburger${mobileOpen ? ' is-open' : ''}`}
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={mobileOpen}
                    aria-controls="primary-navigation"
                >
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </button>
            </nav>

            {mobileOpen && <button className="nav-backdrop" aria-label="Close menu" onClick={closeMenus} />}
        </header>
    );
};

export default Navbar;
