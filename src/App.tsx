/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, CategoryLimit, SavingGoal, Subscription, AppView } from './types/finance';
import {
  loadTransactions, saveTransactions,
  loadSavedCurrency, saveSelectedCurrency,
  loadMonthlyBudget, saveMonthlyBudget,
  loadCategoryLimits, saveCategoryLimits,
  loadSavingGoals, saveSavingGoals,
  loadSubscriptions, saveSubscriptions,
  SAMPLE_TRANSACTIONS, exportTransactionsToCSV,
} from './utils/storage';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { TransactionHistory } from './components/TransactionHistory';
import { BudgetPage } from './components/BudgetPage';
import { SavingGoalsPage } from './components/SavingGoalsPage';
import { SubscriptionsPage } from './components/SubscriptionsPage';
import { InsightsPage } from './components/InsightsPage';
import { EditTransactionModal } from './components/EditTransactionModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');

  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions());
  const [currency, setCurrency] = useState<string>(() => loadSavedCurrency());
  const [monthlyBudget, setMonthlyBudget] = useState<number>(() => loadMonthlyBudget());
  const [categoryLimits, setCategoryLimits] = useState<CategoryLimit[]>(() => loadCategoryLimits());
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>(() => loadSavingGoals());
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => loadSubscriptions());

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => { saveTransactions(transactions); }, [transactions]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCurrencyChange = (code: string) => {
    setCurrency(code);
    saveSelectedCurrency(code);
  };

  const handleAddTransaction = (data: { type: TransactionType; amount: number; description: string; category: string; date: string }) => {
    const newTx: Transaction = {
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      ...data,
      createdAt: Date.now(),
    };
    setTransactions(prev => [newTx, ...prev]);
    showToast(newTx.type === 'income' ? 'Income added!' : 'Expense recorded!');
  };

  const handleUpdateTransaction = (updated: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
    showToast('Transaction updated!');
  };

  const handleDeleteTransaction = (tx: Transaction) => {
    setTransactions(prev => prev.filter(t => t.id !== tx.id));
    showToast('Transaction deleted.');
  };

  const handleLoadSampleData = () => {
    setTransactions(SAMPLE_TRANSACTIONS);
    showToast('Sample demo transactions loaded!');
  };

  const handleClearAllData = () => {
    setTransactions([]);
    showToast('All records cleared.');
  };

  const handleExportCSV = () => {
    exportTransactionsToCSV(transactions, currency);
    showToast('Exported to CSV!');
  };

  const handleSaveBudget = (amount: number) => {
    setMonthlyBudget(amount);
    saveMonthlyBudget(amount);
  };

  const handleSaveLimits = (limits: CategoryLimit[]) => {
    setCategoryLimits(limits);
    saveCategoryLimits(limits);
  };

  const handleSaveGoals = (goals: SavingGoal[]) => {
    setSavingGoals(goals);
    saveSavingGoals(goals);
  };

  const handleSaveSubscriptions = (subs: Subscription[]) => {
    setSubscriptions(subs);
    saveSubscriptions(subs);
  };

  const navigate = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentView === 'landing') {
    return <LandingPage onGetStarted={() => navigate('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-[#060b18] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0d1e3f] text-slate-100 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-blue-500/30"
          style={{ boxShadow: '0 0 24px rgba(59,130,246,0.2), 0 4px 16px rgba(0,0,0,0.5)' }}>
          <div className="w-2 h-2 rounded-full bg-blue-400" style={{ boxShadow: '0 0 6px rgba(96,165,250,0.8)' }} />
          {toastMessage}
        </div>
      )}

      <Header
        currentCurrency={currency}
        onCurrencyChange={handleCurrencyChange}
        onLoadSampleData={handleLoadSampleData}
        onClearAllData={handleClearAllData}
        onExportCSV={handleExportCSV}
        transactionCount={transactions.length}
        currentView={currentView}
        onNavigate={navigate}
      />

      <main className="flex-1 pb-20 lg:pb-8">
        {currentView === 'dashboard' && (
          <Dashboard
            transactions={transactions}
            currency={currency}
            onAddTransaction={handleAddTransaction}
            onEdit={tx => setEditingTransaction(tx)}
            onDelete={tx => setDeletingTransaction(tx)}
            onLoadSample={handleLoadSampleData}
            onNavigateTransactions={() => navigate('transactions')}
          />
        )}

        {currentView === 'transactions' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Transactions</h2>
              <p className="text-sm text-slate-500 mt-1">All your income and expense records.</p>
            </div>
            <TransactionHistory
              transactions={transactions}
              onEdit={tx => setEditingTransaction(tx)}
              onDelete={tx => setDeletingTransaction(tx)}
              currency={currency}
            />
          </div>
        )}

        {currentView === 'budget' && (
          <BudgetPage
            transactions={transactions}
            currency={currency}
            monthlyBudget={monthlyBudget}
            categoryLimits={categoryLimits}
            onSaveBudget={handleSaveBudget}
            onSaveLimits={handleSaveLimits}
          />
        )}

        {currentView === 'goals' && (
          <SavingGoalsPage
            currency={currency}
            goals={savingGoals}
            onSaveGoals={handleSaveGoals}
          />
        )}

        {currentView === 'subscriptions' && (
          <SubscriptionsPage
            currency={currency}
            subscriptions={subscriptions}
            onSaveSubscriptions={handleSaveSubscriptions}
          />
        )}

        {currentView === 'insights' && (
          <InsightsPage
            transactions={transactions}
            currency={currency}
          />
        )}
      </main>

      {/* Mobile bottom navigation */}
      <nav className="mobile-nav lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-2 py-2"
        style={{ background: 'rgba(5,10,20,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid #1e2d4a' }}>
        {[
          { view: 'dashboard' as AppView, label: 'Home', icon: '⊞' },
          { view: 'transactions' as AppView, label: 'Txns', icon: '⇌' },
          { view: 'budget' as AppView, label: 'Budget', icon: '◎' },
          { view: 'goals' as AppView, label: 'Goals', icon: '⚑' },
          { view: 'subscriptions' as AppView, label: 'Subs', icon: '↻' },
          { view: 'insights' as AppView, label: 'Insights', icon: '▦' },
        ].map(({ view, label }) => {
          const active = currentView === view;
          return (
            <button
              key={view}
              onClick={() => navigate(view)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all text-[10px] font-semibold cursor-pointer min-w-0 ${
                active ? 'text-blue-400' : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              <NavIcon view={view} active={active} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      <footer className="hidden lg:block border-t border-[#1e2d4a] bg-[#050a14] py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300" style={{ fontFamily: "'Paytone One', system-ui, sans-serif" }}>CASHLY</span>
            <span>—</span>
            <span>Take control of your personal finances</span>
          </div>
          <div className="text-slate-600">All data securely saved to your browser's local storage</div>
        </div>
      </footer>

      <EditTransactionModal
        transaction={editingTransaction}
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSave={handleUpdateTransaction}
        currency={currency}
      />

      <DeleteConfirmModal
        transaction={deletingTransaction}
        isOpen={!!deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={() => { if (deletingTransaction) handleDeleteTransaction(deletingTransaction); }}
        currency={currency}
      />
    </div>
  );
}

function NavIcon({ view, active }: { view: AppView; active: boolean }) {
  const color = active ? '#60a5fa' : '#475569';
  const size = 18;
  switch (view) {
    case 'dashboard': return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    );
    case 'transactions': return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4" />
      </svg>
    );
    case 'budget': return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
      </svg>
    );
    case 'goals': return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
      </svg>
    );
    case 'subscriptions': return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 2 21 6l-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    );
    case 'insights': return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
      </svg>
    );
    default: return null;
  }
}
