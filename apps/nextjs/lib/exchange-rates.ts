import { prisma } from './prisma';

let cache: Map<string, number> | null = null;
let cacheTime = 0;
let oldestRateAt = 0; // ms timestamp of the oldest rate row currently cached
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// FX rates are synced daily by the sync-exchange-rates cron. Anything older
// than this is considered stale and surfaced to callers as a flag.
const STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

async function getRates(): Promise<Map<string, number>> {
  if (cache && Date.now() - cacheTime < CACHE_TTL) return cache;

  const rows = await prisma.exchangeRate.findMany({
    select: { fromCurrency: true, toCurrency: true, rate: true, updatedAt: true },
  });

  const map = new Map<string, number>();
  let oldest = Infinity;
  for (const r of rows) {
    map.set(`${r.fromCurrency}_${r.toCurrency}`, r.rate);
    oldest = Math.min(oldest, r.updatedAt.getTime());
  }
  // EUR→EUR is always 1
  map.set('EUR_EUR', 1);
  cache = map;
  cacheTime = Date.now();
  oldestRateAt = rows.length > 0 ? oldest : 0;
  return map;
}

/** True when the oldest stored rate is older than the staleness threshold. */
export async function areRatesStale(): Promise<boolean> {
  await getRates();
  return oldestRateAt > 0 && Date.now() - oldestRateAt > STALE_AFTER_MS;
}

/** Convert an amount from `from` currency to EUR */
export async function toEUR(amount: number, from: string): Promise<number> {
  if (from === 'EUR') return amount;
  const rates = await getRates();
  // Try direct rate to EUR
  const direct = rates.get(`${from}_EUR`);
  if (direct) return amount * direct;
  // Try via EUR→from (invert)
  const inverse = rates.get(`EUR_${from}`);
  if (inverse) return amount / inverse;
  // Unknown currency — return as-is
  return amount;
}

/** Convert amount from EUR to `to` currency */
export async function fromEUR(amount: number, to: string): Promise<number> {
  if (to === 'EUR') return amount;
  const rates = await getRates();
  const direct = rates.get(`EUR_${to}`);
  if (direct) return amount * direct;
  const inverse = rates.get(`${to}_EUR`);
  if (inverse) return amount / inverse;
  return amount;
}

// ── Strict variants ──────────────────────────────────────────────────────────
// Unlike toEUR/fromEUR (which silently return the input on a missing rate — a
// safe-ish default for display), these return null so callers can refuse to
// produce a wrong value (e.g. the calculator must not treat 60.000 € as
// 60.000 THB). Used where correctness matters more than always rendering.

/** Convert `from` currency → EUR, or null if no rate is available. */
export async function toEURStrict(amount: number, from: string): Promise<number | null> {
  if (from === 'EUR') return amount;
  const rates = await getRates();
  const direct = rates.get(`${from}_EUR`);
  if (direct !== undefined) return amount * direct;
  const inverse = rates.get(`EUR_${from}`);
  if (inverse !== undefined) return amount / inverse;
  return null;
}

/** Convert EUR → `to` currency, or null if no rate is available. */
export async function fromEURStrict(amount: number, to: string): Promise<number | null> {
  if (to === 'EUR') return amount;
  const rates = await getRates();
  const direct = rates.get(`EUR_${to}`);
  if (direct !== undefined) return amount * direct;
  const inverse = rates.get(`${to}_EUR`);
  if (inverse !== undefined) return amount / inverse;
  return null;
}
