'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { AlertTriangle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

// Token-styled native select (kein Select-Primitive nötig)
const SELECT_CLS =
  'h-11 w-full rounded-md border border-line bg-surface px-[14px] text-body text-text focus:border-focus focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--focus)_25%,transparent)] focus:outline-none';

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
    <div className="space-y-5 rounded-lg border border-line bg-surface p-6">
      <h2 className="text-h2 text-text">{t('quickCalc')}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label className="block text-sm text-text-2">{t('gross')}</label>
          <div className="relative">
            <Input
              type="number"
              value={gross}
              onChange={(e) => setGross(e.target.value)}
              className="pr-20"
              placeholder="80000"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-caption uppercase tracking-[0.04em] text-text-3">€/Jahr</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm text-text-2">{t('homeCountry')}</label>
          <select value={homeCountry} onChange={(e) => setHomeCountry(e.target.value)} className={SELECT_CLS}>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm text-text-2">{t('targetRegime')}</label>
          <select value={regimeId} onChange={(e) => setRegimeId(e.target.value)} className={SELECT_CLS}>
            <option value="">— Regime wählen —</option>
            {regimes.map((r) => (
              <option key={r.slug} value={r.slug}>{r.nameDE}</option>
            ))}
          </select>
        </div>
      </div>
      <Button onClick={calculate_} disabled={!gross || !regimeId}>
        {t('calculate')}
      </Button>

      {result && (
        <div className="grid grid-cols-2 gap-3 border-t border-line pt-4 sm:grid-cols-4">
          {[
            { label: t('netStandard'), value: formatCurrency(result.netStandard), sub: '/Jahr', color: '' },
            { label: t('netWithRegime'), value: formatCurrency(result.netWithRegime), sub: '/Jahr', color: '' },
            { label: t('savingsPerYear'), value: formatCurrency(result.savingsYear), sub: '/Jahr', color: result.savingsYear > 0 ? 'text-pos' : 'text-neg' },
            { label: t('savingsOverDuration'), value: formatCurrency(result.savingsTotal), sub: `über ${result.duration} Jahre`, color: result.savingsTotal > 0 ? 'text-pos' : 'text-neg' },
          ].map((item) => (
            <div key={item.label} className="space-y-1 rounded-md bg-surface-sub px-4 py-3">
              <p className="text-caption uppercase tracking-[0.04em] text-text-3">{item.label}</p>
              <p className={cn('text-data-md tabular', item.color || 'text-text')}>{item.value}</p>
              <p className="text-caption text-text-3">{item.sub}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Regime-Karte ─────────────────────────────────────────────────────────────

const RISK_VARIANT: Record<string, 'pos' | 'warn' | 'neg'> = {
  low: 'pos',
  medium: 'warn',
  high: 'neg',
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

  const validFrom = new Date(regime.validFrom).getFullYear();
  const validTo = regime.validTo ? new Date(regime.validTo).getFullYear() : null;

  return (
    <div className={cn('overflow-hidden rounded-lg border border-line bg-surface', expanded && 'border-line-strong')}>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="focus-ring flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-sub"
      >
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-h3 text-text">{name}</span>
            <span className="text-caption text-text-2">· {regime.country.nameDE}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{t('regime.taxRate')}: {formatPercent(regime.flatRate)}</Badge>
            <Badge>
              {t('regime.duration')}: {regime.durationYears >= 90 ? t('regime.unlimited') : t('regime.years').replace('{n}', String(regime.durationYears))}
            </Badge>
            <Badge>{isEU ? 'EU' : 'Außerhalb EU'}</Badge>
            <Badge variant={RISK_VARIANT[regime.riskLevel] ?? 'secondary'}>{riskLabel}</Badge>
          </div>
        </div>
        <span className="mt-1 shrink-0 text-sm text-text-3">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-line px-5 py-5">
          {/* Legal advice warning */}
          {regime.requiresLegalAdvice && (
            <div className="flex items-start gap-2 border-l-2 border-warn bg-surface-sub px-4 py-3 text-sm text-text-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warn" aria-hidden />
              <span>{t('regime.legalAdvice')}</span>
            </div>
          )}

          <p className="text-body leading-relaxed text-text">{conditions}</p>

          {regime.qualifications.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-caption uppercase tracking-[0.04em] text-text-3">{t('regime.qualifications')}</p>
              <ul className="space-y-1">
                {(regime.qualifications as string[]).map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-body text-text-2">
                    <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-pos" aria-hidden />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-text-2">{t('regime.validFrom')}: </span>
              <span className="tabular text-text">{validFrom}</span>
            </div>
            {validTo && (
              <div>
                <span className="text-text-2">{t('regime.validTo')}: </span>
                <span className="tabular text-text">{validTo}</span>
              </div>
            )}
            <div className="col-span-2">
              <span className="text-text-2">{t('regime.source')}: </span>
              <a href={regime.sourceUrl} target="_blank" rel="noopener noreferrer" className="focus-ring rounded-sm text-focus hover:underline">{regime.sourceDE}</a>
            </div>
          </div>

          {/* Disclaimer */}
          {disclaimer && (
            <div className="space-y-1 rounded-md bg-surface-sub px-4 py-3">
              <p className="text-caption uppercase tracking-[0.04em] text-text-3">{t('regime.disclaimer')}</p>
              <p className="text-caption leading-relaxed text-text-2">{disclaimer}</p>
            </div>
          )}

          <Button
            onClick={() => router.push(`/${locale}?toCity=${encodeURIComponent(regime.country.nameDE)}`)}
            className="w-full sm:w-auto"
          >
            {t('regime.calcWithCountry').replace('{country}', regime.country.nameDE)}
          </Button>
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
    <div className="mx-auto max-w-4xl space-y-12">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-h1 text-text">{t('title')}</h1>
        <p className="text-body text-text-2">{t('subtitle')}</p>
      </div>

      {/* Schnellrechner */}
      {!loading && <QuickCalculator regimes={regimes} />}

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className={cn(
              'focus-ring rounded-md border px-3 py-1.5 text-sm transition-colors duration-150 ease-out',
              filter === f.key
                ? 'border-accent bg-accent text-accent-fg'
                : 'border-line text-text-2 hover:border-line-strong hover:text-text',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Regime Cards */}
      {loading && (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-lg border border-line bg-surface-sub" />)}
        </div>
      )}

      {!loading && (
        <div className="space-y-3">
          {filtered.map((regime) => (
            <RegimeCard key={regime.id} regime={regime} locale={locale} />
          ))}
          {filtered.length === 0 && (
            <div className="rounded-lg border border-dashed border-line p-12 text-center">
              <p className="text-body text-text-2">Keine Regime für diesen Filter.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
