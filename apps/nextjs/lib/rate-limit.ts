import { NextRequest, NextResponse } from 'next/server';

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const store = new Map<string, Bucket>();

const RATE = 60;       // requests
const WINDOW = 60_000; // ms

function getIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

export function checkRateLimit(req: NextRequest): NextResponse | null {
  const key = getIp(req);
  const now = Date.now();

  let bucket = store.get(key);
  if (!bucket || now - bucket.lastRefill >= WINDOW) {
    bucket = { tokens: RATE - 1, lastRefill: now };
    store.set(key, bucket);
    return null;
  }

  if (bucket.tokens <= 0) {
    const retryAfter = Math.ceil((WINDOW - (now - bucket.lastRefill)) / 1000);
    return NextResponse.json(
      { error: 'Too Many Requests' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  bucket.tokens--;
  return null;
}
