// Re-export types
export type {
  AgeRange,
  TaxOptions,
  TaxBreakdownLine,
  SocialContributions,
  TaxResult,
  ApproximateResult,
  SpecialRegimeInfo,
  CountryModule,
  TaxData,
  BracketRow,
  SocialRow,
  DeductionRow,
  SurchargeRow,
  SurchargeBracket,
  FixedAmountRow,
} from './types';

// Re-export registry functions and country modules
export {
  getCountryModule,
  getSupportedCountries,
  de,
  at,
  ch,
  nl,
  pt,
  es,
  fr,
  it,
  ie,
  ee,
  pl,
  cz,
  hu,
  ro,
  uae,
  th,
  us,
  gb,
  mt,
  ge,
  sg,
  id,
  co,
  mx,
  ar,
  za,
} from './registry';

// Re-export calculate functions
export { calculate, calculateApproximate } from './calculate';

// Re-export canonical tax data (single source of truth, used as the engine
// fallback and to seed the database).
export { DEFAULT_TAX_DATA, TAX_DATA_SOURCES, getDefaultTaxData } from './data/countries';
