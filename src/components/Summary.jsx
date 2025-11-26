import React, { useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';

export const Summary = () => {
    const { transactions } = useContext(GlobalContext);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter for Current Month
    const monthlyTransactions = transactions.filter(transaction => {
        const date = new Date(transaction.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    // Filter for Current Year
    const yearlyTransactions = transactions.filter(transaction => {
        const date = new Date(transaction.date);
        return date.getFullYear() === currentYear;
    });

    const calculateTotals = (txs) => {
        const amounts = txs.map(t => t.amount);
        const income = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0);
        const expense = amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1;
        return { income, expense };
    };

    const monthly = calculateTotals(monthlyTransactions);
    const yearly = calculateTotals(yearlyTransactions);

    return (
        <div className="glass-panel" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px', borderBottom: '1px solid var(--surface-border)', paddingBottom: '10px' }}>Summary</h3>

            <div className="flex-between" style={{ marginBottom: '15px' }}>
                <div style={{ flex: 1, marginRight: '10px' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>This Month</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                        <span style={{ color: 'var(--income-color)' }}>+${monthly.income.toFixed(2)}</span>
                        <span style={{ color: 'var(--expense-color)' }}>-${monthly.expense.toFixed(2)}</span>
                    </div>
                </div>
                <div style={{ width: '1px', background: 'var(--surface-border)', height: '40px' }}></div>
                <div style={{ flex: 1, marginLeft: '10px' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>This Year ({currentYear})</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                        <span style={{ color: 'var(--income-color)' }}>+${yearly.income.toFixed(2)}</span>
                        <span style={{ color: 'var(--expense-color)' }}>-${yearly.expense.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
