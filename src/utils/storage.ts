import { Transaction, CategoryLimit, SavingGoal, Subscription, RecurringIncome } from '../types/finance';

const STORAGE_KEY = 'cashly_transactions_v1';
const CURRENCY_KEY = 'cashly_selected_currency_v1';
const BUDGET_KEY = 'cashly_monthly_budget_v1';
const LIMITS_KEY = 'cashly_category_limits_v1';
const GOALS_KEY = 'cashly_saving_goals_v1';
const SUBSCRIPTIONS_KEY = 'cashly_subscriptions_v1';
const USERNAME_KEY = 'cashly_username_v1';

export const SAMPLE_TRANSACTIONS: Transaction[] = [
  { id: 'sample-1', type: 'income', amount: 3500, description: 'Monthly Salary', category: 'Salary', date: '2026-08-01', createdAt: Date.now() - 86400000 * 18 },
  { id: 'sample-2', type: 'expense', amount: 900, description: 'Apartment Rent', category: 'Rent', date: '2026-08-02', createdAt: Date.now() - 86400000 * 17 },
  { id: 'sample-3', type: 'expense', amount: 450, description: 'Supermarket & Groceries', category: 'Groceries', date: '2026-08-05', createdAt: Date.now() - 86400000 * 14 },
  { id: 'sample-4', type: 'expense', amount: 170, description: 'Dinner & Drinks with Friends', category: 'Food', date: '2026-08-10', createdAt: Date.now() - 86400000 * 9 },
  { id: 'sample-5', type: 'expense', amount: 120, description: 'Monthly Metro & Bus Pass', category: 'Transport', date: '2026-08-12', createdAt: Date.now() - 86400000 * 7 },
  { id: 'sample-6', type: 'expense', amount: 110, description: 'Electricity & Internet Bill', category: 'Bills', date: '2026-08-14', createdAt: Date.now() - 86400000 * 5 },
  { id: 'sample-7', type: 'expense', amount: 100, description: 'Cinema tickets & Streaming', category: 'Entertainment', date: '2026-08-16', createdAt: Date.now() - 86400000 * 3 },
  { id: 'sample-8', type: 'income', amount: 450, description: 'Freelance Web Design Project', category: 'Freelance', date: '2026-08-17', createdAt: Date.now() - 86400000 * 2 },
  { id: 'sample-9', type: 'expense', amount: 85, description: 'New Running Shoes', category: 'Shopping', date: '2026-07-10', createdAt: Date.now() - 86400000 * 40 },
  { id: 'sample-10', type: 'income', amount: 3500, description: 'Monthly Salary', category: 'Salary', date: '2026-07-01', createdAt: Date.now() - 86400000 * 50 },
  { id: 'sample-11', type: 'expense', amount: 900, description: 'Apartment Rent', category: 'Rent', date: '2026-07-02', createdAt: Date.now() - 86400000 * 49 },
  { id: 'sample-12', type: 'expense', amount: 380, description: 'Groceries', category: 'Groceries', date: '2026-07-08', createdAt: Date.now() - 86400000 * 43 },
  { id: 'sample-13', type: 'expense', amount: 140, description: 'Restaurant visits', category: 'Food', date: '2026-07-15', createdAt: Date.now() - 86400000 * 36 },
  { id: 'sample-14', type: 'expense', amount: 95, description: 'Bus & Metro', category: 'Transport', date: '2026-07-12', createdAt: Date.now() - 86400000 * 39 },
];

// --- Transactions ---
export function loadTransactions(): Transaction[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* ignore */ }
  return [];
}
export function saveTransactions(transactions: Transaction[]): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)); } catch { /* ignore */ }
}

// --- Currency ---
export function loadSavedCurrency(): string {
  try { return localStorage.getItem(CURRENCY_KEY) || 'USD'; } catch { return 'USD'; }
}
export function saveSelectedCurrency(code: string): void {
  try { localStorage.setItem(CURRENCY_KEY, code); } catch { /* ignore */ }
}

// --- Monthly Budget ---
export function loadMonthlyBudget(): number {
  try {
    const v = localStorage.getItem(BUDGET_KEY);
    return v ? parseFloat(v) : 0;
  } catch { return 0; }
}
export function saveMonthlyBudget(amount: number): void {
  try { localStorage.setItem(BUDGET_KEY, amount.toString()); } catch { /* ignore */ }
}

// --- Category Limits ---
export function loadCategoryLimits(): CategoryLimit[] {
  try {
    const v = localStorage.getItem(LIMITS_KEY);
    return v ? JSON.parse(v) : [];
  } catch { return []; }
}
export function saveCategoryLimits(limits: CategoryLimit[]): void {
  try { localStorage.setItem(LIMITS_KEY, JSON.stringify(limits)); } catch { /* ignore */ }
}

// --- Saving Goals ---
export function loadSavingGoals(): SavingGoal[] {
  try {
    const v = localStorage.getItem(GOALS_KEY);
    return v ? JSON.parse(v) : [];
  } catch { return []; }
}
export function saveSavingGoals(goals: SavingGoal[]): void {
  try { localStorage.setItem(GOALS_KEY, JSON.stringify(goals)); } catch { /* ignore */ }
}

// --- Subscriptions ---
export function loadSubscriptions(): Subscription[] {
  try {
    const v = localStorage.getItem(SUBSCRIPTIONS_KEY);
    return v ? JSON.parse(v) : [];
  } catch { return []; }
}
export function saveSubscriptions(subs: Subscription[]): void {
  try { localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subs)); } catch { /* ignore */ }
}

// --- Recurring Income ---
const RECURRING_INCOME_KEY = 'moneo_recurring_income_v1';
export function loadRecurringIncome(): RecurringIncome[] {
  try {
    const v = localStorage.getItem(RECURRING_INCOME_KEY);
    return v ? JSON.parse(v) : [];
  } catch { return []; }
}
export function saveRecurringIncome(items: RecurringIncome[]): void {
  try { localStorage.setItem(RECURRING_INCOME_KEY, JSON.stringify(items)); } catch { /* ignore */ }
}

// --- User Name ---
export function loadUserName(): string {
  try { return localStorage.getItem(USERNAME_KEY) || ''; } catch { return ''; }
}
export function saveUserName(name: string): void {
  try { localStorage.setItem(USERNAME_KEY, name); } catch { /* ignore */ }
}

// --- CSV Export ---
export function exportTransactionsToCSV(transactions: Transaction[], currencyCode = 'USD'): void {
  const headers = ['ID', 'Type', 'Description', 'Category', 'Date', 'Amount', 'Currency'];
  const rows = transactions.map((t) => [
    t.id, t.type,
    `"${t.description.replace(/"/g, '""')}"`,
    `"${t.category.replace(/"/g, '""')}"`,
    t.date, t.amount.toFixed(2), currencyCode,
  ]);
  const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csv));
  link.setAttribute('download', `moneo_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
