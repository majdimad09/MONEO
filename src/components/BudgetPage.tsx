import React, { useState, useMemo } from 'react';
import { Target, Edit2, Plus, Trash2, AlertTriangle, CheckCircle2, X, Wallet } from 'lucide-react';
import { Transaction, CategoryLimit, EXPENSE_CATEGORIES } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { getCategoryColor } from './CategoryIcon';
import { useTheme } from '../context/ThemeContext';

interface BudgetPageProps {
  transactions: Transaction[];
  currency: string;
  monthlyBudget: number;
  categoryLimits: CategoryLimit[];
  onSaveBudget: (amount: number) => void;
  onSaveLimits: (limits: CategoryLimit[]) => void;
}

function getCurrentMonthPrefix(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getCurrentMonthLabel(): string {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getProgressColor(pct: number): string {
  if (pct >= 100) return '#ef4444';
  if (pct >= 80)  return '#f97316';
  if (pct >= 60)  return '#eab308';
  return '#10b981';
}

export const BudgetPage: React.FC<BudgetPageProps> = ({
  transactions, currency, monthlyBudget, categoryLimits, onSaveBudget, onSaveLimits,
}) => {
  const { isDark, colors } = useTheme();
  const [editingBudget, setEditingBudget]     = useState(false);
  const [budgetInput, setBudgetInput]         = useState('');
  const [showAddLimit, setShowAddLimit]       = useState(false);
  const [limitCategory, setLimitCategory]     = useState('Food');
  const [limitAmount, setLimitAmount]         = useState('');
  const [editingLimit, setEditingLimit]       = useState<string | null>(null);
  const [editLimitAmount, setEditLimitAmount] = useState('');

  const prefix = getCurrentMonthPrefix();

  const currentMonthExpenses = useMemo(() =>
    transactions.filter(t => t.type === 'expense' && t.date.startsWith(prefix)),
    [transactions, prefix]
  );

  const totalSpentThisMonth = useMemo(() =>
    currentMonthExpenses.reduce((s, t) => s + t.amount, 0),
    [currentMonthExpenses]
  );

  const budgetPct       = monthlyBudget > 0 ? (totalSpentThisMonth / monthlyBudget) * 100 : 0;
  const budgetRemaining = monthlyBudget - totalSpentThisMonth;
  const progressColor   = getProgressColor(budgetPct);

  const categorySpend = useMemo(() => {
    const map: Record<string, number> = {};
    currentMonthExpenses.forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return map;
  }, [currentMonthExpenses]);

  const allCategories = useMemo(() => {
    const limitCats = new Set(categoryLimits.map(l => l.category));
    const spendCats = Object.keys(categorySpend);
    return Array.from(new Set([...limitCats, ...spendCats])).sort();
  }, [categoryLimits, categorySpend]);

  const handleSaveBudget = () => {
    const v = parseFloat(budgetInput);
    if (!isNaN(v) && v > 0) { onSaveBudget(v); setEditingBudget(false); }
  };

  const handleAddLimit = () => {
    const v = parseFloat(limitAmount);
    if (!limitCategory || isNaN(v) || v <= 0) return;
    const updated = categoryLimits.filter(l => l.category !== limitCategory);
    onSaveLimits([...updated, { category: limitCategory, limit: v }]);
    setShowAddLimit(false); setLimitAmount(''); setLimitCategory('Food');
  };

  const handleEditLimit = (cat: string) => {
    const current = categoryLimits.find(l => l.category === cat);
    setEditingLimit(cat);
    setEditLimitAmount(current ? current.limit.toString() : '');
  };

  const handleSaveEditLimit = () => {
    if (!editingLimit) return;
    const v = parseFloat(editLimitAmount);
    if (isNaN(v) || v <= 0) { setEditingLimit(null); return; }
    const updated = categoryLimits.filter(l => l.category !== editingLimit);
    onSaveLimits([...updated, { category: editingLimit, limit: v }]);
    setEditingLimit(null);
  };

  const handleRemoveLimit = (cat: string) => {
    onSaveLimits(categoryLimits.filter(l => l.category !== cat));
  };

  const categoriesWithLimits = categoryLimits.map(l => l.category);
  const availableForAdd      = EXPENSE_CATEGORIES.map(c => c.name).filter(n => !categoriesWithLimits.includes(n));

  const cardStyle = {
    background: isDark ? colors.bgCard : '#ffffff',
    border: `1px solid ${isDark ? colors.border : 'rgba(99,102,241,0.10)'}`,
    boxShadow: isDark ? 'none' : '0 2px 16px rgba(99,102,241,0.06)',
  };

  return (
    <div className="page-enter px-4 pt-5 pb-8 space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold" style={{ color: colors.textPrimary, letterSpacing: '-0.02em' }}>Budget</h2>
        <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{getCurrentMonthLabel()}</p>
      </div>

      {/* Monthly Budget Card */}
      <div className="rounded-3xl p-5" style={cardStyle}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4338ca, #6366f1)', boxShadow: '0 4px 14px rgba(99,102,241,0.32)' }}
            >
              <Wallet size={18} color="#ffffff" />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: colors.textPrimary }}>Monthly Budget</p>
              <p className="text-xs" style={{ color: colors.textMuted }}>{getCurrentMonthLabel()}</p>
            </div>
          </div>
          <button
            onClick={() => { setEditingBudget(true); setBudgetInput(monthlyBudget > 0 ? monthlyBudget.toString() : ''); }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all"
            style={{
              background: 'rgba(99,102,241,0.10)',
              border: '1px solid rgba(99,102,241,0.20)',
              color: '#6366f1',
            }}
          >
            <Edit2 size={12} />
            {monthlyBudget > 0 ? 'Edit' : 'Set Budget'}
          </button>
        </div>

        {editingBudget && (
          <div className="mb-4 flex items-center gap-2">
            <input
              type="number"
              placeholder="Enter monthly budget..."
              value={budgetInput}
              onChange={e => setBudgetInput(e.target.value)}
              className="input-dark flex-1 px-3 py-2.5 rounded-xl text-sm font-medium"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSaveBudget()}
            />
            <button onClick={handleSaveBudget} className="btn-primary px-4 py-2 rounded-xl text-sm cursor-pointer">Save</button>
            <button
              onClick={() => setEditingBudget(false)}
              className="p-2 rounded-xl cursor-pointer transition-colors"
              style={{ color: colors.textMuted, background: colors.bgSecondary }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {monthlyBudget > 0 ? (
          <>
            {/* 3-column stat grid — inspired by reference's horizontal stats row */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Budget', value: formatCurrency(monthlyBudget, currency), grad: 'linear-gradient(135deg,#4338ca,#6366f1)', shadow: 'rgba(99,102,241,0.30)' },
                { label: 'Spent',  value: formatCurrency(totalSpentThisMonth, currency), grad: 'linear-gradient(135deg,#b91c1c,#ef4444)', shadow: 'rgba(239,68,68,0.28)' },
                { label: 'Left',   value: formatCurrency(Math.abs(budgetRemaining), currency), grad: budgetRemaining >= 0 ? 'linear-gradient(135deg,#047857,#10b981)' : 'linear-gradient(135deg,#b91c1c,#ef4444)', shadow: budgetRemaining >= 0 ? 'rgba(16,185,129,0.28)' : 'rgba(239,68,68,0.28)' },
              ].map(({ label, value, grad, shadow }) => (
                <div
                  key={label}
                  className="rounded-2xl p-3 text-center"
                  style={{ background: grad, boxShadow: `0 4px 16px ${shadow}`, border: '1.5px solid rgba(255,255,255,0.16)' }}
                >
                  <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.70)' }}>{label}</p>
                  <p className="text-[13px] font-bold text-white" style={{ fontFeatureSettings: '"tnum"', letterSpacing: '-0.02em' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mb-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: colors.textMuted }}>{budgetPct.toFixed(1)}% used</span>
                {budgetRemaining < 0
                  ? <span className="text-xs font-bold flex items-center gap-1" style={{ color: '#ef4444' }}><AlertTriangle size={11} />Budget exceeded</span>
                  : budgetPct >= 80
                  ? <span className="text-xs font-bold flex items-center gap-1" style={{ color: '#f97316' }}><AlertTriangle size={11} />Approaching limit</span>
                  : <span className="text-xs font-bold flex items-center gap-1" style={{ color: '#10b981' }}><CheckCircle2 size={11} />On track</span>
                }
              </div>
              <div
                className="h-3 rounded-full overflow-hidden"
                style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(99,102,241,0.08)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(budgetPct, 100)}%`,
                    background: `linear-gradient(90deg, ${progressColor}cc, ${progressColor})`,
                    boxShadow: `0 0 10px ${progressColor}55`,
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm" style={{ color: colors.textMuted }}>No budget set. Click "Set Budget" to get started.</p>
          </div>
        )}
      </div>

      {/* Category Limits */}
      <div className="rounded-3xl p-5" style={cardStyle}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-bold text-sm" style={{ color: colors.textPrimary }}>Category Spending Limits</p>
            <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>Set per-category budgets</p>
          </div>
          <button
            onClick={() => setShowAddLimit(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all"
            style={{
              background: 'rgba(16,185,129,0.10)',
              border: '1px solid rgba(16,185,129,0.22)',
              color: colors.accent,
            }}
          >
            <Plus size={12} />
            Add Limit
          </button>
        </div>

        {/* Add Limit Form */}
        {showAddLimit && (
          <div
            className="mb-5 p-4 rounded-2xl flex flex-col sm:flex-row gap-2.5"
            style={{ background: isDark ? colors.bgSecondary : 'rgba(99,102,241,0.05)', border: `1px solid ${isDark ? colors.border : 'rgba(99,102,241,0.12)'}` }}
          >
            <select
              value={limitCategory}
              onChange={e => setLimitCategory(e.target.value)}
              className="input-dark flex-1 px-3 py-2.5 rounded-xl text-sm"
            >
              {(availableForAdd.length > 0 ? availableForAdd : EXPENSE_CATEGORIES.map(c => c.name)).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Limit amount"
              value={limitAmount}
              onChange={e => setLimitAmount(e.target.value)}
              className="input-dark px-3 py-2.5 rounded-xl text-sm w-36"
              onKeyDown={e => e.key === 'Enter' && handleAddLimit()}
            />
            <button onClick={handleAddLimit} className="btn-primary px-4 py-2.5 rounded-xl text-sm cursor-pointer">Add</button>
            <button
              onClick={() => setShowAddLimit(false)}
              className="p-2.5 rounded-xl cursor-pointer"
              style={{ color: colors.textMuted, background: colors.bgSecondary }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {allCategories.length === 0 ? (
          <div className="py-8 text-center">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'rgba(99,102,241,0.10)' }}
            >
              <Target size={22} style={{ color: '#6366f1' }} />
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: colors.textPrimary }}>No limits set yet</p>
            <p className="text-xs" style={{ color: colors.textMuted }}>Add spending limits to track category budgets.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allCategories.map(cat => {
              const spent    = categorySpend[cat] || 0;
              const limitObj = categoryLimits.find(l => l.category === cat);
              const limit    = limitObj?.limit || 0;
              const pct      = limit > 0 ? (spent / limit) * 100 : 0;
              const catColor = getCategoryColor(cat, 'expense');
              const pColor   = getProgressColor(pct);

              return (
                <div
                  key={cat}
                  className="rounded-2xl p-4"
                  style={{
                    background: isDark ? `${catColor}0c` : `${catColor}07`,
                    border: `1px solid ${catColor}20`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: catColor, boxShadow: `0 0 8px ${catColor}55` }}
                      />
                      <span className="text-sm font-bold" style={{ color: colors.textPrimary }}>{cat}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {limit > 0 ? (
                        editingLimit === cat ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={editLimitAmount}
                              onChange={e => setEditLimitAmount(e.target.value)}
                              className="input-dark px-2 py-1.5 rounded-lg text-xs w-24"
                              onKeyDown={e => e.key === 'Enter' && handleSaveEditLimit()}
                              autoFocus
                            />
                            <button onClick={handleSaveEditLimit} className="btn-primary px-2.5 py-1.5 rounded-lg text-xs cursor-pointer">OK</button>
                            <button
                              onClick={() => setEditingLimit(null)}
                              style={{ color: colors.textMuted }}
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-xs font-semibold" style={{ color: colors.textSecondary, fontFeatureSettings: '"tnum"' }}>
                              {formatCurrency(spent, currency)} / {formatCurrency(limit, currency)}
                            </span>
                            <button
                              onClick={() => handleEditLimit(cat)}
                              className="p-1.5 rounded-lg transition-colors cursor-pointer"
                              style={{ color: colors.textMuted, background: 'transparent' }}
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleRemoveLimit(cat)}
                              className="p-1.5 rounded-lg transition-colors cursor-pointer"
                              style={{ color: colors.negative }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </>
                        )
                      ) : (
                        <>
                          <span className="text-xs" style={{ color: colors.textMuted }}>{formatCurrency(spent, currency)} spent</span>
                          <button
                            onClick={() => { setShowAddLimit(false); setLimitCategory(cat); setShowAddLimit(true); }}
                            className="text-xs font-bold cursor-pointer"
                            style={{ color: colors.accent }}
                          >
                            + Set limit
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {limit > 0 && (
                    <>
                      <div
                        className="h-2 rounded-full overflow-hidden"
                        style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            background: `linear-gradient(90deg, ${pColor}99, ${pColor})`,
                            boxShadow: `0 0 8px ${pColor}50`,
                          }}
                        />
                      </div>
                      {pct >= 90 && pct < 100 && (
                        <p className="text-[11px] font-semibold flex items-center gap-1 mt-1.5" style={{ color: '#f97316' }}>
                          <AlertTriangle size={11} />
                          {pct.toFixed(0)}% used — approaching limit
                        </p>
                      )}
                      {pct >= 100 && (
                        <p className="text-[11px] font-semibold flex items-center gap-1 mt-1.5" style={{ color: '#ef4444' }}>
                          <AlertTriangle size={11} />
                          Exceeded by {formatCurrency(spent - limit, currency)}
                        </p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
