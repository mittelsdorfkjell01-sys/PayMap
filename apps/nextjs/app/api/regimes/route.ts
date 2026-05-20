import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const regimes = await prisma.specialRegime.findMany({
      include: {
        country: { select: { slug: true, nameDE: true, nameEN: true } },
      },
      orderBy: [{ flatRate: 'asc' }, { updatedAt: 'desc' }],
    });
    return NextResponse.json(regimes);
  } catch (err) {
    console.error('[regimes]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
