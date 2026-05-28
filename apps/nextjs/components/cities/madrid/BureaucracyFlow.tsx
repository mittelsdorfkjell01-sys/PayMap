'use client';

import { BureaucracyFlowGeneric, type BureaucracyFlowData } from '@/components/cities/_shared/BureaucracyFlowGeneric';

const MADRID_FLOW: BureaucracyFlowData = {
  svgWidth: 560,
  svgHeight: 340,
  noteDE: 'NIE ist immer der erste Schritt — ohne NIE kein Konto, keine Wohnung, kein TIE.',
  noteEN: 'NIE is always the first step — without NIE no bank account, no apartment, no TIE.',
  steps: [
    { id: 'nie',       labelDE: 'NIE beantragen',         labelEN: 'Apply for NIE',             timingDE: 'Tag 1–5',    timingEN: 'Day 1–5',    color: '#3b82f6' },
    { id: 'bank',      labelDE: 'Bankkonto (BBVA)',        labelEN: 'Bank account (BBVA)',        timingDE: 'Woche 1–3',  timingEN: 'Week 1–3',   color: '#10b981', dependsOn: 'nie' },
    { id: 'wohnung',   labelDE: 'Wohnung anmieten',       labelEN: 'Rent apartment',            timingDE: 'Woche 2–6',  timingEN: 'Week 2–6',   color: '#f59e0b', dependsOn: 'nie' },
    { id: 'empadron',  labelDE: 'Empadronamiento',         labelEN: 'Empadronamiento',           timingDE: 'Woche 3–6',  timingEN: 'Week 3–6',   color: '#8b5cf6', dependsOn: 'wohnung' },
    { id: 'tie',       labelDE: 'TIE beantragen',          labelEN: 'Apply for TIE',             timingDE: 'Monat 1–2',  timingEN: 'Month 1–2',  color: '#ec4899', dependsOn: 'empadron' },
    { id: 'seguridad', labelDE: 'Tarjeta Sanitaria',       labelEN: 'Health Card (TSI)',         timingDE: 'Monat 2',    timingEN: 'Month 2',    color: '#14b8a6', dependsOn: 'empadron' },
    { id: 'beckham',   labelDE: 'Beckham-Antrag (opt.)',   labelEN: 'Beckham application (opt.)', timingDE: 'Monat 1–2', timingEN: 'Month 1–2',  color: '#f97316', dependsOn: 'nie' },
  ],
  positions: {
    nie:       { x: 205, y: 20  },
    bank:      { x: 50,  y: 130 },
    wohnung:   { x: 205, y: 130 },
    empadron:  { x: 205, y: 230 },
    tie:       { x: 50,  y: 270 },
    seguridad: { x: 370, y: 270 },
    beckham:   { x: 370, y: 130 },
  },
};

export function MadridBureaucracyFlow({ locale = 'de' }: { locale?: string }) {
  return <BureaucracyFlowGeneric data={MADRID_FLOW} locale={locale} />;
}
