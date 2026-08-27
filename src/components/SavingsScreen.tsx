import React, { useState } from 'react';
import {
  Plus, Edit2, Trash2, PlusCircle, X, Check, AlertTriangle, Target, Flag,
} from 'lucide-react';
import { SavingGoal } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { useTheme } from '../context/ThemeContext';

interface SavingsScreenProps {
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

const GOAL_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#6366f1', '#ef4444'];

const emptyForm = { name: '', targetAmount: '', currentAmount: '', targetDate: getTodayMonth() };

export const SavingsScreen: React.FC<SavingsScreenProps> = ({ currency, goals, onSaveGoals }) => {
  const { colors } = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addMoneyId, setAddMoneyId] = useState<string | null>(null);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [formError, setFormError] = useState('');

  const colorFor = (i: number) => GOAL_COLORS[i % GOAL_COLORS.length];

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const completedCount = goals.filter(g => g.currentAmount >= g.targetAmount).length;

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
      onSaveGoals([...goals, {
        id: 'goal-' + Date.now(),
        name: form.name.trim(),
        targetAmount: target,
        currentAmount: current,
        targetDate: form.targetDate,
        createdAt: Date.now(),
      }]);
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

  const handleDelete = (id: string) => onSaveGoals(goals.filter(g => g.id !== id));

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

  const cancelForm = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); setFormError(''); };

  return (
    <div className="page-enter px-4 pt-3 pb-6 space-y-5">

      {/* Summary header */}
      {goals.length > 0 && (
        <div className="card-float-1">
          <div className="grid grid-cols-3 gap-3">
            <div className="card-dark rounded-2xl p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Saved</p>
              <p className="text-sm font-bold text-green-400">{formatCurrency(totalSaved, currency)}</p>
            </div>
            <div className="card-dark rounded-2xl p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Target</p>
              <p className="text-sm font-bold text-slate-900">{formatCurrency(totalTarget, currency)}</p>
            </div>
            <div className="card-dark rounded-2xl p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Done</p>
              <p className="text-sm font-bold text-blue-400">{completedCount}/{goals.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit form */}
      {showForm && (
        <div className="card-dark rounded-2xl p-5">
          <h3 className="font-bold text-slate-800 mb-4 text-sm">{editingId ? 'Edit Goal' : 'New Saving Goal'}</h3>
          <div className="space-y-3">
            <div>
              <label className="section-label mb-1.5 block">Goal Name *</label>
              <input type="text" placeholder="e.g. Emergency Fund, New Laptop..."
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="input-dark w-full px-3 py-2.5 rounded-xl text-sm font-medium" autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="section-label mb-1.5 block">Target Amount *</label>
                <input type="number" placeholder="0.00"
                  value={form.targetAmount} onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))}
                  className="input-dark w-full px-3 py-2.5 rounded-xl text-sm font-medium" />
              </div>
              <div>
                <label className="section-label mb-1.5 block">Already Saved</label>
                <input type="number" placeholder="0.00"
                  value={form.currentAmount} onChange={e => setForm(f => ({ ...f, currentAmount: e.target.value }))}
                  className="input-dark w-full px-3 py-2.5 rounded-xl text-sm font-medium" />
              </div>
            </div>
            <div>
              <label className="section-label mb-1.5 block">Target Date *</label>
              <input type="month" value={form.targetDate}
                onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))}
                className="input-dark w-full px-3 py-2.5 rounded-xl text-sm font-medium" />
            </div>
          </div>
          {formError && (
            <p className="text-xs text-red-400 mt-3 flex items-center gap-1.5">
              <AlertTriangle size={13} />{formError}
            </p>
          )}
          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} className="btn-blue flex-1 py-2.5 rounded-xl text-sm cursor-pointer flex items-center justify-center gap-1.5">
              <Check size={15} /> {editingId ? 'Save Changes' : 'Add Goal'}
            </button>
            <button onClick={cancelForm} className="px-4 py-2.5 text-sm text-slate-400 rounded-xl cursor-pointer"
              style={{ background: colors.bgCard }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Goals */}
      {goals.length === 0 ? (
        <div className="card-dark rounded-3xl p-10 text-center card-float-2">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <Flag size={28} className="text-blue-400" />
          </div>
          <h3 className="font-bold text-slate-600 mb-2">No saving goals yet</h3>
          <p className="text-sm text-slate-500 mb-5 leading-relaxed">
            Set a financial goal to start tracking your progress toward it.
          </p>
          <button onClick={() => setShowForm(true)} className="btn-blue px-6 py-2.5 rounded-xl text-sm cursor-pointer inline-flex items-center gap-2">
            <Plus size={16} /> Create First Goal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal, i) => {
            const color = colorFor(i);
            const pct = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
            const remaining = goal.targetAmount - goal.currentAmount;
            const monthsLeft = getMonthsRemaining(goal.targetDate);
            const monthlyNeeded = monthsLeft > 0 && remaining > 0 ? remaining / monthsLeft : null;
            const isComplete = goal.currentAmount >= goal.targetAmount;
            const isOverdue = monthsLeft < 0 && !isComplete;

            return (
              <div key={goal.id} className="card-dark rounded-3xl overflow-hidden" style={{ animationDelay: `${i * 0.08}s` }}>
                {/* Color top bar */}
                <div className="h-1" style={{ background: color }} />

                <div className="p-5">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                        style={{ background: `${color}18`, border: `1px solid ${color}28` }}>
                        <Target size={18} style={{ color }} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{goal.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Target: {getMonthLabel(goal.targetDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(goal)} className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-blue-400 transition-colors cursor-pointer">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(goal.id)} className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-red-400 transition-colors cursor-pointer">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-slate-800">{formatCurrency(goal.currentAmount, currency)}</span>
                      <span className="text-sm text-slate-500 font-medium">/ {formatCurrency(goal.targetAmount, currency)}</span>
                    </div>
                    <div className="progress-track h-3">
                      <div className="progress-fill" style={{
                        width: `${pct}%`,
                        background: isComplete ? '#10b981' : color,
                        boxShadow: `0 0 10px ${isComplete ? '#10b981' : color}50`,
                      }} />
                    </div>
                    <p className="text-[11px] mt-1.5 font-medium" style={{ color: isComplete ? '#10b981' : '#64748b' }}>
                      {pct.toFixed(1)}% complete
                    </p>
                  </div>

                  {/* Status */}
                  {isComplete ? (
                    <div className="rounded-2xl px-4 py-3 flex items-center gap-2 mb-3"
                      style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <Check size={16} className="text-green-400" />
                      <span className="text-sm font-bold text-green-400">🎉 Goal reached!</span>
                    </div>
                  ) : isOverdue ? (
                    <div className="rounded-2xl px-4 py-3 flex items-center gap-2 mb-3"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <AlertTriangle size={14} className="text-red-400" />
                      <span className="text-xs font-bold text-red-400">Overdue — {formatCurrency(remaining, currency)} still needed</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5 mb-3">
                      <div className="rounded-xl p-2.5" style={{ background: colors.bgSecondary, border: `1px solid ${colors.borderStrong}` }}>
                        <p className="text-[10px] text-slate-500 font-semibold mb-0.5">Remaining</p>
                        <p className="text-sm font-bold text-slate-700">{formatCurrency(remaining, currency)}</p>
                      </div>
                      <div className="rounded-xl p-2.5" style={{ background: colors.bgSecondary, border: `1px solid ${colors.borderStrong}` }}>
                        <p className="text-[10px] text-slate-500 font-semibold mb-0.5">Months left</p>
                        <p className="text-sm font-bold text-slate-700">{monthsLeft}</p>
                      </div>
                      {monthlyNeeded !== null && (
                        <div className="col-span-2 rounded-xl p-2.5 text-center"
                          style={{ background: `${color}12`, border: `1px solid ${color}28` }}>
                          <p className="text-[10px] font-bold" style={{ color }}>Recommended monthly saving</p>
                          <p className="text-sm font-bold text-slate-800 mt-0.5">{formatCurrency(monthlyNeeded, currency)}/mo</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add money */}
                  {!isComplete && (
                    addMoneyId === goal.id ? (
                      <div className="flex items-center gap-2">
                        <input type="number" placeholder="Amount to add..."
                          value={addMoneyAmount} onChange={e => setAddMoneyAmount(e.target.value)}
                          className="input-dark flex-1 px-3 py-2 rounded-xl text-sm" autoFocus
                          onKeyDown={e => e.key === 'Enter' && handleAddMoney(goal.id)} />
                        <button onClick={() => handleAddMoney(goal.id)} className="btn-blue px-4 py-2 rounded-xl text-sm cursor-pointer">Add</button>
                        <button onClick={() => setAddMoneyId(null)} className="text-slate-500 cursor-pointer"><X size={16} /></button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setAddMoneyId(goal.id); setAddMoneyAmount(''); }}
                        className="w-full py-2.5 rounded-xl text-xs font-bold text-blue-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        style={{ border: '1px dashed rgba(59,130,246,0.35)' }}
                      >
                        <PlusCircle size={14} /> Add Money
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}

          {/* Add new goal */}
          {!showForm && (
            <button
              onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-blue-400 transition-colors cursor-pointer"
              style={{ border: '2px dashed rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.04)' }}
            >
              <Plus size={18} /> Add New Goal
            </button>
          )}
        </div>
      )}
    </div>
  );
};
