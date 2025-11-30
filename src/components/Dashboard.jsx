import React, { useState, useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { Balance } from './Balance';
import { IncomeExpenses } from './IncomeExpenses';
import { Summary } from './Summary';
import { ExpenseChart } from './ExpenseChart';
import { TransactionList } from './TransactionList';
import { ContributionChart } from './ContributionChart';

export const Dashboard = () => {
    const { transactions, familyTransactions, family, familyMembers } = useContext(GlobalContext);
    const [viewMode, setViewMode] = useState('personal'); // 'personal' or 'family'
    const [selectedMember, setSelectedMember] = useState('all');

    const currentTransactions = viewMode === 'family' ? familyTransactions : transactions;

    // Filter transactions if in family mode and a member is selected
    const displayedTransactions = (viewMode === 'family' && selectedMember !== 'all')
        ? currentTransactions.filter(t => t.addedBy === selectedMember)
        : currentTransactions;

    return (
        <>
            {family && (
                <div className="view-toggle-container glass-panel" style={{ marginBottom: '20px', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div className="view-toggle" style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '5px' }}>
                        <button
                            onClick={() => { setViewMode('personal'); setSelectedMember('all'); }}
                            style={{
                                background: viewMode === 'personal' ? 'var(--accent-color)' : 'transparent',
                                color: viewMode === 'personal' ? 'white' : 'var(--text-secondary)',
                                border: 'none',
                                padding: '8px 20px',
                                borderRadius: '15px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Personal
                        </button>
                        <button
                            onClick={() => setViewMode('family')}
                            style={{
                                background: viewMode === 'family' ? 'var(--accent-color)' : 'transparent',
                                color: viewMode === 'family' ? 'white' : 'var(--text-secondary)',
                                border: 'none',
                                padding: '8px 20px',
                                borderRadius: '15px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Family
                        </button>
                    </div>

                    {viewMode === 'family' && (
                        <div className="member-filter" style={{ width: '100%', maxWidth: '300px' }}>
                            <select
                                value={selectedMember}
                                onChange={(e) => setSelectedMember(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--surface-border)',
                                    background: 'var(--surface-bg)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <option value="all">All Members</option>
                                {familyMembers.map(member => (
                                    <option key={member.uid} value={member.uid}>
                                        {member.name || member.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            )}

            <Balance transactions={displayedTransactions} />
            <IncomeExpenses transactions={displayedTransactions} />
            <Summary transactions={displayedTransactions} />
            <ExpenseChart transactions={displayedTransactions} />
            {viewMode === 'family' && family && (
                <ContributionChart
                    familyTransactions={familyTransactions} // Always show full contribution breakdown
                    familyMembers={familyMembers}
                />
            )}
            <TransactionList transactions={displayedTransactions} />
        </>
    );
};
