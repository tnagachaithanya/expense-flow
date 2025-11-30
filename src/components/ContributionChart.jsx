import React from 'react';
import './ContributionChart.css';

export const ContributionChart = ({ familyTransactions, familyMembers }) => {
    // Calculate contributions per member
    const calculateContributions = () => {
        const contributions = {};
        let totalExpenses = 0;

        // Initialize contributions for all members
        familyMembers.forEach(member => {
            contributions[member.uid] = {
                name: member.name,
                amount: 0,
                count: 0
            };
        });

        // Sum up expenses per member (only negative amounts = expenses)
        familyTransactions.forEach(transaction => {
            if (transaction.amount < 0 && transaction.addedBy) {
                const memberId = transaction.addedBy;
                if (contributions[memberId]) {
                    contributions[memberId].amount += Math.abs(transaction.amount);
                    contributions[memberId].count += 1;
                    totalExpenses += Math.abs(transaction.amount);
                }
            }
        });

        return { contributions, totalExpenses };
    };

    const { contributions, totalExpenses } = calculateContributions();

    // Convert to array and sort by amount
    const contributionArray = Object.entries(contributions)
        .map(([uid, data]) => ({ uid, ...data }))
        .filter(item => item.amount > 0)
        .sort((a, b) => b.amount - a.amount);

    if (contributionArray.length === 0) {
        return (
            <div className="contribution-chart glass-panel">
                <h3>💰 Contribution Breakdown</h3>
                <p className="no-data">No family expenses yet. Start adding transactions!</p>
            </div>
        );
    }

    const maxAmount = Math.max(...contributionArray.map(item => item.amount));

    return (
        <div className="contribution-chart glass-panel">
            <h3>💰 Contribution Breakdown</h3>
            <p className="chart-subtitle">Total Family Expenses: ${totalExpenses.toFixed(2)}</p>

            <div className="chart-bars">
                {contributionArray.map(item => {
                    const percentage = ((item.amount / totalExpenses) * 100).toFixed(1);
                    const barWidth = (item.amount / maxAmount) * 100;

                    return (
                        <div key={item.uid} className="chart-bar-container">
                            <div className="bar-label">
                                <span className="member-name">{item.name}</span>
                                <span className="member-stats">
                                    ${item.amount.toFixed(2)} ({percentage}%)
                                </span>
                            </div>
                            <div className="bar-wrapper">
                                <div
                                    className="bar-fill"
                                    style={{ width: `${barWidth}%` }}
                                >
                                    <span className="bar-count">{item.count} transactions</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
