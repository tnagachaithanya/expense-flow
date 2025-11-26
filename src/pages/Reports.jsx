import React, { useState, useContext, useMemo } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Reports.css';

export const Reports = () => {
    const { transactions, budgets } = useContext(GlobalContext);
    const [dateRange, setDateRange] = useState('thisMonth');
    const [viewType, setViewType] = useState('daily');

    // Date range calculations
    const getDateRange = () => {
        const now = new Date();
        const ranges = {
            thisMonth: {
                start: new Date(now.getFullYear(), now.getMonth(), 1),
                end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
            },
            lastMonth: {
                start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
                end: new Date(now.getFullYear(), now.getMonth(), 0)
            },
            last3Months: {
                start: new Date(now.getFullYear(), now.getMonth() - 3, 1),
                end: now
            },
            thisYear: {
                start: new Date(now.getFullYear(), 0, 1),
                end: now
            }
        };
        return ranges[dateRange] || ranges.thisMonth;
    };

    const { start, end } = getDateRange();

    // Filter transactions by date range
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const date = new Date(t.date);
            return date >= start && date <= end;
        });
    }, [transactions, start, end]);

    // Calculate overview stats
    const stats = useMemo(() => {
        const income = filteredTransactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = filteredTransactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const net = income - expenses;
        const avgDaily = expenses / Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

        return { income, expenses, net, avgDaily };
    }, [filteredTransactions, start, end]);

    // Category breakdown data
    const categoryData = useMemo(() => {
        const categories = {};
        filteredTransactions
            .filter(t => t.amount < 0)
            .forEach(t => {
                const cat = t.category || 'Uncategorized';
                categories[cat] = (categories[cat] || 0) + Math.abs(t.amount);
            });

        return Object.entries(categories)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [filteredTransactions]);

    // Spending trends data
    const trendData = useMemo(() => {
        const data = {};

        filteredTransactions.forEach(t => {
            const date = new Date(t.date);
            let key;

            if (viewType === 'daily') {
                key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            } else if (viewType === 'weekly') {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            } else {
                key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            }

            if (!data[key]) {
                data[key] = { date: key, income: 0, expenses: 0 };
            }

            if (t.amount > 0) {
                data[key].income += t.amount;
            } else {
                data[key].expenses += Math.abs(t.amount);
            }
        });

        return Object.values(data).slice(-30); // Last 30 data points
    }, [filteredTransactions, viewType]);

    const COLORS = ['#6c63ff', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919', '#19FF19'];

    const exportToCSV = () => {
        const headers = ['Date', 'Description', 'Category', 'Amount', 'Type'];
        const rows = filteredTransactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.text,
            t.category || 'Uncategorized',
            Math.abs(t.amount).toFixed(2),
            t.amount > 0 ? 'Income' : 'Expense'
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expense-report-${dateRange}.csv`;
        a.click();
    };

    return (
        <div className="reports-page">
            <div className="reports-header glass-panel">
                <h2>Reports & Analytics</h2>

                <div className="report-controls">
                    <select
                        className="filter-select"
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                    >
                        <option value="thisMonth">This Month</option>
                        <option value="lastMonth">Last Month</option>
                        <option value="last3Months">Last 3 Months</option>
                        <option value="thisYear">This Year</option>
                    </select>

                    <button className="btn btn-export" onClick={exportToCSV}>
                        📊 Export CSV
                    </button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="stats-grid">
                <div className="stat-card glass-panel">
                    <div className="stat-icon income">💰</div>
                    <div className="stat-content">
                        <div className="stat-label">Total Income</div>
                        <div className="stat-value income">${stats.income.toFixed(2)}</div>
                    </div>
                </div>

                <div className="stat-card glass-panel">
                    <div className="stat-icon expense">💸</div>
                    <div className="stat-content">
                        <div className="stat-label">Total Expenses</div>
                        <div className="stat-value expense">${stats.expenses.toFixed(2)}</div>
                    </div>
                </div>

                <div className="stat-card glass-panel">
                    <div className="stat-icon net">💵</div>
                    <div className="stat-content">
                        <div className="stat-label">Net Savings</div>
                        <div className={`stat-value ${stats.net >= 0 ? 'income' : 'expense'}`}>
                            ${Math.abs(stats.net).toFixed(2)}
                        </div>
                    </div>
                </div>

                <div className="stat-card glass-panel">
                    <div className="stat-icon avg">📊</div>
                    <div className="stat-content">
                        <div className="stat-label">Avg Daily Spend</div>
                        <div className="stat-value">${stats.avgDaily.toFixed(2)}</div>
                    </div>
                </div>
            </div>

            {/* Spending Trends */}
            <div className="chart-section glass-panel">
                <div className="chart-header">
                    <h3>Spending Trends</h3>
                    <div className="view-toggle">
                        <button
                            className={viewType === 'daily' ? 'active' : ''}
                            onClick={() => setViewType('daily')}
                        >
                            Daily
                        </button>
                        <button
                            className={viewType === 'weekly' ? 'active' : ''}
                            onClick={() => setViewType('weekly')}
                        >
                            Weekly
                        </button>
                        <button
                            className={viewType === 'monthly' ? 'active' : ''}
                            onClick={() => setViewType('monthly')}
                        >
                            Monthly
                        </button>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="#a0a0a0" />
                        <YAxis stroke="#a0a0a0" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="income" stroke="#2ecc71" strokeWidth={2} />
                        <Line type="monotone" dataKey="expenses" stroke="#e74c3c" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Category Breakdown */}
            <div className="charts-row">
                <div className="chart-section glass-panel">
                    <h3>Expense by Category</h3>
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="no-data">No expense data for this period</div>
                    )}
                </div>

                <div className="chart-section glass-panel">
                    <h3>Top Categories</h3>
                    <div className="category-list">
                        {categoryData.slice(0, 5).map((cat, index) => (
                            <div key={index} className="category-item">
                                <div className="category-info">
                                    <span className="category-rank">{index + 1}</span>
                                    <span className="category-name">{cat.name}</span>
                                </div>
                                <span className="category-amount">${cat.value.toFixed(2)}</span>
                            </div>
                        ))}
                        {categoryData.length === 0 && (
                            <div className="no-data">No categories to display</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
