import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const countrySlug = req.nextUrl.searchParams.get('country') ?? 'de';
  const year = parseInt(req.nextUrl.searchParams.get('year') ?? String(new Date().getFullYear()));

  const brackets = await prisma.taxBracket.findMany({
    where: { country: { slug: countrySlug }, year },
    orderBy: { fromAmount: 'asc' },
  });
  return NextResponse.json(brackets);
}

const BracketSchema = z.object({
  id: z.string().optional(),
  fromAmount: z.number(),
  toAmount: z.number().nullable().optional(),
  rate: z.number().min(0).max(1),
  year: z.number().int(),
  employmentType: z.string(),
  countryId: z.string(),
});

export async function PUT(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = z.array(BracketSchema).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  for (const b of parsed.data) {
    if (b.id) {
      await prisma.taxBracket.update({ where: { id: b.id }, data: { fromAmount: b.fromAmount, toAmount: b.toAmount ?? undefined, rate: b.rate } });
    } else {
      await prisma.taxBracket.create({ data: { fromAmount: b.fromAmount, toAmount: b.toAmount ?? undefined, rate: b.rate, year: b.year, employmentType: b.employmentType, countryId: b.countryId } });
    }
  }

  return NextResponse.json({ ok: true });
}
