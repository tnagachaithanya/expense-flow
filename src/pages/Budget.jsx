import React, { useState, useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { BudgetCard } from '../components/BudgetCard';
import { EXPENSE_CATEGORIES } from '../utils/categories';
import './Budget.css';

export const Budget = () => {
    const {
        budgets,
        transactions,
        addBudget,
        updateBudget,
        deleteBudget,
        family,
        familyTransactions
    } = useContext(GlobalContext);

    const [showForm, setShowForm] = useState(false);
    const [category, setCategory] = useState('');
    const [limit, setLimit] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [viewMode, setViewMode] = useState('personal'); // 'personal' or 'family'
    const [isFamily, setIsFamily] = useState(false); // Whether creating a family budget

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!category || !limit) return;

        const budgetData = {
            id: editingId || Date.now(),
            category,
            limit: parseFloat(limit),
            month: new Date().getMonth(),
            year: new Date().getFullYear(),
            isFamily: isFamily
        };

        if (editingId) {
            updateBudget(budgetData);
            setEditingId(null);
        } else {
            addBudget(budgetData);
        }

        setCategory('');
        setLimit('');
        setIsFamily(false);
        setShowForm(false);
    };

    const handleEdit = (budget) => {
        setCategory(budget.category);
        setLimit(budget.limit.toString());
        setEditingId(budget.id);
        setIsFamily(budget.isFamily || false);
        setShowForm(true);
    };

    const handleCancel = () => {
        setCategory('');
        setLimit('');
        setEditingId(null);
        setIsFamily(false);
        setShowForm(false);
    };

    // Get current month budgets based on view mode
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const currentBudgets = budgets.filter(b => {
        const isCurrentMonth = b.month === currentMonth && b.year === currentYear;
        if (viewMode === 'family') {
            return isCurrentMonth && b.isFamily;
        }
        return isCurrentMonth && !b.isFamily;
    });

    // Calculate spent amount for each category
    const getSpentAmount = (category) => {
        const txList = viewMode === 'family' ? familyTransactions : transactions;
        const monthlyExpenses = txList.filter(t => {
            const date = new Date(t.date);
            return t.amount < 0 &&
                t.category === category &&
                date.getMonth() === currentMonth &&
                date.getFullYear() === currentYear;
        });
        return monthlyExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    };

    return (
        <div className="budget-page">
            <div className="budget-header glass-panel">
                <h2>Budget Management</h2>
                <p className="budget-subtitle">Track your spending limits for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

                {/* Personal/Family Toggle */}
                {family && (
                    <div className="view-toggle" style={{ marginTop: '15px' }}>
                        <button
                            className={`toggle-btn ${viewMode === 'personal' ? 'active' : ''}`}
                            onClick={() => setViewMode('personal')}
                        >
                            👤 Personal
                        </button>
                        <button
                            className={`toggle-btn ${viewMode === 'family' ? 'active' : ''}`}
                            onClick={() => setViewMode('family')}
                        >
                            👨‍👩‍👧‍👦 Family
                        </button>
                    </div>
                )}

                {!showForm && (
                    <button className="btn" onClick={() => setShowForm(true)} style={{ marginTop: '15px' }}>
                        + Add Budget
                    </button>
                )}
            </div>

            {showForm && (
                <div className="glass-panel budget-form">
                    <h3>{editingId ? 'Edit Budget' : 'New Budget'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-control">
                            <label className="form-label">Category</label>
                            <select
                                className="form-input"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                            >
                                <option value="">Select Category</option>
                                {EXPENSE_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-control">
                            <label className="form-label">Budget Limit ($)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={limit}
                                onChange={(e) => setLimit(e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                                required
                            />
                        </div>

                        {family && (
                            <div className="form-control">
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="checkbox"
                                        checked={isFamily}
                                        onChange={(e) => setIsFamily(e.target.checked)}
                                        style={{ width: 'auto' }}
                                    />
                                    Family Budget
                                </label>
                                <p className="form-description" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '5px' }}>
                                    Check this to create a budget for your family
                                </p>
                            </div>
                        )}

                        <div className="form-buttons">
                            <button type="submit" className="btn">
                                {editingId ? 'Update' : 'Add'} Budget
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="budget-list">
                {currentBudgets.length === 0 ? (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            No {viewMode === 'family' ? 'family ' : ''}budgets set for this month. Click "Add Budget" to get started!
                        </p>
                    </div>
                ) : (
                    currentBudgets.map(budget => (
                        <BudgetCard
                            key={budget.id}
                            budget={budget}
                            spent={getSpentAmount(budget.category)}
                            onEdit={() => handleEdit(budget)}
                            onDelete={() => deleteBudget(budget.id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};
