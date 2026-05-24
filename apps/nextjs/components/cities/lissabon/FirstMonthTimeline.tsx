'use client';

import { FirstMonthTimelineGeneric, type TimelineEventData } from '@/components/cities/_shared/FirstMonthTimelineGeneric';

const EVENTS: TimelineEventData[] = [
  { labelDE: 'Tag 1',    labelEN: 'Day 1',    titleDE: 'Ankunft + temporäre Unterkunft',           titleEN: 'Arrival + temporary accommodation',  costDE: '500–1.500 € (1 Woche Hotel/AirBnB)', costEN: '€500–1,500 (1 week hotel/AirBnB)', color: '#60a5fa' },
  { labelDE: 'Tag 2–5',  labelEN: 'Day 2–5',  titleDE: 'NIF beantragen',                           titleEN: 'Apply for NIF',                      costDE: '0 € (ggf. 300–500 € Steuerberater)', costEN: '€0 (€300–500 for tax advisor)',     color: '#34d399' },
  { labelDE: 'Tag 5–14', labelEN: 'Day 5–14', titleDE: 'Bankkonto eröffnen',                       titleEN: 'Open bank account',                  costDE: '0 €',                                costEN: '€0',                                color: '#34d399' },
  { labelDE: 'Wo. 2–6',  labelEN: 'Wk 2–6',  titleDE: 'Langzeitwohnung suchen & abschließen',     titleEN: 'Find & sign long-term apartment',    costDE: 'Kaution 2–3 MM + Provision + 1. Miete', costEN: '2–3 months deposit + agency + 1st month', color: '#f87171' },
  { labelDE: 'Wo. 4–6',  labelEN: 'Wk 4–6',  titleDE: 'Möbel / Einrichtung',                      titleEN: 'Furniture / furnishings',            costDE: '0–4.000 € (je nach Möblierung)',     costEN: '€0–4,000 (depends on furnishing)',  color: '#fb923c' },
  { labelDE: 'Monat 2',  labelEN: 'Month 2',  titleDE: 'SNS + Aufenthaltstitel-Antrag (AIMA)',     titleEN: 'SNS registration + residence permit', costDE: '~15 € Gebühr',                       costEN: '~€15 fee',                         color: '#a78bfa' },
  { labelDE: 'Mo. 2–3',  labelEN: 'Mo 2–3',   titleDE: 'Fixkosten stabilisiert',                  titleEN: 'Monthly costs stabilised',           costDE: '2.000–4.000 €/Monat',               costEN: '€2,000–4,000/month',               color: '#6b7280' },
];

type Props = { locale?: string };

export function FirstMonthTimeline({ locale = 'de' }: Props) {
  return <FirstMonthTimelineGeneric events={EVENTS} locale={locale} />;
}
