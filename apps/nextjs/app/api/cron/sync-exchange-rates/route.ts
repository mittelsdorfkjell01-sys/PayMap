import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const CURRENCIES = ['CHF', 'GBP', 'USD', 'AED', 'THB', 'PLN', 'CZK', 'HUF', 'RON', 'SGD', 'ZAR', 'IDR', 'COP', 'MXN', 'ARS', 'GEL'] as const;

function isAuthorized(req: NextRequest): boolean {
  if (process.env.NODE_ENV === 'development') return true;
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await fetch('https://api.frankfurter.dev/v1/latest?base=EUR');
    if (!res.ok) throw new Error(`Frankfurter API error: ${res.status}`);

    const data = await res.json() as { rates: Record<string, number>; date: string };
    const { rates } = data;
    const now = new Date();
    let updated = 0;

    for (const currency of CURRENCIES) {
      const rate = rates[currency];
      if (!rate) continue;

      await prisma.exchangeRate.upsert({
        where:  { fromCurrency_toCurrency: { fromCurrency: 'EUR', toCurrency: currency } },
        update: { rate, updatedAt: now },
        create: { fromCurrency: 'EUR', toCurrency: currency, rate },
      });
      await prisma.exchangeRate.upsert({
        where:  { fromCurrency_toCurrency: { fromCurrency: currency, toCurrency: 'EUR' } },
        update: { rate: 1 / rate, updatedAt: now },
        create: { fromCurrency: currency, toCurrency: 'EUR', rate: 1 / rate },
      });
      updated++;
    }

    return NextResponse.json({
      ok: true,
      updated: updated * 2,
      source: 'frankfurter-ecb',
      rateDate: data.date,
      timestamp: now.toISOString(),
    });
  } catch (err) {
    // Leave existing rates unchanged on API failure
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
