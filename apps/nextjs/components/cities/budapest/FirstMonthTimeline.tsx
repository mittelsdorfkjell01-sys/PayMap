'use client';

import { FirstMonthTimelineGeneric, type TimelineEventData } from '@/components/cities/_shared/FirstMonthTimelineGeneric';

const EVENTS: TimelineEventData[] = [
  { labelDE: 'Tag 1',    labelEN: 'Day 1',    titleDE: 'Ankunft + Kurzzeitunterkunft',               titleEN: 'Arrival + short-term accommodation',      costDE: '300–1.000 € (Woche Aparthotel)',      costEN: '€300–1,000 (week apartment hotel)',   color: '#60a5fa' },
  { labelDE: 'Tag 2–5',  labelEN: 'Day 2–5',  titleDE: 'Ungarisches Bankkonto eröffnen',             titleEN: 'Open Hungarian bank account',             costDE: '0 € (OTP Bank, K&H, Revolut HU)',    costEN: '€0 (OTP Bank, K&H, Revolut HU)',      color: '#34d399' },
  { labelDE: 'Wo. 1–2',  labelEN: 'Wk 1–2',  titleDE: 'EU-Registrierung beim BMBAH',               titleEN: 'EU registration at BMBAH',               costDE: '0 € (Regisztrációs igazolás)',        costEN: '€0 (Regisztrációs igazolás)',          color: '#34d399' },
  { labelDE: 'Wo. 2–6',  labelEN: 'Wk 2–6',  titleDE: 'Langzeitwohnung suchen & anmieten',          titleEN: 'Find & sign long-term flat',             costDE: 'Kaution 2 MM + erste Miete (1.100–2.700 €)', costEN: '2 months deposit + 1st month (€1,100–2,700)', color: '#f87171' },
  { labelDE: 'Wo. 2–3',  labelEN: 'Wk 2–3',  titleDE: 'TAJ-Karte + Steuernr. beim NAV',            titleEN: 'TAJ card + tax no. at NAV',              costDE: '0 €',                                costEN: '€0',                                  color: '#a78bfa' },
  { labelDE: 'Monat 1',  labelEN: 'Month 1',  titleDE: 'Unternehmensform wählen (KATA/Kft/Evállalk)', titleEN: 'Choose business form (KATA/Kft/Eváll.)', costDE: '0–300 € Beratung + Notarkosten Kft.',costEN: '€0–300 advisory + Kft. notary costs', color: '#fb923c' },
  { labelDE: 'Mo. 1–2',  labelEN: 'Mo 1–2',   titleDE: 'Fixkosten stabilisiert',                    titleEN: 'Monthly costs stabilised',              costDE: '900–1.800 €/Monat',                 costEN: '€900–1,800/month',                    color: '#6b7280' },
];

type Props = { locale?: string };

export function FirstMonthTimeline({ locale = 'de' }: Props) {
  return <FirstMonthTimelineGeneric events={EVENTS} locale={locale} />;
}
