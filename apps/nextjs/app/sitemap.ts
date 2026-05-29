import { MetadataRoute } from 'next';
import { TOP_PAIRS } from '@/lib/seo/top-pairs';
import { PREMIUM_CITY_SLUGS } from '@/lib/premium-content';
import { toEnSlug } from '@/lib/city-guide-slugs';

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://paymap.io').replace(/\/$/, '');
const LOCALES = ['de', 'en'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const mainPages = LOCALES.flatMap((locale) => [
    { url: `${BASE}/${locale}`,              lastModified: now, changeFrequency: 'weekly'  as const, priority: 1.0 },
    { url: `${BASE}/${locale}/ranking`,      lastModified: now, changeFrequency: 'weekly'  as const, priority: 0.9 },
    { url: `${BASE}/${locale}/steuer-guide`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${BASE}/${locale}/guide`,        lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 },
  ]);

  const comparisonPages = LOCALES.flatMap((locale) =>
    TOP_PAIRS.map(({ from, to }) => ({
      url: `${BASE}/${locale}/vergleich/${from}/${to}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  );

  const premiumGuidePages = PREMIUM_CITY_SLUGS.flatMap((dbSlug) => [
    {
      url: `${BASE}/de/auswandern/${dbSlug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${BASE}/en/emigrate/${toEnSlug(dbSlug)}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
  ]);

  return [...mainPages, ...comparisonPages, ...premiumGuidePages];
}
