import React from 'react';
import { Home, Lightbulb, Wallet, Users, Settings } from 'lucide-react';
import { AppView } from '../types/finance';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';

interface BottomNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

const HOME_VIEWS: AppView[]      = ['home', 'transactions', 'activity'];
const INSIGHTS_VIEWS: AppView[]  = ['insights', 'statistics', 'money-coach', 'spending-patterns', 'what-if', 'moneo-score', 'projection', 'money-story', 'ask-moneo', 'safe-to-spend'];
const BUDGET_VIEWS: AppView[]    = ['budget', 'savings', 'recurring', 'recurring-income'];
const COMMUNITY_VIEWS: AppView[] = ['community', 'community-detail'];
const SETTINGS_VIEWS: AppView[]  = ['settings', 'premium', 'more'];

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const homeActive      = HOME_VIEWS.includes(currentView);
  const insightsActive  = INSIGHTS_VIEWS.includes(currentView);
  const budgetActive    = BUDGET_VIEWS.includes(currentView);
  const communityActive = COMMUNITY_VIEWS.includes(currentView);
  const settingsActive  = SETTINGS_VIEWS.includes(currentView);

  const accent = colors.accent;

  return (
    <div className="bottom-nav-bar">
      <NavBtn label={t('navHome')}      Icon={Home}      active={homeActive}      accent={accent} isDark={isDark} onClick={() => onNavigate('home')} />
      <NavBtn label={t('navInsights')}  Icon={Lightbulb} active={insightsActive}  accent={accent} isDark={isDark} onClick={() => onNavigate('insights')} />
      <NavBtn label={t('budget')}       Icon={Wallet}    active={budgetActive}    accent={accent} isDark={isDark} onClick={() => onNavigate('budget')} />
      <NavBtn label={t('navCommunity')} Icon={Users}     active={communityActive} accent={accent} isDark={isDark} onClick={() => onNavigate('community')} />
      <NavBtn label={t('settings')}     Icon={Settings}  active={settingsActive}  accent={accent} isDark={isDark} onClick={() => onNavigate('settings')} />
    </div>
  );
};

function NavBtn({ label, Icon, active, accent, isDark, onClick }: {
  label: string;
  Icon: React.ElementType;
  active: boolean;
  accent: string;
  isDark: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 py-1.5 rounded-2xl cursor-pointer select-none transition-all active:scale-[0.92]"
      style={{
        minWidth: 56,
        flex: 1,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Pill background — slides in on active */}
      <div
        style={{
          width: active ? 48 : 36,
          height: 32,
          borderRadius: 99,
          background: active
            ? isDark ? `${accent}1e` : `${accent}16`
            : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <Icon
          size={active ? 21 : 20}
          strokeWidth={active ? 2.4 : 1.8}
          style={{
            color: active ? accent : isDark ? '#6b6d85' : '#8b91a6',
            transition: 'all 0.2s ease',
            filter: active ? `drop-shadow(0 0 6px ${accent}55)` : 'none',
          }}
        />
      </div>

      <span
        style={{
          fontSize: 10,
          fontWeight: active ? 700 : 500,
          color: active ? accent : isDark ? '#6b6d85' : '#8b91a6',
          transition: 'all 0.2s ease',
          letterSpacing: active ? '0.01em' : '0',
        }}
      >
        {label}
      </span>
    </button>
  );
}
