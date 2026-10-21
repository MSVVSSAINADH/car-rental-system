import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CarImage from '../components/CarImage';
import './Cars.css';

const CATEGORY_ORDER = ['Budget', 'Mid-range', 'Family', 'SUV', 'Electric', 'Premium'];

const SkeletonCard = () => (
    <div className="fleet-card is-skeleton" aria-hidden="true">
        <div className="skeleton fleet-skeleton-media" />
        <div className="fleet-card-body">
            <div className="skeleton skeleton-text w-50" />
            <div className="skeleton skeleton-text w-75" />
            <div className="skeleton skeleton-text" />
        </div>
    </div>
);

const Cars = () => {
    const navigate = useNavigate();
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [category, setCategory] = useState('All');

    useEffect(() => {
        let active = true;
        api.get('/customer/cars')
            .then(({ data }) => {
                if (!active) return;
                setCars((Array.isArray(data) ? data : []).filter(car => car.available !== false));
            })
            .catch(() => { if (active) setError(true); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    const categories = useMemo(() => {
        const present = new Set(cars.map(car => car.category).filter(Boolean));
        const ordered = CATEGORY_ORDER.filter(name => present.has(name));
        present.forEach(name => { if (!ordered.includes(name)) ordered.push(name); });
        return ordered;
    }, [cars]);

    const cheapest = useMemo(
        () => cars.reduce((min, car) => Math.min(min, Number(car.pricePerDay) || Infinity), Infinity),
        [cars]
    );

    const filtered = category === 'All' ? cars : cars.filter(car => car.category === category);

    const countFor = (name) => cars.filter(car => car.category === name).length;

    return (
        <div className="cars-page">
            <section className="cars-hero">
                <div className="container">
                    <p className="cars-eyebrow">The fleet</p>
                    <h1 className="cars-title">Pick the car that fits the trip.</h1>
                    <p className="cars-lede">
                        Every car below is available to request today. Choose a category, compare
                        the daily rate and send a booking for administrator approval.
                    </p>

                    {!loading && !error && cars.length > 0 && (
                        <dl className="cars-stats">
                            <div>
                                <dt>Cars available</dt>
                                <dd>{cars.length}</dd>
                            </div>
                            <div>
                                <dt>Categories</dt>
                                <dd>{categories.length}</dd>
                            </div>
                            <div>
                                <dt>Starting from</dt>
                                <dd>₹{Number.isFinite(cheapest) ? cheapest.toLocaleString('en-IN') : '—'}<span>/day</span></dd>
                            </div>
                        </dl>
                    )}
                </div>
            </section>

            <section className="container cars-body" aria-labelledby="fleet-heading">
                <div className="cars-toolbar">
                    <h2 id="fleet-heading" className="cars-toolbar-title">Browse the fleet</h2>

                    {!loading && !error && cars.length > 0 && (
                        <div className="chip-row" role="group" aria-label="Filter by category">
                            <button
                                type="button"
                                className={`chip${category === 'All' ? ' is-active' : ''}`}
                                aria-pressed={category === 'All'}
                                onClick={() => setCategory('All')}
                            >
                                All <span>{cars.length}</span>
                            </button>
                            {categories.map(name => (
                                <button
                                    key={name}
                                    type="button"
                                    className={`chip${category === name ? ' is-active' : ''}`}
                                    aria-pressed={category === name}
                                    onClick={() => setCategory(name)}
                                >
                                    {name} <span>{countFor(name)}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="fleet-grid">
                        {[...Array(6)].map((_, index) => <SkeletonCard key={index} />)}
                    </div>
                ) : error ? (
                    <div className="fleet-empty">
                        <h3>The fleet could not be loaded</h3>
                        <p>Please check that the backend is running and try again.</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="fleet-empty">
                        <h3>No cars in this category</h3>
                        <p>Try another category to see the rest of the fleet.</p>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCategory('All')}>
                            Show all cars
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="cars-result-count" aria-live="polite">
                            {filtered.length} {filtered.length === 1 ? 'car' : 'cars'}
                            {category !== 'All' ? ` in ${category}` : ' in the fleet'}
                        </p>
                        <div className="fleet-grid">
                            {filtered.map(car => (
                                <article key={car.id} className="fleet-card">
                                    <div className="fleet-card-media">
                                        <CarImage
                                            imageUrl={car.imageUrl}
                                            brand={car.brand}
                                            model={car.model}
                                            className="car-image-fill"
                                        />
                                        {car.category && <span className="fleet-badge">{car.category}</span>}
                                    </div>

                                    <div className="fleet-card-body">
                                        <div className="fleet-card-heading">
                                            <h3>{car.brand} {car.model}</h3>
                                            <span className="fleet-year">{car.year}</span>
                                        </div>

                                        <ul className="fleet-specs">
                                            <li>{car.seats} seats</li>
                                            <li>{car.transmission}</li>
                                            <li>{car.fuelType}</li>
                                        </ul>

                                        <div className="fleet-card-footer">
                                            <p className="fleet-price">
                                                ₹{Number(car.pricePerDay).toLocaleString('en-IN')}
                                                <span>/day</span>
                                            </p>
                                            <button
                                                type="button"
                                                className="btn btn-primary btn-sm"
                                                onClick={() => navigate(`/customer/book/${car.id}`)}
                                            >
                                                Book this car
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                )}
            </section>
        </div>
    );
};

export default Cars;
