import React, { useMemo } from 'react';
import {
  ShieldCheck, Lightbulb, BarChart2, TrendingUp, ChevronRight,
  TrendingDown, AlertTriangle, Info, Sparkles, Flame, PiggyBank,
  CalendarDays, Zap, DollarSign, BookOpen, MessageCircle, GitBranch,
} from 'lucide-react';
import { Transaction, CategoryLimit, Subscription, SavingGoal, AppView } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import {
  calculateCashlyScore, generateInsights, getScoreLevel,
  InsightIcon, InsightType,
} from '../utils/insights';
import { useTheme } from '../context/ThemeContext';

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
  positive: { bg: 'rgba(16,185,129,0.07)', border: 'rgba(16,185,129,0.18)', icon: '#10b981' },
  warning:  { bg: 'rgba(239,68,68,0.06)',  border: 'rgba(239,68,68,0.16)',  icon: '#ef4444' },
  neutral:  { bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.16)', icon: '#3b82f6' },
  info:     { bg: 'rgba(139,92,246,0.07)', border: 'rgba(139,92,246,0.18)', icon: '#8b5cf6' },
};

interface ToolLink {
  view: AppView;
  icon: React.ElementType;
  color: string;
  label: string;
  desc: string;
  premium?: true;
}

const TOOL_LINKS: ToolLink[] = [
  { view: 'safe-to-spend',     icon: DollarSign,    color: '#34d399', label: 'Safe to Spend',     desc: 'How much you can spend today without stress' },
  { view: 'statistics',        icon: BarChart2,      color: '#60a5fa', label: 'Statistics',         desc: 'Charts, categories, monthly breakdown' },
  { view: 'what-if',          icon: TrendingUp,     color: '#a78bfa', label: 'What If?',           desc: 'Simulate decisions before making them',  premium: true },
  { view: 'spending-patterns', icon: GitBranch,      color: '#f97316', label: 'Spending Patterns',  desc: 'Detect trends across months',             premium: true },
  { view: 'projection',        icon: Sparkles,       color: '#fbbf24', label: 'Future Projections', desc: 'Where will your finances be in 6 months?', premium: true },
  { view: 'money-story',       icon: BookOpen,       color: '#c084fc', label: 'Monthly Story',      desc: 'A narrative recap of each month',          premium: true },
  { view: 'ask-moneo',         icon: MessageCircle,  color: '#06b6d4', label: 'Ask Moneo',          desc: 'Query your finances in plain language',    premium: true },
];

const PremiumBadge = () => (
  <span
    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0"
    style={{ background: 'rgba(139,92,246,0.1)', color: '#7c3aed', border: '1px solid rgba(139,92,246,0.2)' }}
  >
    Premium
  </span>
);

const ToolRow: React.FC<ToolLink & { isPremium: boolean; onNavigate: (v: AppView) => void }> = ({
  view, icon: Icon, color, label, desc, premium, isPremium, onNavigate,
}) => {
  const { colors } = useTheme();
  const locked = premium && !isPremium;
  return (
    <button
      onClick={() => onNavigate(view)}
      className="card-dark w-full rounded-2xl flex items-center gap-3 px-4 py-3 cursor-pointer transition-all text-left"
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}14` }}>
        <Icon size={16} style={{ color: locked ? colors.textMuted : color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold truncate" style={{ color: locked ? colors.textMuted : colors.textPrimary }}>{label}</p>
          {locked && <PremiumBadge />}
        </div>
        <p className="text-xs mt-0.5 truncate" style={{ color: colors.textMuted }}>{desc}</p>
      </div>
      <ChevronRight size={14} style={{ color: colors.border }} className="flex-shrink-0" />
    </button>
  );
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

  const { colors } = useTheme();
  const level = getScoreLevel(scoreResult.score);
  const r = scoreResult.score / 100;
  const circumference = 2 * Math.PI * 36;

  return (
    <div className="page-enter px-4 pt-3 pb-8 space-y-5">

      <h1 className="text-xl font-bold pt-1" style={{ color: colors.textPrimary }}>Insights</h1>

      {/* ── Moneo Score Card ─────────────────────────────────── */}
      <button
        onClick={() => onNavigate('moneo-score')}
        className="card-dark w-full rounded-2xl p-4 text-left cursor-pointer transition-all"
      >
        <div className="flex items-center gap-4">
          {/* Mini ring */}
          <div className="relative flex-shrink-0" style={{ width: 72, height: 72 }}>
            <svg width={72} height={72} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={36} cy={36} r={28} fill="none" stroke={colors.borderStrong} strokeWidth={7} />
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
            <p className="text-base font-bold" style={{ color: colors.textPrimary }}>{level.name}</p>
            <p className="text-xs mt-0.5 leading-tight" style={{ color: colors.textSecondary }}>{scoreResult.summary}</p>
          </div>
          <ChevronRight size={16} style={{ color: '#d1d5db' }} className="flex-shrink-0" />
        </div>
      </button>

      {/* ── Money Coach ──────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Lightbulb size={14} style={{ color: '#fbbf24' }} />
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>
              Money Coach
            </p>
          </div>
          <button
            onClick={() => onNavigate('money-coach')}
            className="text-[11px] font-semibold cursor-pointer" style={{ color: '#6366f1' }}
          >
            See all
          </button>
        </div>

        {insights.length === 0 ? (
          <div
            className="rounded-2xl px-4 py-5 text-center"
            style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}` }}
          >
            <Lightbulb size={24} className="mx-auto mb-2" style={{ color: colors.textMuted }} />
            <p className="text-sm" style={{ color: colors.textMuted }}>Add more transactions to get personalized insights.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {insights.slice(0, 3).map(ins => {
              const ic = INSIGHT_COLORS[ins.type];
              const Icon = INSIGHT_ICON_MAP[ins.icon];
              return (
                <div
                  key={ins.id}
                  className="rounded-2xl px-4 py-3 flex items-start gap-3"
                  style={{ background: ic.bg, border: `1px solid ${ic.border}` }}
                >
                  <Icon size={15} className="flex-shrink-0 mt-0.5" style={{ color: ic.icon }} />
                  <p className="text-xs leading-relaxed" style={{ color: colors.textSecondary }}>{ins.text}</p>
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
          style={{ background: 'rgba(59,130,246,0.09)' }}>
          <BarChart2 size={17} style={{ color: '#3b82f6' }} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold" style={{ color: colors.textPrimary }}>Statistics</p>
          <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>Charts, categories, monthly view</p>
        </div>
        <ChevronRight size={15} style={{ color: colors.border }} />
      </button>

      {/* ── Quick tools grid ─────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: colors.textMuted }}>
          Tools
        </p>
        <div className="space-y-2">
          {TOOL_LINKS.map(t => (
            <ToolRow key={t.view} {...t} isPremium={isPremium} onNavigate={onNavigate} />
          ))}
        </div>
      </div>

    </div>
  );
};
