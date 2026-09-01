import React, { useState } from 'react';
import { Home, Lightbulb, Wallet, Users, Settings, TrendingUp, MoreHorizontal, X } from 'lucide-react';
import { AppView } from '../types/finance';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';

interface BottomNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

export const HOME_VIEWS: AppView[]      = ['home', 'transactions', 'activity'];
export const INSIGHTS_VIEWS: AppView[]  = ['insights', 'statistics', 'money-coach', 'spending-patterns', 'what-if', 'moneo-score', 'projection', 'money-story', 'ask-moneo', 'safe-to-spend'];
export const BUDGET_VIEWS: AppView[]    = ['budget', 'savings', 'recurring', 'recurring-income'];
export const EARN_VIEWS: AppView[]      = ['earn', 'earn-detail'];
export const COMMUNITY_VIEWS: AppView[] = ['community', 'community-detail'];
export const SETTINGS_VIEWS: AppView[]  = ['settings', 'premium', 'more'];

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const [showMore, setShowMore] = useState(false);

  const homeActive      = HOME_VIEWS.includes(currentView);
  const insightsActive  = INSIGHTS_VIEWS.includes(currentView);
  const earnActive      = EARN_VIEWS.includes(currentView);
  const budgetActive    = BUDGET_VIEWS.includes(currentView);
  const moreActive      = COMMUNITY_VIEWS.includes(currentView) || SETTINGS_VIEWS.includes(currentView);

  const accent   = colors.accent;
  const inactive = colors.textMuted;
  const EARN_ACCENT = '#fbbf24';

  const handleMore = () => setShowMore(v => !v);
  const handleMoreNav = (view: AppView) => {
    setShowMore(false);
    onNavigate(view);
  };

  return (
    <>
      {/* ── More overlay ────────────────────────────────────────── */}
      {showMore && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
            onClick={() => setShowMore(false)}
          />
          <div
            className="fixed z-50 rounded-t-3xl px-4 pt-2 pb-6"
            style={{
              bottom: 64,
              left: 0,
              right: 0,
              background: isDark ? '#111114' : '#ffffff',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#ececf0'}`,
              borderBottom: 'none',
            }}
          >
            {/* Handle */}
            <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)' }} />

            <p className="text-[11px] font-bold uppercase tracking-widest mb-3 px-1" style={{ color: colors.textMuted }}>More</p>

            <div className="flex flex-col gap-2">
              <MoreItem
                icon={Users}
                label={t('navCommunity')}
                desc="Groups, challenges & leaderboards"
                active={COMMUNITY_VIEWS.includes(currentView)}
                accent={accent}
                isDark={isDark}
                colors={colors}
                onClick={() => handleMoreNav('community')}
              />
              <MoreItem
                icon={Settings}
                label={t('settings')}
                desc="Profile, currency, account"
                active={SETTINGS_VIEWS.includes(currentView)}
                accent={accent}
                isDark={isDark}
                colors={colors}
                onClick={() => handleMoreNav('settings')}
              />
            </div>
          </div>
        </>
      )}

      {/* ── Bottom bar ──────────────────────────────────────────── */}
      <div className="bottom-nav-bar">
        <NavBtn label={t('navHome')}     Icon={Home}          active={homeActive}    accent={accent}      inactive={inactive} isDark={isDark} onClick={() => onNavigate('home')} />
        <NavBtn label={t('navInsights')} Icon={Lightbulb}     active={insightsActive} accent={accent}     inactive={inactive} isDark={isDark} onClick={() => onNavigate('insights')} />
        <NavBtn label={t('budget')}      Icon={Wallet}        active={budgetActive}  accent={accent}      inactive={inactive} isDark={isDark} onClick={() => onNavigate('budget')} />
        <NavBtn label="Earn"             Icon={TrendingUp}    active={earnActive}    accent={EARN_ACCENT} inactive={inactive} isDark={isDark} onClick={() => onNavigate('earn')} earn />
        <NavBtn label="More"             Icon={moreActive ? X : MoreHorizontal} active={moreActive || showMore} accent={accent} inactive={inactive} isDark={isDark} onClick={handleMore} />
      </div>
    </>
  );
};

function MoreItem({
  icon: Icon, label, desc, active, accent, isDark, colors, onClick,
}: {
  icon: React.ElementType;
  label: string;
  desc: string;
  active: boolean;
  accent: string;
  isDark: boolean;
  colors: Record<string, string>;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-4 rounded-2xl text-left w-full transition-all active:scale-[0.98]"
      style={{
        background: active
          ? isDark ? `${accent}15` : `${accent}10`
          : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
        border: `1px solid ${active ? `${accent}25` : 'transparent'}`,
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: active ? `${accent}18` : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
          color: active ? accent : colors.textSecondary,
        }}
      >
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold" style={{ color: active ? accent : colors.textPrimary }}>{label}</p>
        <p className="text-[11px]" style={{ color: colors.textMuted }}>{desc}</p>
      </div>
    </button>
  );
}

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
