import React, { useMemo } from 'react';
import {
  ShieldCheck, Lightbulb, BarChart2, TrendingUp, ChevronRight,
  TrendingDown, AlertTriangle, Info, Sparkles, Flame, PiggyBank,
  CalendarDays, Zap, BookOpen, MessageCircle, GitBranch, Crown,
  Brain, Sun, Moon,
} from 'lucide-react';
import { Transaction, CategoryLimit, Subscription, SavingGoal, AppView, RecurringIncome } from '../types/finance';
import {
  calculateCashlyScore, generateInsights, getScoreLevel,
  InsightIcon, InsightType,
} from '../utils/insights';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { ContextualSetupCallout } from './SetupReminderCard';

interface InsightsHubProps {
  transactions: Transaction[];
  currency: string;
  monthlyBudget: number;
  categoryLimits: CategoryLimit[];
  subscriptions: Subscription[];
  savingGoals: SavingGoal[];
  recurringIncome?: RecurringIncome[];
  isPremium: boolean;
  onNavigate: (view: AppView) => void;
}

const INSIGHT_ICON_MAP: Record<InsightIcon, React.ElementType> = {
  'trending-up': TrendingUp, 'trending-down': TrendingDown, 'alert': AlertTriangle,
  'info': Info, 'sparkle': Sparkles, 'calendar': CalendarDays, 'piggy': PiggyBank,
  'fire': Flame, 'zap': Zap,
};

function getInsightColors(isDark: boolean): Record<InsightType, { bg: string; border: string; icon: string }> {
  return {
    positive: { bg: isDark ? 'rgba(34,197,94,0.10)'  : 'rgba(16,185,129,0.06)', border: isDark ? 'rgba(34,197,94,0.26)'  : 'rgba(16,185,129,0.16)', icon: isDark ? '#22c55e' : '#10b981' },
    warning:  { bg: isDark ? 'rgba(239,68,68,0.10)'  : 'rgba(239,68,68,0.05)',  border: isDark ? 'rgba(239,68,68,0.26)'  : 'rgba(239,68,68,0.15)',  icon: '#ef4444' },
    neutral:  { bg: isDark ? 'rgba(34,197,94,0.07)'  : 'rgba(129,140,248,0.05)', border: isDark ? 'rgba(34,197,94,0.20)'  : 'rgba(129,140,248,0.15)', icon: isDark ? '#4ade80' : '#818cf8' },
    info:     { bg: isDark ? 'rgba(251,191,36,0.08)'  : 'rgba(139,92,246,0.06)',  border: isDark ? 'rgba(251,191,36,0.22)'  : 'rgba(139,92,246,0.16)',  icon: isDark ? '#fbbf24' : '#8b5cf6' },
  };
}

interface SectionTool {
  view: AppView;
  icon: React.ElementType;
  color: string;
  iconBg: string;
  label: string;
  desc: string;
  premium?: true;
}

interface Section {
  label: string;
  tools: SectionTool[];
}

const ToolRow: React.FC<{ tool: SectionTool; isPremium: boolean; onNavigate: (v: AppView) => void; isLast?: boolean }> = ({ tool, isPremium, onNavigate, isLast }) => {
  const { isDark, colors } = useTheme();
  const locked = tool.premium && !isPremium;
  const Icon = tool.icon;
  return (
    <button
      onClick={() => onNavigate(tool.view)}
      className="w-full flex items-center gap-3.5 px-4 py-4 text-left cursor-pointer transition-all active:scale-[0.98]"
      style={isLast ? undefined : { borderBottom: `1px solid ${colors.divider}` }}
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{
          background: locked
            ? isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
            : `linear-gradient(135deg, ${tool.color}28, ${tool.color}18)`,
          border: locked ? 'none' : `1.5px solid ${tool.color}25`,
          boxShadow: locked ? 'none' : `0 2px 10px ${tool.color}20`,
        }}
      >
        <Icon size={19} style={{ color: locked ? colors.textMuted : tool.color }} strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold" style={{ color: locked ? colors.textMuted : colors.textPrimary, letterSpacing: '-0.01em' }}>{tool.label}</p>
          {locked && (
            <span
              className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{
                background: isDark ? 'rgba(34,197,94,0.12)' : 'linear-gradient(135deg, rgba(109,40,217,0.16), rgba(139,92,246,0.10))',
                color: isDark ? '#4ade80' : '#a78bfa',
                border: isDark ? '1px solid rgba(34,197,94,0.28)' : '1px solid rgba(139,92,246,0.25)',
              }}
            >
              PRO
            </span>
          )}
        </div>
        <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{tool.desc}</p>
      </div>
      {locked
        ? <Crown size={14} style={{ color: isDark ? '#22c55e' : '#8b5cf6', flexShrink: 0 }} />
        : <ChevronRight size={15} style={{ color: locked ? colors.textMuted : `${tool.color}80`, flexShrink: 0 }} />}
    </button>
  );
}

export const InsightsHub: React.FC<InsightsHubProps> = ({
  transactions, currency, monthlyBudget, categoryLimits, subscriptions, savingGoals,
  recurringIncome = [], isPremium, onNavigate,
}) => {
  const scoreResult = useMemo(
    () => calculateCashlyScore(transactions, monthlyBudget, categoryLimits, subscriptions, savingGoals, recurringIncome),
    [transactions, monthlyBudget, categoryLimits, subscriptions, savingGoals, recurringIncome],
  );
  const insights = useMemo(
    () => generateInsights(transactions, currency, subscriptions, recurringIncome),
    [transactions, currency, subscriptions, recurringIncome],
  );

  const { isDark, colors, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const INSIGHT_COLORS = getInsightColors(isDark);
  const level = getScoreLevel(scoreResult.score);

  const SECTIONS: Section[] = [
    {
      label: 'YOUR MONEY',
      tools: [
        { view: 'statistics',        icon: BarChart2,     color: '#818cf8', iconBg: 'rgba(129,140,248,0.12)', label: t('statisticsTitle'),      desc: t('descStatistics') },
        { view: 'spending-patterns', icon: GitBranch,     color: '#f97316', iconBg: 'rgba(249,115,22,0.12)',  label: t('spendingPatternsTitle'), desc: t('descSpendingPatterns'), premium: true },
        { view: 'money-story',       icon: BookOpen,      color: '#c084fc', iconBg: 'rgba(192,132,252,0.12)', label: t('monthlyStoryTitle'),     desc: t('descMoneyStory'),       premium: true },
      ],
    },
    {
      label: 'PLAN',
      tools: [
        { view: 'safe-to-spend', icon: Zap,        color: '#22c55e', iconBg: 'rgba(34,197,94,0.12)',  label: t('safeToSpend'),         desc: t('descSafeToSpend') },
        { view: 'projection',    icon: Sparkles,   color: '#fbbf24', iconBg: 'rgba(251,191,36,0.12)',  label: t('featProjectionShort'), desc: t('descProjection'),   premium: true },
        { view: 'what-if',       icon: TrendingUp, color: '#a78bfa', iconBg: 'rgba(167,139,250,0.12)', label: t('featWhatIf'),          desc: t('descWhatIf'),       premium: true },
      ],
    },
    {
      label: 'SMART INSIGHTS',
      tools: [
        { view: 'money-coach',    icon: Brain,         color: '#818cf8', iconBg: 'rgba(129,140,248,0.12)', label: t('featMoneyCoach'),    desc: 'Personalized observations from your data', premium: true },
        { view: 'ask-moneo',      icon: MessageCircle, color: '#06b6d4', iconBg: 'rgba(6,182,212,0.12)',   label: t('featAskMoneo'),      desc: 'Chat with your AI financial assistant',    premium: true },
        { view: 'moneo-score',    icon: ShieldCheck,   color: '#10b981', iconBg: 'rgba(16,185,129,0.12)',  label: 'Advanced Score',       desc: 'Score history, factors & improvement tips', premium: !isPremium ? true : undefined },
      ],
    },
  ];

  return (
    <div className="page-enter px-4 pt-3 pb-8 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-bold" style={{ color: colors.textPrimary, letterSpacing: '-0.02em' }}>{t('insightsHub')}</h1>
          <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>Your financial intelligence center</p>
        </div>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-10 h-10 rounded-2xl flex items-center justify-center cursor-pointer transition-all"
          style={{
            background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(99,102,241,0.08)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(99,102,241,0.14)'}`,
          }}
        >
          {isDark
            ? <Sun size={16} style={{ color: '#fbbf24' }} />
            : <Moon size={16} style={{ color: '#6366f1' }} />}
        </button>
      </div>

      {/* Setup callout — if key data is missing */}
      <ContextualSetupCallout
        relevantKeys={['monthly-budget', 'recurring-income', 'savings-goal']}
        headerText="Improve your insights"
      />

      {/* Moneo Score Card — richer gradient */}
      <button
        onClick={() => onNavigate('moneo-score')}
        className="w-full rounded-3xl text-left cursor-pointer transition-all overflow-hidden active:scale-[0.98]"
        style={{
          background: isDark
            ? `linear-gradient(145deg, ${level.color}20 0%, rgba(13,13,20,0.9) 100%)`
            : `linear-gradient(145deg, ${level.color}14 0%, rgba(255,255,255,0.98) 100%)`,
          border: `1px solid ${level.color}35`,
          boxShadow: isDark
            ? `0 6px 32px ${level.color}18, 0 1px 0 rgba(255,255,255,0.04) inset`
            : `0 4px 24px ${level.color}14`,
          padding: '20px',
        }}
      >
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0" style={{ width: 84, height: 84 }}>
            <svg width={84} height={84} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={42} cy={42} r={34} fill="none" stroke={`${level.color}22`} strokeWidth={8} />
              <circle
                cx={42} cy={42} r={34} fill="none"
                stroke={level.color} strokeWidth={8} strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 34}
                strokeDashoffset={2 * Math.PI * 34 - (scoreResult.score / 100) * 2 * Math.PI * 34}
                style={{ filter: `drop-shadow(0 0 12px ${level.color}88)`, transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.2,0.64,1)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span style={{ fontSize: 24, fontWeight: 900, color: level.color, letterSpacing: '-0.04em', lineHeight: 1 }}>{scoreResult.score}</span>
              <span style={{ fontSize: 9, fontWeight: 600, color: `${level.color}70`, marginTop: 2 }}>/100</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck size={12} style={{ color: level.color }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${level.color}90` }}>{t('moneoScore')}</span>
            </div>
            <p className="text-xl font-bold leading-tight mb-1.5" style={{ color: level.color, letterSpacing: '-0.02em' }}>{level.name}</p>
            <p className="text-[12px] leading-relaxed" style={{ color: colors.textSecondary }}>{scoreResult.summary}</p>
          </div>
          <ChevronRight size={16} style={{ color: `${level.color}80`, flexShrink: 0 }} />
        </div>
        <div className="mt-4 pt-3 flex items-center justify-center" style={{ borderTop: `1px solid ${level.color}18` }}>
          <span className="text-[11px] font-semibold" style={{ color: `${level.color}70` }}>{t('tapForFullReport')}</span>
        </div>
      </button>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb size={13} style={{ color: '#fbbf24' }} />
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>{t('yourInsights')}</p>
            </div>
            <button onClick={() => onNavigate('money-coach')} className="text-[11px] font-bold cursor-pointer" style={{ color: colors.accent }}>{t('seeAll')}</button>
          </div>
          <div className="space-y-2.5">
            {insights.slice(0, 2).map(ins => {
              const ic   = INSIGHT_COLORS[ins.type];
              const Icon = INSIGHT_ICON_MAP[ins.icon];
              return (
                <div
                  key={ins.id}
                  className="rounded-2xl flex items-start gap-3"
                  style={{ background: ic.bg, border: `1px solid ${ic.border}`, borderLeft: `3px solid ${ic.icon}`, padding: '12px 14px 12px 12px' }}
                >
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${ic.icon}18` }}>
                    <Icon size={13} style={{ color: ic.icon }} strokeWidth={2.2} />
                  </div>
                  <p className="text-[12px] leading-relaxed flex-1" style={{ color: colors.textSecondary }}>{ins.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Organized sections — richer card treatment */}
      {SECTIONS.map(section => (
        <div key={section.label}>
          <p className="text-[11px] font-bold uppercase tracking-widest px-1 mb-2.5" style={{ color: colors.textMuted }}>
            {section.label}
          </p>
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: isDark ? colors.bgCard : '#ffffff',
              border: `1px solid ${isDark ? colors.border : 'rgba(99,102,241,0.10)'}`,
              boxShadow: isDark ? 'none' : '0 2px 16px rgba(99,102,241,0.06)',
            }}
          >
            {section.tools.map((tool, i) => (
              <ToolRow key={tool.view} tool={tool} isPremium={isPremium} onNavigate={onNavigate} isLast={i === section.tools.length - 1} />
            ))}
          </div>
        </div>
      ))}

      {/* Premium banner — vivid gradient */}
      {!isPremium && (
        <button
          onClick={() => onNavigate('premium')}
          className="w-full rounded-3xl p-5 text-left cursor-pointer transition-all active:scale-[0.98]"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(34,197,94,0.18), rgba(74,222,128,0.10))'
              : 'linear-gradient(135deg, #6d28d9, #8b5cf6)',
            border: isDark ? '1px solid rgba(34,197,94,0.30)' : 'none',
            boxShadow: isDark ? '0 4px 24px rgba(34,197,94,0.14)' : '0 8px 32px rgba(109,40,217,0.40)',
          }}
        >
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: isDark ? 'rgba(34,197,94,0.20)' : 'rgba(255,255,255,0.15)' }}
            >
              <Crown size={22} style={{ color: isDark ? '#22c55e' : '#ffffff' }} />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-bold leading-tight" style={{ color: isDark ? colors.textPrimary : '#ffffff', letterSpacing: '-0.01em' }}>
                Unlock Moneo Premium
              </p>
              <p className="text-xs mt-1" style={{ color: isDark ? '#4ade80' : 'rgba(255,255,255,0.80)' }}>
                Advanced insights, AI analysis & more — $1.99/mo
              </p>
            </div>
            <ChevronRight size={18} style={{ color: isDark ? '#22c55e' : 'rgba(255,255,255,0.70)', flexShrink: 0 }} />
          </div>
        </button>
      )}

    </div>
  );
};
