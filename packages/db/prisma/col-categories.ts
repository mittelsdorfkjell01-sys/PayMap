/**
 * Canonical cost-of-living categories for `CostOfLivingItem.category`.
 *
 * The COL model is key-value (one row per city × category), so "fields" are
 * category strings, not table columns. This file is the single source of truth
 * shared by seeds and any consumer, so the naming stays consistent.
 *
 * Two value kinds are stored under the same table:
 *   • MONEY  — absolute amounts (currency set on the row, e.g. EUR), monthly.
 *   • INDEX  — Numbeo-style relative index points (0–100+), currency is a label
 *              only and carries no monetary meaning.
 *
 * Utilities split (Schritt 1): originally Strom/Wasser/Gas/Internet were folded
 * into a single `utilities_monthly` aggregate. They are now also available as
 * separate categories. `utilities_monthly` is RETAINED as the aggregate of
 * electricity + water + gas (NOT internet) for backward compatibility.
 */

/** Monthly money categories (absolute amounts, row currency applies). */
export const COL_MONEY_CATEGORIES = {
  /** Cold rent (Kaltmiete), 1-bedroom apartment outside the city centre. */
  rent_cold_1br: 'rent_cold_1br',
  /** Monthly grocery basket, single person. */
  groceries_monthly: 'groceries_monthly',
  /** Monthly public-transport pass (ÖPNV). */
  transport_monthly: 'transport_monthly',
  /** Electricity, monthly household share. */
  electricity_monthly: 'electricity_monthly',
  /** Water (incl. waste/Müll), monthly household share. */
  water_monthly: 'water_monthly',
  /** Gas, monthly household share. */
  gas_monthly: 'gas_monthly',
  /** Internet / broadband, monthly. */
  internet_monthly: 'internet_monthly',
  /** Everything else (dining out, leisure, clothing, …). */
  other_monthly: 'other_monthly',
  /** Aggregate of electricity + water + gas (excludes internet). */
  utilities_monthly: 'utilities_monthly',
  /** Total estimated monthly living cost (incl. rent). */
  total_monthly_estimate: 'total_monthly_estimate',
} as const;

/** Index categories (Numbeo-style points, not money). */
export const COL_INDEX_CATEGORIES = {
  index_cost: 'index_cost',
  index_rent: 'index_rent',
  index_grocery: 'index_grocery',
  index_utilities: 'index_utilities',
  index_transport: 'index_transport',
} as const;

/**
 * The eight separately-listed monthly living-cost positions (Schritt 1).
 * `utilities_monthly` and `total_monthly_estimate` are derived aggregates kept
 * outside this list to avoid double-counting in a sum over the positions.
 */
export const COL_BREAKDOWN_POSITIONS = [
  COL_MONEY_CATEGORIES.rent_cold_1br,
  COL_MONEY_CATEGORIES.groceries_monthly,
  COL_MONEY_CATEGORIES.transport_monthly,
  COL_MONEY_CATEGORIES.electricity_monthly,
  COL_MONEY_CATEGORIES.water_monthly,
  COL_MONEY_CATEGORIES.gas_monthly,
  COL_MONEY_CATEGORIES.internet_monthly,
  COL_MONEY_CATEGORIES.other_monthly,
] as const;

export type ColMoneyCategory = keyof typeof COL_MONEY_CATEGORIES;
export type ColIndexCategory = keyof typeof COL_INDEX_CATEGORIES;
