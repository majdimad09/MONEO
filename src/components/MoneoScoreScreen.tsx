import React, { useMemo } from 'react';
import {
  ShieldCheck, TrendingUp, TrendingDown, AlertCircle,
  CheckCircle2, Lightbulb, Lock, ArrowRight,
} from 'lucide-react';
import { Transaction, CategoryLimit, Subscription, SavingGoal } from '../types/finance';
import {
  calculateCashlyScore, getScoreLevel, getNextScoreLevel, SCORE_LEVELS,
} from '../utils/insights';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';

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

function ScoreRing({ score, color, size = 140 }: { score: number; color: string; size?: number }) {
  const { colors } = useTheme();
  const strokeW = 12;
  const r = (size - strokeW * 2) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - score / 100);

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cx} r={r} fill="none"
          stroke={colors.bgSecondary} strokeWidth={strokeW} />
        <circle
          cx={cx} cy={cx} r={r} fill="none"
          stroke={color} strokeWidth={strokeW} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={dashOffset}
          style={{
            filter: `drop-shadow(0 0 14px ${color}70)`,
            transition: 'stroke-dashoffset 1.3s cubic-bezier(0.34,1.2,0.64,1)',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span style={{ fontSize: 40, fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.04em' }}>
          {score}
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: `${color}80`, marginTop: 2 }}>/100</span>
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
  const { t } = useLanguage();

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

  const notCreditScorePill = (
    <div className="flex items-center justify-center px-4 pt-4 pb-1">
      <div
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-full"
        style={{
          background: isDark ? 'rgba(34,197,94,0.10)' : 'rgba(5,150,105,0.07)',
          border: `1px solid ${colors.accent}25`,
        }}
      >
        <ShieldCheck size={12} style={{ color: colors.accent }} />
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.accent }}>
          {t('notACreditScoreTag')}
        </span>
      </div>
    </div>
  );

  // ── Build Your Score ──────────────────────────────────────────────────────
  if (!result.hasEnoughData) {
    return (
      <div className="page-enter pb-10">
        {notCreditScorePill}

        <div className="px-4 pt-4 pb-2">
          <div
            className="rounded-3xl p-7 text-center"
            style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}` }}
            >
              <Lock size={26} style={{ color: colors.accent }} />
            </div>
            <h2 className="text-[20px] font-bold mb-2" style={{ color: colors.textPrimary }}>
              {t('buildYourScore')}
            </h2>
            <p className="text-[13px] leading-relaxed mb-6" style={{ color: colors.textSecondary }}>
              Moneo Score shows how well you manage your finances.{' '}
              <span className="font-semibold" style={{ color: colors.textPrimary }}>Not a credit score</span>
              {' '}— no effect on borrowing.
            </p>

            <div className="space-y-2.5 text-left">
              {result.missingDataHints.map((hint, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}` }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
                    style={{
                      background: colors.accentSoft,
                      color: colors.accent,
                      border: `1px solid ${colors.accent}30`,
                    }}
                  >
                    {i + 1}
                  </div>
                  <span className="text-[13px]" style={{ color: colors.textSecondary }}>{hint}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 py-2">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: colors.textMuted }}>
            {t('whatScoreMeasures')}
          </p>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
          >
            {['Saving Consistency', 'Spending Control', 'Budget Performance', 'Financial Stability', 'Recurring Commitments', 'Goal Progress'].map((cat, i, arr) => (
              <div
                key={cat}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: i < arr.length - 1 ? `1px solid ${colors.divider}` : 'none' }}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colors.accent }} />
                <span className="text-[13px]" style={{ color: colors.textSecondary }}>{cat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Full Score View ───────────────────────────────────────────────────────
  return (
    <div className="page-enter pb-10">

      {notCreditScorePill}

      {/* ── HERO CARD ──────────────────────────────────────────────── */}
      <div className="px-4 pt-3">
        <div
          className="rounded-3xl p-6 relative overflow-hidden"
          style={{
            background: isDark
              ? `linear-gradient(145deg, #0f0f0f 0%, #141414 100%)`
              : `linear-gradient(145deg, #f7f8fa 0%, #ffffff 100%)`,
            border: `1px solid ${result.color}30`,
            boxShadow: `0 4px 32px ${result.color}15`,
          }}
        >
          {/* Decorative glow */}
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${result.color}15 0%, transparent 70%)`,
              transform: 'translate(30%, -30%)',
            }}
          />

          <div className="flex items-center gap-5 mb-5 relative">
            <ScoreRing score={result.score} color={result.color} size={130} />
            <div className="flex-1 min-w-0">
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-1"
                style={{ color: `${result.color}80` }}
              >
                {t('moneoScore')}
              </p>
              <p className="text-[26px] font-bold leading-tight" style={{ color: result.color }}>
                {result.grade}
              </p>
              <p className="text-[12px] leading-relaxed mt-1.5" style={{ color: colors.textSecondary }}>
                {result.summary}
              </p>
            </div>
          </div>

          {/* Level progression */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold" style={{ color: colors.textMuted }}>
                {level.name}
              </span>
              {nextLevel ? (
                <span className="text-[11px] font-semibold flex items-center gap-1" style={{ color: nextLevel.color }}>
                  {nextLevel.min - result.score} pts to {nextLevel.name}
                  <ArrowRight size={10} />
                </span>
              ) : (
                <span className="text-[11px] font-bold" style={{ color: colors.positive }}>
                  {t('maxLevelReached')}
                </span>
              )}
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)' }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.max(4, levelPct)}%`,
                  background: result.color,
                  boxShadow: `0 0 8px ${result.color}60`,
                  borderRadius: 9999,
                  transition: 'width 1s ease',
                }}
              />
            </div>
            {/* Level dots */}
            <div className="flex justify-between mt-2 px-1">
              {SCORE_LEVELS.map(l => (
                <div
                  key={l.name}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: result.score >= l.min ? l.color : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)') }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SCORE BREAKDOWN ────────────────────────────────────────── */}
      <div className="px-4 pt-4">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: colors.textMuted }}>
          {t('scoreBreakdownTitle')}
        </p>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
        >
          {result.factors.map((f, i) => {
            const pct = (f.points / f.maxPoints) * 100;
            return (
              <div
                key={f.label}
                className="px-4 py-4"
                style={{ borderBottom: i < result.factors.length - 1 ? `1px solid ${colors.divider}` : 'none' }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-semibold" style={{ color: colors.textPrimary }}>
                    {f.label}
                  </span>
                  <span
                    className="text-[12px] font-bold"
                    style={{ color: f.color, fontFeatureSettings: '"tnum"' }}
                  >
                    {f.points}/{f.maxPoints}
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden mb-1.5"
                  style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: f.color,
                      boxShadow: `0 0 5px ${f.color}50`,
                      transition: 'width 1s ease',
                    }}
                  />
                </div>
                <p className="text-[11px]" style={{ color: colors.textMuted }}>{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── WHAT'S HELPING ─────────────────────────────────────────── */}
      {helpingFactors.length > 0 && (
        <div className="px-4 pt-3">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: colors.textMuted }}>
            {t('whatsHelping')}
          </p>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
          >
            {helpingFactors.map((f, i) => (
              <div
                key={f.label}
                className="flex items-start gap-3 px-4 py-3"
                style={{ borderBottom: i < helpingFactors.length - 1 ? `1px solid ${colors.divider}` : 'none' }}
              >
                <CheckCircle2 size={15} style={{ color: colors.positive, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: colors.textPrimary }}>{f.label}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: colors.textSecondary }}>{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── WHAT'S HURTING ─────────────────────────────────────────── */}
      {hurtingFactors.length > 0 && (
        <div className="px-4 pt-3">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: colors.textMuted }}>
            {t('whatsHurting')}
          </p>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
          >
            {hurtingFactors.map((f, i) => (
              <div
                key={f.label}
                className="flex items-start gap-3 px-4 py-3"
                style={{ borderBottom: i < hurtingFactors.length - 1 ? `1px solid ${colors.divider}` : 'none' }}
              >
                <TrendingDown size={15} style={{ color: colors.negative, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: colors.textPrimary }}>{f.label}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: colors.textSecondary }}>{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── HOW TO IMPROVE ─────────────────────────────────────────── */}
      {actionItems.length > 0 && (
        <div className="px-4 pt-3">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: colors.textMuted }}>
            {t('howToImprove')}
          </p>
          <div className="space-y-2">
            {actionItems.map((action, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-4 py-3 rounded-2xl"
                style={{
                  background: isDark ? 'rgba(34,197,94,0.06)' : 'rgba(5,150,105,0.05)',
                  border: `1px solid ${colors.accent}18`,
                  borderLeft: `3px solid ${colors.accent}`,
                  paddingLeft: 12,
                }}
              >
                <Lightbulb size={14} style={{ color: colors.accent, flexShrink: 0, marginTop: 2 }} />
                <p className="text-[12px] leading-relaxed" style={{ color: colors.textSecondary }}>{action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DISCLAIMER ─────────────────────────────────────────────── */}
      <div className="px-4 pt-3">
        <div
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
            border: `1px solid ${colors.border}`,
          }}
        >
          <AlertCircle size={14} style={{ color: colors.textMuted, flexShrink: 0, marginTop: 2 }} />
          <p className="text-[11px] leading-relaxed" style={{ color: colors.textMuted }}>
            <span className="font-semibold" style={{ color: colors.textSecondary }}>Moneo Score</span>{' '}
            is Moneo's own personal money-management score calculated from your Moneo data only.{' '}
            <span className="font-semibold" style={{ color: colors.textPrimary }}>Not a credit score</span>{' '}
            — no connection to lenders, credit bureaus, or borrowing.
          </p>
        </div>
      </div>

    </div>
  );
};
