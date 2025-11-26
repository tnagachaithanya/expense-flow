import React, { useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';

export const TransactionList = ({ transactions: propTransactions }) => {
    const { transactions: contextTransactions, deleteTransaction } = useContext(GlobalContext);

    // Use prop transactions if provided, otherwise use context transactions
    const transactions = propTransactions || contextTransactions;

    return (
        <>
            <h3 className="list-header">History</h3>
            <ul className="transaction-list">
                {transactions.map(transaction => (
                    <li key={transaction.id} className={`transaction-item ${transaction.amount < 0 ? 'minus' : 'plus'}`}>
                        <div className="transaction-info">
                            <div className="transaction-text">{transaction.text}</div>
                            <div className="transaction-date">
                                {transaction.date ? new Date(transaction.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'No Date'}
                            </div>
                        </div>
                        <span className={`money ${transaction.amount < 0 ? 'minus' : 'plus'}`}>
                            {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                        </span>
                        <button
                            onClick={() => deleteTransaction(transaction.id)}
                            className="btn-delete"
                        >
                            <i className="fas fa-times"></i> Delete
                        </button>
                    </li>
                ))}
            </ul>
        </>
    )
}
