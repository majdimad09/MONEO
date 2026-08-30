import React, { useMemo } from 'react';
import {
  ShieldCheck, Lightbulb, BarChart2, TrendingUp, ChevronRight,
  TrendingDown, AlertTriangle, Info, Sparkles, Flame, PiggyBank,
  CalendarDays, Zap, BookOpen, MessageCircle, GitBranch, Crown, Sun, Moon,
} from 'lucide-react';
import { Transaction, CategoryLimit, Subscription, SavingGoal, AppView } from '../types/finance';
import {
  calculateCashlyScore, generateInsights, getScoreLevel,
  InsightIcon, InsightType,
} from '../utils/insights';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { TKey } from '../i18n/translations';

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

function getInsightColors(isDark: boolean): Record<InsightType, { bg: string; border: string; icon: string; accent: string }> {
  return {
    positive: { bg: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.06)', border: isDark ? 'rgba(16,185,129,0.28)' : 'rgba(16,185,129,0.16)', icon: '#10b981', accent: '#10b981' },
    warning:  { bg: isDark ? 'rgba(239,68,68,0.12)'  : 'rgba(239,68,68,0.05)',  border: isDark ? 'rgba(239,68,68,0.28)'  : 'rgba(239,68,68,0.15)',  icon: '#ef4444', accent: '#ef4444' },
    neutral:  { bg: isDark ? 'rgba(129,140,248,0.12)' : 'rgba(129,140,248,0.05)', border: isDark ? 'rgba(129,140,248,0.28)' : 'rgba(129,140,248,0.15)', icon: '#818cf8', accent: '#818cf8' },
    info:     { bg: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.06)', border: isDark ? 'rgba(139,92,246,0.28)' : 'rgba(139,92,246,0.16)', icon: '#8b5cf6', accent: '#8b5cf6' },
  };
}

interface ToolConfig {
  view: AppView;
  icon: React.ElementType;
  color: string;
  iconBg: string;
  labelKey: TKey;
  descKey: TKey;
  premium?: true;
}

const TOOL_CONFIGS: ToolConfig[] = [
  { view: 'safe-to-spend',     icon: Zap,           color: '#34d399', iconBg: 'rgba(52,211,153,0.12)',  labelKey: 'safeToSpend',         descKey: 'descSafeToSpend' },
  { view: 'statistics',        icon: BarChart2,      color: '#818cf8', iconBg: 'rgba(129,140,248,0.12)', labelKey: 'statisticsTitle',     descKey: 'descStatistics' },
  { view: 'what-if',           icon: TrendingUp,     color: '#a78bfa', iconBg: 'rgba(167,139,250,0.12)', labelKey: 'featWhatIf',          descKey: 'descWhatIf',       premium: true },
  { view: 'spending-patterns', icon: GitBranch,      color: '#f97316', iconBg: 'rgba(249,115,22,0.12)',  labelKey: 'spendingPatternsTitle',descKey: 'descSpendingPatterns', premium: true },
  { view: 'projection',        icon: Sparkles,       color: '#fbbf24', iconBg: 'rgba(251,191,36,0.12)',  labelKey: 'featProjectionShort', descKey: 'descProjection',   premium: true },
  { view: 'money-story',       icon: BookOpen,       color: '#c084fc', iconBg: 'rgba(192,132,252,0.12)', labelKey: 'monthlyStoryTitle',   descKey: 'descMoneyStory',   premium: true },
  { view: 'ask-moneo',         icon: MessageCircle,  color: '#06b6d4', iconBg: 'rgba(6,182,212,0.12)',   labelKey: 'featAskMoneo',        descKey: 'descMoneyStory',   premium: true },
];

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

  const { isDark, colors, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const INSIGHT_COLORS = getInsightColors(isDark);
  const level = getScoreLevel(scoreResult.score);
  const circumference = 2 * Math.PI * 36;
  const strokeOffset = circumference - (scoreResult.score / 100) * circumference;

  return (
    <div className="page-enter px-4 pt-3 pb-8 space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between pt-1">
        <h1 className="text-xl font-bold" style={{ color: colors.textPrimary }}>{t('insightsHub')}</h1>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-9 h-9 rounded-2xl flex items-center justify-center cursor-pointer transition-all"
          style={{ background: colors.bgSecondary, border: `1px solid ${colors.borderStrong}` }}
        >
          {isDark
            ? <Sun size={16} style={{ color: '#fbbf24' }} />
            : <Moon size={16} style={{ color: '#6366f1' }} />}
        </button>
      </div>

      {/* ── Moneo Score Card ── */}
      <button
        onClick={() => onNavigate('moneo-score')}
        className="w-full rounded-3xl text-left cursor-pointer transition-all overflow-hidden"
        style={{
          background: isDark
            ? `linear-gradient(135deg, ${level.color}18 0%, ${level.color}08 100%)`
            : `linear-gradient(135deg, ${level.color}10 0%, ${level.color}05 100%)`,
          border: `1px solid ${level.color}30`,
          boxShadow: isDark ? `0 4px 24px ${level.color}15` : `0 2px 12px ${level.color}10`,
          padding: '20px',
        }}
      >
        <div className="flex items-center gap-5">
          {/* Score ring */}
          <div className="relative flex-shrink-0" style={{ width: 80, height: 80 }}>
            <svg width={80} height={80} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={40} cy={40} r={32} fill="none" stroke={`${level.color}25`} strokeWidth={8} />
              <circle
                cx={40} cy={40} r={32} fill="none"
                stroke={level.color} strokeWidth={8} strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 32}
                strokeDashoffset={2 * Math.PI * 32 - (scoreResult.score / 100) * 2 * Math.PI * 32}
                style={{
                  filter: `drop-shadow(0 0 10px ${level.color}80)`,
                  transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.2,0.64,1)',
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-bold leading-none" style={{ fontSize: 22, color: level.color }}>
                {scoreResult.score}
              </span>
              <span className="text-[9px] font-semibold mt-0.5" style={{ color: `${level.color}80` }}>/100</span>
            </div>
          </div>

          {/* Score info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={13} style={{ color: level.color }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${level.color}90` }}>
                {t('moneoScore')}
              </span>
            </div>
            <p className="text-xl font-bold leading-tight mb-1" style={{ color: level.color }}>{level.name}</p>
            <p className="text-[12px] leading-relaxed" style={{ color: colors.textSecondary }}>{scoreResult.summary}</p>
          </div>

          <div className="flex-shrink-0 flex flex-col items-center gap-1">
            <ChevronRight size={16} style={{ color: level.color }} />
          </div>
        </div>

        <div className="mt-4 pt-3 flex items-center justify-center" style={{ borderTop: `1px solid ${level.color}20` }}>
          <span className="text-[11px] font-semibold" style={{ color: `${level.color}80` }}>
            {t('tapForFullReport')}
          </span>
        </div>
      </button>

      {/* ── AI Insights ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lightbulb size={14} style={{ color: '#fbbf24' }} />
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>
              {t('yourInsights')}
            </p>
          </div>
          <button onClick={() => onNavigate('money-coach')} className="text-[11px] font-semibold cursor-pointer" style={{ color: colors.accent }}>
            {t('seeAll')}
          </button>
        </div>

        {insights.length === 0 ? (
          <div className="rounded-2xl px-4 py-6 text-center" style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}` }}>
            <Lightbulb size={22} className="mx-auto mb-2" style={{ color: colors.textMuted }} />
            <p className="text-sm" style={{ color: colors.textMuted }}>{t('noInsightsYet')}</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {insights.slice(0, 3).map(ins => {
              const ic = INSIGHT_COLORS[ins.type];
              const Icon = INSIGHT_ICON_MAP[ins.icon];
              return (
                <div
                  key={ins.id}
                  className="rounded-2xl px-4 py-3 flex items-start gap-3"
                  style={{
                    background: ic.bg,
                    border: `1px solid ${ic.border}`,
                    borderLeft: `3px solid ${ic.icon}`,
                    paddingLeft: 14,
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${ic.icon}15` }}
                  >
                    <Icon size={13} style={{ color: ic.icon }} strokeWidth={2.2} />
                  </div>
                  <p className="text-[12px] leading-relaxed flex-1" style={{ color: colors.textSecondary }}>{ins.text}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Analytics Tools ── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: colors.textMuted }}>
          {t('financialTools')}
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {TOOL_CONFIGS.map(cfg => {
            const Icon = cfg.icon;
            const locked = cfg.premium && !isPremium;
            return (
              <button
                key={cfg.view}
                onClick={() => onNavigate(cfg.view)}
                className="card-dark rounded-2xl p-3.5 text-left cursor-pointer transition-all flex flex-col gap-2.5"
                style={locked ? { opacity: 0.75 } : undefined}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: cfg.iconBg }}
                  >
                    <Icon size={16} style={{ color: locked ? colors.textMuted : cfg.color }} strokeWidth={2} />
                  </div>
                  {locked && <Crown size={12} style={{ color: '#8b5cf6' }} />}
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: locked ? colors.textMuted : colors.textPrimary }}>
                    {t(cfg.labelKey)}
                  </p>
                  <p className="text-[10px] mt-0.5 leading-tight" style={{ color: colors.textMuted }}>
                    {t(cfg.descKey)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
