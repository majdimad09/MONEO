import React, { useMemo } from 'react';
import {
  ArrowUpRight, ArrowDownRight, ChevronRight,
  TrendingUp, TrendingDown, AlertTriangle, Sparkles,
  Wallet, BarChart2, Zap, Flame, PiggyBank,
  CalendarDays, Info, Sun, Moon,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { Transaction, CategoryLimit, Subscription, SavingGoal, RecurringIncome } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CategoryIcon, getCategoryColor } from './CategoryIcon';
import {
  generateInsights, calculateCashlyScore,
  getGreeting, getScoreLevel, InsightIcon,
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

function getBarColor(pct: number): string {
  if (pct >= 100) return '#ef4444';
  if (pct >= 80)  return '#f97316';
  if (pct >= 60)  return '#f59e0b';
  return '#10b981';
}

const INSIGHT_ICON_MAP: Record<InsightIcon, React.ElementType> = {
  'trending-up':   TrendingUp,
  'trending-down': TrendingDown,
  'alert':         AlertTriangle,
  'info':          Info,
  'sparkle':       Sparkles,
  'calendar':      CalendarDays,
  'piggy':         PiggyBank,
  'fire':          Flame,
  'zap':           Zap,
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  transactions, currency, monthlyBudget, categoryLimits, subscriptions,
  savingGoals, recurringIncome, userName,
  onViewAllTransactions, onEdit, onLoadSample,
  onAddExpense, onAddIncome, onNavigateStats, onNavigateBudget, onNavigateScore,
}) => {
  const { isDark, toggleTheme, colors } = useTheme();
  const { t } = useLanguage();
  const prefix       = getCurrentMonthPrefix();
  const monthLabel   = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const greeting     = getGreeting(userName || undefined);
  const initials     = (userName || 'M').split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || 'M';

  const { totalIncome, totalExpenses, balance, thisMonthIncome, thisMonthExpenses } = useMemo(() => {
    let inc = 0, exp = 0, mInc = 0, mExp = 0;
    transactions.forEach(tx => {
      if (tx.type === 'income') { inc += tx.amount; if (tx.date.startsWith(prefix)) mInc += tx.amount; }
      else { exp += tx.amount; if (tx.date.startsWith(prefix)) mExp += tx.amount; }
    });
    return { totalIncome: inc, totalExpenses: exp, balance: inc - exp, thisMonthIncome: mInc, thisMonthExpenses: mExp };
  }, [transactions, prefix]);

  const recentTx = useMemo(() =>
    [...transactions].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5),
    [transactions]
  );

  const categorySpend = useMemo(() => {
    const m: Record<string, number> = {};
    transactions.filter(tx => tx.type === 'expense' && tx.date.startsWith(prefix))
      .forEach(tx => { m[tx.category] = (m[tx.category] || 0) + tx.amount; });
    return m;
  }, [transactions, prefix]);

  const insights = useMemo(() =>
    generateInsights(transactions, currency, subscriptions),
    [transactions, currency, subscriptions]
  );
  const scoreResult = useMemo(() =>
    calculateCashlyScore(transactions, monthlyBudget, categoryLimits, subscriptions, savingGoals),
    [transactions, monthlyBudget, categoryLimits, subscriptions, savingGoals]
  );

  const budgetPct       = monthlyBudget > 0 ? (thisMonthExpenses / monthlyBudget) * 100 : 0;
  const budgetRemaining = monthlyBudget - thisMonthExpenses;
  const barColor        = getBarColor(budgetPct);
  const level           = getScoreLevel(scoreResult.score);
  const isEmpty         = transactions.length === 0;
  const monthNet        = thisMonthIncome - thisMonthExpenses;
  const isPositive      = balance >= 0;

  return (
    <div className="page-enter pb-4">

      {/* ── HEADER ───────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        {/* Avatar */}
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(34,197,94,0.20), rgba(74,222,128,0.12))'
              : 'linear-gradient(135deg, rgba(16,185,129,0.20), rgba(99,102,241,0.14))',
            color: colors.accent,
            border: `1.5px solid ${colors.accent}30`,
            boxShadow: `0 2px 12px ${colors.accent}20`,
          }}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest leading-none" style={{ color: colors.textMuted }}>
            {monthLabel}
          </p>
          <p className="text-[17px] font-bold leading-tight mt-0.5 truncate" style={{ color: colors.textPrimary, letterSpacing: '-0.02em' }}>
            {greeting}
          </p>
        </div>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-10 h-10 rounded-2xl flex items-center justify-center cursor-pointer transition-all flex-shrink-0"
          style={{
            background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(99,102,241,0.08)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(99,102,241,0.14)'}`,
          }}
        >
          {isDark
            ? <Sun size={16} style={{ color: '#fbbf24' }} />
            : <Moon size={16} style={{ color: '#6366f1' }} />}
        </button>
      </div>

      {/* ── BALANCE HERO CARD ─────────────────────────────────── */}
      <div className="px-4 pb-3 stagger-1">
        <div
          className={isDark ? 'balance-card' : ''}
          style={isDark ? { padding: '22px 20px 20px' } : {
            padding: '22px 20px 20px',
            background: '#ffffff',
            borderRadius: 28,
            border: '1.5px solid rgba(99,102,241,0.14)',
            boxShadow: '0 4px 32px rgba(99,102,241,0.08), 0 1px 0 rgba(255,255,255,0.80) inset',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Month net badge */}
          <div className="flex items-center justify-between mb-1.5">
            <p style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em',
              color: isDark ? 'rgba(255,255,255,0.38)' : colors.brand,
            }}>
              {t('totalBalance')}
            </p>
            {transactions.length > 0 && (
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  fontSize: 10, fontWeight: 700,
                  color: monthNet >= 0 ? (isDark ? '#22c55e' : '#059669') : (isDark ? '#f87171' : '#dc2626'),
                  background: monthNet >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.10)',
                  border: `1px solid ${monthNet >= 0 ? 'rgba(16,185,129,0.28)' : 'rgba(239,68,68,0.25)'}`,
                  borderRadius: 99, padding: '2px 8px',
                }}
              >
                {monthNet >= 0 ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}
                {monthNet >= 0 ? '+' : ''}{formatCurrency(Math.abs(monthNet), currency)}
              </span>
            )}
          </div>

          {/* Big balance */}
          <div className="mb-5">
            <span
              style={{
                fontSize: 50,
                fontWeight: 900,
                letterSpacing: '-0.05em',
                lineHeight: 1,
                color: isPositive
                  ? (isDark ? '#ffffff' : colors.textPrimary)
                  : (isDark ? '#f87171' : '#dc2626'),
                fontFeatureSettings: '"tnum"',
                display: 'block',
                textShadow: isDark && isPositive ? '0 2px 20px rgba(255,255,255,0.10)' : 'none',
              }}
            >
              {isPositive ? '' : '−'}{formatCurrency(Math.abs(balance), currency)}
            </span>
          </div>

          {/* Income & Expenses — vivid gradient cards inspired by reference */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>

            {/* Income — emerald gradient card (dark: near-black + green accent) */}
            <button
              onClick={onAddIncome}
              className="income-gradient-card text-left cursor-pointer active:scale-[0.97] transition-transform"
              style={{ padding: '12px 14px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                <ArrowUpRight size={11} color={isDark ? '#22c55e' : 'rgba(255,255,255,0.80)'} />
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: isDark ? '#22c55e' : 'rgba(255,255,255,0.80)' }}>
                  {t('income')}
                </span>
              </div>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em', fontFeatureSettings: '"tnum"' }}>
                {formatCurrency(thisMonthIncome, currency)}
              </p>
            </button>

            {/* Expenses — coral gradient card (dark: near-black + red accent) */}
            <button
              onClick={onAddExpense}
              className="expense-gradient-card text-left cursor-pointer active:scale-[0.97] transition-transform"
              style={{ padding: '12px 14px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                <ArrowDownRight size={11} color={isDark ? '#f87171' : 'rgba(255,255,255,0.80)'} />
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: isDark ? '#f87171' : 'rgba(255,255,255,0.80)' }}>
                  {t('expenses')}
                </span>
              </div>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em', fontFeatureSettings: '"tnum"' }}>
                {formatCurrency(thisMonthExpenses, currency)}
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* ── QUICK ACTIONS — vivid pill buttons ────────────────── */}
      <div className="px-4 pb-2 stagger-2">
        <div className="grid grid-cols-4 gap-2.5">
          {([
            { label: t('expenseType'), icon: ArrowDownRight, color: '#ef4444', grad: 'linear-gradient(135deg,#b91c1c,#ef4444)', shadow: 'rgba(239,68,68,0.32)', onClick: onAddExpense },
            { label: t('incomeType'),  icon: ArrowUpRight,   color: '#10b981', grad: 'linear-gradient(135deg,#047857,#10b981)', shadow: 'rgba(16,185,129,0.32)',  onClick: onAddIncome },
            { label: t('statisticsTitle'), icon: BarChart2,  color: isDark ? '#4ade80' : '#6366f1', grad: isDark ? 'linear-gradient(135deg,#166534,#22c55e)' : 'linear-gradient(135deg,#4338ca,#6366f1)', shadow: isDark ? 'rgba(34,197,94,0.30)' : 'rgba(99,102,241,0.30)',  onClick: onNavigateStats },
            { label: t('budget'),      icon: Wallet,         color: isDark ? '#86efac' : '#8b5cf6', grad: isDark ? 'linear-gradient(135deg,#14532d,#22c55e)' : 'linear-gradient(135deg,#6d28d9,#8b5cf6)', shadow: isDark ? 'rgba(34,197,94,0.28)' : 'rgba(139,92,246,0.30)', onClick: onNavigateBudget },
          ] as { label: string; icon: React.ElementType; color: string; grad: string; shadow: string; onClick: () => void }[]).map(({ label, icon: Icon, grad, shadow, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="flex flex-col items-center gap-2 py-3.5 px-1 rounded-2xl cursor-pointer transition-all active:scale-[0.95]"
              style={{
                background: isDark ? colors.bgCard : '#ffffff',
                border: `1px solid ${isDark ? colors.border : 'rgba(99,102,241,0.10)'}`,
                boxShadow: isDark ? `0 2px 12px rgba(0,0,0,0.20)` : '0 2px 12px rgba(99,102,241,0.06)',
              }}
            >
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{
                  background: grad,
                  boxShadow: `0 4px 14px ${shadow}`,
                }}
              >
                <Icon size={18} color="#ffffff" strokeWidth={2.2} />
              </div>
              <span className="text-[10px] font-bold text-center leading-tight" style={{ color: colors.textSecondary }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── MONEO SCORE WIDGET ────────────────────────────────── */}
      <div className="px-4 pb-3 stagger-3">
        <button
          onClick={onNavigateScore}
          className="w-full text-left cursor-pointer active:scale-[0.98] transition-transform rounded-3xl overflow-hidden"
          style={{
            background: isDark
              ? `linear-gradient(135deg, ${level.color}18 0%, rgba(8,8,12,0.92) 100%)`
              : `linear-gradient(135deg, ${level.color}14 0%, rgba(255,255,255,0.95) 100%)`,
            border: `1px solid ${level.color}38`,
            boxShadow: isDark ? `0 4px 24px ${level.color}14` : `0 4px 20px ${level.color}12`,
            padding: '18px 18px',
            display: 'flex', alignItems: 'center', gap: 16,
          }}
        >
          {/* Score ring */}
          <div style={{ position: 'relative', flexShrink: 0, width: 72, height: 72 }}>
            <svg width={72} height={72} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={36} cy={36} r={30} fill="none"
                stroke={isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)'}
                strokeWidth={7} />
              <circle cx={36} cy={36} r={30} fill="none"
                stroke={level.color} strokeWidth={7} strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 30}
                strokeDashoffset={scoreResult.hasEnoughData
                  ? 2 * Math.PI * 30 * (1 - scoreResult.score / 100)
                  : 2 * Math.PI * 30}
                style={{
                  filter: `drop-shadow(0 0 10px ${level.color}88)`,
                  transition: 'stroke-dashoffset 1.3s cubic-bezier(0.34,1.2,0.64,1)',
                }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 21, fontWeight: 900, letterSpacing: '-0.04em', color: level.color, lineHeight: 1 }}>
                {scoreResult.hasEnoughData ? scoreResult.score : '?'}
              </span>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: colors.textMuted, marginBottom: 4 }}>
              {t('moneoScore')}
            </p>
            <p style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em', color: scoreResult.hasEnoughData ? level.color : colors.textSecondary, lineHeight: 1.1, marginBottom: 4 }}>
              {scoreResult.hasEnoughData ? level.name : t('buildYourScore')}
            </p>
            <p style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.45 }}>
              {scoreResult.hasEnoughData
                ? (scoreResult.summary.length > 55 ? scoreResult.summary.slice(0, 55) + '…' : scoreResult.summary)
                : t('addMoreTransactions')}
            </p>
          </div>
          <ChevronRight size={16} style={{ color: level.color, opacity: 0.7, flexShrink: 0 }} />
        </button>
      </div>

      {/* ── BUDGET STRIP ──────────────────────────────────────── */}
      {monthlyBudget > 0 && (
        <div className="px-4 pb-3 stagger-4">
          <button
            onClick={onNavigateBudget}
            className="w-full rounded-3xl p-4 text-left cursor-pointer active:scale-[0.99] transition-transform"
            style={{
              background: isDark ? colors.bgCard : '#ffffff',
              border: `1px solid ${isDark ? colors.border : 'rgba(99,102,241,0.10)'}`,
              boxShadow: isDark ? 'none' : '0 2px 12px rgba(99,102,241,0.06)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `${barColor}18` }}
                >
                  <Wallet size={15} style={{ color: barColor }} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>
                  {t('budget')}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {budgetPct >= 80 && <AlertTriangle size={12} style={{ color: barColor }} />}
                <span className="text-sm font-bold" style={{ color: barColor }}>
                  {Math.min(budgetPct, 999).toFixed(0)}%
                </span>
              </div>
            </div>
            <div
              className="rounded-full overflow-hidden mb-3"
              style={{ height: 8, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.08)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(budgetPct, 100)}%`,
                  background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
                  boxShadow: `0 0 10px ${barColor}55`,
                  transition: 'width 1s cubic-bezier(0.34,1.2,0.64,1)',
                }}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-[11px]" style={{ color: colors.textSecondary }}>
                {formatCurrency(thisMonthExpenses, currency)} {t('spent').toLowerCase()}
              </span>
              <span className="text-[11px] font-semibold" style={{ color: budgetRemaining < 0 ? colors.negative : colors.positive }}>
                {budgetRemaining >= 0
                  ? `${formatCurrency(budgetRemaining, currency)} ${t('remaining').toLowerCase()}`
                  : `${formatCurrency(Math.abs(budgetRemaining), currency)} ${t('overBudget').toLowerCase()}`}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* ── AI INSIGHTS ───────────────────────────────────────── */}
      {insights.length > 0 && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={13} style={{ color: '#fbbf24' }} />
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>
              {t('yourInsights')}
            </p>
          </div>
          <div className="space-y-2.5">
            {insights.slice(0, 2).map(ins => {
              const typeColors: Record<string, { bg: string; border: string; icon: string; accent: string }> = {
                positive: { bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.20)', icon: '#10b981', accent: '#10b981' },
                warning:  { bg: 'rgba(239,68,68,0.07)',   border: 'rgba(239,68,68,0.18)',  icon: '#ef4444', accent: '#ef4444' },
                neutral:  { bg: isDark ? 'rgba(34,197,94,0.07)'   : 'rgba(99,102,241,0.08)',  border: isDark ? 'rgba(34,197,94,0.20)'   : 'rgba(99,102,241,0.20)',  icon: isDark ? '#4ade80' : '#6366f1', accent: isDark ? '#4ade80' : '#6366f1' },
                info:     { bg: isDark ? 'rgba(251,191,36,0.07)'  : 'rgba(139,92,246,0.08)',  border: isDark ? 'rgba(251,191,36,0.20)'  : 'rgba(139,92,246,0.20)',  icon: isDark ? '#fbbf24' : '#8b5cf6', accent: isDark ? '#fbbf24' : '#8b5cf6' },
              };
              const tc   = typeColors[ins.type] || typeColors.info;
              const Icon = INSIGHT_ICON_MAP[ins.icon] || Info;
              return (
                <div
                  key={ins.id}
                  className="flex items-start gap-3 rounded-2xl"
                  style={{
                    background: isDark ? tc.bg : tc.bg,
                    border: `1px solid ${tc.border}`,
                    borderLeft: `3px solid ${tc.accent}`,
                    padding: '12px 14px 12px 12px',
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${tc.icon}18` }}
                  >
                    <Icon size={12} style={{ color: tc.icon }} strokeWidth={2.3} />
                  </div>
                  <p className="text-[12px] leading-relaxed flex-1" style={{ color: colors.textSecondary }}>{ins.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── EMPTY STATE ───────────────────────────────────────── */}
      {isEmpty && (
        <div className="px-4 pb-3">
          <div
            className="rounded-3xl p-7 text-center"
            style={{
              background: isDark ? colors.bgCard : '#ffffff',
              border: `1px solid ${isDark ? colors.border : 'rgba(99,102,241,0.10)'}`,
              boxShadow: isDark ? 'none' : '0 4px 24px rgba(99,102,241,0.07)',
            }}
          >
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(99,102,241,0.14))' }}
            >
              <TrendingUp size={28} style={{ color: colors.accent }} />
            </div>
            <p className="font-bold text-[16px] mb-2" style={{ color: colors.textPrimary, letterSpacing: '-0.01em' }}>
              {t('noTransactionsYet')}
            </p>
            <p className="text-[12px] leading-relaxed mb-5" style={{ color: colors.textSecondary }}>
              {t('addFirstTransactionHint')}
            </p>
            <div className="flex gap-2.5 justify-center">
              <button
                onClick={onAddExpense}
                className="expense-gradient-card px-5 py-2.5 text-[13px] font-bold text-white cursor-pointer active:scale-[0.97] transition-transform"
              >
                + {t('expenseType')}
              </button>
              <button
                onClick={onAddIncome}
                className="income-gradient-card px-5 py-2.5 text-[13px] font-bold text-white cursor-pointer active:scale-[0.97] transition-transform"
              >
                + {t('incomeType')}
              </button>
            </div>
            <button
              onClick={onLoadSample}
              className="mt-4 text-[11px] font-semibold cursor-pointer"
              style={{ color: colors.textMuted }}
            >
              {t('loadDemo')}
            </button>
          </div>
        </div>
      )}

      {/* ── RECENT TRANSACTIONS ───────────────────────────────── */}
      {!isEmpty && (
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>
              {t('recentTransactions')}
            </p>
            <button
              onClick={onViewAllTransactions}
              className="flex items-center gap-0.5 text-[11px] font-bold cursor-pointer"
              style={{ color: colors.accent }}
            >
              {t('seeAll')} <ChevronRight size={13} />
            </button>
          </div>

          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: isDark ? colors.bgCard : '#ffffff',
              border: `1px solid ${isDark ? colors.border : 'rgba(99,102,241,0.10)'}`,
              boxShadow: isDark ? 'none' : '0 2px 16px rgba(99,102,241,0.06)',
            }}
          >
            {recentTx.map((tx, i) => {
              const isIncome  = tx.type === 'income';
              const catColor  = getCategoryColor(tx.category, tx.type);
              return (
                <div
                  key={tx.id}
                  className="tx-row"
                  style={{ borderBottom: i < recentTx.length - 1 ? `1px solid ${colors.divider}` : 'none' }}
                  onClick={() => onEdit(tx)}
                >
                  {/* Larger, more vivid category icon */}
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${catColor}22, ${catColor}14)`,
                      border: `1.5px solid ${catColor}28`,
                    }}
                  >
                    <CategoryIcon category={tx.category} type={tx.type} size={17} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: colors.textPrimary }}>
                      {tx.description}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: colors.textMuted }}>
                      {formatDate(tx.date)} · {tx.category}
                    </p>
                  </div>

                  <span
                    className="font-bold text-[14px] flex-shrink-0"
                    style={{ color: isIncome ? colors.positive : colors.negative, fontFeatureSettings: '"tnum"' }}
                  >
                    {isIncome ? '+' : '−'}{formatCurrency(tx.amount, currency)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TOP SPENDING ──────────────────────────────────────── */}
      {!isEmpty && Object.keys(categorySpend).length > 0 && (
        <div className="px-4 pb-2">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: colors.textMuted }}>
            Top Spending
          </p>
          <div className="space-y-2">
            {(Object.entries(categorySpend) as [string, number][])
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([cat, spent]) => {
                const color = getCategoryColor(cat, 'expense');
                const limit = categoryLimits.find(l => l.category === cat);
                const pct   = limit ? Math.min((spent / limit.limit) * 100, 100) : null;
                return (
                  <div
                    key={cat}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3"
                    style={{
                      background: isDark ? `${color}0d` : `${color}08`,
                      border: `1px solid ${color}18`,
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${color}28, ${color}18)` }}
                    >
                      <CategoryIcon category={cat} type="expense" size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[12px] font-semibold truncate" style={{ color: colors.textPrimary }}>{cat}</span>
                        <span className="text-[13px] font-bold" style={{ color, fontFeatureSettings: '"tnum"' }}>
                          {formatCurrency(spent, currency)}
                        </span>
                      </div>
                      {pct !== null && (
                        <div
                          className="h-[4px] rounded-full overflow-hidden"
                          style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

    </div>
  );
};
