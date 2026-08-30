import React, { useMemo } from 'react';
import {
  ArrowUpRight, ArrowDownRight, ChevronRight,
  TrendingUp, TrendingDown, AlertTriangle, Sparkles,
  Wallet, BarChart2, Zap, Flame, PiggyBank,
  CalendarDays, Info, Plus, Sun, Moon,
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
  if (pct >= 100) return '#f43f5e';
  if (pct >= 80) return '#f97316';
  if (pct >= 60) return '#f59e0b';
  return '#22c55e';
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

export const HomeScreen: React.FC<HomeScreenProps> = ({
  transactions, currency, monthlyBudget, categoryLimits, subscriptions,
  savingGoals, recurringIncome, userName,
  onViewAllTransactions, onEdit, onLoadSample,
  onAddExpense, onAddIncome, onNavigateStats, onNavigateBudget, onNavigateScore,
}) => {
  const { isDark, toggleTheme, colors } = useTheme();
  const { t } = useLanguage();
  const prefix = getCurrentMonthPrefix();
  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const greeting = getGreeting(userName || undefined);
  const initials = (userName || 'M').split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || 'M';

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

  const insights = useMemo(() => generateInsights(transactions, currency, subscriptions), [transactions, currency, subscriptions]);
  const scoreResult = useMemo(() => calculateCashlyScore(transactions, monthlyBudget, categoryLimits, subscriptions, savingGoals), [transactions, monthlyBudget, categoryLimits, subscriptions, savingGoals]);

  const budgetPct = monthlyBudget > 0 ? (thisMonthExpenses / monthlyBudget) * 100 : 0;
  const budgetRemaining = monthlyBudget - thisMonthExpenses;
  const barColor = getBarColor(budgetPct);
  const level = getScoreLevel(scoreResult.score);
  const isEmpty = transactions.length === 0;
  const monthNet = thisMonthIncome - thisMonthExpenses;
  const isPositive = balance >= 0;

  // Score ring
  const scoreR = 22;
  const scoreCirc = 2 * Math.PI * scoreR;
  const scoreOffset = scoreCirc * (1 - scoreResult.score / 100);

  return (
    <div className="page-enter">

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-2">
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{
            background: isDark ? 'rgba(34,197,94,0.15)' : 'rgba(5,150,105,0.10)',
            color: colors.accent,
            border: `1px solid ${colors.accent}30`,
          }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest leading-none" style={{ color: colors.textMuted }}>
            {monthLabel}
          </p>
          <p className="text-[15px] font-bold leading-tight mt-0.5 truncate" style={{ color: colors.textPrimary }}>
            {greeting}
          </p>
        </div>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all flex-shrink-0"
          style={{
            background: colors.bgSecondary,
            border: `1px solid ${colors.border}`,
          }}
        >
          {isDark
            ? <Sun size={16} style={{ color: '#fbbf24' }} />
            : <Moon size={16} style={{ color: '#6366f1' }} />}
        </button>
      </div>

      {/* ── BALANCE HERO CARD ───────────────────────────────────── */}
      <div className="px-4 pt-2 pb-3 stagger-1">
        <div
          style={{
            background: isDark
              ? 'linear-gradient(145deg, #111115 0%, #17181e 60%, #0e1410 100%)'
              : 'linear-gradient(145deg, #111 0%, #1a1a1a 100%)',
            borderRadius: 22,
            padding: '20px 18px 16px',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: isDark
              ? '0 4px 24px rgba(0,0,0,0.5)'
              : '0 8px 32px rgba(0,0,0,0.25)',
          }}
        >
          {/* Subtle green glow top-right */}
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 160, height: 160, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(34,197,94,0.14) 0%, transparent 65%)',
            pointerEvents: 'none',
          }} />

          {/* Balance label */}
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>
            {t('totalBalance')}
          </p>

          {/* Big balance number */}
          <div className="flex items-baseline gap-2 mb-1">
            <span
              style={{
                fontSize: 40,
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 1,
                color: isPositive ? '#ffffff' : '#f43f5e',
                fontFeatureSettings: '"tnum"',
              }}
            >
              {isPositive ? '' : '−'}{formatCurrency(Math.abs(balance), currency)}
            </span>
          </div>

          {/* Month net badge */}
          {transactions.length > 0 && (
            <div className="flex items-center gap-1.5 mb-4">
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 11, fontWeight: 700,
                  color: monthNet >= 0 ? '#4ade80' : '#f87171',
                  background: monthNet >= 0 ? 'rgba(74,222,128,0.13)' : 'rgba(248,113,113,0.13)',
                  border: `1px solid ${monthNet >= 0 ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
                  borderRadius: 99, padding: '2px 8px',
                }}
              >
                {monthNet >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {monthNet >= 0 ? '+' : ''}{formatCurrency(monthNet, currency)} {t('thisMonth')}
              </span>
            </div>
          )}
          {transactions.length === 0 && <div style={{ height: 16, marginBottom: 16 }} />}

          {/* Income / Expenses / Add row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'stretch' }}>
            {/* Income */}
            <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: 14, padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <ArrowUpRight size={11} color="#4ade80" />
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4ade80' }}>
                  {t('income')}
                </span>
              </div>
              <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', fontFeatureSettings: '"tnum"' }}>
                {formatCurrency(thisMonthIncome, currency)}
              </p>
            </div>

            {/* Expenses */}
            <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 14, padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <ArrowDownRight size={11} color="#f87171" />
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f87171' }}>
                  {t('expenses')}
                </span>
              </div>
              <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', fontFeatureSettings: '"tnum"' }}>
                {formatCurrency(thisMonthExpenses, currency)}
              </p>
            </div>

            {/* Add button */}
            <button
              onClick={onAddExpense}
              style={{
                width: 52, borderRadius: 14,
                background: 'rgba(34,197,94,0.18)',
                border: '1px solid rgba(34,197,94,0.3)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              <Plus size={20} color="#22c55e" strokeWidth={2.5} />
              <span style={{ fontSize: 9, fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MONEO SCORE WIDGET ──────────────────────────────────── */}
      <div className="px-4 pb-2 stagger-3">
        <button
          onClick={onNavigateScore}
          className="w-full text-left cursor-pointer"
          style={{
            borderRadius: 20,
            padding: '14px 16px',
            background: isDark
              ? `linear-gradient(135deg, ${level.color}14 0%, transparent 100%)`
              : `linear-gradient(135deg, ${level.color}10 0%, transparent 100%)`,
            border: `1px solid ${level.color}30`,
            display: 'flex', alignItems: 'center', gap: 14,
            transition: 'all 0.2s ease',
          }}
        >
          {/* Score ring — larger and more prominent */}
          <div style={{ position: 'relative', flexShrink: 0, width: 62, height: 62 }}>
            <svg width={62} height={62} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={31} cy={31} r={26} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={5} />
              <circle cx={31} cy={31} r={26} fill="none"
                stroke={level.color} strokeWidth={5} strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 26}
                strokeDashoffset={scoreResult.hasEnoughData
                  ? 2 * Math.PI * 26 * (1 - scoreResult.score / 100)
                  : 2 * Math.PI * 26}
                style={{ filter: `drop-shadow(0 0 6px ${level.color}70)`, transition: 'stroke-dashoffset 1.2s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.04em', color: level.color, lineHeight: 1 }}>
                {scoreResult.hasEnoughData ? scoreResult.score : '?'}
              </span>
            </div>
          </div>

          {/* Label + status */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: colors.textMuted, marginBottom: 3 }}>
              {t('moneoScore')}
            </p>
            <p style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.02em', color: scoreResult.hasEnoughData ? level.color : colors.textSecondary, lineHeight: 1.15, marginBottom: 3 }}>
              {scoreResult.hasEnoughData ? level.name : t('buildYourScore')}
            </p>
            <p style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.4 }}>
              {scoreResult.hasEnoughData
                ? (scoreResult.summary.length > 55 ? scoreResult.summary.slice(0, 55) + '…' : scoreResult.summary)
                : t('addMoreTransactions')}
            </p>
          </div>
          <ChevronRight size={16} style={{ color: colors.textMuted, flexShrink: 0 }} />
        </button>
      </div>

      {/* ── BUDGET STRIP ────────────────────────────────────────── */}
      {monthlyBudget > 0 && (
        <div className="px-5 pt-3 pb-1 stagger-4">
          <button
            onClick={onNavigateBudget}
            className="w-full rounded-2xl p-4 text-left cursor-pointer transition-all"
            style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Wallet size={14} style={{ color: colors.textMuted }} />
                <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: colors.textMuted }}>
                  {t('budget')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold" style={{ color: barColor }}>
                  {Math.min(budgetPct, 999).toFixed(0)}%
                </span>
                {budgetPct >= 80 && (
                  <AlertTriangle size={12} style={{ color: barColor }} />
                )}
              </div>
            </div>
            <div
              className="h-[5px] rounded-full overflow-hidden mb-2"
              style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(budgetPct, 100)}%`,
                  background: barColor,
                  boxShadow: `0 0 6px ${barColor}50`,
                  transition: 'width 0.9s ease',
                }}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-[11px]" style={{ color: colors.textSecondary }}>
                {formatCurrency(thisMonthExpenses, currency)} {t('spent').toLowerCase()}
              </span>
              <span className="text-[11px]" style={{ color: budgetRemaining < 0 ? colors.negative : colors.textSecondary }}>
                {budgetRemaining >= 0
                  ? `${formatCurrency(budgetRemaining, currency)} ${t('remaining').toLowerCase()}`
                  : `${formatCurrency(Math.abs(budgetRemaining), currency)} ${t('overBudget').toLowerCase()}`}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* ── QUICK ACTIONS ───────────────────────────────────────── */}
      <div className="px-5 pt-3 pb-1">
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: t('expenseType'), icon: ArrowDownRight, color: colors.negative, soft: colors.negativeSoft, onClick: onAddExpense },
            { label: t('incomeType'),  icon: ArrowUpRight,  color: colors.positive, soft: colors.positiveSoft, onClick: onAddIncome },
            { label: t('statisticsTitle'), icon: BarChart2, color: '#6366f1', soft: 'rgba(99,102,241,0.09)', onClick: onNavigateStats },
            { label: t('budget'),      icon: Wallet,        color: '#8b5cf6', soft: 'rgba(139,92,246,0.09)', onClick: onNavigateBudget },
          ].map(({ label, icon: Icon, color, soft, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl cursor-pointer transition-all"
              style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: soft }}>
                <Icon size={17} style={{ color }} strokeWidth={2.2} />
              </div>
              <span className="text-[10px] font-semibold text-center leading-tight" style={{ color: colors.textSecondary }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── INSIGHTS ────────────────────────────────────────────── */}
      {insights.length > 0 && (
        <div className="px-5 pt-3 pb-1">
          <div className="flex items-center gap-2 mb-2.5">
            <Sparkles size={13} style={{ color: colors.accent }} />
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: colors.textMuted }}>
              {t('yourInsights')}
            </p>
          </div>
          <div className="space-y-2">
            {insights.slice(0, 2).map(ins => {
              const typeColors: Record<string, { bg: string; border: string; icon: string }> = {
                positive: { bg: colors.positiveSoft, border: colors.positive + '25', icon: colors.positive },
                warning:  { bg: colors.negativeSoft, border: colors.negative + '25', icon: colors.negative },
                neutral:  { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.20)', icon: '#6366f1' },
                info:     { bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.20)', icon: '#8b5cf6' },
              };
              const tc = typeColors[ins.type] || typeColors.info;
              const Icon = INSIGHT_ICON_MAP[ins.icon] || Info;
              return (
                <div
                  key={ins.id}
                  className="flex items-start gap-3 rounded-2xl px-3.5 py-3"
                  style={{
                    background: tc.bg,
                    border: `1px solid ${tc.border}`,
                    borderLeft: `3px solid ${tc.icon}`,
                    paddingLeft: 12,
                  }}
                >
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: tc.icon + '18' }}>
                    <Icon size={12} style={{ color: tc.icon }} strokeWidth={2.3} />
                  </div>
                  <p className="text-[12px] leading-relaxed flex-1" style={{ color: colors.textSecondary }}>{ins.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── EMPTY STATE ─────────────────────────────────────────── */}
      {isEmpty && (
        <div className="px-5 pt-3">
          <div
            className="rounded-2xl p-6 text-center"
            style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: colors.positiveSoft }}
            >
              <TrendingUp size={24} style={{ color: colors.positive }} />
            </div>
            <p className="font-bold text-[15px] mb-1.5" style={{ color: colors.textPrimary }}>
              {t('noTransactionsYet')}
            </p>
            <p className="text-[12px] leading-relaxed mb-4" style={{ color: colors.textSecondary }}>
              {t('addFirstTransactionHint')}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={onAddExpense}
                className="px-4 py-2 rounded-xl text-[13px] font-bold cursor-pointer"
                style={{ background: colors.negativeSoft, color: colors.negative }}
              >
                + {t('expenseType')}
              </button>
              <button
                onClick={onAddIncome}
                className="px-4 py-2 rounded-xl text-[13px] font-bold cursor-pointer"
                style={{ background: colors.positiveSoft, color: colors.positive }}
              >
                + {t('incomeType')}
              </button>
            </div>
            <button
              onClick={onLoadSample}
              className="mt-3 text-[11px] font-semibold cursor-pointer"
              style={{ color: colors.textMuted }}
            >
              {t('loadDemo')}
            </button>
          </div>
        </div>
      )}

      {/* ── RECENT TRANSACTIONS ─────────────────────────────────── */}
      {!isEmpty && (
        <div className="px-5 pt-3 pb-2">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: colors.textMuted }}>
              {t('recentTransactions')}
            </p>
            <button
              onClick={onViewAllTransactions}
              className="flex items-center gap-0.5 text-[11px] font-semibold cursor-pointer"
              style={{ color: colors.accent }}
            >
              {t('seeAll')} <ChevronRight size={13} />
            </button>
          </div>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
          >
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
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${catColor}16`, border: `1px solid ${catColor}22` }}
                  >
                    <CategoryIcon category={tx.category} type={tx.type} size={15} />
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
                    className="font-bold text-[13px] flex-shrink-0"
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

      {/* ── TOP SPENDING THIS MONTH ──────────────────────────────── */}
      {!isEmpty && Object.keys(categorySpend).length > 0 && (
        <div className="px-5 pt-1 pb-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-2.5" style={{ color: colors.textMuted }}>
            Top Spending
          </p>
          <div className="space-y-2">
            {(Object.entries(categorySpend) as [string, number][])
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([cat, spent]) => {
                const color = getCategoryColor(cat, 'expense');
                const limit = categoryLimits.find(l => l.category === cat);
                const pct = limit ? Math.min((spent / limit.limit) * 100, 100) : null;
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${color}16` }}
                    >
                      <CategoryIcon category={cat} type="expense" size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-semibold truncate" style={{ color: colors.textPrimary }}>{cat}</span>
                        <span className="text-[12px] font-bold" style={{ color: colors.negative, fontFeatureSettings: '"tnum"' }}>
                          {formatCurrency(spent, currency)}
                        </span>
                      </div>
                      {pct !== null && (
                        <div
                          className="h-[3px] rounded-full overflow-hidden"
                          style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: getBarColor(pct) }}
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
