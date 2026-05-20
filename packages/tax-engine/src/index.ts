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
} from './registry';

// Re-export calculate functions
export { calculate, calculateApproximate } from './calculate';
