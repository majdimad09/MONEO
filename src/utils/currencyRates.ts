const USD_RATES_KEY = 'moneo_usd_rates_v1';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface RatesCache {
  rates: Record<string, number>;
  timestamp: number;
}

async function fetchUSDRates(): Promise<Record<string, number>> {
  const cached = localStorage.getItem(USD_RATES_KEY);
  if (cached) {
    try {
      const data: RatesCache = JSON.parse(cached);
      if (Date.now() - data.timestamp < CACHE_TTL_MS) return data.rates;
    } catch { /* stale */ }
  }
  const res = await fetch('https://api.frankfurter.app/latest?from=USD');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json() as { rates: Record<string, number> };
  const rates: Record<string, number> = { USD: 1, ...json.rates };
  localStorage.setItem(USD_RATES_KEY, JSON.stringify({ rates, timestamp: Date.now() }));
  return rates;
}

export async function getConversionRate(from: string, to: string): Promise<number> {
  if (from === to) return 1;
  const rates = await fetchUSDRates();
  const fromRate = rates[from] ?? 1;
  const toRate = rates[to] ?? 1;
  return toRate / fromRate;
}

export function conv(amount: number, rate: number): number {
  return Math.round(amount * rate * 100) / 100;
}
