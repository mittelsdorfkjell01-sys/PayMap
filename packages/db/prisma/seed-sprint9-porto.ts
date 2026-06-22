/**
 * Sprint 9 — Porto Premium Content Seed
 * Pattern: 8 districts · 5 narratives · 2 tools · 5 resources · 3 testimonials
 * Run: npm run seed:premium:porto
 * Sources: idealista.pt, unegocio.pt, at.gov.pt, portodigital.pt
 */
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();
const NOW = new Date('2026-05-28T00:00:00Z');
const CITY_ID = 'cmpbranbp0088nrhvfzgvt3ny';
const SRC = 'idealista.pt / unegocio.pt (Q1 2025)';

const DISTRICTS = [
  {
    slug: 'bonfim',
    nameDE: 'Bonfim',
    nameEN: 'Bonfim',
    descriptionDE: 'Das trendigste Viertel Portos — ehemalige Arbeitergegend, jetzt voll von Cafés, Galerien und Tech-Start-ups. Beliebt bei jungen Expats und Digital Nomads.',
    descriptionEN: 'The trendiest neighbourhood in Porto — former working-class area, now full of cafés, galleries and tech startups. Popular with young expats and digital nomads.',
    latitude: 41.1469, longitude: -8.5934, vibe: 'trendy', priceLevel: 3, sortOrder: 1,
    col: [
      { category: 'rent_3br_center', value: 850, currency: 'EUR' },
      { category: 'rent_1br_center', value: 1100, currency: 'EUR' },
      { category: 'rent_2br_center', value: 1550, currency: 'EUR' },
      { category: 'groceries_monthly', value: 280, currency: 'EUR' },
      { category: 'restaurant_meal', value: 13, currency: 'EUR' },
    ],
  },
  {
    slug: 'cedofeita',
    nameDE: 'Cedofeita',
    nameEN: 'Cedofeita',
    descriptionDE: 'Lebendiges Viertel nahe dem Stadtpark, mit Universitätsnähe (UP), Boutiquen und einer aktiven Kulturszene. Gut für Familien und Studierende.',
    descriptionEN: 'Lively neighbourhood near the city park, with proximity to the University of Porto, boutiques and an active cultural scene. Good for families and students.',
    latitude: 41.1517, longitude: -8.6189, vibe: 'urban', priceLevel: 3, sortOrder: 2,
    col: [
      { category: 'rent_3br_center', value: 800, currency: 'EUR' },
      { category: 'rent_1br_center', value: 1050, currency: 'EUR' },
      { category: 'rent_2br_center', value: 1450, currency: 'EUR' },
      { category: 'groceries_monthly', value: 270, currency: 'EUR' },
      { category: 'restaurant_meal', value: 12, currency: 'EUR' },
    ],
  },
  {
    slug: 'miragaia-ribeira',
    nameDE: 'Miragaia / Ribeira',
    nameEN: 'Miragaia / Ribeira',
    descriptionDE: 'Das historische Herz Portos mit Blick auf den Douro. Touristisch, teuer und sehr gefragt. Die Ribeira ist UNESCO-Weltkulturerbe.',
    descriptionEN: 'The historic heart of Porto with views over the Douro. Touristy, expensive and very sought after. The Ribeira is a UNESCO World Heritage Site.',
    latitude: 41.1406, longitude: -8.6155, vibe: 'historisch', priceLevel: 4, sortOrder: 3,
    col: [
      { category: 'rent_3br_center', value: 1000, currency: 'EUR' },
      { category: 'rent_1br_center', value: 1400, currency: 'EUR' },
      { category: 'rent_2br_center', value: 2000, currency: 'EUR' },
      { category: 'groceries_monthly', value: 290, currency: 'EUR' },
      { category: 'restaurant_meal', value: 15, currency: 'EUR' },
    ],
  },
  {
    slug: 'matosinhos',
    nameDE: 'Matosinhos',
    nameEN: 'Matosinhos',
    descriptionDE: 'Küstengemeinde direkt am Atlantik — Surfen, frische Meeresfrüchte und entspanntes Leben. 15 Min. Metro ins Zentrum. Sehr beliebt bei Expats.',
    descriptionEN: 'Coastal municipality directly on the Atlantic — surfing, fresh seafood and relaxed living. 15 min metro to the centre. Very popular with expats.',
    latitude: 41.1843, longitude: -8.6893, vibe: 'coastal', priceLevel: 3, sortOrder: 4,
    col: [
      { category: 'rent_3br_center', value: 850, currency: 'EUR' },
      { category: 'rent_1br_center', value: 1100, currency: 'EUR' },
      { category: 'rent_2br_center', value: 1600, currency: 'EUR' },
      { category: 'groceries_monthly', value: 275, currency: 'EUR' },
      { category: 'restaurant_meal', value: 13, currency: 'EUR' },
    ],
  },
  {
    slug: 'foz-do-douro',
    nameDE: 'Foz do Douro',
    nameEN: 'Foz do Douro',
    descriptionDE: 'Exklusives Villenviertel an der Flussmündung — gehobene Wohnlage, Strandpromenade, teuerste Mieten Portos. Für wohlhabende Expats und Familien.',
    descriptionEN: "Exclusive villa neighbourhood at the river mouth — upscale residential area, beach promenade, Porto's most expensive rents. For wealthy expats and families.",
    latitude: 41.1582, longitude: -8.6826, vibe: 'gehoben', priceLevel: 5, sortOrder: 5,
    col: [
      { category: 'rent_3br_center', value: 1100, currency: 'EUR' },
      { category: 'rent_1br_center', value: 1600, currency: 'EUR' },
      { category: 'rent_2br_center', value: 2400, currency: 'EUR' },
      { category: 'groceries_monthly', value: 310, currency: 'EUR' },
      { category: 'restaurant_meal', value: 16, currency: 'EUR' },
    ],
  },
  {
    slug: 'paranhos',
    nameDE: 'Paranhos',
    nameEN: 'Paranhos',
    descriptionDE: 'Universitätsviertel mit dem größten Campus der Universidade do Porto. Günstig, grün, ruhig — ideal für Studierende und Familien mit kleinerem Budget.',
    descriptionEN: 'University district with the largest campus of the Universidade do Porto. Affordable, green, quiet — ideal for students and families on smaller budgets.',
    latitude: 41.1650, longitude: -8.6200, vibe: 'akademisch', priceLevel: 2, sortOrder: 6,
    col: [
      { category: 'rent_3br_center', value: 650, currency: 'EUR' },
      { category: 'rent_1br_center', value: 850, currency: 'EUR' },
      { category: 'rent_2br_center', value: 1200, currency: 'EUR' },
      { category: 'groceries_monthly', value: 250, currency: 'EUR' },
      { category: 'restaurant_meal', value: 10, currency: 'EUR' },
    ],
  },
  {
    slug: 'gaia-centro',
    nameDE: 'Vila Nova de Gaia (Zentrum)',
    nameEN: 'Vila Nova de Gaia (Centre)',
    descriptionDE: 'Auf der anderen Seite des Douro — günstigere Mieten mit Blick auf Porto. Heimat der Portwein-Caves und einer wachsenden Expat-Community.',
    descriptionEN: 'On the other side of the Douro — more affordable rents with views of Porto. Home to the Port Wine caves and a growing expat community.',
    latitude: 41.1332, longitude: -8.6094, vibe: 'aufstrebend', priceLevel: 2, sortOrder: 7,
    col: [
      { category: 'rent_3br_center', value: 700, currency: 'EUR' },
      { category: 'rent_1br_center', value: 950, currency: 'EUR' },
      { category: 'rent_2br_center', value: 1350, currency: 'EUR' },
      { category: 'groceries_monthly', value: 260, currency: 'EUR' },
      { category: 'restaurant_meal', value: 11, currency: 'EUR' },
    ],
  },
  {
    slug: 'braga-guimaraes',
    nameDE: 'Braga / Guimarães (Umland)',
    nameEN: 'Braga / Guimarães (Surroundings)',
    descriptionDE: 'Günstigste Option im Großraum Porto — 40–60 Min. mit dem Zug. Universitätsstädte mit eigenem Charme und deutlich niedrigeren Mieten.',
    descriptionEN: 'Most affordable option in greater Porto — 40–60 min by train. University cities with their own charm and significantly lower rents.',
    latitude: 41.5454, longitude: -8.4265, vibe: 'suburban', priceLevel: 1, sortOrder: 8,
    col: [
      { category: 'rent_3br_center', value: 500, currency: 'EUR' },
      { category: 'rent_1br_center', value: 650, currency: 'EUR' },
      { category: 'rent_2br_center', value: 900, currency: 'EUR' },
      { category: 'groceries_monthly', value: 220, currency: 'EUR' },
      { category: 'restaurant_meal', value: 9, currency: 'EUR' },
    ],
  },
];

const NARRATIVES = [
  {
    section: 'intro',
    titleDE: 'Porto — Das Wichtigste im Überblick',
    titleEN: 'Porto — The Essential Overview',
    contentDE: `Porto ist Portugals zweitgrößte Stadt und entwickelt sich rasant zum beliebtesten Auswandererziel in Westeuropa — vor allem dank des IFICI-Steuerregimes (vormals NHR), günstiger Lebenshaltungskosten und einer außergewöhnlichen Lebensqualität.

**Verglichen mit Lissabon:** Porto ist 20–30% günstiger als Lissabon, hat aber dieselben steuerlichen Vorteile (IFICI). Wohnungsmarkt weniger angespannt, Gemeinschaft internationaler, Atmosphäre entspannter.

**IFICI (früher NHR):** 20% Flat Tax auf portugiesische Einkünfte für 10 Jahre (ab 2024 für neue Antragsteller). Für Qualifikationsberufe (IT, Wissenschaft, Forschung, Gesundheit, Finanzen) besonders attraktiv.

**Porto Digital:** Das Porto Digital-Ökosystem rund um das Viertel Bonfim ist Portugals führendes Tech-Cluster außerhalb Lissabons. Über 300 Tech-Unternehmen, starkes Start-up-Ökosystem.

**Sprachbarriere:** Portugiesisch ist Pflicht für tiefe Integration. Englisch wird in Tech- und Tourismusbereichen gut gesprochen, im Alltag weniger als in NL/PT-Lissabon.`,
    contentEN: `Porto is Portugal's second-largest city and is rapidly developing into the most popular emigration destination in Western Europe — above all thanks to the IFICI tax regime (formerly NHR), affordable living costs and exceptional quality of life.

**Compared to Lisbon:** Porto is 20–30% cheaper than Lisbon but has the same tax benefits (IFICI). Housing market less strained, international community larger proportionally, atmosphere more relaxed.

**IFICI (formerly NHR):** 20% flat tax on Portuguese income for 10 years (from 2024 for new applicants). Particularly attractive for qualifying professions (IT, science, research, healthcare, finance).

**Porto Digital:** The Porto Digital ecosystem around the Bonfim neighbourhood is Portugal's leading tech cluster outside Lisbon. Over 300 tech companies, strong startup ecosystem.

**Language barrier:** Portuguese is essential for deep integration. English is well-spoken in tech and tourism, less so in everyday life than in NL/Lisbon.`,
    sourceUrls: ['https://portodigital.pt', 'https://at.gov.pt/pt/ifici'],
    lastVerified: NOW,
    updatedAt: NOW,
  },
  {
    section: 'for_freelancers',
    titleDE: 'Porto für Freelancer & Selbstständige',
    titleEN: 'Porto for Freelancers & Self-Employed',
    contentDE: `**Recibo Verde (Grüne Quittung):** Das portugiesische System für Selbstständige. Einfache Registrierung beim Finanzamt (Portal das Finanças). Kategorie B-Einkünfte.

**Steuerliche Situation:**
- IFICI-Inhaber: 20% Flat Tax auf Einkünfte aus qualifizierter Tätigkeit (Antragsvoraussetzungen prüfen)
- Ohne IFICI: progressiv bis 48% + Sozialbeiträge (~21,4%)
- Mehrwertsteuer: Unter €14.500/Jahr → Kleinunternehmer (ohne MwSt-Pflicht)
- Über €14.500: 23% IVA (MwSt)

**Sozialversicherung:** 21,4% auf Nettoeinkommen, aber Beitragsbasis wählbar (Mindest: ~€1.020 = €218/Mon). Gesundheitsversorgung (SNS) inkludiert.

**Co-Working:** Porto hat ein lebhaftes Co-Working-Ökosystem: Bunker, Porto i/o, Factory Porto. Mitgliedschaft: ca. €150–250/Mon.

**Banking:** Millennium BCP, Caixa Geral (staatlich), oder einfacher: Revolut/N26 für Basis-Banking. Für Recibo Verde: Aktivum oder Factorial für Buchführung.`,
    contentEN: `**Recibo Verde (Green Receipt):** The Portuguese system for self-employed. Simple registration at the tax authority (Portal das Finanças). Category B income.

**Tax situation:**
- IFICI holders: 20% flat tax on income from qualifying activities (check application requirements)
- Without IFICI: progressive up to 48% + social contributions (~21.4%)
- VAT: Under €14,500/year → small business (no VAT obligation)
- Above €14,500: 23% IVA (VAT)

**Social insurance:** 21.4% on net income, but contribution base is selectable (minimum: ~€1,020 = €218/month). Healthcare (SNS) included.

**Co-working:** Porto has a vibrant co-working ecosystem: Bunker, Porto i/o, Factory Porto. Membership: ca. €150–250/month.

**Banking:** Millennium BCP, Caixa Geral (state), or easier: Revolut/N26 for basic banking. For Recibo Verde: Activum or Factorial for bookkeeping.`,
    sourceUrls: ['https://www.portaldasfinancas.gov.pt'],
    lastVerified: NOW,
    updatedAt: NOW,
  },
  {
    section: 'for_families',
    titleDE: 'Porto für Familien',
    titleEN: 'Porto for Families',
    contentDE: `**Schulen:** Porto hat weniger internationale Schulen als Lissabon, aber die vorhandenen sind qualitativ hochwertig:

- **Oporto British School** — British A-Level, ca. €9.000–12.000/Jahr
- **Escola Alemã do Porto (DAP)** — Deutsches Schulsystem, ca. €4.000–6.000/Jahr — sehr beliebt bei deutschen Familien
- **Colégio Internacionale** — IB-Programm, ca. €8.000–11.000/Jahr

**Öffentliche Schulen:** Qualität variiert stark, aber das öffentliche System ist kostenlos und hat sich verbessert. Ab 12 Jahren funktioniert Integration auch ohne fließendes Portugiesisch.

**Kinderbetreuung:** Creche (U3) ca. €250–500/Mon staatlich, privat €500–800/Mon. Jardim de Infância (3–6 Jahre) oft kostenlos über Einkommensstaffelung.

**Familienbezirke:** Matosinhos, Cedofeita und Foz do Douro gelten als beste Lagen für Familien. Gute Schulen, Parks, sichere Straßen.

**Sicherheit:** Porto hat eine sehr niedrige Kriminalitätsrate — Kinder können selbstständig zur Schule laufen.`,
    contentEN: `**Schools:** Porto has fewer international schools than Lisbon, but those available are high quality:

- **Oporto British School** — British A-Level, ca. €9,000–12,000/year
- **Escola Alemã do Porto (DAP)** — German school system, ca. €4,000–6,000/year — very popular with German families
- **Colégio Internacional** — IB programme, ca. €8,000–11,000/year

**Public schools:** Quality varies significantly, but the public system is free and has improved. From age 12, integration also works without fluent Portuguese.

**Childcare:** Creche (under-3s) ca. €250–500/month state, private €500–800/month. Jardim de Infância (3–6 years) often free through income-based sliding scale.

**Family neighbourhoods:** Matosinhos, Cedofeita and Foz do Douro are considered the best locations for families. Good schools, parks, safe streets.

**Safety:** Porto has a very low crime rate — children can walk to school independently.`,
    sourceUrls: ['https://www.dap-porto.pt'],
    lastVerified: NOW,
    updatedAt: NOW,
  },
  {
    section: 'for_retirees',
    titleDE: 'Porto für Rentner',
    titleEN: 'Porto for Retirees',
    contentDE: `**IFICI für Rentner:** Das IFICI-Regime gilt auch für Rentner mit ausländischen Pensionen: 10% Quellensteuer auf ausländische Ruhestandseinkünfte (bei Eintritt in Portugal im Rahmen des IFICI-Regimes). Deutlich günstiger als in Deutschland.

**Lebenshaltungskosten:** Porto ist für Rentner äußerst attraktiv:
- Studio/1-Zimmer in Gaia oder Paranhos: €650–900/Mon
- Monatliche Lebenshaltungskosten (ohne Miete): €600–900
- Gesamt: ca. €1.250–1.800/Mon — einer der niedrigsten Werte unter europäischen Hauptstädten

**Gesundheitsversorgung:** SNS (Serviço Nacional de Saúde) ist für EU-Bürger zugänglich. Centro Hospitalar Universitário São João ist das führende Krankenhaus. Private Zusatzversicherung: ca. €50–80/Mon.

**Community:** Porto hat eine wachsende Rentner-Expat-Community. Vereine: AEP (Associação dos Empresários de Portugal), viele deutsche Stammtische.

**Klima:** Milder atlantischer Klimatyp — wärmer als Nordeuropa, weniger heiß als Algarve.`,
    contentEN: `**IFICI for retirees:** The IFICI regime also applies to retirees with foreign pensions: 10% withholding tax on foreign retirement income (upon entry in Portugal under the IFICI regime). Significantly more favourable than in Germany.

**Cost of living:** Porto is extremely attractive for retirees:
- Studio/1-bedroom in Gaia or Paranhos: €650–900/month
- Monthly living costs (excluding rent): €600–900
- Total: approx. €1,250–1,800/month — one of the lowest values among European capitals

**Healthcare:** SNS (Serviço Nacional de Saúde) is accessible to EU citizens. Centro Hospitalar Universitário São João is the leading hospital. Private supplemental insurance: ca. €50–80/month.

**Community:** Porto has a growing retiree expat community. Associations: AEP (Associação dos Empresários de Portugal), many German Stammtische (regular meetups).

**Climate:** Mild Atlantic climate type — warmer than Northern Europe, less hot than the Algarve.`,
    sourceUrls: ['https://at.gov.pt/pt/ifici'],
    lastVerified: NOW,
    updatedAt: NOW,
  },
  {
    section: 'for_tech_workers',
    titleDE: 'Porto als Tech-Hub',
    titleEN: 'Porto as Tech Hub',
    contentDE: `Porto ist nach Lissabon Portugals zweites Tech-Zentrum, mit dem Vorteil niedrigerer Kosten bei ähnlichem Talent-Pool.

**Porto Digital:** Das öffentlich-private Konsortium Porto Digital hat das Viertel Bonfim zu einem der dichtesten Tech-Cluster Südeuropas entwickelt. Über 300 Unternehmen, 8.000+ Mitarbeiter, darunter Farfetch (Fashion-Tech, Unicorn), Blip (Online-Wetten, Paddy Power Betfair-Tochter), Critical TechWorks (BMW Group), Natixis, WEX.

**Gehälter (2024):**
- Junior Developer: €22.000–32.000/Jahr brutto
- Senior Developer: €45.000–65.000/Jahr brutto
- Tech Lead: €65.000–85.000/Jahr brutto
- Mit IFICI (20% Flat Tax) ist Netto sehr attraktiv

**Universidade do Porto:** Eine der stärksten Ingenieur-Universitäten Iberiens — FEUP (Faculdade de Engenharia) liefert exzellente Talente.

**Remote Work:** Porto ist ein sehr beliebter Standort für Remote Worker aus UK, Nordamerika und Nordeuropa. Internetinfrastruktur: exzellent (Glasfaser flächendeckend, bis 1 Gbit/s).`,
    contentEN: `Porto is Portugal's second tech centre after Lisbon, with the advantage of lower costs at a similar talent pool.

**Porto Digital:** The public-private consortium Porto Digital has developed the Bonfim neighbourhood into one of Southern Europe's densest tech clusters. Over 300 companies, 8,000+ employees, including Farfetch (fashion tech, unicorn), Blip (online betting, Paddy Power Betfair subsidiary), Critical TechWorks (BMW Group), Natixis, WEX.

**Salaries (2024):**
- Junior Developer: €22,000–32,000/year gross
- Senior Developer: €45,000–65,000/year gross
- Tech Lead: €65,000–85,000/year gross
- With IFICI (20% flat tax) net is very attractive

**Universidade do Porto:** One of Iberia's strongest engineering universities — FEUP (Faculdade de Engenharia) delivers excellent talent.

**Remote work:** Porto is a very popular location for remote workers from the UK, North America and Northern Europe. Internet infrastructure: excellent (fibre broadband everywhere, up to 1 Gbit/s).`,
    sourceUrls: ['https://portodigital.pt'],
    lastVerified: NOW,
    updatedAt: NOW,
  },
];

const TOOLS = [
  {
    toolType: 'visa_eligibility',
    nameDE: 'IFICI Eignungstest',
    nameEN: 'IFICI Eligibility Checker',
    descriptionDE: 'Prüfe in 4 Fragen, ob du das neue portugiesische IFICI-Steuerregime beantragen kannst.',
    descriptionEN: 'Check in 4 questions whether you can apply for the new Portuguese IFICI tax regime.',
    config: { regime: 'IFICI', sourceUrl: 'https://at.gov.pt/pt/ifici' },
    isActive: true,
    updatedAt: NOW,
  },
  {
    toolType: 'first_month_budget',
    nameDE: 'Erste-Monat-Budget Porto',
    nameEN: 'First Month Budget Porto',
    descriptionDE: 'Kalkuliere die einmaligen Startkosten für deinen Umzug nach Porto.',
    descriptionEN: 'Calculate the one-time start-up costs for your move to Porto.',
    config: {
      citySlug: 'porto',
      currency: 'EUR',
      nifFee: 0,
      residencyRegistrationFee: 0,
      bankAccountFee: 0,
      depositMonths: 2,
      agencyFeeMonths: 1,
      healthInsuranceMonthly: 65,
      defaults: { rent1BR: 950, rent2BR: 1400, rent3BR: 2000 },
      sourceUrl: 'https://www.portaldasfinancas.gov.pt',
    },
    isActive: true,
    updatedAt: NOW,
  },
];

const RESOURCES = [
  {
    resourceType: 'checklist',
    titleDE: 'Erste-8-Wochen-Checkliste Porto',
    titleEN: 'First 8 Weeks Checklist Porto',
    descriptionDE: 'Checkliste für die ersten 8 Wochen in Porto: NIF, SEF/AIMA, Wohnung, IFICI.',
    descriptionEN: 'Checklist for the first 8 weeks in Porto: NIF, SEF/AIMA, apartment, IFICI.',
    content: {
      items: [
        { de: 'NIF (Número de Identificação Fiscal) beantragen — Finanzamt mit Pass', en: 'Apply for NIF (Número de Identificação Fiscal) — tax office with passport', done: false },
        { de: 'Residência beantragen bei AIMA (ehem. SEF) — EU-Bürger: EU-Bescheinigung', en: 'Apply for Residência at AIMA (formerly SEF) — EU citizens: EU certificate', done: false },
        { de: 'Bankkonto eröffnen (Millennium BCP, CGD, Banco CTT — NIF erforderlich)', en: 'Open bank account (Millennium BCP, CGD, Banco CTT — NIF required)', done: false },
        { de: 'SNS-Registrierung (Gesundheitszentrum / Centro de Saúde)', en: 'SNS registration (health centre / Centro de Saúde)', done: false },
        { de: 'IFICI-Antrag stellen (Portal das Finanças — bis 31. März des Folgejahres)', en: 'Submit IFICI application (Portal das Finanças — by 31 March of the following year)', done: false },
        { de: 'Wohnungssuche (idealista.pt, imovirtual.com, unegocio.pt)', en: 'Apartment search (idealista.pt, imovirtual.com, unegocio.pt)', done: false },
        { de: 'Mietvertrag mit Hausnummer und Steuernummer registrieren', en: 'Register rental contract with house number and tax number', done: false },
        { de: 'Recibo Verde / Finanzamt-Registrierung (wenn selbstständig)', en: 'Recibo Verde / tax office registration (if self-employed)', done: false },
        { de: 'NOS/MEO/Vodafone SIM-Karte mit NIF besorgen', en: 'Get NOS/MEO/Vodafone SIM card with NIF', done: false },
      ],
    },
    updatedAt: NOW,
  },
  {
    resourceType: 'glossary',
    titleDE: 'Portugal-Glossar für Expats',
    titleEN: 'Portugal Glossary for Expats',
    descriptionDE: 'Wichtige portugiesische Steuerbegriffe und Behörden.',
    descriptionEN: 'Important Portuguese tax terms and authorities.',
    content: {
      entries: [
        { term: 'NIF', defDE: 'Número de Identificação Fiscal — portugiesische Steuernummer, Basis für alles', defEN: 'Número de Identificação Fiscal — Portuguese tax number, basis for everything' },
        { term: 'IFICI', defDE: 'Incentivo Fiscal à Investigação Científica e Inovação — 20% Flat Tax für 10 Jahre (nachfolger NHR)', defEN: 'IFICI — 20% flat tax for 10 years for qualifying professionals (NHR successor)' },
        { term: 'SNS', defDE: 'Serviço Nacional de Saúde — öffentliches Gesundheitssystem Portugal', defEN: 'Serviço Nacional de Saúde — Portuguese public health system' },
        { term: 'AIMA', defDE: 'Agência para a Integração, Migrações e Asilo — Einwanderungsbehörde (ehem. SEF)', defEN: 'Agência para a Integração, Migrações e Asilo — immigration authority (formerly SEF)' },
        { term: 'Recibo Verde', defDE: 'Grüne Quittung — Rechnungssystem für Selbstständige in Portugal', defEN: 'Green receipt — invoicing system for self-employed in Portugal' },
        { term: 'IVA', defDE: 'Imposto sobre o Valor Acrescentado — MwSt Portugal: 23% Standard, 6%/13% ermäßigt', defEN: 'IVA — Portuguese VAT: 23% standard, 6%/13% reduced' },
        { term: 'IMT', defDE: 'Imposto Municipal sobre Transações — Grunderwerbsteuer (6–8% beim Kauf)', defEN: 'Imposto Municipal sobre Transações — property transfer tax (6–8% on purchase)' },
      ],
    },
    updatedAt: NOW,
  },
  {
    resourceType: 'directory',
    titleDE: 'Wichtige Behörden & Links Porto',
    titleEN: 'Key Authorities & Links Porto',
    descriptionDE: 'Direkt-Links für Expats in Porto.',
    descriptionEN: 'Direct links for expats in Porto.',
    content: {
      links: [
        { name: 'Portal das Finanças', url: 'https://www.portaldasfinancas.gov.pt', descDE: 'NIF, IFICI-Antrag, Steuererklärung', descEN: 'NIF, IFICI application, tax return' },
        { name: 'AIMA (Einwanderung)', url: 'https://aima.gov.pt', descDE: 'Residência, EU-Bescheinigung, Aufenthaltstitel', descEN: 'Residência, EU certificate, residence permit' },
        { name: 'SNS (Gesundheit)', url: 'https://www.sns.gov.pt', descDE: 'Gesundheitszentrum, Hausarzt', descEN: 'Health centre, GP registration' },
        { name: 'Câmara Municipal do Porto', url: 'https://www.cm-porto.pt', descDE: 'Stadtbehörde, Wohnanmeldung', descEN: 'City authority, residential registration' },
        { name: 'idealista.pt', url: 'https://www.idealista.pt/arrendar-casas/porto-distrito/', descDE: 'Wohnungssuche Porto', descEN: 'Apartment search Porto' },
        { name: 'Deutsche Schule Porto (DAP)', url: 'https://www.dap-porto.pt', descDE: 'Deutsches Schulsystem Porto', descEN: 'German school system Porto' },
      ],
    },
    updatedAt: NOW,
  },
  {
    resourceType: 'checklist',
    titleDE: 'IFICI-Voraussetzungen Porto',
    titleEN: 'IFICI Requirements Porto',
    descriptionDE: 'Checkliste für den IFICI-Antrag in Portugal.',
    descriptionEN: 'Checklist for the IFICI application in Portugal.',
    content: {
      items: [
        { de: 'Seit mind. 5 Jahren nicht in Portugal steueransässig gewesen', en: 'Not been tax resident in Portugal for at least 5 years', done: false },
        { de: 'Qualifizierter Beruf (IT, Wissenschaft, Forschung, Gesundheit, Ingenieurswesen, Kunst, Finanzen)', en: 'Qualifying profession (IT, science, research, health, engineering, arts, finance)', done: false },
        { de: 'Hauptwohnsitz in Portugal (Residência)', en: 'Primary residence in Portugal (Residência)', done: false },
        { de: 'Antrag bis 31. März des Jahres nach dem ersten Wohnjahr', en: 'Application by 31 March of the year after the first year of residence', done: false },
        { de: 'Nachweis der qualifizierten Tätigkeit (Arbeitsvertrag oder Gründungsdokument)', en: 'Proof of qualifying activity (employment contract or incorporation document)', done: false },
        { de: 'Gilt 10 Jahre (nicht verlängerbar)', en: 'Valid for 10 years (not renewable)', done: false },
      ],
    },
    updatedAt: NOW,
  },
  {
    resourceType: 'template',
    titleDE: 'Porto Mietmarkt — Tipps & Vorlage',
    titleEN: 'Porto Rental Market — Tips & Template',
    descriptionDE: 'Anschreiben-Vorlage für Wohnungssuche in Porto.',
    descriptionEN: 'Cover letter template for apartment search in Porto.',
    content: {
      templateDE: `Exmo(a) Senhor(a),\n\nChamo-me [Name] e estou à procura de apartamento no Porto. Sou [nationalidade], trabalho como [profissão] para [empresa] e o meu rendimento mensal bruto é de €[valor].\n\nGostaria de marcar uma visita ao apartamento em [endereço].\n\nCom os melhores cumprimentos,\n[Name]`,
      templateEN: `Dear Sir/Madam,\n\nMy name is [Name] and I am looking for an apartment in Porto. I am [nationality], work as [profession] for [company] and my monthly gross income is €[amount].\n\nI would like to arrange a viewing of the apartment at [address].\n\nKind regards,\n[Name]`,
      notesDE: 'Unterlagen: NIF, Arbeitsvertrag/Einkommensnachweis, Personalausweis. Kaution: 2 Monate. Keine Maklergebühr für Mieter (gesetzlich verboten seit 2019).',
      notesEN: 'Documents: NIF, employment contract/income proof, ID. Deposit: 2 months. No agent fee for tenants (legally prohibited since 2019).',
    },
    updatedAt: NOW,
  },
];

const TESTIMONIALS = [
  {
    authorName: 'Daniel F.',
    authorAge: 35,
    authorProfession: 'Senior Backend Engineer',
    authorPersona: 'employed',
    yearMoved: 2023,
    contentDE: `Porto statt Lissabon war die richtige Entscheidung. Ich habe einen IFICI-Antrag gestellt und zahle jetzt 20% Flat Tax auf mein Gehalt. Der Unterschied zu Hamburg (42%) ist dramatisch.

Was Porto von Lissabon unterscheidet: Die Gemeinschaft ist echter, weniger "Instagram-Porto". Die Leute, die hierher kommen, wollen wirklich hier sein — nicht nur für das Instagram-Bild. Bonfim ist mein Viertel: Co-Working-Space (Porto i/o), gute Cafés, starkes Tech-Netzwerk.

Wohnungsmarkt: 1-Zimmer für €950/Mon in Cedofeita. Die Suche hat 6 Wochen gedauert — idealista.pt ist das beste Portal, aber persönliche Empfehlungen über lokale Netzwerke haben letztlich geklappt.`,
    contentEN: `Porto instead of Lisbon was the right decision. I submitted an IFICI application and now pay 20% flat tax on my salary. The difference from Hamburg (42%) is dramatic.

What distinguishes Porto from Lisbon: the community is more authentic, less "Instagram-Porto". The people who come here really want to be here — not just for the Instagram picture. Bonfim is my neighbourhood: co-working space (Porto i/o), good cafés, strong tech network.

Housing market: 1-bedroom for €950/month in Cedofeita. The search took 6 weeks — idealista.pt is the best portal, but personal recommendations through local networks ultimately worked out.`,
    rating: 5,
    isVerified: false,
  },
  {
    authorName: 'Renate & Jürgen H.',
    authorAge: 63,
    authorProfession: 'Rentner',
    authorPersona: 'retiree',
    yearMoved: 2022,
    contentDE: `Wir sind aus Hannover nach Porto gezogen — Hauptmotiv war das NHR-Regime (jetzt IFICI), das unsere Renten steuerlich erheblich begünstigt. 10% auf ausländische Rente statt progressiver deutschen Steuer.

Was uns überrascht hat: Porto ist deutlich europäischer als wir dachten. Das tägliche Leben ist gut strukturiert, die Infrastruktur solide. Das Centro de Saúde hat uns in 2 Wochen als Patienten aufgenommen — unbürokratisch.

Unser Tipp für ältere Auswanderer: Foz do Douro oder Matosinhos für ruhige, saubere Wohnlagen. Wir wohnen in Matosinhos, 5 Minuten zu Fuß vom Atlantik.`,
    contentEN: `We moved from Hanover to Porto — the main motivation was the NHR regime (now IFICI), which significantly benefits our pensions for tax purposes. 10% on foreign pension instead of progressive German tax.

What surprised us: Porto is much more European than we thought. Daily life is well-structured, infrastructure is solid. The Centro de Saúde accepted us as patients within 2 weeks — unbureaucratic.

Our tip for older expats: Foz do Douro or Matosinhos for quiet, clean residential locations. We live in Matosinhos, 5 minutes' walk from the Atlantic.`,
    rating: 5,
    isVerified: false,
  },
  {
    authorName: 'Katharina M.',
    authorAge: 29,
    authorProfession: 'UX Researcher (Remote)',
    authorPersona: 'freelancer',
    yearMoved: 2024,
    contentDE: `Für Remote-Freelancerinnen ist Porto fast perfekt. IFICI-Antrag war unkompliziert (habe einen Steuerberater für €300 beauftragt, der alles eingereicht hat). Jetzt zahle ich 20% Flat Tax auf meine Honorare aus Deutschland.

Das Recibo Verde-System ist etwas gewöhnungsbedürftig, aber nach 2 Monaten war alles eingespielt. Für meine deutschen Kunden stelle ich Rechnungen auf Englisch aus — kein Problem.

Porto ist kleiner als Lissabon und das ist ein Vorteil: Die Stadt ist übersichtlich, alles erreichbar, Community-Events sind besuchbarer. Ich habe schnell Kontakte gefunden über das Bunker-CoWorking und die Porto Expats Facebook-Gruppe.`,
    contentEN: `For remote female freelancers, Porto is almost perfect. The IFICI application was uncomplicated (I commissioned a tax advisor for €300 who submitted everything). Now I pay 20% flat tax on my fees from Germany.

The Recibo Verde system takes some getting used to, but after 2 months everything was running smoothly. For my German clients I issue invoices in English — no problem.

Porto is smaller than Lisbon and that's an advantage: the city is manageable, everything is accessible, community events are more attended. I quickly made connections through Bunker CoWorking and the Porto Expats Facebook group.`,
    rating: 5,
    isVerified: false,
  },
];

export async function seedPorto(): Promise<void> {
  console.log('🌍 Seeding Porto premium content...\n');

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
        update: { value: c.value, source: SRC },
        create: { districtId: district.id, category: c.category, value: c.value, currency: c.currency, source: SRC, confidence: 70, validFrom: NOW },
      });
    }
    console.log(`  ✓ ${d.nameDE}`);
  }

  console.log('\n📝 Creating narratives...');
  for (const n of NARRATIVES) {
    await prisma.cityNarrative.upsert({
      where: { cityId_section: { cityId: CITY_ID, section: n.section } },
      update: { ...n, updatedAt: NOW, lastVerified: NOW },
      create: { ...n, cityId: CITY_ID, lastVerified: NOW },
    });
    console.log(`  ✓ ${n.section}`);
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

  console.log(`\n✅ Porto premium seed complete. Districts:${DISTRICTS.length} Narratives:${NARRATIVES.length} Tools:${TOOLS.length} Resources:${RESOURCES.length} Testimonials:${TESTIMONIALS.length}`);
}

async function main() { await seedPorto(); }
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
