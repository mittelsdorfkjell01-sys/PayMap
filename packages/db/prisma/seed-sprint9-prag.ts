/**
 * Sprint 9 — Prague Premium Content Seed
 * Pattern: 8 districts · 5 narratives · 2 tools · 5 resources · 3 testimonials
 * Run: npm run seed:premium:prag (from packages/db)
 * Sources: expats.cz, mvcr.cz, financnisprava.cz, praguelive.eu
 */
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();
const NOW = new Date();
const CITY_ID = 'cmpbrais3005mnrhvxpfchnnn';
const SOURCE = 'sreality.cz 2025';

export async function seedPrag() {
  console.log('🌍 Seeding Prague premium content...');

  // --- Districts ---
  console.log('\n📍 Creating districts...');
  const districts = [
    {
      slug: 'prag-vinohrady-zizkov',
      nameDE: 'Vinohrady / Žižkov',
      nameEN: 'Vinohrady / Žižkov',
      descriptionDE: 'Beliebteste Expat-Viertel — gründerzeitliche Architektur, lebhafte Café-Szene, zentral, internationale Gemeinschaft.',
      descriptionEN: 'Most popular expat neighbourhoods — turn-of-the-century architecture, lively café scene, central, international community.',
      latitude: 50.0750, longitude: 14.4469, vibe: 'bohemian', priceLevel: 4, sortOrder: 1,
      col: [
        { category: 'rent_3br_center', value: 650, currency: 'EUR' },
        { category: 'rent_1br_center', value: 900, currency: 'EUR' },
        { category: 'rent_2br_center', value: 1300, currency: 'EUR' },
      ],
    },
    {
      slug: 'prag-smichov-andel',
      nameDE: 'Smíchov / Anděl',
      nameEN: 'Smíchov / Anděl',
      descriptionDE: 'Modernes Viertel südwestlich der Altstadt — Einkaufszentren, neue Bürohäuser, gute Metro-Anbindung.',
      descriptionEN: 'Modern district southwest of the old town — shopping centres, new office buildings, good metro connections.',
      latitude: 50.0711, longitude: 14.4034, vibe: 'urban-modern', priceLevel: 3, sortOrder: 2,
      col: [
        { category: 'rent_3br_center', value: 600, currency: 'EUR' },
        { category: 'rent_1br_center', value: 850, currency: 'EUR' },
        { category: 'rent_2br_center', value: 1200, currency: 'EUR' },
      ],
    },
    {
      slug: 'prag-holesovice-karlin',
      nameDE: 'Holešovice / Karlín',
      nameEN: 'Holešovice / Karlín',
      descriptionDE: 'Trendige Aufwertungsviertel — Startup-Szene, Markthallen, Galerien, steigende Mieten.',
      descriptionEN: 'Trendy gentrifying neighbourhoods — startup scene, market halls, galleries, rising rents.',
      latitude: 50.0968, longitude: 14.4486, vibe: 'trendy', priceLevel: 3, sortOrder: 3,
      col: [
        { category: 'rent_3br_center', value: 600, currency: 'EUR' },
        { category: 'rent_1br_center', value: 850, currency: 'EUR' },
        { category: 'rent_2br_center', value: 1200, currency: 'EUR' },
      ],
    },
    {
      slug: 'prag-dejvice-bubenec',
      nameDE: 'Dejvice / Bubeneč',
      nameEN: 'Dejvice / Bubeneč',
      descriptionDE: 'Gehobenes Diplomatenviertel nordwestlich des Zentrums — Botschaften, Villen, ruhig, gut vernetzt.',
      descriptionEN: 'Upscale diplomatic quarter northwest of the centre — embassies, villas, quiet, well-connected.',
      latitude: 50.0989, longitude: 14.3939, vibe: 'suburban', priceLevel: 4, sortOrder: 4,
      col: [
        { category: 'rent_3br_center', value: 700, currency: 'EUR' },
        { category: 'rent_1br_center', value: 950, currency: 'EUR' },
        { category: 'rent_2br_center', value: 1400, currency: 'EUR' },
      ],
    },
    {
      slug: 'prag-altstadt-mala-strana',
      nameDE: 'Altstadt / Malá Strana',
      nameEN: 'Old Town / Malá Strana',
      descriptionDE: 'Historisches Herz Prags — UNESCO-Welterbe, touristisch, sehr teuer, wenige Mietwohnungen.',
      descriptionEN: 'Historic heart of Prague — UNESCO World Heritage, touristy, very expensive, few rental flats.',
      latitude: 50.0876, longitude: 14.4213, vibe: 'urban-modern', priceLevel: 5, sortOrder: 5,
      col: [
        { category: 'rent_3br_center', value: 850, currency: 'EUR' },
        { category: 'rent_1br_center', value: 1200, currency: 'EUR' },
        { category: 'rent_2br_center', value: 1800, currency: 'EUR' },
      ],
    },
    {
      slug: 'prag-nusle-michle',
      nameDE: 'Nusle / Michle',
      nameEN: 'Nusle / Michle',
      descriptionDE: 'Authentische Südviertel mit günstigeren Mieten — gute Metro-Anbindung, weniger touristisch.',
      descriptionEN: 'Authentic southern neighbourhoods with more affordable rents — good metro connections, less touristy.',
      latitude: 50.0582, longitude: 14.4375, vibe: 'authentic', priceLevel: 2, sortOrder: 6,
      col: [
        { category: 'rent_3br_center', value: 480, currency: 'EUR' },
        { category: 'rent_1br_center', value: 680, currency: 'EUR' },
        { category: 'rent_2br_center', value: 950, currency: 'EUR' },
      ],
    },
    {
      slug: 'prag-letna-troja',
      nameDE: 'Letná / Troja',
      nameEN: 'Letná / Troja',
      descriptionDE: 'Parkreiches Nordviertel — Letná-Park, Panorama, familienfreundlich, gute Lebensqualität.',
      descriptionEN: 'Park-rich northern neighbourhood — Letná Park, panorama, family-friendly, good quality of life.',
      latitude: 50.0993, longitude: 14.4260, vibe: 'suburban', priceLevel: 3, sortOrder: 7,
      col: [
        { category: 'rent_3br_center', value: 580, currency: 'EUR' },
        { category: 'rent_1br_center', value: 800, currency: 'EUR' },
        { category: 'rent_2br_center', value: 1100, currency: 'EUR' },
      ],
    },
    {
      slug: 'prag-umland-beroun-brandys',
      nameDE: 'Umland (Beroun, Brandýs, Říčany)',
      nameEN: 'Surroundings (Beroun, Brandýs, Říčany)',
      descriptionDE: 'Günstigere Gemeinden im Prager Umland — Familienhäuser, 30–50 Min. Pendeln, deutlich niedrigere Mieten.',
      descriptionEN: 'More affordable municipalities in the Prague surroundings — family houses, 30–50 min commute, significantly lower rents.',
      latitude: 49.9500, longitude: 14.1000, vibe: 'suburban', priceLevel: 1, sortOrder: 8,
      col: [
        { category: 'rent_3br_center', value: 300, currency: 'EUR' },
        { category: 'rent_1br_center', value: 450, currency: 'EUR' },
        { category: 'rent_2br_center', value: 650, currency: 'EUR' },
      ],
    },
  ];

  for (const d of districts) {
    const { col, ...districtData } = d;
    const district = await prisma.district.upsert({
      where: { cityId_slug: { cityId: CITY_ID, slug: d.slug } },
      update: {},
      create: { cityId: CITY_ID, ...districtData },
    });
    for (const c of col) {
      await prisma.districtCostOfLiving.upsert({
        where: { districtId_category: { districtId: district.id, category: c.category } },
        update: { value: c.value },
        create: { districtId: district.id, category: c.category, value: c.value, currency: c.currency, source: SOURCE, confidence: 70 },
      });
    }
    console.log(`  ✓ ${d.nameDE}`);
  }

  // --- Narratives ---
  console.log('\n📝 Creating narratives...');
  const narratives = [
    {
      section: 'intro',
      titleDE: 'Prag als Wahlheimat: Niedrige Lebenshaltungskosten, EU-Mitglied und tschechische Bürokratie',
      titleEN: 'Prague as a New Home: Low Cost of Living, EU Member and Czech Bureaucracy',
      contentDE: `Prag ist die erschwinglichste Hauptstadt Westeuropas für Expats — Mietpreise liegen 40–60 % unter Amsterdam, Paris oder Wien bei vergleichbarer Infrastruktur. Die Tschechische Republik ist EU-Mitglied, nutzt aber den Tschechischen Kroon (CZK) statt Euro. Wechselkurs-Schwankungen sind ein relevanter Faktor für Eurozone-Einkommensbezieher.\n\nDie Wohnungssuche läuft hauptsächlich über Sreality.cz und Bezrealitky.cz. Mieten werden in CZK angegeben: Eine 1-Zimmer-Wohnung in Vinohrady kostet ca. 22.000–25.000 CZK/Monat (ca. 880–1.000 EUR). Kurzzeit-Mietverträge (nájem na dobu určitou) sind bei Vermietern beliebt; Expats sollten auf unbefristete Verträge (nájem na dobu neurčitou) bestehen.\n\nSprachkenntnisse in Tschechisch (Čeština) sind für den Alltag hilfreich, aber nicht zwingend — besonders in Prag 2/3/6/7 kommt man mit Englisch gut zurecht. Behörden sprechen oft kein Englisch; ein tschechischsprachiger Anwalt oder Gestor bei Behördengängen ist empfehlenswert.`,
      contentEN: `Prague is the most affordable capital city in Western Europe for expats — rental prices are 40–60% lower than Amsterdam, Paris or Vienna with comparable infrastructure. The Czech Republic is an EU member but uses the Czech Crown (CZK) rather than the euro. Exchange rate fluctuations are a relevant factor for those earning eurozone incomes.\n\nFlat hunting mainly runs via Sreality.cz and Bezrealitky.cz. Rents are quoted in CZK: a 1-room flat in Vinohrady costs approx. 22,000–25,000 CZK/month (approx. EUR 880–1,000). Fixed-term rental contracts (nájem na dobu určitou) are popular with landlords; expats should insist on open-ended contracts (nájem na dobu neurčitou).\n\nCzech language skills (Čeština) are helpful for daily life but not essential — especially in Prague 2/3/6/7 you get by well with English. Authorities often don't speak English; a Czech-speaking lawyer or gestor is recommended for administrative matters.`,
      sourceUrls: ['https://www.expats.cz', 'https://www.mvcr.cz'],
      lastVerified: new Date('2025-10-01'),
    },
    {
      section: 'for_freelancers',
      titleDE: 'Selbstständig in Prag: OSVČ, Pauschalsteuer und Sozialversicherung',
      titleEN: 'Freelancing in Prague: OSVČ, Flat Tax and Social Insurance',
      contentDE: `Selbstständige in Tschechien melden sich als **OSVČ** (Osoba Samostatně Výdělečně Činná) beim Finanzamt (Finanční úřad) und der Sozialversicherung (ČSSZ) an. Die Anmeldung ist unkompliziert und online möglich.\n\nSteuerlich gibt es zwei Optionen: Tatsächliche Ausgaben (Belegpflicht) oder **pauschale Ausgabenquote** (paušální výdaje) — 60 % des Umsatzes bei Gewerbetätigkeit bzw. 80 % bei Landwirtschaft/Handwerk. Die meisten Freiberufler nutzen die Pauschalregelung: Auf 40 % des Umsatzes wird 15 % Einkommensteuer fällig, effektiver Steuersatz oft 6–8 % des Umsatzes.\n\nSeit 2021 gibt es alternativ das **Pauschalregime** (paušální daň): Gesamtabgabe von ca. 5.994 CZK/Monat (2024) deckt Einkommensteuer + Kranken- + Sozialversicherung ab. Bedingung: Jahresumsatz unter 2 Mio. CZK (~80.000 EUR). Ideal für Einpersonen-Dienstleister ohne hohe Ausgaben.`,
      contentEN: `Self-employed people in Czechia register as OSVČ (Osoba Samostatně Výdělečně Činná) at the tax office (Finanční úřad) and social insurance (ČSSZ). Registration is straightforward and possible online.\n\nThere are two tax options: actual expenses (with receipts) or flat-rate expense deduction (paušální výdaje) — 60% of turnover for commercial activity or 80% for agriculture/crafts. Most freelancers use the flat-rate rule: 15% income tax on 40% of turnover, effective tax rate often 6–8% of turnover.\n\nSince 2021, there is also the flat-rate regime (paušální daň): total contribution of approx. 5,994 CZK/month (2024) covers income tax + health + social insurance. Condition: annual turnover below 2 million CZK (~EUR 80,000). Ideal for solo service providers without high expenses.`,
      sourceUrls: ['https://www.financnisprava.cz', 'https://www.cssz.cz'],
      lastVerified: new Date('2025-10-01'),
    },
    {
      section: 'for_families',
      titleDE: 'Familienleben in Prag: Schulen, Trvalý pobyt und Kinderbetreuung',
      titleEN: 'Family Life in Prague: Schools, Trvalý pobyt and Childcare',
      contentDE: `EU-Bürger haben das Recht auf freien Aufenthalt in Tschechien; nach 5 Jahren können sie den **trvalý pobyt** (unbefristete Aufenthaltserlaubnis) beantragen. Non-EU-Bürger benötigen eine **povolení k pobytu** (Aufenthaltsgenehmigung), die beim Innenministerium (MVCR) beantragt wird.\n\n**Internationale Schulen** in Prag sind zahlreich: International School of Prague (ISP), Prague British International School, Deutsche Schule Prag (Vinohrady), Open Gate und mehrere englischsprachige Schulen. Jahresgebühren: 8.000–20.000 EUR. Öffentliche tschechische Schulen sind kostenlos und akademisch stark, aber auf Tschechisch.\n\n**Kinderbetreuung**: Staatliche Krippen (jesle) sind selten und überbucht. Private Krippen kosten 250–600 EUR/Monat. Vorschule (mateřská škola) ab 3 Jahren ist kostenlos und gut verfügbar. Kindergeld (rodičovský příspěvek): EU-Bürger mit trvalý pobyt erhalten bis zu 300.000 CZK (~12.000 EUR) Gesamtzahlung über 4 Jahre.`,
      contentEN: `EU citizens have the right of free residence in Czechia; after 5 years they can apply for trvalý pobyt (permanent residence). Non-EU citizens need a povolení k pobytu (residence permit), applied for at the Interior Ministry (MVCR).\n\nInternational schools in Prague are numerous: International School of Prague (ISP), Prague British International School, Deutsche Schule Prag (Vinohrady), Open Gate and several English-language schools. Annual fees: EUR 8,000–20,000. Public Czech schools are free and academically strong but in Czech.\n\nChildcare: State nurseries (jesle) are rare and oversubscribed. Private nurseries cost EUR 250–600/month. Preschool (mateřská škola) from age 3 is free and widely available. Child benefit (rodičovský příspěvek): EU citizens with trvalý pobyt receive up to 300,000 CZK (~EUR 12,000) total payment over 4 years.`,
      sourceUrls: ['https://www.mvcr.cz', 'https://www.dsprag.cz'],
      lastVerified: new Date('2025-10-01'),
    },
    {
      section: 'for_retirees',
      titleDE: 'Ruhestand in Prag: DBA Deutschland-Tschechien, Krankenversicherung und Lebenshaltung',
      titleEN: 'Retirement in Prague: DBA Germany-Czechia, Health Insurance and Cost of Living',
      contentDE: `Das **Doppelbesteuerungsabkommen Deutschland-Tschechien (DBA)** regelt die Besteuerung von Renten: Gesetzliche Renten aus Deutschland werden grundsätzlich in Deutschland besteuert (Quellenlandprinzip), private Renten und Lebensversicherungen hingegen in Tschechien. Der tschechische Einkommensteuersatz beträgt 15 % bis 1,7 Mio. CZK/Jahr, darüber 23 %.\n\n**Krankenversicherung**: EU-Rentner mit Wohnsitz in Tschechien müssen sich bei einer tschechischen Krankenkasse (zdravotní pojišťovna) registrieren. Wer eine ausländische EU-Rente bezieht, ist oft weiterhin im Rentenland pflichtversichert und kann die Europäische Krankenversicherungskarte (EHIC) nutzen. Private Zusatzversicherung empfohlen.\n\n**Lebenshaltungskosten**: Prag ist für Rentner mit Eurogehalt oder -rente deutlich günstig — Lebensmittel 30–40 % unter deutschem Niveau, Gastronomie 50 % günstiger. Monatliche Gesamtausgaben für ein Paar: 1.500–2.200 EUR inklusive Miete.`,
      contentEN: `The Germany-Czechia double taxation agreement (DBA) governs pension taxation: statutory pensions from Germany are generally taxed in Germany (source country principle), while private pensions and life insurance are taxed in Czechia. The Czech income tax rate is 15% up to 1.7 million CZK/year, 23% above that.\n\nHealthcare: EU retirees with residence in Czechia must register with a Czech health insurer (zdravotní pojišťovna). Those receiving a foreign EU pension are often still compulsorily insured in the pension country and can use the European Health Insurance Card (EHIC). Private supplementary insurance is recommended.\n\nCost of living: Prague is significantly affordable for retirees with euro income or pension — groceries 30–40% below German levels, restaurants 50% cheaper. Total monthly expenses for a couple: EUR 1,500–2,200 including rent.`,
      sourceUrls: ['https://www.financnisprava.cz', 'https://www.vzp.cz'],
      lastVerified: new Date('2025-10-01'),
    },
    {
      section: 'for_tech_workers',
      titleDE: 'Tech-Szene Prag: Startups, internationale Unternehmen und Remote-Work-Hub',
      titleEN: 'Tech Scene Prague: Startups, International Companies and Remote Work Hub',
      contentDE: `Prag ist eines der stärksten Tech-Zentren Ostmitteleuropas. Große internationale Arbeitgeber: Avast (nun NortonLifeLock), JetBrains, Seznam.cz (tschechisches Google), Kiwi.com, Productboard und hunderte internationale Unternehmen mit Entwicklungszentren (Oracle, Red Hat, IBM, Socialbakers).\n\nGehälter sind im EU-Vergleich niedrig, aber steigen: Senior Software Engineers verdienen 60.000–95.000 CZK brutto/Monat (ca. 2.400–3.800 EUR/Monat). Nettogehalt nach Steuern und Abgaben: ca. 47.000–75.000 CZK. Mit dem Preisniveau Prags entspricht das einer hohen Kaufkraft.\n\nPrag ist zunehmend ein **Remote-Work-Hub**: Niedrige Mieten, schnelles Internet, viele Co-Working-Spaces (HubHub, Impact Hub, Opero) und eine lebhafte Expat-Community machen die Stadt für Remote-Arbeiter attraktiv. EU-Bürger benötigen kein Visum; Non-EU-Remote-Worker können ein Visum für selbstständige Tätigkeit (živnostenský list) beantragen.`,
      contentEN: `Prague is one of the strongest tech centres in Central and Eastern Europe. Major international employers: Avast (now NortonLifeLock), JetBrains, Seznam.cz (Czech Google), Kiwi.com, Productboard and hundreds of international companies with development centres (Oracle, Red Hat, IBM, Socialbakers).\n\nSalaries are low by EU standards but rising: Senior Software Engineers earn 60,000–95,000 CZK gross/month (approx. EUR 2,400–3,800/month). Net salary after taxes and contributions: approx. 47,000–75,000 CZK. With Prague's price level, this represents high purchasing power.\n\nPrague is increasingly a remote work hub: low rents, fast internet, many co-working spaces (HubHub, Impact Hub, Opero) and a vibrant expat community make the city attractive for remote workers. EU citizens need no visa; non-EU remote workers can apply for a self-employment visa (živnostenský list).`,
      sourceUrls: ['https://www.czechinvest.org', 'https://www.expats.cz/tech'],
      lastVerified: new Date('2025-10-01'),
    },
  ];

  for (const n of narratives) {
    await prisma.cityNarrative.upsert({
      where: { cityId_section: { cityId: CITY_ID, section: n.section } },
      update: {},
      create: { cityId: CITY_ID, ...n, updatedAt: NOW },
    });
    console.log(`  ✓ ${n.section}`);
  }

  // --- Tools ---
  console.log('\n🔧 Creating tools...');
  const tools = [
    {
      toolType: 'visa_eligibility',
      nameDE: 'Aufenthaltsrecht Prag Eignungscheck',
      nameEN: 'Prague Residence Right Eligibility Checker',
      descriptionDE: 'Prüfe, welchen Aufenthaltstitel du für Prag benötigst (EU / Non-EU).',
      descriptionEN: 'Check which residence status you need for Prague (EU / Non-EU).',
      config: {
        regime: 'CzechResidence',
        paths: [
          { label: 'EU-Bürger', requirement: 'Freizügigkeit — nach 5 Jahren trvalý pobyt beantragen' },
          { label: 'Non-EU Angestellt', requirement: 'Zaměstnanecká karta (Blaue Karte) beim MVCR' },
          { label: 'Non-EU Selbstständig', requirement: 'Živnostenský list + Aufenthaltserlaubnis beim MVCR' },
        ],
        infoUrl: 'https://www.mvcr.cz/clanek/povoleni-k-pobytu-pro-cizince.aspx',
      },
      isActive: true,
    },
    {
      toolType: 'first_month_budget',
      nameDE: 'Erstes-Monat-Budget Prag',
      nameEN: 'First Month Budget Prague',
      descriptionDE: 'Schätze deine Anlaufkosten für den ersten Monat in Prag (in EUR).',
      descriptionEN: 'Estimate your startup costs for the first month in Prague (in EUR).',
      config: {
        currency: 'EUR',
        note: 'Mieten in CZK — Wechselkurs ca. 25 CZK/EUR',
        categories: [
          { key: 'deposit', labelDE: 'Mietkaution (2 Monatsmieten)', min: 1200, max: 2600 },
          { key: 'rent_first', labelDE: 'Erste Monatsmiete', min: 450, max: 1200 },
          { key: 'registration', labelDE: 'Behörden / Anwalt / Übersetzer', min: 100, max: 400 },
          { key: 'health_insurance', labelDE: 'Krankenversicherung bis VZP-Anmeldung', min: 50, max: 150 },
          { key: 'furniture', labelDE: 'Grundausstattung (falls unmöbliert)', min: 400, max: 1500 },
          { key: 'living', labelDE: 'Lebenshaltung Monat 1', min: 600, max: 1000 },
        ],
      },
      isActive: true,
    },
  ];

  for (const t of tools) {
    await prisma.cityTool.upsert({
      where: { cityId_toolType: { cityId: CITY_ID, toolType: t.toolType } },
      update: {},
      create: { cityId: CITY_ID, ...t, updatedAt: NOW },
    });
    console.log(`  ✓ ${t.toolType}`);
  }

  // --- Resources ---
  console.log('\n📚 Creating resources...');
  await prisma.resource.deleteMany({ where: { cityId: CITY_ID } });

  const resources = [
    {
      resourceType: 'checklist',
      titleDE: 'Erste-8-Wochen-Checkliste Prag',
      titleEN: 'First 8 Weeks Checklist Prague',
      descriptionDE: 'Schritt-fuer-Schritt-Plan fuer die Anmeldung in Prag.',
      descriptionEN: 'Step-by-step plan for registering in Prague.',
      content: {
        items: [
          { week: 1, task: 'Kurzzeitunterkunft sichern (Airbnb, Serviced Apartment)' },
          { week: 1, task: 'Tschechisches Bankkonto eroeffnen (Moneta, Raiffeisenbank CZ, Air Bank, Revolut CZ)' },
          { week: 2, task: 'Meldeadresse (trvalé bydliště / prechodný pobyt) beim Stadtbezirksamt anmelden' },
          { week: 2, task: 'EU-Buerger: Registrierung beim Einwohnermeldeamt (ohlášení místa pobytu)' },
          { week: 2, task: 'Non-EU: Aufenthaltserlaubnis beim MVCR beantragen — Termin buchen!' },
          { week: 3, task: 'Tschechische Steuernummer (rodné číslo oder DIČ) bei Finanční úřad beantragen' },
          { week: 3, task: 'Krankenversicherung: VZP oder andere Krankenkasse anmelden' },
          { week: 4, task: 'Langfristige Wohnung suchen (Sreality.cz, Bezrealitky.cz)' },
          { week: 5, task: 'OSVČ-Anmeldung (falls selbststaendig) bei Živnostenský úřad + ČSSZ' },
          { week: 6, task: 'Schulanmeldung fuer Kinder — Bezirksschulamt kontaktieren' },
          { week: 7, task: 'Datová schránka (Digitaler Postkasten fuer Behoerden) beantragen' },
          { week: 8, task: 'Steuererklaerung-Konto anlegen bei financnisprava.cz (Muj daňový portál)' },
        ],
      },
    },
    {
      resourceType: 'glossary',
      titleDE: 'Tschechien-Glossar fuer Expats',
      titleEN: 'Czechia Expat Glossary',
      descriptionDE: 'Die wichtigsten Behoerden, Dokumente und Begriffe fuer Neuankoemmlinge in Prag.',
      descriptionEN: 'Key authorities, documents and terms for newcomers in Prague.',
      content: {
        entries: [
          { term: 'MVCR', definition: 'Ministerstvo vnitra ČR — Innenministerium, zustaendig fuer Aufenthaltserlaubnisse Non-EU' },
          { term: 'Trvalý pobyt', definition: 'Unbefristete Aufenthaltserlaubnis — nach 5 Jahren fuer EU-Buerger, 5 Jahre fuer Non-EU (Blau Karte)' },
          { term: 'OSVČ', definition: 'Osoba Samostatně Výdělečně Činná — selbststaendige natuerliche Person in Tschechien' },
          { term: 'Paušální daň', definition: 'Pauschalsteuerregime fuer OSVČ — monatliche Komplettabgabe inkl. Kranken- und Sozialversicherung' },
          { term: 'ČSSZ', definition: 'Česká správa sociálního zabezpečení — Sozialversicherungsbehörde' },
          { term: 'Zdravotní pojišťovna', definition: 'Krankenkasse — groesste ist VZP, daneben OZP, ZPMV u.a.' },
          { term: 'Finanční úřad', definition: 'Finanzamt — fuer Steuernummer (DIČ), Einkommensteuererklärung' },
          { term: 'Živnostenský list', definition: 'Gewerbeschein — Pflicht fuer selbststaendige Tätigkeit in Tschechien' },
          { term: 'CZK / Koruna', definition: 'Tschechische Krone — Waehrung Tschechiens, ca. 25 CZK = 1 EUR (schwankend)' },
          { term: 'Datová schránka', definition: 'Digitaler Postkasten fuer behördliche Post — verpflichtend fuer Unternehmen, freiwillig fuer Privatpersonen' },
        ],
      },
    },
    {
      resourceType: 'directory',
      titleDE: 'Wichtige Behoerden und Links Prag',
      titleEN: 'Key Authorities and Links Prague',
      descriptionDE: 'Direkte Links zu den wichtigsten Anlaufstellen fuer Expats in Prag.',
      descriptionEN: 'Direct links to the most important contact points for expats in Prague.',
      content: {
        links: [
          { name: 'MVCR (Innenministerium)', url: 'https://www.mvcr.cz', description: 'Aufenthaltserlaubnisse, Visa, Staatsbuergerschaft' },
          { name: 'Finanční úřad', url: 'https://www.financnisprava.cz', description: 'Steuernummer, Einkommensteuererklarung, OSVČ' },
          { name: 'ČSSZ', url: 'https://www.cssz.cz', description: 'Sozialversicherung fuer Selbststaendige und Angestellte' },
          { name: 'VZP (Krankenversicherung)', url: 'https://www.vzp.cz', description: 'Groesste tschechische Krankenkasse' },
          { name: 'Sreality.cz', url: 'https://www.sreality.cz', description: 'Groesstes tschechisches Immobilienportal' },
          { name: 'Expats.cz', url: 'https://www.expats.cz', description: 'Englischsprachige Community und Informationsplattform fuer Expats in Prag' },
          { name: 'Deutsche Schule Prag', url: 'https://www.dsprag.cz', description: 'Anmeldung, Jahrgangsstufen, Schulgeld' },
        ],
      },
    },
    {
      resourceType: 'checklist',
      titleDE: 'Pauschalsteuer OSVČ Prag Checkliste',
      titleEN: 'Flat Rate Tax OSVČ Prague Checklist',
      descriptionDE: 'Voraussetzungen und Schritte fuer das Pauschalregime (paušální daň) in Tschechien.',
      descriptionEN: 'Requirements and steps for the flat-rate regime (paušální daň) in Czechia.',
      content: {
        items: [
          { task: 'Jahresumsatz unter 2 Mio. CZK (~80.000 EUR)' },
          { task: 'Tätigkeit als OSVČ (Einzelunternehmer) registriert bei Živnostenský úřad' },
          { task: 'Anmeldung zum Pauschalregime bis 10. Januar des betreffenden Jahres' },
          { task: 'Monatliche Pauschale (2024: 7.498 CZK) pünktlich bis 20. des Monats bezahlen' },
          { task: 'Keine gesonderte Einkommensteuererklärung, Kranken- und Sozialversicherungsabrechnung nötig' },
          { task: 'Besteuerungsgrundlage: Finanční úřad Praha, jeweilige Bezirksstelle' },
          { task: 'Kein Mehrwertsteuer-Regime im Pauschalregime möglich — unter 2 Mio. CZK ohnehin nicht pflichtig' },
        ],
      },
    },
    {
      resourceType: 'template',
      titleDE: 'Prag Wohnungssuche Bewerbungsvorlage',
      titleEN: 'Prague Flat Search Application Template',
      descriptionDE: 'Vorlage fuer die Wohnungsbewerbung auf Tschechisch und Englisch.',
      descriptionEN: 'Template for flat applications in Czech and English.',
      content: {
        templateCZ: 'Vážená paní / Vážený pane [příjmení],\n\nzasílám zájem o pronájem bytu na adrese [adresa], [čtvrť].\n\nJsem [profese], státní příslušnost [země], v Praze od [datum]. Můj čistý měsíční příjem je [částka] Kč. Mohu doložit:\n- Kopii pasu / povolení k pobytu\n- Poslední 3 výplatní pásky / výpisy z účtu\n- Pracovní smlouvu\n- Referenci od předchozího pronajímatele (na vyžádání)\n\nSe zájmem očekávám Vaši odpověď.\nS pozdravem,\n[Jméno Příjmení]',
        noteDE: 'Tipp: Tschechische Vermieter erwarten oft Originaldokumente. Lasse wichtige Unterlagen ins Tschechische übersetzen (beglaubigte Übersetzung durch soudní tlumočník).',
      },
    },
  ];

  for (const r of resources) {
    await prisma.resource.create({ data: { ...r, cityId: CITY_ID, updatedAt: NOW } });
    console.log(`  ✓ ${r.titleDE}`);
  }

  // --- Testimonials ---
  console.log('\n💬 Creating testimonials...');
  const testimonials = [
    {
      authorName: 'Lars B.',
      authorAge: 33,
      authorProfession: 'Backend Developer',
      authorPersona: 'employed',
      yearMoved: 2021,
      contentDE: 'Prag war meine günstigste Entscheidung seit Jahren — wörtlich. Mein Gehalt bei JetBrains liegt 20 % unter dem Berliner Niveau, aber meine Mietkosten sind 55 % niedriger. Netto habe ich mehr Geld übrig als in Deutschland. Vinohrady ist das perfekte Expat-Viertel: Co-Working, gute Bars, internationale Nachbarn.',
      contentEN: 'Prague was my best financial decision in years — literally. My salary at JetBrains is 20% below Berlin levels, but my rent is 55% lower. Net I have more money left than in Germany. Vinohrady is the perfect expat neighbourhood: co-working, good bars, international neighbours.',
      rating: 5,
      isVerified: false,
    },
    {
      authorName: 'Birgit & Holger K.',
      authorAge: 39,
      authorProfession: 'Designerin & Marketingmanager',
      authorPersona: 'family',
      yearMoved: 2019,
      contentDE: 'Die Deutsche Schule Prag war ein echter Glücksgriff — gutes Niveau, deutlich günstiger als in Wien oder Amsterdam. Mit zwei Kindern ist Prag entspannt: Parks, Natur im Umland, sichere Straßen. Was uns schwergefallen ist: Tschechische Bürokratie ohne Sprachkenntnisse. Unser Anwalt war unverzichtbar.',
      contentEN: 'The Deutsche Schule Prag was a real find — good level, significantly cheaper than Vienna or Amsterdam. With two children, Prague is relaxed: parks, nature on the outskirts, safe streets. What was difficult: Czech bureaucracy without language skills. Our lawyer was indispensable.',
      rating: 4,
      isVerified: false,
    },
    {
      authorName: 'Miriam S.',
      authorAge: 27,
      authorProfession: 'UX Researcherin (Remote)',
      authorPersona: 'freelancer',
      yearMoved: 2023,
      contentDE: 'Als Remote-Arbeiterin habe ich Prag als perfekten Basis gewählt. Das Pauschalregime (paušální daň) ist super simpel: einmal anmelden, monatlich überweisen, fertig. Meine Gesamtabgaben liegen bei ca. 300 EUR/Monat — in Deutschland würde ich das dreifache zahlen. Das Co-Working-Angebot in Holešovice ist exzellent.',
      contentEN: 'As a remote worker I chose Prague as the perfect base. The flat-rate regime (paušální daň) is super simple: register once, transfer monthly, done. My total contributions are about EUR 300/month — in Germany I would pay three times as much. The co-working offering in Holešovice is excellent.',
      rating: 5,
      isVerified: false,
    },
  ];

  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({ where: { cityId: CITY_ID, authorName: t.authorName } });
    if (!existing) {
      await prisma.testimonial.create({ data: { ...t, cityId: CITY_ID } });
    }
    console.log(`  ✓ ${t.authorName}`);
  }

  console.log('\n✅ Prague premium seed complete. Districts:8 Narratives:5 Tools:2 Resources:5 Testimonials:3');
}

async function main() {
  await seedPrag();
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
