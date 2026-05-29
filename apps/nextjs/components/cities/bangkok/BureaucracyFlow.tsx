'use client';

type Step = {
  id: string;
  labelDE: string;
  labelEN: string;
  timingDE: string;
  timingEN: string;
  color: string;
  dependsOn?: string;
};

const STEPS: Step[] = [
  { id: 'dtv',      labelDE: 'DTV beantragen (vorab)', labelEN: 'Apply DTV (in advance)', timingDE: '4–6 Wo. vorher', timingEN: '4–6 wks ahead', color: '#3b82f6' },
  { id: 'bank',     labelDE: 'Thai Bankkonto',          labelEN: 'Thai bank account',      timingDE: 'Tag 2–5',        timingEN: 'Day 2–5',       color: '#10b981', dependsOn: 'dtv' },
  { id: 'wohnung',  labelDE: 'Wohnung anmieten',        labelEN: 'Rent apartment',         timingDE: 'Wo. 1–3',        timingEN: 'Wk 1–3',        color: '#f59e0b', dependsOn: 'bank' },
  { id: 'tm30',     labelDE: 'TM30 (Vermieter meldet)', labelEN: 'TM30 (landlord reports)',timingDE: 'Wo. 2',          timingEN: 'Wk 2',          color: '#8b5cf6', dependsOn: 'wohnung' },
  { id: 'kv',       labelDE: 'Internat. Krankenvers.',  labelEN: 'Intl. Health Insurance', timingDE: 'Monat 1',        timingEN: 'Month 1',       color: '#ec4899', dependsOn: 'dtv' },
  { id: 'steuer',   labelDE: '>180 d: Steuerberater!', labelEN: '>180 d: Tax advisor!',   timingDE: 'Ab Tag 150',     timingEN: 'From Day 150',  color: '#ef4444', dependsOn: 'wohnung' },
];

const BOX_W = 140;
const BOX_H = 52;
const SVG_W = 560;
const SVG_H = 320;

const POSITIONS: Record<string, { x: number; y: number }> = {
  dtv:     { x: 205, y: 20  },
  bank:    { x: 205, y: 120 },
  kv:      { x: 370, y: 120 },
  wohnung: { x: 205, y: 220 },
  tm30:    { x: 50,  y: 260 },
  steuer:  { x: 370, y: 260 },
};

type Props = { locale?: string };

export function BureaucracyFlow({ locale = 'de' }: Props) {
  const arrows = STEPS.filter(s => s.dependsOn).map(s => {
    const from = POSITIONS[s.dependsOn!];
    const to = POSITIONS[s.id];
    if (!from || !to) return null;
    const x1 = from.x + BOX_W / 2;
    const y1 = from.y + BOX_H;
    const x2 = to.x + BOX_W / 2;
    const y2 = to.y;
    return { x1, y1, x2, y2, id: s.id };
  }).filter(Boolean);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full max-w-2xl mx-auto">
        <defs>
          <marker id="arrow-bangkok" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#9ca3af" />
          </marker>
        </defs>

        {arrows.map(a => a && (
          <line key={a.id}
            x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
            stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#arrow-bangkok)"
            strokeDasharray={a.x1 !== a.x2 ? '5,3' : undefined}
          />
        ))}

        {STEPS.map(s => {
          const pos = POSITIONS[s.id];
          if (!pos) return null;
          const label = locale === 'de' ? s.labelDE : s.labelEN;
          const timing = locale === 'de' ? s.timingDE : s.timingEN;
          return (
            <g key={s.id}>
              <rect x={pos.x} y={pos.y} width={BOX_W} height={BOX_H} rx="8" fill={s.color} />
              <text x={pos.x + BOX_W / 2} y={pos.y + 20} textAnchor="middle" fontSize="10" fontWeight="700" fill="white">
                {label.length > 20 ? label.slice(0, 19) + '…' : label}
              </text>
              <text x={pos.x + BOX_W / 2} y={pos.y + 36} textAnchor="middle" fontSize="8.5" fill="white" opacity="0.85">
                {timing}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="text-xs text-gray-400 text-center mt-1">
        {locale === 'de'
          ? 'Rot = 180-Tage-Grenze beachten — bei Überschreitung Thai-Steuerpflicht möglich.'
          : 'Red = watch the 180-day threshold — exceeding it may trigger Thai tax liability.'}
      </p>
    </div>
  );
}
