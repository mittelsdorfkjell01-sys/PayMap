'use client';
import { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { cn, formatCurrency } from '@/lib/utils';
import type { RankingRow, RankingResponse } from '@/app/api/ranking/route';
import { CityDetailsModal } from '@/components/city-details/CityDetailsModal';
import { Slider } from '@/components/ui/Slider';
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

// ─── Score badge ──────────────────────────────────────────────────────────────

function ScoreBadge({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' }) {
  const cls =
    value >= 75 ? 'bg-primary/10 text-primary' :
    value >= 50 ? 'bg-gray-100 text-gray-600' :
    'bg-gray-50 text-gray-500';
  return (
    <span className={cn(
      'inline-flex items-center justify-center rounded-full font-medium font-mono tabular-nums',
      cls,
      size === 'md' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs',
    )}>
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
    <div className="glass-card p-6 border border-gray-200">
      {fromCalc && (
        <p className="text-xs text-primary bg-primary/5 border border-primary/20 rounded-lg px-4 py-2 mb-4 flex items-center gap-2 tracking-wide font-light">
          <span>&#10003;</span> {t('inputBarHint')}
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
        <div className="space-y-2 flex-1 min-w-[140px]">
          <label className="text-xs text-gray-500 tracking-wide font-light">{t('homeCity')}</label>
          <input
            type="text"
            value={from}
            onChange={(e) => { setFrom(e.target.value); setFromCalc(false); }}
            placeholder={t('homeCityPlaceholder')}
            className="input-field"
          />
        </div>
        <div className="space-y-2 flex-1 min-w-[130px]">
          <label className="text-xs text-gray-500 tracking-wide font-light">{t('gross')}</label>
          <div className="relative">
            <input
              type="number"
              value={gross}
              onChange={(e) => setGross(e.target.value)}
              placeholder="80000"
              min={0}
              className="input-field pr-16"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none tracking-wide font-light">{t('grossUnit')}</span>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || !from || !gross}
          className="btn-primary"
        >
          {loading ? '...' : tCalc('calculate')}
        </button>
      </form>
    </div>
  );
}

// ─── Expanded row detail ──────────────────────────────────────────────────────

function ExpandedRow({ row, locale }: { row: RankingRow; locale: string }) {
  const t = useTranslations('ranking');
  const tResults = useTranslations('results');

  return (
    <div className="px-5 pb-5 pt-3 bg-gray-50 border-t border-gray-100 space-y-4">
      {/* All 11 score categories */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {WEIGHT_KEYS.map((key) => {
          const value = row.scores[key] ?? 50;
          return (
            <div key={key} className="bg-white border border-gray-100 rounded-lg p-3 text-center space-y-2">
              <p className="text-[10px] text-gray-500 tracking-wide font-light leading-tight">
                {t(`weights.${key}`)}
              </p>
              <ScoreBadge value={value} size="md" />
              <div className="w-full bg-gray-100 rounded-full h-0.5">
                <div className="bg-primary h-0.5 rounded-full transition-all" style={{ width: `${value}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-gray-100 px-4 py-3 space-y-1">
          <p className="text-[10px] text-gray-500 tracking-wide font-light">{tResults('netMonthly')}</p>
          <p className="text-sm font-mono font-medium text-gray-900">{formatCurrency(row.netMonthlyEUR)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 px-4 py-3 space-y-1">
          <p className="text-[10px] text-gray-500 tracking-wide font-light">{tResults('netAfterCosts')}</p>
          <p className={cn('text-sm font-mono font-medium', row.surplusEUR >= 0 ? 'text-primary' : 'text-red-500')}>
            {row.surplusEUR >= 0 ? '+' : ''}{formatCurrency(row.surplusEUR)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap items-center">
        <p className="text-xs text-gray-500 tracking-wide font-light">
          {tResults('effectiveTaxRate')}: <span className="font-mono font-medium text-gray-900">{(row.effectiveRate * 100).toFixed(1)}%</span>
        </p>
        <div className="flex-1" />
        <Link
          href={`/${locale}?toCity=${encodeURIComponent(row.city.nameDE)}`}
          className="text-xs font-medium text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 border border-primary/20 px-4 py-2 rounded-lg transition-all tracking-wide"
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
          'flex items-center gap-1 text-[10px] tracking-wide font-light whitespace-nowrap transition-colors',
          active ? 'text-primary' : 'text-gray-500 hover:text-gray-700',
        )}
      >
        {label}
        <span className="opacity-50 ml-0.5">{active ? (sortDir === 'desc' ? '\u2193' : '\u2191') : '\u2195'}</span>
      </button>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-[10px] text-gray-500 tracking-wide font-light w-10">{t('columns.rank')}</th>
              <th className="text-left px-4 py-3 text-[10px] text-gray-500 tracking-wide font-light">{t('columns.city')}</th>
              <th className="px-3 py-3 text-right">
                <SortHeader label={t('columns.purchasingPower')} colKey="purchasingPowerDelta" />
              </th>
              <th className="px-3 py-3 text-right">
                <SortHeader label={t('columns.tax')} colKey="tax_burden_score" />
              </th>
              <th className="px-3 py-3 text-right">
                <SortHeader label={t('columns.safety')} colKey="crime_index" />
              </th>
              <th className="px-3 py-3 text-right">
                <SortHeader label={t('columns.health')} colKey="healthcare_quality" />
              </th>
              <th className="px-3 py-3 text-right">
                <SortHeader label={t('columns.climate')} colKey="air_quality_pm25" />
              </th>
              <th className="px-3 py-3 text-right">
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
                      'border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors',
                      isHome && 'bg-primary/5',
                      isExpanded && 'bg-gray-50',
                    )}
                    onClick={() => onExpand(row.city.id)}
                    title={t('expandHint')}
                  >
                    <td className="px-4 py-3 text-sm font-mono text-gray-400">{row.rank}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg leading-none">{row.city.flag}</span>
                        <div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onCityClick(row.city.slug); }}
                            className="text-sm font-medium text-gray-900 hover:text-primary hover:underline transition-colors text-left"
                          >
                            {row.city.nameDE}
                          </button>
                          {isHome && (
                            <span className="block text-[10px] text-primary font-medium tracking-wide">{t('homeCity')}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className={cn('text-sm font-mono font-medium', ppPositive ? 'text-primary' : 'text-red-500')}>
                        {ppPositive ? '+' : ''}{formatCurrency(row.purchasingPowerDelta)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right"><ScoreBadge value={row.scores['tax_burden_score'] ?? 50} /></td>
                    <td className="px-3 py-3 text-right"><ScoreBadge value={row.scores['crime_index'] ?? 50} /></td>
                    <td className="px-3 py-3 text-right"><ScoreBadge value={row.scores['healthcare_quality'] ?? 50} /></td>
                    <td className="px-3 py-3 text-right"><ScoreBadge value={row.scores['air_quality_pm25'] ?? 50} /></td>
                    <td className="px-3 py-3 text-right">
                      <ScoreBadge value={row.score} size="md" />
                    </td>
                    <td className="px-2 py-3 text-gray-400 text-xs">
                      {isExpanded ? '&#9650;' : '&#9660;'}
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
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-light text-gray-900">{t('title')}</h1>
        <p className="text-sm text-gray-500 font-light">{t('subtitle')}</p>
      </div>

      {/* Input bar */}
      <RankingInputBar onSearch={fetchRanking} loading={loading} />

      {/* Purchasing power hint */}
      {data && (
        <p className="text-xs text-gray-500 px-1 tracking-wide font-light">
          <span className="font-medium text-gray-700">{t('columns.purchasingPower')}:</span>{' '}
          {t('purchasingPowerHint')} | Basis:{' '}
          <span className="font-mono font-medium text-gray-700">{formatCurrency(data.homeNetMonthlyEUR)}/mo</span> netto in {data.homeCity.nameDE}
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 font-light">
          {error}
        </p>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="border border-gray-200 rounded-lg p-8 space-y-3 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="w-6 h-4 bg-gray-100 rounded" />
              <div className="w-32 h-4 bg-gray-100 rounded" />
              <div className="flex-1 flex gap-2 justify-end">
                {Array.from({ length: 7 }).map((_, j) => (
                  <div key={j} className="w-12 h-4 bg-gray-100 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Weights panel */}
      {data && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setWeightsOpen((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="text-xs font-medium text-gray-700 tracking-wide">
              {t('weights.title')}
            </span>
            <span className="text-gray-400 text-xs">{weightsOpen ? '\u25B2' : '\u25BC'}</span>
          </button>

          {weightsOpen && (
            <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
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
                className="text-xs font-medium text-primary hover:underline tracking-wide"
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
        <div className="border border-dashed border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500 text-sm font-light">{t('enterDetails')}</p>
        </div>
      )}

      <CityDetailsModal slug={detailSlug} onClose={() => setDetailSlug(null)} />
    </div>
  );
}
