import React from 'react';
import { Home, BarChart2, Plus, Target, Settings2 } from 'lucide-react';
import { AppView } from '../types/finance';
import { useLanguage } from '../i18n/LanguageContext';

interface BottomNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onAddPress: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate, onAddPress }) => {
  const { t } = useLanguage();
  return (
    <div className="bottom-nav-bar">
      <NavBtn view="home" label={t('navHome')} Icon={Home} currentView={currentView} onNavigate={onNavigate} />
      <NavBtn view="statistics" label={t('navStats')} Icon={BarChart2} currentView={currentView} onNavigate={onNavigate} />

      <button className="fab-add" onClick={onAddPress} aria-label="Add transaction">
        <Plus size={22} color="white" strokeWidth={2.8} />
      </button>

      <NavBtn view="savings" label={t('navSave')} Icon={Target} currentView={currentView} onNavigate={onNavigate} />
      <NavBtn view="settings" label={t('navSettings')} Icon={Settings2} currentView={currentView} onNavigate={onNavigate} />
    </div>
  );
};

function NavBtn({
  view, label, Icon, currentView, onNavigate,
}: {
  view: AppView; label: string; Icon: React.ElementType;
  currentView: AppView; onNavigate: (v: AppView) => void;
}) {
  const active = currentView === view || (view === 'home' && currentView === 'transactions');
  return (
    <button
      onClick={() => onNavigate(view)}
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
