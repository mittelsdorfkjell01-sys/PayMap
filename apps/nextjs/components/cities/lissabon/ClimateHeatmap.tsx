'use client';

import { ClimateHeatmapGeneric } from '@/components/cities/_shared/ClimateHeatmapGeneric';

const LISSABON_CLIMATE = {
  tempAvg:   [11, 12, 14, 16, 18, 22, 25, 26, 23, 19, 15, 12],
  sunshine:  [5,  6,  7,  8,  10, 12, 13, 12, 9,  7,  5,  4 ],
  rainyDays: [13, 11, 10, 9,  7,  3,  1,  1,  5,  9,  12, 14],
};

type Props = { locale?: string };

export function ClimateHeatmap({ locale = 'de' }: Props) {
  return (
    <ClimateHeatmapGeneric
      data={LISSABON_CLIMATE}
      locale={locale}
      source={locale === 'de' ? 'Quelle: IPMA / Climate-Data.org' : 'Source: IPMA / Climate-Data.org'}
    />
  );
}
