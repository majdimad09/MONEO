import React, { useState } from 'react';
import {
  DollarSign, Plus, Pause, Play, Trash2, ChevronLeft,
  Edit2, X, Check, Calendar,
} from 'lucide-react';
import { RecurringIncome, RecurringIncomeFrequency } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { frequencyLabel, getNextOccurrence, monthlyEquivalent } from '../utils/recurringUtils';
import { AppView } from '../types/finance';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '../context/NavigationContext';

interface RecurringIncomeScreenProps {
  items: RecurringIncome[];
  currency: string;
  onSave: (items: RecurringIncome[]) => void;
  onNavigate: (view: AppView) => void;
}

const BLANK: Omit<RecurringIncome, 'id' | 'createdAt'> = {
  name: '',
  amount: 0,
  frequency: 'monthly',
  nextPaymentDate: new Date().toISOString().split('T')[0],
  category: 'Salary',
  isActive: true,
};

export const RecurringIncomeScreen: React.FC<RecurringIncomeScreenProps> = ({
  items, currency, onSave, onNavigate,
}) => {
  const { colors } = useTheme();
  const { goBack } = useNavigation();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...BLANK, amount: '' as string | number });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const totalMonthly = items.filter(i => i.isActive).reduce(
    (s, i) => s + monthlyEquivalent(i.amount, i.frequency), 0
  );

  const openAdd = () => {
    setEditId(null);
    setForm({ ...BLANK, amount: '', nextPaymentDate: new Date().toISOString().split('T')[0] });
    setShowForm(true);
  };

  const openEdit = (item: RecurringIncome) => {
    setEditId(item.id);
    setForm({ ...item, amount: item.amount });
    setShowForm(true);
  };

  const saveForm = () => {
    if (!form.name.trim() || !form.amount || parseFloat(String(form.amount)) <= 0) return;
    const amt = parseFloat(String(form.amount));
    if (editId) {
      onSave(items.map(i => i.id === editId ? { ...i, ...form, amount: amt } : i));
    } else {
      const newItem: RecurringIncome = {
        ...form,
        amount: amt,
        id: 'ri-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        createdAt: Date.now(),
      };
      onSave([...items, newItem]);
    }
    setShowForm(false);
    setEditId(null);
  };

  const toggleActive = (id: string) => {
    onSave(items.map(i => i.id === id ? { ...i, isActive: !i.isActive } : i));
  };

  const deleteItem = (id: string) => {
    onSave(items.filter(i => i.id !== id));
    setDeleteId(null);
  };

  const inputBase = 'input-dark w-full px-3 py-2.5 rounded-xl text-sm';
  const selectBase = inputBase + ' appearance-none cursor-pointer';

  return (
    <div className="page-enter px-4 pt-3 pb-8">

      {/* Header */}
      <div className="flex items-center gap-3 pt-1 mb-5">
        <button onClick={goBack} className="cursor-pointer" style={{ color: colors.textMuted }}>
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold leading-none" style={{ color: colors.textPrimary }}>Recurring Income</h1>
          <p className="text-[10px] mt-0.5" style={{ color: colors.textMuted }}>Set up salary & income you receive regularly</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer btn-primary text-xs font-bold"
        >
          <Plus size={13} /> Add
        </button>
      </div>

      {/* Total */}
      {items.length > 0 && (
        <div
          className="rounded-2xl p-4 mb-5 flex items-center justify-between"
          style={{ background: colors.positiveSoft, border: `1px solid ${colors.positive}28` }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.positive }}>Expected Monthly</p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: colors.textPrimary }}>{formatCurrency(totalMonthly, currency)}</p>
          </div>
          <DollarSign size={28} style={{ color: `${colors.positive}60` }} />
        </div>
      )}

      {/* Add / Edit form */}
      {showForm && (
        <div
          className="card-dark rounded-2xl p-4 mb-5 space-y-3"
          style={{ border: `1px solid ${colors.accent}30` }}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-bold" style={{ color: colors.textPrimary }}>{editId ? 'Edit Income' : 'New Recurring Income'}</p>
            <button onClick={() => setShowForm(false)} className="cursor-pointer" style={{ color: colors.textMuted }}>
              <X size={16} />
            </button>
          </div>

          {/* Name */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: colors.textMuted }}>Name</label>
            <input
              type="text"
              placeholder="e.g. Monthly Salary"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className={inputBase}
            />
          </div>

          {/* Amount + Frequency */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: colors.textMuted }}>Amount</label>
              <input
                type="number"
                placeholder="0.00"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className={inputBase}
                min={0}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: colors.textMuted }}>Frequency</label>
              <select
                value={form.frequency}
                onChange={e => setForm(f => ({ ...f, frequency: e.target.value as RecurringIncomeFrequency }))}
                className={selectBase}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23cbd5e1' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                  backgroundSize: '16px',
                  paddingRight: '2rem',
                }}
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Biweekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          {/* Next payment date */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: colors.textMuted }}>
              Next Payment Date
            </label>
            <input
              type="date"
              value={form.nextPaymentDate}
              onChange={e => setForm(f => ({ ...f, nextPaymentDate: e.target.value }))}
              className={inputBase + ' input-dark'}
            />
          </div>

          {/* Save */}
          <button
            onClick={saveForm}
            disabled={!form.name.trim() || !form.amount || parseFloat(String(form.amount)) <= 0}
            className="w-full py-2.5 rounded-xl text-sm font-bold btn-primary cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Check size={14} /> {editId ? 'Save Changes' : 'Add Income'}
          </button>
        </div>
      )}

      {/* List */}
      {items.length === 0 && !showForm ? (
        <div
          className="rounded-2xl px-4 py-10 text-center"
          style={{ background: colors.bgCard, border: `1px solid ${colors.borderStrong}` }}
        >
          <DollarSign size={28} className="mx-auto mb-3" style={{ color: colors.textMuted }} />
          <p className="text-sm font-semibold mb-1" style={{ color: colors.textSecondary }}>No recurring income yet</p>
          <p className="text-xs mb-4" style={{ color: colors.textMuted }}>
            Add your salary or any income you receive regularly so Moneo can track it automatically.
          </p>
          <button onClick={openAdd} className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer">
            Add Recurring Income
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map(item => {
            const nextDate = getNextOccurrence(item.nextPaymentDate, item.frequency);
            const monthly = monthlyEquivalent(item.amount, item.frequency);
            return (
              <div
                key={item.id}
                className="card-dark rounded-2xl overflow-hidden"
                style={!item.isActive ? { opacity: 0.6 } : undefined}
              >
                {deleteId === item.id ? (
                  <div className="p-4 space-y-3">
                    <p className="text-sm font-bold" style={{ color: colors.negative }}>Remove "{item.name}"?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDeleteId(null)}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                        style={{ background: colors.bgCard, border: `1px solid ${colors.borderStrong}`, color: colors.textMuted }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer"
                        style={{ background: '#dc2626', color: '#fff' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: colors.positiveSoft, border: `1px solid ${colors.positive}28` }}
                        >
                          <DollarSign size={16} style={{ color: colors.positive }} />
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={{ color: colors.textPrimary }}>{item.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
                            {frequencyLabel(item.frequency)}
                            {item.frequency !== 'monthly' && ` · ${formatCurrency(monthly, currency)}/mo`}
                          </p>
                        </div>
                      </div>
                      <p className="text-base font-bold" style={{ color: colors.positive }}>{formatCurrency(item.amount, currency)}</p>
                    </div>

                    <div className="flex items-center gap-1.5 mb-3">
                      <Calendar size={11} style={{ color: colors.textMuted }} />
                      <p className="text-[10px]" style={{ color: colors.textMuted }}>
                        {item.isActive ? `Next: ${nextDate}` : 'Paused'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer"
                        style={{ background: colors.bgSecondary, border: `1px solid ${colors.borderStrong}`, color: colors.textMuted }}
                      >
                        <Edit2 size={11} /> Edit
                      </button>
                      <button
                        onClick={() => toggleActive(item.id)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer"
                        style={item.isActive
                          ? { background: colors.amberSoft, border: `1px solid ${colors.amber}28`, color: colors.amber }
                          : { background: colors.positiveSoft, border: `1px solid ${colors.positive}28`, color: colors.positive }
                        }
                      >
                        {item.isActive ? <><Pause size={11} /> Pause</> : <><Play size={11} /> Resume</>}
                      </button>
                      <button
                        onClick={() => setDeleteId(item.id)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer ml-auto"
                        style={{ background: colors.negativeSoft, border: `1px solid ${colors.negative}28`, color: colors.negative }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
