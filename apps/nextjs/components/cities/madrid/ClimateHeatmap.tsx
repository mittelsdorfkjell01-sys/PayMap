'use client';

import { ClimateHeatmapGeneric, type ClimateData } from '@/components/cities/_shared/ClimateHeatmapGeneric';

const MADRID_CLIMATE: ClimateData = {
  tempAvg:   [10, 13, 17, 19, 24, 30, 35, 34, 27, 21, 14, 10],
  sunshine:  [5,  6,  7,  8,  10, 12, 13, 12, 9,  7,  5,  4 ],
  rainyDays: [8,  7,  8,  10, 9,  4,  2,  2,  6,  9,  9,  9 ],
};

export function MadridClimateHeatmap({ locale = 'de' }: { locale?: string }) {
  return (
    <ClimateHeatmapGeneric
      data={MADRID_CLIMATE}
      locale={locale}
      source="AEMET / clima.copernicus.eu — historische Mittelwerte 1991–2020"
    />
  );
}
