import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        // Show loading spinner while auth state resolves
        return (
            <div className="loading-screen">
                <div className="loading-spinner" />
                <p>Loading…</p>
            </div>
        );
    }

    return currentUser ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
