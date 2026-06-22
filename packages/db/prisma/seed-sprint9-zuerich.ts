/**
 * Sprint 9 — Zurich Premium Content Seed
 * Pattern: 8 districts · 5 narratives · 2 tools · 5 resources · 3 testimonials
 * Run: npm run seed:premium:zuerich (from packages/db)
 * Sources: homegate.ch, comparis.ch, zh.ch, estv.admin.ch, expats.ch
 */
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();
const NOW = new Date();
const CITY_ID = 'cmpbramzq0081nrhv36af92ju';
const SOURCE = 'homegate.ch / comparis.ch Q1 2025';

export async function seedZuerich() {
  console.log('🌍 Seeding Zurich premium content...');

  // --- Districts ---
  console.log('\n📍 Creating districts...');
  const districts = [
    {
      slug: 'zuerich-kreis-1-altstadt',
      nameDE: 'Kreis 1 — Altstadt',
      nameEN: 'District 1 — Old Town',
      descriptionDE: 'Historisches Stadtzentrum — Grossmünster, Bahnhofstrasse, Luxus-Shopping, wenige Mietwohnungen, höchste Preise der Stadt.',
      descriptionEN: 'Historic city centre — Grossmünster, Bahnhofstrasse, luxury shopping, few rental flats, highest prices in the city.',
      latitude: 47.3727, longitude: 8.5417, vibe: 'upscale', priceLevel: 5, sortOrder: 1,
      col: [
        { category: 'rent_studio',    value: 2200, currency: 'CHF' },
        { category: 'rent_1br_center',       value: 3000, currency: 'CHF' },
        { category: 'rent_2br_center',       value: 4500, currency: 'CHF' },
        { category: 'rent_3br_center',       value: 6500, currency: 'CHF' },
        { category: 'meal_inexpensive', value: 22, currency: 'CHF' },
        { category: 'meal_midrange',  value: 60,   currency: 'CHF' },
        { category: 'cappuccino',     value: 5.5,  currency: 'CHF' },
      ],
    },
    {
      slug: 'zuerich-kreis-4-aussersihl',
      nameDE: 'Kreis 4 — Aussersihl',
      nameEN: 'District 4 — Aussersihl',
      descriptionDE: 'Trendiges Szeneviertel — Langstrasse, Bars und Restaurants, multikulturelles Flair, beste Anbindung, relativ bezahlbar für Zürich.',
      descriptionEN: 'Trendy nightlife district — Langstrasse, bars and restaurants, multicultural flair, excellent connections, relatively affordable for Zurich.',
      latitude: 47.3770, longitude: 8.5296, vibe: 'bohemian', priceLevel: 3, sortOrder: 2,
      col: [
        { category: 'rent_studio',    value: 1700, currency: 'CHF' },
        { category: 'rent_1br_center',       value: 2400, currency: 'CHF' },
        { category: 'rent_2br_center',       value: 3400, currency: 'CHF' },
        { category: 'rent_3br_center',       value: 4800, currency: 'CHF' },
        { category: 'meal_inexpensive', value: 18, currency: 'CHF' },
        { category: 'meal_midrange',  value: 50,   currency: 'CHF' },
        { category: 'cappuccino',     value: 5.0,  currency: 'CHF' },
      ],
    },
    {
      slug: 'zuerich-kreis-5-industrie',
      nameDE: 'Kreis 5 — Industriequartier',
      nameEN: 'District 5 — Industrie Quarter',
      descriptionDE: 'Ehemaliges Industrieviertel, heute Zürichs kreativste Gegend — Tech-Startups, Google-Büros, Galerien, Puls 5, hipster-Restaurants.',
      descriptionEN: 'Former industrial quarter, now Zurich\'s most creative area — tech startups, Google offices, galleries, Puls 5, hipster restaurants.',
      latitude: 47.3845, longitude: 8.5210, vibe: 'trendy', priceLevel: 4, sortOrder: 3,
      col: [
        { category: 'rent_studio',    value: 1900, currency: 'CHF' },
        { category: 'rent_1br_center',       value: 2600, currency: 'CHF' },
        { category: 'rent_2br_center',       value: 3700, currency: 'CHF' },
        { category: 'rent_3br_center',       value: 5200, currency: 'CHF' },
        { category: 'meal_inexpensive', value: 19, currency: 'CHF' },
        { category: 'meal_midrange',  value: 52,   currency: 'CHF' },
        { category: 'cappuccino',     value: 5.2,  currency: 'CHF' },
      ],
    },
    {
      slug: 'zuerich-kreis-6-unterstrass',
      nameDE: 'Kreis 6 — Unterstrass',
      nameEN: 'District 6 — Unterstrass',
      descriptionDE: 'Ruhiges Wohnquartier nahe ETH und Universität — beliebt bei Studenten, Akademikern und Expat-Familien. Gute Lebensqualität.',
      descriptionEN: 'Quiet residential quarter near ETH and University — popular with students, academics and expat families. Good quality of life.',
      latitude: 47.3880, longitude: 8.5430, vibe: 'suburban', priceLevel: 4, sortOrder: 4,
      col: [
        { category: 'rent_studio',    value: 1800, currency: 'CHF' },
        { category: 'rent_1br_center',       value: 2500, currency: 'CHF' },
        { category: 'rent_2br_center',       value: 3500, currency: 'CHF' },
        { category: 'rent_3br_center',       value: 5000, currency: 'CHF' },
        { category: 'meal_inexpensive', value: 19, currency: 'CHF' },
        { category: 'meal_midrange',  value: 52,   currency: 'CHF' },
        { category: 'cappuccino',     value: 5.0,  currency: 'CHF' },
      ],
    },
    {
      slug: 'zuerich-kreis-7-hottingen',
      nameDE: 'Kreis 7 — Hottingen / Fluntern',
      nameEN: 'District 7 — Hottingen / Fluntern',
      descriptionDE: 'Gehobene Hügellage östlich der Altstadt — Villen, ruhig, beste Schulen, Konsulate. Ideal für gut verdienende Expat-Familien.',
      descriptionEN: 'Upscale hillside position east of the old town — villas, quiet, best schools, consulates. Ideal for high-earning expat families.',
      latitude: 47.3699, longitude: 8.5625, vibe: 'upscale', priceLevel: 5, sortOrder: 5,
      col: [
        { category: 'rent_studio',    value: 2100, currency: 'CHF' },
        { category: 'rent_1br_center',       value: 2900, currency: 'CHF' },
        { category: 'rent_2br_center',       value: 4200, currency: 'CHF' },
        { category: 'rent_3br_center',       value: 6000, currency: 'CHF' },
        { category: 'meal_inexpensive', value: 22, currency: 'CHF' },
        { category: 'meal_midrange',  value: 62,   currency: 'CHF' },
        { category: 'cappuccino',     value: 5.5,  currency: 'CHF' },
      ],
    },
    {
      slug: 'zuerich-kreis-8-riesbach',
      nameDE: 'Kreis 8 — Riesbach (Seefeld)',
      nameEN: 'District 8 — Riesbach (Seefeld)',
      descriptionDE: 'Seeuferlage am Zürichsee — mondänes Wohnviertel, Bootsanleger, Restaurants, beliebt bei Bankern und Finanzfachleuten.',
      descriptionEN: 'Lakeside location on Lake Zurich — fashionable residential district, boat moorings, restaurants, popular with bankers and finance professionals.',
      latitude: 47.3567, longitude: 8.5598, vibe: 'upscale', priceLevel: 5, sortOrder: 6,
      col: [
        { category: 'rent_studio',    value: 2300, currency: 'CHF' },
        { category: 'rent_1br_center',       value: 3200, currency: 'CHF' },
        { category: 'rent_2br_center',       value: 4600, currency: 'CHF' },
        { category: 'rent_3br_center',       value: 6800, currency: 'CHF' },
        { category: 'meal_inexpensive', value: 22, currency: 'CHF' },
        { category: 'meal_midrange',  value: 65,   currency: 'CHF' },
        { category: 'cappuccino',     value: 5.8,  currency: 'CHF' },
      ],
    },
    {
      slug: 'zuerich-kreis-3-wiedikon',
      nameDE: 'Kreis 3 — Wiedikon',
      nameEN: 'District 3 — Wiedikon',
      descriptionDE: 'Bürgerliches Wohnviertel südwestlich des Zentrums — gute Anbindung, ruhiger als Kreis 4, familienfreundlich, im Aufwertungstrend.',
      descriptionEN: 'Middle-class residential district southwest of the centre — good connections, quieter than District 4, family-friendly, gentrifying.',
      latitude: 47.3677, longitude: 8.5152, vibe: 'authentic', priceLevel: 3, sortOrder: 7,
      col: [
        { category: 'rent_studio',    value: 1600, currency: 'CHF' },
        { category: 'rent_1br_center',       value: 2200, currency: 'CHF' },
        { category: 'rent_2br_center',       value: 3100, currency: 'CHF' },
        { category: 'rent_3br_center',       value: 4400, currency: 'CHF' },
        { category: 'meal_inexpensive', value: 18, currency: 'CHF' },
        { category: 'meal_midrange',  value: 48,   currency: 'CHF' },
        { category: 'cappuccino',     value: 4.8,  currency: 'CHF' },
      ],
    },
    {
      slug: 'zuerich-kreis-11-oerlikon',
      nameDE: 'Kreis 11 — Oerlikon',
      nameEN: 'District 11 — Oerlikon',
      descriptionDE: 'Modernes Quartier nördlich des Zentrums — Mix Altbau/Neubau, gute Tram-Anbindung, günstigere Mieten, aufstrebend. Google und ABB in der Nähe.',
      descriptionEN: 'Modern quarter north of the centre — mix of old and new buildings, good tram connections, lower rents, up-and-coming. Google and ABB nearby.',
      latitude: 47.4082, longitude: 8.5435, vibe: 'urban-modern', priceLevel: 3, sortOrder: 8,
      col: [
        { category: 'rent_studio',    value: 1500, currency: 'CHF' },
        { category: 'rent_1br_center',       value: 2100, currency: 'CHF' },
        { category: 'rent_2br_center',       value: 3000, currency: 'CHF' },
        { category: 'rent_3br_center',       value: 4200, currency: 'CHF' },
        { category: 'meal_inexpensive', value: 18, currency: 'CHF' },
        { category: 'meal_midrange',  value: 48,   currency: 'CHF' },
        { category: 'cappuccino',     value: 4.8,  currency: 'CHF' },
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
        create: { districtId: district.id, category: c.category, value: c.value, currency: c.currency, source: SOURCE, confidence: 75 },
      });
    }
    console.log(`  ✓ ${d.nameDE}`);
  }

  // --- Narratives ---
  console.log('\n📝 Creating narratives...');
  const narratives = [
    {
      section: 'intro',
      titleDE: 'Zürich als Wahlheimat: Höchste Löhne Europas, höchste Lebenshaltungskosten Europas',
      titleEN: 'Zurich as a New Home: Europe\'s Highest Salaries, Europe\'s Highest Cost of Living',
      contentDE: `Zürich ist die teuerste Stadt der Welt im Jahres-Ranking — und gleichzeitig eine der bestbezahlenden. Das macht die Stadt einzigartig: Wer hier arbeitet, verdient europaweit mit am meisten, gibt aber auch am meisten aus. Das Verhältnis von Gehalt zu Lebenshaltungskosten ist für gut qualifizierte Fachkräfte in der Regel positiv, sobald man das erste Jahr überstanden hat.\n\nDie Schweiz ist kein EU-Mitglied, hat aber das Abkommen über Personenfreizügigkeit (FZA) mit der EU. EU/EFTA-Bürger benötigen für Aufenthalte über 90 Tage eine Aufenthaltsbewilligung B (für Arbeitnehmer) oder L (Kurzaufenthalt). Der Prozess läuft via kantonales Migrationsamt Zürich.\n\n**Wohnungsmarkt**: Zürich hat eine der niedrigsten Leerstandquoten Europas — unter 0,5 %. Wohnungen werden über Homegate.ch und Immoscout24.ch ausgeschrieben. Besichtigungen sind kompetitiv (20–50 Bewerber pro Wohnung), Referenzen und Bonitätsauszug (Betreibungsregisterauszug) sind Pflicht.\n\n**Krankenkasse**: Die obligatorische Grundversicherung (KVG) ist teuer — ca. 350–500 CHF/Monat für Erwachsene. Anmeldepflicht innerhalb von 3 Monaten nach Einreise. Verschiedene Kassen: CSS, Helsana, Swica, Sympany. Jahresfranchise wählen: 300–2.500 CHF (höhere Franchise = niedrigere Prämie).`,
      contentEN: `Zurich is the world's most expensive city in annual rankings — and simultaneously one of the best-paying. This makes the city unique: those who work here earn among the most in Europe, but also spend the most. The ratio of salary to cost of living is generally positive for well-qualified professionals once the first year is survived.\n\nSwitzerland is not an EU member but has the Agreement on the Free Movement of Persons (AFMP) with the EU. EU/EFTA citizens need a residence permit B (for employees) or L (short stay) for stays over 90 days. The process runs via the cantonal migration office of Zurich.\n\nHousing market: Zurich has one of the lowest vacancy rates in Europe — below 0.5%. Flats are advertised via Homegate.ch and Immoscout24.ch. Viewings are competitive (20–50 applicants per flat), references and credit extract (Betreibungsregisterauszug) are mandatory.\n\nHealth insurance: Mandatory basic insurance (KVG) is expensive — approx. CHF 350–500/month for adults. Registration obligation within 3 months of arrival. Various insurers: CSS, Helsana, Swica, Sympany. Choose annual deductible: CHF 300–2,500 (higher deductible = lower premium).`,
      sourceUrls: ['https://www.homegate.ch', 'https://www.zh.ch/de/migration-integration/zuwanderung.html'],
      lastVerified: new Date('2025-10-01'),
    },
    {
      section: 'for_employees',
      titleDE: 'Angestellt in Zürich: Quellensteuer, AHV/IV und Nettolohn-Realität',
      titleEN: 'Employed in Zurich: Withholding Tax, AHV/IV and Net Salary Reality',
      contentDE: `**Quellensteuerpflicht**: Ausländische Arbeitnehmer ohne Niederlassungsbewilligung C (frühestens nach 5–10 Jahren) unterliegen der Quellensteuer — der Arbeitgeber zieht die Steuer direkt vom Lohn ab. Der Quellensteuersatz in Zürich variiert nach Gemeinde, Familienstand und Einkommen: ca. 15–25 % für Singles mit mittlerem Einkommen.\n\n**Sozialversicherungen (Arbeitnehmer-Anteil)**:\n- AHV/IV (Altersvorsorge/Invalidenversicherung): 5,3 % des Bruttolohns\n- ALV (Arbeitslosenversicherung): 1,1 % bis CHF 148.200/Jahr Lohn\n- NBU (Nichtberufsunfallversicherung): ca. 0,5–1,5 % je nach Kasse\n- Pensionskasse (BVG): 6–9 % (arbeitnehmerabhängig)\n\nGesamtabzüge Arbeitnehmer (inkl. Quellensteuer): typisch 30–35 % bei mittlerem Einkommen.\n\n**Nettolohn-Beispiele (2025, Kanton Zürich, Single, ohne Kinder)**:\n- Brutto CHF 8.000/Monat → Netto ca. CHF 5.800–6.000\n- Brutto CHF 12.000/Monat → Netto ca. CHF 8.200–8.800\n- Brutto CHF 20.000/Monat → Netto ca. CHF 13.000–14.000\n\n**Steuererklärung**: Quellenbesteuerte Arbeitnehmer mit Einkommen über CHF 120.000 brutto/Jahr müssen nachträglich eine ordentliche Steuererklärung einreichen (Tarifkorrektur). Freiwillig möglich ab CHF 0.`,
      contentEN: `Withholding tax obligation: Foreign employees without settlement permit C (earliest after 5–10 years) are subject to withholding tax — the employer deducts the tax directly from the salary. The withholding tax rate in Zurich varies by municipality, marital status and income: approx. 15–25% for single people with average income.\n\nSocial insurance (employee share):\n- AHV/IV (old-age/disability insurance): 5.3% of gross salary\n- ALV (unemployment insurance): 1.1% up to CHF 148,200/year salary\n- NBU (non-occupational accident insurance): approx. 0.5–1.5% depending on insurer\n- Pension fund (BVG): 6–9% (employer-dependent)\n\nTotal employee deductions (incl. withholding tax): typically 30–35% at average income.\n\nNet salary examples (2025, Canton Zurich, single, no children):\n- Gross CHF 8,000/month → Net approx. CHF 5,800–6,000\n- Gross CHF 12,000/month → Net approx. CHF 8,200–8,800\n- Gross CHF 20,000/month → Net approx. CHF 13,000–14,000\n\nTax return: Withholding-taxed employees with income over CHF 120,000 gross/year must subsequently file a regular tax return (rate correction). Optional from CHF 0.`,
      sourceUrls: ['https://www.estv.admin.ch', 'https://www.zh.ch/de/steuern-finanzen/steuern/quellensteuer.html'],
      lastVerified: new Date('2025-10-01'),
    },
    {
      section: 'for_freelancers',
      titleDE: 'Selbstständig in Zürich: Einzelfirma, AHV-Beiträge und Gemeinde-Steueroptimierung',
      titleEN: 'Freelancing in Zurich: Sole Proprietorship, AHV Contributions and Municipal Tax Optimisation',
      contentDE: `**Unternehmensformen für Selbstständige**: Die einfachste Form ist die **Einzelfirma** (Sole Proprietorship) — kein Mindestkapital, Anmeldung bei der AHV innerhalb von 3 Monaten nach Aufnahme der Tätigkeit. Gewinne werden als Einkommen besteuert (ordentliche Steuer). Für höhere Gewinne und Haftungsbeschränkung: **GmbH** (CHF 20.000 Stammkapital) mit 8,5 % Bundessteuer auf Gewinn plus kantonale Steuer.\n\n**AHV-Beiträge Selbstständige**: 9,7 % des Nettoeinkommens (Arbeitgeber- und Arbeitnehmer-Anteil kombiniert). Minimum: CHF 514/Jahr. Bei sehr geringem Einkommen: gestaffelte Beiträge. AHV-Beiträge sind steuerlich abzugsfähig.\n\n**Gemeinde-Steueroptimierung**: Kanton Zürich hat kantonal einheitliche Steuersätze, aber die **Gemeinde** erhebt einen eigenen Steuerfuss (Multiplikator). Günstigste Gemeinden im Großraum Zürich: Wollerau SZ (ca. 40–50 % Bundessteuer — aber Kanton Schwyz!), Maur ZH, Egg ZH. Stadt Zürich selbst hat vergleichsweise hohen Steuerfuss.\n\n**Säule 3a**: Freiwillige Altersvorsorge — bis CHF 7.056/Jahr (2025) steuerlich abzugsfähig. Unbedingt nutzen — senkt das steuerbare Einkommen direkt.`,
      contentEN: `Business forms for self-employed: The simplest form is the sole proprietorship — no minimum capital, registration with AHV within 3 months of starting activity. Profits are taxed as income (ordinary tax). For higher profits and limited liability: GmbH (CHF 20,000 share capital) with 8.5% federal tax on profit plus cantonal tax.\n\nAHV contributions for self-employed: 9.7% of net income (employer and employee share combined). Minimum: CHF 514/year. For very low income: graduated contributions. AHV contributions are tax-deductible.\n\nMunicipal tax optimisation: Canton Zurich has cantonal uniform tax rates, but the municipality levies its own tax rate (multiplier). Cheapest municipalities in greater Zurich: Wollerau SZ (approx. 40–50% federal tax — but Canton Schwyz!), Maur ZH, Egg ZH. City of Zurich itself has a comparatively high tax rate.\n\nPillar 3a: Voluntary pension provision — up to CHF 7,056/year (2025) tax-deductible. Definitely use it — directly reduces taxable income.`,
      sourceUrls: ['https://www.estv.admin.ch', 'https://www.ahv-iv.ch'],
      lastVerified: new Date('2025-10-01'),
    },
    {
      section: 'for_families',
      titleDE: 'Familienleben in Zürich: Schulen, Kinderkosten und die teure Realität',
      titleEN: 'Family Life in Zurich: Schools, Childcare Costs and the Expensive Reality',
      contentDE: `**Internationale Schulen** in Zürich: Zurich International School (ZIS), Inter-Community School (ICS), Lyceum Alpinum Zuoz, American International School. Jahresgebühren: 20.000–35.000 CHF. Öffentliche Kantonsschulen sind kostenlos und exzellent, aber auf Deutsch — Hochdeutsch und Schweizerdeutsch sind zu unterscheiden.\n\n**Kinderbetreuung** ist in Zürich extrem teuer: Krippe (Kita) kostet 2.500–4.000 CHF/Monat für einen Vollzeitplatz. Staatliche Subventionierung nach Einkommen möglich, aber oft lange Wartelisten. Tagesfamilien: günstigere Alternative, ca. 1.500–2.500 CHF/Monat. Kindergarten (ab 4 Jahre) und Volksschule sind kostenlos.\n\n**Familienzulagen**: Schweizer Kindergeld (Familienzulage) beträgt mind. CHF 200/Kind/Monat (kantonal variierend). Kanton Zürich: CHF 200/Monat für Kinder unter 16 Jahren. Anspruch bereits ab dem 1. Beschäftigungsmonat.\n\n**Schule Hochdeutsch vs. Schweizerdeutsch**: Ein häufig unterschätzter Faktor für Expat-Kinder. Öffentliche Schulen unterrichten in Hochdeutsch; im Alltag sprechen Kinder Schweizerdeutsch. Übergangszeit 6–18 Monate. Unterstützungskurse (DaZ — Deutsch als Zweitsprache) werden von Schulen angeboten.`,
      contentEN: `International schools in Zurich: Zurich International School (ZIS), Inter-Community School (ICS), Lyceum Alpinum Zuoz, American International School. Annual fees: CHF 20,000–35,000. State cantonal schools are free and excellent, but in German — High German and Swiss German are different.\n\nChildcare is extremely expensive in Zurich: nursery (Kita) costs CHF 2,500–4,000/month for a full-time place. State subsidisation based on income is possible, but often long waiting lists. Childminder families: cheaper alternative, approx. CHF 1,500–2,500/month. Kindergarten (from age 4) and primary school are free.\n\nFamily allowances: Swiss child benefit (Familienzulage) is at least CHF 200/child/month (varying by canton). Canton Zurich: CHF 200/month for children under 16. Entitlement from the 1st month of employment.\n\nSchool High German vs. Swiss German: A frequently underestimated factor for expat children. State schools teach in High German; children speak Swiss German in daily life. Transition period 6–18 months. Support courses (DaZ — German as a Second Language) are offered by schools.`,
      sourceUrls: ['https://www.zh.ch/de/bildung-schule.html', 'https://www.zis.ch'],
      lastVerified: new Date('2025-10-01'),
    },
    {
      section: 'for_tech_workers',
      titleDE: 'Tech-Szene Zürich: Google, ETH, Startups und das Weltfinanzhauptquartier',
      titleEN: 'Tech Scene Zurich: Google, ETH, Startups and the World Finance Headquarters',
      contentDE: `Zürich ist eines der bedeutendsten Tech-Zentren Europas — getrieben durch die ETH Zürich (globale Top-10-Universität), Googles grösstes Ingenieurzentrum ausserhalb der USA, und einen dichten Cluster von Fintech- und Deeptech-Unternehmen.\n\n**Grosse Arbeitgeber** im Tech-Bereich: Google (3.000+ Mitarbeiter, Kreis 5), UBS Technology, Credit Suisse (nun UBS), Zurich Insurance Tech, ABB Robotics, Siemens, IBM Research, Microsoft. Viele zahlen globale Gehälter mit Schweizer Kaufkraftbonus.\n\n**Gehälter (2025, Zürich, Tech)**:\n- Software Engineer L3/L4 (Google-Äquivalent): CHF 120.000–180.000 brutto/Jahr\n- Senior Engineer: CHF 180.000–250.000\n- Staff Engineer / Tech Lead: CHF 250.000–400.000\n- Fintech (Quant, Risk): CHF 200.000–500.000+\n\n**Startup-Szene**: weniger groß als Berlin/London, aber qualitativ stark — Zürich hat eine Dichte an Deep-Tech-Startups (AI, Robotik, Quantencomputing, Medtech) die europaweit einzigartig ist. ETH-Spin-offs: Numenta, Verity, Viu Eyewear, Planted, Voliro u.v.m.\n\n**Permit für Non-EU**: Arbeitserlaubnis für Nicht-EU/EFTA-Bürger ist an Kontingente gebunden — Arbeitgeber müssen nachweisen, dass kein gleich qualifizierter EU-Bürger verfügbar war (Inländervorrang). Für grosse Tech-Firmen kein praktisches Problem.`,
      contentEN: `Zurich is one of Europe's most significant tech centres — driven by ETH Zurich (global top-10 university), Google's largest engineering centre outside the US, and a dense cluster of fintech and deep-tech companies.\n\nMajor tech employers: Google (3,000+ employees, District 5), UBS Technology, Credit Suisse (now UBS), Zurich Insurance Tech, ABB Robotics, Siemens, IBM Research, Microsoft. Many pay global salaries with a Swiss purchasing power bonus.\n\nSalaries (2025, Zurich, tech):\n- Software Engineer L3/L4 (Google equivalent): CHF 120,000–180,000 gross/year\n- Senior Engineer: CHF 180,000–250,000\n- Staff Engineer / Tech Lead: CHF 250,000–400,000\n- Fintech (Quant, Risk): CHF 200,000–500,000+\n\nStartup scene: smaller than Berlin/London but qualitatively strong — Zurich has a density of deep-tech startups (AI, robotics, quantum computing, medtech) unique in Europe. ETH spin-offs: Numenta, Verity, Viu Eyewear, Planted, Voliro and many more.\n\nPermit for non-EU: Work permit for non-EU/EFTA citizens is subject to quotas — employers must prove no equally qualified EU citizen was available (domestic priority). Not a practical problem for large tech firms.`,
      sourceUrls: ['https://www.eth.ch', 'https://www.zh.ch/de/migration-integration/zuwanderung/arbeiten.html'],
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
      toolType: 'ch_gemeinde_steuer',
      nameDE: 'Zürich Gemeinde-Steuervergleich',
      nameEN: 'Zurich Municipal Tax Comparison',
      descriptionDE: 'Vergleiche die Steuerlast in verschiedenen Zürich-nahen Gemeinden — finde die günstigste Wohnadresse.',
      descriptionEN: 'Compare tax burden across municipalities near Zurich — find the most tax-efficient residential address.',
      config: {
        regime: 'SwissKantonalTax',
        note: 'Steuerfuss-Multiplikatoren Stand 2024 — ändern sich jährlich leicht',
        municipalities: [
          { name: 'Stadt Zürich',  kanton: 'ZH', steuerfuss: 119, note: 'Hoher Steuerfuss, aber zentrale Lage' },
          { name: 'Küsnacht ZH',   kanton: 'ZH', steuerfuss: 80,  note: 'Günstig, Seeuferlage, gehobenes Wohngebiet' },
          { name: 'Maur ZH',       kanton: 'ZH', steuerfuss: 76,  note: 'Sehr günstig, Seeblick, ruhig' },
          { name: 'Herrliberg ZH', kanton: 'ZH', steuerfuss: 79,  note: 'Günstig, Weinberge, Zürichsee' },
          { name: 'Wollerau SZ',   kanton: 'SZ', steuerfuss: 64,  note: 'Günstigste Option — aber Kanton Schwyz, nicht Zürich' },
          { name: 'Freienbach SZ', kanton: 'SZ', steuerfuss: 69,  note: 'Günstig, Nähe Zürich, Kanton Schwyz' },
        ],
        infoUrl: 'https://www.estv.admin.ch/estv/de/home/direkte-bundessteuer/steuererleichterungen/steuerkalkulator.html',
      },
      isActive: true,
    },
    {
      toolType: 'first_month_budget',
      nameDE: 'Erstes-Monat-Budget Zürich',
      nameEN: 'First Month Budget Zurich',
      descriptionDE: 'Schätze deine Anlaufkosten für den ersten Monat in Zürich (in CHF — ca. 0,97 CHF/EUR).',
      descriptionEN: 'Estimate your startup costs for the first month in Zurich (in CHF — approx. 0.97 CHF/EUR).',
      config: {
        currency: 'CHF',
        note: 'Alle Angaben in CHF. 1 CHF ≈ 1,03 EUR (leichte Schwankungen)',
        categories: [
          { key: 'deposit',          labelDE: 'Mietkaution (3 Monatsmieten, auf Mietkautionskonto)', min: 4500, max: 13000 },
          { key: 'rent_first',       labelDE: 'Erste Monatsmiete',                                  min: 1500, max: 4500  },
          { key: 'health_insurance', labelDE: 'Krankenkasse (KVG Grundversicherung)',                min: 350,  max: 550   },
          { key: 'registration',     labelDE: 'Anmeldung / Kaution Strom / Diverses',               min: 200,  max: 600   },
          { key: 'furniture',        labelDE: 'Grundausstattung (falls unmöbliert)',                 min: 1000, max: 5000  },
          { key: 'living',           labelDE: 'Lebenshaltung Monat 1',                              min: 2000, max: 4000  },
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
      titleDE: 'Erste-8-Wochen-Checkliste Zürich',
      titleEN: 'First 8 Weeks Checklist Zurich',
      descriptionDE: 'Schritt-fuer-Schritt-Plan fuer EU-Buerger bei der Anmeldung in Zürich.',
      descriptionEN: 'Step-by-step plan for EU citizens registering in Zurich.',
      content: {
        items: [
          { week: 1, task: 'Kurzzeitunterkunft sichern (Serviced Apartment empfohlen, mindestens 4 Wochen)' },
          { week: 1, task: 'Schweizer Bankkonto eroeffnen: UBS, Credit Suisse (neu UBS), ZKB oder Neon/Yuh (Digitalbank)' },
          { week: 2, task: 'Anmeldung bei Einwohnerkontrolle der Gemeinde (Bevoelkerungsamt) mit Arbeitsvertrag und Pass' },
          { week: 2, task: 'Aufenthaltsbewilligung B beantragen (fuer EU-Buerger: kostenlos, laeuft parallel)' },
          { week: 2, task: 'Krankenkasse (KVG) abschliessen — Pflicht innerhalb 3 Monaten nach Einreise' },
          { week: 3, task: 'Mietkautionskonto eroeffnen (gesetzlich vorgeschrieben — kein direktes Kautionskonto beim Vermieter!)' },
          { week: 4, task: 'Langzeitwohnung suchen (Homegate.ch, Immoscout24.ch, ImmoStreet.ch)' },
          { week: 5, task: 'Quellensteuer: Arbeitgeber informiert Steueramt automatisch — keine eigene Anmeldung noetig' },
          { week: 6, task: 'Saeule 3a eroeffnen (Viac, Frankly, ZKB Freizuegigkeitsstiftung) — steuerlich sofort wirksam' },
          { week: 7, task: 'Betreibungsregisterauszug bestellen (noetig fuer Wohnungsbewerbungen)' },
          { week: 8, task: 'Fahrzeug anmelden (Kanton Zürich) falls Auto — CH-Kennzeichen und TCS-Mitgliedschaft empfohlen' },
        ],
      },
    },
    {
      resourceType: 'glossary',
      titleDE: 'Schweiz-Glossar fuer Expats',
      titleEN: 'Switzerland Expat Glossary',
      descriptionDE: 'Die wichtigsten Begriffe, Behoerden und Versicherungen fuer Neuankoemmlinge in Zürich.',
      descriptionEN: 'Key terms, authorities and insurance types for newcomers in Zurich.',
      content: {
        entries: [
          { term: 'AHV/IV', definition: 'Alters- und Hinterlassenenversicherung / Invalidenversicherung — obligatorische Grundrentenversicherung, 10,6% Arbeitnehmer+Arbeitgeber' },
          { term: 'KVG', definition: 'Krankenversicherungsgesetz — obligatorische Grundversicherung fuer alle Bewohner der Schweiz' },
          { term: 'BVG / Pensionskasse', definition: 'Berufliche Vorsorge (2. Saeule) — obligatorisch ab CHF 22.050 Jahreslohn' },
          { term: 'Saeule 3a', definition: 'Gebundene Selbstvorsorge — freiwillig, steuerlich abzugsfaehig bis CHF 7.056/Jahr' },
          { term: 'Quellensteuer', definition: 'Quellensteuerabzug direkt vom Lohn — fuer Auslander ohne Niederlassungsbewilligung C' },
          { term: 'Bewilligung B', definition: 'Jahresaufenthaltsbewilligung fuer EU-Buerger mit Arbeitsvertrag — jährlich erneuerbar' },
          { term: 'Bewilligung C', definition: 'Niederlassungsbewilligung — unbefristet, nach 5–10 Jahren, dann ordentliche Steuerpflicht' },
          { term: 'Betreibungsregisterauszug', definition: 'Auszug aus dem Betreibungsregister — Nachweis fehlender Schulden, Pflicht fuer Wohnungsbewerbungen' },
          { term: 'Mietkautionskonto', definition: 'Gesperrtes Bankkonto fuer Mietkaution — Vermieter kann nicht direkt zugreifen, gesetzlich geregelt' },
          { term: 'Steuerfuss', definition: 'Multiplikator der Gemeinde auf die kantonale Steuer — bestimmt lokale Steuerbelastung stark' },
        ],
      },
    },
    {
      resourceType: 'directory',
      titleDE: 'Wichtige Behoerden und Links Zürich',
      titleEN: 'Key Authorities and Links Zurich',
      descriptionDE: 'Direkte Links zu den wichtigsten Anlaufstellen fuer Expats in Zürich.',
      descriptionEN: 'Direct links to the most important contact points for expats in Zurich.',
      content: {
        links: [
          { name: 'Migrationsamt Zürich', url: 'https://www.zh.ch/de/migration-integration.html', description: 'Aufenthaltsbewilligungen B/C, EU-Registrierung' },
          { name: 'ESTV (Bundessteueramt)', url: 'https://www.estv.admin.ch', description: 'Quellensteuer, Bundessteuer, Steuerkalkulator' },
          { name: 'AHV-Ausgleichskasse', url: 'https://www.ahv-iv.ch', description: 'AHV/IV-Beitraege fuer Selbststaendige' },
          { name: 'Homegate.ch', url: 'https://www.homegate.ch', description: 'Groesstes Schweizer Immobilienportal' },
          { name: 'Comparis.ch', url: 'https://www.comparis.ch/krankenkassen', description: 'Krankenkassen-Vergleich und Praemienrechner' },
          { name: 'Expats.ch', url: 'https://www.expats.ch', description: 'Englischsprachige Community fuer Expats in der Schweiz' },
          { name: 'Stadt Zürich International', url: 'https://www.stadt-zuerich.ch/pd/de/index/bevoelkerungsamt.html', description: 'Einwohnerkontrolle, Anmeldung, Auslaenderausweis' },
        ],
      },
    },
    {
      resourceType: 'checklist',
      titleDE: 'Krankenkasse Zürich Wahlhilfe',
      titleEN: 'Health Insurance Zurich Selection Guide',
      descriptionDE: 'Entscheidungshilfe fuer die obligatorische Grundversicherung (KVG) in Zürich.',
      descriptionEN: 'Decision guide for mandatory basic health insurance (KVG) in Zurich.',
      content: {
        items: [
          { task: 'Anmeldung innerhalb 3 Monaten nach Einreise — dann gilt Beitrittspflicht rueckwirkend' },
          { task: 'Franchise waehlen: CHF 300 (niedrigste Praemie nein, hoechste Selbstbeteiligung nein) — CHF 2.500 (niedrigste Praemie, hoechste Franchise)' },
          { task: 'Faustregel Franchise: Wenn du gesund bist und selten Arzt besuchst, waehle CHF 2.500 Franchise' },
          { task: 'Praemienvergleich auf comparis.ch: Zuerst Kasse, dann Franchise, dann Versicherungsmodell (Standard, HMO, Telemed)' },
          { task: 'Kanton Zürich Praemien 2025 (Beispiel, 26-65 Jahre, Franchise CHF 2.500): ab ca. CHF 280–380/Monat' },
          { task: 'Zusatzversicherung (VVG): fuer Zweibettzimmer, Zahnarzt, Auslandabdeckung — separat, optional' },
          { task: 'Krankenkasse kann nicht kuendigen wegen Krankheit — freiwilliger Wechsel jedes Jahr bis 30. November' },
        ],
      },
    },
    {
      resourceType: 'template',
      titleDE: 'Zürich Wohnungsbewerbung Muster',
      titleEN: 'Zurich Flat Application Template',
      descriptionDE: 'Vorlage fuer eine erfolgreiche Wohnungsbewerbung in Zürich — inkl. notwendige Beilagen.',
      descriptionEN: 'Template for a successful flat application in Zurich — including required attachments.',
      content: {
        templateDE: 'Sehr geehrte Damen und Herren,\n\nhiermit bewerbe ich mich um die ausgeschriebene Wohnung an der [Adresse], [Kreis].\n\nZu meiner Person: Ich bin [Berufsbezeichnung] bei [Firma], habe im [Monat/Jahr] in Zürich begonnen und verfüge über ein monatliches Nettoeinkommen von ca. CHF [Betrag]. Die monatliche Miete würde weniger als [25–30]% meines Nettoeinkommens ausmachen.\n\nBeiliegend finden Sie:\n✓ Kopie Reisepass / Ausländerausweis B\n✓ Aktuellen Betreibungsregisterauszug (< 3 Monate alt)\n✓ Letzten 3 Lohnabrechnungen oder Arbeitsvertrag\n✓ Referenz des bisherigen Vermieters (auf Anfrage)\n\nIch stehe gerne für eine Besichtigung zur Verfügung.\nFreundliche Grüsse,\n[Vor- und Nachname]',
        noteDE: 'WICHTIG: Betreibungsregisterauszug ist in Zürich bei ~95% der Vermieter Pflicht. Bestelle ihn beim Betreibungsamt deiner aktuellen Gemeinde (ca. CHF 17–20, Wartezeit 2–5 Werktage).',
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
      authorName: 'Markus H.',
      authorAge: 38,
      authorProfession: 'Software Engineer bei Google Zürich',
      authorPersona: 'employed',
      yearMoved: 2019,
      contentDE: 'Zürich ist teuer, aber mein Gehalt ist es auch. Das erste Jahr war schmerzhaft — Kaution, Krankenkasse, Grundausstattung: ich habe in den ersten 3 Monaten über 30.000 CHF ausgegeben. Aber danach: ein sehr komfortables Leben. Die Stadt ist sauber, sicher, effizient. Einzige Beschwerde: die Wohnungssuche hat 4 Monate gedauert, trotz gut bezahltem Google-Job.',
      contentEN: 'Zurich is expensive, but so is my salary. The first year was painful — deposit, health insurance, basic furnishings: I spent over CHF 30,000 in the first 3 months. But after that: a very comfortable life. The city is clean, safe, efficient. Only complaint: the flat search took 4 months, despite a well-paid Google job.',
      rating: 4,
      isVerified: false,
    },
    {
      authorName: 'Julia & Patrick F.',
      authorAge: 36,
      authorProfession: 'Ärztin & Finanzanalyst',
      authorPersona: 'family',
      yearMoved: 2017,
      contentDE: 'Als Familie mit zwei Kindern ist Zürich sensationell — öffentliche Schulen sind exzellent, die Sicherheit ist unübertroffen, Natur ist 20 Minuten entfernt. Kita hat uns fast ruiniert: 6.800 CHF/Monat für zwei Kinder. Danach war es besser. Die Quellensteuer-Abrechnung ist komplexer als gedacht — unbedingt Steuerberater engagieren.',
      contentEN: 'As a family with two children Zurich is sensational — state schools are excellent, safety is unmatched, nature is 20 minutes away. Nursery almost ruined us: CHF 6,800/month for two children. After that it was better. The withholding tax calculation is more complex than expected — definitely hire a tax advisor.',
      rating: 5,
      isVerified: false,
    },
    {
      authorName: 'Annika B.',
      authorAge: 31,
      authorProfession: 'UX Designerin (Freelance)',
      authorPersona: 'freelancer',
      yearMoved: 2021,
      contentDE: 'Als Freelancerin in Zürich: Die AHV-Beiträge (9,7 % vom Gewinn) haben mich anfangs überrascht. Aber das Schweizer Sozialversicherungssystem ist robust. Ich zahle zwar viel, weiß aber, was ich bekomme. Das Gemeinde-Steuer-Thema: Ich bin nach Maur (Steuerfuss 76) gezogen statt in der Stadt zu bleiben — spare damit ~3.000 CHF/Jahr. Lohnt sich die Pendlerei zum Zentrum.',
      contentEN: 'As a freelancer in Zurich: the AHV contributions (9.7% on profit) surprised me at first. But the Swiss social insurance system is robust. I pay a lot but know what I get. The municipal tax topic: I moved to Maur (tax rate 76) instead of staying in the city — saving ~CHF 3,000/year. Worth the commute to the centre.',
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

  console.log('\n✅ Zurich premium seed complete. Districts:8 Narratives:5 Tools:2 Resources:5 Testimonials:3');
}

async function main() {
  await seedZuerich();
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
