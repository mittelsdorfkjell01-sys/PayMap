'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type Config = {
  currency: string;
  defaults: {
    rent1BR: number;
    rent2BR: number;
    rent3BR: number;
    depositMonths: number;
    agencyFeeMonths: number;
    furnitureUnfurnished: number;
    furnitureSemiFurnished: number;
    furnitureFurnished: number;
    nifFee: number;
    residencyRegistrationFee: number;
    monthlyGroceries1Person: number;
    monthlyGroceries2Person: number;
    monthlyGroceries4Person: number;
    transportMonthly: number;
    internetSetup: number;
    mobileMonthly: number;
  };
  footnote?: string;
};

type Props = {
  config: Config;
  locale?: string;
};

const segCls = (active: boolean) =>
  cn('focus-ring flex-1 rounded-md border py-1.5 text-sm transition-colors duration-150 ease-out', active ? 'border-accent bg-accent text-accent-fg' : 'border-line text-text-2 hover:border-line-strong hover:text-text');

export function FirstMonthBudgetCalculator({ config, locale = 'de' }: Props) {
  const d = config.defaults;
  const [persons, setPersons] = useState<1 | 2 | 4>(1);
  const [furnished, setFurnished] = useState<'furnished' | 'semi' | 'empty'>('semi');
  const [apt, setApt] = useState<'1BR' | '2BR' | '3BR'>('1BR');

  const rent = apt === '1BR' ? d.rent1BR : apt === '2BR' ? d.rent2BR : d.rent3BR;
  const furnitureCost = furnished === 'empty' ? d.furnitureUnfurnished : furnished === 'semi' ? d.furnitureSemiFurnished : d.furnitureFurnished;
  const groceries = persons === 1 ? d.monthlyGroceries1Person : persons === 2 ? d.monthlyGroceries2Person : d.monthlyGroceries4Person;

  const items = [
    { labelDE: 'Kaution', labelEN: 'Deposit', value: rent * d.depositMonths },
    { labelDE: '1. Monatsmiete', labelEN: '1st month rent', value: rent },
    { labelDE: 'Maklerprovision', labelEN: 'Agency fee', value: rent * d.agencyFeeMonths },
    { labelDE: 'Möbel/Einrichtung', labelEN: 'Furniture', value: furnitureCost },
    { labelDE: 'Lebensmittel (1 Monat)', labelEN: 'Groceries (1 month)', value: groceries },
    { labelDE: 'Transport (1 Monat)', labelEN: 'Transport (1 month)', value: d.transportMonthly },
    { labelDE: 'Internet-Setup', labelEN: 'Internet setup', value: d.internetSetup },
    { labelDE: 'Mobil (1 Monat)', labelEN: 'Mobile (1 month)', value: d.mobileMonthly },
    { labelDE: 'Behördengebühren', labelEN: 'Admin fees', value: d.nifFee + d.residencyRegistrationFee },
  ];

  const total = items.reduce((s, i) => s + i.value, 0);

  const fmt = (v: number) => v.toLocaleString(locale === 'de' ? 'de-DE' : 'en-GB', { style: 'currency', currency: config.currency, maximumFractionDigits: 0 });

  const t = (de: string, en: string) => locale === 'de' ? de : en;

  return (
    <div className="space-y-5 rounded-lg border border-line bg-surface p-5">
      <h3 className="text-h3 text-text">{t('Erstmonats-Budget-Rechner', 'First Month Budget Calculator')}</h3>

      <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
        {/* Persons */}
        <div>
          <label className="mb-1 block text-caption uppercase tracking-[0.04em] text-text-3">{t('Personen', 'Persons')}</label>
          <div className="flex gap-2">
            {([1, 2, 4] as const).map(p => (
              <button key={p} onClick={() => setPersons(p)} className={segCls(persons === p)}>
                {p === 4 ? t('Familie', 'Family') : p}
              </button>
            ))}
          </div>
        </div>

        {/* Apartment */}
        <div>
          <label className="mb-1 block text-caption uppercase tracking-[0.04em] text-text-3">{t('Wohnungsgröße', 'Apartment size')}</label>
          <div className="flex gap-2">
            {(['1BR', '2BR', '3BR'] as const).map(a => (
              <button key={a} onClick={() => setApt(a)} className={segCls(apt === a)}>
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Furnished */}
        <div>
          <label className="mb-1 block text-caption uppercase tracking-[0.04em] text-text-3">{t('Möblierung', 'Furnishing')}</label>
          <div className="flex gap-1">
            {([['furnished', t('Möbliert', 'Furnished')], ['semi', t('Teilm.', 'Semi')], ['empty', t('Leer', 'Empty')]] as const).map(([v, l]) => (
              <button key={v} onClick={() => setFurnished(v)} className={cn(segCls(furnished === v), 'text-caption')}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result table */}
      <div className="divide-y divide-line-soft text-sm">
        {items.map(item => (
          <div key={item.labelDE} className="flex justify-between py-1.5">
            <span className="text-text-2">{locale === 'de' ? item.labelDE : item.labelEN}</span>
            <span className="tabular text-text">{fmt(item.value)}</span>
          </div>
        ))}
        <div className="flex justify-between py-2">
          <span className="text-text">{t('Gesamt (erster Monat)', 'Total (first month)')}</span>
          <span className="text-data-md tabular text-text">{fmt(total)}</span>
        </div>
      </div>

      {config.footnote && (
        <p className="text-caption text-text-3">{config.footnote}</p>
      )}
    </div>
  );
}
