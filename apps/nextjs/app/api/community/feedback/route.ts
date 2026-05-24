import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { citySlug, category, description, userEmail } = body as {
    citySlug?: string;
    category: string;
    description: string;
    userEmail?: string;
  };

  if (!category || !description?.trim()) {
    return NextResponse.json({ error: 'category and description required' }, { status: 400 });
  }

  let cityId: string | undefined;
  if (citySlug) {
    const city = await prisma.city.findUnique({ where: { slug: citySlug }, select: { id: true } });
    cityId = city?.id;
  }

  await prisma.userFeedback.create({
    data: {
      cityId: cityId ?? null,
      category,
      description: description.trim(),
      userEmail: userEmail?.trim() || null,
      status: 'new',
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
