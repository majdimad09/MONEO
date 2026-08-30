import React, { useState, useMemo } from 'react';
import { RefreshCw, Plus, Edit2, Trash2, X, Check, AlertTriangle, Power, Calendar } from 'lucide-react';
import { Subscription, SubscriptionFrequency, EXPENSE_CATEGORIES } from '../types/finance';
import { formatCurrency } from '../utils/formatters';

interface SubscriptionsPageProps {
  currency: string;
  subscriptions: Subscription[];
  onSaveSubscriptions: (subs: Subscription[]) => void;
}

function toMonthlyAmount(amount: number, freq: SubscriptionFrequency): number {
  if (freq === 'weekly') return amount * 52 / 12;
  if (freq === 'yearly') return amount / 12;
  return amount;
}

function toYearlyAmount(amount: number, freq: SubscriptionFrequency): number {
  if (freq === 'weekly') return amount * 52;
  if (freq === 'monthly') return amount * 12;
  return amount;
}

function getDaysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatNextPayment(dateStr: string): string {
  const days = getDaysUntil(dateStr);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 0) return 'Overdue';
  if (days < 8) return `In ${days} days`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const FREQ_LABELS: Record<SubscriptionFrequency, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

const emptyForm = {
  name: '', amount: '', frequency: 'monthly' as SubscriptionFrequency,
  nextPaymentDate: new Date().toISOString().split('T')[0],
  category: 'Bills', isActive: true,
};

export const SubscriptionsPage: React.FC<SubscriptionsPageProps> = ({ currency, subscriptions, onSaveSubscriptions }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const activeOnly = subscriptions.filter(s => s.isActive);

  const { monthlyTotal, yearlyTotal } = useMemo(() => {
    const mt = activeOnly.reduce((s, sub) => s + toMonthlyAmount(sub.amount, sub.frequency), 0);
    const yt = activeOnly.reduce((s, sub) => s + toYearlyAmount(sub.amount, sub.frequency), 0);
    return { monthlyTotal: mt, yearlyTotal: yt };
  }, [activeOnly]);

  const upcoming = useMemo(() =>
    [...subscriptions]
      .filter(s => s.isActive && getDaysUntil(s.nextPaymentDate) <= 7)
      .sort((a, b) => new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime()),
    [subscriptions]
  );

  const handleSubmit = () => {
    const amt = parseFloat(form.amount);
    if (!form.name.trim()) { setFormError('Please enter a subscription name.'); return; }
    if (isNaN(amt) || amt <= 0) { setFormError('Please enter a valid amount.'); return; }
    if (!form.nextPaymentDate) { setFormError('Please enter a next payment date.'); return; }

    if (editingId) {
      onSaveSubscriptions(subscriptions.map(s => s.id === editingId
        ? { ...s, name: form.name.trim(), amount: amt, frequency: form.frequency, nextPaymentDate: form.nextPaymentDate, category: form.category }
        : s
      ));
      setEditingId(null);
    } else {
      const newSub: Subscription = {
        id: 'sub-' + Date.now(),
        name: form.name.trim(),
        amount: amt,
        frequency: form.frequency,
        nextPaymentDate: form.nextPaymentDate,
        category: form.category,
        isActive: true,
        createdAt: Date.now(),
      };
      onSaveSubscriptions([...subscriptions, newSub]);
    }
    setForm(emptyForm);
    setShowForm(false);
    setFormError('');
  };

  const handleEdit = (s: Subscription) => {
    setForm({ name: s.name, amount: s.amount.toString(), frequency: s.frequency, nextPaymentDate: s.nextPaymentDate, category: s.category, isActive: s.isActive });
    setEditingId(s.id);
    setShowForm(true);
    setFormError('');
  };

  const handleDelete = (id: string) => {
    onSaveSubscriptions(subscriptions.filter(s => s.id !== id));
  };

  const handleToggle = (id: string) => {
    onSaveSubscriptions(subscriptions.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Subscriptions</h2>
          <p className="text-sm text-slate-500 mt-1">Track your recurring payments and never miss a billing date.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
          className="btn-primary px-4 py-2 rounded-xl text-sm cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Subscription
        </button>
      </div>

      {/* Summary totals */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="card-dark rounded-2xl p-4 sm:col-span-1">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Monthly Cost</p>
          <p className="text-xl font-bold text-slate-900">{formatCurrency(monthlyTotal, currency)}</p>
          <p className="text-xs text-slate-500 mt-0.5">{activeOnly.length} active subscriptions</p>
        </div>
        <div className="card-dark rounded-2xl p-4 sm:col-span-1">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Yearly Cost</p>
          <p className="text-xl font-bold text-slate-900">{formatCurrency(yearlyTotal, currency)}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total annual spend</p>
        </div>
        {upcoming.length > 0 && (
          <div className="col-span-2 sm:col-span-1 rounded-2xl p-4"
            style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-yellow-400" />
              <p className="text-[10px] text-yellow-400 uppercase tracking-wider font-bold">Due This Week</p>
            </div>
            {upcoming.slice(0, 2).map(s => (
              <div key={s.id} className="flex justify-between text-xs mt-1">
                <span className="text-slate-600 font-medium truncate">{s.name}</span>
                <span className="text-yellow-400 font-semibold ml-2 flex-shrink-0">{formatNextPayment(s.nextPaymentDate)}</span>
              </div>
            ))}
            {upcoming.length > 2 && (
              <p className="text-[10px] text-slate-500 mt-1">+{upcoming.length - 2} more</p>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card-dark rounded-2xl p-6">
          <h3 className="font-bold text-slate-800 mb-4">{editingId ? 'Edit Subscription' : 'Add Subscription'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className="section-label mb-1.5 block">Subscription Name *</label>
              <input
                type="text"
                placeholder="e.g. Netflix, Spotify, iCloud..."
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="input-dark w-full px-3 py-2 rounded-xl text-sm font-medium"
                autoFocus
              />
            </div>
            <div>
              <label className="section-label mb-1.5 block">Amount *</label>
              <input
                type="number"
                placeholder="0.00"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="input-dark w-full px-3 py-2 rounded-xl text-sm font-medium"
              />
            </div>
            <div>
              <label className="section-label mb-1.5 block">Frequency</label>
              <div className="flex gap-2">
                {(['weekly', 'monthly', 'yearly'] as SubscriptionFrequency[]).map(freq => (
                  <button
                    key={freq}
                    onClick={() => setForm(f => ({ ...f, frequency: freq }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                      form.frequency === freq ? 'btn-primary' : 'text-slate-400'
                    }`}
                    style={form.frequency !== freq ? { background: '#0a1424', border: '1px solid #1e2d4a' } : {}}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="section-label mb-1.5 block">Next Payment Date *</label>
              <input
                type="date"
                value={form.nextPaymentDate}
                onChange={e => setForm(f => ({ ...f, nextPaymentDate: e.target.value }))}
                className="input-dark w-full px-3 py-2 rounded-xl text-sm font-medium"
              />
            </div>
            <div>
              <label className="section-label mb-1.5 block">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="input-dark w-full px-3 py-2 rounded-xl text-sm"
              >
                {EXPENSE_CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>
          {formError && (
            <p className="text-xs text-red-400 mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />{formError}
            </p>
          )}
          <div className="flex items-center gap-2">
            <button onClick={handleSubmit} className="btn-primary px-5 py-2 rounded-xl text-sm cursor-pointer flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              {editingId ? 'Save Changes' : 'Add Subscription'}
            </button>
            <button onClick={cancelForm} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-700 rounded-xl transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Subscriptions List */}
      {subscriptions.length === 0 ? (
        <div className="card-dark rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <RefreshCw className="w-7 h-7 text-blue-400" />
          </div>
          <h3 className="font-bold text-slate-600 mb-1">No subscriptions yet</h3>
          <p className="text-sm text-slate-500 mb-4">Add your recurring payments to track monthly costs.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary px-5 py-2 rounded-xl text-sm cursor-pointer">
            + Add First Subscription
          </button>
        </div>
      ) : (
        <div className="card-dark rounded-2xl overflow-hidden">
          <div className="divide-y divide-[#1e2d4a]">
            {subscriptions.map(sub => {
              const days = getDaysUntil(sub.nextPaymentDate);
              const isDueSoon = sub.isActive && days <= 3 && days >= 0;
              const isOverdue = sub.isActive && days < 0;
              const monthly = toMonthlyAmount(sub.amount, sub.frequency);

              return (
                <div key={sub.id} className={`flex items-center gap-4 px-5 py-4 transition-colors ${!sub.isActive ? 'opacity-50' : ''}`}>
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: sub.isActive ? 'rgba(59,130,246,0.12)' : '#0a1424', border: sub.isActive ? '1px solid rgba(59,130,246,0.2)' : '1px solid #1e2d4a' }}>
                    <RefreshCw className={`w-4 h-4 ${sub.isActive ? 'text-blue-400' : 'text-slate-600'}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700 text-sm truncate">{sub.name}</span>
                      {!sub.isActive && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold text-slate-500"
                          style={{ background: '#0a1424', border: '1px solid #1e2d4a' }}>Paused</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-500">{sub.category}</span>
                      <span className="text-[11px] text-slate-600">·</span>
                      <span className="text-[11px] text-slate-500">{FREQ_LABELS[sub.frequency]}</span>
                      {sub.isActive && (
                        <>
                          <span className="text-[11px] text-slate-600">·</span>
                          <span className={`text-[11px] font-semibold ${
                            isOverdue ? 'text-red-400' : isDueSoon ? 'text-yellow-400' : 'text-slate-500'
                          }`}>
                            {isOverdue ? 'Overdue' : formatNextPayment(sub.nextPaymentDate)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0 mr-2">
                    <p className="font-bold text-slate-800 text-sm">{formatCurrency(sub.amount, currency)}</p>
                    {sub.frequency !== 'monthly' && (
                      <p className="text-[10px] text-slate-500">{formatCurrency(monthly, currency)}/mo</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleToggle(sub.id)}
                      className={`p-1.5 rounded-lg transition-colors ${sub.isActive ? 'text-blue-400 hover:text-blue-300' : 'text-slate-600 hover:text-slate-400'}`}
                      title={sub.isActive ? 'Pause subscription' : 'Resume subscription'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleEdit(sub)} className="p-1.5 text-slate-500 hover:text-blue-400 transition-colors rounded-lg">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(sub.id)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors rounded-lg">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
