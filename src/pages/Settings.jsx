import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from '../context/GlobalState';
import { ThemeManager } from '../utils/ThemeManager';
import { EXPENSE_CATEGORIES, DEFAULT_CATEGORY } from '../utils/categories';
import { CURRENCIES } from '../utils/currency';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

export const Settings = () => {
    const { settings, updateSettings, transactions, budgets, goals, categories, addCategory, deleteCategory, clearAllData: clearAllDataContext, familyInvitations } = useContext(GlobalContext);
    const { currentUser, logout } = useAuth();
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [currentTheme, setCurrentTheme] = useState(ThemeManager.getTheme());
    const [newCategory, setNewCategory] = useState('');
    const [categoryError, setCategoryError] = useState('');
    const navigate = useNavigate();

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

    const clearAllData = async () => {
        if (showClearConfirm) {
            await clearAllDataContext();
            // State will automatically update via context, no need to reload
        } else {
            setShowClearConfirm(true);
            setTimeout(() => setShowClearConfirm(false), 5000);
        }
    };

    const handleForceUpdate = async () => {
        try {
            // Unregister all service workers
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
                await registration.unregister();
            }
            // Clear caches
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
            // Navigate to home and reload
            window.location.href = window.location.origin + import.meta.env.BASE_URL;
        } catch (error) {
            console.error('Force update failed:', error);
            alert('Failed to force update. Please try closing and reopening the app.');
        }
    };

    const handleAddCategory = async () => {
        const trimmed = newCategory.trim();
        if (!trimmed) {
            setCategoryError('Category name cannot be empty');
            return;
        }
        if (categories.includes(trimmed)) {
            setCategoryError('Category already exists');
            return;
        }
        await addCategory(trimmed);
        setNewCategory('');
        setCategoryError('');
    };

    const handleDeleteCategory = async (category) => {
        if (window.confirm(`Delete category "${category}"?`)) {
            await deleteCategory(category);
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
                    <button className="btn btn-secondary btn-auto" onClick={handleLogout}>
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Family Section */}
            <div className="settings-section glass-panel">
                <h3 className="section-title">👨‍👩‍👧‍👦 Family</h3>

                <div className="setting-item">
                    <div className="setting-info">
                        <label className="setting-label">Family Sharing</label>
                        <p className="setting-description">Manage your family group and members</p>
                    </div>
                    <button className="btn btn-secondary btn-auto" onClick={() => navigate('/family')} style={{ position: 'relative' }}>
                        Manage
                        {familyInvitations && familyInvitations.length > 0 && (
                            <span className="notification-badge" style={{ top: '-8px', right: '-8px' }}>
                                {familyInvitations.length}
                            </span>
                        )}
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
                        {CURRENCIES.map(curr => (
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
                        <option value={DEFAULT_CATEGORY}>{DEFAULT_CATEGORY}</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Category Management */}
            <div className="settings-section glass-panel">
                <h3 className="section-title">📂 Category Management</h3>

                <div className="setting-item">
                    <div className="setting-info">
                        <label className="setting-label">Add New Category</label>
                        <p className="setting-description">Create custom expense categories</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexDirection: 'column', width: '100%', maxWidth: '500px' }}>
                        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                                placeholder="e.g. Travel, Gym"
                                className="form-input"
                                style={{ flex: 1 }}
                            />
                            <button className="btn btn-secondary btn-auto" onClick={handleAddCategory}>
                                Add
                            </button>
                        </div>
                        {categoryError && <p style={{ color: 'var(--error-color)', fontSize: '0.85rem', margin: 0 }}>{categoryError}</p>}
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <label className="setting-label">Current Categories</label>
                        <p className="setting-description">{categories.length} categories</p>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxWidth: '400px' }}>
                        {categories.map(cat => (
                            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--surface-bg)', padding: '5px 10px', borderRadius: '15px', fontSize: '0.9rem' }}>
                                <span>{cat}</span>
                                <button
                                    onClick={() => handleDeleteCategory(cat)}
                                    style={{ background: 'none', border: 'none', color: 'var(--error-color)', cursor: 'pointer', padding: '0 5px', fontSize: '1rem' }}
                                    aria-label={`Delete ${cat}`}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
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
                    <button className="btn btn-secondary btn-auto" onClick={exportAllData}>
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
                        className={`btn btn-auto ${showClearConfirm ? 'btn-danger-confirm' : 'btn-danger'}`}
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
                        <p className="setting-description">ExpenseFlow v1.0.1</p>
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <label className="setting-label">Force Update</label>
                        <p className="setting-description">Clear cache and reload the latest version</p>
                    </div>
                    <button className="btn btn-secondary btn-auto" onClick={handleForceUpdate}>
                        🔄 Update Now
                    </button>
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
