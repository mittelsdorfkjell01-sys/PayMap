'use client';

import { FirstMonthTimelineGeneric, type TimelineEventData } from '@/components/cities/_shared/FirstMonthTimelineGeneric';

const MADRID_EVENTS: TimelineEventData[] = [
  {
    labelDE: 'Tag 1–5',
    labelEN: 'Day 1–5',
    titleDE: 'NIE beantragen',
    titleEN: 'Apply for NIE',
    costDE: 'Gebühr: 10,15 € (Tasa 790 Código 012)',
    costEN: 'Fee: €10.15 (Tasa 790 Code 012)',
    color: '#3b82f6',
  },
  {
    labelDE: 'Tag 1–14',
    labelEN: 'Day 1–14',
    titleDE: 'Vorläufige Unterkunft + SIM-Karte',
    titleEN: 'Temporary accommodation + SIM card',
    costDE: 'AirBnB / Hotel: ca. 60–120 €/Nacht; SIM: 10–20 €',
    costEN: 'AirBnB / Hotel: approx. €60–120/night; SIM: €10–20',
    color: '#f59e0b',
  },
  {
    labelDE: 'Woche 2–6',
    labelEN: 'Week 2–6',
    titleDE: 'Wohnungssuche + Mietvertrag',
    titleEN: 'Apartment search + rental contract',
    costDE: 'Kaution 2M + 1. Miete + ggf. Maklerprovision',
    costEN: 'Deposit 2M + 1st rent + possible agency fee',
    color: '#10b981',
  },
  {
    labelDE: 'Woche 3–6',
    labelEN: 'Week 3–6',
    titleDE: 'Empadronamiento',
    titleEN: 'Empadronamiento',
    costDE: 'Kostenlos — Termin bei Junta Municipal',
    costEN: 'Free — appointment at Junta Municipal',
    color: '#8b5cf6',
  },
  {
    labelDE: 'Woche 1–3',
    labelEN: 'Week 1–3',
    titleDE: 'Bankkonto eröffnen',
    titleEN: 'Open bank account',
    costDE: 'BBVA / Santander — teilweise kostenlos; Ersteinzahlung variiert',
    costEN: 'BBVA / Santander — partly free; initial deposit varies',
    color: '#34d399',
  },
  {
    labelDE: 'Monat 1–2',
    labelEN: 'Month 1–2',
    titleDE: 'TIE + Tarjeta Sanitaria',
    titleEN: 'TIE + Health Card (TSI)',
    costDE: 'TIE: 15,96 €; TSI: kostenlos',
    costEN: 'TIE: €15.96; TSI: free',
    color: '#ec4899',
  },
  {
    labelDE: 'Monat 1–2',
    labelEN: 'Month 1–2',
    titleDE: 'Beckham-Antrag (wenn relevant)',
    titleEN: 'Beckham application (if applicable)',
    costDE: 'Steuerberater: ca. 500–1.200 € Ersteinrichtung',
    costEN: 'Tax advisor: approx. €500–1,200 initial setup',
    color: '#f97316',
  },
];

export function MadridFirstMonthTimeline({ locale = 'de' }: { locale?: string }) {
  return <FirstMonthTimelineGeneric events={MADRID_EVENTS} locale={locale} />;
}
