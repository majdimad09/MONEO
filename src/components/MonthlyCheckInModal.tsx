import React, { useState } from 'react';
import { ChevronLeft, TrendingUp, PiggyBank, CalendarDays } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { MonthlyCheckIn, SUPPORTED_CURRENCIES } from '../types/finance';

interface MonthlyCheckInModalProps {
  currency: string;
  onComplete: (data: MonthlyCheckIn) => void;
  onSkip: () => void;
}

type SavingsOption = 'yes' | 'maybe' | 'no' | null;

export const MonthlyCheckInModal: React.FC<MonthlyCheckInModalProps> = ({
  currency, onComplete, onSkip,
}) => {
  const { isDark, colors } = useTheme();
  const [step, setStep] = useState(0);
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [savingsOption, setSavingsOption] = useState<SavingsOption>(null);
  const [savingsAmount, setSavingsAmount] = useState('');
  const [upcoming, setUpcoming] = useState('');

  const now = new Date();
  const currentMonth = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const currencySymbol = SUPPORTED_CURRENCIES.find(c => c.code === currency)?.symbol ?? currency;

  const handleComplete = () => {
    onComplete({
      month: monthKey,
      completedAt: Date.now(),
      monthlyIncomeEstimate: parseFloat(income) || 0,
      recurringExpenses: parseFloat(expenses) || 0,
      savingsGoalEnabled: savingsOption === 'yes',
      savingsGoalAmount: savingsOption === 'yes' ? (parseFloat(savingsAmount) || 0) : 0,
      upcomingExpenses: upcoming.trim(),
      skipped: false,
    });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: colors.bgSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 15,
    fontWeight: 500,
    color: colors.textPrimary,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const stepIcons = [TrendingUp, PiggyBank, CalendarDays];
  const StepIcon = stepIcons[step];

  const pillStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '10px 8px',
    borderRadius: 12,
    border: active ? `2px solid ${colors.accent}` : `1.5px solid ${colors.border}`,
    background: active ? `${colors.accent}18` : colors.bgSecondary,
    color: active ? colors.accent : colors.textSecondary,
    fontSize: 13,
    fontWeight: 600,
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      background: 'rgba(0,0,0,0.65)',
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div style={{
        width: '100%',
        background: colors.bgCard,
        borderRadius: '28px 28px 0 0',
        padding: '0 20px 44px',
        maxHeight: '92vh',
        overflowY: 'auto',
      }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: colors.border, margin: '16px auto 0' }} />

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 8 }}>
          {step > 0 ? (
            <button
              onClick={() => setStep(s => (s - 1) as 0 | 1 | 2)}
              style={{ color: colors.textMuted, background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
            >
              <ChevronLeft size={20} />
            </button>
          ) : (
            <div style={{ width: 28 }} />
          )}

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: i === step ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: i === step ? colors.accent : (i < step ? `${colors.accent}60` : colors.border),
                transition: 'all 0.25s ease',
              }} />
            ))}
          </div>

          <button
            onClick={onSkip}
            style={{ fontSize: 13, fontWeight: 500, color: colors.textMuted, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            Skip
          </button>
        </div>

        {/* Month badge */}
        <div style={{ textAlign: 'center', marginBottom: 20, marginTop: 12 }}>
          <span style={{
            display: 'inline-block',
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em',
            color: colors.accent,
            background: `${colors.accent}14`,
            border: `1px solid ${colors.accent}30`,
            borderRadius: 99, padding: '3px 10px',
          }}>
            {currentMonth}
          </span>
        </div>

        {/* Step icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 18,
            background: isDark ? `${colors.accent}18` : `${colors.accent}12`,
            border: `1.5px solid ${colors.accent}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <StepIcon size={24} style={{ color: colors.accent }} />
          </div>
        </div>

        {/* Step 0 — Monthly Finances */}
        {step === 0 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, textAlign: 'center', marginBottom: 6, letterSpacing: '-0.02em' }}>
              What's coming in?
            </h2>
            <p style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: 28, lineHeight: 1.5 }}>
              Help Moneo personalize your experience
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: colors.textMuted, marginBottom: 8 }}>
                Expected monthly income
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <div style={{
                  padding: '12px 12px',
                  background: colors.bgSecondary,
                  border: `1px solid ${colors.border}`,
                  borderRight: 'none',
                  borderRadius: '12px 0 0 12px',
                  fontSize: 14, fontWeight: 600, color: colors.textMuted,
                  whiteSpace: 'nowrap',
                }}>
                  {currencySymbol}
                </div>
                <input
                  type="number"
                  inputMode="decimal"
                  value={income}
                  onChange={e => setIncome(e.target.value)}
                  placeholder="0.00"
                  style={{ ...inputStyle, borderRadius: '0 12px 12px 0', borderLeft: 'none' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: colors.textMuted, marginBottom: 8 }}>
                Fixed monthly expenses
              </label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  padding: '12px 12px',
                  background: colors.bgSecondary,
                  border: `1px solid ${colors.border}`,
                  borderRight: 'none',
                  borderRadius: '12px 0 0 12px',
                  fontSize: 14, fontWeight: 600, color: colors.textMuted,
                  whiteSpace: 'nowrap',
                }}>
                  {currencySymbol}
                </div>
                <input
                  type="number"
                  inputMode="decimal"
                  value={expenses}
                  onChange={e => setExpenses(e.target.value)}
                  placeholder="0.00"
                  style={{ ...inputStyle, borderRadius: '0 12px 12px 0', borderLeft: 'none' }}
                />
              </div>
              <p style={{ fontSize: 11, color: colors.textMuted, marginTop: 6 }}>e.g. rent, bills, subscriptions</p>
            </div>

            <button
              onClick={() => setStep(1)}
              style={{
                width: '100%', padding: '15px', borderRadius: 14,
                background: colors.accent, color: '#ffffff',
                fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer',
                letterSpacing: '-0.01em',
              }}
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 1 — Savings Goal */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, textAlign: 'center', marginBottom: 6, letterSpacing: '-0.02em' }}>
              Savings goal?
            </h2>
            <p style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: 28, lineHeight: 1.5 }}>
              Do you want to save money this month?
            </p>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {(['yes', 'maybe', 'no'] as const).map(opt => (
                <button
                  key={opt}
                  onClick={() => setSavingsOption(opt)}
                  style={pillStyle(savingsOption === opt)}
                >
                  {opt === 'yes' ? 'Yes!' : opt === 'maybe' ? 'Not sure' : 'No goal'}
                </button>
              ))}
            </div>

            {savingsOption === 'yes' && (
              <div style={{ marginBottom: 8 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: colors.textMuted, marginBottom: 8 }}>
                  How much do you want to save?
                </label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    padding: '12px 12px',
                    background: colors.bgSecondary,
                    border: `1px solid ${colors.border}`,
                    borderRight: 'none',
                    borderRadius: '12px 0 0 12px',
                    fontSize: 14, fontWeight: 600, color: colors.textMuted,
                    whiteSpace: 'nowrap',
                  }}>
                    {currencySymbol}
                  </div>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={savingsAmount}
                    onChange={e => setSavingsAmount(e.target.value)}
                    placeholder="0.00"
                    style={{ ...inputStyle, borderRadius: '0 12px 12px 0', borderLeft: 'none' }}
                  />
                </div>
              </div>
            )}

            <div style={{ height: 28 }} />

            <button
              onClick={() => setStep(2)}
              disabled={savingsOption === null}
              style={{
                width: '100%', padding: '15px', borderRadius: 14,
                background: savingsOption !== null ? colors.accent : colors.bgSecondary,
                color: savingsOption !== null ? '#ffffff' : colors.textMuted,
                fontSize: 15, fontWeight: 700, border: 'none',
                cursor: savingsOption !== null ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s ease',
                letterSpacing: '-0.01em',
              }}
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2 — Upcoming Expenses */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, textAlign: 'center', marginBottom: 6, letterSpacing: '-0.02em' }}>
              Any big expenses ahead?
            </h2>
            <p style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: 28, lineHeight: 1.5 }}>
              Optional — helps us advise you better
            </p>

            <div style={{ marginBottom: 28 }}>
              <textarea
                value={upcoming}
                onChange={e => setUpcoming(e.target.value)}
                placeholder="e.g. car service in 2 weeks, birthday dinner, travel..."
                rows={3}
                style={{
                  ...inputStyle,
                  resize: 'none',
                  height: 90,
                  lineHeight: 1.55,
                }}
              />
            </div>

            <button
              onClick={handleComplete}
              style={{
                width: '100%', padding: '15px', borderRadius: 14,
                background: colors.accent, color: '#ffffff',
                fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer',
                letterSpacing: '-0.01em',
              }}
            >
              Done — Let's go!
            </button>

            <button
              onClick={handleComplete}
              style={{
                width: '100%', padding: '11px', marginTop: 10, borderRadius: 14,
                background: 'none', color: colors.textMuted,
                fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer',
              }}
            >
              Skip this step
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
