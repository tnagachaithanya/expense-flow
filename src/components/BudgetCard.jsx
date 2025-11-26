import React from 'react';
import './BudgetCard.css';

export const BudgetCard = ({ budget, spent, onEdit, onDelete }) => {
    const percentage = (spent / budget.limit) * 100;
    const remaining = budget.limit - spent;

    // Determine status color
    let statusClass = 'status-good';
    if (percentage >= 100) {
        statusClass = 'status-over';
    } else if (percentage >= 80) {
        statusClass = 'status-warning';
    }

    return (
        <div className={`budget-card glass-panel ${statusClass}`}>
            <div className="budget-card-header">
                <h3 className="budget-category">{budget.category}</h3>
                <div className="budget-actions">
                    <button className="btn-icon" onClick={onEdit} title="Edit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button className="btn-icon btn-delete-icon" onClick={onDelete} title="Delete">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <div className="budget-amounts">
                <div className="amount-item">
                    <span className="amount-label">Spent</span>
                    <span className="amount-value spent">${spent.toFixed(2)}</span>
                </div>
                <div className="amount-item">
                    <span className="amount-label">Budget</span>
                    <span className="amount-value">${budget.limit.toFixed(2)}</span>
                </div>
                <div className="amount-item">
                    <span className="amount-label">Remaining</span>
                    <span className={`amount-value ${remaining < 0 ? 'over' : 'remaining'}`}>
                        ${Math.abs(remaining).toFixed(2)}
                    </span>
                </div>
            </div>

            <div className="budget-progress">
                <div className="progress-bar">
                    <div
                        className={`progress-fill ${statusClass}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                </div>
                <span className="progress-percentage">{percentage.toFixed(0)}%</span>
            </div>

            {percentage >= 80 && (
                <div className="budget-alert">
                    {percentage >= 100 ? (
                        <span>⚠️ Over budget by ${(spent - budget.limit).toFixed(2)}</span>
                    ) : (
                        <span>⚠️ Approaching budget limit</span>
                    )}
                </div>
            )}
        </div>
    );
};
