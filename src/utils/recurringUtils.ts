import { RecurringIncomeFrequency } from '../types/finance';

export function getNextOccurrence(dateStr: string, frequency: RecurringIncomeFrequency): string {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let d = new Date(dateStr + 'T00:00:00'); d.setHours(0, 0, 0, 0);

  // Advance until the date is today or in the future
  while (d < today) {
    if (frequency === 'weekly')   d.setDate(d.getDate() + 7);
    else if (frequency === 'biweekly') d.setDate(d.getDate() + 14);
    else                          d.setMonth(d.getMonth() + 1);
  }

  return d.toISOString().split('T')[0];
}

export function frequencyLabel(f: RecurringIncomeFrequency): string {
  if (f === 'weekly')   return 'Weekly';
  if (f === 'biweekly') return 'Every 2 weeks';
  return 'Monthly';
}

export function monthlyEquivalent(amount: number, frequency: RecurringIncomeFrequency): number {
  if (frequency === 'weekly')   return (amount * 52) / 12;
  if (frequency === 'biweekly') return (amount * 26) / 12;
  return amount;
}
