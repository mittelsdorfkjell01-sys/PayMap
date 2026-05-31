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
    <div className="max-w-3xl mx-auto space-y-8 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-light text-gray-900">
          Emigration Guides
        </h1>
        <p className="text-sm text-gray-500 font-light">
          {withGuides.length} cities | Bureaucracy, tax planning, banking, insurance, housing & social life
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {withGuides.map((city) => (
          <Link
            key={city.slug}
            href={`/en/emigrate/${toEnSlug(city.slug)}`}
            className="border border-gray-200 rounded-lg px-5 py-4 flex items-center gap-4 hover:border-primary/40 hover:bg-gray-50 transition-colors group"
          >
            <span className="text-2xl">{city.flag}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 group-hover:text-primary transition-colors text-sm">
                {city.nameEN ?? city.nameDE}
              </p>
              {city.country && (
                <p className="text-xs text-gray-500 font-light">{city.country.nameEN}</p>
              )}
            </div>
            <span className="text-xs text-gray-400 font-mono shrink-0">
              {city._count.movingGuides} steps
            </span>
          </Link>
        ))}
      </div>

      <p className="text-xs text-gray-500 font-light border border-gray-200 rounded-lg px-4 py-3 leading-relaxed">
        paymap does not replace individual tax or legal advice. Content marked with a warning requires particular verification.
      </p>
    </div>
  );
}
