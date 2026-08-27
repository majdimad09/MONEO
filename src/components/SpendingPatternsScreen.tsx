import React, { useMemo } from 'react';
import { ChevronLeft, TrendingUp, TrendingDown, Minus, Calendar, Clock } from 'lucide-react';
import { Transaction, AppView } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { PremiumGate } from './PremiumGate';

interface SpendingPatternsProps {
  transactions: Transaction[];
  currency: string;
  isPremium: boolean;
  onNavigate: (view: AppView) => void;
  onUpgrade: () => void;
}

function mp(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export const SpendingPatternsScreen: React.FC<SpendingPatternsProps> = ({
  transactions, currency, isPremium, onNavigate, onUpgrade,
}) => {
  const patterns = useMemo(() => {
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(mp(d));
    }

    const expenses = transactions.filter(t => t.type === 'expense');

    // Category trends
    const allCats = [...new Set(expenses.map(t => t.category))];
    const catTrends = allCats.map(cat => {
      const monthly = months.map(m =>
        expenses.filter(t => t.category === cat && t.date.startsWith(m)).reduce((s, t) => s + t.amount, 0),
      );
      const nonZero = monthly.filter(v => v > 0);
      const avg = nonZero.length > 0 ? nonZero.reduce((s, v) => s + v, 0) / nonZero.length : 0;
      const lastMonth = monthly[monthly.length - 1];
      const hist = monthly.slice(0, -1).filter(v => v > 0);
      const prevAvg = hist.length > 0 ? hist.reduce((s, v) => s + v, 0) / hist.length : 0;
      const trend: 'up' | 'down' | 'stable' = prevAvg === 0 ? 'stable'
        : lastMonth > prevAvg * 1.15 ? 'up'
        : lastMonth < prevAvg * 0.85 ? 'down'
        : 'stable';
      const changePct = prevAvg > 0 ? ((lastMonth - prevAvg) / prevAvg) * 100 : 0;
      return { cat, monthly, avg, trend, changePct, lastMonth };
    }).filter(c => c.avg > 0).sort((a, b) => b.avg - a.avg).slice(0, 8);

    // Day of week
    const dayTotals = [0, 0, 0, 0, 0, 0, 0];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    expenses.forEach(t => {
      const d = new Date(t.date + 'T12:00:00').getDay();
      dayTotals[d] += t.amount;
      dayCounts[d]++;
    });
    const dayAvgs = dayTotals.map((total, i) => dayCounts[i] > 0 ? total / dayCounts[i] : 0);
    const maxDayAvg = Math.max(...dayAvgs, 1);

    // Time of month
    const early = expenses.filter(t => parseInt(t.date.split('-')[2]) <= 10).reduce((s, t) => s + t.amount, 0);
    const mid = expenses.filter(t => { const d = parseInt(t.date.split('-')[2]); return d > 10 && d <= 20; }).reduce((s, t) => s + t.amount, 0);
    const late = expenses.filter(t => parseInt(t.date.split('-')[2]) > 20).reduce((s, t) => s + t.amount, 0);
    const periodTotal = early + mid + late || 1;

    const monthLabels = months.map(m => {
      const [y, mo] = m.split('-').map(Number);
      return new Date(y, mo - 1).toLocaleDateString('en-US', { month: 'short' });
    });

    return { catTrends, dayAvgs, maxDayAvg, monthLabels, early, mid, late, periodTotal };
  }, [transactions]);

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
          <h1 className="text-base font-bold leading-none" style={{ color: '#111827' }}>Spending Patterns</h1>
          <p className="text-[10px] mt-0.5" style={{ color: '#9ca3af' }}>Trends across months and categories</p>
        </div>
      </div>

      <PremiumGate
        isPremium={isPremium}
        feature="Spending Patterns"
        description="Discover how your spending evolves month-to-month and identify your biggest habit-based costs."
        onUpgrade={onUpgrade}
      >
        {/* Category trends */}
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-widest px-1 mb-3" style={{ color: '#9ca3af' }}>
            Category Trends (Last 6 Months)
          </p>
          {patterns.catTrends.length === 0 ? (
            <div
              className="rounded-2xl p-5 text-center"
              style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
            >
              <p className="text-sm" style={{ color: '#9ca3af' }}>
                Add more transactions to see category trends.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {patterns.catTrends.map(({ cat, trend, changePct, lastMonth, avg }) => (
                <div
                  key={cat}
                  className="rounded-2xl px-4 py-3 flex items-center gap-3"
                  style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
                >
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: trend === 'up' ? 'rgba(248,113,113,0.12)'
                        : trend === 'down' ? 'rgba(52,211,153,0.12)'
                        : 'rgba(99,102,241,0.08)',
                    }}
                  >
                    {trend === 'up'
                      ? <TrendingUp size={13} style={{ color: '#f87171' }} />
                      : trend === 'down'
                      ? <TrendingDown size={13} style={{ color: '#34d399' }} />
                      : <Minus size={13} style={{ color: '#818cf8' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: '#111827' }}>{cat}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: '#9ca3af' }}>
                      Avg {formatCurrency(avg, currency)}/mo
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold" style={{ color: '#111827' }}>
                      {formatCurrency(lastMonth, currency)}
                    </p>
                    {Math.abs(changePct) >= 5 && (
                      <p
                        className="text-[11px] font-semibold"
                        style={{ color: changePct > 0 ? '#f87171' : '#34d399' }}
                      >
                        {changePct > 0 ? '+' : ''}{changePct.toFixed(0)}% vs avg
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Day of week chart */}
        <div
          className="rounded-2xl p-4 mb-5"
          style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={13} style={{ color: '#818cf8' }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9ca3af' }}>
              Avg Spend by Day of Week
            </p>
          </div>
          <div className="flex items-end gap-1 mb-2" style={{ height: 60 }}>
            {patterns.dayAvgs.map((avg, i) => {
              const pct = Math.max(4, (avg / patterns.maxDayAvg) * 100);
              const isWeekend = i === 0 || i === 6;
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full rounded-t"
                    style={{
                      height: `${pct}%`,
                      background: isWeekend ? 'rgba(251,191,36,0.65)' : 'rgba(129,140,248,0.65)',
                      minHeight: 4,
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex">
            {dayLabels.map((d, i) => (
              <div key={i} className="flex-1 text-center">
                <p
                  className="text-[9px]"
                  style={{ color: (i === 0 || i === 6) ? '#fbbf24' : '#9ca3af' }}
                >
                  {d}
                </p>
              </div>
            ))}
          </div>
          <p className="text-[10px] mt-2 text-center" style={{ color: '#9ca3af' }}>
            <span style={{ color: '#fbbf24' }}>■</span> Weekend &nbsp;
            <span style={{ color: '#818cf8' }}>■</span> Weekday
          </p>
        </div>

        {/* Time of month */}
        <div
          className="rounded-2xl p-4"
          style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock size={13} style={{ color: '#818cf8' }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9ca3af' }}>
              Spending by Time of Month
            </p>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Early (1–10)', amount: patterns.early },
              { label: 'Mid (11–20)', amount: patterns.mid },
              { label: 'Late (21–31)', amount: patterns.late },
            ].map(({ label, amount }) => {
              const pct = (amount / patterns.periodTotal) * 100;
              return (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span style={{ color: '#6b7280' }}>{label}</span>
                    <div className="flex items-center gap-2">
                      <span style={{ color: '#9ca3af' }}>{formatCurrency(amount, currency)}</span>
                      <span className="font-bold" style={{ color: '#111827' }}>{pct.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: '#e5e7eb' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: '#6366f1' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </PremiumGate>
    </div>
  );
};
