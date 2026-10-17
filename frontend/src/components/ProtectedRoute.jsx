import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        return <Navigate to="/login" replace />;
    }
    let user = null;
    try {
        user = JSON.parse(userStr);
    } catch {
        return <Navigate to="/login" replace />;
    }

    if (!user || !user.token) {
        return <Navigate to="/login" replace />;
    }

    if (role && user.role !== role) {
        // Redirect to correct dashboard if wrong role
        if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
        return <Navigate to="/customer/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
