import { CountryModule } from './types';

import { de } from './countries/de';
import { at } from './countries/at';
import { ch } from './countries/ch';
import { nl } from './countries/nl';
import { pt } from './countries/pt';
import { es } from './countries/es';
import { fr } from './countries/fr';
import { it } from './countries/it';
import { ie } from './countries/ie';
import { ee } from './countries/ee';
import { pl } from './countries/pl';
import { cz } from './countries/cz';
import { hu } from './countries/hu';
import { ro } from './countries/ro';
import { uae } from './countries/uae';
import { th } from './countries/th';
import { us } from './countries/us';
import { gb } from './countries/gb';
import { mt } from './countries/mt';
import { ge } from './countries/ge';
import { sg } from './countries/sg';
import { id } from './countries/id';
import { co } from './countries/co';
import { mx } from './countries/mx';
import { ar } from './countries/ar';
import { za } from './countries/za';

const COUNTRY_MODULES: Record<string, CountryModule> = {
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
};

export function getCountryModule(countryCode: string): CountryModule {
  const key = countryCode.toLowerCase();
  const mod = COUNTRY_MODULES[key];
  if (!mod) {
    throw new Error(
      `No tax module found for country code: "${countryCode}". Supported: ${Object.keys(COUNTRY_MODULES).join(', ')}`,
    );
  }
  return mod;
}

export function getSupportedCountries(): string[] {
  return Object.keys(COUNTRY_MODULES);
}

export {
  de, at, ch, nl, pt, es, fr, it, ie, ee, pl, cz, hu, ro, uae, th, us, gb, mt, ge, sg,
  id, co, mx, ar, za,
};
