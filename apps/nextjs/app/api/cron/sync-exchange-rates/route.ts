import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.EXCHANGERATE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'EXCHANGERATE_API_KEY not set' }, { status: 500 });
  }

  try {
    const res = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/EUR`);
    if (!res.ok) throw new Error('API error');
    const data = await res.json() as { conversion_rates: Record<string, number> };
    const rates = data.conversion_rates;
    const now = new Date();

    const pairs = [
      ['EUR', 'CHF'], ['EUR', 'GBP'], ['EUR', 'USD'], ['EUR', 'AED'],
      ['EUR', 'THB'], ['EUR', 'PLN'], ['EUR', 'CZK'], ['EUR', 'HUF'],
      ['EUR', 'RON'], ['EUR', 'SGD'], ['EUR', 'ZAR'], ['EUR', 'IDR'],
      ['EUR', 'COP'], ['EUR', 'MXN'], ['EUR', 'ARS'], ['EUR', 'GEL'],
    ] as const;

    for (const [from, to] of pairs) {
      const rate = rates[to];
      if (!rate) continue;
      await prisma.exchangeRate.upsert({
        where: { fromCurrency_toCurrency: { fromCurrency: from, toCurrency: to } },
        update: { rate, updatedAt: now },
        create: { fromCurrency: from, toCurrency: to, rate, updatedAt: now },
      });
      // Reverse
      await prisma.exchangeRate.upsert({
        where: { fromCurrency_toCurrency: { fromCurrency: to, toCurrency: from } },
        update: { rate: 1 / rate, updatedAt: now },
        create: { fromCurrency: to, toCurrency: from, rate: 1 / rate, updatedAt: now },
      });
    }

    return NextResponse.json({ ok: true, updated: pairs.length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
