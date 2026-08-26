import React from 'react';
import { Home, Clock, Plus, Lightbulb, LayoutGrid } from 'lucide-react';
import { AppView } from '../types/finance';

interface BottomNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onAddPress: () => void;
}

const HOME_VIEWS: AppView[] = ['home', 'transactions'];
const ACTIVITY_VIEWS: AppView[] = ['activity'];
const INSIGHTS_VIEWS: AppView[] = [
  'insights', 'statistics', 'money-coach', 'spending-patterns',
  'what-if', 'moneo-score', 'projection', 'money-story', 'ask-moneo',
];
const MORE_VIEWS: AppView[] = [
  'more', 'budget', 'savings', 'recurring', 'recurring-income',
  'safe-to-spend', 'settings', 'community', 'premium',
];

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate, onAddPress }) => {
  const homeActive    = HOME_VIEWS.includes(currentView);
  const activityActive = ACTIVITY_VIEWS.includes(currentView);
  const insightsActive = INSIGHTS_VIEWS.includes(currentView);
  const moreActive    = MORE_VIEWS.includes(currentView);

  return (
    <div className="bottom-nav-bar">
      <NavBtn label="Home" Icon={Home} active={homeActive} onClick={() => onNavigate('home')} />
      <NavBtn label="Activity" Icon={Clock} active={activityActive} onClick={() => onNavigate('activity')} />

      <button className="fab-add" onClick={onAddPress} aria-label="Add transaction">
        <Plus size={22} color="white" strokeWidth={2.8} />
      </button>

      <NavBtn label="Insights" Icon={Lightbulb} active={insightsActive} onClick={() => onNavigate('insights')} />
      <NavBtn label="More" Icon={LayoutGrid} active={moreActive} onClick={() => onNavigate('more')} />
    </div>
  );
};

function NavBtn({
  label, Icon, active, onClick,
}: {
  label: string; Icon: React.ElementType; active: boolean; onClick: () => void;
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
          color: active ? '#60a5fa' : '#3d5068',
          filter: active ? 'drop-shadow(0 0 6px rgba(96,165,250,0.55))' : undefined,
          transition: 'color 0.18s ease, filter 0.18s ease',
        }}
      />
      <span
        className="text-[10px] font-bold transition-colors"
        style={{ color: active ? '#60a5fa' : '#3d5068' }}
      >
        {label}
      </span>
    </button>
  );
}
