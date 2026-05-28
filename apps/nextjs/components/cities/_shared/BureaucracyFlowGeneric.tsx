'use client';

export type BureaucracyStep = {
  id: string;
  labelDE: string;
  labelEN: string;
  timingDE: string;
  timingEN: string;
  color: string;
  dependsOn?: string;
};

export type BureaucracyFlowData = {
  steps: BureaucracyStep[];
  positions: Record<string, { x: number; y: number }>;
  svgWidth?: number;
  svgHeight?: number;
  noteDE?: string;
  noteEN?: string;
};

const BOX_W = 140;
const BOX_H = 52;

type Props = {
  data: BureaucracyFlowData;
  locale?: string;
};

export function BureaucracyFlowGeneric({ data, locale = 'de' }: Props) {
  const svgW = data.svgWidth ?? 560;
  const svgH = data.svgHeight ?? 340;
  const { steps, positions } = data;

  const arrows = steps
    .filter(s => s.dependsOn)
    .map(s => {
      const from = positions[s.dependsOn!];
      const to = positions[s.id];
      if (!from || !to) return null;
      return {
        id: s.id,
        x1: from.x + BOX_W / 2,
        y1: from.y + BOX_H,
        x2: to.x + BOX_W / 2,
        y2: to.y,
      };
    })
    .filter(Boolean);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-2xl mx-auto">
        <defs>
          <marker id="bfg-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#9ca3af" />
          </marker>
        </defs>

        {arrows.map(a => a && (
          <line key={a.id}
            x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
            stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#bfg-arrow)"
            strokeDasharray={a.x1 !== a.x2 ? '5,3' : undefined}
          />
        ))}

        {steps.map(s => {
          const pos = positions[s.id];
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
      {(data.noteDE || data.noteEN) && (
        <p className="text-xs text-gray-400 text-center mt-1">
          {locale === 'de' ? data.noteDE : data.noteEN}
        </p>
      )}
    </div>
  );
}
