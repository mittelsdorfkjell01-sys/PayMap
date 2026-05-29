/**
 * Sprint 9 — Rome Premium Content Seed
 * Pattern: 8 districts · 5 narratives · 2 tools · 5 resources · 3 testimonials
 * Run: npm run seed:premium:rom-premium (from packages/db)
 * Sources: agenziaentrate.gov.it, comune.roma.it, mymove.it, expats.it
 */
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../apps/nextjs/.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();
const NOW = new Date();
const CITY_ID = 'cmppu4gy90001gcuc1jbjt1ew';
const SOURCE = 'immobiliare.it 2025';

export async function seedRomPremium() {
  console.log('🌍 Seeding Rome premium content...');

  // --- Districts ---
  console.log('\n📍 Creating districts...');
  const districts = [
    {
      slug: 'rom-prati',
      nameDE: 'Prati',
      nameEN: 'Prati',
      descriptionDE: 'Bürgerliches Quartier nahe dem Vatikan — breite Boulevards, gute Infrastruktur, beliebt bei Expats und Diplomaten.',
      descriptionEN: 'Bourgeois neighbourhood near the Vatican — wide boulevards, good infrastructure, popular with expats and diplomats.',
      latitude: 41.9052, longitude: 12.4669, vibe: 'urban-modern', priceLevel: 4, sortOrder: 1,
      col: [
        { category: 'rent_3br_center', value: 1100, currency: 'EUR' },
        { category: 'rent_1br_center', value: 1500, currency: 'EUR' },
        { category: 'rent_2br_center', value: 2000, currency: 'EUR' },
      ],
    },
    {
      slug: 'rom-trastevere',
      nameDE: 'Trastevere',
      nameEN: 'Trastevere',
      descriptionDE: 'Charmantestes Viertel Roms — Kopfsteinpflaster, Piazze, lebhafte Restaurantszene, internationales Flair.',
      descriptionEN: "Rome's most charming neighbourhood — cobblestones, piazzas, lively restaurant scene, international flair.",
      latitude: 41.8891, longitude: 12.4689, vibe: 'bohemian', priceLevel: 4, sortOrder: 2,
      col: [
        { category: 'rent_3br_center', value: 1050, currency: 'EUR' },
        { category: 'rent_1br_center', value: 1400, currency: 'EUR' },
        { category: 'rent_2br_center', value: 1900, currency: 'EUR' },
      ],
    },
    {
      slug: 'rom-pigneto-prenestino',
      nameDE: 'Pigneto / Prenestino',
      nameEN: 'Pigneto / Prenestino',
      descriptionDE: 'Aufstrebendes Viertel im Osten — lebhafte Bar-Szene, Kreativ-Szene, günstigere Mieten.',
      descriptionEN: 'Up-and-coming eastern neighbourhood — lively bar scene, creative community, more affordable rents.',
      latitude: 41.8841, longitude: 12.5266, vibe: 'trendy', priceLevel: 2, sortOrder: 3,
      col: [
        { category: 'rent_3br_center', value: 750, currency: 'EUR' },
        { category: 'rent_1br_center', value: 1000, currency: 'EUR' },
        { category: 'rent_2br_center', value: 1350, currency: 'EUR' },
      ],
    },
    {
      slug: 'rom-eur',
      nameDE: 'EUR',
      nameEN: 'EUR',
      descriptionDE: 'Modernes Geschäftsviertel im Süden — internationale Unternehmen, FAO-Hauptsitz, ruhig und gut vernetzt.',
      descriptionEN: 'Modern business district in the south — international companies, FAO headquarters, quiet and well-connected.',
      latitude: 41.8320, longitude: 12.4698, vibe: 'urban-modern', priceLevel: 3, sortOrder: 4,
      col: [
        { category: 'rent_3br_center', value: 900, currency: 'EUR' },
        { category: 'rent_1br_center', value: 1200, currency: 'EUR' },
        { category: 'rent_2br_center', value: 1600, currency: 'EUR' },
      ],
    },
    {
      slug: 'rom-flaminio-parioli',
      nameDE: 'Flaminio / Parioli',
      nameEN: 'Flaminio / Parioli',
      descriptionDE: 'Gehobene Nordquartiere — Ambassaden, internationale Schulen, Villa Borghese in der Nähe.',
      descriptionEN: 'Upscale northern districts — embassies, international schools, Villa Borghese nearby.',
      latitude: 41.9283, longitude: 12.4748, vibe: 'suburban', priceLevel: 5, sortOrder: 5,
      col: [
        { category: 'rent_3br_center', value: 1200, currency: 'EUR' },
        { category: 'rent_1br_center', value: 1700, currency: 'EUR' },
        { category: 'rent_2br_center', value: 2400, currency: 'EUR' },
      ],
    },
    {
      slug: 'rom-testaccio-ostiense',
      nameDE: 'Testaccio / Ostiense',
      nameEN: 'Testaccio / Ostiense',
      descriptionDE: 'Authentisches Arbeiterviertel mit lebhafter Gastro-Szene und aufkommender Kreativ-Industrie.',
      descriptionEN: 'Authentic working-class neighbourhood with lively food scene and emerging creative industry.',
      latitude: 41.8767, longitude: 12.4773, vibe: 'authentic', priceLevel: 3, sortOrder: 6,
      col: [
        { category: 'rent_3br_center', value: 950, currency: 'EUR' },
        { category: 'rent_1br_center', value: 1250, currency: 'EUR' },
        { category: 'rent_2br_center', value: 1650, currency: 'EUR' },
      ],
    },
    {
      slug: 'rom-garbatella-ardeatino',
      nameDE: 'Garbatella / Ardeatino',
      nameEN: 'Garbatella / Ardeatino',
      descriptionDE: 'Charakterviertel im Süden — Borgo-Architektur, Gemeinschaftsgefühl, günstigere Mieten als Innenstadt.',
      descriptionEN: 'Character neighbourhood in the south — borgo architecture, community feel, more affordable than the centre.',
      latitude: 41.8609, longitude: 12.4813, vibe: 'authentic', priceLevel: 2, sortOrder: 7,
      col: [
        { category: 'rent_3br_center', value: 750, currency: 'EUR' },
        { category: 'rent_1br_center', value: 1000, currency: 'EUR' },
        { category: 'rent_2br_center', value: 1350, currency: 'EUR' },
      ],
    },
    {
      slug: 'rom-umland-castelli',
      nameDE: 'Castelli Romani (Umland)',
      nameEN: 'Castelli Romani (Surroundings)',
      descriptionDE: 'Weinberge und Villen vor den Toren Roms — deutlich günstigere Mieten, 30–45 Min. mit dem Zug ins Zentrum.',
      descriptionEN: 'Vineyards and villas on the outskirts of Rome — significantly cheaper rents, 30–45 min by train to the centre.',
      latitude: 41.7500, longitude: 12.6500, vibe: 'suburban', priceLevel: 1, sortOrder: 8,
      col: [
        { category: 'rent_3br_center', value: 550, currency: 'EUR' },
        { category: 'rent_1br_center', value: 750, currency: 'EUR' },
        { category: 'rent_2br_center', value: 1000, currency: 'EUR' },
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
      titleDE: 'Rom als Wahlheimat: Geschichte, Bürokratie und das Regime degli Impatriati',
      titleEN: 'Rome as a New Home: History, Bureaucracy and the Regime degli Impatriati',
      contentDE: `Rom zieht Expats mit einzigartiger Lebensqualität an — mediterranes Klima, Weltkulturerbe, internationale Institutionen (FAO, IFAD, WFP) und eine wachsende Tech-Szene. Gleichzeitig ist die Stadt bekannt für ihre Bürokratie: Behördenangelegenheiten erfordern Geduld und oft einen Commercialista (Steuerberater/Steuerberater).\n\nDer Wohnungsmarkt ist zweigeteilt: In Trastevere und Prati liegt die Durchschnittsmiete für eine 1-Zimmer-Wohnung bei 1.400–1.500 EUR/Monat, in neueren Vierteln wie EUR oder Pigneto deutlich günstiger. Unbefristete Mietverträge (contratto a canone libero, 4+4 Jahre) bieten Stabilität; kurzfristige Verträge (transitori) sind teurer.\n\nDas wichtigste Steuerregime für Neuankömmlinge ist das **Regime degli Impatriati** (Rientro dei Cervelli): 50 % der Einkünfte aus Arbeit und Selbstständigkeit sind für 5 Jahre steuerfrei — unter bestimmten Bedingungen sogar 90 % (bei Umzug in den Süden oder mit minderjährigen Kindern).`,
      contentEN: `Rome attracts expats with unique quality of life — Mediterranean climate, world heritage, international institutions (FAO, IFAD, WFP) and a growing tech scene. At the same time, the city is known for its bureaucracy: administrative matters require patience and often a Commercialista (accountant/tax adviser).\n\nThe housing market is two-tier: in Trastevere and Prati, average rents for a 1-bedroom flat are EUR 1,400–1,500/month, significantly cheaper in newer areas like EUR or Pigneto. Open-ended rental contracts (contratto a canone libero, 4+4 years) offer stability; short-term contracts (transitori) are more expensive.\n\nThe most important tax regime for newcomers is the Regime degli Impatriati (Return of Brains): 50% of employment and self-employment income is tax-free for 5 years — under certain conditions even 90% (when moving to the south or with minor children).`,
      sourceUrls: ['https://www.agenziaentrate.gov.it', 'https://www.comune.roma.it'],
      lastVerified: new Date('2025-10-01'),
    },
    {
      section: 'for_freelancers',
      titleDE: 'Selbstständig in Rom: Partita IVA, Forfettario und Impatriati',
      titleEN: 'Freelancing in Rome: Partita IVA, Forfettario and Impatriati',
      contentDE: `Selbstständige in Italien benötigen eine **Partita IVA** (Mehrwertsteuernummer / Unternehmens-ID). Die Anmeldung erfolgt beim Agenzia delle Entrate — möglich persönlich, online oder über einen Commercialista. Zusammen mit der Partita IVA wählt man das Steuerregime.\n\nFür Einsteiger und Kleinunternehmer besonders attraktiv: das **Regime Forfettario** (Pauschalbesteuerung). Voraussetzung: Jahresumsatz unter 85.000 EUR. Steuersatz: 15 % auf einen pauschalen Gewinnanteil (der nach Branche variiert), effektive Steuerbelastung oft 5–12 %. Neugründer zahlen in den ersten 5 Jahren sogar nur 5 % (Start-up-Bonus).\n\nKombination mit dem Impatriati-Regime: Möglich! Selbstständige mit Partita IVA können beide Regime kombinieren — 50 % der anrechenbaren Einkünfte werden von der Steuerbemessungsgrundlage ausgenommen, und auf den verbleibenden Teil gilt der Forfettario-Satz. Ein Commercialista ist hier unverzichtbar.`,
      contentEN: `Self-employed people in Italy need a Partita IVA (VAT number / business ID). Registration is at the Agenzia delle Entrate — possible in person, online or via a Commercialista. Together with the Partita IVA, you choose the tax regime.\n\nParticularly attractive for beginners and small businesses: the Regime Forfettario (flat-rate taxation). Requirements: annual turnover below EUR 85,000. Tax rate: 15% on a flat profit margin (which varies by sector), effective tax burden often 5–12%. New businesses pay only 5% in the first 5 years (start-up bonus).\n\nCombination with the Impatriati regime: Possible! Self-employed with Partita IVA can combine both regimes — 50% of eligible income is excluded from the tax base, and the Forfettario rate applies to the remainder. A Commercialista is essential here.`,
      sourceUrls: ['https://www.agenziaentrate.gov.it/portale/web/guest/partita-iva', 'https://www.fiscoetasse.com'],
      lastVerified: new Date('2025-10-01'),
    },
    {
      section: 'for_families',
      titleDE: 'Familienleben in Rom: Schulen, Residenza und Kindergeld',
      titleEN: 'Family Life in Rome: Schools, Residenza and Child Benefits',
      contentDE: `Der wichtigste erste Schritt für Familien in Rom ist die **Residenza** (Einwohneranmeldung) beim zuständigen Municipio. Ohne Residenza kein Zugang zu kommunalen Diensten, kein Recht auf Kindergartenplätze, keine Abonnements für öffentliche Verkehrsmittel.\n\n**Internationale Schulen** konzentrieren sich in den Nordvierteln (Flaminio, Parioli, Olgiata): Marymount International, Ambrit Rome (amerikanisch), Rome International School, Deutsche Schule Rom (EUR). Jahresgebühren: 8.000–22.000 EUR. Öffentliche Schulen sind kostenlos und mehrsprachige Sektionen (englisch/französisch) vorhanden.\n\n**Assegno Unico** (universelles Kindergeld): EU-Bürger und legale Nicht-EU-Residenten mit Residenza haben Anspruch ab dem 7. Schwangerschaftsmonat — 57–175 EUR/Kind/Monat je nach Einkommens-ISEE. Beantragung beim INPS (nationaler Sozialversicherungsträger).`,
      contentEN: `The most important first step for families in Rome is the Residenza (resident registration) at the local Municipio. Without Residenza: no access to municipal services, no right to kindergarten places, no public transport season tickets.\n\nInternational schools are concentrated in the northern districts (Flaminio, Parioli, Olgiata): Marymount International, Ambrit Rome (American), Rome International School, Deutsche Schule Rom (EUR). Annual fees: EUR 8,000–22,000. Public schools are free and multilingual sections (English/French) are available.\n\nAssegno Unico (universal child benefit): EU citizens and legal non-EU residents with Residenza are entitled from the 7th month of pregnancy — EUR 57–175/child/month depending on the ISEE income indicator. Application at INPS (national social security body).`,
      sourceUrls: ['https://www.comune.roma.it/web/it/residenza.page', 'https://www.inps.it/assegno-unico'],
      lastVerified: new Date('2025-10-01'),
    },
    {
      section: 'for_retirees',
      titleDE: 'Ruhestand in Rom: Steuerprivilegien, Elective Residency und Gesundheitsversorgung',
      titleEN: 'Retirement in Rome: Tax Privileges, Elective Residency and Healthcare',
      contentDE: `Italien bietet Rentnern aus dem Ausland mit dem **7%-Flat-Tax-Regime** (Art. 24-ter TUIR) eines der attraktivsten Steuerpaket Europas: Wer in bestimmte Südregionen oder Inseln zieht (Sizilien, Sardinien, Kalabrien, Basilikata, Kampanien, Abruzzen, Molise, Apulien — einschließlich einige Städte im Latium-Umland), zahlt auf ausländische Renten und Kapitalerträge nur 7 % Flat Tax für 10 Jahre. Rom selbst fällt nicht in dieses Regime, aber das Latium-Umland (z. B. Castelli Romani) oft schon.\n\nFür Rom direkt gilt das allgemeine **Regime degli Impatriati** (50 % Steuerfreistellung) — auch für Rentner mit ausländischer Rente und weitere Einnahmen aus Kapitalvermögen.\n\nEU-Bürger haben über die Residenza Zugang zum **SSN (Servizio Sanitario Nazionale)** — kostenfrei nach Anmeldung beim ASL. Non-EU-Rentner benötigen zunächst eine private Krankenversicherung oder zahlen den SSN-Beitrag als freiwillig Versicherte.`,
      contentEN: `Italy offers retirees from abroad with the 7% flat tax regime (Art. 24-ter TUIR) one of Europe's most attractive tax packages: those moving to certain southern regions or islands (Sicily, Sardinia, Calabria, Basilicata, Campania, Abruzzo, Molise, Puglia — including some towns in the Lazio hinterland) pay only 7% flat tax on foreign pensions and capital income for 10 years. Rome itself does not fall under this regime, but the Lazio surroundings (e.g. Castelli Romani) often do.\n\nFor Rome directly, the general Regime degli Impatriati applies (50% tax exemption) — including for retirees with foreign pensions and additional capital income.\n\nEU citizens access the SSN (Servizio Sanitario Nazionale) via Residenza — free after registration at the ASL. Non-EU retirees initially need private health insurance or pay the SSN contribution as voluntary members.`,
      sourceUrls: ['https://www.agenziaentrate.gov.it/portale/web/guest/schede/agevolazioni/regime-forfetario', 'https://www.salute.gov.it/portale/stranieri/ss'],
      lastVerified: new Date('2025-10-01'),
    },
    {
      section: 'for_tech_workers',
      titleDE: 'Tech-Szene Rom: Startups, FAO-Ökosystem und Digitale Nomaden',
      titleEN: 'Tech Scene Rome: Startups, FAO Ecosystem and Digital Nomads',
      contentDE: `Roms Tech-Szene ist kleiner als Mailand, wächst aber: Hauptcluster im EUR-Viertel (internationale Organisationen, IT-Unternehmen), in Ostiense (Startups, Maker-Szene) und zunehmend in Trastevere. Zu den bekannten Arbeitgebern zählen FAO, IFAD, WFP, Telecom Italia, Leonardo S.p.A. und eine Reihe wachsender Startups wie Satispay.\n\nGehälter im Tech-Sektor liegen deutlich unter dem EU-Schnitt: Senior Software Engineers verdienen 45.000–65.000 EUR brutto/Jahr, Product Manager 50.000–75.000 EUR. Das Impatriati-Regime macht Rom dennoch attraktiv: Nach 50 %-Freistellung sind die effektiven Steuersätze sehr konkurrenzfähig.\n\nFür Fernarbeiter und digitale Nomaden wurde 2022 das **Remote-Work-Visum** (Visto per lavoro autonomo) eingeführt. Voraussetzungen: Arbeitsvertrag mit ausländischem Unternehmen, nachweisbares Einkommen über 2.700 EUR/Monat, private Krankenversicherung. Das Regime degli Impatriati ist bei richtiger Gestaltung kombinierbar.`,
      contentEN: `Rome's tech scene is smaller than Milan but growing: main clusters in the EUR district (international organisations, IT companies), in Ostiense (startups, maker scene) and increasingly in Trastevere. Notable employers include FAO, IFAD, WFP, Telecom Italia, Leonardo S.p.A. and a range of growing startups like Satispay.\n\nTech sector salaries are significantly below the EU average: Senior Software Engineers earn EUR 45,000–65,000 gross/year, Product Managers EUR 50,000–75,000. The Impatriati regime nevertheless makes Rome attractive: after the 50% exemption, effective tax rates are very competitive.\n\nFor remote workers and digital nomads, a Remote Work Visa (Visto per lavoro autonomo) was introduced in 2022. Requirements: employment contract with a foreign company, demonstrable income above EUR 2,700/month, private health insurance. The Regime degli Impatriati can be combined with the right structure.`,
      sourceUrls: ['https://www.mise.gov.it', 'https://www.agenziaentrate.gov.it'],
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
      nameDE: 'Impatriati-Regime Eignungscheck',
      nameEN: 'Impatriati Regime Eligibility Checker',
      descriptionDE: 'Prüfe, ob du das Regime degli Impatriati (50 % Steuererlass) nutzen kannst.',
      descriptionEN: 'Check whether you can use the Regime degli Impatriati (50% tax exemption).',
      config: {
        regime: 'ImpatriatiItalia',
        exemptionRate: 0.50,
        duration: 5,
        extensionPossible: true,
        steps: ['no_italy_residence_2y', 'work_in_italy', 'commit_2y_stay'],
        bonusConditions: ['southern_region', 'minor_children'],
        bonusExemptionRate: 0.90,
        infoUrl: 'https://www.agenziaentrate.gov.it',
      },
      isActive: true,
    },
    {
      toolType: 'first_month_budget',
      nameDE: 'Erstes-Monat-Budget Rom',
      nameEN: 'First Month Budget Rome',
      descriptionDE: 'Schätze deine Anlaufkosten für den ersten Monat in Rom.',
      descriptionEN: 'Estimate your startup costs for the first month in Rome.',
      config: {
        currency: 'EUR',
        categories: [
          { key: 'deposit', labelDE: 'Mietkaution (2–3 Monatsmieten)', min: 2000, max: 4500 },
          { key: 'rent_first', labelDE: 'Erste Monatsmiete', min: 750, max: 1700 },
          { key: 'codice_fiscale', labelDE: 'Codice Fiscale + Commercialista Setup', min: 200, max: 600 },
          { key: 'health_insurance', labelDE: 'Krankenversicherung (bis SSN-Anmeldung)', min: 80, max: 250 },
          { key: 'furniture', labelDE: 'Grundausstattung (wenn unmoebliert)', min: 500, max: 2500 },
          { key: 'living', labelDE: 'Lebenshaltung Monat 1', min: 900, max: 1600 },
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
      titleDE: 'Erste-8-Wochen-Checkliste Rom',
      titleEN: 'First 8 Weeks Checklist Rome',
      descriptionDE: 'Schritt-fuer-Schritt-Plan fuer die Anmeldung in Rom.',
      descriptionEN: 'Step-by-step plan for registering in Rome.',
      content: {
        items: [
          { week: 1, task: 'Codice Fiscale beantragen — Agenzia delle Entrate oder Konsulat' },
          { week: 1, task: 'Kurzzeitunterkunft buchen (1–4 Wochen)' },
          { week: 2, task: 'Italienisches Bankkonto eroeffnen (UniCredit, Intesa Sanpaolo, Fineco, Revolut IT)' },
          { week: 2, task: 'Residenza (Einwohneranmeldung) beim zustaendigen Municipio anmelden' },
          { week: 3, task: 'Permesso di Soggiorno beantragen (Non-EU) — Questura, innerhalb 8 Tagen nach Einreise' },
          { week: 3, task: 'SSN-Anmeldung beim ASL (Gesundheitskarte / Tessera Sanitaria)' },
          { week: 4, task: 'Langfristige Wohnung suchen (Immobiliare.it, Casa.it, Idealista.it)' },
          { week: 5, task: 'Impatriati-Antrag stellen — Commercialista beauftragen, innerhalb 90 Tage nach erster Steuerpflicht' },
          { week: 6, task: 'Partita IVA anmelden (falls selbststaendig) bei Agenzia delle Entrate' },
          { week: 7, task: 'Schulanmeldung fuer Kinder beim Municipio' },
          { week: 8, task: 'SPID (Digitale Identitaet) beantragen — ermoeglicht Online-Zugang zu Behoerden' },
        ],
      },
    },
    {
      resourceType: 'glossary',
      titleDE: 'Italien-Glossar fuer Expats',
      titleEN: 'Italy Expat Glossary',
      descriptionDE: 'Die wichtigsten Behoerden, Dokumente und Begriffe fuer Neuankoemmlinge in Rom.',
      descriptionEN: 'Key authorities, documents and terms for newcomers in Rome.',
      content: {
        entries: [
          { term: 'Codice Fiscale', definition: 'Steuerliche Identifikationsnummer — Pflicht fuer alle Behoerden- und Vertragsvorgaenge in Italien' },
          { term: 'Residenza', definition: 'Einwohneranmeldung beim Municipio — Voraussetzung fuer SSN, Schulen, Kindergeld (Assegno Unico)' },
          { term: 'Permesso di Soggiorno', definition: 'Aufenthaltserlaubnis fuer Non-EU-Buerger — Antrag bei der Questura innerhalb 8 Tage nach Einreise' },
          { term: 'Agenzia delle Entrate', definition: 'Italienisches Finanzamt — Codice Fiscale, Partita IVA, Impatriati-Antrag' },
          { term: 'Partita IVA', definition: 'Mehrwertsteuernummer fuer Selbststaendige und Unternehmen in Italien' },
          { term: 'Commercialista', definition: 'Steuerberater/Buchhalter — in Italien unverzichtbar fuer Steuerpflichten, Partita IVA, Impatriati' },
          { term: 'Regime degli Impatriati', definition: '50 % Steuerfreistellung auf Arbeits- und Selbststaendigeneinkuenfte fuer 5 Jahre (Erweiterung moeglich)' },
          { term: 'Regime Forfettario', definition: 'Pauschalbesteuerung fuer Kleinunternehmer: 15 % Flat Tax auf Pauschalgewinn (5 % die ersten 5 Jahre)' },
          { term: 'SSN / ASL', definition: 'Servizio Sanitario Nazionale / Azienda Sanitaria Locale — kostenlose oeffentliche Gesundheitsversorgung nach Residenza' },
          { term: 'SPID', definition: 'Sistema Pubblico di Identita Digitale — digitale Identitaet fuer alle Online-Behoerdendienste in Italien' },
        ],
      },
    },
    {
      resourceType: 'directory',
      titleDE: 'Wichtige Behoerden und Links Rom',
      titleEN: 'Key Authorities and Links Rome',
      descriptionDE: 'Direkte Links zu den wichtigsten Anlaufstellen fuer Expats in Rom.',
      descriptionEN: 'Direct links to the most important contact points for expats in Rome.',
      content: {
        links: [
          { name: 'Agenzia delle Entrate', url: 'https://www.agenziaentrate.gov.it', description: 'Codice Fiscale, Partita IVA, Impatriati-Antrag, Steuererklaerung' },
          { name: 'Comune di Roma', url: 'https://www.comune.roma.it', description: 'Residenza, Municipio-Bueros, kommunale Dienste' },
          { name: 'INPS', url: 'https://www.inps.it', description: 'Assegno Unico (Kindergeld), Rentenauskunft, Sozialversicherung' },
          { name: 'Questura di Roma', url: 'https://questure.poliziadistato.it/Roma', description: 'Permesso di Soggiorno (Aufenthaltserlaubnis) Non-EU' },
          { name: 'Immobiliare.it', url: 'https://www.immobiliare.it/affitto/appartamenti/roma/', description: 'Groesstes Wohnungsportal Italiens — Mietangebote Rom' },
          { name: 'Deutsche Schule Rom', url: 'https://www.dsrom.it', description: 'Anmeldung, Jahrgangsstufen, Schulgeldinfo' },
          { name: 'SPID-Antrag', url: 'https://www.spid.gov.it', description: 'Digitale Identitaet fuer Online-Zugang zu Behoerden' },
        ],
      },
    },
    {
      resourceType: 'checklist',
      titleDE: 'Regime degli Impatriati Antrags-Checkliste',
      titleEN: 'Regime degli Impatriati Application Checklist',
      descriptionDE: 'Was du fuer den Impatriati-Antrag brauchst.',
      descriptionEN: 'What you need for the Impatriati application.',
      content: {
        items: [
          { task: 'Codice Fiscale (Steuer-ID)' },
          { task: 'Nachweis kein italienischer Wohnsitz in den letzten 2 Jahren (Meldebescheinigung DE)' },
          { task: 'Arbeitsvertrag mit italenischem Unternehmen ODER Partita IVA mit Auftraggeber in Italien' },
          { task: 'Selbstverpflichtungserklaerung: Wohnsitz in Italien fuer mind. 2 Jahre' },
          { task: 'Antrag via Commercialista — bevorzugt ueber elektronisches Formular bei Agenzia delle Entrate' },
          { task: 'Frist: Antrag spaetestens im ersten Steuerjahr der Rueckkehr / des Zuzugs einreichen' },
          { task: 'Bonus 90 % pruefen: Umzug in Suedregion oder Kinder unter 18 Jahren' },
          { task: 'Verlaengerung nach 5 Jahren moeglich: 5 weitere Jahre bei Kauf einer Immobilie oder Kindern in Italien' },
        ],
      },
    },
    {
      resourceType: 'template',
      titleDE: 'Rom Wohnungssuche Bewerbungsvorlage',
      titleEN: 'Rome Flat Search Application Template',
      descriptionDE: 'Vorlage fuer die Wohnungsbewerbung auf Italienisch.',
      descriptionEN: 'Template for flat applications in Italian.',
      content: {
        templateDE: 'Gentile Sig./Sig.ra [Proprietario/a],\n\nScrivo per candidarmi all\'appartamento in [indirizzo], [quartiere].\n\nSono [professione], di nazionalita [paese], residente a Roma dal [data]. Il mio reddito netto mensile e di [importo] EUR. Sono disponibile a fornire la seguente documentazione:\n- Copia del Codice Fiscale\n- Ultime 3 buste paga / estratti conto bancari\n- Contratto di lavoro\n- Lettera di referenza (su richiesta)\n\nResto a disposizione per qualsiasi informazione.\nDistinti saluti,\n[Nome e Cognome]',
        noteDE: 'Tipp: Codice Fiscale und Lohnzettel immer beilegen — Vermieter in Rom erwarten vollstaendige Dokumentation.',
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
      authorName: 'Markus T.',
      authorAge: 37,
      authorProfession: 'Software Engineer',
      authorPersona: 'employed',
      yearMoved: 2022,
      contentDE: 'Das Impatriati-Regime war der Hauptgrund fuer meinen Umzug nach Rom. Mit 50 % Steuerfreistellung kommt mein effektiver Steuersatz auf unter 20 % — das schlaegt jede andere europaeische Stadt. Mein Commercialista hat den Antrag in einer Woche erledigt. Die Buerokratie fuer die Residenza war aufwendiger, aber mit SPID laeuft inzwischen viel online.',
      contentEN: 'The Impatriati regime was the main reason for my move to Rome. With 50% tax exemption, my effective tax rate is under 20% — that beats any other European city. My Commercialista sorted the application in a week. The bureaucracy for Residenza was more involved, but SPID means a lot runs online now.',
      rating: 5,
      isVerified: false,
    },
    {
      authorName: 'Franziska & Thomas B.',
      authorAge: 43,
      authorProfession: 'Unternehmensberaterin & Journalist',
      authorPersona: 'family',
      yearMoved: 2020,
      contentDE: 'Wir leben in Parioli — ruhig, gruen, nahe der Deutschen Schule. Das Impatriati-Regime haben wir beide in Anspruch genommen: Ich als Angestellte, mein Mann als Freelancer mit Partita IVA. Die Kombination Forfettario + Impatriati ist sehr clever, aber ohne Commercialista nicht zu empfehlen. Rom ist keine Stadt fuer Selbstmacher bei der Buerokratie.',
      contentEN: 'We live in Parioli — quiet, green, close to the Deutsche Schule. We both used the Impatriati regime: me as an employee, my husband as a freelancer with Partita IVA. The Forfettario + Impatriati combination is very clever, but not recommended without a Commercialista. Rome is not a city for DIY bureaucracy.',
      rating: 4,
      isVerified: false,
    },
    {
      authorName: 'Ingrid S.',
      authorAge: 62,
      authorProfession: 'Rentnerin',
      authorPersona: 'retiree',
      yearMoved: 2023,
      contentDE: 'Ich wohne in den Castelli Romani — 35 Minuten mit dem Zug nach Rom, aber ein Bruchteil der Miete. Das 7%-Flat-Tax-Regime gilt fuer die Gemeinde hier. Meine deutsche Rente wird mit 7 % besteuert, nicht mit dem deutschen Grenzsteuersatz. Mein Bruder in Muenchen zahlt das Dreifache. Der SSN funktioniert gut, fuer Facharzttermine plane ich aber voraus.',
      contentEN: 'I live in the Castelli Romani — 35 minutes by train to Rome, but a fraction of the rent. The 7% flat tax regime applies to my municipality here. My German pension is taxed at 7%, not the German marginal rate. My brother in Munich pays three times as much. The SSN works well, but I plan ahead for specialist appointments.',
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

  console.log('\n✅ Rome premium seed complete. Districts:8 Narratives:5 Tools:2 Resources:5 Testimonials:3');
}

async function main() {
  await seedRomPremium();
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
