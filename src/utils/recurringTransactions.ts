import { Transaction, RecurringIncome, Subscription } from '../types/finance';

function toMonthlyAmt(amount: number, frequency: string): number {
  if (frequency === 'weekly')   return (amount * 52) / 12;
  if (frequency === 'biweekly') return (amount * 26) / 12;
  if (frequency === 'yearly')   return amount / 12;
  return amount;
}

function roundCents(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Generates virtual Transaction objects for the CURRENT MONTH from active
 * recurring income and recurring expenses (subscriptions).
 *
 * Rules:
 * - Monthly recurring: 1 transaction, amount = per-occurrence amount.
 * - Weekly recurring: 1 transaction dated to the month prefix, amount = monthly equivalent.
 * - Biweekly recurring: same approach, monthly equivalent amount.
 * - Yearly subscriptions: only emitted when nextPaymentDate falls in the current month.
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
    const amt = ri.frequency === 'monthly'
      ? ri.amount
      : roundCents(toMonthlyAmt(ri.amount, ri.frequency));
    const date = ri.nextPaymentDate.startsWith(currentMonthPrefix)
      ? ri.nextPaymentDate
      : firstOfMonth;
    txs.push({
      id: `vrt-ri-${ri.id}`,
      type: 'income',
      amount: amt,
      description: ri.name,
      category: ri.category || 'Salary',
      date,
      createdAt: base,
      isRecurring: true,
      recurringId: ri.id,
    });
  }

  for (const sub of subscriptions) {
    if (!sub.isActive) continue;
    // Yearly: only emit in the due month
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
    } else {
      const amt = sub.frequency === 'monthly'
        ? sub.amount
        : roundCents(toMonthlyAmt(sub.amount, sub.frequency));
      const date = sub.nextPaymentDate.startsWith(currentMonthPrefix)
        ? sub.nextPaymentDate
        : firstOfMonth;
      txs.push({
        id: `vrt-sub-${sub.id}`,
        type: 'expense',
        amount: amt,
        description: sub.name,
        category: sub.category,
        date,
        createdAt: base + 1,
        isRecurring: true,
        recurringId: sub.id,
      });
    }
  }

  return txs;
}
