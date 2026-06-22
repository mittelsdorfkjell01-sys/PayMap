/**
 * Sprint 9 — Budapest Premium Content Seed
 * Pattern: 8 districts · 5 narratives · 2 tools · 5 resources · 3 testimonials
 * Run: npm run seed:premium:budapest (from packages/db)
 * Sources: nav.gov.hu, ingatlan.com, ksh.hu, expat.com/budapest, numbeo.com
 */
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();
const NOW = new Date();
const CITY_ID = 'cmpbrajde006gnrhvgweebzcp';
const SOURCE = 'ingatlan.com / ingatlanbazar.hu Q1 2025';

export async function seedBudapest() {
  console.log('🌍 Seeding Budapest premium content...');

  // --- Districts ---
  console.log('\n📍 Creating districts...');
  const districts = [
    {
      slug: 'budapest-v-belvaros',
      nameDE: 'V. Bezirk — Belváros',
      nameEN: 'District V — Belváros (Inner City)',
      descriptionDE: 'Das historische Herz Budapests — Donauufer, Parlamentsgebäude, luxuriöse Altbauwohnungen, Touristenzentrum und Bankenviertel.',
      descriptionEN: 'The historic heart of Budapest — Danube bank, Parliament building, luxury period flats, tourist centre and banking district.',
      latitude: 47.4979, longitude: 19.0490, vibe: 'urban-modern', priceLevel: 5, sortOrder: 1,
      col: [
        { category: 'rent_studio',    value: 650,  currency: 'EUR' },
        { category: 'rent_1br_center',       value: 900,  currency: 'EUR' },
        { category: 'rent_2br_center',       value: 1350, currency: 'EUR' },
        { category: 'rent_3br_center',       value: 2000, currency: 'EUR' },
        { category: 'meal_inexpensive', value: 8,  currency: 'EUR' },
        { category: 'meal_midrange',  value: 22,   currency: 'EUR' },
        { category: 'cappuccino',     value: 3.0,  currency: 'EUR' },
      ],
    },
    {
      slug: 'budapest-vi-terezvaros',
      nameDE: 'VI. Bezirk — Terézváros (Andrássy út)',
      nameEN: 'District VI — Terézváros (Andrássy Avenue)',
      descriptionDE: 'Prachtvoller Boulevard Andrássy út, Operahaus, gehobene Restaurants und Boutiquen — der Pariser Champs-Élysées Budapests.',
      descriptionEN: 'Magnificent Andrássy Boulevard, Opera House, upscale restaurants and boutiques — Budapest\'s Champs-Élysées.',
      latitude: 47.5100, longitude: 19.0620, vibe: 'upscale', priceLevel: 5, sortOrder: 2,
      col: [
        { category: 'rent_studio',    value: 600,  currency: 'EUR' },
        { category: 'rent_1br_center',       value: 850,  currency: 'EUR' },
        { category: 'rent_2br_center',       value: 1250, currency: 'EUR' },
        { category: 'rent_3br_center',       value: 1800, currency: 'EUR' },
        { category: 'meal_inexpensive', value: 7,  currency: 'EUR' },
        { category: 'meal_midrange',  value: 20,   currency: 'EUR' },
        { category: 'cappuccino',     value: 2.8,  currency: 'EUR' },
      ],
    },
    {
      slug: 'budapest-vii-erzsebetvaros',
      nameDE: 'VII. Bezirk — Erzsébetváros (Ruinenpubs)',
      nameEN: 'District VII — Erzsébetváros (Ruin Bars)',
      descriptionDE: 'Berühmtes Szene-Viertel mit weltbekannten Ruinenpubs (Szimpla Kert), jüdisches Kulturerbe, lebhafte Nachtszene, Expat-Community.',
      descriptionEN: 'Famous nightlife district with world-renowned ruin bars (Szimpla Kert), Jewish heritage, vibrant nightlife, expat community.',
      latitude: 47.5012, longitude: 19.0653, vibe: 'bohemian', priceLevel: 4, sortOrder: 3,
      col: [
        { category: 'rent_studio',    value: 550,  currency: 'EUR' },
        { category: 'rent_1br_center',       value: 780,  currency: 'EUR' },
        { category: 'rent_2br_center',       value: 1150, currency: 'EUR' },
        { category: 'rent_3br_center',       value: 1650, currency: 'EUR' },
        { category: 'meal_inexpensive', value: 6,  currency: 'EUR' },
        { category: 'meal_midrange',  value: 17,   currency: 'EUR' },
        { category: 'cappuccino',     value: 2.5,  currency: 'EUR' },
      ],
    },
    {
      slug: 'budapest-i-var-buda',
      nameDE: 'I. Bezirk — Burgviertel (Várhegy)',
      nameEN: 'District I — Castle Hill (Várhegy)',
      descriptionDE: 'UNESCO-Welterbe Burgberg — historische Residenz, Matthiaskirche, Fischerbastei, touristisch, wenige Mietwohnungen, höchste Preise.',
      descriptionEN: 'UNESCO World Heritage Castle Hill — historic residences, Matthias Church, Fisherman\'s Bastion, touristy, few rental flats, highest prices.',
      latitude: 47.4963, longitude: 19.0399, vibe: 'upscale', priceLevel: 5, sortOrder: 4,
      col: [
        { category: 'rent_studio',    value: 700,  currency: 'EUR' },
        { category: 'rent_1br_center',       value: 1000, currency: 'EUR' },
        { category: 'rent_2br_center',       value: 1500, currency: 'EUR' },
        { category: 'rent_3br_center',       value: 2200, currency: 'EUR' },
        { category: 'meal_inexpensive', value: 10, currency: 'EUR' },
        { category: 'meal_midrange',  value: 28,   currency: 'EUR' },
        { category: 'cappuccino',     value: 3.5,  currency: 'EUR' },
      ],
    },
    {
      slug: 'budapest-viii-jozsefvaros',
      nameDE: 'VIII. Bezirk — Józsefváros',
      nameEN: 'District VIII — Józsefváros',
      descriptionDE: 'Im Wandel befindliches Viertel — günstiger Altbau, Universität Budapest, wachsende Kreativszene, gemischte Bevölkerung, noch erschwinglich.',
      descriptionEN: 'Transitional district — affordable period buildings, Budapest University, growing creative scene, mixed population, still affordable.',
      latitude: 47.4912, longitude: 19.0750, vibe: 'authentic', priceLevel: 2, sortOrder: 5,
      col: [
        { category: 'rent_studio',    value: 380,  currency: 'EUR' },
        { category: 'rent_1br_center',       value: 550,  currency: 'EUR' },
        { category: 'rent_2br_center',       value: 800,  currency: 'EUR' },
        { category: 'rent_3br_center',       value: 1100, currency: 'EUR' },
        { category: 'meal_inexpensive', value: 5,  currency: 'EUR' },
        { category: 'meal_midrange',  value: 14,   currency: 'EUR' },
        { category: 'cappuccino',     value: 2.0,  currency: 'EUR' },
      ],
    },
    {
      slug: 'budapest-ii-budai-dombok',
      nameDE: 'II. Bezirk — Budaer Hügel',
      nameEN: 'District II — Buda Hills',
      descriptionDE: 'Ruhige Villengegend in den Budaer Hügeln — grüne Wohnlage, internationale Schulen, beliebt bei Familien und Diplomaten.',
      descriptionEN: 'Quiet villa district in the Buda Hills — green residential area, international schools, popular with families and diplomats.',
      latitude: 47.5244, longitude: 19.0072, vibe: 'suburban', priceLevel: 4, sortOrder: 6,
      col: [
        { category: 'rent_studio',    value: 500,  currency: 'EUR' },
        { category: 'rent_1br_center',       value: 750,  currency: 'EUR' },
        { category: 'rent_2br_center',       value: 1100, currency: 'EUR' },
        { category: 'rent_3br_center',       value: 1600, currency: 'EUR' },
        { category: 'meal_inexpensive', value: 7,  currency: 'EUR' },
        { category: 'meal_midrange',  value: 20,   currency: 'EUR' },
        { category: 'cappuccino',     value: 2.8,  currency: 'EUR' },
      ],
    },
    {
      slug: 'budapest-xiii-ujlipotvaros',
      nameDE: 'XIII. Bezirk — Újlipótváros',
      nameEN: 'District XIII — Újlipótváros (New Leopold Town)',
      descriptionDE: 'Beliebtes Aufwertungsviertel nördlich der Innenstadt — moderner Mix aus Altbau und Neubau, Flussnähe, junge Bevölkerung, Co-Working.',
      descriptionEN: 'Popular gentrifying district north of the centre — modern mix of old and new buildings, riverside, young population, co-working.',
      latitude: 47.5208, longitude: 19.0536, vibe: 'trendy', priceLevel: 3, sortOrder: 7,
      col: [
        { category: 'rent_studio',    value: 500,  currency: 'EUR' },
        { category: 'rent_1br_center',       value: 720,  currency: 'EUR' },
        { category: 'rent_2br_center',       value: 1050, currency: 'EUR' },
        { category: 'rent_3br_center',       value: 1500, currency: 'EUR' },
        { category: 'meal_inexpensive', value: 6,  currency: 'EUR' },
        { category: 'meal_midrange',  value: 16,   currency: 'EUR' },
        { category: 'cappuccino',     value: 2.5,  currency: 'EUR' },
      ],
    },
    {
      slug: 'budapest-xi-ujbuda',
      nameDE: 'XI. Bezirk — Újbuda (Kelenföldi Buda)',
      nameEN: 'District XI — Újbuda (South Buda)',
      descriptionDE: 'Südlicher Budaer Bezirk — ruhige Wohnlage, günstiger als Zentrum, gut erschlossen per Metro und Tram, beliebt bei Familien.',
      descriptionEN: 'Southern Buda district — quiet residential area, cheaper than the centre, well connected by metro and tram, popular with families.',
      latitude: 47.4649, longitude: 19.0357, vibe: 'suburban', priceLevel: 2, sortOrder: 8,
      col: [
        { category: 'rent_studio',    value: 420,  currency: 'EUR' },
        { category: 'rent_1br_center',       value: 600,  currency: 'EUR' },
        { category: 'rent_2br_center',       value: 880,  currency: 'EUR' },
        { category: 'rent_3br_center',       value: 1250, currency: 'EUR' },
        { category: 'meal_inexpensive', value: 5,  currency: 'EUR' },
        { category: 'meal_midrange',  value: 14,   currency: 'EUR' },
        { category: 'cappuccino',     value: 2.2,  currency: 'EUR' },
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
      titleDE: 'Budapest als Wahlheimat: Lebensqualität auf hohem Niveau, Lebenshaltung auf niedrigem',
      titleEN: 'Budapest as a New Home: High Quality of Life, Low Cost of Living',
      contentDE: `Budapest ist eine der günstigsten Hauptstädte der EU bei gleichzeitig hoher Lebensqualität — prachtvoll gründerzeitliche Architektur, spektakuläre Donaukulisse, weltklasse Thermalbäder und eine lebhafte Kulturszene machen die Stadt einzigartig. Für Expats aus der Eurozone ist die Lebenshaltungskostendifferenz erheblich: Mieten liegen 40–60 % unter westeuropäischem Niveau, Lebensmittel und Restaurantbesuche 50–60 % günstiger.\n\nUngarn ist EU-Mitglied, nutzt aber den Ungarischen Forint (HUF) — Stand 2025 ca. 390 HUF/EUR. Wechselkursschwankungen sind für Eurozone-Einkommensbezieher relevant. Die Inflation war 2022–2024 überdurchschnittlich hoch (bis 25 % im Jahr 2023), hat sich 2025 aber normalisiert.\n\nDie Wohnungssuche läuft über Ingatlan.com und Ingatlanbazar.hu. Mieten steigen, besonders in den zentralen Bezirken (V, VI, VII). Expats, die mit Remote-Einkommen in Euro oder Dollar leben, profitieren stark vom günstigen HUF-Niveau.\n\nBudapest hat eine aktive internationale Community — besonders im VII. Bezirk und im XIII. Bezirk gibt es viele englischsprachige Anlaufstellen, Co-Working-Spaces und Expat-Netzwerke.`,
      contentEN: `Budapest is one of the most affordable EU capitals while maintaining a high quality of life — magnificent turn-of-the-century architecture, spectacular Danube views, world-class thermal baths and a vibrant cultural scene make the city unique. For expats from the eurozone, the cost of living difference is substantial: rents are 40–60% below Western European levels, food and restaurant visits 50–60% cheaper.\n\nHungary is an EU member but uses the Hungarian Forint (HUF) — around 390 HUF/EUR in 2025. Exchange rate fluctuations are relevant for those with eurozone incomes. Inflation was above average in 2022–2024 (up to 25% in 2023) but has normalised in 2025.\n\nFlat hunting runs via Ingatlan.com and Ingatlanbazar.hu. Rents are rising, particularly in the central districts (V, VI, VII). Expats living on remote income in euros or dollars benefit significantly from the favourable HUF level.\n\nBudapest has an active international community — particularly in District VII and XIII there are many English-language contact points, co-working spaces and expat networks.`,
      sourceUrls: ['https://www.numbeo.com/cost-of-living/in/Budapest', 'https://www.ksh.hu'],
      lastVerified: new Date('2025-11-01'),
    },
    {
      section: 'for_freelancers',
      titleDE: 'Selbstständig in Budapest: KATA-Pauschalsystem, Áfa und Unternehmensformen',
      titleEN: 'Freelancing in Budapest: KATA Flat Tax, VAT and Business Structures',
      contentDE: `**KATA (Kisadózó Vállalkozások Tételes Adója)** war das beliebteste Steuerregime für Kleinselbstständige in Ungarn: Pauschale Steuer von 50.000 HUF/Monat (~130 EUR) deckte Einkommensteuer, Rentenversicherung und Krankenversicherung ab — unabhängig vom Umsatz. **Wichtige Änderung 2022**: KATA wurde für B2B-Dienstleister mit ausländischen Kunden stark eingeschränkt. Wer hauptsächlich für einen ausländischen Auftraggeber arbeitet, kann KATA nicht mehr nutzen.\n\nAlternativen nach der KATA-Reform: **Egyéni vállalkozó** (Einzelunternehmen) mit Standardbesteuerung — 15 % Einkommensteuer + 13 % Sozialversicherung auf den Gewinn. Oder **Kft.** (GmbH-Äquivalent) — 9 % Körperschaftsteuer, aber höherer Verwaltungsaufwand.\n\n**Áfa (MwSt)**: Ungarn hat mit 27 % die höchste MwSt-Rate in der EU. Kleinunternehmer mit Umsatz unter 12 Mio. HUF/Jahr (~31.000 EUR) sind befreit. Für B2B-Dienstleistungen ins EU-Ausland gilt Reverse Charge — keine ungarische MwSt.\n\nEmpfehlung: Für internationale Freelancer mit überwiegend ausländischen Kunden ist die **Kft.** mit niedrigem Unternehmerlohn + Dividende steuerlich attraktiver als Einzelunternehmen, erfordert aber einen lokalen Buchhalter.`,
      contentEN: `KATA (Kisadózó Vállalkozások Tételes Adója) was Hungary's most popular tax regime for micro-entrepreneurs: a flat monthly tax of 50,000 HUF/month (~EUR 130) covered income tax, pension and health insurance — regardless of turnover. **Important change 2022**: KATA was severely restricted for B2B service providers with foreign clients. Those working mainly for a foreign client can no longer use KATA.\n\nAlternatives after the KATA reform: Egyéni vállalkozó (sole trader) with standard taxation — 15% income tax + 13% social insurance on profit. Or Kft. (GmbH equivalent) — 9% corporate tax, but higher administrative burden.\n\nÁfa (VAT): Hungary has the highest VAT rate in the EU at 27%. Small businesses with turnover below 12 million HUF/year (~EUR 31,000) are exempt. For B2B services to other EU countries, reverse charge applies — no Hungarian VAT.\n\nRecommendation: For international freelancers with predominantly foreign clients, the Kft. with a low director's salary + dividends is more tax-efficient than a sole trader, but requires a local accountant.`,
      sourceUrls: ['https://www.nav.gov.hu', 'https://kata.hu'],
      lastVerified: new Date('2025-11-01'),
    },
    {
      section: 'for_families',
      titleDE: 'Familienleben in Budapest: Schulen, CSOK-Förderung und Gesundheitsversorgung',
      titleEN: 'Family Life in Budapest: Schools, CSOK Support and Healthcare',
      contentDE: `**Internationale Schulen** in Budapest: American International School of Budapest (AISB), British International School, Budapest French School (Lycée), German-Hungarian Michael-Gymnasium, SEK Budapest International School. Jahresgebühren: 8.000–22.000 EUR. Staatliche ungarische Schulen sind kostenlos und akademisch solide, jedoch auf Ungarisch.\n\n**Kinderbetreuung**: Bölcsőde (Krippe, 3 Monate bis 3 Jahre) kostet in staatlichen Einrichtungen ca. 0–5.000 HUF/Monat (0–13 EUR) — extrem günstig im EU-Vergleich. Óvoda (Vorschule, 3–6 Jahre) ist kostenlos und qualitativ gut. Private internationale Krippen: 300–600 EUR/Monat.\n\n**CSOK (Otthonteremtési Kedvezmény)**: Staatliche Förderung für Familien beim Immobilienkauf — bis zu 10 Mio. HUF (~26.000 EUR) Zuschuss plus zinsgünstige Kredite bei 3 oder mehr Kindern. Gilt auch für EU-Bürger mit ungarischem Wohnsitz und Beschäftigung in Ungarn.\n\n**Gesundheitsversorgung**: Das staatliche System (OEP) ist für angemeldete Arbeitnehmer und Selbstständige zugänglich, kann aber lange Wartezeiten haben. Private Zusatzversicherung (z.B. Generali, Allianz) für 50–150 EUR/Monat empfohlen — sofortiger Zugang zu Privatärzten.`,
      contentEN: `International schools in Budapest: American International School of Budapest (AISB), British International School, Budapest French School (Lycée), German-Hungarian Michael-Gymnasium, SEK Budapest International School. Annual fees: EUR 8,000–22,000. State Hungarian schools are free and academically solid, but in Hungarian.\n\nChildcare: Bölcsőde (nursery, 3 months to 3 years) costs approximately 0–5,000 HUF/month (0–€13) in state facilities — extremely cheap by EU standards. Óvoda (preschool, 3–6 years) is free and good quality. Private international nurseries: €300–600/month.\n\nCSCK (Otthonteremtési Kedvezmény): State support for families buying property — up to 10 million HUF (~€26,000) grant plus subsidised loans for 3 or more children. Also available to EU citizens with Hungarian residency and employment in Hungary.\n\nHealthcare: The state system (OEP) is accessible to registered employees and self-employed, but can have long waiting times. Private supplementary insurance (e.g. Generali, Allianz) for €50–150/month recommended — immediate access to private doctors.`,
      sourceUrls: ['https://www.aisb.hu', 'https://www.nav.gov.hu/csok'],
      lastVerified: new Date('2025-11-01'),
    },
    {
      section: 'for_employees',
      titleDE: 'Angestellt in Budapest: Gehälter, Steuern und der ungarische Arbeitsmarkt',
      titleEN: 'Employed in Budapest: Salaries, Taxes and the Hungarian Labour Market',
      contentDE: `**Gehälter** in Budapest liegen im EU-Vergleich niedrig, steigen aber rasant: Senior Software Engineers verdienen 800.000–1.500.000 HUF brutto/Monat (ca. 2.050–3.850 EUR). Nach Steuern und Abgaben verbleiben ca. 560.000–1.050.000 HUF netto. Im Verhältnis zum lokalen Preisniveau entspricht das einer soliden Kaufkraft.\n\n**Steuerbelastung Angestellte (2024)**: 15 % Einkommensteuer auf das gesamte Bruttogehalt (keine Progression für Standardgehälter). Arbeitnehmer zahlen 18,5 % Sozialversicherung. Arbeitgeber zahlen 13 % Sozialversicherungsbeitrag (seit 2022 deutlich gesenkt). Effektivbelastung Arbeitnehmer: ca. 33,5 % auf Brutto.\n\n**Internationale Arbeitgeber** in Budapest: Große multinationale Shared-Service-Center (KPMG, Deloitte, Morgan Stanley, Citi, Bosch, GE, IBM, SAP, Nokia). Viele Stellen in Englisch; tech-affine Expats haben gute Chancen.\n\n**TAJ-Karte**: Ungarische Sozialversicherungskarte — wird beim Arbeitgeber beantragt und vom Nationalen Gesundheitsfonds ausgestellt. Voraussetzung für staatliche Gesundheitsversorgung.\n\n**Homeoffice-Regelung**: Ungarn erlaubt bis zu 50 % Home-Office ohne gesonderten Vertrag — für Remote-Work-Expats aus dem EU-Ausland ist dies relevant für Steuer-Residenz-Fragen.`,
      contentEN: `Salaries in Budapest are low by EU standards but rising rapidly: Senior Software Engineers earn 800,000–1,500,000 HUF gross/month (approx. EUR 2,050–3,850). After taxes and contributions approx. 560,000–1,050,000 HUF net remains. Relative to local price levels, this represents solid purchasing power.\n\nEmployee tax burden (2024): 15% income tax on the entire gross salary (no progression for standard salaries). Employees pay 18.5% social insurance. Employers pay 13% social insurance contribution (significantly reduced since 2022). Effective employee burden: approx. 33.5% on gross.\n\nInternational employers in Budapest: Large multinational shared service centres (KPMG, Deloitte, Morgan Stanley, Citi, Bosch, GE, IBM, SAP, Nokia). Many positions in English; tech-oriented expats have good prospects.\n\nTAJ card: Hungarian social insurance card — applied for through the employer and issued by the National Health Fund. Prerequisite for state healthcare.\n\nHome office rules: Hungary allows up to 50% home office without a separate contract — relevant for remote-work expats from abroad for tax residency questions.`,
      sourceUrls: ['https://www.nav.gov.hu', 'https://www.ksh.hu/stadat_files/mun/hu/mun0021.html'],
      lastVerified: new Date('2025-11-01'),
    },
    {
      section: 'for_retirees',
      titleDE: 'Ruhestand in Budapest: DBA Deutschland-Ungarn, Lebenshaltungskosten und Rentnerleben',
      titleEN: 'Retirement in Budapest: DBA Germany-Hungary, Cost of Living and Retiree Life',
      contentDE: `Das **Doppelbesteuerungsabkommen Deutschland-Ungarn (DBA)** von 2011 regelt die Rentenbesteuerung: Deutsche gesetzliche Renten werden in Deutschland besteuert (Quellenlandprinzip). Private Renten und Kapitaleinkünfte werden i.d.R. in Ungarn versteuert — mit 15 % Einkommensteuer (sehr günstig). Keine Progression bis ca. 3.000 EUR/Monat.\n\n**Lebenshaltungskosten** für Rentner: Budapest ist für europäische Rentner außergewöhnlich günstig. Monatliche Gesamtausgaben für ein Paar: 1.200–1.800 EUR inklusive Miete (Miete ca. 550–900 EUR für eine zentrale 2-ZW). Thermalbäder (Széchenyi, Gellért) ab 20 EUR/Eintritt — viele bieten günstige Seniorenabos.\n\n**Aufenthalt EU-Bürger**: Keine Anmeldepflicht für Aufenthalte unter 90 Tagen. Für Daueraufenthalt: Registrierung beim Regionalen Einwanderungsamt (Bevándorlási és Menekültügyi Hivatal). EU-Bürger erhalten Aufenthaltsbescheinigung (Regisztrációs igazolás) kostenlos.\n\n**Krankenversicherung**: EU-Rentner mit Rentenbezug aus einem EU-Land sind meist weiterhin dort pflichtversichert und können die EHIC in Ungarn nutzen. Empfehlung: Private internationale Krankenversicherung für komfortablen Zugang zu Privatkliniken.`,
      contentEN: `The Germany-Hungary double taxation agreement (DBA) of 2011 governs pension taxation: German statutory pensions are taxed in Germany (source country principle). Private pensions and capital income are generally taxed in Hungary — at 15% income tax (very favourable). No progression up to approx. EUR 3,000/month.\n\nCost of living for retirees: Budapest is exceptionally affordable for European retirees. Total monthly expenses for a couple: EUR 1,200–1,800 including rent (rent approx. EUR 550–900 for a central 2-room flat). Thermal baths (Széchenyi, Gellért) from EUR 20/entry — many offer affordable senior subscriptions.\n\nResidence for EU citizens: No registration requirement for stays under 90 days. For permanent residence: registration at the Regional Immigration Office (Bevándorlási és Menekültügyi Hivatal). EU citizens receive a residence certificate (Regisztrációs igazolás) free of charge.\n\nHealth insurance: EU retirees receiving a pension from an EU country are usually still compulsorily insured there and can use the EHIC in Hungary. Recommendation: Private international health insurance for comfortable access to private clinics.`,
      sourceUrls: ['https://www.nav.gov.hu/dba-deutschland-ungarn', 'https://bmbah.hu'],
      lastVerified: new Date('2025-11-01'),
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
      toolType: 'kata_tax_checker',
      nameDE: 'KATA-Eignung Checker Budapest',
      nameEN: 'Budapest KATA Eligibility Checker',
      descriptionDE: 'Prüfe, ob du nach der KATA-Reform 2022 noch das Pauschalsystem nutzen kannst.',
      descriptionEN: 'Check whether you can still use the KATA flat-tax system after the 2022 reform.',
      config: {
        regime: 'HungaryKATA2022',
        eligibleIf: [
          'Kein einziger ausländischer Auftraggeber macht mehr als 50% deines Umsatzes aus',
          'Umsatz unter 18 Mio. HUF/Jahr (~46.000 EUR)',
          'Keine GmbH-Beteiligung als Geschäftsführer',
          'Tätigkeit nicht als freier Mitarbeiter (munkaviszony-ähnlich)',
        ],
        ineligibleIf: [
          'Hauptauftraggeber ist ein ausländisches Unternehmen (häufigster Ausschlussgrund für Expats)',
          'Tätigkeit entspricht einem Arbeitsverhältnis (kein echtes unternehmerisches Risiko)',
        ],
        alternatives: [
          { name: 'Egyéni vállalkozó (Standard)', tax: '15% ESt + 13% SZV auf Gewinn' },
          { name: 'Kft. (GmbH)', tax: '9% Körperschaftsteuer + Dividendensteuer 15%' },
        ],
        infoUrl: 'https://www.nav.gov.hu/kata',
      },
      isActive: true,
    },
    {
      toolType: 'first_month_budget',
      nameDE: 'Erstes-Monat-Budget Budapest',
      nameEN: 'First Month Budget Budapest',
      descriptionDE: 'Schätze deine Anlaufkosten für den ersten Monat in Budapest (in EUR, HUF-Umrechnung bei ca. 390 HUF/EUR).',
      descriptionEN: 'Estimate your startup costs for the first month in Budapest (in EUR, HUF conversion at approx. 390 HUF/EUR).',
      config: {
        currency: 'EUR',
        note: 'Mieten in HUF — Wechselkurs ca. 390 HUF/EUR (schwankend)',
        categories: [
          { key: 'deposit',          labelDE: 'Mietkaution (2 Monatsmieten)',    min: 1100, max: 2700 },
          { key: 'rent_first',       labelDE: 'Erste Monatsmiete',              min: 380,  max: 1000 },
          { key: 'registration',     labelDE: 'Anmeldung / Anwalt / Übersetzer', min: 50,  max: 300  },
          { key: 'health_insurance', labelDE: 'Krankenversicherung (privat)',    min: 50,   max: 150  },
          { key: 'furniture',        labelDE: 'Grundausstattung',               min: 300,  max: 1200 },
          { key: 'living',           labelDE: 'Lebenshaltung Monat 1',          min: 500,  max: 900  },
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
      titleDE: 'Erste-8-Wochen-Checkliste Budapest',
      titleEN: 'First 8 Weeks Checklist Budapest',
      descriptionDE: 'Schritt-fuer-Schritt-Plan fuer EU-Buerger bei der Anmeldung in Budapest.',
      descriptionEN: 'Step-by-step plan for EU citizens registering in Budapest.',
      content: {
        items: [
          { week: 1, task: 'Kurzzeitunterkunft sichern (Airbnb, Aparthotel, 1–2 Wochen)' },
          { week: 1, task: 'Ungarisches Bankkonto eroeffnen: OTP Bank, K&H oder Revolut HU' },
          { week: 2, task: 'EU-Buerger: Registrierung beim Regionalen Einwanderungsamt (BMBAH) — Regisztrációs igazolás beantragen' },
          { week: 2, task: 'Adresse anmelden beim Stadtbezirksamt (Polgármesteri Hivatal)' },
          { week: 3, task: 'TAJ-Karte (Sozialversicherungskarte) ueber Arbeitgeber oder Direktantrag beim NEAK beantragen' },
          { week: 3, task: 'Steueridentifikationsnummer (adóazonosító jel) beim NAV beantragen' },
          { week: 4, task: 'Langfristige Wohnung suchen (Ingatlan.com, Ingatlanbazar.hu)' },
          { week: 5, task: 'Selbststaendige: Egyéni vállalkozó oder Kft. gruenden — Steuerberater hinzuziehen' },
          { week: 6, task: 'Schulanmeldung fuer Kinder — Bezirksschulamt oder internationale Schule' },
          { week: 7, task: 'Private Krankenversicherung abschliessen (Generali, Allianz HU)' },
          { week: 8, task: 'Fuehrerschein: EU-Fuehrerschein gilt dauerhaft — kein Umtausch noetig' },
        ],
      },
    },
    {
      resourceType: 'glossary',
      titleDE: 'Ungarn-Glossar fuer Expats',
      titleEN: 'Hungary Expat Glossary',
      descriptionDE: 'Die wichtigsten Behoerden, Dokumente und Steuerbegriffe fuer Neuankoemmlinge in Budapest.',
      descriptionEN: 'Key authorities, documents and tax terms for newcomers in Budapest.',
      content: {
        entries: [
          { term: 'NAV', definition: 'Nemzeti Adó- és Vámhivatal — Finanzamt & Zollbehoerde, zustaendig fuer Steuern und Unternehmensregistrierung' },
          { term: 'BMBAH', definition: 'Bevándorlási és Menekültügyi Hivatal — Einwanderungsbehoerde fuer EU-Registrierung und Non-EU-Visa' },
          { term: 'TAJ-Karte', definition: 'Társadalombiztosítási Azonosító Jel — Sozialversicherungsausweis, noetig fuer Arztbesuche im staatlichen System' },
          { term: 'KATA', definition: 'Kleinselbststaendigen-Pauschalsteuer — seit 2022 eingeschraenkt fuer Freelancer mit auslaendischen Kunden' },
          { term: 'Kft.', definition: 'Korlátolt Felelősségű Társaság — GmbH-Aequivalent mit 9% Koerperschaftsteuer' },
          { term: 'HUF / Forint', definition: 'Ungarischer Forint — Waehrung Ungarns, ca. 390 HUF = 1 EUR (stark schwankend)' },
          { term: 'Áfa', definition: 'Általános Forgalmi Adó — Mehrwertsteuer, 27% Normalsatz (hoechster in der EU)' },
          { term: 'NEAK', definition: 'Nemzeti Egészségbiztosítási Alapkezelő — Nationaler Krankenversicherungsfonds' },
          { term: 'OEP', definition: 'Korábbi elnevezése az NEAK-nak — altes Kuerzel, oft noch im Sprachgebrauch' },
          { term: 'Adóazonosító jel', definition: 'Steueridentifikationsnummer — 10-stellige Nummer, beim NAV beantragen' },
        ],
      },
    },
    {
      resourceType: 'directory',
      titleDE: 'Wichtige Behoerden und Links Budapest',
      titleEN: 'Key Authorities and Links Budapest',
      descriptionDE: 'Direkte Links zu den wichtigsten Anlaufstellen fuer Expats in Budapest.',
      descriptionEN: 'Direct links to the most important contact points for expats in Budapest.',
      content: {
        links: [
          { name: 'NAV (Finanzamt)', url: 'https://www.nav.gov.hu', description: 'Steuernummer, KATA, Unternehmensregistrierung' },
          { name: 'BMBAH (Einwanderung)', url: 'https://bmbah.hu', description: 'EU-Registrierung, Aufenthaltstitel, Visum Non-EU' },
          { name: 'NEAK (Krankenversicherung)', url: 'https://www.neak.gov.hu', description: 'TAJ-Karte, staatliche Krankenversicherung' },
          { name: 'OTP Bank', url: 'https://www.otpbank.hu', description: 'Groesste ungarische Bank — Kontoeroeffnung fuer Expats moeglich' },
          { name: 'Ingatlan.com', url: 'https://www.ingatlan.com', description: 'Groesstes ungarisches Immobilienportal' },
          { name: 'Expat.com Budapest', url: 'https://www.expat.com/en/expats/hungary/budapest', description: 'Englischsprachige Community und Tipps' },
          { name: 'Numbeo Budapest', url: 'https://www.numbeo.com/cost-of-living/in/Budapest', description: 'Aktuelle Lebenshaltungskosten-Daten' },
        ],
      },
    },
    {
      resourceType: 'checklist',
      titleDE: 'Unternehmensgruendung Budapest Checkliste',
      titleEN: 'Company Formation Budapest Checklist',
      descriptionDE: 'Schritte zur Gruendung einer Kft. (GmbH) oder Einzelunternehmen in Ungarn.',
      descriptionEN: 'Steps for forming a Kft. (Ltd.) or sole trader business in Hungary.',
      content: {
        items: [
          { task: 'Gültige Adresse in Ungarn (Kft. benoetigt eingetragenen Geschaeftssitz)' },
          { task: 'Ungarisches Bankkonto mit mind. 3 Mio. HUF (~8.000 EUR) Stammkapital fuer Kft.' },
          { task: 'Gesellschaftsvertrag (Alapító okirat) — Notar oder elektronisch ueber NAV' },
          { task: 'Registrierung beim Handelsregister (Cégjegyzék) — online via birosag.hu, ca. 15 Werktage' },
          { task: 'Steuerregistrierung beim NAV — Adószám (Steuernummer des Unternehmens) wird automatisch vergeben' },
          { task: 'Buchhaltung: Kft. benoetigt professionellen Buchhalter — Kosten ca. 100–300 EUR/Monat' },
          { task: 'Egyéni vállalkozó (Einzelunternehmen): einfacher, direkt beim NAV online anmelden, kein Notar noetig' },
        ],
      },
    },
    {
      resourceType: 'template',
      titleDE: 'Budapest Wohnungssuche Bewerbungsvorlage',
      titleEN: 'Budapest Flat Search Application Template',
      descriptionDE: 'Vorlage fuer die Wohnungsbewerbung auf Ungarisch und Englisch.',
      descriptionEN: 'Template for flat applications in Hungarian and English.',
      content: {
        templateHU: 'Tisztelt [Bérbeadó neve]!\n\nÉrdeklődni szeretnék a(z) [cím] alatt elérhető lakás bérbeadásáról.\n\nRöviden magamról: [foglalkozás] vagyok, [ország] állampolgár, [dátum] óta élek Budapesten. Havi nettó jövedelmem [összeg] EUR/HUF. Tudok csatolni:\n- Útlevél / tartózkodási igazolás másolatát\n- Utolsó 3 havi bankszámlakivonatot\n- Munkáltatói igazolást / vállalkozói regisztrációt\n\nElőre is köszönöm a válaszát!\nÜdvözlettel,\n[Teljes név]',
        noteDE: 'Tipp: Vermieter bevorzugen Mieter mit festem Arbeitsverhältnis. Als Selbstständiger solltest du NAV-Bescheinigungen und Kontoauszüge der letzten 6 Monate mitbringen. Englischsprachige Vermieter finden sich am häufigsten in den Bezirken V, VI, VII und XIII.',
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
      authorName: 'Kai R.',
      authorAge: 35,
      authorProfession: 'Software Engineer (Remote)',
      authorPersona: 'freelancer',
      yearMoved: 2022,
      contentDE: 'Mit meinem deutschen Remote-Gehalt lebe ich in Budapest wie ein König. Meine 2-Zimmer-Wohnung in Újlipótváros kostet 780 EUR — in Berlin würde ich dafür vielleicht eine WG-Zimmer bekommen. Das KATA-Problem habe ich mit einer Kft. gelöst: 9 % Körperschaftsteuer, monatliche Dividende, alles sauber. Die Buchhalterkosten (150 EUR/Monat) sind der einzige Overhead.',
      contentEN: 'With my German remote salary I live like a king in Budapest. My 2-room flat in Újlipótváros costs EUR 780 — in Berlin I might get a room share for that. I solved the KATA problem with a Kft.: 9% corporate tax, monthly dividend, everything clean. The accountant costs (EUR 150/month) are the only overhead.',
      rating: 5,
      isVerified: false,
    },
    {
      authorName: 'Sandra & Thomas P.',
      authorAge: 42,
      authorProfession: 'Ärztin & Unternehmensberater',
      authorPersona: 'family',
      yearMoved: 2020,
      contentDE: 'Budapest für die Familie war eine exzellente Entscheidung. Unsere Töchter gehen auf die britische internationale Schule — 18.000 EUR/Jahr, teuer, aber deutlich weniger als in Wien. Die Lebenshaltungskosten sparen wir anderswo: Haushälterin 300 EUR/Monat, Restaurant-Abend zu viert 50–70 EUR. Gesundheitssystem: wir nutzen private Versicherung, keine Probleme.',
      contentEN: 'Budapest for the family was an excellent decision. Our daughters attend the British international school — EUR 18,000/year, expensive, but significantly less than Vienna. We save on other living costs: housekeeper EUR 300/month, family restaurant evening EUR 50–70. Healthcare: we use private insurance, no issues.',
      rating: 5,
      isVerified: false,
    },
    {
      authorName: 'Wolfgang M.',
      authorAge: 64,
      authorProfession: 'Pensionierter Ingenieur',
      authorPersona: 'retiree',
      yearMoved: 2018,
      contentDE: 'Meine deutsche Rente reicht in Budapest für einen sehr komfortablen Lebensstil. Thermal-Abo Széchenyi: 60 EUR/Monat. Opernkarten ab 10 EUR. Einziger Wermutstropfen: Die Inflation 2022–2023 hat alles teurer gemacht. Aber immer noch deutlich günstiger als Deutschland. Das DBA regelt meine Besteuerung sauber — Deutschland besteuert meine gesetzliche Rente, Ungarn den Rest.',
      contentEN: 'My German pension is enough for a very comfortable lifestyle in Budapest. Széchenyi thermal bath subscription: EUR 60/month. Opera tickets from EUR 10. Only downside: inflation 2022–2023 made everything more expensive. But still significantly cheaper than Germany. The DBA cleanly governs my taxation — Germany taxes my statutory pension, Hungary the rest.',
      rating: 4,
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

  console.log('\n✅ Budapest premium seed complete. Districts:8 Narratives:5 Tools:2 Resources:5 Testimonials:3');
}

async function main() {
  await seedBudapest();
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
