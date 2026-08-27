import React, { useMemo } from 'react';
import {
  ShieldCheck, TrendingUp, TrendingDown, AlertCircle,
  CheckCircle2, Lightbulb, Lock, ChevronRight,
} from 'lucide-react';
import { Transaction, CategoryLimit, Subscription, SavingGoal } from '../types/finance';
import {
  calculateCashlyScore, getScoreLevel, getNextScoreLevel, SCORE_LEVELS,
} from '../utils/insights';
import { useTheme } from '../context/ThemeContext';

interface MoneoScoreScreenProps {
  transactions: Transaction[];
  monthlyBudget: number;
  categoryLimits: CategoryLimit[];
  subscriptions: Subscription[];
  savingGoals: SavingGoal[];
  currency: string;
}

const FACTOR_ACTIONS: Record<string, string> = {
  'Saving Consistency': 'Aim to save 20%+ of income each month',
  'Spending Control': 'Set category limits for Food, Shopping, Entertainment',
  'Budget Performance': 'Set a monthly budget and stay under 85%',
  'Financial Stability': 'Try to keep monthly spending within a consistent range',
  'Recurring Commitments': 'Review subscriptions — cancel ones you rarely use',
  'Goal Progress': 'Create a savings goal and contribute regularly',
};

function ScoreRing({ score, color, size = 120 }: { score: number; color: string; size?: number }) {
  const { colors } = useTheme();
  const r = size / 2 - 10;
  const stroke = 10;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={colors.borderStrong} strokeWidth={stroke} />
        <circle
          cx={cx} cy={cx} r={r} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={dashOffset}
          style={{ filter: `drop-shadow(0 0 12px ${color}70)`, transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.2,0.64,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold leading-none" style={{ fontSize: 36, color }}>{score}</span>
        <span className="text-[11px] text-slate-500 font-medium mt-0.5">/100</span>
      </div>
    </div>
  );
}

export const MoneoScoreScreen: React.FC<MoneoScoreScreenProps> = ({
  transactions, monthlyBudget, categoryLimits, subscriptions, savingGoals,
}) => {
  const result = useMemo(
    () => calculateCashlyScore(transactions, monthlyBudget, categoryLimits, subscriptions, savingGoals),
    [transactions, monthlyBudget, categoryLimits, subscriptions, savingGoals]
  );
  const { isDark, colors } = useTheme();

  const level = getScoreLevel(result.score);
  const nextLevel = getNextScoreLevel(result.score);

  const levelPct = nextLevel
    ? ((result.score - level.min) / (nextLevel.min - level.min)) * 100
    : 100;

  const helpingFactors = result.factors.filter(f => f.points / f.maxPoints >= 0.65);
  const hurtingFactors = result.factors.filter(f => f.points / f.maxPoints < 0.45);
  const actionItems = result.factors
    .filter(f => f.points / f.maxPoints < 0.75)
    .sort((a, b) => (a.points / a.maxPoints) - (b.points / b.maxPoints))
    .slice(0, 3)
    .map(f => FACTOR_ACTIONS[f.label])
    .filter(Boolean);

  // ── Build Your Score state ────────────────────────────────────────────────
  if (!result.hasEnoughData) {
    return (
      <div className="page-enter px-4 pt-6 pb-8">
        {/* Not a credit score badge */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
            <ShieldCheck size={14} className="text-indigo-400" />
            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Personal Money Score · Not a credit score</span>
          </div>
        </div>

        <div className="card-dark rounded-3xl p-8 text-center mb-6">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <Lock size={32} className="text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Build Your Moneo Score</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Moneo Score is a personal money-management score that shows how well you're managing your finances.
            It is <span className="font-semibold" style={{ color: colors.textPrimary }}>not a credit score</span> and has no effect on your credit or borrowing.
          </p>

          <div className="space-y-3 text-left">
            {result.missingDataHints.map((hint, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: colors.bgSecondary, border: `1px solid ${colors.borderStrong}` }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
                  style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}>
                  {i + 1}
                </div>
                <span className="text-sm text-slate-600">{hint}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What the score measures */}
        <div className="card-dark rounded-2xl p-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">What Moneo Score measures</p>
          <div className="space-y-2.5">
            {['Saving Consistency', 'Spending Control', 'Budget Performance', 'Financial Stability', 'Recurring Commitments', 'Goal Progress'].map(cat => (
              <div key={cat} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500/60 flex-shrink-0" />
                <span className="text-sm text-slate-400">{cat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Full Score view ───────────────────────────────────────────────────────
  return (
    <div className="page-enter pb-10 space-y-4">

      {/* Not-a-credit-score badge */}
      <div className="px-4 pt-4 flex items-center justify-center">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
          <ShieldCheck size={13} className="text-indigo-400" />
          <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Personal Money Score · Not a credit score</span>
        </div>
      </div>

      {/* ── HERO SCORE CARD ──────────────────────────── */}
      <div className="px-4">
        <div className="card-dark rounded-3xl p-6"
          style={{ background: isDark ? 'linear-gradient(135deg, #070e1f 0%, #1e1e2a 100%)' : 'linear-gradient(135deg, #070e1f 0%, #f0f1f5 100%)', border: `1px solid ${result.color}25` }}>
          <div className="flex items-center gap-6 mb-6">
            <ScoreRing score={result.score} color={result.color} size={130} />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Moneo Score</p>
              <p className="text-2xl font-bold leading-tight" style={{ color: result.color }}>{result.grade}</p>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{result.summary}</p>
            </div>
          </div>

          {/* Level progression bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500">{level.name}</span>
              {nextLevel ? (
                <span className="text-[11px] font-semibold" style={{ color: nextLevel.color }}>
                  {nextLevel.min - result.score} pts to {nextLevel.name} →
                </span>
              ) : (
                <span className="text-[11px] font-bold text-emerald-400">Max level reached!</span>
              )}
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: colors.bgSecondary }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.max(4, levelPct)}%`,
                  background: result.color,
                  boxShadow: `0 0 8px ${result.color}60`,
                  transition: 'width 1s ease',
                }}
              />
            </div>
            {/* All levels */}
            <div className="flex justify-between mt-2">
              {SCORE_LEVELS.map(l => (
                <div key={l.name} className="flex flex-col items-center gap-0.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: result.score >= l.min ? l.color : colors.borderStrong }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SCORE BREAKDOWN ──────────────────────────── */}
      <div className="px-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3">Score Breakdown</p>
        <div className="card-dark rounded-2xl overflow-hidden">
          {result.factors.map((f, i) => {
            const pct = (f.points / f.maxPoints) * 100;
            return (
              <div key={f.label} className="px-4 py-4" style={{ borderBottom: i < result.factors.length - 1 ? `1px solid ${colors.divider}` : 'none' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-slate-700">{f.label}</span>
                  <span className="text-[12px] font-bold font-mono" style={{ color: f.color }}>
                    {f.points}/{f.maxPoints}
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden mb-1.5" style={{ background: colors.bgSecondary }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: f.color,
                      boxShadow: `0 0 6px ${f.color}50`,
                      transition: 'width 1s ease',
                    }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── WHAT'S HELPING ───────────────────────────── */}
      {helpingFactors.length > 0 && (
        <div className="px-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3">What's Helping</p>
          <div className="card-dark rounded-2xl overflow-hidden">
            {helpingFactors.map((f, i) => (
              <div key={f.label} className="flex items-start gap-3 px-4 py-3"
                style={{ borderBottom: i < helpingFactors.length - 1 ? `1px solid ${colors.divider}` : 'none' }}>
                <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">{f.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── WHAT'S HURTING ───────────────────────────── */}
      {hurtingFactors.length > 0 && (
        <div className="px-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3">What's Hurting</p>
          <div className="card-dark rounded-2xl overflow-hidden">
            {hurtingFactors.map((f, i) => (
              <div key={f.label} className="flex items-start gap-3 px-4 py-3"
                style={{ borderBottom: i < hurtingFactors.length - 1 ? `1px solid ${colors.divider}` : 'none' }}>
                <TrendingDown size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">{f.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── HOW TO IMPROVE ───────────────────────────── */}
      {actionItems.length > 0 && (
        <div className="px-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3">How to Improve</p>
          <div className="card-dark rounded-2xl overflow-hidden">
            {actionItems.map((action, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3"
                style={{ borderBottom: i < actionItems.length - 1 ? `1px solid ${colors.divider}` : 'none' }}>
                <Lightbulb size={15} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600">{action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Score info footer */}
      <div className="px-4">
        <div className="rounded-2xl p-4"
          style={{ background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.07)', border: `1px solid ${isDark ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.18)'}` }}>
          <div className="flex items-start gap-3">
            <AlertCircle size={15} className="text-indigo-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              <span className="text-indigo-300 font-semibold">Moneo Score</span> is Moneo's own personal money-management score.
              It is calculated entirely from your Moneo data and is{' '}
              <span className="font-semibold" style={{ color: colors.textPrimary }}>not a credit score</span> — it has no connection to lenders, credit bureaus, or your ability to borrow money.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
