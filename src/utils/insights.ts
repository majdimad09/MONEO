import { Transaction, Subscription, CategoryLimit } from '../types/finance';
import { formatCurrency } from './formatters';

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
  subscriptions: Subscription[]
): Insight[] {
  const insights: Insight[] = [];
  const now = new Date();
  const thisMonth = getMonthPrefix();
  const prevMonth = getPrevMonthPrefix();

  const thisMonthTx = transactions.filter(t => t.date.startsWith(thisMonth));
  const prevMonthTx = transactions.filter(t => t.date.startsWith(prevMonth));

  const thisIncome = thisMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
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

// ─── CASHLY SCORE ────────────────────────────────────────────────────────────

export interface ScoreFactor {
  label: string;
  points: number;
  maxPoints: number;
  description: string;
  color: string;
}

export interface ScoreResult {
  score: number;
  grade: 'Excellent' | 'Good' | 'Fair' | 'Needs Work';
  color: string;
  summary: string;
  factors: ScoreFactor[];
}

export function calculateCashlyScore(
  transactions: Transaction[],
  monthlyBudget: number,
  categoryLimits: CategoryLimit[],
  subscriptions: Subscription[]
): ScoreResult {
  const thisMonth = getMonthPrefix();
  const monthExp = transactions.filter(t => t.type === 'expense' && t.date.startsWith(thisMonth));
  const monthInc = transactions.filter(t => t.type === 'income' && t.date.startsWith(thisMonth));
  const income = monthInc.reduce((s, t) => s + t.amount, 0);
  const expenses = monthExp.reduce((s, t) => s + t.amount, 0);

  const factors: ScoreFactor[] = [];
  let total = 0;

  // Savings rate (30 pts)
  {
    let pts = transactions.length === 0 ? 15 : income > 0
      ? (() => { const r = (income - expenses) / income; return r >= 0.2 ? 30 : r >= 0.1 ? 22 : r >= 0.05 ? 14 : r >= 0 ? 8 : 2; })()
      : 6;
    factors.push({
      label: 'Savings Rate', points: pts, maxPoints: 30,
      description: income > 0 ? `Saving ${(Math.max(0, (income - expenses) / income) * 100).toFixed(0)}% of income` : 'No income this month',
      color: pts >= 22 ? '#10b981' : pts >= 12 ? '#3b82f6' : pts >= 8 ? '#f59e0b' : '#ef4444',
    });
    total += pts;
  }

  // Budget control (25 pts)
  {
    let pts = 13;
    if (monthlyBudget > 0) {
      const r = expenses / monthlyBudget;
      pts = r <= 0.7 ? 25 : r <= 0.85 ? 20 : r <= 1.0 ? 12 : r <= 1.2 ? 5 : 0;
    }
    factors.push({
      label: 'Budget Control', points: pts, maxPoints: 25,
      description: monthlyBudget > 0 ? `Using ${((expenses / monthlyBudget) * 100).toFixed(0)}% of budget` : 'Set a budget to improve',
      color: pts >= 20 ? '#10b981' : pts >= 12 ? '#f59e0b' : '#ef4444',
    });
    total += pts;
  }

  // Consistency (20 pts)
  {
    const byMonth: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => { const m = t.date.slice(0, 7); byMonth[m] = (byMonth[m] || 0) + t.amount; });
    const vals = Object.values(byMonth);
    let pts = 10;
    if (vals.length >= 2) {
      const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
      const std = Math.sqrt(vals.reduce((s, v) => s + (v - avg) ** 2, 0) / vals.length);
      const cv = avg > 0 ? std / avg : 1;
      pts = cv <= 0.1 ? 20 : cv <= 0.2 ? 16 : cv <= 0.35 ? 10 : cv <= 0.5 ? 5 : 2;
    }
    factors.push({
      label: 'Consistency', points: pts, maxPoints: 20,
      description: vals.length < 2 ? 'Need 2+ months of data' : pts >= 16 ? 'Very consistent spending' : 'High month-to-month variance',
      color: pts >= 16 ? '#10b981' : pts >= 10 ? '#f59e0b' : '#ef4444',
    });
    total += pts;
  }

  // Category limits (15 pts)
  {
    let pts = 7;
    if (categoryLimits.length > 0) {
      const catMap: Record<string, number> = {};
      monthExp.forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
      const exceeded = categoryLimits.filter(l => (catMap[l.category] || 0) > l.limit).length;
      const r = exceeded / categoryLimits.length;
      pts = r === 0 ? 15 : r <= 0.2 ? 10 : r <= 0.5 ? 5 : 0;
      factors.push({
        label: 'Category Limits', points: pts, maxPoints: 15,
        description: exceeded === 0 ? 'All limits respected' : `${exceeded}/${categoryLimits.length} limits exceeded`,
        color: pts >= 10 ? '#10b981' : pts >= 5 ? '#f59e0b' : '#ef4444',
      });
    } else {
      factors.push({ label: 'Category Limits', points: pts, maxPoints: 15, description: 'Add limits to boost this', color: '#64748b' });
    }
    total += pts;
  }

  // Subscription load (10 pts)
  {
    const active = subscriptions.filter(s => s.isActive);
    const monthly = active.reduce((s, sub) => {
      if (sub.frequency === 'yearly') return s + sub.amount / 12;
      if (sub.frequency === 'weekly') return s + (sub.amount * 52) / 12;
      return s + sub.amount;
    }, 0);
    let pts = income > 0
      ? (() => { const r = monthly / income; return r <= 0.05 ? 10 : r <= 0.1 ? 8 : r <= 0.2 ? 5 : r <= 0.3 ? 2 : 0; })()
      : active.length === 0 ? 10 : 5;
    factors.push({
      label: 'Subscriptions', points: pts, maxPoints: 10,
      description: monthly > 0 ? `${active.length} active, ${income > 0 ? `${((monthly/income)*100).toFixed(0)}% of income` : 'tracking'}` : 'No active subscriptions',
      color: pts >= 8 ? '#10b981' : pts >= 5 ? '#f59e0b' : '#ef4444',
    });
    total += pts;
  }

  const score = Math.min(100, Math.max(0, total));
  const grade = score >= 80 ? 'Excellent' : score >= 65 ? 'Good' : score >= 45 ? 'Fair' : 'Needs Work';
  const color = score >= 80 ? '#10b981' : score >= 65 ? '#3b82f6' : score >= 45 ? '#f59e0b' : '#ef4444';
  const summary = score >= 80 ? 'Outstanding! Your finances are in great shape.'
    : score >= 65 ? 'Good habits. A few tweaks could push you to excellent.'
    : score >= 45 ? 'Room to improve. Focus on budgeting and savings rate.'
    : 'Start with a monthly budget and track every expense.';

  return { score, grade, color, summary, factors };
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
  subscriptions: Subscription[]
): SafeToSpendResult {
  const now = new Date();
  const thisMonth = getMonthPrefix();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const monthTx = transactions.filter(t => t.date.startsWith(thisMonth));
  const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  let subsRemaining = 0;
  subscriptions.filter(s => s.isActive).forEach(sub => {
    const next = new Date(sub.nextPaymentDate);
    if (next >= now && next <= endOfMonth) subsRemaining += sub.amount;
  });

  const savingsBuffer = income > 0 ? income * 0.1 : 0;
  const safeAmount = Math.max(0, income - expenses - subsRemaining - savingsBuffer);

  return { safeAmount, income, expenses, subsRemaining, savingsBuffer };
}
