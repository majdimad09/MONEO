import React, { useMemo } from 'react';
import {
  ShieldCheck, Lightbulb, BarChart2, TrendingUp, ChevronRight,
  TrendingDown, AlertTriangle, Info, Sparkles, Flame, PiggyBank,
  CalendarDays, Zap,
} from 'lucide-react';
import { Transaction, CategoryLimit, Subscription, SavingGoal, AppView } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import {
  calculateCashlyScore, generateInsights, getScoreLevel,
  InsightIcon, InsightType,
} from '../utils/insights';

interface InsightsHubProps {
  transactions: Transaction[];
  currency: string;
  monthlyBudget: number;
  categoryLimits: CategoryLimit[];
  subscriptions: Subscription[];
  savingGoals: SavingGoal[];
  isPremium: boolean;
  onNavigate: (view: AppView) => void;
}

const INSIGHT_ICON_MAP: Record<InsightIcon, React.ElementType> = {
  'trending-up': TrendingUp, 'trending-down': TrendingDown, 'alert': AlertTriangle,
  'info': Info, 'sparkle': Sparkles, 'calendar': CalendarDays, 'piggy': PiggyBank,
  'fire': Flame, 'zap': Zap,
};
const INSIGHT_COLORS: Record<InsightType, { bg: string; border: string; icon: string }> = {
  positive: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)',  icon: '#34d399' },
  warning:  { bg: 'rgba(239,68,68,0.07)',  border: 'rgba(239,68,68,0.2)',   icon: '#f87171' },
  neutral:  { bg: 'rgba(59,130,246,0.07)', border: 'rgba(59,130,246,0.18)', icon: '#60a5fa' },
  info:     { bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)',  icon: '#a78bfa' },
};

export const InsightsHub: React.FC<InsightsHubProps> = ({
  transactions, currency, monthlyBudget, categoryLimits, subscriptions, savingGoals,
  isPremium, onNavigate,
}) => {
  const scoreResult = useMemo(
    () => calculateCashlyScore(transactions, monthlyBudget, categoryLimits, subscriptions, savingGoals),
    [transactions, monthlyBudget, categoryLimits, subscriptions, savingGoals],
  );
  const insights = useMemo(
    () => generateInsights(transactions, currency, subscriptions),
    [transactions, currency, subscriptions],
  );

  const level = getScoreLevel(scoreResult.score);
  const r = scoreResult.score / 100;
  const circumference = 2 * Math.PI * 36;

  return (
    <div className="page-enter px-4 pt-3 pb-8 space-y-5">

      <h1 className="text-xl font-bold text-white pt-1">Insights</h1>

      {/* ── Moneo Score Card ─────────────────────────────────── */}
      <button
        onClick={() => onNavigate('moneo-score')}
        className="card-dark w-full rounded-2xl p-4 text-left cursor-pointer transition-all"
      >
        <div className="flex items-center gap-4">
          {/* Mini ring */}
          <div className="relative flex-shrink-0" style={{ width: 72, height: 72 }}>
            <svg width={72} height={72} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={36} cy={36} r={28} fill="none" stroke="#1e2d4a" strokeWidth={7} />
              <circle
                cx={36} cy={36} r={28} fill="none"
                stroke={level.color} strokeWidth={7} strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - r * circumference}
                style={{ filter: `drop-shadow(0 0 8px ${level.color}70)` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-bold" style={{ fontSize: 20, color: level.color, lineHeight: 1 }}>
                {scoreResult.score}
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={14} style={{ color: level.color }} />
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: level.color }}>
                Moneo Score
              </span>
            </div>
            <p className="text-base font-bold text-white">{level.name}</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-tight">{scoreResult.summary}</p>
          </div>
          <ChevronRight size={16} className="text-slate-600 flex-shrink-0" />
        </div>
      </button>

      {/* ── Money Coach ──────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Lightbulb size={14} style={{ color: '#fbbf24' }} />
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#3d5068' }}>
              Money Coach
            </p>
          </div>
          <button
            onClick={() => onNavigate('money-coach')}
            className="text-[11px] text-blue-400 font-semibold hover:text-blue-300 cursor-pointer"
          >
            See all
          </button>
        </div>

        {insights.length === 0 ? (
          <div
            className="rounded-2xl px-4 py-5 text-center"
            style={{ background: '#0d1526', border: '1px solid #1e2d4a' }}
          >
            <Lightbulb size={24} className="mx-auto mb-2 text-slate-600" />
            <p className="text-sm text-slate-500">Add more transactions to get personalized insights.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {insights.slice(0, 3).map(ins => {
              const colors = INSIGHT_COLORS[ins.type];
              const Icon = INSIGHT_ICON_MAP[ins.icon];
              return (
                <div
                  key={ins.id}
                  className="rounded-2xl px-4 py-3 flex items-start gap-3"
                  style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                >
                  <Icon size={15} className="flex-shrink-0 mt-0.5" style={{ color: colors.icon }} />
                  <p className="text-xs text-slate-300 leading-relaxed">{ins.text}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Statistics quick link ────────────────────────────── */}
      <button
        onClick={() => onNavigate('statistics')}
        className="card-dark w-full rounded-2xl flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all text-left"
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(96,165,250,0.12)' }}>
          <BarChart2 size={17} className="text-blue-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-200">Statistics</p>
          <p className="text-xs text-slate-500 mt-0.5">Charts, categories, monthly view</p>
        </div>
        <ChevronRight size={15} className="text-slate-600" />
      </button>

      {/* ── What If (Premium teaser) ─────────────────────────── */}
      <button
        onClick={() => onNavigate('what-if')}
        className="w-full rounded-2xl flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all text-left"
        style={isPremium
          ? { background: '#0d1526', border: '1px solid #1e2d4a' }
          : { background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.25)' }
        }
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(139,92,246,0.15)' }}>
          <TrendingUp size={17} style={{ color: '#a78bfa' }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-slate-200">What If?</p>
            {!isPremium && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                style={{ background: 'rgba(139,92,246,0.15)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.3)' }}
              >
                Premium
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Simulate financial decisions</p>
        </div>
        <ChevronRight size={15} className="text-slate-600" />
      </button>

    </div>
  );
};
