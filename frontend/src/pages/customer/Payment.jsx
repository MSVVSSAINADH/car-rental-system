import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Payment.css';

const Payment = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [bookingDetails, setBookingDetails] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (state?.booking) {
            setBookingDetails(state.booking);
        } else {
            navigate('/customer/dashboard');
        }
    }, [state, navigate]);

    const submitBooking = async () => {
        setIsSubmitting(true);
        try {
            await api.post('/customer/car/book', bookingDetails);
            navigate('/customer/bookings');
        } catch (error) {
            console.error('Booking request failed:', error);
            alert('Unable to submit this booking request. Please check the dates and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!bookingDetails) return <div className="text-center mt-5">Loading booking details...</div>;

    return (
        <div className="payment-container fade-in">
            <div className="payment-card">
                <div className="payment-header">
                    <h2>Review your booking</h2>
                    <p>Your request will be sent to the rental administrator for approval.</p>
                </div>

                <div className="amount-section">
                    <span className="label">Estimated booking total</span>
                    <span className="value">₹{bookingDetails.totalPrice}</span>
                </div>

                <p className="text-muted">
                    Online payment is not configured. Submitting this request does not charge you.
                </p>

                <button className="pay-btn" onClick={submitBooking} disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit booking request'}
                </button>
            </div>
        </div>
    );
};

export default Payment;
