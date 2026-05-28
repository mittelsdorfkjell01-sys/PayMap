'use client';

import { DistrictMapGeneric, type DistrictMapData } from '@/components/cities/_shared/DistrictMapGeneric';

type Props = {
  districts: DistrictMapData[];
  locale?: string;
};

export function MadridDistrictMap({ districts, locale = 'de' }: Props) {
  return <DistrictMapGeneric districts={districts} locale={locale} width={480} height={380} />;
}
