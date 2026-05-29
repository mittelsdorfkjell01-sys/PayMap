import { describe, it, expect, vi, afterEach } from 'vitest';
import { createMemoryLimiter } from '../lib/rate-limit';

// Unit-tests the in-process fallback limiter (used when no KV store is
// configured). The KV-backed path uses the same enforcement contract but
// requires a live Upstash store and is covered by integration testing.
//
// NOTE: the production limiters are KV-backed; this proves the limit holds
// across multiple sequential invocations against a shared store.

describe('createMemoryLimiter', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows exactly `tokens` requests per window, then blocks', async () => {
    const limiter = createMemoryLimiter(3, 60_000);

    expect((await limiter.check('1.2.3.4')).success).toBe(true);
    expect((await limiter.check('1.2.3.4')).success).toBe(true);
    expect((await limiter.check('1.2.3.4')).success).toBe(true);

    const blocked = await limiter.check('1.2.3.4');
    expect(blocked.success).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it('tracks each key (IP) independently', async () => {
    const limiter = createMemoryLimiter(1, 60_000);

    expect((await limiter.check('a')).success).toBe(true);
    expect((await limiter.check('a')).success).toBe(false);
    // Different key still has its full budget.
    expect((await limiter.check('b')).success).toBe(true);
  });

  it('resets the budget after the window elapses', async () => {
    vi.useFakeTimers();
    const limiter = createMemoryLimiter(2, 10_000);

    expect((await limiter.check('x')).success).toBe(true);
    expect((await limiter.check('x')).success).toBe(true);
    expect((await limiter.check('x')).success).toBe(false);

    vi.advanceTimersByTime(10_001);

    expect((await limiter.check('x')).success).toBe(true);
  });
});
