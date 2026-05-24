import { prisma } from './prisma';

let cache: Map<string, number> | null = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function getRates(): Promise<Map<string, number>> {
  if (cache && Date.now() - cacheTime < CACHE_TTL) return cache;

  const rows = await prisma.exchangeRate.findMany({
    select: { fromCurrency: true, toCurrency: true, rate: true },
  });

  const map = new Map<string, number>();
  for (const r of rows) {
    map.set(`${r.fromCurrency}_${r.toCurrency}`, r.rate);
  }
  // EUR→EUR is always 1
  map.set('EUR_EUR', 1);
  cache = map;
  cacheTime = Date.now();
  return map;
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
