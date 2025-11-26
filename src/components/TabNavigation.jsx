import React from 'react';
import { NavLink } from 'react-router-dom';
import './TabNavigation.css';

export const TabNavigation = () => {
    return (
        <nav className="tab-navigation">
            <NavLink to="/" className={({ isActive }) => isActive ? 'tab-item active' : 'tab-item'} end>
                <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span className="tab-label">Dashboard</span>
            </NavLink>

            <NavLink to="/transactions" className={({ isActive }) => isActive ? 'tab-item active' : 'tab-item'}>
                <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <polyline points="19 12 12 19 5 12"></polyline>
                </svg>
                <span className="tab-label">Transactions</span>
            </NavLink>

            <NavLink to="/budget" className={({ isActive }) => isActive ? 'tab-item active' : 'tab-item'}>
                <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                </svg>
                <span className="tab-label">Budget</span>
            </NavLink>

            <NavLink to="/reports" className={({ isActive }) => isActive ? 'tab-item active' : 'tab-item'}>
                <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                <span className="tab-label">Reports</span>
            </NavLink>

            <NavLink to="/settings" className={({ isActive }) => isActive ? 'tab-item active' : 'tab-item'}>
                <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M12 1v6m0 6v6m8.66-15l-3 5.196M6.34 15.804l-3 5.196M23 12h-6m-6 0H5m15.66 8.66l-3-5.196M6.34 8.196l-3-5.196"></path>
                </svg>
                <span className="tab-label">Settings</span>
            </NavLink>
        </nav>
    );
};
