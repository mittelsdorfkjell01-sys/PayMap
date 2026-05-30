import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { getCityGuide, getAllCitySlugs } from '@/lib/city-guide';
import { resolveDbSlug, toEnSlug } from '@/lib/city-guide-slugs';
import { getPremiumCityData, getCityIdBySlug } from '@/lib/premium-city-data';
import { isPremiumCity } from '@/lib/premium-content';
import CityGuideContent from '@/components/guide/CityGuideContent';
import { PremiumCityContent } from '@/components/cities/PremiumCityContent';

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://paymap.io').replace(/\/$/, '');

type Props = { params: { locale: string; slug: string } };

export async function generateStaticParams() {
  const dbSlugs = await getAllCitySlugs();
  return dbSlugs.map((dbSlug) => ({ slug: toEnSlug(dbSlug) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dbSlug = resolveDbSlug(params.slug);
  const data = await getCityGuide(dbSlug);
  if (!data) return {};
  const { city } = data;
  const title = `Emigrate to ${city.nameEN} — Complete Guide | paymap`;
  const description = `Step-by-step guide for emigrants: bureaucracy, tax planning, banking, insurance, housing and more for ${city.nameEN}. ${data.totalSteps} verified steps.`;
  const url = `${BASE}/en/emigrate/${params.slug}`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { 'de': `${BASE}/de/auswandern/${dbSlug}` },
    },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      images: [{ url: `${BASE}/og/emigrate/${params.slug}`, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

function buildHowToSchema(data: ReturnType<typeof getCityGuide> extends Promise<infer T> ? NonNullable<T> : never) {
  const steps = data.sections.flatMap((s) => s.steps).slice(0, 12);
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to emigrate to ${data.city.nameEN} — Step by Step`,
    description: `Complete emigration guide for ${data.city.nameEN} with ${data.totalSteps} verified steps.`,
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.titleEN || s.titleDE,
      text: s.infoBoxEN ?? s.infoBoxDE ?? s.subtitleEN ?? s.timingEN,
    })),
  };
}

function buildFAQSchema(data: ReturnType<typeof getCityGuide> extends Promise<infer T> ? NonNullable<T> : never) {
  const highRiskSteps = data.sections
    .flatMap((s) => s.steps)
    .filter((s) => s.riskLevel === 'high' && (s.infoBoxEN || s.infoBoxDE))
    .slice(0, 5);
  if (highRiskSteps.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: highRiskSteps.map((s) => ({
      '@type': 'Question',
      name: s.titleEN || s.titleDE,
      acceptedAnswer: { '@type': 'Answer', text: s.infoBoxEN ?? s.infoBoxDE },
    })),
  };
}

function buildBreadcrumbSchema(enSlug: string, cityName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'paymap', item: `${BASE}/en` },
      { '@type': 'ListItem', position: 2, name: 'Emigration Guides', item: `${BASE}/en/emigrate` },
      { '@type': 'ListItem', position: 3, name: `Emigrate to ${cityName}`, item: `${BASE}/en/emigrate/${enSlug}` },
    ],
  };
}

export default async function EmigratePage({ params }: Props) {
  setRequestLocale(params.locale);
  const dbSlug = resolveDbSlug(params.slug);

  const [data, cityId] = await Promise.all([
    getCityGuide(dbSlug),
    isPremiumCity(dbSlug) ? getCityIdBySlug(dbSlug) : Promise.resolve(null),
  ]);

  if (!data) notFound();

  const premiumData = cityId ? await getPremiumCityData(cityId) : null;

  const howToSchema = buildHowToSchema(data);
  const faqSchema = buildFAQSchema(data);
  const breadcrumbSchema = buildBreadcrumbSchema(params.slug, data.city.nameEN);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="mx-auto max-w-reading space-y-8 px-4 py-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-caption uppercase tracking-[0.04em] text-text-3">
            <a href="/en/emigrate" className="focus-ring rounded-sm transition-colors hover:text-text">Emigration Guides</a>
            <span>/</span>
            <span>{data.city.nameEN}</span>
          </div>
          <h1 className="text-h1 text-text">
            {data.city.flag} Emigrate to {data.city.nameEN}
          </h1>
          <p className="text-body text-text-2">
            {data.totalSteps} verified steps · {data.sections.length} topic areas
            {data.highRiskCount > 0 && ` · ${data.highRiskCount} high-risk notices`}
            {premiumData && ' · Premium Guide'}
          </p>
          {data.highRiskCount > 0 && (
            <div className="rounded-md border-l-2 border-neg bg-surface-sub px-4 py-3 text-sm leading-relaxed text-neg">
              This guide contains <strong className="text-text">{data.highRiskCount} notices of high legal/tax risk</strong>. Consult a tax advisor with international expertise before relocating.
            </div>
          )}
        </div>

        {/* Guide content */}
        <CityGuideContent data={data} locale="en" />

        {/* Premium content */}
        {premiumData && (
          <PremiumCityContent
            data={premiumData}
            citySlug={dbSlug}
            locale="en"
          />
        )}
      </div>
    </>
  );
}
