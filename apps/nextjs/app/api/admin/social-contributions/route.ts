import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const countrySlug = req.nextUrl.searchParams.get('country') ?? 'de';
  const year = parseInt(req.nextUrl.searchParams.get('year') ?? String(new Date().getFullYear()));
  const data = await prisma.socialContribution.findMany({
    where: { country: { slug: countrySlug }, year },
    orderBy: { type: 'asc' },
  });
  return NextResponse.json(data);
}

const ItemSchema = z.object({
  id: z.string().optional(),
  type: z.string().min(1),
  rate: z.number().min(0).max(1),
  ceiling: z.number().nullable().optional(),
  employeeSide: z.boolean(),
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
    if (item.id) {
      await prisma.socialContribution.update({
        where: { id: item.id },
        data: { type: item.type, rate: item.rate, ceiling: item.ceiling ?? undefined, employeeSide: item.employeeSide },
      });
    } else {
      await prisma.socialContribution.create({
        data: { type: item.type, rate: item.rate, ceiling: item.ceiling ?? undefined, employeeSide: item.employeeSide, year: item.year, countryId: item.countryId },
      });
    }
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await prisma.socialContribution.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
