import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/admin-auth';

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const cities = await prisma.city.findMany({
    where: { isActive: true },
    include: { lifestyle: true },
    orderBy: { nameDE: 'asc' },
  });
  return NextResponse.json(cities);
}

const ScoreSchema = z.object({
  cityId: z.string(),
  category: z.string(),
  score: z.number().int().min(0).max(100),
});

export async function PATCH(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = z.array(ScoreSchema).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const now = new Date();
  for (const { cityId, category, score } of parsed.data) {
    await prisma.cityLifestyle.updateMany({
      where: { cityId, category },
      data: { score, updatedAt: now },
    });
  }

  return NextResponse.json({ ok: true });
}
