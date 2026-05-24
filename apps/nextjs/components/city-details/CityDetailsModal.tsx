'use client';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { formatCurrency, cn } from '@/lib/utils';
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

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-on-surface-variant">{label}</span>
        <span className="text-xs font-bold text-on-surface tabular-nums">{value}</span>
      </div>
      <div className="w-full bg-outline-variant/30 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full bg-primary transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const t = useTranslations('cityDetails');
  if (confidence >= 80) {
    return <span className="text-[10px] bg-green-100 text-green-700 rounded px-1.5 py-0.5 font-medium">{t('confidence.verified')}</span>;
  }
  if (confidence >= 50) {
    return <span className="text-[10px] bg-amber-100 text-amber-700 rounded px-1.5 py-0.5 font-medium">{t('confidence.estimated')}</span>;
  }
  return <span className="text-[10px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5 font-medium">{t('confidence.approximate')}</span>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/30 pb-2">
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
                'rounded-xl border border-outline-variant/40 px-3.5 py-3 space-y-1',
                isHigh && 'border-l-4 border-l-error/70 bg-error/5',
                isMedium && 'border-l-4 border-l-warning/70 bg-warning/5',
              )}
            >
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <p className="text-sm font-semibold text-on-surface leading-snug flex-1">{title}</p>
                <div className="flex gap-1.5 shrink-0 flex-wrap">
                  {isHigh && (
                    <span className="text-[10px] font-bold bg-error text-on-error px-2 py-0.5 rounded-full">
                      {t('guidePreview.highRisk')}
                    </span>
                  )}
                  {isMedium && (
                    <span className="text-[10px] font-bold bg-warning text-on-surface px-2 py-0.5 rounded-full">
                      {t('guidePreview.mediumRisk')}
                    </span>
                  )}
                  {step.requiresLegalAdvice && (
                    <span className="text-[10px] font-semibold bg-error-container/60 text-error px-2 py-0.5 rounded-full">
                      {t('guidePreview.legalAdvice')}
                    </span>
                  )}
                </div>
              </div>
              {subtitle && <p className="text-xs text-on-surface-variant">{subtitle}</p>}
              <p className="text-xs text-on-surface-variant">{timing}</p>
            </div>
          );
        })}
      </div>
      <a
        href={link}
        className="inline-flex items-center text-sm text-primary font-semibold hover:text-primary/80 transition-colors mt-1"
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
            <div key={i} className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 space-y-1">
              <p className="text-sm font-semibold text-on-surface">
                {locale === 'de' ? r.nameDE : r.nameEN}
                {r.flatRate != null && (
                  <span className="ml-2 text-xs bg-primary/10 text-primary rounded px-1.5 py-0.5 font-medium">
                    {(r.flatRate * 100).toFixed(0)} % Flat Tax
                  </span>
                )}
              </p>
              {r.conditionsDE && (
                <p className="text-xs text-on-surface-variant leading-relaxed">{r.conditionsDE}</p>
              )}
            </div>
          ))}
        </div>
      )}
      {finances.salaryBenchmarkEUR != null && (
        <p className="text-sm text-on-surface-variant">
          {t('finances.salaryMedian')}:{' '}
          <span className="font-bold text-on-surface">{formatCurrency(finances.salaryBenchmarkEUR, 'EUR', 0)} {t('finances.perYear')}</span>
        </p>
      )}
      {finances.referenceNetMonthly > 0 && (
        <p className="text-sm text-on-surface-variant">
          {t('finances.referenceNet')}: <span className="font-bold text-on-surface">{formatCurrency(finances.referenceNetMonthly)} {t('finances.perMonth')}</span>
          {' '}
          <span className="text-xs text-on-surface-variant">
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
        <p className="text-sm font-semibold text-on-surface">
          {t('col.total')}: <span className="text-primary">{formatCurrency(costOfLiving.totalMonthlyEUR)} {t('finances.perMonth')}</span>
        </p>
      )}
      {costOfLiving.items.length > 0 && (
        <div className="space-y-2">
          {costOfLiving.items.map((item) => (
            <div key={item.category} className="flex items-center justify-between gap-2">
              <span className="text-sm text-on-surface-variant">
                {t((COL_CATEGORY_KEYS[item.category] ?? `cityDetails.col.${item.category}`) as Parameters<typeof t>[0])}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <ConfidenceBadge confidence={item.confidence} />
                <span className="text-sm font-medium text-on-surface tabular-nums">
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
        <ScoreBar key={k} label={t((LIFESTYLE_LABEL_KEYS[k] ?? k) as Parameters<typeof t>[0])} value={v} />
      ))}
      {safety.hospitalCount != null && (
        <p className="text-sm text-on-surface-variant">
          🏥 {safety.hospitalCount} {t('safety.hospitals')}
        </p>
      )}
      {safety.consulates.map((c, i) => (
        <p key={i} className="text-sm text-on-surface-variant">
          🇩🇪 {c.website ? (
            <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              {c.name}
            </a>
          ) : c.name}
        </p>
      ))}
    </Section>
  ) : null;

  // ── Climate ───────────────────────────────────────────────────────────
  const climateSection = climate ? (
    <Section title={t('sections.climate')}>
      {new Date(climate.updatedAt).getTime() < STALE_BEFORE && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {t('weather.veryOld')}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface-container rounded-xl px-3 py-2.5 space-y-0.5">
          <p className="text-xs text-on-surface-variant">☀️ {t('climate.sunshineDays')}</p>
          <p className="text-sm font-bold text-on-surface">{climate.sunshineDays} {t('finances.perYear')}</p>
        </div>
        <div className="bg-surface-container rounded-xl px-3 py-2.5 space-y-0.5">
          <p className="text-xs text-on-surface-variant">🌧 {t('climate.rainyDays')}</p>
          <p className="text-sm font-bold text-on-surface">{climate.rainyDays} {t('finances.perYear')}</p>
        </div>
        <div className="bg-surface-container rounded-xl px-3 py-2.5 space-y-0.5">
          <p className="text-xs text-on-surface-variant">🌡 {t('climate.summerAvg')}</p>
          <p className="text-sm font-bold text-on-surface">{climate.avgTempSummer.toFixed(1)} °C</p>
        </div>
        <div className="bg-surface-container rounded-xl px-3 py-2.5 space-y-0.5">
          <p className="text-xs text-on-surface-variant">❄ {t('climate.winterAvg')}</p>
          <p className="text-sm font-bold text-on-surface">{climate.avgTempWinter.toFixed(1)} °C</p>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-on-surface-variant">{t('climate.sunshineIndex')}</span>
          <span className="text-xs font-bold text-on-surface tabular-nums">{Math.min(100, Math.round((climate.sunshineDays / 365) * 100))}</span>
        </div>
        <div className="w-full bg-outline-variant/30 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full bg-amber-400 transition-all"
            style={{ width: `${Math.min(100, Math.round((climate.sunshineDays / 365) * 100))}%` }}
          />
        </div>
      </div>
    </Section>
  ) : null;

  // ── Outdoor ───────────────────────────────────────────────────────────
  const outdoorSection = (Object.keys(outdoor.scores).length > 0 || outdoor.coworkingCount != null) ? (
    <Section title={t('sections.outdoor')}>
      {Object.entries(outdoor.scores).map(([k, v]) => (
        <ScoreBar key={k} label={t((LIFESTYLE_LABEL_KEYS[k] ?? k) as Parameters<typeof t>[0])} value={v} />
      ))}
      {outdoor.coworkingCount != null && (
        <p className="text-sm text-on-surface-variant">
          💻 {outdoor.coworkingCount} {t('outdoor.coworking')}
        </p>
      )}
    </Section>
  ) : null;

  // ── Social ────────────────────────────────────────────────────────────
  const socialSection = (Object.keys(social.scores).length > 0 || social.restaurantCount != null || social.germanSchools.length > 0) ? (
    <Section title={t('sections.social')}>
      {Object.entries(social.scores).map(([k, v]) => (
        <ScoreBar key={k} label={t((LIFESTYLE_LABEL_KEYS[k] ?? k) as Parameters<typeof t>[0])} value={v} />
      ))}
      {(social.restaurantCount != null || social.barCount != null) && (
        <p className="text-sm text-on-surface-variant">
          🍽 {[
            social.restaurantCount != null && `${social.restaurantCount} ${t('social.restaurants')}`,
            social.barCount != null && `${social.barCount} ${t('social.bars')}`,
          ].filter(Boolean).join(', ')}
        </p>
      )}
      {social.germanSchools.map((s, i) => (
        <p key={i} className="text-sm text-on-surface-variant">🎓 {s.name}</p>
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
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      aria-hidden={!slug}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="city-modal-title"
        className="relative z-10 w-full md:max-w-3xl md:mx-4 flex flex-col max-h-[90vh] md:max-h-[85vh] bg-background rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-background border-b border-outline-variant/40 px-5 py-4 flex items-center gap-3">
          {data && (
            <span className="text-2xl leading-none" aria-hidden="true">{data.city.flag}</span>
          )}
          <div className="flex-1 min-w-0">
            <h2
              id="city-modal-title"
              className="text-title-lg font-bold text-on-background truncate"
            >
              {cityName}
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          {loading && (
            <div className="p-5 space-y-4 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-24 bg-surface-container rounded" />
                  <div className="h-4 w-full bg-surface-container rounded" />
                  <div className="h-4 w-3/4 bg-surface-container rounded" />
                </div>
              ))}
            </div>
          )}
          {!loading && data && (
            <ModalContent data={data} locale={locale} />
          )}
          {!loading && !data && (
            <div className="p-10 text-center text-on-surface-variant text-sm">
              {t('nodata')}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
