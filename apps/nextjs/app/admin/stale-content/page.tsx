import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const STALE_DAYS = 90;

type GuideStepRow = {
  id: string;
  cityId: string;
  city: { slug: string; nameDE: string | null } | null;
  titleDE: string;
  lastVerified: Date | null;
  section: string;
};

type NarrativeRow = {
  id: string;
  cityId: string;
  city: { slug: string; nameDE: string | null } | null;
  titleDE: string;
  lastVerified: Date | null;
  section: string;
};

async function getStaleContent() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - STALE_DAYS);

  const [staleGuideSteps, staleNarratives, staleCoL] = await Promise.all([
    prisma.movingGuide.findMany({
      where: { isActive: true, OR: [{ lastVerified: null }, { lastVerified: { lt: cutoff } }] },
      select: { id: true, cityId: true, city: { select: { slug: true, nameDE: true } }, titleDE: true, lastVerified: true, section: true },
      orderBy: [{ cityId: 'asc' }, { lastVerified: 'asc' }],
    }),
    prisma.cityNarrative.findMany({
      where: { OR: [{ lastVerified: null }, { lastVerified: { lt: cutoff } }] },
      select: { id: true, cityId: true, city: { select: { slug: true, nameDE: true } }, titleDE: true, lastVerified: true, section: true },
      orderBy: [{ cityId: 'asc' }, { lastVerified: 'asc' }],
    }),
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
      take: 100,
    }),
  ]);

  // Group guide steps + narratives by city
  const byCity = new Map<string, {
    cityName: string;
    guideSteps: GuideStepRow[];
    narratives: NarrativeRow[];
  }>();

  for (const s of staleGuideSteps as GuideStepRow[]) {
    const name = s.city?.nameDE ?? s.cityId;
    if (!byCity.has(s.cityId)) byCity.set(s.cityId, { cityName: name, guideSteps: [], narratives: [] });
    byCity.get(s.cityId)!.guideSteps.push(s);
  }
  for (const n of staleNarratives as NarrativeRow[]) {
    const name = n.city?.nameDE ?? n.cityId;
    if (!byCity.has(n.cityId)) byCity.set(n.cityId, { cityName: name, guideSteps: [], narratives: [] });
    byCity.get(n.cityId)!.narratives.push(n);
  }

  return { byCity: Array.from(byCity.entries()), staleCoL, cutoff };
}

async function markGuideVerified(id: string) {
  'use server';
  await prisma.movingGuide.update({ where: { id }, data: { lastVerified: new Date() } });
  revalidatePath('/admin/stale-content');
}

async function markNarrativeVerified(id: string) {
  'use server';
  await prisma.cityNarrative.update({ where: { id }, data: { lastVerified: new Date() } });
  revalidatePath('/admin/stale-content');
}

async function markCityAllVerified(cityId: string) {
  'use server';
  const now = new Date();
  await Promise.all([
    prisma.movingGuide.updateMany({ where: { cityId }, data: { lastVerified: now } }),
    prisma.cityNarrative.updateMany({ where: { cityId }, data: { lastVerified: now } }),
  ]);
  await prisma.cityChangeLog.create({
    data: {
      cityId,
      changeType: 'verification',
      descriptionDE: 'Alle Inhalte als geprüft markiert (Admin)',
      descriptionEN: 'All content marked as verified (Admin)',
      changedBy: 'admin',
    },
  });
  revalidatePath('/admin/stale-content');
}

function daysAgo(date: Date | null): string {
  if (!date) return 'nie geprüft';
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  return `vor ${days} Tagen`;
}

export default async function StaleContentPage() {
  const { byCity, staleCoL, cutoff } = await getStaleContent();
  const totalItems = byCity.reduce((sum, [, v]) => sum + v.guideSteps.length + v.narratives.length, 0);

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-h1 text-text">Veraltete Inhalte</h1>
        <p className="mt-1 text-sm text-text-2">
          Inhalte ohne Prüfung seit mehr als {STALE_DAYS} Tagen (vor {cutoff.toLocaleDateString('de-DE')}).
          {totalItems > 0 && <span className="ml-2 text-warn">{totalItems} Einträge zu prüfen.</span>}
          {totalItems === 0 && <span className="ml-2 text-pos">Alles aktuell.</span>}
        </p>
      </div>

      {/* Guide Steps + Narratives by City */}
      {byCity.length === 0 ? (
        <div className="rounded-md border-l-2 border-pos bg-surface-sub p-6 text-text-2">
          Alle Guide-Steps und Narratives sind aktuell.
        </div>
      ) : (
        <div className="space-y-6">
          {byCity.map(([cityId, { cityName, guideSteps, narratives }]) => (
            <div key={cityId} className="overflow-hidden rounded-lg border border-line bg-surface">
              <div className="flex items-center justify-between border-b border-line bg-surface-sub px-5 py-3">
                <h2 className="text-text">
                  {cityName}
                  <span className="ml-2 text-caption text-text-2">
                    {guideSteps.length} Steps · {narratives.length} Narratives
                  </span>
                </h2>
                <form action={markCityAllVerified.bind(null, cityId)}>
                  <button type="submit" className="btn-admin-primary text-sm">
                    Alle als geprüft markieren
                  </button>
                </form>
              </div>

              {guideSteps.length > 0 && (
                <div className="divide-y divide-line-soft">
                  <p className="bg-surface-sub px-5 py-2 text-caption uppercase tracking-[0.04em] text-text-3">
                    Guide-Steps
                  </p>
                  {guideSteps.map((s: GuideStepRow) => (
                    <div key={s.id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm text-text">{s.titleDE}</p>
                        <p className="text-caption text-text-3">{s.section} · {daysAgo(s.lastVerified)}</p>
                      </div>
                      <form action={markGuideVerified.bind(null, s.id)}>
                        <button type="submit" className="btn-admin-ghost text-sm">
                          Geprüft
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}

              {narratives.length > 0 && (
                <div className="divide-y divide-line-soft">
                  <p className="bg-surface-sub px-5 py-2 text-caption uppercase tracking-[0.04em] text-text-3">
                    Narratives
                  </p>
                  {narratives.map((n: NarrativeRow) => (
                    <div key={n.id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm text-text">{n.titleDE}</p>
                        <p className="text-caption text-text-3">{n.section} · {daysAgo(n.lastVerified)}</p>
                      </div>
                      <form action={markNarrativeVerified.bind(null, n.id)}>
                        <button type="submit" className="btn-admin-ghost text-sm">
                          Geprüft
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CoL section */}
      {staleCoL.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="border-b border-line border-l-2 border-l-warn bg-surface-sub px-5 py-3">
            <h2 className="text-text">
              Veraltete Mietdaten (DistrictCostOfLiving)
              <span className="ml-2 text-caption text-text-2">{staleCoL.length} Einträge älter als {STALE_DAYS} Tage — via Seed aktualisieren</span>
            </h2>
          </div>
          <div className="max-h-64 divide-y divide-line-soft overflow-y-auto">
            {staleCoL.map(c => (
              <div key={c.id} className="flex items-center justify-between px-5 py-2">
                <p className="text-sm text-text-2">
                  {c.district?.city?.nameDE ?? '?'} — {c.district?.nameDE ?? c.districtId} · <span className="text-text-3">{c.category}</span>
                </p>
                <p className="text-caption text-text-3">{daysAgo(c.validFrom)}</p>
              </div>
            ))}
          </div>
          <p className="border-t border-line px-5 py-3 text-caption text-text-3">
            Mietdaten werden durch erneutes Ausführen des Stadt-Premium-Seeds aktualisiert.
          </p>
        </div>
      )}
    </div>
  );
}
