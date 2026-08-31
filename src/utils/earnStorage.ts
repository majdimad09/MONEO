import { EarnProgress, EarnStatus } from '../types/finance';

const KEY = 'moneo-earn-progress';

export function loadEarnProgress(): EarnProgress[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveEarnProgress(progress: EarnProgress[]): void {
  localStorage.setItem(KEY, JSON.stringify(progress));
}

export function upsertEarnProgress(
  progress: EarnProgress[],
  opportunityId: string,
  status: EarnStatus,
): EarnProgress[] {
  const existing = progress.find(p => p.opportunityId === opportunityId);
  if (existing) {
    return progress.map(p =>
      p.opportunityId === opportunityId ? { ...p, status } : p,
    );
  }
  return [...progress, { opportunityId, status, savedAt: Date.now() }];
}

export function removeEarnProgress(
  progress: EarnProgress[],
  opportunityId: string,
): EarnProgress[] {
  return progress.filter(p => p.opportunityId !== opportunityId);
}
