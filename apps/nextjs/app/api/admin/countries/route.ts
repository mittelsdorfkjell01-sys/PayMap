import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/admin-auth';

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const countries = await prisma.country.findMany({ orderBy: { nameDE: 'asc' } });
  return NextResponse.json(countries);
}

const Schema = z.object({
  slug: z.string().min(2).max(10),
  nameDE: z.string().min(1),
  nameEN: z.string().min(1),
  currency: z.string().length(3),
  taxType: z.enum(['progressive', 'flat', 'zero']),
  sourceUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  try {
    const country = await prisma.country.create({ data: { ...parsed.data, updatedAt: new Date() } });
    return NextResponse.json(country, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
  }
}

const PatchSchema = Schema.partial().extend({ isActive: z.boolean().optional() });

export async function PATCH(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  const country = await prisma.country.update({ where: { id }, data: { ...parsed.data, updatedAt: new Date() } });
  return NextResponse.json(country);
}

export async function DELETE(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await prisma.country.update({ where: { id }, data: { isActive: false, updatedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
