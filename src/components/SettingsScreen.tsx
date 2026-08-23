import React, { useState, useMemo } from 'react';
import {
  Target, Edit2, Plus, Trash2, AlertTriangle, CheckCircle2, X,
  RefreshCw, Power, Calendar, Download, RotateCcw, Sparkles,
  Wallet, ChevronRight, User, Check, LogOut,
} from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { Transaction, CategoryLimit, Subscription, SubscriptionFrequency, EXPENSE_CATEGORIES } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { getCategoryColor } from './CategoryIcon';
import { CategoryIcon } from './CategoryIcon';
import { saveUserName } from '../utils/storage';

interface SettingsScreenProps {
  transactions: Transaction[];
  currency: string;
  monthlyBudget: number;
  categoryLimits: CategoryLimit[];
  onSaveBudget: (amount: number) => void;
  onSaveLimits: (limits: CategoryLimit[]) => void;
  subscriptions: Subscription[];
  onSaveSubscriptions: (subs: Subscription[]) => void;
  transactionCount: number;
  onLoadSampleData: () => void;
  onClearAllData: () => void;
  onExportCSV: () => void;
  userName: string;
  onSaveUserName: (name: string) => void;
  initialTab?: SettingsTab;
  user?: SupabaseUser | null;
  onSignOut?: () => void;
}

type SettingsTab = 'budget' | 'subscriptions' | 'data';

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

function toMonthly(amount: number, freq: SubscriptionFrequency): number {
  if (freq === 'weekly') return (amount * 52) / 12;
  if (freq === 'yearly') return amount / 12;
  return amount;
}
function toYearly(amount: number, freq: SubscriptionFrequency): number {
  if (freq === 'weekly') return amount * 52;
  if (freq === 'monthly') return amount * 12;
  return amount;
}
function getDaysUntil(dateStr: string): number {
  const now = new Date(); const target = new Date(dateStr);
  now.setHours(0,0,0,0); target.setHours(0,0,0,0);
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}
function formatNext(dateStr: string): string {
  const d = getDaysUntil(dateStr);
  if (d === 0) return 'Today'; if (d === 1) return 'Tomorrow';
  if (d < 0) return 'Overdue';
  if (d < 8) return `In ${d}d`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const FREQ_LABELS: Record<SubscriptionFrequency, string> = { weekly: 'Wkly', monthly: 'Mo', yearly: 'Yr' };

const emptySub = { name: '', amount: '', frequency: 'monthly' as SubscriptionFrequency, nextPaymentDate: new Date().toISOString().split('T')[0], category: 'Bills' };

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  transactions, currency, monthlyBudget, categoryLimits, onSaveBudget, onSaveLimits,
  subscriptions, onSaveSubscriptions, transactionCount, onLoadSampleData, onClearAllData, onExportCSV,
  userName, onSaveUserName, initialTab, user, onSignOut,
}) => {
  const [tab, setTab] = useState<SettingsTab>(initialTab || 'budget');
  const [nameInput, setNameInput] = useState(userName);
  const [nameSaved, setNameSaved] = useState(false);
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [showAddLimit, setShowAddLimit] = useState(false);
  const [limitCategory, setLimitCategory] = useState('Food');
  const [limitAmount, setLimitAmount] = useState('');
  const [editingLimit, setEditingLimit] = useState<string | null>(null);
  const [editLimitAmount, setEditLimitAmount] = useState('');
  const [showSubForm, setShowSubForm] = useState(false);
  const [subForm, setSubForm] = useState(emptySub);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [subError, setSubError] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSaveName = () => {
    onSaveUserName(nameInput.trim());
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  const prefix = getCurrentMonthPrefix();

  const currentMonthExpenses = useMemo(() =>
    transactions.filter(t => t.type === 'expense' && t.date.startsWith(prefix)), [transactions, prefix]);

  const totalSpent = useMemo(() =>
    currentMonthExpenses.reduce((s, t) => s + t.amount, 0), [currentMonthExpenses]);

  const budgetPct = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
  const budgetRemaining = monthlyBudget - totalSpent;

  const categorySpend = useMemo(() => {
    const map: Record<string, number> = {};
    currentMonthExpenses.forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return map;
  }, [currentMonthExpenses]);

  const allCategories = useMemo(() => {
    const all = new Set([...categoryLimits.map(l => l.category), ...Object.keys(categorySpend)]);
    return Array.from(all).sort();
  }, [categoryLimits, categorySpend]);

  const categoriesWithLimits = categoryLimits.map(l => l.category);
  const availableForAdd = EXPENSE_CATEGORIES.map(c => c.name).filter(n => !categoriesWithLimits.includes(n));

  const handleSaveBudget = () => {
    const v = parseFloat(budgetInput);
    if (!isNaN(v) && v > 0) { onSaveBudget(v); setEditingBudget(false); }
  };

  const handleAddLimit = () => {
    const v = parseFloat(limitAmount);
    if (!limitCategory || isNaN(v) || v <= 0) return;
    onSaveLimits([...categoryLimits.filter(l => l.category !== limitCategory), { category: limitCategory, limit: v }]);
    setShowAddLimit(false); setLimitAmount(''); setLimitCategory('Food');
  };

  const handleSaveEditLimit = () => {
    if (!editingLimit) return;
    const v = parseFloat(editLimitAmount);
    if (!isNaN(v) && v > 0) {
      onSaveLimits([...categoryLimits.filter(l => l.category !== editingLimit), { category: editingLimit, limit: v }]);
    }
    setEditingLimit(null);
  };

  const activeOnly = subscriptions.filter(s => s.isActive);
  const monthlyTotal = activeOnly.reduce((s, sub) => s + toMonthly(sub.amount, sub.frequency), 0);
  const yearlyTotal = activeOnly.reduce((s, sub) => s + toYearly(sub.amount, sub.frequency), 0);

  const handleSubSubmit = () => {
    const amt = parseFloat(subForm.amount);
    if (!subForm.name.trim()) { setSubError('Enter a name.'); return; }
    if (isNaN(amt) || amt <= 0) { setSubError('Enter a valid amount.'); return; }
    if (editingSubId) {
      onSaveSubscriptions(subscriptions.map(s => s.id === editingSubId
        ? { ...s, name: subForm.name.trim(), amount: amt, frequency: subForm.frequency, nextPaymentDate: subForm.nextPaymentDate, category: subForm.category }
        : s
      ));
      setEditingSubId(null);
    } else {
      onSaveSubscriptions([...subscriptions, {
        id: 'sub-' + Date.now(), name: subForm.name.trim(), amount: amt,
        frequency: subForm.frequency, nextPaymentDate: subForm.nextPaymentDate,
        category: subForm.category, isActive: true, createdAt: Date.now(),
      }]);
    }
    setSubForm(emptySub); setShowSubForm(false); setSubError('');
  };

  const handleEditSub = (s: Subscription) => {
    setSubForm({ name: s.name, amount: s.amount.toString(), frequency: s.frequency, nextPaymentDate: s.nextPaymentDate, category: s.category });
    setEditingSubId(s.id); setShowSubForm(true); setSubError('');
  };

  return (
    <div className="page-enter px-4 pt-3 pb-6 space-y-4">

      {/* Profile card */}
      <div className="card-dark rounded-2xl p-4 card-float-1">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <User size={18} className="text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100">Profile</p>
            <p className="text-xs text-slate-500">Your display name in the app</p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Your first name (e.g. Alex)"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSaveName()}
            className="input-dark flex-1 px-3 py-2 rounded-xl text-sm"
          />
          <button
            onClick={handleSaveName}
            className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer flex items-center gap-1.5 transition-all ${nameSaved ? 'text-green-400' : 'btn-blue'}`}
            style={nameSaved ? { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' } : {}}
          >
            {nameSaved ? <><Check size={14} /> Saved</> : 'Save'}
          </button>
        </div>
      </div>

      {/* Account section (only when signed in) */}
      {user && (
        <div className="card-dark rounded-2xl p-4 card-float-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-300">Signed in as</p>
              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{user.email}</p>
            </div>
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <LogOut size={13} />
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sub-tab nav */}
      <div className="flex p-1 gap-1 rounded-2xl" style={{ background: '#0a1424', border: '1px solid #1e2d4a' }}>
        {(['budget', 'subscriptions', 'data'] as SettingsTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`settings-tab cursor-pointer text-center capitalize ${tab === t ? 'active' : ''}`}
          >
            {t === 'subscriptions' ? 'Recurring' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ======= BUDGET TAB ======= */}
      {tab === 'budget' && (
        <div className="space-y-4">
          {/* Monthly budget card */}
          <div className="card-dark rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <Target size={18} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100">Monthly Budget</p>
                  <p className="text-xs text-slate-500">{getCurrentMonthLabel()}</p>
                </div>
              </div>
              <button
                onClick={() => { setEditingBudget(true); setBudgetInput(monthlyBudget > 0 ? monthlyBudget.toString() : ''); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-400 cursor-pointer"
                style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}
              >
                <Edit2 size={12} />
                {monthlyBudget > 0 ? 'Edit' : 'Set'}
              </button>
            </div>

            {editingBudget && (
              <div className="flex gap-2 mb-4">
                <input type="number" placeholder="Monthly budget..."
                  value={budgetInput} onChange={e => setBudgetInput(e.target.value)}
                  className="input-dark flex-1 px-3 py-2 rounded-xl text-sm" autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleSaveBudget()} />
                <button onClick={handleSaveBudget} className="btn-blue px-4 py-2 rounded-xl text-sm cursor-pointer">Save</button>
                <button onClick={() => setEditingBudget(false)} className="p-2 text-slate-500 cursor-pointer"><X size={16} /></button>
              </div>
            )}

            {monthlyBudget > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: 'Budget', val: formatCurrency(monthlyBudget, currency), color: '#f1f5f9' },
                    { label: 'Spent', val: formatCurrency(totalSpent, currency), color: '#f87171' },
                    { label: 'Left', val: formatCurrency(Math.abs(budgetRemaining), currency) + (budgetRemaining < 0 ? ' over' : ''), color: budgetRemaining >= 0 ? '#34d399' : '#f87171' },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="rounded-xl p-2.5 text-center" style={{ background: '#0a1424', border: '1px solid #1e2d4a' }}>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">{label}</p>
                      <p className="text-xs font-bold" style={{ color }}>{val}</p>
                    </div>
                  ))}
                </div>
                <div className="progress-track h-2.5 mb-2">
                  <div className="progress-fill" style={{
                    width: `${Math.min(budgetPct, 100)}%`,
                    background: getProgressColor(budgetPct),
                    boxShadow: `0 0 8px ${getProgressColor(budgetPct)}60`,
                  }} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{budgetPct.toFixed(1)}% used</span>
                  {budgetRemaining < 0
                    ? <span className="text-red-400 font-semibold flex items-center gap-1"><AlertTriangle size={11} />Over budget</span>
                    : budgetPct >= 80
                    ? <span className="text-orange-400 font-semibold flex items-center gap-1"><AlertTriangle size={11} />Near limit</span>
                    : <span className="text-green-400 font-semibold flex items-center gap-1"><CheckCircle2 size={11} />On track</span>
                  }
                </div>
              </>
            ) : (
              <p className="text-center text-slate-500 text-sm py-3">No budget set. Tap "Set" to get started.</p>
            )}
          </div>

          {/* Category limits */}
          <div className="card-dark rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-slate-100">Category Limits</p>
              <button onClick={() => setShowAddLimit(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-400 cursor-pointer"
                style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                <Plus size={12} /> Add
              </button>
            </div>

            {showAddLimit && (
              <div className="mb-4 p-3 rounded-xl space-y-2.5" style={{ background: '#0a1424', border: '1px solid #253659' }}>
                <select value={limitCategory} onChange={e => setLimitCategory(e.target.value)}
                  className="input-dark w-full px-3 py-2 rounded-xl text-sm">
                  {(availableForAdd.length > 0 ? availableForAdd : EXPENSE_CATEGORIES.map(c => c.name)).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input type="number" placeholder="Limit amount" value={limitAmount}
                    onChange={e => setLimitAmount(e.target.value)}
                    className="input-dark flex-1 px-3 py-2 rounded-xl text-sm"
                    onKeyDown={e => e.key === 'Enter' && handleAddLimit()} />
                  <button onClick={handleAddLimit} className="btn-blue px-4 py-2 rounded-xl text-sm cursor-pointer">Add</button>
                  <button onClick={() => setShowAddLimit(false)} className="text-slate-500 cursor-pointer"><X size={16} /></button>
                </div>
              </div>
            )}

            {allCategories.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">Add spending limits per category.</p>
            ) : (
              <div className="space-y-3">
                {allCategories.map(cat => {
                  const spent = categorySpend[cat] || 0;
                  const limitObj = categoryLimits.find(l => l.category === cat);
                  const limit = limitObj?.limit || 0;
                  const pct = limit > 0 ? (spent / limit) * 100 : 0;
                  const color = getCategoryColor(cat, 'expense');

                  return (
                    <div key={cat} className="rounded-xl p-3.5" style={{ background: '#0a1424', border: '1px solid #1e2d4a' }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18`, color }}>
                            <CategoryIcon category={cat} type="expense" size={13} />
                          </div>
                          <span className="text-sm font-semibold text-slate-200">{cat}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {limit > 0 ? (
                            editingLimit === cat ? (
                              <div className="flex items-center gap-1">
                                <input type="number" value={editLimitAmount}
                                  onChange={e => setEditLimitAmount(e.target.value)}
                                  className="input-dark px-2 py-1 rounded-lg text-xs w-20"
                                  onKeyDown={e => e.key === 'Enter' && handleSaveEditLimit()} autoFocus />
                                <button onClick={handleSaveEditLimit} className="btn-blue px-2 py-1 rounded-lg text-xs cursor-pointer">OK</button>
                                <button onClick={() => setEditingLimit(null)} className="text-slate-500 cursor-pointer"><X size={13} /></button>
                              </div>
                            ) : (
                              <>
                                <span className="text-xs text-slate-400 font-mono">
                                  {formatCurrency(spent, currency)} / {formatCurrency(limit, currency)}
                                </span>
                                <button onClick={() => { setEditingLimit(cat); setEditLimitAmount(limit.toString()); }}
                                  className="text-slate-500 hover:text-blue-400 cursor-pointer"><Edit2 size={12} /></button>
                                <button onClick={() => onSaveLimits(categoryLimits.filter(l => l.category !== cat))}
                                  className="text-slate-500 hover:text-red-400 cursor-pointer"><Trash2 size={12} /></button>
                              </>
                            )
                          ) : (
                            <button onClick={() => { setLimitCategory(cat); setShowAddLimit(true); }}
                              className="text-xs text-blue-400 cursor-pointer">+ Set limit</button>
                          )}
                        </div>
                      </div>
                      {limit > 0 && (
                        <>
                          <div className="progress-track h-1.5">
                            <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: getProgressColor(pct) }} />
                          </div>
                          {pct >= 90 && pct < 100 && (
                            <p className="text-[11px] text-orange-400 mt-1 flex items-center gap-1">
                              <AlertTriangle size={10} /> {pct.toFixed(0)}% used
                            </p>
                          )}
                          {pct >= 100 && (
                            <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                              <AlertTriangle size={10} /> Exceeded by {formatCurrency(spent - limit, currency)}
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
      )}

      {/* ======= SUBSCRIPTIONS TAB ======= */}
      {tab === 'subscriptions' && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card-dark rounded-2xl p-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Monthly</p>
              <p className="text-xl font-bold text-white">{formatCurrency(monthlyTotal, currency)}</p>
              <p className="text-xs text-slate-500 mt-0.5">{activeOnly.length} active</p>
            </div>
            <div className="card-dark rounded-2xl p-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Yearly</p>
              <p className="text-xl font-bold text-white">{formatCurrency(yearlyTotal, currency)}</p>
              <p className="text-xs text-slate-500 mt-0.5">Annual total</p>
            </div>
          </div>

          {/* Add form */}
          {showSubForm && (
            <div className="card-dark rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-100 mb-3">{editingSubId ? 'Edit' : 'Add'} Subscription</h3>
              <div className="space-y-3">
                <input type="text" placeholder="e.g. Netflix, Spotify..."
                  value={subForm.name} onChange={e => setSubForm(f => ({ ...f, name: e.target.value }))}
                  className="input-dark w-full px-3 py-2.5 rounded-xl text-sm" autoFocus />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Amount"
                    value={subForm.amount} onChange={e => setSubForm(f => ({ ...f, amount: e.target.value }))}
                    className="input-dark px-3 py-2.5 rounded-xl text-sm" />
                  <div className="flex gap-1">
                    {(['weekly', 'monthly', 'yearly'] as SubscriptionFrequency[]).map(freq => (
                      <button key={freq} onClick={() => setSubForm(f => ({ ...f, frequency: freq }))}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold capitalize cursor-pointer transition-all ${subForm.frequency === freq ? 'btn-blue' : 'text-slate-400'}`}
                        style={subForm.frequency !== freq ? { background: '#0a1424', border: '1px solid #1e2d4a' } : {}}>
                        {FREQ_LABELS[freq]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" value={subForm.nextPaymentDate}
                    onChange={e => setSubForm(f => ({ ...f, nextPaymentDate: e.target.value }))}
                    className="input-dark px-3 py-2.5 rounded-xl text-sm" />
                  <select value={subForm.category} onChange={e => setSubForm(f => ({ ...f, category: e.target.value }))}
                    className="input-dark px-3 py-2 rounded-xl text-sm">
                    {EXPENSE_CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              {subError && <p className="text-xs text-red-400 mt-2 flex items-center gap-1"><AlertTriangle size={12} />{subError}</p>}
              <div className="flex gap-2 mt-4">
                <button onClick={handleSubSubmit} className="btn-blue flex-1 py-2.5 rounded-xl text-sm cursor-pointer">
                  {editingSubId ? 'Save' : 'Add Subscription'}
                </button>
                <button onClick={() => { setShowSubForm(false); setEditingSubId(null); setSubForm(emptySub); setSubError(''); }}
                  className="px-4 py-2.5 text-sm text-slate-400 rounded-xl cursor-pointer" style={{ background: '#111d35' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* List */}
          {subscriptions.length === 0 ? (
            <div className="card-dark rounded-2xl p-10 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                <RefreshCw size={24} className="text-blue-400" />
              </div>
              <p className="text-slate-400 font-semibold text-sm mb-1">No subscriptions yet</p>
              <p className="text-slate-600 text-xs">Track your recurring payments here.</p>
            </div>
          ) : (
            <div className="card-dark rounded-2xl overflow-hidden">
              {subscriptions.map((sub, i) => {
                const days = getDaysUntil(sub.nextPaymentDate);
                const isDue = sub.isActive && days <= 3 && days >= 0;
                const isOver = sub.isActive && days < 0;
                return (
                  <div key={sub.id}
                    className={`flex items-center gap-3 px-4 py-3.5 ${!sub.isActive ? 'opacity-50' : ''}`}
                    style={{ borderBottom: i < subscriptions.length - 1 ? '1px solid #0f1e38' : 'none' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: sub.isActive ? 'rgba(59,130,246,0.12)' : '#0a1424', border: sub.isActive ? '1px solid rgba(59,130,246,0.2)' : '1px solid #1e2d4a' }}>
                      <RefreshCw size={14} className={sub.isActive ? 'text-blue-400' : 'text-slate-600'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">{sub.name}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <span>{sub.category}</span>
                        <span>·</span>
                        <span className={isOver ? 'text-red-400' : isDue ? 'text-yellow-400' : ''}>
                          {sub.isActive ? formatNext(sub.nextPaymentDate) : 'Paused'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right mr-2 flex-shrink-0">
                      <p className="text-sm font-bold text-slate-100">{formatCurrency(sub.amount, currency)}</p>
                      <p className="text-[10px] text-slate-500">{FREQ_LABELS[sub.frequency]}</p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => onSaveSubscriptions(subscriptions.map(s => s.id === sub.id ? { ...s, isActive: !s.isActive } : s))}
                        className={`p-1.5 rounded-lg cursor-pointer ${sub.isActive ? 'text-blue-400' : 'text-slate-600'}`}>
                        <Power size={13} />
                      </button>
                      <button onClick={() => handleEditSub(sub)} className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 cursor-pointer"><Edit2 size={13} /></button>
                      <button onClick={() => onSaveSubscriptions(subscriptions.filter(s => s.id !== sub.id))}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 cursor-pointer"><Trash2 size={13} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!showSubForm && (
            <button onClick={() => { setShowSubForm(true); setEditingSubId(null); setSubForm(emptySub); }}
              className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-blue-400 cursor-pointer"
              style={{ border: '2px dashed rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.04)' }}>
              <Plus size={16} /> Add Subscription
            </button>
          )}
        </div>
      )}

      {/* ======= DATA TAB ======= */}
      {tab === 'data' && (
        <div className="space-y-3">
          <div className="card-dark rounded-2xl overflow-hidden">
            {[
              {
                label: 'Load Demo Data',
                desc: 'Fill with sample transactions',
                icon: Sparkles,
                color: '#60a5fa',
                onClick: onLoadSampleData,
                disabled: transactionCount > 0,
              },
              {
                label: 'Export to CSV',
                desc: `Export ${transactionCount} transactions`,
                icon: Download,
                color: '#34d399',
                onClick: onExportCSV,
                disabled: transactionCount === 0,
              },
            ].map(({ label, desc, icon: Icon, color, onClick, disabled }, i) => (
              <button
                key={label}
                onClick={onClick}
                disabled={disabled}
                className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors cursor-pointer disabled:opacity-40"
                style={{ borderBottom: i === 0 ? '1px solid #0f1e38' : 'none' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-200">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
                <ChevronRight size={16} className="text-slate-600" />
              </button>
            ))}
          </div>

          {/* Clear / Reset */}
          <div className="card-dark rounded-2xl overflow-hidden">
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={transactionCount === 0}
                className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors cursor-pointer disabled:opacity-40"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <RotateCcw size={18} className="text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-400">Reset All Data</p>
                  <p className="text-xs text-slate-500 mt-0.5">Permanently delete all transactions</p>
                </div>
                <ChevronRight size={16} className="text-slate-600" />
              </button>
            ) : (
              <div className="px-5 py-4">
                <p className="text-sm font-bold text-slate-100 mb-1">Are you sure?</p>
                <p className="text-xs text-slate-500 mb-3">This will erase all {transactionCount} transactions. This cannot be undone.</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowClearConfirm(false)}
                    className="flex-1 py-2 rounded-xl text-sm text-slate-400 cursor-pointer" style={{ background: '#111d35' }}>
                    Cancel
                  </button>
                  <button onClick={() => { onClearAllData(); setShowClearConfirm(false); }}
                    className="flex-1 py-2 rounded-xl text-sm font-bold text-white bg-red-600 cursor-pointer">
                    Yes, Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* App info */}
          <div className="card-dark rounded-2xl p-4 text-center">
            <p className="text-xs text-slate-500">
              All data is stored locally in your browser.<br />
              No servers, no tracking, 100% private.
            </p>
            <p className="text-[10px] text-slate-600 mt-2">{transactionCount} transactions · MONEO by MJ/IA</p>
          </div>
        </div>
      )}
    </div>
  );
};
