import React from 'react';
import { Balance } from './Balance';
import { IncomeExpenses } from './IncomeExpenses';
import { Summary } from './Summary';
import { ExpenseChart } from './ExpenseChart';
import { TransactionList } from './TransactionList';

export const Dashboard = () => {
    return (
        <>
            <Balance />
            <IncomeExpenses />
            <Summary />
            <ExpenseChart />
            <TransactionList />
        </>
    );
};
