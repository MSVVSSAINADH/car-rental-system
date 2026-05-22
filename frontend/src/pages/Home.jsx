import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState(null);

    const featuredCars = [
        {
            id: 1,
            brand: 'Mahindra',
            model: 'XUV 700',
            type: 'SUV',
            price: 4500,
            image: 'https://images.unsplash.com/photo-1633511048108-723223cb290e?q=80&w=1000&auto=format&fit=crop'
        },
        {
            id: 2,
            brand: 'Tata',
            model: 'Nexon EV',
            type: 'Electric SUV',
            price: 3000,
            image: 'https://images.unsplash.com/photo-1627454819213-1b913d80638d?q=80&w=1000&auto=format&fit=crop'
        },
        {
            id: 3,
            brand: 'Mahindra',
            model: 'Thar',
            type: 'Off-Road',
            price: 5500,
            image: 'https://images.unsplash.com/photo-1619864273822-e2d1264c1257?q=80&w=1000&auto=format&fit=crop'
        },
        {
            id: 4,
            brand: 'Tata',
            model: 'Harrier',
            type: 'Premium SUV',
            price: 4000,
            image: 'https://images.unsplash.com/photo-1590362891991-f776e73c8801?q=80&w=1000&auto=format&fit=crop'
        }
    ];

    const faqs = [
        {
            question: "What documents do I need to rent a car?",
            answer: "You need a valid driving license (minimum 1 year old), Aadhaar card, and a refundable security deposit. For verification, we may also ask for a recent utility bill."
        },
        {
            question: "Is there a minimum rental period?",
            answer: "Yes, the minimum rental period is 24 hours. However, we offer flexible hourly packages for shorter durations in select cities."
        },
        {
            question: "What is your fuel policy?",
            answer: "All cars are provided with a full tank. You need to return the car with a full tank, or we'll charge for the fuel consumed plus a service fee."
        },
        {
            question: "Can I extend my booking?",
            answer: "Yes, you can extend your booking subject to availability. Please contact our support team at least 6 hours before your scheduled return time."
        },
        {
            question: "What happens if I meet with an accident?",
            answer: "All our cars are insured. In case of an accident, immediately inform us and file an FIR. Our 24/7 support team will guide you through the process."
        }
    ];

    return (
        <div className="home-container fade-in">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Experience the Thrill of <span className="text-primary">Indian Roads</span></h1>
                    <p className="hero-subtitle">Premium Self-Drive Car Rentals. From Rugged SUVs to City Hatchbacks.</p>
                    <button className="btn btn-primary hero-btn" onClick={() => navigate('/signup')}>Start Your Journey</button>
                </div>
            </div>

            {/* How It Works Section */}
            <div className="section-container" id="how-it-works">
                <h2 className="section-title text-center">How It <span className="text-primary">Works</span></h2>
                <p className="section-subtitle">Rent a car in 3 simple steps</p>
                <div className="how-it-works-grid">
                    <div className="step-card">
                        <div className="step-number">1</div>
                        <div className="step-icon">🔍</div>
                        <h3>Browse & Select</h3>
                        <p>Choose from our wide range of verified cars. Filter by brand, type, or price to find your perfect ride.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">2</div>
                        <div className="step-icon">📅</div>
                        <h3>Book Online</h3>
                        <p>Select your dates, complete the booking in minutes. Pay securely online with multiple payment options.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">3</div>
                        <div className="step-icon">🚗</div>
                        <h3>Drive Away</h3>
                        <p>Pick up your car and hit the road. Enjoy unlimited kilometers and 24/7 roadside assistance.</p>
                    </div>
                </div>
            </div>

            {/* Featured Cars Section */}
            <div className="section-container">
                <h2 className="section-title text-center">Featured <span className="text-primary">Indian Fleet</span></h2>
                <div className="cars-grid">
                    {featuredCars.map(car => (
                        <div key={car.id} className="car-card card">
                            <div className="car-image" style={{ backgroundImage: `url(${car.image})` }}></div>
                            <div className="car-details">
                                <div>
                                    <h3>{car.brand} {car.model}</h3>
                                    <span className="car-type">{car.type}</span>
                                </div>
                                <div className="flex-center" style={{ justifyContent: 'space-between', marginTop: '1rem' }}>
                                    <p className="car-price" style={{ marginBottom: 0 }}>₹{car.price}/day</p>
                                    <button className="btn btn-primary" onClick={() => navigate('/login')}>Book Now</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Price Comparison Section */}
            <div className="section-container" style={{ background: 'linear-gradient(to bottom, #f8fafc, #ffffff)' }}>
                <div className="container">
                    <h2 className="section-title text-center">Unbeatable <span className="text-primary">Price Guarantee</span></h2>
                    <p className="section-subtitle">Why pay more? See how we compare to the competition.</p>

                    <div className="price-comparison-card" style={{
                        maxWidth: '800px',
                        margin: '3rem auto',
                        padding: '2rem',
                        borderRadius: '24px',
                        background: 'white',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                        border: '1px solid rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '300px', gap: '2rem' }}>
                            {/* Competitor A */}
                            <div style={{ width: '120px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                <span style={{ marginBottom: '10px', fontWeight: 'bold', color: '#64748b' }}>₹2,800</span>
                                <div style={{ width: '60px', height: '60%', background: '#e2e8f0', borderRadius: '12px 12px 0 0', position: 'relative' }}></div>
                                <span style={{ marginTop: '15px', color: '#94a3b8', fontWeight: '600' }}>Competitor A</span>
                            </div>

                            {/* Us - Highlighted */}
                            <div style={{ width: '140px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', zIndex: 1 }}>
                                <div style={{
                                    background: '#10b981',
                                    color: 'white',
                                    padding: '6px 16px',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    marginBottom: '10px',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                }}>
                                    BEST CHOICE
                                </div>
                                <span style={{ marginBottom: '10px', fontWeight: '800', fontSize: '1.4rem', color: 'var(--primary-color)' }}>₹2,000</span>
                                <div style={{
                                    width: '80px',
                                    height: '85%',
                                    background: 'var(--primary-color)',
                                    borderRadius: '16px 16px 0 0',
                                    position: 'relative',
                                    boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)'
                                }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)', borderRadius: '16px 16px 0 0' }}></div>
                                </div>
                                <span style={{ marginTop: '15px', color: 'var(--primary-color)', fontWeight: '800', fontSize: '1.1rem' }}>RentCar</span>
                            </div>

                            {/* Competitor B */}
                            <div style={{ width: '120px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                <span style={{ marginBottom: '10px', fontWeight: 'bold', color: '#64748b' }}>₹3,200</span>
                                <div style={{ width: '60px', height: '50%', background: '#e2e8f0', borderRadius: '12px 12px 0 0', position: 'relative' }}></div>
                                <span style={{ marginTop: '15px', color: '#94a3b8', fontWeight: '600' }}>Competitor B</span>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '3rem', padding: '1.5rem', background: '#f0fdf4', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
                            <h3 style={{ color: '#15803d', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                <span>🎉</span> You save up to <span style={{ fontWeight: '800', textDecoration: 'underline' }}>40%</span> on every booking!
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Why Choose Us Section */}
            <div className="features-section">
                <div className="container">
                    <h2 className="section-title text-center">Why Choose <span className="text-primary">CarRentalX</span></h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">💰</div>
                            <h3>Best Prices</h3>
                            <p>Transparent pricing with no hidden charges. Get the best deals in the market.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🛡️</div>
                            <h3>Verified Cars</h3>
                            <p>All cars are regularly serviced and sanitized for your safety and comfort.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🌟</div>
                            <h3>Wide Selection</h3>
                            <p>From hatchbacks to luxury SUVs. Choose from 500+ cars across India.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">⏰</div>
                            <h3>24/7 Support</h3>
                            <p>Round-the-clock customer support and roadside assistance whenever you need.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🔒</div>
                            <h3>Zero Deposit</h3>
                            <p>Book without blocking your money. Flexible payment options available.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">📱</div>
                            <h3>Easy Booking</h3>
                            <p>Book in under 2 minutes. Instant confirmation and digital documentation.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="section-container">
                <h2 className="section-title text-center">What Our <span className="text-primary">Customers Say</span></h2>
                <div className="testimonials-grid">
                    <div className="testimonial-card">
                        <div className="stars">⭐⭐⭐⭐⭐</div>
                        <p className="testimonial-text">"Amazing experience! The Thar was in perfect condition and the booking process was seamless. Will definitely rent again!"</p>
                        <div className="testimonial-author">
                            <strong>Rahul Sharma</strong>
                            <span>Mumbai</span>
                        </div>
                    </div>
                    <div className="testimonial-card">
                        <div className="stars">⭐⭐⭐⭐⭐</div>
                        <p className="testimonial-text">"Best car rental service in India. Great prices, clean cars, and excellent customer support. Highly recommended!"</p>
                        <div className="testimonial-author">
                            <strong>Priya Patel</strong>
                            <span>Bangalore</span>
                        </div>
                    </div>
                    <div className="testimonial-card">
                        <div className="stars">⭐⭐⭐⭐⭐</div>
                        <p className="testimonial-text">"Used CarRentalX for my Goa trip. The XUV 700 was fantastic and the unlimited kilometers feature was a lifesaver!"</p>
                        <div className="testimonial-author">
                            <strong>Amit Kumar</strong>
                            <span>Delhi</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="faq-section" id="faq">
                <div className="container">
                    <h2 className="section-title text-center">Frequently Asked <span className="text-primary">Questions</span></h2>
                    <div className="faq-container">
                        {faqs.map((faq, index) => (
                            <div key={index} className={`faq-item ${openFaq === index ? 'active' : ''}`}>
                                <div className="faq-question" onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                                    <h3>{faq.question}</h3>
                                    <span className="faq-toggle">{openFaq === index ? '−' : '+'}</span>
                                </div>
                                {openFaq === index && (
                                    <div className="faq-answer">
                                        <p>{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="cta-section">
                <div className="container text-center">
                    <h2>Ready to Hit the Road?</h2>
                    <p>Join thousands of happy customers and experience the freedom of self-drive car rentals</p>
                    <button className="btn btn-primary btn-large" onClick={() => navigate('/signup')}>
                        Get Started Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
