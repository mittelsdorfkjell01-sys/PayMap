// Data minimization: all tracking/persistence flags are off by default
// until the privacy policy and cookie banner are live.
export const flags = {
  enableSearchTracking: process.env.ENABLE_SEARCH_TRACKING === 'true',
  enableAnonymousCalculationSave: process.env.ENABLE_ANONYMOUS_CALC_SAVE === 'true',
};
