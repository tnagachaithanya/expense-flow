import React, { useState, useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { BudgetCard } from '../components/BudgetCard';
import { EXPENSE_CATEGORIES } from '../utils/categories';
import './Budget.css';

export const Budget = () => {
    const { budgets, transactions, addBudget, updateBudget, deleteBudget } = useContext(GlobalContext);
    const [showForm, setShowForm] = useState(false);
    const [category, setCategory] = useState('');
    const [limit, setLimit] = useState('');
    const [editingId, setEditingId] = useState(null);



    const handleSubmit = (e) => {
        e.preventDefault();

        if (!category || !limit) return;

        const budgetData = {
            id: editingId || Date.now(),
            category,
            limit: parseFloat(limit),
            month: new Date().getMonth(),
            year: new Date().getFullYear()
        };

        if (editingId) {
            updateBudget(budgetData);
            setEditingId(null);
        } else {
            addBudget(budgetData);
        }

        setCategory('');
        setLimit('');
        setShowForm(false);
    };

    const handleEdit = (budget) => {
        setCategory(budget.category);
        setLimit(budget.limit.toString());
        setEditingId(budget.id);
        setShowForm(true);
    };

    const handleCancel = () => {
        setCategory('');
        setLimit('');
        setEditingId(null);
        setShowForm(false);
    };

    // Get current month budgets
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentBudgets = budgets.filter(b => b.month === currentMonth && b.year === currentYear);

    // Calculate spent amount for each category
    const getSpentAmount = (category) => {
        const monthlyExpenses = transactions.filter(t => {
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

                {!showForm && (
                    <button className="btn" onClick={() => setShowForm(true)}>
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
                            No budgets set for this month. Click "Add Budget" to get started!
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
