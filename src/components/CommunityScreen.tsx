import React, { useState } from 'react';
import {
  Users, Plus, Hash, Crown, ChevronRight, Copy, Check,
  Trophy, Zap, Target, ArrowRight, UserPlus, Lock,
} from 'lucide-react';
import { Community, AppView } from '../types/finance';
import {
  generateInviteCode, saveCommunities, getChallengeStatus,
  communityAvgProgress,
} from '../utils/communityUtils';

interface CommunityScreenProps {
  userId: string;
  userName: string;
  isPremium: boolean;
  communities: Community[];
  currentScore: number;
  onCommunitiesChange: (c: Community[]) => void;
  onSelectCommunity: (id: string) => void;
  onNavigate: (v: AppView) => void;
  onCreateCommunity?: (community: Community) => Promise<void>;
  onJoinByCode?: (code: string) => Promise<Community | null>;
}

export const CommunityScreen: React.FC<CommunityScreenProps> = ({
  userId, userName, isPremium, communities, currentScore,
  onCommunitiesChange, onSelectCommunity, onNavigate,
  onCreateCommunity, onJoinByCode,
}) => {
  // Join flow
  const [showJoin, setShowJoin]     = useState(false);
  const [joinCode, setJoinCode]     = useState('');
  const [joinError, setJoinError]   = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);

  // Create flow
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [createPrivacy, setCreatePrivacy] = useState<'invite' | 'public'>('invite');
  const [creating, setCreating]     = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length < 4) { setJoinError('Enter a valid invite code.'); return; }
    if (communities.find(c => c.inviteCode === code)) {
      setJoinError('You are already a member of this community.'); return;
    }
    setJoinLoading(true);
    setJoinError('');

    // Try Supabase first; fall back to local placeholder
    let found: Community | null = null;
    if (onJoinByCode) {
      found = await onJoinByCode(code);
    }

    if (!found) {
      // Supabase not configured or code not found — create a local placeholder
      // so the UX still works offline
      found = {
        id: 'com-' + Date.now(),
        name: `Community ${code}`,
        description: 'Joined via invite code',
        inviteCode: code,
        creatorId: '',
        privacy: 'invite',
        createdAt: new Date().toISOString(),
        role: 'member',
        members: [
          { userId, displayName: userName || 'You', role: 'member', joinedAt: new Date().toISOString(), sharedScore: currentScore },
        ],
        challenges: [],
      };
      if (onJoinByCode) {
        // Supabase IS configured but code wasn't found — show error
        setJoinLoading(false);
        setJoinError('No community found with that code. Check the code and try again.');
        return;
      }
    }

    const updated = [...communities, found];
    onCommunitiesChange(updated);
    saveCommunities(updated);
    setJoinLoading(false);
    setJoinSuccess(found.name);
    setJoinCode('');
    setTimeout(() => { setJoinSuccess(null); setShowJoin(false); }, 2000);
  };

  const handleCreate = async () => {
    if (!createName.trim()) return;
    if (!isPremium) { onNavigate('premium'); return; }
    setCreating(true);
    const code = generateInviteCode();
    await new Promise(r => setTimeout(r, 400));
    const newCommunity: Community = {
      id: 'com-' + Date.now(),
      name: createName.trim(),
      description: createDesc.trim(),
      inviteCode: code,
      creatorId: userId,
      privacy: createPrivacy,
      createdAt: new Date().toISOString(),
      role: 'admin',
      members: [
        { userId, displayName: userName || 'You', role: 'admin', joinedAt: new Date().toISOString(), sharedScore: currentScore },
      ],
      challenges: [],
    };
    const updated = [...communities, newCommunity];
    onCommunitiesChange(updated);
    saveCommunities(updated);
    if (onCreateCommunity) await onCreateCommunity(newCommunity).catch(() => {});
    setCreating(false);
    setCreatedCode(code);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const finishCreate = () => {
    setShowCreate(false);
    setCreateName('');
    setCreateDesc('');
    setCreatedCode(null);
  };

  const inputBase = 'input-dark w-full px-3 py-2.5 rounded-xl text-sm';

  return (
    <div className="page-enter px-4 pt-3 pb-8">

      {/* Header */}
      <div className="flex items-center justify-between pt-1 mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">Community</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Improve finances together</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowJoin(v => !v); setShowCreate(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer text-xs font-bold transition-all"
            style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}
          >
            <UserPlus size={13} /> Join
          </button>
          <button
            onClick={() => { setShowCreate(v => !v); setShowJoin(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer text-xs font-bold transition-all"
            style={isPremium
              ? { background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa' }
              : { background: '#0d1526', border: '1px solid #1e2d4a', color: '#3d5068' }}
          >
            {isPremium ? <Plus size={13} /> : <Lock size={13} />} Create
          </button>
        </div>
      </div>

      {/* Join panel */}
      {showJoin && (
        <div className="card-dark rounded-2xl p-4 mb-4 space-y-3" style={{ border: '1px solid rgba(59,130,246,0.25)' }}>
          <p className="text-sm font-bold text-slate-200">Join a Community</p>
          <p className="text-xs text-slate-500">Ask the community admin for the 6-character invite code.</p>
          {joinSuccess ? (
            <div className="flex items-center gap-2 py-2">
              <Check size={16} className="text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">Joined {joinSuccess}!</span>
            </div>
          ) : (
            <>
              <input
                className={inputBase + ' uppercase tracking-widest text-center font-bold text-lg'}
                placeholder="XXXXXX"
                maxLength={6}
                value={joinCode}
                onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinError(''); }}
              />
              {joinError && <p className="text-xs text-red-400">{joinError}</p>}
              <button
                onClick={handleJoin}
                disabled={joinLoading || joinCode.trim().length < 4}
                className="w-full py-2.5 rounded-xl text-sm font-bold btn-blue cursor-pointer disabled:opacity-40"
              >
                {joinLoading ? 'Joining…' : 'Join Community'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Create panel */}
      {showCreate && (
        <div className="card-dark rounded-2xl p-4 mb-4 space-y-3" style={{ border: '1px solid rgba(139,92,246,0.25)' }}>
          {createdCode ? (
            <>
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(139,92,246,0.15)' }}>
                  <Check size={22} style={{ color: '#a78bfa' }} />
                </div>
                <p className="text-base font-bold text-white mb-1">Community Created!</p>
                <p className="text-xs text-slate-500 mb-4">Share this invite code with people you want to add.</p>
                <div
                  className="flex items-center justify-center gap-3 rounded-2xl py-4 mb-3"
                  style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}
                >
                  <span className="text-2xl font-bold tracking-[0.25em]" style={{ color: '#a78bfa' }}>{createdCode}</span>
                  <button onClick={() => copyCode(createdCode)} className="cursor-pointer text-slate-500 hover:text-slate-300">
                    {codeCopied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                </div>
                <button onClick={finishCreate} className="btn-blue w-full py-2.5 rounded-xl text-sm font-bold cursor-pointer">
                  Done
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Crown size={14} style={{ color: '#a78bfa' }} />
                <p className="text-sm font-bold text-slate-200">Create a Community</p>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1.5">Name</label>
                <input
                  className={inputBase}
                  placeholder="e.g. Study Budget Squad"
                  value={createName}
                  onChange={e => setCreateName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1.5">Description (optional)</label>
                <input
                  className={inputBase}
                  placeholder="What's this community about?"
                  value={createDesc}
                  onChange={e => setCreateDesc(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1.5">Privacy</label>
                <div className="flex gap-2">
                  {(['invite', 'public'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setCreatePrivacy(p)}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold cursor-pointer capitalize"
                      style={createPrivacy === p
                        ? { background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.35)', color: '#c4b5fd' }
                        : { background: '#0a1424', border: '1px solid #1e2d4a', color: '#475569' }}
                    >
                      {p === 'invite' ? '🔒 Invite Only' : '🌐 Public'}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleCreate}
                disabled={creating || !createName.trim()}
                className="w-full py-2.5 rounded-xl text-sm font-bold cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}
              >
                {creating ? 'Creating…' : <><Plus size={14} /> Create Community</>}
              </button>
            </>
          )}
        </div>
      )}

      {/* Community list or empty state */}
      {communities.length === 0 && !showJoin && !showCreate ? (
        <EmptyState isPremium={isPremium} onJoin={() => setShowJoin(true)} onCreate={() => setShowCreate(true)} />
      ) : communities.length > 0 ? (
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest px-1" style={{ color: '#3d5068' }}>
            Your Communities
          </p>
          {communities.map(community => (
            <CommunityCard
              key={community.id}
              community={community}
              userId={userId}
              onTap={() => onSelectCommunity(community.id)}
            />
          ))}
        </div>
      ) : null}

      {/* Premium banner if not premium and has communities */}
      {!isPremium && communities.length > 0 && (
        <button
          onClick={() => onNavigate('premium')}
          className="mt-4 w-full rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer transition-all"
          style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)' }}
        >
          <Crown size={16} style={{ color: '#a78bfa' }} />
          <div className="flex-1 text-left">
            <p className="text-xs font-bold text-slate-300">Create your own community</p>
            <p className="text-[10px] text-slate-500">Premium · $1.99/month</p>
          </div>
          <ArrowRight size={14} style={{ color: '#a78bfa' }} />
        </button>
      )}
    </div>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ isPremium: boolean; onJoin: () => void; onCreate: () => void }> = ({ isPremium, onJoin, onCreate }) => {
  return (
    <div className="space-y-4">
      {/* Hero */}
      <div
        className="rounded-3xl p-6 text-center"
        style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.12)' }}
      >
        <div
          className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}
        >
          <Users size={28} style={{ color: '#a78bfa' }} />
        </div>
        <h2 className="text-base font-bold text-white mb-2">Your financial community awaits</h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
          Join a community to take on challenges together, compare Moneo Scores, and stay motivated.
          No private financial data is ever shared — only what you choose.
        </p>
      </div>

      {/* What communities offer */}
      <div className="space-y-2.5">
        {[
          { icon: Trophy, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', title: 'Challenges', desc: 'Take on group financial challenges and track progress together' },
          { icon: Target,  color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  title: 'Leaderboard', desc: 'See how your Moneo Score compares — only if you choose to share' },
          { icon: Zap,     color: '#34d399', bg: 'rgba(52,211,153,0.1)',  title: 'Streaks & Badges', desc: 'Earn badges for consistency and completing challenges' },
        ].map(({ icon: Icon, color, bg, title, desc }) => (
          <div key={title} className="card-dark rounded-2xl px-4 py-3 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <Icon size={17} style={{ color }} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-200">{title}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="space-y-2.5 pt-1">
        <button
          onClick={onJoin}
          className="w-full py-3.5 rounded-2xl text-sm font-bold btn-blue cursor-pointer flex items-center justify-center gap-2"
        >
          <Hash size={16} /> Join with Invite Code
        </button>
        <button
          onClick={onCreate}
          className="w-full py-3.5 rounded-2xl text-sm font-bold cursor-pointer flex items-center justify-center gap-2 transition-all"
          style={isPremium
            ? { background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', boxShadow: '0 4px 16px rgba(139,92,246,0.3)', color: '#fff' }
            : { background: '#0d1526', border: '1px solid #1e2d4a', color: '#475569' }}
        >
          <Crown size={16} style={{ color: isPremium ? '#fff' : '#a78bfa' }} />
          Create a Community
          {!isPremium && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1"
              style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
              Premium
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Community card ───────────────────────────────────────────────────────────

const CommunityCard: React.FC<{
  community: Community;
  userId: string;
  onTap: () => void;
}> = ({ community, userId, onTap }) => {
  const isAdmin = community.role === 'admin';
  const activeChallenges = community.challenges.filter(c => getChallengeStatus(c) === 'active');
  const userInChallenge = activeChallenges.filter(c => c.participants.some(p => p.userId === userId));

  return (
    <button
      onClick={onTap}
      className="card-dark w-full rounded-2xl p-4 text-left cursor-pointer transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.4),rgba(139,92,246,0.4))', border: '1px solid rgba(139,92,246,0.3)' }}
          >
            {community.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-slate-200">{community.name}</p>
              {isAdmin && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                  style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}>
                  Admin
                </span>
              )}
            </div>
            {community.description && (
              <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{community.description}</p>
            )}
          </div>
        </div>
        <ChevronRight size={15} className="text-slate-600 flex-shrink-0 mt-0.5" />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Users size={11} className="text-slate-600" />
          <span className="text-[11px] text-slate-500">{community.members.length} member{community.members.length !== 1 ? 's' : ''}</span>
        </div>
        {activeChallenges.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Zap size={11} className="text-amber-500" />
            <span className="text-[11px] text-amber-500 font-semibold">
              {activeChallenges.length} active challenge{activeChallenges.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        {userInChallenge.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Trophy size={11} className="text-emerald-500" />
            <span className="text-[11px] text-emerald-500 font-semibold">
              {userInChallenge.length} joined
            </span>
          </div>
        )}
      </div>

      {/* Active challenge progress preview */}
      {userInChallenge.length > 0 && (() => {
        const ch = userInChallenge[0];
        const me = ch.participants.find(p => p.userId === userId);
        const avg = communityAvgProgress(ch);
        const myPct = me?.progress ?? 0;
        return (
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid #0c1a30' }}>
            <div className="flex justify-between text-[10px] mb-1.5">
              <span className="text-slate-500 font-semibold">{ch.name}</span>
              <span style={{ color: myPct >= 80 ? '#34d399' : myPct >= 40 ? '#fbbf24' : '#64748b' }} className="font-bold">
                You: {myPct}%
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#0a1828' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${myPct}%`,
                  background: myPct >= 80 ? '#34d399' : myPct >= 40 ? '#fbbf24' : '#3b82f6',
                }}
              />
            </div>
            <p className="text-[10px] text-slate-600 mt-1">Community avg: {avg}%</p>
          </div>
        );
      })()}
    </button>
  );
}
