import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { getCityGuide, getAllCitySlugs } from '@/lib/city-guide';
import { resolveDbSlug, toEnSlug } from '@/lib/city-guide-slugs';
import CityGuideContent from '@/components/guide/CityGuideContent';

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
      images: [{ url: `${BASE}/og/auswandern/${dbSlug}`, width: 1200, height: 630, alt: title }],
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

export default async function EmigratePage({ params }: Props) {
  setRequestLocale(params.locale);
  const dbSlug = resolveDbSlug(params.slug);
  const data = await getCityGuide(dbSlug);
  if (!data) notFound();

  const howToSchema = buildHowToSchema(data);
  const faqSchema = buildFAQSchema(data);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      <div className="max-w-3xl mx-auto space-y-8 px-4 py-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-label-sm text-on-surface-variant uppercase tracking-wider">
            <a href="/en/emigrate" className="hover:text-primary transition-colors">Emigration Guides</a>
            <span>/</span>
            <span>{data.city.nameEN}</span>
          </div>
          <h1 className="text-headline-xl-mobile md:text-headline-lg font-bold text-on-background">
            {data.city.flag} Emigrate to {data.city.nameEN}
          </h1>
          <p className="text-body-lg text-on-surface-variant">
            {data.totalSteps} verified steps · {data.sections.length} topic areas
            {data.highRiskCount > 0 && ` · ${data.highRiskCount} high-risk notices`}
          </p>
          {data.highRiskCount > 0 && (
            <div className="border border-error/30 bg-error/5 rounded-xl px-4 py-3 text-body-sm text-error leading-relaxed">
              ⚠ This guide contains <strong>{data.highRiskCount} notices of high legal/tax risk</strong>. Consult a tax advisor with international expertise before relocating.
            </div>
          )}
        </div>

        {/* Guide content */}
        <CityGuideContent data={data} locale="en" />
      </div>
    </>
  );
}
