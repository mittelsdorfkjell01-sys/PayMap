'use client';

import { RentComparisonChart, type RentComparisonRow } from '@/components/cities/_shared/RentComparisonChart';

const PRAG_RENTS: RentComparisonRow[] = [
  { nameDE: 'Altstadt / Malá Strana', nameEN: 'Old Town / Malá Strana', rent1BR: 1200, rent2BR: 1800, rent3BR: 2500 },
  { nameDE: 'Dejvice / Bubeneč',      nameEN: 'Dejvice / Bubeneč',      rent1BR: 950,  rent2BR: 1400, rent3BR: 2000 },
  { nameDE: 'Vinohrady / Žižkov',     nameEN: 'Vinohrady / Žižkov',     rent1BR: 900,  rent2BR: 1300, rent3BR: 1800 },
  { nameDE: 'Holešovice / Karlín',    nameEN: 'Holešovice / Karlín',    rent1BR: 850,  rent2BR: 1200, rent3BR: 1700 },
  { nameDE: 'Smíchov / Anděl',        nameEN: 'Smíchov / Anděl',        rent1BR: 850,  rent2BR: 1200, rent3BR: 1650 },
  { nameDE: 'Letná / Troja',          nameEN: 'Letná / Troja',          rent1BR: 800,  rent2BR: 1100, rent3BR: 1550 },
  { nameDE: 'Nusle / Michle',         nameEN: 'Nusle / Michle',         rent1BR: 680,  rent2BR: 950,  rent3BR: 1300 },
  { nameDE: 'Umland (Beroun, Říčany)',nameEN: 'Surroundings (Beroun)',  rent1BR: 450,  rent2BR: 650,  rent3BR: 900  },
];

type Props = { locale?: string };

export function RentComparison({ locale = 'de' }: Props) {
  return (
    <RentComparisonChart
      rows={PRAG_RENTS}
      currency="EUR"
      locale={locale}
      source={locale === 'de' ? 'Sreality.cz / Bezrealitky.cz Q1 2025 · Schätzwerte' : 'Sreality.cz / Bezrealitky.cz Q1 2025 · Estimates'}
    />
  );
}
