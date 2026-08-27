import React, { useState } from 'react';
import { Flag, Plus, Edit2, Trash2, PlusCircle, X, Check, AlertTriangle } from 'lucide-react';
import { SavingGoal } from '../types/finance';
import { formatCurrency } from '../utils/formatters';

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

const GOAL_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#6366f1', '#ef4444'];

const emptyForm = { name: '', targetAmount: '', currentAmount: '', targetDate: getTodayMonth() };

export const SavingGoalsPage: React.FC<SavingGoalsPageProps> = ({ currency, goals, onSaveGoals }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addMoneyId, setAddMoneyId] = useState<string | null>(null);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [formError, setFormError] = useState('');

  const colorForIndex = (i: number) => GOAL_COLORS[i % GOAL_COLORS.length];

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Saving Goals</h2>
          <p className="text-sm text-slate-500 mt-1">Set financial goals and track your progress toward them.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
          className="btn-blue px-4 py-2 rounded-xl text-sm cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Goal
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card-dark rounded-2xl p-6">
          <h3 className="font-bold text-slate-800 mb-4">{editingId ? 'Edit Goal' : 'Add New Goal'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className="section-label mb-1.5 block">Goal Name *</label>
              <input
                type="text"
                placeholder="e.g. New Laptop, Emergency Fund, Vacation..."
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="input-dark w-full px-3 py-2 rounded-xl text-sm font-medium"
              />
            </div>
            <div>
              <label className="section-label mb-1.5 block">Target Amount *</label>
              <input
                type="number"
                placeholder="0.00"
                value={form.targetAmount}
                onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))}
                className="input-dark w-full px-3 py-2 rounded-xl text-sm font-medium"
              />
            </div>
            <div>
              <label className="section-label mb-1.5 block">Already Saved</label>
              <input
                type="number"
                placeholder="0.00"
                value={form.currentAmount}
                onChange={e => setForm(f => ({ ...f, currentAmount: e.target.value }))}
                className="input-dark w-full px-3 py-2 rounded-xl text-sm font-medium"
              />
            </div>
            <div>
              <label className="section-label mb-1.5 block">Target Date (Month) *</label>
              <input
                type="month"
                value={form.targetDate}
                onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))}
                className="input-dark w-full px-3 py-2 rounded-xl text-sm font-medium"
              />
            </div>
          </div>
          {formError && (
            <p className="text-xs text-red-400 mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />{formError}
            </p>
          )}
          <div className="flex items-center gap-2">
            <button onClick={handleSubmit} className="btn-blue px-5 py-2 rounded-xl text-sm cursor-pointer flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              {editingId ? 'Save Changes' : 'Add Goal'}
            </button>
            <button onClick={cancelForm} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-700 rounded-xl transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="card-dark rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <Flag className="w-7 h-7 text-blue-400" />
          </div>
          <h3 className="font-bold text-slate-600 mb-1">No goals yet</h3>
          <p className="text-sm text-slate-500 mb-4">Create a saving goal to start tracking your progress.</p>
          <button onClick={() => setShowForm(true)} className="btn-blue px-5 py-2 rounded-xl text-sm cursor-pointer">
            + Add Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {goals.map((goal, i) => {
            const color = colorForIndex(i);
            const pct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const remaining = goal.targetAmount - goal.currentAmount;
            const monthsLeft = getMonthsRemaining(goal.targetDate);
            const monthlyNeeded = monthsLeft > 0 ? remaining / monthsLeft : null;
            const isComplete = goal.currentAmount >= goal.targetAmount;
            const isOverdue = monthsLeft < 0 && !isComplete;

            return (
              <div key={goal.id} className="card-dark rounded-2xl p-5 relative overflow-hidden">
                {/* Color accent */}
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: color }} />
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 -mr-6 -mt-6"
                  style={{ background: `radial-gradient(circle, ${color}, transparent)` }} />

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{goal.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Target: {getMonthLabel(goal.targetDate)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(goal)} className="p-1.5 text-slate-500 hover:text-blue-400 transition-colors rounded-lg">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(goal.id)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors rounded-lg">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700">{formatCurrency(goal.currentAmount, currency)}</span>
                    <span className="text-slate-500">/ {formatCurrency(goal.targetAmount, currency)}</span>
                  </div>
                  <div className="progress-track h-2.5">
                    <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: color, boxShadow: `0 0 8px ${color}60` }} />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{pct.toFixed(1)}% of goal reached</p>
                </div>

                {/* Stats */}
                {isComplete ? (
                  <div className="rounded-lg px-3 py-2 text-xs font-semibold text-green-400 flex items-center gap-1.5"
                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <Check className="w-3.5 h-3.5" />
                    Goal achieved!
                  </div>
                ) : isOverdue ? (
                  <div className="rounded-lg px-3 py-2 text-xs font-semibold text-red-400 flex items-center gap-1.5"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Overdue — {formatCurrency(remaining, currency)} still needed
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg p-2" style={{ background: '#0a1424', border: '1px solid #1e2d4a' }}>
                      <p className="text-slate-500 text-[10px] mb-0.5">Remaining</p>
                      <p className="font-bold text-slate-700">{formatCurrency(remaining, currency)}</p>
                    </div>
                    <div className="rounded-lg p-2" style={{ background: '#0a1424', border: '1px solid #1e2d4a' }}>
                      <p className="text-slate-500 text-[10px] mb-0.5">Months left</p>
                      <p className="font-bold text-slate-700">{monthsLeft}</p>
                    </div>
                    {monthlyNeeded !== null && (
                      <div className="col-span-2 rounded-lg p-2 text-center"
                        style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                        <p className="text-[10px] font-semibold mb-0.5" style={{ color }}>Recommended monthly saving</p>
                        <p className="font-bold text-slate-800">{formatCurrency(monthlyNeeded, currency)}/mo</p>
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
                          placeholder="Amount to add..."
                          value={addMoneyAmount}
                          onChange={e => setAddMoneyAmount(e.target.value)}
                          className="input-dark flex-1 px-3 py-1.5 rounded-lg text-xs"
                          autoFocus
                          onKeyDown={e => e.key === 'Enter' && handleAddMoney(goal.id)}
                        />
                        <button onClick={() => handleAddMoney(goal.id)} className="btn-blue px-3 py-1.5 rounded-lg text-xs cursor-pointer">Add</button>
                        <button onClick={() => setAddMoneyId(null)} className="text-slate-500 hover:text-slate-600"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setAddMoneyId(goal.id); setAddMoneyAmount(''); }}
                        className="w-full text-xs font-semibold text-blue-400 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
                        style={{ border: '1px dashed rgba(59,130,246,0.3)' }}
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Add Money
                      </button>
                    )}
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
