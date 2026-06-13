// ─── Eligibility engine ──────────────────────────────────────────────────────
// A small, data-driven rule evaluator for special-regime eligibility. The rules
// themselves live in the database (SpecialRegime.eligibilityCriteria, a JSON
// array), so they stay editable without code changes. Three rule kinds:
//
//   • derived  — checked automatically against the calculator inputs the user
//                already provided (employment, gross salary, children, moveYear).
//   • attested — a yes/no the user must confirm (e.g. "recruited from abroad").
//                Unknown until answered → drives the `needs_input` verdict.
//   • advisory — a non-blocking note (e.g. "treaty situation, seek advice"); it
//                never fails, but its presence downgrades a clean pass to
//                `likely` rather than `eligible`.

export type EligibilityField = 'employment' | 'grossAnnualEUR' | 'children' | 'moveYear';
export type EligibilityOp = 'eq' | 'neq' | 'gte' | 'lte' | 'in';

export type EligibilityRule =
  | {
      kind: 'derived';
      field: EligibilityField;
      op: EligibilityOp;
      value: number | string | Array<number | string>;
      labelDE: string;
      labelEN: string;
    }
  | { kind: 'attested'; id: string; labelDE: string; labelEN: string; mustBe: boolean }
  | { kind: 'advisory'; labelDE: string; labelEN: string };

export type Verdict = 'eligible' | 'likely' | 'not_eligible' | 'needs_input';

export type RuleStatus = 'pass' | 'fail' | 'unknown' | 'advisory';

export interface EligibilityInputs {
  employment?: string;
  grossAnnualEUR?: number;
  children?: number;
  moveYear?: number;
}

export interface EvaluatedRule {
  rule: EligibilityRule;
  status: RuleStatus;
}

export interface EligibilityResult {
  verdict: Verdict;
  rules: EvaluatedRule[];
}

function compare(
  actual: number | string,
  op: EligibilityOp,
  value: number | string | Array<number | string>,
): boolean {
  switch (op) {
    case 'eq':
      return actual === value;
    case 'neq':
      return actual !== value;
    case 'gte':
      return typeof actual === 'number' && typeof value === 'number' && actual >= value;
    case 'lte':
      return typeof actual === 'number' && typeof value === 'number' && actual <= value;
    case 'in':
      return Array.isArray(value) && (value as Array<number | string>).includes(actual);
    default:
      return false;
  }
}

function evaluateDerived(
  rule: Extract<EligibilityRule, { kind: 'derived' }>,
  inputs: EligibilityInputs,
): RuleStatus {
  const actual = inputs[rule.field];
  // No value supplied for this input → cannot judge yet.
  if (actual === undefined || actual === null) return 'unknown';
  return compare(actual, rule.op, rule.value) ? 'pass' : 'fail';
}

function evaluateAttested(
  rule: Extract<EligibilityRule, { kind: 'attested' }>,
  attestations: Record<string, boolean> | undefined,
): RuleStatus {
  const answer = attestations?.[rule.id];
  if (answer === undefined) return 'unknown';
  return answer === rule.mustBe ? 'pass' : 'fail';
}

/**
 * Evaluate a regime's eligibility rules against the user's inputs and any
 * attested answers. Verdict precedence:
 *   1. any rule fails              → not_eligible
 *   2. any attested rule unanswered → needs_input
 *   3. all satisfied, advisory present → likely
 *   4. otherwise                   → eligible
 */
export function evaluateEligibility(
  rules: EligibilityRule[],
  inputs: EligibilityInputs,
  attestations?: Record<string, boolean>,
): EligibilityResult {
  const evaluated: EvaluatedRule[] = rules.map((rule) => {
    if (rule.kind === 'advisory') return { rule, status: 'advisory' as const };
    if (rule.kind === 'attested') return { rule, status: evaluateAttested(rule, attestations) };
    return { rule, status: evaluateDerived(rule, inputs) };
  });

  const anyFail = evaluated.some((e) => e.status === 'fail');
  const openAttested = evaluated.some((e) => e.rule.kind === 'attested' && e.status === 'unknown');
  const anyAdvisory = evaluated.some((e) => e.status === 'advisory');

  let verdict: Verdict;
  if (anyFail) verdict = 'not_eligible';
  else if (openAttested) verdict = 'needs_input';
  else if (anyAdvisory) verdict = 'likely';
  else verdict = 'eligible';

  return { verdict, rules: evaluated };
}
