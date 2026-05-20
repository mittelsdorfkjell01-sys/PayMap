import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/admin-auth';

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const regimes = await prisma.specialRegime.findMany({
    include: { country: { select: { slug: true, nameDE: true } } },
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json(regimes);
}

const PatchSchema = z.object({
  nameDE: z.string().optional(),
  nameEN: z.string().optional(),
  flatRate: z.number().min(0).max(1).optional(),
  durationYears: z.number().int().optional(),
  qualifications: z.array(z.string()).optional(),
  conditionsDE: z.string().optional(),
  conditionsEN: z.string().optional(),
  validFrom: z.string().datetime().optional(),
  validTo: z.string().datetime().nullable().optional(),
  sourceUrl: z.string().url().optional(),
  sourceDE: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const { validFrom, validTo, ...rest } = parsed.data;
  const regime = await prisma.specialRegime.update({
    where: { id },
    data: {
      ...rest,
      ...(validFrom ? { validFrom: new Date(validFrom) } : {}),
      ...(validTo !== undefined ? { validTo: validTo ? new Date(validTo) : null } : {}),
      updatedAt: new Date(),
    },
  });
  return NextResponse.json(regime);
}
