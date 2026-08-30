import React from 'react';
import {
  Wallet, Repeat, PiggyBank, TrendingUp, BarChart2, Sparkles,
  BookOpen, ShieldCheck, GitBranch, CalendarDays,
  Crown, Settings2, Zap, Target, DollarSign,
} from 'lucide-react';
import { AppView } from '../types/finance';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { TKey } from '../i18n/translations';

interface FeaturesHubProps {
  isPremium: boolean;
  onNavigate: (view: AppView) => void;
}

interface FeatureCard {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  desc: string;
  view: AppView;
  premium?: boolean;
  badge?: string;
}

interface SectionConfig {
  titleKey: TKey;
  cards: Array<{
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    labelKey: TKey;
    descKey: TKey;
    view: AppView;
    premium?: boolean;
  }>;
}

const SECTION_CONFIGS: SectionConfig[] = [
  {
    titleKey: 'sectionMoney',
    cards: [
      { icon: Wallet,       iconColor: '#10b981', iconBg: 'rgba(16,185,129,0.12)',  labelKey: 'budget',              descKey: 'descBudget',           view: 'budget' },
      { icon: Repeat,       iconColor: '#a78bfa', iconBg: 'rgba(167,139,250,0.12)', labelKey: 'featRecurring',       descKey: 'descRecurring',        view: 'recurring' },
      { icon: PiggyBank,    iconColor: '#34d399', iconBg: 'rgba(52,211,153,0.12)',  labelKey: 'savingGoalsTitle',    descKey: 'descSavingsGoals',     view: 'savings' },
      { icon: DollarSign,   iconColor: '#fbbf24', iconBg: 'rgba(251,191,36,0.12)',  labelKey: 'featRecurringIncome', descKey: 'descRecurringIncome',  view: 'recurring-income' },
    ],
  },
  {
    titleKey: 'sectionAnalytics',
    cards: [
      { icon: BarChart2,   iconColor: '#818cf8', iconBg: 'rgba(129,140,248,0.12)', labelKey: 'statisticsTitle',      descKey: 'descStatistics',       view: 'statistics' },
      { icon: ShieldCheck, iconColor: '#10b981', iconBg: 'rgba(16,185,129,0.12)',  labelKey: 'moneoScore',           descKey: 'descMoneoScore',       view: 'moneo-score' },
      { icon: GitBranch,   iconColor: '#f97316', iconBg: 'rgba(249,115,22,0.12)',  labelKey: 'spendingPatternsTitle',descKey: 'descSpendingPatterns', view: 'spending-patterns', premium: true },
      { icon: BookOpen,    iconColor: '#c084fc', iconBg: 'rgba(192,132,252,0.12)', labelKey: 'monthlyStoryTitle',    descKey: 'descMoneyStory',       view: 'money-story', premium: true },
    ],
  },
  {
    titleKey: 'sectionPlanningTools',
    cards: [
      { icon: Zap,         iconColor: '#34d399', iconBg: 'rgba(52,211,153,0.12)',  labelKey: 'safeToSpend',         descKey: 'descSafeToSpend',      view: 'safe-to-spend' },
      { icon: CalendarDays,iconColor: '#818cf8', iconBg: 'rgba(129,140,248,0.12)', labelKey: 'featTimeline',        descKey: 'descTimeline',         view: 'activity' },
      { icon: TrendingUp,  iconColor: '#f59e0b', iconBg: 'rgba(245,158,11,0.12)',  labelKey: 'featWhatIf',          descKey: 'descWhatIf',           view: 'what-if', premium: true },
      { icon: Target,      iconColor: '#a78bfa', iconBg: 'rgba(167,139,250,0.12)', labelKey: 'featProjectionShort', descKey: 'descProjection',       view: 'projection', premium: true },
    ],
  },
];

export const FeaturesHub: React.FC<FeaturesHubProps> = ({ isPremium, onNavigate }) => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const sections = SECTION_CONFIGS.map(s => ({
    title: t(s.titleKey),
    cards: s.cards.map(c => ({
      icon: c.icon,
      iconColor: c.iconColor,
      iconBg: c.iconBg,
      label: t(c.labelKey),
      desc: t(c.descKey),
      view: c.view,
      premium: c.premium,
    })),
  }));

  return (
    <div className="page-enter px-4 pt-3 pb-8 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between pt-1 pb-1">
        <h1 className="text-xl font-bold" style={{ color: colors.textPrimary }}>{t('moreTitle')}</h1>
        <button
          onClick={() => onNavigate('settings')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer transition-all"
          style={{ background: colors.bgPrimary, border: `1px solid ${colors.borderStrong}` }}
        >
          <Settings2 size={14} style={{ color: colors.textMuted }} />
          <span className="text-xs font-semibold" style={{ color: colors.textSecondary }}>{t('settings')}</span>
        </button>
      </div>

      {/* Premium banner (if free) */}
      {!isPremium && (
        <button
          onClick={() => onNavigate('premium')}
          className="w-full rounded-2xl p-4 text-left cursor-pointer transition-all"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(109,40,217,0.08))'
              : 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
            border: '1px solid rgba(139,92,246,0.25)',
            boxShadow: '0 2px 12px rgba(139,92,246,0.1)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(139,92,246,0.15)' }}
              >
                <Crown size={18} style={{ color: '#7c3aed' }} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: colors.textPrimary }}>{t('upgradeToPremium')}</p>
                <p className="text-xs" style={{ color: '#7c3aed' }}>{t('upgradePriceTag')}</p>
              </div>
            </div>
            <Sparkles size={16} style={{ color: '#8b5cf6' }} />
          </div>
        </button>
      )}

      {/* Feature sections */}
      {sections.map(section => (
        <div key={section.title}>
          <p className="text-[11px] font-bold uppercase tracking-widest px-1 mb-2" style={{ color: colors.textMuted }}>
            {section.title}
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {section.cards.map(card => (
              <FeatureCardButton
                key={card.view}
                card={card}
                isPremium={isPremium}
                onClick={() => onNavigate(card.view)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Settings row */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest px-1 mb-2" style={{ color: colors.textMuted }}>
          {t('sectionAccount')}
        </p>
        <button
          onClick={() => onNavigate('settings')}
          className="card-dark w-full rounded-2xl flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all text-left"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(100,116,139,0.09)', border: '1px solid rgba(100,116,139,0.15)' }}>
            <Settings2 size={16} style={{ color: colors.textSecondary }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{t('settings')}</p>
            <p className="text-xs" style={{ color: colors.textMuted }}>{t('settingsTagline')}</p>
          </div>
        </button>
      </div>

    </div>
  );
};

const FeatureCardButton: React.FC<{
  card: FeatureCard;
  isPremium: boolean;
  onClick: () => void;
}> = ({ card, isPremium, onClick }) => {
  const { colors } = useTheme();
  const locked = card.premium && !isPremium;
  const Icon = card.icon;

  return (
    <button
      onClick={onClick}
      className="card-dark rounded-2xl p-3.5 text-left cursor-pointer transition-all flex flex-col gap-2.5"
      style={locked ? { opacity: 0.75 } : undefined}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: card.iconBg }}
        >
          <Icon size={17} style={{ color: locked ? '#c4c7d0' : card.iconColor }} />
        </div>
        {card.badge ? (
          <span
            className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
            style={{ background: 'rgba(16,185,129,0.09)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            {card.badge}
          </span>
        ) : locked ? (
          <Crown size={12} style={{ color: '#8b5cf6' }} />
        ) : null}
      </div>
      <div>
        <p className="text-xs font-bold" style={{ color: locked ? colors.textMuted : colors.textPrimary }}>{card.label}</p>
        <p className="text-[10px] mt-0.5 leading-tight" style={{ color: colors.textMuted }}>{card.desc}</p>
      </div>
    </button>
  );
};
