import React, { useState, useMemo } from 'react';
import {
  Wallet, Plus, Edit2, Trash2, Check, X, AlertTriangle, ChevronRight,
  RefreshCw, Target, TrendingUp,
} from 'lucide-react';
import { Transaction, CategoryLimit, EXPENSE_CATEGORIES } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon, getCategoryColor } from './CategoryIcon';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';

interface BudgetScreenProps {
  monthlyBudget: number;
  categoryLimits: CategoryLimit[];
  transactions: Transaction[];
  currency: string;
  onSaveBudget: (amount: number) => void;
  onSaveLimits: (limits: CategoryLimit[]) => void;
  onNavigateRecurring: () => void;
  onNavigateRecurringIncome: () => void;
  onNavigateSavings: () => void;
}

function getMonthPrefix() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
}

function getProgressColor(pct: number): string {
  if (pct >= 100) return '#ef4444';
  if (pct >= 80) return '#f97316';
  if (pct >= 60) return '#f59e0b';
  return '#10b981';
}

export const BudgetScreen: React.FC<BudgetScreenProps> = ({
  monthlyBudget, categoryLimits, transactions, currency,
  onSaveBudget, onSaveLimits, onNavigateRecurring, onNavigateRecurringIncome, onNavigateSavings,
}) => {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const [editBudget, setEditBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(monthlyBudget > 0 ? String(monthlyBudget) : '');

  const [showAddLimit, setShowAddLimit] = useState(false);
  const [editingLimit, setEditingLimit] = useState<CategoryLimit | null>(null);
  const [limitCategory, setLimitCategory] = useState(EXPENSE_CATEGORIES[0].name);
  const [limitAmount, setLimitAmount] = useState('');
  const [limitError, setLimitError] = useState('');

  const prefix = getMonthPrefix();
  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const { thisMonthExpenses, categorySpend } = useMemo(() => {
    let total = 0;
    const byCategory: Record<string, number> = {};
    transactions.filter(tx => tx.type === 'expense' && tx.date.startsWith(prefix)).forEach(tx => {
      total += tx.amount;
      byCategory[tx.category] = (byCategory[tx.category] || 0) + tx.amount;
    });
    return { thisMonthExpenses: total, categorySpend: byCategory };
  }, [transactions, prefix]);

  const budgetPct = monthlyBudget > 0 ? (thisMonthExpenses / monthlyBudget) * 100 : 0;
  const budgetRemaining = monthlyBudget - thisMonthExpenses;
  const budgetColor = getProgressColor(budgetPct);

  const arcR = 52;
  const arcCircumference = 2 * Math.PI * arcR;
  const arcOffset = arcCircumference * (1 - Math.min(budgetPct, 100) / 100);

  const handleSaveBudget = () => {
    const v = parseFloat(budgetInput);
    if (!isNaN(v) && v > 0) { onSaveBudget(v); setEditBudget(false); }
  };

  const handleAddLimit = () => {
    setLimitError('');
    const v = parseFloat(limitAmount);
    if (isNaN(v) || v <= 0) { setLimitError('Enter a valid amount.'); return; }
    const exists = categoryLimits.some(l => l.category === limitCategory && l.category !== editingLimit?.category);
    if (exists) { setLimitError('A limit for this category already exists.'); return; }
    if (editingLimit) {
      onSaveLimits(categoryLimits.map(l => l.category === editingLimit.category ? { category: limitCategory, limit: v } : l));
    } else {
      onSaveLimits([...categoryLimits, { category: limitCategory, limit: v }]);
    }
    setShowAddLimit(false);
    setEditingLimit(null);
    setLimitCategory(EXPENSE_CATEGORIES[0].name);
    setLimitAmount('');
  };

  const handleDeleteLimit = (cat: string) => {
    onSaveLimits(categoryLimits.filter(l => l.category !== cat));
  };

  const openEditLimit = (l: CategoryLimit) => {
    setEditingLimit(l);
    setLimitCategory(l.category);
    setLimitAmount(String(l.limit));
    setLimitError('');
    setShowAddLimit(true);
  };

  const cancelAddLimit = () => {
    setShowAddLimit(false);
    setEditingLimit(null);
    setLimitCategory(EXPENSE_CATEGORIES[0].name);
    setLimitAmount('');
    setLimitError('');
  };

  const availableCats = EXPENSE_CATEGORIES.filter(
    c => !categoryLimits.some(l => l.category === c.name) || editingLimit?.category === c.name
  );

  return (
    <div className="page-enter px-4 pt-3 pb-8 space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>{monthLabel}</p>
          <h2 className="text-xl font-bold mt-0.5" style={{ color: colors.textPrimary }}>{t('budget')}</h2>
        </div>
      </div>

      {/* ── MONTHLY BUDGET ── */}
      <div className="card-dark rounded-3xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: colors.accentSoft, border: `1px solid ${colors.accent}30` }}>
              <Wallet size={17} style={{ color: colors.accent }} />
            </div>
            <p className="text-sm font-bold" style={{ color: colors.textPrimary }}>{t('monthlyBudgetLabel')}</p>
          </div>
          <button
            onClick={() => { setEditBudget(v => !v); setBudgetInput(monthlyBudget > 0 ? String(monthlyBudget) : ''); }}
            className="text-xs font-semibold cursor-pointer px-2 py-1 rounded-lg"
            style={{ background: colors.accentSoft, color: colors.accent }}
          >
            {monthlyBudget > 0 ? t('edit') : t('setBudget')}
          </button>
        </div>

        {editBudget ? (
          <div className="space-y-3">
            <input
              type="number"
              placeholder={t('monthlyBudgetLabel') + '...'}
              value={budgetInput}
              onChange={e => setBudgetInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveBudget()}
              className="input-dark w-full px-4 py-3 rounded-xl text-base font-bold"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={handleSaveBudget}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold btn-primary cursor-pointer flex items-center justify-center gap-1.5">
                <Check size={15} /> {t('save')}
              </button>
              <button onClick={() => setEditBudget(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
                style={{ background: colors.bgSecondary, color: colors.textSecondary }}>
                {t('cancel')}
              </button>
            </div>
          </div>
        ) : monthlyBudget > 0 ? (
          <div>
            {/* Arc progress ring */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative" style={{ width: 120, height: 120 }}>
                <svg width={120} height={120} style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx={60} cy={60} r={arcR} fill="none"
                    stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} strokeWidth={10} />
                  <circle cx={60} cy={60} r={arcR} fill="none"
                    stroke={budgetColor} strokeWidth={10} strokeLinecap="round"
                    strokeDasharray={arcCircumference}
                    strokeDashoffset={arcOffset}
                    style={{ filter: `drop-shadow(0 0 6px ${budgetColor}70)`, transition: 'stroke-dashoffset 1.1s cubic-bezier(0.34,1.2,0.64,1)' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold leading-none" style={{ color: budgetColor }}>
                    {Math.min(budgetPct, 999).toFixed(0)}%
                  </span>
                  <span className="text-[10px] font-semibold mt-1" style={{ color: colors.textMuted }}>{t('usedLabel')}</span>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: t('budget'), value: formatCurrency(monthlyBudget, currency), color: colors.textPrimary },
                { label: t('usedLabel'), value: formatCurrency(thisMonthExpenses, currency), color: '#f87171' },
                {
                  label: budgetRemaining < 0 ? t('overBudget') : t('remaining'),
                  value: formatCurrency(Math.abs(budgetRemaining), currency),
                  color: budgetRemaining < 0 ? '#ef4444' : '#22c55e',
                },
              ].map(stat => (
                <div key={stat.label} className="rounded-2xl p-2.5 text-center"
                  style={{ background: colors.bgSecondary, border: `1px solid ${colors.borderStrong}` }}>
                  <p className="text-[9px] uppercase tracking-wide font-bold mb-1" style={{ color: colors.textMuted }}>{stat.label}</p>
                  <p className="text-xs font-bold" style={{ color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </div>

            {budgetPct >= 80 && (
              <p className="text-[11px] flex items-center gap-1"
                style={{ color: budgetPct >= 100 ? '#ef4444' : '#f97316' }}>
                <AlertTriangle size={12} />
                {budgetPct >= 100 ? t('overBudget') : `${(100 - budgetPct).toFixed(0)}% ${t('remaining')}`}
              </p>
            )}
          </div>
        ) : (
          <div
            className="rounded-2xl p-5 text-center"
            style={{
              background: colors.accentSoft,
              border: `1px solid ${colors.accent}25`,
            }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: colors.accentSoft, border: `1px solid ${colors.accent}30` }}>
              <Wallet size={20} style={{ color: colors.accent }} />
            </div>
            <p className="text-sm font-bold mb-1" style={{ color: colors.textPrimary }}>{t('noBudgetSet')}</p>
            <p className="text-xs leading-relaxed" style={{ color: colors.textSecondary }}>{t('setBudgetHint')}</p>
          </div>
        )}
      </div>

      {/* ── CATEGORY BUDGETS ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>{t('categoryLimitsTitle')}</p>
          {!showAddLimit && (
            <button
              onClick={() => { setShowAddLimit(true); setEditingLimit(null); setLimitCategory(availableCats[0]?.name || ''); setLimitAmount(''); }}
              className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer px-2 py-1 rounded-lg"
              style={{ background: colors.accentSoft, color: colors.accent }}
            >
              <Plus size={13} /> {t('addCategoryLimit')}
            </button>
          )}
        </div>

        {/* Add / Edit form */}
        {showAddLimit && (
          <div className="card-dark rounded-2xl p-4 mb-3 space-y-3">
            <p className="text-sm font-bold" style={{ color: colors.textPrimary }}>{editingLimit ? t('editCategoryLimit') : t('addCategoryLimit')}</p>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: colors.textSecondary }}>{t('categoryLabel')}</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(editingLimit ? EXPENSE_CATEGORIES : availableCats).map(c => {
                  const color = getCategoryColor(c.name, 'expense');
                  return (
                    <button
                      key={c.name}
                      onClick={() => setLimitCategory(c.name)}
                      className="flex items-center gap-1.5 px-2 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                      style={limitCategory === c.name
                        ? { background: `${color}20`, border: `1px solid ${color}50`, color }
                        : { background: colors.bgSecondary, border: `1px solid ${colors.borderStrong}`, color: colors.textSecondary }}
                    >
                      <CategoryIcon category={c.name} type="expense" size={12} />
                      <span className="truncate">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: colors.textSecondary }}>{t('amountLabel')} ({currency})</label>
              <input
                type="number"
                placeholder="0.00"
                value={limitAmount}
                onChange={e => setLimitAmount(e.target.value)}
                className="input-dark w-full px-3 py-2.5 rounded-xl text-sm"
                autoFocus
              />
            </div>
            {limitError && <p className="text-xs text-red-400 flex items-center gap-1"><AlertTriangle size={12} />{limitError}</p>}
            <div className="flex gap-2">
              <button onClick={handleAddLimit}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold btn-primary cursor-pointer flex items-center justify-center gap-1.5">
                <Check size={15} /> {editingLimit ? t('save') : t('add')}
              </button>
              <button onClick={cancelAddLimit}
                className="px-4 py-2.5 rounded-xl text-sm cursor-pointer"
                style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}`, color: colors.textMuted }}>
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {categoryLimits.length === 0 && !showAddLimit ? (
          <div className="card-dark rounded-2xl px-4 py-5 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: colors.accentSoft, border: `1px solid ${colors.accent}25` }}>
              <Target size={17} style={{ color: colors.accent }} />
            </div>
            <div>
              <p className="text-sm font-bold mb-1" style={{ color: colors.textPrimary }}>{t('categoryLimitsTitle')}</p>
              <p className="text-xs leading-relaxed" style={{ color: colors.textSecondary }}>{t('noLimitsSet')}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {categoryLimits.map(limit => {
              const spent = categorySpend[limit.category] || 0;
              const pct = limit.limit > 0 ? (spent / limit.limit) * 100 : 0;
              const color = getCategoryColor(limit.category, 'expense');
              const barColor = getProgressColor(pct);
              const remaining = limit.limit - spent;

              return (
                <div key={limit.category} className="card-dark rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}18`, border: `1px solid ${color}28`, color }}>
                        <CategoryIcon category={limit.category} type="expense" size={15} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{limit.category}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: colors.textMuted }}>
                          {formatCurrency(spent, currency)} / {formatCurrency(limit.limit, currency)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditLimit(limit)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
                        style={{ color: colors.textMuted }}>
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDeleteLimit(limit.category)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
                        style={{ color: colors.textMuted }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden mb-1.5" style={{ background: colors.bgSecondary }}>
                    <div className="h-full rounded-full"
                      style={{
                        width: `${Math.min(pct, 100)}%`,
                        background: barColor,
                        boxShadow: `0 0 5px ${barColor}50`,
                      }} />
                  </div>
                  <p className="text-[11px] font-medium" style={{ color: remaining < 0 ? '#ef4444' : pct >= 90 ? '#f97316' : colors.textMuted }}>
                    {remaining >= 0
                      ? pct >= 90 ? `⚠ Only ${formatCurrency(remaining, currency)} left` : `${formatCurrency(remaining, currency)} remaining`
                      : `${formatCurrency(Math.abs(remaining), currency)} over limit`}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── QUICK LINKS ── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: colors.textMuted }}>{t('moreTitle')}</p>
        <div className="card-dark rounded-2xl overflow-hidden">
          <button
            onClick={onNavigateRecurring}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-colors cursor-pointer"
            style={{ borderBottom: `1px solid ${colors.divider}` }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: colors.brandSoft, border: `1px solid ${colors.brand}25` }}>
              <RefreshCw size={17} style={{ color: colors.brand }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{t('recurringPaymentsTitle')}</p>
              <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>{t('recurringPaymentsDesc')}</p>
            </div>
            <ChevronRight size={15} style={{ color: colors.textMuted }} />
          </button>

          <button
            onClick={onNavigateRecurringIncome}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-colors cursor-pointer"
            style={{ borderBottom: `1px solid ${colors.divider}` }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.22)' }}>
              <TrendingUp size={17} style={{ color: '#22c55e' }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>Recurring Income</p>
              <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>Salary, freelance & regular income sources</p>
            </div>
            <ChevronRight size={15} style={{ color: colors.textMuted }} />
          </button>

          <button
            onClick={onNavigateSavings}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.22)' }}>
              <Target size={17} style={{ color: '#22c55e' }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{t('savingGoalsTitle')}</p>
              <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>{t('savingGoalsDesc')}</p>
            </div>
            <ChevronRight size={15} style={{ color: colors.textMuted }} />
          </button>
        </div>
      </div>

    </div>
  );
};
