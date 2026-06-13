-- Machine-evaluable eligibility rules + salary-effect classification for SpecialRegime.
-- `eligibilityCriteria` holds an array of EligibilityRule (derived/attested/advisory),
-- consumed by the tax-engine evaluateEligibility(). `regimeEffect` records how the
-- regime interacts with salary net; the API only computes a regime net for
-- 'replaces_income_tax' / 'reduces_taxable_base'. Both nullable until backfilled
-- (see prisma/backfill-eligibility.ts).
ALTER TABLE "SpecialRegime" ADD COLUMN "eligibilityCriteria" JSONB;
ALTER TABLE "SpecialRegime" ADD COLUMN "regimeEffect" TEXT;
