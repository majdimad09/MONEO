import React, { useMemo } from 'react';
import {
  ShieldCheck, Lightbulb, BarChart2, TrendingUp, ChevronRight,
  TrendingDown, AlertTriangle, Info, Sparkles, Flame, PiggyBank,
  CalendarDays, Zap, BookOpen, MessageCircle, GitBranch, Crown,
  Brain, Sun, Moon,
} from 'lucide-react';
import { Transaction, CategoryLimit, Subscription, SavingGoal, AppView } from '../types/finance';
import {
  calculateCashlyScore, generateInsights, getScoreLevel,
  InsightIcon, InsightType,
} from '../utils/insights';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';

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

function getInsightColors(isDark: boolean): Record<InsightType, { bg: string; border: string; icon: string }> {
  return {
    positive: { bg: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.06)', border: isDark ? 'rgba(16,185,129,0.28)' : 'rgba(16,185,129,0.16)', icon: '#10b981' },
    warning:  { bg: isDark ? 'rgba(239,68,68,0.12)'  : 'rgba(239,68,68,0.05)',  border: isDark ? 'rgba(239,68,68,0.28)'  : 'rgba(239,68,68,0.15)',  icon: '#ef4444' },
    neutral:  { bg: isDark ? 'rgba(129,140,248,0.12)' : 'rgba(129,140,248,0.05)', border: isDark ? 'rgba(129,140,248,0.28)' : 'rgba(129,140,248,0.15)', icon: '#818cf8' },
    info:     { bg: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.06)', border: isDark ? 'rgba(139,92,246,0.28)' : 'rgba(139,92,246,0.16)', icon: '#8b5cf6' },
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
  const { colors } = useTheme();
  const locked = tool.premium && !isPremium;
  const Icon = tool.icon;
  return (
    <button
      onClick={() => onNavigate(tool.view)}
      className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left cursor-pointer transition-colors"
      style={isLast ? undefined : { borderBottom: `1px solid ${colors.divider}` }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: tool.iconBg }}
      >
        <Icon size={18} style={{ color: locked ? colors.textMuted : tool.color }} strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold" style={{ color: locked ? colors.textMuted : colors.textPrimary }}>{tool.label}</p>
          {locked && (
            <span
              className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}
            >
              PRO
            </span>
          )}
        </div>
        <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{tool.desc}</p>
      </div>
      {locked
        ? <Crown size={14} style={{ color: '#8b5cf6', flexShrink: 0 }} />
        : <ChevronRight size={15} style={{ color: colors.textMuted, flexShrink: 0 }} />}
    </button>
  );
}

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
        { view: 'safe-to-spend', icon: Zap,        color: '#34d399', iconBg: 'rgba(52,211,153,0.12)',  label: t('safeToSpend'),         desc: t('descSafeToSpend') },
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
          <h1 className="text-xl font-bold" style={{ color: colors.textPrimary }}>{t('insightsHub')}</h1>
          <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>Your financial intelligence center</p>
        </div>
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

      {/* Moneo Score Card */}
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
          <div className="relative flex-shrink-0" style={{ width: 80, height: 80 }}>
            <svg width={80} height={80} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={40} cy={40} r={32} fill="none" stroke={`${level.color}25`} strokeWidth={8} />
              <circle
                cx={40} cy={40} r={32} fill="none"
                stroke={level.color} strokeWidth={8} strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 32}
                strokeDashoffset={2 * Math.PI * 32 - (scoreResult.score / 100) * 2 * Math.PI * 32}
                style={{ filter: `drop-shadow(0 0 10px ${level.color}80)`, transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.2,0.64,1)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-bold leading-none" style={{ fontSize: 22, color: level.color }}>{scoreResult.score}</span>
              <span className="text-[9px] font-semibold mt-0.5" style={{ color: `${level.color}80` }}>/100</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={13} style={{ color: level.color }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${level.color}90` }}>{t('moneoScore')}</span>
            </div>
            <p className="text-xl font-bold leading-tight mb-1" style={{ color: level.color }}>{level.name}</p>
            <p className="text-[12px] leading-relaxed" style={{ color: colors.textSecondary }}>{scoreResult.summary}</p>
          </div>
          <ChevronRight size={16} style={{ color: level.color, flexShrink: 0 }} />
        </div>
        <div className="mt-4 pt-3 flex items-center justify-center" style={{ borderTop: `1px solid ${level.color}20` }}>
          <span className="text-[11px] font-semibold" style={{ color: `${level.color}80` }}>{t('tapForFullReport')}</span>
        </div>
      </button>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb size={14} style={{ color: '#fbbf24' }} />
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>{t('yourInsights')}</p>
            </div>
            <button onClick={() => onNavigate('money-coach')} className="text-[11px] font-semibold cursor-pointer" style={{ color: colors.accent }}>{t('seeAll')}</button>
          </div>
          <div className="space-y-2.5">
            {insights.slice(0, 2).map(ins => {
              const ic = INSIGHT_COLORS[ins.type];
              const Icon = INSIGHT_ICON_MAP[ins.icon];
              return (
                <div
                  key={ins.id}
                  className="rounded-2xl px-4 py-3 flex items-start gap-3"
                  style={{ background: ic.bg, border: `1px solid ${ic.border}`, borderLeft: `3px solid ${ic.icon}`, paddingLeft: 14 }}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${ic.icon}15` }}>
                    <Icon size={13} style={{ color: ic.icon }} strokeWidth={2.2} />
                  </div>
                  <p className="text-[12px] leading-relaxed flex-1" style={{ color: colors.textSecondary }}>{ins.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Organized sections */}
      {SECTIONS.map(section => (
        <div key={section.label}>
          <p className="text-[11px] font-bold uppercase tracking-widest px-1 mb-2.5" style={{ color: colors.textMuted }}>
            {section.label}
          </p>
          <div className="card-dark rounded-2xl overflow-hidden">
            {section.tools.map((tool, i) => (
              <ToolRow key={tool.view} tool={tool} isPremium={isPremium} onNavigate={onNavigate} isLast={i === section.tools.length - 1} />
            ))}
          </div>
        </div>
      ))}

      {/* Premium banner */}
      {!isPremium && (
        <button
          onClick={() => onNavigate('premium')}
          className="w-full rounded-2xl p-4 text-left cursor-pointer transition-all"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(139,92,246,0.14), rgba(109,40,217,0.08))'
              : 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
            border: '1px solid rgba(139,92,246,0.25)',
            boxShadow: '0 2px 12px rgba(139,92,246,0.1)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(139,92,246,0.15)' }}>
              <Crown size={18} style={{ color: '#7c3aed' }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: colors.textPrimary }}>Unlock Moneo Premium</p>
              <p className="text-xs mt-0.5" style={{ color: '#7c3aed' }}>Advanced insights, AI analysis & more — $1.99/mo</p>
            </div>
            <ChevronRight size={16} style={{ color: '#8b5cf6' }} />
          </div>
        </button>
      )}

    </div>
  );
};
