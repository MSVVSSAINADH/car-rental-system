import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const StatCard = ({ icon, label, value, bg, color }) => (
    <div className="stat-card fade-in-up">
        <div className="stat-icon" style={{ background: bg }}>
            <span>{icon}</span>
        </div>
        <p className="stat-value" style={{ color }}>{value}</p>
        <p className="stat-label">{label}</p>
    </div>
);

const AdminDashboard = () => {
    const [cars, setCars] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('fleet');
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [carRes, bookingRes, statsRes] = await Promise.all([
                api.get('/admin/cars'),
                api.get('/admin/car/bookings'),
                api.get('/admin/stats')
            ]);
            setCars(carRes.data);
            setBookings(bookingRes.data.sort((a, b) => b.id - a.id));
            setStats(statsRes.data);
        } catch (err) {
            console.error('Error fetching admin data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this car?')) return;
        try {
            await api.delete(`/admin/car/${id}`);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const toggleAvailability = async (car) => {
        try {
            await api.put(`/admin/car/${car.id}`, { ...car, available: !car.available });
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleBookingStatus = async (bookingId, status) => {
        const apiStatus = status === 'Approved' ? 'Approve' : 'Reject';
        try {
            await api.put(`/admin/car/booking/${bookingId}/${apiStatus}`);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

    const getStatusBadge = (status) => {
        const map = {
            'APPROVED': 'badge badge-success',
            'REJECTED': 'badge badge-danger',
            'PENDING': 'badge badge-warning',
        };
        return map[status] || 'badge badge-muted';
    };

    return (
        <div className="container fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, margin: 0 }}>Admin Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)', margin: '4px 0 0' }}>Manage your fleet and bookings</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/admin/add-car')}>+ Add New Car</button>
            </div>

            {/* KPI Stat Cards */}
            {stats && (
                <div className="stat-cards-grid">
                    <StatCard icon="🚗" label="Total Cars" value={stats.totalCars} bg="rgba(79,70,229,.1)" color="#4f46e5" />
                    <StatCard icon="📋" label="Total Bookings" value={stats.totalBookings} bg="rgba(14,165,233,.1)" color="#0ea5e9" />
                    <StatCard icon="💰" label="Revenue" value={formatCurrency(stats.totalRevenue)} bg="rgba(16,185,129,.1)" color="#10b981" />
                    <StatCard icon="⏳" label="Pending" value={stats.pendingBookings} bg="rgba(245,158,11,.1)" color="#f59e0b" />
                    <StatCard icon="✅" label="Approved" value={stats.approvedBookings} bg="rgba(16,185,129,.08)" color="#10b981" />
                    <StatCard icon="👥" label="Users" value={stats.totalUsers} bg="rgba(239,68,68,.1)" color="#ef4444" />
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
                {['fleet', 'bookings'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '10px 24px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
                            color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontSize: '0.95rem',
                            textTransform: 'capitalize'
                        }}
                    >
                        {tab === 'fleet' ? '🚘 Fleet' : '📋 Bookings'}
                    </button>
                ))}
            </div>

            {/* Fleet Tab */}
            {activeTab === 'fleet' && (
                <section>
                    {loading ? (
                        <div className="cars-grid">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="card skeleton-card">
                                    <div className="skeleton skeleton-img" />
                                    <div style={{ padding: '1rem' }}>
                                        <div className="skeleton skeleton-text" style={{ marginBottom: 8 }} />
                                        <div className="skeleton skeleton-text w-75" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="cars-grid">
                            {cars.map(car => (
                                <div key={car.id} className="car-card" style={{ opacity: !car.available ? 0.7 : 1 }}>
                                    <div className="car-image" style={{ backgroundImage: `url(${car.imageUrl})` }}>
                                        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
                                            {car.category && <span className="badge badge-primary">{car.category}</span>}
                                            {!car.available && <span className="badge badge-danger">Unavailable</span>}
                                        </div>
                                    </div>
                                    <div className="car-details">
                                        <h3 style={{ margin: '0 0 4px', fontWeight: 700 }}>{car.brand} {car.model}</h3>
                                        <div className="car-info">
                                            <span>{car.year}</span>
                                            <span>{car.transmission}</span>
                                            <span>{car.fuelType}</span>
                                            {car.seats > 0 && <span>{car.seats} seats</span>}
                                        </div>
                                        <p className="car-price" style={{ margin: '0.5rem 0 1rem' }}>₹{car.pricePerDay}/day</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                            <button
                                                className={`btn btn-sm ${car.available ? '' : 'btn-success'}`}
                                                style={{ gridColumn: '1/-1', background: car.available ? '#f59e0b' : '#10b981', color: 'white' }}
                                                onClick={() => toggleAvailability(car)}
                                            >
                                                {car.available ? '⏸ Make Unavailable' : '▶ Make Available'}
                                            </button>
                                            <button className="btn btn-primary btn-sm" onClick={() => navigate(`/admin/car/${car.id}`)}>✏️ Edit</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(car.id)}>🗑 Delete</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {cars.length === 0 && (
                                <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                                    <div className="empty-state-icon">🚗</div>
                                    <h3>No cars yet</h3>
                                    <p>Add your first car to the fleet</p>
                                    <button className="btn btn-primary" onClick={() => navigate('/admin/add-car')}>+ Add Car</button>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
                <section>
                    <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>#ID</th>
                                    <th>Car</th>
                                    <th>Customer</th>
                                    <th>Dates</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(b => (
                                    <tr key={b.id}>
                                        <td style={{ fontWeight: 600, color: 'var(--primary)' }}>#{String(b.id).slice(-5)}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                {b.carImage && <img src={b.carImage} alt="" style={{ width: 40, height: 36, borderRadius: 8, objectFit: 'cover' }} />}
                                                <span>{b.carBrand} {b.carModel}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{b.username}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.email}</div>
                                            </div>
                                        </td>
                                        <td style={{ fontSize: '0.85rem' }}>
                                            {b.fromDate} <br /><span style={{ color: 'var(--text-muted)' }}>to</span><br /> {b.toDate}
                                        </td>
                                        <td style={{ fontWeight: 700 }}>₹{b.price?.toLocaleString('en-IN')}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(b.bookingStatus)}`}>
                                                {b.bookingStatus}
                                            </span>
                                        </td>
                                        <td>
                                            {b.bookingStatus === 'PENDING' ? (
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button className="btn btn-sm btn-success" onClick={() => handleBookingStatus(b.id, 'Approved')}>✓</button>
                                                    <button className="btn btn-sm btn-danger" onClick={() => handleBookingStatus(b.id, 'Rejected')}>✕</button>
                                                </div>
                                            ) : <span style={{ color: 'var(--text-light)' }}>—</span>}
                                        </td>
                                    </tr>
                                ))}
                                {bookings.length === 0 && (
                                    <tr><td colSpan="7" className="empty-state">No bookings yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
};

export default AdminDashboard;
