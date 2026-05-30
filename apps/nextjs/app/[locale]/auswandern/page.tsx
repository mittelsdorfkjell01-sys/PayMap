import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Auswandern-Guides für 32 Städte | paymap',
  description: 'Vollständige Auswanderungs-Guides: Bürokratie, Steuerplanung, Banking, Versicherung, Wohnen und mehr — für 32 beliebte Städte für deutsche Auswanderer.',
};

type Props = { params: { locale: string } };

export default async function AuswandernIndexPage({ params }: Props) {
  setRequestLocale(params.locale);

  const cities = await prisma.city.findMany({
    where: { isActive: true },
    select: {
      slug: true, nameDE: true, nameEN: true, flag: true,
      country: { select: { nameDE: true } },
      _count: { select: { movingGuides: { where: { isActive: true } } } },
    },
    orderBy: { sortOrder: 'asc' },
  });

  const withGuides = cities.filter((c) => c._count.movingGuides > 0);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-h1 text-text">
          Auswandern-Guides
        </h1>
        <p className="text-body text-text-2">
          {withGuides.length} Städte · Bürokratie, Steuerplanung, Banking, Versicherung, Wohnen & Soziales
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {withGuides.map((city) => (
          <Link
            key={city.slug}
            href={`/de/auswandern/${city.slug}`}
            className="focus-ring flex items-center gap-4 rounded-lg border border-line bg-surface px-5 py-4 transition-colors hover:border-line-strong hover:bg-surface-sub"
          >
            <span className="text-3xl">{city.flag}</span>
            <div className="min-w-0 flex-1">
              <p className="text-text">{city.nameDE}</p>
              {city.country && (
                <p className="text-caption text-text-2">{city.country.nameDE}</p>
              )}
            </div>
            <span className="shrink-0 text-caption tabular text-text-3">
              {city._count.movingGuides} Schritte
            </span>
          </Link>
        ))}
      </div>

      <p className="rounded-md border border-line px-4 py-3 text-caption leading-relaxed text-text-3">
        paymap ersetzt keine individuelle steuerliche oder rechtliche Beratung. Inhalte mit erhöhtem Risiko sind besonders prüfungsbedürftig.
      </p>
    </div>
  );
}
