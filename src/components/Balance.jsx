import React, { useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { getCurrencySymbol } from '../utils/currency';

export const Balance = () => {
    const { transactions, settings } = useContext(GlobalContext);

    const amounts = transactions.map(transaction => transaction.amount);
    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    const currencySymbol = getCurrencySymbol(settings.currency);

    return (
        <div className="glass-panel" style={{ marginBottom: '20px', textAlign: 'center' }}>
            <h4 style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>Your Balance</h4>
            <h1 style={{ fontSize: '3rem', fontWeight: '700', margin: '10px 0', background: 'linear-gradient(to right, #fff, #a29bfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{currencySymbol}{total}</h1>
        </div>
    )
}
