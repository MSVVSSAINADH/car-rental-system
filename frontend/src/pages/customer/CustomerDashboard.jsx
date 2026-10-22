{/*import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import CarImage from '../../components/CarImage';
import './CustomerDashboard.css';

const SkeletonCard = () => (
    <div className="car-card skeleton-card">
        <div className="skeleton skeleton-img" />
        <div style={{ padding: '1.25rem' }}>
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text w-75" />
            <div className="skeleton skeleton-text w-50" style={{ marginTop: 12 }} />
        </div>
    </div>
);

const CATEGORIES = ['All', 'Economy', 'Premium', 'Luxury', 'Electric'];

const CustomerDashboard = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [fuelFilter, setFuelFilter] = useState([]);
    const [transFilter, setTransFilter] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 15000 });
    const [sortBy, setSortBy] = useState('newest');
    const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('likedCars')) || []);
    const [showFilters, setShowFilters] = useState(false);
    const navigate = useNavigate();

    useEffect(() => { fetchCars(); }, []);
    useEffect(() => { localStorage.setItem('likedCars', JSON.stringify(favorites)); }, [favorites]);

    const fetchCars = async () => {
        setLoading(true);
        try {
            const res = await api.get('/customer/cars');
            setCars(Array.isArray(res.data) ? res.data.filter(c => c.available !== false) : []);
        } catch (e) { console.error(e); setCars([]); }
        finally { setLoading(false); }
    };

    const fuelTypes = [...new Set(cars.map(c => c.fuelType).filter(Boolean))];
    const transmissions = [...new Set(cars.map(c => c.transmission).filter(Boolean))];

    const toggleFilter = (val, arr, setArr) => {
        setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
    };

    const filtered = cars.filter(car => {
        if (category !== 'All' && car.category !== category) return false;
        if (search) {
            const t = search.toLowerCase();
            if (!car.brand?.toLowerCase().includes(t) && !car.model?.toLowerCase().includes(t) && !car.color?.toLowerCase().includes(t)) return false;
        }
        if (fuelFilter.length && !fuelFilter.includes(car.fuelType)) return false;
        if (transFilter.length && !transFilter.includes(car.transmission)) return false;
        if (car.pricePerDay < priceRange.min || car.pricePerDay > priceRange.max) return false;
        return true;
    }).sort((a, b) => {
        if (sortBy === 'lowest') return a.pricePerDay - b.pricePerDay;
        if (sortBy === 'highest') return b.pricePerDay - a.pricePerDay;
        if (sortBy === 'name') return a.brand?.localeCompare(b.brand);
        return b.year - a.year;
    });

    return (
        <div className="fade-in">
            {/* Category Pills */}
            {/*<div className="category-bar">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        className={`category-pill ${category === cat ? 'active' : ''}`}
                        onClick={() => setCategory(cat)}
                    >
                        {cat === 'Electric' ? '⚡' : cat === 'Luxury' ? '💎' : cat === 'Premium' ? '⭐' : cat === 'Economy' ? '💰' : '🚘'} {cat}
                    </button>
                ))}
            </div>

            <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '4rem' }}>
                {/* Action Bar */}{/*
                <div className="cd-action-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <button className={`btn btn-sm btn-secondary ${showFilters ? 'btn-outline' : ''}`} onClick={() => setShowFilters(!showFilters)}>
                            🔍 Filters
                        </button>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{loading ? '...' : `${filtered.length} cars`}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input
                            className="form-input"
                            style={{ width: 200, padding: '8px 12px', fontSize: '0.9rem' }}
                            placeholder="Search brand, model..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <select className="form-select" style={{ width: 160, padding: '8px 12px', fontSize: '0.9rem' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                            <option value="newest">Newest</option>
                            <option value="lowest">Price ↑</option>
                            <option value="highest">Price ↓</option>
                            <option value="name">Name A-Z</option>
                        </select>
                    </div>
                </div>

                <div className="cd-main">
                    {/* Filter Sidebar */}{/*
                    {showFilters && (
                        <aside className="cd-filters fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <strong style={{ fontSize: '0.95rem' }}>Filters</strong>
                                <button className="btn btn-sm btn-secondary" onClick={() => {
                                    setFuelFilter([]); setTransFilter([]);
                                    setPriceRange({ min: 0, max: 15000 });
                                }}>Clear</button>
                            </div>
                            <div className="filter-group">
                                <div className="filter-title">Price Range (₹/day)</div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <input className="form-input" type="number" placeholder="Min" value={priceRange.min}
                                        onChange={e => setPriceRange(p => ({ ...p, min: +e.target.value }))} style={{ fontSize: '0.85rem', padding: '7px 10px' }} />
                                    <input className="form-input" type="number" placeholder="Max" value={priceRange.max}
                                        onChange={e => setPriceRange(p => ({ ...p, max: +e.target.value }))} style={{ fontSize: '0.85rem', padding: '7px 10px' }} />
                                </div>
                            </div>
                            {transmissions.length > 0 && (
                                <div className="filter-group">
                                    <div className="filter-title">Transmission</div>
                                    {transmissions.map(t => (
                                        <label key={t} className="filter-checkbox">
                                            <input type="checkbox" checked={transFilter.includes(t)} onChange={() => toggleFilter(t, transFilter, setTransFilter)} />
                                            {t}
                                        </label>
                                    ))}
                                </div>
                            )}
                            {fuelTypes.length > 0 && (
                                <div className="filter-group">
                                    <div className="filter-title">Fuel Type</div>
                                    {fuelTypes.map(f => (
                                        <label key={f} className="filter-checkbox">
                                            <input type="checkbox" checked={fuelFilter.includes(f)} onChange={() => toggleFilter(f, fuelFilter, setFuelFilter)} />
                                            {f}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </aside>
                    )}

                    {/* Cars Grid */}{/*
                    <div className="cars-grid" style={{ flex: 1 }}>
                        {loading ? (
                            [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
                        ) : filtered.length === 0 ? (
                            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                                <div className="empty-state-icon">🔍</div>
                                <h3>No cars match your filters</h3>
                                <p>Try adjusting your search criteria</p>
                                <button className="btn btn-primary" onClick={() => { setSearch(''); setCategory('All'); setFuelFilter([]); setTransFilter([]); }}>Reset Filters</button>
                            </div>
                        ) : filtered.map(car => (
                            <div key={car.id} className="car-card fade-in-up" onClick={() => navigate(`/customer/book/${car.id}`)}>
                                <button
                                    className={`favorite-btn ${favorites.includes(car.id) ? 'active' : ''}`}
                                    onClick={e => { e.stopPropagation(); setFavorites(f => f.includes(car.id) ? f.filter(x => x !== car.id) : [...f, car.id]); }}
                                >♥</button>
                                <div className="car-image">
                                    <CarImage
                                        imageUrl={car.imageUrl}
                                        brand={car.brand}
                                        model={car.model}
                                        className="car-image-fill"
                                    />
                                    {car.category && (
                                        <span className="car-category-tag">{car.category}</span>
                                    )}
                                </div>
                                <div className="car-details">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem' }}>{car.brand} {car.model}</h3>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '2px 0' }}>{car.color} · {car.year}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p className="car-price" style={{ margin: 0, fontSize: '1.2rem' }}>₹{car.pricePerDay}</p>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/day</span>
                                        </div>
                                    </div>
                                    <div className="car-info" style={{ marginTop: '0.75rem' }}>
                                        <span>{car.transmission}</span>
                                        <span>{car.fuelType}</span>
                                        {car.seats > 0 && <span>{car.seats} seats</span>}
                                    </div>
                                    <button className="btn btn-primary w-full" style={{ marginTop: '1rem', padding: '10px' }}>Book Now →</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;*/}

import Cars from '../Cars'

export default Cars