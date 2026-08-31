import React, { useState, useMemo } from 'react';
import {
  TrendingUp, Clock, Star, Zap, ChevronRight, Bookmark,
  BookmarkCheck, CheckCircle2, Circle, ArrowRight,
  GraduationCap, PenLine, ShoppingBag, Share2, LayoutList,
  Palette, Heart, Camera, Code2, BookOpen, Award,
  BarChart3, Video, Briefcase, PiggyBank, Plus, X,
  Sparkles, Target, Trophy,
} from 'lucide-react';
import { AppView, EarnProgress, EarnStatus } from '../types/finance';
import { useTheme } from '../context/ThemeContext';
import { EarnOpportunity, EARN_OPPORTUNITIES, getRecommended } from '../utils/earnData';
import { upsertEarnProgress, removeEarnProgress } from '../utils/earnStorage';

// ── Icon map ────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  GraduationCap, PenLine, ShoppingBag, Share2, LayoutList,
  Palette, Heart, Camera, Code2, BookOpen, Award,
  BarChart3, Video, Briefcase, PiggyBank, TrendingUp,
};

function OppIcon({ name, size = 20 }: { name: string; size?: number }) {
  const Icon = ICON_MAP[name] ?? Zap;
  return <Icon size={size} />;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const DIFF_COLOR: Record<string, string> = {
  Beginner:     '#22c55e',
  Intermediate: '#f59e0b',
  Advanced:     '#f87171',
};

const STATUS_CONFIG: Record<EarnStatus, { label: string; icon: React.ElementType; color: string }> = {
  saved:       { label: 'Saved',       icon: Bookmark,      color: '#64748b' },
  interested:  { label: 'Interested',  icon: Star,          color: '#f59e0b' },
  'in-progress': { label: 'In Progress', icon: Circle,      color: '#6366f1' },
  completed:   { label: 'Completed',   icon: CheckCircle2,  color: '#22c55e' },
};

// ── Props ────────────────────────────────────────────────────────────────────

interface EarnScreenProps {
  userAge: number | null;
  userStatus: string;
  userName: string;
  earnProgress: EarnProgress[];
  onProgressChange: (updated: EarnProgress[]) => void;
  onNavigate: (view: AppView) => void;
  onSelectOpportunity: (id: string) => void;
  onAddRecurringIncome: () => void;
}

// ── Filter tabs ──────────────────────────────────────────────────────────────

type Filter = 'all' | 'short' | 'long' | 'my';

// ── Opportunity Card ─────────────────────────────────────────────────────────

interface OpportunityCardProps {
  opp: EarnOpportunity;
  progress?: EarnProgress;
  onStatusChange: (id: string, status: EarnStatus | null) => void;
  onSelect: () => void;
  isDark: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opp,
  progress,
  onStatusChange,
  onSelect,
  isDark,
  colors,
}) => {
  const accent = isDark ? opp.accentDark : opp.accentLight;
  const isShort = opp.term === 'short';
  const statusCfg = progress ? STATUS_CONFIG[progress.status] : null;

  return (
    <div
      className="rounded-3xl overflow-hidden transition-all active:scale-[0.985]"
      style={{
        background: isDark ? '#0d0d10' : '#ffffff',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#ececf0'}`,
      }}
    >
      {/* Top accent bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${accent}18`, color: accent }}
          >
            <OppIcon name={opp.icon} size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: isDark ? (isShort ? '#fbbf2488' : '#a78bfa88') : (isShort ? '#d97706' : '#7c3aed') }}
              >
                {isShort ? 'Short Term' : 'Long Term'}
              </span>
            </div>
            <p className="text-sm font-bold leading-tight" style={{ color: colors.textPrimary }}>{opp.title}</p>
            <p className="text-[11px] mt-0.5" style={{ color: colors.textMuted }}>{opp.category}</p>
          </div>
          {/* Status button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (progress) {
                onStatusChange(opp.id, null);
              } else {
                onStatusChange(opp.id, 'saved');
              }
            }}
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
            style={{
              background: progress ? `${accent}18` : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
              color: progress ? accent : colors.textMuted,
            }}
            aria-label={progress ? 'Remove from saved' : 'Save opportunity'}
          >
            {progress ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
          </button>
        </div>

        {/* Description */}
        <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: colors.textSecondary }}>
          {opp.description}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1.5">
            <Clock size={11} style={{ color: colors.textMuted }} />
            <span className="text-[11px] font-medium" style={{ color: colors.textMuted }}>{opp.timeRequired}</span>
          </div>
          <div
            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: `${DIFF_COLOR[opp.difficulty]}18`, color: DIFF_COLOR[opp.difficulty] }}
          >
            {opp.difficulty}
          </div>
          {opp.earningRange !== 'Variable' && (
            <div className="flex items-center gap-1">
              <TrendingUp size={11} style={{ color: colors.accent }} />
              <span className="text-[11px] font-bold" style={{ color: colors.accent }}>{opp.earningRange}</span>
            </div>
          )}
        </div>

        {/* Status pill + Explore button */}
        <div className="flex items-center gap-2">
          {statusCfg && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold flex-shrink-0"
              style={{ background: `${statusCfg.color}15`, color: statusCfg.color }}
            >
              <statusCfg.icon size={11} />
              {statusCfg.label}
            </div>
          )}
          <button
            onClick={onSelect}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
            style={{ background: `${accent}18`, color: accent }}
          >
            Explore <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Progress Summary ──────────────────────────────────────────────────────────

function ProgressSummary({
  progress,
  isDark,
  colors,
}: {
  progress: EarnProgress[];
  isDark: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  if (progress.length === 0) return null;

  const counts = {
    saved: progress.filter(p => p.status === 'saved').length,
    interested: progress.filter(p => p.status === 'interested').length,
    'in-progress': progress.filter(p => p.status === 'in-progress').length,
    completed: progress.filter(p => p.status === 'completed').length,
  };

  const stats = [
    { label: 'Saved', value: counts.saved + counts.interested, color: '#f59e0b', icon: Bookmark },
    { label: 'In Progress', value: counts['in-progress'], color: '#6366f1', icon: Circle },
    { label: 'Completed', value: counts.completed, color: '#22c55e', icon: CheckCircle2 },
  ].filter(s => s.value > 0);

  return (
    <div
      className="rounded-2xl p-4 mb-5"
      style={{
        background: isDark ? '#0d0d10' : '#ffffff',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#ececf0'}`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={14} style={{ color: '#f59e0b' }} />
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>
          Your Income Journey
        </p>
      </div>
      <div className="flex gap-3">
        {stats.map(stat => (
          <div key={stat.label} className="flex-1 text-center">
            <div className="text-xl font-bold mb-0.5" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-[10px] font-medium" style={{ color: colors.textMuted }}>{stat.label}</div>
          </div>
        ))}
      </div>
      {counts.completed > 0 && (
        <div
          className="mt-3 text-[11px] font-semibold text-center px-3 py-1.5 rounded-xl"
          style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}
        >
          🎉 You've completed {counts.completed} opportunity{counts.completed > 1 ? 'ies' : ''} — keep growing!
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export const EarnScreen: React.FC<EarnScreenProps> = ({
  userAge, userStatus, userName,
  earnProgress, onProgressChange, onSelectOpportunity,
}) => {
  const { isDark, colors } = useTheme();
  const [filter, setFilter] = useState<Filter>('all');

  const recommended = useMemo(() => getRecommended(userAge, userStatus), [userAge, userStatus]);

  const filteredOpps = useMemo(() => {
    if (filter === 'my') {
      const savedIds = new Set(earnProgress.map(p => p.opportunityId));
      return EARN_OPPORTUNITIES.filter(o => savedIds.has(o.id));
    }
    if (filter === 'short') return EARN_OPPORTUNITIES.filter(o => o.term === 'short');
    if (filter === 'long') return EARN_OPPORTUNITIES.filter(o => o.term === 'long');
    return EARN_OPPORTUNITIES;
  }, [filter, earnProgress]);

  const progressMap = useMemo(() => {
    const map: Record<string, EarnProgress> = {};
    earnProgress.forEach(p => { map[p.opportunityId] = p; });
    return map;
  }, [earnProgress]);

  const handleStatusChange = (id: string, status: EarnStatus | null) => {
    let updated: EarnProgress[];
    if (status === null) {
      updated = removeEarnProgress(earnProgress, id);
    } else {
      updated = upsertEarnProgress(earnProgress, id, status);
    }
    onProgressChange(updated);
  };

  const firstName = userName?.split(' ')[0] || 'there';

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'short', label: '⚡ Short Term' },
    { key: 'long', label: '🎯 Long Term' },
    ...(earnProgress.length > 0 ? [{ key: 'my' as Filter, label: `My List (${earnProgress.length})` }] : []),
  ];

  const shortOpps = filteredOpps.filter(o => o.term === 'short');
  const longOpps = filteredOpps.filter(o => o.term === 'long');
  const showGrouped = filter === 'all';

  return (
    <div className="page-enter px-4 pt-4 pb-28">
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}
          >
            <TrendingUp size={16} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>
            Earn More
          </span>
        </div>
        <h1
          className="text-2xl font-bold leading-tight mb-1"
          style={{ color: colors.textPrimary, letterSpacing: '-0.03em' }}
        >
          Grow your income,<br />
          <span style={{ color: '#fbbf24' }}>one step at a time.</span>
        </h1>
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          {userAge && userAge < 22
            ? `Real opportunities for where you are right now, ${firstName}.`
            : `Curated paths to increase what you earn, ${firstName}.`}
        </p>
      </div>

      {/* ── Progress summary (if any saved) ───────────────────────── */}
      <ProgressSummary progress={earnProgress} isDark={isDark} colors={colors} />

      {/* ── Personalized picks ────────────────────────────────────── */}
      {filter === 'all' && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={13} style={{ color: '#fbbf24' }} />
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>
              Recommended for you
            </p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
            {recommended.map(opp => {
              const accent = isDark ? opp.accentDark : opp.accentLight;
              const prog = progressMap[opp.id];
              return (
                <button
                  key={opp.id}
                  onClick={() => onSelectOpportunity(opp.id)}
                  className="flex-shrink-0 text-left rounded-2xl p-4 transition-all active:scale-95"
                  style={{
                    width: 180,
                    background: isDark ? `linear-gradient(145deg, #111114, #16161a)` : '#ffffff',
                    border: `1px solid ${isDark ? `${accent}22` : `${accent}30`}`,
                    boxShadow: isDark ? `0 0 20px ${accent}10` : `0 2px 12px ${accent}12`,
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5"
                    style={{ background: `${accent}18`, color: accent }}
                  >
                    <OppIcon name={opp.icon} size={17} />
                  </div>
                  <p className="text-xs font-bold leading-tight mb-1" style={{ color: colors.textPrimary }}>{opp.title}</p>
                  <p className="text-[10px] font-bold" style={{ color: accent }}>{opp.earningRange}</p>
                  {prog && (
                    <div
                      className="mt-2 flex items-center gap-1 text-[10px] font-bold"
                      style={{ color: STATUS_CONFIG[prog.status].color }}
                    >
                      <CheckCircle2 size={10} />
                      {STATUS_CONFIG[prog.status].label}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Filter tabs ───────────────────────────────────────────── */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
        {FILTERS.map(f => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-bold transition-all"
              style={{
                background: active
                  ? isDark ? '#fbbf2420' : '#fbbf2415'
                  : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                color: active ? '#fbbf24' : colors.textMuted,
                border: active ? '1px solid #fbbf2430' : '1px solid transparent',
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* ── Opportunity list ──────────────────────────────────────── */}
      {filter === 'my' && filteredOpps.length === 0 ? (
        <div
          className="rounded-3xl p-8 text-center"
          style={{ background: isDark ? '#0d0d10' : '#ffffff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#ececf0'}` }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}
          >
            <Target size={24} />
          </div>
          <p className="text-sm font-bold mb-1" style={{ color: colors.textPrimary }}>Your list is empty</p>
          <p className="text-xs" style={{ color: colors.textMuted }}>Tap the bookmark icon on any opportunity to save it here.</p>
        </div>
      ) : showGrouped ? (
        <>
          {/* Short term section */}
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-4 rounded-full" style={{ background: '#fbbf24' }} />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>
                Short Term  ·  Quick wins
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {shortOpps.map(opp => (
                <OpportunityCard
                  key={opp.id}
                  opp={opp}
                  progress={progressMap[opp.id]}
                  onStatusChange={handleStatusChange}
                  onSelect={() => onSelectOpportunity(opp.id)}
                  isDark={isDark}
                  colors={colors}
                />
              ))}
            </div>
          </div>

          {/* Spacer */}
          <div className="mt-6 mb-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-4 rounded-full" style={{ background: '#a78bfa' }} />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>
                Long Term  ·  Growth investments
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {longOpps.map(opp => (
                <OpportunityCard
                  key={opp.id}
                  opp={opp}
                  progress={progressMap[opp.id]}
                  onStatusChange={handleStatusChange}
                  onSelect={() => onSelectOpportunity(opp.id)}
                  isDark={isDark}
                  colors={colors}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredOpps.map(opp => (
            <OpportunityCard
              key={opp.id}
              opp={opp}
              progress={progressMap[opp.id]}
              onStatusChange={handleStatusChange}
              onSelect={() => onSelectOpportunity(opp.id)}
              isDark={isDark}
              colors={colors}
            />
          ))}
        </div>
      )}
    </div>
  );
};
