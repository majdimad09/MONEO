import React, { useMemo } from 'react';
import {
  Lightbulb, TrendingUp, TrendingDown, AlertTriangle, Info, Sparkles,
  Flame, PiggyBank, CalendarDays, Zap, ChevronLeft, Calendar,
  CreditCard, DollarSign,
} from 'lucide-react';
import { Transaction, CategoryLimit, Subscription, SavingGoal, RecurringIncome, AppView } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/formatters';
import { generateInsights, InsightIcon, InsightType } from '../utils/insights';
import { getNextOccurrence } from '../utils/recurringUtils';

interface MoneyCoachScreenProps {
  transactions: Transaction[];
  currency: string;
  monthlyBudget: number;
  categoryLimits: CategoryLimit[];
  subscriptions: Subscription[];
  savingGoals: SavingGoal[];
  recurringIncome: RecurringIncome[];
  onNavigate: (view: AppView) => void;
}

const ICON_MAP: Record<InsightIcon, React.ElementType> = {
  'trending-up': TrendingUp, 'trending-down': TrendingDown, 'alert': AlertTriangle,
  'info': Info, 'sparkle': Sparkles, 'calendar': CalendarDays, 'piggy': PiggyBank,
  'fire': Flame, 'zap': Zap,
};
const COLORS: Record<InsightType, { bg: string; border: string; icon: string; text: string }> = {
  positive: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)',  icon: '#34d399', text: '#6ee7b7' },
  warning:  { bg: 'rgba(239,68,68,0.07)',  border: 'rgba(239,68,68,0.2)',   icon: '#f87171', text: '#fca5a5' },
  neutral:  { bg: 'rgba(59,130,246,0.07)', border: 'rgba(59,130,246,0.18)', icon: '#60a5fa', text: '#93c5fd' },
  info:     { bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)',  icon: '#a78bfa', text: '#c4b5fd' },
};

function daysUntil(dateStr: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + 'T00:00:00'); d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / 86400000);
}

export const MoneyCoachScreen: React.FC<MoneyCoachScreenProps> = ({
  transactions, currency, monthlyBudget, categoryLimits, subscriptions,
  savingGoals, recurringIncome, onNavigate,
}) => {
  const insights = useMemo(
    () => generateInsights(transactions, currency, subscriptions),
    [transactions, currency, subscriptions],
  );

  // Upcoming subscription payments (next 7 days)
  const upcomingPayments = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const in7 = new Date(today); in7.setDate(in7.getDate() + 7);
    return subscriptions
      .filter(s => s.isActive)
      .map(s => ({ ...s, days: daysUntil(s.nextPaymentDate) }))
      .filter(s => s.days >= 0 && s.days <= 7)
      .sort((a, b) => a.days - b.days);
  }, [subscriptions]);

  // Upcoming recurring income (next 14 days)
  const upcomingIncome = useMemo(() => {
    return recurringIncome
      .filter(r => r.isActive)
      .map(r => {
        const next = getNextOccurrence(r.nextPaymentDate, r.frequency);
        return { ...r, displayDate: next, days: daysUntil(next) };
      })
      .filter(r => r.days >= 0 && r.days <= 14)
      .sort((a, b) => a.days - b.days);
  }, [recurringIncome]);

  // Budget status
  const prefix = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const thisMonthExpenses = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(prefix))
    .reduce((s, t) => s + t.amount, 0);
  const budgetPct = monthlyBudget > 0 ? (thisMonthExpenses / monthlyBudget) * 100 : 0;

  return (
    <div className="page-enter px-4 pt-3 pb-8 space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3 pt-1">
        <button onClick={() => onNavigate('insights')} className="cursor-pointer text-slate-500 hover:text-slate-300">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.2)' }}
          >
            <Lightbulb size={16} style={{ color: '#fbbf24' }} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-none">Money Coach</h1>
            <p className="text-[10px] text-slate-500 mt-0.5">Insights based on your real data</p>
          </div>
        </div>
      </div>

      {/* ── Upcoming alerts ─────────────────────────────────── */}
      {(upcomingPayments.length > 0 || upcomingIncome.length > 0) && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest px-1 mb-2" style={{ color: '#3d5068' }}>
            Coming Up
          </p>
          <div className="space-y-2">
            {upcomingIncome.map(r => (
              <div
                key={r.id}
                className="rounded-2xl px-4 py-3 flex items-center gap-3"
                style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}
              >
                <DollarSign size={15} className="flex-shrink-0" style={{ color: '#34d399' }} />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-200">{r.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {r.days === 0 ? 'Expected today' : r.days === 1 ? 'Expected tomorrow' : `Expected in ${r.days} days`}
                  </p>
                </div>
                <span className="text-sm font-bold text-emerald-400">+{formatCurrency(r.amount, currency)}</span>
              </div>
            ))}
            {upcomingPayments.map(s => (
              <div
                key={s.id}
                className="rounded-2xl px-4 py-3 flex items-center gap-3"
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)' }}
              >
                <CreditCard size={15} className="flex-shrink-0" style={{ color: '#f87171' }} />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-200">{s.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {s.days === 0 ? 'Due today' : s.days === 1 ? 'Due tomorrow' : `Due in ${s.days} days`}
                  </p>
                </div>
                <span className="text-sm font-bold text-red-400">−{formatCurrency(s.amount, currency)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Budget status ────────────────────────────────────── */}
      {monthlyBudget > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest px-1 mb-2" style={{ color: '#3d5068' }}>
            Budget Status
          </p>
          <div className="card-dark rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-200">This month</p>
              <p className="text-sm font-bold" style={{
                color: budgetPct >= 100 ? '#ef4444' : budgetPct >= 80 ? '#f97316' : '#34d399'
              }}>
                {budgetPct.toFixed(0)}% used
              </p>
            </div>
            <div className="progress-track h-1.5 mb-2">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(budgetPct, 100)}%`,
                  background: budgetPct >= 100 ? '#ef4444' : budgetPct >= 80 ? '#f97316' : '#3b82f6',
                }}
              />
            </div>
            <p className="text-xs text-slate-500">
              {formatCurrency(thisMonthExpenses, currency)} of {formatCurrency(monthlyBudget, currency)} spent
              {budgetPct >= 90 && ' · You\'re close to your limit'}
            </p>
          </div>
        </div>
      )}

      {/* ── Insights ─────────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest px-1 mb-2" style={{ color: '#3d5068' }}>
          Observations
        </p>
        {insights.length === 0 ? (
          <div
            className="rounded-2xl px-4 py-8 text-center"
            style={{ background: '#0d1526', border: '1px solid #1e2d4a' }}
          >
            <Lightbulb size={28} className="mx-auto mb-3 text-slate-600" />
            <p className="text-sm font-semibold text-slate-400 mb-1">Not enough data yet</p>
            <p className="text-xs text-slate-600">
              Add more transactions across a few weeks so Moneo can detect meaningful patterns.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {insights.map(ins => {
              const c = COLORS[ins.type];
              const Icon = ICON_MAP[ins.icon];
              return (
                <div
                  key={ins.id}
                  className="rounded-2xl px-4 py-3.5"
                  style={{ background: c.bg, border: `1px solid ${c.border}` }}
                >
                  <div className="flex items-start gap-3">
                    <Icon size={15} className="flex-shrink-0 mt-0.5" style={{ color: c.icon }} />
                    <p className="text-xs text-slate-200 leading-relaxed">{ins.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Disclaimer ───────────────────────────────────────── */}
      <p className="text-center text-[10px] text-slate-700 px-4">
        Moneo's observations are based on your recorded data and are not financial advice.
      </p>

    </div>
  );
};
