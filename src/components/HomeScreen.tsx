import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight, ArrowDownRight, ChevronRight, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, AlertTriangle, Sparkles, Wallet,
  BarChart2, ShieldCheck, Zap, Flame, PiggyBank, CalendarDays,
  Info, Plus,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { Transaction, CategoryLimit, Subscription, SavingGoal, RecurringIncome } from '../types/finance';
import { monthlyEquivalent } from '../utils/recurringUtils';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CategoryIcon, getCategoryColor } from './CategoryIcon';
import { CashlyScore } from './CashlyScore';
import {
  generateInsights, calculateCashlyScore, calculateSafeToSpend,
  getGreeting, Insight, InsightIcon,
} from '../utils/insights';

interface HomeScreenProps {
  transactions: Transaction[];
  currency: string;
  monthlyBudget: number;
  categoryLimits: CategoryLimit[];
  subscriptions: Subscription[];
  savingGoals: SavingGoal[];
  recurringIncome: RecurringIncome[];
  userName: string;
  onViewAllTransactions: () => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  onLoadSample: () => void;
  onAddExpense: () => void;
  onAddIncome: () => void;
  onNavigateStats: () => void;
  onNavigateBudget: () => void;
  onNavigateScore: () => void;
}

function getCurrentMonthPrefix(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
}

function getProgressColor(pct: number): string {
  if (pct >= 100) return '#ef4444';
  if (pct >= 80) return '#f97316';
  if (pct >= 60) return '#eab308';
  return '#3b82f6';
}

const INSIGHT_ICON_MAP: Record<InsightIcon, React.ElementType> = {
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'alert': AlertTriangle,
  'info': Info,
  'sparkle': Sparkles,
  'calendar': CalendarDays,
  'piggy': PiggyBank,
  'fire': Flame,
  'zap': Zap,
};

function getInsightColors(isDark: boolean) {
  return {
    positive: { bg: isDark ? 'rgba(16,185,129,0.16)'  : 'rgba(16,185,129,0.07)',  border: isDark ? 'rgba(16,185,129,0.32)'  : 'rgba(16,185,129,0.18)',  icon: '#10b981', text: isDark ? '#34d399' : '#065f46' },
    warning:  { bg: isDark ? 'rgba(239,68,68,0.15)'   : 'rgba(239,68,68,0.06)',   border: isDark ? 'rgba(239,68,68,0.30)'   : 'rgba(239,68,68,0.16)',   icon: '#ef4444', text: isDark ? '#f87171' : '#991b1b' },
    neutral:  { bg: isDark ? 'rgba(59,130,246,0.15)'  : 'rgba(59,130,246,0.06)',  border: isDark ? 'rgba(59,130,246,0.30)'  : 'rgba(59,130,246,0.16)',  icon: '#3b82f6', text: isDark ? '#93c5fd' : '#1e40af' },
    info:     { bg: isDark ? 'rgba(139,92,246,0.16)'  : 'rgba(139,92,246,0.07)',  border: isDark ? 'rgba(139,92,246,0.32)'  : 'rgba(139,92,246,0.18)',  icon: '#8b5cf6', text: isDark ? '#c4b5fd' : '#5b21b6' },
  };
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  transactions, currency, monthlyBudget, categoryLimits, subscriptions,
  savingGoals, recurringIncome, userName,
  onViewAllTransactions, onEdit, onLoadSample,
  onAddExpense, onAddIncome, onNavigateStats, onNavigateBudget, onNavigateScore,
}) => {
  const { isDark, toggleTheme, colors } = useTheme();
  const { t } = useLanguage();
  const INSIGHT_COLORS = getInsightColors(isDark);
  const [balanceExpanded, setBalanceExpanded] = useState(false);
  const prefix = getCurrentMonthPrefix();
  const greeting = getGreeting(userName || undefined);

  const { totalIncome, totalExpenses, balance, thisMonthIncome, thisMonthExpenses } = useMemo(() => {
    let inc = 0, exp = 0, mInc = 0, mExp = 0;
    transactions.forEach(t => {
      if (t.type === 'income') { inc += t.amount; if (t.date.startsWith(prefix)) mInc += t.amount; }
      else { exp += t.amount; if (t.date.startsWith(prefix)) mExp += t.amount; }
    });
    return { totalIncome: inc, totalExpenses: exp, balance: inc - exp, thisMonthIncome: mInc, thisMonthExpenses: mExp };
  }, [transactions, prefix]);

  const recentTx = useMemo(() =>
    [...transactions].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6),
    [transactions]
  );

  const categorySpend = useMemo(() => {
    const m: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense' && t.date.startsWith(prefix))
      .forEach(t => { m[t.category] = (m[t.category] || 0) + t.amount; });
    return m;
  }, [transactions, prefix]);

  const safeToSpend = useMemo(() => calculateSafeToSpend(transactions, subscriptions), [transactions, subscriptions]);

  const monthlyRecurringIncome = useMemo(() =>
    recurringIncome.filter(r => r.isActive).reduce((s, r) => s + monthlyEquivalent(r.amount, r.frequency), 0),
    [recurringIncome],
  );
  const insights = useMemo(() => generateInsights(transactions, currency, subscriptions), [transactions, currency, subscriptions]);
  const scoreResult = useMemo(() => calculateCashlyScore(transactions, monthlyBudget, categoryLimits, subscriptions, savingGoals), [transactions, monthlyBudget, categoryLimits, subscriptions, savingGoals]);

  const budgetPct = monthlyBudget > 0 ? (thisMonthExpenses / monthlyBudget) * 100 : 0;
  const isPositive = balance >= 0;
  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const isEmpty = transactions.length === 0;

  return (
    <div className="page-enter pb-8 space-y-4">

      {/* ── GREETING ─────────────────────────────────── */}
      <div className="px-4 pt-5 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>{monthLabel}</p>
          <p className="text-xl font-bold mt-0.5 leading-tight" style={{ color: colors.textPrimary }}>{greeting}</p>
        </div>
        {/* ── THEME TOGGLE ── */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="flex items-center rounded-full p-0.5 transition-all cursor-pointer"
          style={{
            background: isDark ? '#13141e' : '#eff0f8',
            border: `1px solid ${colors.borderStrong}`,
            boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.07)',
          }}
        >
          {(['☀️', '🌙'] as const).map((emoji, idx) => {
            const isActive = idx === 0 ? !isDark : isDark;
            return (
              <div key={emoji} style={{
                width: 30, height: 30, borderRadius: '50%',
                background: isActive ? (isDark ? colors.border : '#ffffff') : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
                boxShadow: isActive ? (isDark ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.1)') : 'none',
              }}>{emoji}</div>
            );
          })}
        </button>
      </div>

      {/* ── BALANCE CARD ─────────────────────────────── */}
      <div className="px-4 card-float-1">
        <div
          className="balance-card rounded-3xl p-5 cursor-pointer select-none"
          style={{ WebkitTapHighlightColor: 'transparent' }}
          onClick={() => setBalanceExpanded(v => !v)}
        >
          {/* Details toggle */}
          <div className="flex justify-end mb-1">
            <div className="flex items-center gap-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <span className="font-semibold">{balanceExpanded ? t('lessBtn') : t('detailsBtn')}</span>
              {balanceExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </div>
          </div>

          {/* Big balance number */}
          <div className="pt-1 pb-5">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {t('totalBalance')}
            </p>
            <span
              className="font-bold tracking-tight leading-none"
              style={{ fontSize: 46, color: isPositive ? '#ffffff' : '#fca5a5', display: 'block', letterSpacing: '-0.03em' }}
            >
              {formatCurrency(Math.abs(balance), currency)}
            </span>
            {!isPositive && (
              <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                {t('overspentLabel')}
              </span>
            )}
          </div>

          {/* Income / Expense chips */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 rounded-2xl px-3 py-2.5" style={{ background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.25)', backdropFilter: 'blur(8px)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.25)' }}>
                  <ArrowUpRight size={10} style={{ color: '#34d399' }} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'rgba(52,211,153,0.9)' }}>{t('income')}</span>
              </div>
              <p className="text-[15px] font-bold" style={{ color: '#ffffff' }}>{formatCurrency(totalIncome, currency)}</p>
            </div>
            <div className="flex-1 rounded-2xl px-3 py-2.5" style={{ background: 'rgba(239,68,68,0.14)', border: '1px solid rgba(239,68,68,0.25)', backdropFilter: 'blur(8px)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(248,113,113,0.25)' }}>
                  <ArrowDownRight size={10} style={{ color: '#f87171' }} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'rgba(248,113,113,0.9)' }}>{t('expenses')}</span>
              </div>
              <p className="text-[15px] font-bold" style={{ color: '#ffffff' }}>{formatCurrency(totalExpenses, currency)}</p>
            </div>
          </div>

          {/* Expandable: Safe to spend */}
          {balanceExpanded && (
            <div className="expand-in space-y-3 pt-2" style={{ borderTop: '1px solid rgba(99,102,241,0.15)' }}>
              {/* Safe to spend */}
              <div className="safe-spend-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-green-400 uppercase tracking-wider mb-0.5">{t('safeToSpend')}</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(safeToSpend.safeAmount, currency)}</p>
                  </div>
                  <ShieldCheck size={28} className="text-green-400 opacity-60" />
                </div>
                <div className="mt-2.5 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">{t('incomeLogged')}</span>
                    <span className="text-slate-300 font-medium">{formatCurrency(safeToSpend.income, currency)}</span>
                  </div>
                  {monthlyRecurringIncome > 0 && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">{t('expectedRecurring')}</span>
                      <span className="text-emerald-400 font-medium">+ {formatCurrency(monthlyRecurringIncome, currency)}/mo</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">{t('spentSoFar')}</span>
                    <span className="text-red-400 font-medium">− {formatCurrency(safeToSpend.expenses, currency)}</span>
                  </div>
                  {safeToSpend.subsRemaining > 0 && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">{t('upcomingSubs')}</span>
                      <span className="text-yellow-400 font-medium">− {formatCurrency(safeToSpend.subsRemaining, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">{t('savingsBuffer')}</span>
                    <span className="text-blue-400 font-medium">− {formatCurrency(safeToSpend.savingsBuffer, currency)}</span>
                  </div>
                </div>
              </div>

              {/* This month budget bar */}
              {monthlyBudget > 0 && (
                <div>
                  <div className="flex justify-between mb-1.5 text-[11px]">
                    <span className="text-slate-400 font-semibold">{t('monthlyBudgetLabel')}</span>
                    <span className={budgetPct >= 100 ? 'text-red-400 font-bold' : budgetPct >= 80 ? 'text-orange-400 font-bold' : 'text-slate-500'}>
                      {budgetPct.toFixed(0)}% {t('usedLabel')}
                    </span>
                  </div>
                  <div className="progress-track h-2">
                    <div className="progress-fill" style={{
                      width: `${Math.min(budgetPct, 100)}%`,
                      background: getProgressColor(budgetPct),
                      boxShadow: `0 0 6px ${getProgressColor(budgetPct)}60`,
                    }} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── QUICK ACTIONS ────────────────────────────── */}
      <div className="px-4 card-float-2">
        <div className="flex gap-2">
          {[
            { labelKey: 'expenseType' as const, icon: ArrowDownRight, color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.18)', onClick: onAddExpense },
            { labelKey: 'incomeType' as const, icon: ArrowUpRight,   color: '#34d399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.18)', onClick: onAddIncome },
            { labelKey: 'statisticsTitle' as const, icon: BarChart2, color: '#818cf8', bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.18)', onClick: onNavigateStats },
            { labelKey: 'budget' as const, icon: Wallet,             color: '#c084fc', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.18)', onClick: onNavigateBudget },
          ].map(({ labelKey, icon: Icon, color, bg, border, onClick }) => (
            <button key={labelKey} onClick={onClick} className="quick-action-btn">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: bg, border: `1px solid ${border}` }}
              >
                <Icon size={18} style={{ color }} strokeWidth={2.2} />
              </div>
              <span className="text-[11px] font-bold" style={{ color: colors.textSecondary }}>{t(labelKey)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── MONEO SCORE ──────────────────────────────── */}
      <div className="px-4 card-float-3">
        <CashlyScore result={scoreResult} onViewDetails={onNavigateScore} />
      </div>

      {/* ── INSIGHTS ─────────────────────────────────── */}
      {insights.length > 0 && (
        <div className="card-float-4">
          <div className="flex items-center justify-between px-4 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={14} style={{ color: colors.accent }} />
              <h3 className="text-sm font-bold" style={{ color: colors.textPrimary }}>{t('yourInsights')}</h3>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>{t('basedOnYourData')}</span>
          </div>
          <div className="insights-scroll px-4">
            {insights.map((insight, i) => {
              const ic = INSIGHT_COLORS[insight.type] || INSIGHT_COLORS.info;
              const Icon = INSIGHT_ICON_MAP[insight.icon] || Info;
              return (
                <div
                  key={insight.id}
                  className="insight-card"
                  style={{
                    background: ic.bg,
                    border: `1px solid ${ic.border}`,
                    borderLeft: `3px solid ${ic.icon}`,
                    animation: `insightSlide 0.32s ${i * 0.07}s cubic-bezier(0.22,1,0.36,1) both`,
                    paddingLeft: 14,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${ic.icon}18`, border: `1px solid ${ic.icon}30` }}>
                      <Icon size={14} style={{ color: ic.icon }} strokeWidth={2.2} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: ic.icon }}>
                      {insight.type}
                    </span>
                  </div>
                  <p className="text-[12px] font-semibold leading-relaxed" style={{ color: ic.text }}>
                    {insight.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── EMPTY STATE ──────────────────────────────── */}
      {isEmpty && (
        <div className="px-4 card-float-4">
          <div className="card-dark rounded-3xl p-8 text-center">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <TrendingUp size={28} className="text-blue-400" />
            </div>
            <p className="font-bold text-base mb-2" style={{ color: colors.textPrimary }}>{t('noTransactionsYet')}</p>
            <p className="text-sm leading-relaxed mb-5" style={{ color: colors.textSecondary }}>
              {t('addFirstTransactionHint')}
            </p>
            <button onClick={onAddExpense} className="btn-blue px-6 py-2.5 rounded-xl text-sm cursor-pointer inline-flex items-center gap-2">
              <Plus size={16} /> {t('addTransaction')}
            </button>
          </div>
        </div>
      )}

      {/* ── RECENT TRANSACTIONS ──────────────────────── */}
      {!isEmpty && (
        <div className="px-4 card-float-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold" style={{ color: colors.textPrimary }}>{t('recentTransactions')}</h3>
            <button onClick={onViewAllTransactions} className="flex items-center gap-0.5 text-xs font-semibold cursor-pointer" style={{ color: colors.accent }}>
              {t('seeAll')} <ChevronRight size={14} />
            </button>
          </div>
          <div className="card-dark rounded-2xl overflow-hidden">
            {recentTx.map((tx, i) => {
              const isIncome = tx.type === 'income';
              const catColor = getCategoryColor(tx.category, tx.type);
              return (
                <div
                  key={tx.id}
                  className="tx-row"
                  style={{ borderBottom: i < recentTx.length - 1 ? `1px solid ${colors.divider}` : 'none' }}
                  onClick={() => onEdit(tx)}
                >
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${catColor}16`, border: `1px solid ${catColor}25` }}
                  >
                    <CategoryIcon category={tx.category} type={tx.type} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: colors.textPrimary }}>{tx.description}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: colors.textMuted }}>{formatDate(tx.date)} · {tx.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className="font-bold font-mono text-[14px]"
                      style={{ color: isIncome ? '#22c55e' : '#f87171' }}
                    >
                      {isIncome ? '+' : '−'}{formatCurrency(tx.amount, currency)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── BUDGET CATEGORIES ────────────────────────── */}
      {categoryLimits.length > 0 && !isEmpty && (
        <div className="px-4 card-float-6">
          <h3 className="text-sm font-bold mb-3" style={{ color: colors.textPrimary }}>{t('categoryLimitsTitle')}</h3>
          <div className="space-y-2.5">
            {categoryLimits.slice(0, 5).map(limit => {
              const spent = categorySpend[limit.category] || 0;
              const pct = limit.limit > 0 ? (spent / limit.limit) * 100 : 0;
              const color = getCategoryColor(limit.category, 'expense');
              const remaining = limit.limit - spent;
              return (
                <div key={limit.category} className="card-dark rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18`, color }}>
                        <CategoryIcon category={limit.category} type="expense" size={15} />
                      </div>
                      <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{limit.category}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: pct >= 100 ? '#ef4444' : colors.textPrimary }}>
                        {formatCurrency(spent, currency)}
                      </p>
                      <p className="text-[10px] text-slate-500">/ {formatCurrency(limit.limit, currency)}</p>
                    </div>
                  </div>
                  <div className="progress-track h-2">
                    <div className="progress-fill" style={{
                      width: `${Math.min(pct, 100)}%`,
                      background: getProgressColor(pct),
                      boxShadow: `0 0 5px ${getProgressColor(pct)}50`,
                    }} />
                  </div>
                  <p className={`text-[11px] mt-1.5 font-medium ${remaining < 0 ? 'text-red-400' : pct >= 90 ? 'text-orange-400' : 'text-slate-500'}`}>
                    {remaining >= 0
                      ? pct >= 90 ? `⚠ ${formatCurrency(remaining, currency)} ${t('remaining')}` : `${formatCurrency(remaining, currency)} ${t('remaining')}`
                      : `${formatCurrency(Math.abs(remaining), currency)} ${t('overLimit')}`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
