import { useState, useEffect, useCallback } from 'react';
import { MembershipState, PremiumPlan } from '../types/finance';
import { loadMembership, saveMembership } from '../lib/supabaseService';

const LS_KEY = 'moneo_membership_v1';

function loadLocal(): MembershipState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { plan: 'free', startedAt: null };
}

function saveLocal(state: MembershipState): void {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

export function usePremium(userId: string | undefined) {
  const [membership, setMembership] = useState<MembershipState>(loadLocal);

  useEffect(() => {
    if (!userId) { setMembership(loadLocal()); return; }
    loadMembership(userId).then(data => {
      if (data) { setMembership(data); saveLocal(data); }
    }).catch(() => { /* use localStorage fallback */ });
  }, [userId]);

  const upgradeToPremium = useCallback(async () => {
    const next: MembershipState = { plan: 'premium', startedAt: new Date().toISOString() };
    setMembership(next);
    saveLocal(next);
    if (userId) await saveMembership(userId, 'premium').catch(() => {});
  }, [userId]);

  const cancelPremium = useCallback(async () => {
    const next: MembershipState = { plan: 'free', startedAt: null };
    setMembership(next);
    saveLocal(next);
    if (userId) await saveMembership(userId, 'free').catch(() => {});
  }, [userId]);

  return {
    isPremium: membership.plan === 'premium',
    membership,
    upgradeToPremium,
    cancelPremium,
  };
}
