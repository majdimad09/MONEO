import { AppView, MonthlyCheckIn, RecurringIncome, SavingGoal, Subscription } from '../types/finance';

export type SetupItemKey =
  | 'monthly-budget'
  | 'recurring-income'
  | 'recurring-expenses'
  | 'savings-goal'
  | 'upcoming-expenses';

export interface SetupItem {
  key: SetupItemKey;
  title: string;
  description: string;
  targetView: AppView | 'check-in';
  color: string;
}

// Priority order: most impactful first
export const SETUP_ITEMS: SetupItem[] = [
  {
    key: 'monthly-budget',
    title: 'Set your monthly budget',
    description: 'A budget helps Moneo understand how much you want to spend each month.',
    targetView: 'budget',
    color: '#8b5cf6',
  },
  {
    key: 'recurring-income',
    title: 'Add your recurring income',
    description: 'Knowing your regular income helps Moneo calculate your Safe to Spend more accurately.',
    targetView: 'recurring-income',
    color: '#10b981',
  },
  {
    key: 'recurring-expenses',
    title: 'Add your recurring expenses',
    description: 'Tell Moneo about your regular payments so they are included in your spending plan.',
    targetView: 'recurring',
    color: '#f97316',
  },
  {
    key: 'savings-goal',
    title: 'Set a savings goal',
    description: "If you're saving for something, Moneo can track your progress and include it in your plan.",
    targetView: 'savings',
    color: '#fbbf24',
  },
  {
    key: 'upcoming-expenses',
    title: 'Add an upcoming expense',
    description: 'Let Moneo know about anything big coming up so it can account for it.',
    targetView: 'check-in',
    color: '#06b6d4',
  },
];

export interface ReminderPersistedState {
  dismissed: SetupItemKey[];
  snoozed: Partial<Record<SetupItemKey, number>>;
}

const STORAGE_KEY = 'moneo-setup-reminders';
export const SNOOZE_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

export function loadReminderState(): ReminderPersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { dismissed: [], snoozed: {} };
    return JSON.parse(raw) as ReminderPersistedState;
  } catch {
    return { dismissed: [], snoozed: {} };
  }
}

export function saveReminderState(state: ReminderPersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

export interface SetupData {
  recurringIncome: RecurringIncome[];
  subscriptions: Subscription[];
  monthlyBudget: number;
  savingGoals: SavingGoal[];
  checkIn: MonthlyCheckIn | null;
}

export function computeMissingKeys(data: SetupData): SetupItemKey[] {
  const missing: SetupItemKey[] = [];
  if (data.monthlyBudget <= 0) missing.push('monthly-budget');
  if (data.recurringIncome.filter(r => r.isActive).length === 0) missing.push('recurring-income');
  if (data.subscriptions.filter(s => s.isActive).length === 0) missing.push('recurring-expenses');
  if (data.savingGoals.length === 0) missing.push('savings-goal');
  const hasUpcoming =
    data.checkIn &&
    !data.checkIn.skipped &&
    (data.checkIn.upcomingExpenses?.trim() ?? '').length > 0;
  if (!hasUpcoming) missing.push('upcoming-expenses');
  return missing;
}
