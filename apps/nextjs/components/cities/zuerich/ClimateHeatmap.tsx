'use client';

import { ClimateHeatmapGeneric } from '@/components/cities/_shared/ClimateHeatmapGeneric';

// Source: MeteoSchweiz, climate-data.org
const ZUERICH_CLIMATE = {
  tempAvg:   [1, 3, 7, 11, 16, 19, 21, 21, 17, 12, 6, 2],
  sunshine:  [2, 3, 5,  6,  7,  8,  8,  8,  6,  5, 2, 2],
  rainyDays: [13, 10, 11, 12, 13, 13, 12, 12, 10, 11, 11, 13],
};

type Props = { locale?: string };

export function ClimateHeatmap({ locale = 'de' }: Props) {
  return (
    <ClimateHeatmapGeneric
      data={ZUERICH_CLIMATE}
      locale={locale}
      source={locale === 'de' ? 'Quelle: MeteoSchweiz / Climate-Data.org' : 'Source: MeteoSchweiz / Climate-Data.org'}
    />
  );
}
