import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Payment.css';

const Payment = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [bookingDetails, setBookingDetails] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (state && state.booking) {
            setBookingDetails(state.booking);
        } else {
            // If no booking data, redirect back to home or dashboard
            navigate('/customer/dashboard');
        }
    }, [state, navigate]);

    const handlePayment = async () => {
        setIsProcessing(true);

        try {
            await api.post('/customer/car/book', bookingDetails);
            // Redirect to bookings page on success
            navigate('/customer/bookings');
        } catch (error) {
            console.error("Payment/Booking failed:", error);
            alert("Payment failed. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (!bookingDetails) return <div className="text-center mt-5">Loading Payment Details...</div>;

    return (
        <div className="payment-container fade-in">
            <div className="payment-card">
                <div className="payment-header">
                    <h2>Complete Your Payment</h2>
                    <p>Scan the QR code to pay instantly</p>
                </div>

                <div className="amount-section">
                    <span className="label">Total Amount</span>
                    <span className="value">₹{bookingDetails.totalPrice}</span>
                </div>

                <div className="qr-section">
                    <div className="qr-frame">
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=rentcar@upi&pn=RentCar&am=${bookingDetails.totalPrice}&cu=INR`}
                            alt="Payment QR Code"
                            className="qr-code"
                        />
                    </div>
                    <p className="scan-instruction">Scan with any UPI App (GPay, PhonePe, Paytm)</p>
                </div>

                <div className="payment-methods">
                    <h3>Other Payment Methods</h3>
                    <div className="methods-grid">
                        <div className="method-item disabled">
                            <span className="icon">💳</span>
                            <span>Credit/Debit Card</span>
                            <span className="badge">Coming Soon</span>
                        </div>
                        <div className="method-item disabled">
                            <span className="icon">🏦</span>
                            <span>Net Banking</span>
                            <span className="badge">Coming Soon</span>
                        </div>
                    </div>
                </div>

                <button
                    className="pay-btn"
                    onClick={handlePayment}
                    disabled={isProcessing}
                >
                    {isProcessing ? 'Processing...' : `Verify & Pay ₹${bookingDetails.totalPrice}`}
                </button>
            </div>
        </div>
    );
};

export default Payment;
