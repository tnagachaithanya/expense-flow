import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from '../context/GlobalState';
import { ThemeManager } from '../utils/ThemeManager';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

export const Settings = () => {
    const { settings, updateSettings, transactions, budgets, goals } = useContext(GlobalContext);
    const { currentUser, logout } = useAuth();
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [currentTheme, setCurrentTheme] = useState(ThemeManager.getTheme());
    const navigate = useNavigate();

    const currencies = [
        { code: 'USD', symbol: '$', name: 'US Dollar' },
        { code: 'EUR', symbol: '€', name: 'Euro' },
        { code: 'GBP', symbol: '£', name: 'British Pound' },
        { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
        { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
        { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
        { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
    ];

    const handleSettingChange = (key, value) => {
        updateSettings({ [key]: value });
    };

    const handleThemeChange = (theme) => {
        ThemeManager.applyTheme(theme);
        setCurrentTheme(theme);
        handleSettingChange('theme', theme);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const exportAllData = () => {
        const data = {
            transactions,
            budgets,
            goals,
            settings,
            exportDate: new Date().toISOString()
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expenseflow-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    const clearAllData = () => {
        if (showClearConfirm) {
            localStorage.clear();
            window.location.reload();
        } else {
            setShowClearConfirm(true);
            setTimeout(() => setShowClearConfirm(false), 5000);
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-header glass-panel">
                <h2>Settings</h2>
                <p className="settings-subtitle">Customize your ExpenseFlow experience</p>
            </div>

            {/* Account Section */}
            <div className="settings-section glass-panel">
                <h3 className="section-title">👤 Account</h3>

                <div className="setting-item">
                    <div className="setting-info">
                        <label className="setting-label">Email</label>
                        <p className="setting-description">{currentUser?.email}</p>
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <label className="setting-label">Sign Out</label>
                        <p className="setting-description">Log out of your account</p>
                    </div>
                    <button className="btn btn-secondary" onClick={handleLogout}>
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Display Preferences */}
            <div className="settings-section glass-panel">
                <h3 className="section-title">💎 Display Preferences</h3>

                <div className="setting-item">
                    <div className="setting-info">
                        <label className="setting-label">Currency</label>
                        <p className="setting-description">Choose your preferred currency</p>
                    </div>
                    <select
                        className="setting-select"
                        value={settings.currency}
                        onChange={(e) => handleSettingChange('currency', e.target.value)}
                    >
                        {currencies.map(curr => (
                            <option key={curr.code} value={curr.code}>
                                {curr.symbol} {curr.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <label className="setting-label">Theme</label>
                        <p className="setting-description">Switch between light and dark mode</p>
                    </div>
                    <div className="toggle-switch">
                        <button
                            className={`toggle-option ${currentTheme === 'dark' ? 'active' : ''}`}
                            onClick={() => handleThemeChange('dark')}
                        >
                            🌙 Dark
                        </button>
                        <button
                            className={`toggle-option ${currentTheme === 'light' ? 'active' : ''}`}
                            onClick={() => handleThemeChange('light')}
                        >
                            ☀️ Light
                        </button>
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <label className="setting-label">Default Category</label>
                        <p className="setting-description">Default category for new transactions</p>
                    </div>
                    <select
                        className="setting-select"
                        value={settings.defaultCategory}
                        onChange={(e) => handleSettingChange('defaultCategory', e.target.value)}
                    >
                        <option value="Uncategorized">Uncategorized</option>
                        <option value="Groceries">Groceries</option>
                        <option value="Restaurants">Restaurants</option>
                        <option value="Bills">Bills</option>
                        <option value="Medicine">Medicine</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>

            {/* Notifications */}
            <div className="settings-section glass-panel">
                <h3 className="section-title">🔔 Notifications</h3>

                <div className="setting-item">
                    <div className="setting-info">
                        <label className="setting-label">Budget Alerts</label>
                        <p className="setting-description">Get notified when approaching budget limits</p>
                    </div>
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={settings.notifications}
                            onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                        />
                        <span className="slider"></span>
                    </label>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <label className="setting-label">Warning Threshold</label>
                        <p className="setting-description">Alert when budget reaches this percentage</p>
                    </div>
                    <select
                        className="setting-select"
                        value={settings.warningThreshold || 80}
                        onChange={(e) => handleSettingChange('warningThreshold', parseInt(e.target.value))}
                    >
                        <option value="70">70%</option>
                        <option value="80">80%</option>
                        <option value="90">90%</option>
                        <option value="100">100%</option>
                    </select>
                </div>
            </div>

            {/* Data Management */}
            <div className="settings-section glass-panel">
                <h3 className="section-title">💾 Data Management</h3>

                <div className="setting-item">
                    <div className="setting-info">
                        <label className="setting-label">Export Data</label>
                        <p className="setting-description">Download all your data as JSON backup</p>
                    </div>
                    <button className="btn btn-secondary" onClick={exportAllData}>
                        📥 Export
                    </button>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <label className="setting-label">Data Summary</label>
                        <p className="setting-description">
                            {transactions.length} transactions, {budgets.length} budgets, {goals.length} goals
                        </p>
                    </div>
                </div>

                <div className="setting-item danger-zone">
                    <div className="setting-info">
                        <label className="setting-label">⚠️ Clear All Data</label>
                        <p className="setting-description">
                            {showClearConfirm
                                ? 'Click again to confirm deletion'
                                : 'Permanently delete all transactions, budgets, and settings'}
                        </p>
                    </div>
                    <button
                        className={`btn ${showClearConfirm ? 'btn-danger-confirm' : 'btn-danger'}`}
                        onClick={clearAllData}
                    >
                        {showClearConfirm ? '⚠️ Confirm Delete' : '🗑️ Clear Data'}
                    </button>
                </div>
            </div>

            {/* About */}
            <div className="settings-section glass-panel">
                <h3 className="section-title">ℹ️ About</h3>

                <div className="setting-item">
                    <div className="setting-info">
                        <label className="setting-label">Version</label>
                        <p className="setting-description">ExpenseFlow v1.0.0</p>
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <label className="setting-label">Made with</label>
                        <p className="setting-description">React + Vite + Recharts</p>
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <label className="setting-label">Features</label>
                        <p className="setting-description">
                            Budget tracking • Reports • Search & Filter • PWA Support
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
