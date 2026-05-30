'use client';

import { useState } from 'react';

export type DistrictMapData = {
  slug: string;
  nameDE: string;
  nameEN: string;
  priceLevel: number;
  vibe?: string | null;
  descriptionDE?: string | null;
  descriptionEN?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

type Props = {
  districts: DistrictMapData[];
  locale?: string;
  width?: number;
  height?: number;
};

// Monochrom (Spec §9): Preisniveau über Opazitätsrampe von --text, nicht über Farbtöne.
const PRICE_OPACITY: Record<number, number> = {
  1: 0.10,
  2: 0.18,
  3: 0.28,
  4: 0.40,
  5: 0.52,
};

const PRICE_LABELS: Record<number, [string, string]> = {
  1: ['sehr günstig', 'very affordable'],
  2: ['günstig', 'affordable'],
  3: ['mittel', 'moderate'],
  4: ['gehoben', 'upscale'],
  5: ['Toplage', 'premium'],
};

function projectToSvg(
  districts: DistrictMapData[],
  svgW: number,
  svgH: number,
  padding = 40,
): Map<string, { cx: number; cy: number }> {
  const withCoords = districts.filter(d => d.latitude != null && d.longitude != null);
  if (withCoords.length === 0) return new Map();

  const lats = withCoords.map(d => d.latitude!);
  const lngs = withCoords.map(d => d.longitude!);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const rangeH = maxLat - minLat || 0.01;
  const rangeW = maxLng - minLng || 0.01;

  const map = new Map<string, { cx: number; cy: number }>();
  for (const d of withCoords) {
    const cx = padding + ((d.longitude! - minLng) / rangeW) * (svgW - padding * 2);
    const cy = (svgH - padding) - ((d.latitude! - minLat) / rangeH) * (svgH - padding * 2);
    map.set(d.slug, { cx, cy });
  }
  return map;
}

export function DistrictMapGeneric({ districts, locale = 'de', width = 480, height = 360 }: Props) {
  const [active, setActive] = useState<string | null>(null);
  const positions = projectToSvg(districts, width, height);
  const activeDistrict = districts.find(d => d.slug === active);

  const hasCoords = districts.some(d => d.latitude != null);
  // Fallback: grid layout when no coordinates
  const gridPositions = new Map<string, { cx: number; cy: number }>();
  if (!hasCoords) {
    const cols = Math.ceil(Math.sqrt(districts.length));
    districts.forEach((d, i) => {
      gridPositions.set(d.slug, {
        cx: 60 + (i % cols) * ((width - 80) / cols),
        cy: 60 + Math.floor(i / cols) * 80,
      });
    });
  }

  const pos = hasCoords ? positions : gridPositions;
  const priceLevels = Array.from(new Set(districts.map(d => d.priceLevel))).sort();

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`}
        className="mx-auto w-full max-w-2xl rounded-lg border border-line bg-surface-sub">
        {/* Districts as circles with labels */}
        {districts.map(d => {
          const p = pos.get(d.slug);
          if (!p) return null;
          const op = PRICE_OPACITY[d.priceLevel] ?? 0.15;
          const isActive = active === d.slug;
          const name = locale === 'de' ? d.nameDE : d.nameEN;
          const shortName = name.length > 14 ? name.slice(0, 13) + '…' : name;
          return (
            <g key={d.slug} onClick={() => setActive(isActive ? null : d.slug)} className="cursor-pointer">
              <circle cx={p.cx} cy={p.cy} r={isActive ? 28 : 24}
                fill="var(--text)" fillOpacity={op}
                stroke={isActive ? 'var(--focus)' : 'var(--line-strong)'}
                strokeWidth={isActive ? 2.5 : 1}
                opacity={active && !isActive ? 0.5 : 1}
              />
              <text x={p.cx} y={p.cy + 4} textAnchor="middle"
                fontSize={isActive ? '8.5' : '7.5'}
                fontWeight={isActive ? '700' : '500'}
                fill="var(--text)">
                {shortName}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(8, 8)">
          <rect x="0" y="0" width="90" height={priceLevels.length * 14 + 18} rx="4" fill="var(--surface)" opacity="0.88" />
          <text x="5" y="13" fontSize="8" fontWeight="600" fill="var(--text-2)">
            {locale === 'de' ? 'Preisniveau' : 'Price level'}
          </text>
          {priceLevels.map((lvl, i) => (
            <g key={lvl} transform={`translate(5, ${18 + i * 14})`}>
              <rect width="9" height="9" rx="2" fill="var(--text)" fillOpacity={PRICE_OPACITY[lvl] ?? 0.15} />
              <text x="13" y="8.5" fontSize="7.5" fill="var(--text-2)">
                {PRICE_LABELS[lvl]?.[locale === 'de' ? 0 : 1] ?? lvl}
              </text>
            </g>
          ))}
        </g>
      </svg>

      {activeDistrict && (
        <div className="mt-3 rounded-md border border-line bg-surface p-4 text-sm">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-text">
              {locale === 'de' ? activeDistrict.nameDE : activeDistrict.nameEN}
            </span>
            {activeDistrict.vibe && (
              <span className="rounded-sm bg-surface-sub px-2 py-0.5 text-caption text-text-2">{activeDistrict.vibe}</span>
            )}
          </div>
          <p className="leading-relaxed text-text-2">
            {locale === 'de' ? activeDistrict.descriptionDE : activeDistrict.descriptionEN}
          </p>
        </div>
      )}
      {!active && (
        <p className="mt-2 text-center text-caption text-text-3">
          {locale === 'de' ? '↑ Stadtteil anklicken für Details' : '↑ Click a district for details'}
        </p>
      )}
    </div>
  );
}
