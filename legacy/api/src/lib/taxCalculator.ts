interface Bracket {
  upTo: number | null;
  type: "zero" | "formula" | "linear";
  a?: number;
  b?: number;
  offset?: number;
  base?: number;
  rate?: number;
  deduct?: number;
}

interface SocialRule {
  slug: string;
  rate: number;
  cap: number;
}

export interface TaxBreakdownItem {
  slug: string;
  labelDe: string;
  labelEn: string;
  amount: number;
}

export interface TaxResult {
  netto: number;
  monthly: number;
  breakdown: TaxBreakdownItem[];
}

function calcIncomeTax(gross: number, brackets: Bracket[]): number {
  for (const b of brackets) {
    if (b.upTo === null || gross <= b.upTo) {
      if (b.type === "zero") return 0;
      if (b.type === "formula" && b.a !== undefined && b.b !== undefined && b.offset !== undefined) {
        const y = (gross - b.offset) / 10000;
        const tax = (b.a * y + b.b) * y + (b.base ?? 0);
        return Math.round(tax);
      }
      if (b.type === "linear" && b.rate !== undefined && b.deduct !== undefined) {
        return Math.round(gross * b.rate - b.deduct);
      }
    }
  }
  // No bracket matched — tax config is missing a catch-all (upTo: null) bracket
  throw new Error(`No tax bracket matched gross income ${gross}. Check HomeTaxConfig brackets.`);
}

export function calcHomeTax(
  gross: number,
  brackets: Bracket[],
  socialRules: SocialRule[]
): TaxResult {
  const incomeTax = calcIncomeTax(gross, brackets);

  const breakdown: TaxBreakdownItem[] = [
    {
      slug: "income_tax",
      labelDe: "Lohnsteuer",
      labelEn: "Income Tax",
      amount: incomeTax,
    },
  ];

  let totalSocial = 0;
  const socialLabels: Record<string, { de: string; en: string }> = {
    pension: { de: "Rentenversicherung", en: "Pension Insurance" },
    unemployment: { de: "Arbeitslosenversicherung", en: "Unemployment Insurance" },
    health: { de: "Krankenversicherung", en: "Health Insurance" },
    ltc: { de: "Pflegeversicherung", en: "Long-term Care Insurance" },
  };

  for (const rule of socialRules) {
    const taxable = Math.min(gross, rule.cap);
    const amount = Math.round(taxable * rule.rate);
    totalSocial += amount;
    const labels = socialLabels[rule.slug] ?? { de: rule.slug, en: rule.slug };
    breakdown.push({
      slug: rule.slug,
      labelDe: labels.de,
      labelEn: labels.en,
      amount,
    });
  }

  const totalDeductions = incomeTax + totalSocial;
  const netto = Math.max(0, gross - totalDeductions);

  return {
    netto: Math.round(netto),
    monthly: Math.round(netto / 12),
    breakdown,
  };
}

export function calcTargetTax(
  gross: number,
  incomeRate: number,
  socialRate: number,
  exemptFrac?: number | null,
  regimeLabelDe?: string,
  regimeLabelEn?: string
): TaxResult {
  const taxableIncome = exemptFrac ? gross * (1 - exemptFrac) : gross;
  const incomeTax = Math.round(taxableIncome * incomeRate);
  const socialTax = Math.round(gross * socialRate);

  const breakdown: TaxBreakdownItem[] = [
    {
      slug: "income_tax",
      labelDe: regimeLabelDe ?? "Einkommensteuer",
      labelEn: regimeLabelEn ?? "Income Tax",
      amount: incomeTax,
    },
    {
      slug: "social",
      labelDe: "Sozialabgaben",
      labelEn: "Social Contributions",
      amount: socialTax,
    },
  ];

  const netto = Math.max(0, gross - incomeTax - socialTax);

  return {
    netto: Math.round(netto),
    monthly: Math.round(netto / 12),
    breakdown,
  };
}
