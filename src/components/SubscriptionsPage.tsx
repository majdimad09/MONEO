import React, { useState, useMemo } from 'react';
import { RefreshCw, Plus, Edit2, Trash2, X, Check, AlertTriangle, Power, Calendar } from 'lucide-react';
import { Subscription, SubscriptionFrequency, EXPENSE_CATEGORIES } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { useTheme } from '../context/ThemeContext';

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
  const { isDark, colors } = useTheme();
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

  const cardStyle = {
    background: isDark ? colors.bgCard : '#ffffff',
    border: `1px solid ${isDark ? colors.border : 'rgba(99,102,241,0.10)'}`,
    boxShadow: isDark ? 'none' : '0 2px 16px rgba(99,102,241,0.06)',
  };

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
    <div className="page-enter px-4 pt-3 pb-8 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Subscriptions</h2>
          {activeOnly.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: colors.negativeSoft, color: colors.negative }}>
              {activeOnly.length} active
            </span>
          )}
        </div>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
            className="flex items-center gap-1.5 text-xs font-bold cursor-pointer px-3 py-1.5 rounded-xl btn-primary"
          >
            <Plus size={14} /> Add
          </button>
        )}
      </div>

      {/* Summary totals */}
      {activeOnly.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4" style={{ background: colors.negativeSoft, border: `1px solid ${colors.negative}22` }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: colors.negative }}>Monthly Cost</p>
            <p className="text-lg font-bold" style={{ color: colors.negative }}>{formatCurrency(monthlyTotal, currency)}</p>
            <p className="text-[10px] mt-0.5" style={{ color: colors.textMuted }}>{activeOnly.length} active</p>
          </div>
          <div className="rounded-2xl p-4" style={cardStyle}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: colors.textMuted }}>Annual Cost</p>
            <p className="text-lg font-bold" style={{ color: colors.textPrimary }}>{formatCurrency(yearlyTotal, currency)}</p>
            <p className="text-[10px] mt-0.5" style={{ color: colors.textMuted }}>Total yearly spend</p>
          </div>
          {upcoming.length > 0 && (
            <div className="col-span-2 rounded-2xl p-4" style={{ background: colors.amberSoft, border: `1px solid ${colors.amber}28` }}>
              <div className="flex items-center gap-1.5 mb-2">
                <Calendar size={13} style={{ color: colors.amber }} />
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.amber }}>Due This Week</p>
              </div>
              {upcoming.slice(0, 2).map(s => (
                <div key={s.id} className="flex justify-between text-xs mt-1">
                  <span className="font-medium truncate" style={{ color: colors.textSecondary }}>{s.name}</span>
                  <span className="font-bold ml-2 flex-shrink-0" style={{ color: colors.amber }}>{formatNextPayment(s.nextPaymentDate)}</span>
                </div>
              ))}
              {upcoming.length > 2 && (
                <p className="text-[10px] mt-1" style={{ color: colors.textMuted }}>+{upcoming.length - 2} more</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="rounded-2xl p-5 space-y-4" style={cardStyle}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold" style={{ color: colors.textPrimary }}>
              {editingId ? 'Edit Subscription' : 'Add Subscription'}
            </p>
            <button onClick={cancelForm} className="cursor-pointer" style={{ color: colors.textMuted }}>
              <X size={16} />
            </button>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: colors.textMuted }}>Subscription Name *</label>
            <input
              type="text"
              placeholder="e.g. Netflix, Spotify, iCloud…"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input-dark w-full px-3 py-2.5 rounded-xl text-sm"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: colors.textMuted }}>Amount *</label>
              <input
                type="number"
                placeholder="0.00"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="input-dark w-full px-3 py-2.5 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: colors.textMuted }}>Frequency</label>
              <div className="flex gap-1.5">
                {(['weekly', 'monthly', 'yearly'] as SubscriptionFrequency[]).map(freq => (
                  <button
                    key={freq}
                    onClick={() => setForm(f => ({ ...f, frequency: freq }))}
                    className="flex-1 py-2 rounded-xl text-[10px] font-semibold capitalize cursor-pointer transition-all"
                    style={form.frequency === freq
                      ? { background: colors.accentSoft, border: `1px solid ${colors.accent}40`, color: colors.accent }
                      : { background: colors.bgSecondary, border: `1px solid ${colors.borderStrong}`, color: colors.textSecondary }}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: colors.textMuted }}>Next Payment Date *</label>
              <input
                type="date"
                value={form.nextPaymentDate}
                onChange={e => setForm(f => ({ ...f, nextPaymentDate: e.target.value }))}
                className="input-dark w-full px-3 py-2.5 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: colors.textMuted }}>Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="input-dark w-full px-3 py-2.5 rounded-xl text-sm appearance-none"
              >
                {EXPENSE_CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {formError && (
            <p className="text-xs flex items-center gap-1.5" style={{ color: colors.negative }}>
              <AlertTriangle size={12} /> {formError}
            </p>
          )}

          <div className="flex gap-2">
            <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-xl text-sm font-bold btn-primary cursor-pointer flex items-center justify-center gap-1.5">
              <Check size={14} /> {editingId ? 'Save Changes' : 'Add Subscription'}
            </button>
            <button onClick={cancelForm} className="px-4 py-2.5 rounded-xl text-sm cursor-pointer"
              style={{ background: colors.bgSecondary, border: `1px solid ${colors.borderStrong}`, color: colors.textMuted }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Subscriptions List */}
      {subscriptions.length === 0 ? (
        <div className="rounded-3xl p-10 text-center" style={cardStyle}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: colors.negativeSoft, border: `1px solid ${colors.negative}28` }}>
            <RefreshCw size={28} style={{ color: colors.negative }} />
          </div>
          <h3 className="font-bold text-sm mb-1" style={{ color: colors.textSecondary }}>No subscriptions yet</h3>
          <p className="text-xs mb-5 leading-relaxed" style={{ color: colors.textMuted }}>
            Add your recurring payments to track monthly costs and never miss a billing date.
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary px-5 py-2.5 rounded-xl text-sm cursor-pointer inline-flex items-center gap-2">
            <Plus size={14} /> Add First Subscription
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {subscriptions.map(sub => {
            const days = getDaysUntil(sub.nextPaymentDate);
            const isDueSoon = sub.isActive && days <= 3 && days >= 0;
            const isOverdue = sub.isActive && days < 0;
            const monthly = toMonthlyAmount(sub.amount, sub.frequency);

            return (
              <div
                key={sub.id}
                className="rounded-2xl overflow-hidden"
                style={{ ...cardStyle, opacity: sub.isActive ? 1 : 0.6 }}
              >
                <div className="flex items-center gap-3.5 px-4 py-4">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: sub.isActive ? colors.negativeSoft : colors.bgSecondary,
                      border: `1px solid ${sub.isActive ? colors.negative + '28' : colors.borderStrong}`,
                    }}
                  >
                    <RefreshCw size={16} style={{ color: sub.isActive ? colors.negative : colors.textMuted }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm truncate" style={{ color: colors.textPrimary }}>{sub.name}</span>
                      {!sub.isActive && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                          style={{ background: colors.bgSecondary, color: colors.textMuted, border: `1px solid ${colors.borderStrong}` }}>Paused</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[11px]" style={{ color: colors.textMuted }}>{sub.category}</span>
                      <span className="text-[11px]" style={{ color: colors.borderStrong }}>·</span>
                      <span className="text-[11px]" style={{ color: colors.textMuted }}>{FREQ_LABELS[sub.frequency]}</span>
                      {sub.isActive && (
                        <>
                          <span className="text-[11px]" style={{ color: colors.borderStrong }}>·</span>
                          <span className="text-[11px] font-semibold" style={{
                            color: isOverdue ? colors.negative : isDueSoon ? colors.amber : colors.textMuted,
                          }}>
                            {isOverdue ? 'Overdue' : formatNextPayment(sub.nextPaymentDate)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm" style={{ color: colors.textPrimary }}>{formatCurrency(sub.amount, currency)}</p>
                    {sub.frequency !== 'monthly' && (
                      <p className="text-[10px]" style={{ color: colors.textMuted }}>{formatCurrency(monthly, currency)}/mo</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleToggle(sub.id)}
                      className="p-1.5 rounded-lg cursor-pointer transition-colors"
                      title={sub.isActive ? 'Pause subscription' : 'Resume subscription'}
                      style={{ color: sub.isActive ? colors.accent : colors.textMuted }}
                    >
                      <Power size={14} />
                    </button>
                    <button onClick={() => handleEdit(sub)} className="p-1.5 cursor-pointer" style={{ color: colors.textMuted }}>
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => handleDelete(sub.id)} className="p-1.5 cursor-pointer" style={{ color: colors.negative }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {!showForm && (
            <button
              onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold cursor-pointer"
              style={{ border: `2px dashed ${colors.negative}30`, background: colors.negativeSoft, color: colors.negative }}
            >
              <Plus size={18} /> Add Subscription
            </button>
          )}
        </div>
      )}
    </div>
  );
};
