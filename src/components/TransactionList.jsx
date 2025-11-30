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

    const trailingActions = (transaction) => (
        <TrailingActions>
            <SwipeAction
                destructive={true}
                onClick={() => deleteTransaction(transaction)}
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
                            trailingActions={trailingActions(transaction)}
                        >
                            <div className={`transaction-item ${transaction.amount < 0 ? 'minus' : 'plus'}`} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--card-bg)', borderRight: `5px solid ${transaction.amount < 0 ? '#c0392b' : '#2ecc71'}` }}>
                                <div className="transaction-info" style={{ flex: 1 }}>
                                    <div className="transaction-text" style={{ fontWeight: 'bold' }}>{transaction.text}</div>
                                    <div className="transaction-date" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {transaction.date ? new Date(transaction.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'No Date'}
                                    </div>
                                    {transaction.addedByName && (
                                        <div className="transaction-attribution" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '2px' }}>
                                            Added by {transaction.addedByName}
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span className={`money ${transaction.amount < 0 ? 'minus' : 'plus'}`} style={{ fontWeight: 'bold' }}>
                                        {transaction.amount < 0 ? '-' : '+'}{currencySymbol}{Math.abs(transaction.amount).toFixed(2)}
                                    </span>
                                    <button
                                        onClick={() => navigate('/add', { state: { transaction } })}
                                        className="btn-edit"
                                        title="Edit"
                                        style={{
                                            background: 'var(--surface-bg)',
                                            border: '1px solid var(--surface-border)',
                                            color: 'var(--text-primary)',
                                            cursor: 'pointer',
                                            padding: '8px',
                                            borderRadius: '8px',
                                            minWidth: '44px',
                                            minHeight: '44px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                        </svg>
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
