/**
 * Sprint 9 — Bangkok Premium Content Seed
 * Pattern: 8 districts · 5 narratives · 2 tools · 5 resources · 3 testimonials
 * Run: npm run seed:premium:bangkok (from packages/db)
 * Sources: thaievisa.go.th, immigration.go.th, dbd.go.th, numbeo.com, expatfocus.com/bangkok
 *
 * TAX NOTE: Bangkok/Thailand tax_planning follows Sprint-8 classification only.
 * DBA Deutschland-Thailand (1985) is complex, Wegzugsbesteuerung §6 AStG applies.
 * No deep premium tax content — riskLevel: high with sourceUrls.
 */
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();
const NOW = new Date();
const CITY_ID = 'cmpbrar1o00aenrhv7dyyp294';
const SOURCE = 'DDproperty.com / Hipflat.com Q1 2025';

export async function seedBangkok() {
  console.log('🌍 Seeding Bangkok premium content...');

  // --- Districts ---
  console.log('\n📍 Creating districts...');
  const districts = [
    {
      slug: 'bangkok-sukhumvit',
      nameDE: 'Sukhumvit (Asoke – Ekkamai)',
      nameEN: 'Sukhumvit (Asoke – Ekkamai)',
      descriptionDE: 'Herzstück der Expat-Szene Bangkoks — BTS Sky Train, internationale Supermärkte, tausende Restaurants, Nachtleben, Serviced Apartments.',
      descriptionEN: 'Heart of Bangkok\'s expat scene — BTS Sky Train, international supermarkets, thousands of restaurants, nightlife, serviced apartments.',
      latitude: 13.7299, longitude: 100.5697, vibe: 'urban-modern', priceLevel: 4, sortOrder: 1,
      col: [
        { category: 'rent_studio',    value: 500,  currency: 'EUR' },
        { category: 'rent_1br_center',       value: 750,  currency: 'EUR' },
        { category: 'rent_2br_center',       value: 1200, currency: 'EUR' },
        { category: 'rent_3br_center',       value: 1900, currency: 'EUR' },
        { category: 'meal_inexpensive', value: 3,  currency: 'EUR' },
        { category: 'meal_midrange',  value: 15,   currency: 'EUR' },
        { category: 'cappuccino',     value: 3.5,  currency: 'EUR' },
      ],
    },
    {
      slug: 'bangkok-silom-sathorn',
      nameDE: 'Silom / Sathorn (CBD)',
      nameEN: 'Silom / Sathorn (CBD)',
      descriptionDE: 'Bangkoks Finanzzentrum — internationale Unternehmen, konsularisches Viertel, gehobene Restaurants, stärker konservativ als Sukhumvit.',
      descriptionEN: 'Bangkok\'s financial centre — international companies, consular district, upscale restaurants, more conservative atmosphere than Sukhumvit.',
      latitude: 13.7220, longitude: 100.5290, vibe: 'upscale', priceLevel: 5, sortOrder: 2,
      col: [
        { category: 'rent_studio',    value: 600,  currency: 'EUR' },
        { category: 'rent_1br_center',       value: 900,  currency: 'EUR' },
        { category: 'rent_2br_center',       value: 1500, currency: 'EUR' },
        { category: 'rent_3br_center',       value: 2500, currency: 'EUR' },
        { category: 'meal_inexpensive', value: 4,  currency: 'EUR' },
        { category: 'meal_midrange',  value: 18,   currency: 'EUR' },
        { category: 'cappuccino',     value: 4.0,  currency: 'EUR' },
      ],
    },
    {
      slug: 'bangkok-thonglor-ekkamai',
      nameDE: 'Thonglor / Ekkamai',
      nameEN: 'Thonglor / Ekkamai',
      descriptionDE: 'Trendigstes Viertel Bangkoks — koreanische und japanische Community, Boutique-Cafés, Rooftop-Bars, kreative Szene, hohe Mieten für Bangkok.',
      descriptionEN: 'Bangkok\'s trendiest neighbourhood — Korean and Japanese community, boutique cafés, rooftop bars, creative scene, high rents for Bangkok.',
      latitude: 13.7222, longitude: 100.5860, vibe: 'trendy', priceLevel: 5, sortOrder: 3,
      col: [
        { category: 'rent_studio',    value: 650,  currency: 'EUR' },
        { category: 'rent_1br_center',       value: 950,  currency: 'EUR' },
        { category: 'rent_2br_center',       value: 1600, currency: 'EUR' },
        { category: 'rent_3br_center',       value: 2800, currency: 'EUR' },
        { category: 'meal_inexpensive', value: 5,  currency: 'EUR' },
        { category: 'meal_midrange',  value: 20,   currency: 'EUR' },
        { category: 'cappuccino',     value: 4.5,  currency: 'EUR' },
      ],
    },
    {
      slug: 'bangkok-ari-phahol',
      nameDE: 'Ari / Phahol Yothin',
      nameEN: 'Ari / Phahol Yothin',
      descriptionDE: 'Entspanntes lokales Viertel nördlich des CBDs — Coffee-Shops, Märkte, weniger Tourist-Fokus, BTS-Anbindung, gute Auswahl mittlerer Preisklasse.',
      descriptionEN: 'Relaxed local neighbourhood north of the CBD — coffee shops, markets, less tourist focus, BTS connection, good choice of mid-range options.',
      latitude: 13.7694, longitude: 100.5411, vibe: 'authentic', priceLevel: 3, sortOrder: 4,
      col: [
        { category: 'rent_studio',    value: 380,  currency: 'EUR' },
        { category: 'rent_1br_center',       value: 580,  currency: 'EUR' },
        { category: 'rent_2br_center',       value: 900,  currency: 'EUR' },
        { category: 'rent_3br_center',       value: 1400, currency: 'EUR' },
        { category: 'meal_inexpensive', value: 2,  currency: 'EUR' },
        { category: 'meal_midrange',  value: 12,   currency: 'EUR' },
        { category: 'cappuccino',     value: 3.0,  currency: 'EUR' },
      ],
    },
    {
      slug: 'bangkok-asoke-phrom-phong',
      nameDE: 'Asoke / Phrom Phong (BTS E3–E5)',
      nameEN: 'Asoke / Phrom Phong (BTS E3–E5)',
      descriptionDE: 'Zentralstes Expat-Gebiet — Terminal 21, Emporium Mall, internationale Krankenhäuser (Bumrungrad), BTS/MRT-Kreuzung, bequem für Alltag.',
      descriptionEN: 'Most central expat area — Terminal 21, Emporium Mall, international hospitals (Bumrungrad), BTS/MRT interchange, convenient for daily life.',
      latitude: 13.7374, longitude: 100.5601, vibe: 'urban-modern', priceLevel: 4, sortOrder: 5,
      col: [
        { category: 'rent_studio',    value: 520,  currency: 'EUR' },
        { category: 'rent_1br_center',       value: 780,  currency: 'EUR' },
        { category: 'rent_2br_center',       value: 1300, currency: 'EUR' },
        { category: 'rent_3br_center',       value: 2100, currency: 'EUR' },
        { category: 'meal_inexpensive', value: 3,  currency: 'EUR' },
        { category: 'meal_midrange',  value: 16,   currency: 'EUR' },
        { category: 'cappuccino',     value: 3.5,  currency: 'EUR' },
      ],
    },
    {
      slug: 'bangkok-bangrak',
      nameDE: 'Bang Rak / Charoen Krung',
      nameEN: 'Bang Rak / Charoen Krung',
      descriptionDE: 'Historisches Viertel am Chao-Phraya — aufstrebende Kreativszene, Kunstgalerien, Boutique-Hotels, mix aus Tradition und Moderne.',
      descriptionEN: 'Historic riverside neighbourhood on Chao Phraya — emerging creative scene, art galleries, boutique hotels, mix of tradition and modernity.',
      latitude: 13.7268, longitude: 100.5128, vibe: 'bohemian', priceLevel: 3, sortOrder: 6,
      col: [
        { category: 'rent_studio',    value: 400,  currency: 'EUR' },
        { category: 'rent_1br_center',       value: 600,  currency: 'EUR' },
        { category: 'rent_2br_center',       value: 1000, currency: 'EUR' },
        { category: 'rent_3br_center',       value: 1600, currency: 'EUR' },
        { category: 'meal_inexpensive', value: 2,  currency: 'EUR' },
        { category: 'meal_midrange',  value: 13,   currency: 'EUR' },
        { category: 'cappuccino',     value: 3.0,  currency: 'EUR' },
      ],
    },
    {
      slug: 'bangkok-ratchathewi',
      nameDE: 'Ratchathewi / Victory Monument',
      nameEN: 'Ratchathewi / Victory Monument',
      descriptionDE: 'Zentrales, erschwinglicheres Viertel — Victory Monument BTS-Hub, günstige Straßenküche, gute Verbindungen, beliebt bei Langzeit-Backpackern.',
      descriptionEN: 'Central, more affordable district — Victory Monument BTS hub, cheap street food, good connections, popular with long-term backpackers.',
      latitude: 13.7621, longitude: 100.5397, vibe: 'authentic', priceLevel: 2, sortOrder: 7,
      col: [
        { category: 'rent_studio',    value: 300,  currency: 'EUR' },
        { category: 'rent_1br_center',       value: 450,  currency: 'EUR' },
        { category: 'rent_2br_center',       value: 700,  currency: 'EUR' },
        { category: 'rent_3br_center',       value: 1100, currency: 'EUR' },
        { category: 'meal_inexpensive', value: 1.5, currency: 'EUR' },
        { category: 'meal_midrange',  value: 10,   currency: 'EUR' },
        { category: 'cappuccino',     value: 2.5,  currency: 'EUR' },
      ],
    },
    {
      slug: 'bangkok-phra-khanong',
      nameDE: 'Phra Khanong / On Nut',
      nameEN: 'Phra Khanong / On Nut',
      descriptionDE: 'Günstigstes populäres Expat-Gebiet — lokales Viertel-Feeling, BTS-Anbindung, gute Märkte, beliebt bei Digital Nomads und Budget-Expats.',
      descriptionEN: 'Most affordable popular expat area — local neighbourhood feel, BTS connection, good markets, popular with digital nomads and budget expats.',
      latitude: 13.7015, longitude: 100.5967, vibe: 'authentic', priceLevel: 2, sortOrder: 8,
      col: [
        { category: 'rent_studio',    value: 280,  currency: 'EUR' },
        { category: 'rent_1br_center',       value: 420,  currency: 'EUR' },
        { category: 'rent_2br_center',       value: 650,  currency: 'EUR' },
        { category: 'rent_3br_center',       value: 1000, currency: 'EUR' },
        { category: 'meal_inexpensive', value: 1.5, currency: 'EUR' },
        { category: 'meal_midrange',  value: 9,    currency: 'EUR' },
        { category: 'cappuccino',     value: 2.5,  currency: 'EUR' },
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
      titleDE: 'Bangkok als Wahlheimat: Tropisches Leben, niedrige Kosten und komplexe Einwanderung',
      titleEN: 'Bangkok as a New Home: Tropical Life, Low Costs and Complex Immigration',
      contentDE: `Bangkok ist für viele Digital Nomads und Expats die beste Kombination aus Lebensqualität, Lebenshaltungskosten und Lifestyle: Weltklasse-Essen für 2–5 EUR, modernes BTS Sky Train-System, internationale Krankenhäuser auf Weltstandard (Bumrungrad, Bangkok Hospital, Samitivej), lebhafte Kultur und einfache Reiseanbindung durch Suvarnabhumi-Flughafen.\n\nGleichzeitig ist die Visasituation für Langzeitaufenthalte eine der komplexesten Asiens. Deutschland und Thailand haben kein Freizügigkeitsabkommen — jeder Aufenthalt über 30 Tage erfordert ein Visum. Die beliebtesten Optionen für Expats aus Deutschland:\n\n**Destination Thailand Visa (DTV)**: Seit Mai 2024 verfügbar — Mehrfacheinreise für 5 Jahre, 180 Tage je Aufenthalt, Gebühr ca. 10.000 THB. Voraussetzung: Remote Worker, Freelancer oder digitaler Nomade mit nachgewiesenem Auslandseinkommen. Beliebt bei europäischen Nomaden.\n\n**Thailand Elite Visa**: 5–20 Jahre Mehrfacheinreise, 5.000–1.000.000 THB Gebühr. Für Rentner und wohlhabende Langzeitaufenthalter interessant.\n\n**Non-Immigrant B (Arbeitsvisum)**: Für Angestellte mit lokalem Arbeitgeber — erfordert Work Permit, den der Arbeitgeber beantragt.`,
      contentEN: `Bangkok is for many digital nomads and expats the best combination of quality of life, cost of living and lifestyle: world-class food for €2–5, a modern BTS Sky Train system, international hospitals at world standards (Bumrungrad, Bangkok Hospital, Samitivej), vibrant culture and easy travel connections through Suvarnabhumi Airport.\n\nAt the same time, the visa situation for long-term stays is one of the most complex in Asia. Germany and Thailand have no freedom of movement agreement — every stay over 30 days requires a visa. The most popular options for expats from Germany:\n\nDestination Thailand Visa (DTV): Available since May 2024 — multiple entry for 5 years, 180 days per stay, fee approx. 10,000 THB. Requirement: remote worker, freelancer or digital nomad with proven foreign income. Popular with European nomads.\n\nThailand Elite Visa: 5–20 years multiple entry, 5,000–1,000,000 THB fee. Interesting for retirees and wealthy long-stay visitors.\n\nNon-Immigrant B (work visa): For employees with local employer — requires work permit which the employer applies for.`,
      sourceUrls: ['https://www.thaievisa.go.th', 'https://www.immigration.go.th'],
      lastVerified: new Date('2025-11-01'),
    },
    {
      section: 'for_freelancers',
      titleDE: 'Selbstständig in Bangkok: DTV, lokales Unternehmen und steuerliche Risiken',
      titleEN: 'Freelancing in Bangkok: DTV, Local Company and Tax Risks',
      contentDE: `**Destination Thailand Visa (DTV)** ist die neue Standard-Option für Freelancer und Remote Workers aus Deutschland: 5 Jahre, 180 Tage je Einreise, keine Arbeitsgenehmigung erforderlich — solange die Einnahmen aus dem Ausland kommen (Auslandskunden, deutsches Unternehmen). Der DTV erlaubt explizit Remote Work von Thailand aus.\n\n**Lokale Unternehmensgründung** (Thai Company Limited): Mindestens 2 Gründer, 51 % Thai-Eigentumsanteil erforderlich (ausser in bestimmten BOI-geförderten Branchen). Eine Limited Partnership mit Thai Nominee Directors ist verbreitet, aber rechtlich riskant — bei Kontrolle können Sanktionen folgen.\n\n**Steuerliche Situation für Deutsche in Thailand**:\n> ⚠️ **WICHTIG — Hohe Komplexität:** Das DBA Deutschland-Thailand von 1985 ist komplex und für moderne Remote-Work-Situationen nicht ausgelegt. Wer in Thailand steuerlich ansässig wird (>180 Tage/Jahr), kann in Thailand steuerpflichtig werden — UND in Deutschland muss Wegzugsbesteuerung geprüft werden. Bevor du länger als 183 Tage in Thailand lebst: Steuerberater konsultieren, der beide Länder kennt.\n\nDer DTV erlaubt es, unter 180 Tagen zu bleiben und damit keine Thai-Steuerpflicht auszulösen — viele Nomaden nutzen gezielt diese Grenze.`,
      contentEN: `Destination Thailand Visa (DTV) is the new standard option for freelancers and remote workers from Germany: 5 years, 180 days per entry, no work permit required — as long as income comes from abroad (foreign clients, German company). The DTV explicitly permits remote work from Thailand.\n\nLocal company formation (Thai Company Limited): Minimum 2 founders, 51% Thai ownership required (except in certain BOI-promoted sectors). A limited partnership with Thai nominee directors is widespread but legally risky — sanctions can follow if inspected.\n\nTax situation for Germans in Thailand:\n⚠️ IMPORTANT — High complexity: The Germany-Thailand DBA of 1985 is complex and not designed for modern remote work situations. Anyone who becomes tax-resident in Thailand (>180 days/year) may become taxable in Thailand — AND exit tax under §6 AStG must be checked for Germany. Before living more than 183 days in Thailand: consult a tax advisor who knows both countries.\n\nThe DTV allows staying under 180 days and thus not triggering Thai tax liability — many nomads deliberately use this threshold.`,
      sourceUrls: ['https://www.thaievisa.go.th/dtv', 'https://www.rd.go.th'],
      lastVerified: new Date('2025-11-01'),
    },
    {
      section: 'for_families',
      titleDE: 'Familienleben in Bangkok: Schulen, Gesundheitsversorgung und Expat-Alltag',
      titleEN: 'Family Life in Bangkok: Schools, Healthcare and Expat Daily Life',
      contentDE: `**Internationale Schulen** in Bangkok: Bangkok Patana School (britisch, Sukhumvit), NIST International School, Shrewsbury International School, Harrow International School, Wells International School, Deutsche Botschaftsschule Bangkok (DBS). Jahresgebühren: 10.000–30.000 EUR. Internationale Schulen sind in Bangkok qualitativ exzellent und deutlich günstiger als in Zürich oder Singapur.\n\n**Kindergarten**: International Kindergartens in Sukhumvit/Ekkamai ab 500 EUR/Monat. Qualität sehr variabel — deutsche Eltern empfehlen NIST Early Childhood oder Wells.\n\n**Gesundheitsversorgung**: Bangkok hat einige der besten Privatkrankenhäuser Asiens — Bumrungrad International Hospital ist weltweit bekannt, Samitivej und Bangkok Hospital ebenfalls Weltklasse. Preise: Arztbesuch ab 40 EUR, Operations etwa 30–50 % des europäischen Preises. Internationale Krankenversicherung (Cigna, AXA, Allianz Care) dringend empfohlen — staatliche Versicherung gilt nicht in Thailand.\n\n**Impfungen**: FSME, Hepatitis A+B, Typhus, Tollwut auffrischen. Malaria in Bangkok kein Thema, aber auf Reisen in ländliche Regionen.\n\n**Sicherheit**: Bangkok ist für Familien in Expat-Vierteln (Sukhumvit, Silom) sehr sicher. Verkehr ist das grösste Sicherheitsrisiko — Motorräder und Songthaews meiden.`,
      contentEN: `International schools in Bangkok: Bangkok Patana School (British, Sukhumvit), NIST International School, Shrewsbury International School, Harrow International School, Wells International School, Deutsche Botschaftsschule Bangkok (DBS). Annual fees: EUR 10,000–30,000. International schools in Bangkok are qualitatively excellent and significantly cheaper than Zurich or Singapore.\n\nKindergarten: International kindergartens in Sukhumvit/Ekkamai from EUR 500/month. Quality very variable — German parents recommend NIST Early Childhood or Wells.\n\nHealthcare: Bangkok has some of the best private hospitals in Asia — Bumrungrad International Hospital is world-renowned, Samitivej and Bangkok Hospital also world-class. Prices: doctor's visit from EUR 40, operations approx. 30–50% of European prices. International health insurance (Cigna, AXA, Allianz Care) strongly recommended — state insurance does not apply in Thailand.\n\nVaccinations: TBE, Hepatitis A+B, typhoid, rabies booster. Malaria not an issue in Bangkok but on trips to rural regions.\n\nSafety: Bangkok is very safe for families in expat neighbourhoods (Sukhumvit, Silom). Traffic is the biggest safety risk — avoid motorbikes and songthaews.`,
      sourceUrls: ['https://www.bumrungrad.com', 'https://www.bangkokpatana.ac.th'],
      lastVerified: new Date('2025-11-01'),
    },
    {
      section: 'for_employees',
      titleDE: 'Angestellt in Bangkok: Work Permit, BOI-Unternehmen und Gehälter',
      titleEN: 'Employed in Bangkok: Work Permit, BOI Companies and Salaries',
      contentDE: `**Work Permit** ist für Ausländer in Thailand Pflicht, wenn sie für einen lokalen Arbeitgeber arbeiten. Der Prozess: Arbeitgeber beantragt Work Permit beim Department of Employment (DOE). Voraussetzungen: gültige Non-Immigrant B Visa, Arbeitgeber muss mind. 4 Thai-Mitarbeiter pro ausländischem beschäftigen.\n\n**Gehälter** für Expats: Multinationale Unternehmen zahlen oft Expat-Pakete (Housing Allowance, Schulgeld, Flüge). Lokale Gehälter liegen deutlich unter europäischem Niveau:\n- Software Engineer (mid-level): 60.000–100.000 THB/Monat (1.500–2.600 EUR)\n- Manager international: 120.000–250.000 THB/Monat (3.100–6.500 EUR)\n- Expat-Package senior: 250.000–500.000 THB + Benefits\n\n**BOI-Unternehmen** (Board of Investment): Geförderte Branchen (Tech, Medtech, Green Energy) erhalten Steuervergünstigungen und dürfen höhere Anteile an Auslandskapital halten. Für Tech-Expats mit Jobangeboten bei BOI-Unternehmen sind die Bedingungen günstiger.\n\n**Einkommensteuer Thailand**: Progressiv 5–35 %. Für Ausländer, die weniger als 180 Tage in Thailand sind: Nur Thailand-Einkommen steuerpflichtig. Über 180 Tage: Weltweites Einkommen kann steuerbar sein — DBA prüfen lassen.`,
      contentEN: `Work permit is mandatory for foreigners in Thailand working for a local employer. The process: employer applies for work permit at the Department of Employment (DOE). Requirements: valid Non-Immigrant B visa, employer must employ at least 4 Thai employees per foreign worker.\n\nSalaries for expats: Multinational companies often pay expat packages (housing allowance, school fees, flights). Local salaries are significantly below European levels:\n- Software Engineer (mid-level): 60,000–100,000 THB/month (EUR 1,500–2,600)\n- International manager: 120,000–250,000 THB/month (EUR 3,100–6,500)\n- Senior expat package: 250,000–500,000 THB + benefits\n\nBOI companies (Board of Investment): Promoted sectors (tech, medtech, green energy) receive tax incentives and can hold higher foreign capital shares. For tech expats with job offers at BOI companies, conditions are more favourable.\n\nIncome tax Thailand: Progressive 5–35%. For foreigners spending fewer than 180 days in Thailand: Only Thailand income is taxable. Over 180 days: Worldwide income may be taxable — have DBA checked.`,
      sourceUrls: ['https://www.boi.go.th', 'https://www.dol.go.th'],
      lastVerified: new Date('2025-11-01'),
    },
    {
      section: 'for_retirees',
      titleDE: 'Ruhestand in Bangkok: Retirement Visa, Gesundheitsversorgung und Lebenshaltung',
      titleEN: 'Retirement in Bangkok: Retirement Visa, Healthcare and Cost of Living',
      contentDE: `**Non-Immigrant OA (Retirement Visa)**: Für Personen ab 50 Jahren. Voraussetzungen: 800.000 THB (ca. 21.000 EUR) auf einem Thai-Bankkonto, oder monatliches Renteneinkommen von mind. 65.000 THB/Monat. Einjährig, jährlich erneuerbar bei Einwanderungsbehörde. Viele Rentner nutzen alternativ das **Thailand Elite Visa** für unkompliziertere Verlängerungen.\n\n**Lebenshaltungskosten für Rentner**: Bangkok ist für europäische Rentner extrem günstig. Monatliche Gesamtausgaben für ein Paar: 1.000–2.000 EUR, davon Miete in Sukhumvit 600–1.200 EUR für ein 1-Zimmer-Apartment mit Swimmingpool (Condominium). Massagen ab 8 EUR/Stunde, Restaurantessen ab 3 EUR, AC in der Wohnung ist inbegriffen.\n\n**Gesundheitsversorgung**: Bumrungrad International Hospital hat mehr als 520.000 internationale Patienten/Jahr — auch für komplexe Behandlungen geeignet. Kosten deutlich unter europäischem Niveau. Private internationale Krankenversicherung ist Pflicht — deutsche Pflichtversicherung/gesetzliche KV zahlt nicht in Thailand.\n\n**Steuerliche Warnung für Rentner**: Das DBA Deutschland-Thailand von 1985 regelt die Rentenbesteuerung — deutsche gesetzliche Rente grundsätzlich in Deutschland besteuert. Aber: Wer in Thailand steuerlich ansässig wird (>180 Tage), muss Details prüfen. **Steuerberater konsultieren.**`,
      contentEN: `Non-Immigrant OA (Retirement Visa): For persons aged 50+. Requirements: 800,000 THB (approx. EUR 21,000) in a Thai bank account, or monthly pension income of at least 65,000 THB/month. Annual, renewable annually at immigration office. Many retirees alternatively use the Thailand Elite Visa for easier renewals.\n\nCost of living for retirees: Bangkok is extremely affordable for European retirees. Total monthly expenses for a couple: EUR 1,000–2,000, of which rent in Sukhumvit EUR 600–1,200 for a 1-room apartment with swimming pool (condominium). Massages from EUR 8/hour, restaurant meals from EUR 3, AC in the flat included.\n\nHealthcare: Bumrungrad International Hospital has more than 520,000 international patients/year — also suitable for complex treatments. Costs significantly below European levels. Private international health insurance is essential — German statutory health insurance does not pay in Thailand.\n\nTax warning for retirees: The Germany-Thailand DBA of 1985 governs pension taxation — German statutory pension generally taxed in Germany. But: those who become tax-resident in Thailand (>180 days) must check details. **Consult a tax advisor.**`,
      sourceUrls: ['https://www.immigration.go.th', 'https://www.bumrungrad.com'],
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
      toolType: 'dtv_eligibility',
      nameDE: 'DTV-Eignung Checker Bangkok (Destination Thailand Visa)',
      nameEN: 'Bangkok DTV Eligibility Checker (Destination Thailand Visa)',
      descriptionDE: 'Prüfe, ob du für das Destination Thailand Visa (DTV) qualifizierst — seit Mai 2024 verfügbar.',
      descriptionEN: 'Check whether you qualify for the Destination Thailand Visa (DTV) — available since May 2024.',
      config: {
        regime: 'ThailandDTV2024',
        eligibleIf: [
          'Remote Worker, Freelancer oder digitaler Nomade mit Auslandseinkommen',
          'Nachweis Einkommensquelle aus dem Ausland (Kontoauszüge, Arbeitsvertrag/Kundenverträge)',
          'Kein Thai-Arbeitgeber — Einnahmen kommen von ausserhalb Thailands',
          'Keine Beschäftigung bei einem in Thailand registrierten Unternehmen',
        ],
        stayLimit: '180 Tage je Einreise (verlängerbar auf weitere 180 Tage — max. 365 Tage/Jahr)',
        validity: '5 Jahre, Mehrfacheinreise',
        fee: 'Ca. 10.000 THB (~260 EUR)',
        where: 'Thai Konsulat/Botschaft im Heimatland — oder Online-Antrag via Konsulat',
        taxWarning: 'Aufenthalt über 180 Tage/Jahr: Steuerrechtliche Prüfung dringend empfohlen (DBA Deutschland-Thailand, Wegzugsbesteuerung)',
        infoUrl: 'https://www.thaievisa.go.th',
      },
      isActive: true,
    },
    {
      toolType: 'first_month_budget',
      nameDE: 'Erstes-Monat-Budget Bangkok',
      nameEN: 'First Month Budget Bangkok',
      descriptionDE: 'Schätze deine Anlaufkosten für den ersten Monat in Bangkok (in EUR, THB ca. 38 THB/EUR).',
      descriptionEN: 'Estimate your startup costs for the first month in Bangkok (in EUR, THB approx. 38 THB/EUR).',
      config: {
        currency: 'EUR',
        note: 'Mieten in THB — Wechselkurs ca. 38 THB/EUR. Kaution meist 2 Monatsmieten.',
        categories: [
          { key: 'deposit',          labelDE: 'Mietkaution (2 Monatsmieten)', min: 560,  max: 2400  },
          { key: 'rent_first',       labelDE: 'Erste Monatsmiete',           min: 280,  max: 1200  },
          { key: 'health_insurance', labelDE: 'Internationale Krankenversicherung', min: 80, max: 250 },
          { key: 'visa',             labelDE: 'DTV oder andere Visumskosten', min: 30,   max: 300   },
          { key: 'motorbike',        labelDE: 'Roller-Leasing/Kauf (optional)', min: 0,  max: 200   },
          { key: 'living',           labelDE: 'Lebenshaltung Monat 1',       min: 500,  max: 1200  },
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
      titleDE: 'Erste-8-Wochen-Checkliste Bangkok (DTV)',
      titleEN: 'First 8 Weeks Checklist Bangkok (DTV)',
      descriptionDE: 'Schritt-fuer-Schritt-Plan fuer Remote Worker mit DTV in Bangkok.',
      descriptionEN: 'Step-by-step plan for remote workers with DTV in Bangkok.',
      content: {
        items: [
          { week: 1, task: 'DTV vorab im deutschen Konsulat beantragen (ca. 4–6 Wochen Vorlaufzeit)' },
          { week: 1, task: 'Kurzzeitunterkunft buchen (Serviced Apartment empfohlen, Sukhumvit Soi 4–55)' },
          { week: 1, task: 'Internationale Krankenversicherung abschliessen (Cigna, AXA, Allianz Care International)' },
          { week: 2, task: 'Thaibaendisches Bankkonto eroeffnen: Kasikorn Bank oder Bangkok Bank — Reisepass + Visum noetig' },
          { week: 2, task: 'SIM-Karte (True Move, DTAC/Total, AIS) — 30-Tage-Pakete ab 15 EUR' },
          { week: 3, task: 'Langzeitwohnung suchen (DDproperty.com, Hipflat.com, Facebook "Bangkok Expat Rentals")' },
          { week: 3, task: 'TM30 (Wohnortsregistrierung) durch Vermieter beim Immigration Bureau einreichen lassen' },
          { week: 4, task: 'Thai Driving Licence beantragen (DLT) falls Auto oder Motorrad geplant — Internationaler Fuehrerschein 60 Tage gueltig' },
          { week: 5, task: 'Steuersituation pruefen: Bleibst du unter 180 Tage? Wenn nicht, Steuerberater DE+TH konsultieren' },
          { week: 6, task: 'Notfallkontakte: Bumrungrad Hospital (+66-2-667-1000), Deutsche Botschaft (+66-2-287-9000)' },
        ],
      },
    },
    {
      resourceType: 'glossary',
      titleDE: 'Thailand-Glossar fuer Expats',
      titleEN: 'Thailand Expat Glossary',
      descriptionDE: 'Die wichtigsten Behörden, Visa-Typen und Begriffe fuer Neuankömmlinge in Bangkok.',
      descriptionEN: 'Key authorities, visa types and terms for newcomers in Bangkok.',
      content: {
        entries: [
          { term: 'DTV', definition: 'Destination Thailand Visa — seit 2024, 5 Jahre Mehrfacheinreise fuer Remote Worker / Freelancer' },
          { term: 'Non-OA', definition: 'Non-Immigrant OA — Retirement Visa fuer Personen 50+, jährlich erneuerbar' },
          { term: 'Non-B', definition: 'Non-Immigrant B — Arbeitsvisum fuer Angestellte, erfordert Work Permit (Bai Anuyat Tamngan)' },
          { term: 'Elite Visa', definition: 'Thailand Privilege Card (frueherer Elite Visa) — 5–20 Jahre, 600.000–2.140.000 THB Gebühr' },
          { term: 'TM30', definition: 'Meldepflicht fuer Auslaender — Vermieter muss Wohnort des Auslaenders beim Immigration Bureau melden' },
          { term: 'Tabien Baan', definition: 'Haus-Registrierungsbuch — Auslaender koennen als "Hausgast" eingetragen werden (kein echter Wohnsitz)' },
          { term: 'Work Permit', definition: 'Bai Anuyat Tamngan — Arbeitsgenehmigung fuer alle Taetigkeiten fuer Thai-Arbeitgeber' },
          { term: 'THB / Baht', definition: 'Thailaendischer Baht — Waehrung, ca. 38 THB = 1 EUR (schwankend)' },
          { term: 'BOI', definition: 'Board of Investment — foerdert auslaendische Investitionen, erleichtert Visa/Work Permits in bestimmten Sektoren' },
          { term: 'BTS', definition: 'Bangkok Mass Transit System — Skytrain, Hauptverkehrsmittel fuer Expats in Sukhumvit / Silom' },
        ],
      },
    },
    {
      resourceType: 'directory',
      titleDE: 'Wichtige Behoerden und Links Bangkok',
      titleEN: 'Key Authorities and Links Bangkok',
      descriptionDE: 'Direkte Links zu den wichtigsten Anlaufstellen fuer Expats in Bangkok.',
      descriptionEN: 'Direct links to the most important contact points for expats in Bangkok.',
      content: {
        links: [
          { name: 'Thai e-Visa Portal', url: 'https://www.thaievisa.go.th', description: 'DTV, Non-OA, Non-B und andere Visa beantragen' },
          { name: 'Immigration Bureau Bangkok', url: 'https://www.immigration.go.th', description: 'Visa-Verlaengerungen, TM30, Einwanderungsfragen' },
          { name: 'Revenue Department Thailand', url: 'https://www.rd.go.th', description: 'Thaies Finanzamt — Steuerrecht, Steuernummer' },
          { name: 'BOI (Board of Investment)', url: 'https://www.boi.go.th', description: 'Investitionsfoerderung, Smart Visa, Unternehmensgruendung' },
          { name: 'DDproperty.com', url: 'https://www.ddproperty.com', description: 'Groesstes thai Immobilienportal fuer Miete und Kauf' },
          { name: 'Deutsche Botschaft Bangkok', url: 'https://www.bangkok.diplo.de', description: 'Konsularische Dienste, Buergerbuero, Notruf' },
          { name: 'Bumrungrad Hospital', url: 'https://www.bumrungrad.com', description: 'Fuehrendes internationales Krankenhaus Bangkoks' },
        ],
      },
    },
    {
      resourceType: 'checklist',
      titleDE: 'DTV-Antrag Bangkok Checkliste (Vorab im Konsulat)',
      titleEN: 'DTV Application Bangkok Checklist (Advance at Consulate)',
      descriptionDE: 'Dokumente und Schritte fuer den DTV-Antrag beim thailaendischen Konsulat.',
      descriptionEN: 'Documents and steps for the DTV application at the Thai consulate.',
      content: {
        items: [
          { task: 'Reisepass gueltig mind. 18 Monate ab Einreisedatum' },
          { task: 'Nachweis Remote-Arbeit: Arbeitsvertrag oder Kundenvertraege mit Auslandspartnern (auf Englisch, ggf. uebersetzen lassen)' },
          { task: 'Kontoauszuege der letzten 6 Monate — Einkommen aus Auslandsquellen nachweisen' },
          { task: 'Internationaler Krankenversicherungsnachweis (mind. 40.000 USD Deckung fuer Aufenthalt in Thailand)' },
          { task: 'Passfoto (Biometrie-Format) — meistens 2 Stueck' },
          { task: 'Ausgefuelltes DTV-Antragsformular vom Thai Konsulat' },
          { task: 'DTV-Gebuehr: ca. 10.000 THB (ca. 260 EUR) — per Ueberweisung oder am Konsulat' },
          { task: 'Bearbeitungszeit ca. 3–7 Werktage beim Konsulat — nicht kurzfristig beantragen!' },
        ],
      },
    },
    {
      resourceType: 'template',
      titleDE: 'Bangkok Wohnungsbewerbung & Mietvertrag Hinweise',
      titleEN: 'Bangkok Flat Application & Rental Contract Notes',
      descriptionDE: 'Tipps fuer die Wohnungssuche und den Mietvertrag in Bangkok.',
      descriptionEN: 'Tips for flat hunting and rental contracts in Bangkok.',
      content: {
        templateEN: 'Dear [Landlord/Agent],\n\nI am interested in renting the condo/apartment at [address], [district]. I am a [profession] working remotely for [company/clients based in Germany/abroad]. I hold a valid Destination Thailand Visa (DTV) valid until [date].\n\nMonthly income: approx. [amount] EUR/THB from foreign sources.\n\nI can provide:\n- Passport copy + DTV copy\n- Bank statements (last 3 months)\n- Employment contract / client contracts\n\nI would appreciate a viewing at your earliest convenience.\nKind regards,\n[Full Name]',
        notesDE: 'Wichtige Hinweise Mietvertrag Bangkok:\n1. Kaution = 2 Monatsmieten (legal standard). KEINE 3 Monatsmieten akzeptieren — ueberpruefen!\n2. TM30: Vermieter ist verpflichtet, deinen Aufenthalt zu melden. Falls er sich weigert: Mieter kann selbst melden (tm30.immigration.go.th).\n3. Utilities: Strom oft separat berechnet — Rate fuer Auslander in Hochhaeusern oft hoeher als staatlicher Tarif. Vorher klaeren!\n4. Versicherung: Gebaeude versichert Vermieter, aber Hausrat und persoenliche Haftpflicht: selbst abschliessen.',
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
      authorName: 'Felix N.',
      authorAge: 32,
      authorProfession: 'Full-Stack Developer (Remote)',
      authorPersona: 'freelancer',
      yearMoved: 2024,
      contentDE: 'Bangkok mit DTV ist das beste Setup, das ich je hatte. 800 EUR Miete für ein Apartment mit Pool in Ekkamai. Straßenessen für 2 EUR. Das DTV war easy zu beantragen — ein Wochenende Dokumente sammeln, eine Woche Bearbeitung im Konsulat. Die 180-Tage-Grenze zwinge ich mich einzuhalten — keine Lust auf Thai-Steuerpflicht.',
      contentEN: 'Bangkok with DTV is the best setup I\'ve ever had. EUR 800 rent for an apartment with pool in Ekkamai. Street food for EUR 2. The DTV was easy to apply for — one weekend collecting documents, one week processing at the consulate. The 180-day limit I force myself to respect — no desire for Thai tax liability.',
      rating: 5,
      isVerified: false,
    },
    {
      authorName: 'Ingrid & Stefan M.',
      authorAge: 48,
      authorProfession: 'Lehrerin & Unternehmensberater',
      authorPersona: 'family',
      yearMoved: 2022,
      contentDE: 'Bangkok Patana ist wirklich gut — unsere Tochter (10) hat sich schnell integriert. Das Schulgeld (22.000 EUR/Jahr) ist hoch, aber wir sparen anderswo genug. Der Alltag in Sukhumvit ist sehr angenehm: Alles ist nah, die Healthcare bei Bumrungrad top. Einzige Schwierigkeit: das Thai-Einwanderungssystem ist nicht für Familien optimiert.',
      contentEN: 'Bangkok Patana is really good — our daughter (10) integrated quickly. The school fees (EUR 22,000/year) are high, but we save enough elsewhere. Daily life in Sukhumvit is very pleasant: everything is nearby, healthcare at Bumrungrad top. Only difficulty: the Thai immigration system is not optimised for families.',
      rating: 4,
      isVerified: false,
    },
    {
      authorName: 'Gerhard W.',
      authorAge: 62,
      authorProfession: 'Pensionierter Bauingenieur',
      authorPersona: 'retiree',
      yearMoved: 2020,
      contentDE: 'Mein Non-OA Retirement Visa verlängere ich jedes Jahr problemlos. Bangkok für Rentner ist sensationell günstig: Meine gesamten monatlichen Ausgaben betragen ca. 1.400 EUR — in Deutschland bräuchte ich das dreifache für denselben Komfort. Bumrungrad hat mir schon zweimal das Leben gerettet — zu 40 % des deutschen Preises.',
      contentEN: 'I renew my Non-OA Retirement Visa every year without problems. Bangkok for retirees is sensationally affordable: my total monthly expenses are approx. EUR 1,400 — in Germany I would need three times as much for the same comfort. Bumrungrad has already saved my life twice — at 40% of the German price.',
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

  console.log('\n✅ Bangkok premium seed complete. Districts:8 Narratives:5 Tools:2 Resources:5 Testimonials:3');
}

async function main() {
  await seedBangkok();
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
