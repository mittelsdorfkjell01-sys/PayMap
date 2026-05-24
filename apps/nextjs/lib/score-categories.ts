// Score category string constants used in CityLifestyle.category
// All new categories must be added here — never hardcode elsewhere.

export const SCORE_CAT = {
  CRIME_INDEX:               'crime_index',
  POLITICAL_STABILITY:       'political_stability',
  WATER_DRINKABLE:           'water_drinkable',
  AIR_QUALITY_PM25:          'air_quality_pm25',
  INTERNET_SPEED_COMBINED:   'internet_speed_combined',
  ENGLISH_PROFICIENCY:       'english_proficiency',
  LGBTQ_ACCEPTANCE:          'lgbtq_acceptance',
  HEALTHCARE_QUALITY:        'healthcare_quality',
  NATURKATASTROPHEN:         'naturkatastrophen_resilienz',
  POLITICAL_FREEDOM:         'political_freedom',
  DIRECT_FLIGHT_DE:          'direct_flight_to_germany',
  COST_OF_LIVING_SCORE:      'cost_of_living_score',
  PURCHASING_POWER_SCORE:    'purchasing_power_score',
  TAX_BURDEN_SCORE:          'tax_burden_score',
} as const;

export type ScoreCategoryKey = keyof typeof SCORE_CAT;
export type ScoreCategoryValue = (typeof SCORE_CAT)[ScoreCategoryKey];
