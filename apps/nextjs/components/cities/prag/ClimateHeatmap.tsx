'use client';

import { ClimateHeatmapGeneric } from '@/components/cities/_shared/ClimateHeatmapGeneric';

const PRAG_CLIMATE = {
  tempAvg:   [-1, 1, 6, 12, 17, 20, 22, 22, 17, 11, 5, 1],
  sunshine:  [2,  3, 4,  6,  7,  8,  8,  8,  6,  4, 2, 1],
  rainyDays: [12, 10, 11, 10, 12, 11, 9,  9,  9, 11, 11, 13],
};

type Props = { locale?: string };

export function ClimateHeatmap({ locale = 'de' }: Props) {
  return (
    <ClimateHeatmapGeneric
      data={PRAG_CLIMATE}
      locale={locale}
      source={locale === 'de' ? 'Quelle: CHMI / Climate-Data.org' : 'Source: CHMI / Climate-Data.org'}
    />
  );
}
