import React, { useMemo } from 'react';
import { Transaction, CategorySummary } from '../types/finance';
import { SummaryCards } from './SummaryCards';
import { AddTransactionForm } from './AddTransactionForm';
import { ExpensePieChart } from './ExpensePieChart';
import { WelcomeBanner } from './WelcomeBanner';
import { TransactionHistory } from './TransactionHistory';

interface DashboardProps {
  transactions: Transaction[];
  currency: string;
  onAddTransaction: (data: { type: 'income' | 'expense'; amount: number; description: string; category: string; date: string }) => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  onLoadSample: () => void;
  onNavigateTransactions: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  transactions, currency, onAddTransaction, onEdit, onDelete, onLoadSample, onNavigateTransactions,
}) => {
  const {
    totalIncome, totalExpenses, incomeCount, expenseCount, categorySummaries, biggestCategory,
  } = useMemo(() => {
    let incomeSum = 0, expenseSum = 0, inCount = 0, exCount = 0;
    const catMap: Record<string, { total: number; count: number }> = {};

    transactions.forEach(t => {
      if (t.type === 'income') { incomeSum += t.amount; inCount++; }
      else { expenseSum += t.amount; exCount++; catMap[t.category] = { total: (catMap[t.category]?.total || 0) + t.amount, count: (catMap[t.category]?.count || 0) + 1 }; }
    });

    const summaries: CategorySummary[] = Object.entries(catMap)
      .map(([cat, d]) => ({ category: cat, total: d.total, percentage: expenseSum > 0 ? (d.total / expenseSum) * 100 : 0, count: d.count, color: '' }))
      .sort((a, b) => b.total - a.total);

    return { totalIncome: incomeSum, totalExpenses: expenseSum, incomeCount: inCount, expenseCount: exCount, categorySummaries: summaries, biggestCategory: summaries[0] ?? null };
  }, [transactions]);

  const recentTransactions = useMemo(() =>
    [...transactions].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8),
    [transactions]
  );

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {transactions.length === 0 && (
        <WelcomeBanner onLoadSample={onLoadSample} />
      )}

      <SummaryCards
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        currency={currency}
        biggestCategory={biggestCategory}
        incomeCount={incomeCount}
        expenseCount={expenseCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-6">
          <AddTransactionForm onAddTransaction={onAddTransaction} currency={currency} />
        </div>
        <div className="lg:col-span-7">
          <ExpensePieChart categorySummaries={categorySummaries} totalExpenses={totalExpenses} currency={currency} />
        </div>
      </div>

      {/* Recent transactions preview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-200 text-sm">Recent Transactions</h3>
          {transactions.length > 8 && (
            <button
              onClick={onNavigateTransactions}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              View all {transactions.length} →
            </button>
          )}
        </div>
        <TransactionHistory
          transactions={recentTransactions}
          onEdit={onEdit}
          onDelete={onDelete}
          currency={currency}
        />
      </div>
    </div>
  );
};
