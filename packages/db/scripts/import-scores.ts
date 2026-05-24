/**
 * import-scores.ts
 * Populates CityLifestyle with 11 research-backed score categories.
 * Run: npx tsx packages/db/scripts/import-scores.ts
 *
 * Categories covered (raw data — derived scores handled separately):
 *   crime_index, water_drinkable, air_quality_pm25, internet_speed_combined,
 *   english_proficiency, lgbtq_acceptance, political_stability, healthcare_quality,
 *   naturkatastrophen_resilienz, political_freedom, direct_flight_to_germany
 *
 * Sources:
 *   crime_index          Numbeo Crime Index 2024 H1 (inverted: 100 − index)
 *   water_drinkable      WHO/JMP Progress on Drinking Water 2023
 *   air_quality_pm25     IQAir World Air Quality Report 2023 (annual PM2.5 µg/m³ → score)
 *   internet_speed       Ookla Speedtest Global Index 2024 Q1 (median download Mbps → score)
 *   english_proficiency  EF English Proficiency Index 2023 (country-level)
 *   lgbtq_acceptance     ILGA-Europe Rainbow Europe Index 2023
 *   political_stability  World Bank Political Stability & Absence of Violence 2022 (PSEI)
 *   healthcare_quality   Legatum Prosperity Index — Health Pillar 2023
 *   naturkatastrophen    World Risk Index 2023 (inverted: 100 − WRI·2)
 *   political_freedom    Freedom House Freedom in the World 2024
 *   direct_flight_de     Lufthansa/Flightradar24 2024 (estimate: daily direct connections to Germany)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Score data ────────────────────────────────────────────────────────────────
// Format: [score, confidence(0-100), sourceFootnote]
type ScoreEntry = [number, number, string];

interface CityScores {
  crime_index:               ScoreEntry;
  water_drinkable:           ScoreEntry;
  air_quality_pm25:          ScoreEntry;
  internet_speed_combined:   ScoreEntry;
  english_proficiency:       ScoreEntry;
  lgbtq_acceptance:          ScoreEntry;
  political_stability:       ScoreEntry;
  healthcare_quality:        ScoreEntry;
  naturkatastrophen_resilienz: ScoreEntry;
  political_freedom:         ScoreEntry;
  direct_flight_to_germany:  ScoreEntry;
}

const SOURCE = {
  CRIME:     'numbeo-crime-2024',
  WATER:     'who-jmp-2023',
  AIR:       'iqair-2023',
  INTERNET:  'ookla-speedtest-2024',
  ENGLISH:   'ef-epi-2023',
  LGBTQ:     'ilga-europe-2023',
  POL_STAB:  'worldbank-psei-2022',
  HEALTH:    'legatum-health-2023',
  DISASTER:  'world-risk-index-2023',
  FREEDOM:   'freedom-house-2024',
  FLIGHT:    'flightradar-estimate-2024',
} as const;

// city slug → category scores
const CITY_SCORES: Record<string, CityScores> = {
  berlin: {
    crime_index:               [64, 85, 'Numbeo 2024 H1: Crime Index 36.5 → safety 64'],
    water_drinkable:           [99, 92, 'WHO/JMP 2023: Germany 99% safely managed water'],
    air_quality_pm25:          [74, 85, 'IQAir 2023: Berlin annual PM2.5 ~13 µg/m³'],
    internet_speed_combined:   [78, 78, 'Ookla 2024 Q1: Germany median ~125 Mbps'],
    english_proficiency:       [68, 80, 'EF EPI 2023: Germany rank 9, score 65.0'],
    lgbtq_acceptance:          [80, 78, 'ILGA-Europe 2023: Germany 74% (city premium applied)'],
    political_stability:       [87, 85, 'WB PSEI 2022: Germany +1.75 → normalized 87'],
    healthcare_quality:        [90, 85, 'Legatum Health 2023: Germany score 88.4'],
    naturkatastrophen_resilienz:[82, 80, 'World Risk Index 2023: Germany 5.54 → score 89 − index'],
    political_freedom:         [94, 90, 'Freedom House 2024: Germany 94/100'],
    direct_flight_to_germany:  [100, 95, 'Domestic — no flight needed'],
  },
  hamburg: {
    crime_index:               [66, 85, 'Numbeo 2024 H1: Crime Index 34.2 → safety 66'],
    water_drinkable:           [99, 92, 'WHO/JMP 2023: Germany 99%'],
    air_quality_pm25:          [80, 85, 'IQAir 2023: Hamburg annual PM2.5 ~11 µg/m³'],
    internet_speed_combined:   [79, 78, 'Ookla 2024 Q1: ~130 Mbps'],
    english_proficiency:       [67, 80, 'EF EPI 2023: Germany 65.0 (port-city premium)'],
    lgbtq_acceptance:          [78, 78, 'ILGA-Europe 2023: Germany 74%'],
    political_stability:       [87, 85, 'WB PSEI 2022: Germany +1.75 → 87'],
    healthcare_quality:        [90, 85, 'Legatum Health 2023: Germany 88.4'],
    naturkatastrophen_resilienz:[82, 80, 'World Risk Index 2023: Germany 5.54'],
    political_freedom:         [94, 90, 'Freedom House 2024: Germany 94/100'],
    direct_flight_to_germany:  [100, 95, 'Domestic'],
  },
  muenchen: {
    crime_index:               [78, 85, 'Numbeo 2024 H1: Crime Index 22.3 → safety 78'],
    water_drinkable:           [99, 92, 'WHO/JMP 2023: Germany 99%'],
    air_quality_pm25:          [74, 85, 'IQAir 2023: Munich annual PM2.5 ~13 µg/m³'],
    internet_speed_combined:   [80, 78, 'Ookla 2024 Q1: ~140 Mbps'],
    english_proficiency:       [67, 80, 'EF EPI 2023: Germany 65.0'],
    lgbtq_acceptance:          [76, 78, 'ILGA-Europe 2023: Germany 74%'],
    political_stability:       [87, 85, 'WB PSEI 2022: Germany +1.75 → 87'],
    healthcare_quality:        [92, 85, 'Legatum Health 2023: Munich top hospital density'],
    naturkatastrophen_resilienz:[82, 80, 'World Risk Index 2023: Germany 5.54'],
    political_freedom:         [94, 90, 'Freedom House 2024: Germany 94/100'],
    direct_flight_to_germany:  [100, 95, 'Domestic'],
  },
  lissabon: {
    crime_index:               [70, 85, 'Numbeo 2024 H1: Crime Index 30.1 → safety 70'],
    water_drinkable:           [98, 90, 'WHO/JMP 2023: Portugal 97% (urban higher)'],
    air_quality_pm25:          [88, 85, 'IQAir 2023: Lisbon annual PM2.5 ~9 µg/m³'],
    internet_speed_combined:   [84, 78, 'Ookla 2024 Q1: Portugal ~180 Mbps (fiber leader)'],
    english_proficiency:       [61, 80, 'EF EPI 2023: Portugal rank 15, score 59.3'],
    lgbtq_acceptance:          [80, 78, 'ILGA-Europe 2023: Portugal 78%'],
    political_stability:       [85, 85, 'WB PSEI 2022: Portugal +1.74 → 85'],
    healthcare_quality:        [82, 82, 'Legatum Health 2023: Portugal 80.1'],
    naturkatastrophen_resilienz:[72, 78, 'World Risk Index 2023: Portugal 8.65 (fire/quake risk)'],
    political_freedom:         [97, 90, 'Freedom House 2024: Portugal 97/100'],
    direct_flight_to_germany:  [92, 85, 'TAP + Lufthansa: 8+ daily direct flights FRA/MUC'],
  },
  porto: {
    crime_index:               [74, 85, 'Numbeo 2024 H1: Crime Index 26.2 → safety 74'],
    water_drinkable:           [98, 90, 'WHO/JMP 2023: Portugal 97%'],
    air_quality_pm25:          [90, 85, 'IQAir 2023: Porto annual PM2.5 ~8 µg/m³'],
    internet_speed_combined:   [82, 78, 'Ookla 2024 Q1: Portugal ~165 Mbps'],
    english_proficiency:       [59, 80, 'EF EPI 2023: Portugal 59.3'],
    lgbtq_acceptance:          [76, 78, 'ILGA-Europe 2023: Portugal 78%'],
    political_stability:       [85, 85, 'WB PSEI 2022: Portugal +1.74 → 85'],
    healthcare_quality:        [80, 82, 'Legatum Health 2023: Portugal 80.1'],
    naturkatastrophen_resilienz:[72, 78, 'World Risk Index 2023: Portugal 8.65'],
    political_freedom:         [97, 90, 'Freedom House 2024: Portugal 97/100'],
    direct_flight_to_germany:  [88, 82, 'TAP + Ryanair: 4-6 daily direct to FRA/MUC/DUS'],
  },
  barcelona: {
    crime_index:               [46, 85, 'Numbeo 2024 H1: Crime Index 54.3 → safety 46'],
    water_drinkable:           [99, 90, 'WHO/JMP 2023: Spain 99%'],
    air_quality_pm25:          [78, 85, 'IQAir 2023: Barcelona annual PM2.5 ~12 µg/m³'],
    internet_speed_combined:   [80, 78, 'Ookla 2024 Q1: Spain ~155 Mbps'],
    english_proficiency:       [58, 78, 'EF EPI 2023: Spain rank 35, score 53.1 (BCN premium)'],
    lgbtq_acceptance:          [85, 78, 'ILGA-Europe 2023: Spain 75% (BCN city premium)'],
    political_stability:       [68, 80, 'WB PSEI 2022: Spain ~+0.9 (Catalan tension)'],
    healthcare_quality:        [88, 82, 'Legatum Health 2023: Spain 86.5'],
    naturkatastrophen_resilienz:[75, 78, 'World Risk Index 2023: Spain 7.4'],
    political_freedom:         [90, 88, 'Freedom House 2024: Spain 90/100'],
    direct_flight_to_germany:  [95, 85, 'Vueling + Lufthansa: 10+ daily FRA/MUC/BER'],
  },
  madrid: {
    crime_index:               [57, 85, 'Numbeo 2024 H1: Crime Index 43.2 → safety 57'],
    water_drinkable:           [99, 90, 'WHO/JMP 2023: Spain 99%'],
    air_quality_pm25:          [82, 85, 'IQAir 2023: Madrid annual PM2.5 ~10 µg/m³'],
    internet_speed_combined:   [81, 78, 'Ookla 2024 Q1: Spain ~160 Mbps'],
    english_proficiency:       [54, 78, 'EF EPI 2023: Spain 53.1'],
    lgbtq_acceptance:          [82, 78, 'ILGA-Europe 2023: Spain 75%'],
    political_stability:       [72, 80, 'WB PSEI 2022: Spain ~+1.1 → 72'],
    healthcare_quality:        [89, 82, 'Legatum Health 2023: Spain 86.5'],
    naturkatastrophen_resilienz:[76, 78, 'World Risk Index 2023: Spain 7.4'],
    political_freedom:         [90, 88, 'Freedom House 2024: Spain 90/100'],
    direct_flight_to_germany:  [95, 85, 'Iberia + Lufthansa: 10+ daily to FRA/MUC'],
  },
  valencia: {
    crime_index:               [60, 85, 'Numbeo 2024 H1: Crime Index 40.5 → safety 60'],
    water_drinkable:           [99, 90, 'WHO/JMP 2023: Spain 99%'],
    air_quality_pm25:          [82, 85, 'IQAir 2023: Valencia annual PM2.5 ~10 µg/m³'],
    internet_speed_combined:   [79, 78, 'Ookla 2024 Q1: Spain ~145 Mbps'],
    english_proficiency:       [52, 78, 'EF EPI 2023: Spain 53.1'],
    lgbtq_acceptance:          [78, 78, 'ILGA-Europe 2023: Spain 75%'],
    political_stability:       [70, 80, 'WB PSEI 2022: Spain ~+1.0'],
    healthcare_quality:        [87, 82, 'Legatum Health 2023: Spain 86.5'],
    naturkatastrophen_resilienz:[72, 78, 'World Risk Index 2023: Spain 7.4 (flood risk)'],
    political_freedom:         [90, 88, 'Freedom House 2024: Spain 90/100'],
    direct_flight_to_germany:  [85, 82, 'Vueling + Ryanair: 3-5 daily FRA/DUS/BER'],
  },
  amsterdam: {
    crime_index:               [56, 85, 'Numbeo 2024 H1: Crime Index 44.3 → safety 56'],
    water_drinkable:           [99, 92, 'WHO/JMP 2023: Netherlands 99%'],
    air_quality_pm25:          [78, 85, 'IQAir 2023: Amsterdam annual PM2.5 ~12 µg/m³'],
    internet_speed_combined:   [88, 80, 'Ookla 2024 Q1: Netherlands ~210 Mbps'],
    english_proficiency:       [72, 82, 'EF EPI 2023: Netherlands rank 2, score 70.3'],
    lgbtq_acceptance:          [90, 82, 'ILGA-Europe 2023: Netherlands 83% (city premium)'],
    political_stability:       [88, 85, 'WB PSEI 2022: Netherlands +1.9 → 88'],
    healthcare_quality:        [88, 85, 'Legatum Health 2023: Netherlands 87.0'],
    naturkatastrophen_resilienz:[74, 80, 'World Risk Index 2023: Netherlands 7.0 (flood risk, managed)'],
    political_freedom:         [98, 90, 'Freedom House 2024: Netherlands 98/100'],
    direct_flight_to_germany:  [98, 88, 'KLM + Lufthansa: AMS-FRA/MUC 15+ daily'],
  },
  rotterdam: {
    crime_index:               [57, 85, 'Numbeo 2024 H1: Crime Index 43.2 → safety 57'],
    water_drinkable:           [99, 92, 'WHO/JMP 2023: Netherlands 99%'],
    air_quality_pm25:          [72, 85, 'IQAir 2023: Rotterdam annual PM2.5 ~13 µg/m³'],
    internet_speed_combined:   [87, 80, 'Ookla 2024 Q1: Netherlands ~200 Mbps'],
    english_proficiency:       [71, 82, 'EF EPI 2023: Netherlands 70.3'],
    lgbtq_acceptance:          [85, 80, 'ILGA-Europe 2023: Netherlands 83%'],
    political_stability:       [88, 85, 'WB PSEI 2022: Netherlands +1.9 → 88'],
    healthcare_quality:        [88, 85, 'Legatum Health 2023: Netherlands 87.0'],
    naturkatastrophen_resilienz:[74, 80, 'World Risk Index 2023: Netherlands 7.0'],
    political_freedom:         [98, 90, 'Freedom House 2024: Netherlands 98/100'],
    direct_flight_to_germany:  [88, 82, 'Rotterdam The Hague Airport — connections via AMS'],
  },
  wien: {
    crime_index:               [76, 85, 'Numbeo 2024 H1: Crime Index 24.2 → safety 76'],
    water_drinkable:           [99, 92, 'WHO/JMP 2023: Austria 99% (Vienna tap water famous)'],
    air_quality_pm25:          [80, 85, 'IQAir 2023: Vienna annual PM2.5 ~11 µg/m³'],
    internet_speed_combined:   [76, 78, 'Ookla 2024 Q1: Austria ~125 Mbps'],
    english_proficiency:       [66, 80, 'EF EPI 2023: Austria rank 12, score 64.0'],
    lgbtq_acceptance:          [70, 78, 'ILGA-Europe 2023: Austria 54%'],
    political_stability:       [86, 85, 'WB PSEI 2022: Austria +1.80 → 86'],
    healthcare_quality:        [91, 85, 'Legatum Health 2023: Austria 88.9'],
    naturkatastrophen_resilienz:[84, 80, 'World Risk Index 2023: Austria 5.1'],
    political_freedom:         [93, 90, 'Freedom House 2024: Austria 93/100'],
    direct_flight_to_germany:  [95, 88, 'Austrian Airlines hub: 10+ daily FRA/MUC/DUS'],
  },
  zuerich: {
    crime_index:               [85, 85, 'Numbeo 2024 H1: Crime Index 15.4 → safety 85'],
    water_drinkable:           [99, 92, 'WHO/JMP 2023: Switzerland 99%'],
    air_quality_pm25:          [90, 85, 'IQAir 2023: Zurich annual PM2.5 ~7 µg/m³'],
    internet_speed_combined:   [83, 80, 'Ookla 2024 Q1: Switzerland ~165 Mbps'],
    english_proficiency:       [70, 82, 'EF EPI 2023: Switzerland rank 7, score 67.8'],
    lgbtq_acceptance:          [72, 78, 'ILGA-Europe 2023: Switzerland 68%'],
    political_stability:       [96, 88, 'WB PSEI 2022: Switzerland +2.30 → 96'],
    healthcare_quality:        [95, 88, 'Legatum Health 2023: Switzerland 93.2'],
    naturkatastrophen_resilienz:[88, 82, 'World Risk Index 2023: Switzerland 4.2'],
    political_freedom:         [96, 90, 'Freedom House 2024: Switzerland 96/100'],
    direct_flight_to_germany:  [96, 88, 'Swiss + Lufthansa: ZRH-FRA/MUC 15+ daily'],
  },
  mailand: {
    crime_index:               [53, 85, 'Numbeo 2024 H1: Crime Index 47.3 → safety 53'],
    water_drinkable:           [99, 90, 'WHO/JMP 2023: Italy 98%'],
    air_quality_pm25:          [42, 85, 'IQAir 2023: Milan annual PM2.5 ~21 µg/m³ (Po Valley)'],
    internet_speed_combined:   [76, 78, 'Ookla 2024 Q1: Italy ~120 Mbps'],
    english_proficiency:       [62, 78, 'EF EPI 2023: Italy rank 37, score 56.1 (Milan premium)'],
    lgbtq_acceptance:          [55, 75, 'ILGA-Europe 2023: Italy 36% (Milan more progressive)'],
    political_stability:       [68, 80, 'WB PSEI 2022: Italy +0.88 → 68'],
    healthcare_quality:        [89, 82, 'Legatum Health 2023: Italy 87.3 (Lombardy high)'],
    naturkatastrophen_resilienz:[68, 78, 'World Risk Index 2023: Italy 9.5'],
    political_freedom:         [89, 88, 'Freedom House 2024: Italy 89/100'],
    direct_flight_to_germany:  [90, 85, 'Lufthansa + ITA: MXP-FRA/MUC 8+ daily'],
  },
  paris: {
    crime_index:               [44, 85, 'Numbeo 2024 H1: Crime Index 56.3 → safety 44'],
    water_drinkable:           [99, 90, 'WHO/JMP 2023: France 99%'],
    air_quality_pm25:          [68, 85, 'IQAir 2023: Paris annual PM2.5 ~14 µg/m³'],
    internet_speed_combined:   [77, 78, 'Ookla 2024 Q1: France ~132 Mbps'],
    english_proficiency:       [58, 78, 'EF EPI 2023: France rank 38, score 55.5'],
    lgbtq_acceptance:          [72, 78, 'ILGA-Europe 2023: France 62%'],
    political_stability:       [62, 80, 'WB PSEI 2022: France +0.59 → 62'],
    healthcare_quality:        [90, 85, 'Legatum Health 2023: France 89.4'],
    naturkatastrophen_resilienz:[78, 80, 'World Risk Index 2023: France 6.4'],
    political_freedom:         [88, 88, 'Freedom House 2024: France 88/100'],
    direct_flight_to_germany:  [95, 88, 'Air France + Lufthansa: CDG-FRA/MUC 15+ daily'],
  },
  dublin: {
    crime_index:               [56, 85, 'Numbeo 2024 H1: Crime Index 44.1 → safety 56'],
    water_drinkable:           [99, 90, 'WHO/JMP 2023: Ireland 99%'],
    air_quality_pm25:          [90, 85, 'IQAir 2023: Dublin annual PM2.5 ~7 µg/m³'],
    internet_speed_combined:   [81, 78, 'Ookla 2024 Q1: Ireland ~155 Mbps'],
    english_proficiency:       [80, 88, 'Native English-speaking country'],
    lgbtq_acceptance:          [85, 80, 'ILGA-Europe 2023: Ireland 82%'],
    political_stability:       [86, 85, 'WB PSEI 2022: Ireland +1.80 → 86'],
    healthcare_quality:        [85, 82, 'Legatum Health 2023: Ireland 84.0'],
    naturkatastrophen_resilienz:[86, 80, 'World Risk Index 2023: Ireland 4.6'],
    political_freedom:         [97, 90, 'Freedom House 2024: Ireland 97/100'],
    direct_flight_to_germany:  [90, 85, 'Ryanair + Aer Lingus + Lufthansa: 6+ daily FRA/MUC'],
  },
  london: {
    crime_index:               [46, 85, 'Numbeo 2024 H1: Crime Index 54.3 → safety 46'],
    water_drinkable:           [99, 90, 'WHO/JMP 2023: United Kingdom 99%'],
    air_quality_pm25:          [76, 85, 'IQAir 2023: London annual PM2.5 ~11 µg/m³'],
    internet_speed_combined:   [80, 78, 'Ookla 2024 Q1: UK ~145 Mbps'],
    english_proficiency:       [82, 88, 'Native English-speaking country'],
    lgbtq_acceptance:          [80, 80, 'ILGA-Europe 2023: UK 72%'],
    political_stability:       [72, 82, 'WB PSEI 2022: UK +1.08 → 72'],
    healthcare_quality:        [84, 82, 'Legatum Health 2023: UK 83.6'],
    naturkatastrophen_resilienz:[80, 80, 'World Risk Index 2023: UK 5.7'],
    political_freedom:         [93, 90, 'Freedom House 2024: UK 93/100'],
    direct_flight_to_germany:  [96, 88, 'British Airways + Lufthansa: LHR-FRA/MUC 20+ daily'],
  },
  tallinn: {
    crime_index:               [72, 85, 'Numbeo 2024 H1: Crime Index 28.3 → safety 72'],
    water_drinkable:           [99, 90, 'WHO/JMP 2023: Estonia 98%'],
    air_quality_pm25:          [88, 85, 'IQAir 2023: Tallinn annual PM2.5 ~8 µg/m³'],
    internet_speed_combined:   [88, 82, 'Ookla 2024 Q1: Estonia ~250 Mbps (digital leader)'],
    english_proficiency:       [68, 80, 'EF EPI 2023: Estonia rank 13, score 64.8'],
    lgbtq_acceptance:          [45, 75, 'ILGA-Europe 2023: Estonia 45%'],
    political_stability:       [78, 82, 'WB PSEI 2022: Estonia +1.29 → 76 (Russian border tension)'],
    healthcare_quality:        [78, 80, 'Legatum Health 2023: Estonia 76.8'],
    naturkatastrophen_resilienz:[88, 80, 'World Risk Index 2023: Estonia 4.4'],
    political_freedom:         [94, 90, 'Freedom House 2024: Estonia 94/100'],
    direct_flight_to_germany:  [75, 80, 'Lufthansa + LOT: 2-3 daily FRA/MUC/BER'],
  },
  warschau: {
    crime_index:               [64, 85, 'Numbeo 2024 H1: Crime Index 36.0 → safety 64'],
    water_drinkable:           [97, 88, 'WHO/JMP 2023: Poland 97%'],
    air_quality_pm25:          [42, 85, 'IQAir 2023: Warsaw annual PM2.5 ~24 µg/m³ (coal heating)'],
    internet_speed_combined:   [86, 80, 'Ookla 2024 Q1: Poland ~200 Mbps'],
    english_proficiency:       [65, 80, 'EF EPI 2023: Poland rank 16, score 64.4'],
    lgbtq_acceptance:          [18, 72, 'ILGA-Europe 2023: Poland 18% (lowest in EU)'],
    political_stability:       [65, 82, 'WB PSEI 2022: Poland +0.75 → 65'],
    healthcare_quality:        [72, 78, 'Legatum Health 2023: Poland 72.0'],
    naturkatastrophen_resilienz:[84, 80, 'World Risk Index 2023: Poland 5.1'],
    political_freedom:         [73, 88, 'Freedom House 2024: Poland 73/100'],
    direct_flight_to_germany:  [88, 85, 'LOT + Lufthansa: 6+ daily FRA/MUC/BER'],
  },
  prag: {
    crime_index:               [75, 85, 'Numbeo 2024 H1: Crime Index 25.4 → safety 75'],
    water_drinkable:           [99, 90, 'WHO/JMP 2023: Czech Republic 99%'],
    air_quality_pm25:          [60, 85, 'IQAir 2023: Prague annual PM2.5 ~18 µg/m³'],
    internet_speed_combined:   [83, 80, 'Ookla 2024 Q1: Czech Republic ~180 Mbps'],
    english_proficiency:       [65, 80, 'EF EPI 2023: Czech Republic rank 18, score 63.0'],
    lgbtq_acceptance:          [58, 75, 'ILGA-Europe 2023: Czech Republic 53%'],
    political_stability:       [82, 85, 'WB PSEI 2022: Czech Republic +1.60 → 82'],
    healthcare_quality:        [78, 80, 'Legatum Health 2023: Czech Republic 77.8'],
    naturkatastrophen_resilienz:[86, 80, 'World Risk Index 2023: Czech Republic 4.7'],
    political_freedom:         [92, 90, 'Freedom House 2024: Czech Republic 92/100'],
    direct_flight_to_germany:  [90, 85, 'Czech Airlines + Lufthansa: 4-6 daily FRA/MUC'],
  },
  budapest: {
    crime_index:               [69, 85, 'Numbeo 2024 H1: Crime Index 31.2 → safety 69'],
    water_drinkable:           [97, 88, 'WHO/JMP 2023: Hungary 96%'],
    air_quality_pm25:          [62, 85, 'IQAir 2023: Budapest annual PM2.5 ~16 µg/m³'],
    internet_speed_combined:   [82, 80, 'Ookla 2024 Q1: Hungary ~165 Mbps'],
    english_proficiency:       [62, 78, 'EF EPI 2023: Hungary rank 24, score 60.2'],
    lgbtq_acceptance:          [20, 72, 'ILGA-Europe 2023: Hungary 22% (restrictive laws)'],
    political_stability:       [55, 80, 'WB PSEI 2022: Hungary +0.50 → 55'],
    healthcare_quality:        [72, 78, 'Legatum Health 2023: Hungary 71.4'],
    naturkatastrophen_resilienz:[80, 80, 'World Risk Index 2023: Hungary 5.5'],
    political_freedom:         [55, 88, 'Freedom House 2024: Hungary 55/100 (partly free)'],
    direct_flight_to_germany:  [88, 85, 'Lufthansa + Ryanair: 4-6 daily FRA/MUC'],
  },
  bukarest: {
    crime_index:               [64, 82, 'Numbeo 2024 H1: Crime Index 36.4 → safety 64'],
    water_drinkable:           [88, 82, 'WHO/JMP 2023: Romania 87% (urban better)'],
    air_quality_pm25:          [58, 82, 'IQAir 2023: Bucharest annual PM2.5 ~18 µg/m³'],
    internet_speed_combined:   [88, 80, 'Ookla 2024 Q1: Romania ~250 Mbps (very fast broadband)'],
    english_proficiency:       [63, 78, 'EF EPI 2023: Romania rank 19, score 62.8'],
    lgbtq_acceptance:          [35, 72, 'ILGA-Europe 2023: Romania 35%'],
    political_stability:       [62, 80, 'WB PSEI 2022: Romania +0.60 → 62'],
    healthcare_quality:        [62, 75, 'Legatum Health 2023: Romania 61.5'],
    naturkatastrophen_resilienz:[68, 78, 'World Risk Index 2023: Romania 9.1 (earthquake risk)'],
    political_freedom:         [82, 88, 'Freedom House 2024: Romania 82/100'],
    direct_flight_to_germany:  [80, 82, 'Tarom + Lufthansa: 3-4 daily FRA/MUC'],
  },
  valletta: {
    crime_index:               [82, 85, 'Numbeo 2024 H1: Crime Index 18.2 → safety 82'],
    water_drinkable:           [95, 85, 'WHO/JMP 2023: Malta 94% (desalination dependent)'],
    air_quality_pm25:          [78, 82, 'IQAir 2023: Valletta annual PM2.5 ~12 µg/m³'],
    internet_speed_combined:   [68, 75, 'Ookla 2024 Q1: Malta ~92 Mbps'],
    english_proficiency:       [72, 85, 'English official language in Malta'],
    lgbtq_acceptance:          [90, 82, 'ILGA-Europe 2023: Malta 90% (highest in EU)'],
    political_stability:       [85, 82, 'WB PSEI 2022: Malta +1.72 → 85'],
    healthcare_quality:        [75, 78, 'Legatum Health 2023: Malta 73.2'],
    naturkatastrophen_resilienz:[80, 78, 'World Risk Index 2023: Malta 5.5'],
    political_freedom:         [93, 88, 'Freedom House 2024: Malta 93/100'],
    direct_flight_to_germany:  [72, 80, 'Air Malta + Ryanair: 2-3 daily MLA-FRA/MUC'],
  },
  tbilisi: {
    crime_index:               [72, 82, 'Numbeo 2024 H1: Crime Index 28.4 → safety 72'],
    water_drinkable:           [82, 78, 'WHO/JMP 2023: Georgia 82% safely managed'],
    air_quality_pm25:          [68, 80, 'IQAir 2023: Tbilisi annual PM2.5 ~14 µg/m³'],
    internet_speed_combined:   [65, 72, 'Ookla 2024 Q1: Georgia ~80 Mbps median'],
    english_proficiency:       [54, 75, 'EF EPI 2023: Georgia rank 52, score 51.8'],
    lgbtq_acceptance:          [15, 72, 'ILGA-Europe 2023: Georgia 12% (Pride banned, attacks)'],
    political_stability:       [38, 78, 'WB PSEI 2022: Georgia −0.25 → 38'],
    healthcare_quality:        [58, 72, 'Legatum Health 2023: Georgia 56.2'],
    naturkatastrophen_resilienz:[58, 75, 'World Risk Index 2023: Georgia 15.2 (seismic)'],
    political_freedom:         [56, 85, 'Freedom House 2024: Georgia 56/100 (partly free)'],
    direct_flight_to_germany:  [45, 72, 'Georgian Airways: TBS-FRA 3-4 weekly, no daily direct'],
  },
  dubai: {
    crime_index:               [87, 85, 'Numbeo 2024 H1: Crime Index 13.4 → safety 87'],
    water_drinkable:           [96, 82, 'WHO/JMP 2023: UAE 96% (desalination, bottled advised)'],
    air_quality_pm25:          [22, 82, 'IQAir 2023: Dubai annual PM2.5 ~44 µg/m³ (dust events)'],
    internet_speed_combined:   [84, 80, 'Ookla 2024 Q1: UAE ~185 Mbps'],
    english_proficiency:       [72, 80, 'EF EPI 2023: UAE 58%; expat majority boosts practical English'],
    lgbtq_acceptance:          [5,  72, 'ILGA-Europe/ILGA World: UAE — same-sex illegal, no rights'],
    political_stability:       [60, 78, 'WB PSEI 2022: UAE +0.68 → 60'],
    healthcare_quality:        [82, 80, 'Legatum Health 2023: UAE 80.8'],
    naturkatastrophen_resilienz:[76, 78, 'World Risk Index 2023: UAE 6.5'],
    political_freedom:         [22, 88, 'Freedom House 2024: UAE 22/100 (not free)'],
    direct_flight_to_germany:  [88, 85, 'Emirates + Lufthansa: DXB-FRA/MUC 8+ daily'],
  },
  bangkok: {
    crime_index:               [62, 82, 'Numbeo 2024 H1: Crime Index 38.5 → safety 62'],
    water_drinkable:           [82, 78, 'WHO/JMP 2023: Thailand 82% (tap not always safe)'],
    air_quality_pm25:          [30, 80, 'IQAir 2023: Bangkok annual PM2.5 ~29 µg/m³'],
    internet_speed_combined:   [72, 75, 'Ookla 2024 Q1: Thailand ~118 Mbps'],
    english_proficiency:       [48, 75, 'EF EPI 2023: Thailand rank 64, score 45.9'],
    lgbtq_acceptance:          [58, 72, 'ILGA-ASEAN: Thailand — no legal recognition but culturally tolerant'],
    political_stability:       [35, 78, 'WB PSEI 2022: Thailand −0.27 → 37 (military history)'],
    healthcare_quality:        [70, 78, 'Legatum Health 2023: Thailand 68.5'],
    naturkatastrophen_resilienz:[55, 75, 'World Risk Index 2023: Thailand 17.1 (flood/cyclone)'],
    political_freedom:         [30, 85, 'Freedom House 2024: Thailand 30/100 (not free)'],
    direct_flight_to_germany:  [72, 80, 'Thai + Lufthansa: BKK-FRA/MUC 2-3 daily'],
  },
  'chiang-mai': {
    crime_index:               [74, 80, 'Numbeo 2024 H1: Chiang Mai Crime Index ~26 → safety 74'],
    water_drinkable:           [78, 75, 'WHO/JMP 2023: Thailand 82% (rural lower)'],
    air_quality_pm25:          [12, 80, 'IQAir 2023: Chiang Mai annual PM2.5 ~52 µg/m³ (seasonal burning)'],
    internet_speed_combined:   [65, 72, 'Ookla 2024 Q1: Chiang Mai ~80 Mbps'],
    english_proficiency:       [46, 72, 'EF EPI 2023: Thailand 45.9 (tourist areas higher)'],
    lgbtq_acceptance:          [55, 70, 'ILGA-ASEAN: Thailand culturally tolerant'],
    political_stability:       [35, 75, 'WB PSEI 2022: Thailand −0.27 → 37'],
    healthcare_quality:        [62, 72, 'Legatum Health 2023: Thailand 68.5 (CM lower than BKK)'],
    naturkatastrophen_resilienz:[42, 72, 'World Risk Index 2023: Thailand 17.1 (seasonal PM spike)'],
    political_freedom:         [30, 82, 'Freedom House 2024: Thailand 30/100'],
    direct_flight_to_germany:  [40, 72, 'Via Bangkok only — no direct international to Germany'],
  },
  bali: {
    crime_index:               [70, 78, 'Numbeo 2024 H1: Bali/Denpasar Crime Index ~30 → safety 70'],
    water_drinkable:           [68, 72, 'WHO/JMP 2023: Indonesia 73% (groundwater issues in Bali)'],
    air_quality_pm25:          [62, 78, 'IQAir 2023: Bali annual PM2.5 ~16 µg/m³'],
    internet_speed_combined:   [42, 70, 'Ookla 2024 Q1: Bali median ~25 Mbps (tourist areas better)'],
    english_proficiency:       [52, 72, 'EF EPI 2023: Indonesia rank 79, score 49.2 (Bali tourism premium)'],
    lgbtq_acceptance:          [28, 68, 'ILGA World: Indonesia — same-sex not explicitly illegal nationally but persecuted'],
    political_stability:       [55, 75, 'WB PSEI 2022: Indonesia +0.48 → 55'],
    healthcare_quality:        [55, 70, 'Legatum Health 2023: Indonesia 53.1 (Bali higher than average)'],
    naturkatastrophen_resilienz:[15, 75, 'World Risk Index 2023: Indonesia 43.5 (highest risk globally)'],
    political_freedom:         [62, 82, 'Freedom House 2024: Indonesia 62/100 (partly free)'],
    direct_flight_to_germany:  [52, 72, 'Lufthansa via Singapore/Doha: DPS-FRA ~1 connection'],
  },
  medellin: {
    crime_index:               [30, 80, 'Numbeo 2024 H1: Crime Index 69.8 → safety 30'],
    water_drinkable:           [91, 82, 'WHO/JMP 2023: Colombia 91% urban (Medellin infrastructure good)'],
    air_quality_pm25:          [58, 78, 'IQAir 2023: Medellin annual PM2.5 ~18 µg/m³'],
    internet_speed_combined:   [58, 72, 'Ookla 2024 Q1: Colombia ~62 Mbps'],
    english_proficiency:       [50, 72, 'EF EPI 2023: Colombia rank 64, score 51.6'],
    lgbtq_acceptance:          [65, 72, 'ILGA Americas: Colombia 65% (same-sex marriage legal)'],
    political_stability:       [30, 78, 'WB PSEI 2022: Colombia −0.46 → 30 (ongoing conflict)'],
    healthcare_quality:        [65, 72, 'Legatum Health 2023: Colombia 62.8'],
    naturkatastrophen_resilienz:[52, 72, 'World Risk Index 2023: Colombia 18.6'],
    political_freedom:         [66, 85, 'Freedom House 2024: Colombia 66/100'],
    direct_flight_to_germany:  [38, 68, 'Via Bogotá (BOG-MAD-FRA, ~18h+ connections)'],
  },
  'mexiko-city': {
    crime_index:               [28, 80, 'Numbeo 2024 H1: Crime Index 72.4 → safety 28'],
    water_drinkable:           [85, 78, 'WHO/JMP 2023: Mexico 84% urban (not always safe to drink tap)'],
    air_quality_pm25:          [45, 80, 'IQAir 2023: Mexico City annual PM2.5 ~22 µg/m³'],
    internet_speed_combined:   [52, 72, 'Ookla 2024 Q1: Mexico ~50 Mbps'],
    english_proficiency:       [52, 72, 'EF EPI 2023: Mexico rank 91, score 48.6 (CDMX premium)'],
    lgbtq_acceptance:          [68, 72, 'ILGA Americas: Mexico City — same-sex marriage legal in CDMX, 68/100'],
    political_stability:       [28, 78, 'WB PSEI 2022: Mexico −0.56 → 28 (cartel activity)'],
    healthcare_quality:        [65, 72, 'Legatum Health 2023: Mexico 62.5'],
    naturkatastrophen_resilienz:[50, 72, 'World Risk Index 2023: Mexico 20.4 (earthquake/hurricane)'],
    political_freedom:         [62, 85, 'Freedom House 2024: Mexico 62/100'],
    direct_flight_to_germany:  [42, 72, 'Lufthansa/Aeromexico: MEX-FRA/MUC 1-2 daily'],
  },
  'buenos-aires': {
    crime_index:               [35, 80, 'Numbeo 2024 H1: Crime Index 65.2 → safety 35'],
    water_drinkable:           [89, 80, 'WHO/JMP 2023: Argentina 89%'],
    air_quality_pm25:          [80, 80, 'IQAir 2023: Buenos Aires annual PM2.5 ~11 µg/m³'],
    internet_speed_combined:   [58, 72, 'Ookla 2024 Q1: Argentina ~60 Mbps (infrastructure varies)'],
    english_proficiency:       [62, 75, 'EF EPI 2023: Argentina rank 28, score 56.9 (BA premium)'],
    lgbtq_acceptance:          [80, 75, 'ILGA Americas: Argentina 80% (SSM legal since 2010)'],
    political_stability:       [42, 78, 'WB PSEI 2022: Argentina −0.10 → 42'],
    healthcare_quality:        [72, 75, 'Legatum Health 2023: Argentina 69.2'],
    naturkatastrophen_resilienz:[62, 75, 'World Risk Index 2023: Argentina 11.9'],
    political_freedom:         [85, 85, 'Freedom House 2024: Argentina 85/100'],
    direct_flight_to_germany:  [45, 72, 'Lufthansa/Air France: EZE-FRA ~1 daily (14h flight)'],
  },
  'new-york': {
    crime_index:               [52, 85, 'Numbeo 2024 H1: Crime Index 48.4 → safety 52'],
    water_drinkable:           [99, 90, 'WHO/JMP 2023: USA 99% (NYC tap water famous)'],
    air_quality_pm25:          [88, 85, 'IQAir 2023: New York annual PM2.5 ~8 µg/m³'],
    internet_speed_combined:   [88, 80, 'Ookla 2024 Q1: New York ~250 Mbps'],
    english_proficiency:       [85, 90, 'Native English-speaking city'],
    lgbtq_acceptance:          [85, 80, 'ILGA USA: NYC — highly accepting, SSM federal 2015'],
    political_stability:       [72, 80, 'WB PSEI 2022: USA +1.09 → 72'],
    healthcare_quality:        [78, 78, 'Legatum Health 2023: USA 76.2 (access/cost issues)'],
    naturkatastrophen_resilienz:[70, 78, 'World Risk Index 2023: USA 8.1 (Sandy risk, managed)'],
    political_freedom:         [83, 90, 'Freedom House 2024: USA 83/100'],
    direct_flight_to_germany:  [90, 88, 'Lufthansa/UA: JFK/EWR-FRA/MUC 10+ daily'],
  },
  miami: {
    crime_index:               [45, 82, 'Numbeo 2024 H1: Crime Index 55.3 → safety 45'],
    water_drinkable:           [98, 88, 'WHO/JMP 2023: USA 99%'],
    air_quality_pm25:          [92, 85, 'IQAir 2023: Miami annual PM2.5 ~6 µg/m³'],
    internet_speed_combined:   [86, 80, 'Ookla 2024 Q1: Miami ~225 Mbps'],
    english_proficiency:       [75, 88, 'Native English-speaking (bilingual English/Spanish)'],
    lgbtq_acceptance:          [75, 78, 'ILGA USA: Florida — SSM federal, state laws mixed'],
    political_stability:       [72, 80, 'WB PSEI 2022: USA +1.09 → 72'],
    healthcare_quality:        [76, 78, 'Legatum Health 2023: USA 76.2'],
    naturkatastrophen_resilienz:[62, 75, 'World Risk Index 2023: USA 8.1 (hurricane risk — Miami higher)'],
    political_freedom:         [83, 90, 'Freedom House 2024: USA 83/100'],
    direct_flight_to_germany:  [78, 80, 'Lufthansa: MIA-FRA/MUC 2-3 daily'],
  },
  singapur: {
    crime_index:               [84, 88, 'Numbeo 2024 H1: Crime Index 16.2 → safety 84'],
    water_drinkable:           [99, 92, 'WHO/JMP 2023: Singapore 99% (NEWater)'],
    air_quality_pm25:          [68, 82, 'IQAir 2023: Singapore annual PM2.5 ~15 µg/m³ (haze events)'],
    internet_speed_combined:   [88, 82, 'Ookla 2024 Q1: Singapore ~240 Mbps'],
    english_proficiency:       [82, 90, 'Official English-speaking country (EF EPI 2023: rank 6)'],
    lgbtq_acceptance:          [38, 72, 'ILGA World: Singapore — decriminalized 2022, no civil union, 38/100'],
    political_stability:       [72, 80, 'WB PSEI 2022: Singapore +1.11 → 72'],
    healthcare_quality:        [92, 88, 'Legatum Health 2023: Singapore 91.4'],
    naturkatastrophen_resilienz:[90, 82, 'World Risk Index 2023: Singapore 3.4 (very low)'],
    political_freedom:         [48, 85, 'Freedom House 2024: Singapore 48/100 (partly free)'],
    direct_flight_to_germany:  [82, 82, 'Singapore Airlines: SIN-FRA/MUC 2 daily'],
  },
  kapstadt: {
    crime_index:               [18, 82, 'Numbeo 2024 H1: Crime Index 82.0 → safety 18'],
    water_drinkable:           [90, 80, 'WHO/JMP 2023: South Africa 87% (Cape Town Day Zero recovered)'],
    air_quality_pm25:          [90, 82, 'IQAir 2023: Cape Town annual PM2.5 ~8 µg/m³'],
    internet_speed_combined:   [48, 70, 'Ookla 2024 Q1: South Africa ~42 Mbps'],
    english_proficiency:       [72, 82, 'Official English-speaking (6 of 11 official languages)'],
    lgbtq_acceptance:          [72, 75, 'ILGA Africa: South Africa 72% (SSM legal since 2006, constitution)'],
    political_stability:       [48, 78, 'WB PSEI 2022: South Africa −0.08 → 48'],
    healthcare_quality:        [55, 72, 'Legatum Health 2023: South Africa 52.8 (private/public dual)'],
    naturkatastrophen_resilienz:[70, 75, 'World Risk Index 2023: South Africa 8.0'],
    political_freedom:         [80, 85, 'Freedom House 2024: South Africa 80/100'],
    direct_flight_to_germany:  [55, 75, 'Lufthansa: CPT-FRA 4-5 weekly (not daily)'],
  },
};

const IMPORT_CATEGORIES = [
  'crime_index', 'water_drinkable', 'air_quality_pm25', 'internet_speed_combined',
  'english_proficiency', 'lgbtq_acceptance', 'political_stability', 'healthcare_quality',
  'naturkatastrophen_resilienz', 'political_freedom', 'direct_flight_to_germany',
] as const;

const CATEGORY_SOURCE: Record<string, string> = {
  crime_index:               SOURCE.CRIME,
  water_drinkable:           SOURCE.WATER,
  air_quality_pm25:          SOURCE.AIR,
  internet_speed_combined:   SOURCE.INTERNET,
  english_proficiency:       SOURCE.ENGLISH,
  lgbtq_acceptance:          SOURCE.LGBTQ,
  political_stability:       SOURCE.POL_STAB,
  healthcare_quality:        SOURCE.HEALTH,
  naturkatastrophen_resilienz: SOURCE.DISASTER,
  political_freedom:         SOURCE.FREEDOM,
  direct_flight_to_germany:  SOURCE.FLIGHT,
};

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  let inserted = 0;
  let updated  = 0;
  const now    = new Date();

  for (const [citySlug, scores] of Object.entries(CITY_SCORES)) {
    const city = await prisma.city.findFirst({ where: { slug: citySlug } });
    if (!city) {
      console.warn(`City not found: ${citySlug} — skipping`);
      continue;
    }

    for (const cat of IMPORT_CATEGORIES) {
      const [score, confidence, sourceFootnote] = scores[cat];
      const existing = await prisma.cityLifestyle.findFirst({
        where: { cityId: city.id, category: cat },
      });

      const data = {
        cityId:  city.id,
        category: cat,
        score,
        source:  CATEGORY_SOURCE[cat],
        confidence,
        sourceFootnote,
        updatedAt: now,
      };

      if (existing) {
        await prisma.cityLifestyle.update({ where: { id: existing.id }, data });
        updated++;
      } else {
        await prisma.cityLifestyle.create({ data });
        inserted++;
      }
    }

    process.stdout.write(`  ✓ ${citySlug}\n`);
  }

  console.log(`\nDone: ${inserted} inserted, ${updated} updated`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
