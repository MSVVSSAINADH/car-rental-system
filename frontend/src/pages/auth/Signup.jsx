import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Auth.css';

const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { score, label: 'Weak', color: '#ef4444', pct: '20%' };
    if (score <= 2) return { score, label: 'Fair', color: '#f59e0b', pct: '40%' };
    if (score <= 3) return { score, label: 'Good', color: '#3b82f6', pct: '70%' };
    return { score, label: 'Strong', color: '#10b981', pct: '100%' };
};

const Signup = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const strength = getPasswordStrength(form.password);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) {
            setError('Please fill in all fields.');
            return;
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/signup', form);
            localStorage.setItem('user', JSON.stringify(res.data));
            navigate('/customer/dashboard');
        } catch (err) {
            setError(err.response?.data || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-illustration">
                <div className="auth-illustration-content">
                    <div className="auth-logo">CarRental<span>X</span></div>
                    <h2>Start your <br />next trip</h2>
                    <p>Create an account to browse available cars and track booking requests.</p>
                    <div className="auth-stats">
                        <div className="auth-stat"><strong>30%</strong><span>Off first five eligible bookings</span></div>
                    </div>
                </div>
            </div>

            <div className="auth-form-panel">
                <div className="auth-form-container fade-in">
                    <div className="auth-header">
                        <h1>Create account</h1>
                        <p>Start your free CarRentalX journey today</p>
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Full name</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                placeholder="Rahul Sharma"
                                value={form.name}
                                onChange={handleChange}
                                autoComplete="name"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email address</label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                className="form-input"
                                placeholder="Min. 6 characters"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                            />
                            {form.password && (
                                <div className="password-strength">
                                    <div className="strength-bar">
                                        <div className="strength-fill" style={{ width: strength.pct, background: strength.color }} />
                                    </div>
                                    <p className="strength-text" style={{ color: strength.color }}>{strength.label}</p>
                                </div>
                            )}
                        </div>

                        <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
                            {loading ? 'Creating account...' : 'Create Free Account →'}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
