'use client';

import { RentComparisonChart, type RentComparisonRow } from '@/components/cities/_shared/RentComparisonChart';

const BUDAPEST_RENTS: RentComparisonRow[] = [
  { nameDE: 'I. Burgviertel',            nameEN: 'I. Castle Hill',           rent1BR: 1000, rent2BR: 1500, rent3BR: 2200 },
  { nameDE: 'V. Belváros',               nameEN: 'V. Inner City',            rent1BR: 900,  rent2BR: 1350, rent3BR: 2000 },
  { nameDE: 'VI. Terézváros',            nameEN: 'VI. Terézváros',           rent1BR: 850,  rent2BR: 1250, rent3BR: 1800 },
  { nameDE: 'II. Budaer Hügel',          nameEN: 'II. Buda Hills',           rent1BR: 750,  rent2BR: 1100, rent3BR: 1600 },
  { nameDE: 'VII. Erzsébetváros',        nameEN: 'VII. Erzsébetváros',       rent1BR: 780,  rent2BR: 1150, rent3BR: 1650 },
  { nameDE: 'XIII. Újlipótváros',        nameEN: 'XIII. Újlipótváros',       rent1BR: 720,  rent2BR: 1050, rent3BR: 1500 },
  { nameDE: 'XI. Újbuda',                nameEN: 'XI. Újbuda',               rent1BR: 600,  rent2BR: 880,  rent3BR: 1250 },
  { nameDE: 'VIII. Józsefváros',         nameEN: 'VIII. Józsefváros',        rent1BR: 550,  rent2BR: 800,  rent3BR: 1100 },
];

type Props = { locale?: string };

export function RentComparison({ locale = 'de' }: Props) {
  return (
    <RentComparisonChart
      rows={BUDAPEST_RENTS}
      currency="EUR"
      locale={locale}
      source={locale === 'de' ? 'Ingatlan.com / Ingatlanbazar.hu Q1 2025 · Schätzwerte' : 'Ingatlan.com / Ingatlanbazar.hu Q1 2025 · Estimates'}
    />
  );
}
