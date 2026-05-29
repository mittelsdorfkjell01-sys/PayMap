'use client';

import { RentComparisonChart, type RentComparisonRow } from '@/components/cities/_shared/RentComparisonChart';

const ZUERICH_RENTS: RentComparisonRow[] = [
  { nameDE: 'Kreis 8 — Riesbach/Seefeld', nameEN: 'District 8 — Seefeld',     rent1BR: 3200, rent2BR: 4600, rent3BR: 6800 },
  { nameDE: 'Kreis 1 — Altstadt',          nameEN: 'District 1 — Old Town',    rent1BR: 3000, rent2BR: 4500, rent3BR: 6500 },
  { nameDE: 'Kreis 7 — Hottingen',         nameEN: 'District 7 — Hottingen',   rent1BR: 2900, rent2BR: 4200, rent3BR: 6000 },
  { nameDE: 'Kreis 6 — Unterstrass',       nameEN: 'District 6 — Unterstrass', rent1BR: 2500, rent2BR: 3500, rent3BR: 5000 },
  { nameDE: 'Kreis 5 — Industriequartier', nameEN: 'District 5 — Industrie',   rent1BR: 2600, rent2BR: 3700, rent3BR: 5200 },
  { nameDE: 'Kreis 4 — Aussersihl',        nameEN: 'District 4 — Aussersihl',  rent1BR: 2400, rent2BR: 3400, rent3BR: 4800 },
  { nameDE: 'Kreis 3 — Wiedikon',          nameEN: 'District 3 — Wiedikon',    rent1BR: 2200, rent2BR: 3100, rent3BR: 4400 },
  { nameDE: 'Kreis 11 — Oerlikon',         nameEN: 'District 11 — Oerlikon',   rent1BR: 2100, rent2BR: 3000, rent3BR: 4200 },
];

type Props = { locale?: string };

export function RentComparison({ locale = 'de' }: Props) {
  return (
    <RentComparisonChart
      rows={ZUERICH_RENTS}
      currency="CHF"
      locale={locale}
      source={locale === 'de' ? 'Homegate.ch / Comparis.ch Q1 2025 · Schätzwerte' : 'Homegate.ch / Comparis.ch Q1 2025 · Estimates'}
    />
  );
}
