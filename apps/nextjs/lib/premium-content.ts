export const DISTRICT_VIBES = [
  'lebendig',
  'ruhig',
  'familiär',
  'schick',
  'alternativ',
  'studentisch',
  'gehoben',
  'aufstrebend',
] as const;

export type DistrictVibe = (typeof DISTRICT_VIBES)[number];

export const NARRATIVE_SECTIONS = [
  'intro',
  'for_freelancers',
  'for_families',
  'for_retirees',
  'for_employees',
  'for_tech_workers',
  'for_crypto_investors',
] as const;

export type NarrativeSection = (typeof NARRATIVE_SECTIONS)[number];

export const TOOL_TYPES = [
  'first_month_budget',
  'visa_eligibility',
  'language_learning_estimator',
  'commute_calculator',
  'school_finder',
  'cost_living_comparator',
] as const;

export type ToolType = (typeof TOOL_TYPES)[number];

export const RESOURCE_TYPES = [
  'template',
  'checklist',
  'glossary',
  'directory',
  'cheatsheet',
] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const FEEDBACK_STATUSES = ['new', 'reviewing', 'applied', 'rejected'] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export const PREMIUM_CITY_SLUGS = [
  'lissabon',
  'porto',
  'madrid',
  'barcelona',
  'rom',
  'amsterdam',
  'wien',
  'paris',
  'prag',
  'budapest',
  'zuerich',
  'dubai',
  'bangkok',
] as const;

export type PremiumCitySlug = (typeof PREMIUM_CITY_SLUGS)[number];

export function isPremiumCity(slug: string): slug is PremiumCitySlug {
  return (PREMIUM_CITY_SLUGS as readonly string[]).includes(slug);
}
