import React, { useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { getCurrencySymbol } from '../utils/currency';

export const IncomeExpenses = () => {
    const { transactions, settings } = useContext(GlobalContext);

    const amounts = transactions.map(transaction => transaction.amount);

    const income = amounts
        .filter(item => item > 0)
        .reduce((acc, item) => (acc += item), 0)
        .toFixed(2);

    const expense = (
        amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) *
        -1
    ).toFixed(2);

    const currencySymbol = getCurrencySymbol(settings.currency);

    return (
        <div className="glass-panel flex-between" style={{ marginBottom: '20px', padding: '20px 40px' }}>
            <div style={{ textAlign: 'center' }}>
                <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Income</h4>
                <p style={{ color: 'var(--income-color)', fontSize: '1.5rem', fontWeight: '600', marginTop: '5px' }}>+{currencySymbol}{income}</p>
            </div>
            <div style={{ height: '50px', width: '1px', background: 'var(--surface-border)' }}></div>
            <div style={{ textAlign: 'center' }}>
                <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Expense</h4>
                <p style={{ color: 'var(--expense-color)', fontSize: '1.5rem', fontWeight: '600', marginTop: '5px' }}>-{currencySymbol}{expense}</p>
            </div>
        </div>
    )
}
