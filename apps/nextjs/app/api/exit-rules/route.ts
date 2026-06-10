import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rules = await prisma.exitRule.findMany({
      orderBy: [{ sortOrder: 'asc' }],
    });
    return NextResponse.json(rules);
  } catch (err) {
    console.error('[exit-rules]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
