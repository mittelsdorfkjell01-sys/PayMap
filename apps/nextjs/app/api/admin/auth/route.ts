import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { getSessionToken } from '@/lib/admin-auth';
import { checkAuthRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  // 5 attempts / 15 min, enforced via the shared persistent store (serverless-safe).
  const limited = await checkAuthRateLimit(req);
  if (limited) return limited;

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
    sameSite: 'strict',
    maxAge: 60 * 60 * 8,
    path: '/',
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const store = await cookies();
  store.delete('admin_session');
  return NextResponse.json({ ok: true });
}
