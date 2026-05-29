'use client';

import { RentComparisonChart, type RentComparisonRow } from '@/components/cities/_shared/RentComparisonChart';

const BANGKOK_RENTS: RentComparisonRow[] = [
  { nameDE: 'Thonglor / Ekkamai',       nameEN: 'Thonglor / Ekkamai',       rent1BR: 950,  rent2BR: 1600, rent3BR: 2800 },
  { nameDE: 'Silom / Sathorn (CBD)',     nameEN: 'Silom / Sathorn (CBD)',     rent1BR: 900,  rent2BR: 1500, rent3BR: 2500 },
  { nameDE: 'Asoke / Phrom Phong',      nameEN: 'Asoke / Phrom Phong',      rent1BR: 780,  rent2BR: 1300, rent3BR: 2100 },
  { nameDE: 'Sukhumvit (allg.)',         nameEN: 'Sukhumvit (general)',       rent1BR: 750,  rent2BR: 1200, rent3BR: 1900 },
  { nameDE: 'Ari / Phahol Yothin',      nameEN: 'Ari / Phahol Yothin',      rent1BR: 580,  rent2BR: 900,  rent3BR: 1400 },
  { nameDE: 'Bang Rak / Charoen Krung', nameEN: 'Bang Rak / Charoen Krung', rent1BR: 600,  rent2BR: 1000, rent3BR: 1600 },
  { nameDE: 'Ratchathewi / Victory',    nameEN: 'Ratchathewi / Victory',    rent1BR: 450,  rent2BR: 700,  rent3BR: 1100 },
  { nameDE: 'Phra Khanong / On Nut',    nameEN: 'Phra Khanong / On Nut',    rent1BR: 420,  rent2BR: 650,  rent3BR: 1000 },
];

type Props = { locale?: string };

export function RentComparison({ locale = 'de' }: Props) {
  return (
    <RentComparisonChart
      rows={BANGKOK_RENTS}
      currency="EUR"
      locale={locale}
      source={locale === 'de' ? 'DDproperty.com / Hipflat.com Q1 2025 · Schätzwerte (38 THB/EUR)' : 'DDproperty.com / Hipflat.com Q1 2025 · Estimates (38 THB/EUR)'}
    />
  );
}
