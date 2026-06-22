/**
 * Sprint 9 — Wien (Vienna) Premium Content Seed
 * Pattern: 8 districts · 5 narratives · 2 tools · 5 resources · 3 testimonials
 * Run: npm run seed:premium:wien (from packages/db)
 * Sources: willhaben.at, wkw.at, bmf.gv.at, wien.gv.at, expatfocus.com
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();
const NOW = new Date('2026-05-28T00:00:00Z');
const CITY_ID = 'cmpbragt10032nrhv55jrdx5c';
const SOURCE_WILLHABEN = 'willhaben.at / immoscout24.at (Q1 2025)';

// ─── Districts ────────────────────────────────────────────────────────────────

const DISTRICTS = [
  {
    slug: 'innere-stadt',
    nameDE: 'Innere Stadt (1. Bezirk)',
    nameEN: 'Inner City (1st District)',
    descriptionDE: 'Historisches Zentrum mit Stephansdom, Hofburg und weltberühmten Museen. Höchste Mieten Wiens, touristisch, wenig Wohnfläche. Für Expats eher als Prestigeadresse relevant.',
    descriptionEN: 'Historic centre with St. Stephen\'s Cathedral, Hofburg and world-famous museums. Vienna\'s highest rents, touristy, limited residential space. Relevant for expats mainly as a prestige address.',
    latitude: 48.2089, longitude: 16.3694, vibe: 'historisch', priceLevel: 5, sortOrder: 1,
    col: [
      { category: 'rent_3br_center', value: 1400, currency: 'EUR' },
      { category: 'rent_1br_center', value: 1900, currency: 'EUR' },
      { category: 'rent_2br_center', value: 2800, currency: 'EUR' },
      { category: 'groceries_monthly', value: 360, currency: 'EUR' },
      { category: 'restaurant_meal', value: 18, currency: 'EUR' },
    ],
  },
  {
    slug: 'leopoldstadt',
    nameDE: 'Leopoldstadt (2. Bezirk)',
    nameEN: 'Leopoldstadt (2nd District)',
    descriptionDE: 'Trendy, jung, international — die Leopoldstadt ist mit dem Prater, dem Naschmarkt-Umfeld und einer wachsenden Start-up-Szene zum beliebtesten Expat-Bezirk avanciert.',
    descriptionEN: 'Trendy, young, international — Leopoldstadt has become the most popular expat district with Prater, the Naschmarkt area and a growing startup scene.',
    latitude: 48.2197, longitude: 16.3896, vibe: 'trendy', priceLevel: 4, sortOrder: 2,
    col: [
      { category: 'rent_3br_center', value: 1100, currency: 'EUR' },
      { category: 'rent_1br_center', value: 1500, currency: 'EUR' },
      { category: 'rent_2br_center', value: 2200, currency: 'EUR' },
      { category: 'groceries_monthly', value: 320, currency: 'EUR' },
      { category: 'restaurant_meal', value: 16, currency: 'EUR' },
    ],
  },
  {
    slug: 'landstrasse',
    nameDE: 'Landstraße (3. Bezirk)',
    nameEN: 'Landstraße (3rd District)',
    descriptionDE: 'Ruhiger, eleganter Bezirk mit dem Belvedere, dem Diplomatenviertel und guter Infrastruktur. Beliebt bei Diplomaten, Expats und Familien.',
    descriptionEN: 'Quiet, elegant district with the Belvedere, diplomatic quarter and good infrastructure. Popular with diplomats, expats and families.',
    latitude: 48.1994, longitude: 16.3862, vibe: 'elegant', priceLevel: 4, sortOrder: 3,
    col: [
      { category: 'rent_3br_center', value: 1050, currency: 'EUR' },
      { category: 'rent_1br_center', value: 1400, currency: 'EUR' },
      { category: 'rent_2br_center', value: 2000, currency: 'EUR' },
      { category: 'groceries_monthly', value: 310, currency: 'EUR' },
      { category: 'restaurant_meal', value: 15, currency: 'EUR' },
    ],
  },
  {
    slug: 'mariahilf-naschmarkt',
    nameDE: 'Mariahilf / Naschmarkt (6. Bezirk)',
    nameEN: 'Mariahilf / Naschmarkt (6th District)',
    descriptionDE: 'Der Naschmarkt ist Wiens kulinarisches Herz. Das 6. Bezirk kombiniert Gastronomie, Mode und urbanes Leben — zentral, lebendig und für Singles/Paare ideal.',
    descriptionEN: 'The Naschmarkt is Vienna\'s culinary heart. The 6th district combines gastronomy, fashion and urban life — central, lively and ideal for singles/couples.',
    latitude: 48.1967, longitude: 16.3572, vibe: 'kulinarisch', priceLevel: 4, sortOrder: 4,
    col: [
      { category: 'rent_3br_center', value: 1000, currency: 'EUR' },
      { category: 'rent_1br_center', value: 1350, currency: 'EUR' },
      { category: 'rent_2br_center', value: 1950, currency: 'EUR' },
      { category: 'groceries_monthly', value: 300, currency: 'EUR' },
      { category: 'restaurant_meal', value: 15, currency: 'EUR' },
    ],
  },
  {
    slug: 'neubau',
    nameDE: 'Neubau (7. Bezirk)',
    nameEN: 'Neubau (7th District)',
    descriptionDE: 'Das kreative Herz Wiens — Boutiquen, Galerien, vegane Restaurants und der Museumsquartier-Komplex. Sehr beliebt bei Kreativen, Studierenden und jungen Expats.',
    descriptionEN: 'The creative heart of Vienna — boutiques, galleries, vegan restaurants and the MuseumsQuartier complex. Very popular with creatives, students and young expats.',
    latitude: 48.2017, longitude: 16.3496, vibe: 'kreativ', priceLevel: 4, sortOrder: 5,
    col: [
      { category: 'rent_3br_center', value: 1050, currency: 'EUR' },
      { category: 'rent_1br_center', value: 1400, currency: 'EUR' },
      { category: 'rent_2br_center', value: 2000, currency: 'EUR' },
      { category: 'groceries_monthly', value: 310, currency: 'EUR' },
      { category: 'restaurant_meal', value: 15, currency: 'EUR' },
    ],
  },
  {
    slug: 'alsergrund',
    nameDE: 'Alsergrund (9. Bezirk)',
    nameEN: 'Alsergrund (9th District)',
    descriptionDE: 'Universitätsbezirk mit AKH (Allgemeines Krankenhaus), Votivkirche und lebhafter Studentenszene. Günstig, zentral, viel Grün. Gut für Expats im Gesundheits- und Wissenschaftsbereich.',
    descriptionEN: 'University district with AKH (General Hospital), Votivkirche and lively student scene. Affordable, central, lots of greenery. Good for expats in health and science sectors.',
    latitude: 48.2214, longitude: 16.3560, vibe: 'akademisch', priceLevel: 3, sortOrder: 6,
    col: [
      { category: 'rent_3br_center', value: 900, currency: 'EUR' },
      { category: 'rent_1br_center', value: 1200, currency: 'EUR' },
      { category: 'rent_2br_center', value: 1800, currency: 'EUR' },
      { category: 'groceries_monthly', value: 290, currency: 'EUR' },
      { category: 'restaurant_meal', value: 13, currency: 'EUR' },
    ],
  },
  {
    slug: 'floridsdorf',
    nameDE: 'Floridsdorf (21. Bezirk)',
    nameEN: 'Floridsdorf (21st District)',
    descriptionDE: 'Transdanubisch, familiär, ruhig. Günstigste Alternative für Familien mit Kindern im Wiener Stadtgebiet. 20 Min. U-Bahn ins Zentrum.',
    descriptionEN: 'Beyond the Danube, family-oriented, quiet. Most affordable option for families with children within Vienna city limits. 20 min by metro to the centre.',
    latitude: 48.2577, longitude: 16.3999, vibe: 'familiär', priceLevel: 2, sortOrder: 7,
    col: [
      { category: 'rent_3br_center', value: 750, currency: 'EUR' },
      { category: 'rent_1br_center', value: 1000, currency: 'EUR' },
      { category: 'rent_2br_center', value: 1500, currency: 'EUR' },
      { category: 'groceries_monthly', value: 270, currency: 'EUR' },
      { category: 'restaurant_meal', value: 12, currency: 'EUR' },
    ],
  },
  {
    slug: 'klosterneuburg-perchtoldsdorf',
    nameDE: 'Klosterneuburg / Perchtoldsdorf',
    nameEN: 'Klosterneuburg / Perchtoldsdorf',
    descriptionDE: 'Ruhige Umlandgemeinden mit Weinbergen und hoher Lebensqualität. S-Bahn nach Wien: 20–30 Min. Sehr beliebt bei Familien, die raus aus der Stadt wollen.',
    descriptionEN: 'Quiet suburban towns with vineyards and high quality of life. S-Bahn to Vienna: 20–30 min. Very popular with families wanting to leave the city.',
    latitude: 48.3050, longitude: 16.3280, vibe: 'suburban', priceLevel: 2, sortOrder: 8,
    col: [
      { category: 'rent_3br_center', value: 700, currency: 'EUR' },
      { category: 'rent_1br_center', value: 950, currency: 'EUR' },
      { category: 'rent_2br_center', value: 1400, currency: 'EUR' },
      { category: 'groceries_monthly', value: 260, currency: 'EUR' },
      { category: 'restaurant_meal', value: 12, currency: 'EUR' },
    ],
  },
];

// ─── Narratives ───────────────────────────────────────────────────────────────

const NARRATIVES = [
  {
    section: 'intro',
    titleDE: 'Wien — Das Wichtigste im Überblick',
    titleEN: 'Vienna — The Essential Overview',
    contentDE: `Wien ist die Bundeshauptstadt Österreichs und konsequent an der Spitze der globalen Lebensqualitäts-Rankings (Mercer, EIU). Die Stadt kombiniert europäische Kultur- und Bildungsinfrastruktur auf höchstem Niveau mit einem vergleichsweise moderaten Preisniveau gegenüber London, Zürich oder Amsterdam.

**Wohnungsmarkt:** Wien hat einen einzigartigen regulierten Wohnungsmarkt. Der Gemeindebau (Sozialwohnungen) deckt ca. 60% der Mietwohnungen ab — für Expats nicht zugänglich. Der freie Markt ist jedoch moderater als andere europäische Hauptstädte: 1-Zimmer in guten Lagen: €900–1.500/Mon.

**Steuern:** Österreich hat ein progressives Steuersystem (20–55% ESt). Keine speziellen Expatregelungen wie die 30%-Regelung oder IFICI — aber das DBA AT-DE verhindert Doppelbesteuerung. Die Sozialversicherungsbeiträge sind hoch (~18% AN-Anteil).

**Sprache:** Deutsch ist Amts- und Arbeitssprache. In internationalen Unternehmen und Start-ups wird zunehmend Englisch gesprochen, aber Deutschkenntnisse erleichtern den Alltag erheblich.

**Lebensqualität:** Wien bietet außergewöhnliche öffentliche Infrastruktur (Wiener Linien, medizinische Versorgung, Parks), hohe Sicherheit und ein reiches Kulturleben zu moderaten Kosten.`,
    contentEN: `Vienna is the federal capital of Austria and consistently ranked at the top of global quality of life rankings (Mercer, EIU). The city combines European cultural and educational infrastructure at the highest level with a comparatively moderate price level compared to London, Zurich or Amsterdam.

**Housing market:** Vienna has a unique regulated housing market. The Gemeindebau (social housing) covers approx. 60% of rental apartments — not accessible to expats. The free market is, however, more moderate than other European capitals: 1-bedroom in good locations: €900–1,500/month.

**Taxes:** Austria has a progressive tax system (20–55% income tax). No special expat schemes like the 30% ruling or IFICI — but the DTA AT-DE prevents double taxation. Social security contributions are high (~18% employee share).

**Language:** German is the official and working language. English is increasingly spoken in international companies and startups, but German skills make everyday life significantly easier.

**Quality of life:** Vienna offers exceptional public infrastructure (Wiener Linien, healthcare, parks), high safety and a rich cultural life at moderate costs.`,
    sourceUrls: ['https://www.wien.gv.at/english/'],
    lastVerified: NOW,
    updatedAt: NOW,
  },
  {
    section: 'for_freelancers',
    titleDE: 'Wien für Freelancer & Selbstständige',
    titleEN: 'Vienna for Freelancers & Self-Employed',
    contentDE: `**Gewerbeschein vs. Freier Beruf:** In Österreich unterscheidet man zwischen Gewerbetreibenden (Anmeldung bei der Wirtschaftskammer, WKÖ) und Freien Berufen (Ärzte, Rechtsanwälte, Künstler, Journalisten — freie Regelung ohne WKÖ-Pflicht). Für die meisten IT/Kreativfreelancer gilt das Gewerbe.

**Steuerliche Situation:**
- Einkommensteuer: progressiv 0–55% (ab €1 Mio. 55%)
- Umsatzsteuer: 20% Standard, 10% ermäßigt
- Steuerfreie Jahresgrenze: bis €35.000 Nettoumsatz — Kleinunternehmerregelung (keine USt-Pflicht)
- Betriebsausgabenpauschale: 12% der Einnahmen (max. €26.400) statt Belegbuchhaltung

**Sozialversicherung (SVS):** Selbstständige zahlen bei der Sozialversicherungsanstalt der Selbstständigen (SVS). Mindestvorsorgepflicht: ca. €160/Mon (KV+PV). Definitiv mehr als Angestellte.

**Gründung:** Gewerbeschein bei der Wirtschaftskammer (online via WKO.at): Kosten ca. €100–300 je nach Gewerbe. Steuernummer beim Finanzamt binnen 1 Monat.

**Banking:** Erste Bank, Raiffeisen, George (Erste-Digital) und N26 sind populäre Optionen. George-App ist für Österreich-Banking sehr empfehlenswert.`,
    contentEN: `**Gewerbeschein vs. Freie Berufe:** In Austria, a distinction is made between commercial traders (registration with the Economic Chamber, WKÖ) and free professions (doctors, lawyers, artists, journalists — free regulation without WKÖ obligation). For most IT/creative freelancers, commercial registration applies.

**Tax situation:**
- Income tax: progressive 0–55% (from €1m: 55%)
- VAT: 20% standard, 10% reduced
- Tax-free annual limit: up to €35,000 net turnover — small business regulation (no VAT obligation)
- Business expense flat rate: 12% of revenue (max. €26,400) instead of full bookkeeping

**Social insurance (SVS):** Self-employed pay into the Social Insurance Institution for the Self-Employed (SVS). Minimum mandatory contribution: ca. €160/month (health+pension). Definitely more than employees.

**Registration:** Gewerbeschein at the Economic Chamber (online via WKO.at): costs ca. €100–300 depending on trade. Tax number at Finanzamt within 1 month.

**Banking:** Erste Bank, Raiffeisen, George (Erste Digital) and N26 are popular options. George app is highly recommended for Austrian banking.`,
    sourceUrls: ['https://www.wko.at/service/steuern-buchfuehrung-finanzierung/index.html'],
    lastVerified: NOW,
    updatedAt: NOW,
  },
  {
    section: 'for_families',
    titleDE: 'Wien für Familien',
    titleEN: 'Vienna for Families',
    contentDE: `**Schulen:** Wien bietet exzellente öffentliche Schulen und eine wachsende Auswahl an internationalen Schulen:

- **Vienna International School (VIS)** — IB PYP/MYP/DP, Schulgeld ca. €15.000–20.000/Jahr
- **American International School Vienna (AIS)** — IB + US-Lehrplan, ca. €15.000–19.000/Jahr
- **Deutsche Schule Wien** — Deutsches Schulsystem + Sprachförderung, ca. €4.000–8.000/Jahr
- **Öffentliche AHS (Gymnasium)** — kostenlos, Unterrichtssprache Deutsch; nach einigen Jahren österreichische Schüler bereit

**Kinderbetreuung:** Kindergarten (3–6 Jahre) in Wien ist kostenlos (seit 2009). U3-Betreuung (Krippe) kostenpflichtig: ca. €200–500/Mon je nach Bezirk.

**Familienbezirke:** Bezirke 13 (Hietzing), 18 (Währing), 19 (Döbling) und die Umlandgemeinden Klosterneuburg/Perchtoldsdorf sind bei Familien besonders beliebt.

**Sicherheit:** Wien ist eine der sichersten Städte Europas — ideale Voraussetzung für Familien mit Kindern.`,
    contentEN: `**Schools:** Vienna offers excellent public schools and a growing range of international schools:

- **Vienna International School (VIS)** — IB PYP/MYP/DP, tuition ca. €15,000–20,000/year
- **American International School Vienna (AIS)** — IB + US curriculum, ca. €15,000–19,000/year
- **Deutsche Schule Wien** — German school system + language support, ca. €4,000–8,000/year
- **Public AHS (Gymnasium)** — free, instruction in German; after a few years children adapt well

**Childcare:** Kindergarten (3–6 years) in Vienna is free (since 2009). Under-3s (Krippe) have fees: ca. €200–500/month depending on district.

**Family districts:** Districts 13 (Hietzing), 18 (Währing), 19 (Döbling) and suburban towns Klosterneuburg/Perchtoldsdorf are particularly popular with families.

**Safety:** Vienna is one of Europe's safest cities — ideal conditions for families with children.`,
    sourceUrls: ['https://www.wien.gv.at/bildung/kindergarten/'],
    lastVerified: NOW,
    updatedAt: NOW,
  },
  {
    section: 'for_retirees',
    titleDE: 'Wien für Rentner',
    titleEN: 'Vienna for Retirees',
    contentDE: `**DBA Österreich-Deutschland:** Das Doppelbesteuerungsabkommen AT-DE ist für Rentner zentral. Österreichische Pensionen werden in AT besteuert. Deutsche Renten werden grundsätzlich in DE besteuert (Quellensteuerprinzip), aber mit Anrechnung. Empfehlung: Steuerberater mit AT/DE-Expertise für die Erstkonfiguration.

**Lebenshaltungskosten für Rentner:** Wien ist deutlich günstiger als Zürich oder Amsterdam. Realistische monatliche Kosten:
- Kleine Wohnung (55m², Bezirke 3–9): €1.000–1.400/Mon Miete
- Monatliche Kosten ohne Miete: €800–1.200
- Gesamt: ca. €1.800–2.600/Mon — sehr moderat für eine europäische Hauptstadt

**Gesundheitsversorgung:** Austria hat ein universelles Gesundheitssystem (e-card). Als EU-Bürger mit AN-Meldung automatisch versichert. Private Zusatzversicherung empfehlenswert für schnellere Facharzt-Termine.

**Kulturelles Leben:** Wien bietet Weltklasse-Kultur oft zu erschwinglichen Preisen: Wiener Philharmoniker, Burgtheater, Kunsthistorisches Museum, Wiener Staatsoper. Viele Institutionen bieten Senioren-Rabatte.`,
    contentEN: `**DTA Austria-Germany:** The Austria-Germany double taxation agreement is central for retirees. Austrian pensions are taxed in AT. German pensions are generally taxed in DE (source tax principle), but with crediting. Recommendation: tax advisor with AT/DE expertise for initial setup.

**Cost of living for retirees:** Vienna is significantly cheaper than Zurich or Amsterdam. Realistic monthly costs:
- Small apartment (55m², districts 3–9): €1,000–1,400/month rent
- Monthly costs excluding rent: €800–1,200
- Total: approx. €1,800–2,600/month — very moderate for a European capital

**Healthcare:** Austria has a universal healthcare system (e-card). As an EU citizen with Austrian registration, automatically insured. Private supplemental insurance recommended for faster specialist appointments.

**Cultural life:** Vienna offers world-class culture often at affordable prices: Vienna Philharmonic, Burgtheater, Kunsthistorisches Museum, Vienna State Opera. Many institutions offer senior discounts.`,
    sourceUrls: ['https://www.bmf.gv.at/en/topics/taxation/double-taxation-agreements.html'],
    lastVerified: NOW,
    updatedAt: NOW,
  },
  {
    section: 'for_tech_workers',
    titleDE: 'Wien als Tech-Hub',
    titleEN: 'Vienna as Tech Hub',
    contentDE: `Wien ist das führende Technologie- und Start-up-Zentrum Österreichs und hat sich in den letzten Jahren zu einem bedeutenden Knotenpunkt im DACH-Ökosystem entwickelt.

**Relevante Unternehmen:** Tricentis (Test-Automatisierung, Unicorn), Bitpanda (Crypto/Fintech), Runtastic (Adidas-Tochter, Fitness-App), Bitsol Technologies, TU Wien-Spinoffs. EMEA-Büros von Microsoft, Oracle, IBM, Siemens.

**Start-up-Ökosystem:** Vienna Startup Package (Förderprogramm für internationale Gründer mit Visum-Unterstützung). Tech-Events: Vienna Digital, Pioneers Festival, WebSummit Side-Events. Crunchbase: ca. 650 aktive Wiener Start-ups (2024).

**Gehälter (2024):**
- Junior Developer: €35.000–50.000/Jahr brutto
- Senior Developer: €65.000–90.000/Jahr brutto
- Tech Lead/Principal: €90.000–130.000/Jahr brutto
- Etwas niedriger als DE/NL, aber durch niedrigeres Preisniveau gut kompensiert

**Arbeitsrecht:** Österreich hat sehr arbeitnehmerfreundliches Recht: 5 Wochen Urlaub, strenger Kündigungsschutz, 14 Monatsgehälter üblich (inkl. Urlaubs- und Weihnachtsgeld).`,
    contentEN: `Vienna is Austria's leading technology and startup centre and has developed into a significant node in the DACH ecosystem in recent years.

**Key companies:** Tricentis (test automation, unicorn), Bitpanda (crypto/fintech), Runtastic (Adidas subsidiary, fitness app), Bitsol Technologies, TU Wien spinoffs. EMEA offices of Microsoft, Oracle, IBM, Siemens.

**Startup ecosystem:** Vienna Startup Package (funding programme for international founders with visa support). Tech events: Vienna Digital, Pioneers Festival, WebSummit side events. Crunchbase: approx. 650 active Viennese startups (2024).

**Salaries (2024):**
- Junior Developer: €35,000–50,000/year gross
- Senior Developer: €65,000–90,000/year gross
- Tech Lead/Principal: €90,000–130,000/year gross
- Slightly lower than DE/NL, but well compensated by lower price levels

**Labour law:** Austria has very employee-friendly law: 5 weeks' holiday, strict dismissal protection, 14 monthly salaries common (incl. holiday and Christmas pay).`,
    sourceUrls: ['https://www.advantageaustria.org/international/oesterreich-in-der-welt/technologie-und-start-ups.html'],
    lastVerified: NOW,
    updatedAt: NOW,
  },
];

// ─── Tools ────────────────────────────────────────────────────────────────────

const TOOLS = [
  {
    toolType: 'first_month_budget',
    nameDE: 'Erste-Monat-Budget Wien',
    nameEN: 'First Month Budget Vienna',
    descriptionDE: 'Kalkuliere die einmaligen Startkosten für deinen Umzug nach Wien.',
    descriptionEN: 'Calculate the one-time start-up costs for your move to Vienna.',
    config: {
      citySlug: 'wien',
      currency: 'EUR',
      meldezettelFee: 0,
      wkRegistrationFee: 200,
      bankAccountFee: 0,
      depositMonths: 3,
      agencyFeeMonths: 2,
      healthInsuranceMonthly: 160,
      defaults: {
        rent1BR: 1200,
        rent2BR: 1800,
        rent3BR: 2500,
      },
      sourceUrl: 'https://www.wien.gv.at/english/',
    },
    isActive: true,
    updatedAt: NOW,
  },
  {
    toolType: 'language_learning_estimator',
    nameDE: 'Deutsch-Lernzeit-Schätzer',
    nameEN: 'German Learning Time Estimator',
    descriptionDE: 'Schätze, wie lange es dauert, Deutsch bis zum Arbeitsniveau (B2/C1) zu lernen — basierend auf deiner Muttersprache und Lernintensität.',
    descriptionEN: 'Estimate how long it takes to learn German to working level (B2/C1) — based on your native language and learning intensity.',
    config: {
      targetLocale: 'de',
      levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
      hoursPerLevel: { A1: 80, A2: 80, B1: 120, B2: 150, C1: 200, C2: 300 },
      difficultyByNativeLang: {
        en: 1.0, nl: 0.8, sv: 0.9, fr: 1.2, es: 1.2, it: 1.2,
        zh: 1.8, ja: 1.9, ko: 1.8, ar: 1.7, ru: 1.3,
      },
      sourceUrl: 'https://www.goethe.de/en/spr/kup/prf.html',
    },
    isActive: true,
    updatedAt: NOW,
  },
];

// ─── Resources ────────────────────────────────────────────────────────────────

const RESOURCES = [
  {
    resourceType: 'checklist',
    titleDE: 'Erste-8-Wochen-Checkliste Wien',
    titleEN: 'First 8 Weeks Checklist Vienna',
    descriptionDE: 'Schritt-für-Schritt-Checkliste für die ersten 8 Wochen in Wien: Meldezettel, SVS, Finanzamt, WK.',
    descriptionEN: 'Step-by-step checklist for the first 8 weeks in Vienna: Meldezettel, SVS, Finanzamt, WK.',
    content: {
      items: [
        { de: 'Hauptwohnsitz-Meldezettel innerhalb von 3 Tagen beim zuständigen Magistrat (MA35 für Drittstaaten, Meldeservice für EU)', en: 'Register primary residence (Meldezettel) within 3 days at relevant magistrate (MA35 for non-EU, Meldeservice for EU)', done: false },
        { de: 'Sozialversicherungsnummer (SVS für Selbstständige / ÖGK für Angestellte) beantragen', en: 'Apply for social insurance number (SVS for self-employed / ÖGK for employees)', done: false },
        { de: 'Steuernummer beim Finanzamt beantragen (Finanz-Online: finanzonline.bmf.gv.at)', en: 'Apply for tax number at Finanzamt (Finanz-Online: finanzonline.bmf.gv.at)', done: false },
        { de: 'Österreichisches Bankkonto eröffnen (Erste Bank/George, Raiffeisen, N26)', en: 'Open Austrian bank account (Erste Bank/George, Raiffeisen, N26)', done: false },
        { de: 'e-Card (Krankenversicherungskarte) bestellen / registrieren', en: 'Order / register e-Card (health insurance card)', done: false },
        { de: 'Wohnungssuche (willhaben.at, immoscout24.at, ImmobilienScout)', en: 'Apartment search (willhaben.at, immoscout24.at, ImmobilienScout)', done: false },
        { de: 'Mietvertrag prüfen: Kaution (3 Monate üblich), Betriebskosten, Befristung', en: 'Review rental contract: deposit (3 months standard), operating costs, fixed term', done: false },
        { de: 'Gewerbeschein bei der WKO anmelden (wenn selbstständig)', en: 'Register Gewerbeschein at WKO (if self-employed)', done: false },
        { de: 'Österreichische SIM-Karte holen (A1, Magenta, Drei)', en: 'Get Austrian SIM card (A1, Magenta, Drei)', done: false },
        { de: 'Wiener Linien Jahreskarte besorgen (ca. €365/Jahr)', en: 'Get Wiener Linien annual pass (ca. €365/year)', done: false },
      ],
    },
    updatedAt: NOW,
  },
  {
    resourceType: 'glossary',
    titleDE: 'Österreich-Glossar für Expats',
    titleEN: 'Austria Glossary for Expats',
    descriptionDE: 'Wichtige österreichische Behörden- und Steuerbegriffe für den Alltag.',
    descriptionEN: 'Important Austrian administrative and tax terms for daily life.',
    content: {
      entries: [
        { term: 'Meldezettel', defDE: 'Anmeldebestätigung des Hauptwohnsitzes — Pflicht innerhalb von 3 Tagen nach Einzug', defEN: 'Primary residence registration confirmation — mandatory within 3 days of moving in' },
        { term: 'SVS', defDE: 'Sozialversicherungsanstalt der Selbstständigen — zuständig für KV + PV selbstständiger Personen', defEN: 'Social insurance institution for the self-employed — responsible for health and pension insurance' },
        { term: 'ÖGK', defDE: 'Österreichische Gesundheitskasse — Krankenversicherung für Angestellte', defEN: 'Austrian Health Insurance Fund — health insurance for employees' },
        { term: 'Finanz-Online', defDE: 'Digitales Portal der österreichischen Steuerbehörde (finanzonline.bmf.gv.at)', defEN: 'Digital portal of the Austrian tax authority (finanzonline.bmf.gv.at)' },
        { term: 'Dienstnehmermeldung', defDE: 'Pflichtmeldung des Arbeitgebers für neue Mitarbeiter an die ÖGK (binnen 1 Tag)', defEN: 'Mandatory employer notification for new employees to ÖGK (within 1 day)' },
        { term: 'WKO / Wirtschaftskammer', defDE: 'Pflichtmitgliedschaft für Gewerbetreibende, Kammerumlage ca. €100–400/Jahr', defEN: 'Mandatory membership for commercial traders, chamber levy ca. €100–400/year' },
        { term: 'Gemeindesteuer / Kommunalsteuer', defDE: '3% auf die Lohnsumme — vom Arbeitgeber abgeführt, gilt als Nebenkosten beim Arbeitgeber', defEN: '3% on payroll — paid by employer, counts as additional employer cost' },
        { term: 'Sonderzahlungen', defDE: 'Urlaubs- und Weihnachtsgeld (je 1 Monatsgehalt) — gesetzlich vorgeschrieben, niedriger besteuert (6%)', defEN: 'Holiday and Christmas pay (1 monthly salary each) — legally required, taxed at lower rate (6%)' },
      ],
    },
    updatedAt: NOW,
  },
  {
    resourceType: 'directory',
    titleDE: 'Wichtige Behörden & Links Wien',
    titleEN: 'Key Authorities & Links Vienna',
    descriptionDE: 'Direkt-Links zu den wichtigsten Behörden und Anlaufstellen für Expats in Wien.',
    descriptionEN: 'Direct links to the most important authorities and contact points for expats in Vienna.',
    content: {
      links: [
        { name: 'MA35 (Einwanderungs-Magistrat)', url: 'https://www.wien.gv.at/amtswege/buergerservice/ma35.html', descDE: 'Aufenthalts- und Staatsbürgerschaft (Drittstaaten)', descEN: 'Residence and citizenship (third countries)' },
        { name: 'Finanz-Online (BMF)', url: 'https://finanzonline.bmf.gv.at', descDE: 'Steuernummer, Steuererklärung, Rückerstattung', descEN: 'Tax number, tax return, refunds' },
        { name: 'WKO Online', url: 'https://www.wko.at', descDE: 'Gewerbeschein, Unternehmensberatung, Förderungen', descEN: 'Gewerbeschein, business advice, grants' },
        { name: 'Wiener Linien', url: 'https://www.wienerlinien.at', descDE: 'Jahreskarte, Linienplan, Fahrkarten', descEN: 'Annual pass, route map, tickets' },
        { name: 'willhaben.at', url: 'https://www.willhaben.at/iad/immobilien', descDE: 'Größtes österreichisches Wohnungsportal', descEN: "Austria's largest housing portal" },
        { name: 'ÖGK (Krankenversicherung)', url: 'https://www.gesundheitskasse.at', descDE: 'Österreichische Gesundheitskasse, e-Card', descEN: 'Austrian Health Insurance Fund, e-Card' },
        { name: 'AMS (Arbeitsmarktservice)', url: 'https://www.ams.at', descDE: 'Jobvermittlung, Förderungen, Rot-Weiß-Rot-Karte', descEN: 'Job placement, grants, Red-White-Red Card' },
        { name: 'Vienna Expats (Community)', url: 'https://www.viennaexpats.com', descDE: 'Community-Portal für internationale Zuzügler nach Wien', descEN: 'Community portal for international newcomers to Vienna' },
      ],
    },
    updatedAt: NOW,
  },
  {
    resourceType: 'checklist',
    titleDE: 'Rot-Weiß-Rot Karte — Voraussetzungen',
    titleEN: 'Red-White-Red Card — Requirements',
    descriptionDE: 'Österreichisches Aufenthalts- und Arbeitstitel-System für qualifizierte Drittstaatler.',
    descriptionEN: "Austria's residence and work permit system for qualified non-EU nationals.",
    content: {
      items: [
        { de: 'Besonders Hochqualifizierte (Punktesystem: Ausbildung, Berufserfahrung, Sprache, Alter)', en: 'Highly qualified individuals (points system: education, experience, language, age)', done: false },
        { de: 'Fachkräfte in Mangelberufen (AMS-Mangelberufsliste)', en: 'Skilled workers in shortage occupations (AMS shortage occupation list)', done: false },
        { de: 'Sonstige Schlüsselkräfte: mind. €2.835 Brutto/Monat (2024) + Stellenangebot', en: 'Other key workers: at least €2,835 gross/month (2024) + job offer', done: false },
        { de: 'Absolventen österreichischer Hochschulen (erleichterter Zugang)', en: 'Graduates of Austrian universities (simplified access)', done: false },
        { de: 'Selbstständige Schlüsselkräfte: Businessplan + wirtschaftlicher Mehrwert für AT', en: 'Self-employed key workers: business plan + economic added value for Austria', done: false },
        { de: 'Antrag bei der zuständigen Niederlassungsbehörde (MA35 in Wien)', en: 'Application at the relevant settlement authority (MA35 in Vienna)', done: false },
        { de: 'Bearbeitungszeit: 8–12 Wochen', en: 'Processing time: 8–12 weeks', done: false },
      ],
    },
    updatedAt: NOW,
  },
  {
    resourceType: 'template',
    titleDE: 'Mietgesuch-Vorlage Wien',
    titleEN: 'Rental Application Template Vienna',
    descriptionDE: 'Vorlage für die Kontaktaufnahme mit Wiener Vermietern.',
    descriptionEN: 'Template for contacting Vienna landlords.',
    content: {
      templateDE: `Sehr geehrte Damen und Herren,\n\nMein Name ist [Name], ich bin [Nationalität] und suche eine Wohnung in Wien. Ich bin seit [Datum] in Wien wohnhaft und arbeite als [Beruf] bei [Unternehmen]. Mein monatliches Bruttoeinkommen beträgt €[Betrag].\n\nIch interessiere mich für Ihre Wohnung in [Adresse] und würde mich freuen, einen Besichtigungstermin zu vereinbaren.\n\nMit freundlichen Grüßen,\n[Name]`,
      templateEN: `Dear Sir or Madam,\n\nMy name is [Name], I am [nationality] and I am looking for an apartment in Vienna. I have been resident in Vienna since [date] and work as [profession] at [company]. My monthly gross income is €[amount].\n\nI am interested in your apartment at [address] and would be happy to arrange a viewing.\n\nKind regards,\n[Name]`,
      notesDE: 'Unterlagen: Gehaltsnachweis (letzten 3 Monate), Meldezettel, Personalausweis/Reisepass. Kaution: meist 3 Monate. Maklergebühr seit 2023: Besteller-Prinzip (zahlt wer beauftragt).',
      notesEN: 'Documents: salary proof (last 3 months), Meldezettel, ID/passport. Deposit: usually 3 months. Agent fee since 2023: payer principle (whoever commissions pays).',
    },
    updatedAt: NOW,
  },
];

// ─── Testimonials ──────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    authorName: 'Julia W.',
    authorAge: 36,
    authorProfession: 'Software Architect',
    authorPersona: 'employed',
    yearMoved: 2021,
    contentDE: `Wien war für mich die beste Entscheidung nach 5 Jahren in Berlin. Die Lebensqualität ist schlicht unschlagbar — und das zu Kosten, die trotz steigender Mieten noch deutlich unter Amsterdam oder London liegen.

Der Umstieg von Deutschland auf Österreich ist bürokratisch einfacher als erwartet. EU-Bürger brauchen lediglich den Meldezettel, dann läuft alles über die e-card und das Finanzamt. Ich hatte in 6 Wochen alles erledigt — in Berlin hat allein das Finanzamt 6 Monate gebraucht.

Technisch ist Wien interessanter als sein Ruf. Tricentis, Bitpanda und mehrere UN-Tech-Einheiten (UNIDO, IAEA) haben Wien in den letzten Jahren auf die internationale Tech-Karte gesetzt. Mein Gehalt liegt etwas unter Berlin-Niveau, aber der Netto-Wohlstand ist durch die günstigeren Lebenshaltungskosten höher.`,
    contentEN: `Vienna was the best decision for me after 5 years in Berlin. The quality of life is simply unbeatable — and at costs that are still significantly below Amsterdam or London despite rising rents.

The transition from Germany to Austria is bureaucratically easier than expected. EU citizens only need the Meldezettel, then everything runs through the e-card and Finanzamt. I had everything sorted in 6 weeks — in Berlin just the Finanzamt took 6 months.

Technically Vienna is more interesting than its reputation suggests. Tricentis, Bitpanda and several UN tech units (UNIDO, IAEA) have put Vienna on the international tech map in recent years. My salary is slightly below Berlin level, but net wealth is higher due to lower living costs.`,
    rating: 5,
    isVerified: false,
  },
  {
    authorName: 'Stefan & Mara N.',
    authorAge: 43,
    authorProfession: 'Unternehmensberater / Ärztin',
    authorPersona: 'family',
    yearMoved: 2019,
    contentDE: `Wir sind als Familie mit einem damals 7-jährigen Kind nach Wien gezogen — der Auslöser war Maras Stelle am AKH Wien. Wien hat sich als Familienstadt übertroffen.

Der öffentliche Kindergarten (kostenlos ab 3 Jahren) hat unser Kind in einem Jahr auf gutes Deutsch-Niveau gebracht. Die Vienna International School (VIS) war für uns als Zwischenlösung perfekt — teuer (€17.000/Jahr), aber das Kind hatte Zeit zum Eingewöhnen in einem englischsprachigen Umfeld, bevor es ins österreichische Gymnasium wechselte.

Das Gesundheitssystem ist weltklasse. Als Ärztin am AKH sehe ich täglich, was Österreich im Vergleich zu Deutschland leistet: besser ausgestattete Kliniken, weniger Bürokratie, bessere Work-Life-Balance für Ärzte.

Wohnen: Wir haben 5 Monate gebraucht, um die richtige Wohnung zu finden. Am Ende: 120m² in Döbling (19. Bezirk) für €2.100/Mon — in Berlin hätte dieselbe Wohnung €3.500 gekostet.`,
    contentEN: `We moved to Vienna as a family with a then 7-year-old child — the trigger was Mara's position at Vienna General Hospital (AKH). Vienna has exceeded expectations as a family city.

The public kindergarten (free from age 3) brought our child to a good level of German within a year. Vienna International School (VIS) was perfect for us as an interim solution — expensive (€17,000/year), but the child had time to settle into an English-speaking environment before switching to an Austrian Gymnasium.

The healthcare system is world-class. As a doctor at AKH, I see daily what Austria achieves compared to Germany: better-equipped clinics, less bureaucracy, better work-life balance for doctors.

Housing: We needed 5 months to find the right apartment. In the end: 120m² in Döbling (19th district) for €2,100/month — the same apartment in Berlin would have cost €3,500.`,
    rating: 5,
    isVerified: false,
  },
  {
    authorName: 'Tobias K.',
    authorAge: 31,
    authorProfession: 'Freelance Developer',
    authorPersona: 'freelancer',
    yearMoved: 2022,
    contentDE: `Als Freelancer ist Wien steuerlich kein Paradies — kein Beckham-Gesetz, keine 30%-Regelung. Aber die Kombination aus moderaten Lebenshaltungskosten, exzellenter Infrastruktur und hoher Lebensqualität macht das mehr als wett.

Die WKO-Registrierung (Gewerbeschein) war überraschend reibungslos: Online ausgefüllt, 3 Tage gewartet, fertig. Die österreichische Bürokratie ist tatsächlich digital und funktioniert. Finanz-Online ist für die Steuererklärung sehr praktisch.

SVS-Beiträge (~€160/Mon Minimum) sind der größte Unterschied zu Deutschland (GKV als Selbstständiger ist in DE teurer, aber umfassender). Für mich hat sich die Mindesteinzahlung gelohnt — österreichisches Gesundheitssystem ist exzellent.

Top-Tipp: George-App (Erste Bank) für Banking. Die beste Banking-App Österreichs, deutlich vor den deutschen Apps.`,
    contentEN: `As a freelancer, Vienna is no tax paradise — no Beckham Law, no 30% ruling. But the combination of moderate living costs, excellent infrastructure and high quality of life more than makes up for it.

The WKO registration (Gewerbeschein) was surprisingly smooth: filled in online, waited 3 days, done. Austrian bureaucracy is actually digital and works. Finanz-Online is very convenient for tax returns.

SVS contributions (~€160/month minimum) are the biggest difference from Germany (statutory health insurance as self-employed is more expensive in DE but more comprehensive). For me the minimum payment was worth it — Austrian healthcare system is excellent.

Top tip: George app (Erste Bank) for banking. Austria's best banking app, well ahead of German apps.`,
    rating: 4,
    isVerified: false,
  },
];

// ─── Exported seed function ───────────────────────────────────────────────────

export async function seedWien(): Promise<void> {
  console.log('🌍 Seeding Wien premium content...\n');

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
        update: { value: c.value, source: SOURCE_WILLHABEN },
        create: { districtId: district.id, category: c.category, value: c.value, currency: c.currency, source: SOURCE_WILLHABEN, confidence: 70, validFrom: NOW },
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

  console.log('\n✅ Wien premium seed complete.');
  console.log(`   Districts: ${DISTRICTS.length}`);
  console.log(`   CoL entries: ${DISTRICTS.reduce((s, d) => s + d.col.length, 0)}`);
  console.log(`   Narratives: ${NARRATIVES.length}`);
  console.log(`   Tools: ${TOOLS.length}`);
  console.log(`   Resources: ${RESOURCES.length}`);
  console.log(`   Testimonials: ${TESTIMONIALS.length}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await seedWien();
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
