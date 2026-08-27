import React, { useState, useMemo } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, BarChart2, Zap } from 'lucide-react';
import { Transaction } from '../types/finance';
import { formatCurrency } from '../utils/formatters';

interface InsightsPageProps {
  transactions: Transaction[];
  currency: string;
}

function getMonthPrefix(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(prefix: string): string {
  const [y, m] = prefix.split('-').map(Number);
  return new Date(y, m - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getAvailableMonths(transactions: Transaction[]): string[] {
  const set = new Set<string>();
  transactions.forEach(t => {
    if (t.type === 'expense') set.add(t.date.substring(0, 7));
  });
  return Array.from(set).sort().reverse();
}

interface Alert {
  category: string;
  currentAmount: number;
  avgAmount: number;
  excessPct: number;
  type: 'unusual' | 'large';
  description?: string;
  amount?: number;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({ transactions, currency }) => {
  const now = new Date();
  const currentMonthPrefix = getMonthPrefix(now);
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthPrefix = getMonthPrefix(prevMonthDate);

  const availableMonths = useMemo(() => getAvailableMonths(transactions), [transactions]);

  const [monthA, setMonthA] = useState<string>(() => availableMonths[0] || currentMonthPrefix);
  const [monthB, setMonthB] = useState<string>(() => availableMonths[1] || prevMonthPrefix);

  // Aggregate expenses by category for a given month prefix
  function getCategorySpend(prefix: string): Record<string, number> {
    const map: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === 'expense' && t.date.startsWith(prefix)) {
        map[t.category] = (map[t.category] || 0) + t.amount;
      }
    });
    return map;
  }

  function getTotalExpenses(prefix: string): number {
    return transactions.filter(t => t.type === 'expense' && t.date.startsWith(prefix)).reduce((s, t) => s + t.amount, 0);
  }

  const spendA = useMemo(() => getCategorySpend(monthA), [transactions, monthA]);
  const spendB = useMemo(() => getCategorySpend(monthB), [transactions, monthB]);
  const totalA = useMemo(() => getTotalExpenses(monthA), [transactions, monthA]);
  const totalB = useMemo(() => getTotalExpenses(monthB), [transactions, monthB]);

  const allCategories = useMemo(() => {
    const cats = new Set([...Object.keys(spendA), ...Object.keys(spendB)]);
    return Array.from(cats).sort((a, b) => {
      const maxA = Math.max(spendA[a] || 0, spendB[a] || 0);
      const maxB = Math.max(spendA[b] || 0, spendB[b] || 0);
      return maxB - maxA;
    });
  }, [spendA, spendB]);

  const maxCategorySpend = useMemo(() =>
    Math.max(...allCategories.map(c => Math.max(spendA[c] || 0, spendB[c] || 0)), 1),
    [allCategories, spendA, spendB]
  );

  const totalDiff = totalA - totalB;
  const totalDiffPct = totalB > 0 ? ((totalA - totalB) / totalB) * 100 : 0;

  // Unusual spending alerts
  const alerts: Alert[] = useMemo(() => {
    const result: Alert[] = [];

    // Group expenses by category and by month
    const monthCategoryMap: Record<string, Record<string, number>> = {};
    transactions.forEach(t => {
      if (t.type !== 'expense') return;
      const month = t.date.substring(0, 7);
      if (!monthCategoryMap[month]) monthCategoryMap[month] = {};
      monthCategoryMap[month][t.category] = (monthCategoryMap[month][t.category] || 0) + t.amount;
    });

    // For each category in current month, compare to historical average (excluding current month)
    const currentSpend = monthCategoryMap[currentMonthPrefix] || {};
    const historicalMonths = Object.keys(monthCategoryMap).filter(m => m !== currentMonthPrefix);

    if (historicalMonths.length >= 1) {
      Object.entries(currentSpend).forEach(([cat, current]) => {
        const historicalAmounts = historicalMonths.map(m => monthCategoryMap[m][cat] || 0).filter(v => v > 0);
        if (historicalAmounts.length === 0) return;
        const avg = historicalAmounts.reduce((s, v) => s + v, 0) / historicalAmounts.length;
        if (avg === 0) return;
        const excessPct = ((current - avg) / avg) * 100;
        const absoluteExcess = current - avg;
        // Alert if >50% above average AND the excess is at least $20 equivalent
        if (excessPct > 50 && absoluteExcess > 20) {
          result.push({ category: cat, currentAmount: current, avgAmount: avg, excessPct, type: 'unusual' });
        }
      });
    }

    // Large single transactions (> 3x the average transaction size for that category)
    const catTxSizes: Record<string, number[]> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      if (!catTxSizes[t.category]) catTxSizes[t.category] = [];
      catTxSizes[t.category].push(t.amount);
    });

    const currentMonthTxs = transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonthPrefix));
    currentMonthTxs.forEach(t => {
      const all = catTxSizes[t.category] || [];
      if (all.length < 2) return;
      const avg = all.reduce((s, v) => s + v, 0) / all.length;
      if (t.amount > avg * 3 && t.amount > 50) {
        if (!result.find(a => a.type === 'large' && a.description === t.description)) {
          result.push({ category: t.category, currentAmount: t.amount, avgAmount: avg, excessPct: ((t.amount - avg) / avg) * 100, type: 'large', description: t.description, amount: t.amount });
        }
      }
    });

    return result.sort((a, b) => b.excessPct - a.excessPct);
  }, [transactions, currentMonthPrefix]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Insights</h2>
        <p className="text-sm text-slate-500 mt-1">Compare spending across months and detect unusual patterns.</p>
      </div>

      {/* Unusual Spending Alerts */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-yellow-400" />
          <h3 className="font-bold text-slate-800">Spending Alerts</h3>
          <span className="text-xs text-slate-500">— {getMonthLabel(currentMonthPrefix)}</span>
        </div>

        {alerts.length === 0 ? (
          <div className="card-dark rounded-2xl p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-700 text-sm">All good! No unusual spending detected.</p>
              <p className="text-xs text-slate-500 mt-0.5">Your spending patterns look normal compared to past months.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <div key={i} className="rounded-2xl p-4 flex items-start gap-4"
                style={{
                  background: alert.type === 'large' ? 'rgba(239,68,68,0.06)' : 'rgba(234,179,8,0.06)',
                  border: `1px solid ${alert.type === 'large' ? 'rgba(239,68,68,0.2)' : 'rgba(234,179,8,0.2)'}`,
                }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: alert.type === 'large' ? 'rgba(239,68,68,0.12)' : 'rgba(234,179,8,0.12)',
                    border: `1px solid ${alert.type === 'large' ? 'rgba(239,68,68,0.3)' : 'rgba(234,179,8,0.3)'}`,
                  }}>
                  <AlertTriangle className={`w-4 h-4 ${alert.type === 'large' ? 'text-red-400' : 'text-yellow-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm ${alert.type === 'large' ? 'text-red-300' : 'text-yellow-300'}`}>
                    {alert.type === 'large'
                      ? `Large ${alert.category} transaction: ${alert.description}`
                      : `${alert.category} spending is ${alert.excessPct.toFixed(0)}% above average`
                    }
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {alert.type === 'large'
                      ? `${formatCurrency(alert.amount!, currency)} — avg transaction is ${formatCurrency(alert.avgAmount, currency)}`
                      : `This month: ${formatCurrency(alert.currentAmount, currency)} vs. usual avg of ${formatCurrency(alert.avgAmount, currency)}`
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Monthly Spending Comparison */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-4 h-4 text-blue-400" />
          <h3 className="font-bold text-slate-800">Monthly Comparison</h3>
        </div>

        {/* Month selectors */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <label className="section-label mb-1.5 block">Month A</label>
            <select
              value={monthA}
              onChange={e => setMonthA(e.target.value)}
              className="input-dark w-full px-3 py-2 rounded-xl text-sm"
            >
              {availableMonths.length === 0
                ? <option value={currentMonthPrefix}>{getMonthLabel(currentMonthPrefix)}</option>
                : availableMonths.map(m => <option key={m} value={m}>{getMonthLabel(m)}</option>)
              }
            </select>
          </div>
          <div className="flex-1">
            <label className="section-label mb-1.5 block">Month B (Compare to)</label>
            <select
              value={monthB}
              onChange={e => setMonthB(e.target.value)}
              className="input-dark w-full px-3 py-2 rounded-xl text-sm"
            >
              {availableMonths.length === 0
                ? <option value={prevMonthPrefix}>{getMonthLabel(prevMonthPrefix)}</option>
                : availableMonths.map(m => <option key={m} value={m}>{getMonthLabel(m)}</option>)
              }
            </select>
          </div>
        </div>

        {/* Total comparison */}
        <div className="card-dark rounded-2xl p-5 mb-5">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="section-label mb-1">{getMonthLabel(monthA)}</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(totalA, currency)}</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                totalDiff > 0 ? 'bg-red-500/10' : totalDiff < 0 ? 'bg-green-500/10' : 'bg-slate-500/10'
              }`}>
                {totalDiff > 0
                  ? <TrendingUp className="w-4 h-4 text-red-400" />
                  : totalDiff < 0
                  ? <TrendingDown className="w-4 h-4 text-green-400" />
                  : <Minus className="w-4 h-4 text-slate-400" />
                }
              </div>
              <p className={`text-sm font-bold ${totalDiff > 0 ? 'text-red-400' : totalDiff < 0 ? 'text-green-400' : 'text-slate-400'}`}>
                {totalDiff === 0 ? 'Same' : (totalDiff > 0 ? '+' : '') + formatCurrency(Math.abs(totalDiff), currency)}
              </p>
              {totalB > 0 && totalDiff !== 0 && (
                <p className={`text-[10px] font-medium mt-0.5 ${totalDiff > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {totalDiff > 0 ? '+' : ''}{totalDiffPct.toFixed(1)}%
                </p>
              )}
            </div>
            <div>
              <p className="section-label mb-1">{getMonthLabel(monthB)}</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(totalB, currency)}</p>
            </div>
          </div>
        </div>

        {/* Category breakdown */}
        {allCategories.length === 0 ? (
          <div className="card-dark rounded-2xl p-8 text-center">
            <p className="text-slate-500 text-sm">No expense data found for the selected months.</p>
            <p className="text-slate-600 text-xs mt-1">Add transactions or load sample data to compare months.</p>
          </div>
        ) : (
          <div className="card-dark rounded-2xl p-5 space-y-5">
            {/* Legend */}
            <div className="flex items-center gap-5 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-blue-500" />
                {getMonthLabel(monthA)}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-purple-500 opacity-60" />
                {getMonthLabel(monthB)}
              </div>
            </div>

            {allCategories.map(cat => {
              const amtA = spendA[cat] || 0;
              const amtB = spendB[cat] || 0;
              const barA = (amtA / maxCategorySpend) * 100;
              const barB = (amtB / maxCategorySpend) * 100;
              const diff = amtA - amtB;

              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-600">{cat}</span>
                    <div className="flex items-center gap-2 text-[11px]">
                      {diff !== 0 && (
                        <span className={diff > 0 ? 'text-red-400' : 'text-green-400'}>
                          {diff > 0 ? '+' : ''}{formatCurrency(Math.abs(diff), currency)}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Bar A */}
                  <div className="mb-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#0a1424' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${barA}%`, background: '#3b82f6', boxShadow: '0 0 6px rgba(59,130,246,0.4)' }} />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono w-16 text-right flex-shrink-0">
                        {formatCurrency(amtA, currency)}
                      </span>
                    </div>
                  </div>
                  {/* Bar B */}
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#0a1424' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${barB}%`, background: '#8b5cf6', opacity: 0.6 }} />
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono w-16 text-right flex-shrink-0">
                        {formatCurrency(amtB, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
