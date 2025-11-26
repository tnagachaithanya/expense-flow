import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom';
import { GlobalContext } from '../context/GlobalState';

export const AddTransaction = () => {
    const [text, setText] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense'); // 'income' or 'expense'
    const [category, setCategory] = useState('Uncategorized');
    const [error, setError] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today

    const { addTransaction } = useContext(GlobalContext);
    const navigate = useNavigate();

    const onSubmit = async e => {
        e.preventDefault();
        setError('');

        const finalAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);

        const newTransaction = {
            id: Math.floor(Math.random() * 100000000),
            text,
            amount: +finalAmount,
            date: new Date(date).toISOString(),
            category: type === 'expense' ? category : 'Income'
        }

        try {
            await addTransaction(newTransaction);

            // Navigate to transactions page
            navigate('/transactions');
        } catch (err) {
            console.error("Error adding transaction:", err);
            setError('Failed to add transaction. Please check your connection or permissions.');
        }
    }

    return (
        <div className="glass-panel">
            <div className="flex-between" style={{ marginBottom: '25px' }}>
                <h3>Add New Transaction</h3>
                <Link to="/transactions" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>Cancel</Link>
            </div>

            {error && <div className="error-message" style={{ marginBottom: '20px', color: 'var(--error-color)', background: 'rgba(255, 76, 76, 0.1)', padding: '10px', borderRadius: '5px' }}>{error}</div>}

            <form onSubmit={onSubmit}>
                <div className="form-control">
                    <label htmlFor="type" className="form-label">Transaction Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="form-input"
                        style={{ cursor: 'pointer', appearance: 'none' }}
                    >
                        <option value="expense" style={{ color: 'black' }}>Expense (-)</option>
                        <option value="income" style={{ color: 'black' }}>Income (+)</option>
                    </select>
                </div>

                {type === 'expense' && (
                    <div className="form-control">
                        <label htmlFor="category" className="form-label">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="form-input"
                            style={{ cursor: 'pointer', appearance: 'none' }}
                        >
                            <option value="Uncategorized" style={{ color: 'black' }}>Select Category</option>
                            <option value="Groceries" style={{ color: 'black' }}>Groceries</option>
                            <option value="Transportation" style={{ color: 'black' }}>Transportation</option>
                            <option value="Entertainment" style={{ color: 'black' }}>Entertainment</option>
                            <option value="Bills" style={{ color: 'black' }}>Bills</option>
                            <option value="Medicine" style={{ color: 'black' }}>Medicine</option>
                            <option value="Food" style={{ color: 'black' }}>Food</option>
                            <option value="Other" style={{ color: 'black' }}>Other</option>
                        </select>
                    </div>
                )}

                <div className="form-control">
                    <label htmlFor="date" className="form-label">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={(() => {
                            const threeMonthsAgo = new Date();
                            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                            return threeMonthsAgo.toISOString().split('T')[0];
                        })()}
                        max={new Date().toISOString().split('T')[0]}
                        className="form-input"
                        required
                    />
                </div>

                <div className="form-control">
                    <label htmlFor="text" className="form-label">Description</label>
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="e.g. Salary, Groceries..."
                        className="form-input"
                        required
                    />
                </div>

                <div className="form-control">
                    <label htmlFor="amount" className="form-label">Amount</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="form-input"
                        required
                        min="0"
                        step="0.01"
                    />
                </div>
                <button className="btn">Add Transaction</button>
            </form>
        </div>
    )
}
