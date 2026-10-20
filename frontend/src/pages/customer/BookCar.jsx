import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import moment from 'moment';
import '../admin/Dashboard.css';

const BookCar = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [car, setCar] = useState(null);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [bookingType, setBookingType] = useState('self');
    const user = React.useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user'));
        } catch {
            return null;
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        api.get(`/customer/car/${id}`)
            .then(response => {
                if (isMounted) setCar(response.data);
            })
            .catch(error => {
                console.error("Error fetching car:", error);
            });

        if (user?.id) {
            api.get(`/customer/car/bookings/${user.id}`)
                .then(response => {
                    if (isMounted) {
                        const userBookings = response.data;
                        setIsNewCustomer(Array.isArray(userBookings) && userBookings.length < 5);
                    }
                })
                .catch(error => {
                    console.error("Error checking bookings:", error);
                    if (isMounted) setIsNewCustomer(false);
                });
        }
        return () => { isMounted = false; };
    }, [id, user?.id]);

    // Real-time validation derived via useMemo
    const dateError = React.useMemo(() => {
        const today = moment().startOf('day');
        if (fromDate && moment(fromDate).isBefore(today)) {
            return "Booking date cannot be in the past!";
        }
        if (toDate) {
            if (moment(toDate).isBefore(today)) {
                return "End date cannot be in the past!";
            } else if (fromDate && !moment(toDate).isAfter(moment(fromDate))) {
                return "End date must be after start date";
            }
        }
        return '';
    }, [fromDate, toDate]);

    // Pricing calculation derived via useMemo
    const { totalPrice, discountedPrice } = React.useMemo(() => {
        if (car && fromDate && toDate) {
            const start = moment(fromDate);
            const end = moment(toDate);
            const days = end.diff(start, 'days');

            if (days > 0 && !dateError) {
                const basePrice = days * car.pricePerDay;
                const discPrice = isNewCustomer ? Math.round(basePrice * 0.7) : 0;
                return { totalPrice: basePrice, discountedPrice: discPrice };
            }
        }
        return { totalPrice: 0, discountedPrice: 0 };
    }, [car, fromDate, toDate, dateError, isNewCustomer]);

    const handleBook = async () => {
        if (dateError) {
            return;
        }

        if (!fromDate || !toDate) {
            alert("Please select both dates");
            return;
        }

        // Driving licence check for Self Drive. The localStorage snapshot is
        // taken at login and goes stale as soon as the licence is uploaded
        // (or changed on another device), which wrongly blocked valid
        // customers, so ask the server for the authoritative profile first.
        if (bookingType === 'self') {
            const currentUser = user;
            let hasLicense = Boolean(currentUser?.licenseUrl || currentUser?.licenseImage);
            if (currentUser?.id) {
                try {
                    const profile = await api.get(`/customer/profile/${currentUser.id}`);
                    hasLicense = Boolean(profile.data?.licenseImage);
                } catch {
                    // Keep the stored snapshot as best effort; the backend still
                    // rejects SELF_DRIVE bookings without a licence at submit time.
                }
            }
            if (!hasLicense) {
                alert("Please update your driving license in your profile to proceed with Self Drive booking!");
                navigate('/customer/profile');
                return;
            }
        }

        const finalPrice = (isNewCustomer && discountedPrice > 0) ? discountedPrice : totalPrice;

        const newBooking = {
            id: Date.now(),
            carId: id,
            userId: user.id,
            userName: user.name || 'User',
            userEmail: user.email || 'N/A',
            fromDate: fromDate,
            toDate: toDate,
            totalPrice: finalPrice,
            originalPrice: totalPrice,
            discountApplied: isNewCustomer && discountedPrice > 0 ? '30%' : null,
            status: 'Pending',
            carBrand: car.brand,
            carModel: car.model,
            carImage: car.imageUrl,
            bookingType: bookingType === 'self' ? 'SELF_DRIVE' : 'WITH_DRIVER'
        };

        // Navigate to payment page with booking details
        navigate('/payment', { state: { booking: newBooking } });
    };

    if (!car) return <div className="text-center mt-2">Loading...</div>;

    return (
        <div className="container fade-in" style={{ paddingTop: '2rem' }}>
            <div className="card" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '300px' }}>
                    <img src={car.imageUrl} alt={car.brand} style={{ width: '100%', borderRadius: '12px' }} />
                </div>
                <div style={{ flex: '1', minWidth: '300px' }}>
                    <h2 className="text-primary">{car.brand} {car.model}</h2>
                    <p>{car.description}</p>

                    <div className="car-info" style={{ margin: '1rem 0', gap: '8px', display: 'flex' }}>
                        <span className="car-type" style={{ color: 'var(--text-color)' }}>{car.year}</span>
                        <span className="car-type" style={{ color: 'var(--text-color)' }}>{car.transmission}</span>
                        <span className="car-type" style={{ color: 'var(--text-color)' }}>{car.fuelType}</span>
                        <span className="car-type" style={{ color: 'var(--text-color)' }}>{car.color}</span>
                    </div>

                    <h3 className="text-secondary" style={{ marginBottom: '2rem' }}>₹{car.pricePerDay} / Day</h3>

                    <div className="form-group">
                        <label className="form-label">From Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={fromDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={e => setFromDate(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">To Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={toDate}
                            min={fromDate || new Date().toISOString().split('T')[0]}
                            onChange={e => setToDate(e.target.value)}
                        />
                    </div>

                    {dateError && (
                        <div style={{ color: '#dc2626', fontSize: '0.9rem', marginTop: '-1rem', marginBottom: '1rem' }}>
                            {dateError}
                        </div>
                    )}

                    <div className="booking-type-selection" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div
                            onClick={() => setBookingType('self')}
                            style={{
                                padding: '1rem',
                                borderRadius: '8px',
                                border: bookingType === 'self' ? '2px solid #22c55e' : '1px solid #e2e8f0',
                                backgroundColor: bookingType === 'self' ? '#f0fdf4' : '#fff',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <h4 style={{ margin: 0, color: bookingType === 'self' ? '#166534' : '#1e293b' }}>Self Drive</h4>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>
                                You drive the car yourself. Valid driving licence required.
                            </p>
                        </div>

                        <div
                            onClick={() => setBookingType('driver')}
                            style={{
                                padding: '1rem',
                                borderRadius: '8px',
                                border: bookingType === 'driver' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                                backgroundColor: bookingType === 'driver' ? '#eff6ff' : '#fff',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <h4 style={{ margin: 0, color: bookingType === 'driver' ? '#1e40af' : '#1e293b' }}>With Driver</h4>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>
                                A professional driver will be provided.
                            </p>
                        </div>
                    </div>

                    {isNewCustomer && totalPrice > 0 && (
                        <div className="price-comparison" style={{
                            background: 'linear-gradient(to right, #e0e7ff, #f3e8ff)',
                            border: '2px solid #6366f1',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            marginBottom: '2rem',
                            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.2)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '0',
                                right: '0',
                                background: '#dc2626',
                                color: 'white',
                                padding: '0.4rem 1.2rem',
                                borderBottomLeftRadius: '12px',
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                            }}>
                                30% OFF
                            </div>

                            <h3 style={{
                                fontSize: '1.3rem',
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#4338ca'
                            }}>
                                <span>🎉</span> First 5 Bookings Special!
                            </h3>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ color: '#64748b' }}>
                                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Original Price</p>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '1.5rem',
                                        textDecoration: 'line-through',
                                        color: '#94a3b8',
                                        fontWeight: '500'
                                    }}>
                                        ₹{totalPrice}
                                    </p>
                                </div>

                                <div style={{ fontSize: '2rem', color: '#6366f1' }}>➔</div>

                                <div>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#4338ca', fontWeight: 'bold' }}>You Pay Only</p>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '2.2rem',
                                        fontWeight: '800',
                                        color: '#4f46e5',
                                        textShadow: '0 2px 4px rgba(79, 70, 229, 0.2)'
                                    }}>
                                        ₹{discountedPrice}
                                    </p>
                                </div>
                            </div>

                            <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px dashed #a5b4fc', color: '#4338ca', fontSize: '0.95rem' }}>
                                You are saving <span style={{ fontWeight: 'bold' }}>₹{totalPrice - discountedPrice}</span> on this booking!
                            </div>
                        </div>
                    )}

                    {!isNewCustomer && totalPrice > 0 && (
                        <div className="total-price-box" style={{ background: 'var(--surface-color)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--primary-color)' }}>
                            <h4>Total Price: <span className="text-primary">₹{totalPrice}</span></h4>
                        </div>
                    )}

                    <button className="btn btn-primary w-full" onClick={handleBook} style={{
                        fontSize: '1.1rem',
                        padding: '0.8rem',
                        background: (isNewCustomer && totalPrice > 0) ? 'linear-gradient(to right, #4f46e5, #7c3aed)' : 'var(--primary-color)'
                    }}>
                        {isNewCustomer && totalPrice > 0 ? `Pay ₹${discountedPrice} & Book Now` : 'Confirm Booking'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookCar;
