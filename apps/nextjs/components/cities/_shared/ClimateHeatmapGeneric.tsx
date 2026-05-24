'use client';

export type ClimateData = {
  tempAvg: number[];      // 12 values °C
  sunshine: number[];     // 12 values hours/day
  rainyDays: number[];    // 12 values days/month
};

const MONTHS_DE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function tempColor(t: number, min: number, max: number) {
  const ratio = Math.max(0, Math.min(1, (t - min) / (max - min || 1)));
  return `rgb(${Math.round(59 + ratio * 190)},${Math.round(130 - ratio * 80)},${Math.round(246 - ratio * 220)})`;
}
function sunColor(h: number, max: number) {
  const ratio = h / (max || 1);
  return `rgb(${Math.round(250 - ratio * 20)},${Math.round(204 - ratio * 50)},${Math.round(21 + ratio * 20)})`;
}
function rainColor(d: number, max: number) {
  const ratio = d / (max || 1);
  return `rgb(${Math.round(219 - ratio * 160)},${Math.round(234 - ratio * 120)},${Math.round(254 - ratio * 50)})`;
}

const CELL_W = 36;
const CELL_H = 38;
const LABEL_H = 20;
const ROW_LABEL_W = 96;

type Props = {
  data: ClimateData;
  locale?: string;
  source?: string;
};

export function ClimateHeatmapGeneric({ data, locale = 'de', source }: Props) {
  const months = locale === 'de' ? MONTHS_DE : MONTHS_EN;
  const svgW = ROW_LABEL_W + 12 * CELL_W + 10;
  const svgH = LABEL_H + 3 * (CELL_H + 6) + 30;

  const maxSun = Math.max(...data.sunshine);
  const maxRain = Math.max(...data.rainyDays);
  const minTemp = Math.min(...data.tempAvg);
  const maxTemp = Math.max(...data.tempAvg);

  const rows = [
    { labelDE: '🌡 Temp (°C)', labelEN: '🌡 Temp (°C)', values: data.tempAvg, color: (v: number) => tempColor(v, minTemp, maxTemp), fmt: (v: number) => `${v}°` },
    { labelDE: '☀ Sonne (h)', labelEN: '☀ Sun (h)',   values: data.sunshine,  color: (v: number) => sunColor(v, maxSun),  fmt: (v: number) => `${v}h` },
    { labelDE: '🌧 Regentage', labelEN: '🌧 Rain days', values: data.rainyDays, color: (v: number) => rainColor(v, maxRain), fmt: (v: number) => `${v}d` },
  ];

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-2xl mx-auto">
        {months.map((m, i) => (
          <text key={m} x={ROW_LABEL_W + i * CELL_W + CELL_W / 2} y={LABEL_H - 4}
            textAnchor="middle" fontSize="9" fill="#6b7280">{m}</text>
        ))}
        {rows.map((row, ri) => {
          const rowY = LABEL_H + ri * (CELL_H + 6);
          return (
            <g key={ri}>
              <text x={ROW_LABEL_W - 4} y={rowY + CELL_H / 2 + 4} textAnchor="end" fontSize="10" fill="#374151">
                {locale === 'de' ? row.labelDE : row.labelEN}
              </text>
              {row.values.map((v, ci) => (
                <g key={ci}>
                  <rect x={ROW_LABEL_W + ci * CELL_W + 1} y={rowY} width={CELL_W - 2} height={CELL_H} rx="4" fill={row.color(v)} />
                  <text x={ROW_LABEL_W + ci * CELL_W + CELL_W / 2} y={rowY + CELL_H / 2 + 4}
                    textAnchor="middle" fontSize="9" fontWeight="600" fill="#1f2937">{row.fmt(v)}</text>
                </g>
              ))}
            </g>
          );
        })}
        <text x={svgW / 2} y={svgH - 8} textAnchor="middle" fontSize="8" fill="#9ca3af">
          {source ?? (locale === 'de' ? 'Historische Durchschnittswerte' : 'Historical averages')}
        </text>
      </svg>
    </div>
  );
}
