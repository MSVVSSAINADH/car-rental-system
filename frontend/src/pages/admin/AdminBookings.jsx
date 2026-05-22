import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/admin/car/bookings');
            // Sort by newest first
            setBookings(response.data.sort((a, b) => b.id - a.id));
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
    };

    const handleStatus = async (id, newStatus) => {
        try {
            // Check controller logic: 'Approve' or 'Reject'
            const apiStatus = newStatus === 'Approved' ? 'Approve' : (newStatus === 'Rejected' ? 'Reject' : newStatus);

            // Wait, buttons in AdminBookings pass 'Approved' and 'Rejected' (lines 60, 67).
            // So we map them.

            await api.get(`/admin/car/booking/${id}/${apiStatus}`);
            fetchBookings();
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    return (
        <div className="container fade-in" style={{ paddingTop: '2rem' }}>
            <h2>All Bookings</h2>
            <div className="bookings-list" style={{ marginTop: '2rem' }}>
                {bookings.map(booking => (
                    <div key={booking.id} className="card" style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h4 className="text-primary">Booking #{booking.id.toString().slice(-6)} - {booking.carBrand} {booking.carModel}</h4>
                                <p className="text-muted">Customer: {booking.userName} ({booking.userEmail})</p>
                                <div style={{ margin: '0.5rem 0' }}>
                                    <span>From: {booking.fromDate}</span>
                                    <span style={{ marginLeft: '1rem' }}>To: {booking.toDate}</span>
                                </div>
                                <p style={{ fontWeight: 'bold' }}>Total Price: ₹{booking.totalPrice}</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                <span style={{
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    fontWeight: '500',
                                    textTransform: 'uppercase',
                                    fontSize: '0.8rem',
                                    background: booking.status === 'Approved' ? 'rgba(76, 175, 80, 0.1)' :
                                        booking.status === 'Rejected' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                                    color: booking.status === 'Approved' ? '#4CAF50' :
                                        booking.status === 'Rejected' ? '#F44336' : '#FF9800'
                                }}>{booking.status}</span>

                                {booking.status === 'Pending' && (
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <button
                                            className="btn"
                                            onClick={() => handleStatus(booking.id, 'Approved')}
                                            style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '0.5rem 1rem' }}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            className="btn"
                                            onClick={() => handleStatus(booking.id, 'Rejected')}
                                            style={{ backgroundColor: '#F44336', color: 'white', border: 'none', padding: '0.5rem 1rem' }}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {bookings.length === 0 && (
                    <div className="text-center text-muted" style={{ padding: '2rem' }}>
                        No bookings have been made yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBookings;
