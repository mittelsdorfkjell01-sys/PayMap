'use client';
import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import { ApproximateResult } from './ApproximateResult';
import { PreciseCTA } from './PreciseCTA';
import { RefineAccordion, type RefineFields } from './RefineAccordion';
import { SalaryRefinement } from './SalaryRefinement';
import { CityDetailsModal } from '@/components/city-details/CityDetailsModal';
import { ShareButton } from './ShareButton';

interface CalculatorFormState {
  fromCity: string;
  toCity: string;
  grossSalary: string;
}

interface CityOption {
  id: string;
  slug: string;
  nameDE: string;
  nameEN: string;
  flag: string;
  currency: string;
  countrySlug: string;
}

export interface TaxWithRegime {
  netMonthly: number;
  netAnnual: number;
  effectiveRate: number;
  regimeId: string;
  regimeSlug: string;
  regimeNameDE: string;
  regimeNameEN: string;
  conditionsDE: string | null;
  flatRate: number | null;
  savings: number;
}

export interface CalculateResponse {
  isApproximate: boolean;
  fromCity: { id: string; slug: string; nameDE: string; nameEN: string; flag: string; currency: string; countrySlug: string };
  toCity: { id: string; slug: string; nameDE: string; nameEN: string; flag: string; currency: string; countrySlug: string };
  from: { netMonthly: number; netAnnual: number; effectiveRate: number; totalDeductions: number; netMonthlyMin?: number; netMonthlyMax?: number };
  to: { netMonthly: number; netAnnual: number; effectiveRate: number; totalDeductions: number; netMonthlyMin?: number; netMonthlyMax?: number };
  monthlyDifference: number;
  equivalenceSalary: number | null;
  costOfLiving: { from: null; to: null };
  lifestyle: { from: Record<string, number>; to: Record<string, number> };
  taxWithRegime: TaxWithRegime | null;
  fxStale?: boolean;
  shareToken?: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const EMPTY_REFINE: RefineFields = {
  employment: null,
  familyStatus: null,
  children: 0,
  kvType: null,
  privateKvPremium: null,
};

function CityAutocomplete({
  id,
  name,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [options, setOptions] = useState<CityOption[]>([]);
  const [open, setOpen] = useState(false);
  const debouncedValue = useDebounce(value, 200);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debouncedValue.length < 2) { setOptions([]); return; }
    fetch(`/api/cities/search?q=${encodeURIComponent(debouncedValue)}`)
      .then((r) => r.json())
      .then(setOptions)
      .catch(() => {});
  }, [debouncedValue]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <input
        id={id}
        name={name}
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className={cn('input-field', disabled && 'opacity-50 cursor-not-allowed')}
      />
      {open && options.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full glass-card-solid shadow-lg max-h-48 overflow-y-auto py-1">
          {options.map((opt) => (
            <li key={opt.id}>
              <button
                type="button"
                className="w-full text-left px-4 py-2.5 text-body-md hover:bg-surface-container flex items-center gap-2 transition-colors"
                onMouseDown={() => { onChange(opt.nameDE); setOpen(false); }}
              >
                <span>{opt.flag}</span>
                <span className="font-medium text-on-surface">{opt.nameDE}</span>
                <span className="text-on-surface-variant text-label-sm ml-auto">{opt.nameEN}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface UserProfile {
  grossAnnual: number | null;
  employment: string | null;
  familyStatus: string | null;
  childrenCount: number | null;
  kvType: string | null;
  onboardingDone: boolean;
}

export default function Calculator() {
  const t = useTranslations('calculator');
  const { user } = useAuth();

  const [form, setForm] = useState<CalculatorFormState>({ fromCity: '', toCity: '', grossSalary: '' });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [undecided, setUndecided] = useState(false);
  const [suggestions, setSuggestions] = useState<CityOption[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalculateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [regimeEnabled, setRegimeEnabled] = useState(false);
  const [detailSlug, setDetailSlug] = useState<string | null>(null);
  const [lastPayload, setLastPayload] = useState<Record<string, unknown> | null>(null);

  // Inline salary/city refinement state
  const [inlineGross, setInlineGross] = useState<number | null>(null);
  const [inlineToCity, setInlineToCity] = useState<string | null>(null);
  const debouncedInlineGross = useDebouncedValue(inlineGross, 600);
  const debouncedInlineToCity = useDebouncedValue(inlineToCity, 600);

  // Refinement accordion state
  const [refineFields, setRefineFields] = useState<RefineFields>(EMPTY_REFINE);
  const [refineOpen, setRefineOpen] = useState(false);
  const accordionRef = useRef<HTMLDivElement>(null);

  // Refs for the debounce effect (avoid stale closure without adding them as deps)
  const formRef = useRef(form);
  useEffect(() => { formRef.current = form; }, [form]);
  const resultRef = useRef(result);
  useEffect(() => { resultRef.current = result; }, [result]);

  const debouncedFrom = useDebounce(form.fromCity, 400);
  const debouncedRefine = useDebouncedValue(refineFields, 400);

  // Open modal from URL param on mount
  useEffect(() => {
    const city = new URLSearchParams(window.location.search).get('city');
    if (city) setDetailSlug(city);
  }, []);

  // Load profile on login
  useEffect(() => {
    if (!user) { setProfile(null); return; }
    fetch('/api/profile')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setProfile(data);
          if (data.grossAnnual) setForm((prev) => ({ ...prev, grossSalary: String(Math.round(data.grossAnnual)) }));
        }
      })
      .catch(() => {});
  }, [user]);

  // Suggestions for undecided mode
  useEffect(() => {
    if (!undecided || debouncedFrom.length < 2) { setSuggestions([]); return; }
    setLoadingSuggestions(true);
    fetch(`/api/cities/suggestions?from=${encodeURIComponent(debouncedFrom)}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setSuggestions(data); })
      .catch(() => {})
      .finally(() => setLoadingSuggestions(false));
  }, [undecided, debouncedFrom]);

  // Re-fetch when inline gross/city change (debounced, 600ms)
  useEffect(() => {
    if (!resultRef.current) return;
    if (debouncedInlineGross === null && debouncedInlineToCity === null) return;

    const { fromCity, grossSalary } = formRef.current;
    const gross = debouncedInlineGross ?? parseFloat(grossSalary);
    const toCity = debouncedInlineToCity ?? formRef.current.toCity;
    if (!fromCity || !toCity || isNaN(gross) || gross <= 0) return;

    setLoading(true);
    fetch('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromCity, toCity, grossSalary: gross }),
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setResult(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [debouncedInlineGross, debouncedInlineToCity]);

  // Re-fetch when refine fields change (debounced)
  useEffect(() => {
    if (!resultRef.current) return;
    const { employment, familyStatus, children, kvType, privateKvPremium } = debouncedRefine;
    const hasAnyField = employment !== null || familyStatus !== null || children > 0 || kvType !== null;
    if (!hasAnyField) return;

    const { fromCity, toCity, grossSalary } = formRef.current;
    const gross = parseFloat(grossSalary);
    if (!fromCity || !toCity || isNaN(gross) || gross <= 0) return;

    const payload: Record<string, unknown> = { fromCity, toCity, grossSalary: gross };
    if (employment) payload.employment = employment;
    if (familyStatus) payload.familyStatus = familyStatus;
    if (children > 0) payload.children = children;
    if (kvType) payload.kvType = kvType;
    if (kvType === 'private' && privateKvPremium != null) payload.privateKvPremium = privateKvPremium;

    setLoading(true);
    fetch('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setResult(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [debouncedRefine]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const gross = parseFloat(form.grossSalary);
    if (!form.fromCity || !form.toCity || isNaN(gross) || gross <= 0) return;

    const payload: Record<string, unknown> = {
      fromCity: form.fromCity,
      toCity: form.toCity,
      grossSalary: gross,
    };
    if (profile?.onboardingDone) {
      if (profile.employment) payload.employment = profile.employment;
      if (profile.familyStatus) payload.familyStatus = profile.familyStatus;
      if (profile.childrenCount != null) payload.children = profile.childrenCount;
      if (profile.kvType) payload.kvType = profile.kvType;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? t('networkError'));
        return;
      }
      const data: CalculateResponse = await res.json();
      setResult(data);
      setRefineFields(EMPTY_REFINE);
      setRefineOpen(false);
      setRegimeEnabled(false);
      setLastPayload(payload);
      setInlineGross(gross);
      setInlineToCity(form.toCity);
      try {
        sessionStorage.setItem('paymap_calc', JSON.stringify({ fromCity: form.fromCity, gross: form.grossSalary }));
      } catch { /* private browsing */ }
    } catch {
      setError(t('networkError'));
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setForm({ fromCity: '', toCity: '', grossSalary: '' });
    setUndecided(false);
    setResult(null);
    setError(null);
    setRefineFields(EMPTY_REFINE);
    setRefineOpen(false);
    setRegimeEnabled(false);
    setLastPayload(null);
    setInlineGross(null);
    setInlineToCity(null);
  }

  function selectSuggestion(city: CityOption) {
    setForm((prev) => ({ ...prev, toCity: city.nameDE }));
    setUndecided(false);
  }

  function handleScrollToAccordion() {
    setRefineOpen(true);
    setTimeout(() => {
      accordionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50); // small delay so the accordion has time to open
  }

  async function handleSaveToProfile() {
    if (!user) return;
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employment: refineFields.employment,
          familyStatus: refineFields.familyStatus,
          childrenCount: refineFields.children,
          kvType: refineFields.kvType,
          onboardingDone: true,
        }),
      });
    } catch { /* silent */ }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-headline-xl-mobile md:text-headline-xl font-bold text-on-background">{t('title')}</h1>
        <p className="text-body-lg text-on-surface-variant">{t('subtitle')}</p>
      </div>

      {/* Form Card */}
      <div className="glass-card p-6 space-y-5 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* From City */}
          <div className="space-y-1.5">
            <label htmlFor="fromCity" className="label-field">{t('fromCity')}</label>
            <CityAutocomplete
              id="fromCity"
              name="fromCity"
              value={form.fromCity}
              onChange={(v) => setForm((prev) => ({ ...prev, fromCity: v }))}
              placeholder={t('fromCityPlaceholder')}
            />
          </div>

          {/* To City */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="toCity" className="label-field">{t('toCity')}</label>
              <button
                type="button"
                onClick={() => setUndecided((v) => !v)}
                className={cn(
                  'text-label-sm font-semibold px-3 py-1 rounded-full transition-colors uppercase tracking-wider',
                  undecided
                    ? 'bg-secondary-container/60 text-secondary'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high',
                )}
              >
                {t('undecided')}
              </button>
            </div>

            {undecided ? (
              <div className="space-y-3">
                {loadingSuggestions && (
                  <p className="text-label-sm text-on-surface-variant py-2">{t('calculating')}</p>
                )}
                {suggestions.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {suggestions.map((city) => (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => selectSuggestion(city)}
                        className="flex flex-col items-center gap-1 p-3 border border-outline-variant rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-center"
                      >
                        <span className="text-xl">{city.flag}</span>
                        <span className="text-label-sm font-semibold text-on-surface leading-tight">{city.nameDE}</span>
                      </button>
                    ))}
                  </div>
                )}
                {!loadingSuggestions && suggestions.length === 0 && form.fromCity.length >= 2 && (
                  <p className="text-label-sm text-on-surface-variant">{t('undecidedHint')}</p>
                )}
                <button
                  type="button"
                  onClick={() => setUndecided(false)}
                  className="text-label-sm text-primary hover:underline uppercase tracking-wider"
                >
                  {t('undecidedBack')}
                </button>
              </div>
            ) : (
              <CityAutocomplete
                id="toCity"
                name="toCity"
                value={form.toCity}
                onChange={(v) => setForm((prev) => ({ ...prev, toCity: v }))}
                placeholder={t('toCityPlaceholder')}
              />
            )}
          </div>

          {/* Gross Salary */}
          <div className="space-y-1.5">
            <label htmlFor="grossSalary" className="label-field">{t('grossSalary')}</label>
            <div className="relative">
              <input
                id="grossSalary"
                name="grossSalary"
                type="number"
                min={0}
                max={9999999}
                value={form.grossSalary}
                onChange={(e) => setForm((prev) => ({ ...prev, grossSalary: e.target.value }))}
                placeholder={t('grossSalaryPlaceholder')}
                className="input-field pr-20"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-label-sm text-on-surface-variant pointer-events-none uppercase tracking-wider">
                {t('grossSalaryUnit')}
              </span>
            </div>
          </div>

          {error && (
            <p className="text-body-md text-error bg-error-container/30 border border-error/30 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading || !form.fromCity || (!undecided && !form.toCity) || !form.grossSalary}
              className="flex-1 btn-primary"
            >
              {loading ? t('calculating') : t('calculate')}
            </button>
            <button type="button" onClick={handleReset} className="btn-secondary px-4">
              {t('reset')}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <ApproximateResult
            result={result}
            regimeEnabled={regimeEnabled}
            onRegimeChange={setRegimeEnabled}
            onCityClick={setDetailSlug}
            salaryRefinement={
              inlineGross !== null && inlineToCity !== null ? (
                <SalaryRefinement
                  grossSalary={inlineGross}
                  toCity={inlineToCity}
                  onChangeSalary={setInlineGross}
                  onChangeCity={setInlineToCity}
                />
              ) : undefined
            }
          />
          <div className="flex gap-3 items-start flex-wrap">
            <div className="flex-1 min-w-0">
              <PreciseCTA
                isApproximate={result.isApproximate}
                refineFields={refineFields}
                onScrollDown={handleScrollToAccordion}
                onSaveToProfile={handleSaveToProfile}
              />
            </div>
            <ShareButton payload={lastPayload} />
          </div>
          <RefineAccordion
            ref={accordionRef}
            value={refineFields}
            onChange={setRefineFields}
            targetCountrySlug={result.toCity.countrySlug}
            open={refineOpen}
            onOpenChange={setRefineOpen}
          />
        </div>
      )}

      {/* Empty state */}
      {!result && (
        <div className="border border-dashed border-outline-variant rounded-2xl p-10 text-center">
          <p className="text-on-surface-variant text-body-md">
            {t('emptyState')}
          </p>
        </div>
      )}

      <CityDetailsModal slug={detailSlug} onClose={() => setDetailSlug(null)} />
    </div>
  );
}
