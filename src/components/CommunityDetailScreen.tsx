import React, { useState, useMemo } from 'react';
import {
  ChevronLeft, Users, Trophy, Zap, Crown, Plus, Check, X,
  Shield, Copy, Calendar, Target, Flame, BarChart2, Hash,
  ChevronDown, ChevronUp, Eye, EyeOff, Share2, Star, Clock,
} from 'lucide-react';
import {
  Community, Challenge, ChallengeType, Transaction,
  CategoryLimit, Subscription, SavingGoal, AppView,
  ChallengeParticipant, EXPENSE_CATEGORIES,
} from '../types/finance';
import {
  getChallengeStatus, challengeDaysTotal, challengeDaysElapsed,
  challengeTypeLabel, challengeTypeDescription, communityAvgProgress,
  buildParticipant, newChallengeId, saveCommunities,
  loadCommunities, challengeBadgeLabel,
} from '../utils/communityUtils';
import { useTheme } from '../context/ThemeContext';

const CHALLENGE_TYPES: { type: ChallengeType; icon: React.ElementType; color: string }[] = [
  { type: 'log_daily',    icon: Flame,    color: '#f97316' },
  { type: 'budget_stay',  icon: Shield,   color: '#818cf8' },
  { type: 'score_boost',  icon: BarChart2, color: '#a78bfa' },
  { type: 'category_cut', icon: Target,   color: '#34d399' },
  { type: 'custom',       icon: Hash,     color: '#fbbf24' },
];

interface ChallengeTemplate {
  name: string;
  emoji: string;
  type: ChallengeType;
  description: string;
  duration: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  targetScore?: number;
  customTarget?: string;
}

const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    name: '7-Day Money Awareness',
    emoji: '👁️',
    type: 'log_daily',
    description: 'Log at least one transaction every day for 7 days. Build the habit of knowing exactly where your money goes.',
    duration: 7,
    difficulty: 'Easy',
  },
  {
    name: 'Budget Boss',
    emoji: '👑',
    type: 'budget_stay',
    description: 'Stay within your monthly budget for the full challenge period. True financial discipline.',
    duration: 30,
    difficulty: 'Hard',
  },
  {
    name: 'Moneo Score Climb',
    emoji: '📈',
    type: 'score_boost',
    description: 'Reach a Moneo Score of 70 or higher by the end of the challenge. Improve your habits, improve your score.',
    duration: 30,
    difficulty: 'Medium',
    targetScore: 70,
  },
  {
    name: 'Subscription Detective',
    emoji: '🔍',
    type: 'custom',
    description: 'Review all your recurring subscriptions and cancel at least one you no longer use. Reclaim your money.',
    duration: 7,
    difficulty: 'Easy',
    customTarget: 'Cancel at least 1 unused subscription',
  },
  {
    name: '30-Day Financial Streak',
    emoji: '🔥',
    type: 'log_daily',
    description: 'Log transactions every single day for 30 days. The ultimate tracking habit.',
    duration: 30,
    difficulty: 'Hard',
  },
  {
    name: 'Smart Spending Challenge',
    emoji: '✂️',
    type: 'category_cut',
    description: 'Reduce spending in your top expense category by at least 20% compared to last month.',
    duration: 30,
    difficulty: 'Medium',
  },
  {
    name: '14-Day Habit Builder',
    emoji: '⚡',
    type: 'log_daily',
    description: 'Log at least one transaction every day for 14 days. The bridge between trying and succeeding.',
    duration: 14,
    difficulty: 'Medium',
  },
  {
    name: 'Goal Builder Sprint',
    emoji: '🎯',
    type: 'score_boost',
    description: 'Push your Moneo Score to 80 or above. Focus on reducing spending and tracking consistently.',
    duration: 30,
    difficulty: 'Hard',
    targetScore: 80,
  },
];

function getChallengeDifficulty(type: ChallengeType, days: number): 'Easy' | 'Medium' | 'Hard' {
  if (type === 'log_daily') {
    if (days <= 7) return 'Easy';
    if (days <= 14) return 'Medium';
    return 'Hard';
  }
  if (type === 'budget_stay') return days >= 30 ? 'Hard' : 'Medium';
  if (type === 'score_boost') return 'Medium';
  if (type === 'category_cut') return 'Medium';
  return days <= 7 ? 'Easy' : 'Medium';
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: '#10b981',
  Medium: '#f59e0b',
  Hard: '#ef4444',
};

interface CommunityDetailScreenProps {
  community: Community;
  userId: string;
  userName: string;
  isPremium: boolean;
  transactions: Transaction[];
  monthlyBudget: number;
  categoryLimits: CategoryLimit[];
  subscriptions: Subscription[];
  savingGoals: SavingGoal[];
  currency: string;
  currentScore: number;
  onBack: () => void;
  onCommunityUpdate: (updated: Community) => void;
  onNavigate: (v: AppView) => void;
}

type DetailTab = 'overview' | 'challenges' | 'members';

export const CommunityDetailScreen: React.FC<CommunityDetailScreenProps> = ({
  community, userId, userName, isPremium,
  transactions, monthlyBudget, categoryLimits, subscriptions, savingGoals,
  currency, currentScore, onBack, onCommunityUpdate, onNavigate,
}) => {
  const { colors } = useTheme();
  const [tab, setTab] = useState<DetailTab>('overview');
  const [showInvite, setShowInvite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [expandedChallenge, setExpandedChallenge] = useState<string | null>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [shareScore, setShareScore] = useState(true);
  const [shareName, setShareName] = useState(true);

  const [chType, setChType]       = useState<ChallengeType>('log_daily');
  const [chName, setChName]       = useState('');
  const [chDesc, setChDesc]       = useState('');
  const [chStart, setChStart]     = useState(new Date().toISOString().split('T')[0]);
  const [chEnd, setChEnd]         = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [chTarget, setChTarget]   = useState('');
  const [chCategory, setChCategory] = useState(EXPENSE_CATEGORIES[0].name);
  const [chReduction, setChReduction] = useState('20');
  const [creating, setCreating]   = useState(false);

  const isAdmin = community.role === 'admin';
  const me = community.members.find(m => m.userId === userId);

  const enrichedChallenges = useMemo(() => {
    return community.challenges.map(ch => {
      const participant = ch.participants.find(p => p.userId === userId);
      const live = buildParticipant(
        userId, shareName ? (userName || 'You') : 'Member',
        ch, transactions, monthlyBudget, currentScore,
        participant?.manualDays,
      );
      return { ch, participant, live };
    });
  }, [community.challenges, userId, userName, transactions, monthlyBudget, currentScore, shareName]);

  const activeChallenges   = enrichedChallenges.filter(e => getChallengeStatus(e.ch) === 'active');
  const upcomingChallenges = enrichedChallenges.filter(e => getChallengeStatus(e.ch) === 'upcoming');
  const pastChallenges     = enrichedChallenges.filter(e => getChallengeStatus(e.ch) === 'completed');

  const handleJoinChallenge = (challengeId: string) => {
    const updated: Community = {
      ...community,
      challenges: community.challenges.map(ch => {
        if (ch.id !== challengeId) return ch;
        if (ch.participants.some(p => p.userId === userId)) return ch;
        const participant = buildParticipant(userId, shareName ? (userName || 'You') : 'Member',
          ch, transactions, monthlyBudget, currentScore);
        return { ...ch, participants: [...ch.participants, participant] };
      }),
    };
    onCommunityUpdate(updated);
    const all = loadCommunities().map(c => c.id === updated.id ? updated : c);
    saveCommunities(all);
  };

  const handleManualProgress = (challengeId: string, increment: boolean) => {
    const updated: Community = {
      ...community,
      challenges: community.challenges.map(ch => {
        if (ch.id !== challengeId) return ch;
        const existing = ch.participants.find(p => p.userId === userId);
        if (!existing) return ch;
        const manualDays = (existing.manualDays ?? 0) + (increment ? 1 : -1);
        const totalDays  = challengeDaysTotal(ch);
        const progress   = Math.round(Math.max(0, Math.min(1, manualDays / totalDays)) * 100);
        const updated_p: ChallengeParticipant = { ...existing, manualDays: Math.max(0, manualDays), progress };
        return { ...ch, participants: ch.participants.map(p => p.userId === userId ? updated_p : p) };
      }),
    };
    onCommunityUpdate(updated);
    const all = loadCommunities().map(c => c.id === updated.id ? updated : c);
    saveCommunities(all);
  };

  const handleCreateChallenge = async () => {
    if (!chName.trim() || !isAdmin) return;
    setCreating(true);
    await new Promise(r => setTimeout(r, 300));
    const newCh: Challenge = {
      id: newChallengeId(),
      communityId: community.id,
      name: chName.trim(),
      type: chType,
      description: chDesc.trim() || challengeTypeDescription(chType),
      startDate: chStart,
      endDate: chEnd,
      createdBy: userId,
      createdAt: Date.now(),
      params: {
        targetScore:    chType === 'score_boost'  ? Number(chTarget) || 70 : undefined,
        targetCategory: chType === 'category_cut' ? chCategory : undefined,
        reductionPct:   chType === 'category_cut' ? Number(chReduction) || 20 : undefined,
        daysTarget:     chType === 'log_daily'    ? challengeDaysTotal({ startDate: chStart, endDate: chEnd } as Challenge) : undefined,
        customTarget:   chType === 'custom'       ? chTarget : undefined,
      },
      participants: [],
    };
    const updatedCom: Community = { ...community, challenges: [...community.challenges, newCh] };
    onCommunityUpdate(updatedCom);
    const all = loadCommunities().map(c => c.id === updatedCom.id ? updatedCom : c);
    saveCommunities(all);
    setCreating(false);
    setShowCreateChallenge(false);
    setChName(''); setChDesc(''); setChTarget('');
    setTab('challenges');
  };

  const copyInvite = () => {
    navigator.clipboard.writeText(community.inviteCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page-enter pb-8">
      {/* Header */}
      <div className="px-4 pt-3 mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 mb-3 cursor-pointer transition-colors"
          style={{ color: colors.textMuted }}
        >
          <ChevronLeft size={18} /> Back
        </button>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-lg font-bold"
              style={{
                background: 'linear-gradient(135deg,rgba(99,102,241,0.5),rgba(139,92,246,0.5))',
                border: '1px solid rgba(139,92,246,0.4)',
                color: '#ffffff',
              }}
            >
              {community.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold" style={{ color: colors.textPrimary }}>{community.name}</h1>
                {isAdmin && (
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}
                  >
                    Admin
                  </span>
                )}
              </div>
              {community.description && (
                <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{community.description}</p>
              )}
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[11px]" style={{ color: colors.textSecondary }}>{community.members.length} member{community.members.length !== 1 ? 's' : ''}</span>
                <span className="text-[11px]" style={{ color: colors.textSecondary }}>·</span>
                <span className="text-[11px]" style={{ color: colors.textSecondary }}>{community.challenges.length} challenge{community.challenges.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowInvite(v => !v)}
            className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl cursor-pointer"
            style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}` }}
          >
            <Share2 size={13} style={{ color: colors.textMuted }} />
          </button>
        </div>

        {showInvite && (
          <div
            className="mt-3 rounded-2xl p-3 flex items-center justify-between"
            style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)' }}
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>Invite Code</p>
              <p className="text-lg font-bold tracking-[0.2em] mt-0.5" style={{ color: '#a78bfa' }}>{community.inviteCode}</p>
            </div>
            <button onClick={copyInvite} className="cursor-pointer flex items-center gap-1.5 text-xs font-semibold" style={{ color: colors.textMuted }}>
              {copied ? <><Check size={14} className="text-emerald-400" /> Copied</> : <><Copy size={14} /> Copy</>}
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex px-4 mb-4 gap-1">
        {(['overview', 'challenges', 'members'] as DetailTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer capitalize transition-all"
            style={tab === t
              ? { background: colors.brandSoft, border: `1px solid ${colors.brand}40`, color: colors.brand }
              : { background: colors.bgSecondary, border: `1px solid ${colors.border}`, color: colors.textMuted }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="px-4 space-y-4">
          {/* My stats card */}
          <div className="rounded-2xl p-4" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: colors.textMuted }}>Your Stats</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Moneo Score', value: currentScore, color: currentScore >= 70 ? '#34d399' : currentScore >= 45 ? '#fbbf24' : '#f87171' },
                { label: 'Challenges', value: activeChallenges.filter(e => e.participant).length, color: '#818cf8' },
                { label: 'Completed', value: pastChallenges.filter(e => e.participant && e.live.progress >= 100).length, color: '#a78bfa' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <p className="text-xl font-bold" style={{ color }}>{value}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: colors.textMuted }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Active challenges summary */}
          {activeChallenges.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest px-1 mb-2" style={{ color: colors.textMuted }}>Active Challenges</p>
              <div className="space-y-2">
                {activeChallenges.slice(0, 3).map(({ ch, participant, live }) => (
                  <ChallengeRow
                    key={ch.id}
                    challenge={ch}
                    participant={participant ?? null}
                    liveParticipant={live}
                    userId={userId}
                    onJoin={() => handleJoinChallenge(ch.id)}
                    onManual={(inc) => handleManualProgress(ch.id, inc)}
                    expanded={expandedChallenge === ch.id}
                    onToggle={() => setExpandedChallenge(v => v === ch.id ? null : ch.id)}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
              {activeChallenges.length > 3 && (
                <button
                  onClick={() => setTab('challenges')}
                  className="text-xs font-semibold mt-2 cursor-pointer"
                  style={{ color: colors.brand }}
                >
                  See all {activeChallenges.length} challenges →
                </button>
              )}
            </div>
          )}

          {/* Leaderboard preview */}
          <LeaderboardSection community={community} userId={userId} shareScore={shareScore} shareName={shareName} />

          {/* Privacy settings */}
          <div className="rounded-2xl overflow-hidden" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
            <button
              onClick={() => setShowPrivacy(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3.5 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Shield size={15} style={{ color: colors.brand }} />
                <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>Privacy Settings</p>
              </div>
              {showPrivacy
                ? <ChevronUp size={15} style={{ color: colors.textMuted }} />
                : <ChevronDown size={15} style={{ color: colors.textMuted }} />}
            </button>
            {showPrivacy && (
              <div className="px-4 pb-4 space-y-3" style={{ borderTop: `1px solid ${colors.divider}` }}>
                <p className="text-[11px] pt-2" style={{ color: colors.textMuted }}>Control what others in this community can see about you.</p>
                {[
                  { label: 'Share my Moneo Score', value: shareScore, toggle: () => setShareScore(v => !v) },
                  { label: 'Show my name', value: shareName, toggle: () => setShareName(v => !v) },
                ].map(({ label, value, toggle }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {value
                        ? <Eye size={13} style={{ color: colors.textMuted }} />
                        : <EyeOff size={13} style={{ color: colors.textMuted }} />}
                      <span className="text-xs" style={{ color: colors.textSecondary }}>{label}</span>
                    </div>
                    <button onClick={toggle} className="relative cursor-pointer" style={{ width: 40, height: 22 }}>
                      <div
                        className="absolute inset-0 rounded-full transition-all"
                        style={{ background: value ? colors.accent : colors.bgSecondary }}
                      />
                      <div
                        className="absolute top-1 rounded-full bg-white transition-all"
                        style={{ width: 14, height: 14, left: value ? 22 : 4, transition: 'left 0.15s ease' }}
                      />
                    </button>
                  </div>
                ))}
                <p className="text-[10px]" style={{ color: colors.textMuted }}>Your transactions and exact balances are never shared.</p>
              </div>
            )}
          </div>

          {isAdmin && !showCreateChallenge && (
            <button
              onClick={() => setShowCreateChallenge(true)}
              className="w-full py-3 rounded-2xl text-sm font-bold cursor-pointer flex items-center justify-center gap-2"
              style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa' }}
            >
              <Plus size={15} /> Create New Challenge
            </button>
          )}

          {showCreateChallenge && (
            <CreateChallengePanel
              chType={chType} setChType={setChType}
              chName={chName} setChName={setChName}
              chDesc={chDesc} setChDesc={setChDesc}
              chStart={chStart} setChStart={setChStart}
              chEnd={chEnd} setChEnd={setChEnd}
              chTarget={chTarget} setChTarget={setChTarget}
              chCategory={chCategory} setChCategory={setChCategory}
              chReduction={chReduction} setChReduction={setChReduction}
              creating={creating}
              onCreate={handleCreateChallenge}
              onCancel={() => setShowCreateChallenge(false)}
            />
          )}
        </div>
      )}

      {/* ── CHALLENGES TAB ───────────────────────────────── */}
      {tab === 'challenges' && (
        <div className="px-4 space-y-4">
          {isAdmin && (
            <button
              onClick={() => { setShowCreateChallenge(v => !v); }}
              className="w-full py-3 rounded-2xl text-sm font-bold cursor-pointer flex items-center justify-center gap-2"
              style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa' }}
            >
              <Plus size={15} /> Create Challenge
            </button>
          )}

          {showCreateChallenge && (
            <CreateChallengePanel
              chType={chType} setChType={setChType}
              chName={chName} setChName={setChName}
              chDesc={chDesc} setChDesc={setChDesc}
              chStart={chStart} setChStart={setChStart}
              chEnd={chEnd} setChEnd={setChEnd}
              chTarget={chTarget} setChTarget={setChTarget}
              chCategory={chCategory} setChCategory={setChCategory}
              chReduction={chReduction} setChReduction={setChReduction}
              creating={creating}
              onCreate={handleCreateChallenge}
              onCancel={() => setShowCreateChallenge(false)}
            />
          )}

          {community.challenges.length === 0 ? (
            <EmptyChallenges isAdmin={isAdmin} onCreate={() => setShowCreateChallenge(true)} />
          ) : (
            <>
              {[
                { label: 'Active', items: activeChallenges },
                { label: 'Upcoming', items: upcomingChallenges },
                { label: 'Completed', items: pastChallenges },
              ].map(({ label, items }) => items.length > 0 && (
                <div key={label}>
                  <p className="text-[11px] font-bold uppercase tracking-widest px-1 mb-2" style={{ color: colors.textMuted }}>{label}</p>
                  <div className="space-y-2">
                    {items.map(({ ch, participant, live }) => (
                      <ChallengeRow
                        key={ch.id}
                        challenge={ch}
                        participant={participant ?? null}
                        liveParticipant={live}
                        userId={userId}
                        onJoin={() => handleJoinChallenge(ch.id)}
                        onManual={(inc) => handleManualProgress(ch.id, inc)}
                        expanded={expandedChallenge === ch.id}
                        onToggle={() => setExpandedChallenge(v => v === ch.id ? null : ch.id)}
                        isAdmin={isAdmin}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── MEMBERS TAB ──────────────────────────────────── */}
      {tab === 'members' && (
        <div className="px-4 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-widest px-1 mb-2" style={{ color: colors.textMuted }}>
            {community.members.length} Member{community.members.length !== 1 ? 's' : ''}
          </p>
          {community.members.map(member => {
            const isMe = member.userId === userId;
            return (
              <div
                key={member.userId}
                className="rounded-2xl px-4 py-3 flex items-center gap-3"
                style={{
                  background: colors.bgCard,
                  border: isMe ? `1px solid rgba(129,140,248,0.3)` : `1px solid ${colors.border}`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{
                    background: isMe ? colors.brandSoft : colors.bgSecondary,
                    color: isMe ? colors.brand : colors.textMuted,
                  }}
                >
                  {member.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate" style={{ color: colors.textPrimary }}>
                      {member.displayName}{isMe ? ' (You)' : ''}
                    </p>
                    {member.role === 'admin' && (
                      <Crown size={11} style={{ color: '#a78bfa' }} />
                    )}
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: colors.textSecondary }}>
                    Joined {new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
                {member.sharedScore != null && (
                  <div className="text-right flex-shrink-0">
                    <p
                      className="text-sm font-bold"
                      style={{ color: member.sharedScore >= 70 ? '#34d399' : member.sharedScore >= 45 ? '#fbbf24' : '#f87171' }}
                    >
                      {member.sharedScore}
                    </p>
                    <p className="text-[10px]" style={{ color: colors.textMuted }}>Score</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Challenge Row ────────────────────────────────────────────────────────────

const ChallengeRow: React.FC<{
  challenge: Challenge;
  participant: ChallengeParticipant | null;
  liveParticipant: ChallengeParticipant;
  userId: string;
  onJoin: () => void;
  onManual: (inc: boolean) => void;
  expanded: boolean;
  onToggle: () => void;
  isAdmin: boolean;
}> = ({ challenge, participant, liveParticipant, onJoin, onManual, expanded, onToggle }) => {
  const { isDark, colors } = useTheme();
  const status  = getChallengeStatus(challenge);
  const total   = challengeDaysTotal(challenge);
  const elapsed = challengeDaysElapsed(challenge);
  const avg     = communityAvgProgress(challenge);
  const myPct   = participant ? liveParticipant.progress : null;
  const joined  = !!participant;

  const TypeInfo = CHALLENGE_TYPES.find(t => t.type === challenge.type) ?? CHALLENGE_TYPES[4];
  const Icon = TypeInfo.icon;
  const difficulty = getChallengeDifficulty(challenge.type, total);
  const diffColor  = DIFFICULTY_COLORS[difficulty];
  const statusColor = status === 'active' ? '#10b981' : status === 'upcoming' ? '#f59e0b' : '#64748b';
  const progressColor = (myPct ?? 0) >= 80 ? '#34d399' : (myPct ?? 0) >= 40 ? '#f59e0b' : '#818cf8';

  return (
    <div
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderRadius: 20,
        overflow: 'hidden',
        transition: 'box-shadow 0.15s',
      }}
    >
      {/* Colored type banner */}
      <div style={{
        padding: '6px 14px',
        background: `${TypeInfo.color}${isDark ? '18' : '12'}`,
        borderBottom: `1px solid ${TypeInfo.color}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon size={11} style={{ color: TypeInfo.color }} />
          <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: TypeInfo.color }}>
            {challengeTypeLabel(challenge.type)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
            color: diffColor, background: `${diffColor}15`, borderRadius: 99, padding: '2px 7px',
            border: `1px solid ${diffColor}30`,
          }}>
            {difficulty}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={9} style={{ color: colors.textMuted }} />
            <span style={{ fontSize: 9, fontWeight: 700, color: colors.textMuted }}>{total} DAYS</span>
          </div>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: statusColor }} />
        </div>
      </div>

      {/* Main body */}
      <button className="w-full text-left cursor-pointer" onClick={onToggle} style={{ padding: '14px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: colors.textPrimary, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
            {challenge.name}
          </h3>
          {expanded
            ? <ChevronUp size={15} style={{ color: colors.textMuted, flexShrink: 0, marginTop: 2 }} />
            : <ChevronDown size={15} style={{ color: colors.textMuted, flexShrink: 0, marginTop: 2 }} />}
        </div>

        {/* Participants row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: joined ? 14 : 10 }}>
          <Users size={11} style={{ color: colors.textMuted }} />
          <span style={{ fontSize: 11, color: colors.textSecondary }}>
            {challenge.participants.length} {challenge.participants.length === 1 ? 'person' : 'people'} participating
          </span>
          {status === 'active' && (
            <>
              <span style={{ color: colors.divider }}>·</span>
              <span style={{ fontSize: 11, color: colors.textMuted }}>{elapsed}/{total} days</span>
            </>
          )}
        </div>

        {/* My progress section */}
        {joined && myPct !== null && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: colors.textSecondary }}>Your progress</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: myPct >= 100 ? '#34d399' : colors.textPrimary }}>
                {challenge.type === 'log_daily'
                  ? `${Math.round((myPct / 100) * total)}/${total} days`
                  : `${myPct}%`}
              </span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: colors.bgSecondary, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4,
                width: `${Math.min(100, myPct)}%`,
                background: myPct >= 100
                  ? 'linear-gradient(90deg, #10b981, #34d399)'
                  : `linear-gradient(90deg, ${progressColor}cc, ${progressColor})`,
                transition: 'width 0.8s ease',
              }} />
            </div>
          </div>
        )}

        {/* Streak badge */}
        {joined && liveParticipant.streak > 0 && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 12 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4, borderRadius: 99,
              background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.28)',
              padding: '3px 10px',
            }}>
              <Flame size={11} style={{ color: '#f97316' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#f97316' }}>
                {liveParticipant.streak}-day streak
              </span>
            </div>
          </div>
        )}

        {/* Community progress */}
        <div style={{ paddingBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: colors.textMuted }}>Community progress</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: colors.textSecondary }}>{avg}% avg</span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: colors.bgSecondary, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2, width: `${avg}%`,
              background: `${TypeInfo.color}80`,
              transition: 'width 0.8s ease',
            }} />
          </div>
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${colors.divider}`, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 13, lineHeight: 1.55, color: colors.textMuted }}>{challenge.description}</p>

          {/* Date range */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={12} style={{ color: colors.textMuted }} />
            <span style={{ fontSize: 11, color: colors.textMuted }}>
              {new Date(challenge.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {' – '}
              {new Date(challenge.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {' · '}{total} days
            </span>
          </div>

          {/* Badges earned */}
          {joined && liveParticipant.badges.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {liveParticipant.badges.map(b => (
                <span
                  key={b}
                  style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
                    background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.28)', color: '#fbbf24',
                  }}
                >
                  {challengeBadgeLabel(b)}
                </span>
              ))}
            </div>
          )}

          {/* Manual progress control for custom challenges */}
          {joined && challenge.type === 'custom' && status === 'active' && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: colors.textMuted, marginBottom: 10 }}>
                Mark Daily Progress
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={() => onManual(false)}
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: colors.bgSecondary, border: `1px solid ${colors.border}`,
                    color: colors.textMuted, fontSize: 18, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >−</button>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <p style={{ fontSize: 22, fontWeight: 900, color: colors.textPrimary, letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {liveParticipant.manualDays ?? 0}
                    <span style={{ fontSize: 14, fontWeight: 600, color: colors.textMuted }}> / {total}</span>
                  </p>
                  <p style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>days completed</p>
                </div>
                <button
                  onClick={() => onManual(true)}
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: colors.brandSoft, border: `1px solid rgba(129,140,248,0.28)`,
                    color: colors.brand, fontSize: 18, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >+</button>
              </div>
            </div>
          )}

          {/* Participants list */}
          {challenge.participants.length > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: colors.textMuted, marginBottom: 8 }}>
                Leaderboard
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {challenge.participants
                  .slice()
                  .sort((a, b) => b.progress - a.progress)
                  .slice(0, 5)
                  .map((p, i) => (
                  <div key={p.userId} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, width: 16, color: colors.textMuted, textAlign: 'center' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                    </span>
                    <span style={{ flex: 1, fontSize: 12, color: colors.textSecondary, fontWeight: 500 }}>{p.displayName}</span>
                    {p.streak > 0 && (
                      <span style={{ fontSize: 10, color: '#f97316' }}>🔥{p.streak}</span>
                    )}
                    <span style={{
                      fontSize: 12, fontWeight: 700,
                      color: p.progress >= 80 ? '#34d399' : p.progress >= 40 ? '#f59e0b' : '#64748b',
                    }}>
                      {p.progress}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action button */}
          {!joined && status !== 'completed' && (
            <button
              onClick={onJoin}
              style={{
                width: '100%', padding: '12px', borderRadius: 14,
                background: TypeInfo.color, color: '#ffffff',
                fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <Plus size={14} /> Join Challenge
            </button>
          )}
          {joined && myPct !== null && myPct >= 100 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: 14, padding: '10px',
            }}>
              <Trophy size={14} style={{ color: '#34d399' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>Challenge Completed!</span>
            </div>
          )}
          {joined && status === 'active' && (myPct ?? 0) < 100 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: `${TypeInfo.color}0d`, border: `1px solid ${TypeInfo.color}25`,
              borderRadius: 14, padding: '10px 14px',
            }}>
              <Check size={13} style={{ color: TypeInfo.color }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: TypeInfo.color }}>You're participating — keep going!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Leaderboard ──────────────────────────────────────────────────────────────

const LeaderboardSection: React.FC<{
  community: Community; userId: string; shareScore: boolean; shareName: boolean;
}> = ({ community, userId, shareScore, shareName }) => {
  const { colors } = useTheme();
  const ranked = community.members
    .filter(m => m.sharedScore != null)
    .sort((a, b) => (b.sharedScore ?? 0) - (a.sharedScore ?? 0));

  if (ranked.length < 2) return null;

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-widest px-1 mb-2" style={{ color: colors.textMuted }}>Score Leaderboard</p>
      <div className="rounded-2xl overflow-hidden" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
        {ranked.slice(0, 5).map((member, i) => {
          const isMe = member.userId === userId;
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
          return (
            <div
              key={member.userId}
              className="flex items-center gap-3 px-4 py-3"
              style={{
                borderBottom: i < ranked.length - 1 ? `1px solid ${colors.divider}` : 'none',
                background: isMe ? colors.brandSoft : undefined,
              }}
            >
              <span className="text-sm w-6 text-center flex-shrink-0">{medal}</span>
              <p className="flex-1 text-sm font-semibold truncate" style={{ color: colors.textPrimary }}>
                {member.displayName}{isMe ? ' (You)' : ''}
              </p>
              <p
                className="text-sm font-bold flex-shrink-0"
                style={{ color: (member.sharedScore ?? 0) >= 70 ? '#34d399' : (member.sharedScore ?? 0) >= 45 ? '#fbbf24' : '#f87171' }}
              >
                {member.sharedScore}
              </p>
            </div>
          );
        })}
      </div>
      {!shareScore && (
        <p className="text-[10px] px-1 mt-1.5" style={{ color: colors.textMuted }}>You're not sharing your score. Enable it in Privacy Settings.</p>
      )}
    </div>
  );
};

// ─── Create challenge panel ────────────────────────────────────────────────────

const CreateChallengePanel: React.FC<{
  chType: ChallengeType; setChType: (t: ChallengeType) => void;
  chName: string; setChName: (s: string) => void;
  chDesc: string; setChDesc: (s: string) => void;
  chStart: string; setChStart: (s: string) => void;
  chEnd: string; setChEnd: (s: string) => void;
  chTarget: string; setChTarget: (s: string) => void;
  chCategory: string; setChCategory: (s: string) => void;
  chReduction: string; setChReduction: (s: string) => void;
  creating: boolean; onCreate: () => void; onCancel: () => void;
}> = (p) => {
  const { isDark, colors } = useTheme();
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [durationPreset, setDurationPreset] = useState<number | null>(7);
  const [showCustomDates, setShowCustomDates] = useState(false);

  const inputBase: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    background: colors.bgSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: 12, padding: '10px 12px',
    fontSize: 13, color: colors.textPrimary, outline: 'none',
  };

  const applyTemplate = (t: ChallengeTemplate, idx: number) => {
    setSelectedTemplate(idx);
    p.setChName(t.name);
    p.setChDesc(t.description);
    p.setChType(t.type);
    if (t.targetScore) p.setChTarget(String(t.targetScore));
    if (t.customTarget) p.setChTarget(t.customTarget);
    setDurationPreset(t.duration);
    const end = new Date(p.chStart);
    end.setDate(end.getDate() + t.duration - 1);
    p.setChEnd(end.toISOString().split('T')[0]);
  };

  const applyDuration = (days: number) => {
    setDurationPreset(days);
    setShowCustomDates(false);
    const end = new Date(p.chStart);
    end.setDate(end.getDate() + days - 1);
    p.setChEnd(end.toISOString().split('T')[0]);
  };

  const selectStyle: React.CSSProperties = {
    ...inputBase,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23cbd5e1' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    backgroundSize: '16px',
    paddingRight: '2rem',
    appearance: 'none' as const,
    cursor: 'pointer',
  };

  return (
    <div
      style={{
        background: colors.bgCard,
        border: '1px solid rgba(139,92,246,0.28)',
        borderRadius: 20,
        overflow: 'hidden',
      }}
    >
      {/* Panel header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px 12px',
        borderBottom: `1px solid ${colors.divider}`,
        background: isDark ? 'rgba(139,92,246,0.06)' : 'rgba(139,92,246,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Star size={14} style={{ color: '#a78bfa' }} />
          <p style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>New Challenge</p>
        </div>
        <button onClick={p.onCancel} style={{ color: colors.textMuted, cursor: 'pointer', background: 'none', border: 'none' }}>
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Template picker */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: colors.textMuted, marginBottom: 10 }}>
            Pick a Template
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {CHALLENGE_TEMPLATES.map((t, i) => {
              const TypeInfo = CHALLENGE_TYPES.find(ct => ct.type === t.type) ?? CHALLENGE_TYPES[4];
              const active = selectedTemplate === i;
              const diff = DIFFICULTY_COLORS[t.difficulty];
              return (
                <button
                  key={i}
                  onClick={() => applyTemplate(t, i)}
                  style={{
                    textAlign: 'left',
                    background: active
                      ? `${TypeInfo.color}14`
                      : colors.bgSecondary,
                    border: active
                      ? `1.5px solid ${TypeInfo.color}40`
                      : `1px solid ${colors.border}`,
                    borderRadius: 14,
                    padding: '10px 12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 16 }}>{t.emoji}</span>
                    <span style={{
                      fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                      color: diff, background: `${diff}14`, borderRadius: 99, padding: '2px 5px',
                      border: `1px solid ${diff}25`,
                    }}>
                      {t.difficulty}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: active ? TypeInfo.color : colors.textPrimary, lineHeight: 1.3 }}>
                    {t.name}
                  </p>
                  <p style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>{t.duration} days</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Challenge name (always shown) */}
        <div>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: colors.textMuted, marginBottom: 8 }}>
            Challenge Name
          </label>
          <input
            style={inputBase}
            placeholder="e.g. 7-Day Spending Awareness"
            value={p.chName}
            onChange={e => p.setChName(e.target.value)}
          />
        </div>

        {/* Type selector */}
        <div>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: colors.textMuted, marginBottom: 8 }}>
            Challenge Type
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
            {CHALLENGE_TYPES.map(({ type, icon: Icon, color }) => (
              <button
                key={type}
                onClick={() => p.setChType(type)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px',
                  borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                  background: p.chType === type ? `${color}14` : colors.bgSecondary,
                  border: p.chType === type ? `1.5px solid ${color}40` : `1px solid ${colors.border}`,
                  color: p.chType === type ? color : colors.textMuted,
                  fontSize: 11, fontWeight: 600, transition: 'all 0.12s',
                }}
              >
                <Icon size={11} /> {challengeTypeLabel(type)}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: colors.textSecondary, marginTop: 6 }}>{challengeTypeDescription(p.chType)}</p>
        </div>

        {/* Type-specific params */}
        {p.chType === 'score_boost' && (
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: colors.textMuted, marginBottom: 8 }}>
              Target Score (out of 100)
            </label>
            <input style={inputBase} type="number" placeholder="70" value={p.chTarget} onChange={e => p.setChTarget(e.target.value)} min={1} max={100} />
          </div>
        )}
        {p.chType === 'category_cut' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: colors.textMuted, marginBottom: 8 }}>
                Category
              </label>
              <select style={selectStyle} value={p.chCategory} onChange={e => p.setChCategory(e.target.value)}>
                {EXPENSE_CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: colors.textMuted, marginBottom: 8 }}>
                Reduce by %
              </label>
              <input style={inputBase} type="number" placeholder="20" value={p.chReduction} onChange={e => p.setChReduction(e.target.value)} min={1} max={100} />
            </div>
          </div>
        )}
        {p.chType === 'custom' && (
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: colors.textMuted, marginBottom: 8 }}>
              What's the Goal?
            </label>
            <input style={inputBase} placeholder="e.g. No eating out for 7 days" value={p.chTarget} onChange={e => p.setChTarget(e.target.value)} />
          </div>
        )}

        {/* Duration presets */}
        <div>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: colors.textMuted, marginBottom: 8 }}>
            Duration
          </label>
          <div style={{ display: 'flex', gap: 6 }}>
            {[7, 14, 30].map(d => (
              <button
                key={d}
                onClick={() => applyDuration(d)}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 10, cursor: 'pointer',
                  fontSize: 12, fontWeight: 700, textAlign: 'center',
                  background: durationPreset === d && !showCustomDates ? colors.accent : colors.bgSecondary,
                  border: durationPreset === d && !showCustomDates ? `1.5px solid ${colors.accent}` : `1px solid ${colors.border}`,
                  color: durationPreset === d && !showCustomDates ? '#ffffff' : colors.textMuted,
                  transition: 'all 0.12s',
                }}
              >
                {d}d
              </button>
            ))}
            <button
              onClick={() => { setShowCustomDates(true); setDurationPreset(null); }}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 10, cursor: 'pointer',
                fontSize: 12, fontWeight: 700, textAlign: 'center',
                background: showCustomDates ? 'rgba(139,92,246,0.12)' : colors.bgSecondary,
                border: showCustomDates ? '1.5px solid rgba(139,92,246,0.4)' : `1px solid ${colors.border}`,
                color: showCustomDates ? '#a78bfa' : colors.textMuted,
                transition: 'all 0.12s',
              }}
            >
              Custom
            </button>
          </div>
        </div>

        {/* Custom date pickers */}
        {showCustomDates && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: colors.textMuted, marginBottom: 8 }}>
                Start
              </label>
              <input style={inputBase} type="date" value={p.chStart} onChange={e => p.setChStart(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: colors.textMuted, marginBottom: 8 }}>
                End
              </label>
              <input style={inputBase} type="date" value={p.chEnd} onChange={e => p.setChEnd(e.target.value)} />
            </div>
          </div>
        )}

        {/* Create button */}
        <button
          onClick={p.onCreate}
          disabled={p.creating || !p.chName.trim()}
          style={{
            width: '100%', padding: '13px', borderRadius: 14, cursor: 'pointer',
            background: p.creating || !p.chName.trim()
              ? colors.bgSecondary
              : 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
            color: p.creating || !p.chName.trim() ? colors.textMuted : '#ffffff',
            fontSize: 14, fontWeight: 700, border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'all 0.15s',
          }}
        >
          {p.creating ? 'Creating…' : <><Zap size={14} /> Launch Challenge</>}
        </button>
      </div>
    </div>
  );
};

// ─── Empty challenges ──────────────────────────────────────────────────────────

const EmptyChallenges: React.FC<{ isAdmin: boolean; onCreate: () => void }> = ({ isAdmin, onCreate }) => {
  const { colors } = useTheme();
  return (
    <div
      className="rounded-2xl px-4 py-8 text-center"
      style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
    >
      <Trophy size={28} className="mx-auto mb-3" style={{ color: colors.textMuted }} />
      <p className="text-sm font-semibold mb-1" style={{ color: colors.textSecondary }}>No challenges yet</p>
      <p className="text-xs leading-relaxed mb-4" style={{ color: colors.textMuted }}>
        {isAdmin
          ? 'Create the first challenge for your community. Challenges help members stay motivated and accountable.'
          : 'No challenges have been created yet. Ask your community admin to start one.'}
      </p>
      {isAdmin && (
        <button onClick={onCreate} className="btn-primary px-5 py-2 rounded-xl text-sm font-bold cursor-pointer">
          Create First Challenge
        </button>
      )}
    </div>
  );
};
