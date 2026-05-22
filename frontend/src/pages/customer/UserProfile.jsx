import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './UserProfile.css';

const UserProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: '',
        email: '',
        licenseUrl: '',
        avatarUrl: ''
    });
    const [previewUrl, setPreviewUrl] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (!storedUser || !storedUser.id) {
                navigate('/login');
                return;
            }

            try {
                const response = await api.get(`/customer/profile/${storedUser.id}`);
                const profile = response.data;
                setUser(profile);
                if (profile.licenseImage) setPreviewUrl(profile.licenseImage); // Use new field name
                if (profile.licenseUrl && !profile.licenseImage) setPreviewUrl(profile.licenseUrl); // Fallback
            } catch (error) {
                console.error("Failed to fetch profile", error);
                // Fallback to stored user if API fails? No, purely rely on API for data
                // But for smooth UX maybe... let's stick to API strictness requested by user
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 500000) { // 500KB limit
                alert("File is too large! Please upload separate image smaller than 500KB.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
                // Use backend compatible field names
                setUser((prev) => ({ ...prev, licenseImage: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 500000) {
                alert("Image too large (max 500KB)");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                // Use backend compatible field names
                setUser((prev) => ({ ...prev, profileImage: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            await api.put('/customer/profile', user);

            // Also update local storage user object so other parts of app have latest name immediately
            // But main source of truth is backend.
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...storedUser, ...user }));

            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Failed to update profile", error);
            setMessage('Failed to update profile. Try again.');
        }
    };

    return (
        <div className="user-profile-container fade-in">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar-container">
                        <div className="profile-avatar" onClick={() => document.getElementById('avatar-upload').click()}>
                            {user.profileImage || user.avatarUrl ? (
                                <img src={user.profileImage || user.avatarUrl} alt="Profile" />
                            ) : (
                                user.name ? user.name.charAt(0).toUpperCase() : 'U'
                            )}
                            <div className="avatar-overlay">
                                <span>📷</span>
                            </div>
                        </div>
                        <input
                            type="file"
                            id="avatar-upload"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleAvatarChange}
                        />
                    </div>
                    <h2>{user.name || 'User Profile'}</h2>
                    <p className="profile-email-sub">{user.email}</p>
                </div>

                <div className="profile-details-grid">
                    <div className="detail-item">
                        <span className="detail-icon">👤</span>
                        <div className="detail-text" style={{ flex: 1 }}>
                            <label>Full Name</label>
                            <input
                                type="text"
                                className="profile-edit-input"
                                value={user.name}
                                onChange={(e) => setUser(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter your full name"
                            />
                        </div>
                    </div>

                    <div className="detail-item">
                        <span className="detail-icon">✉️</span>
                        <div className="detail-text">
                            <label>Email Address</label>
                            <p>{user.email}</p>
                        </div>
                    </div>
                </div>

                <div className="profile-field license-section">
                    <label>Driving License</label>
                    <div className="license-upload-area">
                        {previewUrl ? (
                            <div className="license-preview">
                                <img src={previewUrl} alt="Driving License" />
                                <button className="btn-remove" onClick={() => { setPreviewUrl(''); setUser({ ...user, licenseUrl: '' }) }}>Remove</button>
                            </div>
                        ) : (
                            <div className="upload-placeholder">
                                <span style={{ fontSize: '3rem' }}>🪪</span>
                                <p>Upload your Driving License</p>
                                <input type="file" accept="image/*" onChange={handleFileChange} />
                            </div>
                        )}
                    </div>
                    {/* Add fallback instructions if needed */}
                    <p className="text-muted small">Required for booking. Max size 500KB.</p>
                </div>

                {message && <div className="success-message">{message}</div>}

                <button className="btn btn-primary save-profile-btn" onClick={handleSave}>Save Profile</button>
            </div>
        </div>
    );
};

export default UserProfile;
