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
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{t('grossLabel')}</span>
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
              className="w-24 text-right text-sm font-semibold text-gray-800 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-400"
            />
            <span className="text-xs text-gray-400">€ / Jahr</span>
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
        <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1.5">
          {t('targetCityLabel')}
        </label>
        <input
          type="text"
          value={cityInput}
          onChange={(e) => { setCityInput(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          autoComplete="off"
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400 bg-white"
        />
        {open && options.length > 0 && (
          <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto py-1">
            {options.map((opt) => (
              <li key={opt.id}>
                <button
                  type="button"
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
                  onMouseDown={() => { setCityInput(opt.nameDE); onChangeCity(opt.nameDE); setOpen(false); }}
                >
                  <span>{opt.flag}</span>
                  <span className="font-medium text-gray-800">{opt.nameDE}</span>
                  <span className="text-gray-400 text-xs ml-auto">{opt.nameEN}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
