'use client';

type TimelineEvent = {
  dayLabel: string;
  dayLabelEN: string;
  titleDE: string;
  titleEN: string;
  costDE: string;
  costEN: string;
  color: string;
};

const EVENTS: TimelineEvent[] = [
  { dayLabel: 'Tag 1',    dayLabelEN: 'Day 1',    titleDE: 'Ankunft + temporäre Unterkunft', titleEN: 'Arrival + temporary accommodation', costDE: '500–1.500 € (1 Woche Hotel/AirBnB)', costEN: '€500–1,500 (1 week hotel/AirBnB)', color: '#60a5fa' },
  { dayLabel: 'Tag 2–5',  dayLabelEN: 'Day 2–5',  titleDE: 'NIF beantragen', titleEN: 'Apply for NIF', costDE: '0 € (ggf. 300–500 € Steuerberater)', costEN: '€0 (€300–500 for tax advisor)', color: '#34d399' },
  { dayLabel: 'Tag 5–14', dayLabelEN: 'Day 5–14', titleDE: 'Bankkonto eröffnen', titleEN: 'Open bank account', costDE: '0 €', costEN: '€0', color: '#34d399' },
  { dayLabel: 'Woche 2–6',dayLabelEN: 'Week 2–6', titleDE: 'Langzeitwohnung suchen & abschließen', titleEN: 'Find & sign long-term apartment', costDE: 'Kaution 2–3 MM + 1 MM Provision + 1. Miete', costEN: '2–3 months deposit + 1 month agency + 1st month', color: '#f87171' },
  { dayLabel: 'Woche 4–6',dayLabelEN: 'Week 4–6', titleDE: 'Möbel / Einrichtung', titleEN: 'Furniture / furnishings', costDE: '0 € (möbliert) bis 4.000 € (leer)', costEN: '€0 (furnished) to €4,000 (empty)', color: '#fb923c' },
  { dayLabel: 'Monat 2',  dayLabelEN: 'Month 2',  titleDE: 'SNS-Registrierung + Aufenthaltstitel-Antrag', titleEN: 'SNS registration + residence permit application', costDE: '~15 € Anmeldegebühr', costEN: '~€15 registration fee', color: '#a78bfa' },
  { dayLabel: 'Monat 2–3',dayLabelEN: 'Month 2–3',titleDE: 'Monatliche Fixkosten stabilisiert', titleEN: 'Monthly fixed costs stabilised', costDE: 'Miete + Lebenskosten: 2.000–4.000 €/Mo', costEN: 'Rent + living costs: €2,000–4,000/mo', color: '#6b7280' },
];

const SVG_W = 600;
const SVG_H = EVENTS.length * 64 + 40;
const LABEL_W = 80;
const LINE_X = LABEL_W + 20;

type Props = { locale?: string };

export function FirstMonthTimeline({ locale = 'de' }: Props) {
  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full max-w-2xl mx-auto">
        {/* Vertical timeline line */}
        <line x1={LINE_X} y1="20" x2={LINE_X} y2={SVG_H - 20} stroke="#e5e7eb" strokeWidth="2" />

        {EVENTS.map((ev, i) => {
          const cy = 30 + i * 64;
          const label = locale === 'de' ? ev.dayLabel : ev.dayLabelEN;
          const title = locale === 'de' ? ev.titleDE : ev.titleEN;
          const cost = locale === 'de' ? ev.costDE : ev.costEN;
          return (
            <g key={i}>
              {/* Day label */}
              <text x={LABEL_W - 4} y={cy + 5} textAnchor="end" fontSize="9" fontWeight="600" fill="#6b7280">
                {label}
              </text>
              {/* Circle */}
              <circle cx={LINE_X} cy={cy} r="7" fill={ev.color} />
              {/* Content */}
              <rect x={LINE_X + 16} y={cy - 22} width={SVG_W - LINE_X - 26} height="48" rx="6" fill={ev.color} opacity="0.12" />
              <text x={LINE_X + 24} y={cy - 6} fontSize="10.5" fontWeight="600" fill="#1f2937">{title}</text>
              <text x={LINE_X + 24} y={cy + 12} fontSize="9" fill="#4b5563">{cost}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
