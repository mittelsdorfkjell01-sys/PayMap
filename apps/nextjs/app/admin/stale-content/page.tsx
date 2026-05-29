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
        <h1 className="text-2xl font-bold text-gray-900">Veraltete Inhalte</h1>
        <p className="text-sm text-gray-500 mt-1">
          Inhalte ohne Prüfung seit mehr als {STALE_DAYS} Tagen (vor {cutoff.toLocaleDateString('de-DE')}).
          {totalItems > 0 && <span className="ml-2 text-amber-600 font-medium">{totalItems} Einträge zu prüfen.</span>}
          {totalItems === 0 && <span className="ml-2 text-green-600 font-medium">Alles aktuell.</span>}
        </p>
      </div>

      {/* Guide Steps + Narratives by City */}
      {byCity.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-green-700">
          Alle Guide-Steps und Narratives sind aktuell.
        </div>
      ) : (
        <div className="space-y-6">
          {byCity.map(([cityId, { cityName, guideSteps, narratives }]) => (
            <div key={cityId} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">
                  {cityName}
                  <span className="ml-2 text-xs text-gray-500 font-normal">
                    {guideSteps.length} Steps · {narratives.length} Narratives
                  </span>
                </h2>
                <form action={markCityAllVerified.bind(null, cityId)}>
                  <button
                    type="submit"
                    className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Alle als geprüft markieren
                  </button>
                </form>
              </div>

              {guideSteps.length > 0 && (
                <div className="divide-y divide-gray-100">
                  <p className="px-5 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50/50">
                    Guide-Steps
                  </p>
                  {guideSteps.map((s: GuideStepRow) => (
                    <div key={s.id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm text-gray-800">{s.titleDE}</p>
                        <p className="text-xs text-gray-400">{s.section} · {daysAgo(s.lastVerified)}</p>
                      </div>
                      <form action={markGuideVerified.bind(null, s.id)}>
                        <button type="submit" className="text-xs px-2 py-1 border border-gray-200 rounded hover:bg-gray-50 text-gray-600">
                          Geprüft
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}

              {narratives.length > 0 && (
                <div className="divide-y divide-gray-100">
                  <p className="px-5 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50/50">
                    Narratives
                  </p>
                  {narratives.map((n: NarrativeRow) => (
                    <div key={n.id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm text-gray-800">{n.titleDE}</p>
                        <p className="text-xs text-gray-400">{n.section} · {daysAgo(n.lastVerified)}</p>
                      </div>
                      <form action={markNarrativeVerified.bind(null, n.id)}>
                        <button type="submit" className="text-xs px-2 py-1 border border-gray-200 rounded hover:bg-gray-50 text-gray-600">
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
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 bg-amber-50 border-b border-amber-200">
            <h2 className="font-semibold text-amber-900">
              Veraltete Mietdaten (DistrictCostOfLiving)
              <span className="ml-2 text-xs font-normal">{staleCoL.length} Einträge älter als {STALE_DAYS} Tage — via Seed aktualisieren</span>
            </h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
            {staleCoL.map(c => (
              <div key={c.id} className="flex items-center justify-between px-5 py-2">
                <p className="text-sm text-gray-700">
                  {c.district?.city?.nameDE ?? '?'} — {c.district?.nameDE ?? c.districtId} · <span className="text-gray-400">{c.category}</span>
                </p>
                <p className="text-xs text-gray-400">{daysAgo(c.validFrom)}</p>
              </div>
            ))}
          </div>
          <p className="px-5 py-3 text-xs text-gray-400 border-t border-gray-100">
            Mietdaten werden durch erneutes Ausführen des Stadt-Premium-Seeds aktualisiert.
          </p>
        </div>
      )}
    </div>
  );
}
