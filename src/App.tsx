/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Transaction, TransactionType, CategoryLimit, SavingGoal, Subscription, RecurringIncome, Community, AppView, MonthlyCheckIn } from './types/finance';
import {
  loadTransactions, saveTransactions,
  loadSavedCurrency, saveSelectedCurrency,
  loadMonthlyBudget, saveMonthlyBudget,
  loadCategoryLimits, saveCategoryLimits,
  loadSavingGoals, saveSavingGoals,
  loadSubscriptions, saveSubscriptions,
  loadRecurringIncome, saveRecurringIncome,
  loadUserName, saveUserName,
  loadCheckIn, saveCheckIn,
  SAMPLE_TRANSACTIONS, exportTransactionsToCSV,
} from './utils/storage';
import { isSupabaseConfigured } from './lib/supabase';
import { useAuth } from './hooks/useAuth';
import { usePremium } from './hooks/usePremium';
import {
  loadAllUserData,
  insertTransaction,
  updateTransaction as dbUpdateTransaction,
  deleteTransaction as dbDeleteTransaction,
  saveProfile,
  saveUserPreferences,
  replaceSavingGoals,
  replaceSubscriptions,
  upsertRecurringIncome,
  deleteRecurringIncome as dbDeleteRecurringIncome,
} from './lib/supabaseService';
import { useLanguage } from './i18n/LanguageContext';
import { LangCode } from './i18n/translations';
import { useTheme } from './context/ThemeContext';
import { loadCommunities, saveCommunities } from './utils/communityUtils';
import { calculateCashlyScore } from './utils/insights';
import { fetchUserCommunities, createCommunityInDB, joinCommunityByCode as dbJoinCommunity } from './lib/supabaseService';
import { SetupRemindersProvider } from './context/SetupRemindersContext';
import { NavigationProvider } from './context/NavigationContext';

import { SplashScreen } from './components/SplashScreen';
import { LandingPage } from './components/LandingPage';
import { AuthScreen } from './components/AuthScreen';
import { MobileTopBar } from './components/MobileTopBar';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { StatisticsScreen } from './components/StatisticsScreen';
import { SavingsScreen } from './components/SavingsScreen';
import { BudgetScreen } from './components/BudgetScreen';
import { RecurringScreen } from './components/RecurringScreen';
import { MoneoScoreScreen } from './components/MoneoScoreScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { TransactionHistory } from './components/TransactionHistory';
import { AddTransactionModal } from './components/AddTransactionModal';
import { ActionMenu } from './components/ActionMenu';
import { EditTransactionModal } from './components/EditTransactionModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
// Stage 1 — new screens
import { InsightsHub } from './components/InsightsHub';
import { ActivityScreen } from './components/ActivityScreen';
import { MoneyCoachScreen } from './components/MoneyCoachScreen';
import { WhatIfScreen } from './components/WhatIfScreen';
import { RecurringIncomeScreen } from './components/RecurringIncomeScreen';
import { PremiumUpgradeScreen } from './components/PremiumUpgradeScreen';
// Stage 2 — Community
import { CommunityScreen } from './components/CommunityScreen';
import { CommunityDetailScreen } from './components/CommunityDetailScreen';
// Missing premium screens (fixed)
import { ProjectionScreen } from './components/ProjectionScreen';
import { MoneyStoryScreen } from './components/MoneyStoryScreen';
import { SpendingPatternsScreen } from './components/SpendingPatternsScreen';
import { SafeToSpendScreen } from './components/SafeToSpendScreen';
import { AskMoneoScreen } from './components/AskMoneoScreen';
import { MonthlyCheckInModal } from './components/MonthlyCheckInModal';
// Stage 3 — Earn
import { EarnScreen } from './components/EarnScreen';
import { EarnDetailScreen } from './components/EarnDetailScreen';
import { loadEarnProgress, saveEarnProgress } from './utils/earnStorage';
import { EarnProgress } from './types/finance';
import { EARN_OPPORTUNITIES } from './utils/earnData';

export default function App() {
  const { user, loading: authLoading, signIn, signUp, signOut, resetPassword, updatePassword, isRecoveryMode } = useAuth();
  const { setLanguage } = useLanguage();
  const { isPremium, membership, upgradeToPremium, cancelPremium } = usePremium(user?.id);
  const { isDark, colors } = useTheme();

  const [showSplash, setShowSplash] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [navHistory, setNavHistory] = useState<AppView[]>([]);
  // Ref mirrors navHistory so navigate/goBack always read the latest value
  // without capturing stale closures or calling setState inside updaters.
  const navHistoryRef = useRef<AppView[]>([]);
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'signup'>('signin');
  const [cloudLoading, setCloudLoading] = useState(false);

  // ── Data state (guest defaults from localStorage) ─────────────────────────
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions());
  const [currency, setCurrency] = useState<string>(() => loadSavedCurrency());
  const [monthlyBudget, setMonthlyBudget] = useState<number>(() => loadMonthlyBudget());
  const [categoryLimits, setCategoryLimits] = useState<CategoryLimit[]>(() => loadCategoryLimits());
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>(() => loadSavingGoals());
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => loadSubscriptions());
  const [userName, setUserName] = useState<string>(() => loadUserName());
  const [userAge, setUserAge] = useState<number | null>(null);
  const [userStatus, setUserStatus] = useState<string>('');
  const [recurringIncome, setRecurringIncome] = useState<RecurringIncome[]>(() => loadRecurringIncome());
  const [communities, setCommunities]         = useState<Community[]>(() => loadCommunities());
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [earnProgress, setEarnProgress] = useState<EarnProgress[]>(() => loadEarnProgress());
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);

  // ── Check-in state ────────────────────────────────────────────────────────
  const [checkIn, setCheckIn] = useState<MonthlyCheckIn | null>(() => loadCheckIn());
  const [showCheckIn, setShowCheckIn] = useState(false);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalDefaultType, setAddModalDefaultType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // ── Load cloud data when user signs in ────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    setCloudLoading(true);
    loadAllUserData(user.id)
      .then(async data => {
        setTransactions(data.transactions);
        setSavingGoals(data.savingGoals);
        setSubscriptions(data.subscriptions);
        if (data.preferences) {
          setMonthlyBudget(data.preferences.monthly_budget);
          setCategoryLimits(data.preferences.category_limits);
        }
        if (data.recurringIncome?.length) {
          setRecurringIncome(data.recurringIncome);
          saveRecurringIncome(data.recurringIncome);
        }
        if (data.profile) {
          if (data.profile.name) setUserName(data.profile.name);
          if (data.profile.currency) setCurrency(data.profile.currency);
          if (data.profile.language) setLanguage(data.profile.language as LangCode);
          if (data.profile.age != null) setUserAge(data.profile.age);
          if (data.profile.status) setUserStatus(data.profile.status);
        }

        // Populate profile from signup metadata on first sign-in
        if (data.profile && !data.profile.name) {
          const meta = user.user_metadata as { name?: string; age?: number; status?: string; language?: string } | undefined;
          if (meta?.name) {
            await saveProfile(user.id, {
              name: meta.name,
              age: meta.age ?? null,
              status: meta.status ?? '',
              language: meta.language ?? 'en',
            }).catch(() => {});
            setUserName(meta.name);
            if (meta.age != null) setUserAge(meta.age);
            if (meta.status) setUserStatus(meta.status);
            if (meta.language) setLanguage(meta.language as LangCode);
          }
        }

        // Load communities from Supabase (merge with localStorage challenges)
        fetchUserCommunities(user.id).then(cloudCommunities => {
          if (cloudCommunities.length > 0) {
            const local = loadCommunities();
            // Merge: keep challenges from localStorage, use cloud for membership/members
            const merged = cloudCommunities.map(cc => {
              const localMatch = local.find(lc => lc.id === cc.id);
              return localMatch ? { ...cc, challenges: localMatch.challenges } : cc;
            });
            setCommunities(merged);
            saveCommunities(merged);
          }
        }).catch(() => {});

        setCurrentView('home');
      })
      .catch(() => {
        showToast('Could not load cloud data. Using cached data.');
        setCurrentView('home');
      })
      .finally(() => setCloudLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Show monthly check-in once per month (after app is ready)
  useEffect(() => {
    if (showSplash || authLoading || cloudLoading) return;
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    if (!checkIn || checkIn.month !== currentMonth) {
      const timer = setTimeout(() => setShowCheckIn(true), 1500);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSplash, authLoading, cloudLoading]);

  const handleCheckInComplete = (data: MonthlyCheckIn) => {
    setCheckIn(data);
    saveCheckIn(data);
    setShowCheckIn(false);

    // Flow incomes → RecurringIncome (skip duplicates by name)
    if (data.incomes.length > 0) {
      const existing = recurringIncome;
      const newItems = data.incomes
        .filter(ci => !existing.some(ri => ri.name.toLowerCase() === ci.name.toLowerCase()))
        .map(ci => ({
          id: ci.id,
          name: ci.name,
          amount: ci.amount,
          frequency: ci.frequency,
          nextPaymentDate: ci.nextPaymentDate,
          category: 'Salary' as const,
          isActive: true,
          createdAt: Date.now(),
        }));
      if (newItems.length > 0) handleSaveRecurringIncome([...existing, ...newItems]);
    }

    // Flow expenses → Subscriptions (skip duplicates by name)
    if (data.expenses.length > 0) {
      const existing = subscriptions;
      const newSubs = data.expenses
        .filter(ce => !existing.some(s => s.name.toLowerCase() === ce.name.toLowerCase()))
        .map(ce => ({
          id: ce.id,
          name: ce.name,
          amount: ce.amount,
          frequency: ce.frequency,
          nextPaymentDate: ce.nextPaymentDate,
          category: 'Bills' as const,
          isActive: true,
          createdAt: Date.now(),
        }));
      if (newSubs.length > 0) handleSaveSubscriptions([...existing, ...newSubs]);
    }

    // Flow savings goals → SavingGoals (skip duplicates by name)
    if (data.goals.length > 0) {
      const existing = savingGoals;
      const newGoals = data.goals
        .filter(cg => !existing.some(sg => sg.name.toLowerCase() === cg.name.toLowerCase()))
        .map(cg => ({
          id: cg.id,
          name: cg.name,
          targetAmount: cg.targetAmount,
          currentAmount: cg.currentAmount,
          targetDate: cg.targetDate ?? '',
          createdAt: Date.now(),
        }));
      if (newGoals.length > 0) handleSaveGoals([...existing, ...newGoals]);
    }

    // Flow monthly budget (only if none set yet)
    if (data.monthlyBudget > 0 && monthlyBudget === 0) {
      handleSaveBudget(data.monthlyBudget);
    }
  };

  const handleCheckInSkip = () => {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const skipped: MonthlyCheckIn = {
      month,
      completedAt: Date.now(),
      incomes: [],
      expenses: [],
      goals: [],
      monthlyBudget: 0,
      upcomingExpenses: '',
      skipped: true,
    };
    setCheckIn(skipped);
    saveCheckIn(skipped);
    setShowCheckIn(false);
  };

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

  const handleSaveRecurringIncome = useCallback((items: RecurringIncome[]) => {
    const prev = recurringIncome;
    setRecurringIncome(items);
    saveRecurringIncome(items);
    if (user) {
      // Upsert new/updated items
      items.forEach(item => {
        const old = prev.find(p => p.id === item.id);
        if (!old || JSON.stringify(old) !== JSON.stringify(item)) {
          upsertRecurringIncome(user.id, item).catch(() => {});
        }
      });
      // Delete removed items
      prev.forEach(p => {
        if (!items.find(i => i.id === p.id)) {
          dbDeleteRecurringIncome(user.id, p.id).catch(() => {});
        }
      });
    }
  }, [recurringIncome, user]);

  const handleSaveProfile = (data: { name: string; age: number | null; status: string }) => {
    setUserName(data.name);
    saveUserName(data.name);
    setUserAge(data.age);
    setUserStatus(data.status);
    if (user) saveProfile(user.id, { name: data.name, age: data.age, status: data.status }).catch(() => {});
  };

  const handleSignOut = async () => {
    await signOut();
    setTransactions([]);
    setCurrency('USD');
    setMonthlyBudget(0);
    setCategoryLimits([]);
    setSavingGoals([]);
    setSubscriptions([]);
    setRecurringIncome([]);
    setCommunities([]);
    setSelectedCommunityId(null);
    setUserName('');
    setUserAge(null);
    setUserStatus('');
    setCurrentView('home');
    setShowAuthScreen(false);
  };

  const handleDeleteAccount = async () => {
    if (user) {
      await replaceSavingGoals(user.id, []).catch(() => {});
      await replaceSubscriptions(user.id, []).catch(() => {});
    }
    handleClearAllData();
    await handleSignOut();
  };

  const ROOT_VIEWS: AppView[] = ['home', 'insights', 'budget', 'earn', 'community', 'settings'];

  const navigate = (view: AppView) => {
    if (view === currentView) return;
    const history = navHistoryRef.current;
    const next = ROOT_VIEWS.includes(view) ? [] : [...history, currentView];
    navHistoryRef.current = next;
    setNavHistory(next);
    setCurrentView(view);
  };

  // goBack is stable (no deps) — reads/writes via ref so there's no stale
  // closure and no setState-inside-updater side effects.
  const goBack = useCallback(() => {
    const history = navHistoryRef.current;
    const target = history.length > 0 ? history[history.length - 1] : 'home';
    const next = history.slice(0, -1);
    navHistoryRef.current = next;
    setNavHistory(next);
    setCurrentView(target);
  }, []);

  // ── Earn helpers ──────────────────────────────────────────────────────────
  const handleEarnProgressChange = useCallback((updated: EarnProgress[]) => {
    setEarnProgress(updated);
    saveEarnProgress(updated);
  }, []);

  const handleSelectOpportunity = useCallback((id: string) => {
    setSelectedOpportunityId(id);
    const next = [...navHistoryRef.current, 'earn' as AppView];
    navHistoryRef.current = next;
    setNavHistory(next);
    setCurrentView('earn-detail');
  }, []);

  // ── Community helpers ─────────────────────────────────────────────────────
  const handleCommunitiesChange = useCallback((updated: Community[]) => {
    setCommunities(updated);
    saveCommunities(updated);
  }, []);

  const handleSelectCommunity = useCallback((id: string) => {
    setSelectedCommunityId(id);
    const next = [...navHistoryRef.current, 'community'];
    navHistoryRef.current = next;
    setNavHistory(next);
    setCurrentView('community-detail');
  }, []);

  const handleCommunityUpdate = useCallback((updated: Community) => {
    setCommunities(prev => {
      const next = prev.map(c => c.id === updated.id ? updated : c);
      saveCommunities(next);
      return next;
    });
  }, []);

  const currentScore = useMemo(
    () => calculateCashlyScore(transactions, monthlyBudget, categoryLimits, subscriptions, savingGoals, recurringIncome).score,
    [transactions, monthlyBudget, categoryLimits, subscriptions, savingGoals, recurringIncome],
  );

  const handleCreateCommunity = useCallback(async (community: Community) => {
    if (!user) return;
    await createCommunityInDB(user.id, community, userName || 'You', currentScore).catch(() => {});
  }, [user, userName, currentScore]);

  const handleJoinByCode = useCallback(async (code: string): Promise<Community | null> => {
    if (!user) return null;
    return dbJoinCommunity(user.id, code, userName || 'You', currentScore).catch(() => null);
  }, [user, userName, currentScore]);

  // ── Premium upgrade with auto-subscription ────────────────────────────────
  const handleUpgradeToPremium = useCallback(async () => {
    await upgradeToPremium();
    // Auto-add Moneo Premium as a recurring subscription expense (avoid duplicates)
    const alreadyExists = subscriptions.some(s => s.name === 'Moneo Premium' && s.isActive);
    if (!alreadyExists) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const newSub: import('./types/finance').Subscription = {
        id: 'moneo-premium-' + Date.now(),
        name: 'Moneo Premium',
        amount: 1.99,
        frequency: 'monthly',
        nextPaymentDate: nextMonth.toISOString().split('T')[0],
        category: 'Subscriptions',
        isActive: true,
        createdAt: Date.now(),
      };
      handleSaveSubscriptions([...subscriptions, newSub]);
    }
  }, [upgradeToPremium, subscriptions, handleSaveSubscriptions]);

  const handleCancelPremium = useCallback(async () => {
    await cancelPremium();
    // Deactivate the Moneo Premium subscription entry
    const updated = subscriptions.map(s =>
      s.name === 'Moneo Premium' ? { ...s, isActive: false } : s,
    );
    handleSaveSubscriptions(updated);
  }, [cancelPremium, subscriptions, handleSaveSubscriptions]);

  const openAddModal = (type: TransactionType) => {
    setAddModalDefaultType(type);
    setShowAddModal(true);
    setShowActionMenu(false);
  };

  const handleActionSelect = (action: 'expense' | 'income' | 'recurring' | 'scan') => {
    setShowActionMenu(false);
    if (action === 'expense') { openAddModal('expense'); }
    else if (action === 'income') { openAddModal('income'); }
    else if (action === 'recurring') { navigate('recurring'); }
    else if (action === 'scan') { showToast('Scan receipt — coming soon!'); }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  // Splash is shown on every app open, covering auth loading
  if (showSplash || authLoading) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (cloudLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: colors.bgPrimary }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: colors.accentSoft, borderTopColor: colors.accent }} />
          <span className="text-xs font-semibold" style={{ color: colors.textMuted }}>Syncing your data…</span>
        </div>
      </div>
    );
  }

  if (isRecoveryMode) {
    return (
      <AuthScreen
        onSignIn={signIn} onSignUp={signUp}
        onResetPassword={resetPassword} onUpdatePassword={updatePassword}
        isRecoveryMode={isRecoveryMode}
      />
    );
  }

  if (!user) {
    if (showAuthScreen) {
      return (
        <AuthScreen
          onSignIn={signIn} onSignUp={signUp}
          onResetPassword={resetPassword} onUpdatePassword={updatePassword}
          initialMode={authInitialMode}
          onGoBack={() => setShowAuthScreen(false)}
        />
      );
    }
    return (
      <LandingPage
        onGetStarted={(mode) => { setAuthInitialMode(mode); setShowAuthScreen(true); }}
      />
    );
  }

  // Authenticated: go straight to dashboard — no onboarding inside the app.
  return (
    <NavigationProvider goBack={goBack}>
    <SetupRemindersProvider
      data={{ recurringIncome, subscriptions, monthlyBudget, savingGoals, checkIn }}
      onNavigate={navigate}
      onTriggerCheckIn={() => setShowCheckIn(true)}
    >
    <div className="desktop-bg">
      <div className="app-shell">

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

        <div className="app-content">
          {currentView === 'home' && (
            <HomeScreen
              transactions={transactions}
              currency={currency}
              monthlyBudget={monthlyBudget}
              categoryLimits={categoryLimits}
              subscriptions={subscriptions}
              savingGoals={savingGoals}
              recurringIncome={recurringIncome}
              userName={userName}
              onViewAllTransactions={() => navigate('transactions')}
              onEdit={tx => setEditingTransaction(tx)}
              onDelete={tx => setDeletingTransaction(tx)}
              onLoadSample={handleLoadSampleData}
              onAddExpense={() => openAddModal('expense')}
              onAddIncome={() => openAddModal('income')}
              onNavigateStats={() => navigate('statistics')}
              onNavigateBudget={() => navigate('budget')}
              onNavigateScore={() => navigate('moneo-score')}
              onNavigate={navigate}
            />
          )}

          {/* ── Existing views ─────────────────────────────── */}
          {currentView === 'statistics' && (
            <StatisticsScreen transactions={transactions} currency={currency} />
          )}

          {currentView === 'savings' && (
            <SavingsScreen
              currency={currency}
              goals={savingGoals}
              onSaveGoals={handleSaveGoals}
            />
          )}

          {currentView === 'budget' && (
            <BudgetScreen
              monthlyBudget={monthlyBudget}
              categoryLimits={categoryLimits}
              transactions={transactions}
              currency={currency}
              onSaveBudget={handleSaveBudget}
              onSaveLimits={handleSaveLimits}
              onNavigateRecurring={() => navigate('recurring')}
              onNavigateSavings={() => navigate('savings')}
            />
          )}

          {currentView === 'recurring' && (
            <RecurringScreen
              subscriptions={subscriptions}
              currency={currency}
              onSaveSubscriptions={handleSaveSubscriptions}
            />
          )}

          {currentView === 'moneo-score' && (
            <MoneoScoreScreen
              transactions={transactions}
              monthlyBudget={monthlyBudget}
              categoryLimits={categoryLimits}
              subscriptions={subscriptions}
              savingGoals={savingGoals}
              recurringIncome={recurringIncome}
              currency={currency}
            />
          )}

          {currentView === 'settings' && (
            <SettingsScreen
              transactionCount={transactions.length}
              onLoadSampleData={handleLoadSampleData}
              onClearAllData={handleClearAllData}
              onExportCSV={handleExportCSV}
              userName={userName}
              userEmail={user.email ?? ''}
              userAge={userAge}
              userStatus={userStatus}
              onSaveProfile={handleSaveProfile}
              user={user}
              onSignOut={handleSignOut}
              onChangePassword={updatePassword}
              onDeleteAccount={handleDeleteAccount}
              isPremium={isPremium}
              membershipStartedAt={membership.startedAt}
              onNavigatePremium={() => navigate('premium')}
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

          {/* ── Stage 1 new views ──────────────────────────── */}
          {currentView === 'activity' && (
            <ActivityScreen
              transactions={transactions}
              subscriptions={subscriptions}
              recurringIncome={recurringIncome}
              currency={currency}
              onEdit={tx => setEditingTransaction(tx)}
              onDelete={tx => setDeletingTransaction(tx)}
            />
          )}

          {currentView === 'insights' && (
            <InsightsHub
              transactions={transactions}
              currency={currency}
              monthlyBudget={monthlyBudget}
              categoryLimits={categoryLimits}
              subscriptions={subscriptions}
              savingGoals={savingGoals}
              recurringIncome={recurringIncome}
              isPremium={isPremium}
              onNavigate={navigate}
            />
          )}

          {currentView === 'money-coach' && (
            <MoneyCoachScreen
              transactions={transactions}
              currency={currency}
              monthlyBudget={monthlyBudget}
              categoryLimits={categoryLimits}
              subscriptions={subscriptions}
              savingGoals={savingGoals}
              recurringIncome={recurringIncome}
              onNavigate={navigate}
            />
          )}

          {currentView === 'what-if' && (
            <WhatIfScreen
              transactions={transactions}
              currency={currency}
              monthlyBudget={monthlyBudget}
              categoryLimits={categoryLimits}
              subscriptions={subscriptions}
              savingGoals={savingGoals}
              isPremium={isPremium}
              onNavigate={navigate}
              onUpgrade={() => navigate('premium')}
            />
          )}

          {currentView === 'recurring-income' && (
            <RecurringIncomeScreen
              items={recurringIncome}
              currency={currency}
              onSave={handleSaveRecurringIncome}
              onNavigate={navigate}
            />
          )}

          {currentView === 'safe-to-spend' && (
            <SafeToSpendScreen
              transactions={transactions}
              subscriptions={subscriptions}
              currency={currency}
              monthlyBudget={monthlyBudget}
              checkIn={checkIn}
              recurringIncome={recurringIncome}
              onNavigate={navigate}
            />
          )}

          {currentView === 'projection' && (
            <ProjectionScreen
              transactions={transactions}
              currency={currency}
              monthlyBudget={monthlyBudget}
              subscriptions={subscriptions}
              savingGoals={savingGoals}
              categoryLimits={categoryLimits}
              isPremium={isPremium}
              onNavigate={navigate}
              onUpgrade={handleUpgradeToPremium}
            />
          )}

          {currentView === 'money-story' && (
            <MoneyStoryScreen
              transactions={transactions}
              currency={currency}
              isPremium={isPremium}
              onNavigate={navigate}
              onUpgrade={handleUpgradeToPremium}
            />
          )}

          {currentView === 'spending-patterns' && (
            <SpendingPatternsScreen
              transactions={transactions}
              currency={currency}
              isPremium={isPremium}
              onNavigate={navigate}
              onUpgrade={handleUpgradeToPremium}
            />
          )}

          {currentView === 'ask-moneo' && (
            <AskMoneoScreen
              transactions={transactions}
              currency={currency}
              monthlyBudget={monthlyBudget}
              categoryLimits={categoryLimits}
              subscriptions={subscriptions}
              savingGoals={savingGoals}
              recurringIncome={recurringIncome}
              isPremium={isPremium}
              onNavigate={navigate}
              onUpgrade={handleUpgradeToPremium}
            />
          )}

          {/* ── Stage 3 — Earn ────────────────────────────────── */}
          {currentView === 'earn' && (
            <EarnScreen
              userAge={userAge}
              userStatus={userStatus}
              userName={userName}
              earnProgress={earnProgress}
              onProgressChange={handleEarnProgressChange}
              onNavigate={navigate}
              onSelectOpportunity={handleSelectOpportunity}
              onAddRecurringIncome={() => navigate('recurring-income')}
            />
          )}

          {currentView === 'earn-detail' && (() => {
            const opp = EARN_OPPORTUNITIES.find(o => o.id === selectedOpportunityId);
            if (!opp) return null;
            return (
              <EarnDetailScreen
                opportunity={opp}
                earnProgress={earnProgress}
                onProgressChange={handleEarnProgressChange}
                onAddRecurringIncome={() => navigate('recurring-income')}
              />
            );
          })()}

          {currentView === 'premium' && (
            <PremiumUpgradeScreen
              isPremium={isPremium}
              membershipStartedAt={membership.startedAt}
              onUpgrade={handleUpgradeToPremium}
              onCancelPremium={handleCancelPremium}
              onGoBack={goBack}
            />
          )}

          {currentView === 'community' && (
            <CommunityScreen
              userId={user.id}
              userName={userName}
              isPremium={isPremium}
              communities={communities}
              currentScore={currentScore}
              onCommunitiesChange={handleCommunitiesChange}
              onSelectCommunity={handleSelectCommunity}
              onNavigate={navigate}
              onCreateCommunity={handleCreateCommunity}
              onJoinByCode={handleJoinByCode}
            />
          )}

          {currentView === 'community-detail' && (() => {
            const community = communities.find(c => c.id === selectedCommunityId);
            if (!community) return <div className="px-4 pt-6 text-slate-500 text-sm">Community not found.</div>;
            return (
              <CommunityDetailScreen
                community={community}
                userId={user.id}
                userName={userName}
                isPremium={isPremium}
                transactions={transactions}
                monthlyBudget={monthlyBudget}
                categoryLimits={categoryLimits}
                subscriptions={subscriptions}
                savingGoals={savingGoals}
                currency={currency}
                currentScore={currentScore}
                onBack={goBack}
                onCommunityUpdate={handleCommunityUpdate}
                onNavigate={navigate}
              />
            );
          })()}
        </div>

        <BottomNav
          currentView={currentView}
          onNavigate={navigate}
        />
      </div>

      {/* Floating add button */}
      <button
        className="fab-add"
        onClick={() => setShowActionMenu(true)}
        aria-label="Add transaction"
        style={{ position: 'fixed', bottom: 72, right: 20, zIndex: 40 }}
      >
        <span style={{ fontSize: 22, fontWeight: 300, lineHeight: 1, color: 'white' }}>+</span>
      </button>

      {/* Toast */}
      {toastMessage && (
        <div
          className="fixed bottom-24 left-1/2 z-50 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2"
          style={{
            transform: 'translateX(-50%)',
            background: colors.bgCard,
            border: `1px solid ${colors.borderStrong}`,
            boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.10)',
            color: colors.textPrimary,
            animation: 'pageEnter 0.25s ease forwards',
            whiteSpace: 'nowrap',
          }}
        >
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colors.accent }} />
          {toastMessage}
        </div>
      )}

      {showActionMenu && (
        <ActionMenu onSelect={handleActionSelect} onClose={() => setShowActionMenu(false)} />
      )}

      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddTransaction={handleAddTransaction}
        currency={currency}
        defaultType={addModalDefaultType}
      />

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

      {showCheckIn && (
        <MonthlyCheckInModal
          currency={currency}
          onComplete={handleCheckInComplete}
          onSkip={handleCheckInSkip}
          onNavigate={navigate}
        />
      )}
    </div>
    </SetupRemindersProvider>
    </NavigationProvider>
  );
}
