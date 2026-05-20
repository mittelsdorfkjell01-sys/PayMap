import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const countrySlug = req.nextUrl.searchParams.get('country') ?? 'de';
  const year = parseInt(req.nextUrl.searchParams.get('year') ?? String(new Date().getFullYear()));
  const data = await prisma.deduction.findMany({
    where: { country: { slug: countrySlug }, year },
    orderBy: { type: 'asc' },
  });
  return NextResponse.json(data);
}

const ItemSchema = z.object({
  id: z.string().optional(),
  type: z.string().min(1),
  amount: z.number().nullable().optional(),
  percentage: z.number().min(0).max(1).nullable().optional(),
  condition: z.string().nullable().optional(),
  year: z.number().int(),
  countryId: z.string(),
});

export async function PUT(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const parsed = z.array(ItemSchema).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  for (const item of parsed.data) {
    const data = { type: item.type, amount: item.amount ?? undefined, percentage: item.percentage ?? undefined, condition: item.condition ?? undefined };
    if (item.id) {
      await prisma.deduction.update({ where: { id: item.id }, data });
    } else {
      await prisma.deduction.create({ data: { ...data, year: item.year, countryId: item.countryId } });
    }
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await prisma.deduction.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
