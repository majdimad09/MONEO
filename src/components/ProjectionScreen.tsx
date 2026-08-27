import React, { useMemo } from 'react';
import {
  ChevronLeft, TrendingUp, TrendingDown, Sparkles, DollarSign, Target,
} from 'lucide-react';
import { Transaction, Subscription, SavingGoal, CategoryLimit, AppView } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { PremiumGate } from './PremiumGate';

interface ProjectionScreenProps {
  transactions: Transaction[];
  currency: string;
  monthlyBudget: number;
  subscriptions: Subscription[];
  savingGoals: SavingGoal[];
  categoryLimits: CategoryLimit[];
  isPremium: boolean;
  onNavigate: (view: AppView) => void;
  onUpgrade: () => void;
}

function getMonthPrefix(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export const ProjectionScreen: React.FC<ProjectionScreenProps> = ({
  transactions, currency, subscriptions, savingGoals,
  isPremium, onNavigate, onUpgrade,
}) => {
  const projections = useMemo(() => {
    const months: Record<string, { income: number; expenses: number }> = {};
    transactions.forEach(t => {
      const m = t.date.slice(0, 7);
      if (!months[m]) months[m] = { income: 0, expenses: 0 };
      if (t.type === 'income') months[m].income += t.amount;
      else months[m].expenses += t.amount;
    });

    const sortedMonths = Object.keys(months).sort().reverse().slice(0, 3);
    const avgIncome = sortedMonths.length > 0
      ? sortedMonths.reduce((s, m) => s + months[m].income, 0) / sortedMonths.length
      : 0;
    const avgExpenses = sortedMonths.length > 0
      ? sortedMonths.reduce((s, m) => s + months[m].expenses, 0) / sortedMonths.length
      : 0;
    const avgSavings = Math.max(0, avgIncome - avgExpenses);

    const monthlySubCost = subscriptions.filter(s => s.isActive).reduce((s, sub) => {
      if (sub.frequency === 'yearly') return s + sub.amount / 12;
      if (sub.frequency === 'weekly') return s + (sub.amount * 52) / 12;
      return s + sub.amount;
    }, 0);

    const futureMonths = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() + i + 1);
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const cumulativeSavings = avgSavings * (i + 1);
      return { label, income: avgIncome, expenses: avgExpenses, savings: avgSavings, cumulative: cumulativeSavings };
    });

    return { avgIncome, avgExpenses, avgSavings, monthlySubCost, futureMonths, hasData: sortedMonths.length > 0 };
  }, [transactions, subscriptions]);

  const maxCumulative = Math.max(...projections.futureMonths.map(m => m.cumulative), 1);

  return (
    <div className="page-enter px-4 pt-3 pb-8">
      <div className="flex items-center gap-3 pt-1 mb-5">
        <button
          onClick={() => onNavigate('insights')}
          className="cursor-pointer transition-colors"
          style={{ color: '#9ca3af' }}
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-base font-bold leading-none" style={{ color: '#111827' }}>Future Projections</h1>
          <p className="text-[10px] mt-0.5" style={{ color: '#9ca3af' }}>6-month financial forecast</p>
        </div>
      </div>

      <PremiumGate
        isPremium={isPremium}
        feature="Future Projections"
        description="See where your finances will be in 6 months based on your real spending and income patterns."
        onUpgrade={onUpgrade}
      >
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {[
            { label: 'Avg Income', value: projections.avgIncome, color: '#34d399', icon: TrendingUp },
            { label: 'Avg Spend', value: projections.avgExpenses, color: '#f87171', icon: TrendingDown },
            { label: 'Avg Saved', value: projections.avgSavings, color: '#818cf8', icon: Sparkles },
          ].map(({ label, value, color, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl p-3 text-center"
              style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
            >
              <Icon size={13} style={{ color }} className="mx-auto mb-1.5" />
              <p className="text-sm font-bold truncate" style={{ color }}>{formatCurrency(value, currency)}</p>
              <p className="text-[10px] mt-0.5" style={{ color: '#9ca3af' }}>{label}/mo</p>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div
          className="rounded-2xl p-4 mb-5"
          style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ color: '#9ca3af' }}
          >
            Projected Cumulative Savings
          </p>
          <div className="flex items-end gap-2 mb-2" style={{ height: 80 }}>
            {projections.futureMonths.map((m, i) => {
              const pct = maxCumulative > 0 ? Math.max(4, (m.cumulative / maxCumulative) * 100) : 4;
              const opacity = 0.35 + (i / 6) * 0.65;
              return (
                <div key={m.label} className="flex-1 flex flex-col items-center gap-0">
                  <div
                    className="w-full rounded-lg"
                    style={{
                      height: `${pct}%`,
                      background: `rgba(129,140,248,${opacity})`,
                      minHeight: 4,
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex">
            {projections.futureMonths.map(m => (
              <div key={m.label} className="flex-1 text-center">
                <p className="text-[9px]" style={{ color: '#9ca3af' }}>{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Month breakdown */}
        <div className="space-y-2 mb-5">
          <p className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: '#9ca3af' }}>
            Month by Month
          </p>
          {projections.futureMonths.map((m, i) => (
            <div
              key={i}
              className="rounded-2xl px-4 py-3 flex items-center justify-between"
              style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
            >
              <div>
                <p className="text-sm font-bold" style={{ color: '#111827' }}>{m.label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: '#9ca3af' }}>
                  In {formatCurrency(m.income, currency)} · Out {formatCurrency(m.expenses, currency)}
                </p>
              </div>
              <div className="text-right">
                <p
                  className="text-sm font-bold"
                  style={{ color: m.savings >= 0 ? '#34d399' : '#f87171' }}
                >
                  {m.savings >= 0 ? '+' : ''}{formatCurrency(m.savings, currency)}
                </p>
                <p className="text-[10px]" style={{ color: '#9ca3af' }}>
                  Total: {formatCurrency(m.cumulative, currency)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {!projections.hasData && (
          <div
            className="rounded-2xl p-4 flex items-start gap-3"
            style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <DollarSign size={15} style={{ color: '#818cf8' }} className="flex-shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed" style={{ color: '#a5b4fc' }}>
              Add transactions across multiple months to generate accurate projections based on your patterns.
            </p>
          </div>
        )}

        {/* Goal alignment */}
        {savingGoals.length > 0 && projections.avgSavings > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: '#9ca3af' }}>
              Goal Alignment
            </p>
            {savingGoals.map(goal => {
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
              const monthsToGoal = remaining > 0
                ? Math.ceil(remaining / projections.avgSavings)
                : 0;
              return (
                <div
                  key={goal.id}
                  className="rounded-2xl px-4 py-3 flex items-center gap-3"
                  style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
                >
                  <Target size={14} style={{ color: '#fbbf24' }} className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: '#111827' }}>{goal.name}</p>
                    <p className="text-[11px]" style={{ color: '#9ca3af' }}>
                      {remaining <= 0
                        ? 'Goal reached!'
                        : `~${monthsToGoal} month${monthsToGoal !== 1 ? 's' : ''} at current rate`}
                    </p>
                  </div>
                  <p className="text-xs font-bold flex-shrink-0" style={{ color: '#fbbf24' }}>
                    {formatCurrency(remaining, currency)} left
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </PremiumGate>
    </div>
  );
};
