// Data minimization: all tracking/persistence flags are off by default
// until the privacy policy and cookie banner are live.
export const flags = {
  enableSearchTracking: process.env.ENABLE_SEARCH_TRACKING === 'true',
  enableAnonymousCalculationSave: process.env.ENABLE_ANONYMOUS_CALC_SAVE === 'true',
  // Load tax tables (brackets, social, deductions, surcharges, fixed amounts)
  // from the database instead of the engine's canonical fallback dataset.
  // Keep OFF until the tax-engine migration is deployed and the DB reseeded
  // from the canonical data — otherwise the new tables/columns do not exist.
  useDbTaxData: process.env.USE_DB_TAX_DATA === 'true',
};
