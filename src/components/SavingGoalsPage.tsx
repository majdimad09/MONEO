import React, { useState } from 'react';
import { Flag, Plus, Edit2, Trash2, PlusCircle, X, Check, AlertTriangle } from 'lucide-react';
import { SavingGoal } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { useTheme } from '../context/ThemeContext';

interface SavingGoalsPageProps {
  currency: string;
  goals: SavingGoal[];
  onSaveGoals: (goals: SavingGoal[]) => void;
}

function getMonthsRemaining(targetDate: string): number {
  const [year, month] = targetDate.split('-').map(Number);
  const now = new Date();
  return (year - now.getFullYear()) * 12 + (month - (now.getMonth() + 1));
}

function getMonthLabel(dateStr: string): string {
  const [year, month] = dateStr.split('-').map(Number);
  return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getTodayMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

const GOAL_COLORS = ['#6366f1', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#3b82f6', '#ef4444'];
const emptyForm = { name: '', targetAmount: '', currentAmount: '', targetDate: getTodayMonth() };

export const SavingGoalsPage: React.FC<SavingGoalsPageProps> = ({ currency, goals, onSaveGoals }) => {
  const { isDark, colors } = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addMoneyId, setAddMoneyId] = useState<string | null>(null);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [formError, setFormError] = useState('');

  const colorForIndex = (i: number) => GOAL_COLORS[i % GOAL_COLORS.length];

  const cardStyle = {
    background: isDark ? colors.bgCard : '#ffffff',
    border: `1px solid ${isDark ? colors.border : 'rgba(99,102,241,0.10)'}`,
    boxShadow: isDark ? 'none' : '0 2px 16px rgba(99,102,241,0.06)',
    borderRadius: 20,
  };

  const handleSubmit = () => {
    const target = parseFloat(form.targetAmount);
    const current = parseFloat(form.currentAmount) || 0;
    if (!form.name.trim()) { setFormError('Please enter a goal name.'); return; }
    if (isNaN(target) || target <= 0) { setFormError('Please enter a valid target amount.'); return; }
    if (!form.targetDate) { setFormError('Please select a target date.'); return; }

    if (editingId) {
      onSaveGoals(goals.map(g => g.id === editingId
        ? { ...g, name: form.name.trim(), targetAmount: target, currentAmount: current, targetDate: form.targetDate }
        : g
      ));
      setEditingId(null);
    } else {
      const newGoal: SavingGoal = {
        id: 'goal-' + Date.now(),
        name: form.name.trim(),
        targetAmount: target,
        currentAmount: current,
        targetDate: form.targetDate,
        createdAt: Date.now(),
      };
      onSaveGoals([...goals, newGoal]);
    }
    setForm(emptyForm);
    setShowForm(false);
    setFormError('');
  };

  const handleEdit = (g: SavingGoal) => {
    setForm({ name: g.name, targetAmount: g.targetAmount.toString(), currentAmount: g.currentAmount.toString(), targetDate: g.targetDate });
    setEditingId(g.id);
    setShowForm(true);
    setFormError('');
  };

  const handleDelete = (id: string) => {
    onSaveGoals(goals.filter(g => g.id !== id));
  };

  const handleAddMoney = (id: string) => {
    const v = parseFloat(addMoneyAmount);
    if (isNaN(v) || v <= 0) return;
    onSaveGoals(goals.map(g => g.id === id
      ? { ...g, currentAmount: Math.min(g.currentAmount + v, g.targetAmount) }
      : g
    ));
    setAddMoneyId(null);
    setAddMoneyAmount('');
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
  };

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount).length;

  return (
    <div className="page-enter px-4 pt-3 pb-8 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Saving Goals</h2>
          {goals.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: colors.brandSoft, color: colors.brand }}>
              {goals.length}
            </span>
          )}
        </div>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
            className="flex items-center gap-1.5 text-xs font-bold cursor-pointer px-3 py-1.5 rounded-xl btn-primary"
          >
            <Plus size={14} /> New Goal
          </button>
        )}
      </div>

      {/* Summary stat row */}
      {goals.length > 0 && (
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'Goals', value: `${goals.length}`, color: colors.brand, soft: colors.brandSoft },
            { label: 'Saved', value: formatCurrency(totalSaved, currency), color: colors.positive, soft: colors.positiveSoft },
            { label: 'Completed', value: `${completedGoals}`, color: '#fbbf24', soft: colors.amberSoft },
          ].map(({ label, value, color, soft }) => (
            <div key={label} className="rounded-2xl p-3 text-center" style={{ background: soft, border: `1px solid ${color}22` }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color }}>{label}</p>
              <p className="text-sm font-bold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="rounded-2xl p-5 space-y-4" style={cardStyle}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold" style={{ color: colors.textPrimary }}>
              {editingId ? 'Edit Goal' : 'New Savings Goal'}
            </p>
            <button onClick={cancelForm} className="cursor-pointer" style={{ color: colors.textMuted }}>
              <X size={16} />
            </button>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: colors.textMuted }}>Goal Name *</label>
            <input
              type="text"
              placeholder="e.g. New Laptop, Emergency Fund, Vacation…"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input-dark w-full px-3 py-2.5 rounded-xl text-sm"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: colors.textMuted }}>Target Amount *</label>
              <input
                type="number"
                placeholder="0.00"
                value={form.targetAmount}
                onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))}
                className="input-dark w-full px-3 py-2.5 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: colors.textMuted }}>Already Saved</label>
              <input
                type="number"
                placeholder="0.00"
                value={form.currentAmount}
                onChange={e => setForm(f => ({ ...f, currentAmount: e.target.value }))}
                className="input-dark w-full px-3 py-2.5 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: colors.textMuted }}>Target Date (Month) *</label>
            <input
              type="month"
              value={form.targetDate}
              onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))}
              className="input-dark w-full px-3 py-2.5 rounded-xl text-sm"
            />
          </div>

          {formError && (
            <p className="text-xs flex items-center gap-1.5" style={{ color: colors.negative }}>
              <AlertTriangle size={12} /> {formError}
            </p>
          )}

          <div className="flex gap-2">
            <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-xl text-sm font-bold btn-primary cursor-pointer flex items-center justify-center gap-1.5">
              <Check size={14} /> {editingId ? 'Save Changes' : 'Add Goal'}
            </button>
            <button onClick={cancelForm} className="px-4 py-2.5 rounded-xl text-sm cursor-pointer" style={{ background: colors.bgSecondary, border: `1px solid ${colors.borderStrong}`, color: colors.textMuted }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="rounded-3xl p-10 text-center" style={cardStyle}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: colors.brandSoft, border: `1px solid ${colors.brand}28` }}>
            <Flag size={28} style={{ color: colors.brand }} />
          </div>
          <h3 className="font-bold text-sm mb-1" style={{ color: colors.textSecondary }}>No goals yet</h3>
          <p className="text-xs mb-5 leading-relaxed" style={{ color: colors.textMuted }}>
            Create a saving goal to start tracking your progress toward it.
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary px-5 py-2.5 rounded-xl text-sm cursor-pointer inline-flex items-center gap-2">
            <Plus size={14} /> Add Your First Goal
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal, i) => {
            const color = colorForIndex(i);
            const pct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const remaining = goal.targetAmount - goal.currentAmount;
            const monthsLeft = getMonthsRemaining(goal.targetDate);
            const monthlyNeeded = monthsLeft > 0 ? remaining / monthsLeft : null;
            const isComplete = goal.currentAmount >= goal.targetAmount;
            const isOverdue = monthsLeft < 0 && !isComplete;

            return (
              <div key={goal.id} className="rounded-2xl overflow-hidden relative" style={cardStyle}>
                {/* Color accent top bar */}
                <div className="h-1 w-full" style={{ background: color }} />

                <div className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}18`, border: `1px solid ${color}28` }}
                      >
                        <Flag size={17} style={{ color }} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm" style={{ color: colors.textPrimary }}>{goal.name}</h4>
                        <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>Target: {getMonthLabel(goal.targetDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(goal)}
                        className="p-1.5 rounded-lg cursor-pointer"
                        style={{ color: colors.textMuted }}>
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDelete(goal.id)}
                        className="p-1.5 rounded-lg cursor-pointer"
                        style={{ color: colors.negative }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold" style={{ color: colors.textPrimary }}>{formatCurrency(goal.currentAmount, currency)}</span>
                      <span className="text-xs" style={{ color: colors.textMuted }}>of {formatCurrency(goal.targetAmount, currency)}</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(pct, 100)}%`,
                        background: color,
                        boxShadow: `0 0 8px ${color}60`,
                        borderRadius: 9999,
                        transition: 'width 1s ease',
                      }} />
                    </div>
                    <p className="text-[11px] mt-1" style={{ color: colors.textMuted }}>{pct.toFixed(1)}% of goal reached</p>
                  </div>

                  {/* Stats */}
                  {isComplete ? (
                    <div className="rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5"
                      style={{ background: colors.positiveSoft, border: `1px solid ${colors.positive}28`, color: colors.positive }}>
                      <Check size={13} /> Goal achieved!
                    </div>
                  ) : isOverdue ? (
                    <div className="rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5"
                      style={{ background: colors.negativeSoft, border: `1px solid ${colors.negative}28`, color: colors.negative }}>
                      <AlertTriangle size={13} />
                      Overdue — {formatCurrency(remaining, currency)} still needed
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl p-2.5 text-center" style={{ background: colors.bgSecondary, border: `1px solid ${colors.borderStrong}` }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: colors.textMuted }}>Remaining</p>
                        <p className="font-bold" style={{ color: colors.textPrimary }}>{formatCurrency(remaining, currency)}</p>
                      </div>
                      <div className="rounded-xl p-2.5 text-center" style={{ background: colors.bgSecondary, border: `1px solid ${colors.borderStrong}` }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: colors.textMuted }}>Months Left</p>
                        <p className="font-bold" style={{ color: colors.textPrimary }}>{monthsLeft}</p>
                      </div>
                      {monthlyNeeded !== null && (
                        <div className="col-span-2 rounded-xl p-2.5 text-center" style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                          <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color }}>Recommended monthly saving</p>
                          <p className="font-bold" style={{ color }}>{formatCurrency(monthlyNeeded, currency)}/mo</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add Money */}
                  {!isComplete && (
                    <div className="mt-3">
                      {addMoneyId === goal.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            placeholder="Amount to add…"
                            value={addMoneyAmount}
                            onChange={e => setAddMoneyAmount(e.target.value)}
                            className="input-dark flex-1 px-3 py-1.5 rounded-lg text-xs"
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && handleAddMoney(goal.id)}
                          />
                          <button onClick={() => handleAddMoney(goal.id)} className="btn-primary px-3 py-1.5 rounded-lg text-xs cursor-pointer">Add</button>
                          <button onClick={() => setAddMoneyId(null)} className="cursor-pointer" style={{ color: colors.textMuted }}>
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setAddMoneyId(goal.id); setAddMoneyAmount(''); }}
                          className="w-full text-xs font-semibold py-2 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                          style={{ border: `1.5px dashed ${color}40`, color, background: `${color}08` }}
                        >
                          <PlusCircle size={13} /> Add Money
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add new goal button */}
          {!showForm && (
            <button
              onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold cursor-pointer"
              style={{ border: `2px dashed ${colors.brand}30`, background: colors.brandSoft, color: colors.brand }}
            >
              <Plus size={18} /> Add Another Goal
            </button>
          )}
        </div>
      )}

      {totalTarget > 0 && (
        <p className="text-center text-[10px]" style={{ color: colors.textMuted }}>
          {formatCurrency(totalSaved, currency)} saved of {formatCurrency(totalTarget, currency)} total target
        </p>
      )}
    </div>
  );
};
