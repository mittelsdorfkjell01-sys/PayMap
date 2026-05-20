import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return store.get('admin_session')?.value === process.env.ADMIN_PASSWORD;
}

const PatchSchema = z.object({
  titleDE: z.string().optional(),
  titleEN: z.string().optional(),
  subtitleDE: z.string().optional(),
  subtitleEN: z.string().optional(),
  timingDE: z.string().optional(),
  timingEN: z.string().optional(),
  isWarning: z.boolean().optional(),
  documents: z.array(z.record(z.string())).optional(),
  infoBoxDE: z.string().optional(),
  infoBoxEN: z.string().optional(),
  infoBoxType: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  stepOrder: z.number().int().optional(),
  forEmployed: z.boolean().optional(),
  forFreelancer: z.boolean().optional(),
  forFounder: z.boolean().optional(),
  forFamily: z.boolean().optional(),
  forPassive: z.boolean().optional(),
  forPair: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const step = await prisma.movingGuide.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(step);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await prisma.movingGuide.update({ where: { id: params.id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
