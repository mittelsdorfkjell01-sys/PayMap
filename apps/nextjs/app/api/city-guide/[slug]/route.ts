import { NextRequest, NextResponse } from 'next/server';
import { getCityGuide } from '@/lib/city-guide';

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const data = await getCityGuide(params.slug);
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}
