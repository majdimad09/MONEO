import { EarnProgress, EarnStatus } from '../types/finance';

const KEY = 'moneo-earn-progress';
const STEP_KEY = 'moneo-earn-steps';

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
  extra?: Partial<EarnProgress>,
): EarnProgress[] {
  const existing = progress.find(p => p.opportunityId === opportunityId);
  const now = Date.now();
  if (existing) {
    return progress.map(p =>
      p.opportunityId === opportunityId
        ? { ...p, status, lastActivityAt: now, ...extra }
        : p,
    );
  }
  return [...progress, {
    opportunityId,
    status,
    savedAt: now,
    startedAt: status === 'in-progress' ? now : undefined,
    lastActivityAt: now,
    completedSteps: [],
    streakDays: 0,
    ...extra,
  }];
}

export function removeEarnProgress(
  progress: EarnProgress[],
  opportunityId: string,
): EarnProgress[] {
  return progress.filter(p => p.opportunityId !== opportunityId);
}

// ── Step completion ────────────────────────────────────────────────────────────

interface StepMap {
  [opportunityId: string]: number[];
}

function loadStepMap(): StepMap {
  try {
    return JSON.parse(localStorage.getItem(STEP_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveStepMap(map: StepMap): void {
  localStorage.setItem(STEP_KEY, JSON.stringify(map));
}

export function getCompletedSteps(opportunityId: string): number[] {
  return loadStepMap()[opportunityId] || [];
}

export function toggleStep(opportunityId: string, stepIndex: number): number[] {
  const map = loadStepMap();
  const steps = map[opportunityId] || [];
  const idx = steps.indexOf(stepIndex);
  if (idx === -1) {
    map[opportunityId] = [...steps, stepIndex].sort((a, b) => a - b);
  } else {
    map[opportunityId] = steps.filter(s => s !== stepIndex);
  }
  saveStepMap(map);
  return map[opportunityId];
}

export function clearSteps(opportunityId: string): void {
  const map = loadStepMap();
  delete map[opportunityId];
  saveStepMap(map);
}

// ── Streak ─────────────────────────────────────────────────────────────────────

const STREAK_KEY = 'moneo-earn-streak';

interface StreakData {
  [opportunityId: string]: {
    lastDate: string;
    days: number;
  };
}

function loadStreaks(): StreakData {
  try {
    return JSON.parse(localStorage.getItem(STREAK_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveStreaks(data: StreakData): void {
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

export function updateStreak(opportunityId: string): number {
  const streaks = loadStreaks();
  const today = new Date().toISOString().split('T')[0];
  const entry = streaks[opportunityId];

  if (!entry) {
    streaks[opportunityId] = { lastDate: today, days: 1 };
    saveStreaks(streaks);
    return 1;
  }

  const last = new Date(entry.lastDate);
  const now = new Date(today);
  const diffDays = Math.floor((now.getTime() - last.getTime()) / 86400000);

  if (diffDays === 0) return entry.days; // already updated today
  if (diffDays === 1) {
    streaks[opportunityId] = { lastDate: today, days: entry.days + 1 };
    saveStreaks(streaks);
    return entry.days + 1;
  }
  // Streak broken
  streaks[opportunityId] = { lastDate: today, days: 1 };
  saveStreaks(streaks);
  return 1;
}

export function getStreak(opportunityId: string): number {
  return loadStreaks()[opportunityId]?.days || 0;
}
