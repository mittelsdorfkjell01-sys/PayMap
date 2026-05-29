import { NextRequest, NextResponse } from 'next/server';
import { findCity } from '@/lib/city-lookup';
import { getSuggestedCities } from '@/lib/city-suggestions';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const limited = await checkRateLimit(req);
  if (limited) return limited;

  try {
    const fromSlug = req.nextUrl.searchParams.get('from') ?? '';
    if (!fromSlug) {
      return NextResponse.json({ error: 'from param required' }, { status: 400 });
    }

    const fromCity = await findCity(fromSlug);
    if (!fromCity) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
    }

    const suggestions = await getSuggestedCities(fromCity.id, 6);
    return NextResponse.json(suggestions);
  } catch (err) {
    console.error('[cities/suggestions]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
