import React, { useState } from 'react';
import {
  Plus, Edit2, Trash2, Check, X, AlertTriangle, RefreshCw,
  Calendar, DollarSign, ToggleLeft, ToggleRight, ChevronDown,
} from 'lucide-react';
import { Subscription, SubscriptionFrequency, EXPENSE_CATEGORIES } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { getCategoryColor } from './CategoryIcon';

interface RecurringScreenProps {
  subscriptions: Subscription[];
  currency: string;
  onSaveSubscriptions: (subs: Subscription[]) => void;
}

const FREQ_OPTIONS: { value: SubscriptionFrequency; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'weekly', label: 'Weekly' },
];

function toMonthly(amount: number, freq: SubscriptionFrequency): number {
  if (freq === 'yearly') return amount / 12;
  if (freq === 'weekly') return (amount * 52) / 12;
  return amount;
}

function getNextDateDefault(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

const emptyForm = {
  name: '',
  amount: '',
  frequency: 'monthly' as SubscriptionFrequency,
  nextPaymentDate: getNextDateDefault(),
  category: 'Subscriptions',
};

export const RecurringScreen: React.FC<RecurringScreenProps> = ({
  subscriptions, currency, onSaveSubscriptions,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);

  const active = subscriptions.filter(s => s.isActive);

  const monthlyTotal = subscriptions.reduce((s, sub) =>
    sub.isActive ? s + toMonthly(sub.amount, sub.frequency) : s, 0
  );
  const annualTotal = monthlyTotal * 12;

  const handleSubmit = () => {
    setFormError('');
    if (!form.name.trim()) { setFormError('Enter a name.'); return; }
    const v = parseFloat(form.amount);
    if (isNaN(v) || v <= 0) { setFormError('Enter a valid amount.'); return; }
    if (!form.nextPaymentDate) { setFormError('Enter next payment date.'); return; }

    const sub: Subscription = {
      id: editingId ?? 'sub-' + Date.now(),
      name: form.name.trim(),
      amount: v,
      frequency: form.frequency,
      nextPaymentDate: form.nextPaymentDate,
      category: form.category,
      isActive: true,
      createdAt: editingId
        ? (subscriptions.find(s => s.id === editingId)?.createdAt ?? Date.now())
        : Date.now(),
    };

    if (editingId) {
      onSaveSubscriptions(subscriptions.map(s => s.id === editingId ? sub : s));
    } else {
      onSaveSubscriptions([...subscriptions, sub]);
    }
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleEdit = (s: Subscription) => {
    setForm({
      name: s.name,
      amount: String(s.amount),
      frequency: s.frequency,
      nextPaymentDate: s.nextPaymentDate,
      category: s.category,
    });
    setEditingId(s.id);
    setFormError('');
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    onSaveSubscriptions(subscriptions.filter(s => s.id !== id));
    setShowDeleteId(null);
  };

  const handleToggleActive = (id: string) => {
    onSaveSubscriptions(subscriptions.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  const cancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
  };

  const formatDate = (d: string) => {
    try { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
    catch { return d; }
  };

  return (
    <div className="page-enter px-4 pt-3 pb-8 space-y-5">

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Recurring</h2>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 cursor-pointer px-3 py-1.5 rounded-xl btn-blue"
          >
            <Plus size={14} /> Add
          </button>
        )}
      </div>

      {/* ── SUMMARY ──────────────────────────────────── */}
      {active.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="card-dark rounded-2xl p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Active</p>
            <p className="text-base font-bold text-white">{active.length}</p>
          </div>
          <div className="card-dark rounded-2xl p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Monthly</p>
            <p className="text-sm font-bold text-red-400">{formatCurrency(monthlyTotal, currency)}</p>
          </div>
          <div className="card-dark rounded-2xl p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Yearly</p>
            <p className="text-sm font-bold text-slate-300">{formatCurrency(annualTotal, currency)}</p>
          </div>
        </div>
      )}

      {/* ── ADD / EDIT FORM ───────────────────────────── */}
      {showForm && (
        <div className="card-dark rounded-2xl p-5 space-y-4">
          <p className="text-sm font-bold text-slate-200">{editingId ? 'Edit Recurring' : 'New Recurring Payment'}</p>

          {/* Name */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 block mb-1.5">Name</label>
            <input
              type="text"
              placeholder="e.g. Netflix, Gym, Rent..."
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input-dark w-full px-3 py-2.5 rounded-xl text-sm"
              autoFocus
            />
          </div>

          {/* Amount + Frequency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 block mb-1.5">Amount</label>
              <input
                type="number"
                placeholder="0.00"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="input-dark w-full px-3 py-2.5 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 block mb-1.5">Frequency</label>
              <div className="relative">
                <select
                  value={form.frequency}
                  onChange={e => setForm(f => ({ ...f, frequency: e.target.value as SubscriptionFrequency }))}
                  className="input-dark w-full px-3 py-2.5 rounded-xl text-sm appearance-none cursor-pointer"
                >
                  {FREQ_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 block mb-1.5">Category</label>
            <div className="grid grid-cols-3 gap-1.5">
              {EXPENSE_CATEGORIES.slice(0, 9).map(c => {
                const color = getCategoryColor(c.name, 'expense');
                return (
                  <button
                    key={c.name}
                    onClick={() => setForm(f => ({ ...f, category: c.name }))}
                    className="px-2 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all truncate"
                    style={form.category === c.name
                      ? { background: `${color}20`, border: `1px solid ${color}50`, color }
                      : { background: '#0a1424', border: '1px solid #1e2d4a', color: '#475569' }}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Next payment date */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 block mb-1.5">Next Payment Date</label>
            <input
              type="date"
              value={form.nextPaymentDate}
              onChange={e => setForm(f => ({ ...f, nextPaymentDate: e.target.value }))}
              className="input-dark w-full px-3 py-2.5 rounded-xl text-sm"
            />
          </div>

          {formError && (
            <p className="text-xs text-red-400 flex items-center gap-1.5">
              <AlertTriangle size={12} /> {formError}
            </p>
          )}

          <div className="flex gap-2">
            <button onClick={handleSubmit}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold btn-blue cursor-pointer flex items-center justify-center gap-1.5">
              <Check size={15} /> {editingId ? 'Save Changes' : 'Add'}
            </button>
            <button onClick={cancel}
              className="px-4 py-2.5 rounded-xl text-sm text-slate-400 cursor-pointer"
              style={{ background: '#111d35' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── SUBSCRIPTION LIST ────────────────────────── */}
      {subscriptions.length === 0 ? (
        <div className="card-dark rounded-3xl p-10 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <RefreshCw size={28} className="text-blue-400" />
          </div>
          <h3 className="font-bold text-slate-300 mb-2">No recurring payments</h3>
          <p className="text-sm text-slate-500 mb-5 leading-relaxed">
            Track subscriptions, rent, and regular bills here.
          </p>
          <button
            onClick={() => { setShowForm(true); setForm(emptyForm); }}
            className="btn-blue px-6 py-2.5 rounded-xl text-sm cursor-pointer inline-flex items-center gap-2"
          >
            <Plus size={16} /> Add First Payment
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {subscriptions.map(sub => {
            const monthly = toMonthly(sub.amount, sub.frequency);
            const color = getCategoryColor(sub.category, 'expense');
            const isConfirmDelete = showDeleteId === sub.id;

            return (
              <div key={sub.id} className="card-dark rounded-2xl overflow-hidden"
                style={{ opacity: sub.isActive ? 1 : 0.6 }}>
                <div className="px-4 py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${color}18`, border: `1px solid ${color}28`, color }}>
                      <RefreshCw size={17} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-100 truncate">{sub.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{sub.category}</p>
                    </div>
                    {/* Toggle active */}
                    <button onClick={() => handleToggleActive(sub.id)} className="cursor-pointer">
                      {sub.isActive
                        ? <ToggleRight size={26} className="text-blue-400" />
                        : <ToggleLeft size={26} className="text-slate-600" />}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="rounded-xl p-2.5 text-center" style={{ background: '#0a1424', border: '1px solid #1e2d4a' }}>
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <DollarSign size={10} className="text-slate-600" />
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Amount</p>
                      </div>
                      <p className="text-xs font-bold text-slate-200">{formatCurrency(sub.amount, currency)}</p>
                      <p className="text-[10px] text-slate-600 capitalize">{sub.frequency}</p>
                    </div>
                    <div className="rounded-xl p-2.5 text-center" style={{ background: '#0a1424', border: '1px solid #1e2d4a' }}>
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <RefreshCw size={10} className="text-slate-600" />
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Monthly</p>
                      </div>
                      <p className="text-xs font-bold text-red-400">{formatCurrency(monthly, currency)}</p>
                    </div>
                    <div className="rounded-xl p-2.5 text-center" style={{ background: '#0a1424', border: '1px solid #1e2d4a' }}>
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <Calendar size={10} className="text-slate-600" />
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Next</p>
                      </div>
                      <p className="text-xs font-bold text-slate-200">{formatDate(sub.nextPaymentDate)}</p>
                    </div>
                  </div>

                  {isConfirmDelete ? (
                    <div className="flex gap-2">
                      <button onClick={() => handleDelete(sub.id)}
                        className="flex-1 py-2 rounded-xl text-xs font-bold text-white cursor-pointer"
                        style={{ background: '#dc2626' }}>
                        Yes, Delete
                      </button>
                      <button onClick={() => setShowDeleteId(null)}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-400 cursor-pointer"
                        style={{ background: '#111d35' }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(sub)}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-400 flex items-center justify-center gap-1.5 cursor-pointer"
                        style={{ background: '#0a1424', border: '1px solid #1e2d4a' }}>
                        <Edit2 size={12} /> Edit
                      </button>
                      <button onClick={() => setShowDeleteId(sub.id)}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold text-red-400 flex items-center justify-center gap-1.5 cursor-pointer"
                        style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {!showForm && (
            <button
              onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-blue-400 cursor-pointer"
              style={{ border: '2px dashed rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.04)' }}
            >
              <Plus size={18} /> Add Recurring Payment
            </button>
          )}
        </div>
      )}

      <p className="text-center text-[10px] text-slate-700">
        Future versions will auto-detect recurring payments from bank syncing.
      </p>
    </div>
  );
};
