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
  { id: 'bank',      labelDE: 'Bankkonto eröffnen',      labelEN: 'Open bank account',         timingDE: 'Tag 2–5',    timingEN: 'Day 2–5',    color: '#3b82f6' },
  { id: 'bmbah',     labelDE: 'EU-Registrierung BMBAH',  labelEN: 'EU Registration BMBAH',     timingDE: 'Wo. 1–2',    timingEN: 'Wk 1–2',     color: '#10b981', dependsOn: 'bank' },
  { id: 'wohnung',   labelDE: 'Wohnung anmieten',         labelEN: 'Rent apartment',            timingDE: 'Wo. 2–6',    timingEN: 'Wk 2–6',     color: '#f59e0b', dependsOn: 'bmbah' },
  { id: 'taj',       labelDE: 'TAJ-Karte (NAV)',          labelEN: 'TAJ Card (NAV)',            timingDE: 'Wo. 2–3',    timingEN: 'Wk 2–3',     color: '#8b5cf6', dependsOn: 'bmbah' },
  { id: 'adoszam',   labelDE: 'Steuernr. (adóazonosító)', labelEN: 'Tax No. (adóazonosító)',   timingDE: 'Wo. 2–3',    timingEN: 'Wk 2–3',     color: '#14b8a6', dependsOn: 'bmbah' },
  { id: 'vallalkoz', labelDE: 'Unternehmensform (Kft)',   labelEN: 'Business form (Kft.)',      timingDE: 'Monat 1',    timingEN: 'Month 1',    color: '#ec4899', dependsOn: 'adoszam' },
];

const BOX_W = 140;
const BOX_H = 52;
const SVG_W = 560;
const SVG_H = 300;

const POSITIONS: Record<string, { x: number; y: number }> = {
  bank:      { x: 205, y: 20  },
  bmbah:     { x: 205, y: 120 },
  wohnung:   { x: 50,  y: 220 },
  taj:       { x: 205, y: 220 },
  adoszam:   { x: 370, y: 120 },
  vallalkoz: { x: 370, y: 220 },
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
          <marker id="arrow-budapest" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#9ca3af" />
          </marker>
        </defs>

        {arrows.map(a => a && (
          <line key={a.id}
            x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
            stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#arrow-budapest)"
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
                {label.length > 18 ? label.slice(0, 17) + '…' : label}
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
          ? 'EU-Bürger: Bankkonto zuerst — BMBAH-Registrierung folgt mit Meldeadresse.'
          : 'EU citizens: bank account first — BMBAH registration follows with registered address.'}
      </p>
    </div>
  );
}
