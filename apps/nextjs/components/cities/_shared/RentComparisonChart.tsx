'use client';

export type RentComparisonRow = {
  nameDE: string;
  nameEN: string;
  rent1BR: number;
  rent2BR: number;
  rent3BR?: number;
};

type Props = {
  rows: RentComparisonRow[];
  currency?: string;
  locale?: string;
  source?: string;
};

// Monochrom (Spec §9): Serien über Opazitätsstufen von --text statt Farbtönen.
const TIER: Record<string, number> = { '1BR': 0.9, '2BR': 0.55, '3BR': 0.28 };
const CELL_H = 26;
const BAR_GAP = 2;
const LEFT_W = 100;
const CHART_W = 460;
const BAR_AREA_W = CHART_W - LEFT_W - 12;

export function RentComparisonChart({ rows, currency = 'EUR', locale = 'de', source }: Props) {
  const has3BR = rows.some(r => r.rent3BR != null);
  const barsPerRow = has3BR ? 3 : 2;
  const rowH = barsPerRow * (CELL_H + BAR_GAP) + 10;
  const maxRent = Math.max(...rows.flatMap(r => [r.rent1BR, r.rent2BR, r.rent3BR ?? 0])) * 1.1;
  const svgH = rows.length * rowH + 40;

  const fmt = (v: number) =>
    v.toLocaleString(locale === 'de' ? 'de-DE' : 'en-GB', { style: 'currency', currency, maximumFractionDigits: 0 });

  const keys = has3BR
    ? (['1BR', '2BR', '3BR'] as const)
    : (['1BR', '2BR'] as const);

  return (
    <div className="w-full overflow-x-auto">
      {source && <p className="mb-1 text-right text-caption text-text-3">{source}</p>}
      <svg viewBox={`0 0 ${CHART_W} ${svgH}`} className="mx-auto w-full max-w-2xl">
        {/* Legend */}
        <g transform={`translate(${LEFT_W}, 8)`}>
          {keys.map((k, i) => (
            <g key={k} transform={`translate(${i * 90}, 0)`}>
              <rect width="12" height="12" rx="2" fill="var(--text)" fillOpacity={TIER[k]} />
              <text x="16" y="10" fontSize="10" fill="var(--text-2)">{k}</text>
            </g>
          ))}
        </g>

        {rows.map((row, ri) => {
          const baseY = 28 + ri * rowH;
          const label = locale === 'de' ? row.nameDE : row.nameEN;
          const rents: [typeof keys[number], number][] = [
            ['1BR', row.rent1BR], ['2BR', row.rent2BR],
            ...(has3BR && row.rent3BR != null ? [['3BR', row.rent3BR] as ['3BR', number]] : []),
          ];
          return (
            <g key={row.nameDE}>
              <text x={LEFT_W - 4} y={baseY + rowH / 2} textAnchor="end" fontSize="9" fill="var(--text-2)">{label}</text>
              {rents.map(([k, val], bi) => {
                const barW = (val / maxRent) * BAR_AREA_W;
                const y = baseY + bi * (CELL_H + BAR_GAP);
                return (
                  <g key={k}>
                    <rect x={LEFT_W} y={y} width={barW} height={CELL_H} rx="3" fill="var(--text)" fillOpacity={TIER[k]} />
                    <text x={LEFT_W + barW + 4} y={y + CELL_H - 8} fontSize="9" fill="var(--text-2)">{fmt(val)}</text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
