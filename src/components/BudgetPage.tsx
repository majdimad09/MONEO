import React, { useState, useMemo } from 'react';
import { Target, Edit2, Plus, Trash2, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { Transaction, CategoryLimit, EXPENSE_CATEGORIES } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { getCategoryColor } from './CategoryIcon';

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
  if (pct >= 80) return '#f97316';
  if (pct >= 60) return '#eab308';
  return '#3b82f6';
}

export const BudgetPage: React.FC<BudgetPageProps> = ({
  transactions, currency, monthlyBudget, categoryLimits, onSaveBudget, onSaveLimits,
}) => {
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [showAddLimit, setShowAddLimit] = useState(false);
  const [limitCategory, setLimitCategory] = useState('Food');
  const [limitAmount, setLimitAmount] = useState('');
  const [editingLimit, setEditingLimit] = useState<string | null>(null);
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

  const budgetPct = monthlyBudget > 0 ? (totalSpentThisMonth / monthlyBudget) * 100 : 0;
  const budgetRemaining = monthlyBudget - totalSpentThisMonth;

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
    const combined = new Set([...limitCats, ...spendCats]);
    return Array.from(combined).sort();
  }, [categoryLimits, categorySpend]);

  const handleSaveBudget = () => {
    const v = parseFloat(budgetInput);
    if (!isNaN(v) && v > 0) {
      onSaveBudget(v);
      setEditingBudget(false);
    }
  };

  const handleAddLimit = () => {
    const v = parseFloat(limitAmount);
    if (!limitCategory || isNaN(v) || v <= 0) return;
    const updated = categoryLimits.filter(l => l.category !== limitCategory);
    onSaveLimits([...updated, { category: limitCategory, limit: v }]);
    setShowAddLimit(false);
    setLimitAmount('');
    setLimitCategory('Food');
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
  const availableForAdd = EXPENSE_CATEGORIES.map(c => c.name).filter(n => !categoriesWithLimits.includes(n));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Budget</h2>
        <p className="text-sm text-slate-500 mt-1">Track your monthly budget and category spending limits.</p>
      </div>

      {/* Monthly Budget Card */}
      <div className="card-dark rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Monthly Budget</h3>
              <p className="text-xs text-slate-500">{getCurrentMonthLabel()}</p>
            </div>
          </div>
          <button
            onClick={() => { setEditingBudget(true); setBudgetInput(monthlyBudget > 0 ? monthlyBudget.toString() : ''); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-400 transition-colors"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}
          >
            <Edit2 className="w-3.5 h-3.5" />
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
              className="input-dark flex-1 px-3 py-2 rounded-xl text-sm font-medium"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSaveBudget()}
            />
            <button onClick={handleSaveBudget} className="btn-blue px-4 py-2 rounded-xl text-sm cursor-pointer">Save</button>
            <button onClick={() => setEditingBudget(false)} className="p-2 text-slate-500 hover:text-slate-600 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {monthlyBudget > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="rounded-xl p-3 text-center" style={{ background: '#0a1424', border: '1px solid #1e2d4a' }}>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Budget</p>
                <p className="text-sm font-bold text-slate-800">{formatCurrency(monthlyBudget, currency)}</p>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: '#0a1424', border: '1px solid #1e2d4a' }}>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Spent</p>
                <p className="text-sm font-bold text-red-400">{formatCurrency(totalSpentThisMonth, currency)}</p>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: '#0a1424', border: '1px solid #1e2d4a' }}>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Remaining</p>
                <p className={`text-sm font-bold ${budgetRemaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(Math.abs(budgetRemaining), currency)}
                  {budgetRemaining < 0 ? ' over' : ''}
                </p>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-400 font-medium">{budgetPct.toFixed(1)}% of budget used</span>
                {budgetRemaining < 0 && (
                  <span className="text-xs text-red-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Budget exceeded
                  </span>
                )}
                {budgetPct >= 80 && budgetPct < 100 && (
                  <span className="text-xs text-orange-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Approaching limit
                  </span>
                )}
                {budgetPct < 80 && budgetRemaining >= 0 && (
                  <span className="text-xs text-green-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    On track
                  </span>
                )}
              </div>
              <div className="progress-track h-3">
                <div
                  className="progress-fill transition-all duration-700"
                  style={{
                    width: `${Math.min(budgetPct, 100)}%`,
                    background: getProgressColor(budgetPct),
                    boxShadow: `0 0 8px ${getProgressColor(budgetPct)}60`,
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <p className="text-slate-500 text-sm">No budget set. Click "Set Budget" to get started.</p>
          </div>
        )}
      </div>

      {/* Category Limits */}
      <div className="card-dark rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-800">Category Spending Limits</h3>
          <button
            onClick={() => setShowAddLimit(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-400 transition-colors"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Limit
          </button>
        </div>

        {/* Add Limit Form */}
        {showAddLimit && (
          <div className="mb-5 p-4 rounded-xl flex flex-col sm:flex-row gap-3"
            style={{ background: '#0a1424', border: '1px solid #253659' }}>
            <select
              value={limitCategory}
              onChange={e => setLimitCategory(e.target.value)}
              className="input-dark flex-1 px-3 py-2 rounded-xl text-sm"
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
              className="input-dark px-3 py-2 rounded-xl text-sm w-36"
              onKeyDown={e => e.key === 'Enter' && handleAddLimit()}
            />
            <button onClick={handleAddLimit} className="btn-blue px-4 py-2 rounded-xl text-sm cursor-pointer">Add</button>
            <button onClick={() => setShowAddLimit(false)} className="p-2 text-slate-500 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {allCategories.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">
            Add spending limits to track your category budgets.
          </p>
        ) : (
          <div className="space-y-4">
            {allCategories.map(cat => {
              const spent = categorySpend[cat] || 0;
              const limitObj = categoryLimits.find(l => l.category === cat);
              const limit = limitObj?.limit || 0;
              const pct = limit > 0 ? (spent / limit) * 100 : 0;
              const catColor = getCategoryColor(cat, 'expense');

              return (
                <div key={cat} className="rounded-xl p-4" style={{ background: '#0a1424', border: '1px solid #1e2d4a' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: catColor }} />
                      <span className="text-sm font-semibold text-slate-700">{cat}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {limit > 0 ? (
                        editingLimit === cat ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={editLimitAmount}
                              onChange={e => setEditLimitAmount(e.target.value)}
                              className="input-dark px-2 py-1 rounded-lg text-xs w-24"
                              onKeyDown={e => e.key === 'Enter' && handleSaveEditLimit()}
                              autoFocus
                            />
                            <button onClick={handleSaveEditLimit} className="btn-blue px-2 py-1 rounded-lg text-xs cursor-pointer">OK</button>
                            <button onClick={() => setEditingLimit(null)} className="text-slate-500 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        ) : (
                          <>
                            <span className="text-xs text-slate-400 font-mono">
                              {formatCurrency(spent, currency)} / {formatCurrency(limit, currency)}
                            </span>
                            <button onClick={() => handleEditLimit(cat)} className="p-1 text-slate-500 hover:text-blue-400 transition-colors">
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button onClick={() => handleRemoveLimit(cat)} className="p-1 text-slate-500 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        )
                      ) : (
                        <>
                          <span className="text-xs text-slate-500">{formatCurrency(spent, currency)} spent — no limit</span>
                          <button
                            onClick={() => { setShowAddLimit(false); setLimitCategory(cat); setShowAddLimit(true); }}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            + Set limit
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {limit > 0 && (
                    <>
                      <div className="progress-track h-2 mb-1.5">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            background: getProgressColor(pct),
                            boxShadow: `0 0 6px ${getProgressColor(pct)}50`,
                          }}
                        />
                      </div>
                      {pct >= 90 && pct < 100 && (
                        <p className="text-[11px] text-orange-400 flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3 h-3" />
                          You've used {pct.toFixed(0)}% of your {cat} limit
                        </p>
                      )}
                      {pct >= 100 && (
                        <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3 h-3" />
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
