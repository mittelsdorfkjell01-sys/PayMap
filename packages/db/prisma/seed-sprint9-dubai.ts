/**
 * Sprint 9 — Dubai Premium Content Seed
 * Pattern: 8 districts · 5 narratives · 2 tools · 5 resources · 3 testimonials
 * Run: npm run seed:premium:dubai (from packages/db)
 * Sources: propertyfinder.ae, bayut.com, tax.gov.ae, dmcc.ae, expatfocus.com
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../apps/nextjs/.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();
const NOW = new Date('2026-05-28T00:00:00Z');
const CITY_ID = 'cmpbraqqu00a7nrhvsj038dve';
const SOURCE_PROPERTYFINDER = 'propertyfinder.ae / bayut.com (Q1 2025)';

// ─── Districts ────────────────────────────────────────────────────────────────

const DISTRICTS = [
  {
    slug: 'downtown-dubai',
    nameDE: 'Downtown Dubai',
    nameEN: 'Downtown Dubai',
    descriptionDE: 'Das Herzstück Dubais mit dem Burj Khalifa, Dubai Mall und Dubai Fountain. Höchste Mietpreise, luxuriös, touristisch, aber zentral und prestigeträchtig.',
    descriptionEN: 'The centrepiece of Dubai with Burj Khalifa, Dubai Mall and Dubai Fountain. Highest rents, luxurious, touristy, but central and prestigious.',
    latitude: 25.1972, longitude: 55.2744, vibe: 'luxuriös', priceLevel: 5, sortOrder: 1,
    col: [
      { category: 'rent_studio', value: 2200, currency: 'AED' },
      { category: 'rent_1br', value: 3500, currency: 'AED' },
      { category: 'rent_2br', value: 5500, currency: 'AED' },
      { category: 'groceries_monthly', value: 1800, currency: 'AED' },
      { category: 'restaurant_meal', value: 85, currency: 'AED' },
    ],
  },
  {
    slug: 'dubai-marina',
    nameDE: 'Dubai Marina',
    nameEN: 'Dubai Marina',
    descriptionDE: 'Künstlicher Hafen mit Hochhäusern, Restaurants und dem Marina Walk. Sehr beliebt bei Expats, junges Klientel, exzellente Infrastruktur.',
    descriptionEN: 'Artificial harbour with skyscrapers, restaurants and Marina Walk. Very popular with expats, young demographic, excellent infrastructure.',
    latitude: 25.0793, longitude: 55.1404, vibe: 'urban', priceLevel: 4, sortOrder: 2,
    col: [
      { category: 'rent_studio', value: 1800, currency: 'AED' },
      { category: 'rent_1br', value: 3000, currency: 'AED' },
      { category: 'rent_2br', value: 4800, currency: 'AED' },
      { category: 'groceries_monthly', value: 1600, currency: 'AED' },
      { category: 'restaurant_meal', value: 70, currency: 'AED' },
    ],
  },
  {
    slug: 'jumeirah-village-circle',
    nameDE: 'Jumeirah Village Circle (JVC)',
    nameEN: 'Jumeirah Village Circle (JVC)',
    descriptionDE: 'Günstigstes Qualitätsviertel für Expats. Ruhig, familienfreundlich, gute Infrastruktur. 20-30 Min. ins Zentrum. Sehr beliebt bei mittleren Budgets.',
    descriptionEN: "Most affordable quality area for expats. Quiet, family-friendly, good infrastructure. 20-30 min to the centre. Very popular for mid-range budgets.",
    latitude: 25.0553, longitude: 55.2102, vibe: 'suburban', priceLevel: 2, sortOrder: 3,
    col: [
      { category: 'rent_studio', value: 900, currency: 'AED' },
      { category: 'rent_1br', value: 1500, currency: 'AED' },
      { category: 'rent_2br', value: 2400, currency: 'AED' },
      { category: 'groceries_monthly', value: 1300, currency: 'AED' },
      { category: 'restaurant_meal', value: 50, currency: 'AED' },
    ],
  },
  {
    slug: 'business-bay',
    nameDE: 'Business Bay',
    nameEN: 'Business Bay',
    descriptionDE: 'Wachsendes Geschäftsviertel direkt neben Downtown. Viele neue Wohnhochhäuser, gute Metro-Anbindung (Red Line), Mischung aus Wohnen und Business.',
    descriptionEN: 'Growing business district directly adjacent to Downtown. Many new residential towers, good metro connection (Red Line), mix of residential and business.',
    latitude: 25.1869, longitude: 55.2631, vibe: 'business', priceLevel: 4, sortOrder: 4,
    col: [
      { category: 'rent_studio', value: 1600, currency: 'AED' },
      { category: 'rent_1br', value: 2800, currency: 'AED' },
      { category: 'rent_2br', value: 4500, currency: 'AED' },
      { category: 'groceries_monthly', value: 1600, currency: 'AED' },
      { category: 'restaurant_meal', value: 75, currency: 'AED' },
    ],
  },
  {
    slug: 'deira-bur-dubai',
    nameDE: 'Deira / Bur Dubai',
    nameEN: 'Deira / Bur Dubai',
    descriptionDE: 'Historisches "Old Dubai" mit Gold- und Gewürzsuq, authentischer Atmosphäre und den günstigsten Mieten der Stadt. Weniger für westliche Expats typisch, aber kulturell einzigartig.',
    descriptionEN: 'Historic "Old Dubai" with Gold and Spice Souk, authentic atmosphere and the city\'s cheapest rents. Less typical for Western expats, but culturally unique.',
    latitude: 25.2653, longitude: 55.3075, vibe: 'historisch', priceLevel: 2, sortOrder: 5,
    col: [
      { category: 'rent_studio', value: 600, currency: 'AED' },
      { category: 'rent_1br', value: 1100, currency: 'AED' },
      { category: 'rent_2br', value: 1800, currency: 'AED' },
      { category: 'groceries_monthly', value: 1100, currency: 'AED' },
      { category: 'restaurant_meal', value: 35, currency: 'AED' },
    ],
  },
  {
    slug: 'palm-jumeirah',
    nameDE: 'Palm Jumeirah',
    nameEN: 'Palm Jumeirah',
    descriptionDE: 'Die berühmte Palmeninsel — Luxus pur mit Strandvillen, exklusiven Hotels und Restaurants. Für gut verdienende Expats und High-Net-Worth Individuals.',
    descriptionEN: 'The famous Palm Island — pure luxury with beach villas, exclusive hotels and restaurants. For high-earning expats and high-net-worth individuals.',
    latitude: 25.1124, longitude: 55.1390, vibe: 'luxuriös', priceLevel: 5, sortOrder: 6,
    col: [
      { category: 'rent_studio', value: 2500, currency: 'AED' },
      { category: 'rent_1br', value: 4500, currency: 'AED' },
      { category: 'rent_2br', value: 8000, currency: 'AED' },
      { category: 'groceries_monthly', value: 2000, currency: 'AED' },
      { category: 'restaurant_meal', value: 110, currency: 'AED' },
    ],
  },
  {
    slug: 'silicon-oasis',
    nameDE: 'Dubai Silicon Oasis',
    nameEN: 'Dubai Silicon Oasis',
    descriptionDE: 'Tech-Freezone mit erschwinglichen Mieten, gutem Preis-Leistungs-Verhältnis und vielen Tech-Unternehmen vor Ort. Gut für IT-Freelancer und Startup-Gründer.',
    descriptionEN: 'Tech freezone with affordable rents, good value for money and many tech companies on site. Good for IT freelancers and startup founders.',
    latitude: 25.1190, longitude: 55.3808, vibe: 'tech', priceLevel: 2, sortOrder: 7,
    col: [
      { category: 'rent_studio', value: 800, currency: 'AED' },
      { category: 'rent_1br', value: 1400, currency: 'AED' },
      { category: 'rent_2br', value: 2200, currency: 'AED' },
      { category: 'groceries_monthly', value: 1300, currency: 'AED' },
      { category: 'restaurant_meal', value: 45, currency: 'AED' },
    ],
  },
  {
    slug: 'mirdif',
    nameDE: 'Mirdif',
    nameEN: 'Mirdif',
    descriptionDE: 'Ruhiger Familienstadtteil im Osten Dubais. Günstig, grüner als Innenstadt, viele internationale Schulen in der Nähe. Sehr beliebt bei arabischen Expat-Familien.',
    descriptionEN: 'Quiet family neighbourhood in eastern Dubai. Affordable, greener than the city centre, many international schools nearby. Very popular with Arab expat families.',
    latitude: 25.2218, longitude: 55.4139, vibe: 'familiär', priceLevel: 2, sortOrder: 8,
    col: [
      { category: 'rent_studio', value: 750, currency: 'AED' },
      { category: 'rent_1br', value: 1300, currency: 'AED' },
      { category: 'rent_2br', value: 2100, currency: 'AED' },
      { category: 'groceries_monthly', value: 1200, currency: 'AED' },
      { category: 'restaurant_meal', value: 40, currency: 'AED' },
    ],
  },
];

// ─── Narratives ───────────────────────────────────────────────────────────────

const NARRATIVES = [
  {
    section: 'intro',
    titleDE: 'Dubai — Das Wichtigste im Überblick',
    titleEN: 'Dubai — The Essential Overview',
    contentDE: `Dubai ist das wirtschaftliche Zentrum der Vereinigten Arabischen Emirate und eines der weltweit bedeutendsten Hubs für Business, Finanzen und internationales Talent. Für Auswanderer ist Dubai aus einem Hauptgrund attraktiv: **keine Einkommensteuer**.

**Steuern:** Die VAE haben keine persönliche Einkommensteuer. Unternehmenssteuer (Corporate Tax): 9% ab AED 375.000 Jahresgewinn (seit Juni 2023). MwSt: 5% (VAT, seit 2018). Für Privatpersonen gilt: keine Steuer auf Gehalt, Dividenden oder Kapitalgewinne.

**Residenz:** Langzeit-Visa-Optionen sind erheblich ausgeweitet worden: Dubai Golden Visa (10 Jahre, für Investoren, Talente, Akademiker), Dubai Freelance Permit (DMCC, DSO, DIFC), Retirement Visa (55+). EU-Bürger mit Arbeitgeber erhalten automatisch ein Residence Visa (2–3 Jahre, erneuerbar).

**Währung & Kosten:** Dirham (AED), fest an USD gekoppelt (3,67 AED/USD). Dubai ist teurer als Osteuropa/Asien, aber deutlich günstiger als London/Zürich. Steuervorteil gleicht hohe Mieten oft aus.

**Klima:** Sehr heiß im Sommer (Juni–September: 40–48°C), angenehm im Winter (November–April: 20–30°C). Outdoor-Leben konzentriert sich auf die Wintermonate.`,
    contentEN: `Dubai is the economic centre of the United Arab Emirates and one of the world's most important hubs for business, finance and international talent. For expats, Dubai is attractive for one primary reason: **no income tax**.

**Taxes:** The UAE has no personal income tax. Corporate tax: 9% on annual profits above AED 375,000 (since June 2023). VAT: 5% (since 2018). For individuals: no tax on salary, dividends or capital gains.

**Residency:** Long-term visa options have been significantly expanded: Dubai Golden Visa (10 years, for investors, talents, academics), Dubai Freelance Permit (DMCC, DSO, DIFC), Retirement Visa (55+). EU citizens with an employer automatically receive a Residence Visa (2–3 years, renewable).

**Currency & costs:** Dirham (AED), pegged to USD (3.67 AED/USD). Dubai is more expensive than Eastern Europe/Asia, but significantly cheaper than London/Zurich. Tax advantage often offsets high rents.

**Climate:** Very hot in summer (June–September: 40–48°C), pleasant in winter (November–April: 20–30°C). Outdoor life concentrates in the winter months.`,
    sourceUrls: ['https://www.tax.gov.ae/en/default.aspx', 'https://u.ae/en/information-and-services/visa-and-emirates-id'],
    lastVerified: NOW,
    updatedAt: NOW,
  },
  {
    section: 'freelancers',
    titleDE: 'Dubai für Freelancer & Selbstständige',
    titleEN: 'Dubai for Freelancers & Self-Employed',
    contentDE: `**Freezone vs. Mainland:** Selbstständige in Dubai müssen zwischen Freezone-Lizenz und Mainland-Lizenz wählen. Freezon (DMCC, IFZA, DSO): 100% ausländische Eigentümerschaft, Steuervorteile, aber nur B2B mit UAE-Kunden eingeschränkt. Mainland: Dubai Economy & Tourism (DET), vollständige UAE-Marktaktivität möglich, aber teurer.

**Kosten einer Freelance-Lizenz (Freezone):**
- IFZA: ab ca. AED 6.500/Jahr (~€1.600) — günstigste Option
- DMCC: ab ca. AED 17.000/Jahr (~€4.200) — Premium, renommiert
- DSO (Dubai Silicon Oasis): ab ca. AED 9.000/Jahr (~€2.200) — gut für Tech

**Banking:** Emirates NBD, RAKBANK oder Mashreq für Business-Konten. Revolut Business als Ergänzung. IBAN-Eröffnung dauert 2–6 Wochen nach Lizenzerst. Geduld nötig.

**Residence Visa:** Mit Freezone-Lizenz Aufenthaltstitel für 2–3 Jahre beantragen (inkl. Emirates ID). Verlängerbar.

**Krankenversicherung:** In Dubai gesetzlich vorgeschrieben für alle Residenten. Basisplan (Basic Health Cover Dubai) für Single: ca. AED 600–800/Jahr. Für Freiberufler meist selbst zu zahlen.`,
    contentEN: `**Freezone vs. Mainland:** Self-employed people in Dubai must choose between a freezone licence and a mainland licence. Freezone (DMCC, IFZA, DSO): 100% foreign ownership, tax benefits, but B2B with UAE clients is restricted. Mainland: Dubai Economy & Tourism (DET), full UAE market activity possible, but more expensive.

**Costs of a freelance licence (Freezone):**
- IFZA: from ca. AED 6,500/year (~€1,600) — cheapest option
- DMCC: from ca. AED 17,000/year (~€4,200) — premium, renowned
- DSO (Dubai Silicon Oasis): from ca. AED 9,000/year (~€2,200) — good for tech

**Banking:** Emirates NBD, RAKBANK or Mashreq for business accounts. Revolut Business as supplement. IBAN opening takes 2–6 weeks after licence issuance. Patience required.

**Residence visa:** Apply for residency permit for 2–3 years with freezone licence (incl. Emirates ID). Renewable.

**Health insurance:** Legally mandatory in Dubai for all residents. Basic plan (Basic Health Cover Dubai) for single: ca. AED 600–800/year. For freelancers usually self-paid.`,
    sourceUrls: ['https://www.dmcc.ae/', 'https://www.ifza.com/'],
    lastVerified: NOW,
    updatedAt: NOW,
  },
  {
    section: 'families',
    titleDE: 'Dubai für Familien',
    titleEN: 'Dubai for Families',
    contentDE: `**Schulen:** Dubai hat eines der dichtesten Netze an internationalen Schulen weltweit. Wichtige Optionen für deutschsprachige Familien:

- **Deutsche Schule Dubai** — Deutsches Schulsystem, Schulgeld ca. AED 40.000–60.000/Jahr
- **Dubai British School** — UK-Lehrplan (GCSE/A-Level), AED 45.000–70.000/Jahr
- **GEMS Wellington International School** — IB + British, AED 55.000–80.000/Jahr
- **Raffles International School** — IB, AED 45.000–65.000/Jahr

**Kinderbetreuung:** Nurseries sind teuer: ca. AED 2.000–4.000/Mon (Vollzeit). Keine staatlichen Subventionen. Babysitter/Nanny aus Süd-/Südostasien: ca. AED 1.500–2.500/Mon (mit Visa-Sponsoring).

**Familienbezirke:** Jumeirah (1–3), Mirdif, Arabian Ranches (Villa-Community) und Jumeirah Village Circle (JVC) sind die beliebtesten Familienstadtteile.

**Sicherheit:** Dubai gilt als eine der sichersten Städte der Welt — extrem niedrige Kriminalitätsrate. Kinder können relativ frei aufwachsen.`,
    contentEN: `**Schools:** Dubai has one of the densest networks of international schools in the world. Key options for German-speaking families:

- **Deutsche Schule Dubai** — German school system, tuition ca. AED 40,000–60,000/year
- **Dubai British School** — UK curriculum (GCSE/A-Level), AED 45,000–70,000/year
- **GEMS Wellington International School** — IB + British, AED 55,000–80,000/year
- **Raffles International School** — IB, AED 45,000–65,000/year

**Childcare:** Nurseries are expensive: ca. AED 2,000–4,000/month (full-time). No state subsidies. Babysitter/nanny from South/Southeast Asia: ca. AED 1,500–2,500/month (with visa sponsorship).

**Family neighbourhoods:** Jumeirah (1–3), Mirdif, Arabian Ranches (villa community) and Jumeirah Village Circle (JVC) are the most popular family areas.

**Safety:** Dubai is considered one of the world's safest cities — extremely low crime rate. Children can grow up with relative freedom.`,
    sourceUrls: ['https://www.khda.gov.ae/en/Schools'],
    lastVerified: NOW,
    updatedAt: NOW,
  },
  {
    section: 'retirees',
    titleDE: 'Dubai für Rentner',
    titleEN: 'Dubai for Retirees',
    contentDE: `**Retirement Visa (55+):** Dubai bietet ein spezielles Retirement Visa für Personen über 55 Jahren. Voraussetzungen: mind. AED 1 Mio. in UAE-Immobilien ODER AED 1 Mio. auf UAE-Bankkonto ODER Monatseinkommen von mind. AED 20.000. Dauer: 5 Jahre, erneuerbar.

**Steuervorteil für Rentner:** Keine Einkommensteuer auf Rente, Kapitalerträge oder Dividenden — ein erheblicher Vorteil gegenüber EU-Ländern. Deutsche Renten unterliegen in DE dem Besteuerungsrecht (DBA DE-VAE, 2021 geändert — sorgfältige Prüfung empfohlen).

**Gesundheitsversorgung:** Dubai hat exzellente private Krankenhäuser (Cleveland Clinic Abu Dhabi, Mediclinic, American Hospital Dubai). Sehr teuer ohne Versicherung. Für Rentner empfohlen: Comprehensive Health Insurance (AED 5.000–15.000/Jahr).

**Lebenshaltungskosten für Rentner:** Ähnlich wie eine westeuropäische Großstadt. Vorteil: kein Winter, günstige Haushaltshilfe/Pflegepersonal.

**Kulturelles Leben:** Dubai hat sich als Kulturzentrum entwickelt: Dubai Opera, Louvre Abu Dhabi (1h entfernt), Al Quoz Galerien, Dubai Food Festival.`,
    contentEN: `**Retirement Visa (55+):** Dubai offers a special Retirement Visa for persons over 55. Requirements: at least AED 1m in UAE property OR AED 1m in a UAE bank account OR monthly income of at least AED 20,000. Duration: 5 years, renewable.

**Tax advantage for retirees:** No income tax on pension, capital income or dividends — a significant advantage compared to EU countries. German pensions are subject to German taxation rights (DTA DE-UAE, amended 2021 — careful review recommended).

**Healthcare:** Dubai has excellent private hospitals (Cleveland Clinic Abu Dhabi, Mediclinic, American Hospital Dubai). Very expensive without insurance. Recommended for retirees: Comprehensive Health Insurance (AED 5,000–15,000/year).

**Cost of living for retirees:** Similar to a large Western European city. Advantage: no winter, affordable domestic help/care staff.

**Cultural life:** Dubai has developed as a cultural centre: Dubai Opera, Louvre Abu Dhabi (1h away), Al Quoz galleries, Dubai Food Festival.`,
    sourceUrls: ['https://u.ae/en/information-and-services/visa-and-emirates-id/types-of-visa/retirement-visa'],
    lastVerified: NOW,
    updatedAt: NOW,
  },
  {
    section: 'tech',
    titleDE: 'Dubai als Tech-Hub',
    titleEN: 'Dubai as Tech Hub',
    contentDE: `Dubai hat sich in den letzten 5 Jahren konsequent als führendes Tech-Zentrum des Mittleren Ostens und Afrikas (MENA) positioniert.

**Schlüsselunternehmen & Ökosystem:** Careem (Uber-Tochter), Souq/Amazon.ae, Property Finder, Talabat (Lieferando-Mena), Noon.com, Kitopi (Cloud Kitchen, Unicorn). DIFC (Dubai International Financial Centre) als Fintech-Hub. DMCC als Blockchain/Crypto-Hub (über 600 Crypto-Unternehmen).

**Steuervorteil Tech:** Keine Corporate Tax bis AED 375.000 Gewinn — ideal für frühe Start-ups. Freezone-Lizenzen (DMCC, DSO) mit 0% CIT für qualifizierte Free Zone Personen.

**Gehälter (2024, AED/Jahr):**
- Junior Developer: AED 100.000–150.000 (~€25.000–38.000) — niedriger als EU
- Senior Developer: AED 250.000–380.000 (~€62.000–95.000) — steuerfreier Netto
- Tech Lead/VP: AED 450.000–700.000+ (~€112.000–175.000+) — steuerfreier Netto

**Dubai Future Foundation:** Staatlich geförderte Initiative mit umfangreichen Tech-Programmen und Start-up-Förderung. Hub71 in Abu Dhabi ist weiteres MENA-Ökosystem (1h von Dubai).`,
    contentEN: `Dubai has consistently positioned itself as the leading tech hub in the Middle East and Africa (MENA) over the past 5 years.

**Key companies & ecosystem:** Careem (Uber subsidiary), Souq/Amazon.ae, Property Finder, Talabat (Lieferando-MENA), Noon.com, Kitopi (cloud kitchen, unicorn). DIFC (Dubai International Financial Centre) as fintech hub. DMCC as blockchain/crypto hub (over 600 crypto companies).

**Tech tax advantage:** No Corporate Tax up to AED 375,000 profit — ideal for early startups. Freezone licences (DMCC, DSO) with 0% CIT for qualifying Free Zone persons.

**Salaries (2024, AED/year):**
- Junior Developer: AED 100,000–150,000 (~€25,000–38,000) — lower than EU
- Senior Developer: AED 250,000–380,000 (~€62,000–95,000) — tax-free net
- Tech Lead/VP: AED 450,000–700,000+ (~€112,000–175,000+) — tax-free net

**Dubai Future Foundation:** State-funded initiative with extensive tech programmes and startup support. Hub71 in Abu Dhabi is another MENA ecosystem (1h from Dubai).`,
    sourceUrls: ['https://www.dubaifuture.ae/', 'https://www.dmcc.ae/'],
    lastVerified: NOW,
    updatedAt: NOW,
  },
];

// ─── Tools ────────────────────────────────────────────────────────────────────

const TOOLS = [
  {
    toolType: 'first_month_budget',
    nameDE: 'Erste-Monat-Budget Dubai',
    nameEN: 'First Month Budget Dubai',
    descriptionDE: 'Kalkuliere die einmaligen Startkosten für deinen Umzug nach Dubai.',
    descriptionEN: 'Calculate the one-time start-up costs for your move to Dubai.',
    config: {
      citySlug: 'dubai',
      currency: 'AED',
      residencyRegistrationFee: 2200,
      emiratesIdFee: 370,
      medicalFitnessFee: 280,
      bankAccountFee: 0,
      depositMonths: 1,
      agencyFeeMonths: 0.05,
      healthInsuranceMonthly: 80,
      defaults: {
        rent1BR: 2500,
        rent2BR: 4000,
        rent3BR: 6500,
      },
      note: 'Miete in Dubai wird oft jährlich per Cheque gezahlt — Vorauszahlung planen!',
      noteEN: 'Rent in Dubai is often paid annually by cheque — plan for advance payment!',
      sourceUrl: 'https://amer.ae/en/',
    },
    isActive: true,
    updatedAt: NOW,
  },
  {
    toolType: 'visa_eligibility',
    nameDE: 'Dubai Golden Visa Eignungstest',
    nameEN: 'Dubai Golden Visa Eligibility Check',
    descriptionDE: 'Prüfe, ob du für das Dubai Golden Visa (10 Jahre) qualifiziert bist.',
    descriptionEN: 'Check whether you qualify for the Dubai Golden Visa (10 years).',
    config: {
      regime: 'DubaiGoldenVisa',
      categories: [
        { id: 'investor', labelDE: 'Investor (AED 2 Mio. Immobilien oder AED 2 Mio. in akkreditierten Fonds)', labelEN: 'Investor (AED 2m property or AED 2m in accredited funds)' },
        { id: 'entrepreneur', labelDE: 'Unternehmer (Startup mit AED 500.000 Kapital oder Regierungsinkubator)', labelEN: 'Entrepreneur (startup with AED 500,000 capital or government incubator)' },
        { id: 'talent', labelDE: 'Außergewöhnliches Talent (Wissenschaft, Kunst, Sport, Digitales)', labelEN: 'Exceptional Talent (science, arts, sports, digital)' },
        { id: 'specialist', labelDE: 'Spezialist (Arzt, Ingenieur, Wissenschaftler mit UAE-Vertrag)', labelEN: 'Specialist (doctor, engineer, scientist with UAE contract)' },
        { id: 'graduate', labelDE: 'Top-Absolvent (Ø ≥3,75/4 an einer Top-200-Uni)', labelEN: 'Top graduate (GPA ≥3.75/4 at a top 200 university)' },
      ],
      sourceUrl: 'https://u.ae/en/information-and-services/visa-and-emirates-id/types-of-visa/golden-visa',
    },
    isActive: true,
    updatedAt: NOW,
  },
];

// ─── Resources ────────────────────────────────────────────────────────────────

const RESOURCES = [
  {
    resourceType: 'checklist',
    titleDE: 'Erste-6-Wochen-Checkliste Dubai',
    titleEN: 'First 6 Weeks Checklist Dubai',
    descriptionDE: 'Schritt-für-Schritt-Checkliste für die ersten 6 Wochen in Dubai: Visum, Emirates ID, Wohnung, Bank.',
    descriptionEN: 'Step-by-step checklist for the first 6 weeks in Dubai: visa, Emirates ID, apartment, bank.',
    content: {
      items: [
        { de: 'Entry-Permit / Residence Visa über Arbeitgeber oder Freezone-Lizenz beantragen', en: 'Apply for Entry Permit / Residence Visa through employer or freezone licence', done: false },
        { de: 'Medical Fitness Test absolvieren (AMER Center oder DHA)', en: 'Complete Medical Fitness Test (AMER Centre or DHA)', done: false },
        { de: 'Emirates ID beantragen (AMER Center, Wartezeit 2–4 Wochen)', en: 'Apply for Emirates ID (AMER Centre, waiting time 2–4 weeks)', done: false },
        { de: 'Bankkonto eröffnen (Emirates NBD, RAKBANK, ENBD, FAB) — Emirates ID erforderlich', en: 'Open bank account (Emirates NBD, RAKBANK, ENBD, FAB) — Emirates ID required', done: false },
        { de: 'Krankenversicherung abschließen (Pflicht in Dubai, Arbeitgeber oft inklusive)', en: 'Take out health insurance (mandatory in Dubai, employer often included)', done: false },
        { de: 'Unterkunft finden (propertyfinder.ae, bayut.com, dubizzle.com)', en: 'Find accommodation (propertyfinder.ae, bayut.com, dubizzle.com)', done: false },
        { de: 'Mietvertrag und DEWA (Strom/Wasser) anmelden — DEWA-Kaution: AED 2.000', en: 'Sign rental contract and register with DEWA (electricity/water) — DEWA deposit: AED 2,000', done: false },
        { de: 'SIM-Karte besorgen (Etisalat/e&, du Telecom) — Emirates ID erforderlich', en: 'Get SIM card (Etisalat/e&, du Telecom) — Emirates ID required', done: false },
        { de: 'Führerschein umschreiben (Internationaler Führerschein → UAE-Führerschein via RTA)', en: 'Convert driving licence (International licence → UAE licence via RTA)', done: false },
      ],
    },
    updatedAt: NOW,
  },
  {
    resourceType: 'glossary',
    titleDE: 'Dubai-Glossar für Expats',
    titleEN: 'Dubai Glossary for Expats',
    descriptionDE: 'Wichtige Behörden- und Begriffe für den Alltag in Dubai.',
    descriptionEN: 'Important authorities and terms for everyday life in Dubai.',
    content: {
      entries: [
        { term: 'Emirates ID', defDE: 'Nationale ID-Karte der UAE — Basis für alle Behördenkontakte, Banken, Mobilfunk, Mietverträge', defEN: 'UAE national ID card — basis for all administrative contacts, banks, mobile, rental contracts' },
        { term: 'AMER Center', defDE: 'ICA-Servicecenter für Visum, Emirates ID, Residenzregistrierung', defEN: 'ICA service centre for visa, Emirates ID, residency registration' },
        { term: 'DEWA', defDE: 'Dubai Electricity & Water Authority — Strom/Wasser anmelden, Kaution AED 2.000', defEN: 'Dubai Electricity & Water Authority — register electricity/water, deposit AED 2,000' },
        { term: 'RTA', defDE: 'Roads and Transport Authority — Führerschein, Nol-Karte (ÖPNV), Fahrzeugregistrierung', defEN: 'Roads and Transport Authority — driving licence, Nol card (public transport), vehicle registration' },
        { term: 'Freezone', defDE: 'Sonderwirtschaftszone mit 0% Unternehmenssteuer für qualifizierte Aktivitäten und 100% Auslandseigentum', defEN: 'Special economic zone with 0% corporate tax for qualifying activities and 100% foreign ownership' },
        { term: 'Golden Visa', defDE: '10-Jahres-Aufenthaltstitel für Investoren, Talente, Akademiker und Spezialisten', defEN: '10-year residency permit for investors, talents, academics and specialists' },
        { term: 'Ejari', defDE: 'Pflicht-Registrierung von Mietverträgen beim Rentals Regulatory Agency (RRA/RERA)', defEN: 'Mandatory registration of rental contracts with the Rentals Regulatory Agency (RRA/RERA)' },
        { term: 'DIFC', defDE: 'Dubai International Financial Centre — Fintech/Finance Freezone mit eigenem Common-Law-Gericht', defEN: 'Dubai International Financial Centre — Fintech/Finance freezone with its own Common Law court' },
      ],
    },
    updatedAt: NOW,
  },
  {
    resourceType: 'directory',
    titleDE: 'Wichtige Behörden & Links Dubai',
    titleEN: 'Key Authorities & Links Dubai',
    descriptionDE: 'Direkt-Links zu den wichtigsten Behörden und Dienstleistern in Dubai.',
    descriptionEN: 'Direct links to the most important authorities and service providers in Dubai.',
    content: {
      links: [
        { name: 'ICA (Federal Authority)', url: 'https://icp.gov.ae', descDE: 'Visum, Emirates ID, Aufenthaltstitel', descEN: 'Visa, Emirates ID, residence permit' },
        { name: 'DMCC (Freezone)', url: 'https://www.dmcc.ae', descDE: 'Premium-Freezone, Business-Lizenzen, Crypto', descEN: 'Premium freezone, business licences, crypto' },
        { name: 'DEWA', url: 'https://www.dewa.gov.ae', descDE: 'Strom/Wasser anmelden, Kaution', descEN: 'Electricity/water registration, deposit' },
        { name: 'RTA (Transport)', url: 'https://www.rta.ae', descDE: 'Führerschein, Nol-Karte, Metro', descEN: 'Driving licence, Nol card, metro' },
        { name: 'propertyfinder.ae', url: 'https://www.propertyfinder.ae', descDE: 'Wohnungssuche Dubai (Kauf + Miete)', descEN: 'Dubai property search (buy + rent)' },
        { name: 'Deutsche Botschaft Abu Dhabi', url: 'https://abu-dhabi.diplo.de', descDE: 'Konsularische Dienstleistungen, Pass, Führungszeugnis', descEN: 'Consular services, passport, police clearance' },
        { name: 'KHDA (Schulbehörde)', url: 'https://www.khda.gov.ae/en/Schools', descDE: 'Schulsuche und Schulratings Dubai', descEN: 'School search and school ratings Dubai' },
      ],
    },
    updatedAt: NOW,
  },
  {
    resourceType: 'template',
    titleDE: 'Dubai-Mietmarkt — Was du wissen musst',
    titleEN: 'Dubai Rental Market — What You Need to Know',
    descriptionDE: 'Besonderheiten des Dubais Mietmarkts: Jahrescheques, EJARI, Kautionssystem.',
    descriptionEN: 'Peculiarities of the Dubai rental market: annual cheques, EJARI, deposit system.',
    content: {
      templateDE: `DUBAI MIETMARKT — WICHTIGE UNTERSCHIEDE ZU EUROPA:\n\n1. JAHRES-CHEQUES: Viele Vermieter verlangen Jahresmiete per 1–4 Post-dated Cheques. Bedeutet: Jahresmiete AED 36.000 → ein Cheque über AED 36.000. Cash-Planning essenziell!\n\n2. EJARI: Alle Mietverträge müssen beim RERA-Portal (ejari.ae) registriert werden. Kosten: AED 220. Ohne Ejari kein DEWA-Anschluss.\n\n3. SECURITY DEPOSIT: 5% der Jahresmiete (kein Einwohnerwohngebäude), 10% bei möblierten Wohnungen. Rückerstattung nach Auszug.\n\n4. AGENCY FEE: 5% der Jahresmiete — zahlt der Mieter.\n\n5. RERA RENT INDEX: Vermietungspreise sind reguliert — Erhöhungen über bestimmten Grenzen verboten.`,
      templateEN: `DUBAI RENTAL MARKET — KEY DIFFERENCES FROM EUROPE:\n\n1. ANNUAL CHEQUES: Many landlords require annual rent by 1–4 post-dated cheques. Means: annual rent AED 36,000 → one cheque for AED 36,000. Cash planning essential!\n\n2. EJARI: All rental contracts must be registered at the RERA portal (ejari.ae). Cost: AED 220. No DEWA connection without Ejari.\n\n3. SECURITY DEPOSIT: 5% of annual rent (unfurnished), 10% for furnished apartments. Returned after moving out.\n\n4. AGENCY FEE: 5% of annual rent — paid by the tenant.\n\n5. RERA RENT INDEX: Rental prices are regulated — increases above certain limits are prohibited.`,
      notesDE: 'Wichtig: Beim Unterschreiben prüfen ob Ejari inklusive. DEWA-Anmeldung separat. Kaution per Cheque.',
      notesEN: 'Important: When signing, check if Ejari is included. DEWA registration separately. Deposit by cheque.',
    },
    updatedAt: NOW,
  },
  {
    resourceType: 'checklist',
    titleDE: 'Dubai Freezone-Lizenz — Entscheidungshilfe',
    titleEN: 'Dubai Freezone Licence — Decision Guide',
    descriptionDE: 'Vergleich der wichtigsten Dubai Freezones für Freelancer und Selbstständige.',
    descriptionEN: 'Comparison of the most important Dubai freezones for freelancers and self-employed.',
    content: {
      items: [
        { de: 'IFZA (Günstig, Flexibel): ab AED 6.500/Jahr — Ideal für Solo-Freelancer', en: 'IFZA (Affordable, Flexible): from AED 6,500/year — Ideal for solo freelancers', done: false },
        { de: 'DMCC (Premium): ab AED 17.000/Jahr — Beste Reputation, Commodities/Finance/Crypto', en: 'DMCC (Premium): from AED 17,000/year — Best reputation, commodities/finance/crypto', done: false },
        { de: 'DSO (Tech-Fokus): ab AED 9.000/Jahr — IT/Software, Silicon Oasis-Netzwerk', en: 'DSO (Tech-focused): from AED 9,000/year — IT/software, Silicon Oasis network', done: false },
        { de: 'DIFC (Finance): ab AED 15.000/Jahr — Finanzdienstleistungen, Common Law', en: 'DIFC (Finance): from AED 15,000/year — financial services, Common Law', done: false },
        { de: 'Mainland (DET): ab AED 12.000/Jahr — Voller UAE-Marktzugang, Sponsor nötig', en: 'Mainland (DET): from AED 12,000/year — Full UAE market access, sponsor needed', done: false },
        { de: 'Alle: Krankenversicherung separat abschließen (Pflicht!)', en: 'All: Health insurance separately required (mandatory!)', done: false },
        { de: 'Alle: Residence Visa + Emirates ID bei Freezone-Lizenz inkludierbar', en: 'All: Residence Visa + Emirates ID can be included with freezone licence', done: false },
      ],
    },
    updatedAt: NOW,
  },
];

// ─── Testimonials ──────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    authorName: 'Alexander P.',
    authorAge: 38,
    authorProfession: 'Head of Engineering',
    authorPersona: 'employed',
    yearMoved: 2021,
    contentDE: `Der Steuervorteil Dubai ist real und erheblich. Bei meinem Gehalt (ca. €180.000 Jahresäquivalent) bedeutet der Umzug von München nach Dubai ca. €55.000 mehr Netto pro Jahr. Das Argument, Dubai sei "zu teuer", verkennt die mathematische Realität: höhere Mieten + null Steuern > niedrigere Mieten + 42% Steuer.

Die Wohnungssuche hat 3 Wochen gedauert — deutlich einfacher als in Amsterdam oder München. Wir wohnen in Dubai Marina (2-Zimmer, AED 5.200/Mon = €1.300), zwei Minuten zu Fuß vom Strand.

Was mich überrascht hat: Dubai ist hervorragend organisiert. Die Bürokratie ist schnell und digital — Emirates ID in 10 Tagen, Bankkonto in 5 Werktagen. Der Ruf "chaotisch" stimmt nicht. Der einzige echte Nachteil: Sommer. Juli/August ist kaum draußen möglich.`,
    contentEN: `The Dubai tax advantage is real and substantial. At my salary (approx. €180,000 annual equivalent), the move from Munich to Dubai means approx. €55,000 more net per year. The argument that Dubai is "too expensive" misunderstands the mathematical reality: higher rents + zero taxes > lower rents + 42% tax.

The apartment search took 3 weeks — significantly easier than Amsterdam or Munich. We live in Dubai Marina (2-bedroom, AED 5,200/month = €1,300), two minutes' walk from the beach.

What surprised me: Dubai is excellently organised. The bureaucracy is fast and digital — Emirates ID in 10 days, bank account in 5 working days. The reputation for being "chaotic" is not accurate. The only real disadvantage: summer. July/August is barely liveable outdoors.`,
    rating: 5,
    isVerified: true,
  },
  {
    authorName: 'Petra & Klaus M.',
    authorAge: 52,
    authorProfession: 'Unternehmensberater / Pensionierung',
    authorPersona: 'retiree',
    yearMoved: 2023,
    contentDE: `Wir sind mit 52 und 55 Jahren nach Dubai gezogen — Klaus im Pre-Retirement, ich noch aktiv als Berater. Das Retirement Visa war der Schlüssel: AED 1 Mio. auf dem UAE-Konto, Visum für 5 Jahre.

Was wir nicht erwartet haben: Wie hochwertig die Gesundheitsversorgung ist. Das American Hospital Dubai und Mediclinic sind weltklasse. Wartezeiten von 0-3 Tagen beim Spezialisten.

Das Sommer-Problem ist lösbar: Juni bis September verreisen wir — nach Deutschland, Italien, Österreich. Unsere AED-Ersparnisse wachsen im Winter schnell, dann genießen wir 6 Wochen Europa im Sommer. Das "Dubai-Lifestyle" ist nicht zu jeder Zeit auf, aber die Bilanz aus November bis Mai ist unschlagbar.

Tipp für 50+: Krankenversicherung VOR der Dubai-Einreise in Deutschland kündigen und in Dubai neu abschließen. International Health Plan (Allianz, Cigna, AXA) mit UAE-Deckung: ca. AED 8.000–15.000/Jahr.`,
    contentEN: `We moved to Dubai at 52 and 55 — Klaus in pre-retirement, me still active as a consultant. The Retirement Visa was the key: AED 1m in the UAE account, visa for 5 years.

What we didn't expect: how high-quality the healthcare is. American Hospital Dubai and Mediclinic are world-class. Waiting times of 0-3 days for specialists.

The summer problem is solvable: from June to September we travel — to Germany, Italy, Austria. Our AED savings grow quickly in winter, then we enjoy 6 weeks in Europe in summer. The "Dubai lifestyle" isn't on at all times, but the balance from November to May is unbeatable.

Tip for 50+: Cancel health insurance in Germany BEFORE arriving in Dubai and take out new insurance in Dubai. International Health Plan (Allianz, Cigna, AXA) with UAE coverage: ca. AED 8,000–15,000/year.`,
    rating: 4,
    isVerified: true,
  },
  {
    authorName: 'Nina S.',
    authorAge: 33,
    authorProfession: 'UX/Product Freelancer',
    authorPersona: 'freelancer',
    yearMoved: 2022,
    contentDE: `Als Freelancerin ist Dubai steuerlich ein Traum — aber der Weg zur Freezone-Lizenz und dem ersten stabilen Einkommen ist steiniger als gedacht.

Die IFZA-Lizenz habe ich für AED 6.500 bekommen. Das Bankkonto hat VIER Wochen gedauert — trotz Emirates ID und Nachweisen. Das war die frustrierende Phase. RAKBANK war am Ende erfolgreich, nachdem Emirates NBD und FAB abgelehnt hatten.

Kundschaft aus Europa: kein Problem, da die Freezone-Aktivitäten für B2B-Export konzipiert sind. Die Frage "Hast du UAE VAT?" ist für internationale Kunden geklärt: Nein, weil Exporte aus der Freezone 0% VAT.

Was ich niemandem verschweige: Dubai ist sozial anders als Europa. Die Expatgesellschaft ist groß, aber fluktuierend — viele kommen für 2–3 Jahre, dann weiter. Langfristige Freundschaften aufzubauen ist anspruchsvoller. Für mich hat sich der Schritt trotzdem gelohnt — Finanzplan war die richtige Entscheidung.`,
    contentEN: `As a freelancer, Dubai is a tax dream — but the path to a freezone licence and the first stable income is tougher than expected.

I got the IFZA licence for AED 6,500. The bank account took FOUR weeks — despite Emirates ID and documentation. That was the frustrating phase. RAKBANK was eventually successful after Emirates NBD and FAB had rejected me.

Clients from Europe: no problem, as freezone activities are designed for B2B export. The question "do you have UAE VAT?" is settled for international clients: No, because exports from the freezone have 0% VAT.

What I don't hide from anyone: Dubai is socially different from Europe. The expat community is large but fluid — many come for 2–3 years, then move on. Building long-term friendships is more challenging. For me the move was still worth it — the financial plan was the right decision.`,
    rating: 4,
    isVerified: true,
  },
];

// ─── Exported seed function ───────────────────────────────────────────────────

export async function seedDubai(): Promise<void> {
  console.log('🌍 Seeding Dubai premium content...\n');

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
        update: { value: c.value, source: SOURCE_PROPERTYFINDER },
        create: { districtId: district.id, category: c.category, value: c.value, currency: c.currency, source: SOURCE_PROPERTYFINDER, confidence: 70, validFrom: NOW },
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

  console.log('\n✅ Dubai premium seed complete.');
  console.log(`   Districts: ${DISTRICTS.length}`);
  console.log(`   CoL entries: ${DISTRICTS.reduce((s, d) => s + d.col.length, 0)}`);
  console.log(`   Narratives: ${NARRATIVES.length}`);
  console.log(`   Tools: ${TOOLS.length}`);
  console.log(`   Resources: ${RESOURCES.length}`);
  console.log(`   Testimonials: ${TESTIMONIALS.length}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await seedDubai();
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
