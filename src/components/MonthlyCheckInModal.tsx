import React, { useState } from 'react';
import {
  ChevronLeft, TrendingUp, PiggyBank, Wallet, Check, Plus, Trash2,
  DollarSign, Target, Sparkles,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import {
  MonthlyCheckIn, CheckInIncome, CheckInExpense, CheckInGoal,
  RecurringIncomeFrequency, SubscriptionFrequency, SUPPORTED_CURRENCIES, AppView,
} from '../types/finance';

interface MonthlyCheckInModalProps {
  currency: string;
  onComplete: (data: MonthlyCheckIn) => void;
  onSkip: () => void;
  onNavigate?: (view: AppView) => void;
}

const STEP_COUNT = 5;

const INCOME_SUGGESTIONS = ['Salary', 'Freelance', 'Part-time', 'Business', 'Investment', 'Rental', 'Other'];
const EXPENSE_SUGGESTIONS = ['Rent', 'Phone', 'Internet', 'Electricity', 'Transport', 'Gym', 'Insurance', 'Other'];
const GOAL_SUGGESTIONS = ['Emergency Fund', 'Vacation', 'New Phone', 'Car', 'Investment', 'Education'];

const INCOME_FREQS: { key: RecurringIncomeFrequency; label: string }[] = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'biweekly', label: 'Bi-weekly' },
  { key: 'monthly', label: 'Monthly' },
];

const EXPENSE_FREQS: { key: SubscriptionFrequency; label: string }[] = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
];

const ItemChip: React.FC<{ label: string; amount: number; sym: string; onDelete: () => void }> = ({ label, amount, sym, onDelete }) => {
  const { isDark, colors } = useTheme();
  return (
    <div
      className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-2"
      style={{ background: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.05)', border: `1px solid ${colors.accent}25` }}
    >
      <Check size={13} style={{ color: colors.accent, flexShrink: 0 }} />
      <span className="flex-1 text-sm font-semibold" style={{ color: colors.textPrimary }}>{label}</span>
      <span className="text-sm font-bold" style={{ color: colors.accent }}>{sym}{amount.toLocaleString()}</span>
      <button onClick={onDelete} className="ml-1 cursor-pointer" style={{ color: colors.textMuted }}>
        <Trash2 size={13} />
      </button>
    </div>
  );
}

const GoalChip: React.FC<{ goal: CheckInGoal; sym: string; onDelete: () => void }> = ({ goal, sym, onDelete }) => {
  const { isDark, colors } = useTheme();
  return (
    <div
      className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-2"
      style={{ background: isDark ? 'rgba(167,139,250,0.08)' : 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.25)' }}
    >
      <Target size={13} style={{ color: '#a78bfa', flexShrink: 0 }} />
      <span className="flex-1 text-sm font-semibold" style={{ color: colors.textPrimary }}>{goal.name}</span>
      <span className="text-sm font-bold" style={{ color: '#a78bfa' }}>{sym}{goal.targetAmount.toLocaleString()}</span>
      <button onClick={onDelete} className="ml-1 cursor-pointer" style={{ color: colors.textMuted }}>
        <Trash2 size={13} />
      </button>
    </div>
  );
}

export const MonthlyCheckInModal: React.FC<MonthlyCheckInModalProps> = ({
  currency, onComplete, onSkip, onNavigate,
}) => {
  const { isDark, colors } = useTheme();
  const [step, setStep] = useState(0);

  // Data collected
  const [incomes, setIncomes] = useState<CheckInIncome[]>([]);
  const [expenses, setExpenses] = useState<CheckInExpense[]>([]);
  const [goals, setGoals] = useState<CheckInGoal[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState('');

  // Add-income form
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [iName, setIName] = useState('');
  const [iAmount, setIAmount] = useState('');
  const [iFreq, setIFreq] = useState<RecurringIncomeFrequency>('monthly');
  const [iDate, setIDate] = useState('');

  // Add-expense form
  const [showExpForm, setShowExpForm] = useState(false);
  const [eName, setEName] = useState('');
  const [eAmount, setEAmount] = useState('');
  const [eFreq, setEFreq] = useState<SubscriptionFrequency>('monthly');
  const [eDate, setEDate] = useState('');

  // Add-goal form
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [gName, setGName] = useState('');
  const [gTarget, setGTarget] = useState('');
  const [gCurrent, setGCurrent] = useState('');
  const [gDate, setGDate] = useState('');

  const now = new Date();
  const currentMonth = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const sym = SUPPORTED_CURRENCIES.find(c => c.code === currency)?.symbol ?? currency;

  const buildCheckIn = (): MonthlyCheckIn => ({
    month: monthKey,
    completedAt: Date.now(),
    incomes,
    expenses,
    goals,
    monthlyBudget: parseFloat(monthlyBudget) || 0,
    upcomingExpenses: '',
    skipped: false,
  });

  const addIncome = () => {
    if (!iName.trim() || !iAmount) return;
    const item: CheckInIncome = {
      id: 'ci-inc-' + Date.now(),
      name: iName.trim(),
      amount: parseFloat(iAmount),
      frequency: iFreq,
      nextPaymentDate: iDate || new Date().toISOString().split('T')[0],
    };
    setIncomes(p => [...p, item]);
    setIName(''); setIAmount(''); setIFreq('monthly'); setIDate('');
    setShowIncomeForm(false);
  };

  const addExpense = () => {
    if (!eName.trim() || !eAmount) return;
    const item: CheckInExpense = {
      id: 'ci-exp-' + Date.now(),
      name: eName.trim(),
      amount: parseFloat(eAmount),
      frequency: eFreq,
      nextPaymentDate: eDate || new Date().toISOString().split('T')[0],
    };
    setExpenses(p => [...p, item]);
    setEName(''); setEAmount(''); setEFreq('monthly'); setEDate('');
    setShowExpForm(false);
  };

  const addGoal = () => {
    if (!gName.trim() || !gTarget) return;
    const item: CheckInGoal = {
      id: 'ci-goal-' + Date.now(),
      name: gName.trim(),
      targetAmount: parseFloat(gTarget),
      currentAmount: parseFloat(gCurrent) || 0,
      targetDate: gDate || undefined,
    };
    setGoals(p => [...p, item]);
    setGName(''); setGTarget(''); setGCurrent(''); setGDate('');
    setShowGoalForm(false);
  };

  // ── Shared styles ──────────────────────────────────────────────────
  const inputS: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    background: colors.bgSecondary, border: `1px solid ${colors.border}`,
    borderRadius: 10, padding: '10px 12px',
    fontSize: 14, fontWeight: 500, color: colors.textPrimary, outline: 'none',
  };
  const pillSel = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '8px 6px', borderRadius: 10, fontSize: 12, fontWeight: 600,
    textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s ease',
    border: active ? `1.5px solid ${colors.accent}` : `1px solid ${colors.border}`,
    background: active ? `${colors.accent}18` : colors.bgSecondary,
    color: active ? colors.accent : colors.textMuted,
  });


  const STEPS = [
    { icon: TrendingUp, color: colors.accent, label: 'Regular Income' },
    { icon: Wallet, color: '#f97316', label: 'Fixed Expenses' },
    { icon: PiggyBank, color: '#a78bfa', label: 'Savings Goals' },
    { icon: DollarSign, color: '#fbbf24', label: 'Monthly Budget' },
    { icon: Sparkles, color: '#34d399', label: 'All Set!' },
  ];

  const currentStep = STEPS[step];
  const StepIcon = currentStep.icon;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{
        width: '100%', background: colors.bgCard,
        borderRadius: '28px 28px 0 0', padding: '0 20px 48px',
        maxHeight: '94vh', overflowY: 'auto',
      }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: colors.border, margin: '14px auto 0' }} />

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, paddingBottom: 6 }}>
          {step > 0 && step < STEP_COUNT - 1 ? (
            <button onClick={() => setStep(s => s - 1)} style={{ color: colors.textMuted, background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
              <ChevronLeft size={20} />
            </button>
          ) : <div style={{ width: 28 }} />}

          <span style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted }}>{step + 1} of {STEP_COUNT}</span>

          {step < STEP_COUNT - 1 ? (
            <button onClick={onSkip} style={{ fontSize: 13, fontWeight: 500, color: colors.textMuted, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              Skip all
            </button>
          ) : <div style={{ width: 56 }} />}
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, borderRadius: 2, background: colors.border, margin: '10px 0 20px' }}>
          <div style={{ height: '100%', borderRadius: 2, background: currentStep.color, width: `${((step + 1) / STEP_COUNT) * 100}%`, transition: 'all 0.35s ease' }} />
        </div>

        {/* Step icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: isDark ? `${currentStep.color}18` : `${currentStep.color}12`,
            border: `1.5px solid ${currentStep.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <StepIcon size={22} style={{ color: currentStep.color }} />
          </div>
        </div>

        {/* Month badge */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span style={{
            display: 'inline-block', fontSize: 10, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.14em',
            color: currentStep.color, background: `${currentStep.color}14`,
            border: `1px solid ${currentStep.color}30`, borderRadius: 99, padding: '3px 10px',
          }}>{currentMonth}</span>
        </div>

        {/* ── Step 0: Recurring Income ── */}
        {step === 0 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: colors.textPrimary, textAlign: 'center', marginBottom: 4, letterSpacing: '-0.02em' }}>
              Do you have a fixed income?
            </h2>
            <p style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center', marginBottom: 20, lineHeight: 1.5 }}>
              Add your salary, freelance pay, or any regular income. Helps Moneo calculate your safe spending.
            </p>

            {incomes.map((inc, i) => (
              <ItemChip key={inc.id} sym={sym} label={inc.name} amount={inc.amount} onDelete={() => setIncomes(p => p.filter((_, j) => j !== i))} />
            ))}

            {!showIncomeForm ? (
              <button
                onClick={() => setShowIncomeForm(true)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', borderRadius: 12, border: `1.5px dashed ${colors.border}`, background: 'none', color: colors.accent, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 20 }}
              >
                <Plus size={15} /> Add income source
              </button>
            ) : (
              <div style={{ background: colors.bgSecondary, borderRadius: 14, padding: 14, marginBottom: 16, border: `1px solid ${colors.border}` }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.textMuted, marginBottom: 10 }}>Add income</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {INCOME_SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => setIName(s)}
                      style={{ padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: `1px solid ${iName === s ? colors.accent : colors.border}`, background: iName === s ? `${colors.accent}15` : 'none', color: iName === s ? colors.accent : colors.textMuted }}>
                      {s}
                    </button>
                  ))}
                </div>
                <input type="text" placeholder="Income name" value={iName} onChange={e => setIName(e.target.value)} style={{ ...inputS, marginBottom: 8 }} />
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <div style={{ display: 'flex', flex: 1, borderRadius: 10, overflow: 'hidden', border: `1px solid ${colors.border}` }}>
                    <div style={{ padding: '10px 10px', background: colors.bgCard, fontSize: 13, fontWeight: 600, color: colors.textMuted, borderRight: `1px solid ${colors.border}`, whiteSpace: 'nowrap' }}>{sym}</div>
                    <input type="number" inputMode="decimal" placeholder="Amount" value={iAmount} onChange={e => setIAmount(e.target.value)} style={{ ...inputS, border: 'none', borderRadius: 0, flex: 1 }} />
                  </div>
                  <input type="date" value={iDate} onChange={e => setIDate(e.target.value)} style={{ ...inputS, width: 'auto', flex: 1 }} />
                </div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                  {INCOME_FREQS.map(f => (
                    <button key={f.key} onClick={() => setIFreq(f.key)} style={pillSel(iFreq === f.key)}>{f.label}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowIncomeForm(false)} style={{ flex: 1, padding: '10px', borderRadius: 10, background: colors.bgCard, border: `1px solid ${colors.border}`, color: colors.textMuted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={addIncome} disabled={!iName.trim() || !iAmount} style={{ flex: 2, padding: '10px', borderRadius: 10, background: iName.trim() && iAmount ? colors.accent : colors.border, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none' }}>Add</button>
                </div>
              </div>
            )}

            <button onClick={() => setStep(1)} style={{ width: '100%', padding: '14px', borderRadius: 14, background: colors.accent, color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              Continue
            </button>
            <button onClick={() => setStep(1)} style={{ width: '100%', padding: '10px', marginTop: 8, borderRadius: 14, background: 'none', color: colors.textMuted, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer' }}>
              Skip this step
            </button>
          </div>
        )}

        {/* ── Step 1: Fixed Expenses ── */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: colors.textPrimary, textAlign: 'center', marginBottom: 4, letterSpacing: '-0.02em' }}>
              What are your fixed costs?
            </h2>
            <p style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center', marginBottom: 20, lineHeight: 1.5 }}>
              Rent, phone, internet, subscriptions — things that go out every month. We subtract these automatically.
            </p>

            {expenses.map((exp, i) => (
              <ItemChip key={exp.id} sym={sym} label={exp.name} amount={exp.amount} onDelete={() => setExpenses(p => p.filter((_, j) => j !== i))} />
            ))}

            {!showExpForm ? (
              <button
                onClick={() => setShowExpForm(true)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', borderRadius: 12, border: `1.5px dashed ${colors.border}`, background: 'none', color: '#f97316', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 20 }}
              >
                <Plus size={15} /> Add expense
              </button>
            ) : (
              <div style={{ background: colors.bgSecondary, borderRadius: 14, padding: 14, marginBottom: 16, border: `1px solid ${colors.border}` }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.textMuted, marginBottom: 10 }}>Add expense</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {EXPENSE_SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => setEName(s)}
                      style={{ padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: `1px solid ${eName === s ? '#f97316' : colors.border}`, background: eName === s ? 'rgba(249,115,22,0.12)' : 'none', color: eName === s ? '#f97316' : colors.textMuted }}>
                      {s}
                    </button>
                  ))}
                </div>
                <input type="text" placeholder="Expense name" value={eName} onChange={e => setEName(e.target.value)} style={{ ...inputS, marginBottom: 8 }} />
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <div style={{ display: 'flex', flex: 1, borderRadius: 10, overflow: 'hidden', border: `1px solid ${colors.border}` }}>
                    <div style={{ padding: '10px 10px', background: colors.bgCard, fontSize: 13, fontWeight: 600, color: colors.textMuted, borderRight: `1px solid ${colors.border}`, whiteSpace: 'nowrap' }}>{sym}</div>
                    <input type="number" inputMode="decimal" placeholder="Amount" value={eAmount} onChange={e => setEAmount(e.target.value)} style={{ ...inputS, border: 'none', borderRadius: 0, flex: 1 }} />
                  </div>
                  <input type="date" value={eDate} onChange={e => setEDate(e.target.value)} style={{ ...inputS, width: 'auto', flex: 1 }} />
                </div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                  {EXPENSE_FREQS.map(f => (
                    <button key={f.key} onClick={() => setEFreq(f.key)} style={pillSel(eFreq === f.key)}>{f.label}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowExpForm(false)} style={{ flex: 1, padding: '10px', borderRadius: 10, background: colors.bgCard, border: `1px solid ${colors.border}`, color: colors.textMuted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={addExpense} disabled={!eName.trim() || !eAmount} style={{ flex: 2, padding: '10px', borderRadius: 10, background: eName.trim() && eAmount ? '#f97316' : colors.border, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none' }}>Add</button>
                </div>
              </div>
            )}

            <button onClick={() => setStep(2)} style={{ width: '100%', padding: '14px', borderRadius: 14, background: '#f97316', color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              Continue
            </button>
            <button onClick={() => setStep(2)} style={{ width: '100%', padding: '10px', marginTop: 8, borderRadius: 14, background: 'none', color: colors.textMuted, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer' }}>
              Skip this step
            </button>
          </div>
        )}

        {/* ── Step 2: Savings Goals ── */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: colors.textPrimary, textAlign: 'center', marginBottom: 4, letterSpacing: '-0.02em' }}>
              Are you saving for something?
            </h2>
            <p style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center', marginBottom: 20, lineHeight: 1.5 }}>
              A phone, a trip, an emergency fund? Add your goals and track your progress. Totally optional.
            </p>

            {goals.map((g, i) => (
              <GoalChip key={g.id} sym={sym} goal={g} onDelete={() => setGoals(p => p.filter((_, j) => j !== i))} />
            ))}

            {!showGoalForm ? (
              <button
                onClick={() => setShowGoalForm(true)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', borderRadius: 12, border: '1.5px dashed rgba(167,139,250,0.4)', background: 'none', color: '#a78bfa', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 20 }}
              >
                <Plus size={15} /> Add a savings goal
              </button>
            ) : (
              <div style={{ background: colors.bgSecondary, borderRadius: 14, padding: 14, marginBottom: 16, border: `1px solid ${colors.border}` }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.textMuted, marginBottom: 10 }}>Add goal</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {GOAL_SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => setGName(s)}
                      style={{ padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: `1px solid ${gName === s ? '#a78bfa' : colors.border}`, background: gName === s ? 'rgba(167,139,250,0.12)' : 'none', color: gName === s ? '#a78bfa' : colors.textMuted }}>
                      {s}
                    </button>
                  ))}
                </div>
                <input type="text" placeholder="Goal name" value={gName} onChange={e => setGName(e.target.value)} style={{ ...inputS, marginBottom: 8 }} />
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <div style={{ display: 'flex', flex: 1, borderRadius: 10, overflow: 'hidden', border: `1px solid ${colors.border}` }}>
                    <div style={{ padding: '10px 10px', background: colors.bgCard, fontSize: 13, fontWeight: 600, color: colors.textMuted, borderRight: `1px solid ${colors.border}`, whiteSpace: 'nowrap' }}>{sym}</div>
                    <input type="number" inputMode="decimal" placeholder="Target amount" value={gTarget} onChange={e => setGTarget(e.target.value)} style={{ ...inputS, border: 'none', borderRadius: 0, flex: 1 }} />
                  </div>
                  <div style={{ display: 'flex', flex: 1, borderRadius: 10, overflow: 'hidden', border: `1px solid ${colors.border}` }}>
                    <div style={{ padding: '10px 10px', background: colors.bgCard, fontSize: 13, fontWeight: 600, color: colors.textMuted, borderRight: `1px solid ${colors.border}`, whiteSpace: 'nowrap' }}>{sym}</div>
                    <input type="number" inputMode="decimal" placeholder="Saved so far" value={gCurrent} onChange={e => setGCurrent(e.target.value)} style={{ ...inputS, border: 'none', borderRadius: 0, flex: 1 }} />
                  </div>
                </div>
                <input type="date" placeholder="Target date (optional)" value={gDate} onChange={e => setGDate(e.target.value)} style={{ ...inputS, marginBottom: 12 }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowGoalForm(false)} style={{ flex: 1, padding: '10px', borderRadius: 10, background: colors.bgCard, border: `1px solid ${colors.border}`, color: colors.textMuted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={addGoal} disabled={!gName.trim() || !gTarget} style={{ flex: 2, padding: '10px', borderRadius: 10, background: gName.trim() && gTarget ? '#a78bfa' : colors.border, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none' }}>Add Goal</button>
                </div>
              </div>
            )}

            <button onClick={() => setStep(3)} style={{ width: '100%', padding: '14px', borderRadius: 14, background: '#a78bfa', color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              Continue
            </button>
            <button onClick={() => setStep(3)} style={{ width: '100%', padding: '10px', marginTop: 8, borderRadius: 14, background: 'none', color: colors.textMuted, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer' }}>
              Skip this step
            </button>
          </div>
        )}

        {/* ── Step 3: Monthly Budget ── */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: colors.textPrimary, textAlign: 'center', marginBottom: 4, letterSpacing: '-0.02em' }}>
              Do you have a monthly budget?
            </h2>
            <p style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center', marginBottom: 24, lineHeight: 1.5 }}>
              A spending limit helps you stay on track. We'll show alerts when you're close. Skip if you don't have one.
            </p>

            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: colors.textMuted, marginBottom: 8 }}>
              Monthly spending limit
            </label>
            <div style={{ display: 'flex', borderRadius: 12, overflow: 'hidden', border: `1px solid ${colors.border}`, marginBottom: 28 }}>
              <div style={{ padding: '13px 12px', background: colors.bgSecondary, fontSize: 14, fontWeight: 600, color: colors.textMuted, borderRight: `1px solid ${colors.border}`, whiteSpace: 'nowrap' }}>{sym}</div>
              <input
                type="number" inputMode="decimal" placeholder="e.g. 2000" value={monthlyBudget}
                onChange={e => setMonthlyBudget(e.target.value)}
                style={{ ...inputS, border: 'none', borderRadius: 0, flex: 1 }}
              />
            </div>

            <button
              onClick={() => setStep(4)}
              style={{ width: '100%', padding: '14px', borderRadius: 14, background: '#fbbf24', color: '#1c1917', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              Continue
            </button>
            <button onClick={() => setStep(4)} style={{ width: '100%', padding: '10px', marginTop: 8, borderRadius: 14, background: 'none', color: colors.textMuted, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer' }}>
              Skip this step
            </button>
          </div>
        )}

        {/* ── Step 4: Done ── */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: colors.textPrimary, textAlign: 'center', marginBottom: 4, letterSpacing: '-0.02em' }}>
              You're all set!
            </h2>
            <p style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center', marginBottom: 20, lineHeight: 1.5 }}>
              Moneo is now personalized for you. Here's a summary of what you shared.
            </p>

            {/* Summary */}
            <div style={{ background: colors.bgSecondary, borderRadius: 14, padding: 16, marginBottom: 20, border: `1px solid ${colors.border}` }}>
              {incomes.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <TrendingUp size={14} style={{ color: colors.accent, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: colors.textSecondary, flex: 1 }}>{incomes.length} income source{incomes.length > 1 ? 's' : ''} added</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: colors.accent }}>{sym}{incomes.reduce((s, i) => s + i.amount, 0).toLocaleString()}/mo est.</span>
                </div>
              )}
              {expenses.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <Wallet size={14} style={{ color: '#f97316', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: colors.textSecondary, flex: 1 }}>{expenses.length} recurring expense{expenses.length > 1 ? 's' : ''} added</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#f97316' }}>{sym}{expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}/mo</span>
                </div>
              )}
              {goals.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <PiggyBank size={14} style={{ color: '#a78bfa', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: colors.textSecondary, flex: 1 }}>{goals.length} savings goal{goals.length > 1 ? 's' : ''} added</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa' }}>{sym}{goals.reduce((s, g) => s + g.targetAmount, 0).toLocaleString()} target</span>
                </div>
              )}
              {parseFloat(monthlyBudget) > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <DollarSign size={14} style={{ color: '#fbbf24', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: colors.textSecondary, flex: 1 }}>Monthly budget set</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24' }}>{sym}{parseFloat(monthlyBudget).toLocaleString()}</span>
                </div>
              )}
              {incomes.length === 0 && expenses.length === 0 && goals.length === 0 && !parseFloat(monthlyBudget) && (
                <p style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center' }}>Nothing entered — you can always add this later in Budget & Savings.</p>
              )}
            </div>

            {/* Quick navigation */}
            {(incomes.length > 0 || expenses.length > 0 || goals.length > 0) && onNavigate && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.textMuted, marginBottom: 10 }}>Quick Access</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {incomes.length > 0 && (
                    <button onClick={() => { onComplete(buildCheckIn()); onNavigate('recurring-income'); }}
                      style={{ flex: 1, minWidth: 120, padding: '10px 12px', borderRadius: 12, background: `${colors.accent}12`, border: `1px solid ${colors.accent}30`, color: colors.accent, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      View Income Sources
                    </button>
                  )}
                  {expenses.length > 0 && (
                    <button onClick={() => { onComplete(buildCheckIn()); onNavigate('recurring'); }}
                      style={{ flex: 1, minWidth: 120, padding: '10px 12px', borderRadius: 12, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', color: '#f97316', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      View Expenses
                    </button>
                  )}
                  {goals.length > 0 && (
                    <button onClick={() => { onComplete(buildCheckIn()); onNavigate('savings'); }}
                      style={{ flex: 1, minWidth: 120, padding: '10px 12px', borderRadius: 12, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', color: '#a78bfa', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      View Savings Goals
                    </button>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => onComplete(buildCheckIn())}
              style={{ width: '100%', padding: '15px', borderRadius: 14, background: '#22c55e', color: '#052e16', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Sparkles size={16} /> Let's go!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
