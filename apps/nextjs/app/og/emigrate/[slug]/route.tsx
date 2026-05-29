import { ImageResponse } from 'next/og';
import { CITY_META } from '@/lib/seo/top-pairs';
import { resolveDbSlug } from '@/lib/city-guide-slugs';

export const runtime = 'edge';

const CITY_FACTS_EN: Record<string, { regime: string; climate: string; lang: string }> = {
  lissabon:  { regime: 'IFICI 50% tax-free', climate: '☀ 300 sunny days', lang: '🇬🇧 English OK' },
  porto:     { regime: 'IFICI 50% tax-free', climate: '☀ 290 sunny days', lang: '🇬🇧 English OK' },
  madrid:    { regime: 'Beckham Law 24%', climate: '☀ 300 sunny days', lang: '🇪🇸 Spanish needed' },
  barcelona: { regime: 'Beckham Law 24%', climate: '☀ 280 sunny days', lang: '🇪🇸+🇨🇦 Bilingual' },
  rom:       { regime: 'Impatriati 50% free', climate: '☀ 270 sunny days', lang: '🇮🇹 Italian needed' },
  amsterdam: { regime: '30%-Ruling (tapered)', climate: '🌥 Temperate', lang: '🇬🇧 English excellent' },
  wien:      { regime: 'Standard AT tax', climate: '⛅ Continental', lang: '🇩🇪 German needed' },
  paris:     { regime: 'French tax complex', climate: '⛅ Temperate', lang: '🇫🇷 French needed' },
  prag:      { regime: 'OSVČ flat tax', climate: '⛄ Continental', lang: '🇬🇧 Expat-friendly' },
  budapest:  { regime: '15% income tax', climate: '⛅ Continental', lang: '🇬🇧 Expat-friendly' },
  zuerich:   { regime: 'Swiss withholding tax', climate: '⛅ Temperate', lang: '🇩🇪 High German' },
  dubai:     { regime: '0% income tax', climate: '☀ Subtropical', lang: '🇬🇧 English excellent' },
  bangkok:   { regime: 'DTV 180 d/entry', climate: '🌴 Tropical', lang: '🇬🇧 Expat districts' },
};

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  const dbSlug = resolveDbSlug(params.slug);
  const city = CITY_META[dbSlug];
  if (!city) return new Response('Not found', { status: 404 });

  const facts = CITY_FACTS_EN[dbSlug];

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f2744 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontFamily: 'sans-serif',
          padding: '56px 72px',
        }}
      >
        {/* Top: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#3b82f6', fontSize: '20px', fontWeight: 800, letterSpacing: '0.05em', display: 'flex' }}>pay</span>
          <span style={{ color: '#94a3b8', fontSize: '20px', fontWeight: 400, letterSpacing: '0.05em', display: 'flex' }}>map</span>
          <span style={{ color: '#475569', fontSize: '16px', marginLeft: '12px', display: 'flex' }}>Emigration Guide</span>
        </div>

        {/* Center: Flag + City Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            <span style={{ fontSize: '96px', lineHeight: 1, display: 'flex' }}>{city.flag}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ color: '#94a3b8', fontSize: '20px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex' }}>
                Emigrate to
              </span>
              <span style={{ color: '#f8fafc', fontSize: '64px', fontWeight: 800, lineHeight: 1.05, display: 'flex' }}>
                {city.nameEN}
              </span>
            </div>
          </div>

          {facts && (
            <div style={{ display: 'flex', gap: '14px', marginTop: '8px', flexWrap: 'wrap' }}>
              {[facts.regime, facts.climate, facts.lang].map((fact, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(59,130,246,0.15)',
                    border: '1px solid rgba(59,130,246,0.3)',
                    borderRadius: '8px',
                    padding: '8px 18px',
                    color: '#93c5fd',
                    fontSize: '18px',
                    fontWeight: 500,
                    display: 'flex',
                  }}
                >
                  {fact}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom: CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#475569', fontSize: '18px', display: 'flex' }}>
            Bureaucracy · Taxes · Housing · Banking
          </span>
          <span style={{ color: '#3b82f6', fontSize: '18px', fontWeight: 600, display: 'flex' }}>
            paymap.io →
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
