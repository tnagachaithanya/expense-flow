import React, { useState, useContext, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { GlobalContext } from '../context/GlobalState';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_CATEGORY } from '../utils/categories';

export const AddTransaction = () => {
    const [text, setText] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense'); // 'income' or 'expense'
    const [category, setCategory] = useState(DEFAULT_CATEGORY);
    const [error, setError] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [addToFamily, setAddToFamily] = useState(false);
    const [originalTransaction, setOriginalTransaction] = useState(null);

    const { addTransaction, updateTransaction, categories, family } = useContext(GlobalContext);
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state && location.state.transaction) {
            const { transaction } = location.state;
            setOriginalTransaction(transaction); // Store original transaction
            setIsEditing(true);
            setEditId(transaction.id);
            setText(transaction.text);
            setAmount(Math.abs(transaction.amount));
            setType(transaction.amount < 0 ? 'expense' : 'income');
            setCategory(transaction.category || DEFAULT_CATEGORY);
            if (transaction.date) {
                setDate(new Date(transaction.date).toISOString().split('T')[0]);
            }
            // If editing, check if it belongs to family
            if (transaction.familyId) {
                setAddToFamily(true);
            }
        }
    }, [location.state]);

    const onSubmit = async e => {
        e.preventDefault();
        setError('');

        const finalAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);

        const transactionData = {
            id: isEditing ? editId : Math.floor(Math.random() * 100000000),
            text,
            amount: +finalAmount,
            date: new Date(date).toISOString(),
            category: type === 'expense' ? category : 'Income',
            // Preserve original family metadata when editing, or add new metadata when creating
            ...(isEditing && originalTransaction?.familyId ? {
                familyId: originalTransaction.familyId,
                addedBy: originalTransaction.addedBy,
                addedByName: originalTransaction.addedByName
            } : addToFamily && family ? {
                familyId: family.familyId,
                addedBy: currentUser.uid,
                addedByName: currentUser.displayName || currentUser.email
            } : {})
        }

        try {
            if (isEditing) {
                await updateTransaction(transactionData);
            } else {
                await addTransaction(transactionData);
            }

            // Navigate to transactions page
            navigate('/transactions');
        } catch (err) {
            console.error("Error saving transaction:", err);
            setError('Failed to save transaction. Please check your connection or permissions.');
        }
    }

    return (
        <div className="glass-panel">
            <div className="flex-between" style={{ marginBottom: '25px' }}>
                <h3>{isEditing ? 'Edit Transaction' : 'Add New Transaction'}</h3>
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
                            <option value={DEFAULT_CATEGORY} style={{ color: 'black' }}>Select Category</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat} style={{ color: 'black' }}>{cat}</option>
                            ))}
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

                {family && (
                    <div className="form-control" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            id="addToFamily"
                            checked={addToFamily}
                            onChange={(e) => setAddToFamily(e.target.checked)}
                            style={{ width: '20px', height: '20px' }}
                        />
                        <label htmlFor="addToFamily" className="form-label" style={{ marginBottom: 0 }}>
                            Add to Family ({family.familyName})
                        </label>
                    </div>
                )}

                <button className="btn">{isEditing ? 'Update Transaction' : 'Add Transaction'}</button>
            </form>
        </div>
    )
}
