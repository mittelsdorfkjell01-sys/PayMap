'use client';

type DistrictRent = {
  nameDE: string;
  nameEN: string;
  rent1BR: number;
  rent2BR: number;
  rent3BR: number;
};

const LISSABON_RENTS: DistrictRent[] = [
  { nameDE: 'Príncipe Real', nameEN: 'Príncipe Real',   rent1BR: 2000, rent2BR: 2900, rent3BR: 4200 },
  { nameDE: 'Bairro Alto',   nameEN: 'Bairro Alto',     rent1BR: 1950, rent2BR: 2750, rent3BR: 3900 },
  { nameDE: 'Estrela/Lapa',  nameEN: 'Estrela/Lapa',    rent1BR: 1750, rent2BR: 2500, rent3BR: 3500 },
  { nameDE: 'Av. Novas',     nameEN: 'Av. Novas',       rent1BR: 1550, rent2BR: 2150, rent3BR: 3100 },
  { nameDE: 'P. das Nações', nameEN: 'P. das Nações',   rent1BR: 1650, rent2BR: 2250, rent3BR: 3200 },
  { nameDE: 'Alvalade',      nameEN: 'Alvalade',        rent1BR: 1350, rent2BR: 1850, rent3BR: 2600 },
  { nameDE: 'Belém',         nameEN: 'Belém',           rent1BR: 1250, rent2BR: 1750, rent3BR: 2450 },
  { nameDE: 'Almada',        nameEN: 'Almada',          rent1BR: 1050, rent2BR: 1450, rent3BR: 2050 },
];

const MAX_RENT = 4500;
const CHART_W = 460;
const BAR_GROUP_H = 28;
const BAR_GAP = 3;
const LEFT_LABEL_W = 88;
const BAR_AREA_W = CHART_W - LEFT_LABEL_W - 10;

const COLORS = { '1BR': '#60a5fa', '2BR': '#34d399', '3BR': '#f87171' };

type Props = { locale?: string };

export function RentComparison({ locale = 'de' }: Props) {
  const label = (d: DistrictRent) => locale === 'de' ? d.nameDE : d.nameEN;

  const svgH = LISSABON_RENTS.length * (BAR_GROUP_H * 3 + BAR_GAP * 2 + 10) + 50;

  return (
    <div className="w-full overflow-x-auto">
      <p className="text-xs text-gray-400 mb-1 text-right">
        Quelle: Idealista Q1 2026 · {locale === 'de' ? 'Schätzwerte' : 'estimates'}
      </p>
      <svg viewBox={`0 0 ${CHART_W} ${svgH}`} className="w-full max-w-2xl mx-auto">
        {/* Legend */}
        <g transform={`translate(${LEFT_LABEL_W}, 8)`}>
          {(['1BR', '2BR', '3BR'] as const).map((k, i) => (
            <g key={k} transform={`translate(${i * 90}, 0)`}>
              <rect width="12" height="12" rx="2" fill={COLORS[k]} />
              <text x="16" y="10" fontSize="10" fill="#374151">{k}</text>
            </g>
          ))}
        </g>

        {/* Bars */}
        {LISSABON_RENTS.map((d, ri) => {
          const baseY = 30 + ri * (BAR_GROUP_H * 3 + BAR_GAP * 2 + 10);
          const rents: [keyof typeof COLORS, number][] = [['1BR', d.rent1BR], ['2BR', d.rent2BR], ['3BR', d.rent3BR]];
          return (
            <g key={d.nameDE}>
              <text x={LEFT_LABEL_W - 4} y={baseY + BAR_GROUP_H + 4} textAnchor="end" fontSize="9" fill="#4b5563">
                {label(d)}
              </text>
              {rents.map(([k, val], bi) => {
                const barW = (val / MAX_RENT) * BAR_AREA_W;
                const y = baseY + bi * (BAR_GROUP_H + BAR_GAP);
                return (
                  <g key={k}>
                    <rect x={LEFT_LABEL_W} y={y} width={barW} height={BAR_GROUP_H} rx="3" fill={COLORS[k]} />
                    <text x={LEFT_LABEL_W + barW + 4} y={y + BAR_GROUP_H - 9} fontSize="9" fill="#374151">
                      {val.toLocaleString('de-DE')} €
                    </text>
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
