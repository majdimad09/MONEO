/**
 * Supabase data operations for Cashly.
 * All functions check for null supabase client and are safe to call even
 * when Supabase is not configured — they simply return empty/no-op results.
 */

import { supabase } from './supabase';
import { Transaction, CategoryLimit, SavingGoal, Subscription } from '../types/finance';

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

// ─── BULK LOAD ────────────────────────────────────────────────────────────────

export interface AllUserData {
  transactions: Transaction[];
  savingGoals: SavingGoal[];
  subscriptions: Subscription[];
  preferences: DbPreferences | null;
  profile: ProfileData | null;
}

export async function loadAllUserData(userId: string): Promise<AllUserData> {
  const [txR, goalsR, subsR, prefsR, profileR] = await Promise.allSettled([
    fetchTransactions(userId),
    fetchSavingGoals(userId),
    fetchSubscriptions(userId),
    loadUserPreferences(userId),
    loadProfile(userId),
  ]);

  return {
    transactions: txR.status === 'fulfilled' ? txR.value : [],
    savingGoals: goalsR.status === 'fulfilled' ? goalsR.value : [],
    subscriptions: subsR.status === 'fulfilled' ? subsR.value : [],
    preferences: prefsR.status === 'fulfilled' ? prefsR.value : null,
    profile: profileR.status === 'fulfilled' ? profileR.value : null,
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
