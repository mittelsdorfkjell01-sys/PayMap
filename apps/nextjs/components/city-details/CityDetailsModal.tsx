'use client';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { X, Hospital, Laptop, Utensils, GraduationCap, Sun, CloudRain, Thermometer, Snowflake } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { ScoreBar } from '@/components/ui/ScoreBar';
import { StatusDot } from '@/components/ui/StatusDot';
import { Badge } from '@/components/ui/badge';
import type { CityDetailResponse } from '@/app/api/city/[slug]/route';

// ─── helpers ──────────────────────────────────────────────────────────────────

const STALE_BEFORE = new Date('2026-04-01').getTime();

const COL_CATEGORY_KEYS: Record<string, string> = {
  rent_outside_1br: 'cityDetails.col.rent',
  groceries_monthly: 'cityDetails.col.groceries',
  transport_monthly: 'cityDetails.col.transport',
  utilities_monthly: 'cityDetails.col.utilities',
};

const LIFESTYLE_LABEL_KEYS: Record<string, string> = {
  // Safety & Stability section
  crime_index:                 'cityDetails.lifestyle.crimeIndex',
  political_stability:         'cityDetails.lifestyle.stability',
  political_freedom:           'cityDetails.lifestyle.politicalFreedom',
  naturkatastrophen_resilienz: 'cityDetails.lifestyle.disaster',
  // Health & Environment section
  healthcare_quality:          'cityDetails.lifestyle.healthcare',
  air_quality_pm25:            'cityDetails.lifestyle.airQuality',
  water_drinkable:             'cityDetails.lifestyle.water',
  // Community & Connectivity section
  english_proficiency:         'cityDetails.lifestyle.english',
  lgbtq_acceptance:            'cityDetails.lifestyle.lgbtq',
  internet_speed_combined:     'cityDetails.lifestyle.internet',
  direct_flight_to_germany:    'cityDetails.lifestyle.flights',
};

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <span className="text-sm text-text-2">{label}</span>
      <ScoreBar value={value} aria-label={label} />
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const t = useTranslations('cityDetails');
  const tone = confidence >= 80 ? 'pos' : confidence >= 50 ? 'warn' : 'neg';
  const label = confidence >= 80 ? t('confidence.verified') : confidence >= 50 ? t('confidence.estimated') : t('confidence.approximate');
  return <StatusDot tone={tone} label={label} />;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="border-b border-line pb-2 text-caption uppercase tracking-[0.04em] text-text-3">
        {title}
      </h3>
      {children}
    </section>
  );
}

// ─── Modal content ─────────────────────────────────────────────────────────────

function GuidePreviewSection({ data, locale }: { data: CityDetailResponse; locale: string }) {
  const t = useTranslations('cityDetails');
  const { guidePreview } = data;
  if (!guidePreview || guidePreview.steps.length === 0) return null;
  const isDE = locale === 'de';
  const link = isDE ? guidePreview.linkDE : guidePreview.linkEN;

  return (
    <Section title={t('guidePreview.title')}>
      <div className="space-y-2">
        {guidePreview.steps.map((step, i) => {
          const title = isDE ? step.titleDE : step.titleEN;
          const subtitle = isDE ? step.subtitleDE : step.subtitleEN;
          const timing = isDE ? step.timingDE : step.timingEN;
          const isHigh = step.riskLevel === 'high';
          const isMedium = step.riskLevel === 'medium';
          return (
            <div
              key={i}
              className={cn(
                'space-y-1 rounded-md border border-line px-3.5 py-3',
                isHigh && 'border-l-2 border-l-neg',
                isMedium && 'border-l-2 border-l-warn',
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="flex-1 text-sm leading-snug text-text">{title}</p>
                <div className="flex shrink-0 flex-wrap items-center gap-3">
                  {isHigh && <StatusDot tone="neg" label={t('guidePreview.highRisk')} />}
                  {isMedium && <StatusDot tone="warn" label={t('guidePreview.mediumRisk')} />}
                  {step.requiresLegalAdvice && (
                    <span className="text-caption text-neg">{t('guidePreview.legalAdvice')}</span>
                  )}
                </div>
              </div>
              {subtitle && <p className="text-caption text-text-2">{subtitle}</p>}
              <p className="text-caption text-text-3">{timing}</p>
            </div>
          );
        })}
      </div>
      <a
        href={link}
        className="focus-ring mt-1 inline-flex items-center rounded-sm text-sm text-focus transition-colors hover:underline"
      >
        {t('guidePreview.viewFull')}
      </a>
    </Section>
  );
}

function ModalContent({ data, locale }: { data: CityDetailResponse; locale: string }) {
  const t = useTranslations('cityDetails');
  const tResults = useTranslations('results');

  const { finances, costOfLiving, safety, climate, outdoor, social } = data;
  const cityName = locale === 'de' ? data.city.nameDE : data.city.nameEN;

  // ── Finance ──────────────────────────────────────────────────────────
  const financeSection = (
    <Section title={t('sections.finances')}>
      {finances.specialRegimes.length > 0 && (
        <div className="space-y-2">
          {finances.specialRegimes.map((r, i) => (
            <div key={i} className="space-y-1 rounded-md bg-surface-sub px-4 py-3">
              <p className="flex flex-wrap items-center gap-2 text-sm text-text">
                {locale === 'de' ? r.nameDE : r.nameEN}
                {r.flatRate != null && (
                  <Badge>{(r.flatRate * 100).toFixed(0)} % Flat Tax</Badge>
                )}
              </p>
              {r.conditionsDE && (
                <p className="text-caption leading-relaxed text-text-2">{r.conditionsDE}</p>
              )}
            </div>
          ))}
        </div>
      )}
      {finances.salaryBenchmarkEUR != null && (
        <p className="text-sm text-text-2">
          {t('finances.salaryMedian')}:{' '}
          <span className="tabular text-text">{formatCurrency(finances.salaryBenchmarkEUR, 'EUR', 0)} {t('finances.perYear')}</span>
        </p>
      )}
      {finances.referenceNetMonthly > 0 && (
        <p className="text-sm text-text-2">
          {t('finances.referenceNet')}: <span className="tabular text-text">{formatCurrency(finances.referenceNetMonthly)} {t('finances.perMonth')}</span>
          {' '}
          <span className="text-caption text-text-3">
            ({tResults('effectiveTaxRate')}: {(finances.referenceEffectiveRate * 100).toFixed(1)} %)
          </span>
        </p>
      )}
    </Section>
  );

  // ── Cost of Living ────────────────────────────────────────────────────
  const colSection = costOfLiving.items.length > 0 || costOfLiving.totalMonthlyEUR != null ? (
    <Section title={t('sections.cost')}>
      {costOfLiving.totalMonthlyEUR != null && (
        <p className="text-sm text-text">
          {t('col.total')}: <span className="tabular text-text">{formatCurrency(costOfLiving.totalMonthlyEUR)} {t('finances.perMonth')}</span>
        </p>
      )}
      {costOfLiving.items.length > 0 && (
        <div className="space-y-2">
          {costOfLiving.items.map((item) => (
            <div key={item.category} className="flex items-center justify-between gap-2">
              <span className="text-sm text-text-2">
                {t((COL_CATEGORY_KEYS[item.category] ?? `cityDetails.col.${item.category}`) as Parameters<typeof t>[0])}
              </span>
              <div className="flex shrink-0 items-center gap-2">
                <ConfidenceBadge confidence={item.confidence} />
                <span className="text-data-sm tabular text-text">
                  {formatCurrency(item.valueEUR)} {t('finances.perMonth')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  ) : null;

  // ── Safety ────────────────────────────────────────────────────────────
  const safetySection = (Object.keys(safety.scores).length > 0 || safety.hospitalCount != null || safety.consulates.length > 0) ? (
    <Section title={t('sections.safety')}>
      {Object.entries(safety.scores).map(([k, v]) => (
        <ScoreRow key={k} label={t((LIFESTYLE_LABEL_KEYS[k] ?? k) as Parameters<typeof t>[0])} value={v} />
      ))}
      {safety.hospitalCount != null && (
        <p className="flex items-center gap-2 text-sm text-text-2">
          <Hospital className="h-4 w-4 text-text-3" aria-hidden /> {safety.hospitalCount} {t('safety.hospitals')}
        </p>
      )}
      {safety.consulates.map((c, i) => (
        <p key={i} className="text-sm text-text-2">
          🇩🇪 {c.website ? (
            <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-focus hover:underline">
              {c.name}
            </a>
          ) : c.name}
        </p>
      ))}
    </Section>
  ) : null;

  // ── Climate ───────────────────────────────────────────────────────────
  const sunshinePct = climate ? Math.min(100, Math.round((climate.sunshineDays / 365) * 100)) : 0;
  const climateSection = climate ? (
    <Section title={t('sections.climate')}>
      {new Date(climate.updatedAt).getTime() < STALE_BEFORE && (
        <p className="rounded-md border-l-2 border-warn bg-surface-sub px-3 py-2 text-caption text-warn">
          {t('weather.veryOld')}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-0.5 rounded-md bg-surface-sub px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-caption text-text-3"><Sun className="h-3.5 w-3.5" aria-hidden /> {t('climate.sunshineDays')}</p>
          <p className="text-data-sm tabular text-text">{climate.sunshineDays} {t('finances.perYear')}</p>
        </div>
        <div className="space-y-0.5 rounded-md bg-surface-sub px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-caption text-text-3"><CloudRain className="h-3.5 w-3.5" aria-hidden /> {t('climate.rainyDays')}</p>
          <p className="text-data-sm tabular text-text">{climate.rainyDays} {t('finances.perYear')}</p>
        </div>
        <div className="space-y-0.5 rounded-md bg-surface-sub px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-caption text-text-3"><Thermometer className="h-3.5 w-3.5" aria-hidden /> {t('climate.summerAvg')}</p>
          <p className="text-data-sm tabular text-text">{climate.avgTempSummer.toFixed(1)} °C</p>
        </div>
        <div className="space-y-0.5 rounded-md bg-surface-sub px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-caption text-text-3"><Snowflake className="h-3.5 w-3.5" aria-hidden /> {t('climate.winterAvg')}</p>
          <p className="text-data-sm tabular text-text">{climate.avgTempWinter.toFixed(1)} °C</p>
        </div>
      </div>
      <ScoreRow label={t('climate.sunshineIndex')} value={sunshinePct} />
    </Section>
  ) : null;

  // ── Outdoor ───────────────────────────────────────────────────────────
  const outdoorSection = (Object.keys(outdoor.scores).length > 0 || outdoor.coworkingCount != null) ? (
    <Section title={t('sections.outdoor')}>
      {Object.entries(outdoor.scores).map(([k, v]) => (
        <ScoreRow key={k} label={t((LIFESTYLE_LABEL_KEYS[k] ?? k) as Parameters<typeof t>[0])} value={v} />
      ))}
      {outdoor.coworkingCount != null && (
        <p className="flex items-center gap-2 text-sm text-text-2">
          <Laptop className="h-4 w-4 text-text-3" aria-hidden /> {outdoor.coworkingCount} {t('outdoor.coworking')}
        </p>
      )}
    </Section>
  ) : null;

  // ── Social ────────────────────────────────────────────────────────────
  const socialSection = (Object.keys(social.scores).length > 0 || social.restaurantCount != null || social.germanSchools.length > 0) ? (
    <Section title={t('sections.social')}>
      {Object.entries(social.scores).map(([k, v]) => (
        <ScoreRow key={k} label={t((LIFESTYLE_LABEL_KEYS[k] ?? k) as Parameters<typeof t>[0])} value={v} />
      ))}
      {(social.restaurantCount != null || social.barCount != null) && (
        <p className="flex items-center gap-2 text-sm text-text-2">
          <Utensils className="h-4 w-4 text-text-3" aria-hidden /> {[
            social.restaurantCount != null && `${social.restaurantCount} ${t('social.restaurants')}`,
            social.barCount != null && `${social.barCount} ${t('social.bars')}`,
          ].filter(Boolean).join(', ')}
        </p>
      )}
      {social.germanSchools.map((s, i) => (
        <p key={i} className="flex items-center gap-2 text-sm text-text-2"><GraduationCap className="h-4 w-4 text-text-3" aria-hidden /> {s.name}</p>
      ))}
    </Section>
  ) : null;

  return (
    <div className="space-y-6 p-5">
      <GuidePreviewSection data={data} locale={locale} />
      {financeSection}
      {colSection}
      {safetySection}
      {climateSection}
      {outdoorSection}
      {socialSection}
    </div>
  );
}

// ─── Main modal ────────────────────────────────────────────────────────────────

interface CityDetailsModalProps {
  slug: string | null;
  onClose: () => void;
}

export function CityDetailsModal({ slug, onClose }: CityDetailsModalProps) {
  const t = useTranslations('cityDetails');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [data, setData] = useState<CityDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  // URL sync
  useEffect(() => {
    if (!mounted) return;
    if (slug) {
      router.replace(`${pathname}?city=${slug}`, { scroll: false } as Parameters<typeof router.replace>[1]);
      document.body.style.overflow = 'hidden';
      setTimeout(() => closeBtnRef.current?.focus(), 50);
    } else {
      router.replace(pathname, { scroll: false } as Parameters<typeof router.replace>[1]);
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, mounted]);

  // ESC key
  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (slug) document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [slug, onClose]);

  // Data fetch
  useEffect(() => {
    if (!slug) { setData(null); return; }
    setLoading(true);
    fetch(`/api/city/${slug}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (!mounted || !slug) return null;

  const cityName = data ? (locale === 'de' ? data.city.nameDE : data.city.nameEN) : slug;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center"
      aria-hidden={!slug}
    >
      {/* Backdrop — ohne Blur (Spec §6) */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(14,14,14,0.4)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="city-modal-title"
        className="relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-xl border-t border-line bg-surface shadow-float md:mx-4 md:max-h-[85vh] md:max-w-3xl md:rounded-xl md:border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag-Handle nur mobil */}
        <div className="flex justify-center pt-2 md:hidden" aria-hidden>
          <span className="h-1 w-9 rounded-full bg-line-strong" />
        </div>

        {/* Sticky header */}
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-surface px-5 py-4">
          {data && (
            <span className="text-2xl leading-none" aria-hidden="true">{data.city.flag}</span>
          )}
          <div className="min-w-0 flex-1">
            <h2 id="city-modal-title" className="truncate text-h2 text-text">
              {cityName}
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-text-3 transition-colors hover:text-text"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="animate-pulse space-y-4 p-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-24 rounded bg-surface-sub" />
                  <div className="h-4 w-full rounded bg-surface-sub" />
                  <div className="h-4 w-3/4 rounded bg-surface-sub" />
                </div>
              ))}
            </div>
          )}
          {!loading && data && (
            <ModalContent data={data} locale={locale} />
          )}
          {!loading && !data && (
            <div className="p-10 text-center text-sm text-text-2">
              {t('nodata')}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
