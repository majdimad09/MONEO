import { Transaction, Subscription, CategoryLimit, SavingGoal, RecurringIncome } from '../types/finance';
import { formatCurrency } from './formatters';

function toMonthlyIncome(items: RecurringIncome[]): number {
  return items.filter(r => r.isActive).reduce((sum, r) => {
    if (r.frequency === 'weekly') return sum + (r.amount * 52) / 12;
    if (r.frequency === 'biweekly') return sum + (r.amount * 26) / 12;
    return sum + r.amount;
  }, 0);
}

function getMonthPrefix(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getPrevMonthPrefix(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return getMonthPrefix(d);
}

// ─── SMART GREETING ──────────────────────────────────────────────────────────

export function getGreeting(userName?: string): string {
  const h = new Date().getHours();
  const period = h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
  return userName ? `Good ${period}, ${userName}` : `Good ${period}`;
}

// ─── INSIGHTS ────────────────────────────────────────────────────────────────

export type InsightType = 'positive' | 'warning' | 'neutral' | 'info';
export type InsightIcon = 'trending-up' | 'trending-down' | 'alert' | 'info' | 'sparkle' | 'calendar' | 'piggy' | 'fire' | 'zap';

export interface Insight {
  id: string;
  text: string;
  type: InsightType;
  icon: InsightIcon;
}

export function generateInsights(
  transactions: Transaction[],
  currency: string,
  subscriptions: Subscription[],
  recurringIncome: RecurringIncome[] = []
): Insight[] {
  const insights: Insight[] = [];
  const now = new Date();
  const thisMonth = getMonthPrefix();
  const prevMonth = getPrevMonthPrefix();

  const thisMonthTx = transactions.filter(t => t.date.startsWith(thisMonth));
  const prevMonthTx = transactions.filter(t => t.date.startsWith(prevMonth));

  const thisIncome = thisMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) + toMonthlyIncome(recurringIncome);
  const thisExpenses = thisMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const prevExpenses = prevMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // 1. Month-over-month spending
  if (prevExpenses > 0 && thisExpenses > 0) {
    const pct = ((thisExpenses - prevExpenses) / prevExpenses) * 100;
    if (pct > 10) {
      insights.push({ id: 'mom-up', text: `You're spending ${pct.toFixed(0)}% more this month than last.`, type: 'warning', icon: 'trending-up' });
    } else if (pct < -10) {
      insights.push({ id: 'mom-down', text: `Spending down ${Math.abs(pct).toFixed(0)}% vs last month. Nice work!`, type: 'positive', icon: 'trending-down' });
    }
  }

  // 2. Biggest category spike
  if (prevMonthTx.length > 0 && thisMonthTx.length > 0) {
    const thisMap: Record<string, number> = {};
    const prevMap: Record<string, number> = {};
    thisMonthTx.filter(t => t.type === 'expense').forEach(t => { thisMap[t.category] = (thisMap[t.category] || 0) + t.amount; });
    prevMonthTx.filter(t => t.type === 'expense').forEach(t => { prevMap[t.category] = (prevMap[t.category] || 0) + t.amount; });
    let worstCat = ''; let worstPct = 25;
    Object.entries(thisMap).forEach(([cat, cur]) => {
      const prev = prevMap[cat];
      if (prev && prev > 0) {
        const pct = ((cur - prev) / prev) * 100;
        if (pct > worstPct) { worstPct = pct; worstCat = cat; }
      }
    });
    if (worstCat) {
      insights.push({
        id: 'cat-spike',
        text: `${worstCat} is up ${worstPct.toFixed(0)}% vs last month (${formatCurrency(thisMap[worstCat], currency)}).`,
        type: 'warning', icon: 'alert',
      });
    }
  }

  // 3. Subscription cost
  const activeSubs = subscriptions.filter(s => s.isActive);
  if (activeSubs.length >= 2) {
    const monthly = activeSubs.reduce((s, sub) => {
      if (sub.frequency === 'yearly') return s + sub.amount / 12;
      if (sub.frequency === 'weekly') return s + (sub.amount * 52) / 12;
      return s + sub.amount;
    }, 0);
    insights.push({ id: 'subs-cost', text: `Your ${activeSubs.length} subscriptions cost ${formatCurrency(monthly, currency)}/month.`, type: 'info', icon: 'calendar' });
  }

  // 4. Weekend vs weekday spending
  const expTx = transactions.filter(t => t.type === 'expense');
  if (expTx.length >= 12) {
    const days: Record<string, { total: number; isWeekend: boolean }> = {};
    expTx.forEach(t => {
      const d = new Date(t.date + 'T12:00:00');
      const we = d.getDay() === 0 || d.getDay() === 6;
      if (!days[t.date]) days[t.date] = { total: 0, isWeekend: we };
      days[t.date].total += t.amount;
    });
    const weDays = Object.values(days).filter(d => d.isWeekend);
    const wdDays = Object.values(days).filter(d => !d.isWeekend);
    if (weDays.length >= 4 && wdDays.length >= 4) {
      const weAvg = weDays.reduce((s, d) => s + d.total, 0) / weDays.length;
      const wdAvg = wdDays.reduce((s, d) => s + d.total, 0) / wdDays.length;
      if (weAvg > wdAvg * 1.4) {
        insights.push({
          id: 'weekend', text: `You spend ${((weAvg / wdAvg - 1) * 100).toFixed(0)}% more on weekends than weekdays.`,
          type: 'neutral', icon: 'calendar',
        });
      }
    }
  }

  // 5. Savings projection
  if (thisIncome > 0 && thisExpenses < thisIncome) {
    const saved = thisIncome - thisExpenses;
    const day = now.getDate();
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const projected = (saved / day) * days;
    insights.push({ id: 'savings', text: `On track to save ${formatCurrency(projected, currency)} this month!`, type: 'positive', icon: 'piggy' });
  }

  // 6. Low-spend week
  if (expTx.length >= 10) {
    const d7 = new Date(); d7.setDate(d7.getDate() - 7);
    const d14 = new Date(); d14.setDate(d14.getDate() - 14);
    const last7 = expTx.filter(t => new Date(t.date + 'T12:00:00') >= d7).reduce((s, t) => s + t.amount, 0);
    const prev7 = expTx.filter(t => { const d = new Date(t.date + 'T12:00:00'); return d >= d14 && d < d7; }).reduce((s, t) => s + t.amount, 0);
    if (prev7 > 0 && last7 < prev7 * 0.75 && last7 > 0) {
      insights.push({
        id: 'low-week', text: `Last 7 days were ${((1 - last7/prev7)*100).toFixed(0)}% cheaper than the previous week.`,
        type: 'positive', icon: 'fire',
      });
    }
  }

  return insights.slice(0, 4);
}

// ─── MONEO SCORE ─────────────────────────────────────────────────────────────

export interface ScoreFactor {
  label: string;
  points: number;
  maxPoints: number;
  description: string;
  color: string;
}

export interface ScoreLevel {
  name: string;
  min: number;
  max: number;
  color: string;
}

export const SCORE_LEVELS: ScoreLevel[] = [
  { name: 'Getting Started', min: 0,  max: 30,  color: '#ef4444' },
  { name: 'Building Up',     min: 31, max: 50,  color: '#f97316' },
  { name: 'On Track',        min: 51, max: 70,  color: '#eab308' },
  { name: 'Doing Well',      min: 71, max: 85,  color: '#3b82f6' },
  { name: 'Excellent',       min: 86, max: 100, color: '#10b981' },
];

export function getScoreLevel(score: number): ScoreLevel {
  return SCORE_LEVELS.find(l => score >= l.min && score <= l.max) ?? SCORE_LEVELS[0];
}

export function getNextScoreLevel(score: number): ScoreLevel | null {
  const idx = SCORE_LEVELS.findIndex(l => score >= l.min && score <= l.max);
  return idx < SCORE_LEVELS.length - 1 ? SCORE_LEVELS[idx + 1] : null;
}

export interface ScoreResult {
  score: number;
  grade: string;
  color: string;
  summary: string;
  factors: ScoreFactor[];
  hasEnoughData: boolean;
  missingDataHints: string[];
}

const MIN_TX_FOR_SCORE = 3;

export function calculateCashlyScore(
  transactions: Transaction[],
  monthlyBudget: number,
  categoryLimits: CategoryLimit[],
  subscriptions: Subscription[],
  savingGoals: SavingGoal[] = [],
  recurringIncome: RecurringIncome[] = []
): ScoreResult {
  const thisMonth = getMonthPrefix();
  const monthExp = transactions.filter(t => t.type === 'expense' && t.date.startsWith(thisMonth));
  const monthInc = transactions.filter(t => t.type === 'income' && t.date.startsWith(thisMonth));
  const income = monthInc.reduce((s, t) => s + t.amount, 0) + toMonthlyIncome(recurringIncome);
  const expenses = monthExp.reduce((s, t) => s + t.amount, 0);

  // Check if user has enough data for a meaningful score
  const hasEnoughData = transactions.length >= MIN_TX_FOR_SCORE;
  const missingDataHints: string[] = [];
  if (transactions.length === 0) missingDataHints.push('Add your first transactions');
  else if (transactions.length < MIN_TX_FOR_SCORE) missingDataHints.push(`Add ${MIN_TX_FOR_SCORE - transactions.length} more transaction${MIN_TX_FOR_SCORE - transactions.length > 1 ? 's' : ''}`);
  if (income === 0) missingDataHints.push('Record income for this month');
  if (monthlyBudget === 0) missingDataHints.push('Set a monthly spending budget');
  if (categoryLimits.length === 0) missingDataHints.push('Add category spending limits');

  if (!hasEnoughData) {
    return {
      score: 0, grade: 'Getting Started', color: '#ef4444',
      summary: 'Add more transactions so Moneo can calculate your score.',
      factors: [], hasEnoughData: false, missingDataHints,
    };
  }

  const factors: ScoreFactor[] = [];
  let total = 0;

  // 1. Spending vs Income (25 pts) — not penalizing goals or saving style
  {
    let pts = income > 0
      ? (() => { const r = expenses / income; return r <= 0.6 ? 25 : r <= 0.75 ? 20 : r <= 0.9 ? 14 : r <= 1.0 ? 8 : 3; })()
      : transactions.length > 0 ? 10 : 5;
    const ratio = income > 0 ? (expenses / income * 100).toFixed(0) : null;
    factors.push({
      label: 'Spending vs Income', points: pts, maxPoints: 25,
      description: income > 0
        ? `Spending ${ratio}% of this month's income`
        : 'No income recorded this month',
      color: pts >= 20 ? '#10b981' : pts >= 14 ? '#3b82f6' : pts >= 8 ? '#f59e0b' : '#ef4444',
    });
    total += pts;
  }

  // 2. Spending Control (20 pts) — category limits adherence + income ratio
  {
    let pts = 10; // neutral default
    if (categoryLimits.length > 0) {
      const catMap: Record<string, number> = {};
      monthExp.forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
      const exceeded = categoryLimits.filter(l => (catMap[l.category] || 0) > l.limit).length;
      const r = exceeded / categoryLimits.length;
      pts = r === 0 ? 20 : r <= 0.2 ? 15 : r <= 0.5 ? 8 : 2;
    } else if (income > 0) {
      // No limits set — score based on expenses vs income
      const r = expenses / income;
      pts = r <= 0.5 ? 14 : r <= 0.7 ? 10 : r <= 0.9 ? 6 : 2;
    }
    const catMap: Record<string, number> = {};
    monthExp.forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
    const exceeded = categoryLimits.filter(l => (catMap[l.category] || 0) > l.limit).length;
    factors.push({
      label: 'Spending Control', points: pts, maxPoints: 20,
      description: categoryLimits.length > 0
        ? exceeded === 0 ? 'All category limits respected' : `${exceeded}/${categoryLimits.length} category limits exceeded`
        : 'Set category limits to improve this score',
      color: pts >= 15 ? '#10b981' : pts >= 10 ? '#3b82f6' : pts >= 6 ? '#f59e0b' : '#ef4444',
    });
    total += pts;
  }

  // 3. Budget Performance (20 pts)
  {
    let pts = 10; // neutral if no budget
    if (monthlyBudget > 0) {
      const r = expenses / monthlyBudget;
      pts = r <= 0.7 ? 20 : r <= 0.85 ? 16 : r <= 1.0 ? 10 : r <= 1.2 ? 4 : 0;
    }
    factors.push({
      label: 'Budget Performance', points: pts, maxPoints: 20,
      description: monthlyBudget > 0
        ? `Using ${((expenses / monthlyBudget) * 100).toFixed(0)}% of monthly budget`
        : 'Set a monthly budget to unlock this score',
      color: pts >= 16 ? '#10b981' : pts >= 10 ? '#f59e0b' : '#ef4444',
    });
    total += pts;
  }

  // 4. Financial Stability (15 pts) — month-to-month spending variance
  {
    const byMonth: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => { const m = t.date.slice(0, 7); byMonth[m] = (byMonth[m] || 0) + t.amount; });
    const vals = Object.values(byMonth);
    let pts = 8;
    if (vals.length >= 2) {
      const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
      const std = Math.sqrt(vals.reduce((s, v) => s + (v - avg) ** 2, 0) / vals.length);
      const cv = avg > 0 ? std / avg : 1;
      pts = cv <= 0.1 ? 15 : cv <= 0.2 ? 12 : cv <= 0.35 ? 8 : cv <= 0.5 ? 4 : 1;
    }
    factors.push({
      label: 'Financial Stability', points: pts, maxPoints: 15,
      description: vals.length < 2 ? 'Need 2+ months of data for stability score' : pts >= 12 ? 'Very consistent month-to-month spending' : 'High variance between months',
      color: pts >= 12 ? '#10b981' : pts >= 8 ? '#f59e0b' : '#ef4444',
    });
    total += pts;
  }

  // 5. Recurring Commitments (10 pts)
  {
    const active = subscriptions.filter(s => s.isActive);
    const monthly = active.reduce((s, sub) => {
      if (sub.frequency === 'yearly') return s + sub.amount / 12;
      if (sub.frequency === 'weekly') return s + (sub.amount * 52) / 12;
      return s + sub.amount;
    }, 0);
    let pts = income > 0
      ? (() => { const r = monthly / income; return r <= 0.05 ? 10 : r <= 0.1 ? 8 : r <= 0.2 ? 5 : r <= 0.3 ? 2 : 0; })()
      : active.length === 0 ? 10 : 6;
    factors.push({
      label: 'Recurring Commitments', points: pts, maxPoints: 10,
      description: monthly > 0
        ? `${active.length} active · ${income > 0 ? `${((monthly/income)*100).toFixed(0)}% of income` : 'tracked'}`
        : active.length === 0 ? 'No recurring payments tracked' : 'All subscriptions tracked',
      color: pts >= 8 ? '#10b981' : pts >= 5 ? '#f59e0b' : '#ef4444',
    });
    total += pts;
  }

  // 6. Goal Progress (10 pts)
  {
    let pts = 5; // neutral if no goals
    if (savingGoals.length > 0) {
      const avgProgress = savingGoals.reduce((s, g) => s + (g.targetAmount > 0 ? Math.min(g.currentAmount / g.targetAmount, 1) : 0), 0) / savingGoals.length;
      pts = avgProgress >= 0.8 ? 10 : avgProgress >= 0.5 ? 8 : avgProgress >= 0.25 ? 5 : 3;
    }
    const completedGoals = savingGoals.filter(g => g.currentAmount >= g.targetAmount).length;
    factors.push({
      label: 'Goal Progress', points: pts, maxPoints: 10,
      description: savingGoals.length === 0 ? 'Create savings goals to track progress' : `${completedGoals}/${savingGoals.length} goals completed`,
      color: pts >= 8 ? '#10b981' : pts >= 5 ? '#f59e0b' : '#ef4444',
    });
    total += pts;
  }

  const score = Math.min(100, Math.max(0, total));
  const level = getScoreLevel(score);
  const grade = level.name;
  const color = level.color;

  const summary = score >= 86 ? 'Outstanding! Your finances are in excellent shape.'
    : score >= 71 ? 'Great habits. A few tweaks could push you to excellent.'
    : score >= 51 ? 'Solid foundation. Focus on your budget and savings rate.'
    : score >= 31 ? 'You\'re building momentum. Keep tracking and improving.'
    : 'Start with a monthly budget and log every transaction.';

  return { score, grade, color, summary, factors, hasEnoughData: true, missingDataHints };
}

// ─── SAFE TO SPEND ───────────────────────────────────────────────────────────

export interface SafeToSpendResult {
  safeAmount: number;
  income: number;
  expenses: number;
  subsRemaining: number;
  savingsBuffer: number;
}

export function calculateSafeToSpend(
  transactions: Transaction[],
  subscriptions: Subscription[],
  savingsBuffer = 0,
  recurringIncome: RecurringIncome[] = []
): SafeToSpendResult {
  const now = new Date();
  const thisMonth = getMonthPrefix();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const monthTx = transactions.filter(t => t.date.startsWith(thisMonth));
  const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) + toMonthlyIncome(recurringIncome);
  const expenses = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  let subsRemaining = 0;
  subscriptions.filter(s => s.isActive).forEach(sub => {
    const next = new Date(sub.nextPaymentDate);
    if (next >= now && next <= endOfMonth) subsRemaining += sub.amount;
  });

  const safeAmount = Math.max(0, income - expenses - subsRemaining - savingsBuffer);
  return { safeAmount, income, expenses, subsRemaining, savingsBuffer };
}
