'use client';

import { FirstMonthTimelineGeneric, type TimelineEventData } from '@/components/cities/_shared/FirstMonthTimelineGeneric';

const EVENTS: TimelineEventData[] = [
  { labelDE: 'Tag 1',    labelEN: 'Day 1',    titleDE: 'Ankunft + Serviced Apartment',                titleEN: 'Arrival + serviced apartment',            costDE: '2.000–5.000 CHF (1 Monat)',          costEN: 'CHF 2,000–5,000 (1 month)',            color: '#60a5fa' },
  { labelDE: 'Tag 2–7',  labelEN: 'Day 2–7',  titleDE: 'Schweizer Bankkonto eröffnen',                titleEN: 'Open Swiss bank account',                costDE: '0 CHF (ZKB, UBS, Neon)',             costEN: 'CHF 0 (ZKB, UBS, Neon)',               color: '#34d399' },
  { labelDE: 'Wo. 1–2',  labelEN: 'Wk 1–2',  titleDE: 'Anmeldung Einwohnerkontrolle',               titleEN: 'Register at Einwohnerkontrolle',          costDE: '0–25 CHF Gebühr',                    costEN: 'CHF 0–25 fee',                         color: '#34d399' },
  { labelDE: 'Wo. 1–3',  labelEN: 'Wk 1–3',  titleDE: 'Krankenkasse KVG abschliessen',              titleEN: 'Take out KVG health insurance',           costDE: '280–550 CHF/Monat (Pflicht!)',        costEN: 'CHF 280–550/month (mandatory!)',        color: '#a78bfa' },
  { labelDE: 'Wo. 3–6',  labelEN: 'Wk 3–6',  titleDE: 'Wohnungsbewerbungen + Mietkautionskonto',    titleEN: 'Flat applications + rental deposit acct', costDE: 'Kaution 3 MM (4.500–13.000 CHF)',     costEN: '3 months deposit (CHF 4,500–13,000)',  color: '#f87171' },
  { labelDE: 'Wo. 2–4',  labelEN: 'Wk 2–4',  titleDE: 'Betreibungsregisterauszug bestellen',         titleEN: 'Order debt register extract',             costDE: '17–20 CHF',                          costEN: 'CHF 17–20',                            color: '#fb923c' },
  { labelDE: 'Mo. 1–2',  labelEN: 'Mo 1–2',   titleDE: 'Fixkosten stabilisiert',                     titleEN: 'Monthly costs stabilised',               costDE: '4.500–8.000 CHF/Monat',             costEN: 'CHF 4,500–8,000/month',                color: '#6b7280' },
];

type Props = { locale?: string };

export function FirstMonthTimeline({ locale = 'de' }: Props) {
  return <FirstMonthTimelineGeneric events={EVENTS} locale={locale} />;
}
