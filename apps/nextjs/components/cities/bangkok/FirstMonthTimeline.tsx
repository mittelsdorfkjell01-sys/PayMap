'use client';

import { FirstMonthTimelineGeneric, type TimelineEventData } from '@/components/cities/_shared/FirstMonthTimelineGeneric';

const EVENTS: TimelineEventData[] = [
  { labelDE: 'Vorab',    labelEN: 'Advance',  titleDE: 'DTV im dt. Konsulat beantragen',           titleEN: 'Apply for DTV at German consulate',       costDE: '~260 € DTV-Gebühr',                  costEN: '~€260 DTV fee',                        color: '#60a5fa' },
  { labelDE: 'Tag 1',    labelEN: 'Day 1',    titleDE: 'Ankunft + Serviced Apartment',               titleEN: 'Arrival + serviced apartment',            costDE: '400–1.000 € (2 Wochen Unterkunft)',  costEN: '€400–1,000 (2 weeks accommodation)',   color: '#34d399' },
  { labelDE: 'Tag 2–5',  labelEN: 'Day 2–5',  titleDE: 'Thai SIM + Kasikorn/Bangkok Bank Konto',     titleEN: 'Thai SIM + Kasikorn/Bangkok Bank acct',  costDE: '15–30 € (SIM)',                      costEN: '€15–30 (SIM)',                         color: '#34d399' },
  { labelDE: 'Wo. 1–3',  labelEN: 'Wk 1–3',  titleDE: 'Langzeitwohnung suchen (DDproperty)',        titleEN: 'Find long-term flat (DDproperty)',        costDE: 'Kaution 2 MM (560–2.400 €)',         costEN: '2 months deposit (€560–2,400)',         color: '#f87171' },
  { labelDE: 'Wo. 2',    labelEN: 'Wk 2',    titleDE: 'TM30-Meldung durch Vermieter',               titleEN: 'TM30 notification by landlord',          costDE: '0 €',                                costEN: '€0',                                   color: '#a78bfa' },
  { labelDE: 'Monat 1',  labelEN: 'Month 1',  titleDE: 'Internat. Krankenversicherung aktivieren',   titleEN: 'Activate international health insurance', costDE: '80–250 €/Monat',                     costEN: '€80–250/month',                        color: '#fb923c' },
  { labelDE: 'Mo. 1–2',  labelEN: 'Mo 1–2',   titleDE: 'Fixkosten stabilisiert',                    titleEN: 'Monthly costs stabilised',              costDE: '900–2.000 €/Monat',                 costEN: '€900–2,000/month',                     color: '#6b7280' },
];

type Props = { locale?: string };

export function FirstMonthTimeline({ locale = 'de' }: Props) {
  return <FirstMonthTimelineGeneric events={EVENTS} locale={locale} />;
}
