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

const HOME_VIEWS: AppView[]      = ['home', 'transactions', 'activity'];
const INSIGHTS_VIEWS: AppView[]  = ['insights', 'statistics', 'money-coach', 'spending-patterns', 'what-if', 'moneo-score', 'projection', 'money-story', 'ask-moneo', 'safe-to-spend'];
const COMMUNITY_VIEWS: AppView[] = ['community', 'community-detail'];
const MORE_VIEWS: AppView[]      = ['more', 'budget', 'savings', 'recurring', 'recurring-income', 'settings', 'premium'];

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate, onAddPress }) => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const homeActive      = HOME_VIEWS.includes(currentView);
  const insightsActive  = INSIGHTS_VIEWS.includes(currentView);
  const communityActive = COMMUNITY_VIEWS.includes(currentView);
  const moreActive      = MORE_VIEWS.includes(currentView);

  return (
    <div className="bottom-nav-bar">
      <NavBtn label={t('navHome')}      Icon={Home}       active={homeActive}      accent={colors.accent} muted={colors.textMuted} isDark={isDark} onClick={() => onNavigate('home')} />
      <NavBtn label={t('navInsights')}  Icon={Lightbulb}  active={insightsActive}  accent={colors.accent} muted={colors.textMuted} isDark={isDark} onClick={() => onNavigate('insights')} />

      <div className="flex flex-col items-center" style={{ position: 'relative', bottom: 4 }}>
        <button
          className="fab-add"
          onClick={onAddPress}
          aria-label="Add transaction"
        >
          <Plus size={22} color="white" strokeWidth={2.8} />
        </button>
      </div>

      <NavBtn label={t('navCommunity')} Icon={Users}       active={communityActive} accent={colors.accent} muted={colors.textMuted} isDark={isDark} onClick={() => onNavigate('community')} />
      <NavBtn label={t('navMore')}      Icon={LayoutGrid}  active={moreActive}      accent={colors.accent} muted={colors.textMuted} isDark={isDark} onClick={() => onNavigate('more')} />
    </div>
  );
};

function NavBtn({ label, Icon, active, accent, muted, isDark, onClick }: {
  label: string;
  Icon: React.ElementType;
  active: boolean;
  accent: string;
  muted: string;
  isDark: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all select-none cursor-pointer relative"
      style={{ minWidth: 52, WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center rounded-xl transition-all"
        style={{
          width: 36,
          height: 32,
          background: active
            ? isDark ? `${accent}18` : `${accent}12`
            : 'transparent',
          transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <Icon
          size={20}
          strokeWidth={active ? 2.2 : 1.8}
          style={{
            color: active ? accent : muted,
            transition: 'color 0.2s ease, stroke-width 0.2s ease',
          }}
        />
      </div>

      {/* Label */}
      <span
        className="text-[10px] font-bold transition-colors leading-none"
        style={{ color: active ? accent : muted }}
      >
        {label}
      </span>

      {/* Active dot indicator */}
      <div
        style={{
          width: active ? 16 : 0,
          height: 3,
          borderRadius: 9999,
          background: accent,
          marginTop: 2,
          transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          opacity: active ? 1 : 0,
          boxShadow: active ? `0 0 6px ${accent}80` : 'none',
        }}
      />
    </button>
  );
}
