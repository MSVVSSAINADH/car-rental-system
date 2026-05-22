import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../auth/Auth.css'; // Reuse auth form styles for simplicity but inside container

const AddCar = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        color: '',
        year: '',
        transmission: 'Automatic',
        fuelType: 'Petrol',
        pricePerDay: '',
        description: '',
        imageUrl: '',
        seats: '',
        category: 'Economy'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/car', formData);
            navigate('/admin/dashboard');
        } catch (err) {
            console.error(err);
            alert('Error adding car');
        }
    };

    return (
        <div className="container fade-in" style={{ padding: '2rem 0', maxWidth: '600px' }}>
            <div className="card">
                <h2 className="text-center" style={{ marginBottom: '2rem' }}>Post New Car</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Brand</label>
                        <input name="brand" value={formData.brand} onChange={handleChange} className="form-input" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Model</label>
                        <input name="model" value={formData.model} onChange={handleChange} className="form-input" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Color</label>
                        <input name="color" value={formData.color} onChange={handleChange} className="form-input" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Year</label>
                        <input type="number" name="year" value={formData.year} onChange={handleChange} className="form-input" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Transmission</label>
                        <select name="transmission" value={formData.transmission} onChange={handleChange} className="form-input">
                            <option value="Automatic">Automatic</option>
                            <option value="Manual">Manual</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Fuel Type</label>
                        <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="form-input">
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Electric">Electric</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Seats</label>
                        <input type="number" name="seats" value={formData.seats} onChange={handleChange} className="form-input" required min="1" max="10" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select name="category" value={formData.category} onChange={handleChange} className="form-input">
                            <option value="Economy">Economy</option>
                            <option value="Premium">Premium</option>
                            <option value="Luxury">Luxury</option>
                            <option value="Electric">Electric</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Price Per Day</label>
                        <input type="number" name="pricePerDay" value={formData.pricePerDay} onChange={handleChange} className="form-input" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="form-input" rows="3"></textarea>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Image URL</label>
                        <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="form-input" required />
                    </div>
                    <button type="submit" className="btn btn-primary w-full">Post Car</button>
                </form>
            </div>
        </div>
    );
};

export default AddCar;
