'use client';

import { ClimateHeatmapGeneric } from '@/components/cities/_shared/ClimateHeatmapGeneric';

// Source: Thai Meteorological Department, climate-data.org
// Bangkok: tropical monsoon climate — hot all year, rainy season May–Oct
const BANGKOK_CLIMATE = {
  tempAvg:   [26, 28, 29, 31, 30, 29, 29, 29, 28, 28, 27, 26],
  sunshine:  [8,  9,  9,  9,  7,  5,  5,  5,  6,  7,  8,  8 ],
  rainyDays: [1,  1,  3,  6,  13, 14, 14, 16, 17, 14, 6,  2  ],
};

type Props = { locale?: string };

export function ClimateHeatmap({ locale = 'de' }: Props) {
  return (
    <ClimateHeatmapGeneric
      data={BANGKOK_CLIMATE}
      locale={locale}
      source={locale === 'de' ? 'Quelle: Thai Meteorological Dept. / Climate-Data.org' : 'Source: Thai Meteorological Dept. / Climate-Data.org'}
    />
  );
}
