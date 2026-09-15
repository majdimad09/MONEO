import React, { useMemo } from 'react';
import {
  ArrowUpRight, ArrowDownRight, RefreshCw, ChevronRight,
  Plus, TrendingUp,
} from 'lucide-react';
import { Transaction, RecurringIncome, Subscription } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '../context/NavigationContext';
import { CategoryIcon, getCategoryColor } from './CategoryIcon';

interface MoneyBreakdownScreenProps {
  type: 'income' | 'expense';
  transactions: Transaction[];
  recurringIncome: RecurringIncome[];
  subscriptions: Subscription[];
  currency: string;
  onEditTransaction: (tx: Transaction) => void;
  onNavigateRecurring: () => void;
  onNavigateRecurringIncome: () => void;
  onAddIncome: () => void;
  onAddExpense: () => void;
}

function getCurrentMonthPrefix(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
}

function monthlyAmount(amount: number, frequency: string): number {
  if (frequency === 'weekly')   return Math.round((amount * 52) / 12 * 100) / 100;
  if (frequency === 'biweekly') return Math.round((amount * 26) / 12 * 100) / 100;
  if (frequency === 'yearly')   return Math.round(amount / 12 * 100) / 100;
  return amount;
}

function freqLabel(frequency: string): string {
  if (frequency === 'monthly')   return 'Monthly';
  if (frequency === 'weekly')    return 'Weekly';
  if (frequency === 'biweekly')  return 'Bi-weekly';
  if (frequency === 'yearly')    return 'Yearly';
  return frequency;
}

export const MoneyBreakdownScreen: React.FC<MoneyBreakdownScreenProps> = ({
  type, transactions, recurringIncome, subscriptions, currency,
  onEditTransaction, onNavigateRecurring, onNavigateRecurringIncome,
  onAddIncome, onAddExpense,
}) => {
  const { isDark, colors } = useTheme();
  const { goBack } = useNavigation();
  const prefix = getCurrentMonthPrefix();
  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const isIncome = type === 'income';
  const accent   = isIncome ? '#22c55e' : '#f87171';
  const accentBg = isIncome ? 'rgba(34,197,94,0.10)' : 'rgba(248,113,113,0.10)';
  const accentBorder = isIncome ? 'rgba(34,197,94,0.22)' : 'rgba(248,113,113,0.20)';

  // One-time transactions for current month
  const thisMonthTx = useMemo(() =>
    transactions
      .filter(tx => tx.type === type && tx.date.startsWith(prefix) && !tx.isRecurring)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transactions, type, prefix],
  );

  // Active recurring items
  const activeRecurringIncome = useMemo(() =>
    recurringIncome.filter(r => r.isActive),
    [recurringIncome],
  );
  const activeSubscriptions = useMemo(() =>
    subscriptions.filter(s => s.isActive),
    [subscriptions],
  );

  // Totals — same formula as HomeScreen
  const oneTimeTotal = useMemo(() =>
    thisMonthTx.reduce((s, tx) => s + tx.amount, 0),
    [thisMonthTx],
  );
  const recurringTotal = useMemo(() => {
    if (isIncome) {
      return activeRecurringIncome.reduce((s, r) => s + monthlyAmount(r.amount, r.frequency), 0);
    } else {
      return activeSubscriptions.reduce((s, sub) => s + monthlyAmount(sub.amount, sub.frequency), 0);
    }
  }, [isIncome, activeRecurringIncome, activeSubscriptions]);

  const grandTotal = oneTimeTotal + recurringTotal;

  const hasOneTime  = thisMonthTx.length > 0;
  const hasRecurring = isIncome ? activeRecurringIncome.length > 0 : activeSubscriptions.length > 0;

  return (
    <div className="page-enter pb-8">

      {/* ── HEADER ── */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-sm font-semibold cursor-pointer mb-4"
          style={{ color: colors.textSecondary, background: 'none', border: 'none' }}
        >
          <ArrowUpRight size={0} style={{ display: 'none' }} />
          <span style={{ color: accent, fontSize: 18, lineHeight: 1 }}>←</span>
          <span>{monthLabel}</span>
        </button>

        {/* Hero total */}
        <div
          className="rounded-3xl p-5 mb-1"
          style={{
            ...(isDark ? {
              background: 'linear-gradient(160deg, #0c0c12 0%, #080810 100%)',
              border: `1px solid ${accentBorder}`,
              boxShadow: `0 8px 40px rgba(0,0,0,0.60), 0 0 0 1px ${accentBorder}`,
            } : {
              background: '#ffffff',
              border: `1.5px solid ${accentBorder}`,
              boxShadow: `0 4px 24px ${accentBg}`,
            }),
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {isDark && (
            <div style={{
              position: 'absolute', top: -50, right: -50,
              width: 180, height: 180, borderRadius: '50%',
              background: `radial-gradient(circle, ${accent}18 0%, transparent 65%)`,
              pointerEvents: 'none',
            }} />
          )}

          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: accentBg, border: `1px solid ${accentBorder}` }}
            >
              {isIncome
                ? <ArrowUpRight size={18} style={{ color: accent }} />
                : <ArrowDownRight size={18} style={{ color: accent }} />}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>
                {isIncome ? 'Total Income' : 'Total Expenses'}
              </p>
              <p className="text-[11px] font-medium" style={{ color: colors.textSecondary }}>
                {monthLabel}
              </p>
            </div>
          </div>

          <p style={{
            fontSize: 44, fontWeight: 900, letterSpacing: '-0.04em',
            lineHeight: 1, color: accent,
            fontFeatureSettings: '"tnum"',
            textShadow: isDark ? `0 0 40px ${accent}40` : 'none',
          }}>
            {formatCurrency(grandTotal, currency)}
          </p>

          {/* Sub-totals row */}
          {(hasOneTime || hasRecurring) && (
            <div className="flex gap-4 mt-3 pt-3" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
              {hasOneTime && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: colors.textMuted }}>One-Time</p>
                  <p className="text-sm font-bold" style={{ color: colors.textPrimary, fontFeatureSettings: '"tnum"' }}>
                    {formatCurrency(oneTimeTotal, currency)}
                  </p>
                </div>
              )}
              {hasRecurring && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: colors.textMuted }}>Recurring / mo</p>
                  <p className="text-sm font-bold" style={{ color: colors.textPrimary, fontFeatureSettings: '"tnum"' }}>
                    {formatCurrency(recurringTotal, currency)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── ONE-TIME TRANSACTIONS ── */}
      {hasOneTime && (
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>
              This Month
            </p>
            <button
              onClick={isIncome ? onAddIncome : onAddExpense}
              className="flex items-center gap-1 text-[11px] font-bold cursor-pointer"
              style={{ color: accent, background: 'none', border: 'none' }}
            >
              <Plus size={12} /> Add
            </button>
          </div>

          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: isDark ? colors.bgCard : '#ffffff',
              border: `1px solid ${isDark ? colors.border : 'rgba(99,102,241,0.10)'}`,
              boxShadow: isDark ? '0 2px 20px rgba(0,0,0,0.35)' : '0 2px 16px rgba(99,102,241,0.06)',
            }}
          >
            {thisMonthTx.map((tx, i) => {
              const catColor = getCategoryColor(tx.category, tx.type);
              return (
                <button
                  key={tx.id}
                  onClick={() => onEditTransaction(tx)}
                  className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left cursor-pointer active:scale-[0.99] transition-transform"
                  style={{
                    borderBottom: i < thisMonthTx.length - 1 ? `1px solid ${colors.divider}` : 'none',
                    background: 'transparent',
                    border: i < thisMonthTx.length - 1 ? `0 0 1px 0 solid ${colors.divider}` : 'none',
                    borderBottomWidth: i < thisMonthTx.length - 1 ? 1 : 0,
                    borderBottomStyle: 'solid',
                    borderBottomColor: colors.divider,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${catColor}22, ${catColor}12)`,
                      border: `1.5px solid ${catColor}24`,
                    }}
                  >
                    <CategoryIcon category={tx.category} type={tx.type} size={17} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: colors.textPrimary }}>
                      {tx.description}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: colors.textMuted }}>
                      {formatDate(tx.date)} · {tx.category}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-bold text-[14px]" style={{ color: accent, fontFeatureSettings: '"tnum"' }}>
                      {formatCurrency(tx.amount, currency)}
                    </span>
                    <ChevronRight size={13} style={{ color: colors.textMuted }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add button when no one-time transactions */}
      {!hasOneTime && (
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>
              This Month
            </p>
          </div>
          <button
            onClick={isIncome ? onAddIncome : onAddExpense}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl cursor-pointer active:scale-[0.98] transition-transform"
            style={{
              background: accentBg,
              border: `1px dashed ${accentBorder}`,
              color: accent,
              fontSize: 13, fontWeight: 700,
            }}
          >
            <Plus size={16} />
            Add {isIncome ? 'Income' : 'Expense'}
          </button>
        </div>
      )}

      {/* ── RECURRING ── */}
      <div className="px-4 pt-2 pb-2">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>
            Recurring
          </p>
          <button
            onClick={isIncome ? onNavigateRecurringIncome : onNavigateRecurring}
            className="text-[11px] font-bold cursor-pointer"
            style={{ color: accent, background: 'none', border: 'none' }}
          >
            Manage →
          </button>
        </div>

        {isIncome ? (
          activeRecurringIncome.length > 0 ? (
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: isDark ? colors.bgCard : '#ffffff',
                border: `1px solid ${isDark ? colors.border : 'rgba(99,102,241,0.10)'}`,
                boxShadow: isDark ? '0 2px 20px rgba(0,0,0,0.35)' : '0 2px 16px rgba(99,102,241,0.06)',
              }}
            >
              {activeRecurringIncome.map((ri, i) => (
                <button
                  key={ri.id}
                  onClick={onNavigateRecurringIncome}
                  className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left cursor-pointer active:scale-[0.99] transition-transform"
                  style={{
                    borderBottomWidth: i < activeRecurringIncome.length - 1 ? 1 : 0,
                    borderBottomStyle: 'solid',
                    borderBottomColor: colors.divider,
                    background: 'transparent',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.22)' }}
                  >
                    <TrendingUp size={17} style={{ color: '#22c55e' }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: colors.textPrimary }}>
                      {ri.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <RefreshCw size={10} style={{ color: colors.textMuted }} />
                      <p className="text-[11px]" style={{ color: colors.textMuted }}>
                        {freqLabel(ri.frequency)} · {ri.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-[14px] font-bold" style={{ color: '#22c55e', fontFeatureSettings: '"tnum"' }}>
                        {formatCurrency(ri.amount, currency)}
                      </p>
                      <p className="text-[10px]" style={{ color: colors.textMuted }}>
                        {formatCurrency(monthlyAmount(ri.amount, ri.frequency), currency)}/mo
                      </p>
                    </div>
                    <ChevronRight size={13} style={{ color: colors.textMuted }} />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={onNavigateRecurringIncome}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl cursor-pointer"
              style={{
                background: 'rgba(34,197,94,0.06)',
                border: '1px dashed rgba(34,197,94,0.22)',
                color: '#22c55e',
                fontSize: 13, fontWeight: 600,
              }}
            >
              <Plus size={15} /> Add Recurring Income
            </button>
          )
        ) : (
          activeSubscriptions.length > 0 ? (
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: isDark ? colors.bgCard : '#ffffff',
                border: `1px solid ${isDark ? colors.border : 'rgba(99,102,241,0.10)'}`,
                boxShadow: isDark ? '0 2px 20px rgba(0,0,0,0.35)' : '0 2px 16px rgba(99,102,241,0.06)',
              }}
            >
              {activeSubscriptions.map((sub, i) => (
                <button
                  key={sub.id}
                  onClick={onNavigateRecurring}
                  className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left cursor-pointer active:scale-[0.99] transition-transform"
                  style={{
                    borderBottomWidth: i < activeSubscriptions.length - 1 ? 1 : 0,
                    borderBottomStyle: 'solid',
                    borderBottomColor: colors.divider,
                    background: 'transparent',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.20)' }}
                  >
                    <RefreshCw size={17} style={{ color: '#f87171' }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: colors.textPrimary }}>
                      {sub.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <RefreshCw size={10} style={{ color: colors.textMuted }} />
                      <p className="text-[11px]" style={{ color: colors.textMuted }}>
                        {freqLabel(sub.frequency)} · {sub.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-[14px] font-bold" style={{ color: '#f87171', fontFeatureSettings: '"tnum"' }}>
                        {formatCurrency(sub.amount, currency)}
                      </p>
                      <p className="text-[10px]" style={{ color: colors.textMuted }}>
                        {formatCurrency(monthlyAmount(sub.amount, sub.frequency), currency)}/mo
                      </p>
                    </div>
                    <ChevronRight size={13} style={{ color: colors.textMuted }} />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={onNavigateRecurring}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl cursor-pointer"
              style={{
                background: 'rgba(248,113,113,0.06)',
                border: '1px dashed rgba(248,113,113,0.22)',
                color: '#f87171',
                fontSize: 13, fontWeight: 600,
              }}
            >
              <Plus size={15} /> Add Recurring Expense
            </button>
          )
        )}
      </div>

    </div>
  );
};
