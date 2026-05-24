import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const cities = await prisma.city.findMany({
    where: { isActive: true },
    select: {
      slug: true,
      nameDE: true,
      nameEN: true,
      flag: true,
      _count: { select: { movingGuides: { where: { isActive: true } } } },
    },
    orderBy: { sortOrder: 'asc' },
  });

  return NextResponse.json({
    cities: cities.map((c) => ({
      slug: c.slug,
      nameDE: c.nameDE ?? c.slug,
      nameEN: c.nameEN ?? c.slug,
      flag: c.flag,
      guideCount: c._count.movingGuides,
    })),
  });
}
