'use client';

import { ClimateHeatmapGeneric } from '@/components/cities/_shared/ClimateHeatmapGeneric';

// Source: Hungarian Meteorological Service (OMSZ), climate-data.org
const BUDAPEST_CLIMATE = {
  tempAvg:   [0, 2, 7, 13, 18, 22, 24, 24, 19, 13, 6, 2],
  sunshine:  [2, 3, 5,  7,  8,  9, 10,  9,  7,  5, 2, 2],
  rainyDays: [11, 9, 9,  9, 11, 10,  8,  8,  7, 10, 11, 12],
};

type Props = { locale?: string };

export function ClimateHeatmap({ locale = 'de' }: Props) {
  return (
    <ClimateHeatmapGeneric
      data={BUDAPEST_CLIMATE}
      locale={locale}
      source={locale === 'de' ? 'Quelle: OMSZ / Climate-Data.org' : 'Source: OMSZ / Climate-Data.org'}
    />
  );
}
