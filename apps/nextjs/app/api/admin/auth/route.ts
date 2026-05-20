import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { getSessionToken } from '@/lib/admin-auth';

const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= MAX_ATTEMPTS) return true;
  entry.count++;
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  const adminPw = process.env.ADMIN_PASSWORD;
  if (!adminPw) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

  let password: string;
  try {
    const body = await req.json() as { password?: unknown };
    password = typeof body.password === 'string' ? body.password : '';
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Constant-time comparison: pad to same length so timingSafeEqual works,
  // then additionally check lengths match to prevent accepting padded strings.
  const padLen = Math.max(password.length, adminPw.length);
  const a = Buffer.from(password.padEnd(padLen, '\0'));
  const b = Buffer.from(adminPw.padEnd(padLen, '\0'));
  const match = timingSafeEqual(a, b) && password.length === adminPw.length;

  if (!match) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const store = await cookies();
  store.set('admin_session', getSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const store = await cookies();
  store.delete('admin_session');
  return NextResponse.json({ ok: true });
}
