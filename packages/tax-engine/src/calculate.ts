import { TaxOptions, TaxResult, ApproximateResult, TaxBreakdownLine, SocialContributions, TaxData } from './types';
import { getCountryModule } from './registry';
import { calculateSoli, calculateChurchTax } from './countries/de';
import { getDefaultTaxData } from './data/countries';

const r = (x: number) => Math.round(x * 100) / 100;
// Rates need finer granularity than money: 2-decimal rounding collapses the
// effective rate to whole percents (0.3705 → 0.37 → "37.0 %"). Keep 4 decimals
// so the UI can show one decimal place.
const rate = (x: number) => Math.round(x * 10000) / 10000;

function buildBreakdown(
  incomeTax: number,
  soli: number,
  churchTax: number,
  social: SocialContributions,
  deductions: number,
): TaxBreakdownLine[] {
  const lines: TaxBreakdownLine[] = [];

  if (deductions > 0) {
    lines.push({
      label: 'Werbungskosten / Abzüge',
      labelEN: 'Deductions',
      amount: deductions,
      isDeduction: true,
      category: 'deduction',
    });
  }

  if (incomeTax > 0) {
    lines.push({
      label: 'Einkommensteuer',
      labelEN: 'Income Tax',
      amount: incomeTax,
      isDeduction: true,
      category: 'income_tax',
    });
  }

  if (soli > 0) {
    lines.push({
      label: 'Solidaritätszuschlag',
      labelEN: 'Solidarity Surcharge',
      amount: soli,
      isDeduction: true,
      category: 'surcharge',
    });
  }

  if (churchTax > 0) {
    lines.push({
      label: 'Kirchensteuer',
      labelEN: 'Church Tax',
      amount: churchTax,
      isDeduction: true,
      category: 'church_tax',
    });
  }

  if (social.pension > 0) {
    lines.push({
      label: 'Rentenversicherung',
      labelEN: 'Pension Insurance',
      amount: social.pension,
      isDeduction: true,
      category: 'social_pension',
    });
  }

  if (social.health > 0) {
    lines.push({
      label: 'Krankenversicherung',
      labelEN: 'Health Insurance',
      amount: social.health,
      isDeduction: true,
      category: 'social_health',
    });
  }

  if (social.unemployment > 0) {
    lines.push({
      label: 'Arbeitslosenversicherung',
      labelEN: 'Unemployment Insurance',
      amount: social.unemployment,
      isDeduction: true,
      category: 'social_unemployment',
    });
  }

  if (social.care > 0) {
    lines.push({
      label: 'Pflegeversicherung',
      labelEN: 'Care Insurance',
      amount: social.care,
      isDeduction: true,
      category: 'social_care',
    });
  }

  return lines;
}

export function calculate(countryCode: string, opts: TaxOptions, taxData?: TaxData): TaxResult {
  const module = getCountryModule(countryCode);
  // Values come from the DB-loaded taxData; fall back to the canonical seed
  // dataset (used by unit tests and when no DB data was supplied).
  const data = taxData ?? getDefaultTaxData(countryCode, opts.year);

  const deductions = r(module.getDeductions(opts.gross, opts, data));
  const taxableIncome = r(Math.max(0, opts.gross - deductions));

  let incomeTax: number;
  if (opts.specialRegimeId) {
    incomeTax = r(module.applySpecialRegime(opts.gross, opts.specialRegimeId, opts, data));
  } else {
    incomeTax = r(module.calculateIncomeTax(taxableIncome, opts, data));
  }

  const social = module.getSocialContributions(opts.gross, opts, data);

  // Soli + Kirchensteuer nur für DE
  const soli = countryCode === 'de' ? calculateSoli(incomeTax, opts, data) : 0;
  const churchTax = countryCode === 'de' ? calculateChurchTax(incomeTax, opts, data) : 0;

  const totalDeductions = r(incomeTax + soli + churchTax + social.total);
  const netAnnual = r(Math.max(0, opts.gross - totalDeductions));
  const netMonthly = r(netAnnual / 12);
  const effectiveRate = opts.gross > 0 ? rate(totalDeductions / opts.gross) : 0;

  // Marginalrate: Steuer auf taxableIncome+1 minus aktuelle Steuer
  const taxOnePlus = r(module.calculateIncomeTax(taxableIncome + 1, opts, data));
  const marginalRate = r(taxOnePlus - incomeTax);

  const breakdown = buildBreakdown(incomeTax, soli, churchTax, social, deductions);

  return {
    gross: opts.gross,
    currency: opts.currency,
    deductions,
    taxableIncome,
    incomeTax,
    socialContributions: social,
    soli: soli > 0 ? soli : undefined,
    churchTax: churchTax > 0 ? churchTax : undefined,
    totalDeductions,
    netAnnual,
    netMonthly,
    effectiveRate,
    marginalRate,
    specialRegimeApplied: opts.specialRegimeId,
    breakdown,
    disclaimer: module.getDisclaimer('de'),
  };
}

/**
 * Variance table per country complexity:
 * simple (UAE, RO, HU): 0.15
 * medium (PT, ES, NL): 0.20
 * complex (DE, FR, IT, CH, AT, US): 0.25
 * others: 0.20
 */
const VARIANCE_MAP: Record<string, number> = {
  uae: 0.15,
  ro: 0.15,
  hu: 0.15,
  th: 0.15,
  pt: 0.20,
  es: 0.20,
  nl: 0.20,
  ee: 0.20,
  pl: 0.20,
  cz: 0.20,
  de: 0.25,
  fr: 0.25,
  it: 0.25,
  ch: 0.25,
  at: 0.25,
  us: 0.25,
  ie: 0.20,
  gb: 0.20,
  mt: 0.15,
  ge: 0.15,
  sg: 0.15,
  id: 0.20,
  co: 0.25,
  mx: 0.25,
  ar: 0.35,
  za: 0.20,
};

export function calculateApproximate(
  countryCode: string,
  gross: number,
  currency: string,
  year: number,
  locale: string = 'de',
  taxData?: TaxData,
  region?: string,
  cityScope?: string,
): ApproximateResult {
  const opts: TaxOptions = {
    gross,
    currency,
    employment: 'employed',
    familyStatus: 'single',
    children: 0,
    kvType: 'statutory',
    year,
    region,
    cityScope,
  };

  const base = calculate(countryCode, opts, taxData);
  const variance = VARIANCE_MAP[countryCode.toLowerCase()] ?? 0.20;

  const netMonthlyMin = r(base.netMonthly * (1 - variance));
  const netMonthlyMax = r(base.netMonthly * (1 + variance));

  const isEN = locale === 'en';
  const assumptions: string[] = isEN
    ? ['Single', 'Employed', 'No children']
    : ['Ledig', 'Angestellt', 'Keine Kinder'];

  if (countryCode.toLowerCase() === 'de') {
    assumptions.push(isEN ? 'Statutory health insurance (GKV)' : 'Gesetzlich KV (GKV)');
  }

  return {
    ...base,
    netMonthlyMin,
    netMonthlyMax,
    assumptions,
  };
}
