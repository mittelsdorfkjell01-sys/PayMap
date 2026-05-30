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
      <div ref={ref} className="overflow-hidden rounded-lg border border-line bg-surface">
        {/* Header row */}
        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          className="focus-ring flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-surface-sub"
          aria-expanded={open}
        >
          <div className="min-w-0">
            <p className="text-h3 text-text">{t('title')}</p>
            {!open && summaryParts.length > 0 && (
              <p className="mt-0.5 truncate text-caption text-text-2">
                {summaryParts.join(' · ')}
              </p>
            )}
          </div>
          <span
            className={cn(
              'ml-3 shrink-0 text-text-3 transition-transform duration-200 ease-out',
              open && 'rotate-180',
            )}
          >
            ↓
          </span>
        </button>

        {/* Body — only when open */}
        {open && (
          <div className="space-y-5 border-t border-line px-5 pb-5 pt-4">
            <ChipGroup
              label={t('employmentLabel')}
              options={EMPLOYMENT_OPTIONS}
              selected={value.employment}
              onSelect={(v) => set('employment', v)}
              t={t}
            />

            <ChipGroup
              label={t('familyStatusLabel')}
              options={FAMILY_OPTIONS}
              selected={value.familyStatus}
              onSelect={(v) => set('familyStatus', v)}
              t={t}
            />

            {/* Children */}
            <div className="space-y-2">
              <p className="text-caption uppercase tracking-[0.04em] text-text-3">
                {t('childrenLabel')}
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => set('children', Math.max(0, value.children - 1))}
                  disabled={value.children === 0}
                  className="focus-ring flex h-8 w-8 items-center justify-center rounded-full border border-line text-text-2 transition-colors hover:border-line-strong hover:text-text disabled:opacity-40"
                  aria-label={t('childrenDecrease')}
                >
                  −
                </button>
                <span className="w-6 select-none text-center text-data-md tabular text-text">
                  {value.children}
                </span>
                <button
                  type="button"
                  onClick={() => set('children', Math.min(10, value.children + 1))}
                  disabled={value.children >= 10}
                  className="focus-ring flex h-8 w-8 items-center justify-center rounded-full border border-line text-text-2 transition-colors hover:border-line-strong hover:text-text disabled:opacity-40"
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
      <p className="text-caption uppercase tracking-[0.04em] text-text-3">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(active ? null : opt.value)}
              className={cn(
                'focus-ring rounded-md border px-3 py-1.5 text-sm transition-colors duration-150 ease-out',
                active
                  ? 'border-accent bg-accent text-accent-fg'
                  : 'border-line text-text-2 hover:border-line-strong hover:text-text',
              )}
            >
              {t(opt.key)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
