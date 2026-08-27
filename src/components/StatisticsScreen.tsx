import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus, AlertTriangle, Zap, X } from 'lucide-react';
import { Transaction } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getCategoryColor, CategoryIcon } from './CategoryIcon';

interface StatisticsScreenProps {
  transactions: Transaction[];
  currency: string;
}

type ViewMode = 'month' | 'week' | 'year';

function getMonthPrefix(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
function getMonthLabel(prefix: string): string {
  const [y, m] = prefix.split('-').map(Number);
  return new Date(y, m - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
function getAvailableMonths(transactions: Transaction[]): string[] {
  const set = new Set<string>();
  set.add(getMonthPrefix(new Date()));
  transactions.forEach(t => set.add(t.date.slice(0, 7)));
  return Array.from(set).sort().reverse();
}
function getWeekRange(offset: number): { start: Date; end: Date; label: string } {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7) + offset * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const label = offset === 0 ? 'This week' : offset === -1 ? 'Last week' : `${fmt(monday)} – ${fmt(sunday)}`;
  return { start: monday, end: sunday, label };
}
function getYearLabel(offset: number): string {
  return String(new Date().getFullYear() + offset);
}

export const StatisticsScreen: React.FC<StatisticsScreenProps> = ({ transactions, currency }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [monthIdx, setMonthIdx] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const [yearOffset, setYearOffset] = useState(0);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  const months = useMemo(() => getAvailableMonths(transactions), [transactions]);
  const currentMonthPrefix = getMonthPrefix(new Date());

  // ── Filter transactions by view mode ──────────────────────────────
  const { filteredTx, prevFilteredTx, periodLabel, prevLabel } = useMemo(() => {
    let filtered: Transaction[] = [];
    let prevFiltered: Transaction[] = [];
    let periodLabel = '';
    let prevLabel = '';

    if (viewMode === 'month') {
      const cp = months[monthIdx] || currentMonthPrefix;
      const pp = months[monthIdx + 1];
      filtered = transactions.filter(t => t.date.startsWith(cp));
      prevFiltered = pp ? transactions.filter(t => t.date.startsWith(pp)) : [];
      periodLabel = getMonthLabel(cp);
      prevLabel = pp ? getMonthLabel(pp) : '';
    } else if (viewMode === 'week') {
      const { start, end, label } = getWeekRange(weekOffset);
      const { start: ps, end: pe, label: pl } = getWeekRange(weekOffset - 1);
      filtered = transactions.filter(t => { const d = new Date(t.date + 'T12:00:00'); return d >= start && d <= end; });
      prevFiltered = transactions.filter(t => { const d = new Date(t.date + 'T12:00:00'); return d >= ps && d <= pe; });
      periodLabel = label;
      prevLabel = pl;
    } else {
      const year = new Date().getFullYear() + yearOffset;
      const prevYear = year - 1;
      filtered = transactions.filter(t => t.date.startsWith(`${year}-`));
      prevFiltered = transactions.filter(t => t.date.startsWith(`${prevYear}-`));
      periodLabel = String(year);
      prevLabel = String(prevYear);
    }

    return { filteredTx: filtered, prevFilteredTx: prevFiltered, periodLabel, prevLabel };
  }, [viewMode, monthIdx, weekOffset, yearOffset, transactions, months, currentMonthPrefix]);

  const { expenses, income, categoryData, totalExpenses } = useMemo(() => {
    let inc = 0, exp = 0;
    const catMap: Record<string, number> = {};
    filteredTx.forEach(t => {
      if (t.type === 'income') inc += t.amount;
      else { exp += t.amount; catMap[t.category] = (catMap[t.category] || 0) + t.amount; }
    });
    const cats = Object.entries(catMap)
      .map(([cat, total]) => ({ category: cat, total, percentage: exp > 0 ? (total / exp) * 100 : 0, color: getCategoryColor(cat, 'expense') }))
      .sort((a, b) => b.total - a.total);
    return { expenses: exp, income: inc, categoryData: cats, totalExpenses: exp };
  }, [filteredTx]);

  const prevExpenses = useMemo(() =>
    prevFilteredTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [prevFilteredTx]
  );

  const diff = totalExpenses - prevExpenses;
  const diffPct = prevExpenses > 0 ? ((totalExpenses - prevExpenses) / prevExpenses) * 100 : 0;

  // ── Selected category breakdown ───────────────────────────────────
  const selectedCatTx = useMemo(() => {
    if (!selectedCat) return [];
    return filteredTx.filter(t => t.type === 'expense' && t.category === selectedCat)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
  }, [filteredTx, selectedCat]);

  // ── Unusual spending alerts ───────────────────────────────────────
  const alerts = useMemo(() => {
    if (viewMode !== 'month' || months[monthIdx] !== currentMonthPrefix) return [];
    const monthCatMap: Record<string, Record<string, number>> = {};
    transactions.forEach(t => {
      if (t.type !== 'expense') return;
      const m = t.date.slice(0, 7);
      if (!monthCatMap[m]) monthCatMap[m] = {};
      monthCatMap[m][t.category] = (monthCatMap[m][t.category] || 0) + t.amount;
    });
    const cur = monthCatMap[currentMonthPrefix] || {};
    const hist = Object.keys(monthCatMap).filter(m => m !== currentMonthPrefix);
    const result: { category: string; excessPct: number; current: number; avg: number }[] = [];
    if (hist.length >= 1) {
      Object.entries(cur).forEach(([cat, current]) => {
        const h = hist.map(m => monthCatMap[m][cat] || 0).filter(v => v > 0);
        if (!h.length) return;
        const avg = h.reduce((s, v) => s + v, 0) / h.length;
        const excess = ((current - avg) / avg) * 100;
        if (excess > 50 && current - avg > 20) result.push({ category: cat, excessPct: excess, current, avg });
      });
    }
    return result.sort((a, b) => b.excessPct - a.excessPct).slice(0, 3);
  }, [transactions, viewMode, monthIdx, months, currentMonthPrefix]);

  // ── Donut slices ──────────────────────────────────────────────────
  const donutSlices = useMemo(() => {
    if (totalExpenses === 0 || !categoryData.length) return [];
    const radius = 90, inner = 58, cx = 100, cy = 100;
    let acc = 0;
    return categoryData.map(cat => {
      const angle = (cat.total / totalExpenses) * 360;
      const start = acc; acc += angle;
      const sr = ((start - 90) * Math.PI) / 180;
      const er = ((start + angle - 90) * Math.PI) / 180;
      const x1 = cx + radius * Math.cos(sr), y1 = cy + radius * Math.sin(sr);
      const x2 = cx + radius * Math.cos(er), y2 = cy + radius * Math.sin(er);
      const x1i = cx + inner * Math.cos(sr), y1i = cy + inner * Math.sin(sr);
      const x2i = cx + inner * Math.cos(er), y2i = cy + inner * Math.sin(er);
      const lg = angle > 180 ? 1 : 0;
      let d: string;
      if (categoryData.length === 1 || angle >= 359.99) {
        d = `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 0 ${cx} ${cy + radius} A ${radius} ${radius} 0 1 0 ${cx} ${cy - radius} M ${cx} ${cy - inner} A ${inner} ${inner} 0 1 1 ${cx} ${cy + inner} A ${inner} ${inner} 0 1 1 ${cx} ${cy - inner} Z`;
      } else {
        d = `M ${x1} ${y1} A ${radius} ${radius} 0 ${lg} 1 ${x2} ${y2} L ${x2i} ${y2i} A ${inner} ${inner} 0 ${lg} 0 ${x1i} ${y1i} Z`;
      }
      return { ...cat, d };
    });
  }, [categoryData, totalExpenses]);

  // ── Navigation helpers ────────────────────────────────────────────
  const canGoPrev = viewMode === 'month' ? monthIdx < months.length - 1 : viewMode === 'week' ? true : yearOffset > -5;
  const canGoNext = viewMode === 'month' ? monthIdx > 0 : viewMode === 'week' ? weekOffset < 0 : yearOffset < 0;
  const handlePrev = () => {
    if (viewMode === 'month') setMonthIdx(i => i + 1);
    else if (viewMode === 'week') setWeekOffset(w => w - 1);
    else setYearOffset(y => y - 1);
  };
  const handleNext = () => {
    if (viewMode === 'month') setMonthIdx(i => i - 1);
    else if (viewMode === 'week') setWeekOffset(w => w + 1);
    else setYearOffset(y => y + 1);
  };

  // ── Monthly recap (for past months) ──────────────────────────────
  const isCurrentPeriod = viewMode === 'month' && months[monthIdx] === currentMonthPrefix;
  const prevMonthForRecap = !isCurrentPeriod && viewMode === 'month' ? months[monthIdx] : null;

  return (
    <div className="page-enter px-4 pt-3 pb-6 space-y-4">

      {/* ── VIEW MODE TABS ──────────────────────────── */}
      <div className="flex p-1 gap-1 rounded-2xl card-float-1" style={{ background: '#111118', border: '1px solid #242434' }}>
        {(['week', 'month', 'year'] as ViewMode[]).map(m => (
          <button key={m} onClick={() => setViewMode(m)}
            className={`stat-filter-btn capitalize ${viewMode === m ? 'active' : ''}`}>
            {m === 'week' ? 'Weekly' : m === 'month' ? 'Monthly' : 'Yearly'}
          </button>
        ))}
      </div>

      {/* ── PERIOD NAVIGATION ──────────────────────── */}
      <div className="flex items-center justify-between py-0.5 card-float-1">
        <button onClick={handlePrev} disabled={!canGoPrev}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-opacity disabled:opacity-25 cursor-pointer"
          style={{ background: '#16161f', border: '1px solid #242434' }}>
          <ChevronLeft size={16} className="text-slate-300" />
        </button>
        <div className="text-center">
          <p className="text-base font-bold text-white">{periodLabel}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Spending overview</p>
        </div>
        <button onClick={handleNext} disabled={!canGoNext}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-opacity disabled:opacity-25 cursor-pointer"
          style={{ background: '#16161f', border: '1px solid #242434' }}>
          <ChevronRight size={16} className="text-slate-300" />
        </button>
      </div>

      {/* ── DONUT CHART CARD ────────────────────────── */}
      <div className="card-dark rounded-3xl p-5 card-float-2">
        {totalExpenses === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <TrendingUp size={28} className="text-blue-400" />
            </div>
            <p className="text-slate-300 font-semibold text-sm">No expenses in {periodLabel}</p>
            <p className="text-slate-600 text-xs mt-1">Navigate to another period or add expenses</p>
          </div>
        ) : (
          <>
            <div className="donut-enter flex justify-center mb-4">
              <div className="relative" style={{ width: 210, height: 210 }}>
                <svg viewBox="0 0 200 200" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 20px rgba(59,130,246,0.1))' }}>
                  {donutSlices.map((slice, i) => {
                    const isSelected = selectedCat === slice.category;
                    return (
                      <path
                        key={slice.category + i}
                        d={slice.d}
                        fill={slice.color}
                        stroke="#16161f"
                        strokeWidth={isSelected ? 1 : 3}
                        style={{
                          filter: isSelected ? `drop-shadow(0 0 8px ${slice.color}80)` : `drop-shadow(0 0 3px ${slice.color}30)`,
                          opacity: selectedCat && !isSelected ? 0.35 : 1,
                          transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                          transformOrigin: '100px 100px',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                        }}
                        onClick={() => setSelectedCat(prev => prev === slice.category ? null : slice.category)}
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                  {selectedCat ? (
                    <>
                      <span className="text-xs font-bold text-slate-400 mb-1">{selectedCat}</span>
                      <span className="text-xl font-bold text-white leading-tight">
                        {formatCurrency(categoryData.find(c => c.category === selectedCat)?.total || 0, currency)}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">
                        {categoryData.find(c => c.category === selectedCat)?.percentage.toFixed(0)}% of spending
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl font-bold text-white leading-tight">
                        {formatCurrency(totalExpenses, currency)}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">
                        {income > 0 ? `${((totalExpenses / income) * 100).toFixed(0)}% of income` : 'total spending'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* vs prev period pill */}
            {prevLabel && (
              <div className="flex justify-center mb-4">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                  diff > 0 ? 'text-red-400' : diff < 0 ? 'text-green-400' : 'text-slate-400'
                }`} style={{
                  background: diff > 0 ? 'rgba(239,68,68,0.08)' : diff < 0 ? 'rgba(16,185,129,0.08)' : 'rgba(100,116,139,0.08)',
                  border: diff > 0 ? '1px solid rgba(239,68,68,0.2)' : diff < 0 ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(100,116,139,0.2)',
                }}>
                  {diff > 0 ? <TrendingUp size={12} /> : diff < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                  <span>{diff === 0 ? `Same as ${prevLabel}` : `${diff > 0 ? '+' : ''}${formatCurrency(Math.abs(diff), currency)} vs ${prevLabel}`}</span>
                  {diff !== 0 && prevExpenses > 0 && <span>({diff > 0 ? '+' : ''}{diffPct.toFixed(1)}%)</span>}
                </div>
              </div>
            )}

            {/* Category rows */}
            <div className="space-y-1">
              {categoryData.map(cat => {
                const isSelected = selectedCat === cat.category;
                return (
                  <div
                    key={cat.category}
                    className={`cat-row flex items-center gap-3 ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedCat(prev => prev === cat.category ? null : cat.category)}
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${cat.color}18`, color: cat.color }}>
                      <CategoryIcon category={cat.category} type="expense" size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-300 truncate">{cat.category}</span>
                        <span className="text-xs font-bold text-slate-100 font-mono ml-2 flex-shrink-0">
                          {formatCurrency(cat.total, currency)}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#242434' }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{
                          width: `${cat.percentage}%`,
                          background: cat.color,
                          boxShadow: `0 0 4px ${cat.color}50`,
                        }} />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono w-9 text-right flex-shrink-0">
                      {cat.percentage.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── CATEGORY BREAKDOWN (when cat selected) ──── */}
      {selectedCat && selectedCatTx.length > 0 && (
        <div className="card-dark rounded-2xl overflow-hidden expand-in">
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #0f1e38' }}>
            <p className="text-sm font-bold text-slate-200">{selectedCat} breakdown</p>
            <button onClick={() => setSelectedCat(null)} className="text-slate-500 cursor-pointer">
              <X size={16} />
            </button>
          </div>
          {selectedCatTx.map((tx, i) => (
            <div key={tx.id} className="flex items-center justify-between px-4 py-2.5"
              style={{ borderBottom: i < selectedCatTx.length - 1 ? '1px solid #0a1828' : 'none' }}>
              <div>
                <p className="text-[13px] font-semibold text-slate-200">{tx.description}</p>
                <p className="text-[11px] text-slate-500">{formatDate(tx.date)}</p>
              </div>
              <span className="text-sm font-bold text-red-400 font-mono">−{formatCurrency(tx.amount, currency)}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── INCOME / EXPENSES SUMMARY ───────────────── */}
      {totalExpenses > 0 && (
        <div className="grid grid-cols-2 gap-3 card-float-3">
          <div className="card-dark rounded-2xl p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1.5">Income</p>
            <p className="text-lg font-bold text-green-400">{formatCurrency(income, currency)}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{periodLabel}</p>
          </div>
          <div className="card-dark rounded-2xl p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1.5">Expenses</p>
            <p className="text-lg font-bold text-red-400">{formatCurrency(totalExpenses, currency)}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{categoryData.length} categories</p>
          </div>
        </div>
      )}

      {/* ── MONTHLY RECAP (past months) ─────────────── */}
      {prevMonthForRecap && income > 0 && (
        <div className="recap-card p-5 card-float-4">
          <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: 'rgba(147,197,253,0.6)' }}>
            {getMonthLabel(prevMonthForRecap)} Recap
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Income', val: income, color: '#34d399' },
              { label: 'Spent', val: totalExpenses, color: '#f87171' },
              { label: 'Saved', val: Math.max(0, income - totalExpenses), color: '#60a5fa' },
            ].map(({ label, val, color }) => (
              <div key={label} className="text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{label}</p>
                <p className="text-sm font-bold leading-tight" style={{ color }}>{formatCurrency(val, currency)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SPENDING ALERTS ─────────────────────────── */}
      {alerts.length > 0 && (
        <div className="card-float-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-yellow-400" />
            <h3 className="text-sm font-bold text-white">Spending Alerts</h3>
          </div>
          <div className="space-y-2.5">
            {alerts.map((alert, i) => (
              <div key={i} className="rounded-2xl p-4 flex items-start gap-3"
                style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.25)' }}>
                  <AlertTriangle size={14} className="text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-yellow-300">{alert.category} is {alert.excessPct.toFixed(0)}% above average</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    This month: {formatCurrency(alert.current, currency)} vs avg {formatCurrency(alert.avg, currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
