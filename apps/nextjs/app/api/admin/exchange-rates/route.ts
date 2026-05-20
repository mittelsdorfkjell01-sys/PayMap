import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/admin-auth';

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const rates = await prisma.exchangeRate.findMany({ orderBy: [{ fromCurrency: 'asc' }, { toCurrency: 'asc' }] });
  return NextResponse.json(rates);
}

const RateSchema = z.object({
  id: z.string().optional(),
  fromCurrency: z.string().length(3),
  toCurrency: z.string().length(3),
  rate: z.number().positive(),
});

export async function PUT(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const parsed = z.array(RateSchema).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const now = new Date();
  for (const r of parsed.data) {
    await prisma.exchangeRate.upsert({
      where: { fromCurrency_toCurrency: { fromCurrency: r.fromCurrency, toCurrency: r.toCurrency } },
      update: { rate: r.rate, updatedAt: now },
      create: { fromCurrency: r.fromCurrency, toCurrency: r.toCurrency, rate: r.rate, updatedAt: now },
    });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await prisma.exchangeRate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
