import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { getCityGuide, getAllCitySlugs } from '@/lib/city-guide';
import { getPremiumCityData, getCityIdBySlug } from '@/lib/premium-city-data';
import { isPremiumCity } from '@/lib/premium-content';
import CityGuideContent from '@/components/guide/CityGuideContent';
import { PremiumCityContent } from '@/components/cities/PremiumCityContent';

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://paymap.io').replace(/\/$/, '');

type Props = { params: { locale: string; slug: string } };

export async function generateStaticParams() {
  const slugs = await getAllCitySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getCityGuide(params.slug);
  if (!data) return {};
  const { city } = data;
  const title = `Auswandern nach ${city.nameDE} — Vollständiger Guide | paymap`;
  const description = `Schritt-für-Schritt-Guide für Auswanderer: Bürokratie, Steuerplanung, Banking, Versicherung, Wohnen und mehr für ${city.nameDE}. ${data.totalSteps} geprüfte Schritte.`;
  const url = `${BASE}/de/auswandern/${params.slug}`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { 'en': `${BASE}/en/emigrate/${params.slug}` },
    },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      images: [{ url: `${BASE}/og/auswandern/${params.slug}`, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

function buildHowToSchema(data: ReturnType<typeof getCityGuide> extends Promise<infer T> ? NonNullable<T> : never) {
  const steps = data.sections.flatMap((s) => s.steps).slice(0, 12);
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `Auswandern nach ${data.city.nameDE} — Schritt-für-Schritt`,
    description: `Vollständiger Auswanderungs-Guide für ${data.city.nameDE} mit ${data.totalSteps} geprüften Schritten.`,
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.titleDE,
      text: s.infoBoxDE ?? s.subtitleDE ?? s.timingDE,
    })),
  };
}

function buildFAQSchema(data: ReturnType<typeof getCityGuide> extends Promise<infer T> ? NonNullable<T> : never) {
  const highRiskSteps = data.sections
    .flatMap((s) => s.steps)
    .filter((s) => s.riskLevel === 'high' && s.infoBoxDE)
    .slice(0, 5);
  if (highRiskSteps.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: highRiskSteps.map((s) => ({
      '@type': 'Question',
      name: s.titleDE,
      acceptedAnswer: { '@type': 'Answer', text: s.infoBoxDE },
    })),
  };
}

function buildBreadcrumbSchema(slug: string, cityName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'paymap', item: `${BASE}/de` },
      { '@type': 'ListItem', position: 2, name: 'Auswandern-Guides', item: `${BASE}/de/auswandern` },
      { '@type': 'ListItem', position: 3, name: `Auswandern nach ${cityName}`, item: `${BASE}/de/auswandern/${slug}` },
    ],
  };
}

export default async function AuswandernPage({ params }: Props) {
  setRequestLocale(params.locale);

  const [data, cityId] = await Promise.all([
    getCityGuide(params.slug),
    isPremiumCity(params.slug) ? getCityIdBySlug(params.slug) : Promise.resolve(null),
  ]);

  if (!data) notFound();

  const premiumData = cityId ? await getPremiumCityData(cityId) : null;

  const howToSchema = buildHowToSchema(data);
  const faqSchema = buildFAQSchema(data);
  const breadcrumbSchema = buildBreadcrumbSchema(params.slug, data.city.nameDE);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="mx-auto max-w-reading space-y-8 px-4 py-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-caption uppercase tracking-[0.04em] text-text-3">
            <a href="/de/auswandern" className="focus-ring rounded-sm transition-colors hover:text-text">Auswandern-Guides</a>
            <span>/</span>
            <span>{data.city.nameDE}</span>
          </div>
          <h1 className="text-h1 text-text">
            {data.city.flag} Auswandern nach {data.city.nameDE}
          </h1>
          <p className="text-body text-text-2">
            {data.totalSteps} geprüfte Schritte · {data.sections.length} Themenbereiche
            {data.highRiskCount > 0 && ` · ${data.highRiskCount} Hochrisiko-Hinweise`}
            {premiumData && ' · Premium-Guide'}
          </p>
          {data.highRiskCount > 0 && (
            <div className="rounded-md border-l-2 border-neg bg-surface-sub px-4 py-3 text-sm leading-relaxed text-neg">
              Dieser Guide enthält <strong className="text-text">{data.highRiskCount} Hinweise mit hohem rechtlichen/steuerlichen Risiko</strong>. Konsultiere vor dem Wegzug einen Steuerberater mit internationalem Profil.
            </div>
          )}
        </div>

        {/* Guide content */}
        <CityGuideContent data={data} locale="de" />

        {/* Premium content */}
        {premiumData && (
          <PremiumCityContent
            data={premiumData}
            citySlug={params.slug}
            locale={params.locale}
          />
        )}
      </div>
    </>
  );
}
