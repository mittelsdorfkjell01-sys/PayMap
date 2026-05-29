import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit, type Duration } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Serverless-safe rate limiting.
//
// In production the limit is enforced across ALL serverless invocations via a
// shared sliding window in the Vercel KV / Upstash Redis store. Without the
// KV credentials (local dev, CI, tests) we transparently fall back to a
// per-process in-memory limiter so the app keeps working.
//
// Env (injected by Vercel when a KV store is linked):
//   KV_REST_API_URL, KV_REST_API_TOKEN

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const hasKV = Boolean(KV_URL && KV_TOKEN);

interface LimitResult {
  success: boolean;
  retryAfter: number; // seconds
}

interface Limiter {
  check(key: string): Promise<LimitResult>;
}

/**
 * Per-process fixed-window limiter. Used as the local/test fallback when no
 * KV store is configured. Exported so the enforcement logic can be unit-tested
 * without a network round-trip.
 */
export function createMemoryLimiter(tokens: number, windowMs: number): Limiter {
  const store = new Map<string, { count: number; resetAt: number }>();
  return {
    async check(key: string): Promise<LimitResult> {
      const now = Date.now();
      const entry = store.get(key);
      if (!entry || now >= entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return { success: true, retryAfter: 0 };
      }
      if (entry.count >= tokens) {
        return { success: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
      }
      entry.count++;
      return { success: true, retryAfter: 0 };
    },
  };
}

function createKvLimiter(tokens: number, window: Duration, prefix: string): Limiter {
  const redis = new Redis({ url: KV_URL!, token: KV_TOKEN! });
  const rl = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, window),
    prefix,
    analytics: false,
  });
  return {
    async check(key: string): Promise<LimitResult> {
      const { success, reset } = await rl.limit(key);
      return {
        success,
        retryAfter: success ? 0 : Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
      };
    },
  };
}

// Public read endpoints: 60 requests / minute.
const publicLimiter: Limiter = hasKV
  ? createKvLimiter(60, '60 s', 'rl:public')
  : createMemoryLimiter(60, 60_000);

// Auth (admin login): 5 attempts / 15 minutes.
const authLimiter: Limiter = hasKV
  ? createKvLimiter(5, '15 m', 'rl:auth')
  : createMemoryLimiter(5, 15 * 60_000);

function getIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

function toResponse(result: LimitResult): NextResponse | null {
  if (result.success) return null;
  return NextResponse.json(
    { error: 'Too Many Requests' },
    { status: 429, headers: { 'Retry-After': String(result.retryAfter) } },
  );
}

/** Public endpoint rate limit (60/min). Returns a 429 response when exceeded, else null. */
export async function checkRateLimit(req: NextRequest): Promise<NextResponse | null> {
  return toResponse(await publicLimiter.check(getIp(req)));
}

/** Auth endpoint rate limit (5 / 15 min). Returns a 429 response when exceeded, else null. */
export async function checkAuthRateLimit(req: NextRequest): Promise<NextResponse | null> {
  return toResponse(await authLimiter.check(getIp(req)));
}
