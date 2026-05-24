import { NextRequest, NextResponse } from 'next/server';
import { searchCities } from '@/lib/city-lookup';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const limited = checkRateLimit(req);
  if (limited) return limited;

  try {
    const q = req.nextUrl.searchParams.get('q') ?? '';
    if (q.length < 1) return NextResponse.json([]);
    const cities = await searchCities(q, 8);
    return NextResponse.json(cities);
  } catch (err) {
    console.error('[cities/search]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
