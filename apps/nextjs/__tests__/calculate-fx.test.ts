import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// WP-6b — the calculator input is in EUR, but tax brackets in the engine are
// denominated in each country's LOCAL currency. These tests prove the route
// converts the EUR input into the target currency before taxing (rate: 1 EUR =
// 39 THB), and refuses to emit a silent wrong value when a rate is missing.

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(async () => null),
}));

vi.mock('@/lib/feature-flags', () => ({
  flags: { enableSearchTracking: false, enableAnonymousCalculationSave: false },
}));

const findCityMock = vi.fn();
vi.mock('@/lib/city-lookup', () => ({
  findCity: (q: string) => findCityMock(q),
}));

// Only EUR↔THB is known. AED is intentionally absent to exercise the
// missing-rate path. exchange-rates.ts imports the same prisma module.
const RATE_ROWS = [{ fromCurrency: 'EUR', toCurrency: 'THB', rate: 39, updatedAt: new Date() }];
vi.mock('@/lib/prisma', () => ({
  prisma: {
    exchangeRate: { findMany: vi.fn(async () => RATE_ROWS) },
    specialRegime: { findFirst: vi.fn(async () => null) },
    calculation: { create: vi.fn(async () => ({})) },
    citySearch: { create: vi.fn(async () => ({})) },
    citySearchAggregate: { upsert: vi.fn(async () => ({})) },
  },
}));

// Imported after mocks are registered (vi.mock is hoisted).
import { POST } from '@/app/api/calculate/route';

const BERLIN = {
  id: 'c_berlin', slug: 'berlin', nameDE: 'Berlin', nameEN: 'Berlin',
  flag: '🇩🇪', currency: 'EUR', countrySlug: 'de', lifestyle: {},
};
const BANGKOK = {
  id: 'c_bkk', slug: 'bangkok', nameDE: 'Bangkok', nameEN: 'Bangkok',
  flag: '🇹🇭', currency: 'THB', countrySlug: 'th', lifestyle: {},
};
const DUBAI = {
  id: 'c_dxb', slug: 'dubai', nameDE: 'Dubai', nameEN: 'Dubai',
  flag: '🇦🇪', currency: 'AED', countrySlug: 'uae', lifestyle: {},
};

function makeReq(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/calculate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/calculate — FX conversion', () => {
  beforeEach(() => {
    findCityMock.mockReset();
  });

  it('converts the EUR salary into the target currency before taxing', async () => {
    findCityMock.mockImplementation((q: string) =>
      q === 'Berlin' ? BERLIN : q === 'Bangkok' ? BANGKOK : null,
    );

    const res = await POST(makeReq({ fromCity: 'Berlin', toCity: 'Bangkok', grossSalary: 60_000 }));
    expect(res.status).toBe(200);
    const body = await res.json();

    // from side is EUR → identity conversion
    expect(body.fromCity.currency).toBe('EUR');
    expect(body.from.gross).toBe(60_000);

    // to side is taxed on 60.000 € × 39 = 2.340.000 THB, NOT on 60.000 THB
    expect(body.toCity.currency).toBe('THB');
    expect(body.to.gross).toBe(2_340_000);

    // Thai net on a ~2.34M THB salary must be far above what 60k THB would yield.
    expect(body.to.netMonthly).toBeGreaterThan(100_000); // THB/month, plausible
  });

  it('returns a clear 503 (no silent wrong value) when a rate is missing', async () => {
    findCityMock.mockImplementation((q: string) =>
      q === 'Berlin' ? BERLIN : q === 'Dubai' ? DUBAI : null,
    );

    const res = await POST(makeReq({ fromCity: 'Berlin', toCity: 'Dubai', grossSalary: 60_000 }));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.code).toBe('FX_RATE_UNAVAILABLE');
    expect(body.error).toContain('AED');
  });
});
