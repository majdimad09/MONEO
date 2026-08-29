import React from 'react';
import { Home, Lightbulb, Plus, Users, LayoutGrid } from 'lucide-react';
import { AppView } from '../types/finance';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';

interface BottomNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onAddPress: () => void;
}

const HOME_VIEWS: AppView[] = ['home', 'transactions', 'activity'];
const INSIGHTS_VIEWS: AppView[] = [
  'insights', 'statistics', 'money-coach', 'spending-patterns',
  'what-if', 'moneo-score', 'projection', 'money-story', 'ask-moneo', 'safe-to-spend',
];
const COMMUNITY_VIEWS: AppView[] = ['community', 'community-detail'];
const MORE_VIEWS: AppView[] = [
  'more', 'budget', 'savings', 'recurring', 'recurring-income',
  'settings', 'premium',
];

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate, onAddPress }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const homeActive      = HOME_VIEWS.includes(currentView);
  const insightsActive  = INSIGHTS_VIEWS.includes(currentView);
  const communityActive = COMMUNITY_VIEWS.includes(currentView);
  const moreActive      = MORE_VIEWS.includes(currentView);

  return (
    <div className="bottom-nav-bar">
      <NavBtn label={t('navHome')}      Icon={Home}       active={homeActive}      accent={colors.accent} muted={colors.textMuted} onClick={() => onNavigate('home')} />
      <NavBtn label={t('navInsights')}  Icon={Lightbulb}  active={insightsActive}  accent={colors.accent} muted={colors.textMuted} onClick={() => onNavigate('insights')} />

      <button className="fab-add" onClick={onAddPress} aria-label="Add transaction">
        <Plus size={22} color="white" strokeWidth={2.8} />
      </button>

      <NavBtn label={t('navCommunity')} Icon={Users}       active={communityActive} accent={colors.accent} muted={colors.textMuted} onClick={() => onNavigate('community')} />
      <NavBtn label={t('navMore')}      Icon={LayoutGrid}  active={moreActive}      accent={colors.accent} muted={colors.textMuted} onClick={() => onNavigate('more')} />
    </div>
  );
};

function NavBtn({ label, Icon, active, accent, muted, onClick }: {
  label: string; Icon: React.ElementType; active: boolean; accent: string; muted: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all select-none cursor-pointer"
      style={{ minWidth: 54, WebkitTapHighlightColor: 'transparent' }}
    >
      <Icon
        size={21}
        style={{
          color: active ? accent : muted,
          transition: 'color 0.18s ease',
        }}
      />
      <span className="text-[10px] font-bold transition-colors" style={{ color: active ? accent : muted }}>
        {label}
      </span>
    </button>
  );
}
