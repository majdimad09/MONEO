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

// Palette without blue — green is primary, others for visual variety
const GOAL_COLORS = ['#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#6366f1', '#ef4444', '#f97316'];

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
  const overallPct = totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0;

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

      {/* ── SUMMARY HERO CARD ─────────────────────────── */}
      {goals.length > 0 && (
        <div className="rounded-3xl p-5" style={{
          background: `linear-gradient(135deg, ${colors.accentSoft}, ${colors.brandSoft})`,
          border: `1px solid ${colors.accent}22`,
        }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: colors.textMuted }}>
            Overall Progress
          </p>
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>{formatCurrency(totalSaved, currency)}</p>
              <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>of {formatCurrency(totalTarget, currency)}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold" style={{ color: colors.accent }}>{overallPct.toFixed(1)}%</p>
              <p className="text-[10px]" style={{ color: colors.textMuted }}>{completedCount}/{goals.length} done</p>
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: `${colors.accent}22` }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${overallPct}%`, background: colors.accent, boxShadow: `0 0 8px ${colors.accent}50` }} />
          </div>
        </div>
      )}

      {/* ── ADD / EDIT FORM ───────────────────────────── */}
      {showForm && (
        <div className="card-dark rounded-2xl p-5">
          <h3 className="font-bold mb-4 text-sm" style={{ color: colors.textPrimary }}>{editingId ? 'Edit Goal' : 'New Saving Goal'}</h3>
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
            <p className="text-xs mt-3 flex items-center gap-1.5" style={{ color: colors.negative }}>
              <AlertTriangle size={13} />{formError}
            </p>
          )}
          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit}
              className="btn-primary flex-1 py-2.5 rounded-xl text-sm cursor-pointer flex items-center justify-center gap-1.5">
              <Check size={15} /> {editingId ? 'Save Changes' : 'Add Goal'}
            </button>
            <button onClick={cancelForm} className="px-4 py-2.5 text-sm rounded-xl cursor-pointer"
              style={{ background: colors.bgCard, color: colors.textMuted }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── GOALS ─────────────────────────────────────── */}
      {goals.length === 0 ? (
        <div className="card-dark rounded-3xl p-10 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: colors.accentSoft, border: `1px solid ${colors.accent}28` }}>
            <Flag size={28} style={{ color: colors.accent }} />
          </div>
          <h3 className="font-bold mb-2" style={{ color: colors.textSecondary }}>No saving goals yet</h3>
          <p className="text-sm mb-5 leading-relaxed" style={{ color: colors.textMuted }}>
            Set a financial goal to start tracking your progress toward it.
          </p>
          <button onClick={() => setShowForm(true)}
            className="btn-primary px-6 py-2.5 rounded-xl text-sm cursor-pointer inline-flex items-center gap-2">
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
                        <h4 className="font-bold text-sm" style={{ color: colors.textPrimary }}>{goal.name}</h4>
                        <p className="text-[11px] mt-0.5" style={{ color: colors.textMuted }}>Target: {getMonthLabel(goal.targetDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(goal)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors cursor-pointer"
                        style={{ color: colors.textMuted }}>
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(goal.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors cursor-pointer"
                        style={{ color: colors.textMuted }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold" style={{ color: colors.textPrimary }}>{formatCurrency(goal.currentAmount, currency)}</span>
                      <span className="text-sm font-medium" style={{ color: colors.textMuted }}>/ {formatCurrency(goal.targetAmount, currency)}</span>
                    </div>
                    <div className="progress-track h-3">
                      <div className="progress-fill" style={{
                        width: `${pct}%`,
                        background: isComplete ? colors.positive : color,
                        boxShadow: `0 0 10px ${isComplete ? colors.positive : color}50`,
                      }} />
                    </div>
                    <p className="text-[11px] mt-1.5 font-medium" style={{ color: isComplete ? colors.positive : colors.textMuted }}>
                      {pct.toFixed(1)}% complete
                    </p>
                  </div>

                  {/* Status chips */}
                  {isComplete ? (
                    <div className="rounded-2xl px-4 py-3 flex items-center gap-2 mb-3"
                      style={{ background: colors.positiveSoft, border: `1px solid ${colors.positive}28` }}>
                      <Check size={16} style={{ color: colors.positive }} />
                      <span className="text-sm font-bold" style={{ color: colors.positive }}>Goal reached!</span>
                    </div>
                  ) : isOverdue ? (
                    <div className="rounded-2xl px-4 py-3 flex items-center gap-2 mb-3"
                      style={{ background: colors.negativeSoft, border: `1px solid ${colors.negative}28` }}>
                      <AlertTriangle size={14} style={{ color: colors.negative }} />
                      <span className="text-xs font-bold" style={{ color: colors.negative }}>Overdue — {formatCurrency(remaining, currency)} still needed</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5 mb-3">
                      <div className="rounded-xl p-2.5" style={{ background: colors.bgSecondary, border: `1px solid ${colors.borderStrong}` }}>
                        <p className="text-[10px] font-semibold mb-0.5" style={{ color: colors.textMuted }}>Remaining</p>
                        <p className="text-sm font-bold" style={{ color: colors.textPrimary }}>{formatCurrency(remaining, currency)}</p>
                      </div>
                      <div className="rounded-xl p-2.5" style={{ background: colors.bgSecondary, border: `1px solid ${colors.borderStrong}` }}>
                        <p className="text-[10px] font-semibold mb-0.5" style={{ color: colors.textMuted }}>Months left</p>
                        <p className="text-sm font-bold" style={{ color: colors.textPrimary }}>{monthsLeft}</p>
                      </div>
                      {monthlyNeeded !== null && (
                        <div className="col-span-2 rounded-xl p-2.5 text-center"
                          style={{ background: `${color}12`, border: `1px solid ${color}28` }}>
                          <p className="text-[10px] font-bold" style={{ color }}>Recommended monthly saving</p>
                          <p className="text-sm font-bold mt-0.5" style={{ color: colors.textPrimary }}>{formatCurrency(monthlyNeeded, currency)}/mo</p>
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
                        <button onClick={() => handleAddMoney(goal.id)} className="btn-primary px-4 py-2 rounded-xl text-sm cursor-pointer">Add</button>
                        <button onClick={() => setAddMoneyId(null)} style={{ color: colors.textMuted }} className="cursor-pointer"><X size={16} /></button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setAddMoneyId(goal.id); setAddMoneyAmount(''); }}
                        className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        style={{ border: `1px dashed ${colors.accent}40`, color: colors.accent, background: colors.accentSoft }}
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
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-colors cursor-pointer"
              style={{ border: `2px dashed ${colors.accent}30`, background: colors.accentSoft, color: colors.accent }}
            >
              <Plus size={18} /> Add New Goal
            </button>
          )}
        </div>
      )}
    </div>
  );
};
