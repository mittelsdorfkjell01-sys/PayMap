import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';
import type { CalculateResponse } from '@/components/calculator/Calculator';

export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const calc = await prisma.calculation.findFirst({
    where: { shareToken: params.token, isShared: true },
    include: {
      fromCity: { select: { nameDE: true, flag: true } },
      toCity: { select: { nameDE: true, flag: true } },
    },
  });

  if (!calc) return new Response('Not found', { status: 404 });

  const data = calc.outputData as unknown as CalculateResponse;
  const diff = data.monthlyDifference ?? 0;
  const positive = diff >= 0;
  const sign = positive ? '+' : '';
  const diffFormatted = `${sign}${Math.round(diff).toLocaleString('de-DE')} €/Monat`;

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
          gap: '28px',
        }}
      >
        {/* Logo */}
        <div style={{ color: '#94a3b8', fontSize: '20px', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'flex' }}>
          paymap
        </div>

        {/* Cities */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '64px' }}>{calc.fromCity.flag}</span>
            <span style={{ color: '#f8fafc', fontSize: '32px', fontWeight: 700 }}>{calc.fromCity.nameDE}</span>
          </div>

          <div style={{ color: '#475569', fontSize: '40px', display: 'flex' }}>→</div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '64px' }}>{calc.toCity.flag}</span>
            <span style={{ color: '#f8fafc', fontSize: '32px', fontWeight: 700 }}>{calc.toCity.nameDE}</span>
          </div>
        </div>

        {/* Delta */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: positive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            border: `2px solid ${positive ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
            borderRadius: '16px',
            padding: '16px 32px',
          }}
        >
          <span
            style={{
              color: positive ? '#4ade80' : '#f87171',
              fontSize: '44px',
              fontWeight: 800,
              display: 'flex',
            }}
          >
            {diffFormatted}
          </span>
        </div>

        {/* Subtitle */}
        <div style={{ color: '#64748b', fontSize: '18px', display: 'flex' }}>
          Netto-Vergleich · paymap.io
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
