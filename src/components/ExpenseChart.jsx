import React, { useContext } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GlobalContext } from '../context/GlobalState';

export const ExpenseChart = ({ transactions: propTransactions }) => {
    const { transactions: contextTransactions } = useContext(GlobalContext);
    const transactions = propTransactions || contextTransactions;

    // Filter only expenses
    const expenses = transactions.filter(t => t.amount < 0);

    // Group by category
    const categoryData = expenses.reduce((acc, curr) => {
        const category = curr.category || 'Uncategorized';
        const amount = Math.abs(curr.amount);

        if (acc[category]) {
            acc[category] += amount;
        } else {
            acc[category] = amount;
        }
        return acc;
    }, {});

    const data = Object.keys(categoryData).map(key => ({
        name: key,
        value: categoryData[key]
    }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919', '#19FF19'];

    if (data.length === 0) {
        return (
            <div className="glass-panel" style={{ marginBottom: '20px', textAlign: 'center', padding: '40px' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No expenses to display chart.</p>
            </div>
        );
    }

    return (
        <div className="glass-panel" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '10px', textAlign: 'center' }}>Expense Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
