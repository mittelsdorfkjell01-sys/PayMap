import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const periods = [
    { key: '7d' as const, days: 7 },
    { key: '30d' as const, days: 30 },
    { key: '90d' as const, days: 90 },
  ];

  let updated = 0;

  for (const { key, days } of periods) {
    const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const searches = await prisma.citySearch.groupBy({
      by: ['fromCityId', 'toCityId'],
      where: { createdAt: { gte: since } },
      _count: { id: true },
    });

    for (const row of searches) {
      await prisma.citySearchAggregate.upsert({
        where: {
          fromCityId_toCityId_period: {
            fromCityId: row.fromCityId,
            toCityId: row.toCityId,
            period: key,
          },
        },
        update: { searchCount: row._count.id, updatedAt: now },
        create: {
          fromCityId: row.fromCityId,
          toCityId: row.toCityId,
          period: key,
          searchCount: row._count.id,
          updatedAt: now,
        },
      });
      updated++;
    }
  }

  return NextResponse.json({ ok: true, updated });
}
