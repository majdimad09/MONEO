/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Transaction, TransactionType, CategoryLimit, SavingGoal, Subscription, AppView } from './types/finance';
import {
  loadTransactions, saveTransactions,
  loadSavedCurrency, saveSelectedCurrency,
  loadMonthlyBudget, saveMonthlyBudget,
  loadCategoryLimits, saveCategoryLimits,
  loadSavingGoals, saveSavingGoals,
  loadSubscriptions, saveSubscriptions,
  loadUserName, saveUserName,
  SAMPLE_TRANSACTIONS, exportTransactionsToCSV,
} from './utils/storage';
import { isSupabaseConfigured } from './lib/supabase';
import { useAuth } from './hooks/useAuth';
import {
  loadAllUserData,
  insertTransaction,
  updateTransaction as dbUpdateTransaction,
  deleteTransaction as dbDeleteTransaction,
  saveProfile,
  saveUserPreferences,
  replaceSavingGoals,
  replaceSubscriptions,
} from './lib/supabaseService';

import { LandingPage } from './components/LandingPage';
import { AuthScreen } from './components/AuthScreen';
import { MobileTopBar } from './components/MobileTopBar';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { StatisticsScreen } from './components/StatisticsScreen';
import { SavingsScreen } from './components/SavingsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { TransactionHistory } from './components/TransactionHistory';
import { AddTransactionModal } from './components/AddTransactionModal';
import { ActionMenu } from './components/ActionMenu';
import { EditTransactionModal } from './components/EditTransactionModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';

export default function App() {
  const { user, loading: authLoading, signIn, signUp, signOut, resetPassword, updatePassword, isRecoveryMode } = useAuth();

  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [cloudLoading, setCloudLoading] = useState(false);

  // ── Data state (guest defaults from localStorage) ─────────────────────────
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions());
  const [currency, setCurrency] = useState<string>(() => loadSavedCurrency());
  const [monthlyBudget, setMonthlyBudget] = useState<number>(() => loadMonthlyBudget());
  const [categoryLimits, setCategoryLimits] = useState<CategoryLimit[]>(() => loadCategoryLimits());
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>(() => loadSavingGoals());
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => loadSubscriptions());
  const [userName, setUserName] = useState<string>(() => loadUserName());

  // ── UI state ──────────────────────────────────────────────────────────────
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalDefaultType, setAddModalDefaultType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'budget' | 'subscriptions' | 'data' | undefined>();

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // ── Load cloud data when user signs in ────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    setCloudLoading(true);
    loadAllUserData(user.id)
      .then(data => {
        setTransactions(data.transactions);
        setSavingGoals(data.savingGoals);
        setSubscriptions(data.subscriptions);
        if (data.preferences) {
          setMonthlyBudget(data.preferences.monthly_budget);
          setCategoryLimits(data.preferences.category_limits);
        }
        if (data.profile) {
          if (data.profile.name) setUserName(data.profile.name);
          if (data.profile.currency) setCurrency(data.profile.currency);
        }
        setCurrentView('home');
      })
      .catch(() => {
        showToast('Could not load cloud data. Using cached data.');
        setCurrentView('home');
      })
      .finally(() => setCloudLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCurrencyChange = (code: string) => {
    setCurrency(code);
    saveSelectedCurrency(code);
    if (user) saveUserPreferences(user.id, { currency: code }).catch(() => {});
  };

  const handleAddTransaction = (data: { type: TransactionType; amount: number; description: string; category: string; date: string }) => {
    const newTx: Transaction = {
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      ...data,
      createdAt: Date.now(),
    };
    setTransactions(prev => [newTx, ...prev]);
    if (user) insertTransaction(user.id, newTx).catch(() => {});
    showToast(newTx.type === 'income' ? 'Income added!' : 'Expense recorded!');
  };

  const handleUpdateTransaction = (updated: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
    if (user) dbUpdateTransaction(user.id, updated).catch(() => {});
    showToast('Transaction updated!');
  };

  const handleDeleteTransaction = (tx: Transaction) => {
    setTransactions(prev => prev.filter(t => t.id !== tx.id));
    if (user) dbDeleteTransaction(user.id, tx.id).catch(() => {});
    showToast('Transaction deleted.');
  };

  const handleLoadSampleData = () => {
    setTransactions(SAMPLE_TRANSACTIONS);
    showToast('Sample data loaded!');
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
    if (user) saveUserPreferences(user.id, { monthly_budget: amount }).catch(() => {});
  };

  const handleSaveLimits = (limits: CategoryLimit[]) => {
    setCategoryLimits(limits);
    saveCategoryLimits(limits);
    if (user) saveUserPreferences(user.id, { category_limits: limits }).catch(() => {});
  };

  const handleSaveGoals = (goals: SavingGoal[]) => {
    setSavingGoals(goals);
    saveSavingGoals(goals);
    if (user) replaceSavingGoals(user.id, goals).catch(() => {});
  };

  const handleSaveSubscriptions = (subs: Subscription[]) => {
    setSubscriptions(subs);
    saveSubscriptions(subs);
    if (user) replaceSubscriptions(user.id, subs).catch(() => {});
  };

  const handleSaveUserName = (name: string) => {
    setUserName(name);
    saveUserName(name);
    if (user) saveProfile(user.id, { name }).catch(() => {});
  };

  const handleSignOut = async () => {
    await signOut();
    // Clear all data — auth guard will show AuthScreen
    setTransactions([]);
    setCurrency('USD');
    setMonthlyBudget(0);
    setCategoryLimits([]);
    setSavingGoals([]);
    setSubscriptions([]);
    setUserName('');
    setCurrentView('landing');
  };

  const navigate = (view: AppView) => setCurrentView(view);

  const openAddModal = (type: TransactionType) => {
    setAddModalDefaultType(type);
    setShowAddModal(true);
    setShowActionMenu(false);
  };

  const handleActionSelect = (action: 'expense' | 'income' | 'recurring' | 'scan') => {
    setShowActionMenu(false);
    if (action === 'expense') { openAddModal('expense'); }
    else if (action === 'income') { openAddModal('income'); }
    else if (action === 'recurring') {
      setSettingsInitialTab('subscriptions');
      navigate('settings');
    } else if (action === 'scan') {
      showToast('Scan receipt — coming soon!');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  // While auth is initializing
  if (authLoading || cloudLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#060b18' }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin"
          />
          <span className="text-xs text-slate-500">Loading Cashly…</span>
        </div>
      </div>
    );
  }

  // Auth wall — unauthenticated users, or users mid-password-recovery, see the auth screen.
  if (!user || isRecoveryMode) {
    return (
      <AuthScreen
        onSignIn={signIn}
        onSignUp={signUp}
        onResetPassword={resetPassword}
        onUpdatePassword={updatePassword}
        isRecoveryMode={isRecoveryMode}
      />
    );
  }

  // Landing page (authenticated users only)
  if (currentView === 'landing') {
    return <LandingPage onGetStarted={() => navigate('home')} />;
  }

  return (
    <div className="desktop-bg">
      <div className="app-shell">

        {/* Top bar */}
        <MobileTopBar
          currentView={currentView}
          currentCurrency={currency}
          onCurrencyChange={handleCurrencyChange}
          onLoadSampleData={handleLoadSampleData}
          onClearAllData={handleClearAllData}
          onExportCSV={handleExportCSV}
          transactionCount={transactions.length}
          onNavigate={navigate}
        />

        {/* Scrollable content */}
        <div className="app-content">
          {currentView === 'home' && (
            <HomeScreen
              transactions={transactions}
              currency={currency}
              monthlyBudget={monthlyBudget}
              categoryLimits={categoryLimits}
              subscriptions={subscriptions}
              savingGoals={savingGoals}
              userName={userName}
              onViewAllTransactions={() => navigate('transactions')}
              onEdit={tx => setEditingTransaction(tx)}
              onDelete={tx => setDeletingTransaction(tx)}
              onLoadSample={handleLoadSampleData}
              onAddExpense={() => openAddModal('expense')}
              onAddIncome={() => openAddModal('income')}
              onNavigateStats={() => navigate('statistics')}
              onNavigateSettings={() => navigate('settings')}
            />
          )}

          {currentView === 'statistics' && (
            <StatisticsScreen
              transactions={transactions}
              currency={currency}
            />
          )}

          {currentView === 'savings' && (
            <SavingsScreen
              currency={currency}
              goals={savingGoals}
              onSaveGoals={handleSaveGoals}
            />
          )}

          {currentView === 'settings' && (
            <SettingsScreen
              transactions={transactions}
              currency={currency}
              monthlyBudget={monthlyBudget}
              categoryLimits={categoryLimits}
              onSaveBudget={handleSaveBudget}
              onSaveLimits={handleSaveLimits}
              subscriptions={subscriptions}
              onSaveSubscriptions={handleSaveSubscriptions}
              transactionCount={transactions.length}
              onLoadSampleData={handleLoadSampleData}
              onClearAllData={handleClearAllData}
              onExportCSV={handleExportCSV}
              userName={userName}
              onSaveUserName={handleSaveUserName}
              initialTab={settingsInitialTab}
              user={user}
              onSignOut={handleSignOut}
            />
          )}

          {currentView === 'transactions' && (
            <div className="px-4 pt-4 pb-6">
              <TransactionHistory
                transactions={transactions}
                onEdit={tx => setEditingTransaction(tx)}
                onDelete={tx => setDeletingTransaction(tx)}
                currency={currency}
              />
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <BottomNav
          currentView={currentView}
          onNavigate={navigate}
          onAddPress={() => setShowActionMenu(true)}
        />
      </div>

      {/* Toast */}
      {toastMessage && (
        <div
          className="fixed bottom-24 left-1/2 z-50 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2"
          style={{
            transform: 'translateX(-50%)',
            background: '#0d1e3f',
            border: '1px solid rgba(59,130,246,0.3)',
            boxShadow: '0 0 24px rgba(59,130,246,0.2), 0 4px 16px rgba(0,0,0,0.5)',
            color: '#f1f5f9',
            animation: 'pageEnter 0.25s ease forwards',
            whiteSpace: 'nowrap',
          }}
        >
          <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" style={{ boxShadow: '0 0 6px rgba(96,165,250,0.8)' }} />
          {toastMessage}
        </div>
      )}

      {/* Action Menu (+ button) */}
      {showActionMenu && (
        <ActionMenu
          onSelect={handleActionSelect}
          onClose={() => setShowActionMenu(false)}
        />
      )}

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddTransaction={handleAddTransaction}
        currency={currency}
        defaultType={addModalDefaultType}
      />

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        transaction={editingTransaction}
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSave={handleUpdateTransaction}
        currency={currency}
      />

      {/* Delete Confirm Modal */}
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
