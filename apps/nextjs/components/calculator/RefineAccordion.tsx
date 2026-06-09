'use client';
import { forwardRef } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export interface RefineFields {
  employment: string | null;
  familyStatus: string | null;
  children: number;
  kvType: string | null;
  // DE PKV monthly premium (only relevant when kvType === 'private').
  privateKvPremium: number | null;
  // Partner's annual gross (DE Ehegatten-Splitting; only relevant when married).
  partnerGross: number | null;
  // DE church tax: levied only when churchMember; bundesland sets the rate.
  churchMember: boolean;
  bundesland: string | null;
}

// DE Bundesländer (value = engine code; only BY/BW levy 8%, the rest 9%).
const BUNDESLAENDER: { value: string; label: string }[] = [
  { value: 'BW', label: 'Baden-Württemberg' },
  { value: 'BY', label: 'Bayern' },
  { value: 'BE', label: 'Berlin' },
  { value: 'BB', label: 'Brandenburg' },
  { value: 'HB', label: 'Bremen' },
  { value: 'HH', label: 'Hamburg' },
  { value: 'HE', label: 'Hessen' },
  { value: 'MV', label: 'Mecklenburg-Vorpommern' },
  { value: 'NI', label: 'Niedersachsen' },
  { value: 'NW', label: 'Nordrhein-Westfalen' },
  { value: 'RP', label: 'Rheinland-Pfalz' },
  { value: 'SL', label: 'Saarland' },
  { value: 'SN', label: 'Sachsen' },
  { value: 'ST', label: 'Sachsen-Anhalt' },
  { value: 'SH', label: 'Schleswig-Holstein' },
  { value: 'TH', label: 'Thüringen' },
];

interface RefineAccordionProps {
  value: RefineFields;
  onChange: (v: RefineFields) => void;
  targetCountrySlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type RKey = Parameters<ReturnType<typeof useTranslations<'calculator.refine'>>>[0];

const EMPLOYMENT_OPTIONS: { value: string; key: RKey }[] = [
  { value: 'employed',   key: 'employed'   },
  { value: 'freelancer', key: 'freelancer' },
  { value: 'founder',    key: 'founder'    },
  { value: 'passive',    key: 'passive'    },
];

const FAMILY_OPTIONS: { value: string; key: RKey }[] = [
  { value: 'single',   key: 'single'   },
  { value: 'married',  key: 'married'  },
  { value: 'divorced', key: 'divorced' },
];

const KV_OPTIONS: { value: string; key: RKey }[] = [
  { value: 'statutory', key: 'statutory' },
  { value: 'private',   key: 'private'   },
];

const KV_COUNTRIES = new Set(['de', 'at']);

export const RefineAccordion = forwardRef<HTMLDivElement, RefineAccordionProps>(
  function RefineAccordion({ value, onChange, targetCountrySlug, open, onOpenChange }, ref) {
    const t = useTranslations('calculator.refine');

    function set<K extends keyof RefineFields>(key: K, val: RefineFields[K]) {
      onChange({ ...value, [key]: val });
    }

    const showKV = KV_COUNTRIES.has(targetCountrySlug);

    const summaryParts: string[] = [];
    if (value.employment) summaryParts.push(t(value.employment as RKey));
    if (value.familyStatus) summaryParts.push(t(value.familyStatus as RKey));
    if (value.children > 0) summaryParts.push(`${value.children} ${value.children === 1 ? t('childrenOne') : t('childrenMany')}`);

    return (
      <div ref={ref} className="glass-card overflow-hidden shadow-sm">
        {/* Header row */}
        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-container/30 transition-colors"
          aria-expanded={open}
        >
          <div className="min-w-0">
            <p className="text-body-md font-semibold text-on-surface">{t('title')}</p>
            {!open && summaryParts.length > 0 && (
              <p className="text-label-sm text-on-surface-variant mt-0.5 truncate">
                {summaryParts.join(' · ')}
              </p>
            )}
          </div>
          <span
            className={cn(
              'ml-3 shrink-0 text-on-surface-variant transition-transform duration-200 text-body-md',
              open && 'rotate-180',
            )}
          >
            ↓
          </span>
        </button>

        {/* Body — only when open */}
        {open && (
          <div className="px-5 pb-5 space-y-5 border-t border-outline-variant/30 pt-4">
            {/* Employment */}
            <ChipGroup
              label={t('employmentLabel')}
              options={EMPLOYMENT_OPTIONS}
              selected={value.employment}
              onSelect={(v) => set('employment', v)}
              t={t}
            />

            {/* Family status */}
            <ChipGroup
              label={t('familyStatusLabel')}
              options={FAMILY_OPTIONS}
              selected={value.familyStatus}
              onSelect={(v) => set('familyStatus', v)}
              t={t}
            />

            {/* Partner gross — inline, only when married (DE splitting) */}
            {value.familyStatus === 'married' && (
              <div className="space-y-2 pl-3 border-l-2 border-outline-variant/40">
                <p className="text-label-sm font-medium text-on-surface-variant uppercase tracking-wider">
                  {t('partnerGrossLabel')}
                </p>
                <div className="relative max-w-[14rem]">
                  <input
                    type="number"
                    min={0}
                    max={9999999}
                    step={1000}
                    value={value.partnerGross ?? ''}
                    onChange={(e) => {
                      const v = e.target.value === '' ? null : parseInt(e.target.value, 10);
                      set('partnerGross', v != null && !isNaN(v) ? v : null);
                    }}
                    placeholder={t('partnerGrossPlaceholder')}
                    className="input-field pr-20"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-label-sm text-on-surface-variant pointer-events-none">
                    {t('partnerGrossUnit')}
                  </span>
                </div>
                <p className="text-label-sm text-on-surface-variant">{t('partnerGrossHint')}</p>
              </div>
            )}

            {/* Children */}
            <div className="space-y-2">
              <p className="text-label-sm font-medium text-on-surface-variant uppercase tracking-wider">
                {t('childrenLabel')}
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => set('children', Math.max(0, value.children - 1))}
                  disabled={value.children === 0}
                  className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-outline hover:text-on-surface disabled:opacity-40 transition-all"
                  aria-label={t('childrenDecrease')}
                >
                  −
                </button>
                <span className="text-body-md font-semibold text-on-surface w-6 text-center select-none">
                  {value.children}
                </span>
                <button
                  type="button"
                  onClick={() => set('children', Math.min(10, value.children + 1))}
                  disabled={value.children >= 10}
                  className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-outline hover:text-on-surface disabled:opacity-40 transition-all"
                  aria-label={t('childrenIncrease')}
                >
                  +
                </button>
              </div>
            </div>

            {/* KV — only DE / AT */}
            {showKV && (
              <ChipGroup
                label={t('kvLabel')}
                options={KV_OPTIONS}
                selected={value.kvType}
                onSelect={(v) => set('kvType', v)}
                t={t}
              />
            )}

            {/* PKV monthly premium — only DE + private */}
            {targetCountrySlug === 'de' && value.kvType === 'private' && (
              <div className="space-y-2">
                <p className="text-label-sm font-medium text-on-surface-variant uppercase tracking-wider">
                  {t('pkvPremiumLabel')}
                </p>
                <div className="relative max-w-[12rem]">
                  <input
                    type="number"
                    min={0}
                    max={3000}
                    step={10}
                    value={value.privateKvPremium ?? ''}
                    onChange={(e) => {
                      const v = e.target.value === '' ? null : parseInt(e.target.value, 10);
                      set('privateKvPremium', v != null && !isNaN(v) ? v : null);
                    }}
                    placeholder={t('pkvPremiumPlaceholder')}
                    className="input-field pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-label-sm text-on-surface-variant pointer-events-none">
                    {t('pkvPremiumUnit')}
                  </span>
                </div>
                <p className="text-label-sm text-on-surface-variant">{t('pkvPremiumHint')}</p>
              </div>
            )}

            {/* Church tax — only when target is DE */}
            {targetCountrySlug === 'de' && (
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={value.churchMember}
                    onClick={() => set('churchMember', !value.churchMember)}
                    className={cn(
                      'relative w-10 h-6 rounded-full transition-colors shrink-0',
                      value.churchMember ? 'bg-primary' : 'bg-surface-container-high',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                        value.churchMember && 'translate-x-4',
                      )}
                    />
                  </button>
                  <span className="text-body-md text-on-surface">{t('churchLabel')}</span>
                </label>
                {value.churchMember && (
                  <div className="space-y-2">
                    <p className="text-label-sm font-medium text-on-surface-variant uppercase tracking-wider">
                      {t('bundeslandLabel')}
                    </p>
                    <select
                      value={value.bundesland ?? ''}
                      onChange={(e) => set('bundesland', e.target.value || null)}
                      className="input-field max-w-[16rem]"
                    >
                      <option value="">{t('bundeslandPlaceholder')}</option>
                      {BUNDESLAENDER.map((b) => (
                        <option key={b.value} value={b.value}>{b.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);

// ── Internal helpers ──────────────────────────────────────────────────────────

function ChipGroup({
  label,
  options,
  selected,
  onSelect,
  t,
}: {
  label: string;
  options: { value: string; key: RKey }[];
  selected: string | null;
  onSelect: (v: string | null) => void;
  t: ReturnType<typeof useTranslations<'calculator.refine'>>;
}) {
  return (
    <div className="space-y-2">
      <p className="text-label-sm font-medium text-on-surface-variant uppercase tracking-wider">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(selected === opt.value ? null : opt.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-body-sm font-medium transition-all border',
              selected === opt.value
                ? 'bg-primary text-on-primary border-primary'
                : 'border-outline-variant text-on-surface-variant hover:border-outline hover:text-on-surface',
            )}
          >
            {t(opt.key)}
          </button>
        ))}
      </div>
    </div>
  );
}
