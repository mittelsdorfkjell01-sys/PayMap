'use client';
import { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { cn, formatCurrency } from '@/lib/utils';
import type { RankingRow, RankingResponse } from '@/app/api/ranking/route';
import { CityDetailsModal } from '@/components/city-details/CityDetailsModal';
import { Slider } from '@/components/ui/Slider';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import {
  CLUSTER_KEYS,
  type ClusterKey,
  CLUSTER_CATEGORIES,
  DEFAULT_CLUSTER_WEIGHTS,
  clusterName,
  categoryName,
} from '@/lib/score-categories';
import { clusterAverages, weightedClusterTotal, type ClusterWeights } from '@/lib/ranking-score';

// ─── Cluster weights (0–100 ints; normalised at compute time) ──────────────────

const DEFAULT_CW: ClusterWeights = CLUSTER_KEYS.reduce((acc, k) => {
  acc[k] = Math.round(DEFAULT_CLUSTER_WEIGHTS[k] * 100);
  return acc;
}, {} as ClusterWeights);

// ─── Bilingual UI strings not covered by the existing 'ranking' namespace ───────

function useL() {
  const en = useLocale() === 'en';
  return {
    overview:    en ? 'Overview' : 'Übersicht',
    total:       en ? 'Total' : 'Gesamt',
    pp:          en ? 'Purchasing power' : 'Kaufkraft',
    pending:     en ? 'Data pending' : 'Daten ausstehend',
    backToClusters: en ? 'All clusters' : 'Alle Cluster',
    filters:     en ? 'Filters' : 'Filter',
    dbaGermany:  en ? 'Tax treaty w/ DE' : 'DBA mit DE',
    euEea:       en ? 'EU / EEA' : 'EU / EWR',
    nomadVisa:   en ? 'Nomad visa' : 'Nomad-Visum',
    region:      en ? 'Region' : 'Region',
    allRegions:  en ? 'All regions' : 'Alle Regionen',
    clusterWeights: en ? 'Cluster weighting' : 'Cluster-Gewichtung',
    drillHint:   en ? 'Pick a cluster to see its categories' : 'Cluster wählen für Unterkategorien',
    noMatch:     en ? 'No cities match these filters.' : 'Keine Städte für diese Filter.',
  };
}

// ─── Types ──────────────────────────────────────────────────────────────────

type SortDir = 'desc' | 'asc';
// Overview: 'pp' | 'total' | ClusterKey.  Drill: 'avg' | category key.
type SortCol = string;

interface ViewRow {
  row:      RankingRow;
  averages: Record<ClusterKey, number | null>;
  total:    number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Compare two nullable numbers; nulls ("Daten ausstehend") always sort last. */
function cmpNullable(a: number | null, b: number | null, dir: SortDir): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return dir === 'desc' ? b - a : a - b;
}

function readCalcState(): { fromCity: string; gross: string } | null {
  try {
    const raw = sessionStorage.getItem('paymap_calc');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ─── Score badge ──────────────────────────────────────────────────────────────

function ScoreBadge({ value, size = 'sm', pendingLabel }: { value: number | null; size?: 'sm' | 'md'; pendingLabel: string }) {
  if (value == null) {
    return (
      <span
        title={pendingLabel}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-mono text-on-surface-variant/50 bg-surface-container/40',
          size === 'md' ? 'px-3 py-1 text-data-mono' : 'px-2 py-0.5 text-label-sm',
        )}
      >
        —
      </span>
    );
  }
  const cls =
    value >= 75 ? 'bg-primary/10 text-primary' :
    value >= 50 ? 'bg-secondary-container/50 text-secondary' :
    'bg-surface-container text-on-surface-variant';
  return (
    <span className={cn(
      'inline-flex items-center justify-center rounded-full font-bold font-mono tabular-nums',
      cls,
      size === 'md' ? 'px-3 py-1 text-data-mono' : 'px-2 py-0.5 text-label-sm',
    )}>
      {value}
    </span>
  );
}

// ─── Input bar ────────────────────────────────────────────────────────────────

function RankingInputBar({ onSearch, loading }: { onSearch: (from: string, gross: number) => void; loading: boolean }) {
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
    <div className="glass-card p-5 shadow-sm">
      {fromCalc && (
        <p className="text-label-sm text-primary bg-primary/8 border border-primary/20 rounded-xl px-4 py-2 mb-4 flex items-center gap-2 uppercase tracking-wider">
          <span>✓</span> {t('inputBarHint')}
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1.5 flex-1 min-w-[140px]">
          <label className="label-field">{t('homeCity')}</label>
          <input
            type="text"
            value={from}
            onChange={(e) => { setFrom(e.target.value); setFromCalc(false); }}
            placeholder={t('homeCityPlaceholder')}
            className="input-field"
          />
        </div>
        <div className="space-y-1.5 flex-1 min-w-[130px]">
          <label className="label-field">{t('gross')}</label>
          <div className="relative">
            <input
              type="number"
              value={gross}
              onChange={(e) => setGross(e.target.value)}
              placeholder="80000"
              min={0}
              className="input-field pr-16"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-label-sm text-on-surface-variant pointer-events-none uppercase tracking-wider">{t('grossUnit')}</span>
          </div>
        </div>
        <button type="submit" disabled={loading || !from || !gross} className="btn-primary">
          {loading ? '…' : tCalc('calculate')}
        </button>
      </form>
    </div>
  );
}

// ─── Expanded row: all categories grouped by cluster + financials ───────────────

function ExpandedRow({ vr, locale }: { vr: ViewRow; locale: string }) {
  const t = useTranslations('ranking');
  const tResults = useTranslations('results');
  const L = useL();
  const { row } = vr;

  return (
    <div className="px-5 pb-5 pt-3 bg-surface-container-low/60 border-t border-outline-variant/30 space-y-4">
      <div className="space-y-3">
        {CLUSTER_KEYS.map((ck) => (
          <div key={ck}>
            <p className="text-label-sm font-bold text-on-surface uppercase tracking-wider mb-1.5">
              {clusterName(ck, locale)}{' '}
              <span className="text-on-surface-variant font-normal">({vr.averages[ck] ?? '—'})</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {CLUSTER_CATEGORIES[ck].map((cat) => {
                const value = row.scores[cat] ?? null;
                return (
                  <div key={cat} className="glass-card-solid p-2.5 flex items-center justify-between gap-2">
                    <p className="text-label-sm text-on-surface-variant leading-tight">{categoryName(cat, locale)}</p>
                    <ScoreBadge value={value} pendingLabel={L.pending} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 px-4 py-3 space-y-1">
          <p className="table-header">{tResults('netMonthly')}</p>
          <p className="table-value">{formatCurrency(row.netMonthlyEUR)}</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 px-4 py-3 space-y-1">
          <p className="table-header">{tResults('netAfterCosts')}</p>
          <p className={cn('table-value font-bold', row.surplusEUR >= 0 ? 'text-primary' : 'text-error')}>
            {row.surplusEUR >= 0 ? '+' : ''}{formatCurrency(row.surplusEUR)}
          </p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap items-center">
        <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">
          {tResults('effectiveTaxRate')}: <span className="font-mono font-bold text-on-surface">{(row.effectiveRate * 100).toFixed(1)}%</span>
        </p>
        <div className="flex-1" />
        <Link
          href={`/${locale}?toCity=${encodeURIComponent(row.city.nameDE)}`}
          className="text-label-sm font-semibold text-primary hover:text-primary-container bg-primary/8 hover:bg-primary/15 border border-primary/20 px-4 py-2 rounded-full transition-all uppercase tracking-wider"
        >
          {t('compareWith').replace('{city}', row.city.nameDE)}
        </Link>
      </div>
    </div>
  );
}

// ─── Sortable header cell ───────────────────────────────────────────────────

function SortHeader({ label, colKey, sortCol, sortDir, onSort }: {
  label: string; colKey: SortCol; sortCol: SortCol; sortDir: SortDir; onSort: (c: SortCol) => void;
}) {
  const active = sortCol === colKey;
  return (
    <button
      onClick={() => onSort(colKey)}
      className={cn(
        'flex items-center gap-1 table-header whitespace-nowrap transition-colors ml-auto',
        active ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface',
      )}
    >
      {label}
      <span className="opacity-50 ml-0.5">{active ? (sortDir === 'desc' ? '↓' : '↑') : '↕'}</span>
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function RankingPage() {
  const t = useTranslations('ranking');
  const locale = useLocale();
  const L = useL();

  const [data, setData] = useState<RankingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [drill, setDrill] = useState<ClusterKey | null>(null);
  const [sortCol, setSortCol] = useState<SortCol>('total');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailSlug, setDetailSlug] = useState<string | null>(null);

  const [weights, setWeights] = useState<ClusterWeights>(DEFAULT_CW);
  const [weightsOpen, setWeightsOpen] = useState(false);

  const [fDba, setFDba] = useState(false);
  const [fEu, setFEu] = useState(false);
  const [fNomad, setFNomad] = useState(false);
  const [region, setRegion] = useState<string>('all');

  const debouncedWeights = useDebouncedValue(weights, 200);

  // Compute cluster averages + weighted total per city.
  const viewRows = useMemo<ViewRow[]>(() => {
    if (!data) return [];
    return data.rows.map((row) => {
      const averages = clusterAverages(row.scores);
      return { row, averages, total: weightedClusterTotal(averages, debouncedWeights) };
    });
  }, [data, debouncedWeights]);

  const regions = useMemo(() => {
    const s = new Set<string>();
    viewRows.forEach((vr) => s.add(vr.row.region));
    return Array.from(s).sort();
  }, [viewRows]);

  const filtered = useMemo(() => {
    return viewRows.filter((vr) => {
      if (fDba && vr.row.filters.dbaGermany !== true) return false;
      if (fEu && vr.row.filters.euEea !== true) return false;
      if (fNomad && vr.row.filters.nomadVisa !== true) return false;
      if (region !== 'all' && vr.row.region !== region) return false;
      return true;
    });
  }, [viewRows, fDba, fEu, fNomad, region]);

  function sortValue(vr: ViewRow, col: SortCol): number | null {
    if (col === 'total') return vr.total;
    if (col === 'pp') return vr.row.purchasingPowerDelta;
    if (col === 'avg') return drill ? vr.averages[drill] : vr.total;
    if (!drill) return vr.averages[col as ClusterKey] ?? null; // overview cluster col
    return vr.row.scores[col] ?? null;                          // drill category col
  }

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => cmpNullable(sortValue(a, sortCol), sortValue(b, sortCol), sortDir));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, sortCol, sortDir, drill]);

  useEffect(() => {
    const city = new URLSearchParams(window.location.search).get('city');
    if (city) setDetailSlug(city);
    const saved = readCalcState();
    if (saved?.fromCity && saved?.gross) fetchRanking(saved.fromCity, parseFloat(saved.gross));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRanking = useCallback(async (from: string, gross: number) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/ranking?from=${encodeURIComponent(from)}&gross=${gross}&locale=${locale}`);
      if (!res.ok) {
        const e = await res.json();
        setError(e.error ?? t('fetchError'));
        return;
      }
      setData(await res.json());
    } catch {
      setError(t('fetchError'));
    } finally {
      setLoading(false);
    }
  }, [t, locale]);

  function handleSort(col: SortCol) {
    if (col === sortCol) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    else { setSortCol(col); setSortDir('desc'); }
  }

  function selectCluster(ck: ClusterKey | null) {
    setDrill(ck);
    setSortCol(ck ? 'avg' : 'total');
    setSortDir('desc');
    setExpandedId(null);
  }

  // Columns shown in the body, depending on overview vs drill.
  const dataCols: { key: SortCol; label: string }[] = drill
    ? [
        ...CLUSTER_CATEGORIES[drill].map((cat) => ({ key: cat as SortCol, label: categoryName(cat, locale) })),
        { key: 'avg', label: clusterName(drill, locale) },
      ]
    : [
        { key: 'pp', label: L.pp },
        ...CLUSTER_KEYS.map((ck) => ({ key: ck as SortCol, label: clusterName(ck, locale) })),
        { key: 'total', label: L.total },
      ];

  function cellValue(vr: ViewRow, col: SortCol): number | null {
    return sortValue(vr, col);
  }

  const FilterChip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-label-sm font-semibold uppercase tracking-wider border transition-all',
        active
          ? 'bg-primary/12 text-primary border-primary/30'
          : 'bg-surface-container-low text-on-surface-variant border-outline-variant/40 hover:text-on-surface',
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-headline-xl-mobile md:text-headline-lg font-bold text-on-background">{t('title')}</h1>
        <p className="text-body-lg text-on-surface-variant">{t('subtitle')}</p>
      </div>

      <RankingInputBar onSearch={fetchRanking} loading={loading} />

      {data && (
        <p className="text-label-sm text-on-surface-variant px-1 uppercase tracking-wider">
          <span className="font-semibold text-on-surface">{L.pp}:</span>{' '}
          {t('purchasingPowerHint')} · Basis:{' '}
          <span className="font-mono font-bold text-on-surface">{formatCurrency(data.homeNetMonthlyEUR)}/mo</span> netto in {data.homeCity.nameDE}
        </p>
      )}

      {error && (
        <p className="text-body-md text-error bg-error-container/30 border border-error/30 rounded-xl px-4 py-3">{error}</p>
      )}

      {loading && (
        <div className="glass-card p-8 space-y-3 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="w-6 h-4 bg-surface-container rounded" />
              <div className="w-32 h-4 bg-surface-container rounded" />
              <div className="flex-1 flex gap-2 justify-end">
                {Array.from({ length: 7 }).map((_, j) => <div key={j} className="w-12 h-4 bg-surface-container rounded" />)}
              </div>
            </div>
          ))}
        </div>
      )}

      {data && !loading && (
        <>
          {/* Cluster selector chips — also the mobile drill path */}
          <div className="flex flex-wrap gap-2 items-center">
            <FilterChip active={drill === null} onClick={() => selectCluster(null)}>{L.overview}</FilterChip>
            {CLUSTER_KEYS.map((ck) => (
              <FilterChip key={ck} active={drill === ck} onClick={() => selectCluster(ck)}>
                {clusterName(ck, locale)}
              </FilterChip>
            ))}
            <span className="text-label-sm text-on-surface-variant ml-1 normal-case tracking-normal hidden sm:inline">{L.drillHint}</span>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-label-sm font-bold text-on-surface uppercase tracking-wider mr-1">{L.filters}:</span>
            <FilterChip active={fDba} onClick={() => setFDba((v) => !v)}>{L.dbaGermany}</FilterChip>
            <FilterChip active={fEu} onClick={() => setFEu((v) => !v)}>{L.euEea}</FilterChip>
            <FilterChip active={fNomad} onClick={() => setFNomad((v) => !v)}>{L.nomadVisa}</FilterChip>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="px-3 py-1.5 rounded-full text-label-sm font-semibold bg-surface-container-low text-on-surface-variant border border-outline-variant/40"
            >
              <option value="all">{L.allRegions}</option>
              {regions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Cluster weighting */}
          <div className="glass-card shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setWeightsOpen((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-left"
            >
              <span className="text-label-sm font-bold text-on-surface uppercase tracking-wider">{L.clusterWeights}</span>
              <span className="text-on-surface-variant text-label-sm">{weightsOpen ? '▲' : '▼'}</span>
            </button>
            {weightsOpen && (
              <div className="px-5 pb-5 border-t border-outline-variant/30 pt-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
                  {CLUSTER_KEYS.map((ck) => (
                    <Slider
                      key={ck}
                      label={clusterName(ck, locale)}
                      value={weights[ck]}
                      onChange={(v) => setWeights((w) => ({ ...w, [ck]: v }))}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setWeights(DEFAULT_CW)}
                  className="text-label-sm font-semibold text-primary hover:underline uppercase tracking-wider"
                >
                  {t('weights.resetDefaults')}
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          {sorted.length === 0 ? (
            <div className="border border-dashed border-outline-variant rounded-2xl p-12 text-center">
              <p className="text-on-surface-variant text-body-md">{L.noMatch}</p>
            </div>
          ) : (
            <div className="glass-card overflow-hidden shadow-sm">
              {drill && (
                <div className="px-4 py-2.5 border-b border-outline-variant/30 bg-surface-container-low/40">
                  <button
                    onClick={() => selectCluster(null)}
                    className="text-label-sm font-semibold text-primary hover:underline uppercase tracking-wider"
                  >
                    ← {L.backToClusters}
                  </button>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px]">
                  <thead>
                    <tr className="border-b border-outline-variant/40 bg-surface-container-low/50">
                      <th className="text-left px-4 py-3.5 table-header w-10">{t('columns.rank')}</th>
                      <th className="text-left px-4 py-3.5 table-header">{t('columns.city')}</th>
                      {dataCols.map((c) => (
                        <th key={c.key} className="px-3 py-3.5 text-right">
                          <SortHeader label={c.label} colKey={c.key} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                        </th>
                      ))}
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((vr, i) => {
                      const row = vr.row;
                      const isExpanded = expandedId === row.city.id;
                      const isHome = row.isHome;
                      return (
                        <Fragment key={row.city.id}>
                          <tr
                            className={cn(
                              'border-b border-outline-variant/20 hover:bg-surface-container-low/60 cursor-pointer transition-colors',
                              isHome && 'bg-primary/5',
                              isExpanded && 'bg-surface-container-low/60',
                            )}
                            onClick={() => setExpandedId((p) => (p === row.city.id ? null : row.city.id))}
                            title={t('expandHint')}
                          >
                            <td className="px-4 py-3.5 table-value text-on-surface-variant">{i + 1}</td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <span className="text-lg leading-none">{row.city.flag}</span>
                                <div>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setDetailSlug(row.city.slug); }}
                                    className="text-body-md font-semibold text-on-surface hover:text-primary hover:underline transition-colors text-left"
                                  >
                                    {row.city.nameDE}
                                  </button>
                                  {isHome && <span className="block text-label-sm text-primary font-semibold uppercase tracking-wider">{t('homeCity')}</span>}
                                </div>
                              </div>
                            </td>
                            {dataCols.map((c) => {
                              if (c.key === 'pp') {
                                const positive = row.purchasingPowerDelta >= 0;
                                return (
                                  <td key={c.key} className="px-3 py-3.5 text-right">
                                    <span className={cn('table-value font-bold', positive ? 'text-primary' : 'text-error')}>
                                      {positive ? '+' : ''}{formatCurrency(row.purchasingPowerDelta)}
                                    </span>
                                  </td>
                                );
                              }
                              const isTotalCol = c.key === 'total' || c.key === 'avg';
                              return (
                                <td key={c.key} className="px-3 py-3.5 text-right">
                                  <ScoreBadge value={cellValue(vr, c.key)} size={isTotalCol ? 'md' : 'sm'} pendingLabel={L.pending} />
                                </td>
                              );
                            })}
                            <td className="px-2 py-3.5 text-on-surface-variant text-label-sm text-center">{isExpanded ? '▲' : '▼'}</td>
                          </tr>
                          {isExpanded && (
                            <tr key={`${row.city.id}-expanded`}>
                              <td colSpan={dataCols.length + 3} className="p-0">
                                <ExpandedRow vr={vr} locale={locale} />
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
          )}
        </>
      )}

      {!data && !loading && !error && (
        <div className="border border-dashed border-outline-variant rounded-2xl p-12 text-center">
          <p className="text-on-surface-variant text-body-md">{t('enterDetails')}</p>
        </div>
      )}

      <CityDetailsModal slug={detailSlug} onClose={() => setDetailSlug(null)} />
    </div>
  );
}
