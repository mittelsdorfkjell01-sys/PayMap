import { ImageResponse } from 'next/og';
import { CITY_META } from '@/lib/seo/top-pairs';

export const runtime = 'edge';

export async function GET(
  _req: Request,
  { params }: { params: { from: string; to: string } },
) {
  const from = CITY_META[params.from];
  const to = CITY_META[params.to];

  if (!from || !to) {
    return new Response('Not found', { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'sans-serif',
          padding: '60px',
          gap: '32px',
        }}
      >
        {/* Logo */}
        <div style={{ color: '#94a3b8', fontSize: '22px', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'flex' }}>
          paymap
        </div>

        {/* Cities */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '72px' }}>{from.flag}</span>
            <span style={{ color: '#f8fafc', fontSize: '36px', fontWeight: 700 }}>{from.nameDE}</span>
          </div>

          <div style={{ color: '#64748b', fontSize: '48px', display: 'flex' }}>→</div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '72px' }}>{to.flag}</span>
            <span style={{ color: '#f8fafc', fontSize: '36px', fontWeight: 700 }}>{to.nameDE}</span>
          </div>
        </div>

        {/* Subtitle */}
        <div style={{ color: '#64748b', fontSize: '20px', display: 'flex' }}>
          Netto-Vergleich · Net Salary Comparison
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
