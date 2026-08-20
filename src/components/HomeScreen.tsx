import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight, ArrowDownRight, ChevronRight, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, AlertTriangle, Sparkles, Wallet,
  BarChart2, ShieldCheck, Zap, Flame, PiggyBank, CalendarDays,
  Info, Plus,
} from 'lucide-react';
import { Transaction, CategoryLimit, Subscription, SavingGoal } from '../types/finance';
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
  userName: string;
  onViewAllTransactions: () => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  onLoadSample: () => void;
  onAddExpense: () => void;
  onAddIncome: () => void;
  onNavigateStats: () => void;
  onNavigateSettings: () => void;
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

const INSIGHT_COLORS: Record<string, { bg: string; border: string; icon: string; text: string }> = {
  positive: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', icon: '#34d399', text: '#6ee7b7' },
  warning:  { bg: 'rgba(239,68,68,0.07)',  border: 'rgba(239,68,68,0.2)',  icon: '#f87171', text: '#fca5a5' },
  neutral:  { bg: 'rgba(59,130,246,0.07)', border: 'rgba(59,130,246,0.18)', icon: '#60a5fa', text: '#93c5fd' },
  info:     { bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)', icon: '#a78bfa', text: '#c4b5fd' },
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  transactions, currency, monthlyBudget, categoryLimits, subscriptions,
  savingGoals, userName,
  onViewAllTransactions, onEdit, onLoadSample,
  onAddExpense, onAddIncome, onNavigateStats, onNavigateSettings,
}) => {
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
  const insights = useMemo(() => generateInsights(transactions, currency, subscriptions), [transactions, currency, subscriptions]);
  const scoreResult = useMemo(() => calculateCashlyScore(transactions, monthlyBudget, categoryLimits, subscriptions), [transactions, monthlyBudget, categoryLimits, subscriptions]);

  const budgetPct = monthlyBudget > 0 ? (thisMonthExpenses / monthlyBudget) * 100 : 0;
  const isPositive = balance >= 0;
  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const isEmpty = transactions.length === 0;

  return (
    <div className="page-enter pb-8 space-y-4">

      {/* ── GREETING ─────────────────────────────────── */}
      <div className="px-4 pt-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{monthLabel}</p>
          <p className="text-lg font-bold text-white mt-0.5">{greeting}</p>
        </div>
        {isEmpty && (
          <button
            onClick={onLoadSample}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-300 cursor-pointer"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}
          >
            <Sparkles size={12} className="text-blue-400" /> Load demo
          </button>
        )}
      </div>

      {/* ── BALANCE CARD ─────────────────────────────── */}
      <div className="px-4 card-float-1">
        <div
          className="balance-card rounded-3xl p-5 cursor-pointer select-none"
          style={{ WebkitTapHighlightColor: 'transparent' }}
          onClick={() => setBalanceExpanded(v => !v)}
        >
          {/* Header row */}
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgba(147,197,253,0.6)' }}>
              Total Balance
            </p>
            <div className="flex items-center gap-1 text-[11px]" style={{ color: 'rgba(147,197,253,0.5)' }}>
              <span>{balanceExpanded ? 'Less' : 'Details'}</span>
              {balanceExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </div>
          </div>

          {/* Big balance number */}
          <div className="py-2 mb-4">
            <span
              className="text-[2.8rem] font-bold tracking-tight leading-none"
              style={{ color: isPositive ? '#ffffff' : '#f87171' }}
            >
              {formatCurrency(Math.abs(balance), currency)}
            </span>
            {!isPositive && <p className="text-xs text-red-400 font-semibold mt-1">overspent</p>}
          </div>

          {/* Income / Expense split */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="rounded-2xl p-3" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <ArrowUpRight size={12} className="text-green-400" />
                <span className="text-[10px] text-green-400 font-bold uppercase tracking-wide">Income</span>
              </div>
              <p className="text-sm font-bold text-white">{formatCurrency(totalIncome, currency)}</p>
            </div>
            <div className="rounded-2xl p-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <ArrowDownRight size={12} className="text-red-400" />
                <span className="text-[10px] text-red-400 font-bold uppercase tracking-wide">Expenses</span>
              </div>
              <p className="text-sm font-bold text-white">{formatCurrency(totalExpenses, currency)}</p>
            </div>
          </div>

          {/* Expandable: Safe to spend */}
          {balanceExpanded && (
            <div className="expand-in space-y-3 pt-2" style={{ borderTop: '1px solid rgba(59,130,246,0.15)' }}>
              {/* Safe to spend */}
              <div className="safe-spend-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-green-400 uppercase tracking-wider mb-0.5">Safe to Spend</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(safeToSpend.safeAmount, currency)}</p>
                  </div>
                  <ShieldCheck size={28} className="text-green-400 opacity-60" />
                </div>
                <div className="mt-2.5 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">This month's income</span>
                    <span className="text-slate-300 font-medium">{formatCurrency(safeToSpend.income, currency)}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Spent so far</span>
                    <span className="text-red-400 font-medium">− {formatCurrency(safeToSpend.expenses, currency)}</span>
                  </div>
                  {safeToSpend.subsRemaining > 0 && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Upcoming subs</span>
                      <span className="text-yellow-400 font-medium">− {formatCurrency(safeToSpend.subsRemaining, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Savings buffer (10%)</span>
                    <span className="text-blue-400 font-medium">− {formatCurrency(safeToSpend.savingsBuffer, currency)}</span>
                  </div>
                </div>
              </div>

              {/* This month budget bar */}
              {monthlyBudget > 0 && (
                <div>
                  <div className="flex justify-between mb-1.5 text-[11px]">
                    <span className="text-slate-400 font-semibold">Monthly Budget</span>
                    <span className={budgetPct >= 100 ? 'text-red-400 font-bold' : budgetPct >= 80 ? 'text-orange-400 font-bold' : 'text-slate-500'}>
                      {budgetPct.toFixed(0)}% used
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
            { label: 'Expense', icon: ArrowDownRight, color: '#f87171', bg: 'rgba(239,68,68,0.1)', onClick: onAddExpense },
            { label: 'Income', icon: ArrowUpRight, color: '#34d399', bg: 'rgba(16,185,129,0.1)', onClick: onAddIncome },
            { label: 'Stats', icon: BarChart2, color: '#60a5fa', bg: 'rgba(59,130,246,0.1)', onClick: onNavigateStats },
            { label: 'Budget', icon: Wallet, color: '#a78bfa', bg: 'rgba(139,92,246,0.1)', onClick: onNavigateSettings },
          ].map(({ label, icon: Icon, color, bg, onClick }) => (
            <button key={label} onClick={onClick} className="quick-action-btn">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon size={16} style={{ color }} strokeWidth={2.2} />
              </div>
              <span className="text-[10px] font-bold text-slate-400">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── CASHLY SCORE ─────────────────────────────── */}
      <div className="px-4 card-float-3">
        <CashlyScore result={scoreResult} size="md" />
      </div>

      {/* ── INSIGHTS ─────────────────────────────────── */}
      {insights.length > 0 && (
        <div className="card-float-4">
          <div className="flex items-center justify-between px-4 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-blue-400" />
              <h3 className="text-sm font-bold text-white">Cashly Insights</h3>
            </div>
            <span className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Based on your data</span>
          </div>
          <div className="insights-scroll px-4">
            {insights.map((insight, i) => {
              const colors = INSIGHT_COLORS[insight.type] || INSIGHT_COLORS.info;
              const Icon = INSIGHT_ICON_MAP[insight.icon] || Info;
              return (
                <div
                  key={insight.id}
                  className="insight-card"
                  style={{
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    animation: `insightSlide 0.3s ${i * 0.08}s ease both`,
                  }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5"
                    style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
                    <Icon size={16} style={{ color: colors.icon }} />
                  </div>
                  <p className="text-[12px] font-semibold leading-relaxed" style={{ color: '#e2e8f0' }}>
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
            <p className="text-slate-200 font-bold text-base mb-2">No transactions yet</p>
            <p className="text-slate-500 text-sm leading-relaxed mb-5">
              Add your first transaction and Cashly will start building your financial picture.
            </p>
            <button onClick={onAddExpense} className="btn-blue px-6 py-2.5 rounded-xl text-sm cursor-pointer inline-flex items-center gap-2">
              <Plus size={16} /> Add Transaction
            </button>
          </div>
        </div>
      )}

      {/* ── RECENT TRANSACTIONS ──────────────────────── */}
      {!isEmpty && (
        <div className="px-4 card-float-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">Recent Transactions</h3>
            <button onClick={onViewAllTransactions} className="flex items-center gap-0.5 text-xs text-blue-400 font-semibold cursor-pointer">
              See all <ChevronRight size={14} />
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
                  style={{ borderBottom: i < recentTx.length - 1 ? '1px solid #0a1828' : 'none' }}
                  onClick={() => onEdit(tx)}
                >
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${catColor}18`, border: `1px solid ${catColor}28`, color: catColor }}>
                    <CategoryIcon category={tx.category} type={tx.type} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-200 truncate">{tx.description}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{formatDate(tx.date)} · {tx.category}</p>
                  </div>
                  <span className={`font-bold font-mono text-sm flex-shrink-0 ${isIncome ? 'text-green-400' : 'text-red-400'}`}>
                    {isIncome ? '+' : '−'}{formatCurrency(tx.amount, currency)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── BUDGET CATEGORIES ────────────────────────── */}
      {categoryLimits.length > 0 && !isEmpty && (
        <div className="px-4 card-float-6">
          <h3 className="text-sm font-bold text-white mb-3">Category Budgets</h3>
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
                      <span className="text-sm font-semibold text-slate-200">{limit.category}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: pct >= 100 ? '#ef4444' : '#f1f5f9' }}>
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
                      ? pct >= 90 ? `⚠ Only ${formatCurrency(remaining, currency)} left` : `${formatCurrency(remaining, currency)} remaining`
                      : `${formatCurrency(Math.abs(remaining), currency)} over limit`}
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
