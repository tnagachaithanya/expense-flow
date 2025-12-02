import React, { useContext } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GlobalContext } from '../context/GlobalState';
import { getEffectiveTimezone, getStartOfDay, getEndOfDay, formatDateForInput } from '../utils/dateUtils';

export const ExpenseChart = ({ transactions: propTransactions }) => {
    const { transactions: contextTransactions, settings } = useContext(GlobalContext);
    const transactions = propTransactions || contextTransactions;
    const [dateRange, setDateRange] = React.useState('thisMonth');
    const [customStart, setCustomStart] = React.useState('');
    const [customEnd, setCustomEnd] = React.useState('');

    // Date range calculations
    const getDateRange = () => {
        const tz = getEffectiveTimezone(settings.timezone);
        const now = new Date();
        const ranges = {
            thisMonth: {
                start: getStartOfDay(new Date(now.getFullYear(), now.getMonth(), 1), tz),
                end: getEndOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0), tz)
            },
            lastMonth: {
                start: getStartOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1), tz),
                end: getEndOfDay(new Date(now.getFullYear(), now.getMonth(), 0), tz)
            },
            last3Months: {
                start: getStartOfDay(new Date(now.getFullYear(), now.getMonth() - 3, 1), tz),
                end: getEndOfDay(now, tz)
            },
            thisYear: {
                start: getStartOfDay(new Date(now.getFullYear(), 0, 1), tz),
                end: getEndOfDay(now, tz)
            },
            custom: {
                start: customStart ? getStartOfDay(new Date(`${customStart}T00:00:00`), tz) : new Date(0),
                end: customEnd ? getEndOfDay(new Date(`${customEnd}T23:59:59`), tz) : new Date()
            }
        };
        return ranges[dateRange] || ranges.thisMonth;
    };

    const { start, end } = getDateRange();

    // Filter transactions by date range
    const filteredTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date >= start && date <= end;
    });

    // Filter only expenses
    const expenses = filteredTransactions.filter(t => t.amount < 0);

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

    return (
        <div className="glass-panel" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>Expense Breakdown</h3>
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        style={{
                            padding: '5px 10px',
                            borderRadius: '10px',
                            border: '1px solid var(--surface-border)',
                            background: 'var(--surface-bg)',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="thisMonth">This Month</option>
                        <option value="lastMonth">Last Month</option>
                        <option value="last3Months">Last 3 Months</option>
                        <option value="thisYear">This Year</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>

                {dateRange === 'custom' && (
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <input
                            type="date"
                            value={customStart}
                            onChange={(e) => setCustomStart(e.target.value)}
                            style={{
                                padding: '5px',
                                borderRadius: '5px',
                                border: '1px solid var(--surface-border)',
                                background: 'var(--surface-bg)',
                                color: 'var(--text-primary)',
                                fontSize: '0.8rem'
                            }}
                        />
                        <span style={{ color: 'var(--text-secondary)' }}>to</span>
                        <input
                            type="date"
                            value={customEnd}
                            onChange={(e) => setCustomEnd(e.target.value)}
                            style={{
                                padding: '5px',
                                borderRadius: '5px',
                                border: '1px solid var(--surface-border)',
                                background: 'var(--surface-bg)',
                                color: 'var(--text-primary)',
                                fontSize: '0.8rem'
                            }}
                        />
                    </div>
                )}
            </div>

            {data.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>No expenses for this period.</p>
                </div>
            ) : (
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
            )}
        </div>
    );
};
