import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();

const CITY_ID = 'cmpbrafd4001anrhv2xt65olq';
const NOW = new Date();
const SOURCE = 'idealista.com 2025';

export async function seedBarcelona() {
  console.log('🌍 Seeding Barcelona premium content...');

  // --- Districts ---
  console.log('\n📍 Creating districts...');
  const districts = [
    {
      slug: 'barcelona-eixample',
      nameDE: 'Eixample',
      nameEN: 'Eixample',
      descriptionDE: 'Octogonales Rasterquartier im Herzen Barcelonas — Gaudí-Architektur, breite Boulevards, zentral für alles.',
      descriptionEN: "Barcelona's iconic grid district — Gaudí architecture, wide boulevards, central for everything.",
      latitude: 41.3942, longitude: 2.1605, vibe: 'urban-modern', priceLevel: 4, sortOrder: 1,
      col: [
        { category: 'rent_3br_center', value: 1300, currency: 'EUR' },
        { category: 'rent_1br_center', value: 1700, currency: 'EUR' },
        { category: 'rent_2br_center', value: 2200, currency: 'EUR' },
      ],
    },
    {
      slug: 'barcelona-gracia',
      nameDE: 'Gràcia',
      nameEN: 'Gràcia',
      descriptionDE: 'Ehemaliges Dorf mit Dorfcharakter — lebendige Plätze, Bohème-Flair, beliebt bei Kreativen und jungen Familien.',
      descriptionEN: 'Former village with community feel — lively squares, bohemian vibe, popular with creatives and young families.',
      latitude: 41.4036, longitude: 2.1572, vibe: 'bohemian', priceLevel: 3, sortOrder: 2,
      col: [
        { category: 'rent_3br_center', value: 1050, currency: 'EUR' },
        { category: 'rent_1br_center', value: 1400, currency: 'EUR' },
        { category: 'rent_2br_center', value: 1850, currency: 'EUR' },
      ],
    },
    {
      slug: 'barcelona-poble-sec',
      nameDE: 'Poble Sec',
      nameEN: 'Poble Sec',
      descriptionDE: 'Aufstrebendes Quartier am Fuß von Montjuïc — Gastro-Szene an der Carrer de Blai, günstigere Mieten.',
      descriptionEN: 'Up-and-coming district at the foot of Montjuïc — great tapas scene on Carrer de Blai, more affordable rents.',
      latitude: 41.3726, longitude: 2.1588, vibe: 'trendy', priceLevel: 2, sortOrder: 3,
      col: [
        { category: 'rent_3br_center', value: 900, currency: 'EUR' },
        { category: 'rent_1br_center', value: 1200, currency: 'EUR' },
        { category: 'rent_2br_center', value: 1600, currency: 'EUR' },
      ],
    },
    {
      slug: 'barcelona-poblenou',
      nameDE: 'Poblenou / 22@',
      nameEN: 'Poblenou / 22@',
      descriptionDE: 'Ehemaliges Industrieviertel, heute Technologie-Hub 22@ — Startups, Co-Working, Strandnähe.',
      descriptionEN: 'Former industrial district turned tech hub 22@ — startups, co-working, close to the beach.',
      latitude: 41.4024, longitude: 2.2003, vibe: 'urban-modern', priceLevel: 3, sortOrder: 4,
      col: [
        { category: 'rent_3br_center', value: 1100, currency: 'EUR' },
        { category: 'rent_1br_center', value: 1500, currency: 'EUR' },
        { category: 'rent_2br_center', value: 1950, currency: 'EUR' },
      ],
    },
    {
      slug: 'barcelona-sarria-sant-gervasi',
      nameDE: 'Sarrià-Sant Gervasi',
      nameEN: 'Sarrià-Sant Gervasi',
      descriptionDE: 'Gehobener Stadtteil im Nordwesten — ruhig, grün, internationale Schulen, beliebt bei Familien.',
      descriptionEN: 'Upscale residential area in the northwest — quiet, green, international schools, popular with families.',
      latitude: 41.4063, longitude: 2.1311, vibe: 'suburban', priceLevel: 4, sortOrder: 5,
      col: [
        { category: 'rent_3br_center', value: 1200, currency: 'EUR' },
        { category: 'rent_1br_center', value: 1700, currency: 'EUR' },
        { category: 'rent_2br_center', value: 2400, currency: 'EUR' },
      ],
    },
    {
      slug: 'barcelona-sants-montjuic',
      nameDE: 'Sants-Montjuïc',
      nameEN: 'Sants-Montjuïc',
      descriptionDE: 'Großes Viertel rund um den Hauptbahnhof — günstigere Mieten, gute Anbindung, gewachsene Nachbarschaft.',
      descriptionEN: 'Large district around the main train station — affordable rents, great transport links, authentic neighbourhood.',
      latitude: 41.3716, longitude: 2.1434, vibe: 'authentic', priceLevel: 2, sortOrder: 6,
      col: [
        { category: 'rent_3br_center', value: 850, currency: 'EUR' },
        { category: 'rent_1br_center', value: 1150, currency: 'EUR' },
        { category: 'rent_2br_center', value: 1550, currency: 'EUR' },
      ],
    },
    {
      slug: 'barcelona-sant-marti',
      nameDE: 'Sant Martí',
      nameEN: 'Sant Martí',
      descriptionDE: 'Östlicher Bezirk mit Strand und Rambla del Poblenou — Mix aus Alteingesessenen und Expats.',
      descriptionEN: 'Eastern district with beaches and Rambla del Poblenou — mix of locals and expats.',
      latitude: 41.4099, longitude: 2.2046, vibe: 'mixed', priceLevel: 3, sortOrder: 7,
      col: [
        { category: 'rent_3br_center', value: 1000, currency: 'EUR' },
        { category: 'rent_1br_center', value: 1350, currency: 'EUR' },
        { category: 'rent_2br_center', value: 1800, currency: 'EUR' },
      ],
    },
    {
      slug: 'barcelona-badalona-hospitalet',
      nameDE: "Badalona / L'Hospitalet",
      nameEN: "Badalona / L'Hospitalet",
      descriptionDE: 'Günstigere Gemeinden direkt an Barcelona — Metro-Anschluss, deutlich niedrigere Mietpreise.',
      descriptionEN: 'More affordable municipalities adjacent to Barcelona — metro access, significantly lower rents.',
      latitude: 41.4500, longitude: 2.2474, vibe: 'suburban', priceLevel: 1, sortOrder: 8,
      col: [
        { category: 'rent_3br_center', value: 700, currency: 'EUR' },
        { category: 'rent_1br_center', value: 950, currency: 'EUR' },
        { category: 'rent_2br_center', value: 1300, currency: 'EUR' },
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
      titleDE: 'Barcelona als Wahlheimat: Sonne, Startup-Kultur und steuerliche Reize',
      titleEN: 'Barcelona as a New Home: Sun, Startup Culture and Tax Incentives',
      contentDE: `Barcelona verbindet mediterranes Lebensgefühl mit einer der dynamischsten Startup-Szenen Europas. Die Stadt zieht Expats mit mildem Klima (320 Sonnentage/Jahr), exzellenter Gastronomie und einem dichten Netz internationaler Schulen an — gleichzeitig ist sie mit dem Beckham-Gesetz (Ley Beckham) für viele Neuankömmlinge steuerlich besonders attraktiv.\n\nDer Wohnungsmarkt ist angespannt: Durchschnittsmieten im Eixample liegen bei 1.700 €/Monat für eine 1-Zimmer-Wohnung, in günstigeren Lagen wie Sants oder L'Hospitalet ab 950 €. Wichtig: Seit 2023 gilt in der Großregion eine Mietpreisbremse (Índex de Referència de Preus de Lloguer), die Mieten in angespannten Lagen reguliert.\n\nSpanisch und Katalanisch sind die Amtssprachen. Behördengänge laufen in der Regel auf Spanisch, teilweise auf Katalanisch — Grundkenntnisse beider Sprachen erleichtern den Alltag deutlich. Englisch reicht im Expat-Umfeld und im Tech-Sektor, für Behörden und Vermieter aber nicht immer aus.`,
      contentEN: `Barcelona combines Mediterranean lifestyle with one of Europe's most dynamic startup scenes. The city attracts expats with its mild climate (320 sunny days/year), excellent gastronomy and a dense network of international schools — while the Beckham Law (Ley Beckham) offers significant tax advantages for many new arrivals.\n\nThe housing market is tight: average rents in Eixample are around €1,700/month for a 1-bedroom flat, with more affordable options in Sants or L'Hospitalet from €950. Important: since 2023, a rent cap (Índex de Referència de Preus de Lloguer) applies in stressed areas.\n\nSpanish and Catalan are the official languages. Administrative processes run mostly in Spanish, sometimes in Catalan — basic knowledge of both makes daily life significantly easier. English works in the expat community and tech sector, but is often insufficient for authorities and landlords.`,
      sourceUrls: ['https://www.barcelona.cat/en/living-in-barcelona', 'https://www.aeat.es'],
      lastVerified: new Date('2025-10-01'),
    },
    {
      section: 'for_freelancers',
      titleDE: 'Selbstständig in Barcelona: Autónomo, Módulos und das Beckham-Gesetz',
      titleEN: 'Freelancing in Barcelona: Autónomo, Módulos and the Beckham Law',
      contentDE: `Als Selbstständiger in Spanien musst du dich als Autónomo bei der Seguridad Social (Sozialversicherung) anmelden. Seit 2023 gilt ein reformiertes System: Die monatliche Mindestbeitrag beträgt ca. 230 Euro (Einsteiger, erste 12 Monate Bonifikation: 80 Euro tarifa plana), steigt dann stufenweise je nach Nettoeinnahmen bis max. ca. 590 Euro/Monat.\n\nFür die Einkommensteuer (IRPF) wählen viele Freiberufler die Módulos-Methode (pauschale Schätzung nach Branche), was bei geringen tatsächlichen Gewinnen vorteilhaft sein kann. Alternativ: Estimación Directa (tatsächliche Gewinne).\n\nDas Beckham-Gesetz (Art. 93 LIRPF) ermöglicht unter bestimmten Voraussetzungen eine Flat Tax von 24 % auf spanische Einkünfte bis 600.000 Euro — auch für Selbstständige. Voraussetzung: kein spanischer Wohnsitz in den letzten 5 Jahren, Tätigkeit in Spanien auf Einladung eines spanischen Unternehmens oder als Fernarbeiter. Die Beantragung erfolgt über das Formular 149 bei der AEAT, innerhalb von 6 Monaten nach Registrierung.`,
      contentEN: `As a self-employed person in Spain, you must register as an Autónomo with the Seguridad Social. Since 2023, a reformed system applies: the monthly minimum contribution is approx. 230 EUR (beginners; first 12 months discount: 80 EUR tarifa plana), then increases in stages based on net income up to approx. 590 EUR/month.\n\nFor income tax (IRPF), many freelancers choose the Módulos method (flat-rate estimate by industry), which can be advantageous when actual profits are low. Alternatively: Estimación Directa (actual profits).\n\nThe Beckham Law (Art. 93 LIRPF) allows, under certain conditions, a flat tax of 24% on Spanish income up to 600,000 EUR — including for self-employed persons. Requirements: no Spanish residence in the last 5 years, activity in Spain at the invitation of a Spanish company or as a remote worker. Application is via Form 149 at AEAT, within 6 months of registration.`,
      sourceUrls: ['https://www.aeat.es', 'https://www.seg-social.es'],
      lastVerified: new Date('2025-10-01'),
    },
    {
      section: 'for_families',
      titleDE: 'Familienleben in Barcelona: Schulen, Empadronamiento und Kinderbetreuung',
      titleEN: 'Family Life in Barcelona: Schools, Empadronamiento and Childcare',
      contentDE: `Der erste behördliche Schritt für Familien ist die Empadronamiento — die Anmeldung im Einwohnerbüro des Stadtbezirks. Ohne Empadronamiento kein Zugang zu öffentlichen Schulen, kein Anspruch auf Gesundheitsversorgung via CatSalut, keine lokalen Sozialleistungen.\n\nInternationale Schulen sind in Sarria-Sant Gervasi und Pedralbes konzentriert: Deutsche Schule Barcelona (DSB), American School of Barcelona, British School of Barcelona und mehrere bilinguale Privatschulen. Jahresgebühren: 8.000–18.000 Euro. Öffentliche zweisprachige Schulen (Spanisch/Katalanisch) sind kostenlos, aber überbucht — Anmeldezeitraum März/April für das Folgejahr.\n\nKinderbetreuung (0–3 Jahre): Öffentliche Krippen (Llars d'infants municipals) kosten 200–500 Euro/Monat je nach Einkommen, private 600–1.200 Euro/Monat. Wartelisten sind lang — frühzeitig anmelden. Ab 3 Jahren ist Vorschule kostenlos und praktisch universell.`,
      contentEN: `The first administrative step for families is the Empadronamiento — registering at the district residents office. Without it: no access to public schools, no CatSalut health coverage, no local social benefits.\n\nInternational schools are concentrated in Sarria-Sant Gervasi and Pedralbes: Deutsche Schule Barcelona (DSB), American School of Barcelona, British School of Barcelona and several bilingual private schools. Annual fees: 8,000–18,000 EUR. Public bilingual schools (Spanish/Catalan) are free but oversubscribed — enrolment in March/April for the following year.\n\nChildcare (0–3 years): Public nurseries (Llars d'infants municipals) cost 200–500 EUR/month based on income, private ones 600–1,200 EUR/month. Waitlists are long — register early. From age 3, preschool is free and near-universal.`,
      sourceUrls: ['https://www.barcelona.cat/ca/viure-a_barcelona/empadronament', 'https://www.dsbarcelona.com'],
      lastVerified: new Date('2025-10-01'),
    },
    {
      section: 'for_retirees',
      titleDE: 'Ruhestand in Barcelona: Beckham-Gesetz, Non-Lucrative Visa und Steuern',
      titleEN: 'Retirement in Barcelona: Beckham Law, Non-Lucrative Visa and Taxes',
      contentDE: `Für EU-Bürger ist die Einreise nach Spanien ohne Visum möglich; nach 3 Monaten ist die Registrierung als EU-Bürger (Certificado de Registro de Ciudadano de la Unión) im zuständigen Ausländeramt Pflicht.\n\nNon-EU-Rentner benötigen ein Visum für nicht erwerbstätige Personen (Visado de residencia no lucrativa): Nachweis von min. 28.800 Euro/Jahr eigenem Einkommen (Rente, Kapital) plus ca. 7.200 Euro pro zusätzlichem Familienmitglied, Krankenversicherung, Unterkunftsnachweis, Strafregisterauszug.\n\nDas Beckham-Gesetz gilt unter Umständen auch für Rentner: Wer zum ersten Mal nach Spanien zieht, kann 24 % Flat Tax auf ausländische Renten und Kapitalerträge beantragen — besonders relevant für Deutsche mit hoher gesetzlicher Rente. Faustregel: Bei Rentenbeträgen über 45.000 Euro/Jahr lohnt sich ein Steuerberater-Vergleich zwischen Beckham und regulärem IRPF.`,
      contentEN: `EU citizens can enter Spain without a visa; after 3 months, registering as an EU citizen (Certificado de Registro de Ciudadano de la Union) at the local foreigners office is mandatory.\n\nNon-EU retirees need a non-lucrative residence visa (Visado de residencia no lucrativa): proof of at least 28,800 EUR/year of own income (pension, capital) plus approx. 7,200 EUR per additional family member, health insurance, proof of accommodation, criminal record certificate.\n\nThe Beckham Law may also apply to retirees: those moving to Spain for the first time can apply for a 24% flat tax on foreign pensions and capital income — particularly relevant for Germans with a high statutory pension. Rule of thumb: with pension income above 45,000 EUR/year, comparing Beckham vs regular IRPF with a tax adviser is worthwhile.`,
      sourceUrls: ['https://www.exteriores.gob.es', 'https://www.aeat.es'],
      lastVerified: new Date('2025-10-01'),
    },
    {
      section: 'for_tech_workers',
      titleDE: 'Tech-Szene Barcelona: 22@, Startups und internationale Arbeitgeber',
      titleEN: 'Tech Scene Barcelona: 22@, Startups and International Employers',
      contentDE: `Barcelonas Tech-Hub 22@ in Poblenou beherbergt über 1.500 Unternehmen — darunter Amazon, Glovo, King, Typeform, Wallapop und zahlreiche Scale-ups. Der Bezirk entstand aus dem Industrieviertel Poblenou und ist heute Sinnbild für Barcelonas Wandel zur Startup-Stadt.\n\nGehälter liegen im europäischen Mittelfeld: Senior Software Engineers verdienen 55.000–80.000 Euro brutto/Jahr, Product Manager 60.000–90.000 Euro. Im Vergleich zu London oder Amsterdam sind Gehälter niedriger, aber das Preis-Leistungs-Verhältnis beim Lebensstil ist ein starkes Argument.\n\nFür Fachkräfte aus Nicht-EU-Ländern wurde 2023 das Digital Nomad Visa (Visum für digitale Nomaden) eingeführt: Voraussetzung sind nachweisbare Einnahmen von min. 200 % des spanischen Mindestlohns (ca. 2.762 Euro/Monat in 2024), Tätigkeit für ausländische Arbeitgeber. Das Beckham-Gesetz ist kombinierbar.`,
      contentEN: `Barcelona's tech hub 22@ in Poblenou hosts over 1,500 companies — including Amazon, Glovo, King, Typeform, Wallapop and numerous scale-ups. The district grew from the Poblenou industrial area and now epitomises Barcelona's transformation into a startup city.\n\nSalaries are at European mid-range: Senior Software Engineers earn 55,000–80,000 EUR gross/year, Product Managers 60,000–90,000 EUR. Salaries are lower than London or Amsterdam, but the lifestyle value proposition is a strong argument.\n\nFor professionals from non-EU countries, the Digital Nomad Visa was introduced in 2023: requirements include verifiable income of at least 200% of the Spanish minimum wage (approx. 2,762 EUR/month in 2024), working for foreign employers. Combinable with the Beckham Law.`,
      sourceUrls: ['https://www.22barcelona.com', 'https://www.exteriores.gob.es'],
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
      toolType: 'beckham_law_checker',
      nameDE: 'Beckham-Gesetz Eignungscheck',
      nameEN: 'Beckham Law Eligibility Checker',
      descriptionDE: 'Prüfe in 4 Schritten, ob du das spanische Beckham-Gesetz (24 % Flat Tax) nutzen kannst.',
      descriptionEN: 'Check in 4 steps whether you can use the Spanish Beckham Law (24% flat tax).',
      config: {
        regime: 'BeckhamLaw',
        steps: ['no_spain_residence_5y', 'work_in_spain', 'salary_threshold', 'application_deadline'],
        flatTaxRate: 0.24,
        incomeThreshold: 600000,
        applicationFormUrl: 'https://sede.agenciatributaria.gob.es',
      },
      isActive: true,
    },
    {
      toolType: 'first_month_budget',
      nameDE: 'Erstes-Monat-Budget Barcelona',
      nameEN: 'First Month Budget Barcelona',
      descriptionDE: 'Schätze deine Anlaufkosten für den ersten Monat in Barcelona.',
      descriptionEN: 'Estimate your startup costs for the first month in Barcelona.',
      config: {
        currency: 'EUR',
        categories: [
          { key: 'deposit', labelDE: 'Mietkaution (2 Monatsmieten)', min: 1700, max: 3400 },
          { key: 'rent_first', labelDE: 'Erste Monatsmiete', min: 850, max: 2200 },
          { key: 'nie_gestor', labelDE: 'NIE + Gestor-Gebuehr', min: 150, max: 400 },
          { key: 'health_insurance', labelDE: 'Krankenversicherung (privat, 1 Monat)', min: 80, max: 200 },
          { key: 'furniture', labelDE: 'Grundausstattung (wenn unmoebliert)', min: 500, max: 2000 },
          { key: 'living', labelDE: 'Lebenshaltung Monat 1', min: 800, max: 1500 },
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
      titleDE: 'Erste-8-Wochen-Checkliste Barcelona',
      titleEN: 'First 8 Weeks Checklist Barcelona',
      descriptionDE: 'Schritt-fuer-Schritt-Plan fuer die Anmeldung in Barcelona.',
      descriptionEN: 'Step-by-step plan for registering in Barcelona.',
      content: {
        items: [
          { week: 1, task: 'NIE (Numero de Identificacion de Extranjero) beantragen — Extranjeria oder Konsulat' },
          { week: 1, task: 'Kurzzeitunterkunft buchen (1–4 Wochen)' },
          { week: 2, task: 'Spanisches Bankkonto eroeffnen (CaixaBank, BBVA, Sabadell, Revolut ES)' },
          { week: 2, task: 'Empadronamiento (Einwohneranmeldung) im Districte-Buero erledigen' },
          { week: 3, task: 'TIE (Tarjeta de Identidad de Extranjero) beantragen (Non-EU)' },
          { week: 3, task: 'Krankenversicherung abschliessen (privat oder CatSalut-Registrierung)' },
          { week: 4, task: 'Langfristige Wohnung suchen (Idealista, Habitaclia, Fotocasa)' },
          { week: 5, task: 'Beckham-Gesetz-Antrag (Formular 149) einreichen — Frist: 6 Monate nach Einreise' },
          { week: 6, task: 'Autonomo-Anmeldung (falls selbststaendig): Agencia Tributaria + Seguridad Social' },
          { week: 7, task: 'Schulanmeldung fuer Kinder (oeffentlich: beim Districte; international: direkt)' },
          { week: 8, task: 'Steuernummer / Beckham-Status bestaetigen lassen' },
        ],
      },
    },
    {
      resourceType: 'glossary',
      titleDE: 'Spanien-Glossar fuer Expats',
      titleEN: 'Spain Expat Glossary',
      descriptionDE: 'Die wichtigsten Behoerden, Dokumente und Begriffe fuer Neuankoemmlinge in Barcelona.',
      descriptionEN: 'Key authorities, documents and terms for newcomers in Barcelona.',
      content: {
        entries: [
          { term: 'NIE', definition: 'Numero de Identificacion de Extranjero — Auslaenderidentifikationsnummer, Pflicht fuer alle behoerdlichen und steuerlichen Vorgaenge' },
          { term: 'TIE', definition: 'Tarjeta de Identidad de Extranjero — Aufenthaltskarte fuer Nicht-EU-Buerger' },
          { term: 'Empadronamiento', definition: 'Einwohneranmeldung im Stadtteils-Buero — Voraussetzung fuer Schulen, Gesundheitsversorgung, viele Sozialleistungen' },
          { term: 'CatSalut', definition: 'Katalanisches Gesundheitssystem — Zugang nach Empadronamiento und Aufenthaltsgenehmigung' },
          { term: 'AEAT', definition: 'Agencia Estatal de Administracion Tributaria — spanisches Finanzamt' },
          { term: 'Ley Beckham', definition: 'Sondersteuerregime fuer Neuankoemmlinge: 24% Flat Tax auf Einkommen bis 600.000 EUR (Art. 93 LIRPF)' },
          { term: 'Autonomo', definition: 'Selbststaendigkeitsstatus in Spanien — Anmeldung bei AEAT und Seguridad Social erforderlich' },
          { term: 'Gestor', definition: 'Lizenzierter Verwaltungshelfer (aehnlich Steuerberater) — uebernimmt Behoerdengaenge und Antraege' },
          { term: 'Indice de Referencia', definition: 'Mietpreisindex Kataloniens — reguliert Neuvertragsmieten in angespannten Lagen seit 2023' },
        ],
      },
    },
    {
      resourceType: 'directory',
      titleDE: 'Wichtige Behoerden und Links Barcelona',
      titleEN: 'Key Authorities and Links Barcelona',
      descriptionDE: 'Direkte Links zu den wichtigsten Anlaufstellen fuer Expats in Barcelona.',
      descriptionEN: 'Direct links to the most important contact points for expats in Barcelona.',
      content: {
        links: [
          { name: 'AEAT (Finanzamt)', url: 'https://www.aeat.es', description: 'Steuernummer, Beckham-Antrag (Formular 149), Steuererklaerungen' },
          { name: 'Seguridad Social', url: 'https://www.seg-social.es', description: 'Autonomo-Anmeldung, Sozialversicherungsbeitraege' },
          { name: 'Ajuntament de Barcelona', url: 'https://www.barcelona.cat', description: 'Empadronamiento, Districte-Bueros, kommunale Dienste' },
          { name: 'CatSalut', url: 'https://catsalut.gencat.cat', description: 'Gesundheitskarte beantragen, CAP (hausaerztliches Zentrum) finden' },
          { name: 'Oficina de Extranjeria', url: 'https://www.interior.gob.es', description: 'NIE, TIE, EU-Registrierungszertifikat' },
          { name: 'Deutsche Schule Barcelona', url: 'https://www.dsbarcelona.com', description: 'Anmeldung, Jahrgangsstufen, Schulgeldinfo' },
          { name: 'Idealista Barcelona', url: 'https://www.idealista.com', description: 'Groesstes Wohnungsportal Spaniens' },
        ],
      },
    },
    {
      resourceType: 'checklist',
      titleDE: 'Beckham-Gesetz Antrags-Checkliste',
      titleEN: 'Beckham Law Application Checklist',
      descriptionDE: 'Was du fuer den Beckham-Gesetz-Antrag (Formular 149) brauchst.',
      descriptionEN: 'What you need for the Beckham Law application (Form 149).',
      content: {
        items: [
          { task: 'Formular 149 (AEAT-Website oder beim Gestor)' },
          { task: 'NIE oder TIE (Auslaenderidentifikationsnummer)' },
          { task: 'Reisepasskopie' },
          { task: 'Nachweis kein spanischer Wohnsitz in den letzten 5 Jahren (Meldebescheinigung DE)' },
          { task: 'Arbeitsvertrag mit spanischem Unternehmen ODER Nachweis Fernarbeitsvertrag + Auslandsarbeitgeber' },
          { task: 'Bei Selbststaendigen: Kontrakt/Auftrag mit spanischem Kunden oder Unternehmen' },
          { task: 'Frist: Antrag innerhalb von 6 Monaten nach erster Registrierung als Steuerpflichtiger in Spanien' },
          { task: 'Empfehlung: Gestor oder Steuerberater beauftragen (Kosten: 200–500 EUR)' },
        ],
      },
    },
    {
      resourceType: 'template',
      titleDE: 'Barcelona Wohnungssuche Bewerbungsvorlage',
      titleEN: 'Barcelona Flat Search Application Template',
      descriptionDE: 'Vorlage fuer die Wohnungsbewerbung auf Spanisch.',
      descriptionEN: 'Template for flat applications in Spanish.',
      content: {
        templateDE: 'Sehr geehrte/r Herr/Frau [Vermieter],\n\nich bewerbe mich auf Ihr Angebot fuer die Wohnung in [Adresse], [Stadtteil].\n\nIch bin [Beruf], [Nationalitaet], wohnhaft seit [Datum] in Barcelona. Mein monatliches Nettoeinkommen betraegt [Betrag] EUR. Ich bin bereit, folgende Unterlagen einzureichen:\n- Kopie NIE/TIE\n- Letzten 3 Gehaltsabrechnungen / Kontoauszuege\n- Arbeitsvertrag\n- Referenzschreiben (auf Anfrage)\n\nIch freue mich auf Ihre Rueckmeldung.\nMit freundlichen Gruessen,\n[Ihr Name]',
        templateES: 'Estimado/a Sr./Sra. [propietario/a],\n\nMe dirijo a usted para solicitar el piso ubicado en [direccion], [barrio].\n\nSoy [profesion], de nacionalidad [pais], residente en Barcelona desde [fecha]. Mis ingresos netos mensuales son de [importe] EUR. Adjunto la siguiente documentacion:\n- Copia del NIE/TIE\n- Ultimas 3 nominas / extractos bancarios\n- Contrato de trabajo\n- Carta de referencia (a peticion)\n\nQuedo a su disposicion para cualquier consulta.\nAtentamente,\n[Su nombre]',
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
      authorName: 'Stefan W.',
      authorAge: 34,
      authorProfession: 'Product Manager',
      authorPersona: 'employed',
      yearMoved: 2022,
      contentDE: 'Das Beckham-Gesetz hat meine Entscheidung fuer Barcelona gegenueber Amsterdam oder Lissabon besiegelt. 24 % Flat Tax und dann noch 320 Sonnentage — die Kalkulation war einfach. Die Empadronamiento lief in zwei Stunden, der NIE-Termin dauerte drei Wochen auf sich warten. Einmal durch den buerokratischen Huegel, laeuft es aber gut.',
      contentEN: 'The Beckham Law sealed my decision for Barcelona over Amsterdam or Lisbon. 24% flat tax and 320 sunny days — the calculation was simple. The Empadronamiento took two hours, the NIE appointment took three weeks to come through. Once past the bureaucratic hill, things run smoothly.',
      rating: 4,
      isVerified: false,
    },
    {
      authorName: 'Claudia & Marco R.',
      authorAge: 41,
      authorProfession: 'Aerztin & Architekt',
      authorPersona: 'family',
      yearMoved: 2021,
      contentDE: 'Mit zwei Kindern war die Schulwahl unser wichtigstes Thema. Die Deutsche Schule Barcelona ist teuer, aber der Uebergang war fuer die Kinder nahtlos. Sarria ist ruhig, gruen und trotzdem 20 Minuten vom Strand entfernt. Was uns ueberrascht hat: Wie viele Deutsche und Oesterreicher hier schon wohnen — unser Freundeskreis war nach 6 Monaten groesser als in Muenchen.',
      contentEN: 'With two children, school choice was our top priority. The Deutsche Schule Barcelona is expensive, but the transition was seamless for the kids. Sarria is quiet, green and still 20 minutes from the beach. What surprised us: how many Germans and Austrians already live here — our social circle was larger after 6 months than it was in Munich.',
      rating: 5,
      isVerified: false,
    },
    {
      authorName: 'Nina K.',
      authorAge: 29,
      authorProfession: 'UX Designerin Freelance',
      authorPersona: 'freelancer',
      yearMoved: 2023,
      contentDE: 'Als Freelancerin war der Autonomo-Prozess aufwendiger als gedacht. Mein Gestor hat das aber gut begleitet — ca. 350 EUR fuer alles inklusive Beckham-Antrag. Die tarifa plana (80 EUR/Monat) in den ersten Monaten hat mir den Start enorm erleichtert. Poblenou ist genau das richtige Viertel fuer mich: Co-Working, Strand, Nachbarschaft.',
      contentEN: 'As a freelancer, the Autonomo process was more involved than expected. My gestor handled it well — about 350 EUR for everything including the Beckham application. The tarifa plana (80 EUR/month) in the early months made starting out much easier. Poblenou is exactly the right neighbourhood for me: co-working, beach, community.',
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

  console.log('\n✅ Barcelona premium seed complete. Districts:8 Narratives:5 Tools:2 Resources:5 Testimonials:3');
}

async function main() {
  await seedBarcelona();
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
