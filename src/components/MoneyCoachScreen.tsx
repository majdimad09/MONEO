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
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '../context/NavigationContext';

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
function getColors(isDark: boolean): Record<InsightType, { bg: string; border: string; icon: string; text: string }> {
  return {
    positive: { bg: isDark ? 'rgba(34,197,94,0.12)'   : 'rgba(16,185,129,0.08)',  border: isDark ? 'rgba(34,197,94,0.28)'   : 'rgba(16,185,129,0.2)',   icon: isDark ? '#22c55e' : '#10b981', text: isDark ? '#4ade80' : '#34d399' },
    warning:  { bg: isDark ? 'rgba(239,68,68,0.12)'   : 'rgba(239,68,68,0.07)',   border: isDark ? 'rgba(239,68,68,0.28)'   : 'rgba(239,68,68,0.2)',    icon: '#f87171', text: '#fca5a5' },
    neutral:  { bg: isDark ? 'rgba(34,197,94,0.08)'   : 'rgba(129,140,248,0.07)', border: isDark ? 'rgba(34,197,94,0.22)'   : 'rgba(129,140,248,0.18)', icon: isDark ? '#4ade80' : '#818cf8', text: isDark ? '#86efac' : '#c7d2fe' },
    info:     { bg: isDark ? 'rgba(251,191,36,0.10)'   : 'rgba(139,92,246,0.08)',  border: isDark ? 'rgba(251,191,36,0.26)'   : 'rgba(139,92,246,0.2)',   icon: isDark ? '#fbbf24' : '#a78bfa', text: isDark ? '#fde68a' : '#c4b5fd' },
  };
}

function daysUntil(dateStr: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + 'T00:00:00'); d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / 86400000);
}

export const MoneyCoachScreen: React.FC<MoneyCoachScreenProps> = ({
  transactions, currency, monthlyBudget, categoryLimits, subscriptions,
  savingGoals, recurringIncome, onNavigate,
}) => {
  const { isDark, colors } = useTheme();
  const { goBack } = useNavigation();
  const COLORS = getColors(isDark);
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
        <button onClick={goBack} className="cursor-pointer" style={{ color: colors.textMuted }}>
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
            <h1 className="text-base font-bold leading-none" style={{ color: colors.textPrimary }}>Money Coach</h1>
            <p className="text-[10px] mt-0.5" style={{ color: colors.textMuted }}>Insights based on your real data</p>
          </div>
        </div>
      </div>

      {/* ── Upcoming alerts ─────────────────────────────────── */}
      {(upcomingPayments.length > 0 || upcomingIncome.length > 0) && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest px-1 mb-2" style={{ color: '#9ca3af' }}>
            Coming Up
          </p>
          <div className="space-y-2">
            {upcomingIncome.map(r => (
              <div
                key={r.id}
                className="rounded-2xl px-4 py-3 flex items-center gap-3"
                style={{ background: isDark ? 'rgba(34,197,94,0.12)' : 'rgba(16,185,129,0.07)', border: isDark ? '1px solid rgba(34,197,94,0.28)' : '1px solid rgba(16,185,129,0.2)' }}
              >
                <DollarSign size={15} className="flex-shrink-0" style={{ color: '#34d399' }} />
                <div className="flex-1">
                  <p className="text-xs font-semibold" style={{ color: colors.textPrimary }}>{r.name}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: colors.textMuted }}>
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
                style={{ background: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.06)', border: isDark ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(239,68,68,0.18)' }}
              >
                <CreditCard size={15} className="flex-shrink-0" style={{ color: '#f87171' }} />
                <div className="flex-1">
                  <p className="text-xs font-semibold" style={{ color: colors.textPrimary }}>{s.name}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: colors.textMuted }}>
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
          <p className="text-[11px] font-bold uppercase tracking-widest px-1 mb-2" style={{ color: '#9ca3af' }}>
            Budget Status
          </p>
          <div className="card-dark rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold" style={{ color: colors.textSecondary }}>This month</p>
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
                  background: budgetPct >= 100 ? '#ef4444' : budgetPct >= 80 ? '#f97316' : '#10b981',
                }}
              />
            </div>
            <p className="text-xs" style={{ color: colors.textMuted }}>
              {formatCurrency(thisMonthExpenses, currency)} of {formatCurrency(monthlyBudget, currency)} spent
              {budgetPct >= 90 && ' · You\'re close to your limit'}
            </p>
          </div>
        </div>
      )}

      {/* ── Insights ─────────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest px-1 mb-2" style={{ color: '#9ca3af' }}>
          Observations
        </p>
        {insights.length === 0 ? (
          <div
            className="rounded-2xl px-4 py-8 text-center"
            style={{ background: colors.bgCard, border: `1px solid ${colors.borderStrong}` }}
          >
            <Lightbulb size={28} className="mx-auto mb-3" style={{ color: colors.textMuted }} />
            <p className="text-sm font-semibold mb-1" style={{ color: colors.textSecondary }}>Not enough data yet</p>
            <p className="text-xs" style={{ color: colors.textMuted }}>
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
                    <p className="text-xs leading-relaxed" style={{ color: colors.textSecondary }}>{ins.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Disclaimer ───────────────────────────────────────── */}
      <p className="text-center text-[10px] px-4" style={{ color: colors.textMuted }}>
        Moneo's observations are based on your recorded data and are not financial advice.
      </p>

    </div>
  );
};
