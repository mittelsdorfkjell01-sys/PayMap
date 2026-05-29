import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const STALE_DAYS = 90;

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

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - STALE_DAYS);

  try {
    const [staleGuideSteps, staleNarratives, staleCoL] = await Promise.all([
      prisma.movingGuide.findMany({
        where: { isActive: true, OR: [{ lastVerified: null }, { lastVerified: { lt: cutoff } }] },
        select: { id: true, cityId: true, city: { select: { slug: true, nameDE: true } }, titleDE: true, lastVerified: true, section: true },
        orderBy: { lastVerified: 'asc' },
      }),
      prisma.cityNarrative.findMany({
        where: { OR: [{ lastVerified: null }, { lastVerified: { lt: cutoff } }] },
        select: { id: true, cityId: true, city: { select: { slug: true, nameDE: true } }, titleDE: true, lastVerified: true, section: true },
        orderBy: { lastVerified: 'asc' },
      }),
      // DistrictCostOfLiving uses validFrom (no updatedAt field)
      prisma.districtCostOfLiving.findMany({
        where: { validFrom: { lt: cutoff } },
        select: {
          id: true,
          districtId: true,
          district: { select: { nameDE: true, city: { select: { nameDE: true } } } },
          category: true,
          validFrom: true,
        },
        orderBy: { validFrom: 'asc' },
        take: 200,
      }),
    ]);

    const summary = {
      checkedAt: new Date().toISOString(),
      staleDays: STALE_DAYS,
      staleGuideSteps: staleGuideSteps.length,
      staleNarratives: staleNarratives.length,
      staleCoLEntries: staleCoL.length,
      details: {
        guideSteps: staleGuideSteps.map(s => ({
          id: s.id,
          city: s.city?.nameDE ?? s.cityId,
          section: s.section,
          title: s.titleDE,
          lastVerified: s.lastVerified?.toISOString() ?? null,
        })),
        narratives: staleNarratives.map(n => ({
          id: n.id,
          city: n.city?.nameDE ?? n.cityId,
          section: n.section,
          title: n.titleDE,
          lastVerified: n.lastVerified?.toISOString() ?? null,
        })),
        costOfLiving: staleCoL.slice(0, 50).map(c => ({
          id: c.id,
          city: c.district?.city?.nameDE ?? 'unknown',
          district: c.district?.nameDE ?? c.districtId,
          category: c.category,
          validFrom: c.validFrom.toISOString(),
        })),
      },
    };

    // Write changelog entries for affected cities
    if (staleGuideSteps.length + staleNarratives.length > 0) {
      const affectedCityIds = Array.from(new Set([
        ...staleGuideSteps.map(s => s.cityId),
        ...staleNarratives.map(n => n.cityId),
      ]));

      // Avoid unbounded growth: skip cities that already have a cron stale-detection
      // entry within the current staleness window (content stays stale until verified).
      const recentlyLogged = await prisma.cityChangeLog.findMany({
        where: {
          cityId: { in: affectedCityIds },
          changedBy: 'cron:detect-stale-content',
          createdAt: { gte: cutoff },
        },
        select: { cityId: true },
      });
      const alreadyLogged = new Set(recentlyLogged.map(c => c.cityId));

      for (const cityId of affectedCityIds) {
        if (alreadyLogged.has(cityId)) continue;
        const guideCount = staleGuideSteps.filter(s => s.cityId === cityId).length;
        const narrativeCount = staleNarratives.filter(n => n.cityId === cityId).length;
        const parts: string[] = [];
        if (guideCount) parts.push(`${guideCount} Guide-Schritt${guideCount !== 1 ? 'e' : ''}`);
        if (narrativeCount) parts.push(`${narrativeCount} Narrative${narrativeCount !== 1 ? 's' : ''}`);
        await prisma.cityChangeLog.create({
          data: {
            cityId,
            changeType: 'data_update',
            descriptionDE: `Stale-Detection: ${parts.join(', ')} älter als ${STALE_DAYS} Tage`,
            descriptionEN: `Stale detection: ${parts.join(', ')} older than ${STALE_DAYS} days`,
            changedBy: 'cron:detect-stale-content',
          },
        });
      }
    }

    return NextResponse.json(summary);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
