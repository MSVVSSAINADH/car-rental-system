import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const MyBookings = () => {
    const user = React.useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user'));
        } catch {
            return null;
        }
    }, []);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(() => Boolean(user?.id));

    useEffect(() => {
        if (!user?.id) return;
        let isMounted = true;
        api.get(`/customer/car/bookings/${user.id}`)
            .then(res => {
                if (isMounted) setBookings(Array.isArray(res.data) ? res.data.reverse() : []);
            })
            .catch(console.error)
            .finally(() => {
                if (isMounted) setLoading(false);
            });
        return () => { isMounted = false; };
    }, [user?.id]);

    const getStatusStyle = (status) => ({
        'APPROVED': { bg: 'rgba(16,185,129,.1)', color: '#059669', label: '✅ Approved', icon: '✅' },
        'REJECTED': { bg: 'rgba(239,68,68,.1)', color: '#dc2626', label: '❌ Rejected', icon: '❌' },
        'PENDING':  { bg: 'rgba(245,158,11,.1)', color: '#d97706', label: '⏳ Pending', icon: '⏳' },
    }[status] || { bg: '#f1f5f9', color: '#64748b', label: status, icon: '•' });

    return (
        <div className="container fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: 780 }}>
            <div className="dashboard-header">
                <div>
                    <h1 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, margin: 0 }}>My Bookings</h1>
                    <p style={{ color: 'var(--text-muted)', margin: '4px 0 0' }}>Track all your car rental history</p>
                </div>
                <span className="badge badge-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                    {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
                </span>
            </div>

            {loading ? (
                <div className="cards-stack">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="card" style={{ marginBottom: '1rem' }}>
                            <div className="skeleton skeleton-text" />
                            <div className="skeleton skeleton-text w-75" style={{ marginTop: 8 }} />
                        </div>
                    ))}
                </div>
            ) : bookings.length === 0 ? (
                <div className="card empty-state">
                    <div className="empty-state-icon">🗓</div>
                    <h3>No bookings yet</h3>
                    <p>Browse our fleet and book your first ride!</p>
                    <a href="/customer/dashboard" className="btn btn-primary">Browse Cars</a>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {bookings.map(b => {
                        const s = getStatusStyle(b.bookingStatus);
                        return (
                            <div key={b.id} className="card" style={{ padding: '1.5rem', borderLeft: `4px solid ${s.color}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                            <h3 style={{ margin: 0, fontWeight: 700 }}>
                                                {b.carBrand} {b.carModel}
                                            </h3>
                                            <span className="badge" style={{ background: s.bg, color: s.color, fontSize: '0.78rem' }}>
                                                {s.label}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                                            <span>📅 {b.fromDate} → {b.toDate}</span>
                                            <span>🗓 {b.days} day{b.days !== 1 ? 's' : ''}</span>
                                            {b.bookingType && <span>🚗 {b.bookingType === 'SELF_DRIVE' ? 'Self Drive' : 'With Driver'}</span>}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                                            ₹{(b.price || 0).toLocaleString('en-IN')}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            Booking #{String(b.id).slice(-5)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyBookings;
