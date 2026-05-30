import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { toEnSlug } from '@/lib/city-guide-slugs';

export const metadata: Metadata = {
  title: 'Emigration Guides for 32 Cities | paymap',
  description: 'Complete emigration guides: bureaucracy, tax planning, banking, insurance, housing and more — for 32 popular cities for German emigrants.',
};

type Props = { params: { locale: string } };

export default async function EmigrateIndexPage({ params }: Props) {
  setRequestLocale(params.locale);

  const cities = await prisma.city.findMany({
    where: { isActive: true },
    select: {
      slug: true, nameDE: true, nameEN: true, flag: true,
      country: { select: { nameEN: true } },
      _count: { select: { movingGuides: { where: { isActive: true } } } },
    },
    orderBy: { sortOrder: 'asc' },
  });

  const withGuides = cities.filter((c) => c._count.movingGuides > 0);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-h1 text-text">
          Emigration Guides
        </h1>
        <p className="text-body text-text-2">
          {withGuides.length} cities · Bureaucracy, tax planning, banking, insurance, housing & social life
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {withGuides.map((city) => (
          <Link
            key={city.slug}
            href={`/en/emigrate/${toEnSlug(city.slug)}`}
            className="focus-ring flex items-center gap-4 rounded-lg border border-line bg-surface px-5 py-4 transition-colors hover:border-line-strong hover:bg-surface-sub"
          >
            <span className="text-3xl">{city.flag}</span>
            <div className="min-w-0 flex-1">
              <p className="text-text">
                {city.nameEN ?? city.nameDE}
              </p>
              {city.country && (
                <p className="text-caption text-text-2">{city.country.nameEN}</p>
              )}
            </div>
            <span className="shrink-0 text-caption tabular text-text-3">
              {city._count.movingGuides} steps
            </span>
          </Link>
        ))}
      </div>

      <p className="rounded-md border border-line px-4 py-3 text-caption leading-relaxed text-text-3">
        paymap does not replace individual tax or legal advice. Content with elevated risk is marked accordingly.
      </p>
    </div>
  );
}
