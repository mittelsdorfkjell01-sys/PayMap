'use client';

import { useState } from 'react';

type District = {
  slug: string;
  nameDE: string;
  nameEN: string;
  priceLevel: number;
  vibe: string;
  descriptionDE?: string | null;
  descriptionEN?: string | null;
};

const DISTRICT_POSITIONS: Record<string, { x: number; y: number; w: number; h: number; labelX: number; labelY: number }> = {
  'principe-real':      { x: 195, y: 185, w: 65,  h: 50,  labelX: 228, labelY: 208 },
  'bairro-alto-chiado': { x: 210, y: 235, w: 70,  h: 45,  labelX: 245, labelY: 256 },
  'estrela-lapa':       { x: 140, y: 220, w: 75,  h: 55,  labelX: 177, labelY: 246 },
  'avenidas-novas':     { x: 210, y: 120, w: 80,  h: 65,  labelX: 250, labelY: 151 },
  'alvalade':           { x: 295, y: 90,  w: 85,  h: 75,  labelX: 337, labelY: 127 },
  'belem':              { x: 30,  y: 260, w: 100, h: 50,  labelX: 80,  labelY: 284 },
  'parque-das-nacoes':  { x: 350, y: 60,  w: 90,  h: 85,  labelX: 395, labelY: 100 },
  'almada':             { x: 130, y: 330, w: 120, h: 55,  labelX: 190, labelY: 357 },
};

const PRICE_COLORS: Record<number, string> = {
  2: '#86efac',
  3: '#fcd34d',
  4: '#fb923c',
  5: '#f87171',
};

type Props = {
  districts: District[];
  locale?: string;
};

export function DistrictMap({ districts, locale = 'de' }: Props) {
  const [active, setActive] = useState<string | null>(null);

  const activeDistrict = districts.find(d => d.slug === active);

  return (
    <div className="w-full">
      <svg
        viewBox="0 0 500 420"
        className="w-full max-w-2xl mx-auto border border-gray-200 rounded-xl bg-blue-50"
        role="img"
        aria-label={locale === 'de' ? 'Stadtteil-Karte Lissabon' : 'Lisbon district map'}
      >
        {/* Tejo river */}
        <ellipse cx="250" cy="400" rx="320" ry="60" fill="#bfdbfe" opacity="0.6" />
        <text x="250" y="395" textAnchor="middle" fontSize="11" fill="#3b82f6" fontWeight="500">Rio Tejo</text>

        {/* Districts */}
        {districts.map(d => {
          const pos = DISTRICT_POSITIONS[d.slug];
          if (!pos) return null;
          const color = PRICE_COLORS[d.priceLevel] ?? '#e5e7eb';
          const isActive = active === d.slug;
          return (
            <g
              key={d.slug}
              onClick={() => setActive(isActive ? null : d.slug)}
              className="cursor-pointer"
              role="button"
              aria-label={locale === 'de' ? d.nameDE : d.nameEN}
            >
              <rect
                x={pos.x} y={pos.y} width={pos.w} height={pos.h}
                rx="6" fill={color}
                stroke={isActive ? '#1d4ed8' : '#9ca3af'}
                strokeWidth={isActive ? 2.5 : 1}
                opacity={active && !isActive ? 0.5 : 0.9}
              />
              <text
                x={pos.labelX} y={pos.labelY}
                textAnchor="middle"
                fontSize={isActive ? '9.5' : '8.5'}
                fontWeight={isActive ? '700' : '500'}
                fill="#1f2937"
              >
                {locale === 'de' ? d.nameDE.split(' ')[0] : d.nameEN.split(' ')[0]}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(10, 10)">
          <rect x="0" y="0" width="110" height="70" rx="4" fill="white" opacity="0.85" />
          <text x="5" y="14" fontSize="8" fontWeight="600" fill="#374151">
            {locale === 'de' ? 'Preisniveau' : 'Price level'}
          </text>
          {([2, 3, 4, 5] as const).map((lvl, i) => (
            <g key={lvl} transform={`translate(5, ${20 + i * 12})`}>
              <rect width="10" height="10" rx="2" fill={PRICE_COLORS[lvl]} />
              <text x="14" y="9" fontSize="7.5" fill="#4b5563">
                {lvl === 2 ? (locale === 'de' ? 'günstig' : 'affordable') :
                 lvl === 3 ? (locale === 'de' ? 'mittel' : 'moderate') :
                 lvl === 4 ? (locale === 'de' ? 'gehoben' : 'upscale') :
                             (locale === 'de' ? 'Toplage' : 'premium')}
              </text>
            </g>
          ))}
        </g>
      </svg>

      {/* Detail card */}
      {activeDistrict && (
        <div className="mt-3 p-4 bg-white border border-blue-200 rounded-xl text-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-gray-900">
              {locale === 'de' ? activeDistrict.nameDE : activeDistrict.nameEN}
            </span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {activeDistrict.vibe}
            </span>
          </div>
          <p className="text-gray-600 leading-relaxed">
            {locale === 'de' ? activeDistrict.descriptionDE : activeDistrict.descriptionEN}
          </p>
        </div>
      )}
      {!active && (
        <p className="mt-2 text-center text-xs text-gray-400">
          {locale === 'de' ? '↑ Stadtteil anklicken für Details' : '↑ Click a district for details'}
        </p>
      )}
    </div>
  );
}
