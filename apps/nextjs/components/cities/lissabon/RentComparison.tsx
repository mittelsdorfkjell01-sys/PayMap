'use client';

import { RentComparisonChart, type RentComparisonRow } from '@/components/cities/_shared/RentComparisonChart';

const LISSABON_RENTS: RentComparisonRow[] = [
  { nameDE: 'Príncipe Real',  nameEN: 'Príncipe Real',   rent1BR: 2000, rent2BR: 2900, rent3BR: 4200 },
  { nameDE: 'Bairro Alto',    nameEN: 'Bairro Alto',     rent1BR: 1950, rent2BR: 2750, rent3BR: 3900 },
  { nameDE: 'Estrela/Lapa',   nameEN: 'Estrela/Lapa',    rent1BR: 1750, rent2BR: 2500, rent3BR: 3500 },
  { nameDE: 'Av. Novas',      nameEN: 'Av. Novas',       rent1BR: 1550, rent2BR: 2150, rent3BR: 3100 },
  { nameDE: 'P. das Nações',  nameEN: 'P. das Nações',   rent1BR: 1650, rent2BR: 2250, rent3BR: 3200 },
  { nameDE: 'Alvalade',       nameEN: 'Alvalade',        rent1BR: 1350, rent2BR: 1850, rent3BR: 2600 },
  { nameDE: 'Belém',          nameEN: 'Belém',           rent1BR: 1250, rent2BR: 1750, rent3BR: 2450 },
  { nameDE: 'Almada',         nameEN: 'Almada',          rent1BR: 1050, rent2BR: 1450, rent3BR: 2050 },
];

type Props = { locale?: string };

export function RentComparison({ locale = 'de' }: Props) {
  return (
    <RentComparisonChart
      rows={LISSABON_RENTS}
      currency="EUR"
      locale={locale}
      source="Idealista Q1 2026 · Schätzwerte"
    />
  );
}
