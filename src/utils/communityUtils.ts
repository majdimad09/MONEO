import {
  Community, Challenge, ChallengeParticipant, CommunityPrivacy,
  Transaction, ChallengeType,
} from '../types/finance';

const COMMUNITIES_KEY = 'moneo_communities_v1';
const PRIVACY_KEY = 'moneo_community_privacy_v1';

// ─── localStorage persistence ─────────────────────────────────────────────────

export function loadCommunities(): Community[] {
  try {
    const raw = localStorage.getItem(COMMUNITIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveCommunities(communities: Community[]): void {
  try { localStorage.setItem(COMMUNITIES_KEY, JSON.stringify(communities)); } catch {}
}

export function loadCommunityPrivacy(): CommunityPrivacy {
  try {
    const raw = localStorage.getItem(PRIVACY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { showScore: true, showProfileName: true, appearOnLeaderboards: true };
}

export function saveCommunityPrivacy(p: CommunityPrivacy): void {
  try { localStorage.setItem(PRIVACY_KEY, JSON.stringify(p)); } catch {}
}

// ─── Invite code generator ────────────────────────────────────────────────────

export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ─── Challenge ID generator ───────────────────────────────────────────────────

export function newChallengeId(): string {
  return 'ch-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
}

// ─── Challenge status ─────────────────────────────────────────────────────────

export type ChallengeStatus = 'upcoming' | 'active' | 'completed';

export function getChallengeStatus(challenge: Challenge): ChallengeStatus {
  const today = new Date().toISOString().split('T')[0];
  if (today < challenge.startDate) return 'upcoming';
  if (today > challenge.endDate) return 'completed';
  return 'active';
}

export function challengeDaysTotal(challenge: Challenge): number {
  const start = new Date(challenge.startDate);
  const end   = new Date(challenge.endDate);
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
}

export function challengeDaysElapsed(challenge: Challenge): number {
  const today = new Date();
  const start = new Date(challenge.startDate);
  return Math.max(0, Math.min(
    challengeDaysTotal(challenge),
    Math.round((today.getTime() - start.getTime()) / 86400000) + 1,
  ));
}

export function challengeTypeLabel(type: ChallengeType): string {
  switch (type) {
    case 'log_daily':    return 'Daily Log Habit';
    case 'budget_stay':  return 'Budget Champion';
    case 'score_boost':  return 'Score Climber';
    case 'category_cut': return 'Spending Reducer';
    case 'custom':       return 'Community Challenge';
  }
}

export function challengeTypeDescription(type: ChallengeType): string {
  switch (type) {
    case 'log_daily':    return 'Log at least one transaction every day during the challenge.';
    case 'budget_stay':  return 'Keep your monthly spending within your set budget.';
    case 'score_boost':  return 'Reach a target Moneo Score by the end of the challenge.';
    case 'category_cut': return 'Reduce spending in a specific category compared to last month.';
    case 'custom':       return 'A community-defined challenge with custom goals.';
  }
}

// ─── Auto-calculate challenge progress from user's real data ─────────────────

export function calculateChallengeProgress(
  challenge: Challenge,
  userId: string,
  transactions: Transaction[],
  monthlyBudget: number,
  currentScore: number,
): number {
  const status = getChallengeStatus(challenge);
  if (status === 'upcoming') return 0;

  const start = challenge.startDate;
  const end   = challenge.endDate;
  const today = new Date().toISOString().split('T')[0];
  const effectiveEnd = today < end ? today : end;

  // Filter transactions within challenge window
  const inWindow = transactions.filter(t => t.date >= start && t.date <= effectiveEnd);

  switch (challenge.type) {
    case 'log_daily': {
      const totalDays = challengeDaysTotal(challenge);
      const elapsed   = challengeDaysElapsed(challenge);
      if (elapsed === 0) return 0;
      const loggedDays = new Set(inWindow.map(t => t.date)).size;
      return Math.round((loggedDays / Math.min(elapsed, totalDays)) * 100);
    }

    case 'budget_stay': {
      if (monthlyBudget <= 0) return 0;
      const prefix = new Date().toISOString().slice(0, 7); // YYYY-MM
      const monthlyExpenses = transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(prefix))
        .reduce((s, t) => s + t.amount, 0);
      const ratio = monthlyExpenses / monthlyBudget;
      if (ratio <= 0.5) return 100;
      if (ratio >= 1.0) return 0;
      return Math.round((1 - ratio) / 0.5 * 100);
    }

    case 'score_boost': {
      const target = challenge.params.targetScore ?? 70;
      if (currentScore >= target) return 100;
      return Math.round((currentScore / target) * 100);
    }

    case 'category_cut': {
      const cat = challenge.params.targetCategory ?? '';
      const goal = (challenge.params.reductionPct ?? 20) / 100;
      const prevMonth = getPrevMonthPrefix();
      const currMonth = new Date().toISOString().slice(0, 7);
      const prev = transactions
        .filter(t => t.type === 'expense' && t.category === cat && t.date.startsWith(prevMonth))
        .reduce((s, t) => s + t.amount, 0);
      const curr = transactions
        .filter(t => t.type === 'expense' && t.category === cat && t.date.startsWith(currMonth))
        .reduce((s, t) => s + t.amount, 0);
      if (prev === 0) return curr === 0 ? 100 : 0;
      const reduction = (prev - curr) / prev;
      return Math.round(Math.min(1, Math.max(0, reduction / goal)) * 100);
    }

    case 'custom': {
      // Find existing participant entry for manual progress
      const existing = challenge.participants.find(p => p.userId === userId);
      return existing?.progress ?? 0;
    }
  }
}

function getPrevMonthPrefix(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 7);
}

// ─── Calculate streak for log_daily ──────────────────────────────────────────

export function calculateStreak(transactions: Transaction[], startDate: string): number {
  const today = new Date().toISOString().split('T')[0];
  const loggedDays = new Set(
    transactions.filter(t => t.date >= startDate && t.date <= today).map(t => t.date)
  );

  let streak = 0;
  const cursor = new Date(today);
  while (true) {
    const dateStr = cursor.toISOString().split('T')[0];
    if (dateStr < startDate) break;
    if (!loggedDays.has(dateStr)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// ─── Build participant entry ──────────────────────────────────────────────────

export function buildParticipant(
  userId: string,
  displayName: string,
  challenge: Challenge,
  transactions: Transaction[],
  monthlyBudget: number,
  currentScore: number,
  existingManualDays?: number,
): ChallengeParticipant {
  const progress = challenge.type === 'custom'
    ? (challenge.participants.find(p => p.userId === userId)?.progress ?? 0)
    : calculateChallengeProgress(challenge, userId, transactions, monthlyBudget, currentScore);

  const streak = challenge.type === 'log_daily'
    ? calculateStreak(transactions, challenge.startDate)
    : 0;

  const badges: string[] = [];
  if (progress >= 100) badges.push('completed');
  if (streak >= 7)     badges.push('streak-7');
  if (streak >= 3)     badges.push('streak-3');

  const existing = challenge.participants.find(p => p.userId === userId);

  return {
    userId,
    displayName,
    progress,
    streak,
    joinedAt: existing?.joinedAt ?? new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    badges,
    manualDays: existingManualDays,
  };
}

// ─── Community stats helpers ──────────────────────────────────────────────────

export function communityAvgProgress(challenge: Challenge): number {
  if (challenge.participants.length === 0) return 0;
  const sum = challenge.participants.reduce((s, p) => s + p.progress, 0);
  return Math.round(sum / challenge.participants.length);
}

export function challengeBadgeLabel(badge: string): string {
  switch (badge) {
    case 'completed': return '✓ Completed';
    case 'streak-7':  return '🔥 7-day streak';
    case 'streak-3':  return '⚡ 3-day streak';
    default:          return badge;
  }
}
