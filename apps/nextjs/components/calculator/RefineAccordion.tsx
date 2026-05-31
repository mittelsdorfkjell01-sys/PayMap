'use client';
import { forwardRef } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export interface RefineFields {
  employment: string | null;
  familyStatus: string | null;
  children: number;
  kvType: string | null;
}

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
      <div ref={ref} className="bg-white border border-border/60 rounded-xl overflow-hidden">
        {/* Header row */}
        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
          aria-expanded={open}
        >
          <div className="min-w-0">
            <p className="text-sm font-normal text-foreground">{t('title')}</p>
            {!open && summaryParts.length > 0 && (
              <p className="text-xs font-light text-muted-foreground mt-0.5 truncate">
                {summaryParts.join(' · ')}
              </p>
            )}
          </div>
          <span
            className={cn(
              'ml-3 shrink-0 text-muted-foreground transition-transform duration-200 text-sm',
              open && 'rotate-180',
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>

        {/* Body — only when open */}
        {open && (
          <div className="px-5 pb-5 space-y-5 border-t border-border/40 pt-4">
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

            {/* Children */}
            <div className="space-y-2">
              <p className="text-xs font-light text-muted-foreground uppercase tracking-widest">
                {t('childrenLabel')}
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => set('children', Math.max(0, value.children - 1))}
                  disabled={value.children === 0}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-foreground hover:text-foreground disabled:opacity-40 transition-all"
                  aria-label={t('childrenDecrease')}
                >
                  −
                </button>
                <span className="text-sm font-normal text-foreground w-6 text-center select-none">
                  {value.children}
                </span>
                <button
                  type="button"
                  onClick={() => set('children', Math.min(10, value.children + 1))}
                  disabled={value.children >= 10}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-foreground hover:text-foreground disabled:opacity-40 transition-all"
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
      <p className="text-xs font-light text-muted-foreground uppercase tracking-widest">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(selected === opt.value ? null : opt.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-light transition-all border',
              selected === opt.value
                ? 'bg-primary text-white border-primary'
                : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground',
            )}
          >
            {t(opt.key)}
          </button>
        ))}
      </div>
    </div>
  );
}
