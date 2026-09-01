import React from 'react';
import { Home, Lightbulb, TrendingUp, Users, Settings } from 'lucide-react';
import { AppView } from '../types/finance';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';

interface BottomNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

export const HOME_VIEWS: AppView[]      = ['home', 'transactions', 'activity', 'recurring', 'recurring-income'];
export const INSIGHTS_VIEWS: AppView[]  = ['insights', 'statistics', 'money-coach', 'spending-patterns', 'what-if', 'moneo-score', 'projection', 'money-story', 'ask-moneo', 'safe-to-spend', 'budget', 'savings'];
export const EARN_VIEWS: AppView[]      = ['earn', 'earn-detail'];
export const COMMUNITY_VIEWS: AppView[] = ['community', 'community-detail'];
export const SETTINGS_VIEWS: AppView[]  = ['settings', 'premium', 'more'];

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const homeActive      = HOME_VIEWS.includes(currentView);
  const insightsActive  = INSIGHTS_VIEWS.includes(currentView);
  const earnActive      = EARN_VIEWS.includes(currentView);
  const communityActive = COMMUNITY_VIEWS.includes(currentView);
  const settingsActive  = SETTINGS_VIEWS.includes(currentView);

  const accent      = colors.accent;
  const inactive    = colors.textMuted;
  const EARN_ACCENT = '#fbbf24';

  return (
    <div className="bottom-nav-bar">
      <NavBtn label={t('navHome')}      Icon={Home}      active={homeActive}      accent={accent}      inactive={inactive} isDark={isDark} onClick={() => onNavigate('home')} />
      <NavBtn label={t('navInsights')}  Icon={Lightbulb} active={insightsActive}  accent={accent}      inactive={inactive} isDark={isDark} onClick={() => onNavigate('insights')} />
      <NavBtn label="Earn"              Icon={TrendingUp} active={earnActive}     accent={EARN_ACCENT} inactive={inactive} isDark={isDark} onClick={() => onNavigate('earn')} earn />
      <NavBtn label={t('navCommunity')} Icon={Users}     active={communityActive} accent={accent}      inactive={inactive} isDark={isDark} onClick={() => onNavigate('community')} />
      <NavBtn label={t('settings')}     Icon={Settings}  active={settingsActive}  accent={accent}      inactive={inactive} isDark={isDark} onClick={() => onNavigate('settings')} />
    </div>
  );
};

function NavBtn({
  label, Icon, active, accent, inactive, isDark, onClick, earn,
}: {
  label: string;
  Icon: React.ElementType;
  active: boolean;
  accent: string;
  inactive: string;
  isDark: boolean;
  onClick: () => void;
  earn?: boolean;
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
      <div
        style={{
          width: active ? 48 : 36,
          height: earn && active ? 34 : 32,
          borderRadius: 99,
          background: active
            ? isDark ? `${accent}22` : `${accent}18`
            : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: earn && active ? `0 0 14px ${accent}45` : 'none',
        }}
      >
        <Icon
          size={active ? 21 : 20}
          strokeWidth={active ? 2.4 : 1.8}
          style={{
            color: active ? accent : inactive,
            transition: 'all 0.2s ease',
            filter: active ? `drop-shadow(0 0 6px ${accent}60)` : 'none',
          }}
        />
      </div>

      <span
        style={{
          fontSize: 10,
          fontWeight: active ? 700 : 500,
          color: active ? accent : inactive,
          transition: 'all 0.2s ease',
          letterSpacing: active ? '0.01em' : '0',
        }}
      >
        {label}
      </span>
    </button>
  );
}
