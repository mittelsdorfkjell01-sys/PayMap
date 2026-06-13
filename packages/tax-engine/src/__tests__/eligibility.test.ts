import { describe, it, expect } from 'vitest';
import { evaluateEligibility, type EligibilityRule } from '../eligibility';

// These tests exercise the pure rule evaluator with representative rule sets
// shaped like the real backfill entries (PT IFICI, NL ruling, SG NOR). The
// authoritative rules live in the DB (SpecialRegime.eligibilityCriteria); here
// we only assert the verdict logic, not the legal content.

// ─── PT IFICI+ — eligible / not_eligible / needs_input ────────────────────────
const ptRules: EligibilityRule[] = [
  {
    kind: 'derived',
    field: 'employment',
    op: 'in',
    value: ['employed', 'freelancer', 'founder'],
    labelDE: 'Qualifizierte Tätigkeit',
    labelEN: 'Qualifying activity',
  },
  {
    kind: 'attested',
    id: 'notResidentLast5Years',
    mustBe: true,
    labelDE: 'In den letzten 5 Jahren nicht in PT ansässig',
    labelEN: 'Not PT-resident in the last 5 years',
  },
];

describe('evaluateEligibility — PT IFICI+', () => {
  it('eligible: derived pass + attested confirmed true, no advisory', () => {
    const res = evaluateEligibility(ptRules, { employment: 'employed' }, { notResidentLast5Years: true });
    expect(res.verdict).toBe('eligible');
    expect(res.rules.every((r) => r.status === 'pass')).toBe(true);
  });

  it('needs_input: attested left unanswered', () => {
    const res = evaluateEligibility(ptRules, { employment: 'employed' });
    expect(res.verdict).toBe('needs_input');
    expect(res.rules.find((r) => r.rule.kind === 'attested')?.status).toBe('unknown');
  });

  it('not_eligible: attested answered against requirement', () => {
    const res = evaluateEligibility(ptRules, { employment: 'employed' }, { notResidentLast5Years: false });
    expect(res.verdict).toBe('not_eligible');
  });

  it('not_eligible: derived requirement fails (passive income only)', () => {
    const res = evaluateEligibility(ptRules, { employment: 'passive' }, { notResidentLast5Years: true });
    expect(res.verdict).toBe('not_eligible');
  });
});

// ─── NL Expat-Ruling — salary threshold (Gehaltsschwelle) ─────────────────────
const nlRules: EligibilityRule[] = [
  {
    kind: 'derived',
    field: 'grossAnnualEUR',
    op: 'gte',
    value: 48013,
    labelDE: 'Steuerpflichtiges Mindestgehalt 48.013 € (2026)',
    labelEN: 'Minimum taxable salary €48,013 (2026)',
  },
  {
    kind: 'attested',
    id: 'recruitedFromAbroad',
    mustBe: true,
    labelDE: 'Aus dem Ausland angeworben',
    labelEN: 'Recruited from abroad',
  },
];

describe('evaluateEligibility — NL Gehaltsschwelle', () => {
  it('below threshold → not_eligible regardless of attestation', () => {
    const res = evaluateEligibility(nlRules, { grossAnnualEUR: 40000 }, { recruitedFromAbroad: true });
    expect(res.verdict).toBe('not_eligible');
  });

  it('above threshold + attested → eligible', () => {
    const res = evaluateEligibility(nlRules, { grossAnnualEUR: 80000 }, { recruitedFromAbroad: true });
    expect(res.verdict).toBe('eligible');
  });

  it('above threshold but attestation open → needs_input', () => {
    const res = evaluateEligibility(nlRules, { grossAnnualEUR: 80000 });
    expect(res.verdict).toBe('needs_input');
  });
});

// ─── SG NOR — discontinued scheme, legacy move only ───────────────────────────
// The Not Ordinarily Resident scheme was abolished (last YA 2020); a 2026 move
// can no longer qualify.
const sgRules: EligibilityRule[] = [
  {
    kind: 'derived',
    field: 'moveYear',
    op: 'lte',
    value: 2020,
    labelDE: 'Zuzug spätestens 2020 (NOR ausgelaufen)',
    labelEN: 'Moved by 2020 at the latest (NOR discontinued)',
  },
];

describe('evaluateEligibility — SG NOR Altfall', () => {
  it('recent move (2026) → not_eligible', () => {
    const res = evaluateEligibility(sgRules, { moveYear: 2026 });
    expect(res.verdict).toBe('not_eligible');
  });

  it('legacy move (2019) → eligible', () => {
    const res = evaluateEligibility(sgRules, { moveYear: 2019 });
    expect(res.verdict).toBe('eligible');
  });
});

// ─── Advisory downgrades a clean pass to "likely" ─────────────────────────────
describe('evaluateEligibility — advisory handling', () => {
  it('all pass + advisory present → likely (not eligible)', () => {
    const rules: EligibilityRule[] = [
      { kind: 'derived', field: 'employment', op: 'eq', value: 'employed', labelDE: '', labelEN: '' },
      { kind: 'advisory', labelDE: 'DBA-Lage prüfen', labelEN: 'Check treaty situation' },
    ];
    const res = evaluateEligibility(rules, { employment: 'employed' });
    expect(res.verdict).toBe('likely');
  });

  it('advisory does not prevent not_eligible when a rule fails', () => {
    const rules: EligibilityRule[] = [
      { kind: 'derived', field: 'employment', op: 'eq', value: 'employed', labelDE: '', labelEN: '' },
      { kind: 'advisory', labelDE: 'Hinweis', labelEN: 'Note' },
    ];
    const res = evaluateEligibility(rules, { employment: 'passive' });
    expect(res.verdict).toBe('not_eligible');
  });
});
