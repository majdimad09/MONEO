import React, { useMemo } from 'react';
import { ChevronLeft, Shield, TrendingDown, Calendar, DollarSign, Info, Zap } from 'lucide-react';
import { Transaction, Subscription, AppView } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { calculateSafeToSpend } from '../utils/insights';
import { useTheme } from '../context/ThemeContext';

interface SafeToSpendProps {
  transactions: Transaction[];
  subscriptions: Subscription[];
  currency: string;
  monthlyBudget: number;
  onNavigate: (view: AppView) => void;
}

export const SafeToSpendScreen: React.FC<SafeToSpendProps> = ({
  transactions, subscriptions, currency, monthlyBudget, onNavigate,
}) => {
  const { isDark, colors } = useTheme();
  const result = useMemo(
    () => calculateSafeToSpend(transactions, subscriptions),
    [transactions, subscriptions],
  );

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, daysInMonth - now.getDate());
  const dailySafe = result.safeAmount > 0 ? result.safeAmount / daysLeft : 0;

  const budgetUsedPct = monthlyBudget > 0
    ? Math.min(100, (result.expenses / monthlyBudget) * 100)
    : 0;

  const safeColor = result.safeAmount <= 0 ? '#f87171'
    : result.safeAmount < 100 ? '#fbbf24'
    : '#34d399';

  return (
    <div className="page-enter px-4 pt-3 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 pt-1 mb-5">
        <button
          onClick={() => onNavigate('insights')}
          className="cursor-pointer transition-colors"
          style={{ color: '#9ca3af' }}
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-base font-bold leading-none" style={{ color: colors.textPrimary }}>Safe to Spend</h1>
          <p className="text-[10px] mt-0.5" style={{ color: '#9ca3af' }}>How much you can spend stress-free today</p>
        </div>
      </div>

      {/* Main amount card */}
      <div
        className="rounded-3xl p-6 mb-5 text-center"
        style={{
          background: `linear-gradient(135deg, ${safeColor}14, ${safeColor}08)`,
          border: `1px solid ${safeColor}30`,
          boxShadow: `0 0 40px ${safeColor}15`,
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Zap size={13} style={{ color: safeColor }} />
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: safeColor }}>
            Available to spend
          </p>
        </div>
        <p
          className="text-5xl font-bold mb-1"
          style={{ color: colors.textPrimary, letterSpacing: '-0.03em' }}
        >
          {formatCurrency(result.safeAmount, currency)}
        </p>
        <p className="text-sm" style={{ color: '#9ca3af' }}>
          {daysLeft} days left in {now.toLocaleDateString('en-US', { month: 'long' })}
        </p>
        {dailySafe > 0 && (
          <div
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: `${safeColor}12`, border: `1px solid ${safeColor}25` }}
          >
            <Calendar size={13} style={{ color: safeColor }} />
            <span className="text-sm font-semibold" style={{ color: safeColor }}>
              {formatCurrency(dailySafe, currency)} / day
            </span>
          </div>
        )}
      </div>

      {/* Breakdown */}
      <div
        className="rounded-2xl overflow-hidden mb-5"
        style={{ background: colors.bgCard, border: `1px solid ${colors.borderStrong}` }}
      >
        <div className="px-4 py-3" style={{ borderBottom: `1px solid ${colors.borderStrong}` }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9ca3af' }}>
            Breakdown
          </p>
        </div>
        {[
          { icon: DollarSign, label: 'Income this month', value: result.income, positive: true },
          { icon: TrendingDown, label: 'Expenses so far', value: result.expenses, positive: false },
          { icon: Calendar, label: 'Upcoming subscriptions', value: result.subsRemaining, positive: false },
        ].map(({ icon: Icon, label, value, positive }) => (
          <div
            key={label}
            className="flex items-center justify-between px-4 py-3.5"
            style={{ borderBottom: `1px solid ${colors.divider}` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: positive ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                }}
              >
                <Icon size={14} style={{ color: positive ? '#34d399' : '#f87171' }} />
              </div>
              <span className="text-sm" style={{ color: colors.textSecondary }}>{label}</span>
            </div>
            <span className="text-sm font-bold" style={{ color: positive ? '#34d399' : '#f87171' }}>
              {positive ? '+' : '-'}{formatCurrency(value, currency)}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(129,140,248,0.12)' }}
            >
              <Shield size={14} style={{ color: '#818cf8' }} />
            </div>
            <span className="text-sm font-bold" style={{ color: colors.textPrimary }}>Safe to Spend</span>
          </div>
          <span className="text-sm font-bold" style={{ color: '#818cf8' }}>
            {formatCurrency(result.safeAmount, currency)}
          </span>
        </div>
      </div>

      {/* Budget progress */}
      {monthlyBudget > 0 && (
        <div
          className="rounded-2xl p-4 mb-5"
          style={{ background: colors.bgCard, border: `1px solid ${colors.borderStrong}` }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9ca3af' }}>
              Monthly Budget
            </p>
            <p
              className="text-sm font-bold"
              style={{ color: budgetUsedPct >= 100 ? '#f87171' : colors.textPrimary }}
            >
              {budgetUsedPct.toFixed(0)}% used
            </p>
          </div>
          <div className="h-2 rounded-full mb-3" style={{ background: colors.borderStrong }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, budgetUsedPct)}%`,
                background: budgetUsedPct >= 100 ? '#ef4444'
                  : budgetUsedPct >= 80 ? '#f97316'
                  : '#6366f1',
              }}
            />
          </div>
          <div className="flex justify-between text-xs" style={{ color: '#9ca3af' }}>
            <span>{formatCurrency(result.expenses, currency)} spent</span>
            <span>{formatCurrency(monthlyBudget, currency)} budget</span>
          </div>
        </div>
      )}

      {result.safeAmount <= 0 && (
        <div
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{ background: isDark ? 'rgba(239,68,68,0.16)' : 'rgba(239,68,68,0.06)', border: isDark ? '1px solid rgba(239,68,68,0.32)' : '1px solid rgba(239,68,68,0.2)' }}
        >
          <Info size={15} className="flex-shrink-0 mt-0.5" style={{ color: '#f87171' }} />
          <p className="text-sm leading-relaxed" style={{ color: '#fca5a5' }}>
            You've used all available funds this month. Avoid additional expenses where possible.
          </p>
        </div>
      )}
    </div>
  );
};
