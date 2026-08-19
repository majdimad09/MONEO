import { SUPPORTED_CURRENCIES } from '../types/finance';

const ZERO_DECIMAL_CURRENCIES = new Set([
  'JPY', 'KRW', 'VND', 'IDR', 'ISK', 'YER', 'IQD', 'SYP', 'CLP', 'UGX', 'RWF', 'BIF', 'GNF', 'PYG',
]);
const THREE_DECIMAL_CURRENCIES = new Set(['KWD', 'BHD', 'OMR', 'JOD', 'TND']);

function getCurrencyDecimals(code: string): number {
  if (ZERO_DECIMAL_CURRENCIES.has(code)) return 0;
  if (THREE_DECIMAL_CURRENCIES.has(code)) return 3;
  return 2;
}

export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  const config = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);
  const symbol = config?.symbol || currencyCode;
  const decimals = getCurrencyDecimals(currencyCode);

  const absAmount = Math.abs(amount);
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(absAmount);

  const formatted = `${symbol}${formattedNumber}`;
  return amount < 0 ? `-${formatted}` : formatted;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;

    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return dateString;
  }
}

export function formatFullDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;

    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatPercentage(value: number, total: number): string {
  if (total <= 0 || isNaN(value)) return '0.0%';
  const pct = (value / total) * 100;
  return `${pct.toFixed(1)}%`;
}
