import React, { useState } from 'react';
import {
  Clock, TrendingUp, Zap, CheckCircle2, Circle, Star,
  Bookmark, BookmarkCheck, ChevronRight, Plus,
  GraduationCap, PenLine, ShoppingBag, Share2, LayoutList,
  Palette, Heart, Camera, Code2, BookOpen, Award,
  BarChart3, Video, Briefcase, PiggyBank, Check,
} from 'lucide-react';
import { EarnProgress, EarnStatus } from '../types/finance';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '../context/NavigationContext';
import { EarnOpportunity } from '../utils/earnData';
import { upsertEarnProgress, removeEarnProgress } from '../utils/earnStorage';

const ICON_MAP: Record<string, React.ElementType> = {
  GraduationCap, PenLine, ShoppingBag, Share2, LayoutList,
  Palette, Heart, Camera, Code2, BookOpen, Award,
  BarChart3, Video, Briefcase, PiggyBank, TrendingUp,
};

function OppIcon({ name, size = 24 }: { name: string; size?: number }) {
  const Icon = ICON_MAP[name] ?? Zap;
  return <Icon size={size} />;
}

const DIFF_COLOR: Record<string, string> = {
  Beginner: '#22c55e',
  Intermediate: '#f59e0b',
  Advanced: '#f87171',
};

interface EarnDetailScreenProps {
  opportunity: EarnOpportunity;
  earnProgress: EarnProgress[];
  onProgressChange: (updated: EarnProgress[]) => void;
  onAddRecurringIncome: () => void;
}

const STATUS_BUTTONS: { status: EarnStatus; label: string; icon: React.ElementType; color: string }[] = [
  { status: 'interested',   label: 'Interested',   icon: Star,          color: '#f59e0b' },
  { status: 'in-progress',  label: 'In Progress',  icon: Circle,        color: '#6366f1' },
  { status: 'completed',    label: 'Completed',    icon: CheckCircle2,  color: '#22c55e' },
];

export const EarnDetailScreen: React.FC<EarnDetailScreenProps> = ({
  opportunity: opp,
  earnProgress,
  onProgressChange,
  onAddRecurringIncome,
}) => {
  const { isDark, colors } = useTheme();
  const { goBack } = useNavigation();
  const [showIncomePrompt, setShowIncomePrompt] = useState(false);

  const accent = isDark ? opp.accentDark : opp.accentLight;
  const currentProgress = earnProgress.find(p => p.opportunityId === opp.id);

  const handleStatusChange = (status: EarnStatus) => {
    let updated: EarnProgress[];
    if (currentProgress?.status === status) {
      updated = removeEarnProgress(earnProgress, opp.id);
    } else {
      updated = upsertEarnProgress(earnProgress, opp.id, status);
      if (status === 'completed') setShowIncomePrompt(true);
    }
    onProgressChange(updated);
  };

  const handleSaveToggle = () => {
    if (currentProgress) {
      onProgressChange(removeEarnProgress(earnProgress, opp.id));
    } else {
      onProgressChange(upsertEarnProgress(earnProgress, opp.id, 'saved'));
    }
  };

  return (
    <div className="page-enter pb-28">
      {/* ── Hero banner ──────────────────────────────────────────── */}
      <div
        className="px-4 pt-4 pb-8 mb-0 relative overflow-hidden"
        style={{
          background: isDark
            ? `linear-gradient(145deg, ${accent}22 0%, ${accent}08 60%, transparent 100%)`
            : `linear-gradient(145deg, ${accent}14 0%, ${accent}06 60%, transparent 100%)`,
        }}
      >
        {/* Back + save */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-sm font-bold cursor-pointer"
            style={{ color: colors.textSecondary }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: accent }}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
          <button
            onClick={handleSaveToggle}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
            style={{ background: currentProgress ? `${accent}18` : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'), color: currentProgress ? accent : colors.textMuted }}
            aria-label={currentProgress ? 'Remove from saved' : 'Save'}
          >
            {currentProgress ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
          </button>
        </div>

        {/* Icon + labels */}
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${accent}20`, color: accent, boxShadow: `0 0 24px ${accent}30` }}
          >
            <OppIcon name={opp.icon} size={28} />
          </div>
          <div>
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: `${accent}cc` }}
            >
              {opp.term === 'short' ? '⚡ Short Term' : '🎯 Long Term'} · {opp.category}
            </span>
            <h1 className="text-xl font-bold mt-0.5 leading-tight" style={{ color: colors.textPrimary, letterSpacing: '-0.02em' }}>
              {opp.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="px-4">
        {/* ── Key stats ─────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2.5 -mt-4 mb-5">
          {[
            { label: 'Time/week', value: opp.timeRequired, icon: Clock, color: accent },
            { label: 'Difficulty', value: opp.difficulty, icon: Zap, color: DIFF_COLOR[opp.difficulty] },
            { label: 'Potential', value: opp.earningRange, icon: TrendingUp, color: colors.accent },
          ].map(stat => (
            <div
              key={stat.label}
              className="rounded-2xl p-3 text-center"
              style={{
                background: isDark ? '#0d0d10' : '#ffffff',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#ececf0'}`,
              }}
            >
              <stat.icon size={14} className="mx-auto mb-1.5" style={{ color: stat.color }} />
              <p className="text-[10px] font-bold leading-tight" style={{ color: colors.textPrimary }}>{stat.value}</p>
              <p className="text-[9px] mt-0.5" style={{ color: colors.textMuted }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Description ───────────────────────────────────────── */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{ background: isDark ? '#0d0d10' : '#ffffff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#ececf0'}` }}
        >
          <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: colors.textMuted }}>About</p>
          <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>{opp.description}</p>
        </div>

        {/* ── How to start ─────────────────────────────────────── */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{ background: isDark ? '#0d0d10' : '#ffffff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#ececf0'}` }}
        >
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: colors.textMuted }}>How to Start</p>
          <div className="flex flex-col gap-3">
            {opp.steps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold"
                  style={{ background: `${accent}20`, color: accent }}
                >
                  {i + 1}
                </div>
                <p className="text-sm leading-relaxed flex-1" style={{ color: colors.textSecondary }}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Skills needed ─────────────────────────────────────── */}
        <div className="mb-5">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-2.5" style={{ color: colors.textMuted }}>
            Skills That Help
          </p>
          <div className="flex flex-wrap gap-2">
            {opp.skills.map(skill => (
              <span
                key={skill}
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: `${accent}12`, color: accent }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* ── Status buttons ────────────────────────────────────── */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{ background: isDark ? '#0d0d10' : '#ffffff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#ececf0'}` }}
        >
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: colors.textMuted }}>
            Track Your Progress
          </p>
          <div className="flex flex-col gap-2">
            {STATUS_BUTTONS.map(btn => {
              const isActive = currentProgress?.status === btn.status;
              return (
                <button
                  key={btn.status}
                  onClick={() => handleStatusChange(btn.status)}
                  className="flex items-center gap-3 p-3 rounded-xl text-left transition-all active:scale-[0.98]"
                  style={{
                    background: isActive ? `${btn.color}15` : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                    border: `1px solid ${isActive ? `${btn.color}30` : 'transparent'}`,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${btn.color}15`, color: btn.color }}
                  >
                    {isActive ? <Check size={15} /> : <btn.icon size={15} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold" style={{ color: isActive ? btn.color : colors.textPrimary }}>
                      {btn.label}
                    </p>
                  </div>
                  {isActive && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${btn.color}20`, color: btn.color }}>
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Add to Moneo (completed prompt) ───────────────────── */}
        {showIncomePrompt && (
          <div
            className="rounded-2xl p-4 mb-4"
            style={{
              background: isDark ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.06)',
              border: '1px solid rgba(34,197,94,0.25)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={15} style={{ color: '#22c55e' }} />
              <p className="text-sm font-bold" style={{ color: '#22c55e' }}>
                Are you already earning from this?
              </p>
            </div>
            <p className="text-xs mb-3 leading-relaxed" style={{ color: colors.textSecondary }}>
              If you've started making money from this opportunity, add it to Moneo so your Safe to Spend and Insights stay accurate.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { onAddRecurringIncome(); setShowIncomePrompt(false); }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex-1 justify-center"
                style={{ background: '#22c55e', color: '#fff' }}
              >
                <Plus size={13} />
                Add to Moneo
              </button>
              <button
                onClick={() => setShowIncomePrompt(false)}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: colors.textMuted }}
              >
                Not yet
              </button>
            </div>
          </div>
        )}

        {/* ── CTA: explore opportunity ──────────────────────────── */}
        <div
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: `${accent}10`, border: `1px solid ${accent}20` }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${accent}20`, color: accent }}
          >
            <ChevronRight size={18} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold" style={{ color: colors.textPrimary }}>Starting point</p>
            <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: colors.textSecondary }}>{opp.startingPoint}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
