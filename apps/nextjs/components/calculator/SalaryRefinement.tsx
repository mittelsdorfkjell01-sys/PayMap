'use client';
import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Slider } from '@/components/ui/Slider';

interface CityOption {
  id: string;
  slug: string;
  nameDE: string;
  nameEN: string;
  flag: string;
  currency: string;
  countrySlug: string;
}

export interface SalaryRefinementProps {
  grossSalary: number;
  toCity: string;
  onChangeSalary: (v: number) => void;
  onChangeCity: (v: string) => void;
}

function useDebounce<T>(value: T, delay: number): T {
  const [d, setD] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setD(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return d;
}

export function SalaryRefinement({ grossSalary, toCity, onChangeSalary, onChangeCity }: SalaryRefinementProps) {
  const t = useTranslations('calculator.refine');
  const [localGross, setLocalGross] = useState(grossSalary);
  const [cityInput, setCityInput] = useState(toCity);
  const [options, setOptions] = useState<CityOption[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedCity = useDebounce(cityInput, 200);

  useEffect(() => { setLocalGross(grossSalary); }, [grossSalary]);
  useEffect(() => { setCityInput(toCity); }, [toCity]);

  useEffect(() => {
    if (debouncedCity.length < 2) { setOptions([]); return; }
    fetch(`/api/cities/search?q=${encodeURIComponent(debouncedCity)}`)
      .then((r) => r.json())
      .then(setOptions)
      .catch(() => {});
  }, [debouncedCity]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  function handleGrossChange(v: number) {
    setLocalGross(v);
    onChangeSalary(v);
  }

  return (
    <div className="space-y-4">
      {/* Salary */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-caption uppercase tracking-[0.04em] text-text-3">{t('grossLabel')}</span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={10000}
              max={300000}
              step={1000}
              value={localGross}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v >= 10000 && v <= 300000) handleGrossChange(v);
              }}
              className="w-24 rounded-md border border-line bg-surface px-2 py-1 text-right text-data-sm tabular text-text focus:border-focus focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--focus)_25%,transparent)] focus:outline-none"
            />
            <span className="text-caption text-text-3">€ / Jahr</span>
          </div>
        </div>
        <Slider
          label={t('grossLabel')}
          min={10000}
          max={300000}
          value={localGross}
          onChange={handleGrossChange}
        />
      </div>

      {/* Target city */}
      <div ref={containerRef} className="relative">
        <label className="mb-1.5 block text-caption uppercase tracking-[0.04em] text-text-3">
          {t('targetCityLabel')}
        </label>
        <input
          type="text"
          value={cityInput}
          onChange={(e) => { setCityInput(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          autoComplete="off"
          className="w-full rounded-md border border-line bg-surface px-3 py-2 text-body text-text focus:border-focus focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--focus)_25%,transparent)] focus:outline-none"
        />
        {open && options.length > 0 && (
          <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-line bg-surface py-1 shadow-float">
            {options.map((opt) => (
              <li key={opt.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-body transition-colors hover:bg-surface-sub"
                  onMouseDown={() => { setCityInput(opt.nameDE); onChangeCity(opt.nameDE); setOpen(false); }}
                >
                  <span>{opt.flag}</span>
                  <span className="text-text">{opt.nameDE}</span>
                  <span className="ml-auto text-sm text-text-3">{opt.nameEN}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
