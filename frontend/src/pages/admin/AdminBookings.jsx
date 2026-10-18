import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);

    const fetchBookings = () => {
        api.get('/admin/car/bookings')
            .then(response => {
                setBookings(response.data.sort((a, b) => b.id - a.id));
            })
            .catch(error => {
                console.error("Error fetching bookings:", error);
            });
    };

    useEffect(() => {
        let isMounted = true;
        api.get('/admin/car/bookings')
            .then(response => {
                if (isMounted) {
                    setBookings(response.data.sort((a, b) => b.id - a.id));
                }
            })
            .catch(error => {
                console.error("Error fetching bookings:", error);
            });
        return () => { isMounted = false; };
    }, []);

    const handleStatus = async (id, newStatus) => {
        try {
            const apiStatus = newStatus === 'Approved' ? 'Approve' : (newStatus === 'Rejected' ? 'Reject' : newStatus);
            await api.put(`/admin/car/booking/${id}/${apiStatus}`);
            fetchBookings();
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    return (
        <div className="container fade-in" style={{ paddingTop: '2rem' }}>
            <h2>All Bookings</h2>
            <div className="bookings-list" style={{ marginTop: '2rem' }}>
                {bookings.map(booking => {
                    const status = booking.bookingStatus || booking.status || 'PENDING';
                    const isPending = status.toUpperCase() === 'PENDING';
                    const isApproved = status.toUpperCase() === 'APPROVED';
                    const isRejected = status.toUpperCase() === 'REJECTED';
                    const price = booking.totalPrice != null ? booking.totalPrice : booking.price;
                    const customerName = booking.userName || booking.username || 'Customer';
                    const customerEmail = booking.userEmail || booking.email || '';

                    return (
                        <div key={booking.id} className="card" style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <h4 className="text-primary">Booking #{booking.id.toString().slice(-6)} - {booking.carBrand} {booking.carModel}</h4>
                                    <p className="text-muted">Customer: {customerName} {customerEmail && `(${customerEmail})`}</p>
                                    <div style={{ margin: '0.5rem 0' }}>
                                        <span>From: {booking.fromDate}</span>
                                        <span style={{ marginLeft: '1rem' }}>To: {booking.toDate}</span>
                                    </div>
                                    <p style={{ fontWeight: 'bold' }}>Total Price: ₹{price?.toLocaleString('en-IN')}</p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                    <span style={{
                                        padding: '6px 12px',
                                        borderRadius: '4px',
                                        fontWeight: '500',
                                        textTransform: 'uppercase',
                                        fontSize: '0.8rem',
                                        background: isApproved ? 'rgba(76, 175, 80, 0.1)' :
                                            isRejected ? 'rgba(244, 67, 54, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                                        color: isApproved ? '#4CAF50' :
                                            isRejected ? '#F44336' : '#FF9800'
                                    }}>{status}</span>

                                    {isPending && (
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
                    );
                })}

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
