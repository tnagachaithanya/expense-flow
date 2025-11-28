import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from '../context/GlobalState';
import { getCurrencySymbol } from '../utils/currency';
import {
    SwipeableList,
    SwipeableListItem,
    SwipeAction,
    TrailingActions,
    Type,
} from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';

export const TransactionList = ({ transactions: propTransactions }) => {
    const { transactions: contextTransactions, deleteTransaction, settings } = useContext(GlobalContext);
    const transactions = propTransactions || contextTransactions;
    const navigate = useNavigate();
    const currencySymbol = getCurrencySymbol(settings.currency);

    const trailingActions = (id) => (
        <TrailingActions>
            <SwipeAction
                destructive={true}
                onClick={() => deleteTransaction(id)}
            >
                <div className="swipe-action-delete">
                    <i className="fas fa-trash"></i>
                </div>
            </SwipeAction>
        </TrailingActions>
    );

    return (
        <>
            <h3 className="list-header">History</h3>
            <div className="transaction-list-wrapper">
                <SwipeableList fullWidth={true} type={Type.IOS}>
                    {transactions.map(transaction => (
                        <SwipeableListItem
                            key={transaction.id}
                            trailingActions={trailingActions(transaction.id)}
                        >
                            <div className={`transaction-item ${transaction.amount < 0 ? 'minus' : 'plus'}`} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--card-bg)', borderRight: `5px solid ${transaction.amount < 0 ? '#c0392b' : '#2ecc71'}` }}>
                                <div className="transaction-info" style={{ flex: 1 }}>
                                    <div className="transaction-text" style={{ fontWeight: 'bold' }}>{transaction.text}</div>
                                    <div className="transaction-date" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {transaction.date ? new Date(transaction.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'No Date'}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span className={`money ${transaction.amount < 0 ? 'minus' : 'plus'}`} style={{ fontWeight: 'bold' }}>
                                        {transaction.amount < 0 ? '-' : '+'}{currencySymbol}{Math.abs(transaction.amount).toFixed(2)}
                                    </span>
                                    <button
                                        onClick={() => navigate('/add', { state: { transaction } })}
                                        className="btn-edit"
                                        style={{
                                            background: 'var(--surface-bg)',
                                            border: '1px solid var(--surface-border)',
                                            color: 'var(--text-primary)',
                                            cursor: 'pointer',
                                            fontSize: '1.2rem',
                                            padding: '8px 12px',
                                            borderRadius: '5px',
                                            minWidth: '44px',
                                            minHeight: '44px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </SwipeableListItem>
                    ))}
                </SwipeableList>
            </div>
        </>
    )
}
