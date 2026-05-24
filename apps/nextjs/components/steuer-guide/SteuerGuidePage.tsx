'use client';
import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { calculate, calculateApproximate } from '@paymap/tax-engine';

interface SpecialRegime {
  id: string;
  slug: string;
  nameDE: string;
  nameEN: string;
  flatRate: number;
  durationYears: number;
  qualifications: string[];
  conditionsDE: string;
  conditionsEN: string;
  validFrom: string;
  validTo: string | null;
  sourceUrl: string;
  sourceDE: string;
  riskLevel: string;
  requiresLegalAdvice: boolean;
  disclaimerDE: string | null;
  disclaimerEN: string | null;
  updatedAt: string;
  country: { slug: string; nameDE: string; nameEN: string };
}

type Filter = 'all' | 'employed' | 'freelancer' | 'euOnly' | 'nonEu' | 'flatTax' | 'zeroTax';

const EU_COUNTRIES = new Set(['de', 'at', 'ch', 'nl', 'pt', 'es', 'fr', 'it', 'ie', 'ee', 'pl', 'cz', 'hu', 'ro']);

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(0)} %`;
}

// ─── Schnellrechner ────────────────────────────────────────────────────────────

function QuickCalculator({ regimes }: { regimes: SpecialRegime[] }) {
  const t = useTranslations('steuerGuide');
  const [gross, setGross] = useState('80000');
  const [homeCountry, setHomeCountry] = useState('de');
  const [regimeId, setRegimeId] = useState('');
  const [result, setResult] = useState<{
    netStandard: number;
    netWithRegime: number;
    savingsYear: number;
    savingsTotal: number;
    duration: number;
  } | null>(null);

  function calculate_() {
    const g = parseFloat(gross);
    if (!g || !regimeId) return;

    const selectedRegime = regimes.find((r) => r.slug === regimeId);
    if (!selectedRegime) return;

    const year = new Date().getFullYear();
    try {
      const standard = calculateApproximate(homeCountry, g, 'EUR', year);
      const withRegime = calculateApproximate(selectedRegime.country.slug, g, 'EUR', year);
      // Rough: withRegime netto but with flat rate override
      const taxableWithRegime = g;
      const taxWithRegime = taxableWithRegime * selectedRegime.flatRate;
      const netWithRegime = g - taxWithRegime;
      const savingsYear = netWithRegime - standard.netAnnual;
      setResult({
        netStandard: standard.netAnnual,
        netWithRegime,
        savingsYear,
        savingsTotal: savingsYear * selectedRegime.durationYears,
        duration: selectedRegime.durationYears,
      });
    } catch {
      // ignore unknown country
    }
  }

  const countries = [
    { code: 'de', name: 'Deutschland' },
    { code: 'at', name: 'Österreich' },
    { code: 'ch', name: 'Schweiz' },
    { code: 'nl', name: 'Niederlande' },
    { code: 'fr', name: 'Frankreich' },
    { code: 'it', name: 'Italien' },
    { code: 'es', name: 'Spanien' },
    { code: 'us', name: 'USA' },
  ];

  return (
    <div className="glass-card p-6 space-y-5 shadow-sm">
      <h2 className="text-headline-sm font-semibold text-on-surface">{t('quickCalc')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="label-field">{t('gross')}</label>
          <div className="relative">
            <input
              type="number"
              value={gross}
              onChange={(e) => setGross(e.target.value)}
              className="input-field pr-20"
              placeholder="80000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-label-sm text-on-surface-variant pointer-events-none uppercase tracking-wider">€/Jahr</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="label-field">{t('homeCountry')}</label>
          <select
            value={homeCountry}
            onChange={(e) => setHomeCountry(e.target.value)}
            className="input-field"
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="label-field">{t('targetRegime')}</label>
          <select
            value={regimeId}
            onChange={(e) => setRegimeId(e.target.value)}
            className="input-field"
          >
            <option value="">— Regime wählen —</option>
            {regimes.map((r) => (
              <option key={r.slug} value={r.slug}>{r.nameDE}</option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={calculate_}
        disabled={!gross || !regimeId}
        className="btn-primary"
      >
        {t('calculate')}
      </button>

      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-outline-variant/40">
          {[
            { label: t('netStandard'), value: formatCurrency(result.netStandard), sub: '/Jahr', color: '' },
            { label: t('netWithRegime'), value: formatCurrency(result.netWithRegime), sub: '/Jahr', color: '' },
            { label: t('savingsPerYear'), value: formatCurrency(result.savingsYear), sub: '/Jahr', color: result.savingsYear > 0 ? 'text-primary' : 'text-error' },
            { label: t('savingsOverDuration'), value: formatCurrency(result.savingsTotal), sub: `über ${result.duration} Jahre`, color: result.savingsTotal > 0 ? 'text-primary' : 'text-error' },
          ].map((item) => (
            <div key={item.label} className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-4 py-3 space-y-1">
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">{item.label}</p>
              <p className={cn('text-lg font-bold font-mono tabular-nums', item.color || 'text-on-surface')}>{item.value}</p>
              <p className="text-label-sm text-on-surface-variant">{item.sub}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Regime-Karte ─────────────────────────────────────────────────────────────

const RISK_STYLES: Record<string, string> = {
  low:    'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  high:   'bg-red-100 text-red-700',
};

function RegimeCard({ regime, locale }: { regime: SpecialRegime; locale: string }) {
  const t = useTranslations('steuerGuide');
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const isEU = EU_COUNTRIES.has(regime.country.slug);

  const name = locale === 'de' ? regime.nameDE : regime.nameEN;
  const conditions = locale === 'de' ? regime.conditionsDE : regime.conditionsEN;
  const disclaimer = locale === 'de' ? regime.disclaimerDE : regime.disclaimerEN;

  const riskLabel = t(`regime.risk_${regime.riskLevel}` as Parameters<typeof t>[0]);
  const riskCls = RISK_STYLES[regime.riskLevel] ?? 'bg-surface-container text-on-surface-variant';

  const badges = [
    { label: formatPercent(regime.flatRate), title: t('regime.taxRate') },
    { label: regime.durationYears >= 90 ? t('regime.unlimited') : t('regime.years').replace('{n}', String(regime.durationYears)), title: t('regime.duration') },
    { label: isEU ? 'EU' : 'Außerhalb EU', className: isEU ? 'bg-primary/10 text-primary' : 'bg-secondary-container/50 text-secondary' },
    { label: riskLabel, className: riskCls },
  ];

  const validFrom = new Date(regime.validFrom).getFullYear();
  const validTo = regime.validTo ? new Date(regime.validTo).getFullYear() : null;

  return (
    <div className={cn('glass-card shadow-sm overflow-hidden transition-all', expanded && 'ring-1 ring-primary/30')}>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-5 py-4 flex items-start gap-4 text-left hover:bg-surface-container-low/40 transition-colors"
      >
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-on-surface">{name}</span>
            <span className="text-label-sm text-on-surface-variant">· {regime.country.nameDE}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {badges.map((b, i) => (
              <span
                key={i}
                className={cn(
                  'text-label-sm px-2.5 py-0.5 rounded-full font-semibold',
                  b.className ?? 'bg-surface-container text-on-surface-variant',
                )}
              >
                {b.title ? `${b.title}: ` : ''}{b.label}
              </span>
            ))}
          </div>
        </div>
        <span className="text-on-surface-variant text-sm mt-1 shrink-0">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="border-t border-outline-variant/30 px-5 py-5 space-y-4">
          {/* Legal advice warning */}
          {regime.requiresLegalAdvice && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
              <span className="shrink-0 mt-0.5">⚠</span>
              <span className="font-medium">{t('regime.legalAdvice')}</span>
            </div>
          )}

          <p className="text-body-md text-on-surface leading-relaxed">{conditions}</p>

          {regime.qualifications.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-label-sm font-semibold text-on-surface uppercase tracking-wider">{t('regime.qualifications')}</p>
              <ul className="space-y-1">
                {(regime.qualifications as string[]).map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-body-md text-on-surface-variant">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-label-sm">
            <div>
              <span className="text-on-surface-variant">{t('regime.validFrom')}: </span>
              <span className="font-semibold text-on-surface">{validFrom}</span>
            </div>
            {validTo && (
              <div>
                <span className="text-on-surface-variant">{t('regime.validTo')}: </span>
                <span className="font-semibold text-on-surface">{validTo}</span>
              </div>
            )}
            <div className="col-span-2">
              <span className="text-on-surface-variant">{t('regime.source')}: </span>
              <a href={regime.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{regime.sourceDE}</a>
            </div>
          </div>

          {/* Disclaimer */}
          {disclaimer && (
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-4 py-3 space-y-1">
              <p className="text-label-sm font-semibold text-on-surface-variant uppercase tracking-wider">{t('regime.disclaimer')}</p>
              <p className="text-xs text-on-surface-variant leading-relaxed">{disclaimer}</p>
            </div>
          )}

          <button
            onClick={() => router.push(`/${locale}?toCity=${encodeURIComponent(regime.country.nameDE)}`)}
            className="btn-primary w-full sm:w-auto"
          >
            {t('regime.calcWithCountry').replace('{country}', regime.country.nameDE)}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function SteuerGuidePage() {
  const t = useTranslations('steuerGuide');
  const locale = useLocale();
  const [regimes, setRegimes] = useState<SpecialRegime[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    fetch('/api/regimes')
      .then((r) => r.json())
      .then(setRegimes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = regimes.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'euOnly') return EU_COUNTRIES.has(r.country.slug);
    if (filter === 'nonEu') return !EU_COUNTRIES.has(r.country.slug);
    if (filter === 'zeroTax') return r.flatRate === 0;
    if (filter === 'flatTax') return r.flatRate > 0 && r.flatRate <= 0.25;
    return true;
  });

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: t('filters.all') },
    { key: 'euOnly', label: t('filters.euOnly') },
    { key: 'nonEu', label: t('filters.nonEu') },
    { key: 'flatTax', label: t('filters.flatTax') },
    { key: 'zeroTax', label: t('filters.zeroTax') },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-headline-xl-mobile md:text-headline-lg font-bold text-on-background">{t('title')}</h1>
        <p className="text-body-lg text-on-surface-variant">{t('subtitle')}</p>
      </div>

      {/* Schnellrechner */}
      {!loading && <QuickCalculator regimes={regimes} />}

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'px-4 py-2 rounded-full text-label-sm font-semibold uppercase tracking-wider transition-colors',
              filter === f.key
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Regime Cards */}
      {loading && (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="glass-card h-20 bg-surface-container" />)}
        </div>
      )}

      {!loading && (
        <div className="space-y-3">
          {filtered.map((regime) => (
            <RegimeCard key={regime.id} regime={regime} locale={locale} />
          ))}
          {filtered.length === 0 && (
            <div className="border border-dashed border-outline-variant rounded-2xl p-12 text-center">
              <p className="text-on-surface-variant text-body-md">Keine Regime für diesen Filter.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
