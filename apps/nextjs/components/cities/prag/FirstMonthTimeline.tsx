'use client';

import { FirstMonthTimelineGeneric, type TimelineEventData } from '@/components/cities/_shared/FirstMonthTimelineGeneric';

const EVENTS: TimelineEventData[] = [
  { labelDE: 'Tag 1',    labelEN: 'Day 1',    titleDE: 'Ankunft + Kurzzeitunterkunft',             titleEN: 'Arrival + short-term accommodation',    costDE: '300–1.200 € (Woche Hotel/AirBnB)',    costEN: '€300–1,200 (week hotel/Airbnb)',        color: '#60a5fa' },
  { labelDE: 'Tag 2–7',  labelEN: 'Day 2–7',  titleDE: 'Tschechisches Bankkonto eröffnen',         titleEN: 'Open Czech bank account',               costDE: '0 € (Air Bank, Raiffeisen CZ)',       costEN: '€0 (Air Bank, Raiffeisen CZ)',          color: '#34d399' },
  { labelDE: 'Wo. 1–2',  labelEN: 'Wk 1–2',  titleDE: 'Wohnadresse anmelden (ohlášení pobytu)',   titleEN: 'Register address (ohlášení pobytu)',     costDE: '0 €',                                costEN: '€0',                                   color: '#34d399' },
  { labelDE: 'Wo. 2–6',  labelEN: 'Wk 2–6',  titleDE: 'Langzeitwohnung suchen & anmieten',        titleEN: 'Find & sign long-term flat',            costDE: 'Kaution 2 MM + erste Miete (1.200–3.600 €)', costEN: '2 months deposit + 1st month (€1,200–3,600)', color: '#f87171' },
  { labelDE: 'Wo. 2–3',  labelEN: 'Wk 2–3',  titleDE: 'Krankenversicherung VZP anmelden',         titleEN: 'Register health insurance (VZP)',        costDE: '~50–150 €/Monat',                    costEN: '~€50–150/month',                       color: '#a78bfa' },
  { labelDE: 'Monat 1',  labelEN: 'Month 1',  titleDE: 'OSVČ-Anmeldung (falls selbstständig)',     titleEN: 'OSVČ registration (if self-employed)',  costDE: '~1.000 CZK (Živnostenský list)',      costEN: '~1,000 CZK (Živnostenský list)',        color: '#fb923c' },
  { labelDE: 'Mo. 1–2',  labelEN: 'Mo 1–2',   titleDE: 'Fixkosten stabilisiert',                  titleEN: 'Monthly costs stabilised',              costDE: '1.300–2.200 €/Monat',               costEN: '€1,300–2,200/month',                   color: '#6b7280' },
];

type Props = { locale?: string };

export function FirstMonthTimeline({ locale = 'de' }: Props) {
  return <FirstMonthTimelineGeneric events={EVENTS} locale={locale} />;
}
