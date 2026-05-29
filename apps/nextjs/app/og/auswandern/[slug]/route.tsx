import { ImageResponse } from 'next/og';
import { CITY_META } from '@/lib/seo/top-pairs';

export const runtime = 'edge';

// Static key-facts per city for OG image (no DB query needed at edge)
const CITY_FACTS: Record<string, { regime: string; climate: string; lang: string }> = {
  lissabon:  { regime: 'IFICI 50% steuerfrei', climate: '☀ 300 Sonnentage', lang: '🇬🇧 Englisch OK' },
  porto:     { regime: 'IFICI 50% steuerfrei', climate: '☀ 290 Sonnentage', lang: '🇬🇧 Englisch OK' },
  madrid:    { regime: 'Beckham-Law 24%', climate: '☀ 300 Sonnentage', lang: '🇪🇸 Spanisch nötig' },
  barcelona: { regime: 'Beckham-Law 24%', climate: '☀ 280 Sonnentage', lang: '🇪🇸+🇨🇦 Bilingal' },
  rom:       { regime: 'Impatriati 50% frei', climate: '☀ 270 Sonnentage', lang: '🇮🇹 Ital. nötig' },
  amsterdam: { regime: '30%-Ruling (staffel)', climate: '🌥 Gemäßigt', lang: '🇬🇧 Englisch top' },
  wien:      { regime: 'Standard AT-Steuer', climate: '⛅ Kontinental', lang: '🇩🇪 Deutsch OK' },
  paris:     { regime: 'Loi Girardin komplex', climate: '⛅ Gemäßigt', lang: '🇫🇷 Französ. nötig' },
  prag:      { regime: 'OSVČ Pauschalsystem', climate: '⛄ Kontinental', lang: '🇬🇧 Expat-gerecht' },
  budapest:  { regime: '15% Einkommensteuer', climate: '⛅ Kontinental', lang: '🇬🇧 Expat-gerecht' },
  zuerich:   { regime: 'Quellensteuer CH', climate: '⛅ Gemäßigt', lang: '🇩🇪 Hochdeutsch' },
  dubai:     { regime: '0% Einkommensteuer', climate: '☀ Subtropisch', lang: '🇬🇧 Englisch top' },
  bangkok:   { regime: 'DTV 180 d/Einreise', climate: '🌴 Tropisch', lang: '🇬🇧 Expat-Viertel' },
};

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  const city = CITY_META[params.slug];
  if (!city) return new Response('Not found', { status: 404 });

  const facts = CITY_FACTS[params.slug];

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
          <span style={{ color: '#475569', fontSize: '16px', marginLeft: '12px', display: 'flex' }}>Auswanderungs-Guide</span>
        </div>

        {/* Center: Flag + City Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            <span style={{ fontSize: '96px', lineHeight: 1, display: 'flex' }}>{city.flag}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ color: '#94a3b8', fontSize: '20px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex' }}>
                Auswandern nach
              </span>
              <span style={{ color: '#f8fafc', fontSize: '64px', fontWeight: 800, lineHeight: 1.05, display: 'flex' }}>
                {city.nameDE}
              </span>
            </div>
          </div>

          {/* Key facts pills */}
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
            Bürokratie · Steuern · Wohnen · Banking
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
