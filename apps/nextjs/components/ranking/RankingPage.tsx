'use client';
import { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { cn, formatCurrency } from '@/lib/utils';
import type { RankingRow, RankingResponse } from '@/app/api/ranking/route';
import { CityDetailsModal } from '@/components/city-details/CityDetailsModal';
import { Slider } from '@/components/ui/Slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScoreBar } from '@/components/ui/ScoreBar';
import { StatusDot } from '@/components/ui/StatusDot';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import { computeWeightedScore } from '@/lib/ranking';

// ─── Weight categories ────────────────────────────────────────────────────────

const WEIGHT_KEYS = [
  'tax_burden_score',
  'cost_of_living_score',
  'crime_index',
  'purchasing_power_score',
  'political_stability',
  'healthcare_quality',
  'air_quality_pm25',
  'lgbtq_acceptance',
  'english_proficiency',
  'internet_speed_combined',
  'direct_flight_to_germany',
] as const;

type WeightKey = typeof WEIGHT_KEYS[number];
type Weights = Record<WeightKey, number>;

// 0–100 integer percentages; must sum to 100
const DEFAULT_WEIGHTS: Weights = {
  tax_burden_score:        25,
  cost_of_living_score:    20,
  crime_index:             12,
  purchasing_power_score:  12,
  political_stability:      8,
  healthcare_quality:       7,
  air_quality_pm25:         6,
  lgbtq_acceptance:         4,
  english_proficiency:      3,
  internet_speed_combined:  2,
  direct_flight_to_germany: 1,
};

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = 'score' | 'purchasingPowerDelta' | 'tax_burden_score' | 'crime_index' | 'healthcare_quality' | 'air_quality_pm25';
type SortDir = 'desc' | 'asc';

// Distribute remaining % proportionally when one slider changes, keeping sum = 100
function redistributeWeights(weights: Weights, changedKey: WeightKey, newValue: number): Weights {
  const others = WEIGHT_KEYS.filter((k) => k !== changedKey);
  const othersSum = others.reduce((s, k) => s + weights[k], 0);
  const targetOthersSum = 100 - newValue;
  const updated: Weights = { ...weights, [changedKey]: newValue };

  if (othersSum === 0) {
    const perOther = Math.floor(targetOthersSum / others.length);
    others.forEach((k) => { updated[k] = perOther; });
    updated[others[0]] += targetOthersSum - perOther * others.length;
  } else {
    const factor = targetOthersSum / othersSum;
    let distributed = 0;
    others.forEach((k, i) => {
      if (i === others.length - 1) {
        updated[k] = targetOthersSum - distributed;
      } else {
        updated[k] = Math.round(weights[k] * factor);
        distributed += updated[k];
      }
    });
  }
  return updated;
}

// computeWeightedScore divides by coveredWeight internally so 0-100 integers
// and fractional weights produce the same relative result.
function computeScore(row: RankingRow, weights: Weights): number {
  return computeWeightedScore(row.scores, weights as Record<string, number>);
}

// ─── Session storage helpers ──────────────────────────────────────────────────

function readCalcState(): { fromCity: string; gross: string } | null {
  try {
    const raw = sessionStorage.getItem('paymap_calc');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ─── Score value (monochrom, Spec: Farbe nur für Delta/Risiko) ─────────────────

function ScoreValue({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' }) {
  return (
    <span className={cn('tabular text-text', size === 'md' ? 'text-data-md' : 'text-data-sm')}>
      {value}
    </span>
  );
}

// ─── Input bar ────────────────────────────────────────────────────────────────

function RankingInputBar({
  onSearch,
  loading,
}: {
  onSearch: (from: string, gross: number) => void;
  loading: boolean;
}) {
  const t = useTranslations('ranking');
  const tCalc = useTranslations('calculator');
  const [from, setFrom] = useState('');
  const [gross, setGross] = useState('');
  const [fromCalc, setFromCalc] = useState(false);

  useEffect(() => {
    const saved = readCalcState();
    if (saved?.fromCity && saved?.gross) {
      setFrom(saved.fromCity);
      setGross(saved.gross);
      setFromCalc(true);
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const g = parseFloat(gross);
    if (!from || isNaN(g) || g <= 0) return;
    onSearch(from, g);
  }

  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      {fromCalc && (
        <div className="mb-4">
          <StatusDot tone="pos" label={t('inputBarHint')} />
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div className="min-w-[140px] flex-1 space-y-1.5">
          <label className="block text-sm text-text-2">{t('homeCity')}</label>
          <Input
            type="text"
            value={from}
            onChange={(e) => { setFrom(e.target.value); setFromCalc(false); }}
            placeholder={t('homeCityPlaceholder')}
          />
        </div>
        <div className="min-w-[130px] flex-1 space-y-1.5">
          <label className="block text-sm text-text-2">{t('gross')}</label>
          <div className="relative">
            <Input
              type="number"
              value={gross}
              onChange={(e) => setGross(e.target.value)}
              placeholder="80000"
              min={0}
              className="pr-16"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-caption uppercase tracking-[0.04em] text-text-3">{t('grossUnit')}</span>
          </div>
        </div>
        <Button type="submit" disabled={loading || !from || !gross}>
          {loading ? '…' : tCalc('calculate')}
        </Button>
      </form>
    </div>
  );
}

// ─── Expanded row detail ──────────────────────────────────────────────────────

function ExpandedRow({ row, locale }: { row: RankingRow; locale: string }) {
  const t = useTranslations('ranking');
  const tResults = useTranslations('results');

  return (
    <div className="space-y-4 border-t border-line bg-surface-sub px-5 pb-5 pt-3">
      {/* All 11 score categories */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {WEIGHT_KEYS.map((key) => {
          const value = row.scores[key] ?? 50;
          return (
            <div key={key} className="space-y-1">
              <p className="text-caption uppercase tracking-[0.04em] text-text-3">
                {t(`weights.${key}`)}
              </p>
              <ScoreBar value={value} aria-label={t(`weights.${key}`)} />
            </div>
          );
        })}
      </div>

      {/* Financial breakdown */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="space-y-1 rounded-md bg-surface px-4 py-3">
          <p className="text-caption uppercase tracking-[0.04em] text-text-3">{tResults('netMonthly')}</p>
          <p className="text-data-sm tabular text-text">{formatCurrency(row.netMonthlyEUR)}</p>
        </div>
        <div className="space-y-1 rounded-md bg-surface px-4 py-3">
          <p className="text-caption uppercase tracking-[0.04em] text-text-3">{tResults('netAfterCosts')}</p>
          <p className={cn('text-data-sm tabular', row.surplusEUR >= 0 ? 'text-pos' : 'text-neg')}>
            {row.surplusEUR >= 0 ? '+' : ''}{formatCurrency(row.surplusEUR)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-caption uppercase tracking-[0.04em] text-text-3">
          {tResults('effectiveTaxRate')}: <span className="tabular text-text">{(row.effectiveRate * 100).toFixed(1)}%</span>
        </p>
        <div className="flex-1" />
        <Link
          href={`/${locale}?toCity=${encodeURIComponent(row.city.nameDE)}`}
          className="focus-ring inline-flex h-8 items-center rounded-md border border-line px-3 text-sm text-text-2 transition-colors hover:border-line-strong hover:text-text"
        >
          {t('compareWith').replace('{city}', row.city.nameDE)}
        </Link>
      </div>
    </div>
  );
}

// ─── Ranking table ────────────────────────────────────────────────────────────

interface TableProps {
  rows: RankingRow[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  expandedId: string | null;
  onExpand: (id: string) => void;
  onCityClick: (slug: string) => void;
  locale: string;
}

const TH = 'text-caption uppercase tracking-[0.04em] text-text-3';

function RankingTable({ rows, sortKey, sortDir, onSort, expandedId, onExpand, onCityClick, locale }: TableProps) {
  const t = useTranslations('ranking');

  const sortedRows = [...rows].sort((a, b) => {
    let aVal: number;
    let bVal: number;
    if (sortKey === 'score') {
      aVal = a.score; bVal = b.score;
    } else if (sortKey === 'purchasingPowerDelta') {
      aVal = a.purchasingPowerDelta; bVal = b.purchasingPowerDelta;
    } else {
      aVal = a.scores[sortKey] ?? 50;
      bVal = b.scores[sortKey] ?? 50;
    }
    return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
  });

  function SortHeader({ label, colKey }: { label: string; colKey: SortKey }) {
    const active = sortKey === colKey;
    return (
      <button
        onClick={() => onSort(colKey)}
        className={cn(
          'focus-ring inline-flex items-center gap-1 whitespace-nowrap rounded-sm transition-colors',
          TH,
          active ? 'text-text' : 'hover:text-text',
        )}
      >
        {label}
        <span className="ml-0.5 opacity-50">{active ? (sortDir === 'desc' ? '↓' : '↑') : '↕'}</span>
      </button>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-line-strong">
              <th className={cn('w-10 px-4 py-3.5 text-left', TH)}>{t('columns.rank')}</th>
              <th className={cn('px-4 py-3.5 text-left', TH)}>{t('columns.city')}</th>
              <th className="px-3 py-3.5 text-right">
                <SortHeader label={t('columns.purchasingPower')} colKey="purchasingPowerDelta" />
              </th>
              <th className="px-3 py-3.5 text-right">
                <SortHeader label={t('columns.tax')} colKey="tax_burden_score" />
              </th>
              <th className="px-3 py-3.5 text-right">
                <SortHeader label={t('columns.safety')} colKey="crime_index" />
              </th>
              <th className="px-3 py-3.5 text-right">
                <SortHeader label={t('columns.health')} colKey="healthcare_quality" />
              </th>
              <th className="px-3 py-3.5 text-right">
                <SortHeader label={t('columns.climate')} colKey="air_quality_pm25" />
              </th>
              <th className="px-3 py-3.5 text-right">
                <SortHeader label={t('columns.score')} colKey="score" />
              </th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => {
              const isExpanded = expandedId === row.city.id;
              const isHome = row.isHome;
              const ppPositive = row.purchasingPowerDelta >= 0;

              return (
                <Fragment key={row.city.id}>
                  <tr
                    className={cn(
                      'cursor-pointer border-b border-line-soft transition-colors hover:bg-surface-sub',
                      isHome && 'bg-surface-sub',
                      isExpanded && 'bg-surface-sub',
                    )}
                    onClick={() => onExpand(row.city.id)}
                    title={t('expandHint')}
                  >
                    <td className="px-4 py-3.5 text-data-sm tabular text-text-2">{row.rank}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg leading-none">{row.city.flag}</span>
                        <div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onCityClick(row.city.slug); }}
                            className="focus-ring rounded-sm text-left text-body text-text transition-colors hover:underline"
                          >
                            {row.city.nameDE}
                          </button>
                          {isHome && (
                            <span className="block text-caption uppercase tracking-[0.04em] text-text-3">{t('homeCity')}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      <span className={cn('text-data-sm tabular', ppPositive ? 'text-pos' : 'text-neg')}>
                        {ppPositive ? '+' : ''}{formatCurrency(row.purchasingPowerDelta)}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-right"><ScoreValue value={row.scores['tax_burden_score'] ?? 50} /></td>
                    <td className="px-3 py-3.5 text-right"><ScoreValue value={row.scores['crime_index'] ?? 50} /></td>
                    <td className="px-3 py-3.5 text-right"><ScoreValue value={row.scores['healthcare_quality'] ?? 50} /></td>
                    <td className="px-3 py-3.5 text-right"><ScoreValue value={row.scores['air_quality_pm25'] ?? 50} /></td>
                    <td className="px-3 py-3.5 text-right">
                      <ScoreValue value={row.score} size="md" />
                    </td>
                    <td className="px-2 py-3.5 text-right text-sm text-text-3">
                      {isExpanded ? '▲' : '▼'}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${row.city.id}-expanded`}>
                      <td colSpan={9} className="p-0">
                        <ExpandedRow row={row} locale={locale} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function RankingPage() {
  const t = useTranslations('ranking');
  const locale = useLocale();

  const [data, setData] = useState<RankingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailSlug, setDetailSlug] = useState<string | null>(null);
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [weightsOpen, setWeightsOpen] = useState(false);

  const debouncedWeights = useDebouncedValue(weights, 200);

  const scoredRows = useMemo<RankingRow[]>(() => {
    if (!data) return [];
    return data.rows.map((row) => ({ ...row, score: computeScore(row, debouncedWeights) }));
  }, [data, debouncedWeights]);

  useEffect(() => {
    const city = new URLSearchParams(window.location.search).get('city');
    if (city) setDetailSlug(city);

    const saved = readCalcState();
    if (saved?.fromCity && saved?.gross) {
      fetchRanking(saved.fromCity, parseFloat(saved.gross));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRanking = useCallback(async (from: string, gross: number) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/ranking?from=${encodeURIComponent(from)}&gross=${gross}&locale=${locale}`,
      );
      if (!res.ok) {
        const e = await res.json();
        setError(e.error ?? t('fetchError'));
        return;
      }
      const json: RankingResponse = await res.json();
      setData(json);
    } catch {
      setError(t('fetchError'));
    } finally {
      setLoading(false);
    }
  }, [t, locale]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function handleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="space-y-3 text-center">
        <h1 className="text-h1 text-text">{t('title')}</h1>
        <p className="text-body text-text-2">{t('subtitle')}</p>
      </div>

      {/* Input bar */}
      <RankingInputBar onSearch={fetchRanking} loading={loading} />

      {/* Purchasing power hint */}
      {data && (
        <p className="px-1 text-caption uppercase tracking-[0.04em] text-text-3">
          <span className="text-text-2">{t('columns.purchasingPower')}:</span>{' '}
          {t('purchasingPowerHint')} · Basis:{' '}
          <span className="tabular text-text">{formatCurrency(data.homeNetMonthlyEUR)}/mo</span> netto in {data.homeCity.nameDE}
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="rounded-md border border-line bg-surface-sub px-4 py-3 text-sm text-neg">
          {error}
        </p>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="animate-pulse space-y-3 rounded-lg border border-line bg-surface p-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 w-6 rounded bg-surface-sub" />
              <div className="h-4 w-32 rounded bg-surface-sub" />
              <div className="flex flex-1 justify-end gap-2">
                {Array.from({ length: 7 }).map((_, j) => (
                  <div key={j} className="h-4 w-12 rounded bg-surface-sub" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Weights panel */}
      {data && (
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          <button
            type="button"
            onClick={() => setWeightsOpen((v) => !v)}
            className="focus-ring flex w-full items-center justify-between px-5 py-3.5 text-left"
          >
            <span className="text-caption uppercase tracking-[0.04em] text-text-2">
              {t('weights.title')}
            </span>
            <span className="text-sm text-text-3">{weightsOpen ? '▲' : '▼'}</span>
          </button>

          {weightsOpen && (
            <div className="space-y-4 border-t border-line px-5 pb-5 pt-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                {WEIGHT_KEYS.map((key) => (
                  <Slider
                    key={key}
                    label={t(`weights.${key}`)}
                    value={weights[key]}
                    onChange={(v) => setWeights((w) => redistributeWeights(w, key, v))}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setWeights(DEFAULT_WEIGHTS)}
                className="focus-ring rounded-sm text-caption uppercase tracking-[0.04em] text-focus hover:underline"
              >
                {t('weights.resetDefaults')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      {data && !loading && (
        <RankingTable
          rows={scoredRows}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          expandedId={expandedId}
          onExpand={handleExpand}
          onCityClick={setDetailSlug}
          locale={locale}
        />
      )}

      {/* Empty state */}
      {!data && !loading && !error && (
        <div className="rounded-lg border border-dashed border-line p-12 text-center">
          <p className="text-body text-text-2">{t('enterDetails')}</p>
        </div>
      )}

      <CityDetailsModal slug={detailSlug} onClose={() => setDetailSlug(null)} />
    </div>
  );
}
