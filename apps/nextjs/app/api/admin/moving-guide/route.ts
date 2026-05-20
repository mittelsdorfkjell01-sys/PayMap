import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const citySlug = req.nextUrl.searchParams.get('city');
  const steps = await prisma.movingGuide.findMany({
    where: citySlug ? { city: { slug: citySlug } } : undefined,
    include: { city: { select: { slug: true, nameDE: true } } },
    orderBy: [{ city: { slug: 'asc' } }, { stepOrder: 'asc' }],
  });
  return NextResponse.json(steps);
}

const StepSchema = z.object({
  cityId: z.string(),
  stepOrder: z.number().int(),
  phase: z.string(),
  titleDE: z.string(),
  titleEN: z.string(),
  subtitleDE: z.string().optional(),
  subtitleEN: z.string().optional(),
  timingDE: z.string(),
  timingEN: z.string(),
  isWarning: z.boolean().default(false),
  documents: z.array(z.record(z.string())).default([]),
  infoBoxDE: z.string().optional(),
  infoBoxEN: z.string().optional(),
  infoBoxType: z.string().optional(),
  tags: z.array(z.string()).default([]),
  forEmployed: z.boolean().default(true),
  forFreelancer: z.boolean().default(true),
  forFounder: z.boolean().default(true),
  forFamily: z.boolean().default(true),
  forPassive: z.boolean().default(true),
  forPair: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = StepSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const step = await prisma.movingGuide.create({ data: parsed.data });
  return NextResponse.json(step, { status: 201 });
}
