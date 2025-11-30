import React, { useState, useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { TransactionList } from '../components/TransactionList';
import { useNavigate } from 'react-router-dom';
import { EXPENSE_CATEGORIES } from '../utils/categories';
import './TransactionPage.css';

export const TransactionPage = () => {
    const { transactions, familyTransactions, family } = useContext(GlobalContext);
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('personal');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [sortBy, setSortBy] = useState('date-desc');

    const categories = ['All', ...EXPENSE_CATEGORIES, 'Uncategorized'];

    const currentTransactions = viewMode === 'family' ? (familyTransactions || []) : transactions;

    // Filter and search logic
    let filteredTransactions = currentTransactions.filter(t => {
        const matchesSearch = t.text.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
        const matchesType = filterType === 'all' ||
            (filterType === 'income' && t.amount > 0) ||
            (filterType === 'expense' && t.amount < 0);

        return matchesSearch && matchesCategory && matchesType;
    });

    // Sort logic
    filteredTransactions = [...filteredTransactions].sort((a, b) => {
        switch (sortBy) {
            case 'date-desc':
                return new Date(b.date) - new Date(a.date);
            case 'date-asc':
                return new Date(a.date) - new Date(b.date);
            case 'amount-desc':
                return Math.abs(b.amount) - Math.abs(a.amount);
            case 'amount-asc':
                return Math.abs(a.amount) - Math.abs(b.amount);
            default:
                return 0;
        }
    });

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilterCategory('all');
        setFilterType('all');
        setSortBy('date-desc');
    };

    const activeFiltersCount =
        (searchTerm ? 1 : 0) +
        (filterCategory !== 'all' ? 1 : 0) +
        (filterType !== 'all' ? 1 : 0) +
        (sortBy !== 'date-desc' ? 1 : 0);

    return (
        <div className="transaction-page">
            <div className="transaction-header glass-panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2>Transactions</h2>
                    {family && (
                        <div className="view-toggle" style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: '15px', padding: '3px' }}>
                            <button
                                onClick={() => setViewMode('personal')}
                                style={{
                                    background: viewMode === 'personal' ? 'var(--accent-color)' : 'transparent',
                                    color: viewMode === 'personal' ? 'white' : 'var(--text-secondary)',
                                    border: 'none',
                                    padding: '5px 12px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                Personal
                            </button>
                            <button
                                onClick={() => setViewMode('family')}
                                style={{
                                    background: viewMode === 'family' ? 'var(--accent-color)' : 'transparent',
                                    color: viewMode === 'family' ? 'white' : 'var(--text-secondary)',
                                    border: 'none',
                                    padding: '5px 12px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                Family
                            </button>
                        </div>
                    )}
                </div>
                <button className="btn btn-add" onClick={() => navigate('/add')}>
                    + Add Transaction
                </button>
            </div>

            <div className="transaction-filters glass-panel">
                <div className="search-bar">
                    <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button className="clear-search" onClick={() => setSearchTerm('')}>
                            ×
                        </button>
                    )}
                </div>

                <div className="filter-row">
                    <select
                        className="filter-select"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat === 'All' ? 'all' : cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                    <select
                        className="filter-select"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>

                    <select
                        className="filter-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="date-desc">Newest First</option>
                        <option value="date-asc">Oldest First</option>
                        <option value="amount-desc">Highest Amount</option>
                        <option value="amount-asc">Lowest Amount</option>
                    </select>
                </div>

                {activeFiltersCount > 0 && (
                    <div className="filter-summary">
                        <span>{activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active</span>
                        <button className="btn-clear-filters" onClick={handleClearFilters}>
                            Clear All
                        </button>
                    </div>
                )}
            </div>

            <div className="transaction-results">
                <div className="results-header">
                    <span className="results-count">
                        {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {filteredTransactions.length === 0 ? (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {currentTransactions.length === 0
                                ? 'No transactions yet. Add your first transaction!'
                                : 'No transactions match your filters.'}
                        </p>
                    </div>
                ) : (
                    <TransactionList transactions={filteredTransactions} />
                )}
            </div>
        </div>
    );
};
