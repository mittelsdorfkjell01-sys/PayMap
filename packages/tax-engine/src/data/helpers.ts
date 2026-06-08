import { TaxData, BracketRow, SurchargeRow, FixedAmountRow } from '../types';

/**
 * Accessors for the data-driven tax tables. Country modules use these to read
 * thresholds / rates / amounts from `TaxData` instead of hardcoding them.
 */

export interface ResolvedBracket {
  from: number;
  to: number; // Infinity when the row had `to: null`
  rate: number;
}

/**
 * Returns the progressive scale for a given employment/regime key, optionally
 * filtered by filing status and region. Rows are sorted ascending by `from`
 * and `to: null` is resolved to Infinity so callers can treat them uniformly.
 *
 * Filing-status handling: if rows tagged with the requested status exist they
 * are used; otherwise status-agnostic rows (filingStatus null/undefined) are
 * returned. Region handling works the same way.
 */
export function bracketsFor(
  data: TaxData,
  employmentType: string = 'employed',
  opts?: { filingStatus?: string | null; regionId?: string | null },
): ResolvedBracket[] {
  const wantStatus = opts?.filingStatus ?? null;
  const wantRegion = opts?.regionId ?? null;

  let rows = data.brackets.filter(
    (b) => (b.employmentType ?? 'employed') === employmentType,
  );

  // Region: prefer region-specific rows when requested and present.
  if (wantRegion) {
    const regional = rows.filter((b) => (b.regionId ?? null) === wantRegion);
    if (regional.length > 0) rows = regional;
    else rows = rows.filter((b) => (b.regionId ?? null) === null);
  } else {
    rows = rows.filter((b) => (b.regionId ?? null) === null);
  }

  // Filing status: prefer status-specific rows when present.
  if (wantStatus) {
    const statusRows = rows.filter((b) => (b.filingStatus ?? null) === wantStatus);
    if (statusRows.length > 0) rows = statusRows;
    else rows = rows.filter((b) => (b.filingStatus ?? null) === null);
  } else {
    const agnostic = rows.filter((b) => (b.filingStatus ?? null) === null);
    if (agnostic.length > 0) rows = agnostic;
  }

  return rows
    .map((b: BracketRow) => ({ from: b.from, to: b.to ?? Infinity, rate: b.rate }))
    .sort((a, b) => a.from - b.from);
}

/** Standard marginal progressive tax over resolved brackets. */
export function progressiveTax(taxable: number, brackets: ResolvedBracket[]): number {
  let tax = 0;
  for (const b of brackets) {
    if (taxable <= b.from) break;
    tax += (Math.min(taxable, b.to) - b.from) * b.rate;
  }
  return tax;
}

/** Marginal rate at a given taxable income over resolved brackets. */
export function marginalRateOf(taxable: number, brackets: ResolvedBracket[]): number {
  for (let i = brackets.length - 1; i >= 0; i--) {
    if (taxable > brackets[i].from) return brackets[i].rate;
  }
  return 0;
}

export function socialRate(data: TaxData, type: string): number {
  return data.social.find((s) => s.type === type)?.rate ?? 0;
}

export function socialCeiling(data: TaxData, type: string): number | null {
  const row = data.social.find((s) => s.type === type);
  return row ? row.ceiling : null;
}

/** Social contribution = rate × min(gross, ceiling). Missing type → 0. */
export function socialAmount(data: TaxData, type: string, gross: number): number {
  const row = data.social.find((s) => s.type === type);
  if (!row) return 0;
  const base = row.ceiling != null ? Math.min(gross, row.ceiling) : gross;
  return base * row.rate;
}

export function deductionAmount(data: TaxData, type: string): number {
  return data.deductions.find((d) => d.type === type)?.amount ?? 0;
}

export function deductionPercentage(data: TaxData, type: string): number {
  return data.deductions.find((d) => d.type === type)?.percentage ?? 0;
}

export function fixedAmount(
  data: TaxData,
  type: string,
  opts?: { regionId?: string | null; period?: 'monthly' | 'yearly' },
): FixedAmountRow | undefined {
  const wantRegion = opts?.regionId ?? null;
  return data.fixedAmounts.find(
    (f) =>
      f.type === type &&
      (wantRegion ? (f.regionId ?? null) === wantRegion : true),
  );
}

/** Yearly value of a fixed amount (monthly amounts ×12). 0 when absent. */
export function fixedAmountYearly(
  data: TaxData,
  type: string,
  regionId?: string | null,
): number {
  const row = fixedAmount(data, type, { regionId });
  if (!row) return 0;
  return row.period === 'monthly' ? row.amount * 12 : row.amount;
}

export function surchargesFor(
  data: TaxData,
  type: string,
  opts?: { regionId?: string | null; cityScope?: string | null },
): SurchargeRow[] {
  return data.surcharges.filter((s) => {
    if (s.type !== type) return false;
    if (opts?.regionId !== undefined && (s.regionId ?? null) !== (opts.regionId ?? null)) return false;
    if (opts?.cityScope !== undefined && (s.cityScope ?? null) !== (opts.cityScope ?? null)) return false;
    return true;
  });
}
