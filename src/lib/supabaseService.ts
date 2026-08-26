/**
 * Supabase data operations for Cashly.
 * All functions check for null supabase client and are safe to call even
 * when Supabase is not configured — they simply return empty/no-op results.
 */

import { supabase } from './supabase';
import { Transaction, CategoryLimit, SavingGoal, Subscription, RecurringIncome, PremiumPlan, MembershipState, Community, CommunityMember } from '../types/finance';

// ─── PROFILE ─────────────────────────────────────────────────────────────────

export interface ProfileData {
  name: string;
  currency: string;
  age: number | null;
  status: string;
  language: string;
  onboarded: boolean;
}

export async function loadProfile(userId: string): Promise<ProfileData | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from('profiles')
    .select('name, currency, age, status, language, onboarded')
    .eq('id', userId)
    .single();
  return data;
}

export async function saveProfile(
  userId: string,
  patch: Partial<ProfileData & { currency: string }>
): Promise<void> {
  if (!supabase) return;
  await supabase
    .from('profiles')
    .upsert({ id: userId, ...patch, updated_at: new Date().toISOString() });
}

export async function markOnboarded(userId: string): Promise<void> {
  if (!supabase) return;
  await supabase
    .from('profiles')
    .update({ onboarded: true, updated_at: new Date().toISOString() })
    .eq('id', userId);
}

// ─── USER PREFERENCES ────────────────────────────────────────────────────────

export interface DbPreferences {
  monthly_budget: number;
  category_limits: CategoryLimit[];
}

export async function loadUserPreferences(userId: string): Promise<DbPreferences | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from('user_preferences')
    .select('monthly_budget, category_limits')
    .eq('user_id', userId)
    .single();
  return data;
}

export async function saveUserPreferences(
  userId: string,
  patch: Partial<{ monthly_budget: number; category_limits: CategoryLimit[]; currency: string }>
): Promise<void> {
  if (!supabase) return;
  await supabase
    .from('user_preferences')
    .upsert({ user_id: userId, ...patch, updated_at: new Date().toISOString() });
}

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────

function dbRowToTransaction(r: Record<string, unknown>): Transaction {
  return {
    id: r.id as string,
    type: r.type as 'income' | 'expense',
    amount: Number(r.amount),
    description: r.description as string,
    category: r.category as string,
    date: r.date as string,
    note: (r.note as string | null) ?? undefined,
    createdAt: r.created_at_ms as number,
  };
}

export async function fetchTransactions(userId: string): Promise<Transaction[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at_ms', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(dbRowToTransaction);
}

export async function insertTransaction(userId: string, tx: Transaction): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('transactions').insert({
    id: tx.id,
    user_id: userId,
    type: tx.type,
    amount: tx.amount,
    description: tx.description,
    category: tx.category,
    date: tx.date,
    note: tx.note ?? null,
    created_at_ms: tx.createdAt,
  });
  if (error) throw error;
}

export async function updateTransaction(userId: string, tx: Transaction): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('transactions')
    .update({
      type: tx.type,
      amount: tx.amount,
      description: tx.description,
      category: tx.category,
      date: tx.date,
      note: tx.note ?? null,
    })
    .eq('id', tx.id)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function deleteTransaction(userId: string, txId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', txId)
    .eq('user_id', userId);
  if (error) throw error;
}

// ─── SAVING GOALS ─────────────────────────────────────────────────────────────

function dbRowToGoal(r: Record<string, unknown>): SavingGoal {
  return {
    id: r.id as string,
    name: r.name as string,
    targetAmount: Number(r.target_amount),
    currentAmount: Number(r.current_amount),
    targetDate: r.target_date as string,
    createdAt: r.created_at_ms as number,
  };
}

export async function fetchSavingGoals(userId: string): Promise<SavingGoal[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('saving_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at_ms', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(dbRowToGoal);
}

export async function replaceSavingGoals(userId: string, goals: SavingGoal[]): Promise<void> {
  if (!supabase) return;
  await supabase.from('saving_goals').delete().eq('user_id', userId);
  if (goals.length > 0) {
    const { error } = await supabase.from('saving_goals').insert(
      goals.map(g => ({
        id: g.id,
        user_id: userId,
        name: g.name,
        target_amount: g.targetAmount,
        current_amount: g.currentAmount,
        target_date: g.targetDate,
        created_at_ms: g.createdAt,
      }))
    );
    if (error) throw error;
  }
}

// ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────

function dbRowToSubscription(r: Record<string, unknown>): Subscription {
  return {
    id: r.id as string,
    name: r.name as string,
    amount: Number(r.amount),
    frequency: r.frequency as 'weekly' | 'monthly' | 'yearly',
    nextPaymentDate: r.next_payment_date as string,
    category: r.category as string,
    isActive: r.is_active as boolean,
    createdAt: r.created_at_ms as number,
  };
}

export async function fetchSubscriptions(userId: string): Promise<Subscription[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at_ms', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(dbRowToSubscription);
}

export async function replaceSubscriptions(userId: string, subs: Subscription[]): Promise<void> {
  if (!supabase) return;
  await supabase.from('subscriptions').delete().eq('user_id', userId);
  if (subs.length > 0) {
    const { error } = await supabase.from('subscriptions').insert(
      subs.map(s => ({
        id: s.id,
        user_id: userId,
        name: s.name,
        amount: s.amount,
        frequency: s.frequency,
        next_payment_date: s.nextPaymentDate,
        category: s.category,
        is_active: s.isActive,
        created_at_ms: s.createdAt,
      }))
    );
    if (error) throw error;
  }
}

// ─── RECURRING INCOME ────────────────────────────────────────────────────────

function dbRowToRecurringIncome(r: Record<string, unknown>): RecurringIncome {
  return {
    id: r.id as string,
    name: r.name as string,
    amount: Number(r.amount),
    frequency: r.frequency as RecurringIncome['frequency'],
    nextPaymentDate: r.next_payment_date as string,
    category: r.category as string,
    isActive: r.is_active as boolean,
    createdAt: r.created_at_ms as number,
    notes: (r.notes as string | null) ?? undefined,
  };
}

export async function fetchRecurringIncome(userId: string): Promise<RecurringIncome[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('recurring_income')
    .select('*')
    .eq('user_id', userId)
    .order('created_at_ms', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(dbRowToRecurringIncome);
}

export async function upsertRecurringIncome(userId: string, item: RecurringIncome): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('recurring_income').upsert({
    id: item.id,
    user_id: userId,
    name: item.name,
    amount: item.amount,
    frequency: item.frequency,
    next_payment_date: item.nextPaymentDate,
    category: item.category,
    is_active: item.isActive,
    notes: item.notes ?? null,
    created_at_ms: item.createdAt,
  });
  if (error) throw error;
}

export async function deleteRecurringIncome(userId: string, id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('recurring_income')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

// ─── MEMBERSHIP ──────────────────────────────────────────────────────────────

export async function loadMembership(userId: string): Promise<MembershipState | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from('memberships')
    .select('plan, created_at')
    .eq('user_id', userId)
    .single();
  if (!data) return null;
  return { plan: data.plan as PremiumPlan, startedAt: data.created_at };
}

export async function saveMembership(userId: string, plan: PremiumPlan): Promise<void> {
  if (!supabase) return;
  await supabase.from('memberships').upsert({
    user_id: userId,
    plan,
    updated_at: new Date().toISOString(),
  });
}

// ─── COMMUNITY ───────────────────────────────────────────────────────────────

/** Fetch all communities the user belongs to, including member lists. */
export async function fetchUserCommunities(userId: string): Promise<Community[]> {
  if (!supabase) return [];

  // Get community IDs for this user
  const { data: memberships, error: memErr } = await supabase
    .from('community_members')
    .select('community_id, user_id, role, joined_at')
    .eq('user_id', userId);
  if (memErr || !memberships?.length) return [];

  const communityIds = memberships.map(m => m.community_id as string);

  // Get community metadata
  const { data: communityRows } = await supabase
    .from('communities')
    .select('id, name, description, invite_code, creator_id, privacy, created_at')
    .in('id', communityIds);
  if (!communityRows?.length) return [];

  // Get member profiles (display names + shared scores) — requires migration v4
  let profileRows: Record<string, unknown>[] = [];
  try {
    const { data } = await supabase
      .from('community_profiles')
      .select('community_id, user_id, display_name, shared_score')
      .in('community_id', communityIds);
    profileRows = (data ?? []) as Record<string, unknown>[];
  } catch { /* migration v4 not yet run — skip */ }

  return communityRows.map(row => {
    const userMem = memberships.find(m => m.community_id === row.id);
    const communityProfiles = profileRows.filter(p => p.community_id === row.id);

    const members: CommunityMember[] = communityProfiles.map(p => ({
      userId:       p.user_id as string,
      displayName:  (p.display_name as string) || 'Member',
      role:         (memberships.find(m => m.community_id === row.id && m.user_id === p.user_id)?.role ?? 'member') as 'admin' | 'member',
      joinedAt:     (memberships.find(m => m.community_id === row.id && m.user_id === p.user_id)?.joined_at as string) ?? new Date().toISOString(),
      sharedScore:  p.shared_score as number | null,
    }));

    return {
      id:          row.id as string,
      name:        row.name as string,
      description: (row.description as string) ?? '',
      inviteCode:  row.invite_code as string,
      creatorId:   row.creator_id as string,
      privacy:     (row.privacy as 'public' | 'invite') ?? 'invite',
      createdAt:   row.created_at as string,
      role:        (userMem?.role ?? 'member') as 'admin' | 'member',
      members,
      challenges:  [],   // challenges live in localStorage (migration v4 needed for full sync)
    };
  });
}

/** Create a community in Supabase and join as admin. */
export async function createCommunityInDB(
  userId: string,
  community: Community,
  displayName: string,
  sharedScore: number | null,
): Promise<void> {
  if (!supabase) return;

  await supabase.from('communities').insert({
    id:          community.id,
    name:        community.name,
    description: community.description,
    invite_code: community.inviteCode,
    creator_id:  userId,
    privacy:     community.privacy,
  }).throwOnError();

  await supabase.from('community_members').insert({
    community_id: community.id,
    user_id:      userId,
    role:         'admin',
  }).throwOnError();

  // community_profiles requires migration v4 — graceful skip if not present
  try {
    await supabase.from('community_profiles').upsert({
      community_id: community.id,
      user_id:      userId,
      display_name: displayName,
      shared_score: sharedScore,
      updated_at:   new Date().toISOString(),
    });
  } catch { /* migration v4 not yet run */ }
}

/** Look up a community by invite code and join it. Returns the Community or null if not found. */
export async function joinCommunityByCode(
  userId: string,
  inviteCode: string,
  displayName: string,
  sharedScore: number | null,
): Promise<Community | null> {
  if (!supabase) return null;

  // Find community
  const { data: row } = await supabase
    .from('communities')
    .select('id, name, description, invite_code, creator_id, privacy, created_at')
    .eq('invite_code', inviteCode.toUpperCase())
    .single();
  if (!row) return null;

  const communityId = row.id as string;

  // Check if already a member
  const { data: existing } = await supabase
    .from('community_members')
    .select('user_id')
    .eq('community_id', communityId)
    .eq('user_id', userId)
    .single();
  if (!existing) {
    await supabase.from('community_members').insert({
      community_id: communityId,
      user_id:      userId,
      role:         'member',
    });
  }

  // Upsert community profile
  try {
    await supabase.from('community_profiles').upsert({
      community_id: communityId,
      user_id:      userId,
      display_name: displayName,
      shared_score: sharedScore,
      updated_at:   new Date().toISOString(),
    });
  } catch { /* migration v4 not yet run */ }

  // Load all member profiles
  let profileRows: Record<string, unknown>[] = [];
  try {
    const { data } = await supabase
      .from('community_profiles')
      .select('user_id, display_name, shared_score')
      .eq('community_id', communityId);
    profileRows = (data ?? []) as Record<string, unknown>[];
  } catch {}

  const { data: memberRows } = await supabase
    .from('community_members')
    .select('user_id, role, joined_at')
    .eq('community_id', communityId);

  const members: CommunityMember[] = (memberRows ?? []).map(m => {
    const profile = profileRows.find(p => p.user_id === m.user_id);
    return {
      userId:      m.user_id as string,
      displayName: (profile?.display_name as string) ?? 'Member',
      role:        (m.role as 'admin' | 'member') ?? 'member',
      joinedAt:    m.joined_at as string,
      sharedScore: (profile?.shared_score as number | null) ?? null,
    };
  });

  return {
    id:          communityId,
    name:        row.name as string,
    description: (row.description as string) ?? '',
    inviteCode:  row.invite_code as string,
    creatorId:   row.creator_id as string,
    privacy:     (row.privacy as 'public' | 'invite') ?? 'invite',
    createdAt:   row.created_at as string,
    role:        'member',
    members,
    challenges:  [],
  };
}

/** Sync user's shared score/name to community_profiles. */
export async function updateCommunityProfile(
  communityId: string,
  userId: string,
  displayName: string,
  sharedScore: number | null,
): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('community_profiles').upsert({
      community_id: communityId,
      user_id:      userId,
      display_name: displayName,
      shared_score: sharedScore,
      updated_at:   new Date().toISOString(),
    });
  } catch {}
}

// ─── BULK LOAD ────────────────────────────────────────────────────────────────

export interface AllUserData {
  transactions: Transaction[];
  savingGoals: SavingGoal[];
  subscriptions: Subscription[];
  recurringIncome: RecurringIncome[];
  preferences: DbPreferences | null;
  profile: ProfileData | null;
  membership: MembershipState | null;
}

export async function loadAllUserData(userId: string): Promise<AllUserData> {
  const [txR, goalsR, subsR, riR, prefsR, profileR, memberR] = await Promise.allSettled([
    fetchTransactions(userId),
    fetchSavingGoals(userId),
    fetchSubscriptions(userId),
    fetchRecurringIncome(userId),
    loadUserPreferences(userId),
    loadProfile(userId),
    loadMembership(userId),
  ]);

  return {
    transactions: txR.status === 'fulfilled' ? txR.value : [],
    savingGoals: goalsR.status === 'fulfilled' ? goalsR.value : [],
    subscriptions: subsR.status === 'fulfilled' ? subsR.value : [],
    recurringIncome: riR.status === 'fulfilled' ? riR.value : [],
    preferences: prefsR.status === 'fulfilled' ? prefsR.value : null,
    profile: profileR.status === 'fulfilled' ? profileR.value : null,
    membership: memberR.status === 'fulfilled' ? memberR.value : null,
  };
}

// ─── GUEST DATA MIGRATION ──────────────────────────────────────────────────────

export async function migrateGuestData(
  userId: string,
  guest: {
    transactions: Transaction[];
    monthlyBudget: number;
    categoryLimits: CategoryLimit[];
    savingGoals: SavingGoal[];
    subscriptions: Subscription[];
    currency: string;
    userName: string;
  }
): Promise<void> {
  if (!supabase) return;

  // Profile + preferences first
  await Promise.allSettled([
    saveProfile(userId, { name: guest.userName || '', currency: guest.currency }),
    saveUserPreferences(userId, {
      monthly_budget: guest.monthlyBudget,
      category_limits: guest.categoryLimits,
      currency: guest.currency,
    }),
  ]);

  // Transactions — skip conflicts (existing cloud entries take precedence)
  for (const tx of guest.transactions) {
    await insertTransaction(userId, tx).catch(() => {/* duplicate — skip */});
  }

  // Goals + subscriptions (replace)
  await Promise.allSettled([
    replaceSavingGoals(userId, guest.savingGoals),
    replaceSubscriptions(userId, guest.subscriptions),
  ]);
}
