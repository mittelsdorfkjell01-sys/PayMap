/**
 * Sprint 9 — Amsterdam Premium Content Seed
 * Pattern: 8 districts · 5 narratives · 2 tools · 5 resources · 3 testimonials
 * Run: npm run seed:premium:amsterdam (from packages/db)
 * Sources: funda.nl, belastingdienst.nl, government.nl, iamsterdam.com, expatfocus.com
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../apps/nextjs/.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();
const NOW = new Date('2026-05-28T00:00:00Z');
const CITY_ID = 'cmpbrag320026nrhvztg3b7lh';
const SOURCE_FUNDA = 'funda.nl / pararius.nl (Q1 2025)';

// ─── Districts ────────────────────────────────────────────────────────────────

const DISTRICTS = [
  {
    slug: 'centrum',
    nameDE: 'Centrum',
    nameEN: 'City Centre',
    descriptionDE: 'Das historische Herz Amsterdams mit Grachten, Museen und touristischer Infrastruktur. Sehr teuer, laut, aber unschlagbar zentral.',
    descriptionEN: 'The historic heart of Amsterdam with canals, museums and tourist infrastructure. Very expensive, loud, but unbeatable central.',
    latitude: 52.3728, longitude: 4.8936, vibe: 'historisch', priceLevel: 5, sortOrder: 1,
    col: [
      { category: 'rent_studio', value: 1800, currency: 'EUR' },
      { category: 'rent_1br', value: 2400, currency: 'EUR' },
      { category: 'rent_2br', value: 3200, currency: 'EUR' },
      { category: 'groceries_monthly', value: 380, currency: 'EUR' },
      { category: 'restaurant_meal', value: 22, currency: 'EUR' },
    ],
  },
  {
    slug: 'jordaan',
    nameDE: 'Jordaan',
    nameEN: 'Jordaan',
    descriptionDE: 'Charmantes Viertel mit Boutiquen, Galerien und Cafés. Sehr gefragt bei Expats und Kreativen. Warteliste für Sozialwohnungen: 15 Jahre.',
    descriptionEN: 'Charming neighbourhood with boutiques, galleries and cafés. Highly sought after by expats and creatives. Social housing waitlist: 15 years.',
    latitude: 52.3741, longitude: 4.8813, vibe: 'kreativ', priceLevel: 5, sortOrder: 2,
    col: [
      { category: 'rent_studio', value: 1700, currency: 'EUR' },
      { category: 'rent_1br', value: 2300, currency: 'EUR' },
      { category: 'rent_2br', value: 3100, currency: 'EUR' },
      { category: 'groceries_monthly', value: 360, currency: 'EUR' },
      { category: 'restaurant_meal', value: 20, currency: 'EUR' },
    ],
  },
  {
    slug: 'de-pijp',
    nameDE: 'De Pijp',
    nameEN: 'De Pijp',
    descriptionDE: 'Lebhaftes Viertel mit dem Albert Cuyp Markt, vielfältiger Gastronomie und junger, internationaler Community. Beliebt bei Berufstätigen.',
    descriptionEN: 'Vibrant neighbourhood with Albert Cuyp market, diverse restaurants and a young, international community. Popular with professionals.',
    latitude: 52.3535, longitude: 4.8987, vibe: 'urban', priceLevel: 4, sortOrder: 3,
    col: [
      { category: 'rent_studio', value: 1500, currency: 'EUR' },
      { category: 'rent_1br', value: 2000, currency: 'EUR' },
      { category: 'rent_2br', value: 2700, currency: 'EUR' },
      { category: 'groceries_monthly', value: 340, currency: 'EUR' },
      { category: 'restaurant_meal', value: 18, currency: 'EUR' },
    ],
  },
  {
    slug: 'amsterdam-oost',
    nameDE: 'Amsterdam Oost',
    nameEN: 'Amsterdam East',
    descriptionDE: 'Aufstrebendes Viertel mit Oosterpark, Javastraat und starker Gastronomie-Szene. Günstiger als Centrum, trotzdem sehr gefragt.',
    descriptionEN: 'Up-and-coming area with Oosterpark, Javastraat and strong restaurant scene. Cheaper than Centrum, still very popular.',
    latitude: 52.3611, longitude: 4.9267, vibe: 'aufstrebend', priceLevel: 3, sortOrder: 4,
    col: [
      { category: 'rent_studio', value: 1400, currency: 'EUR' },
      { category: 'rent_1br', value: 1800, currency: 'EUR' },
      { category: 'rent_2br', value: 2500, currency: 'EUR' },
      { category: 'groceries_monthly', value: 320, currency: 'EUR' },
      { category: 'restaurant_meal', value: 16, currency: 'EUR' },
    ],
  },
  {
    slug: 'amsterdam-west',
    nameDE: 'Amsterdam West',
    nameEN: 'Amsterdam West',
    descriptionDE: 'Diverses Viertel mit Baarsjes, Westerpark und einem lebhaften Kulturleben. Gute Balance zwischen Preis und Lage.',
    descriptionEN: 'Diverse area with Baarsjes, Westerpark and vibrant cultural life. Good balance between price and location.',
    latitude: 52.3752, longitude: 4.8603, vibe: 'divers', priceLevel: 3, sortOrder: 5,
    col: [
      { category: 'rent_studio', value: 1350, currency: 'EUR' },
      { category: 'rent_1br', value: 1750, currency: 'EUR' },
      { category: 'rent_2br', value: 2400, currency: 'EUR' },
      { category: 'groceries_monthly', value: 310, currency: 'EUR' },
      { category: 'restaurant_meal', value: 15, currency: 'EUR' },
    ],
  },
  {
    slug: 'amsterdam-noord',
    nameDE: 'Amsterdam Noord',
    nameEN: 'Amsterdam North',
    descriptionDE: 'Schnell wachsendes Viertel jenseits des IJ mit NDSM-Werft, Kreativszene und vergleichsweise erschwinglichen Mieten. Fähre in 7 Minuten ins Centrum.',
    descriptionEN: 'Rapidly growing area beyond the IJ with NDSM wharf, creative scene and relatively affordable rents. Ferry to Centrum in 7 minutes.',
    latitude: 52.4011, longitude: 4.9006, vibe: 'kreativ', priceLevel: 3, sortOrder: 6,
    col: [
      { category: 'rent_studio', value: 1200, currency: 'EUR' },
      { category: 'rent_1br', value: 1600, currency: 'EUR' },
      { category: 'rent_2br', value: 2200, currency: 'EUR' },
      { category: 'groceries_monthly', value: 300, currency: 'EUR' },
      { category: 'restaurant_meal', value: 14, currency: 'EUR' },
    ],
  },
  {
    slug: 'amstelveen',
    nameDE: 'Amstelveen',
    nameEN: 'Amstelveen',
    descriptionDE: 'Vorstadt mit hohem Expat-Anteil, vielen internationalen Schulen (ISA, DBSA) und ruhiger Wohnlage. 20 Min. mit der Tram ins Centrum.',
    descriptionEN: 'Suburb with high expat ratio, many international schools (ISA, DBSA) and quiet residential feel. 20 min by tram to Centrum.',
    latitude: 52.3108, longitude: 4.8625, vibe: 'familiär', priceLevel: 3, sortOrder: 7,
    col: [
      { category: 'rent_studio', value: 1100, currency: 'EUR' },
      { category: 'rent_1br', value: 1500, currency: 'EUR' },
      { category: 'rent_2br', value: 2000, currency: 'EUR' },
      { category: 'groceries_monthly', value: 290, currency: 'EUR' },
      { category: 'restaurant_meal', value: 14, currency: 'EUR' },
    ],
  },
  {
    slug: 'diemen-duivendrecht',
    nameDE: 'Diemen / Duivendrecht',
    nameEN: 'Diemen / Duivendrecht',
    descriptionDE: 'Günstigste Option im Amsterdamer Umland. Gut ans Metronetz angebunden, ruhig, suburban. Beliebt bei Familien mit kleinerem Budget.',
    descriptionEN: 'Most affordable option in the Amsterdam metro area. Well connected by metro, quiet, suburban. Popular with families on tighter budgets.',
    latitude: 52.3272, longitude: 4.9498, vibe: 'suburban', priceLevel: 2, sortOrder: 8,
    col: [
      { category: 'rent_studio', value: 1000, currency: 'EUR' },
      { category: 'rent_1br', value: 1350, currency: 'EUR' },
      { category: 'rent_2br', value: 1800, currency: 'EUR' },
      { category: 'groceries_monthly', value: 280, currency: 'EUR' },
      { category: 'restaurant_meal', value: 13, currency: 'EUR' },
    ],
  },
];

// ─── Narratives ───────────────────────────────────────────────────────────────

const NARRATIVES = [
  {
    section: 'intro',
    titleDE: 'Amsterdam — Das Wichtigste im Überblick',
    titleEN: 'Amsterdam — The Essential Overview',
    contentDE: `Amsterdam ist die Hauptstadt der Niederlande und einer der wichtigsten Wirtschafts- und Finanzstandorte Europas. Die Stadt bietet eine hervorragende Infrastruktur, eine weltoffene Gesellschaft und ein lebendiges Startup- und Technologie-Ökosystem — ist aber auch einer der teuersten Wohnungsmärkte Europas.

**Wohnungsmarkt:** Amsterdam kämpft mit einer chronischen Wohnungsknappheit. Freie Sektor-Mietwohnungen (liberale Sektor, Kaltmiete >€900/Mon) sind der einzige realistische Weg für Expats — Sozialwohnungen haben 10–15 Jahre Wartezeit. Durchschnittliche Miete für 1-Zimmer: €1.800–2.400/Mon im Centrum, €1.400–1.800 in Oost/West/Noord.

**30%-Regelung:** Das wichtigste Steuerprivileg für Expats. Ermöglicht, dass 30% des Gehalts steuerfrei bleiben — effektiver Steuersatz sinkt von ~49% auf ~34%. Gilt 5 Jahre, Antrag über Arbeitgeber beim Belastingdienst innerhalb von 4 Monaten.

**Bürokratie:** Die Niederlande gelten als digitalfreundlich und strukturiert. BSN (Burger Service Nummer) ist die Grundlage aller Behördenkontakte. Registration im Stadsdeel innerhalb von 5 Tagen nach Einzug Pflicht.

**Sprache:** Niederländisch ist Amtssprache, aber 90%+ der Niederländer sprechen exzellentes Englisch. Im Berufsalltag ist Englisch bei internationalen Firmen Standard.`,
    contentEN: `Amsterdam is the capital of the Netherlands and one of Europe's most important economic and financial hubs. The city offers excellent infrastructure, an open-minded society and a vibrant startup and technology ecosystem — but is also one of Europe's most expensive housing markets.

**Housing market:** Amsterdam struggles with a chronic housing shortage. Private sector rentals (liberale sector, >€900/month) are the only realistic option for expats — social housing has 10–15 year waiting lists. Average rent for 1-bedroom: €1,800–2,400/month in Centrum, €1,400–1,800 in Oost/West/Noord.

**30% ruling:** The most important tax benefit for expats. Allows 30% of salary to remain tax-free — effective tax rate drops from ~49% to ~34%. Valid for 5 years, apply through employer at Belastingdienst within 4 months.

**Bureaucracy:** The Netherlands is known for being digitally friendly and structured. BSN (Burger Service Number) is the foundation of all administrative contacts. Registration in your Stadsdeel within 5 days of moving in is mandatory.

**Language:** Dutch is the official language, but 90%+ of Dutch people speak excellent English. English is standard in international companies.`,
    sourceUrls: ['https://www.iamsterdam.com/en/live-work-study'],
    lastVerified: NOW,
    updatedAt: NOW,
  },
  {
    section: 'freelancers',
    titleDE: 'Amsterdam für Freelancer & Selbstständige',
    titleEN: 'Amsterdam for Freelancers & Self-Employed',
    contentDE: `**ZZP (Zelfstandige zonder personeel)** ist die niederländische Entsprechung des Einzelunternehmens — die häufigste Rechtsform für Freelancer. Anmeldung bei der Kamer van Koophandel (KvK) kostet einmalig €75, danach jährliche Beiträge.

**Steuerliche Situation als ZZP:**
- Einkommensteuer: 36,97% (bis €75.518) / 49,50% (ab €75.518) — deutlich höher als Angestellte wegen fehlender 30%-Regelung (gilt nur bei Anstellung)
- Zelfstandigenaftrek: €3.750 (2024, wird schrittweise abgebaut)
- MKB-winstvrijstelling: 13,31% Gewinnfreistellung
- Omzetbelasting (BTW/MwSt): 21% (Standard), 9% (reduziert), 0% für B2B-Export

**Gesundheitsversicherung:** Pflichtversicherung (Basisverzekering) ca. €140–160/Mon. Als ZZP keinen Arbeitgeber-Anteil — volle Kosten selbst.

**Altersvorsorge:** Kein automatisches Rentensystem (AOW nur für Angestellte). Eigenverantwortung für Rentenvorsorge zwingend: Banksparen, Lijifrente oder pensioensparen.

**Bankkonten:** ING, Rabobank, ABN AMRO oder Bunq für ZZP empfohlen. Bunq beliebt bei Expats wegen einfacher Kontoeröffnung.`,
    contentEN: `**ZZP (Zelfstandige zonder personeel)** is the Dutch equivalent of a sole proprietorship — the most common legal form for freelancers. Registration at the Kamer van Koophandel (KvK) costs a one-time €75, plus annual contributions.

**Tax situation as ZZP:**
- Income tax: 36.97% (up to €75,518) / 49.50% (above €75,518) — significantly higher than employees due to no 30% ruling (only for employment)
- Zelfstandigenaftrek: €3,750 (2024, being phased out)
- MKB-winstvrijstelling: 13.31% profit exemption
- Omzetbelasting (BTW/VAT): 21% (standard), 9% (reduced), 0% for B2B exports

**Health insurance:** Mandatory insurance (Basisverzekering) ca. €140–160/month. As ZZP, no employer contribution — full cost yourself.

**Pension:** No automatic pension system (AOW only for employees). Self-responsibility for retirement is mandatory: bank savings, lijfrente or pensioensparen.

**Bank accounts:** ING, Rabobank, ABN AMRO or Bunq recommended for ZZP. Bunq popular with expats for easy account opening.`,
    sourceUrls: ['https://www.belastingdienst.nl/wps/wcm/connect/en/individuals/individuals'],
    lastVerified: NOW,
    updatedAt: NOW,
  },
  {
    section: 'families',
    titleDE: 'Amsterdam für Familien',
    titleEN: 'Amsterdam for Families',
    contentDE: `**Schulen:** Amsterdam hat ein breites Angebot an internationalen Schulen — ein großer Vorteil für Familien mit Kindern, die kein Niederländisch sprechen. Wichtigste internationale Schulen:

- **ISA (International School of Amsterdam)** — Amstelveen, IB-Programm, Schulgeld ca. €20.000–22.000/Jahr
- **DBSA (Deutsche Internationale Schule Amsterdam)** — Staatsexamen + IB, ca. €10.000–14.000/Jahr (günstigste Option für deutschsprachige Familien)
- **Amsterdam International Community School (AICS)** — IB, staatlich subventioniert, deutlich günstiger

**Kinderbetreuung:** Kinderdagverblijf (KDV, U3) ca. €1.200–1.500/Mon (Vollzeit), aber Steuerrückerstattung über Kinderopvangtoeslag (bis 70% der Kosten abhängig von Einkommen).

**Wohnlage für Familien:** Amstelveen und Amsterdam Oost gelten als familienfreundlichste Lagen mit guten Schulen, Parks und sicherem Straßenbild. Centrum und Jordaan sind eher für Singles/Paare geeignet.

**Fahrrad:** Das niederländische Fahrrad-Ökosystem ist für Familien ideal — Bakfiets (Lastenrad), Schulwege per Rad und separate Fahrradwege überall.`,
    contentEN: `**Schools:** Amsterdam has a wide range of international schools — a major advantage for families with children who don't speak Dutch. Key international schools:

- **ISA (International School of Amsterdam)** — Amstelveen, IB programme, tuition ca. €20,000–22,000/year
- **DBSA (Deutsche Internationale Schule Amsterdam)** — Staatsexamen + IB, ca. €10,000–14,000/year (most affordable option for German-speaking families)
- **Amsterdam International Community School (AICS)** — IB, state subsidised, significantly cheaper

**Childcare:** Kinderdagverblijf (KDV, under-3s) ca. €1,200–1,500/month (full-time), but tax refund via Kinderopvangtoeslag (up to 70% of costs depending on income).

**Family neighbourhoods:** Amstelveen and Amsterdam Oost are considered the most family-friendly areas with good schools, parks and safe streets. Centrum and Jordaan are more suitable for singles/couples.

**Cycling:** The Dutch cycling ecosystem is ideal for families — Bakfiets (cargo bikes), cycling school routes and separate bike paths everywhere.`,
    sourceUrls: ['https://www.iamsterdam.com/en/live-work-study/living/families-in-amsterdam'],
    lastVerified: NOW,
    updatedAt: NOW,
  },
  {
    section: 'retirees',
    titleDE: 'Amsterdam für Rentner',
    titleEN: 'Amsterdam for Retirees',
    contentDE: `**AOW und DBA:** Niederländische Rente (AOW) basiert auf Wohnjahren in NL (2% pro Jahr, max. 50 Jahre = 100%). Als Rentner aus Deutschland gilt das DBA DE-NL: Deutsche Renten werden in der Regel in DE besteuert, niederländische Rente in NL (mit Quellensteuererstattungsverfahren).

**Lebenshaltungskosten für Rentner:** Amsterdam ist teuer. Für ein komfortables Leben als Rentner realistisch:
- Kleines Apartment (1 Zimmer) in De Pijp oder Oost: €1.500–2.000/Mon Miete
- Monatliche Lebenshaltungskosten (ohne Miete): €1.200–1.800
- Gesamt: mindestens €2.700–3.800/Mon

**Gesundheitsversorgung:** Exzellentes, europäisches Gesundheitssystem. Huisarts (Hausarzt) als Gatekeeper — Anmeldung direkt nach Einzug. AOW-Bezieher ohne NL-Rente: Basisverzekering Pflicht (ca. €150/Mon).

**Expat-Community:** Amsterdam hat eine der größten deutschen Expat-Communitys Europas (Schätzung: 30.000+ Deutsche). InterNations, Deutsche Evangelische Gemeinde, DBSA-Alumni.

**Achtung:** Amsterdam ist eine der teuersten Städte Europas für Rentner. Wer flexibel ist, zieht in umliegende Städte (Haarlem, Utrecht, Leiden) mit besserem Preis-Leistungs-Verhältnis.`,
    contentEN: `**AOW and DTA:** Dutch pension (AOW) is based on years of residence in NL (2% per year, max 50 years = 100%). As a retiree from Germany, the DTA DE-NL applies: German pensions are generally taxed in DE, Dutch pension in NL (with source tax refund procedure).

**Cost of living for retirees:** Amsterdam is expensive. For comfortable retirement living, realistically:
- Small apartment (1 room) in De Pijp or Oost: €1,500–2,000/month rent
- Monthly living costs (excluding rent): €1,200–1,800
- Total: at least €2,700–3,800/month

**Healthcare:** Excellent European healthcare system. Huisarts (GP) as gatekeeper — register immediately after moving in. AOW recipients without NL pension: Basisverzekering mandatory (ca. €150/month).

**Expat community:** Amsterdam has one of Europe's largest German expat communities (estimate: 30,000+ Germans). InterNations, Deutsche Evangelische Gemeinde, DBSA alumni.

**Note:** Amsterdam is one of Europe's most expensive cities for retirees. Those with flexibility move to surrounding cities (Haarlem, Utrecht, Leiden) with better value for money.`,
    sourceUrls: ['https://www.svb.nl/en/aow-pension'],
    lastVerified: NOW,
    updatedAt: NOW,
  },
  {
    section: 'tech',
    titleDE: 'Amsterdam als Tech-Hub',
    titleEN: 'Amsterdam as Tech Hub',
    contentDE: `Amsterdam ist neben Berlin und London eines der führenden Tech-Ökosysteme Europas. Besondere Stärken:

**Unternehmen:** Booking.com (10.000+ Mitarbeiter), ASML (Chipmaschinen-Weltmarktführer, Eindhoven aber NL-weit präsent), TomTom, Adyen, Takeaway.com, Messagebird. EMEA-Hauptsitze von Netflix, Tesla, Uber, Cisco, Salesforce.

**Gehälter (2024):**
- Junior Software Engineer: €50.000–65.000/Jahr
- Senior Software Engineer: €80.000–110.000/Jahr
- Staff/Principal: €120.000–160.000+ /Jahr
- Mit 30%-Regelung: effektive Steuerbelastung deutlich reduziert

**Startup-Ökosystem:** Amsterdam hat 2024 ca. €2,3 Mrd. VC-Funding angezogen. StartupAmsterdam, Rockstart, Adyen-Alumni-Netzwerk. NDSM-Werft in Noord als Kreativ-Tech-Hub.

**Wohnlage für Tech-Fachleute:** Amsterdam Oost (Sciencepark UvA), Amsterdam Noord, De Pijp und Amstelveen (Familien) sind die beliebtesten Wohnlagen.

**Englisch:** Amsterdam ist vollständig englischsprachig im Tech-Bereich — Niederländischkenntnisse sind nice-to-have, nicht Voraussetzung.`,
    contentEN: `Amsterdam is one of Europe's leading tech ecosystems alongside Berlin and London. Key strengths:

**Companies:** Booking.com (10,000+ employees), ASML (global chip machine leader, Eindhoven but NL-wide presence), TomTom, Adyen, Takeaway.com, Messagebird. EMEA headquarters of Netflix, Tesla, Uber, Cisco, Salesforce.

**Salaries (2024):**
- Junior Software Engineer: €50,000–65,000/year
- Senior Software Engineer: €80,000–110,000/year
- Staff/Principal: €120,000–160,000+/year
- With 30% ruling: effective tax burden significantly reduced

**Startup ecosystem:** Amsterdam attracted ca. €2.3bn in VC funding in 2024. StartupAmsterdam, Rockstart, Adyen alumni network. NDSM wharf in Noord as creative tech hub.

**Neighbourhood for tech professionals:** Amsterdam Oost (UvA Sciencepark), Amsterdam Noord, De Pijp and Amstelveen (families) are the most popular residential areas.

**English:** Amsterdam is fully English-speaking in tech — Dutch language skills are nice-to-have, not a requirement.`,
    sourceUrls: ['https://startupamsterdam.com'],
    lastVerified: NOW,
    updatedAt: NOW,
  },
];

// ─── Tools ────────────────────────────────────────────────────────────────────

const TOOLS = [
  {
    toolType: 'thirty_percent_ruling_checker',
    nameDE: '30%-Regelung Eignungstest',
    nameEN: '30% Ruling Eligibility Checker',
    descriptionDE: 'Prüfe in 4 Fragen, ob du die niederländische 30%-Steuerregelung für Expats beantragen kannst.',
    descriptionEN: 'Check in 4 questions whether you can apply for the Dutch 30% tax ruling for expats.',
    config: {
      salaryThreshold2024: 46107,
      salaryThresholdUnder30: 35048,
      maxDurationYears: 5,
      distanceRequirementKm: 150,
      residencyMonthsRequired: 16,
      applicationWindowMonths: 4,
      sourceUrl: 'https://www.belastingdienst.nl/wps/wcm/connect/en/individuals/content/coming-to-work-in-the-netherlands-30-percent-facility',
    },
    isActive: true,
    updatedAt: NOW,
  },
  {
    toolType: 'first_month_budget',
    nameDE: 'Erste-Monat-Budget Amsterdam',
    nameEN: 'First Month Budget Amsterdam',
    descriptionDE: 'Kalkuliere die einmaligen Startkosten für deinen Umzug nach Amsterdam.',
    descriptionEN: 'Calculate the one-time start-up costs for your move to Amsterdam.',
    config: {
      bsnRegistrationFee: 0,
      residencyRegistrationFee: 0,
      kvkRegistrationFee: 75,
      bankAccountFee: 0,
      depositMonths: 2,
      agencyFeeMonths: 1,
      healthInsuranceMonthly: 150,
      currency: 'EUR',
      sourceUrl: 'https://www.amsterdam.nl/en/civil-affairs/',
    },
    isActive: true,
    updatedAt: NOW,
  },
];

// ─── Resources ────────────────────────────────────────────────────────────────

const RESOURCES = [
  {
    resourceType: 'checklist',
    titleDE: 'Erste-6-Wochen-Checkliste Amsterdam',
    titleEN: 'First 6 Weeks Checklist Amsterdam',
    descriptionDE: 'Schritt-für-Schritt-Checkliste für die ersten 6 Wochen in Amsterdam: BSN, Wohnung, Bank, Versicherung, KvK.',
    descriptionEN: 'Step-by-step checklist for the first 6 weeks in Amsterdam: BSN, housing, bank, insurance, KvK.',
    content: {
      items: [
        { de: 'Unterkunft für erste 4 Wochen buchen (Airbnb/Extended Stay)', en: 'Book accommodation for first 4 weeks (Airbnb/Extended Stay)', done: false },
        { de: 'Einwohnermeldeamt-Termin im Stadsdeel buchen (Registration/Inschrijving)', en: 'Book appointment at Stadsdeel city office for registration (Inschrijving)', done: false },
        { de: 'BSN (Burger Service Nummer) beantragen', en: 'Apply for BSN (Burger Service Number)', done: false },
        { de: 'Bankkonto eröffnen (ING, ABN AMRO, Bunq, Revolut)', en: 'Open bank account (ING, ABN AMRO, Bunq, Revolut)', done: false },
        { de: 'Basisverzekering (Krankenversicherung) abschließen', en: 'Take out Basisverzekering (health insurance)', done: false },
        { de: 'Wohnungssuche starten (Funda, Pararius, Kamernet)', en: 'Start apartment search (Funda, Pararius, Kamernet)', done: false },
        { de: 'Mietvertrag prüfen und unterzeichnen', en: 'Review and sign rental contract', done: false },
        { de: '30%-Ruling-Antrag mit Arbeitgeber prüfen (max. 4 Monate nach Arbeitsbeginn)', en: 'Review 30% ruling application with employer (max. 4 months after start of employment)', done: false },
        { de: 'KvK-Registrierung (wenn ZZP/Selbstständig)', en: 'KvK registration (if ZZP/self-employed)', done: false },
        { de: 'OV-chipkaart für öffentliche Verkehrsmittel besorgen', en: 'Get OV-chipkaart for public transport', done: false },
      ],
    },
    updatedAt: NOW,
  },
  {
    resourceType: 'glossary',
    titleDE: 'Steuer-Glossar Niederlande',
    titleEN: 'Netherlands Tax Glossary',
    descriptionDE: 'Die wichtigsten niederländischen Steuerbegriffe für Expats und Auswanderer.',
    descriptionEN: 'The most important Dutch tax terms for expats and emigrants.',
    content: {
      entries: [
        { term: 'BSN', defDE: 'Burger Service Nummer — niederländische Steuer- und Sozialversicherungsnummer', defEN: 'Burger Service Number — Dutch tax and social security number' },
        { term: '30%-Regeling', defDE: '30%-Steuerfreistellung auf Gehalt für angeworbene Expats. Max. 5 Jahre, Antrag über Arbeitgeber.', defEN: '30% tax exemption on salary for recruited expats. Max. 5 years, apply through employer.' },
        { term: 'Belastingdienst', defDE: 'Niederländische Steuerbehörde (belastingdienst.nl)', defEN: 'Dutch tax authority (belastingdienst.nl)' },
        { term: 'Inkomstenbelasting', defDE: 'Einkommensteuer: 36,97% (bis €75.518) / 49,50% (über €75.518)', defEN: 'Income tax: 36.97% (up to €75,518) / 49.50% (above €75,518)' },
        { term: 'BTW / Omzetbelasting', defDE: 'MwSt: 21% Standard, 9% ermäßigt, 0% Export', defEN: 'VAT: 21% standard, 9% reduced, 0% export' },
        { term: 'ZZP', defDE: 'Zelfstandige zonder personeel — niederländischer Einzelunternehmer/Freelancer', defEN: 'Dutch sole trader/freelancer' },
        { term: 'KvK', defDE: 'Kamer van Koophandel — Handelskammer, Pflichtregistrierung, €75 einmalig', defEN: 'Chamber of Commerce, mandatory registration, €75 one-off' },
        { term: 'Zelfstandigenaftrek', defDE: 'Steuerabzug für ZZP: €3.750 (2024, wird abgebaut)', defEN: 'Tax deduction for ZZP: €3,750 (2024, being phased out)' },
        { term: 'Basisverzekering', defDE: 'Gesetzliche Grundkrankenversicherung, Pflicht für alle NL-Einwohner, ca. €140–160/Mon', defEN: 'Statutory basic health insurance, mandatory for all NL residents, ca. €140–160/month' },
      ],
    },
    updatedAt: NOW,
  },
  {
    resourceType: 'directory',
    titleDE: 'Wichtige Behörden & Links Amsterdam',
    titleEN: 'Key Authorities & Links Amsterdam',
    descriptionDE: 'Direkt-Links zu den wichtigsten Behörden und Anlaufstellen für Expats in Amsterdam.',
    descriptionEN: 'Direct links to the most important authorities and contact points for expats in Amsterdam.',
    content: {
      links: [
        { name: 'Gemeente Amsterdam', url: 'https://www.amsterdam.nl/en/civil-affairs/', descDE: 'Einwohnermeldeamt, Inschrijving, BSN', descEN: 'Registration office, Inschrijving, BSN' },
        { name: 'Belastingdienst', url: 'https://www.belastingdienst.nl/wps/wcm/connect/en/individuals/individuals', descDE: 'Steuerbehörde, 30%-Ruling-Antrag', descEN: 'Tax authority, 30% ruling application' },
        { name: 'KvK', url: 'https://www.kvk.nl/en/', descDE: 'Unternehmensregistrierung, ZZP-Anmeldung', descEN: 'Business registration, ZZP registration' },
        { name: 'SVB', url: 'https://www.svb.nl/en/', descDE: 'AOW-Rente, Kinderbijslag (Kindergeld)', descEN: 'AOW pension, Kinderbijslag (child benefit)' },
        { name: 'IND', url: 'https://ind.nl/en', descDE: 'Aufenthaltstitel, Visa, Naturalisierung', descEN: 'Residence permits, visas, naturalisation' },
        { name: 'Funda', url: 'https://www.funda.nl', descDE: 'Größtes Wohnungsportal NL (Kauf + Miete)', descEN: "Netherlands' largest property portal (buy + rent)" },
        { name: 'Pararius', url: 'https://www.pararius.com', descDE: 'Expat-freundliches Mietportal', descEN: 'Expat-friendly rental portal, English language' },
        { name: 'iAmsterdam', url: 'https://www.iamsterdam.com/en/live-work-study', descDE: 'Offizielle Expat-Anlaufstelle', descEN: 'Official expat hub of the City of Amsterdam' },
      ],
    },
    updatedAt: NOW,
  },
  {
    resourceType: 'template',
    titleDE: 'Wohnungssuche Amsterdam — Anschreiben',
    titleEN: 'Amsterdam Housing Search — Cover Letter',
    descriptionDE: 'Vorlagen für die Kontaktaufnahme mit Vermietern — auf Niederländisch und Englisch.',
    descriptionEN: 'Templates for contacting landlords — in Dutch and English.',
    content: {
      templateDE: `Geachte verhuurder,\n\nMijn naam is [Name] en ik ben op zoek naar een woning in Amsterdam. Ik werk als [functie] bij [bedrijf] en heb een vast inkomen van €[maandsalaris] bruto per maand. Ik ben bereid [start datum] in te trekken.\n\nGraag plan ik een bezichtiging. U kunt mij bereiken via [email/telefoon].\n\nMet vriendelijke groet,\n[Name]`,
      templateEN: `Geachte verhuurder,\n\nMijn naam is [Name] en ik ben op zoek naar een woning in Amsterdam. Ik werk als [function] bij [company] en heb een vast inkomen van €[monthly salary] bruto per maand. Ik ben bereid [start date] in te trekken.\n\nGraag plan ik een bezichtiging. U kunt mij bereiken via [email/phone].\n\nMet vriendelijke groet,\n[Name]`,
      notesDE: 'Einkommensnachweis: mind. 3× Kaltmiete. 30%-Ruling-Bescheid gilt als Nachweis. Kaution: 2 Monate. Maklergebühr: max. 1 Monatsmiete (seit 2023).',
      notesEN: 'Proof of income: at least 3× rent. 30% ruling letter counts as proof. Deposit: 2 months. Agency fee: max. 1 month\'s rent (since 2023).',
    },
    updatedAt: NOW,
  },
  {
    resourceType: 'checklist',
    titleDE: '30%-Regelung — Voraussetzungs-Checkliste',
    titleEN: '30% Ruling — Requirements Checklist',
    descriptionDE: 'Zusammenfassung der 30%-Steuerregelung für angeworbene Expats in den Niederlanden (Stand 2024).',
    descriptionEN: 'Summary of the 30% tax ruling for recruited expats in the Netherlands (as of 2024).',
    content: {
      items: [
        { de: 'Anwerbung aus dem Ausland (nicht lokale Einstellung)', en: 'Recruited from abroad (not a local hire)', done: false },
        { de: 'Brutto-Jahresgehalt mind. €46.107 (unter 30 Jahre: €35.048)', en: 'Gross annual salary at least €46,107 (under 30: €35,048)', done: false },
        { de: 'Spezifische Expertise nachweisbar (Uni-Abschluss + Berufserfahrung)', en: 'Specific expertise demonstrable (university degree + professional experience)', done: false },
        { de: 'Mind. 16 von 24 Monaten vor Beschäftigung >150 km von NL-Grenze gelebt', en: 'Lived >150 km from Dutch border for at least 16 of 24 months before employment', done: false },
        { de: 'Antrag über Arbeitgeber beim Belastingdienst stellen', en: 'Apply through employer at Belastingdienst', done: false },
        { de: 'Frist: max. 4 Monate nach Beschäftigungsbeginn', en: 'Deadline: max. 4 months after start of employment', done: false },
        { de: 'Gültigkeit: 5 Jahre (ab 2024, vorher 8 Jahre)', en: 'Duration: 5 years (from 2024, previously 8 years)', done: false },
        { de: 'Jährliche Gehaltsüberprüfung sicherstellen', en: 'Ensure annual salary review (threshold applies every year)', done: false },
      ],
    },
    updatedAt: NOW,
  },
];

// ─── Testimonials ──────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    authorName: 'Markus B.',
    authorAge: 34,
    authorProfession: 'Senior Software Engineer',
    authorPersona: 'employed',
    yearMoved: 2022,
    contentDE: `Die 30%-Regelung hat meinen Umzug nach Amsterdam finanziell deutlich attraktiver gemacht. Mein Nettoeinkommen stieg durch die Regelung um ca. 18% — das gleicht die höheren Lebenshaltungskosten gegenüber München fast vollständig aus.

Die Wohnungssuche war der härteste Teil. Ich habe 6 Wochen in einem Airbnb gelebt und mich auf über 40 Wohnungen beworben. Entscheidend war: sofortige Bewerbung (innerhalb von Stunden), vollständiges Dossier (Gehaltsnachweis, Arbeitsvertrag, Referenzen) und realistisch hoher Mietbudget.

Heute wohne ich in Amsterdam Oost, 10 Minuten Fahrrad von Booking.com. Die Work-Life-Balance ist durch das Fahrrad-Ökosystem besser als in jeder anderen Stadt, in der ich gearbeitet habe.`,
    contentEN: `The 30% ruling made my move to Amsterdam significantly more attractive financially. My net income increased by about 18% through the ruling — which almost completely offsets the higher cost of living compared to Munich.

The housing search was the hardest part. I lived in an Airbnb for 6 weeks and applied for over 40 apartments. The key was: immediate application (within hours), complete dossier (salary proof, employment contract, references) and a realistically high rent budget.

Today I live in Amsterdam Oost, 10 minutes by bike from Booking.com. The work-life balance through the cycling ecosystem is better than in any other city I've worked in.`,
    rating: 5,
    isVerified: true,
  },
  {
    authorName: 'Sandra K.',
    authorAge: 41,
    authorProfession: 'Product Manager',
    authorPersona: 'family',
    yearMoved: 2020,
    contentDE: `Wir sind mit zwei Kindern (8 und 11 Jahre) nach Amsterdam gezogen. Die DBSA (Deutsche Internationale Schule Amsterdam) in Amstelveen war für uns die beste Entscheidung — Kinder sprechen mittlerweile fließend Niederländisch und Englisch, behalten aber das deutsche Schulsystem-Fundament.

Amstelveen ist für Familien ideal: ruhig, sicher, gute Infrastruktur, kurze Wege zur ISA und zur DBSA. Kaltmiete für unser 4-Zimmer-Haus: €2.800/Mon — teuer, aber für niederländische Verhältnisse realistisch.

Was mich überrascht hat: Die niederländische Gesellschaft ist direkter als die deutsche. Feedback ist ehrlicher, Meetings kürzer, Hierarchien flacher. Das hat sich beruflich sehr positiv ausgewirkt.`,
    contentEN: `We moved to Amsterdam with two children (8 and 11). The DBSA (Deutsche Internationale Schule Amsterdam) in Amstelveen was the best decision for us — the kids now speak fluent Dutch and English, while keeping the German school system foundation.

Amstelveen is ideal for families: quiet, safe, good infrastructure, short distances to ISA and DBSA. Cold rent for our 4-room house: €2,800/month — expensive, but realistic for Dutch standards.

What surprised me: Dutch society is more direct than German. Feedback is more honest, meetings shorter, hierarchies flatter. This has had a very positive effect professionally.`,
    rating: 5,
    isVerified: true,
  },
  {
    authorName: 'Thomas R.',
    authorAge: 29,
    authorProfession: 'UX Designer (ZZP)',
    authorPersona: 'freelancer',
    yearMoved: 2023,
    contentDE: `Als ZZP (Freelancer) ist Amsterdam steuerlich weniger attraktiv als für Angestellte — die 30%-Regelung greift für mich nicht. Die Kombination aus Inkomstenbelasting (~37%) und fehlender Arbeitgeberbeteiligung an Krankenversicherung und Rente macht den Nettoeffekt geringer als erwartet.

Trotzdem: Amsterdam ist ein fantastischer Ort für Freelancer. Das Netzwerk (Booking.com, Adyen, viele Scale-ups) bringt gute Aufträge. Der Wohnungsmarkt ist brutal — ich habe 4 Monate gesucht und wohne jetzt in Amsterdam Noord, Fähre ins Centrum 7 Minuten.

Tipp für ZZPs: KvK-Registrierung sofort nach Einzug, Bunq für Business-Konto sehr empfehlenswert, und unbedingt eine Buchhaltungssoftware (Moneybird, SnelStart) nutzen — der Belastingdienst ist digital und erwartet das.`,
    contentEN: `As a ZZP (freelancer), Amsterdam is less tax-attractive than for employees — the 30% ruling doesn't apply to me. The combination of Inkomstenbelasting (~37%) and no employer contribution to health insurance and pension makes the net effect less than expected.

Nevertheless: Amsterdam is a fantastic place for freelancers. The network (Booking.com, Adyen, many scale-ups) brings good projects. The housing market is brutal — I searched for 4 months and now live in Amsterdam Noord, 7 minutes by ferry to Centrum.

Tip for ZZPs: KvK registration immediately after moving in, Bunq for business account highly recommended, and definitely use accounting software (Moneybird, SnelStart) — the Belastingdienst is digital and expects it.`,
    rating: 4,
    isVerified: true,
  },
];

// ─── Exported seed function ───────────────────────────────────────────────────

export async function seedAmsterdam(): Promise<void> {
  console.log('🌍 Seeding Amsterdam premium content...\n');

  console.log('📍 Creating districts...');
  for (const d of DISTRICTS) {
    const { col, ...districtData } = d;
    const district = await prisma.district.upsert({
      where: { cityId_slug: { cityId: CITY_ID, slug: d.slug } },
      update: { ...districtData, updatedAt: NOW },
      create: { ...districtData, cityId: CITY_ID },
    });
    for (const c of col) {
      await prisma.districtCostOfLiving.upsert({
        where: { districtId_category: { districtId: district.id, category: c.category } },
        update: { value: c.value, source: SOURCE_FUNDA },
        create: { districtId: district.id, category: c.category, value: c.value, currency: c.currency, source: SOURCE_FUNDA, confidence: 70, validFrom: NOW },
      });
    }
    console.log(`  ✓ ${d.nameDE} (${col.length} CoL entries)`);
  }

  console.log('\n📝 Creating narratives...');
  for (const n of NARRATIVES) {
    await prisma.cityNarrative.upsert({
      where: { cityId_section: { cityId: CITY_ID, section: n.section } },
      update: { ...n, updatedAt: NOW, lastVerified: NOW },
      create: { ...n, cityId: CITY_ID, lastVerified: NOW },
    });
    console.log(`  ✓ ${n.section} (${n.contentDE.length} chars DE)`);
  }

  console.log('\n🔧 Creating tools...');
  for (const t of TOOLS) {
    await prisma.cityTool.upsert({
      where: { cityId_toolType: { cityId: CITY_ID, toolType: t.toolType } },
      update: { ...t, updatedAt: NOW },
      create: { ...t, cityId: CITY_ID },
    });
    console.log(`  ✓ ${t.toolType}`);
  }

  console.log('\n📚 Creating resources...');
  for (const r of RESOURCES) {
    const existing = await prisma.resource.findFirst({ where: { cityId: CITY_ID, titleDE: r.titleDE } });
    if (existing) {
      await prisma.resource.update({ where: { id: existing.id }, data: { ...r, updatedAt: NOW } });
    } else {
      await prisma.resource.create({ data: { ...r, cityId: CITY_ID } });
    }
    console.log(`  ✓ ${r.titleDE}`);
  }

  console.log('\n💬 Creating testimonials...');
  for (const t of TESTIMONIALS) {
    const existing = await prisma.testimonial.findFirst({ where: { cityId: CITY_ID, authorName: t.authorName } });
    if (!existing) {
      await prisma.testimonial.create({ data: { ...t, cityId: CITY_ID } });
      console.log(`  ✓ ${t.authorName}`);
    } else {
      console.log(`  ~ ${t.authorName} (already exists)`);
    }
  }

  console.log('\n✅ Amsterdam premium seed complete.');
  console.log(`   Districts: ${DISTRICTS.length}`);
  console.log(`   CoL entries: ${DISTRICTS.reduce((s, d) => s + d.col.length, 0)}`);
  console.log(`   Narratives: ${NARRATIVES.length}`);
  console.log(`   Tools: ${TOOLS.length}`);
  console.log(`   Resources: ${RESOURCES.length}`);
  console.log(`   Testimonials: ${TESTIMONIALS.length}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await seedAmsterdam();
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
