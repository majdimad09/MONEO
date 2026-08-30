import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus, AlertTriangle, Zap, X } from 'lucide-react';
import { Transaction } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getCategoryColor, CategoryIcon } from './CategoryIcon';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';

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

export const StatisticsScreen: React.FC<StatisticsScreenProps> = ({ transactions, currency }) => {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [monthIdx, setMonthIdx] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const [yearOffset, setYearOffset] = useState(0);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  const months = useMemo(() => getAvailableMonths(transactions), [transactions]);
  const currentMonthPrefix = getMonthPrefix(new Date());

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

  const selectedCatTx = useMemo(() => {
    if (!selectedCat) return [];
    return filteredTx.filter(t => t.type === 'expense' && t.category === selectedCat)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
  }, [filteredTx, selectedCat]);

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

  const isCurrentPeriod = viewMode === 'month' && months[monthIdx] === currentMonthPrefix;
  const prevMonthForRecap = !isCurrentPeriod && viewMode === 'month' ? months[monthIdx] : null;

  // suppress unused variable warnings
  void expenses;

  return (
    <div className="page-enter px-4 pt-3 pb-6 space-y-4">

      {/* ── VIEW MODE TABS ──────────────────────────── */}
      <div className="flex p-1 gap-1 rounded-2xl" style={{ background: colors.bgSecondary, border: `1px solid ${colors.borderStrong}` }}>
        {(['week', 'month', 'year'] as ViewMode[]).map(m => (
          <button key={m} onClick={() => setViewMode(m)}
            className={`stat-filter-btn capitalize ${viewMode === m ? 'active' : ''}`}>
            {m === 'week' ? t('weekly') : m === 'month' ? t('monthly') : t('yearly')}
          </button>
        ))}
      </div>

      {/* ── PERIOD NAVIGATION ──────────────────────── */}
      <div className="flex items-center justify-between">
        <button onClick={handlePrev} disabled={!canGoPrev}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-opacity disabled:opacity-25 cursor-pointer"
          style={{ background: colors.bgCard, border: `1px solid ${colors.borderStrong}` }}>
          <ChevronLeft size={16} style={{ color: colors.textSecondary }} />
        </button>
        <div className="text-center">
          <p className="text-base font-bold" style={{ color: colors.textPrimary }}>{periodLabel}</p>
          <p className="text-[11px] mt-0.5" style={{ color: colors.textMuted }}>{t('spendingOverview')}</p>
        </div>
        <button onClick={handleNext} disabled={!canGoNext}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-opacity disabled:opacity-25 cursor-pointer"
          style={{ background: colors.bgCard, border: `1px solid ${colors.borderStrong}` }}>
          <ChevronRight size={16} style={{ color: colors.textSecondary }} />
        </button>
      </div>

      {/* ── INCOME / EXPENSES SUMMARY — shown above donut ── */}
      {(income > 0 || totalExpenses > 0) && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-3.5" style={{ background: colors.positiveSoft, border: `1px solid ${colors.positive}28` }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: colors.positive }}>{t('income')}</p>
            <p className="text-[15px] font-bold leading-tight" style={{ color: colors.positive }}>{formatCurrency(income, currency)}</p>
            <p className="text-[10px] mt-0.5" style={{ color: colors.textMuted }}>{periodLabel}</p>
          </div>
          <div className="rounded-2xl p-3.5" style={{ background: colors.negativeSoft, border: `1px solid ${colors.negative}28` }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: colors.negative }}>{t('expenses')}</p>
            <p className="text-[15px] font-bold leading-tight" style={{ color: colors.negative }}>{formatCurrency(totalExpenses, currency)}</p>
            <p className="text-[10px] mt-0.5" style={{ color: colors.textMuted }}>{categoryData.length} {t('categories')}</p>
          </div>
        </div>
      )}

      {/* ── DONUT CHART CARD ────────────────────────── */}
      <div className="card-dark rounded-3xl p-5">
        {totalExpenses === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: colors.accentSoft, border: `1px solid ${colors.accent}28` }}>
              <TrendingUp size={28} style={{ color: colors.accent }} />
            </div>
            <p className="font-semibold text-sm" style={{ color: colors.textSecondary }}>{t('noExpensesYet')}</p>
            <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{t('navigatePeriodHint')}</p>
          </div>
        ) : (
          <>
            <div className="donut-enter flex justify-center mb-4">
              <div className="relative" style={{ width: 210, height: 210 }}>
                <svg viewBox="0 0 200 200" className="w-full h-full"
                  style={{ filter: `drop-shadow(0 0 20px ${colors.brand}18)` }}>
                  {donutSlices.map((slice, i) => {
                    const isSelected = selectedCat === slice.category;
                    return (
                      <path
                        key={slice.category + i}
                        d={slice.d}
                        fill={slice.color}
                        stroke={colors.bgPrimary}
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
                      <span className="text-xs font-bold mb-1" style={{ color: colors.textMuted }}>{selectedCat}</span>
                      <span className="text-xl font-bold leading-tight" style={{ color: colors.textPrimary }}>
                        {formatCurrency(categoryData.find(c => c.category === selectedCat)?.total || 0, currency)}
                      </span>
                      <span className="text-[10px] mt-1" style={{ color: colors.textMuted }}>
                        {categoryData.find(c => c.category === selectedCat)?.percentage.toFixed(0)}% {t('ofSpending')}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl font-bold leading-tight" style={{ color: colors.textPrimary }}>
                        {formatCurrency(totalExpenses, currency)}
                      </span>
                      <span className="text-[10px] mt-1" style={{ color: colors.textMuted }}>
                        {income > 0 ? `${((totalExpenses / income) * 100).toFixed(0)}% ${t('ofIncome')}` : t('total')}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* vs prev period pill */}
            {prevLabel && (
              <div className="flex justify-center mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{
                    color: diff > 0 ? colors.negative : diff < 0 ? colors.positive : colors.textMuted,
                    background: diff > 0
                      ? (isDark ? 'rgba(239,68,68,0.18)' : 'rgba(239,68,68,0.08)')
                      : diff < 0
                      ? (isDark ? 'rgba(16,185,129,0.16)' : 'rgba(16,185,129,0.08)')
                      : (isDark ? 'rgba(100,116,139,0.18)' : 'rgba(100,116,139,0.08)'),
                    border: diff > 0
                      ? (isDark ? '1px solid rgba(239,68,68,0.32)' : '1px solid rgba(239,68,68,0.2)')
                      : diff < 0
                      ? (isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(16,185,129,0.2)')
                      : (isDark ? '1px solid rgba(100,116,139,0.32)' : '1px solid rgba(100,116,139,0.2)'),
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
                        <span className="text-xs font-semibold truncate" style={{ color: colors.textSecondary }}>{cat.category}</span>
                        <span className="text-xs font-bold font-mono ml-2 flex-shrink-0" style={{ color: colors.textPrimary }}>
                          {formatCurrency(cat.total, currency)}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: colors.borderStrong }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{
                          width: `${cat.percentage}%`,
                          background: cat.color,
                          boxShadow: `0 0 4px ${cat.color}50`,
                        }} />
                      </div>
                    </div>
                    <span className="text-[10px] font-mono w-9 text-right flex-shrink-0" style={{ color: colors.textMuted }}>
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
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${colors.border}` }}>
            <p className="text-sm font-bold" style={{ color: colors.textPrimary }}>{selectedCat}</p>
            <button onClick={() => setSelectedCat(null)} style={{ color: colors.textMuted }} className="cursor-pointer">
              <X size={16} />
            </button>
          </div>
          {selectedCatTx.map((tx, i) => (
            <div key={tx.id} className="flex items-center justify-between px-4 py-2.5"
              style={{ borderBottom: i < selectedCatTx.length - 1 ? `1px solid ${colors.divider}` : 'none' }}>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: colors.textPrimary }}>{tx.description}</p>
                <p className="text-[11px]" style={{ color: colors.textMuted }}>{formatDate(tx.date)}</p>
              </div>
              <span className="text-sm font-bold font-mono" style={{ color: colors.negative }}>−{formatCurrency(tx.amount, currency)}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── MONTHLY RECAP (past months) ─────────────── */}
      {prevMonthForRecap && income > 0 && (
        <div className="recap-card p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: 'rgba(147,197,253,0.6)' }}>
            {getMonthLabel(prevMonthForRecap)} {t('recap')}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: t('income'), val: income, color: colors.positive },
              { label: t('spent'), val: totalExpenses, color: colors.negative },
              { label: t('savedLabel'), val: Math.max(0, income - totalExpenses), color: colors.brand },
            ].map(({ label, val, color }) => (
              <div key={label} className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: colors.textMuted }}>{label}</p>
                <p className="text-sm font-bold leading-tight" style={{ color }}>{formatCurrency(val, currency)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SPENDING ALERTS ─────────────────────────── */}
      {alerts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} style={{ color: colors.amber }} />
            <h3 className="text-sm font-bold" style={{ color: colors.textPrimary }}>{t('spendingAlerts')}</h3>
          </div>
          <div className="space-y-2.5">
            {alerts.map((alert, i) => (
              <div key={i} className="rounded-2xl p-4 flex items-start gap-3"
                style={{ background: isDark ? 'rgba(234,179,8,0.16)' : 'rgba(234,179,8,0.06)', border: isDark ? '1px solid rgba(234,179,8,0.32)' : '1px solid rgba(234,179,8,0.2)' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.25)' }}>
                  <AlertTriangle size={14} style={{ color: colors.amber }} />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: colors.amber }}>{alert.category} is {alert.excessPct.toFixed(0)}% above average</p>
                  <p className="text-[11px] mt-0.5" style={{ color: colors.textMuted }}>
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
