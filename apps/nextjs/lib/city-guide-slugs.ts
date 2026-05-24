// Maps English URL slugs → DB slugs (which use German/local names)
// DE URL uses DB slug directly: /de/auswandern/lissabon
// EN URL uses this map:          /en/emigrate/lisbon → DB slug "lissabon"
export const EN_TO_DB_SLUG: Record<string, string> = {
  lisbon: 'lissabon',
  vienna: 'wien',
  munich: 'muenchen',
  zurich: 'zuerich',
  prague: 'prag',
  warsaw: 'warschau',
  bucharest: 'bukarest',
  singapore: 'singapur',
  'cape-town': 'kapstadt',
  'mexico-city': 'mexiko-city',
  medellin: 'medellin',
  'buenos-aires': 'buenos-aires',
  miami: 'miami',
  'new-york': 'new-york',
  // Cities where EN slug == DB slug (no mapping needed, kept for completeness)
  madrid: 'madrid',
  barcelona: 'barcelona',
  amsterdam: 'amsterdam',
  dubai: 'dubai',
  paris: 'paris',
  berlin: 'berlin',
  hamburg: 'hamburg',
  porto: 'porto',
  tallinn: 'tallinn',
  valletta: 'valletta',
  milan: 'mailand',
  rotterdam: 'rotterdam',
  dublin: 'dublin',
  london: 'london',
  tbilisi: 'tbilisi',
  bangkok: 'bangkok',
  'chiang-mai': 'chiang-mai',
  bali: 'bali',
  budapest: 'budapest',
};

export const DB_TO_EN_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(EN_TO_DB_SLUG).map(([en, db]) => [db, en]),
);

export function resolveDbSlug(enSlug: string): string {
  return EN_TO_DB_SLUG[enSlug] ?? enSlug;
}

export function toEnSlug(dbSlug: string): string {
  return DB_TO_EN_SLUG[dbSlug] ?? dbSlug;
}
