'use client';

const MONTHS_DE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Lissabon climate data (historical averages)
const DATA = {
  tempAvg:     [11, 12, 14, 16, 18, 22, 25, 26, 23, 19, 15, 12],
  sunshine:    [5,  6,  7,  8,  10, 12, 13, 12, 9,  7,  5,  4 ], // hours/day
  rainyDays:   [13, 11, 10, 9,  7,  3,  1,  1,  5,  9,  12, 14],
};

const MAX_TEMP = 30;
const MAX_SUN = 14;
const MAX_RAIN = 15;

function tempColor(t: number) {
  // 8°C = cool blue → 28°C = warm orange-red
  const ratio = Math.max(0, Math.min(1, (t - 8) / 20));
  const r = Math.round(59 + ratio * 190);
  const g = Math.round(130 - ratio * 80);
  const b = Math.round(246 - ratio * 220);
  return `rgb(${r},${g},${b})`;
}

function sunColor(h: number) {
  const ratio = h / MAX_SUN;
  const r = Math.round(250 - ratio * 20);
  const g = Math.round(204 - ratio * 50);
  const b = Math.round(21 + ratio * 20);
  return `rgb(${r},${g},${b})`;
}

function rainColor(d: number) {
  const ratio = d / MAX_RAIN;
  const r = Math.round(219 - ratio * 160);
  const g = Math.round(234 - ratio * 120);
  const b = Math.round(254 - ratio * 50);
  return `rgb(${r},${g},${b})`;
}

const CELL_W = 36;
const CELL_H = 38;
const LABEL_H = 20;
const ROW_LABEL_W = 96;
const SVG_W = ROW_LABEL_W + 12 * CELL_W + 10;
const SVG_H = LABEL_H + 3 * (CELL_H + 6) + 30;

type Props = { locale?: string };

export function ClimateHeatmap({ locale = 'de' }: Props) {
  const months = locale === 'de' ? MONTHS_DE : MONTHS_EN;
  const rows = [
    {
      labelDE: '🌡 Temp (°C)',
      labelEN: '🌡 Temp (°C)',
      values: DATA.tempAvg,
      color: tempColor,
      format: (v: number) => `${v}°`,
    },
    {
      labelDE: '☀ Sonne (h)',
      labelEN: '☀ Sun (h)',
      values: DATA.sunshine,
      color: sunColor,
      format: (v: number) => `${v}h`,
    },
    {
      labelDE: '🌧 Regentage',
      labelEN: '🌧 Rain days',
      values: DATA.rainyDays,
      color: rainColor,
      format: (v: number) => `${v}d`,
    },
  ];

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full max-w-2xl mx-auto">
        {/* Month headers */}
        {months.map((m, i) => (
          <text
            key={m}
            x={ROW_LABEL_W + i * CELL_W + CELL_W / 2}
            y={LABEL_H - 4}
            textAnchor="middle"
            fontSize="9"
            fill="#6b7280"
          >{m}</text>
        ))}

        {rows.map((row, ri) => {
          const rowY = LABEL_H + ri * (CELL_H + 6);
          const label = locale === 'de' ? row.labelDE : row.labelEN;
          return (
            <g key={ri}>
              <text x={ROW_LABEL_W - 4} y={rowY + CELL_H / 2 + 4} textAnchor="end" fontSize="10" fill="#374151">
                {label}
              </text>
              {row.values.map((v, ci) => (
                <g key={ci}>
                  <rect
                    x={ROW_LABEL_W + ci * CELL_W + 1}
                    y={rowY}
                    width={CELL_W - 2}
                    height={CELL_H}
                    rx="4"
                    fill={row.color(v)}
                  />
                  <text
                    x={ROW_LABEL_W + ci * CELL_W + CELL_W / 2}
                    y={rowY + CELL_H / 2 + 4}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="600"
                    fill="#1f2937"
                  >{row.format(v)}</text>
                </g>
              ))}
            </g>
          );
        })}

        <text x={SVG_W / 2} y={SVG_H - 8} textAnchor="middle" fontSize="8" fill="#9ca3af">
          {locale === 'de' ? 'Historische Durchschnittswerte — Quelle: IPMA / Climate-Data.org' : 'Historical averages — Source: IPMA / Climate-Data.org'}
        </text>
      </svg>
    </div>
  );
}
