import React, { useState, useEffect } from 'react';
import {
  Clock, TrendingUp, Zap, CheckCircle2, Circle, Star,
  Bookmark, BookmarkCheck, ChevronRight, Plus, Check,
  GraduationCap, PenLine, ShoppingBag, Share2, LayoutList,
  Palette, Heart, Camera, Code2, BookOpen, Award,
  BarChart3, Video, Briefcase, PiggyBank, Flame,
  Lock, Play, ExternalLink, ChevronDown, ChevronUp,
  Target, Trophy, BookMarked,
} from 'lucide-react';
import { EarnProgress, EarnStatus } from '../types/finance';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '../context/NavigationContext';
import { EarnOpportunity } from '../utils/earnData';
import { upsertEarnProgress, removeEarnProgress, toggleStep, getCompletedSteps, updateStreak, getStreak } from '../utils/earnStorage';

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
  isPremium?: boolean;
  onUpgrade?: () => void;
}

const STATUS_BUTTONS: { status: EarnStatus; label: string; icon: React.ElementType; color: string }[] = [
  { status: 'interested',   label: 'Interested',   icon: Star,         color: '#f59e0b' },
  { status: 'in-progress',  label: 'In Progress',  icon: Circle,       color: '#6366f1' },
  { status: 'completed',    label: 'Completed',    icon: CheckCircle2, color: '#22c55e' },
];

// ── Investing Lesson Component ─────────────────────────────────────────────────
const LessonCard: React.FC<{
  lesson: NonNullable<EarnOpportunity['investingLessons']>[number];
  index: number;
  isCompleted: boolean;
  onToggle: () => void;
  accent: string;
  isDark: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}> = ({ lesson, index, isCompleted, onToggle, accent, isDark, colors }) => {
  const [expanded, setExpanded] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const cardStyle = {
    background: isDark ? '#0d0d10' : '#ffffff',
    border: `1px solid ${isCompleted ? `${accent}30` : (isDark ? 'rgba(255,255,255,0.06)' : '#ececf0')}`,
  };

  return (
    <div className="rounded-2xl overflow-hidden transition-all" style={cardStyle}>
      <button
        className="w-full flex items-center gap-3 p-4 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
          style={{ background: isCompleted ? `${accent}20` : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'), color: isCompleted ? accent : colors.textMuted }}
        >
          {isCompleted ? <Check size={14} /> : index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-tight" style={{ color: isCompleted ? accent : colors.textPrimary }}>{lesson.title}</p>
        </div>
        {expanded ? <ChevronUp size={16} style={{ color: colors.textMuted }} /> : <ChevronDown size={16} style={{ color: colors.textMuted }} />}
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          <p className="text-xs leading-relaxed mb-4" style={{ color: colors.textSecondary }}>{lesson.summary}</p>

          <div className="rounded-xl p-3 mb-4" style={{ background: `${accent}10`, border: `1px solid ${accent}20` }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: accent }}>Key Point</p>
            <p className="text-xs font-semibold leading-relaxed" style={{ color: colors.textPrimary }}>{lesson.keyPoint}</p>
          </div>

          {/* YouTube resource */}
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(lesson.videoQuery)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl mb-4 transition-all active:scale-[0.98]"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#ef4444' }}>
              <Play size={12} style={{ color: '#fff' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold" style={{ color: colors.textPrimary }}>Watch on YouTube</p>
              <p className="text-[10px] truncate" style={{ color: colors.textMuted }}>{lesson.videoQuery}</p>
            </div>
            <ExternalLink size={12} style={{ color: colors.textMuted }} />
          </a>

          {/* Quiz */}
          {lesson.quiz && (
            <div className="mb-4">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: colors.textMuted }}>Quick Check</p>
              <p className="text-xs font-semibold mb-2" style={{ color: colors.textPrimary }}>{lesson.quiz.q}</p>
              <div className="flex flex-col gap-1.5">
                {lesson.quiz.options.map((opt, i) => {
                  const isSelected = quizAnswer === i;
                  const isCorrect = i === lesson.quiz!.correct;
                  const showResult = quizAnswer !== null;
                  return (
                    <button
                      key={i}
                      onClick={() => setQuizAnswer(i)}
                      disabled={quizAnswer !== null}
                      className="text-left px-3 py-2 rounded-xl text-xs font-medium transition-all"
                      style={{
                        background: showResult
                          ? isCorrect ? 'rgba(34,197,94,0.15)' : isSelected ? 'rgba(239,68,68,0.1)' : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)')
                          : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                        border: showResult
                          ? isCorrect ? '1px solid rgba(34,197,94,0.4)' : isSelected ? '1px solid rgba(239,68,68,0.3)' : '1px solid transparent'
                          : '1px solid transparent',
                        color: showResult ? isCorrect ? '#22c55e' : isSelected ? '#f87171' : colors.textMuted : colors.textPrimary,
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {quizAnswer !== null && (
                <p className="text-xs mt-2 font-semibold" style={{ color: quizAnswer === lesson.quiz.correct ? '#22c55e' : '#f87171' }}>
                  {quizAnswer === lesson.quiz.correct ? '✓ Correct!' : `Incorrect. The answer is: "${lesson.quiz.options[lesson.quiz.correct]}"`}
                </p>
              )}
            </div>
          )}

          <button
            onClick={onToggle}
            className="w-full py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
            style={{
              background: isCompleted ? 'rgba(34,197,94,0.12)' : `${accent}18`,
              color: isCompleted ? '#22c55e' : accent,
              border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.25)' : `${accent}25`}`,
            }}
          >
            {isCompleted ? '✓ Marked Complete — Click to Undo' : 'Mark as Complete'}
          </button>
        </div>
      )}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

export const EarnDetailScreen: React.FC<EarnDetailScreenProps> = ({
  opportunity: opp,
  earnProgress,
  onProgressChange,
  onAddRecurringIncome,
  isPremium = false,
  onUpgrade,
}) => {
  const { isDark, colors } = useTheme();
  const { goBack } = useNavigation();
  const [showIncomePrompt, setShowIncomePrompt] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'plan' | 'learn' | 'lessons'>('overview');
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => getCompletedSteps(opp.id));
  const [streak, setStreak] = useState(() => getStreak(opp.id));
  const [completedLessons, setCompletedLessons] = useState<number[]>(() => getCompletedSteps(`${opp.id}-lessons`));

  const accent = isDark ? opp.accentDark : opp.accentLight;
  const currentProgress = earnProgress.find(p => p.opportunityId === opp.id);
  const isInvesting = opp.id === 'learn-investing';
  const isPremiumLocked = opp.isPremium && !isPremium;

  const stepPct = opp.steps.length > 0 ? Math.round((completedSteps.length / opp.steps.length) * 100) : 0;
  const lessonPct = isInvesting && opp.investingLessons
    ? Math.round((completedLessons.length / opp.investingLessons.length) * 100)
    : 0;

  const cardStyle = {
    background: isDark ? '#0d0d10' : '#ffffff',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#ececf0'}`,
  };

  const handleStatusChange = (status: EarnStatus) => {
    let updated: EarnProgress[];
    if (currentProgress?.status === status) {
      updated = removeEarnProgress(earnProgress, opp.id);
    } else {
      updated = upsertEarnProgress(earnProgress, opp.id, status);
      if (status === 'completed') setShowIncomePrompt(true);
      if (status === 'in-progress') {
        const newStreak = updateStreak(opp.id);
        setStreak(newStreak);
      }
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

  const handleToggleStep = (idx: number) => {
    const updated = toggleStep(opp.id, idx);
    setCompletedSteps(updated);
    const newStreak = updateStreak(opp.id);
    setStreak(newStreak);
    // Auto-mark in-progress
    if (!currentProgress || currentProgress.status === 'saved') {
      onProgressChange(upsertEarnProgress(earnProgress, opp.id, 'in-progress'));
    }
  };

  const handleToggleLesson = (idx: number) => {
    const updated = toggleStep(`${opp.id}-lessons`, idx);
    setCompletedLessons(updated);
    const newStreak = updateStreak(opp.id);
    setStreak(newStreak);
    if (!currentProgress || currentProgress.status === 'saved') {
      onProgressChange(upsertEarnProgress(earnProgress, opp.id, 'in-progress'));
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    ...(opp.weeklyPlan ? [{ key: 'plan', label: 'Your Plan' }] : []),
    ...(opp.youtubeResources ? [{ key: 'learn', label: 'Learn' }] : []),
    ...(isInvesting && opp.investingLessons ? [{ key: 'lessons', label: 'Lessons' }] : []),
  ] as { key: typeof activeTab; label: string }[];

  if (isPremiumLocked) {
    return (
      <div className="page-enter pb-28">
        <div
          className="px-4 pt-4 pb-8 relative overflow-hidden"
          style={{ background: isDark ? `linear-gradient(145deg, ${accent}22 0%, transparent 100%)` : `linear-gradient(145deg, ${accent}14 0%, transparent 100%)` }}
        >
          <div className="flex items-center justify-between mb-5">
            <button onClick={goBack} className="flex items-center gap-1.5 text-sm font-bold" style={{ color: colors.textSecondary }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: accent }}><polyline points="15 18 9 12 15 6" /></svg>
              Back
            </button>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${accent}20`, color: accent }}>
              <OppIcon name={opp.icon} size={28} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${accent}cc` }}>
                {opp.term === 'short' ? '⚡ Short Term' : '🎯 Long Term'} · {opp.category}
              </span>
              <h1 className="text-xl font-bold mt-0.5 leading-tight" style={{ color: colors.textPrimary, letterSpacing: '-0.02em' }}>{opp.title}</h1>
            </div>
          </div>
        </div>
        <div className="px-4 py-8 text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4" style={{ background: `${accent}15` }}>
            <Lock size={32} style={{ color: accent }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: colors.textPrimary }}>Premium Path</h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: colors.textSecondary }}>
            This advanced learning path is available to Moneo Premium members. Unlock personalised roadmaps, deeper progress tracking, and exclusive resources.
          </p>
          <button
            onClick={onUpgrade}
            className="w-full py-4 rounded-2xl font-bold text-sm"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: '#fff' }}
          >
            Unlock with Premium — $1.99/mo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter pb-28">
      {/* ── Hero banner ─────────────────────────────────────────────────────── */}
      <div
        className="px-4 pt-4 pb-6 relative overflow-hidden"
        style={{ background: isDark ? `linear-gradient(145deg, ${accent}22 0%, ${accent}08 60%, transparent 100%)` : `linear-gradient(145deg, ${accent}14 0%, ${accent}06 60%, transparent 100%)` }}
      >
        <div className="flex items-center justify-between mb-5">
          <button onClick={goBack} className="flex items-center gap-1.5 text-sm font-bold" style={{ color: colors.textSecondary }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: accent }}><polyline points="15 18 9 12 15 6" /></svg>
            Back
          </button>
          <div className="flex items-center gap-2">
            {streak > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: 'rgba(251,191,36,0.15)' }}>
                <Flame size={12} style={{ color: '#fbbf24' }} />
                <span className="text-[11px] font-bold" style={{ color: '#fbbf24' }}>{streak} day streak</span>
              </div>
            )}
            <button
              onClick={handleSaveToggle}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
              style={{ background: currentProgress ? `${accent}18` : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'), color: currentProgress ? accent : colors.textMuted }}
              aria-label={currentProgress ? 'Remove from saved' : 'Save'}
            >
              {currentProgress ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
            </button>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${accent}20`, color: accent, boxShadow: `0 0 24px ${accent}30` }}>
            <OppIcon name={opp.icon} size={28} />
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${accent}cc` }}>
              {opp.term === 'short' ? '⚡ Short Term' : '🎯 Long Term'} · {opp.category}
            </span>
            <h1 className="text-xl font-bold mt-0.5 leading-tight" style={{ color: colors.textPrimary, letterSpacing: '-0.02em' }}>{opp.title}</h1>
            {opp.isPremium && !isPremium && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: `${accent}15`, color: accent }}>
                <Lock size={9} /> Premium
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {stepPct > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>
                {isInvesting ? `Lessons: ${completedLessons.length}/${opp.investingLessons?.length}` : `Steps: ${completedSteps.length}/${opp.steps.length}`}
              </p>
              <span className="text-[11px] font-bold" style={{ color: accent }}>{isInvesting ? lessonPct : stepPct}%</span>
            </div>
            <div className="w-full rounded-full overflow-hidden" style={{ height: 6, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${isInvesting ? lessonPct : stepPct}%`, background: accent }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      {tabs.length > 1 && (
        <div className="flex gap-1 px-4 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-bold transition-all"
              style={{
                background: activeTab === tab.key ? `${accent}20` : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
                color: activeTab === tab.key ? accent : colors.textMuted,
                border: activeTab === tab.key ? `1px solid ${accent}30` : '1px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="px-4">

        {/* ── Overview Tab ─────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <>
            {/* Key stats */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {[
                { label: 'Time/week', value: opp.timeRequired, icon: Clock, color: accent },
                { label: 'Difficulty', value: opp.difficulty, icon: Zap, color: DIFF_COLOR[opp.difficulty] },
                { label: 'Potential', value: opp.earningRange, icon: TrendingUp, color: colors.accent },
              ].map(stat => (
                <div key={stat.label} className="rounded-2xl p-3 text-center" style={cardStyle}>
                  <stat.icon size={14} className="mx-auto mb-1.5" style={{ color: stat.color }} />
                  <p className="text-[10px] font-bold leading-tight" style={{ color: colors.textPrimary }}>{stat.value}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: colors.textMuted }}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Investing disclaimer */}
            {isInvesting && (
              <div className="rounded-2xl p-3 mb-4 flex items-start gap-2.5" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <BookMarked size={14} style={{ color: '#6366f1', marginTop: 1 }} />
                <p className="text-[11px] leading-relaxed" style={{ color: colors.textSecondary }}>
                  <strong style={{ color: '#6366f1' }}>Educational only.</strong> This path teaches investing concepts. It is not personalised financial advice. Consult a qualified financial adviser before making real investment decisions.
                </p>
              </div>
            )}

            {/* Description */}
            <div className="rounded-2xl p-4 mb-4" style={cardStyle}>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: colors.textMuted }}>About</p>
              <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>{opp.description}</p>
            </div>

            {/* Skills */}
            <div className="mb-4">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-2.5" style={{ color: colors.textMuted }}>Skills That Help</p>
              <div className="flex flex-wrap gap-2">
                {opp.skills.map(skill => (
                  <span key={skill} className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: `${accent}12`, color: accent }}>{skill}</span>
                ))}
              </div>
            </div>

            {/* Status buttons */}
            <div className="rounded-2xl p-4 mb-4" style={cardStyle}>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: colors.textMuted }}>Track Your Progress</p>
              <div className="flex flex-col gap-2">
                {STATUS_BUTTONS.map(btn => {
                  const isActive = currentProgress?.status === btn.status;
                  return (
                    <button
                      key={btn.status}
                      onClick={() => handleStatusChange(btn.status)}
                      className="flex items-center gap-3 p-3 rounded-xl text-left transition-all active:scale-[0.98]"
                      style={{ background: isActive ? `${btn.color}15` : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'), border: `1px solid ${isActive ? `${btn.color}30` : 'transparent'}` }}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${btn.color}15`, color: btn.color }}>
                        {isActive ? <Check size={15} /> : <btn.icon size={15} />}
                      </div>
                      <p className="text-sm font-bold flex-1" style={{ color: isActive ? btn.color : colors.textPrimary }}>{btn.label}</p>
                      {isActive && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${btn.color}20`, color: btn.color }}>Active</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Starting point CTA */}
            <div className="rounded-2xl p-4 mb-4 flex items-center gap-3" style={{ background: `${accent}10`, border: `1px solid ${accent}20` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${accent}20`, color: accent }}>
                <ChevronRight size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold" style={{ color: colors.textPrimary }}>Starting point</p>
                <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: colors.textSecondary }}>{opp.startingPoint}</p>
              </div>
            </div>

            {/* Completed income prompt */}
            {showIncomePrompt && (
              <div className="rounded-2xl p-4 mb-4" style={{ background: isDark ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={15} style={{ color: '#22c55e' }} />
                  <p className="text-sm font-bold" style={{ color: '#22c55e' }}>Are you already earning from this?</p>
                </div>
                <p className="text-xs mb-3 leading-relaxed" style={{ color: colors.textSecondary }}>
                  If you've started making real money from this opportunity, add it to Moneo so your finances stay accurate.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { onAddRecurringIncome(); setShowIncomePrompt(false); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold flex-1 justify-center"
                    style={{ background: '#22c55e', color: '#fff' }}
                  >
                    <Plus size={13} />Add to Moneo
                  </button>
                  <button onClick={() => setShowIncomePrompt(false)} className="px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: colors.textMuted }}>
                    Not yet
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Plan Tab ──────────────────────────────────────────────────────── */}
        {activeTab === 'plan' && opp.weeklyPlan && (
          <>
            <div className="rounded-2xl p-4 mb-4" style={{ background: `${accent}10`, border: `1px solid ${accent}20` }}>
              <div className="flex items-center gap-2 mb-1">
                <Target size={14} style={{ color: accent }} />
                <p className="text-xs font-bold" style={{ color: accent }}>Your {opp.title} Plan</p>
              </div>
              <p className="text-xs" style={{ color: colors.textSecondary }}>
                Tap each task to mark it complete. Your streak tracks daily activity.
              </p>
            </div>

            {/* Step progress */}
            <div className="rounded-2xl p-4 mb-4" style={cardStyle}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>Overall Progress</p>
                <span className="text-sm font-bold" style={{ color: accent }}>{stepPct}%</span>
              </div>
              <div className="w-full rounded-full overflow-hidden mb-2" style={{ height: 8, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${stepPct}%`, background: accent }} />
              </div>
              <p className="text-[11px]" style={{ color: colors.textMuted }}>
                {completedSteps.length} of {opp.steps.length} steps complete
              </p>
            </div>

            {/* Week by week */}
            {opp.weeklyPlan.map((week, wi) => {
              const weekStepIndices = week.tasks.map((_, ti) => wi * 10 + ti);
              const weekCompleted = weekStepIndices.filter(i => completedSteps.includes(i)).length;
              return (
                <div key={wi} className="rounded-2xl overflow-hidden mb-3" style={cardStyle}>
                  <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f4'}` }}>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>Week {week.week}</p>
                      <p className="text-sm font-bold" style={{ color: colors.textPrimary }}>{week.title}</p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: weekCompleted === week.tasks.length ? 'rgba(34,197,94,0.15)' : `${accent}12`, color: weekCompleted === week.tasks.length ? '#22c55e' : accent }}>
                      {weekCompleted}/{week.tasks.length}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    {week.tasks.map((task, ti) => {
                      const stepIdx = wi * 10 + ti;
                      const done = completedSteps.includes(stepIdx);
                      return (
                        <button
                          key={ti}
                          onClick={() => handleToggleStep(stepIdx)}
                          className="flex items-center gap-3 text-left transition-all active:scale-[0.98]"
                        >
                          <div
                            className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                            style={{ background: done ? accent : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'), border: done ? 'none' : `1.5px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#ddd'}` }}
                          >
                            {done && <Check size={11} style={{ color: '#fff' }} />}
                          </div>
                          <p className="text-xs flex-1 leading-relaxed" style={{ color: done ? colors.textMuted : colors.textSecondary, textDecoration: done ? 'line-through' : 'none' }}>{task}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ── Learn Tab (YouTube) ───────────────────────────────────────────── */}
        {activeTab === 'learn' && opp.youtubeResources && (
          <>
            <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Play size={14} style={{ color: '#ef4444' }} />
                <p className="text-xs font-bold" style={{ color: '#ef4444' }}>Learn with Moneo</p>
              </div>
              <p className="text-xs" style={{ color: colors.textSecondary }}>Curated educational videos on YouTube for this path. Tap any to search and watch.</p>
            </div>

            <div className="flex flex-col gap-3">
              {opp.youtubeResources.map((vid, i) => (
                <a
                  key={i}
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(vid.searchQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl overflow-hidden flex items-stretch transition-all active:scale-[0.98]"
                  style={cardStyle}
                >
                  {/* Thumbnail stand-in */}
                  <div className="w-24 flex-shrink-0 flex items-center justify-center" style={{ background: `${vid.accent}18`, minHeight: 80 }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#ef4444' }}>
                      <Play size={16} style={{ color: '#fff' }} />
                    </div>
                  </div>
                  <div className="p-3 flex-1 min-w-0">
                    <p className="text-xs font-bold leading-snug mb-1" style={{ color: colors.textPrimary }}>{vid.title}</p>
                    <p className="text-[10px] mb-1.5" style={{ color: colors.textMuted }}>{vid.channel}</p>
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold"
                      style={{ background: `${vid.accent}15`, color: vid.accent }}
                    >
                      {vid.level}
                    </span>
                  </div>
                  <div className="flex items-center pr-3">
                    <ExternalLink size={13} style={{ color: colors.textMuted }} />
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-4 rounded-2xl p-3" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#ececf0'}` }}>
              <p className="text-[10px] leading-relaxed" style={{ color: colors.textMuted }}>
                These are YouTube search links. Moneo does not host or control these videos. Always verify sources independently.
              </p>
            </div>
          </>
        )}

        {/* ── Lessons Tab (Investing Education) ────────────────────────────── */}
        {activeTab === 'lessons' && isInvesting && opp.investingLessons && (
          <>
            {/* Disclaimer */}
            <div className="rounded-2xl p-3 mb-4" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <p className="text-[11px] leading-relaxed" style={{ color: colors.textSecondary }}>
                <strong style={{ color: '#6366f1' }}>Educational only.</strong> These lessons explain concepts. They are not personalised financial advice. All figures are illustrative.
              </p>
            </div>

            {/* Lesson progress */}
            <div className="rounded-2xl p-4 mb-4" style={cardStyle}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>Lesson Progress</p>
                <span className="text-sm font-bold" style={{ color: accent }}>{lessonPct}%</span>
              </div>
              <div className="w-full rounded-full overflow-hidden mb-1" style={{ height: 8, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${lessonPct}%`, background: accent }} />
              </div>
              <p className="text-[11px]" style={{ color: colors.textMuted }}>{completedLessons.length} of {opp.investingLessons.length} lessons complete</p>
            </div>

            <div className="flex flex-col gap-2">
              {opp.investingLessons.map((lesson, i) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  index={i}
                  isCompleted={completedLessons.includes(i)}
                  onToggle={() => handleToggleLesson(i)}
                  accent={accent}
                  isDark={isDark}
                  colors={colors}
                />
              ))}
            </div>

            {lessonPct === 100 && (
              <div className="mt-4 rounded-2xl p-5 text-center" style={{ background: `${accent}12`, border: `1px solid ${accent}25` }}>
                <Trophy size={28} className="mx-auto mb-2" style={{ color: accent }} />
                <p className="text-base font-bold mb-1" style={{ color: colors.textPrimary }}>Education Complete!</p>
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  You've finished the investing education path. Remember: always consult a qualified financial adviser before making real investment decisions.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
