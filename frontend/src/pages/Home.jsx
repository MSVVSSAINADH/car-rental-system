import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CarImage from '../components/CarImage';
import './Home.css';

const faqs = [
    { question: 'How do I request a car booking?', answer: 'Choose a car, select your rental dates and booking type, then submit the request. The booking remains pending until an administrator reviews it.' },
    { question: 'Does the app take payment online?', answer: 'Online payment is not configured. Submitting a booking request does not charge you.' },
    { question: 'What is the new customer offer?', answer: 'Customers with fewer than five existing bookings receive a 30% discount. The server calculates the final booking price.' },
    { question: 'Do I need a driving licence?', answer: 'A licence image is required for Self Drive bookings. Upload it from your profile; images must be smaller than 500 KB.' },
    { question: 'Can I book with a driver?', answer: 'Yes. Select With Driver when choosing the booking type.' }
];

const Home = () => {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState(null);
    const [featuredCars, setFeaturedCars] = useState([]);
    const [loadingCars, setLoadingCars] = useState(true);
    const [fleetError, setFleetError] = useState(false);

    useEffect(() => {
        let active = true;
        api.get('/customer/cars')
            .then(({ data }) => {
                if (active) setFeaturedCars((Array.isArray(data) ? data : []).filter(car => car.available).slice(0, 4));
            })
            .catch(() => {
                if (active) {
                    setFeaturedCars([]);
                    setFleetError(true);
                }
            })
            .finally(() => { if (active) setLoadingCars(false); });
        return () => { active = false; };
    }, []);

    return (
        <div className="home-container fade-in">
            <div className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Find a car for your <span className="text-primary">next trip</span></h1>
                    <p className="hero-subtitle">Browse the current fleet and submit a rental request for administrator approval.</p>
                    <button className="btn btn-primary hero-btn" onClick={() => navigate('/signup')}>Create an account</button>
                </div>
            </div>

            <section className="section-container" id="how-it-works">
                <h2 className="section-title text-center">How It <span className="text-primary">Works</span></h2>
                <p className="section-subtitle">Three steps to request a booking</p>
                <div className="how-it-works-grid">
                    {[
                        ['🔍', 'Browse cars', 'Review current vehicle details and per-day prices.'],
                        ['📅', 'Submit a request', 'Select dates and a booking type. Eligible new customers receive a 30% discount.'],
                        ['🚗', 'Wait for review', 'An administrator reviews the request. Its status appears in your bookings.']
                    ].map(([icon, title, description], index) => (
                        <div className="step-card" key={title}>
                            <div className="step-number">{index + 1}</div>
                            <div className="step-icon" aria-hidden="true">{icon}</div>
                            <h3>{title}</h3>
                            <p>{description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="section-container">
                <h2 className="section-title text-center">Available <span className="text-primary">Cars</span></h2>
                {loadingCars ? <p className="section-subtitle text-center">Loading the current fleet...</p> : featuredCars.length ? (
                    <div className="cars-grid">
                        {featuredCars.map(car => (
                            <div key={car.id} className="car-card card">
                                <div className="car-image">
                                    <CarImage
                                        imageUrl={car.imageUrl}
                                        brand={car.brand}
                                        model={car.model}
                                        className="car-image-fill"
                                    />
                                </div>
                                <div className="car-details">
                                    <div>
                                        <h3>{car.brand} {car.model}</h3>
                                        {car.category && <span className="car-type">{car.category}</span>}
                                    </div>
                                    <div className="flex-center" style={{ justifyContent: 'space-between', marginTop: '1rem' }}>
                                        <p className="car-price" style={{ marginBottom: 0 }}>₹{car.pricePerDay}/day</p>
                                        <button className="btn btn-primary" onClick={() => navigate('/login')}>Sign in to book</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p className="section-subtitle text-center">{fleetError ? 'The fleet could not be loaded. Please try again later.' : 'No cars are currently available.'}</p>}
            </section>

            <section className="features-section">
                <div className="container">
                    <h2 className="section-title text-center">Booking <span className="text-primary">Features</span></h2>
                    <div className="features-grid">
                        <div className="feature-card"><div className="feature-icon" aria-hidden="true">📋</div><h3>Booking review</h3><p>Requests stay pending until an administrator approves or rejects them.</p></div>
                        <div className="feature-card"><div className="feature-icon" aria-hidden="true">🎉</div><h3>New customer offer</h3><p>Eligible customers receive 30% off their first five bookings.</p></div>
                        <div className="feature-card"><div className="feature-icon" aria-hidden="true">🪪</div><h3>Profile documents</h3><p>Customers can upload a profile photo and driving licence image.</p></div>
                    </div>
                </div>
            </section>

            <section className="faq-section" id="faq">
                <div className="container">
                    <h2 className="section-title text-center">Frequently Asked <span className="text-primary">Questions</span></h2>
                    <div className="faq-container">
                        {faqs.map((faq, index) => (
                            <div key={faq.question} className={`faq-item ${openFaq === index ? 'active' : ''}`}>
                                <button className="faq-question" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                                    <h3>{faq.question}</h3><span className="faq-toggle" aria-hidden="true">{openFaq === index ? '−' : '+'}</span>
                                </button>
                                {openFaq === index && <div className="faq-answer"><p>{faq.answer}</p></div>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="cta-section">
                <div className="container text-center">
                    <h2>Ready to request a booking?</h2>
                    <p>Create an account to browse cars and track booking requests.</p>
                    <button className="btn btn-primary btn-large" onClick={() => navigate('/signup')}>Get started</button>
                </div>
            </section>
        </div>
    );
};

export default Home;
