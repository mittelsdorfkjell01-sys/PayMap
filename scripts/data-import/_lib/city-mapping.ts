// Bidirectional mapping between our German slugs and external API names.
// wherenextSlug: best-guess slug for getwherenext.com city-prices endpoint.
// openMeteoName: city name used in Open-Meteo geocoding (English).
// osmName:       local name used in OSM / Overpass queries.

export interface CityMapping {
  ourSlug: string;
  nameDE: string;
  nameEN: string;
  countrySlug: string;
  wherenextSlug: string;
  openMeteoName: string;
  osmName: string;
  lat: number;
  lng: number;
}

export const cityMapping: CityMapping[] = [
  // ── Germany ────────────────────────────────────────────────────────────────
  { ourSlug: 'berlin',       nameDE: 'Berlin',       nameEN: 'Berlin',        countrySlug: 'de',  wherenextSlug: 'berlin',        openMeteoName: 'Berlin',        osmName: 'Berlin',           lat: 52.52,  lng:   13.41  },
  { ourSlug: 'hamburg',      nameDE: 'Hamburg',      nameEN: 'Hamburg',       countrySlug: 'de',  wherenextSlug: 'hamburg',       openMeteoName: 'Hamburg',       osmName: 'Hamburg',          lat: 53.55,  lng:   10.00  },
  { ourSlug: 'muenchen',     nameDE: 'München',      nameEN: 'Munich',        countrySlug: 'de',  wherenextSlug: 'munich',        openMeteoName: 'Munich',        osmName: 'München',          lat: 48.14,  lng:   11.58  },
  // ── Portugal ───────────────────────────────────────────────────────────────
  { ourSlug: 'lissabon',     nameDE: 'Lissabon',     nameEN: 'Lisbon',        countrySlug: 'pt',  wherenextSlug: 'lisbon',        openMeteoName: 'Lisbon',        osmName: 'Lisboa',           lat: 38.72,  lng:   -9.14  },
  { ourSlug: 'porto',        nameDE: 'Porto',        nameEN: 'Porto',         countrySlug: 'pt',  wherenextSlug: 'porto',         openMeteoName: 'Porto',         osmName: 'Porto',            lat: 41.16,  lng:   -8.63  },
  // ── Spain ──────────────────────────────────────────────────────────────────
  { ourSlug: 'barcelona',    nameDE: 'Barcelona',    nameEN: 'Barcelona',     countrySlug: 'es',  wherenextSlug: 'barcelona',     openMeteoName: 'Barcelona',     osmName: 'Barcelona',        lat: 41.39,  lng:    2.15  },
  { ourSlug: 'madrid',       nameDE: 'Madrid',       nameEN: 'Madrid',        countrySlug: 'es',  wherenextSlug: 'madrid',        openMeteoName: 'Madrid',        osmName: 'Madrid',           lat: 40.42,  lng:   -3.70  },
  { ourSlug: 'valencia',     nameDE: 'Valencia',     nameEN: 'Valencia',      countrySlug: 'es',  wherenextSlug: 'valencia',      openMeteoName: 'Valencia',      osmName: 'Valencia',         lat: 39.47,  lng:   -0.38  },
  // ── Netherlands ────────────────────────────────────────────────────────────
  { ourSlug: 'amsterdam',    nameDE: 'Amsterdam',    nameEN: 'Amsterdam',     countrySlug: 'nl',  wherenextSlug: 'amsterdam',     openMeteoName: 'Amsterdam',     osmName: 'Amsterdam',        lat: 52.37,  lng:    4.90  },
  { ourSlug: 'rotterdam',    nameDE: 'Rotterdam',    nameEN: 'Rotterdam',     countrySlug: 'nl',  wherenextSlug: 'rotterdam',     openMeteoName: 'Rotterdam',     osmName: 'Rotterdam',        lat: 51.92,  lng:    4.48  },
  // ── Austria ────────────────────────────────────────────────────────────────
  { ourSlug: 'wien',         nameDE: 'Wien',         nameEN: 'Vienna',        countrySlug: 'at',  wherenextSlug: 'vienna',        openMeteoName: 'Vienna',        osmName: 'Wien',             lat: 48.21,  lng:   16.37  },
  // ── Switzerland ────────────────────────────────────────────────────────────
  { ourSlug: 'zuerich',      nameDE: 'Zürich',       nameEN: 'Zurich',        countrySlug: 'ch',  wherenextSlug: 'zurich',        openMeteoName: 'Zurich',        osmName: 'Zürich',           lat: 47.38,  lng:    8.54  },
  // ── Italy ──────────────────────────────────────────────────────────────────
  { ourSlug: 'mailand',      nameDE: 'Mailand',      nameEN: 'Milan',         countrySlug: 'it',  wherenextSlug: 'milan',         openMeteoName: 'Milan',         osmName: 'Milano',           lat: 45.46,  lng:    9.19  },
  // ── France ─────────────────────────────────────────────────────────────────
  { ourSlug: 'paris',        nameDE: 'Paris',        nameEN: 'Paris',         countrySlug: 'fr',  wherenextSlug: 'paris',         openMeteoName: 'Paris',         osmName: 'Paris',            lat: 48.85,  lng:    2.35  },
  // ── Ireland ────────────────────────────────────────────────────────────────
  { ourSlug: 'dublin',       nameDE: 'Dublin',       nameEN: 'Dublin',        countrySlug: 'ie',  wherenextSlug: 'dublin',        openMeteoName: 'Dublin',        osmName: 'Dublin',           lat: 53.35,  lng:   -6.26  },
  // ── United Kingdom ─────────────────────────────────────────────────────────
  { ourSlug: 'london',       nameDE: 'London',       nameEN: 'London',        countrySlug: 'gb',  wherenextSlug: 'london',        openMeteoName: 'London',        osmName: 'London',           lat: 51.51,  lng:   -0.13  },
  // ── Estonia ────────────────────────────────────────────────────────────────
  { ourSlug: 'tallinn',      nameDE: 'Tallinn',      nameEN: 'Tallinn',       countrySlug: 'ee',  wherenextSlug: 'tallinn',       openMeteoName: 'Tallinn',       osmName: 'Tallinn',          lat: 59.44,  lng:   24.75  },
  // ── Poland ─────────────────────────────────────────────────────────────────
  { ourSlug: 'warschau',     nameDE: 'Warschau',     nameEN: 'Warsaw',        countrySlug: 'pl',  wherenextSlug: 'warsaw',        openMeteoName: 'Warsaw',        osmName: 'Warszawa',         lat: 52.23,  lng:   21.01  },
  // ── Czech Republic ─────────────────────────────────────────────────────────
  { ourSlug: 'prag',         nameDE: 'Prag',         nameEN: 'Prague',        countrySlug: 'cz',  wherenextSlug: 'prague',        openMeteoName: 'Prague',        osmName: 'Praha',            lat: 50.08,  lng:   14.44  },
  // ── Hungary ────────────────────────────────────────────────────────────────
  { ourSlug: 'budapest',     nameDE: 'Budapest',     nameEN: 'Budapest',      countrySlug: 'hu',  wherenextSlug: 'budapest',      openMeteoName: 'Budapest',      osmName: 'Budapest',         lat: 47.50,  lng:   19.04  },
  // ── Romania ────────────────────────────────────────────────────────────────
  { ourSlug: 'bukarest',     nameDE: 'Bukarest',     nameEN: 'Bucharest',     countrySlug: 'ro',  wherenextSlug: 'bucharest',     openMeteoName: 'Bucharest',     osmName: 'București',        lat: 44.43,  lng:   26.10  },
  // ── Malta ──────────────────────────────────────────────────────────────────
  { ourSlug: 'valletta',     nameDE: 'Valletta',     nameEN: 'Valletta',      countrySlug: 'mt',  wherenextSlug: 'valletta',      openMeteoName: 'Valletta',      osmName: 'Valletta',         lat: 35.90,  lng:   14.51  },
  // ── Georgia ────────────────────────────────────────────────────────────────
  { ourSlug: 'tbilisi',      nameDE: 'Tbilisi',      nameEN: 'Tbilisi',       countrySlug: 'ge',  wherenextSlug: 'tbilisi',       openMeteoName: 'Tbilisi',       osmName: 'Tbilisi',          lat: 41.69,  lng:   44.83  },
  // ── UAE ────────────────────────────────────────────────────────────────────
  { ourSlug: 'dubai',        nameDE: 'Dubai',        nameEN: 'Dubai',         countrySlug: 'uae', wherenextSlug: 'dubai',         openMeteoName: 'Dubai',         osmName: 'Dubai',            lat: 25.20,  lng:   55.27  },
  // ── Thailand ───────────────────────────────────────────────────────────────
  { ourSlug: 'bangkok',      nameDE: 'Bangkok',      nameEN: 'Bangkok',       countrySlug: 'th',  wherenextSlug: 'bangkok',       openMeteoName: 'Bangkok',       osmName: 'Bangkok',          lat: 13.76,  lng:  100.50  },
  { ourSlug: 'chiang-mai',   nameDE: 'Chiang Mai',   nameEN: 'Chiang Mai',    countrySlug: 'th',  wherenextSlug: 'chiang-mai',    openMeteoName: 'Chiang Mai',    osmName: 'Chiang Mai',       lat: 18.79,  lng:   98.98  },
  // ── Indonesia ──────────────────────────────────────────────────────────────
  { ourSlug: 'bali',         nameDE: 'Bali',         nameEN: 'Bali',          countrySlug: 'id',  wherenextSlug: 'bali',          openMeteoName: 'Denpasar',      osmName: 'Denpasar',         lat:  -8.34, lng:  115.09  },
  // ── Colombia ───────────────────────────────────────────────────────────────
  { ourSlug: 'medellin',     nameDE: 'Medellín',     nameEN: 'Medellín',      countrySlug: 'co',  wherenextSlug: 'medellin',      openMeteoName: 'Medellín',      osmName: 'Medellín',         lat:   6.22, lng:  -75.57  },
  // ── Mexico ─────────────────────────────────────────────────────────────────
  { ourSlug: 'mexiko-city',  nameDE: 'Mexiko City',  nameEN: 'Mexico City',   countrySlug: 'mx',  wherenextSlug: 'mexico-city',   openMeteoName: 'Mexico City',   osmName: 'Ciudad de México', lat:  19.43, lng:  -99.13  },
  // ── Argentina ──────────────────────────────────────────────────────────────
  { ourSlug: 'buenos-aires', nameDE: 'Buenos Aires', nameEN: 'Buenos Aires',  countrySlug: 'ar',  wherenextSlug: 'buenos-aires',  openMeteoName: 'Buenos Aires',  osmName: 'Buenos Aires',     lat: -34.60, lng:  -58.38  },
  // ── United States ──────────────────────────────────────────────────────────
  { ourSlug: 'new-york',     nameDE: 'New York',     nameEN: 'New York',      countrySlug: 'us',  wherenextSlug: 'new-york',      openMeteoName: 'New York',      osmName: 'New York',         lat:  40.71, lng:  -74.01  },
  { ourSlug: 'miami',        nameDE: 'Miami',        nameEN: 'Miami',         countrySlug: 'us',  wherenextSlug: 'miami',         openMeteoName: 'Miami',         osmName: 'Miami',            lat:  25.77, lng:  -80.20  },
  // ── Singapore ──────────────────────────────────────────────────────────────
  { ourSlug: 'singapur',     nameDE: 'Singapur',     nameEN: 'Singapore',     countrySlug: 'sg',  wherenextSlug: 'singapore',     openMeteoName: 'Singapore',     osmName: 'Singapore',        lat:   1.35, lng:  103.82  },
  // ── South Africa ───────────────────────────────────────────────────────────
  { ourSlug: 'kapstadt',     nameDE: 'Kapstadt',     nameEN: 'Cape Town',     countrySlug: 'za',  wherenextSlug: 'cape-town',     openMeteoName: 'Cape Town',     osmName: 'Cape Town',        lat: -33.93, lng:   18.42  },
];

/** Lookup by our slug → entry */
export function byOurSlug(slug: string): CityMapping | undefined {
  return cityMapping.find(c => c.ourSlug === slug);
}

/** Lookup by wherenext slug → entry */
export function byWherenextSlug(slug: string): CityMapping | undefined {
  return cityMapping.find(c => c.wherenextSlug === slug);
}
