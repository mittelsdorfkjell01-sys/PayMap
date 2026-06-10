/**
 * import-trends-filters.ts
 * Populates the three boolean filter flags on Country for the Trends page:
 *   dbaGermany — comprehensive income double-taxation treaty with Germany in force
 *   euEea      — EU or EEA member
 *   nomadVisa  — offers a dedicated digital-nomad / remote-work visa
 *
 * These are 0/1 FILTERS, not scores. Each flag is null where no reliable source
 * applies (e.g. dbaGermany for Germany itself). Each flag carries its own
 * sourceUrl. Values are researched from official/established sources — never
 * guessed.
 *
 * Sources (retrieved 2026-06-10):
 *   dbaGermany — BMF "Stand der Doppelbesteuerungsabkommen am 1. Januar 2025"
 *     https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Internationales_Steuerrecht/Allgemeine_Informationen/2025-01-20-stand-DBA-1-januar-2025.html
 *     Notable: UAE treaty terminated 31.12.2021 → false. Colombia has only a
 *     1965 shipping/aviation agreement, no comprehensive income DBA → false.
 *   euEea — official EU member-state list
 *     https://european-union.europa.eu/principles-countries-history/eu-countries_en
 *   nomadVisa — digital-nomad visa tracker (cross-checked 2025)
 *     https://freakingnomads.com/digital-nomad-visa-countries/
 *
 * Run (only after review — NOT executed automatically):
 *   npx tsx packages/db/scripts/import-trends-filters.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DBA_SOURCE = 'https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Internationales_Steuerrecht/Allgemeine_Informationen/2025-01-20-stand-DBA-1-januar-2025.html';
const EUEEA_SOURCE = 'https://european-union.europa.eu/principles-countries-history/eu-countries_en';
const NOMAD_SOURCE = 'https://freakingnomads.com/digital-nomad-visa-countries/';

// countrySlug → flags. dba=null means "not applicable / data outstanding".
const FLAGS: Record<string, { dba: boolean | null; eu: boolean; nomad: boolean }> = {
  de:  { dba: null,  eu: true,  nomad: true  }, // dba n/a — Germany is the home country
  at:  { dba: true,  eu: true,  nomad: false },
  ch:  { dba: true,  eu: false, nomad: false }, // EFTA, not EU/EEA
  nl:  { dba: true,  eu: true,  nomad: true  },
  pt:  { dba: true,  eu: true,  nomad: true  },
  es:  { dba: true,  eu: true,  nomad: true  },
  fr:  { dba: true,  eu: true,  nomad: true  },
  it:  { dba: true,  eu: true,  nomad: true  },
  ie:  { dba: true,  eu: true,  nomad: false },
  ee:  { dba: true,  eu: true,  nomad: true  },
  pl:  { dba: true,  eu: true,  nomad: false },
  cz:  { dba: true,  eu: true,  nomad: true  },
  hu:  { dba: true,  eu: true,  nomad: true  },
  ro:  { dba: true,  eu: true,  nomad: true  },
  uae: { dba: false, eu: false, nomad: true  }, // DBA terminated 31.12.2021
  th:  { dba: true,  eu: false, nomad: true  },
  us:  { dba: true,  eu: false, nomad: false },
  gb:  { dba: true,  eu: false, nomad: false }, // left the EU
  id:  { dba: true,  eu: false, nomad: true  },
  co:  { dba: false, eu: false, nomad: true  }, // only 1965 shipping/aviation agreement
  mx:  { dba: true,  eu: false, nomad: true  },
  ar:  { dba: true,  eu: false, nomad: true  },
  sg:  { dba: true,  eu: false, nomad: false },
  za:  { dba: true,  eu: false, nomad: true  },
  mt:  { dba: true,  eu: true,  nomad: true  },
  ge:  { dba: true,  eu: false, nomad: true  },
};

async function main() {
  let updated = 0;
  let missing = 0;

  for (const [slug, f] of Object.entries(FLAGS)) {
    const country = await prisma.country.findUnique({ where: { slug } });
    if (!country) {
      console.warn(`  ⚠ country not found: ${slug}`);
      missing++;
      continue;
    }
    await prisma.country.update({
      where: { slug },
      data: {
        dbaGermany: f.dba,
        dbaGermanySourceUrl: f.dba === null ? null : DBA_SOURCE,
        euEea: f.eu,
        euEeaSourceUrl: EUEEA_SOURCE,
        nomadVisa: f.nomad,
        nomadVisaSourceUrl: NOMAD_SOURCE,
      },
    });
    updated++;
    console.log(
      `  ✓ ${slug.padEnd(4)} dba=${String(f.dba).padEnd(5)} eu=${String(f.eu).padEnd(5)} nomad=${f.nomad}`,
    );
  }

  console.log(`\nDone: ${updated} countries updated, ${missing} missing`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
