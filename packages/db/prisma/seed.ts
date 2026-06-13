import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { DEFAULT_TAX_DATA, TAX_DATA_SOURCES, REGIONS, CITY_REGIONS } from "@paymap/tax-engine";

const prisma = new PrismaClient();

async function main() {
  // ─── Admin ────────────────────────────────────────────────────────────────
  const seedPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!seedPassword) {
    throw new Error("SEED_ADMIN_PASSWORD environment variable is required. Set it before running the seed.");
  }
  const passwordHash = await bcrypt.hash(seedPassword, 10);
  await prisma.adminUser.upsert({
    where: { email: "admin@paymap.io" },
    update: { passwordHash },
    create: { email: "admin@paymap.io", passwordHash },
  });

  // ─── Länder ────────────────────────────────────────────────────────────────
  const now = new Date();
  const countries = [
    { slug: "de", nameDE: "Deutschland", nameEN: "Germany", currency: "EUR", taxType: "progressive" },
    { slug: "at", nameDE: "Österreich", nameEN: "Austria", currency: "EUR", taxType: "progressive" },
    { slug: "ch", nameDE: "Schweiz", nameEN: "Switzerland", currency: "CHF", taxType: "progressive" },
    { slug: "nl", nameDE: "Niederlande", nameEN: "Netherlands", currency: "EUR", taxType: "progressive" },
    { slug: "pt", nameDE: "Portugal", nameEN: "Portugal", currency: "EUR", taxType: "progressive" },
    { slug: "es", nameDE: "Spanien", nameEN: "Spain", currency: "EUR", taxType: "progressive" },
    { slug: "fr", nameDE: "Frankreich", nameEN: "France", currency: "EUR", taxType: "progressive" },
    { slug: "it", nameDE: "Italien", nameEN: "Italy", currency: "EUR", taxType: "progressive" },
    { slug: "ie", nameDE: "Irland", nameEN: "Ireland", currency: "EUR", taxType: "progressive" },
    { slug: "ee", nameDE: "Estland", nameEN: "Estonia", currency: "EUR", taxType: "flat" },
    { slug: "pl", nameDE: "Polen", nameEN: "Poland", currency: "PLN", taxType: "flat" },
    { slug: "cz", nameDE: "Tschechien", nameEN: "Czech Republic", currency: "CZK", taxType: "progressive" },
    { slug: "hu", nameDE: "Ungarn", nameEN: "Hungary", currency: "HUF", taxType: "flat" },
    { slug: "ro", nameDE: "Rumänien", nameEN: "Romania", currency: "RON", taxType: "flat" },
    { slug: "uae", nameDE: "Vereinigte Arabische Emirate", nameEN: "United Arab Emirates", currency: "AED", taxType: "zero" },
    { slug: "th", nameDE: "Thailand", nameEN: "Thailand", currency: "THB", taxType: "progressive" },
    { slug: "us", nameDE: "Vereinigte Staaten", nameEN: "United States", currency: "USD", taxType: "progressive" },
    { slug: "gb", nameDE: "Vereinigtes Königreich", nameEN: "United Kingdom", currency: "GBP", taxType: "progressive", sourceUrl: "https://www.gov.uk/income-tax-rates" },
    { slug: "id", nameDE: "Indonesien", nameEN: "Indonesia", currency: "IDR", taxType: "progressive", sourceUrl: "https://www.pajak.go.id/" },
    { slug: "co", nameDE: "Kolumbien", nameEN: "Colombia", currency: "COP", taxType: "progressive", sourceUrl: "https://www.dian.gov.co/" },
    { slug: "mx", nameDE: "Mexiko", nameEN: "Mexico", currency: "MXN", taxType: "progressive", sourceUrl: "https://www.sat.gob.mx/" },
    { slug: "ar", nameDE: "Argentinien", nameEN: "Argentina", currency: "ARS", taxType: "progressive", sourceUrl: "https://www.afip.gob.ar/" },
    { slug: "sg", nameDE: "Singapur", nameEN: "Singapore", currency: "SGD", taxType: "progressive", sourceUrl: "https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-residency-and-tax-rates/individual-income-tax-rates" },
    { slug: "za", nameDE: "Südafrika", nameEN: "South Africa", currency: "ZAR", taxType: "progressive", sourceUrl: "https://www.sars.gov.za/" },
    { slug: "mt", nameDE: "Malta", nameEN: "Malta", currency: "EUR", taxType: "progressive", sourceUrl: "https://cfr.gov.mt/en/rates/Pages/TaxRates/Single-Rates.aspx" },
    { slug: "ge", nameDE: "Georgien", nameEN: "Georgia", currency: "GEL", taxType: "flat", sourceUrl: "https://www.rs.ge/en/taxes" },
  ];

  const countryMap = new Map<string, string>();
  for (const c of countries) {
    const { sourceUrl, ...rest } = c as typeof c & { sourceUrl?: string };
    const country = await prisma.country.upsert({
      where: { slug: c.slug },
      update: { ...(sourceUrl ? { sourceUrl } : {}), updatedAt: now },
      create: { ...rest, ...(sourceUrl ? { sourceUrl } : {}), updatedAt: now },
    });
    countryMap.set(c.slug, country.id);
  }

  // ─── Städte (v3-only) ─────────────────────────────────────────────────────
  type CityDef = {
    slug: string; flag: string; nameDE: string; nameEN: string;
    countrySlug: string; currency: string; lat: number; lng: number;
    timezone: string; isCapital: boolean; sortOrder: number;
  };

  const cities: CityDef[] = [
    // DE
    { slug: "berlin",       flag: "🇩🇪", nameDE: "Berlin",       nameEN: "Berlin",       countrySlug: "de", currency: "EUR", lat: 52.52,  lng: 13.41,   timezone: "Europe/Berlin",                    isCapital: true,  sortOrder: 0  },
    { slug: "hamburg",      flag: "🇩🇪", nameDE: "Hamburg",      nameEN: "Hamburg",      countrySlug: "de", currency: "EUR", lat: 53.55,  lng: 10.00,   timezone: "Europe/Berlin",                    isCapital: false, sortOrder: 1  },
    { slug: "muenchen",     flag: "🇩🇪", nameDE: "München",      nameEN: "Munich",       countrySlug: "de", currency: "EUR", lat: 48.14,  lng: 11.58,   timezone: "Europe/Berlin",                    isCapital: false, sortOrder: 2  },
    // PT
    { slug: "lissabon",     flag: "🇵🇹", nameDE: "Lissabon",     nameEN: "Lisbon",       countrySlug: "pt", currency: "EUR", lat: 38.72,  lng: -9.14,   timezone: "Europe/Lisbon",                    isCapital: true,  sortOrder: 3  },
    { slug: "porto",        flag: "🇵🇹", nameDE: "Porto",        nameEN: "Porto",        countrySlug: "pt", currency: "EUR", lat: 41.16,  lng: -8.63,   timezone: "Europe/Lisbon",                    isCapital: false, sortOrder: 4  },
    // ES
    { slug: "barcelona",    flag: "🇪🇸", nameDE: "Barcelona",    nameEN: "Barcelona",    countrySlug: "es", currency: "EUR", lat: 41.39,  lng: 2.15,    timezone: "Europe/Madrid",                    isCapital: false, sortOrder: 5  },
    { slug: "madrid",       flag: "🇪🇸", nameDE: "Madrid",       nameEN: "Madrid",       countrySlug: "es", currency: "EUR", lat: 40.42,  lng: -3.70,   timezone: "Europe/Madrid",                    isCapital: true,  sortOrder: 6  },
    { slug: "valencia",     flag: "🇪🇸", nameDE: "Valencia",     nameEN: "Valencia",     countrySlug: "es", currency: "EUR", lat: 39.47,  lng: -0.38,   timezone: "Europe/Madrid",                    isCapital: false, sortOrder: 7  },
    // NL
    { slug: "amsterdam",    flag: "🇳🇱", nameDE: "Amsterdam",    nameEN: "Amsterdam",    countrySlug: "nl", currency: "EUR", lat: 52.37,  lng: 4.90,    timezone: "Europe/Amsterdam",                 isCapital: true,  sortOrder: 8  },
    { slug: "rotterdam",    flag: "🇳🇱", nameDE: "Rotterdam",    nameEN: "Rotterdam",    countrySlug: "nl", currency: "EUR", lat: 51.92,  lng: 4.48,    timezone: "Europe/Amsterdam",                 isCapital: false, sortOrder: 9  },
    // AT
    { slug: "wien",         flag: "🇦🇹", nameDE: "Wien",         nameEN: "Vienna",       countrySlug: "at", currency: "EUR", lat: 48.21,  lng: 16.37,   timezone: "Europe/Vienna",                    isCapital: true,  sortOrder: 10 },
    // CH
    { slug: "zuerich",      flag: "🇨🇭", nameDE: "Zürich",       nameEN: "Zurich",       countrySlug: "ch", currency: "CHF", lat: 47.38,  lng: 8.54,    timezone: "Europe/Zurich",                    isCapital: false, sortOrder: 11 },
    // IT
    { slug: "mailand",      flag: "🇮🇹", nameDE: "Mailand",      nameEN: "Milan",        countrySlug: "it", currency: "EUR", lat: 45.46,  lng: 9.19,    timezone: "Europe/Rome",                      isCapital: false, sortOrder: 12 },
    { slug: "rom",          flag: "🇮🇹", nameDE: "Rom",          nameEN: "Rome",         countrySlug: "it", currency: "EUR", lat: 41.90,  lng: 12.50,   timezone: "Europe/Rome",                      isCapital: true,  sortOrder: 34 },
    // FR
    { slug: "paris",        flag: "🇫🇷", nameDE: "Paris",        nameEN: "Paris",        countrySlug: "fr", currency: "EUR", lat: 48.85,  lng: 2.35,    timezone: "Europe/Paris",                     isCapital: true,  sortOrder: 13 },
    // IE
    { slug: "dublin",       flag: "🇮🇪", nameDE: "Dublin",       nameEN: "Dublin",       countrySlug: "ie", currency: "EUR", lat: 53.35,  lng: -6.26,   timezone: "Europe/Dublin",                    isCapital: true,  sortOrder: 14 },
    // GB
    { slug: "london",       flag: "🇬🇧", nameDE: "London",       nameEN: "London",       countrySlug: "gb", currency: "GBP", lat: 51.51,  lng: -0.13,   timezone: "Europe/London",                    isCapital: true,  sortOrder: 15 },
    // EE
    { slug: "tallinn",      flag: "🇪🇪", nameDE: "Tallinn",      nameEN: "Tallinn",      countrySlug: "ee", currency: "EUR", lat: 59.44,  lng: 24.75,   timezone: "Europe/Tallinn",                   isCapital: true,  sortOrder: 16 },
    // PL
    { slug: "warschau",     flag: "🇵🇱", nameDE: "Warschau",     nameEN: "Warsaw",       countrySlug: "pl", currency: "PLN", lat: 52.23,  lng: 21.01,   timezone: "Europe/Warsaw",                    isCapital: true,  sortOrder: 17 },
    // CZ
    { slug: "prag",         flag: "🇨🇿", nameDE: "Prag",         nameEN: "Prague",       countrySlug: "cz", currency: "CZK", lat: 50.08,  lng: 14.44,   timezone: "Europe/Prague",                    isCapital: true,  sortOrder: 18 },
    // HU
    { slug: "budapest",     flag: "🇭🇺", nameDE: "Budapest",     nameEN: "Budapest",     countrySlug: "hu", currency: "HUF", lat: 47.50,  lng: 19.04,   timezone: "Europe/Budapest",                  isCapital: true,  sortOrder: 19 },
    // RO
    { slug: "bukarest",     flag: "🇷🇴", nameDE: "Bukarest",     nameEN: "Bucharest",    countrySlug: "ro", currency: "RON", lat: 44.43,  lng: 26.10,   timezone: "Europe/Bucharest",                 isCapital: true,  sortOrder: 20 },
    // MT
    { slug: "valletta",     flag: "🇲🇹", nameDE: "Valletta",     nameEN: "Valletta",     countrySlug: "mt", currency: "EUR", lat: 35.90,  lng: 14.51,   timezone: "Europe/Malta",                     isCapital: true,  sortOrder: 21 },
    // GE
    { slug: "tbilisi",      flag: "🇬🇪", nameDE: "Tbilisi",      nameEN: "Tbilisi",      countrySlug: "ge", currency: "GEL", lat: 41.69,  lng: 44.83,   timezone: "Asia/Tbilisi",                     isCapital: true,  sortOrder: 22 },
    // UAE
    { slug: "dubai",        flag: "🇦🇪", nameDE: "Dubai",        nameEN: "Dubai",        countrySlug: "uae", currency: "AED", lat: 25.20, lng: 55.27,   timezone: "Asia/Dubai",                       isCapital: false, sortOrder: 23 },
    // TH
    { slug: "bangkok",      flag: "🇹🇭", nameDE: "Bangkok",      nameEN: "Bangkok",      countrySlug: "th", currency: "THB", lat: 13.76,  lng: 100.50,  timezone: "Asia/Bangkok",                     isCapital: true,  sortOrder: 24 },
    { slug: "chiang-mai",   flag: "🇹🇭", nameDE: "Chiang Mai",   nameEN: "Chiang Mai",   countrySlug: "th", currency: "THB", lat: 18.79,  lng: 98.98,   timezone: "Asia/Bangkok",                     isCapital: false, sortOrder: 25 },
    // ID
    { slug: "bali",         flag: "🇮🇩", nameDE: "Bali",         nameEN: "Bali",         countrySlug: "id", currency: "IDR", lat: -8.34,  lng: 115.09,  timezone: "Asia/Makassar",                    isCapital: false, sortOrder: 26 },
    // CO
    { slug: "medellin",     flag: "🇨🇴", nameDE: "Medellín",     nameEN: "Medellín",     countrySlug: "co", currency: "COP", lat: 6.22,   lng: -75.57,  timezone: "America/Bogota",                   isCapital: false, sortOrder: 27 },
    // MX
    { slug: "mexiko-city",  flag: "🇲🇽", nameDE: "Mexiko City",  nameEN: "Mexico City",  countrySlug: "mx", currency: "MXN", lat: 19.43,  lng: -99.13,  timezone: "America/Mexico_City",              isCapital: true,  sortOrder: 28 },
    // AR
    { slug: "buenos-aires", flag: "🇦🇷", nameDE: "Buenos Aires", nameEN: "Buenos Aires", countrySlug: "ar", currency: "ARS", lat: -34.60, lng: -58.38,  timezone: "America/Argentina/Buenos_Aires",   isCapital: true,  sortOrder: 29 },
    // US
    { slug: "new-york",     flag: "🇺🇸", nameDE: "New York",     nameEN: "New York",     countrySlug: "us", currency: "USD", lat: 40.71,  lng: -74.01,  timezone: "America/New_York",                 isCapital: false, sortOrder: 30 },
    { slug: "miami",        flag: "🇺🇸", nameDE: "Miami",        nameEN: "Miami",        countrySlug: "us", currency: "USD", lat: 25.77,  lng: -80.20,  timezone: "America/New_York",                 isCapital: false, sortOrder: 31 },
    // SG
    { slug: "singapur",     flag: "🇸🇬", nameDE: "Singapur",     nameEN: "Singapore",    countrySlug: "sg", currency: "SGD", lat: 1.35,   lng: 103.82,  timezone: "Asia/Singapore",                   isCapital: true,  sortOrder: 32 },
    // ZA
    { slug: "kapstadt",     flag: "🇿🇦", nameDE: "Kapstadt",     nameEN: "Cape Town",    countrySlug: "za", currency: "ZAR", lat: -33.93, lng: 18.42,   timezone: "Africa/Johannesburg",              isCapital: false, sortOrder: 33 },
  ];

  for (const c of cities) {
    const countryId = countryMap.get(c.countrySlug) ?? null;
    await prisma.city.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        slug: c.slug, flag: c.flag, isActive: true,
        sortOrder: c.sortOrder, isCapital: c.isCapital,
        nameDE: c.nameDE, nameEN: c.nameEN, currency: c.currency,
        lat: c.lat, lng: c.lng, timezone: c.timezone,
        countryId,
      },
    });
  }

  // ─── Städte-ID-Map ────────────────────────────────────────────────────────
  const allCities = await prisma.city.findMany({ select: { id: true, slug: true } });
  const cityMap = new Map(allCities.map(c => [c.slug, c.id]));

  // ─── CityLifestyle ────────────────────────────────────────────────────────
  const lifestyleData: Record<string, Record<string, number>> = {
    berlin:        { nightlife: 92, remote_work: 85, expat_community: 88, outdoor: 68, safety_general: 72, safety_women: 70, health_system: 82, english_level: 85, political_stability: 88, air_quality: 72, coworking_density: 88, gastro: 78 },
    hamburg:       { nightlife: 78, remote_work: 80, expat_community: 75, outdoor: 72, safety_general: 78, safety_women: 76, health_system: 84, english_level: 82, political_stability: 90, air_quality: 75, coworking_density: 78, gastro: 80 },
    muenchen:      { nightlife: 70, remote_work: 82, expat_community: 78, outdoor: 88, safety_general: 88, safety_women: 86, health_system: 90, english_level: 80, political_stability: 90, air_quality: 65, coworking_density: 82, gastro: 82 },
    lissabon:      { nightlife: 82, remote_work: 88, expat_community: 88, outdoor: 85, safety_general: 85, safety_women: 82, health_system: 78, english_level: 80, political_stability: 82, air_quality: 80, coworking_density: 82, gastro: 85 },
    porto:         { nightlife: 75, remote_work: 82, expat_community: 82, outdoor: 82, safety_general: 88, safety_women: 86, health_system: 75, english_level: 76, political_stability: 82, air_quality: 82, coworking_density: 72, gastro: 90 },
    barcelona:     { nightlife: 92, remote_work: 88, expat_community: 90, outdoor: 88, safety_general: 72, safety_women: 68, health_system: 82, english_level: 72, political_stability: 72, air_quality: 68, coworking_density: 88, gastro: 95 },
    madrid:        { nightlife: 90, remote_work: 82, expat_community: 82, outdoor: 80, safety_general: 78, safety_women: 74, health_system: 85, english_level: 65, political_stability: 78, air_quality: 70, coworking_density: 82, gastro: 92 },
    valencia:      { nightlife: 85, remote_work: 80, expat_community: 78, outdoor: 88, safety_general: 80, safety_women: 76, health_system: 82, english_level: 65, political_stability: 78, air_quality: 72, coworking_density: 72, gastro: 92 },
    amsterdam:     { nightlife: 88, remote_work: 92, expat_community: 92, outdoor: 75, safety_general: 80, safety_women: 78, health_system: 88, english_level: 97, political_stability: 88, air_quality: 68, coworking_density: 90, gastro: 76 },
    rotterdam:     { nightlife: 80, remote_work: 85, expat_community: 80, outdoor: 68, safety_general: 78, safety_women: 76, health_system: 88, english_level: 96, political_stability: 88, air_quality: 65, coworking_density: 78, gastro: 74 },
    wien:          { nightlife: 75, remote_work: 78, expat_community: 72, outdoor: 82, safety_general: 92, safety_women: 90, health_system: 90, english_level: 78, political_stability: 88, air_quality: 78, coworking_density: 75, gastro: 85 },
    zuerich:       { nightlife: 62, remote_work: 90, expat_community: 80, outdoor: 92, safety_general: 96, safety_women: 95, health_system: 96, english_level: 90, political_stability: 98, air_quality: 90, coworking_density: 82, gastro: 78 },
    mailand:       { nightlife: 82, remote_work: 80, expat_community: 80, outdoor: 78, safety_general: 75, safety_women: 72, health_system: 84, english_level: 68, political_stability: 72, air_quality: 55, coworking_density: 78, gastro: 92 },
    rom:           { nightlife: 80, remote_work: 72, expat_community: 78, outdoor: 78, safety_general: 70, safety_women: 65, health_system: 80, english_level: 60, political_stability: 70, air_quality: 58, coworking_density: 72, gastro: 95 },
    paris:         { nightlife: 88, remote_work: 82, expat_community: 85, outdoor: 72, safety_general: 68, safety_women: 62, health_system: 88, english_level: 68, political_stability: 72, air_quality: 58, coworking_density: 85, gastro: 97 },
    dublin:        { nightlife: 82, remote_work: 88, expat_community: 88, outdoor: 72, safety_general: 80, safety_women: 78, health_system: 80, english_level: 99, political_stability: 88, air_quality: 82, coworking_density: 82, gastro: 68 },
    london:        { nightlife: 90, remote_work: 88, expat_community: 95, outdoor: 72, safety_general: 72, safety_women: 68, health_system: 82, english_level: 99, political_stability: 80, air_quality: 62, coworking_density: 92, gastro: 88 },
    tallinn:       { nightlife: 72, remote_work: 92, expat_community: 72, outdoor: 75, safety_general: 88, safety_women: 86, health_system: 78, english_level: 85, political_stability: 82, air_quality: 85, coworking_density: 78, gastro: 70 },
    warschau:      { nightlife: 80, remote_work: 82, expat_community: 72, outdoor: 70, safety_general: 80, safety_women: 76, health_system: 72, english_level: 72, political_stability: 70, air_quality: 45, coworking_density: 75, gastro: 78 },
    prag:          { nightlife: 88, remote_work: 80, expat_community: 80, outdoor: 75, safety_general: 85, safety_women: 82, health_system: 75, english_level: 72, political_stability: 80, air_quality: 58, coworking_density: 75, gastro: 80 },
    budapest:      { nightlife: 88, remote_work: 78, expat_community: 75, outdoor: 72, safety_general: 80, safety_women: 72, health_system: 72, english_level: 68, political_stability: 60, air_quality: 55, coworking_density: 72, gastro: 82 },
    bukarest:      { nightlife: 78, remote_work: 78, expat_community: 65, outdoor: 65, safety_general: 75, safety_women: 68, health_system: 65, english_level: 72, political_stability: 65, air_quality: 48, coworking_density: 68, gastro: 72 },
    valletta:      { nightlife: 62, remote_work: 68, expat_community: 65, outdoor: 72, safety_general: 90, safety_women: 88, health_system: 72, english_level: 92, political_stability: 85, air_quality: 78, coworking_density: 55, gastro: 68 },
    tbilisi:       { nightlife: 80, remote_work: 82, expat_community: 80, outdoor: 88, safety_general: 78, safety_women: 68, health_system: 62, english_level: 62, political_stability: 55, air_quality: 70, coworking_density: 72, gastro: 90 },
    dubai:         { nightlife: 65, remote_work: 82, expat_community: 85, outdoor: 55, safety_general: 90, safety_women: 72, health_system: 85, english_level: 90, political_stability: 75, air_quality: 62, coworking_density: 80, gastro: 80 },
    bangkok:       { nightlife: 90, remote_work: 82, expat_community: 88, outdoor: 72, safety_general: 68, safety_women: 62, health_system: 72, english_level: 68, political_stability: 60, air_quality: 48, coworking_density: 78, gastro: 90 },
    "chiang-mai":  { nightlife: 70, remote_work: 88, expat_community: 85, outdoor: 85, safety_general: 78, safety_women: 72, health_system: 65, english_level: 65, political_stability: 60, air_quality: 45, coworking_density: 80, gastro: 85 },
    bali:          { nightlife: 78, remote_work: 88, expat_community: 88, outdoor: 90, safety_general: 72, safety_women: 68, health_system: 58, english_level: 70, political_stability: 70, air_quality: 68, coworking_density: 82, gastro: 88 },
    medellin:      { nightlife: 80, remote_work: 80, expat_community: 78, outdoor: 82, safety_general: 60, safety_women: 55, health_system: 65, english_level: 50, political_stability: 55, air_quality: 62, coworking_density: 72, gastro: 80 },
    "mexiko-city": { nightlife: 85, remote_work: 78, expat_community: 78, outdoor: 68, safety_general: 52, safety_women: 48, health_system: 68, english_level: 55, political_stability: 55, air_quality: 40, coworking_density: 72, gastro: 92 },
    "buenos-aires":{ nightlife: 88, remote_work: 75, expat_community: 75, outdoor: 72, safety_general: 58, safety_women: 52, health_system: 65, english_level: 58, political_stability: 45, air_quality: 65, coworking_density: 68, gastro: 85 },
    "new-york":    { nightlife: 95, remote_work: 85, expat_community: 98, outdoor: 72, safety_general: 68, safety_women: 62, health_system: 75, english_level: 99, political_stability: 80, air_quality: 62, coworking_density: 95, gastro: 95 },
    miami:         { nightlife: 90, remote_work: 85, expat_community: 88, outdoor: 85, safety_general: 68, safety_women: 62, health_system: 75, english_level: 90, political_stability: 80, air_quality: 72, coworking_density: 82, gastro: 88 },
    singapur:      { nightlife: 75, remote_work: 92, expat_community: 90, outdoor: 72, safety_general: 96, safety_women: 95, health_system: 95, english_level: 99, political_stability: 92, air_quality: 78, coworking_density: 88, gastro: 92 },
    kapstadt:      { nightlife: 78, remote_work: 78, expat_community: 78, outdoor: 95, safety_general: 45, safety_women: 40, health_system: 62, english_level: 90, political_stability: 60, air_quality: 85, coworking_density: 65, gastro: 78 },
  };

  for (const [slug, scores] of Object.entries(lifestyleData)) {
    const cityId = cityMap.get(slug);
    if (!cityId) continue;
    const existing = await prisma.cityLifestyle.count({ where: { cityId } });
    if (existing === 0) {
      await prisma.cityLifestyle.createMany({
        data: Object.entries(scores).map(([category, score]) => ({ cityId, category, score, source: "seed-2025", updatedAt: now })),
      });
    }
  }

  // ─── CityWeather ──────────────────────────────────────────────────────────
  const weatherData: Record<string, { sunshineDays: number; rainyDays: number; avgTempSummer: number; avgTempWinter: number; humidityIndex: number; weatherType: string }> = {
    berlin:        { sunshineDays: 170, rainyDays: 100, avgTempSummer: 22.0, avgTempWinter: 0.5,  humidityIndex: 72, weatherType: "continental" },
    hamburg:       { sunshineDays: 165, rainyDays: 115, avgTempSummer: 20.0, avgTempWinter: 1.5,  humidityIndex: 78, weatherType: "oceanic" },
    muenchen:      { sunshineDays: 195, rainyDays: 100, avgTempSummer: 23.0, avgTempWinter: -1.0, humidityIndex: 68, weatherType: "continental" },
    lissabon:      { sunshineDays: 290, rainyDays: 55,  avgTempSummer: 28.0, avgTempWinter: 12.0, humidityIndex: 62, weatherType: "mediterranean" },
    porto:         { sunshineDays: 265, rainyDays: 70,  avgTempSummer: 25.0, avgTempWinter: 10.0, humidityIndex: 68, weatherType: "mediterranean" },
    barcelona:     { sunshineDays: 265, rainyDays: 60,  avgTempSummer: 30.0, avgTempWinter: 12.0, humidityIndex: 65, weatherType: "mediterranean" },
    madrid:        { sunshineDays: 285, rainyDays: 55,  avgTempSummer: 32.0, avgTempWinter: 7.0,  humidityIndex: 48, weatherType: "continental_mediterranean" },
    valencia:      { sunshineDays: 300, rainyDays: 45,  avgTempSummer: 30.0, avgTempWinter: 11.0, humidityIndex: 62, weatherType: "mediterranean" },
    amsterdam:     { sunshineDays: 165, rainyDays: 130, avgTempSummer: 20.0, avgTempWinter: 3.0,  humidityIndex: 82, weatherType: "oceanic" },
    rotterdam:     { sunshineDays: 160, rainyDays: 125, avgTempSummer: 20.0, avgTempWinter: 3.5,  humidityIndex: 80, weatherType: "oceanic" },
    wien:          { sunshineDays: 200, rainyDays: 95,  avgTempSummer: 25.0, avgTempWinter: 0.5,  humidityIndex: 65, weatherType: "continental" },
    zuerich:       { sunshineDays: 185, rainyDays: 110, avgTempSummer: 23.0, avgTempWinter: 0.0,  humidityIndex: 70, weatherType: "continental" },
    mailand:       { sunshineDays: 210, rainyDays: 80,  avgTempSummer: 28.0, avgTempWinter: 3.0,  humidityIndex: 72, weatherType: "humid_subtropical" },
    rom:           { sunshineDays: 255, rainyDays: 75,  avgTempSummer: 31.0, avgTempWinter: 8.0,  humidityIndex: 68, weatherType: "mediterranean" },
    paris:         { sunshineDays: 185, rainyDays: 110, avgTempSummer: 25.0, avgTempWinter: 4.0,  humidityIndex: 75, weatherType: "oceanic" },
    dublin:        { sunshineDays: 155, rainyDays: 140, avgTempSummer: 18.0, avgTempWinter: 5.0,  humidityIndex: 80, weatherType: "oceanic" },
    london:        { sunshineDays: 165, rainyDays: 130, avgTempSummer: 22.0, avgTempWinter: 5.0,  humidityIndex: 78, weatherType: "oceanic" },
    tallinn:       { sunshineDays: 155, rainyDays: 105, avgTempSummer: 20.0, avgTempWinter: -4.0, humidityIndex: 78, weatherType: "continental" },
    warschau:      { sunshineDays: 175, rainyDays: 95,  avgTempSummer: 23.0, avgTempWinter: -2.0, humidityIndex: 72, weatherType: "continental" },
    prag:          { sunshineDays: 170, rainyDays: 105, avgTempSummer: 23.0, avgTempWinter: -1.0, humidityIndex: 70, weatherType: "continental" },
    budapest:      { sunshineDays: 200, rainyDays: 90,  avgTempSummer: 27.0, avgTempWinter: 0.0,  humidityIndex: 65, weatherType: "continental" },
    bukarest:      { sunshineDays: 215, rainyDays: 85,  avgTempSummer: 28.0, avgTempWinter: -1.0, humidityIndex: 62, weatherType: "continental" },
    valletta:      { sunshineDays: 300, rainyDays: 40,  avgTempSummer: 32.0, avgTempWinter: 15.0, humidityIndex: 60, weatherType: "mediterranean" },
    tbilisi:       { sunshineDays: 250, rainyDays: 75,  avgTempSummer: 35.0, avgTempWinter: 2.0,  humidityIndex: 58, weatherType: "continental" },
    dubai:         { sunshineDays: 340, rainyDays: 10,  avgTempSummer: 42.0, avgTempWinter: 20.0, humidityIndex: 55, weatherType: "desert" },
    bangkok:       { sunshineDays: 230, rainyDays: 120, avgTempSummer: 34.0, avgTempWinter: 28.0, humidityIndex: 85, weatherType: "tropical" },
    "chiang-mai":  { sunshineDays: 250, rainyDays: 100, avgTempSummer: 33.0, avgTempWinter: 22.0, humidityIndex: 75, weatherType: "tropical_savanna" },
    bali:          { sunshineDays: 260, rainyDays: 90,  avgTempSummer: 32.0, avgTempWinter: 28.0, humidityIndex: 80, weatherType: "tropical" },
    medellin:      { sunshineDays: 230, rainyDays: 140, avgTempSummer: 25.0, avgTempWinter: 22.0, humidityIndex: 72, weatherType: "tropical_highland" },
    "mexiko-city": { sunshineDays: 220, rainyDays: 100, avgTempSummer: 23.0, avgTempWinter: 15.0, humidityIndex: 55, weatherType: "subtropical_highland" },
    "buenos-aires":{ sunshineDays: 220, rainyDays: 90,  avgTempSummer: 28.0, avgTempWinter: 11.0, humidityIndex: 70, weatherType: "humid_subtropical" },
    "new-york":    { sunshineDays: 220, rainyDays: 115, avgTempSummer: 28.0, avgTempWinter: -1.0, humidityIndex: 68, weatherType: "humid_continental" },
    miami:         { sunshineDays: 300, rainyDays: 115, avgTempSummer: 32.0, avgTempWinter: 20.0, humidityIndex: 78, weatherType: "tropical" },
    singapur:      { sunshineDays: 250, rainyDays: 130, avgTempSummer: 31.0, avgTempWinter: 27.0, humidityIndex: 88, weatherType: "tropical" },
    kapstadt:      { sunshineDays: 280, rainyDays: 70,  avgTempSummer: 26.0, avgTempWinter: 13.0, humidityIndex: 65, weatherType: "mediterranean" },
  };

  for (const [slug, w] of Object.entries(weatherData)) {
    const cityId = cityMap.get(slug);
    if (!cityId) continue;
    await prisma.cityWeather.upsert({
      where: { cityId },
      update: w,
      create: { cityId, ...w, updatedAt: now },
    });
  }

  // ─── SpecialRegimes ────────────────────────────────────────────────────────
  const ptId  = countryMap.get("pt")!;
  const esId  = countryMap.get("es")!;
  const nlId  = countryMap.get("nl")!;
  const eeId  = countryMap.get("ee")!;
  const uaeId = countryMap.get("uae")!;
  const geId  = countryMap.get("ge")!;
  const mtId  = countryMap.get("mt")!;
  const sgId  = countryMap.get("sg")!;
  const itId  = countryMap.get("it")!;
  const gbId  = countryMap.get("gb")!;
  const frId  = countryMap.get("fr")!;
  const atId  = countryMap.get("at")!;
  const chId  = countryMap.get("ch")!;
  const thId  = countryMap.get("th")!;
  const plId  = countryMap.get("pl")!;

  const regimeDefs = [
    {
      countryId: ptId, slug: "ifici-pt", nameDE: "IFICI / „NHR 2.0\" (Portugal)", nameEN: "IFICI / \"NHR 2.0\" (Portugal)",
      flatRate: 0.20, durationYears: 10,
      qualifications: ["Neuer PT-Steuerresident ab 1.1.2024", "In den letzten 5 Jahren kein PT-Steuerresident", "Nie zuvor das alte NHR genutzt", "Tätigkeit in Innovationsfeldern (Wissenschaft, Tech, Gesundheit, F&E); meist Hochschulabschluss EQF 6+", "Anerkennung über IAPMEI/AICEP"],
      conditionsDE: "20 % Pauschalsatz auf qualifizierte PT-Erwerbs-/Selbstständigeneinkünfte (statt progressiv bis 48 %). Die meisten ausländischen passiven Einkünfte sind befreit, wenn im Quellstaat besteuerbar (kein Blacklist-Land). Laufzeit 10 Jahre, nicht verlängerbar.",
      conditionsEN: "20% flat rate on qualifying PT employment/self-employment income (vs. progressive up to 48%). Most foreign passive income is exempt if taxable in the source state (no blacklist country). Duration 10 years, non-renewable.",
      validFrom: new Date("2024-01-01"), sourceUrl: "https://www.portaldasfinancas.gov.pt", sourceDE: "Portal das Finanças / AICEP / IAPMEI, IFICI 2024",
      riskLevel: "low", requiresLegalAdvice: false,
      disclaimerDE: "Offizielles portugiesisches Programm für Talente in Schlüsselsektoren. Antrag über Portal das Finanças. Einkünfte aus deutschen Quellen bleiben regulär steuerpflichtig. Keine verbindliche Auskunft, keine Steuerberatung.",
      disclaimerEN: "Official Portuguese programme for talent in key sectors. Apply via Portal das Finanças. Income from German sources remains taxable. Not binding advice, not tax counsel.",
      descriptionDE: "Nachfolger des alten NHR, offiziell „Incentivo Fiscal à Investigação Científica e Inovação\". Gezielt auf hochqualifizierte Talente in innovationsnahen Sektoren statt der breiten Begünstigung des Vorgängers.",
      descriptionEN: "Successor to the old NHR, officially the \"Incentivo Fiscal à Investigação Científica e Inovação\". Targeted at high-skill talent in innovation sectors rather than the broad benefit of its predecessor.",
      backgroundDE: "Wichtiger Unterschied zum Alt-NHR: Renten sind unter IFICI NICHT mehr befreit (Alt-NHR: 10 %). Das Alt-NHR ist für Neuanträge geschlossen (Stichtag 31.3.2025 für 2024-Zuzügler); bestehende NHR-Nutzer behalten ihre 10 Jahre. Abschaffung erfolgte wegen Missbrauchskritik und Immobilienpreis-Druck.",
      backgroundEN: "Key difference from old NHR: pensions are NO LONGER exempt under IFICI (old NHR: 10%). The old NHR is closed to new applicants (cut-off 31 Mar 2025 for 2024 arrivals); existing NHR holders keep their 10 years. Abolished over abuse criticism and property-price pressure.",
    },
    {
      countryId: esId, slug: "beckham-es", nameDE: "Beckham Law (Spanien)", nameEN: "Beckham Law (Spain)",
      flatRate: 0.24, durationYears: 6,
      qualifications: ["Zuzug aufgrund Arbeitsvertrag/Entsendung mit/zu spanischem Arbeitgeber", "In den letzten 5 Jahren kein ES-Steuerresident", "Antrag binnen 6 Monaten (Modelo 149)", "Seit 2023 auch: Digital-Nomad-Visum, Start-up-Gründer (<25 % Anteil), Ehepartner + Kinder <25", "NICHT: klassische Freelancer ohne Anstellung, Berufssportler"],
      conditionsDE: "24 % Pauschalsatz auf spanische Erwerbseinkünfte bis 600.000 €/Jahr (47 % darüber), statt progressiver IRPF (19–47 %). Ausländische Kapitaleinkünfte bleiben spanisch unbesteuert; Befreiung von Modelo 720. Gültig 6 Jahre (Ankunftsjahr + 5).",
      conditionsEN: "24% flat rate on Spanish employment income up to €600,000/yr (47% above), instead of progressive IRPF (19–47%). Foreign capital income stays untaxed in Spain; exemption from Modelo 720. Valid 6 years (arrival year + 5).",
      validFrom: new Date("2023-01-01"), sourceUrl: "https://sede.agenciatributaria.gob.es", sourceDE: "Agencia Tributaria (AEAT); Real Decreto 687/2005 / Ley IRPF",
      riskLevel: "low", requiresLegalAdvice: false,
      disclaimerDE: "Sozialabgaben laufen separat normal. Jahr-7-Klippe: danach volle Welteinkommens- und Vermögensbesteuerung — Planung 12–18 Monate vorher nötig. Keine verbindliche Auskunft, keine Steuerberatung.",
      disclaimerEN: "Social contributions run separately at normal rates. Year-7 cliff: full worldwide income and wealth taxation thereafter — plan 12–18 months ahead. Not binding advice, not tax counsel.",
      descriptionDE: "„Régimen especial de trabajadores desplazados\": besteuert zuziehende Arbeitnehmer wie Nicht-Residenten zum 24 %-Pauschalsatz statt der progressiven IRPF.",
      descriptionEN: "\"Régimen especial de trabajadores desplazados\": taxes inbound workers like non-residents at a 24% flat rate instead of progressive IRPF.",
      backgroundDE: "Benannt nach David Beckham (Real-Madrid-Transfer 2003). Seit 2023 durch das Digital-Nomad-Visum erweitert (Rechtsprechung 2025 bestätigt Angestellte ausländischer Firmen). Streit um fiktive Mieteinkünfte der Eigenwohnung (TEAC vs. TSJ Madrid 2025, ungeklärt).",
      backgroundEN: "Named after David Beckham (Real Madrid transfer 2003). Extended since 2023 to digital-nomad-visa holders (2025 case law confirmed employees of foreign firms). Dispute over deemed rental income on the own home (TEAC vs. TSJ Madrid 2025, unresolved).",
    },
    {
      countryId: nlId, slug: "ruling30-nl", nameDE: "Expat-Ruling (ehem. 30 %-Regeling, Niederlande)", nameEN: "Expat Ruling (formerly 30% Ruling, Netherlands)",
      flatRate: 0.3697, durationYears: 5,
      qualifications: ["Aus dem Ausland angeworben mit am NL-Markt knapper Expertise", "Steuerpflichtiges Mindestgehalt 48.013 € (2026, nach 30 %-Abzug; Unter-30 mit Master ~36.497 €)", "Begünstigung gedeckelt auf 262.000 € (2026); Satz bleibt 2026 bei 30 %, ab 2027 27 %"],
      conditionsDE: "Arbeitgeber zahlt einen Teil des Bruttolohns steuerfrei als Auslandskosten-Pauschale: 30 % (2025/2026), ab 1.1.2027 auf 27 % gesenkt. Max. 5 Jahre. Die geplante 30-20-10-Staffel wurde zurückgenommen.",
      conditionsEN: "Employer pays part of gross salary tax-free as a foreign-cost allowance: 30% (2025/2026), reduced to 27% from 1 Jan 2027. Max. 5 years. The planned 30-20-10 taper was reversed.",
      validFrom: new Date("2025-01-01"), sourceUrl: "https://www.belastingdienst.nl", sourceDE: "Belastingdienst / business.gov.nl 2025/2026",
      riskLevel: "low", requiresLegalAdvice: false,
      disclaimerDE: "Übergangsrecht: Wer das Ruling vor 1.1.2024 erstmals nutzte, behält günstigere Konditionen. Mindestgehaltsnorm gilt fortlaufend. Keine verbindliche Auskunft, keine Steuerberatung.",
      disclaimerEN: "Transitional rule: those who first used the ruling before 1 Jan 2024 keep more favourable terms. The salary norm applies continuously. Not binding advice, not tax counsel.",
      descriptionDE: "Erlaubt dem Arbeitgeber, einen festen Anteil des Bruttolohns steuerfrei als Pauschale für Auslandskosten auszuzahlen — soll die Niederlande für hochqualifizierte Migranten attraktiv halten.",
      descriptionEN: "Lets the employer pay a fixed share of gross salary tax-free as a flat allowance for foreign costs — designed to keep the Netherlands attractive to high-skill migrants.",
      backgroundDE: "2024 wegen Budget verschärft, dann teils zurückgedreht (27 % statt der Staffel). Auch Erstattung internationaler Schulgebühren möglich. Der Prozentwert ist eine Brutto-Freistellung, kein Steuersatz — der angezeigte Vergleichswert ist eine grobe Näherung.",
      backgroundEN: "Tightened in 2024 for budget reasons, then partly reversed (27% instead of the taper). International school-fee reimbursement also possible. The percentage is a gross exemption, not a tax rate — the comparison figure shown is a rough approximation.",
    },
    {
      countryId: eeId, slug: "ou-ee", nameDE: "Verteilte-Gewinn-Körperschaftsteuer / E-Residency OÜ (Estland)", nameEN: "Distributed-Profit CIT / E-Residency OÜ (Estonia)",
      flatRate: 0.22, durationYears: 99,
      qualifications: ["OÜ gegründet (ggf. über E-Residency)", "Gewinne werden erst bei Ausschüttung besteuert", "E-Residency ist KEIN Steuerstatus"],
      conditionsDE: "0 % Körperschaftsteuer auf einbehaltene/reinvestierte Gewinne, 22/78 (≈ 22 %) auf Ausschüttungen (der reduzierte Satz 14/86 wurde zum 1.1.2025 abgeschafft). Flache persönliche Einkommensteuer 22 % (seit 2025, vorher 20 %).",
      conditionsEN: "0% corporate tax on retained/reinvested profits, 22/78 (≈22%) on distributions (the reduced 14/86 rate was abolished on 1 Jan 2025). Flat personal income tax 22% (since 2025, previously 20%).",
      validFrom: new Date("2025-01-01"), sourceUrl: "https://www.emta.ee/en", sourceDE: "Maksu- ja Tolliamet (Estonian Tax and Customs Board) 2025",
      riskLevel: "high", requiresLegalAdvice: true,
      disclaimerDE: "⚠ Hohes Risiko bei weiterhin deutschem Wohnsitz: volle deutsche Steuerpflicht (§ 49 EStG); E-Residency begründet keinen Steuerwohnsitz. Rechtliche Beratung dringend empfohlen. Keine verbindliche Auskunft.",
      disclaimerEN: "⚠ High risk if German residence is maintained: full German tax liability (§49 EStG); e-Residency does not establish tax residence. Legal advice strongly recommended. Not binding advice.",
      descriptionDE: "Unternehmensgewinne werden erst bei Ausschüttung besteuert (0 % auf einbehaltene Gewinne) — attraktiv für Gründer, die reinvestieren. Für Einzelpersonen gilt ein flacher ESt-Satz.",
      descriptionEN: "Company profits are taxed only on distribution (0% on retained earnings) — attractive for founders who reinvest. Individuals face a flat income-tax rate.",
      backgroundDE: "e-Residency ermöglicht die digitale Gründung/Verwaltung einer estnischen OÜ aus dem Ausland, ist aber kein Steuerstatus: maßgeblich bleibt der tatsächliche Wohn-/Geschäftsleitungssitz. Der angezeigte Satz (22 %) ist der Ausschüttungssatz.",
      backgroundEN: "e-Residency enables digital incorporation/management of an Estonian OÜ from abroad, but is not a tax status: actual residence / place of management governs. The displayed rate (22%) is the distribution rate.",
    },
    {
      countryId: uaeId, slug: "zero-uae", nameDE: "0 % Einkommensteuer (VAE/Dubai)", nameEN: "0% Income Tax (UAE/Dubai)",
      flatRate: 0.00, durationYears: 99,
      qualifications: ["Wohnsitz in den VAE (Aufenthaltsvisum)", "Tatsächlicher Lebensmittelpunkt in den VAE", "Kein Einkommen aus deutschen Quellen (§ 49 EStG)"],
      conditionsDE: "0 % persönliche Einkommensteuer auf Gehalt oder Freelancer-Einkünfte. Keine Sozialabgaben für Expats. Seit 2023 jedoch 9 % Körperschaftsteuer ab Schwellen (für Gründer/Firmen relevant, für Angestellte nicht).",
      conditionsEN: "0% personal income tax on salary or freelance income. No social contributions for expats. Since 2023 however a 9% corporate tax above thresholds (relevant for founders/companies, not for employees).",
      validFrom: new Date("2000-01-01"), sourceUrl: "https://mof.gov.ae", sourceDE: "UAE Ministry of Finance",
      riskLevel: "high", requiresLegalAdvice: true,
      disclaimerDE: "⚠ KEIN aktives DBA mit Deutschland (seit 2021) → kein Schutz vor Doppelbesteuerung, erhöhtes Risiko bei fortbestehenden DE-Bindungen. § 4 AO: Scheinwohnsitz unterbricht deutsche Steuerpflicht nicht. Rechtliche Beratung erforderlich.",
      disclaimerEN: "⚠ NO active tax treaty with Germany (since 2021) → no protection from double taxation, elevated risk where German ties remain. §4 AO: a fictitious domicile does not end German tax liability. Legal advice required.",
      descriptionDE: "Keine Einkommensteuer ist hier die Grundregel, kein beantragbares Sonderregime. Netto = Brutto für Erwerbseinkünfte.",
      descriptionEN: "No income tax is the baseline rule here, not an applied-for special regime. Net = gross for earned income.",
      backgroundDE: "Kritischer DE-Bezug: Wegzug in die VAE ist steuerlich besonders riskant, weil das DBA seit 2021 ausgelaufen ist. In Kombination mit § 2 AStG (erweiterte beschränkte Steuerpflicht) und § 6 AStG (Wegzugsbesteuerung) zwingend Beratung.",
      backgroundEN: "Critical German angle: relocating to the UAE is especially risky for tax because the treaty lapsed in 2021. Combined with §2 AStG (extended limited liability) and §6 AStG (exit tax), advice is essential.",
    },
    {
      countryId: geId, slug: "small-business-ge", nameDE: "Small Business Status (Georgien)", nameEN: "Small Business Status (Georgia)",
      flatRate: 0.01, durationYears: 99,
      qualifications: ["Registrierung als Einzelunternehmer (Individual Entrepreneur) mit Small Business Status", "Jahresumsatz unter 500.000 GEL", "Einkommen mit georgischer Quelle (Leistung i. d. R. in Georgien erbracht)"],
      conditionsDE: "1 % Steuer auf den Umsatz statt 20 % Einkommensteuer (3 % auf den Teil über 500.000 GEL im Jahr). Georgien besteuert territorial — ausländisch erzielte Einkünfte oft steuerfrei. Monatliche Steuererklärung Pflicht.",
      conditionsEN: "1% turnover tax instead of 20% income tax (3% on the part above 500,000 GEL per year). Georgia taxes territorially — foreign-source income often tax-free. Monthly tax return mandatory.",
      validFrom: new Date("2018-01-01"), sourceUrl: "https://www.rs.ge/en", sourceDE: "Revenue Service of Georgia 2025",
      riskLevel: "high", requiresLegalAdvice: true,
      disclaimerDE: "⚠ Kein DBA mit Deutschland. Bei Beibehaltung des deutschen Wohnsitzes oder wesentlicher wirtschaftlicher Bindung: volle deutsche Steuerpflicht trotz 1 %-Regime. Status wird bei zweijähriger Überschreitung der Schwelle entzogen. Rechtliche Beratung erforderlich.",
      disclaimerEN: "⚠ No tax treaty with Germany. If German residence or material economic ties remain: full German tax liability despite the 1% regime. Status is revoked after two years over the threshold. Legal advice required.",
      descriptionDE: "Sehr relevant für Freelancer/Nomaden: Einzelunternehmer mit Small Business Status zahlen nur 1 % auf den Umsatz. Keine Residenz erforderlich, um vom Satz zu profitieren.",
      descriptionEN: "Highly relevant for freelancers/nomads: individual entrepreneurs with Small Business Status pay just 1% on turnover. No residency required to benefit from the rate.",
      backgroundDE: "Definition „georgische Quelle\" und die DBA-Lage mit Deutschland sind im Einzelfall zu prüfen; Georgien hat KEIN DBA mit DE. Für Agrotourismus liegt die Schwelle bei 700.000 GEL.",
      backgroundEN: "The definition of \"Georgian source\" and the treaty position with Germany must be checked case by case; Georgia has NO treaty with Germany. For agritourism the threshold is 700,000 GEL.",
    },
    {
      countryId: mtId, slug: "grp-mt", nameDE: "Global Residence Programme (Malta)", nameEN: "Global Residence Programme (Malta)",
      flatRate: 0.15, durationYears: 99,
      qualifications: ["Kauf einer qualifizierten Immobilie ≥ 275.000 € (Malta) / 220.000 € (Gozo)", "Oder Miete ≥ 9.600 €/Jahr (Malta) / 8.750 €/Jahr (Gozo)", "Nicht-EU-/EWR-Staatsangehörige ohne freien Aufenthaltsanspruch in Malta"],
      conditionsDE: "15 % Flat Tax auf Auslandseinkommen, das nach Malta überwiesen wird (Remittance-Basis). Mindeststeuer: 15.000 €/Jahr. Nicht überwiesenes Auslandseinkommen bleibt unbesteuert.",
      conditionsEN: "15% flat tax on foreign income remitted to Malta (remittance basis). Minimum annual tax: €15,000. Foreign income not remitted stays untaxed.",
      validFrom: new Date("2014-01-01"), sourceUrl: "https://cfr.gov.mt", sourceDE: "Malta Commissioner for Revenue (CFR), GRP Rules 2013",
      riskLevel: "low", requiresLegalAdvice: false,
      disclaimerDE: "Gilt für Nicht-EU-/EWR-Bürger; EU-Bürger nutzen das Ordinary Residence Programme (ORP). Mindeststeuer 15.000 €/Jahr. Keine verbindliche Auskunft, keine Steuerberatung.",
      disclaimerEN: "For non-EU/EEA nationals; EU nationals use the Ordinary Residence Programme (ORP). Minimum tax €15,000/year. Not binding advice, not tax counsel.",
      descriptionDE: "Maltesisches Residenzprogramm mit pauschaler 15 %-Besteuerung des nach Malta überwiesenen Auslandseinkommens, kombiniert mit dem Non-Dom-Remittance-Prinzip.",
      descriptionEN: "Maltese residence programme with a flat 15% tax on foreign income remitted to Malta, combined with the non-dom remittance principle.",
      backgroundDE: "Non-Domiciled-Residenten zahlen generell nur auf nach Malta überwiesene Auslandseinkünfte. Mindeststeuerbeträge und Immobilien-/Mietschwellen sind regelmäßig zu verifizieren (CFR Malta).",
      backgroundEN: "Non-domiciled residents are generally taxed only on foreign income remitted to Malta. Minimum-tax amounts and property/rent thresholds should be verified regularly (CFR Malta).",
    },
    {
      countryId: mtId, slug: "highly-skilled-mt", nameDE: "Highly Skilled / HQP-Regime (Malta)", nameEN: "Highly Skilled / HQP Regime (Malta)",
      flatRate: 0.15, durationYears: 5,
      qualifications: ["Qualifizierter Arbeitsvertrag in einem „eligible office\"", "Branchen: Finanzdienstleistungen (MFSA), Online-Gaming (MGA), Luftfahrt (Transport Malta)", "Mindestvergütung 65.000 € (HSI-Regime 2026, LN 20/2026; +10.000 € alle 5 Jahre)"],
      conditionsDE: "15 % Pauschalsatz auf qualifizierte Erwerbseinkünfte, bis max. 7 Mio. € (darüber zum Normaltarif). Für EWR-/Schweizer Bürger bis zu 5 aufeinanderfolgende Jahre, für Drittstaatler bis zu 4.",
      conditionsEN: "15% flat rate on qualifying employment income, up to max. €7m (excess at ordinary rates). Up to 5 consecutive years for EEA/Swiss nationals, up to 4 for third-country nationals.",
      validFrom: new Date("2026-01-01"), sourceUrl: "https://mtca.gov.mt/personal-tax/legal-and-technical/test/tax-guidelines-on-highly-qualified-persons-rules", sourceDE: "Malta Tax & Customs Administration; Tax Treatment of Highly Skilled Individuals Rules (LN 20/2026)",
      riskLevel: "low", requiresLegalAdvice: false,
      disclaimerDE: "Die alten HQP Rules erhielten keine Bestimmungen mehr nach dem 31.12.2025; ab 1.1.2026 gilt das konsolidierte „Highly Skilled Individuals\"-Regime (15 %, bis 31.12.2040). Werte vor Antrag amtlich bestätigen. Keine verbindliche Auskunft.",
      disclaimerEN: "The old HQP Rules issue no determinations after 31 Dec 2025; from 1 Jan 2026 the consolidated \"Highly Skilled Individuals\" regime applies (15%, until 31 Dec 2040). Confirm figures officially before applying. Not binding advice.",
      descriptionDE: "Pauschale 15 %-Besteuerung qualifizierter Fach- und Führungskräfte in eng definierten Branchen (Finanz, Gaming, Luftfahrt) — gedacht, um Spitzentalente nach Malta zu holen.",
      descriptionEN: "Flat 15% taxation of qualifying senior professionals in tightly defined sectors (financial services, gaming, aviation) — designed to attract top talent to Malta.",
      backgroundDE: "2026 konsolidiert: Die bisherigen HQP Rules werden durch die „Highly Skilled Individuals Rules\" (LN 20/2026) abgelöst, gültig bis Ende 2040. Branchenliste und Mindestvergütung werden jährlich angepasst.",
      backgroundEN: "Consolidated in 2026: the former HQP Rules are superseded by the \"Highly Skilled Individuals Rules\" (LN 20/2026), valid through end-2040. Sector list and minimum remuneration are adjusted annually.",
    },
    {
      countryId: sgId, slug: "nor-sg", nameDE: "Territoriale Besteuerung / NOR (Singapur)", nameEN: "Territorial Taxation / NOR (Singapore)",
      flatRate: 0.10, durationYears: 5,
      qualifications: ["Im Kern territoriale Besteuerung: Auslandseinkünfte meist steuerfrei, sofern nicht nach SG überwiesen", "NOR-Schema: Status musste vor YA 2021 gewährt sein", "Niedrige progressive Sätze auf lokales Einkommen"],
      conditionsDE: "Singapur besteuert im Wesentlichen territorial; ausländische Einkünfte meist steuerfrei, sofern nicht nach SG überwiesen. Das NOR-Schema (anteilige Besteuerung nach Arbeitstagen) ist ab YA 2021 eingestellt — keine neuen Anträge.",
      conditionsEN: "Singapore taxes largely territorially; foreign income mostly tax-free unless remitted to SG. The NOR scheme (time-apportioned taxation) is discontinued from YA 2021 — no new applications.",
      validFrom: new Date("2002-01-01"),
      sourceUrl: "https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-residency-and-tax-rates/individual-income-tax-rates",
      sourceDE: "IRAS Singapore 2025 (NOR scheme archived from YA 2021)",
      riskLevel: "medium", requiresLegalAdvice: true,
      disclaimerDE: "⚠ NOR ist ab YA 2021 eingestellt; nur Altfälle (Status ≤ YA 2020) profitieren noch. Die territoriale Besteuerung gilt fort. Remittance-Regeln im Einzelfall prüfen. Keine verbindliche Auskunft.",
      disclaimerEN: "⚠ NOR is discontinued from YA 2021; only legacy holders (status ≤ YA 2020) still benefit. Territorial taxation continues. Check remittance rules case by case. Not binding advice.",
      descriptionDE: "Singapurs Steuersystem ist überwiegend territorial: lokal erzieltes Einkommen wird (niedrig progressiv) besteuert, nicht überwiesenes Auslandseinkommen meist nicht.",
      descriptionEN: "Singapore's system is largely territorial: locally sourced income is taxed (low progressive rates), foreign income not remitted is mostly untaxed.",
      backgroundDE: "Das frühere NOR-Schema bot eine Zeitaufteilung für mobile Führungskräfte (>90 Tage außerhalb SG, Einkommen > SGD 160.000). Es ist ausgelaufen; der angezeigte Satz (10 %) bezieht sich auf das Alt-NOR.",
      backgroundEN: "The former NOR scheme offered time-apportionment for mobile executives (>90 days outside SG, income > SGD 160,000). It has lapsed; the displayed rate (10%) refers to the legacy NOR.",
    },
    {
      countryId: itId, slug: "impatriate-it", nameDE: "Regime Impatriati (Italien)", nameEN: "Impatriate Regime (Italy)",
      flatRate: 0.50, durationYears: 5,
      qualifications: ["In den letzten 3 Jahren kein IT-Wohnsitz (6–7 Jahre bei Rückkehr zum selben Arbeitgeber/Konzern)", "Hohe Qualifikation/Spezialisierung (ISTAT-Level 1–3, meist ≥ 3 Jahre Hochschule)", "Echter Wohnsitzwechsel + Bindungszusage (Clawback bei frühem Wegzug)"],
      conditionsDE: "50 % Steuerbefreiung auf qualifizierende IT-Erwerbs-/Selbstständigeneinkünfte (60 % bei minderjährigem Kind), gedeckelt auf 600.000 €/Jahr, für 5 Jahre (i. d. R. nicht verlängerbar). Davor 70 %/90 % (Süden) — abgeschafft.",
      conditionsEN: "50% tax exemption on qualifying IT employment/self-employment income (60% with a minor child), capped at €600,000/yr, for 5 years (generally non-renewable). Previously 70%/90% (South) — abolished.",
      validFrom: new Date("2024-01-01"),
      sourceUrl: "https://www.agenziaentrate.gov.it",
      sourceDE: "Agenzia delle Entrate, D.Lgs. n. 209/2023",
      riskLevel: "low", requiresLegalAdvice: false,
      disclaimerDE: "Clawback (rückwirkende Vollbesteuerung + Zinsen) bei zu frühem Wegzug. Der angezeigte Wert (50 %) ist die Befreiungsquote, kein Steuersatz — der Vergleichswert ist eine grobe Näherung. Keine verbindliche Auskunft.",
      disclaimerEN: "Clawback (retroactive full taxation + interest) if you leave too early. The displayed value (50%) is the exemption rate, not a tax rate — the comparison figure is a rough approximation. Not binding advice.",
      descriptionDE: "„Brain gain\"-Regime: befreit die Hälfte (bzw. 60 %) des qualifizierten italienischen Erwerbseinkommens von der IRPEF, um hochqualifizierte Rückkehrer und Zuzügler zu gewinnen.",
      descriptionEN: "\"Brain gain\" regime: exempts half (or 60%) of qualifying Italian employment income from IRPEF to attract high-skill returnees and inbound talent.",
      backgroundDE: "Daneben existiert eine Lump-Sum-Flat-Tax für HNWI auf ausländische Einkünfte: 200.000 €/Jahr (Steuerjahr 2025; davor 100.000 €), ab 1.1.2026 auf 300.000 € für Neuzuzügler erhöht (Familienmitglieder 50.000 €). Italienische Einkünfte bleiben progressiv (23–43 %).",
      backgroundEN: "Alongside it is a lump-sum flat tax for HNWIs on foreign income: €200,000/yr (tax year 2025; previously €100,000), raised to €300,000 for new arrivals from 1 Jan 2026 (family members €50,000). Italian income stays progressive (23–43%).",
    },
    {
      countryId: gbId, slug: "fig-gb", nameDE: "FIG-Regime (Vereinigtes Königreich)", nameEN: "FIG Regime (United Kingdom)",
      flatRate: 0.00, durationYears: 4,
      qualifications: ["In den letzten 10 zusammenhängenden Jahren nicht UK-ansässig", "Auf den 6.4.2025 weniger als 4 Jahre UK-ansässig (für Übergang)", "Jährliche Antragstellung (claim)"],
      conditionsDE: "Neuzuzügler zahlen in den ersten 4 Steuerjahren keine UK-Steuer auf ausländische Einkünfte und Gewinne (auch wenn ins UK gebracht). UK-Quelleneinkünfte werden normal besteuert. Das Non-Dom-/Remittance-Regime wurde zum 6.4.2025 abgeschafft.",
      conditionsEN: "New arrivals pay no UK tax on foreign income and gains in the first 4 tax years (even if brought into the UK). UK-source income is taxed normally. The non-dom/remittance regime was abolished on 6 Apr 2025.",
      validFrom: new Date("2025-04-06"), sourceUrl: "https://www.gov.uk/guidance/check-if-you-can-claim-the-4-year-foreign-income-and-gains-regime", sourceDE: "HMRC, 4-Year Foreign Income and Gains (FIG) Regime (from 6 April 2025)",
      riskLevel: "medium", requiresLegalAdvice: true,
      disclaimerDE: "⚠ Wer FIG beansprucht, verliert für das Jahr den persönlichen Steuerfreibetrag (Personal Allowance) und den CGT-Freibetrag. Tax cliff nach 4 Jahren (volle Welteinkommensbesteuerung). IHT auf Weltvermögen ab 10 Jahren Ansässigkeit. Der angezeigte Satz (0 %) gilt NUR für Auslandseinkünfte, nicht für UK-Gehalt. Keine verbindliche Auskunft.",
      disclaimerEN: "⚠ Claiming FIG forfeits the personal allowance and the CGT annual exempt amount for that year. Tax cliff after 4 years (full worldwide taxation). IHT on worldwide assets from 10 years of residence. The displayed rate (0%) applies ONLY to foreign income, not UK salary. Not binding advice.",
      descriptionDE: "Ersatz für das zum 6.4.2025 abgeschaffte Non-Dom-/Remittance-Regime: vier steuerfreie Jahre für ausländische Einkünfte und Gewinne neu zugezogener UK-Residenten.",
      descriptionEN: "Replacement for the non-dom/remittance regime abolished on 6 Apr 2025: four tax-free years on foreign income and gains for newly arrived UK residents.",
      backgroundDE: "Das Non-Dom-Regime endete nach über 200 Jahren. Für Alt-Non-Doms gibt es Übergangsregeln (Temporary Repatriation Facility, Rebasing). Der Vergleichswert im Rechner ist irreführend für Personen mit UK-Gehalt — siehe Detailbedingungen.",
      backgroundEN: "The non-dom regime ended after more than 200 years. Transitional rules exist for former non-doms (Temporary Repatriation Facility, rebasing). The calculator comparison is misleading for people with UK salary — see detailed conditions.",
    },
    {
      countryId: frId, slug: "impatries-fr", nameDE: "Régime des impatriés (Frankreich)", nameEN: "Impatriate Regime (France)",
      flatRate: 0.30, durationYears: 8,
      qualifications: ["Aus dem Ausland angeworben/entsandt", "In den 5 Kalenderjahren vor Amtsantritt nicht in FR steuerlich ansässig", "Verlegung des Steuerwohnsitzes nach FR ab Amtsantritt"],
      conditionsDE: "Befreiung der Impatriierungs-Prämie (prime d'impatriation) von der ESt — entweder in tatsächlicher Höhe oder pauschal mit 30 % der Gesamtvergütung; zusätzlich 50 % Befreiung bestimmter passiver Auslandseinkünfte. Bis Ende des 8. Kalenderjahres nach Amtsantritt.",
      conditionsEN: "Exemption of the impatriation bonus (prime d'impatriation) from income tax — either at its actual amount or a flat 30% of total remuneration; plus 50% exemption of certain passive foreign income. Until end of the 8th calendar year after taking up duties.",
      validFrom: new Date("2008-01-01"), sourceUrl: "https://www.impots.gouv.fr/international-particulier/le-regime-des-impatries", sourceDE: "impots.gouv.fr; Art. 155 B CGI; BOI-RSA-GEO-40-10 (akt. 11.8.2025)",
      riskLevel: "low", requiresLegalAdvice: true,
      disclaimerDE: "Die 30 %-Pauschale ist eine Wahloption für die Prämie, kein Steuersatz auf das Gesamteinkommen — der Rechner-Vergleichswert ist nur eine grobe Annäherung. Genaue Quoten/Bedingungen vor Antrag bei impots.gouv.fr prüfen. Keine verbindliche Auskunft.",
      disclaimerEN: "The 30% flat option applies to the bonus, not as a tax rate on total income — the calculator comparison is only a rough approximation. Verify exact quotas/conditions before applying at impots.gouv.fr. Not binding advice.",
      descriptionDE: "Steuervergünstigung für aus dem Ausland angeworbene Arbeitnehmer/Führungskräfte: ein Teil der Vergütung (die Impatriierungs-Prämie) sowie Teile passiver Auslandseinkünfte werden zeitlich befristet von der Einkommensteuer befreit.",
      descriptionEN: "Tax break for employees/executives recruited from abroad: part of the remuneration (the impatriation bonus) plus parts of passive foreign income are exempt from income tax for a limited period.",
      backgroundDE: "Geregelt in Art. 155 B CGI; die Finanzverwaltung aktualisierte die Auslegung am 11.8.2025 (BOI-RSA-GEO-40-10). Beispiel: Amtsantritt 1.1.2025 → Begünstigung bis 31.12.2033. Auch Sozialabgaben-Erleichterungen möglich.",
      backgroundEN: "Governed by Art. 155 B CGI; the tax administration updated its guidance on 11 Aug 2025 (BOI-RSA-GEO-40-10). Example: start 1 Jan 2025 → benefit until 31 Dec 2033. Social-contribution reliefs may also apply.",
    },
    {
      countryId: atId, slug: "zuzug-at", nameDE: "Zuzugsbegünstigung (§ 103 EStG, Österreich)", nameEN: "Relocation Relief (§103 EStG, Austria)",
      flatRate: 0.30, durationYears: 5,
      qualifications: ["Zuzug aus dem Ausland (Verlagerung des Lebensmittelpunkts nach AT)", "Zuzugsfreibetrag nur für Wissenschaftler/Forscher", "Beseitigung steuerlicher Mehrbelastung: Personen im öffentlichen Interesse (Ermessen des BMF)"],
      conditionsDE: "Zwei Komponenten: (1) Beseitigung der durch den Zuzug entstehenden steuerlichen Mehrbelastung bei Auslandseinkünften (Ermessen des BMF); (2) Zuzugsfreibetrag von 30 % der Einkünfte aus wissenschaftlicher Tätigkeit (nur Wissenschaftler/Forscher), bescheidmäßig für 5 Jahre.",
      conditionsEN: "Two components: (1) elimination of the additional tax burden on foreign income arising from relocation (at the BMF's discretion); (2) a relocation allowance of 30% of income from scientific activity (researchers only), granted by ruling for 5 years.",
      validFrom: new Date("2016-01-01"), sourceUrl: "https://www.bmf.gv.at/themen/steuern/arbeitnehmerveranlagung/zuzugsbeguenstigung.html", sourceDE: "BMF Österreich, § 103 EStG 1988",
      riskLevel: "medium", requiresLegalAdvice: true,
      disclaimerDE: "Der Zuzugsfreibetrag (30 %) gilt nur für wissenschaftliche Einkünfte und ist keine pauschale Steuer aufs Gesamteinkommen — der Rechner-Vergleichswert ist nur eine grobe Annäherung. Die Mehrbelastungs-Beseitigung ist eine Ermessensentscheidung. Keine verbindliche Auskunft.",
      disclaimerEN: "The relocation allowance (30%) applies only to scientific income and is not a flat tax on total income — the calculator comparison is only a rough approximation. The burden-elimination is a discretionary decision. Not binding advice.",
      descriptionDE: "Auf Antrag beim BMF: Erleichterung der steuerlichen Mehrbelastung bei Zuzug, v. a. für Wissenschaftler/Forscher und Personen, deren Zuzug im öffentlichen Interesse liegt.",
      descriptionEN: "On application to the BMF: relief from the additional tax burden on relocation, primarily for scientists/researchers and persons whose relocation is in the public interest.",
      backgroundDE: "Ein „Zuzug\" i. S. d. § 103 EStG setzt die Verlagerung des Mittelpunkts der Lebensinteressen nach Österreich voraus (vom VwGH präzisiert). Der Zuzugsfreibetrag wird bescheidmäßig für 5 Jahre zuerkannt.",
      backgroundEN: "A \"relocation\" under §103 EStG requires shifting one's centre of vital interests to Austria (clarified by the VwGH). The relocation allowance is granted by ruling for 5 years.",
    },
    {
      countryId: chId, slug: "lump-sum-ch", nameDE: "Pauschalbesteuerung / Besteuerung nach Aufwand (Schweiz)", nameEN: "Lump-Sum Taxation / Expenditure-Based (Switzerland)",
      flatRate: 0.00, durationYears: 99,
      qualifications: ["Ausländer ohne Erwerbstätigkeit in der Schweiz", "Erstmaliger oder erneuter Zuzug in die Schweiz", "Kantonal unterschiedlich; in ZH, SH, AR, BL, BS abgeschafft"],
      conditionsDE: "Besteuerung nach dem Lebensaufwand statt nach Einkommen/Vermögen. Bemessung = der höhere Wert aus 7-facher Jahresmiete, dem tatsächlichen Aufwand oder dem Bundes-Mindestbetrag (CHF 434.700 für 2025; CHF 435.000 für 2026). 21 von 26 Kantonen bieten das Regime an.",
      conditionsEN: "Taxation by living expenditure instead of income/wealth. Base = the higher of 7× annual rent, actual expenditure, or the federal minimum (CHF 434,700 for 2025; CHF 435,000 for 2026). 21 of 26 cantons offer the regime.",
      validFrom: new Date("2016-01-01"), sourceUrl: "https://www.efd.admin.ch/en/lump-sum-taxation", sourceDE: "Eidg. Finanzdepartement (EFD) / ESTV; kantonale Steuerämter",
      riskLevel: "medium", requiresLegalAdvice: true,
      disclaimerDE: "Keine prozentuale Steuer auf Einkommen — der angezeigte Satz (0 %) ist ein Platzhalter; die Steuer bemisst sich am Lebensaufwand (Mindestbasis CHF ~435.000). Zürich, Schaffhausen, Appenzell A.Rh., Basel-Land und Basel-Stadt bieten das Regime NICHT an. Kantonale Mindestwerte vor Antrag prüfen. Keine verbindliche Auskunft.",
      disclaimerEN: "No percentage tax on income — the displayed rate (0%) is a placeholder; tax is assessed on living expenditure (minimum base ~CHF 435,000). Zurich, Schaffhausen, Appenzell A.Rh., Basel-Landschaft and Basel-Stadt do NOT offer the regime. Check cantonal minimums before applying. Not binding advice.",
      descriptionDE: "HNWI-Regime: Statt nach Einkommen/Vermögen wird nach dem Lebensaufwand besteuert (Mindestbemessung, oft an die 7-fache Jahresmiete gekoppelt). Nur für nicht in der Schweiz erwerbstätige Ausländer.",
      descriptionEN: "HNWI regime: taxed on living expenditure rather than income/wealth (minimum base, often tied to 7× annual rent). Only for foreigners not gainfully employed in Switzerland.",
      backgroundDE: "Kantonal sehr unterschiedlich; fünf Deutschschweizer Kantone haben das Regime zwischen 2010 und 2014 abgeschafft (vier per Volksabstimmung, Basel-Stadt parlamentarisch). Französisch „forfait fiscal\", italienisch „tassazione secondo il dispendio\".",
      backgroundEN: "Highly canton-dependent; five German-speaking cantons abolished it between 2010 and 2014 (four by popular vote, Basel-Stadt by parliament). French \"forfait fiscal\", Italian \"tassazione secondo il dispendio\".",
    },
    {
      countryId: thId, slug: "ltr-th", nameDE: "LTR-Visum + Remittance-Regel (Thailand)", nameEN: "LTR Visa + Remittance Rule (Thailand)",
      flatRate: 0.00, durationYears: 10,
      qualifications: ["Steuerresident bei ≥ 183 Tagen/Jahr in Thailand", "LTR-Visum-Kategorie (z. B. Wealthy Global Citizen, Wealthy Pensioner, Work-From-Thailand Professional)", "Qualifizierende Auslandseinkünfte je nach Kategorie"],
      conditionsDE: "Thailand besteuert Residenten auf ins Land überwiesene Auslandseinkünfte (Regeländerung ab 1.1.2024). Bestimmte LTR-Kategorien sind von der Steuer auf überwiesene Auslandseinkünfte befreit. Vor 2024 erzielte Einkünfte bleiben bei Überweisung steuerfrei.",
      conditionsEN: "Thailand taxes residents on foreign income remitted into the country (rule change from 1 Jan 2024). Certain LTR categories are exempt from tax on remitted foreign income. Income earned before 2024 remains tax-free when remitted.",
      validFrom: new Date("2024-01-01"), sourceUrl: "https://ltr.boi.go.th", sourceDE: "Thai Revenue Department; Board of Investment (BOI), LTR-Visum",
      riskLevel: "medium", requiresLegalAdvice: true,
      disclaimerDE: "⚠ Keine pauschale Befreiung für alle LTR-Inhaber — jede Kategorie hat eigene Kriterien und Reichweite. Die Remittance-Auslegung wurde 2024 verschärft; aktuelle Praxis (auch mögliche Lockerungen) vor Umzug prüfen. Der angezeigte Satz (0 %) gilt nur für qualifizierte LTR-Kategorien. Keine verbindliche Auskunft.",
      disclaimerEN: "⚠ No blanket exemption for all LTR holders — each category has its own criteria and scope. The remittance interpretation was tightened in 2024; check current practice (including possible relaxations) before relocating. The displayed rate (0%) applies only to qualifying LTR categories. Not binding advice.",
      descriptionDE: "Thailand besteuert nach dem Remittance-Prinzip: nur ins Land gebrachte Auslandseinkünfte sind steuerpflichtig. Das LTR-Langzeitvisum bietet für bestimmte Kategorien eine Befreiung auf Auslandseinkommen.",
      descriptionEN: "Thailand taxes on a remittance basis: only foreign income brought into the country is taxable. The LTR long-term visa offers an exemption on foreign income for certain categories.",
      backgroundDE: "Relevant für Bangkok und Chiang Mai. Die Verschärfung 2024 beendete die frühere Praxis, Auslandseinkünfte durch verzögerte Überweisung steuerfrei zu halten. LTR-Kategorien/Bedingungen über BOI prüfen.",
      backgroundEN: "Relevant for Bangkok and Chiang Mai. The 2024 tightening ended the earlier practice of keeping foreign income tax-free via delayed remittance. Check LTR categories/conditions via the BOI.",
    },
    {
      countryId: plId, slug: "ulga-powrot-pl", nameDE: "Rückkehrer-Entlastung (Ulga na powrót, Polen)", nameEN: "Return Relief (Ulga na powrót, Poland)",
      flatRate: 0.00, durationYears: 4,
      qualifications: ["Verlegung des Steuerwohnsitzes nach Polen nach dem 31.12.2021", "In den 3 vorangegangenen Kalenderjahren kein PL-Steuerresident", "Qualifizierende PL-Einkünfte (Anstellung/Gewerbe); Nachweis des Auslandswohnsitzes"],
      conditionsDE: "ESt-Befreiung von bis zu 85.528 PLN pro Jahr für 4 aufeinanderfolgende Steuerjahre. Mit dem allgemeinen Freibetrag (30.000 PLN) effektiv bis ~115.528 PLN/Jahr steuerfrei. Gilt auch für Personen, die nie zuvor in Polen lebten.",
      conditionsEN: "Income-tax exemption of up to PLN 85,528 per year for 4 consecutive tax years. Combined with the general allowance (PLN 30,000) effectively up to ~PLN 115,528/yr tax-free. Also applies to people who never lived in Poland before.",
      validFrom: new Date("2022-01-01"), sourceUrl: "https://www.podatki.gov.pl", sourceDE: "Ministerstwo Finansów (Polnisches Finanzministerium), Ulga na powrót",
      riskLevel: "low", requiresLegalAdvice: false,
      disclaimerDE: "Die Entlastung ist ein jährlicher Freibetrag (max. 85.528 PLN), kein Steuersatz — der Rechner-Vergleichswert (0 %) ist nur eine grobe Annäherung. Der Steuerpflichtige wählt das Startjahr (Zuzugsjahr oder Folgejahr). Daneben existieren Lump-Sum auf Auslandseinkommen und IP-Box. Keine verbindliche Auskunft.",
      disclaimerEN: "The relief is an annual allowance (max PLN 85,528), not a tax rate — the calculator comparison (0%) is only a rough approximation. The taxpayer chooses the start year (arrival year or the next). A lump-sum on foreign income and an IP-Box also exist. Not binding advice.",
      descriptionDE: "Steueranreiz für Personen, die ihren Steuerwohnsitz nach mindestens 3 Jahren im Ausland nach Polen (zurück) verlegen: vier Jahre lang ein hoher jährlicher Einkommensteuer-Freibetrag.",
      descriptionEN: "Tax incentive for people who move their tax residence to Poland after at least 3 years abroad: a high annual income-tax allowance for four years.",
      backgroundDE: "Eingeführt 2022. Daneben gibt es eine Lump-Sum-Besteuerung auf Auslandseinkommen neuer Residenten und die IP-Box für IP-Einkünfte. Höchstbeträge sind jährlich zu verifizieren.",
      backgroundEN: "Introduced in 2022. Alongside it are a lump-sum tax on new residents' foreign income and the IP-Box for IP income. Maximum amounts should be verified annually.",
    },
  ];

  for (const regime of regimeDefs) {
    const existing = await prisma.specialRegime.findFirst({ where: { slug: regime.slug } });
    if (!existing) {
      await prisma.specialRegime.create({ data: { ...regime, updatedAt: now } });
    } else {
      await prisma.specialRegime.update({ where: { id: existing.id }, data: { ...regime, updatedAt: now } });
    }
  }

  // ─── ExitRules (Säule B — deutsche Wegzugs-Regeln, zielunabhängig) ────────────
  const exitRuleDefs = [
    {
      slug: "exit-tax-6-astg", ruleType: "exit_tax", legalRef: "§ 6 AStG", sortOrder: 0,
      nameDE: "Wegzugsbesteuerung (§ 6 AStG)", nameEN: "Exit Taxation (§6 AStG)",
      descriptionDE: "Bei Wegzug ins Ausland gelten wesentliche Beteiligungen (≥ 1 % an Kapitalgesellschaften) sowie seit dem 1.1.2025 bestimmte Investmentfondsanteile als fiktiv veräußert — die stillen Reserven werden besteuert, ohne dass tatsächlich verkauft wurde.",
      descriptionEN: "On relocating abroad, significant shareholdings (≥1% in corporations) and, since 1 Jan 2025, certain investment-fund units are treated as deemed sold — the unrealised gains are taxed even though nothing was actually sold.",
      affectedDE: "Personen mit GmbH-/AG-Anteilen ≥ 1 % (o. Ä.), die in mindestens 7 der letzten 12 Jahre unbeschränkt steuerpflichtig waren. Seit 2025 zusätzlich Investmentfondsanteile mit ≥ 1 % Beteiligung ODER Anschaffungskosten ≥ 500.000 €.",
      affectedEN: "People holding ≥1% in a GmbH/AG (or similar) who were subject to unlimited tax liability for at least 7 of the last 12 years. Since 2025 also investment-fund units with a ≥1% holding OR acquisition cost ≥ €500,000.",
      backgroundDE: "Erleichterung: Stundung in 7 gleichen Jahresraten möglich (i. d. R. nur gegen Sicherheitsleistung und Mitwirkungspflichten); die frühere zinslose EU/EWR-Stundung entfiel mit der Reform. Rückkehrerregelung: Bei Rückkehr binnen 7 Jahren kann die Steuer rückwirkend entfallen (Anteile dürfen nicht veräußert/übertragen werden).",
      backgroundEN: "Relief: deferral in 7 equal annual installments is possible (usually only against collateral and cooperation duties); the former interest-free EU/EEA deferral was removed with the reform. Return rule: returning within 7 years can retroactively cancel the tax (shares must not be sold/transferred).",
      sourceUrl: "https://www.gesetze-im-internet.de/astg/__6.html", sourceDE: "§ 6 AStG (gesetze-im-internet.de); BMF, Wegzugsbesteuerung 2025",
      riskLevel: "high", requiresLegalAdvice: true,
      disclaimerDE: "⚠ Greift ohne tatsächlichen Verkauf — kann zu erheblicher Steuerlast ohne Liquiditätszufluss führen. Steuerberater zwingend. Schwellen und Stundungsmodalitäten nach jüngster Reform individuell prüfen. Keine verbindliche Auskunft, keine Steuerberatung.",
      disclaimerEN: "⚠ Triggers without an actual sale — can create a substantial tax burden with no cash inflow. A tax advisor is essential. Verify thresholds and deferral terms after the latest reform individually. Not binding advice, not tax counsel.",
    },
    {
      slug: "extended-limited-2-astg", ruleType: "extended_limited_liability", legalRef: "§ 2 AStG", sortOrder: 1,
      nameDE: "Erweiterte beschränkte Steuerpflicht (§ 2 AStG)", nameEN: "Extended Limited Tax Liability (§2 AStG)",
      descriptionDE: "Bei Wegzug in ein Niedrigsteuerland mit fortbestehenden wesentlichen wirtschaftlichen Interessen in Deutschland bleiben bestimmte deutsche Einkünfte für das Wegzugsjahr und die folgenden 10 Jahre erweitert steuerpflichtig.",
      descriptionEN: "On moving to a low-tax country while retaining substantial economic interests in Germany, certain German-source income remains subject to extended taxation for the year of departure and the following 10 years.",
      affectedDE: "Deutsche Staatsangehörige, die in den letzten 10 Jahren vor Wegzug mindestens 5 Jahre unbeschränkt steuerpflichtig waren, in ein Niedrigsteuergebiet ziehen und wesentliche wirtschaftliche Interessen in DE behalten (z. B. ≥ 1 % an einer dt. Kapitalgesellschaft, oder > 30 % bzw. > 62.000 € nicht-ausländische Einkünfte).",
      affectedEN: "German nationals who were subject to unlimited tax liability for at least 5 of the 10 years before departure, move to a low-tax territory, and keep substantial economic interests in Germany (e.g. ≥1% in a German corporation, or >30% / >€62,000 of non-foreign income).",
      backgroundDE: "Die Niedrigsteuer-Definition und der betroffene Einkünftekatalog (insbesondere Kapitaleinkünfte) sind im Einzelfall zu prüfen. Wirkt zusätzlich zur normalen beschränkten Steuerpflicht.",
      backgroundEN: "The low-tax definition and the catalogue of affected income (notably capital income) must be checked case by case. Applies on top of ordinary limited tax liability.",
      sourceUrl: "https://www.gesetze-im-internet.de/astg/__2.html", sourceDE: "§ 2 AStG (gesetze-im-internet.de)",
      riskLevel: "high", requiresLegalAdvice: true,
      disclaimerDE: "⚠ Gilt bis zu 10 Jahre nach Wegzug auch ohne Anwesenheit in Deutschland. Niedrigsteuer-Einstufung des Ziellands entscheidend. Steuerberater erforderlich. Keine verbindliche Auskunft, keine Steuerberatung.",
      disclaimerEN: "⚠ Applies for up to 10 years after departure, even without presence in Germany. The destination's low-tax classification is decisive. A tax advisor is required. Not binding advice, not tax counsel.",
    },
    {
      slug: "dba-status", ruleType: "dba_status", legalRef: null, sortOrder: 2,
      nameDE: "DBA-Status / Länder ohne DBA", nameEN: "Tax-Treaty Status / Countries without a Treaty",
      descriptionDE: "Doppelbesteuerungsabkommen (DBA) entscheiden, welcher Staat welche Einkünfte besteuern darf. Ohne aktives DBA fehlt der Schutz vor Doppelbesteuerung — das Risiko einer doppelten Belastung steigt erheblich.",
      descriptionEN: "Double-taxation treaties (DTTs) determine which state may tax which income. Without an active treaty there is no protection from double taxation — the risk of being taxed twice rises substantially.",
      affectedDE: "Alle Wegziehenden — entscheidend ist das jeweilige Zielland. Kein aktives DBA besteht z. B. mit den VAE (seit 2021). Pro Zielland ist DBA ja/nein samt Kernpunkten zu prüfen.",
      affectedEN: "Everyone relocating — the destination country is decisive. There is no active treaty with the UAE (since 2021), for example. For each destination, treaty yes/no and its key points should be checked.",
      backgroundDE: "Der DBA-Status ist laufend aus der BMF-DBA-Übersicht zu pflegen, da sich Abkommen ändern, auslaufen oder neu in Kraft treten.",
      backgroundEN: "Treaty status must be maintained continuously from the BMF treaty overview, as treaties change, lapse, or newly enter into force.",
      sourceUrl: "https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/Internationales_Steuerrecht/Staatenbezogene_Informationen/staatenbezogene_info.html", sourceDE: "BMF, Übersicht der Doppelbesteuerungsabkommen",
      riskLevel: "medium", requiresLegalAdvice: true,
      disclaimerDE: "⚠ Besonders riskant bei Ländern ohne aktives DBA (z. B. VAE). Status und Kernregeln pro Zielland verifizieren. Keine verbindliche Auskunft, keine Steuerberatung.",
      disclaimerEN: "⚠ Especially risky for countries without an active treaty (e.g. the UAE). Verify status and key rules per destination. Not binding advice, not tax counsel.",
    },
    {
      slug: "fbar-fatca-us", ruleType: "reporting", legalRef: "FBAR / FATCA", sortOrder: 3,
      nameDE: "USA-Spezifika: FBAR / FATCA", nameEN: "US Specifics: FBAR / FATCA",
      descriptionDE: "Wer in die USA zieht oder US-Konten hält, unterliegt FBAR-Meldepflichten (Meldung ausländischer Konten ab einem Gesamtwert von 10.000 USD) und FATCA. US-Staatsbürger unterliegen zusätzlich der weltweiten Steuerpflicht (mit FEIE / Foreign Tax Credit).",
      descriptionEN: "Anyone moving to the US or holding US accounts is subject to FBAR reporting (foreign accounts above an aggregate of USD 10,000) and FATCA. US citizens are additionally subject to worldwide taxation (with FEIE / Foreign Tax Credit).",
      affectedDE: "Nach USA Zuziehende, Personen mit US-Konten sowie US-Staatsbürger und Greencard-Inhaber (unabhängig vom Wohnsitz).",
      affectedEN: "People moving to the US, holders of US accounts, and US citizens and green-card holders (regardless of residence).",
      backgroundDE: "FBAR wird elektronisch beim FinCEN (Formular 114) eingereicht; FATCA betrifft u. a. das Formular 8938. Schwellen und Formulare ändern sich — vor dem Umzug bei der IRS prüfen.",
      backgroundEN: "FBAR is filed electronically with FinCEN (Form 114); FATCA involves Form 8938 among others. Thresholds and forms change — check with the IRS before relocating.",
      sourceUrl: "https://www.irs.gov/businesses/small-businesses-self-employed/report-of-foreign-bank-and-financial-accounts-fbar", sourceDE: "IRS — Report of Foreign Bank and Financial Accounts (FBAR); FATCA",
      riskLevel: "medium", requiresLegalAdvice: true,
      disclaimerDE: "⚠ Versäumte FBAR/FATCA-Meldungen können empfindliche Strafen auslösen. Schwellen und Formulare vor dem Umzug amtlich prüfen. Keine verbindliche Auskunft, keine Steuerberatung.",
      disclaimerEN: "⚠ Missed FBAR/FATCA filings can trigger severe penalties. Verify thresholds and forms officially before relocating. Not binding advice, not tax counsel.",
    },
  ];

  for (const rule of exitRuleDefs) {
    const existing = await prisma.exitRule.findUnique({ where: { slug: rule.slug } });
    if (!existing) {
      await prisma.exitRule.create({ data: { ...rule, updatedAt: now } });
    } else {
      await prisma.exitRule.update({ where: { id: existing.id }, data: { ...rule, updatedAt: now } });
    }
  }

  // ─── Tax tables for ALL countries (canonical engine dataset) ──────────────
  // Single source of truth: packages/tax-engine/src/data/countries.ts. The DB
  // mirrors that dataset so the engine (which reads tax values from the DB at
  // runtime) and the seed never diverge ("no second truth in TS"). Every row
  // carries the issuing authority's sourceUrl. Idempotent: skips a category for
  // a country/year if rows already exist.
  const regionMap = await seedRegionsAndLinks(countryMap, cityMap);
  await seedTaxData(countryMap, regionMap);

  // ─── ExchangeRates ────────────────────────────────────────────────────────
  const rates = [
    { fromCurrency: "EUR", toCurrency: "CHF", rate: 0.96 },
    { fromCurrency: "EUR", toCurrency: "GBP", rate: 0.85 },
    { fromCurrency: "EUR", toCurrency: "USD", rate: 1.09 },
    { fromCurrency: "EUR", toCurrency: "AED", rate: 4.00 },
    { fromCurrency: "EUR", toCurrency: "THB", rate: 39.0 },
    { fromCurrency: "EUR", toCurrency: "PLN", rate: 4.30 },
    { fromCurrency: "EUR", toCurrency: "CZK", rate: 25.2 },
    { fromCurrency: "EUR", toCurrency: "HUF", rate: 395.0 },
    { fromCurrency: "EUR", toCurrency: "RON", rate: 4.97 },
    { fromCurrency: "EUR", toCurrency: "SGD", rate: 1.46 },
    { fromCurrency: "EUR", toCurrency: "ZAR", rate: 20.5 },
    { fromCurrency: "EUR", toCurrency: "IDR", rate: 17200 },
    { fromCurrency: "EUR", toCurrency: "COP", rate: 4500 },
    { fromCurrency: "EUR", toCurrency: "MXN", rate: 19.5 },
    { fromCurrency: "EUR", toCurrency: "ARS", rate: 1100 },
    { fromCurrency: "EUR", toCurrency: "GEL", rate: 2.95 },
    { fromCurrency: "CHF", toCurrency: "EUR", rate: 1.042 },
    { fromCurrency: "USD", toCurrency: "EUR", rate: 0.917 },
  ];

  for (const r of rates) {
    await prisma.exchangeRate.upsert({
      where: { fromCurrency_toCurrency: { fromCurrency: r.fromCurrency, toCurrency: r.toCurrency } },
      update: { rate: r.rate, updatedAt: now },
      create: { ...r, updatedAt: now },
    });
  }

  // ─── CitySearchAggregate Seeds ────────────────────────────────────────────
  const existingSearches = await prisma.citySearchAggregate.count();
  if (existingSearches === 0) {
    type SearchPair = { from: string; to: string; count30d: number };
    const searchPairs: SearchPair[] = [
      { from: "berlin", to: "lissabon", count30d: 1840 },
      { from: "berlin", to: "barcelona", count30d: 1520 },
      { from: "berlin", to: "amsterdam", count30d: 1280 },
      { from: "berlin", to: "wien", count30d: 1100 },
      { from: "berlin", to: "dubai", count30d: 980 },
      { from: "berlin", to: "chiang-mai", count30d: 750 },
      { from: "berlin", to: "madrid", count30d: 680 },
      { from: "berlin", to: "porto", count30d: 620 },
      { from: "berlin", to: "tallinn", count30d: 520 },
      { from: "berlin", to: "prag", count30d: 480 },
      { from: "berlin", to: "bali", count30d: 450 },
      { from: "berlin", to: "budapest", count30d: 350 },
      { from: "berlin", to: "tbilisi", count30d: 380 },
      { from: "berlin", to: "singapur", count30d: 380 },
      { from: "berlin", to: "warschau", count30d: 320 },
      { from: "berlin", to: "new-york", count30d: 320 },
      { from: "berlin", to: "bangkok", count30d: 310 },
      { from: "berlin", to: "miami", count30d: 280 },
      { from: "berlin", to: "bukarest", count30d: 280 },
      { from: "berlin", to: "kapstadt", count30d: 180 },
      { from: "hamburg", to: "lissabon", count30d: 980 },
      { from: "hamburg", to: "barcelona", count30d: 820 },
      { from: "hamburg", to: "amsterdam", count30d: 760 },
      { from: "hamburg", to: "wien", count30d: 650 },
      { from: "hamburg", to: "dubai", count30d: 520 },
      { from: "hamburg", to: "tallinn", count30d: 380 },
      { from: "hamburg", to: "prag", count30d: 320 },
      { from: "hamburg", to: "madrid", count30d: 310 },
      { from: "hamburg", to: "warschau", count30d: 240 },
      { from: "muenchen", to: "wien", count30d: 1100 },
      { from: "muenchen", to: "lissabon", count30d: 850 },
      { from: "muenchen", to: "zuerich", count30d: 750 },
      { from: "muenchen", to: "barcelona", count30d: 680 },
      { from: "muenchen", to: "dubai", count30d: 580 },
      { from: "muenchen", to: "amsterdam", count30d: 520 },
      { from: "muenchen", to: "madrid", count30d: 420 },
      { from: "muenchen", to: "prag", count30d: 380 },
      { from: "muenchen", to: "budapest", count30d: 320 },
      { from: "muenchen", to: "miami", count30d: 280 },
      { from: "muenchen", to: "tbilisi", count30d: 220 },
      { from: "wien", to: "lissabon", count30d: 420 },
      { from: "wien", to: "barcelona", count30d: 380 },
      { from: "wien", to: "dubai", count30d: 280 },
      { from: "wien", to: "tallinn", count30d: 180 },
      { from: "prag", to: "lissabon", count30d: 220 },
      { from: "prag", to: "berlin", count30d: 280 },
      { from: "budapest", to: "lissabon", count30d: 280 },
      { from: "amsterdam", to: "lissabon", count30d: 180 },
      { from: "amsterdam", to: "barcelona", count30d: 160 },
      { from: "barcelona", to: "berlin", count30d: 180 },
    ];

    for (const p of searchPairs) {
      const fromCityId = cityMap.get(p.from);
      const toCityId   = cityMap.get(p.to);
      if (!fromCityId || !toCityId) continue;
      const count7d  = Math.round(p.count30d / 4);
      const count90d = Math.round(p.count30d * 3);
      for (const [period, searchCount] of [["7d", count7d], ["30d", p.count30d], ["90d", count90d]] as const) {
        await prisma.citySearchAggregate.upsert({
          where:  { fromCityId_toCityId_period: { fromCityId, toCityId, period } },
          update: { searchCount, updatedAt: now },
          create: { fromCityId, toCityId, searchCount, period, updatedAt: now },
        });
      }
    }
  }

  // ─── MovingGuide Steps ────────────────────────────────────────────────────
  async function seedMovingGuide(citySlug: string, steps: Array<{
    stepOrder: number; phase: string; titleDE: string; titleEN: string;
    subtitleDE?: string; subtitleEN?: string; timingDE: string; timingEN: string;
    isWarning?: boolean; documents: Record<string, string>[]; infoBoxDE?: string; infoBoxEN?: string;
    infoBoxType?: string; tags?: string[];
    forEmployed?: boolean; forFreelancer?: boolean; forFounder?: boolean; forFamily?: boolean;
    section?: string; riskLevel?: string; requiresLegalAdvice?: boolean;
    sourceUrl?: string; sourceLabel?: string; lastVerified?: Date; translationSource?: string;
  }>) {
    const cityId = cityMap.get(citySlug);
    if (!cityId) return;
    const existing = await prisma.movingGuide.count({ where: { cityId } });
    if (existing > 0) return;
    for (const s of steps) {
      await prisma.movingGuide.create({
        data: {
          cityId,
          stepOrder: s.stepOrder, phase: s.phase,
          section: s.section ?? 'bureaucracy',
          titleDE: s.titleDE, titleEN: s.titleEN,
          subtitleDE: s.subtitleDE, subtitleEN: s.subtitleEN,
          timingDE: s.timingDE, timingEN: s.timingEN,
          isWarning: s.isWarning ?? false,
          documents: s.documents,
          infoBoxDE: s.infoBoxDE, infoBoxEN: s.infoBoxEN,
          infoBoxType: s.infoBoxType,
          tags: s.tags ?? [],
          forEmployed: s.forEmployed ?? true,
          forFreelancer: s.forFreelancer ?? true,
          forFounder: s.forFounder ?? true,
          forFamily: s.forFamily ?? true,
          isActive: true,
          riskLevel: s.riskLevel ?? 'low',
          requiresLegalAdvice: s.requiresLegalAdvice ?? false,
          sourceUrl: s.sourceUrl,
          sourceLabel: s.sourceLabel,
          lastVerified: s.lastVerified,
          translationSource: s.translationSource ?? 'manual',
        },
      });
    }
  }

  await seedMovingGuide("lissabon", [
    { stepOrder: 0, phase: "critical", titleDE: "Wegzugsbesteuerung prüfen (§6 AStG)", titleEN: "Exit tax check (§6 AStG)", subtitleDE: "Gilt bei GmbH-Anteilen, Depot >1 % oder stillen Reserven", subtitleEN: "Applies to GmbH shares, >1% depots or hidden reserves", timingDE: "Sofort — vor jeder Planung", timingEN: "Immediately — before any planning", isWarning: true, infoBoxDE: "Bei GmbH-Beteiligungen oder Wertpapierdepots über 1 % Anteil greift §6 AStG: fiktive Veräußerung bei Wegzug. Bei EU-Zielland (Portugal) Stundung möglich — aber Zinsen laufen. Steuerberater beauftragen.", infoBoxEN: "If you hold GmbH shares or securities >1%, §6 AStG applies: deemed disposal on exit. EU destination allows deferral — but interest accrues. Engage a tax advisor.", infoBoxType: "danger", documents: [{ titleDE: "GmbH-Gesellschaftsvertrag", titleEN: "GmbH articles" }, { titleDE: "Depot-Auszug 12 Monate", titleEN: "Depot statement 12 months" }], tags: ["critical", "external_expert"] },
    { stepOrder: 1, phase: "before_move", titleDE: "Abmeldung in Deutschland vorbereiten", titleEN: "Prepare deregistration in Germany", timingDE: "6 Monate vor Umzug", timingEN: "6 months before move", documents: [{ titleDE: "Wohnungsgeberbestätigung", titleEN: "Landlord confirmation" }], infoBoxDE: "Abmeldung beim Einwohnermeldeamt: frühestens 1 Woche vor Auszug, spätestens 2 Wochen danach.", infoBoxType: "info", tags: ["doc_needed", "timing_critical"] },
    { stepOrder: 2, phase: "before_move", titleDE: "NIF (Steuernummer) Portugal beantragen", titleEN: "Apply for NIF (tax number) Portugal", timingDE: "4–6 Monate vor Umzug", timingEN: "4–6 months before move", documents: [{ titleDE: "Reisepass oder Personalausweis", titleEN: "Passport or ID card" }, { titleDE: "Vollmacht (wenn per Anwalt)", titleEN: "Power of attorney (if via lawyer)" }], infoBoxDE: "NIF bei der Finanças (AT) oder per Anwalt beantragen. Ohne NIF kein Bankkonto, keine Wohnung.", infoBoxType: "info", tags: ["doc_needed"] },
    { stepOrder: 3, phase: "3_months", titleDE: "Wohnung in Portugal finden", titleEN: "Find accommodation in Portugal", timingDE: "3 Monate vor Umzug", timingEN: "3 months before move", documents: [{ titleDE: "Mietvertrag", titleEN: "Rental agreement" }, { titleDE: "NIF des Vermieters", titleEN: "Landlord NIF" }], infoBoxDE: "Ohne NIF kein legaler Mietvertrag. Portale: Idealista, Imovirtual, Uniplaces.", infoBoxType: "info", tags: [] },
    { stepOrder: 4, phase: "3_months", titleDE: "Krankenversicherung für Übergangszeit klären", titleEN: "Arrange health insurance for transition", timingDE: "3 Monate vor Umzug", timingEN: "3 months before move", documents: [{ titleDE: "GKV-Abmeldebescheinigung", titleEN: "GKV deregistration certificate" }, { titleDE: "Internationale KV-Bestätigung", titleEN: "International health insurance confirmation" }], infoBoxDE: "GKV gilt max. 3 Monate im EU-Ausland (EHIC). Danach: SNS (staatliches PT-System) nach Wohnsitzanmeldung.", infoBoxType: "warning", tags: ["doc_needed", "timing_critical"] },
    { stepOrder: 5, phase: "arrival", titleDE: "Anmeldung bei der Câmara Municipal", titleEN: "Register at Câmara Municipal", timingDE: "Erste Woche nach Ankunft", timingEN: "First week after arrival", documents: [{ titleDE: "Mietvertrag oder Eigentumsnachweis", titleEN: "Rental agreement or property deed" }, { titleDE: "Reisepass", titleEN: "Passport" }], infoBoxDE: "Atestado de Residência ausstellen lassen. Basis für alle weiteren Behördengänge.", infoBoxType: "info", tags: ["doc_needed"] },
    { stepOrder: 6, phase: "first_month", titleDE: "Portugiesisches Bankkonto eröffnen", titleEN: "Open Portuguese bank account", timingDE: "Erste 30 Tage", timingEN: "First 30 days", documents: [{ titleDE: "Reisepass", titleEN: "Passport" }, { titleDE: "NIF", titleEN: "NIF" }, { titleDE: "Atestado de Residência", titleEN: "Residence certificate" }], tags: ["doc_needed"] },
    { stepOrder: 7, phase: "first_month", titleDE: "SNS-Gesundheitsversorgung registrieren", titleEN: "Register with SNS health service", timingDE: "Erste 30 Tage", timingEN: "First 30 days", documents: [{ titleDE: "Atestado de Residência", titleEN: "Residence certificate" }, { titleDE: "NIF", titleEN: "NIF" }], infoBoxDE: "SNS (Serviço Nacional de Saúde) ist nach Anmeldung kostenlos nutzbar.", infoBoxType: "info", tags: ["doc_needed"] },
    { stepOrder: 8, phase: "first_3_months", titleDE: "IFICI+ Steuerregime beantragen", titleEN: "Apply for IFICI+ tax regime", subtitleDE: "Frist: bis 15. März des Folgejahres", subtitleEN: "Deadline: by 15 March of the following year", timingDE: "Innerhalb 3 Monate nach Steuerregistrierung", timingEN: "Within 3 months of tax registration", documents: [{ titleDE: "Vertrag / Freelancer-Nachweis", titleEN: "Contract / freelance proof" }, { titleDE: "Nachweis qualifizierter Tätigkeit", titleEN: "Proof of qualifying activity" }], infoBoxDE: "IFICI+: 20 % Flat Tax für 10 Jahre. Antrag bei der AT. Nur für qualifizierte Berufe.", infoBoxType: "warning", tags: ["timing_critical", "external_expert", "doc_needed"] },
  ]);

  // Porto: gleiche Steps wie Lissabon
  const lisboaSteps = await prisma.movingGuide.findMany({ where: { cityId: cityMap.get("lissabon") } });
  const portoCityId = cityMap.get("porto");
  if (portoCityId) {
    const portoExisting = await prisma.movingGuide.count({ where: { cityId: portoCityId } });
    if (portoExisting === 0) {
      for (const s of lisboaSteps) {
        const { id, cityId: _, documents, tags, ...rest } = s;
        await prisma.movingGuide.create({ data: { ...rest, cityId: portoCityId, documents: (documents ?? []) as object[], tags: (tags ?? []) as object[] } });
      }
    }
  }

  await seedMovingGuide("barcelona", [
    { stepOrder: 0, phase: "critical", titleDE: "Wegzugsbesteuerung prüfen (§6 AStG)", titleEN: "Exit tax check (§6 AStG)", timingDE: "Sofort — vor jeder Planung", timingEN: "Immediately — before any planning", isWarning: true, infoBoxDE: "§6 AStG bei GmbH-Beteiligungen oder Depot >1 %. Spanien ist EU → Stundung möglich.", infoBoxType: "danger", documents: [], tags: ["critical", "external_expert"] },
    { stepOrder: 1, phase: "before_move", titleDE: "NIE (Número de Identificación de Extranjero) beantragen", titleEN: "Apply for NIE", timingDE: "4–6 Monate vor Umzug", timingEN: "4–6 months before move", documents: [{ titleDE: "Reisepass", titleEN: "Passport" }, { titleDE: "Ausgefülltes EX-15-Formular", titleEN: "Completed EX-15 form" }], infoBoxDE: "NIE ist die Steuer- und Identifikationsnummer für Ausländer. Ohne NIE kein Bankkonto, kein Mietvertrag.", infoBoxType: "info", tags: ["doc_needed", "timing_critical"] },
    { stepOrder: 2, phase: "before_move", titleDE: "Beckham Law — Frist kennen", titleEN: "Beckham Law — know the deadline", timingDE: "Vor Umzug recherchieren", timingEN: "Research before moving", isWarning: true, infoBoxDE: "Beckham Law muss innerhalb 6 Monate nach erstmaliger Wohnsitznahme beantragt werden.", infoBoxType: "warning", documents: [], tags: ["timing_critical", "external_expert"] },
    { stepOrder: 3, phase: "3_months", titleDE: "Empadronamiento (Wohnsitzanmeldung)", titleEN: "Empadronamiento (residence registration)", timingDE: "Unmittelbar nach Einzug", timingEN: "Immediately after moving in", documents: [{ titleDE: "Mietvertrag", titleEN: "Rental agreement" }, { titleDE: "Reisepass", titleEN: "Passport" }], infoBoxDE: "Empadronamiento beim Ajuntament. Basis für öffentliche Dienste, Gesundheitsversorgung und Beckham Law.", infoBoxType: "info", tags: ["doc_needed"] },
    { stepOrder: 4, phase: "arrival", titleDE: "Spanisches Bankkonto eröffnen", titleEN: "Open Spanish bank account", timingDE: "Erste Woche nach Ankunft", timingEN: "First week after arrival", documents: [{ titleDE: "NIE", titleEN: "NIE" }, { titleDE: "Empadronamiento", titleEN: "Empadronamiento" }, { titleDE: "Reisepass", titleEN: "Passport" }], tags: ["doc_needed"] },
    { stepOrder: 5, phase: "first_month", titleDE: "Krankenversicherung (CatSalut / Seguridad Social)", titleEN: "Health insurance (CatSalut / Seguridad Social)", timingDE: "Erste 30 Tage", timingEN: "First 30 days", documents: [{ titleDE: "Empadronamiento", titleEN: "Empadronamiento" }, { titleDE: "NIE", titleEN: "NIE" }], infoBoxDE: "Nach Anmeldung: CatSalut (Katalonien) kostenlos nutzbar.", infoBoxType: "info", tags: [] },
    { stepOrder: 6, phase: "first_3_months", titleDE: "Beckham Law Antrag stellen", titleEN: "Apply for Beckham Law", subtitleDE: "Frist: 6 Monate ab erstem Tag in Spanien", subtitleEN: "Deadline: 6 months from first day in Spain", timingDE: "Innerhalb 6 Monate nach Wohnsitznahme", timingEN: "Within 6 months of establishing residence", documents: [{ titleDE: "Formular 149", titleEN: "Form 149" }, { titleDE: "Nachweis Auslandsherkunft/Anstellung", titleEN: "Proof of foreign origin/employment" }], infoBoxDE: "Formular 149 bei der Agencia Tributaria einreichen. 24 % Flat Tax für 6 Jahre.", infoBoxType: "warning", tags: ["timing_critical", "external_expert", "doc_needed"] },
  ]);

  // Madrid: gleiche Steps wie Barcelona
  const barcelonaSteps = await prisma.movingGuide.findMany({ where: { cityId: cityMap.get("barcelona") } });
  const madridCityId = cityMap.get("madrid");
  if (madridCityId) {
    const madridExisting = await prisma.movingGuide.count({ where: { cityId: madridCityId } });
    if (madridExisting === 0) {
      for (const s of barcelonaSteps) {
        const { id, cityId: _, documents, tags, ...rest } = s;
        await prisma.movingGuide.create({ data: { ...rest, cityId: madridCityId, documents: (documents ?? []) as object[], tags: (tags ?? []) as object[] } });
      }
    }
  }

  await seedMovingGuide("dubai", [
    { stepOrder: 0, phase: "critical", titleDE: "Doppelte Steuerpflicht Deutschland prüfen", titleEN: "Check double tax obligation Germany", timingDE: "Sofort — vor jeder Planung", timingEN: "Immediately — before any planning", isWarning: true, infoBoxDE: "UAE ist kein EU-Land. Kein DBA Deutschland-UAE auf Einkommen. Beschränkte Steuerpflicht in DE für inländische Einkünfte bleibt bestehen.", infoBoxType: "danger", documents: [], tags: ["critical", "external_expert"] },
    { stepOrder: 1, phase: "before_move", titleDE: "Aufenthaltsvisum UAE organisieren", titleEN: "Arrange UAE residence visa", timingDE: "3–6 Monate vor Umzug", timingEN: "3–6 months before move", documents: [{ titleDE: "Reisepass (6+ Monate gültig)", titleEN: "Passport (6+ months validity)" }, { titleDE: "Arbeitsvertrag oder Gewerbeschein", titleEN: "Employment contract or trade license" }], infoBoxDE: "Optionen: Employment Visa, Freelance Visa, Investor Visa. Ohne Residency-Visum kein Bankkonto, keine Wohnung.", infoBoxType: "info", tags: ["doc_needed", "timing_critical"] },
    { stepOrder: 2, phase: "arrival", titleDE: "Emirates ID beantragen", titleEN: "Apply for Emirates ID", timingDE: "Erste Woche nach Ankunft", timingEN: "First week after arrival", documents: [{ titleDE: "Visum-Sticker im Pass", titleEN: "Visa sticker in passport" }, { titleDE: "Biometrische Daten", titleEN: "Biometric data" }], infoBoxDE: "Emirates ID ist der zentrale Ausweis für alle Behördengänge, Bankkonten, SIM-Karten. Kosten: ~370 AED.", infoBoxType: "info", tags: ["doc_needed"] },
    { stepOrder: 3, phase: "arrival", titleDE: "Bankkonto Dubai eröffnen", titleEN: "Open Dubai bank account", timingDE: "Erste Woche nach Ankunft", timingEN: "First week after arrival", documents: [{ titleDE: "Emirates ID", titleEN: "Emirates ID" }, { titleDE: "Residency Visa", titleEN: "Residency Visa" }, { titleDE: "Gehaltsnachweis oder Gewerbeschein", titleEN: "Salary slip or trade license" }], tags: ["doc_needed"] },
    { stepOrder: 4, phase: "first_month", titleDE: "Krankenversicherung UAE abschließen", titleEN: "Get UAE health insurance", timingDE: "Pflicht — innerhalb 30 Tage", timingEN: "Mandatory — within 30 days", isWarning: true, documents: [], infoBoxDE: "KV ist in Dubai Pflicht für alle Visainhaber. Arbeitgeber stellt oft Basic Plan.", infoBoxType: "warning", tags: ["timing_critical"] },
    { stepOrder: 5, phase: "first_3_months", titleDE: "Steuerfreie Gehaltsstruktur optimieren", titleEN: "Optimise tax-free salary structure", timingDE: "Innerhalb 3 Monate", timingEN: "Within 3 months", documents: [], infoBoxDE: "In UAE: keine Einkommensteuer, keine Sozialabgaben für Expats. Netto = Brutto.", infoBoxType: "info", tags: [], forFounder: true },
  ]);

  await seedMovingGuide("amsterdam", [
    { stepOrder: 0, phase: "critical", titleDE: "Wegzugsbesteuerung prüfen (§6 AStG)", titleEN: "Exit tax check (§6 AStG)", timingDE: "Sofort", timingEN: "Immediately", isWarning: true, infoBoxDE: "Niederlande ist EU — Stundung der Wegzugssteuer möglich. Trotzdem: GmbH-Anteile und Depot >1 % vor Wegzug klären.", infoBoxType: "danger", documents: [], tags: ["critical", "external_expert"] },
    { stepOrder: 1, phase: "before_move", titleDE: "30%-Ruling Voraussetzungen prüfen", titleEN: "Check 30% Ruling eligibility", timingDE: "Vor Vertragsunterzeichnung", timingEN: "Before signing contract", documents: [], infoBoxDE: "30%-Ruling muss vom Arbeitgeber beantragt werden. Voraussetzungen: Mindestgehalt 46.107 € (2024), Anwerbung aus dem Ausland. Frist: 4 Monate nach Tätigkeitsbeginn.", infoBoxType: "info", tags: ["timing_critical"] },
    { stepOrder: 2, phase: "arrival", titleDE: "BSN-Nummer beantragen (Gemeente)", titleEN: "Apply for BSN number (Gemeente)", timingDE: "Innerhalb 5 Tage nach Ankunft", timingEN: "Within 5 days of arrival", documents: [{ titleDE: "Reisepass", titleEN: "Passport" }, { titleDE: "Mietvertrag oder Wohnungsnachweis", titleEN: "Rental agreement or proof of accommodation" }], infoBoxDE: "BSN (Burger Service Nummer) ist die zentrale Steuernummer. Pflicht für Bankkonto, KV, Arbeitgeber.", infoBoxType: "info", tags: ["doc_needed", "timing_critical"] },
    { stepOrder: 3, phase: "first_month", titleDE: "Niederländische Krankenversicherung abschließen", titleEN: "Get Dutch health insurance", timingDE: "Innerhalb 4 Monate nach Ankunft — Pflicht", timingEN: "Within 4 months of arrival — mandatory", isWarning: true, documents: [], infoBoxDE: "Zorgverzekering (Basispakket) ist Pflicht. Kosten: ca. 140 €/Mo + Eigenrisico 385 €/Jahr.", infoBoxType: "warning", tags: ["timing_critical"] },
    { stepOrder: 4, phase: "first_3_months", titleDE: "Niederländische Steuererklärung vorbereiten", titleEN: "Prepare Dutch tax return", timingDE: "Erste 3 Monate / Folgejahr", timingEN: "First 3 months / following year", documents: [{ titleDE: "Jahresgehaltsnachweis", titleEN: "Annual salary statement" }, { titleDE: "30%-Ruling Bescheid", titleEN: "30% Ruling approval" }], infoBoxDE: "30%-Ruling vereinfacht die Steuererklärung erheblich. Digitale Abgabe über MijnBelastingdienst. Frist: 1. Mai.", infoBoxType: "info", tags: [] },
  ]);

  await seedMovingGuide("bangkok", [
    { stepOrder: 0, phase: "critical", titleDE: "Steuerresidenz Deutschland aufgeben — prüfen", titleEN: "Check German tax residency termination", timingDE: "Sofort", timingEN: "Immediately", isWarning: true, infoBoxDE: "Thailand ist kein EU-Land. Kein DBA Deutschland-Thailand auf Einkommen. Doppelte Steuerpflicht möglich wenn Wohnort in DE verbleibt.", infoBoxType: "danger", documents: [], tags: ["critical", "external_expert"] },
    { stepOrder: 1, phase: "before_move", titleDE: "Visum für Thailand klären", titleEN: "Clarify visa for Thailand", timingDE: "3–6 Monate vor Umzug", timingEN: "3–6 months before move", documents: [{ titleDE: "Reisepass", titleEN: "Passport" }], infoBoxDE: "Optionen: Non-Immigrant B (Arbeit), Thailand LTR Visa (10 Jahre), Thailand Elite Visa. Tourist Visa nur 60 Tage.", infoBoxType: "info", tags: ["doc_needed"] },
    { stepOrder: 2, phase: "arrival", titleDE: "90-Tage-Meldepflicht kennen", titleEN: "Know the 90-day reporting obligation", timingDE: "Erste Woche nach Ankunft", timingEN: "First week after arrival", documents: [], infoBoxDE: "Ausländer mit Non-Immigrant Visa müssen alle 90 Tage ihren Wohnort bei der Immigration melden (TM-30 Formular). Verstoß: 2.000 THB Strafe.", infoBoxType: "warning", tags: ["timing_critical"] },
    { stepOrder: 3, phase: "first_month", titleDE: "Bankkonto Thailand eröffnen", titleEN: "Open Thai bank account", timingDE: "Erste 30 Tage", timingEN: "First 30 days", documents: [{ titleDE: "Reisepass", titleEN: "Passport" }, { titleDE: "Work Permit oder Visa-Nachweis", titleEN: "Work permit or visa evidence" }, { titleDE: "Mietvertrag", titleEN: "Rental agreement" }], infoBoxDE: "Kasikorn Bank (KBank) oder Bangkok Bank empfehlenswert für Ausländer.", infoBoxType: "info", tags: ["doc_needed"] },
    { stepOrder: 4, phase: "first_month", titleDE: "Private Krankenversicherung abschließen", titleEN: "Get private health insurance", timingDE: "Vor Ankunft oder sofort danach", timingEN: "Before arrival or immediately after", documents: [], infoBoxDE: "Kein staatliches KV-System für Ausländer in Thailand. Internationale KV: AXA, BUPA, Cigna ab ~80 €/Mo.", infoBoxType: "warning", tags: ["timing_critical"] },
    { stepOrder: 5, phase: "first_3_months", titleDE: "Steuerresidenz Thailand prüfen (TRD)", titleEN: "Check Thai tax residency (TRD)", timingDE: "Innerhalb 3 Monate", timingEN: "Within 3 months", documents: [], infoBoxDE: "Ab 180 Tagen/Jahr in Thailand: Steuerresident. Ausländische Einkünfte die IN Thailand überwiesen werden, sind seit 2024 steuerpflichtig.", infoBoxType: "warning", tags: ["external_expert"] },
  ]);

  // Chiang Mai: gleiche Steps wie Bangkok
  const bangkokSteps = await prisma.movingGuide.findMany({ where: { cityId: cityMap.get("bangkok") } });
  const chiangMaiCityId = cityMap.get("chiang-mai");
  if (chiangMaiCityId) {
    const cmExisting = await prisma.movingGuide.count({ where: { cityId: chiangMaiCityId } });
    if (cmExisting === 0) {
      for (const s of bangkokSteps) {
        const { id, cityId: _, documents, tags, ...rest } = s;
        await prisma.movingGuide.create({ data: { ...rest, cityId: chiangMaiCityId, documents: (documents ?? []) as object[], tags: (tags ?? []) as object[] } });
      }
    }
  }

  await seedMovingGuide("wien", [
    { stepOrder: 0, phase: "critical", titleDE: "Wegzugsbesteuerung prüfen (§6 AStG)", titleEN: "Exit tax check (§6 AStG)", timingDE: "Sofort", timingEN: "Immediately", isWarning: true, infoBoxDE: "Bei GmbH-Anteilen oder Depot > 1 % greift §6 AStG. Österreich hat ein DBA mit Deutschland — Stundung möglich.", infoBoxType: "danger", documents: [], tags: ["critical", "external_expert"] },
    { stepOrder: 1, phase: "before_move", titleDE: "Abmeldung in Deutschland", titleEN: "Deregister in Germany", timingDE: "1–2 Wochen vor Auszug", timingEN: "1–2 weeks before moving", documents: [{ titleDE: "Personalausweis / Reisepass", titleEN: "ID card / Passport" }], infoBoxDE: "Beim Einwohnermeldeamt abmelden. Abmeldebescheinigung für Österreich aufbewahren.", infoBoxType: "info", tags: ["doc_needed", "timing_critical"] },
    { stepOrder: 2, phase: "before_move", titleDE: "Wohnung in Wien finden & Mietvertrag", titleEN: "Find apartment in Vienna", timingDE: "2–3 Monate vor Umzug", timingEN: "2–3 months before move", documents: [{ titleDE: "Mietvertrag", titleEN: "Rental agreement" }], infoBoxDE: "Ohne Hauptwohnsitz in Wien ist die Anmeldung nicht möglich.", infoBoxType: "info", tags: ["doc_needed"] },
    { stepOrder: 3, phase: "arrival", titleDE: "Anmeldung Wien (Meldezettel)", titleEN: "Register residence in Vienna (Meldezettel)", timingDE: "Innerhalb 3 Tage nach Einzug", timingEN: "Within 3 days of moving in", documents: [{ titleDE: "Reisepass oder Personalausweis", titleEN: "Passport or ID" }, { titleDE: "Mietvertrag", titleEN: "Rental agreement" }], infoBoxDE: "Anmeldung beim Magistratischen Bezirksamt (MBA) oder online via oesterreich.gv.at. Muss innerhalb 3 Werktagen erfolgen.", infoBoxType: "warning", tags: ["doc_needed", "timing_critical"] },
    { stepOrder: 4, phase: "first_month", titleDE: "E-Card beantragen (österreichische Krankenversicherung)", titleEN: "Apply for E-Card (Austrian health insurance)", timingDE: "Erste 30 Tage", timingEN: "First 30 days", documents: [{ titleDE: "Meldezettel", titleEN: "Registration certificate" }, { titleDE: "Reisepass", titleEN: "Passport" }], infoBoxDE: "Als EU-Bürger gilt die EHIC-Karte übergangsweise. Bei Beschäftigung: automatisch über Arbeitgeber.", infoBoxType: "info", tags: ["doc_needed"] },
    { stepOrder: 5, phase: "first_month", titleDE: "Österreichische Steuernummer beantragen", titleEN: "Apply for Austrian tax number", timingDE: "Innerhalb 30 Tage", timingEN: "Within 30 days", documents: [{ titleDE: "Meldezettel", titleEN: "Registration certificate" }, { titleDE: "Personalausweis", titleEN: "ID card" }], infoBoxDE: "Beim zuständigen Finanzamt oder online über FinanzOnline (finanzonline.bmf.gv.at).", infoBoxType: "info", tags: ["doc_needed"] },
  ]);

  await seedMovingGuide("tallinn", [
    { stepOrder: 0, phase: "critical", titleDE: "Steuerresidenz Deutschland aufgeben", titleEN: "Terminate German tax residency", timingDE: "Sofort", timingEN: "Immediately", isWarning: true, infoBoxDE: "Estland hat ein DBA mit Deutschland. Vollständige Abmeldung in DE erforderlich. OÜ-Gründer: §7 AStG (Hinzurechnungsbesteuerung) beachten.", infoBoxType: "danger", documents: [], tags: ["critical", "external_expert"] },
    { stepOrder: 1, phase: "before_move", titleDE: "e-Residency beantragen (optional)", titleEN: "Apply for e-Residency (optional)", timingDE: "3–6 Monate vor Umzug", timingEN: "3–6 months before move", documents: [{ titleDE: "Reisepass", titleEN: "Passport" }, { titleDE: "Motivationsschreiben", titleEN: "Statement of purpose" }], infoBoxDE: "e-Residency ersetzt KEINE physische Residency. Nützlich für OÜ-Verwaltung aus dem Ausland. Gebühr: 100–120 €.", infoBoxType: "info", tags: [] },
    { stepOrder: 2, phase: "before_move", titleDE: "Aufenthaltsgenehmigung für EU-Bürger registrieren", titleEN: "Register EU residence right", timingDE: "Innerhalb 3 Monate nach Ankunft", timingEN: "Within 3 months of arrival", documents: [{ titleDE: "Reisepass oder Personalausweis", titleEN: "Passport or ID" }, { titleDE: "Mietvertrag oder Eigentumsnachweis", titleEN: "Rental agreement or ownership proof" }], infoBoxDE: "EU-Bürger müssen sich bei der Police and Border Guard Board (PPA) registrieren lassen.", infoBoxType: "warning", tags: ["doc_needed", "timing_critical"] },
    { stepOrder: 3, phase: "arrival", titleDE: "Meldeadresse im Einwohnerregister (Rahvastikuregister)", titleEN: "Register address in Population Register", timingDE: "Erste Woche nach Ankunft", timingEN: "First week after arrival", documents: [{ titleDE: "Personalausweis oder Reisepass", titleEN: "ID or Passport" }, { titleDE: "Mietvertrag", titleEN: "Rental agreement" }], infoBoxDE: "Meldung über eesti.ee (State Portal) möglich mit EU-Personalausweis.", infoBoxType: "info", tags: ["doc_needed"] },
    { stepOrder: 4, phase: "first_month", titleDE: "Bankkonto in Estland eröffnen", titleEN: "Open Estonian bank account", timingDE: "Erste 30 Tage", timingEN: "First 30 days", documents: [{ titleDE: "Reisepass", titleEN: "Passport" }, { titleDE: "Meldenachweis", titleEN: "Proof of registration" }], infoBoxDE: "LHV Bank oder Coop Pank für EU-Bürger zugänglicher.", infoBoxType: "info", tags: ["doc_needed"] },
    { stepOrder: 5, phase: "first_month", titleDE: "Estnische Krankenversicherung (EHIF) einschreiben", titleEN: "Enroll in Estonian health insurance (EHIF)", timingDE: "Innerhalb 30 Tage", timingEN: "Within 30 days", documents: [{ titleDE: "Arbeitsvertrag oder Gewerbeschein", titleEN: "Employment contract or business registration" }], infoBoxDE: "Pflichtversicherung über Arbeitgeber oder Selbstständige zahlen Sozialsteuer (33 %). Mindestbeitrag: ca. 620 €/Monat Berechnungsbasis.", infoBoxType: "warning", tags: ["external_expert"] },
    { stepOrder: 6, phase: "first_3_months", titleDE: "Steuerliche Registrierung (Maksu- ja Tolliamet)", titleEN: "Tax registration (Estonian Tax and Customs Board)", timingDE: "Innerhalb 3 Monate", timingEN: "Within 3 months", documents: [], infoBoxDE: "OÜ-Inhaber: Einkommensteuererklärung jährlich bis 30. April. Estland besteuert Unternehmensgewinne erst bei Ausschüttung.", infoBoxType: "info", tags: ["external_expert"] },
  ]);

  // ─── Buenos Aires ─────────────────────────────────────────────────────────
  const NOW = new Date("2026-05-24");
  await seedMovingGuide("buenos-aires", [

    // ── SECTION: bureaucracy ──────────────────────────────────────────────
    {
      stepOrder: 0, phase: "critical", section: "bureaucracy",
      titleDE: "Wegzugsbesteuerung prüfen (§6 AStG)",
      titleEN: "Exit tax check (§6 AStG)",
      subtitleDE: "Pflicht vor jeder Auswanderungsplanung",
      subtitleEN: "Mandatory before any relocation planning",
      timingDE: "Sofort — vor jeder Planung", timingEN: "Immediately — before any planning",
      isWarning: true, riskLevel: "high", requiresLegalAdvice: true,
      sourceUrl: "https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/Internationales_Steuerrecht/Allgemeine_Informationen/2021-11-03-AO-Internationales-Steuerrecht.html",
      sourceLabel: "Bundesfinanzministerium — §6 AStG 2024", lastVerified: NOW,
      infoBoxDE: "Kein DBA Deutschland–Argentinien (seit 2012 außer Kraft). §6 AStG greift bei GmbH-Anteilen >1 % oder Wertpapierdepots >1 %. Fiktive Veräußerungssteuer wird fällig — kein EU-Stundungsrecht. Steuerberater beauftragen, bevor ein Flug gebucht wird.",
      infoBoxEN: "No DTA Germany–Argentina (terminated 2012). §6 AStG applies to GmbH stakes >1% or securities portfolios >1%. Deemed disposal tax becomes due — no EU deferral right applies. Engage a tax advisor before booking any flights.",
      infoBoxType: "danger",
      documents: [{ titleDE: "GmbH-Gesellschaftsvertrag", titleEN: "GmbH articles" }, { titleDE: "Depot-Auszug (letzte 12 Monate)", titleEN: "Securities depot statement (last 12 months)" }],
      tags: ["critical", "external_expert"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 1, phase: "before_move", section: "bureaucracy",
      titleDE: "Visafreiheit & Einreise klären",
      titleEN: "Check visa-free entry rules",
      timingDE: "6 Monate vor Umzug", timingEN: "6 months before move",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      sourceUrl: "https://www.argentina.gob.ar/interior/migraciones/tramites/extranjeros",
      sourceLabel: "Dirección Nacional de Migraciones Argentina 2025",
      infoBoxDE: "Deutsche können visumfrei für bis zu 90 Tage einreisen. Für längere Aufenthalte: Residencia temporaria erforderlich (s. nächster Schritt).",
      infoBoxEN: "German nationals may enter Argentina visa-free for up to 90 days. Longer stays require a temporary residence permit (see next step).",
      infoBoxType: "info",
      documents: [{ titleDE: "Reisepass (mind. 6 Monate gültig)", titleEN: "Passport (min. 6 months validity)" }],
      tags: ["doc_needed"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 2, phase: "before_move", section: "bureaucracy",
      titleDE: "Residencia temporaria beantragen",
      titleEN: "Apply for temporary residence permit",
      subtitleDE: "Voraussetzung für DNI und Arbeitserlaubnis",
      subtitleEN: "Required for DNI and work authorisation",
      timingDE: "3–6 Monate vor Umzug oder bei Ankunft", timingEN: "3–6 months before move or on arrival",
      riskLevel: "medium", requiresLegalAdvice: false, lastVerified: NOW,
      sourceUrl: "https://www.argentina.gob.ar/interior/migraciones/tramites/extranjeros/residencia-temporaria",
      sourceLabel: "Migraciones Argentina — Residencia Temporaria 2025",
      infoBoxDE: "Kategorien: Trabajador (Arbeitnehmer), Rentista (passives Einkommen min. ~1.500 USD/Monat), Pensionado. Bearbeitungszeit: 3–6 Monate. Antrag bei der Dirección Nacional de Migraciones (DNM) in Buenos Aires oder argentinischem Konsulat in Deutschland.",
      infoBoxEN: "Categories: Trabajador (employee), Rentista (passive income min. ~USD 1,500/month), Pensionado. Processing time: 3–6 months. Apply at DNM in Buenos Aires or Argentine consulate in Germany.",
      infoBoxType: "info",
      documents: [
        { titleDE: "Reisepass", titleEN: "Passport" },
        { titleDE: "Führungszeugnis (beglaubigt + apostilliert)", titleEN: "Police clearance certificate (certified + apostilled)" },
        { titleDE: "Geburts- oder Heiratsurkunde (apostilliert)", titleEN: "Birth or marriage certificate (apostilled)" },
        { titleDE: "Einkommensnachweis (für Rentista)", titleEN: "Income proof (for Rentista)" },
      ],
      tags: ["doc_needed", "timing_critical"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 3, phase: "arrival", section: "bureaucracy",
      titleDE: "DNI (Documento Nacional de Identidad) beantragen",
      titleEN: "Apply for DNI (national identity document)",
      subtitleDE: "Ermöglicht Bankkonto, Mietvertrag, Behördengänge",
      subtitleEN: "Enables bank account, rental contracts, public services",
      timingDE: "Nach Erhalt der Residencia — sofort", timingEN: "After receiving residencia — immediately",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      sourceUrl: "https://www.argentina.gob.ar/tramites/obtener-el-dni",
      sourceLabel: "Argentina.gob.ar — DNI 2025",
      infoBoxDE: "DNI-Antrag beim RENAPER (Registro Nacional de las Personas). Wartezeit: 1–4 Wochen. Ohne DNI kein argentinisches Bankkonto möglich.",
      infoBoxEN: "DNI application at RENAPER (National Registry of Persons). Wait time: 1–4 weeks. Without DNI, no Argentine bank account is possible.",
      infoBoxType: "info",
      documents: [{ titleDE: "Residencia-Bescheid", titleEN: "Residencia approval" }, { titleDE: "Reisepass", titleEN: "Passport" }],
      tags: ["doc_needed"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 4, phase: "arrival", section: "bureaucracy",
      titleDE: "Anmeldung beim deutschen Konsulat Buenos Aires",
      titleEN: "Register at German Consulate Buenos Aires",
      timingDE: "Innerhalb 3 Monate nach Ankunft", timingEN: "Within 3 months of arrival",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      sourceUrl: "https://buenos-aires.diplo.de/ar-de/service/buergerservice/-/2328596",
      sourceLabel: "Deutsche Botschaft Buenos Aires 2025",
      infoBoxDE: "Auslandsregistrierung ermöglicht: Briefwahl, Passverlängerung vor Ort, Konsulatsnotfall-Service. Zuständige Behörde: Deutsche Botschaft, Villanueva 1055, C1426BMC CABA. Termine online buchbar.",
      infoBoxEN: "Overseas registration enables: absentee voting, passport renewal on-site, consular emergency services. Address: Deutsche Botschaft, Villanueva 1055, C1426BMC CABA. Appointments bookable online.",
      infoBoxType: "info",
      documents: [{ titleDE: "Reisepass", titleEN: "Passport" }, { titleDE: "Mietvertrag oder Adressnachweis", titleEN: "Rental contract or proof of address" }],
      tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 5, phase: "first_3_months", section: "bureaucracy",
      titleDE: "AFIP-Steuerregistrierung (CUIT/CUIL beantragen)",
      titleEN: "Register with AFIP (apply for CUIT/CUIL)",
      subtitleDE: "Argentinische Steuer-ID — Pflicht für Selbstständige und Angestellte",
      subtitleEN: "Argentine tax ID — mandatory for freelancers and employees",
      timingDE: "Innerhalb 90 Tage nach DNI-Erhalt", timingEN: "Within 90 days of receiving DNI",
      riskLevel: "medium", requiresLegalAdvice: false, lastVerified: NOW,
      sourceUrl: "https://www.afip.gob.ar/claveFiscal/",
      sourceLabel: "AFIP — Administración Federal de Ingresos Públicos 2025",
      infoBoxDE: "CUIL für Angestellte, CUIT für Selbstständige. Benötigt DNI. Registrierung online über afip.gob.ar mit Clave Fiscal (digitale Signatur). Pflicht für Steuererklärung und Sozialversicherung.",
      infoBoxEN: "CUIL for employees, CUIT for self-employed. Requires DNI. Register online at afip.gob.ar with Clave Fiscal (digital signature). Required for tax returns and social security.",
      infoBoxType: "warning",
      documents: [{ titleDE: "DNI", titleEN: "DNI" }, { titleDE: "Clave Fiscal (AFIP-Zugangscode)", titleEN: "Clave Fiscal (AFIP access code)" }],
      tags: ["doc_needed", "external_expert"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: false,
    },

    // ── SECTION: tax_planning ─────────────────────────────────────────────
    {
      stepOrder: 6, phase: "critical", section: "tax_planning",
      titleDE: "Kein DBA Deutschland–Argentinien — Doppelbesteuerungsrisiko",
      titleEN: "No DTA Germany–Argentina — double taxation risk",
      subtitleDE: "DBA seit 2012 außer Kraft — höchste Risikostufe",
      subtitleEN: "DTA lapsed since 2012 — highest risk level",
      timingDE: "Sofort — vor Wegzug", timingEN: "Immediately — before departure",
      isWarning: true, riskLevel: "high", requiresLegalAdvice: true, lastVerified: NOW,
      sourceUrl: "https://www.bzst.de/DE/Service/Laenderbezogene_Informationen/Argentinien/argentinien_node.html",
      sourceLabel: "Bundeszentralamt für Steuern — Argentinien DBA-Status 2024",
      infoBoxDE: "Das DBA Deutschland–Argentinien (in Kraft 1980, modernisiert 2012) wurde von Argentinien 2009 gekündigt und ist seit 2012 nicht mehr in Kraft. Folge: Einkünfte können in beiden Ländern besteuert werden. Keine Stundungsmöglichkeit bei §6 AStG (kein EU-Land). Steuerberater mit internationalem Profil ist Pflicht vor Wegzug. Hinweis: Quelle nicht final verifizierbar — vor Veröffentlichung manuell prüfen.",
      infoBoxEN: "The Germany–Argentina DTA (in force 1980, updated 2012) was denounced by Argentina in 2009 and has been inactive since 2012. Consequence: income may be taxed in both countries. No deferral right under §6 AStG (non-EU country). An internationally experienced tax advisor is mandatory before relocation. Note: source could not be finally verified — verify manually before publication.",
      infoBoxType: "danger",
      documents: [],
      tags: ["critical", "external_expert"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 7, phase: "before_move", section: "tax_planning",
      titleDE: "Beschränkte Steuerpflicht Deutschland (§49 EStG)",
      titleEN: "Residual German tax liability (§49 EStG)",
      timingDE: "Vor Wegzug klären", timingEN: "Clarify before departure",
      riskLevel: "high", requiresLegalAdvice: true, lastVerified: NOW,
      sourceUrl: "https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/Steuerarten/Einkommensteuer/2020-01-06-beschraenkte-steuerpflicht.html",
      sourceLabel: "Bundesfinanzministerium — Beschränkte Steuerpflicht §49 EStG 2024",
      infoBoxDE: "Nach Wegzug aus Deutschland bleibt beschränkte Steuerpflicht für deutsche Einkunftsquellen bestehen: Mieteinkünfte aus DE-Immobilien, Dividenden aus DE-Kapitalgesellschaften, Lizenzen aus Deutschland. Ohne DBA: keine Anrechnung argentinischer Steuer auf deutsche Quellensteuer. This information is for guidance only. Consult a qualified tax advisor before relocating.",
      infoBoxEN: "After leaving Germany, limited tax liability remains for German-source income: rental income from German properties, dividends from German corporations, German royalties. Without a DTA: no credit of Argentine tax against German withholding tax. This information is for guidance only. Consult a qualified tax advisor before relocating.",
      infoBoxType: "danger",
      documents: [], tags: ["critical", "external_expert"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 8, phase: "before_move", section: "tax_planning",
      titleDE: "Erweiterte unbeschränkte Steuerpflicht (§2 AStG) prüfen",
      titleEN: "Check extended unlimited tax liability (§2 AStG)",
      timingDE: "Vor Wegzug klären", timingEN: "Clarify before departure",
      riskLevel: "high", requiresLegalAdvice: true, lastVerified: NOW,
      sourceUrl: "https://www.gesetze-im-internet.de/astg/__2.html",
      sourceLabel: "Gesetze-im-Internet.de — §2 AStG 2024",
      infoBoxDE: "§2 AStG greift wenn: (1) mind. 5 der letzten 10 Jahre unbeschränkt steuerpflichtig in DE, (2) Zuzug in Niedrigsteuerland (Einkommensteuer <25 %), (3) wesentliche wirtschaftliche Interessen in DE. Argentinien kann je nach persönlicher Situation als Niedrigsteuerland gelten (v.a. bei ARS-Inflation). Prüfung durch Steuerberater dringend empfohlen. This information is for guidance only. Consult a qualified tax advisor before relocating.",
      infoBoxEN: "§2 AStG applies when: (1) unlimited tax liability in Germany for at least 5 of the last 10 years, (2) move to a low-tax country (income tax <25%), (3) significant economic interests remain in Germany. Argentina may qualify as a low-tax country depending on personal circumstances (especially given ARS inflation). Tax advisor review strongly recommended. This information is for guidance only. Consult a qualified tax advisor before relocating.",
      infoBoxType: "danger",
      documents: [], tags: ["critical", "external_expert"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 9, phase: "first_3_months", section: "tax_planning",
      titleDE: "Argentinische Einkommensteuer (Impuesto a las Ganancias)",
      titleEN: "Argentine income tax (Impuesto a las Ganancias)",
      timingDE: "Ab Steuerresidenz (≥183 Tage in AR)", timingEN: "From tax residency (≥183 days in AR)",
      riskLevel: "medium", requiresLegalAdvice: false, lastVerified: NOW,
      sourceUrl: "https://www.afip.gob.ar/ganancias/",
      sourceLabel: "AFIP — Impuesto a las Ganancias 2024",
      infoBoxDE: "Progressive Stufensteuer auf Einkommen: 5 % bis 35 %. Steuerfreibetrag (Mínimo No Imponible) wird jährlich angepasst — 2024 ca. 3 Mio. ARS/Monat. Steuerresidenz ab 183 Tagen Aufenthalt im Kalender­jahr. Jahreserklärung über AFIP-Portal.",
      infoBoxEN: "Progressive income tax brackets: 5% to 35%. Personal allowance (Mínimo No Imponible) adjusted annually — 2024 approx. ARS 3M/month. Tax residency from 183 days per calendar year. Annual return via AFIP portal.",
      infoBoxType: "info",
      documents: [{ titleDE: "CUIT/CUIL", titleEN: "CUIT/CUIL" }],
      tags: ["external_expert"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 10, phase: "first_3_months", section: "tax_planning",
      titleDE: "Währungsrisiko & Steuerberechnungsbasis in ARS",
      titleEN: "Currency risk & tax calculation basis in ARS",
      timingDE: "Laufend beachten", timingEN: "Ongoing consideration",
      riskLevel: "high", requiresLegalAdvice: true, lastVerified: NOW,
      sourceUrl: "https://www.bcra.gob.ar/",
      sourceLabel: "BCRA — Banco Central de la República Argentina 2024",
      infoBoxDE: "Argentinischer Peso (ARS) unterliegt erheblicher Inflation und Devaluation. Steuerberechnungen in ARS können erheblich von EUR-Äquivalenten abweichen. Für Deutsche mit Euro-Einkommen: Wechselkurs-Differenz zwischen offiziellem Kurs und Markt-Kurs beachten. Steuerliche Behandlung von Fremdwährungseinkommen mit argentinischem Steuerberater klären. This information is for guidance only. Consult a qualified tax advisor before relocating.",
      infoBoxEN: "Argentine Peso (ARS) is subject to significant inflation and devaluation. Tax calculations in ARS may differ substantially from EUR equivalents. For Germans with Euro income: note exchange rate difference between official and market rates. Tax treatment of foreign currency income must be clarified with an Argentine tax advisor. This information is for guidance only. Consult a qualified tax advisor before relocating.",
      infoBoxType: "danger",
      documents: [], tags: ["critical", "external_expert"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },

    // ── SECTION: banking ──────────────────────────────────────────────────
    {
      stepOrder: 11, phase: "arrival", section: "banking",
      titleDE: "Argentinisches Bankkonto eröffnen",
      titleEN: "Open an Argentine bank account",
      subtitleDE: "DNI Pflichtvoraussetzung — Bearbeitungszeit 1–3 Wochen",
      subtitleEN: "DNI is mandatory — processing time 1–3 weeks",
      timingDE: "Nach DNI-Erhalt — sofort", timingEN: "After receiving DNI — immediately",
      riskLevel: "medium", requiresLegalAdvice: false, lastVerified: NOW,
      sourceUrl: "https://www.bcra.gob.ar/",
      sourceLabel: "BCRA — Banco Central Argentina 2025",
      infoBoxDE: "Empfohlene Banken für Ausländer (Stand Mai 2026): Banco Nación Argentina (staatlich, deutschsprachige Filialen), BBVA Argentina, Banco Galicia. Voraussetzungen: DNI, CUIL/CUIT, Mietvertrag oder Adressnachweis. Kontoeröffnung dauert 1–3 Wochen. Achtung: Banken können ihre Ausländerpolitik ändern — vor Ort nachfragen.",
      infoBoxEN: "Recommended banks for foreigners (as of May 2026): Banco Nación Argentina (state-owned), BBVA Argentina, Banco Galicia. Requirements: DNI, CUIL/CUIT, rental contract or proof of address. Account opening takes 1–3 weeks. Note: banks may change their foreigner policy — check locally.",
      infoBoxType: "info",
      documents: [{ titleDE: "DNI", titleEN: "DNI" }, { titleDE: "CUIL/CUIT", titleEN: "CUIL/CUIT" }, { titleDE: "Adressnachweis", titleEN: "Proof of address" }],
      tags: ["doc_needed"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 12, phase: "arrival", section: "banking",
      titleDE: "USD vs. ARS — Devisenkontrollen verstehen (Cepo cambiario)",
      titleEN: "USD vs. ARS — understanding currency controls (Cepo cambiario)",
      timingDE: "Vor Geldtransfer nach Argentinien", timingEN: "Before any money transfer to Argentina",
      riskLevel: "high", requiresLegalAdvice: true, lastVerified: NOW,
      sourceUrl: "https://www.bcra.gob.ar/Noticias/operaciones-cambiarias.asp",
      sourceLabel: "BCRA — Tipo de cambio y operaciones cambiarias 2025",
      infoBoxDE: "Argentinien hatte langjährige Devisenkontrollen (Cepo cambiario). Stand 2025: Cepo unter Präsident Milei schrittweise gelockert. Offizieller Kurs vs. Dólar blue (Schwarzmarkt) vs. Dólar MEP (legal via Börsenoperation). Internationale Überweisungen auf offiziellem Kurs empfangen. Rechtliche Situation ändert sich häufig — aktuellen Stand bei BCRA prüfen. This information is for guidance only. Consult a qualified financial advisor.",
      infoBoxEN: "Argentina had long-standing currency controls (Cepo cambiario). As of 2025: Cepo being gradually lifted under President Milei. Official rate vs. Dólar blue (black market) vs. Dólar MEP (legal via exchange operation). International wire transfers received at official rate. Legal situation changes frequently — check current status at BCRA. This information is for guidance only. Consult a qualified financial advisor.",
      infoBoxType: "danger",
      documents: [], tags: ["critical", "external_expert"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 13, phase: "first_month", section: "banking",
      titleDE: "Wise & Revolut für internationale Transfers",
      titleEN: "Wise & Revolut for international transfers",
      timingDE: "Vor Ankunft einrichten", timingEN: "Set up before arrival",
      riskLevel: "medium", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Wise: Transfers nach Argentinien möglich, aber Empfang in ARS zum offiziellen Kurs. Revolut: akzeptiert für Online-Zahlungen, nicht für alle lokalen Dienstleister. Lokale Vermieter verlangen oft USD-Cash oder argentinisches Bankkonto. N26: DE-IBAN für lokale Mieter oft nicht akzeptiert. Stand Mai 2026 — Konditionen können sich ändern.",
      infoBoxEN: "Wise: transfers to Argentina possible, but received in ARS at official rate. Revolut: accepted for online payments, not all local providers. Local landlords often require USD cash or Argentine bank account. N26: German IBAN often not accepted by local landlords. As of May 2026 — terms may change.",
      infoBoxType: "warning",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 14, phase: "first_month", section: "banking",
      titleDE: "Kryptowallets & Dólar MEP (legaler Devisenwechsel)",
      titleEN: "Crypto wallets & Dólar MEP (legal currency exchange)",
      timingDE: "Bei Bedarf", timingEN: "When needed",
      riskLevel: "high", requiresLegalAdvice: true, lastVerified: NOW,
      sourceUrl: "https://www.bcra.gob.ar/",
      sourceLabel: "BCRA — Operaciones cambiarias 2025",
      infoBoxDE: "Dólar MEP (Dólar Bolsa): legale Börsenoperation zum Kauf von USD über argentinische Wertpapiere (AL30). Für Ausländer möglich mit Bankkonto. Kryptowallets (USDT, BTC) weit verbreitet und rechtlich geduldet — steuerliche Meldepflicht beachten. Rechtsrahmen ändert sich mit jeder Regierung. This information is for guidance only. Consult a qualified financial advisor.",
      infoBoxEN: "Dólar MEP (Dólar Bolsa): legal exchange operation to buy USD via Argentine securities (AL30). Available to foreigners with a bank account. Crypto wallets (USDT, BTC) widely used and legally tolerated — note reporting obligations. Legal framework changes with each government. This information is for guidance only. Consult a qualified financial advisor.",
      infoBoxType: "danger",
      documents: [], tags: ["external_expert"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: false,
    },

    // ── SECTION: insurance ────────────────────────────────────────────────
    {
      stepOrder: 15, phase: "before_move", section: "insurance",
      titleDE: "Deutsche GKV abmelden und internationale KV abschließen",
      titleEN: "Deregister from German GKV and get international health insurance",
      timingDE: "Vor Wegzug", timingEN: "Before departure",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "GKV-Abmeldung mit Nachweis der ausländischen Krankenversicherung. Für die Übergangszeit: internationale KV (mind. 3 Monate) abschließen — z. B. Cigna Global, Allianz Worldwide Care, AXA International. Kosten: ca. 100–200 €/Monat für 35-Jährige.",
      infoBoxEN: "GKV deregistration requires proof of foreign health insurance. For the transition period: international health insurance (at least 3 months) — e.g. Cigna Global, Allianz Worldwide Care, AXA International. Cost: approx. EUR 100–200/month for a 35-year-old.",
      infoBoxType: "info",
      documents: [{ titleDE: "GKV-Abmeldebescheinigung", titleEN: "GKV deregistration certificate" }, { titleDE: "Internationale KV-Police", titleEN: "International health insurance policy" }],
      tags: ["doc_needed", "timing_critical"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 16, phase: "arrival", section: "insurance",
      titleDE: "Private Prepaga-Krankenversicherung abschließen",
      titleEN: "Get a private Prepaga health insurance",
      subtitleDE: "Kein staatliches System für Ausländer ohne Arbeitsvertrag",
      subtitleEN: "No public system for foreigners without employment contract",
      timingDE: "Erste Woche nach Ankunft", timingEN: "First week after arrival",
      riskLevel: "medium", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Top-Anbieter für Expats (Stand Mai 2026): OSDE Plan 210/310 (empfohlen, ca. 80–150 USD/Monat), Swiss Medical Group, Medifé, Galeno. Voraussetzungen: DNI (oder CUIL-Nachweis). Leistungsumfang und Preis jährlich angepasst — aktuelle Tarife direkt bei Anbieter erfragen. Hinweis: Preisangaben in USD schätzen — USD/ARS-Kurs schwankt stark.",
      infoBoxEN: "Top providers for expats (as of May 2026): OSDE Plan 210/310 (recommended, approx. USD 80–150/month), Swiss Medical Group, Medifé, Galeno. Requirements: DNI (or CUIL proof). Coverage and price adjusted annually — request current rates directly from provider. Note: USD price estimates — USD/ARS rate fluctuates significantly.",
      infoBoxType: "info",
      documents: [{ titleDE: "DNI oder CUIL", titleEN: "DNI or CUIL" }, { titleDE: "Adressnachweis", titleEN: "Proof of address" }],
      tags: ["doc_needed"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 17, phase: "first_month", section: "insurance",
      titleDE: "Staatliche PAMI / Obra Social verstehen",
      titleEN: "Understanding PAMI / Obra Social (public system)",
      timingDE: "Nach Beschäftigungsaufnahme", timingEN: "After starting employment",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "PAMI: staatliches System für Rentner. Obra Social: staatliche Krankenversicherung für Angestellte — wird automatisch über Arbeitgeber beigetreten. Für Selbstständige: Monotributo-Einstufung entscheidet über Obra Social Zugang. Leistungsumfang oft begrenzt — private Prepaga-Zusatzversicherung empfohlen.",
      infoBoxEN: "PAMI: state system for retirees. Obra Social: state health insurance for employees — joined automatically through employer. For self-employed: Monotributo classification determines Obra Social access. Coverage often limited — private Prepaga top-up recommended.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: false, forFounder: false, forFamily: false,
    },

    // ── SECTION: housing ──────────────────────────────────────────────────
    {
      stepOrder: 18, phase: "before_move", section: "housing",
      titleDE: "Wohnungssuche: Portale und Stadtteile",
      titleEN: "Apartment search: portals and neighbourhoods",
      timingDE: "3–6 Monate vor Umzug", timingEN: "3–6 months before move",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Portale: ZonaProp (zonaprop.com.ar), Argenprop (argenprop.com), Properati (properati.com.ar). Empfohlene Stadtteile für Expats: Palermo (teuer, belebt, viele Expats), Recoleta (gehoben, ruhiger), San Telmo (historisch, Künstler), Villa Crespo (günstiger, aufstrebend), Núñez (familienfreundlich). Mietwohnungen werden oft in USD berechnet — Verhandlung in USD oder ARS-Äquivalent.",
      infoBoxEN: "Portals: ZonaProp (zonaprop.com.ar), Argenprop (argenprop.com), Properati (properati.com.ar). Recommended neighbourhoods for expats: Palermo (expensive, lively, many expats), Recoleta (upscale, quieter), San Telmo (historic, artistic), Villa Crespo (cheaper, up-and-coming), Núñez (family-friendly). Rentals often priced in USD — negotiate in USD or ARS equivalent.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 19, phase: "before_move", section: "housing",
      titleDE: "USD-Mieten — rechtliche Situation und Vertragsgestaltung",
      titleEN: "USD-denominated rents — legal situation and contracts",
      timingDE: "Vor Vertragsunterzeichnung", timingEN: "Before signing any contract",
      riskLevel: "medium", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Viele Mietverträge in Buenos Aires werden in USD abgeschlossen (Ley de Alquileres — 2024 reformiert). Temporäre Verträge (bis 3 Monate) für Ausländer einfacher abzuschließen. Bei längeren Verträgen: Garantia (Bürge mit argentinischer Immobilie) oder Garantía de seguro (Versicherungsbürgschaft, z. B. Garantor). Kautionen: meist 1–2 Monatsmieten in USD. Maklergebühr: oft 1 Monatsmiete zzgl. IVA.",
      infoBoxEN: "Many rental contracts in Buenos Aires are USD-denominated (Ley de Alquileres — reformed 2024). Short-term contracts (up to 3 months) easier for foreigners. Longer contracts: Garantia (guarantor with Argentine property) or Garantía de seguro (insurance surety, e.g. Garantor). Deposit: usually 1–2 months in USD. Agent fee: often 1 month's rent plus IVA.",
      infoBoxType: "warning",
      documents: [{ titleDE: "DNI oder Reisepass", titleEN: "DNI or passport" }, { titleDE: "Einkommensnachweis", titleEN: "Income proof" }],
      tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 20, phase: "arrival", section: "housing",
      titleDE: "Betrugsschutz bei Wohnungssuche",
      titleEN: "Fraud protection when searching for apartments",
      timingDE: "Vor jeder Anzahlung", timingEN: "Before any deposit",
      riskLevel: "medium", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Niemals Geld überweisen vor persönlicher Besichtigung. Verifizierung: CUIT des Vermieters im AFIP-Portal prüfen. Bei temporären Apartments (Airbnb, Booking): Zahlungsplattform bevorzugen. Direktzahlung nur nach Vertragsunterzeichnung. Auf gefälschte Immobilienanzeigen achten — Preis deutlich unter Markt ist Warnsignal.",
      infoBoxEN: "Never transfer money before a personal viewing. Verification: check landlord's CUIT on AFIP portal. For short-term apartments (Airbnb, Booking): prefer payment platform. Direct payment only after contract signing. Watch for fake listings — price significantly below market is a red flag.",
      infoBoxType: "warning",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },

    // ── SECTION: practical ────────────────────────────────────────────────
    {
      stepOrder: 21, phase: "before_move", section: "practical",
      titleDE: "Stecker, Spannung und Kommunikation",
      titleEN: "Plugs, voltage and communication",
      timingDE: "Vor Abreise", timingEN: "Before departure",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Stecker-Typ: I (IRAM — Argentinien-Standard, drei Flachstifte im Y-Muster). Adapter erforderlich für deutsche Stecker (Typ F). Spannung: 220V/50Hz — deutsche Geräte ohne Umspanner nutzbar. SIM-Karte: Claro, Movistar, Personal — gute LTE-Abdeckung in CABA. eSIM (Airalo, Holafly) für erste Wochen empfohlen.",
      infoBoxEN: "Plug type: I (IRAM — Argentine standard, three flat pins in Y pattern). Adapter required for German plugs (Type F). Voltage: 220V/50Hz — German appliances usable without transformer. SIM card: Claro, Movistar, Personal — good LTE coverage in CABA. eSIM (Airalo, Holafly) recommended for the first weeks.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 22, phase: "arrival", section: "practical",
      titleDE: "Währungssituation und Cash-Management",
      titleEN: "Currency situation and cash management",
      timingDE: "Ab Ankunft", timingEN: "From arrival",
      riskLevel: "high", requiresLegalAdvice: true, lastVerified: NOW,
      sourceUrl: "https://www.bcra.gob.ar/",
      sourceLabel: "BCRA — Tipo de cambio oficial 2025",
      infoBoxDE: "USD-Scheine (v.a. 100-Dollar-Noten) sind Wertspeicher für viele Argentinier. Geldautomaten zahlen ARS zum offiziellen Kurs mit hohen Gebühren aus. Dólar MEP als legale Alternative für USD-Zugang empfohlen. Kreditkarten (Visa, Mastercard) werden zum offiziellen Kurs abgerechnet — nicht immer optimal. Always carry some USD cash. This information is for guidance only. Consult a qualified financial advisor.",
      infoBoxEN: "USD bills (especially USD 100 notes) are a store of value for many Argentines. ATMs dispense ARS at official rate with high fees. Dólar MEP recommended as legal alternative for USD access. Credit cards (Visa, Mastercard) charged at official rate — not always optimal. Always carry some USD cash. This information is for guidance only. Consult a qualified financial advisor.",
      infoBoxType: "danger",
      documents: [], tags: ["external_expert"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 23, phase: "arrival", section: "practical",
      titleDE: "Sicherheit in Buenos Aires",
      titleEN: "Safety in Buenos Aires",
      timingDE: "Ab Ankunft", timingEN: "From arrival",
      riskLevel: "medium", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Buenos Aires ist im Vergleich zu anderen lateinamerikanischen Metropolen sicher, aber Vorsicht geboten. Häufige Risiken: Taschendiebstahl (v.a. in La Boca, Retiro, touristische Zonen), Motorrad-Raub (arrebato). Empfehlungen: Keine Wertsachen offen tragen, Handy in der Tasche halten, abends bevorzugt Taxi/Uber nutzen. Sichere Viertel: Palermo, Recoleta, Belgrano, Las Cañitas. Meidung nachts: La Boca, bestimmte Teile von San Telmo.",
      infoBoxEN: "Buenos Aires is relatively safe compared to other Latin American metropolises, but caution is needed. Common risks: pickpocketing (especially La Boca, Retiro, tourist areas), motorcycle theft (arrebato). Recommendations: do not display valuables, keep phone in pocket, prefer taxi/Uber in the evening. Safe neighbourhoods: Palermo, Recoleta, Belgrano, Las Cañitas. Avoid at night: La Boca, certain parts of San Telmo.",
      infoBoxType: "warning",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 24, phase: "arrival", section: "practical",
      titleDE: "Wasserqualität, Gesundheit und Notrufnummern",
      titleEN: "Water quality, health and emergency numbers",
      timingDE: "Ab Ankunft", timingEN: "From arrival",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Leitungswasser in Buenos Aires ist trinkbar (aufbereitet durch AySA). Notrufnummern: 107 (SAME — Rettungsdienst CABA), 911 (Polizei Notruf CABA), 100 (Feuerwehr). Deutsches Konsulat Notfall: +54 11 4778-2500. Krankenhäuser: Hospital Alemán (deutsch, Pueyrredón 1640, Almagro), Hospital Británico, Hospital Italiano — alle mit hohem Standard.",
      infoBoxEN: "Tap water in Buenos Aires is drinkable (treated by AySA). Emergency numbers: 107 (SAME — ambulance CABA), 911 (police emergency CABA), 100 (fire brigade). German Consulate emergency: +54 11 4778-2500. Hospitals: Hospital Alemán (German-speaking, Pueyrredón 1640, Almagro), Hospital Británico, Hospital Italiano — all high standard.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 25, phase: "first_month", section: "practical",
      titleDE: "Führerschein und Fahrzeug in Argentinien",
      titleEN: "Driving licence and vehicle in Argentina",
      timingDE: "Innerhalb 90 Tage", timingEN: "Within 90 days",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Internationaler Führerschein (IDP) aus Deutschland ist 90 Tage gültig. Danach: argentinischer Führerschein (habilitación) erforderlich — Antrag beim Ministerio de Transporte CABA. UBER und Remis (Mietwagen mit Fahrer) weit verbreitet — KFZ-Kauf optional. Öffentlicher Nahverkehr (SUBE-Karte): U-Bahn, Busse, Vorortbahn — SUBE-Karte in Kiosken erhältlich.",
      infoBoxEN: "International driving permit (IDP) from Germany valid for 90 days. After that: Argentine driving licence required — apply at Ministerio de Transporte CABA. UBER and Remis (chauffeured hire car) widely available — car purchase optional. Public transport (SUBE card): metro, buses, suburban train — SUBE card available at kiosks.",
      infoBoxType: "info",
      documents: [{ titleDE: "Internationaler Führerschein", titleEN: "International driving permit" }, { titleDE: "DNI", titleEN: "DNI" }],
      tags: ["doc_needed"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 26, phase: "arrival", section: "practical",
      titleDE: "Haustiere nach Argentinien mitnehmen",
      titleEN: "Bringing pets to Argentina",
      timingDE: "3 Monate vor Ankunft planen", timingEN: "Plan 3 months before arrival",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      sourceUrl: "https://www.senasa.gob.ar/animales",
      sourceLabel: "SENASA Argentina — Mascotas 2025",
      infoBoxDE: "Für Hunde und Katzen aus Deutschland: EU-Heimtierausweis, Impfnachweis (Tollwut, mind. 30 Tage vor Einreise), Gesundheitszeugnis (veterinär, innerhalb 10 Tage vor Abreise), SENASA-Genehmigung. Kein Quarantänepflicht. Antragsformulare auf senasa.gob.ar.",
      infoBoxEN: "For dogs and cats from Germany: EU pet passport, vaccination proof (rabies, at least 30 days before entry), health certificate (veterinary, within 10 days before departure), SENASA permit. No quarantine required. Application forms at senasa.gob.ar.",
      infoBoxType: "info",
      documents: [{ titleDE: "EU-Heimtierausweis", titleEN: "EU pet passport" }, { titleDE: "Impfpass Tier", titleEN: "Pet vaccination record" }, { titleDE: "Gesundheitszeugnis Tierarzt", titleEN: "Veterinary health certificate" }],
      tags: ["doc_needed"], translationSource: "manual",
      forEmployed: false, forFreelancer: false, forFounder: false, forFamily: true,
    },

    // ── SECTION: social ───────────────────────────────────────────────────
    {
      stepOrder: 27, phase: "first_month", section: "social",
      titleDE: "Deutsche Community in Buenos Aires",
      titleEN: "German community in Buenos Aires",
      timingDE: "Ab Ankunft", timingEN: "From arrival",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Buenos Aires hat eine der größten deutschsprachigen Communitys in Lateinamerika (Nachfahren deutscher Einwanderer seit 19. Jahrhundert + aktuelle Auswanderer). Anlaufstellen: Club Alemán de Buenos Aires (Clubhaus in Palermo Chico, Ayacucho 1564), Goethe-Institut Buenos Aires (Corrientes 319), Lutherische Kirche (Evangelisch-Lutherisch, Esmeralda 162). InterNations Buenos Aires: monatliche Treffen.",
      infoBoxEN: "Buenos Aires has one of the largest German-speaking communities in Latin America (descendants of German immigrants since the 19th century + current expats). Contact points: Club Alemán de Buenos Aires (clubhouse in Palermo Chico, Ayacucho 1564), Goethe-Institut Buenos Aires (Corrientes 319), Lutheran Church (Evangelical-Lutheran, Esmeralda 162). InterNations Buenos Aires: monthly meetups.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 28, phase: "first_month", section: "social",
      titleDE: "Deutsche Schule Buenos Aires (DSBA)",
      titleEN: "German School Buenos Aires (DSBA)",
      timingDE: "Frühzeitig anmelden — Wartelisten möglich", timingEN: "Register early — waiting lists possible",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      sourceUrl: "https://www.dsba.com.ar",
      sourceLabel: "Deutsche Schule Buenos Aires — DSBA 2025",
      infoBoxDE: "Deutsche Schule Buenos Aires (DSBA): Kindergarten bis Abitur, deutschsprachiger Unterricht, staatlich anerkannt in Deutschland. Adresse: Conesa 1268, Belgrano. Jahresgebühr: ca. 5.000–10.000 USD/Jahr (2025). Aufnahme für Kinder mit deutschen Sprachkenntnissen bevorzugt. Frühzeitige Anmeldung empfohlen (Warteliste möglich).",
      infoBoxEN: "Deutsche Schule Buenos Aires (DSBA): kindergarten to Abitur (German A-levels), German-language instruction, state-recognised in Germany. Address: Conesa 1268, Belgrano. Annual fee: approx. USD 5,000–10,000/year (2025). Admission preference for children with German language skills. Early registration recommended (waiting list possible).",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: false, forFreelancer: false, forFounder: false, forFamily: true,
    },
    {
      stepOrder: 29, phase: "first_month", section: "social",
      titleDE: "Deutschsprachige Ärzte in Buenos Aires",
      titleEN: "German-speaking doctors in Buenos Aires",
      timingDE: "Bei Bedarf — Liste vor Ankunft zusammenstellen", timingEN: "When needed — compile list before arrival",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      sourceUrl: "https://buenos-aires.diplo.de/ar-de/service/buergerservice/aerzte-zahnaerzte",
      sourceLabel: "Deutsche Botschaft Buenos Aires — Ärzteliste 2025",
      infoBoxDE: "Hospital Alemán (Pueyrredón 1640, Almagro): deutschsprachige Ärzte in mehreren Fachbereichen, hochwertige Infrastruktur. Aktuelle Ärzteliste auf der Website der Deutschen Botschaft Buenos Aires. Für Emergencia: 107 (SAME) oder Hospital Alemán Notaufnahme direkt ansteuern.",
      infoBoxEN: "Hospital Alemán (Pueyrredón 1640, Almagro): German-speaking doctors across multiple specialties, high-quality infrastructure. Current doctor list on German Embassy Buenos Aires website. For emergencies: 107 (SAME) or go directly to Hospital Alemán A&E.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 30, phase: "first_month", section: "social",
      titleDE: "Spanischkurse und Sprachintegration",
      titleEN: "Spanish courses and language integration",
      timingDE: "Vor oder direkt nach Ankunft", timingEN: "Before or immediately after arrival",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Spanisch wird in Argentinien mit Rioplatense-Akzent gesprochen (voseo statt tuteo, unterschiedliche Aussprache von ll/y). Sprachschulen in Buenos Aires: IBL (Instituto de Lengua Española para Extranjeros, Paraguay 755), El Ateneo, Lenguas Vivas. Online: iTalki, Preply für argentinische Tutoren. Intensivkurse (4 Wochen Vollzeit) ab ca. 400 USD.",
      infoBoxEN: "Spanish in Argentina is spoken with a Rioplatense accent (voseo instead of tuteo, distinct ll/y pronunciation). Language schools in Buenos Aires: IBL (Paraguay 755), El Ateneo, Lenguas Vivas. Online: iTalki, Preply for Argentine tutors. Intensive courses (4 weeks full-time) from approx. USD 400.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 31, phase: "first_3_months", section: "social",
      titleDE: "Remote-Work Community und Coworking Spaces",
      titleEN: "Remote work community and coworking spaces",
      timingDE: "Ab Ankunft", timingEN: "From arrival",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Buenos Aires ist ein gut vernetzter Remote-Work-Hub. Top-Coworking-Spaces: Areatres (Palermo, Thames 1892), La Maquinista (mehrere Standorte), WeWork (Maipú 1210). Nomad-Communitys: Nomad List Buenos Aires, Workfrom. Tagestickets ab ca. 10–20 USD. Internet-Qualität in Palermo/Recoleta zuverlässig (bis 300 Mbit/s Glasfaser).",
      infoBoxEN: "Buenos Aires is a well-connected remote work hub. Top coworking spaces: Areatres (Palermo, Thames 1892), La Maquinista (multiple locations), WeWork (Maipú 1210). Nomad communities: Nomad List Buenos Aires, Workfrom. Day passes from approx. USD 10–20. Internet quality in Palermo/Recoleta reliable (up to 300 Mbit/s fibre).",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: false, forFreelancer: true, forFounder: true, forFamily: false,
    },
  ]);

  // ─── Medellín ─────────────────────────────────────────────────────────────
  await seedMovingGuide("medellin", [

    // ── SECTION: bureaucracy ──────────────────────────────────────────────
    {
      stepOrder: 0, phase: "critical", section: "bureaucracy",
      titleDE: "Wegzugsbesteuerung prüfen (§6 AStG)",
      titleEN: "Exit tax check (§6 AStG)",
      subtitleDE: "Kein DBA Deutschland–Kolumbien — Sofortmaßnahme",
      subtitleEN: "No DTA Germany–Colombia — immediate action required",
      timingDE: "Sofort — vor jeder Planung", timingEN: "Immediately — before any planning",
      isWarning: true, riskLevel: "high", requiresLegalAdvice: true,
      sourceUrl: "https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/Internationales_Steuerrecht/Allgemeine_Informationen/2021-11-03-AO-Internationales-Steuerrecht.html",
      sourceLabel: "Bundesfinanzministerium — §6 AStG 2024", lastVerified: NOW,
      infoBoxDE: "Kein DBA Deutschland–Kolumbien. §6 AStG greift bei GmbH-Anteilen >1 % oder Wertpapierdepots >1 %: fiktive Veräußerungssteuer fällig, kein EU-Stundungsrecht. Steuerberater konsultieren bevor irgendein Schritt unternommen wird.",
      infoBoxEN: "No DTA Germany–Colombia. §6 AStG applies to GmbH stakes >1% or securities portfolios >1%: deemed disposal tax due, no EU deferral right. Consult a tax advisor before taking any steps.",
      infoBoxType: "danger",
      documents: [{ titleDE: "GmbH-Gesellschaftsvertrag", titleEN: "GmbH articles" }, { titleDE: "Depot-Auszug (letzte 12 Monate)", titleEN: "Securities depot statement (last 12 months)" }],
      tags: ["critical", "external_expert"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 1, phase: "before_move", section: "bureaucracy",
      titleDE: "Visaoptionen Kolumbien — Überblick",
      titleEN: "Visa options Colombia — overview",
      timingDE: "6 Monate vor Umzug", timingEN: "6 months before move",
      riskLevel: "medium", requiresLegalAdvice: false, lastVerified: NOW,
      sourceUrl: "https://www.cancilleria.gov.co/tramites_servicios/visas",
      sourceLabel: "Cancillería Colombia — Visas 2025",
      infoBoxDE: "Deutsche können 90 Tage visumfrei einreisen (verlängerbar auf 180 Tage/Jahr). Für Daueraufenthalt: Visa M (Migrant) — Kategorien: Trabajador (Arbeitnehmer), Independiente (Selbstständige), Digital Nomad Visa (seit 2022). Rentista de Capital (passives Einkommen min. ~750 USD/Monat). Bearbeitungszeit: 2–6 Wochen.",
      infoBoxEN: "Germans may enter visa-free for 90 days (extendable to 180 days/year). For permanent stay: Visa M (Migrant) — categories: Trabajador (employee), Independiente (self-employed), Digital Nomad Visa (since 2022). Rentista de Capital (passive income min. ~USD 750/month). Processing time: 2–6 weeks.",
      infoBoxType: "info",
      documents: [{ titleDE: "Reisepass (mind. 6 Monate gültig)", titleEN: "Passport (min. 6 months validity)" }, { titleDE: "Einkommensnachweis je nach Kategorie", titleEN: "Income proof by category" }],
      tags: ["doc_needed", "timing_critical"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 2, phase: "arrival", section: "bureaucracy",
      titleDE: "Cédula de Extranjería beantragen",
      titleEN: "Apply for Cédula de Extranjería",
      subtitleDE: "Kolumbianischer Ausländerausweis — Basis für alle Behördengänge",
      subtitleEN: "Colombian foreigner ID — basis for all official processes",
      timingDE: "Innerhalb 15 Tage nach Visaerhalt", timingEN: "Within 15 days of receiving visa",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      sourceUrl: "https://www.migracioncolombia.gov.co/visas/cédula-de-extranjería",
      sourceLabel: "Migración Colombia — Cédula de Extranjería 2025",
      infoBoxDE: "Pflicht für alle Visa-Inhaber (kein Touristen-Visum). Antrag beim nächsten Migración-Büro oder online. Gebühr: ca. 55 USD. Gültig für Visum-Laufzeit. Ohne Cédula: kein Bankkonto, kein Mietvertrag.",
      infoBoxEN: "Mandatory for all visa holders (not tourist visa). Apply at nearest Migración office or online. Fee: approx. USD 55. Valid for visa duration. Without Cédula: no bank account, no rental contract.",
      infoBoxType: "info",
      documents: [{ titleDE: "Reisepass + Visum-Aufkleber", titleEN: "Passport + visa sticker" }, { titleDE: "Passbild", titleEN: "Passport photo" }],
      tags: ["doc_needed", "timing_critical"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 3, phase: "arrival", section: "bureaucracy",
      titleDE: "RUT-Steuerregistrierung bei der DIAN",
      titleEN: "RUT tax registration with DIAN",
      subtitleDE: "Pflicht für Selbstständige und Unternehmensgründer",
      subtitleEN: "Mandatory for self-employed and company founders",
      timingDE: "Nach Cédula-Erhalt", timingEN: "After receiving Cédula",
      riskLevel: "medium", requiresLegalAdvice: false, lastVerified: NOW,
      sourceUrl: "https://www.dian.gov.co/tramites/RUT",
      sourceLabel: "DIAN Colombia — RUT 2025",
      infoBoxDE: "RUT (Registro Único Tributario) ist die kolumbianische Steuer-ID. Für Angestellte: Arbeitgeber übernimmt. Für Freelancer/Gründer: Eigenanmeldung bei DIAN. Online möglich über dian.gov.co mit Cédula de Extranjería.",
      infoBoxEN: "RUT (Registro Único Tributario) is the Colombian tax ID. For employees: employer handles it. For freelancers/founders: self-registration with DIAN. Available online at dian.gov.co with Cédula de Extranjería.",
      infoBoxType: "info",
      documents: [{ titleDE: "Cédula de Extranjería", titleEN: "Cédula de Extranjería" }],
      tags: ["doc_needed"], translationSource: "manual",
      forEmployed: false, forFreelancer: true, forFounder: true, forFamily: false,
    },
    {
      stepOrder: 4, phase: "arrival", section: "bureaucracy",
      titleDE: "Anmeldung beim deutschen Konsulat Bogotá / Honorarkonsulat Medellín",
      titleEN: "Register at German Consulate Bogotá / Honorary Consulate Medellín",
      timingDE: "Innerhalb 3 Monate nach Ankunft", timingEN: "Within 3 months of arrival",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      sourceUrl: "https://bogota.diplo.de/co-de/service/buergerservice",
      sourceLabel: "Deutsche Botschaft Bogotá 2025",
      infoBoxDE: "Auslandsregistrierung bei der Deutschen Botschaft Bogotá (zuständig für ganz Kolumbien). Honorarkonsulat Medellín: begrenzte Dienste (Notfälle, Ausweisdokumente). Briefwahl, Passverlängerung, Krisentelefon. Botschaft Bogotá: Carrera 69 #43B-41.",
      infoBoxEN: "Overseas registration at German Embassy Bogotá (competent for all of Colombia). Honorary Consulate Medellín: limited services (emergencies, identity documents). Postal voting, passport renewal, crisis helpline. Embassy Bogotá: Carrera 69 #43B-41.",
      infoBoxType: "info",
      documents: [{ titleDE: "Reisepass", titleEN: "Passport" }, { titleDE: "Adressnachweis Kolumbien", titleEN: "Colombia address proof" }],
      tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 5, phase: "first_month", section: "bureaucracy",
      titleDE: "Digital Nomad Visa — Sonderregime für Remote-Worker",
      titleEN: "Digital Nomad Visa — special regime for remote workers",
      timingDE: "Vor Einreise beantragen", timingEN: "Apply before entry",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      sourceUrl: "https://www.cancilleria.gov.co/tramites_servicios/visas/tipos-de-visa/visa-m/independiente",
      sourceLabel: "Cancillería Colombia — Visa Nómada Digital 2025",
      infoBoxDE: "Kolumbien bietet seit 2022 ein Digital Nomad Visa (Visa M – Categoría Nómada Digital). Voraussetzungen: Einkommensnachweis min. 3× kolumbianischer Mindestlohn (~1.050 USD/Monat, 2025). Gültig 2 Jahre, verlängerbar. Remote-Arbeit für ausländische Arbeitgeber erlaubt.",
      infoBoxEN: "Colombia offers a Digital Nomad Visa (Visa M – Categoría Nómada Digital) since 2022. Requirements: income proof min. 3× Colombian minimum wage (~USD 1,050/month, 2025). Valid 2 years, renewable. Remote work for foreign employers permitted.",
      infoBoxType: "info",
      documents: [{ titleDE: "Arbeitsvertrag oder Freelance-Nachweise", titleEN: "Employment contract or freelance proof" }, { titleDE: "Kontoauszüge (3 Monate)", titleEN: "Bank statements (3 months)" }],
      tags: ["doc_needed"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: false, forFamily: true,
    },

    // ── SECTION: tax_planning ─────────────────────────────────────────────
    {
      stepOrder: 6, phase: "critical", section: "tax_planning",
      titleDE: "Kein DBA Deutschland–Kolumbien — Doppelbesteuerungsrisiko",
      titleEN: "No DTA Germany–Colombia — double taxation risk",
      subtitleDE: "Hochrisiko — steuerrechtliche Beratung Pflicht",
      subtitleEN: "High risk — mandatory tax legal advice",
      timingDE: "Sofort — vor Wegzug", timingEN: "Immediately — before departure",
      isWarning: true, riskLevel: "high", requiresLegalAdvice: true, lastVerified: NOW,
      sourceUrl: "https://www.bzst.de/DE/Service/Laenderbezogene_Informationen/Kolumbien/kolumbien_node.html",
      sourceLabel: "Bundeszentralamt für Steuern — Kolumbien 2024",
      infoBoxDE: "Zwischen Deutschland und Kolumbien besteht kein Doppelbesteuerungsabkommen. Einkünfte können in beiden Ländern besteuert werden. Keine EU-Stundung bei §6 AStG. Steuerberater mit Lateinamerika-Fokus ist Pflicht. This information is for guidance only. Consult a qualified tax advisor before relocating.",
      infoBoxEN: "There is no double taxation agreement between Germany and Colombia. Income may be taxed in both countries. No EU deferral on §6 AStG. A tax advisor with Latin America focus is mandatory. This information is for guidance only. Consult a qualified tax advisor before relocating.",
      infoBoxType: "danger",
      documents: [], tags: ["critical", "external_expert"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 7, phase: "before_move", section: "tax_planning",
      titleDE: "Kolumbianische Einkommensteuer (Renta)",
      titleEN: "Colombian income tax (Renta)",
      timingDE: "Ab Steuerresidenz (183 Tage in CO)", timingEN: "From tax residency (183 days in CO)",
      riskLevel: "medium", requiresLegalAdvice: false, lastVerified: NOW,
      sourceUrl: "https://www.dian.gov.co/impuestos/renta",
      sourceLabel: "DIAN Colombia — Impuesto a la Renta 2025",
      infoBoxDE: "Progressive Stufensteuer: 0 % bis 39 % auf Einkommen über ~38 Mio. COP (~9.500 USD). Steuerresidenz ab 183 Aufenthaltstagen/Jahr. Für Ausländer: nur kolumbianische Einkünfte in ersten 5 Jahren. Ab Jahr 6: weltweites Einkommen steuerpflichtig.",
      infoBoxEN: "Progressive income tax: 0% to 39% on income above ~COP 38M (~USD 9,500). Tax residency from 183 days/year. For foreigners: only Colombian-source income in first 5 years. From year 6: worldwide income becomes taxable.",
      infoBoxType: "info",
      documents: [], tags: ["external_expert"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 8, phase: "first_3_months", section: "tax_planning",
      titleDE: "Beschränkte Steuerpflicht Deutschland (§49 EStG)",
      titleEN: "Residual German tax liability (§49 EStG)",
      timingDE: "Vor Wegzug klären", timingEN: "Clarify before departure",
      riskLevel: "high", requiresLegalAdvice: true, lastVerified: NOW,
      sourceUrl: "https://www.gesetze-im-internet.de/estg/__49.html",
      sourceLabel: "Gesetze-im-Internet.de — §49 EStG 2024",
      infoBoxDE: "Nach Wegzug: beschränkte Steuerpflicht für DE-Quelleneinkünfte bleibt bestehen (Miete aus DE-Immobilien, DE-Dividenden, Lizenzen). Ohne DBA: keine Anrechnung kolumbianischer Steuer auf deutsche Quellensteuer. This information is for guidance only. Consult a qualified tax advisor before relocating.",
      infoBoxEN: "After departure: limited tax liability remains for German-source income (rent from German properties, German dividends, royalties). Without DTA: no credit of Colombian tax against German withholding tax. This information is for guidance only. Consult a qualified tax advisor before relocating.",
      infoBoxType: "danger",
      documents: [], tags: ["critical", "external_expert"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 9, phase: "first_3_months", section: "tax_planning",
      titleDE: "Freelancer-Besteuerung: Régimen Simple vs. Régimen Ordinario",
      titleEN: "Freelancer taxation: Régimen Simple vs. Régimen Ordinario",
      timingDE: "Innerhalb 3 Monate nach Visa-Erhalt", timingEN: "Within 3 months of receiving visa",
      riskLevel: "medium", requiresLegalAdvice: false, lastVerified: NOW,
      sourceUrl: "https://www.dian.gov.co/impuestos/regimensimple",
      sourceLabel: "DIAN Colombia — Régimen Simple 2025",
      infoBoxDE: "Régimen Simple: Pauschalsteuer 3,7 %–8,5 % je nach Branche, keine Sozialabgaben-Komplexität. Empfohlen für Freelancer mit Jahresumsatz unter ~3,5 Mrd. COP (~850k USD). Régimen Ordinario: Standard-Einkommensteuer mit Abzügen. Steuerberater für optimale Wahl empfehlen.",
      infoBoxEN: "Régimen Simple: flat tax 3.7%–8.5% by industry, reduced social contribution complexity. Recommended for freelancers with annual revenue below ~COP 3.5B (~USD 850k). Régimen Ordinario: standard income tax with deductions. Tax advisor recommended for optimal choice.",
      infoBoxType: "info",
      documents: [], tags: ["external_expert"], translationSource: "manual",
      forEmployed: false, forFreelancer: true, forFounder: true, forFamily: false,
    },
    {
      stepOrder: 10, phase: "first_3_months", section: "tax_planning",
      titleDE: "IVA (Mehrwertsteuer) für Selbstständige",
      titleEN: "IVA (VAT) for self-employed",
      timingDE: "Ab Geschäftsaufnahme", timingEN: "From start of business",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "IVA in Kolumbien: 19 % Standardsatz. Freelancer im Régimen Simple häufig von IVA-Pflicht ausgenommen (Umsatz unter Grenzwert). Bei exportierten Dienstleistungen (remote für ausländische Kunden): 0 % IVA ('exento'). DIAN-Registrierung als 'Responsable de IVA' prüfen.",
      infoBoxEN: "IVA in Colombia: 19% standard rate. Freelancers in Régimen Simple often exempt from IVA obligation (below threshold). For exported services (remote work for foreign clients): 0% IVA ('exento'). Check DIAN registration as 'Responsable de IVA'.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: false, forFreelancer: true, forFounder: true, forFamily: false,
    },

    // ── SECTION: banking ──────────────────────────────────────────────────
    {
      stepOrder: 11, phase: "arrival", section: "banking",
      titleDE: "Bankkonto in Kolumbien eröffnen",
      titleEN: "Open a bank account in Colombia",
      subtitleDE: "Cédula de Extranjería Pflichtvoraussetzung",
      subtitleEN: "Cédula de Extranjería mandatory prerequisite",
      timingDE: "Nach Cédula-Erhalt", timingEN: "After receiving Cédula",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Empfohlene Banken für Ausländer (Stand Mai 2026): Bancolombia (größte Privatbank, deutsch-freundlich), Davivienda, BBVA Colombia. Voraussetzungen: Cédula de Extranjería, RUT, Adressnachweis. Bearbeitungszeit: 1–2 Wochen. Neobank-Alternative: Nequi (Bancolombia-Tochter, per App eröffenbar). Banken können Ausländerpolitik ändern — vor Ort nachfragen.",
      infoBoxEN: "Recommended banks for foreigners (as of May 2026): Bancolombia (largest private bank), Davivienda, BBVA Colombia. Requirements: Cédula de Extranjería, RUT, proof of address. Processing time: 1–2 weeks. Neobank alternative: Nequi (Bancolombia subsidiary, app-based). Banks may change foreigner policy — check locally.",
      infoBoxType: "info",
      documents: [{ titleDE: "Cédula de Extranjería", titleEN: "Cédula de Extranjería" }, { titleDE: "RUT", titleEN: "RUT" }, { titleDE: "Adressnachweis", titleEN: "Proof of address" }],
      tags: ["doc_needed"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 12, phase: "first_month", section: "banking",
      titleDE: "Internationale Geldtransfers nach Kolumbien",
      titleEN: "International money transfers to Colombia",
      timingDE: "Ab Ankunft", timingEN: "From arrival",
      riskLevel: "medium", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Wise und Revolut: für Transfers nach Kolumbien gut geeignet. COP-Wechselkurs-Schwankungen beachten. Bancolombia akzeptiert SWIFT-Transfers. Payoneer und Deel: für Freelancer-Honorare weit verbreitet und von kolumbianischen Behörden anerkannt. Bargeld (USD/EUR) bei wechseln beim Cambio vor Ort. Limite bei Bargeldmitnahme: 10.000 USD deklarationspflichtig.",
      infoBoxEN: "Wise and Revolut: well suited for transfers to Colombia. Note COP exchange rate fluctuations. Bancolombia accepts SWIFT transfers. Payoneer and Deel: widely used for freelance payments and recognised by Colombian authorities. Cash (USD/EUR) exchangeable at local Cambio. Cash limit: USD 10,000 declaration required.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 13, phase: "first_month", section: "banking",
      titleDE: "Kryptowährungen in Kolumbien",
      titleEN: "Cryptocurrencies in Colombia",
      timingDE: "Bei Bedarf", timingEN: "When needed",
      riskLevel: "medium", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Kolumbien ist eines der kryptofreundlichsten Länder Lateinamerikas. Binance, Bitso, Paxful aktiv. Steuerlich: Kapitalgewinne auf Krypto steuerpflichtig (Teil der Renta). DIAN-Meldepflicht bei Beträgen über 5 Mio. COP. Krypto als Zahlungsmittel rechtlich akzeptiert, nicht als gesetzliches Zahlungsmittel.",
      infoBoxEN: "Colombia is one of the most crypto-friendly countries in Latin America. Binance, Bitso, Paxful active. Tax: capital gains on crypto are taxable (part of Renta). DIAN reporting obligation above COP 5M. Crypto as payment method legally accepted, not legal tender.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: false, forFreelancer: true, forFounder: true, forFamily: false,
    },

    // ── SECTION: insurance ────────────────────────────────────────────────
    {
      stepOrder: 14, phase: "before_move", section: "insurance",
      titleDE: "Deutsche GKV abmelden und internationale KV abschließen",
      titleEN: "Deregister from German GKV and get international health insurance",
      timingDE: "Vor Wegzug", timingEN: "Before departure",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "GKV kündigen mit Nachweis einer ausländischen KV. Für Übergangszeit: internationale KV (mind. 3 Monate): Cigna Global, Allianz Worldwide Care, AXA International. Kosten: ca. 100–200 €/Monat für 35-Jährige.",
      infoBoxEN: "Cancel GKV with proof of foreign health insurance. For the transition: international health insurance (at least 3 months): Cigna Global, Allianz Worldwide Care, AXA International. Cost: approx. EUR 100–200/month for a 35-year-old.",
      infoBoxType: "info",
      documents: [{ titleDE: "GKV-Abmeldebescheinigung", titleEN: "GKV deregistration certificate" }],
      tags: ["doc_needed", "timing_critical"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 15, phase: "arrival", section: "insurance",
      titleDE: "Kolumbianische Krankenversicherung (EPS — Entidad Promotora de Salud)",
      titleEN: "Colombian health insurance (EPS — Entidad Promotora de Salud)",
      subtitleDE: "Pflichtversicherung für Visumsinhaber mit Arbeit/Wohnsitz",
      subtitleEN: "Mandatory for visa holders with employment/residence",
      timingDE: "Nach Cédula und RUT — sofort", timingEN: "After Cédula and RUT — immediately",
      riskLevel: "medium", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Empfohlene EPS-Anbieter (Stand Mai 2026): Sura EPS (beste Infrastruktur für Expats), Sanitas, Nueva EPS. Beitrag: ~12,5 % des Einkommens (Arbeitnehmer: 4 %, Arbeitgeber: 8,5 %). Selbstständige zahlen vollen Satz. Deckt Basis-Gesundheitsversorgung (POS). Privatärzte empfohlen für schnelle Termine.",
      infoBoxEN: "Recommended EPS providers (as of May 2026): Sura EPS (best infrastructure for expats), Sanitas, Nueva EPS. Contribution: ~12.5% of income (employee: 4%, employer: 8.5%). Self-employed pay full rate. Covers basic healthcare (POS). Private doctors recommended for faster appointments.",
      infoBoxType: "info",
      documents: [{ titleDE: "Cédula de Extranjería", titleEN: "Cédula de Extranjería" }, { titleDE: "RUT", titleEN: "RUT" }],
      tags: ["doc_needed"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 16, phase: "first_month", section: "insurance",
      titleDE: "Private Zusatz-KV und Sicherheitshinweise",
      titleEN: "Private supplemental health insurance and security notes",
      timingDE: "Optional — empfohlen", timingEN: "Optional — recommended",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Private Zusatz-KV für schnelle Spezialisten-Termine: Colpatria, Suramericana. Medellín hat hochwertige Kliniken: Hospital Pablo Tobón Uribe, Clínica El Rosario (deutschsprachige Ärzte auf Anfrage). Krankenhaustourismus in Medellín wächst — hohe Infrastrukturqualität. Notfallnummer: 123 (Polizei/SIJIN) | 125 (Feuerwehr) | Línea 106 (Suizid-Prävention).",
      infoBoxEN: "Private supplemental health insurance for faster specialist appointments: Colpatria, Suramericana. Medellín has high-quality clinics: Hospital Pablo Tobón Uribe, Clínica El Rosario (German-speaking doctors on request). Medical tourism in Medellín is growing — high infrastructure quality. Emergency numbers: 123 (police/SIJIN) | 125 (fire brigade) | Line 106 (crisis line).",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },

    // ── SECTION: housing ──────────────────────────────────────────────────
    {
      stepOrder: 17, phase: "before_move", section: "housing",
      titleDE: "Stadtteile Medellín für Expats",
      titleEN: "Medellín neighbourhoods for expats",
      timingDE: "3–6 Monate vor Umzug", timingEN: "3–6 months before move",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Beliebteste Expat-Viertel: El Poblado (teuerste, sicher, viele Bars/Restaurants), Laureles (ruhiger, familienfreundlich, günstigere Mieten), Envigado (südlich, suburban, sehr sicher). Mietpreise (2026): El Poblado 1-Zimmer ab ~700 USD, Laureles ab ~400 USD. Suchportale: Metrocuadrado (metrocuadrado.com), Fincaraíz (fincaraiz.com.co), Facebook-Gruppen für Expats.",
      infoBoxEN: "Most popular expat neighbourhoods: El Poblado (most expensive, safe, many bars/restaurants), Laureles (quieter, family-friendly, lower rents), Envigado (southern, suburban, very safe). Rental prices (2026): El Poblado studio from ~USD 700, Laureles from ~USD 400. Search portals: Metrocuadrado (metrocuadrado.com), Fincaraíz (fincaraiz.com.co), Facebook groups for expats.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 18, phase: "arrival", section: "housing",
      titleDE: "Mietvertrag und Kaution in Kolumbien",
      titleEN: "Rental contract and deposit in Colombia",
      timingDE: "Vor Unterzeichnung", timingEN: "Before signing",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Mieten werden in COP quotiert (nicht USD wie in Argentinien). Kaution: meist 1 Monatsmiete. Maklergebühr: 1 Monatsmiete + IVA (oft geteilt). Standardmietdauer: 12 Monate (canon de arrendamiento). Codeudor (Bürge mit kolumbianischer Immobilie) oft gefordert — Alternative: Amparar-Versicherung oder erhöhte Kaution. Adresse im Vertrag wichtig für RUT-Registrierung.",
      infoBoxEN: "Rents quoted in COP (not USD like Argentina). Deposit: usually 1 month's rent. Agent fee: 1 month's rent + IVA (often shared). Standard lease: 12 months (canon de arrendamiento). Codeudor (guarantor with Colombian property) often required — alternative: Amparar insurance or increased deposit. Address in contract important for RUT registration.",
      infoBoxType: "info",
      documents: [{ titleDE: "Cédula de Extranjería", titleEN: "Cédula de Extranjería" }, { titleDE: "Kontoauszug oder Einkommensnachweis", titleEN: "Bank statement or income proof" }],
      tags: ["doc_needed"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 19, phase: "arrival", section: "housing",
      titleDE: "Strom, Wasser, Internet einrichten",
      titleEN: "Setting up electricity, water and internet",
      timingDE: "Erste Woche nach Einzug", timingEN: "First week after moving in",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Strom in Medellín: EPM (Empresas Públicas de Medellín) — staatlich, günstig, zuverlässig. Anmeldung nach Mietvertragsschluss. Wasser: EPM inklusive Strom-Abrechnung. Internet: Claro, Tigo, ETB — Glasfaser bis 500 Mbit/s ab ca. 25 USD/Monat. Stecker: Typ A/B (USA-Standard) — Adapter für deutsche Geräte erforderlich. Spannung: 110V/60Hz — Umspanner für 220V-Geräte nötig.",
      infoBoxEN: "Electricity in Medellín: EPM (Empresas Públicas de Medellín) — state-owned, affordable, reliable. Register after signing rental contract. Water: EPM included in electricity billing. Internet: Claro, Tigo, ETB — fibre up to 500 Mbit/s from approx. USD 25/month. Plug: Type A/B (US standard) — adapter required for German devices. Voltage: 110V/60Hz — transformer needed for 220V appliances.",
      infoBoxType: "warning",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },

    // ── SECTION: practical ────────────────────────────────────────────────
    {
      stepOrder: 20, phase: "arrival", section: "practical",
      titleDE: "Sicherheit in Medellín",
      titleEN: "Safety in Medellín",
      timingDE: "Ab Ankunft", timingEN: "From arrival",
      riskLevel: "medium", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Medellín hat sich stark verbessert (früher gefährlichste Stadt der Welt). Heute: sichere Expat-Viertel El Poblado, Laureles, Envigado. Zu meiden: Barrio Antioquia, bestimmte Teile des Stadtkerns nachts. Risiken: Scopolamin-Drogen (Einnahme von Unbekannten nichts akzeptieren), Taschendiebstahl. Empfehlungen: Uber/InDriver nutzen statt Straßentaxi, Handy nicht offen zeigen, kein Bargeld über 50 USD mitführen.",
      infoBoxEN: "Medellín has improved greatly (once the world's most dangerous city). Today: safe expat areas El Poblado, Laureles, Envigado. Avoid: Barrio Antioquia, certain parts of the city centre at night. Risks: scopolamine (never accept anything from strangers), pickpocketing. Recommendations: use Uber/InDriver instead of street taxis, do not display phone, carry no more than USD 50 cash.",
      infoBoxType: "warning",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 21, phase: "arrival", section: "practical",
      titleDE: "Transport: Metro, Teleférico, Uber",
      titleEN: "Transport: Metro, Teleférico, Uber",
      timingDE: "Ab Ankunft", timingEN: "From arrival",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Medellín-Metro: günstig (~0,80 USD/Fahrt), sauber, pünktlich. Teleférico (Seilbahn) in die Comunas: Touristen-Highlight, Comunas 1/2 zugänglich. Uber und InDriver legal verfügbar. Öffentliche Busse: günstig, komplizierter ohne Spanischkenntnisse. SIM-Karte: Claro, Movistar, Tigo — LTE-Abdeckung gut in Medellín.",
      infoBoxEN: "Medellín Metro: cheap (~USD 0.80/trip), clean, punctual. Teleférico (cable car) to the Comunas: tourist highlight, Comunas 1/2 accessible. Uber and InDriver legally available. Public buses: cheap, more complex without Spanish. SIM card: Claro, Movistar, Tigo — good LTE coverage in Medellín.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 22, phase: "arrival", section: "practical",
      titleDE: "Wasserqualität und Gesundheitsversorgung",
      titleEN: "Water quality and healthcare",
      timingDE: "Ab Ankunft", timingEN: "From arrival",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Leitungswasser in Medellín ist trinkbar (EPM hohe Qualität). Höhenklima: Medellín liegt auf 1.495 m ü. M. — ewiger Frühling (~22°C), keine saisonalen Extreme. Gelbe Fieber-Impfung empfohlen bei Ausflügen in Tieflagen. Dengue-Risiko in manchen Regionen — Mückenschutz. Höhenkrankheit kein Problem bei 1.500 m.",
      infoBoxEN: "Tap water in Medellín is drinkable (EPM high quality). Altitude climate: Medellín is at 1,495 m asl — eternal spring (~22°C), no seasonal extremes. Yellow fever vaccination recommended when visiting lowland areas. Dengue risk in some regions — mosquito protection advised. Altitude sickness not an issue at 1,500 m.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 23, phase: "first_month", section: "practical",
      titleDE: "Führerschein und Fahrzeug in Kolumbien",
      titleEN: "Driving licence and vehicle in Colombia",
      timingDE: "Innerhalb 90 Tage", timingEN: "Within 90 days",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Internationaler Führerschein (IDP) aus Deutschland 90 Tage gültig. Danach: kolumbianischer Führerschein (Licencia de Conducción) beim Ministerio de Transporte. Kolumbien hat Pico y Placa (Fahrverbot nach Kennzeichen an bestimmten Tagen in Medellín). Uber/InDriver empfohlen für Alltag — kein KFZ nötig in El Poblado/Laureles.",
      infoBoxEN: "International driving permit (IDP) from Germany valid for 90 days. After that: Colombian driving licence (Licencia de Conducción) at the Ministerio de Transporte. Colombia has Pico y Placa (driving ban by plate on certain days in Medellín). Uber/InDriver recommended for daily life — no car needed in El Poblado/Laureles.",
      infoBoxType: "info",
      documents: [{ titleDE: "Internationaler Führerschein", titleEN: "International driving permit" }],
      tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },

    // ── SECTION: social ───────────────────────────────────────────────────
    {
      stepOrder: 24, phase: "first_month", section: "social",
      titleDE: "Deutsche und deutschsprachige Community in Medellín",
      titleEN: "German and German-speaking community in Medellín",
      timingDE: "Ab Ankunft", timingEN: "From arrival",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Medellín hat eine wachsende deutschsprachige Expat-Community (Digitaln Nomads, Auswanderer). Anlaufstellen: Goethe-Institut Medellín (Carrera 45 #53-24), AHK Kolumbien (Deutsch-Kolumbianische Handelskammer), InterNations Medellín. Facebook-Gruppen: 'Deutsche in Medellín', 'Expats in Medellín'. Stammtisch: unregelmäßig, über Facebook-Gruppen ankündigt.",
      infoBoxEN: "Medellín has a growing German-speaking expat community (digital nomads, emigrants). Contact points: Goethe-Institut Medellín (Carrera 45 #53-24), AHK Colombia (German-Colombian Chamber of Commerce), InterNations Medellín. Facebook groups: 'Deutsche in Medellín', 'Expats in Medellín'. Stammtisch: irregular, announced via Facebook groups.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 25, phase: "first_month", section: "social",
      titleDE: "Spanischkurse und Sprachintegration in Medellín",
      titleEN: "Spanish courses and language integration in Medellín",
      timingDE: "Vor oder direkt nach Ankunft", timingEN: "Before or immediately after arrival",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Kolumbianisches Spanisch gilt als besonders klar und langsam — ideal für Lernende. Sprachschulen: Universidad EAFIT (Idiomas), Enforex Medellín, zahlreiche Privatschulen in El Poblado. Online: iTalki (kolumbianische Tutoren ab ~10 USD/h). Intensivkurse Vollzeit 4 Wochen: ab ~300 USD. Englischniveau in Medellín niedrig — Grundkenntnisse Spanisch dringend empfohlen.",
      infoBoxEN: "Colombian Spanish is considered particularly clear and slow — ideal for learners. Language schools: Universidad EAFIT (Idiomas), Enforex Medellín, numerous private schools in El Poblado. Online: iTalki (Colombian tutors from ~USD 10/h). Full-time intensive courses 4 weeks: from ~USD 300. English level in Medellín is low — basic Spanish strongly recommended.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 26, phase: "first_month", section: "social",
      titleDE: "Remote-Work-Community und Coworking in Medellín",
      titleEN: "Remote work community and coworking in Medellín",
      timingDE: "Ab Ankunft", timingEN: "From arrival",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Medellín ist ein Top-5-Ziel für Digital Nomads weltweit. Coworking: Selina (Poblado), Hubogotá Medellín, The Spot. Tagestickets ab ~15 USD. Internet-Qualität in El Poblado zuverlässig (Glasfaser bis 300 Mbit/s). Events: MedellinValley Startup-Scene, Techstars Medellín Alumni. Nomad-Liste: Medellín regelmäßig unter Top 10.",
      infoBoxEN: "Medellín is a global top-5 destination for digital nomads. Coworking: Selina (Poblado), Hubogotá Medellín, The Spot. Day passes from ~USD 15. Internet quality in El Poblado reliable (fibre up to 300 Mbit/s). Events: MedellinValley startup scene, Techstars Medellín alumni. Nomad List: Medellín regularly in top 10.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: false, forFreelancer: true, forFounder: true, forFamily: false,
    },
  ]);

  // ─── Miami ─────────────────────────────────────────────────────────────────
  await seedMovingGuide("miami", [

    // ── SECTION: bureaucracy ──────────────────────────────────────────────
    {
      stepOrder: 0, phase: "critical", section: "bureaucracy",
      titleDE: "Wegzugsbesteuerung prüfen (§6 AStG) + US-Steuerrecht",
      titleEN: "Exit tax check (§6 AStG) + US tax law",
      subtitleDE: "Doppeltes Hochrisiko: DE-Wegzugsteuer + US worldwide taxation",
      subtitleEN: "Double high risk: German exit tax + US worldwide taxation",
      timingDE: "Sofort — vor jeder Planung", timingEN: "Immediately — before any planning",
      isWarning: true, riskLevel: "high", requiresLegalAdvice: true,
      sourceUrl: "https://www.irs.gov/individuals/international-taxpayers/us-tax-guide-for-aliens",
      sourceLabel: "IRS — US Tax Guide for Aliens 2024", lastVerified: NOW,
      infoBoxDE: "USA besteuern weltweites Einkommen aller US-Residents (Green Card / Substantial Presence Test). DBA Deutschland–USA existiert, aber komplex. §6 AStG bei GmbH-Anteilen >1 %. EU-Stundung gilt NICHT (USA kein EU-Mitglied). Beratung durch Steuerberater mit DE+US-Zulassung (Dual-Qualified) Pflicht. This information is for guidance only. Consult a qualified tax advisor before relocating.",
      infoBoxEN: "USA taxes worldwide income of all US residents (Green Card / Substantial Presence Test). Germany–USA DTA exists but is complex. §6 AStG on GmbH stakes >1%. EU deferral does NOT apply (USA not EU member). Advice from a dual-qualified (DE+US) tax advisor is mandatory. This information is for guidance only. Consult a qualified tax advisor before relocating.",
      infoBoxType: "danger",
      documents: [{ titleDE: "GmbH-Gesellschaftsvertrag", titleEN: "GmbH articles" }, { titleDE: "Depot-Auszug (letzte 12 Monate)", titleEN: "Securities depot statement (last 12 months)" }],
      tags: ["critical", "external_expert"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 1, phase: "before_move", section: "bureaucracy",
      titleDE: "US-Visum: Optionen für Deutsche",
      titleEN: "US visa: options for Germans",
      timingDE: "6–18 Monate vor Umzug", timingEN: "6–18 months before move",
      riskLevel: "medium", requiresLegalAdvice: false, lastVerified: NOW,
      sourceUrl: "https://de.usembassy.gov/de/visa/nicht-einwanderervisa/",
      sourceLabel: "US-Botschaft Berlin — Visa 2025",
      infoBoxDE: "Hauptoptionen für langfristigen US-Aufenthalt: E-2 Treaty Investor Visa (Investition min. ~100k USD in US-Unternehmen), L-1 Intra-Company Transfer, EB-5 Green Card (ab 800k USD Investition), O-1 (außerordentliche Fähigkeiten). Für Remote-Worker: kein spezielles Visum — B-1/B-2 erlaubt kurzfristiges Arbeiten für ausländische Firmen (90 Tage, umstritten). H-1B Lotterie (Arbeitgeber-sponsored). Einwanderungsanwalt empfohlen.",
      infoBoxEN: "Main options for long-term US stay: E-2 Treaty Investor Visa (investment min. ~USD 100k in US company), L-1 Intra-Company Transfer, EB-5 Green Card (from USD 800k investment), O-1 (extraordinary ability). For remote workers: no specific visa — B-1/B-2 allows short-term work for foreign companies (90 days, contested). H-1B lottery (employer-sponsored). Immigration attorney recommended.",
      infoBoxType: "warning",
      documents: [{ titleDE: "Reisepass (mind. 6 Monate gültig)", titleEN: "Passport (min. 6 months validity)" }],
      tags: ["doc_needed", "external_expert", "timing_critical"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 2, phase: "arrival", section: "bureaucracy",
      titleDE: "Social Security Number (SSN) beantragen",
      titleEN: "Apply for Social Security Number (SSN)",
      timingDE: "Nach Ankunft mit gültigem Visum", timingEN: "After arrival with valid visa",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      sourceUrl: "https://www.ssa.gov/ssnumber/",
      sourceLabel: "Social Security Administration — SSN 2025",
      infoBoxDE: "SSN ist die US-Steuer-ID. Notwendig für: Arbeit, Bankkonto, Kreditkarte, Mietvertrag, Steuererklärung. Antrag bei der Social Security Administration (SSA) — nächstes Büro in Miami. Wartezeit: 2–4 Wochen. Alternative für Steuern ohne SSN: ITIN (Individual Taxpayer Identification Number).",
      infoBoxEN: "SSN is the US tax ID. Needed for: work, bank account, credit card, rental contract, tax return. Apply at Social Security Administration (SSA) — nearest office in Miami. Wait time: 2–4 weeks. Alternative for taxes without SSN: ITIN (Individual Taxpayer Identification Number).",
      infoBoxType: "info",
      documents: [{ titleDE: "Reisepass + Visum", titleEN: "Passport + visa" }, { titleDE: "Wohnsitznachweis (Utility Bill oder Mietvertrag)", titleEN: "Proof of address (utility bill or rental contract)" }],
      tags: ["doc_needed"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 3, phase: "arrival", section: "bureaucracy",
      titleDE: "Florida Driver's License oder State ID beantragen",
      titleEN: "Apply for Florida Driver's License or State ID",
      timingDE: "Innerhalb 30 Tage nach Wohnsitznahme in FL", timingEN: "Within 30 days of establishing FL residence",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      sourceUrl: "https://www.flhsmv.gov/driver-licenses-id-cards/",
      sourceLabel: "Florida DHSMV — Driver License 2025",
      infoBoxDE: "Florida Driver's License ist der zentrale Ausweis für alle US-Alltagssituationen (Alkoholkauf, Banken, Vermieter). Pflicht für alle, die in Florida wohnen und fahren. Antrag beim DHSMV (Department of Highway Safety). Theorietest + Sehtest. Deutsche Fahrerlaubnis kann umgeschrieben werden — trotzdem Theorietest nötig.",
      infoBoxEN: "Florida Driver's License is the central ID for all US daily situations (alcohol purchase, banks, landlords). Required for all Florida residents who drive. Apply at DHSMV (Department of Highway Safety). Written test + eye test. German licence can be transferred — written test still required.",
      infoBoxType: "info",
      documents: [{ titleDE: "Reisepass + Visum", titleEN: "Passport + visa" }, { titleDE: "SSN oder ITIN", titleEN: "SSN or ITIN" }, { titleDE: "Wohnsitznachweis (2 Dokumente)", titleEN: "Proof of address (2 documents)" }],
      tags: ["doc_needed"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 4, phase: "arrival", section: "bureaucracy",
      titleDE: "Anmeldung beim deutschen Generalkonsulat Miami",
      titleEN: "Register at German Consulate General Miami",
      timingDE: "Innerhalb 3 Monate nach Ankunft", timingEN: "Within 3 months of arrival",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      sourceUrl: "https://miami.diplo.de/us-de/service/buergerservice",
      sourceLabel: "Deutsches Generalkonsulat Miami 2025",
      infoBoxDE: "Deutsches Generalkonsulat Miami (zuständig für FL, GA, SC, NC, TN, MS, AL, PR). Adresse: 100 N Biscayne Blvd, Suite 2200, Miami. Auslandsregistrierung für Briefwahl, Passverlängerung, Krisentelefon. Termine online buchbar.",
      infoBoxEN: "German Consulate General Miami (competent for FL, GA, SC, NC, TN, MS, AL, PR). Address: 100 N Biscayne Blvd, Suite 2200, Miami. Overseas registration for postal voting, passport renewal, crisis helpline. Appointments bookable online.",
      infoBoxType: "info",
      documents: [{ titleDE: "Reisepass", titleEN: "Passport" }, { titleDE: "US-Adressnachweis", titleEN: "US address proof" }],
      tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },

    // ── SECTION: tax_planning ─────────────────────────────────────────────
    {
      stepOrder: 5, phase: "critical", section: "tax_planning",
      titleDE: "DBA Deutschland–USA: Komplex, kein Schutz gegen Wegzugsteuer",
      titleEN: "Germany–USA DTA: complex, no protection against exit tax",
      subtitleDE: "Dual-Qualified Steuerberater Pflicht",
      subtitleEN: "Dual-qualified tax advisor mandatory",
      timingDE: "Vor Wegzug", timingEN: "Before departure",
      isWarning: true, riskLevel: "high", requiresLegalAdvice: true, lastVerified: NOW,
      sourceUrl: "https://www.bzst.de/DE/Service/Laenderbezogene_Informationen/USA/usa_node.html",
      sourceLabel: "Bundeszentralamt für Steuern — USA DBA 2024",
      infoBoxDE: "DBA Deutschland–USA (1989, 2006 aktualisiert) regelt Zuteilungsrechte für verschiedene Einkunftsarten. Schützt NICHT vollständig vor Doppelbesteuerung bei Wegzug. US Substantial Presence Test: 183 Tage in 3 Jahren → US-Steuerresident. Als Green Card Holder: weltweites Einkommen US-steuerpflichtig. FBAR-Meldepflicht für ausländische Konten über 10.000 USD. This information is for guidance only. Consult a dual-qualified tax advisor before relocating.",
      infoBoxEN: "Germany–USA DTA (1989, updated 2006) allocates taxing rights for various income types. Does NOT fully protect against double taxation on departure. US Substantial Presence Test: 183 days in 3 years → US tax resident. As Green Card holder: worldwide income subject to US tax. FBAR reporting obligation for foreign accounts over USD 10,000. This information is for guidance only. Consult a dual-qualified tax advisor before relocating.",
      infoBoxType: "danger",
      documents: [], tags: ["critical", "external_expert"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 6, phase: "before_move", section: "tax_planning",
      titleDE: "Florida: kein State Income Tax — Vorteil für Auswanderer",
      titleEN: "Florida: no state income tax — advantage for emigrants",
      timingDE: "Vor Umzug berücksichtigen", timingEN: "Consider before relocation",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      sourceUrl: "https://floridarevenue.com/taxes/taxesfees/Pages/corporate.aspx",
      sourceLabel: "Florida Department of Revenue — State Taxes 2025",
      infoBoxDE: "Florida erhebt keine State Income Tax auf Einkommen (im Gegensatz zu California ~13 %, New York ~12 %). Federal Tax (IRS) gilt trotzdem: 10 %–37 % auf Einkommen. Kapitalertragssteuer: Federal 15 %–23,8 % (je nach Haltedauer). Florida: populär für Kapitaleinkommen-Empfänger und Rentner.",
      infoBoxEN: "Florida levies no state income tax (unlike California ~13%, New York ~12%). Federal Tax (IRS) still applies: 10%–37% on income. Capital gains tax: Federal 15%–23.8% (depending on holding period). Florida: popular for capital income recipients and retirees.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 7, phase: "first_3_months", section: "tax_planning",
      titleDE: "FBAR und FATCA: Meldepflicht für ausländische Konten",
      titleEN: "FBAR and FATCA: reporting obligations for foreign accounts",
      timingDE: "Jährlich — Frist 15. April", timingEN: "Annually — deadline 15 April",
      riskLevel: "high", requiresLegalAdvice: true, lastVerified: NOW,
      sourceUrl: "https://www.irs.gov/businesses/small-businesses-self-employed/report-of-foreign-bank-and-financial-accounts-fbar",
      sourceLabel: "IRS — FBAR Reporting 2024",
      infoBoxDE: "FBAR (FinCEN 114): Pflicht für US-Residents mit ausländischen Konten mit Gesamtguthaben über 10.000 USD zu irgendeinem Zeitpunkt im Jahr. Frist: 15. April (automatische Verlängerung 15. Oktober). Strafen bei Verstoß: bis 10.000 USD (unabsichtlich) oder 50 % des Kontoguthabens (vorsätzlich). FATCA (Form 8938): zusätzliche IRS-Meldung bei ausländischen Vermögenswerten >50.000 USD. This information is for guidance only. Consult a qualified tax advisor.",
      infoBoxEN: "FBAR (FinCEN 114): mandatory for US residents with foreign accounts with aggregate balance exceeding USD 10,000 at any point during the year. Deadline: 15 April (automatic extension to 15 October). Penalties for violation: up to USD 10,000 (unintentional) or 50% of account balance (wilful). FATCA (Form 8938): additional IRS report for foreign assets >USD 50,000. This information is for guidance only. Consult a qualified tax advisor.",
      infoBoxType: "danger",
      documents: [], tags: ["critical", "external_expert"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 8, phase: "first_3_months", section: "tax_planning",
      titleDE: "Self-Employment Tax und Quartalsvorauszahlungen",
      titleEN: "Self-employment tax and quarterly estimated payments",
      timingDE: "Jährlich: Jan, Apr, Jun, Sep", timingEN: "Annually: Jan, Apr, Jun, Sep",
      riskLevel: "medium", requiresLegalAdvice: false, lastVerified: NOW,
      sourceUrl: "https://www.irs.gov/businesses/small-businesses-self-employed/self-employment-tax",
      sourceLabel: "IRS — Self-Employment Tax 2024",
      infoBoxDE: "Freelancer und Selbstständige zahlen Self-Employment Tax: 15,3 % auf Nettoeinkommen (Social Security 12,4 % + Medicare 2,9 %). Zusätzlich Federal Income Tax. Quartalsweise Vorauszahlungen (Estimated Tax) an IRS — Versäumnis führt zu Strafzinsen. CPA (Certified Public Accountant) für Steuererklärung empfohlen.",
      infoBoxEN: "Freelancers and self-employed pay Self-Employment Tax: 15.3% on net income (Social Security 12.4% + Medicare 2.9%). Federal Income Tax on top. Quarterly estimated tax payments to IRS — failure leads to penalty interest. CPA (Certified Public Accountant) recommended for tax return.",
      infoBoxType: "info",
      documents: [], tags: ["external_expert"], translationSource: "manual",
      forEmployed: false, forFreelancer: true, forFounder: true, forFamily: false,
    },
    {
      stepOrder: 9, phase: "first_3_months", section: "tax_planning",
      titleDE: "LLC-Gründung in Florida für Selbstständige",
      titleEN: "LLC formation in Florida for self-employed",
      timingDE: "Innerhalb 3 Monate", timingEN: "Within 3 months",
      riskLevel: "medium", requiresLegalAdvice: false, lastVerified: NOW,
      sourceUrl: "https://dos.fl.gov/sunbiz/forms/",
      sourceLabel: "Florida Division of Corporations — LLC 2025",
      infoBoxDE: "Florida LLC: günstig (125 USD Gründungsgebühr), schnell (1–3 Tage), flexibel. Für Freelancer: Single-Member LLC + pass-through taxation empfohlen. EIN (Employer Identification Number) vom IRS beantragen — kostenlos online. Registered Agent erforderlich (Dienstleister ab ~50 USD/Jahr). Jährliche Pflichtgebühr: 138,75 USD.",
      infoBoxEN: "Florida LLC: cheap (USD 125 formation fee), fast (1–3 days), flexible. For freelancers: Single-Member LLC + pass-through taxation recommended. EIN (Employer Identification Number) from IRS — free online. Registered Agent required (service provider from ~USD 50/year). Annual mandatory fee: USD 138.75.",
      infoBoxType: "info",
      documents: [{ titleDE: "SSN oder ITIN", titleEN: "SSN or ITIN" }],
      tags: [], translationSource: "manual",
      forEmployed: false, forFreelancer: true, forFounder: true, forFamily: false,
    },

    // ── SECTION: banking ──────────────────────────────────────────────────
    {
      stepOrder: 10, phase: "arrival", section: "banking",
      titleDE: "US-Bankkonto in Miami eröffnen",
      titleEN: "Open a US bank account in Miami",
      subtitleDE: "SSN oder ITIN erforderlich — Wartezeit 1–2 Wochen",
      subtitleEN: "SSN or ITIN required — processing time 1–2 weeks",
      timingDE: "Nach SSN-Erhalt — sofort", timingEN: "After receiving SSN — immediately",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Miami-Banken für Ausländer (Stand Mai 2026): Bank of America, Chase, Citibank (international-freundlich, da global), Wells Fargo. Für Hispano-Community: Banco Santander US. Online-Alternative: Wise Business-Konto (keine SSN nötig für EUR-Konten). Voraussetzungen: SSN + Reisepass + Visum + US-Adressnachweis. Kreditkarte (Credit History aufbauen): Capital One Journey, Discover it für Neueinwanderer.",
      infoBoxEN: "Miami banks for foreigners (as of May 2026): Bank of America, Chase, Citibank (internationally friendly as global), Wells Fargo. For the Hispanic community: Banco Santander US. Online alternative: Wise Business account (no SSN needed for EUR accounts). Requirements: SSN + passport + visa + US proof of address. Credit card (building credit history): Capital One Journey, Discover it for new immigrants.",
      infoBoxType: "info",
      documents: [{ titleDE: "SSN", titleEN: "SSN" }, { titleDE: "Reisepass + Visum", titleEN: "Passport + visa" }, { titleDE: "US-Adressnachweis", titleEN: "US proof of address" }],
      tags: ["doc_needed"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 11, phase: "first_month", section: "banking",
      titleDE: "Credit History aufbauen (US-Kreditsystem)",
      titleEN: "Building credit history (US credit system)",
      timingDE: "Sofort nach Bankkonto-Eröffnung", timingEN: "Immediately after opening bank account",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "US-Kreditwürdigkeit (Credit Score) bestimmt: Wohnung mieten, Handyvertrag, Autoversicherung, Hypothek. Ohne US-Vergangenheit: Credit Score = 0. Aufbau: 1. Secured Credit Card beantragen, 2. Karte regelmäßig nutzen und pünktlich bezahlen, 3. Utilities auf eigenen Namen. Credit Score nach 6–12 Monaten verwertbar.",
      infoBoxEN: "US credit score determines: renting an apartment, phone contract, car insurance, mortgage. Without US history: Credit Score = 0. Building: 1. Apply for secured credit card, 2. Use regularly and pay on time, 3. Utilities in own name. Credit score usable after 6–12 months.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 12, phase: "first_month", section: "banking",
      titleDE: "Geldtransfers DE ↔ USA",
      titleEN: "Money transfers DE ↔ USA",
      timingDE: "Laufend", timingEN: "Ongoing",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Wise: beste Wechselkurse, SWIFT-Transfer in ~1–2 Werktagen. Revolut: gut für kleinere Beträge. Traditionell: SWIFT via Hausbank (teuer, 20–40 EUR Gebühren + schlechter Kurs). Betragsgrenzen: über 10.000 USD an IRS meldepflichtig (Form 8300 bei Bargeld), bei Banküberweisung automatisch gemeldet.",
      infoBoxEN: "Wise: best exchange rates, SWIFT transfer in ~1–2 business days. Revolut: good for smaller amounts. Traditional: SWIFT via home bank (expensive, EUR 20–40 fees + poor rate). Amount limits: over USD 10,000 reportable to IRS (Form 8300 for cash), bank transfers reported automatically.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },

    // ── SECTION: insurance ────────────────────────────────────────────────
    {
      stepOrder: 13, phase: "critical", section: "insurance",
      titleDE: "US-Krankenversicherung — Hochpriorität",
      titleEN: "US health insurance — top priority",
      subtitleDE: "USA haben kein öffentliches KV-System — private KV Pflicht",
      subtitleEN: "USA has no public health system — private insurance mandatory",
      timingDE: "Vor Einreise oder sofort nach Ankunft", timingEN: "Before entry or immediately on arrival",
      isWarning: true, riskLevel: "high", requiresLegalAdvice: true, lastVerified: NOW,
      sourceUrl: "https://www.healthcare.gov/immigrants/",
      sourceLabel: "Healthcare.gov — Insurance for Immigrants 2025",
      infoBoxDE: "USA kein staatliches Gesundheitssystem (Medicare erst ab 65 oder Behinderung). Optionen: 1. Employer-sponsored insurance (Arbeitgeber zahlt ~70–80 %), 2. ACA Marketplace Plan (healthcare.gov — einkommensabhängige Subventionen), 3. Private internationale KV (Cigna, Aetna). Kosten ohne Arbeitgeber: 400–1.200 USD/Monat für Einzelperson. OHNE KV: ein Krankenhausaufenthalt kann 50.000–200.000 USD kosten.",
      infoBoxEN: "USA has no public health system (Medicare only from age 65 or disability). Options: 1. Employer-sponsored insurance (employer pays ~70–80%), 2. ACA Marketplace Plan (healthcare.gov — income-based subsidies), 3. Private international insurance (Cigna, Aetna). Cost without employer: USD 400–1,200/month for an individual. WITHOUT insurance: one hospital stay can cost USD 50,000–200,000.",
      infoBoxType: "danger",
      documents: [], tags: ["timing_critical"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 14, phase: "first_month", section: "insurance",
      titleDE: "Weitere Pflichtversicherungen in Florida",
      titleEN: "Other mandatory insurances in Florida",
      timingDE: "Innerhalb 30 Tage nach Wohnsitz", timingEN: "Within 30 days of establishing residence",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "KFZ-Versicherung: Pflicht in Florida — Mindestdeckung PIP (Personal Injury Protection) 10.000 USD + PDL (Property Damage Liability) 10.000 USD. Ohne: Führerscheinsuspendierung. Renters Insurance: nicht gesetzlich Pflicht, aber meist vom Vermieter verlangt (ab ~15 USD/Monat). Life/Disability Insurance: optional, empfohlen für Selbstständige. Hurricane Insurance für Eigentümer in FL Pflicht.",
      infoBoxEN: "Car insurance: mandatory in Florida — minimum PIP (Personal Injury Protection) USD 10,000 + PDL (Property Damage Liability) USD 10,000. Without: licence suspension. Renters insurance: not legally required, but usually required by landlord (from ~USD 15/month). Life/disability insurance: optional, recommended for self-employed. Hurricane insurance: mandatory for property owners in FL.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },

    // ── SECTION: housing ──────────────────────────────────────────────────
    {
      stepOrder: 15, phase: "before_move", section: "housing",
      titleDE: "Miami Stadtteile für Auswanderer",
      titleEN: "Miami neighbourhoods for emigrants",
      timingDE: "3–6 Monate vor Umzug", timingEN: "3–6 months before move",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Empfohlene Stadtteile: Brickell (Finanzzentrum, modern, jung, teuer), Coconut Grove (grün, entspannt, familienfreundlich), Coral Gables (gehoben, sicher, Universitätsviertel), Wynwood (kreativ, Streetart, junge Expats), South Beach (Tourismus, teuer, Partyviertel). Günstigere Optionen: Doral (Westmiami, viele venezolanische Expats), Hialeah. Portale: Zillow, Apartments.com, Realtor.com.",
      infoBoxEN: "Recommended neighbourhoods: Brickell (financial district, modern, young, expensive), Coconut Grove (green, relaxed, family-friendly), Coral Gables (upscale, safe, university area), Wynwood (creative, street art, young expats), South Beach (tourism, expensive, party area). Cheaper options: Doral (West Miami, many Venezuelan expats), Hialeah. Portals: Zillow, Apartments.com, Realtor.com.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 16, phase: "arrival", section: "housing",
      titleDE: "Mietvertrag in Miami und Credit Check",
      titleEN: "Rental contract in Miami and credit check",
      timingDE: "Vor Unterzeichnung", timingEN: "Before signing",
      riskLevel: "medium", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Mietpreise Miami 2026: 1-Zimmer Brickell ~3.000 USD/Monat, Coral Gables ~2.200 USD/Monat. Vermieter verlangen: Credit Score Check (Problem bei Neuankömmlingen ohne US-Geschichte), Einkommensnachweis (3× Monatsmiete), erste + letzte Monatsmiete + Kaution. Alternative bei keinem Credit Score: erhöhte Kaution (2–3 Monatsmieten) oder Bürge.",
      infoBoxEN: "Miami rental prices 2026: 1-bedroom Brickell ~USD 3,000/month, Coral Gables ~USD 2,200/month. Landlords require: credit score check (problem for newcomers without US history), income proof (3× monthly rent), first + last month + deposit. Alternative with no credit score: increased deposit (2–3 months) or guarantor.",
      infoBoxType: "warning",
      documents: [{ titleDE: "SSN", titleEN: "SSN" }, { titleDE: "Einkommensnachweis", titleEN: "Income proof" }],
      tags: ["doc_needed"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },

    // ── SECTION: practical ────────────────────────────────────────────────
    {
      stepOrder: 17, phase: "arrival", section: "practical",
      titleDE: "Stecker, Spannung und Kommunikation",
      titleEN: "Plugs, voltage and communication",
      timingDE: "Vor Abreise", timingEN: "Before departure",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Stecker Typ A/B (US-Standard) — Adapter für deutsche Stecker erforderlich. Spannung: 110V/60Hz — Umspanner für 220V-Geräte nötig (oder neue kaufen). SIM-Karte: T-Mobile USA, AT&T, Verizon. eSIM (Airalo, T-Mobile Go5G) für erste Wochen empfohlen. US-Handyvertrag: SSN oft nicht erforderlich für Prepaid-Pläne.",
      infoBoxEN: "Plug type A/B (US standard) — adapter required for German plugs. Voltage: 110V/60Hz — transformer needed for 220V appliances (or buy new). SIM card: T-Mobile USA, AT&T, Verizon. eSIM (Airalo, T-Mobile Go5G) recommended for first weeks. US phone contract: SSN often not required for prepaid plans.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 18, phase: "arrival", section: "practical",
      titleDE: "Klima, Hurrikane und Alltag in Miami",
      titleEN: "Climate, hurricanes and everyday life in Miami",
      timingDE: "Ab Ankunft", timingEN: "From arrival",
      riskLevel: "medium", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Miami: tropisches Klima (heiß + humid Jun–Sep). Hurrikansaison: 1. Juni – 30. November. Für Mieter: Notfallplan kennen, Hurricane Kit (Wasser, Lebensmittel, Taschenlampe) bereithalten. Hitze: 32–35°C + hohe Luftfeuchtigkeit im Sommer — KFZ mit starker A/C praktisch. Strandleben, Outdoor: ganzjährig möglich (Nov–Apr mild ~25°C). Fahrzeug in Miami fast unentbehrlich (öffentlicher Nahverkehr begrenzt).",
      infoBoxEN: "Miami: tropical climate (hot + humid Jun–Sep). Hurricane season: 1 June – 30 November. For renters: know emergency plan, keep hurricane kit (water, food, torch). Heat: 32–35°C + high humidity in summer — car with strong AC practical. Beach life, outdoor: possible year-round (Nov–Apr mild ~25°C). Vehicle in Miami almost indispensable (limited public transport).",
      infoBoxType: "warning",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 19, phase: "arrival", section: "practical",
      titleDE: "Notrufnummern und Deutsche Botschaft Miami",
      titleEN: "Emergency numbers and German Consulate Miami",
      timingDE: "Ab Ankunft", timingEN: "From arrival",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Notruf: 911 (Polizei, Feuerwehr, Krankenwagen). Deutsches Generalkonsulat Miami: +1 305-358-0290. Notfall-Helpline: +1 305-579-9900. Miami Police Non-Emergency: 311. Wasserqualität: Leitungswasser in Miami trinkbar.",
      infoBoxEN: "Emergency: 911 (police, fire, ambulance). German Consulate General Miami: +1 305-358-0290. Emergency helpline: +1 305-579-9900. Miami Police non-emergency: 311. Water quality: tap water in Miami is drinkable.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },

    // ── SECTION: social ───────────────────────────────────────────────────
    {
      stepOrder: 20, phase: "first_month", section: "social",
      titleDE: "Deutsche Community in Miami",
      titleEN: "German community in Miami",
      timingDE: "Ab Ankunft", timingEN: "From arrival",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Miami hat eine mittelgroße, gut vernetzte deutschsprachige Community. Anlaufstellen: AHK USA Südost (Deutsch-Amerikanische Handelskammer, 100 SE 2nd Street, Miami), Goethe-Institut Atlanta (nächstes Goethe, ~10h entfernt — keine Miami-Filiale), InterNations Miami, German-American Heritage Club of Miami. DASA (Deutsche Auslandsschularbeit): Keine Deutsche Schule in Miami — nächste in New York/Chicago.",
      infoBoxEN: "Miami has a medium-sized, well-networked German-speaking community. Contact points: AHK USA Southeast (German-American Chamber of Commerce, 100 SE 2nd Street, Miami), Goethe-Institut Atlanta (nearest, ~10h away — no Miami branch), InterNations Miami, German-American Heritage Club of Miami. No German school in Miami — nearest in New York/Chicago.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 21, phase: "first_month", section: "social",
      titleDE: "Coworking und Tech-Scene in Miami",
      titleEN: "Coworking and tech scene in Miami",
      timingDE: "Ab Ankunft", timingEN: "From arrival",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Miami hat sich seit 2021 als Tech-Hub etabliert (Mayor Suarez: 'Miami is the new Silicon Valley'). Startup-Szene: eMerge Americas (jährliche Konferenz), Wyncode Academy, Endeavor Miami. Coworking: WeWork Brickell, Office Evolution, Venture X Doral. Remote-Work in Miami-Cafés: CIBO (Brickell), Panther Coffee (Wynwood). Internet in Brickell/Coconut Grove zuverlässig (Glasfaser).",
      infoBoxEN: "Miami has established itself as a tech hub since 2021 (Mayor Suarez: 'Miami is the new Silicon Valley'). Startup scene: eMerge Americas (annual conference), Wyncode Academy, Endeavor Miami. Coworking: WeWork Brickell, Office Evolution, Venture X Doral. Remote work cafés: CIBO (Brickell), Panther Coffee (Wynwood). Internet in Brickell/Coconut Grove reliable (fibre).",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
  ]);

  // ─── New York ──────────────────────────────────────────────────────────────
  await seedMovingGuide("new-york", [

    // ── SECTION: bureaucracy ──────────────────────────────────────────────
    {
      stepOrder: 0, phase: "critical", section: "bureaucracy",
      titleDE: "Wegzugsbesteuerung prüfen (§6 AStG) + US worldwide taxation",
      titleEN: "Exit tax check (§6 AStG) + US worldwide taxation",
      subtitleDE: "New York State + City Tax zusätzlich zur Federal Tax",
      subtitleEN: "New York State + City Tax in addition to Federal Tax",
      timingDE: "Sofort — vor jeder Planung", timingEN: "Immediately — before any planning",
      isWarning: true, riskLevel: "high", requiresLegalAdvice: true,
      sourceUrl: "https://www.tax.ny.gov/pit/file/nonresident_alien.htm",
      sourceLabel: "New York State Tax Authority — Non-Resident Tax 2024", lastVerified: NOW,
      infoBoxDE: "New York City + State Income Tax: zusätzlich zur Federal Tax bis zu 12,7 % Gesamtbelastung State+City. DBA Deutschland–USA komplex (kein vollständiger Schutz). §6 AStG bei GmbH-Anteilen — kein EU-Stundungsrecht. FBAR + FATCA-Meldepflicht (s. Miami). Dual-qualified Steuerberater DE+US Pflicht. This information is for guidance only. Consult a dual-qualified tax advisor before relocating.",
      infoBoxEN: "New York City + State Income Tax: in addition to Federal Tax, up to 12.7% total State+City burden. Germany–USA DTA complex (no full protection). §6 AStG on GmbH stakes — no EU deferral right. FBAR + FATCA reporting (see Miami). Dual-qualified DE+US tax advisor mandatory. This information is for guidance only. Consult a dual-qualified tax advisor before relocating.",
      infoBoxType: "danger",
      documents: [{ titleDE: "GmbH-Gesellschaftsvertrag", titleEN: "GmbH articles" }, { titleDE: "Depot-Auszug (letzte 12 Monate)", titleEN: "Securities depot statement (last 12 months)" }],
      tags: ["critical", "external_expert"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 1, phase: "before_move", section: "bureaucracy",
      titleDE: "US-Visum für New York — gleiche Optionen wie Miami",
      titleEN: "US visa for New York — same options as Miami",
      timingDE: "6–18 Monate vor Umzug", timingEN: "6–18 months before move",
      riskLevel: "medium", requiresLegalAdvice: false, lastVerified: NOW,
      sourceUrl: "https://de.usembassy.gov/de/visa/nicht-einwanderervisa/",
      sourceLabel: "US-Botschaft Berlin — Visa 2025",
      infoBoxDE: "Visaoptionen identisch zu Miami: E-2, L-1, O-1, H-1B, EB-5, Green Card. New York ist besonders relevant für: H-1B (Tech, Finance), O-1 (Künstler, Wissenschaftler), L-1 (Unternehmensinterne Versetzung). H-1B Lottery-Quote: ~33 % (Tech-Profis mit Masterstudium: ~50 %). Einwanderungsanwalt empfohlen.",
      infoBoxEN: "Visa options identical to Miami: E-2, L-1, O-1, H-1B, EB-5, Green Card. New York particularly relevant for: H-1B (tech, finance), O-1 (artists, scientists), L-1 (intra-company transfer). H-1B lottery rate: ~33% (tech professionals with Master's: ~50%). Immigration attorney recommended.",
      infoBoxType: "warning",
      documents: [{ titleDE: "Reisepass (mind. 6 Monate gültig)", titleEN: "Passport (min. 6 months validity)" }],
      tags: ["doc_needed", "external_expert", "timing_critical"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 2, phase: "arrival", section: "bureaucracy",
      titleDE: "Social Security Number (SSN) und New York State ID",
      titleEN: "Social Security Number (SSN) and New York State ID",
      timingDE: "Nach Ankunft mit gültigem Visum", timingEN: "After arrival with valid visa",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      sourceUrl: "https://dmv.ny.gov/id-card/get-standard-non-driver-id-card",
      sourceLabel: "New York DMV — ID Card 2025",
      infoBoxDE: "SSN beim nächsten SSA-Büro beantragen (Manhattan: 123 William Street). New York State ID / Driver's License: NY DMV — Teorietest + Sehtest. NY hat REAL ID (seit 2023 für Inlandsflüge Pflicht). Wartezeit SSN: 2–4 Wochen. NY Fahrtauglichkeitsprüfung: praktisch + schriftlich.",
      infoBoxEN: "Apply for SSN at nearest SSA office (Manhattan: 123 William Street). New York State ID / Driver's License: NY DMV — written test + eye test. NY has REAL ID (mandatory for domestic flights since 2023). SSN wait time: 2–4 weeks. NY driving test: practical + written.",
      infoBoxType: "info",
      documents: [{ titleDE: "Reisepass + Visum", titleEN: "Passport + visa" }, { titleDE: "US-Adressnachweis (2 Dokumente)", titleEN: "US proof of address (2 documents)" }],
      tags: ["doc_needed"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 3, phase: "arrival", section: "bureaucracy",
      titleDE: "Anmeldung beim deutschen Generalkonsulat New York",
      titleEN: "Register at German Consulate General New York",
      timingDE: "Innerhalb 3 Monate nach Ankunft", timingEN: "Within 3 months of arrival",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      sourceUrl: "https://new-york.diplo.de/us-de/service/buergerservice",
      sourceLabel: "Deutsches Generalkonsulat New York 2025",
      infoBoxDE: "Deutsches Generalkonsulat New York: 871 United Nations Plaza, New York. Zuständig für: NY, NJ, CT, PA, DE, MD, VA, DC, WV. Auslandsregistrierung für Briefwahl, Passverlängerung. Termine via Terminvergabeportal online buchbar.",
      infoBoxEN: "German Consulate General New York: 871 United Nations Plaza, New York. Competent for: NY, NJ, CT, PA, DE, MD, VA, DC, WV. Overseas registration for postal voting, passport renewal. Appointments bookable via online appointment portal.",
      infoBoxType: "info",
      documents: [{ titleDE: "Reisepass", titleEN: "Passport" }, { titleDE: "US-Adressnachweis", titleEN: "US address proof" }],
      tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },

    // ── SECTION: tax_planning ─────────────────────────────────────────────
    {
      stepOrder: 4, phase: "critical", section: "tax_planning",
      titleDE: "New York State + City Tax: Höchste Steuerbelastung der USA",
      titleEN: "New York State + City Tax: highest tax burden in the USA",
      subtitleDE: "Kombination aus Federal + State + City kann 50 %+ erreichen",
      subtitleEN: "Combination of Federal + State + City can reach 50%+",
      timingDE: "Vor Umzug berechnen", timingEN: "Calculate before relocation",
      isWarning: true, riskLevel: "high", requiresLegalAdvice: true, lastVerified: NOW,
      sourceUrl: "https://www.tax.ny.gov/pit/",
      sourceLabel: "New York State Department of Taxation — PIT 2024",
      infoBoxDE: "Federal Income Tax: bis 37 %. New York State Tax: bis 10,9 % (höchste Rate ab 25 Mio. USD Einkommen). New York City Tax: bis 3,876 %. Gesamtbelastung für High-Earner: bis ~54 %. Kein Schutz durch DBA gegen volle NY-Besteuerung. Für Hochverdiener: Vergleich Florida vs. New York — bis 15 % p.a. Differenz. This information is for guidance only. Consult a dual-qualified tax advisor.",
      infoBoxEN: "Federal Income Tax: up to 37%. New York State Tax: up to 10.9% (highest rate from USD 25M income). New York City Tax: up to 3.876%. Total burden for high earners: up to ~54%. No DTA protection against full NY taxation. For high earners: compare Florida vs. New York — up to 15% p.a. difference. This information is for guidance only. Consult a dual-qualified tax advisor.",
      infoBoxType: "danger",
      documents: [], tags: ["critical", "external_expert"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 5, phase: "before_move", section: "tax_planning",
      titleDE: "FBAR und FATCA: Meldepflicht ausländische Konten",
      titleEN: "FBAR and FATCA: foreign account reporting obligations",
      timingDE: "Jährlich — Frist 15. April", timingEN: "Annually — deadline 15 April",
      riskLevel: "high", requiresLegalAdvice: true, lastVerified: NOW,
      sourceUrl: "https://www.irs.gov/businesses/small-businesses-self-employed/report-of-foreign-bank-and-financial-accounts-fbar",
      sourceLabel: "IRS — FBAR Reporting 2024",
      infoBoxDE: "Identisch zu Miami: FBAR (FinCEN 114) bei ausländischen Konten über 10.000 USD Gesamtguthaben. FATCA (Form 8938) bei ausländischen Vermögenswerten über 50.000 USD. Strafen: bis 50 % des Kontoguthabens bei Vorsatz. CPA mit internationalem Fokus zwingend. This information is for guidance only. Consult a qualified tax advisor.",
      infoBoxEN: "Identical to Miami: FBAR (FinCEN 114) for foreign accounts with aggregate balance over USD 10,000. FATCA (Form 8938) for foreign assets over USD 50,000. Penalties: up to 50% of account balance for wilful violation. CPA with international focus mandatory. This information is for guidance only. Consult a qualified tax advisor.",
      infoBoxType: "danger",
      documents: [], tags: ["critical", "external_expert"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 6, phase: "first_3_months", section: "tax_planning",
      titleDE: "NYC vs. NJ: Wohnsitz-Optimierung für Steuern",
      titleEN: "NYC vs. NJ: residence optimisation for taxes",
      timingDE: "Vor Wohnungsentscheidung", timingEN: "Before housing decision",
      riskLevel: "medium", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Wohnen in New Jersey (Jersey City, Hoboken) statt NYC: kein NYC City Tax (~3,9 %), New Jersey State Tax ~5,7 % bis 10,75 %. Pendeln nach NYC per PATH-Train möglich (ca. 20 Min). Empfehlenswert für Angestellte in NYC: NJ-Wohnsitz kann 3–4 % Steuern sparen. Achtung: bei NJ-Wohnsitz + NYC-Arbeit: NYC-Nichtresidenten-Steuer trotzdem möglich.",
      infoBoxEN: "Living in New Jersey (Jersey City, Hoboken) instead of NYC: no NYC City Tax (~3.9%), New Jersey State Tax ~5.7% to 10.75%. Commuting to NYC via PATH train possible (approx. 20 min). Recommended for NYC employees: NJ residence can save 3–4% in taxes. Note: with NJ residence + NYC work: NYC non-resident tax may still apply.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: false, forFounder: false, forFamily: true,
    },

    // ── SECTION: banking ──────────────────────────────────────────────────
    {
      stepOrder: 7, phase: "arrival", section: "banking",
      titleDE: "US-Bankkonto in New York eröffnen",
      titleEN: "Open a US bank account in New York",
      timingDE: "Nach SSN-Erhalt — sofort", timingEN: "After receiving SSN — immediately",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Empfohlene Banken NYC für Ausländer (Stand Mai 2026): Chase (größtes Filialnetz), Citibank (international-freundlich), Bank of America, HSBC (Expatriates-Produkte). Online: Mercury (für Startups/LLCs, keine SSN für Eröffnung). Deutsche Community: Keine deutsche Bank mit NYC-Filiale. Kreditkarte aufbauen: Chase Freedom, Capital One Savor — auch für Neuankömmlinge.",
      infoBoxEN: "Recommended NYC banks for foreigners (as of May 2026): Chase (largest branch network), Citibank (internationally friendly), Bank of America, HSBC (expat products). Online: Mercury (for startups/LLCs, no SSN for opening). German community: no German bank with NYC branch. Build credit card: Chase Freedom, Capital One Savor — also for newcomers.",
      infoBoxType: "info",
      documents: [{ titleDE: "SSN", titleEN: "SSN" }, { titleDE: "Reisepass + Visum", titleEN: "Passport + visa" }, { titleDE: "US-Adressnachweis", titleEN: "US proof of address" }],
      tags: ["doc_needed"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 8, phase: "first_month", section: "banking",
      titleDE: "Credit History aufbauen und internationale Transfers",
      titleEN: "Building credit history and international transfers",
      timingDE: "Sofort nach Bankkonto-Eröffnung", timingEN: "Immediately after opening bank account",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Credit Score aufbauen wie Miami (s. dort). Geldtransfer: Wise empfohlen (beste Kurse). SWIFT-Überweisungen aus Deutschland: 2–3 Werktage, Gebühren ~20–40 EUR. Chase: hohe Auslands-ATM-Gebühren — Wise-Karte für Auslandsabhebungen nutzen. Beachte: Beträge über 10.000 USD bei IRS meldepflichtig.",
      infoBoxEN: "Build credit score as in Miami (see there). Money transfer: Wise recommended (best rates). SWIFT transfers from Germany: 2–3 business days, fees ~EUR 20–40. Chase: high foreign ATM fees — use Wise card for foreign withdrawals. Note: amounts over USD 10,000 reportable to IRS.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },

    // ── SECTION: insurance ────────────────────────────────────────────────
    {
      stepOrder: 9, phase: "critical", section: "insurance",
      titleDE: "US-Krankenversicherung New York — Pflicht",
      titleEN: "US health insurance New York — mandatory",
      subtitleDE: "NYC Mandate: KV-Pflicht für alle Residents",
      subtitleEN: "NYC Mandate: health insurance mandatory for all residents",
      timingDE: "Vor Einreise oder sofort nach Ankunft", timingEN: "Before entry or immediately on arrival",
      isWarning: true, riskLevel: "high", requiresLegalAdvice: true, lastVerified: NOW,
      sourceUrl: "https://nystateofhealth.ny.gov/",
      sourceLabel: "NY State of Health — Marketplace 2025",
      infoBoxDE: "New York State mandatiert KV-Pflicht ähnlich ACA. Optionen: 1. Employer-sponsored (empfohlen), 2. NY State of Health Marketplace (nystateofhealth.ny.gov — Subventionen bei Einkommen bis 400 % Armutsgrenze), 3. Medicaid (für Geringverdiener). Ohne Arbeitgeber: 500–1.500 USD/Monat für Einzelperson. Ohne KV: ein Krankenhausaufenthalt kann 100.000+ USD kosten.",
      infoBoxEN: "New York State mandates health insurance similar to ACA. Options: 1. Employer-sponsored (recommended), 2. NY State of Health Marketplace (nystateofhealth.ny.gov — subsidies up to 400% poverty line), 3. Medicaid (for low income). Without employer: USD 500–1,500/month for an individual. Without insurance: one hospital stay can cost USD 100,000+.",
      infoBoxType: "danger",
      documents: [], tags: ["timing_critical"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },

    // ── SECTION: housing ──────────────────────────────────────────────────
    {
      stepOrder: 10, phase: "before_move", section: "housing",
      titleDE: "New York City Wohnungsmarkt — Vorbereitung",
      titleEN: "New York City housing market — preparation",
      timingDE: "3–6 Monate vor Umzug", timingEN: "3–6 months before move",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Teuerster Wohnungsmarkt der USA. Mietpreise 2026: Manhattan Studio ~2.500 USD/Monat, 1-Zimmer ~3.500 USD/Monat; Brooklyn 1-Zimmer ~2.500–3.200 USD/Monat; Queens 1-Zimmer ~1.800–2.500 USD/Monat. Portale: StreetEasy (beste NYC-Abdeckung), Zillow, RentHop. Broker: in NYC üblich — Maklergebühr meist 1 Monatsmiete (Mieter zahlt). Tipp: direkt beim Verwalter suchen → 'No Fee'-Wohnungen.",
      infoBoxEN: "Most expensive housing market in the USA. Rental prices 2026: Manhattan studio ~USD 2,500/month, 1-bedroom ~USD 3,500/month; Brooklyn 1-bedroom ~USD 2,500–3,200/month; Queens 1-bedroom ~USD 1,800–2,500/month. Portals: StreetEasy (best NYC coverage), Zillow, RentHop. Broker: common in NYC — agent fee usually 1 month's rent (paid by tenant). Tip: search directly with management company → 'No Fee' apartments.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 11, phase: "arrival", section: "housing",
      titleDE: "Mietvertrag NYC und Anforderungen",
      titleEN: "NYC rental contract and requirements",
      timingDE: "Vor Unterzeichnung", timingEN: "Before signing",
      riskLevel: "medium", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "NYC-Vermieter verlangen: 40× Monatsmiete als Jahreseinkommen (z.B. 3.500 USD/Monat Miete → 140.000 USD Jahreseinkommen erforderlich), Credit Score 680+, Employer Letter. Bei Neuankömmlinge: erhöhte Kaution (3–6 Monatsmieten) oder Guarantor Service (Insurent, TheGuarantor — ca. 60–90 % einer Monatsmiete als Gebühr). Stabile Wohnungssuche: Long Island City (Queens), Astoria, Sunnyside als günstigere Alternativen.",
      infoBoxEN: "NYC landlords require: 40× monthly rent as annual income (e.g. USD 3,500/month rent → USD 140,000 annual income required), credit score 680+, employer letter. For newcomers: increased deposit (3–6 months) or guarantor service (Insurent, TheGuarantor — approx. 60–90% of one month's rent as fee). Stable housing search: Long Island City (Queens), Astoria, Sunnyside as cheaper alternatives.",
      infoBoxType: "warning",
      documents: [{ titleDE: "SSN", titleEN: "SSN" }, { titleDE: "Employer Letter", titleEN: "Employer Letter" }, { titleDE: "Kontoauszüge (3 Monate)", titleEN: "Bank statements (3 months)" }],
      tags: ["doc_needed"], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 12, phase: "arrival", section: "housing",
      titleDE: "Stadtteile New York für Auswanderer",
      titleEN: "New York City neighbourhoods for emigrants",
      timingDE: "Vor Wohnungsentscheidung", timingEN: "Before housing decision",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Deutsche Expats bevorzugen: Upper East Side / Upper West Side (Manhattan, ruhig, Familien), Williamsburg / Greenpoint (Brooklyn, kreativ, viele Europäer), Astoria / Long Island City (Queens, günstig, multikulturell), Hoboken / Jersey City (NJ, pendlerfreundlich, günstiger als NYC). Deutsch-sprachige Community: Upper East Side (historisch 'Yorkville') + Williamsburg.",
      infoBoxEN: "German expats prefer: Upper East Side / Upper West Side (Manhattan, quiet, families), Williamsburg / Greenpoint (Brooklyn, creative, many Europeans), Astoria / Long Island City (Queens, affordable, multicultural), Hoboken / Jersey City (NJ, commuter-friendly, cheaper than NYC). German-speaking community: Upper East Side (historically 'Yorkville') + Williamsburg.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },

    // ── SECTION: practical ────────────────────────────────────────────────
    {
      stepOrder: 13, phase: "arrival", section: "practical",
      titleDE: "Transport in New York City",
      titleEN: "Transport in New York City",
      timingDE: "Ab Ankunft", timingEN: "From arrival",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "NYC hat exzellenten öffentlichen Nahverkehr: Subway (24/7, 2,90 USD/Fahrt — OMNY-Karte kontaktlos), MTA Buses, Long Island Rail Road, NJ Transit. KFZ in Manhattan unnötig (Parkgebühren absurd teuer: ~600–1.000 USD/Monat Garage). Uber/Lyft: verfügbar, teurer als Subway. Fahrrad: Citi Bike (Bikesharing, ab ~19 USD/Monat). Stecker: Typ A/B (110V/60Hz) — Adapter + Umspanner nötig.",
      infoBoxEN: "NYC has excellent public transport: Subway (24/7, USD 2.90/trip — OMNY card contactless), MTA Buses, Long Island Rail Road, NJ Transit. Car in Manhattan unnecessary (parking absurdly expensive: ~USD 600–1,000/month garage). Uber/Lyft: available, more expensive than subway. Bicycle: Citi Bike (bike sharing, from ~USD 19/month). Plug: Type A/B (110V/60Hz) — adapter + transformer needed.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 14, phase: "arrival", section: "practical",
      titleDE: "Notruf, Wasserqualität und Wetter New York",
      titleEN: "Emergency numbers, water quality and weather New York",
      timingDE: "Ab Ankunft", timingEN: "From arrival",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "Notruf: 911. NYC 311 (Non-Emergency City Services). Deutsches Generalkonsulat NYC: +1 212-610-9700. Notfall: +1 212-610-9700. Wasserqualität: NYC-Leitungswasser ist hervorragend (aus den Catskill Mountains — kein Filter nötig). Wetter: heiße Sommer (30–35°C, humid), kalte Winter (-5 bis -15°C, Schnee möglich). Herbst (Sep–Nov) und Frühling (Apr–Mai) angenehm.",
      infoBoxEN: "Emergency: 911. NYC 311 (non-emergency city services). German Consulate NYC: +1 212-610-9700. Emergency: +1 212-610-9700. Water quality: NYC tap water is excellent (from the Catskill Mountains — no filter needed). Weather: hot summers (30–35°C, humid), cold winters (-5 to -15°C, snow possible). Autumn (Sep–Nov) and spring (Apr–May) pleasant.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },

    // ── SECTION: social ───────────────────────────────────────────────────
    {
      stepOrder: 15, phase: "first_month", section: "social",
      titleDE: "Deutsche Community in New York City",
      titleEN: "German community in New York City",
      timingDE: "Ab Ankunft", timingEN: "From arrival",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "NYC hat eine große deutschsprachige Community (Schätzung: 100.000+ Deutschsprachige). Anlaufstellen: Goethe-Institut New York (30 Irving Place, Manhattan), German-American Chamber of Commerce (AHK, 80 Pine Street), Steuben Society of America, German-American Cultural Foundation. Stammtisch: monatlich über AHK und InterNations NYC. Deutschsprachige Medien: German Week NYC.",
      infoBoxEN: "NYC has a large German-speaking community (estimated: 100,000+ German speakers). Contact points: Goethe-Institut New York (30 Irving Place, Manhattan), German-American Chamber of Commerce (AHK, 80 Pine Street), Steuben Society of America, German-American Cultural Foundation. Stammtisch: monthly via AHK and InterNations NYC. German-language media: German Week NYC.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
    },
    {
      stepOrder: 16, phase: "first_month", section: "social",
      titleDE: "Deutsche Schule New York (DSNY)",
      titleEN: "German School New York (DSNY)",
      timingDE: "Frühzeitig anmelden — Warteliste möglich", timingEN: "Register early — waiting list possible",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      sourceUrl: "https://www.dsny.org",
      sourceLabel: "Deutsche Schule New York (DSNY) 2025",
      infoBoxDE: "Deutsche Schule New York (DSNY): Kindergarten bis Klasse 12, deutschsprachig, staatlich anerkannt. Adresse: 50 Partridge Road, White Plains, NY (Westchester County — 30 Min nördlich Manhattan). Jahresgebühr: ca. 30.000–38.000 USD/Jahr (2025). Frühzeitige Anmeldung dringend empfohlen (lange Wartelisten). Pendelbar von Upper Manhattan.",
      infoBoxEN: "German School New York (DSNY): kindergarten to grade 12, German-language, state-recognised. Address: 50 Partridge Road, White Plains, NY (Westchester County — 30 min north of Manhattan). Annual fee: approx. USD 30,000–38,000/year (2025). Early registration strongly recommended (long waiting lists). Commutable from Upper Manhattan.",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: false, forFreelancer: false, forFounder: false, forFamily: true,
    },
    {
      stepOrder: 17, phase: "first_month", section: "social",
      titleDE: "Tech-Scene und Coworking in New York",
      titleEN: "Tech scene and coworking in New York",
      timingDE: "Ab Ankunft", timingEN: "From arrival",
      riskLevel: "low", requiresLegalAdvice: false, lastVerified: NOW,
      infoBoxDE: "NYC ist nach San Francisco die wichtigste Tech-Stadt der USA (NYC Tech Ecosystem: über 9.000 Startups). Top-Bereiche: Fintech (Wall Street-Nähe), Media/AdTech, Fashion-Tech, HealthTech. Coworking: WeWork (viele Standorte), Industrious, Convene, The Wing. Startup-Events: NYC Tech Week (jährlich), NY VC-Szene. Internet: Glasfaser in Manhattan/Brooklyn zuverlässig (Optimum, Spectrum, Verizon Fios).",
      infoBoxEN: "NYC is the second most important tech city in the USA after San Francisco (NYC Tech Ecosystem: over 9,000 startups). Top areas: fintech (near Wall Street), media/AdTech, fashion tech, health tech. Coworking: WeWork (many locations), Industrious, Convene, The Wing. Startup events: NYC Tech Week (annual), NY VC scene. Internet: fibre in Manhattan/Brooklyn reliable (Optimum, Spectrum, Verizon Fios).",
      infoBoxType: "info",
      documents: [], tags: [], translationSource: "manual",
      forEmployed: true, forFreelancer: true, forFounder: true, forFamily: false,
    },
  ]);

  // ─── Extra CitySearchAggregate-Paare ─────────────────────────────────────
  type ExtraPair = { from: string; to: string; count30d: number };
  const extraPairs: ExtraPair[] = [
    { from: "madrid",    to: "lissabon",   count30d: 520 }, { from: "madrid",    to: "amsterdam",  count30d: 310 },
    { from: "madrid",    to: "tallinn",    count30d: 180 }, { from: "madrid",    to: "dubai",      count30d: 240 },
    { from: "london",    to: "lissabon",   count30d: 680 }, { from: "london",    to: "barcelona",  count30d: 520 },
    { from: "london",    to: "dubai",      count30d: 460 }, { from: "london",    to: "amsterdam",  count30d: 380 },
    { from: "london",    to: "madrid",     count30d: 290 }, { from: "london",    to: "tallinn",    count30d: 210 },
    { from: "london",    to: "tbilisi",    count30d: 160 }, { from: "paris",     to: "lissabon",   count30d: 480 },
    { from: "paris",     to: "barcelona",  count30d: 410 }, { from: "paris",     to: "dubai",      count30d: 320 },
    { from: "paris",     to: "amsterdam",  count30d: 280 }, { from: "paris",     to: "tallinn",    count30d: 140 },
    { from: "zuerich",   to: "lissabon",   count30d: 340 }, { from: "zuerich",   to: "barcelona",  count30d: 260 },
    { from: "zuerich",   to: "dubai",      count30d: 220 }, { from: "zuerich",   to: "miami",      count30d: 180 },
    { from: "zuerich",   to: "singapur",   count30d: 150 }, { from: "amsterdam", to: "dubai",      count30d: 220 },
    { from: "amsterdam", to: "tallinn",    count30d: 190 }, { from: "amsterdam", to: "madrid",     count30d: 170 },
    { from: "dubai",     to: "lissabon",   count30d: 180 }, { from: "dubai",     to: "barcelona",  count30d: 150 },
    { from: "dubai",     to: "amsterdam",  count30d: 120 }, { from: "new-york",  to: "lissabon",   count30d: 210 },
    { from: "new-york",  to: "barcelona",  count30d: 180 }, { from: "new-york",  to: "amsterdam",  count30d: 160 },
    { from: "miami",     to: "lissabon",   count30d: 190 }, { from: "miami",     to: "barcelona",  count30d: 160 },
    { from: "singapur",  to: "lissabon",   count30d: 120 }, { from: "singapur",  to: "dubai",      count30d: 140 },
    { from: "dublin",    to: "lissabon",   count30d: 280 }, { from: "dublin",    to: "barcelona",  count30d: 220 },
    { from: "dublin",    to: "amsterdam",  count30d: 190 }, { from: "warschau",  to: "lissabon",   count30d: 240 },
    { from: "warschau",  to: "berlin",     count30d: 210 }, { from: "warschau",  to: "amsterdam",  count30d: 160 },
    { from: "warschau",  to: "dubai",      count30d: 130 }, { from: "tallinn",   to: "lissabon",   count30d: 150 },
    { from: "tallinn",   to: "berlin",     count30d: 130 }, { from: "bukarest",  to: "lissabon",   count30d: 180 },
    { from: "bukarest",  to: "berlin",     count30d: 160 }, { from: "bukarest",  to: "amsterdam",  count30d: 120 },
    { from: "berlin",    to: "medellin",   count30d: 220 }, { from: "berlin",    to: "buenos-aires", count30d: 180 },
    { from: "berlin",    to: "mexiko-city", count30d: 160 }, { from: "muenchen", to: "chiang-mai", count30d: 190 },
    { from: "muenchen",  to: "bali",       count30d: 180 }, { from: "hamburg",   to: "chiang-mai", count30d: 160 },
    { from: "hamburg",   to: "bali",       count30d: 140 }, { from: "berlin",    to: "porto",      count30d: 620 },
    { from: "muenchen",  to: "porto",      count30d: 480 }, { from: "hamburg",   to: "porto",      count30d: 360 },
    { from: "london",    to: "porto",      count30d: 290 }, { from: "zuerich",   to: "porto",      count30d: 210 },
    { from: "wien",      to: "porto",      count30d: 180 },
  ];

  for (const p of extraPairs) {
    const fromCityId = cityMap.get(p.from);
    const toCityId   = cityMap.get(p.to);
    if (!fromCityId || !toCityId) continue;
    const count7d  = Math.round(p.count30d / 4);
    const count90d = Math.round(p.count30d * 3);
    for (const [period, searchCount] of [["7d", count7d], ["30d", p.count30d], ["90d", count90d]] as [string, number][]) {
      await prisma.citySearchAggregate.upsert({
        where:  { fromCityId_toCityId_period: { fromCityId, toCityId, period } },
        update: { searchCount, updatedAt: now },
        create: { fromCityId, toCityId, searchCount, period, updatedAt: now },
      });
    }
  }

  console.log("✅ Seed v3 complete");
}

/**
 * Creates a Region row per REGIONS entry (idempotent on countryId+slug) and
 * links cities to their region (City.regionId) per CITY_REGIONS. Returns a map
 * of region slug → Region id, used to resolve regional tax rows.
 */
async function seedRegionsAndLinks(
  countryMap: Map<string, string>,
  cityMap: Map<string, string>,
): Promise<Map<string, string>> {
  const regionMap = new Map<string, string>();
  for (const reg of REGIONS) {
    const cId = countryMap.get(reg.countryCode);
    if (!cId) continue;
    const existing = await prisma.region.findFirst({ where: { countryId: cId, slug: reg.slug } });
    const row = existing
      ? await prisma.region.update({ where: { id: existing.id }, data: { nameDE: reg.nameDE, nameEN: reg.nameEN } })
      : await prisma.region.create({ data: { countryId: cId, slug: reg.slug, nameDE: reg.nameDE, nameEN: reg.nameEN } });
    regionMap.set(reg.slug, row.id);
  }

  for (const [citySlug, regionSlug] of Object.entries(CITY_REGIONS)) {
    const cityId = cityMap.get(citySlug);
    const regionId = regionMap.get(regionSlug);
    if (!cityId || !regionId) continue; // city not seeded → skip
    await prisma.city.update({ where: { id: cityId }, data: { regionId } });
  }

  return regionMap;
}

/**
 * Seeds the year-versioned tax tables for every country from the canonical
 * engine dataset (DEFAULT_TAX_DATA). The DB becomes a faithful mirror of the
 * engine values, so there is a single source of truth. Idempotent per
 * country/year/category. Regional rows carry the resolved Region id.
 */
async function seedTaxData(countryMap: Map<string, string>, regionMap: Map<string, string>) {
  const toRegionId = (slug?: string | null) => (slug ? regionMap.get(slug) ?? null : null);
  for (const [slug, td] of Object.entries(DEFAULT_TAX_DATA)) {
    const cId = countryMap.get(slug);
    if (!cId) continue;
    const src = TAX_DATA_SOURCES[slug] ?? "";
    const year = td.year;

    if (td.brackets.length > 0 &&
        (await prisma.taxBracket.count({ where: { countryId: cId, year } })) === 0) {
      await prisma.taxBracket.createMany({
        data: td.brackets.map((b) => ({
          countryId: cId,
          regionId: toRegionId(b.regionId),
          filingStatus: b.filingStatus ?? null,
          fromAmount: b.from,
          toAmount: b.to ?? null,
          rate: b.rate,
          year,
          employmentType: b.employmentType ?? "employed",
          sourceUrl: src || null,
        })),
      });
    }

    if (td.social.length > 0 &&
        (await prisma.socialContribution.count({ where: { countryId: cId, year } })) === 0) {
      await prisma.socialContribution.createMany({
        data: td.social.map((s) => ({
          countryId: cId,
          type: s.type,
          rate: s.rate,
          ceiling: s.ceiling ?? null,
          employeeSide: true,
          year,
          sourceUrl: src || null,
        })),
      });
    }

    if (td.deductions.length > 0 &&
        (await prisma.deduction.count({ where: { countryId: cId, year } })) === 0) {
      await prisma.deduction.createMany({
        data: td.deductions.map((d) => ({
          countryId: cId,
          type: d.type,
          amount: d.amount ?? null,
          percentage: d.percentage ?? null,
          condition: d.condition ?? null,
          year,
          sourceUrl: src || null,
        })),
      });
    }

    if (td.surcharges.length > 0 &&
        (await prisma.surcharge.count({ where: { countryId: cId, year } })) === 0) {
      await prisma.surcharge.createMany({
        data: td.surcharges.map((s) => ({
          countryId: cId,
          regionId: toRegionId(s.regionId),
          cityScope: s.cityScope ?? null,
          type: s.type,
          baseType: s.baseType,
          rate: s.rate ?? null,
          brackets: (s.brackets ?? undefined) as object | undefined,
          allowance: s.allowance ?? null,
          variantKey: s.variantKey ?? null,
          year,
          sourceUrl: src, // required (non-null)
        })),
      });
    }

    if (td.fixedAmounts.length > 0 &&
        (await prisma.fixedAmount.count({ where: { countryId: cId, year } })) === 0) {
      await prisma.fixedAmount.createMany({
        data: td.fixedAmounts.map((f) => ({
          countryId: cId,
          regionId: toRegionId(f.regionId),
          type: f.type,
          amount: f.amount,
          period: f.period,
          year,
          sourceUrl: src, // required (non-null)
        })),
      });
    }
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
