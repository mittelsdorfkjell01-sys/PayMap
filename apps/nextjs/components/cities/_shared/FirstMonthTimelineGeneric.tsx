'use client';

export type TimelineEventData = {
  labelDE: string;
  labelEN: string;
  titleDE: string;
  titleEN: string;
  costDE: string;
  costEN: string;
  color?: string;
};

const DEFAULT_COLORS = ['#60a5fa', '#34d399', '#34d399', '#f87171', '#fb923c', '#a78bfa', '#6b7280'];

type Props = {
  events: TimelineEventData[];
  locale?: string;
};

const SVG_W = 600;
const LABEL_W = 88;
const LINE_X = LABEL_W + 20;

export function FirstMonthTimelineGeneric({ events, locale = 'de' }: Props) {
  const svgH = events.length * 64 + 40;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${SVG_W} ${svgH}`} className="w-full max-w-2xl mx-auto">
        <line x1={LINE_X} y1="20" x2={LINE_X} y2={svgH - 20} stroke="#e5e7eb" strokeWidth="2" />
        {events.map((ev, i) => {
          const cy = 30 + i * 64;
          const color = ev.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
          return (
            <g key={i}>
              <text x={LABEL_W - 4} y={cy + 5} textAnchor="end" fontSize="9" fontWeight="600" fill="#6b7280">
                {locale === 'de' ? ev.labelDE : ev.labelEN}
              </text>
              <circle cx={LINE_X} cy={cy} r="7" fill={color} />
              <rect x={LINE_X + 16} y={cy - 22} width={SVG_W - LINE_X - 26} height="48" rx="6" fill={color} opacity="0.12" />
              <text x={LINE_X + 24} y={cy - 6} fontSize="10.5" fontWeight="600" fill="#1f2937">
                {locale === 'de' ? ev.titleDE : ev.titleEN}
              </text>
              <text x={LINE_X + 24} y={cy + 12} fontSize="9" fill="#4b5563">
                {locale === 'de' ? ev.costDE : ev.costEN}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
