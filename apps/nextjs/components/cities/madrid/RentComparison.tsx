'use client';

import { RentComparisonChart, type RentComparisonRow } from '@/components/cities/_shared/RentComparisonChart';

type Props = {
  rows: RentComparisonRow[];
  locale?: string;
};

export function MadridRentComparison({ rows, locale = 'de' }: Props) {
  return (
    <RentComparisonChart
      rows={rows}
      currency="EUR"
      locale={locale}
      source="Idealista Q1 2026"
    />
  );
}
