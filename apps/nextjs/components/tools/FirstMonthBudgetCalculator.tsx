'use client';

import { useState } from 'react';

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
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-5">
      <h3 className="font-semibold text-gray-900">{t('Erstmonats-Budget-Rechner', 'First Month Budget Calculator')}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        {/* Persons */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('Personen', 'Persons')}</label>
          <div className="flex gap-2">
            {([1, 2, 4] as const).map(p => (
              <button key={p} onClick={() => setPersons(p)}
                className={`flex-1 py-1.5 rounded-lg border text-sm font-medium transition-colors ${persons === p ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:border-blue-400'}`}>
                {p === 4 ? t('Familie', 'Family') : p}
              </button>
            ))}
          </div>
        </div>

        {/* Apartment */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('Wohnungsgröße', 'Apartment size')}</label>
          <div className="flex gap-2">
            {(['1BR', '2BR', '3BR'] as const).map(a => (
              <button key={a} onClick={() => setApt(a)}
                className={`flex-1 py-1.5 rounded-lg border text-sm font-medium transition-colors ${apt === a ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:border-blue-400'}`}>
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Furnished */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('Möblierung', 'Furnishing')}</label>
          <div className="flex gap-1">
            {([['furnished', t('Möbliert', 'Furnished')], ['semi', t('Teilm.', 'Semi')], ['empty', t('Leer', 'Empty')]] as const).map(([v, l]) => (
              <button key={v} onClick={() => setFurnished(v)}
                className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors ${furnished === v ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:border-blue-400'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result table */}
      <div className="divide-y divide-gray-100 text-sm">
        {items.map(item => (
          <div key={item.labelDE} className="flex justify-between py-1.5">
            <span className="text-gray-600">{locale === 'de' ? item.labelDE : item.labelEN}</span>
            <span className="font-medium text-gray-900">{fmt(item.value)}</span>
          </div>
        ))}
        <div className="flex justify-between py-2 font-bold text-gray-900">
          <span>{t('Gesamt (erster Monat)', 'Total (first month)')}</span>
          <span className="text-blue-700">{fmt(total)}</span>
        </div>
      </div>

      {config.footnote && (
        <p className="text-xs text-gray-400">{config.footnote}</p>
      )}
    </div>
  );
}
