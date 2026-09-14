import { Transaction, RecurringIncome, Subscription } from '../types/finance';

function roundCents(n: number): number {
  return Math.round(n * 100) / 100;
}

function getOccurrenceDates(nextPaymentDate: string, frequency: 'weekly' | 'biweekly', monthPrefix: string): string[] {
  const [year, month] = monthPrefix.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  const ref = new Date(nextPaymentDate + 'T00:00:00');
  const step = frequency === 'weekly' ? 7 : 14;

  // Walk backward from ref until before firstDay
  let cursor = new Date(ref);
  while (cursor >= firstDay) cursor.setDate(cursor.getDate() - step);
  // Now walk forward into the month
  cursor.setDate(cursor.getDate() + step);

  const dates: string[] = [];
  while (cursor <= lastDay) {
    const iso = cursor.toISOString().split('T')[0];
    if (iso.startsWith(monthPrefix)) dates.push(iso);
    cursor.setDate(cursor.getDate() + step);
  }
  return dates;
}

/**
 * Generates virtual Transaction objects for the CURRENT MONTH from active
 * recurring income and recurring expenses (subscriptions).
 *
 * Rules:
 * - Monthly: 1 transaction on nextPaymentDate (or first of month).
 * - Weekly: one transaction per occurrence in the current month.
 * - Biweekly: one transaction per occurrence in the current month.
 * - Yearly: only emitted when nextPaymentDate falls in the current month.
 * - All virtual transactions carry isRecurring=true so the UI can badge them.
 */
export function generateVirtualTransactions(
  recurringIncome: RecurringIncome[],
  subscriptions: Subscription[],
): Transaction[] {
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const firstOfMonth = `${currentMonthPrefix}-01`;
  const base = Date.now();
  const txs: Transaction[] = [];

  for (const ri of recurringIncome) {
    if (!ri.isActive) continue;

    if (ri.frequency === 'monthly') {
      const date = ri.nextPaymentDate.startsWith(currentMonthPrefix)
        ? ri.nextPaymentDate
        : firstOfMonth;
      txs.push({
        id: `vrt-ri-${ri.id}`,
        type: 'income',
        amount: ri.amount,
        description: ri.name,
        category: ri.category || 'Salary',
        date,
        createdAt: base,
        isRecurring: true,
        recurringId: ri.id,
      });
    } else if (ri.frequency === 'weekly' || ri.frequency === 'biweekly') {
      const dates = getOccurrenceDates(ri.nextPaymentDate, ri.frequency, currentMonthPrefix);
      dates.forEach((date, i) => {
        txs.push({
          id: `vrt-ri-${ri.id}-${i}`,
          type: 'income',
          amount: ri.amount,
          description: ri.name,
          category: ri.category || 'Salary',
          date,
          createdAt: base + i,
          isRecurring: true,
          recurringId: ri.id,
        });
      });
    }
  }

  for (const sub of subscriptions) {
    if (!sub.isActive) continue;

    if (sub.frequency === 'yearly') {
      if (!sub.nextPaymentDate.startsWith(currentMonthPrefix)) continue;
      txs.push({
        id: `vrt-sub-${sub.id}`,
        type: 'expense',
        amount: sub.amount,
        description: sub.name,
        category: sub.category,
        date: sub.nextPaymentDate,
        createdAt: base + 1,
        isRecurring: true,
        recurringId: sub.id,
      });
    } else if (sub.frequency === 'monthly') {
      const date = sub.nextPaymentDate.startsWith(currentMonthPrefix)
        ? sub.nextPaymentDate
        : firstOfMonth;
      txs.push({
        id: `vrt-sub-${sub.id}`,
        type: 'expense',
        amount: sub.amount,
        description: sub.name,
        category: sub.category,
        date,
        createdAt: base + 1,
        isRecurring: true,
        recurringId: sub.id,
      });
    } else if (sub.frequency === 'weekly' || sub.frequency === 'biweekly') {
      const dates = getOccurrenceDates(sub.nextPaymentDate, sub.frequency, currentMonthPrefix);
      dates.forEach((date, i) => {
        txs.push({
          id: `vrt-sub-${sub.id}-${i}`,
          type: 'expense',
          amount: sub.amount,
          description: sub.name,
          category: sub.category,
          date,
          createdAt: base + 1 + i,
          isRecurring: true,
          recurringId: sub.id,
        });
      });
    }
  }

  return txs;
}
