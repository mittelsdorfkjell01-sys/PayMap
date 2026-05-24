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
    <div className="max-w-4xl mx-auto space-y-8 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-headline-xl-mobile md:text-headline-lg font-bold text-on-background">
          Auswandern-Guides
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          {withGuides.length} Städte · Bürokratie, Steuerplanung, Banking, Versicherung, Wohnen & Soziales
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {withGuides.map((city) => (
          <Link
            key={city.slug}
            href={`/de/auswandern/${city.slug}`}
            className="glass-card px-5 py-4 flex items-center gap-4 hover:border-primary/40 transition-colors group"
          >
            <span className="text-3xl">{city.flag}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-on-surface group-hover:text-primary transition-colors">{city.nameDE}</p>
              {city.country && (
                <p className="text-label-sm text-on-surface-variant">{city.country.nameDE}</p>
              )}
            </div>
            <span className="text-label-sm text-on-surface-variant font-mono shrink-0">
              {city._count.movingGuides} Schritte
            </span>
          </Link>
        ))}
      </div>

      <p className="text-label-sm text-on-surface-variant border border-outline-variant/30 rounded-xl px-4 py-3 leading-relaxed">
        paymap ersetzt keine individuelle steuerliche oder rechtliche Beratung. Inhalte mit ⚠ sind besonders prüfungsbedürftig.
      </p>
    </div>
  );
}
