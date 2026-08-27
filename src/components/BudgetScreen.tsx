import React, { useState, useMemo } from 'react';
import {
  Wallet, Plus, Edit2, Trash2, Check, X, AlertTriangle, ChevronRight,
  RefreshCw, Target, TrendingUp,
} from 'lucide-react';
import { Transaction, CategoryLimit, EXPENSE_CATEGORIES } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon, getCategoryColor } from './CategoryIcon';

interface BudgetScreenProps {
  monthlyBudget: number;
  categoryLimits: CategoryLimit[];
  transactions: Transaction[];
  currency: string;
  onSaveBudget: (amount: number) => void;
  onSaveLimits: (limits: CategoryLimit[]) => void;
  onNavigateRecurring: () => void;
  onNavigateSavings: () => void;
}

function getMonthPrefix() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
}

function getProgressColor(pct: number): string {
  if (pct >= 100) return '#ef4444';
  if (pct >= 80) return '#f97316';
  if (pct >= 60) return '#eab308';
  return '#3b82f6';
}

export const BudgetScreen: React.FC<BudgetScreenProps> = ({
  monthlyBudget, categoryLimits, transactions, currency,
  onSaveBudget, onSaveLimits, onNavigateRecurring, onNavigateSavings,
}) => {
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
    transactions.filter(t => t.type === 'expense' && t.date.startsWith(prefix)).forEach(t => {
      total += t.amount;
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });
    return { thisMonthExpenses: total, categorySpend: byCategory };
  }, [transactions, prefix]);

  const budgetPct = monthlyBudget > 0 ? (thisMonthExpenses / monthlyBudget) * 100 : 0;
  const budgetRemaining = monthlyBudget - thisMonthExpenses;
  const budgetColor = getProgressColor(budgetPct);

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
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{monthLabel}</p>
          <h2 className="text-xl font-bold text-white mt-0.5">Budget</h2>
        </div>
      </div>

      {/* ── MONTHLY BUDGET ───────────────────────────── */}
      <div className="card-dark rounded-3xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <Wallet size={17} className="text-blue-400" />
            </div>
            <p className="text-sm font-bold text-slate-200">Monthly Budget</p>
          </div>
          <button
            onClick={() => { setEditBudget(v => !v); setBudgetInput(monthlyBudget > 0 ? String(monthlyBudget) : ''); }}
            className="text-xs font-semibold text-blue-400 cursor-pointer px-2 py-1 rounded-lg"
            style={{ background: 'rgba(59,130,246,0.08)' }}
          >
            {monthlyBudget > 0 ? 'Edit' : 'Set Budget'}
          </button>
        </div>

        {editBudget ? (
          <div className="space-y-3">
            <input
              type="number"
              placeholder="Monthly budget amount..."
              value={budgetInput}
              onChange={e => setBudgetInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveBudget()}
              className="input-dark w-full px-4 py-3 rounded-xl text-base font-bold"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={handleSaveBudget}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold btn-blue cursor-pointer flex items-center justify-center gap-1.5">
                <Check size={15} /> Save
              </button>
              <button onClick={() => setEditBudget(false)}
                className="px-4 py-2.5 rounded-xl text-sm text-slate-400 cursor-pointer"
                style={{ background: '#16161f' }}>
                Cancel
              </button>
            </div>
          </div>
        ) : monthlyBudget > 0 ? (
          <div>
            {/* Numbers */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-2xl p-3 text-center" style={{ background: '#111118', border: '1px solid #242434' }}>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide font-bold mb-1">Budget</p>
                <p className="text-sm font-bold text-white">{formatCurrency(monthlyBudget, currency)}</p>
              </div>
              <div className="rounded-2xl p-3 text-center" style={{ background: '#111118', border: '1px solid #242434' }}>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide font-bold mb-1">Spent</p>
                <p className="text-sm font-bold text-red-400">{formatCurrency(thisMonthExpenses, currency)}</p>
              </div>
              <div className="rounded-2xl p-3 text-center"
                style={{ background: budgetRemaining < 0 ? 'rgba(239,68,68,0.08)' : '#111118', border: `1px solid ${budgetRemaining < 0 ? 'rgba(239,68,68,0.2)' : '#242434'}` }}>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide font-bold mb-1">{budgetRemaining < 0 ? 'Over' : 'Left'}</p>
                <p className="text-sm font-bold" style={{ color: budgetRemaining < 0 ? '#ef4444' : '#34d399' }}>
                  {formatCurrency(Math.abs(budgetRemaining), currency)}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-slate-500">Budget used</span>
              <span className="text-[11px] font-bold" style={{ color: budgetColor }}>{Math.min(budgetPct, 999).toFixed(0)}%</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: '#111118' }}>
              <div className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(budgetPct, 100)}%`,
                  background: budgetColor,
                  boxShadow: `0 0 8px ${budgetColor}50`,
                }} />
            </div>
            {budgetPct >= 80 && (
              <p className="text-[11px] mt-2 flex items-center gap-1"
                style={{ color: budgetPct >= 100 ? '#ef4444' : '#f97316' }}>
                <AlertTriangle size={12} />
                {budgetPct >= 100 ? 'Over budget this month' : `Approaching limit — ${(100 - budgetPct).toFixed(0)}% remaining`}
              </p>
            )}
          </div>
        ) : (
          <div
            className="rounded-2xl p-5 text-center"
            style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'rgba(59,130,246,0.12)' }}>
              <Wallet size={20} className="text-blue-400" />
            </div>
            <p className="text-sm font-bold text-slate-300 mb-1">No monthly budget yet</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Set a total monthly budget to see how much of your income you're spending — and get a clear safe-to-spend number each day.
            </p>
          </div>
        )}
      </div>

      {/* ── CATEGORY BUDGETS ─────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Category Budgets</p>
          {!showAddLimit && (
            <button
              onClick={() => { setShowAddLimit(true); setEditingLimit(null); setLimitCategory(availableCats[0]?.name || ''); setLimitAmount(''); }}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 cursor-pointer px-2 py-1 rounded-lg"
              style={{ background: 'rgba(59,130,246,0.08)' }}
            >
              <Plus size={13} /> Add
            </button>
          )}
        </div>

        {/* Add / Edit form */}
        {showAddLimit && (
          <div className="card-dark rounded-2xl p-4 mb-3 space-y-3">
            <p className="text-sm font-bold text-slate-200">{editingLimit ? 'Edit Category Budget' : 'New Category Budget'}</p>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 block mb-1.5">Category</label>
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
                        : { background: '#111118', border: '1px solid #242434', color: '#475569' }}
                    >
                      <CategoryIcon category={c.name} type="expense" size={12} />
                      <span className="truncate">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 block mb-1.5">Monthly Limit ({currency})</label>
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
                className="flex-1 py-2.5 rounded-xl text-sm font-bold btn-blue cursor-pointer flex items-center justify-center gap-1.5">
                <Check size={15} /> {editingLimit ? 'Save' : 'Add'}
              </button>
              <button onClick={cancelAddLimit}
                className="px-4 py-2.5 rounded-xl text-sm text-slate-400 cursor-pointer"
                style={{ background: '#16161f' }}>
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {categoryLimits.length === 0 && !showAddLimit ? (
          <div className="card-dark rounded-2xl px-4 py-5 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: 'rgba(96,165,250,0.1)' }}>
              <Target size={17} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-300 mb-1">Per-category spending limits</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cap spending on Food, Transport, Entertainment, and more. Get alerted when you're getting close.
              </p>
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
                        <p className="text-sm font-semibold text-slate-200">{limit.category}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {formatCurrency(spent, currency)} / {formatCurrency(limit.limit, currency)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditLimit(limit)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-blue-400 transition-colors cursor-pointer">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDeleteLimit(limit.category)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 transition-colors cursor-pointer">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden mb-1.5" style={{ background: '#111118' }}>
                    <div className="h-full rounded-full"
                      style={{
                        width: `${Math.min(pct, 100)}%`,
                        background: barColor,
                        boxShadow: `0 0 5px ${barColor}50`,
                      }} />
                  </div>
                  <p className={`text-[11px] font-medium ${remaining < 0 ? 'text-red-400' : pct >= 90 ? 'text-orange-400' : 'text-slate-500'}`}>
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

      {/* ── QUICK LINKS ──────────────────────────────── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3">More</p>
        <div className="card-dark rounded-2xl overflow-hidden">
          <button
            onClick={onNavigateRecurring}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-colors cursor-pointer"
            style={{ borderBottom: '1px solid #1e1e2c' }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)' }}>
              <RefreshCw size={17} className="text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-200">Recurring Payments</p>
              <p className="text-xs text-slate-500 mt-0.5">Track subscriptions and regular bills</p>
            </div>
            <ChevronRight size={15} className="text-slate-600" />
          </button>

          <button
            onClick={onNavigateSavings}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <Target size={17} className="text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-200">Savings Goals</p>
              <p className="text-xs text-slate-500 mt-0.5">Plan and track what you're saving for</p>
            </div>
            <ChevronRight size={15} className="text-slate-600" />
          </button>
        </div>
      </div>

    </div>
  );
};
