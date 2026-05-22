import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const Notifications = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            api.get(`/customer/notifications/${user.id}`)
                .then(res => setNotifications(res.data))
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, []);

    const markRead = async (id) => {
        try {
            await api.put(`/customer/notification/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (e) { console.error(e); }
    };

    const markAllRead = async () => {
        const unread = notifications.filter(n => !n.isRead);
        await Promise.all(unread.map(n => api.put(`/customer/notification/${n.id}/read`)));
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const formatTime = (iso) => {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="container fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: 680 }}>
            <div className="dashboard-header">
                <div>
                    <h1 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, margin: 0 }}>🔔 Notifications</h1>
                    {unreadCount > 0 && (
                        <p style={{ color: 'var(--text-muted)', margin: '4px 0 0' }}>{unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</p>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button className="btn btn-outline btn-sm" onClick={markAllRead}>Mark all as read</button>
                )}
            </div>

            {loading ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading...</div>
            ) : notifications.length === 0 ? (
                <div className="card empty-state">
                    <div className="empty-state-icon">🔔</div>
                    <h3>No notifications yet</h3>
                    <p>You'll see booking updates and alerts here</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {notifications.map(n => (
                        <div
                            key={n.id}
                            className="card"
                            style={{
                                padding: '1rem 1.25rem',
                                border: n.isRead ? '1px solid var(--border)' : '1px solid var(--primary)',
                                background: n.isRead ? 'white' : 'rgba(79,70,229,0.04)',
                                cursor: n.isRead ? 'default' : 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '1rem'
                            }}
                            onClick={() => !n.isRead && markRead(n.id)}
                        >
                            <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>
                                {n.message?.startsWith('✅') ? '✅' : n.message?.startsWith('❌') ? '❌' : '🔔'}
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: n.isRead ? 400 : 600, color: 'var(--text)' }}>
                                    {n.message}
                                </p>
                                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {formatTime(n.createdAt)}
                                </p>
                            </div>
                            {!n.isRead && (
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 6 }} />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
