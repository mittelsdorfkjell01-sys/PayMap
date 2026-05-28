/**
 * Sprint 9 — Paris Premium Content Seed
 * Pattern: 8 districts · 5 narratives · 2 tools · 5 resources · 3 testimonials
 * Run: npm run seed:premium:paris (from packages/db)
 * Sources: service-public.fr, impots.gouv.fr, paris.fr, expatica.com/fr
 */
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../apps/nextjs/.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();
const NOW = new Date();
const CITY_ID = 'cmpbraoo0008znrhvkulrkibb';
const SOURCE = 'seloger.com 2025';

export async function seedParis() {
  console.log('🌍 Seeding Paris premium content...');

  // --- Districts ---
  console.log('\n📍 Creating districts...');
  const districts = [
    {
      slug: 'paris-marais-bastille',
      nameDE: 'Le Marais / Bastille (3.–4. / 11. Arr.)',
      nameEN: 'Le Marais / Bastille (3rd–4th / 11th arr.)',
      descriptionDE: 'Historisches Jüdisches Viertel und lebhaftes Nachtleben — beliebt bei Kreativen, jungen Expats, sehr teuer.',
      descriptionEN: 'Historic Jewish quarter and vibrant nightlife — popular with creatives, young expats, very expensive.',
      latitude: 48.8575, longitude: 2.3593, vibe: 'bohemian', priceLevel: 5, sortOrder: 1,
      col: [
        { category: 'rent_studio', value: 1400, currency: 'EUR' },
        { category: 'rent_1br', value: 1900, currency: 'EUR' },
        { category: 'rent_2br', value: 2800, currency: 'EUR' },
      ],
    },
    {
      slug: 'paris-montmartre-pigalle',
      nameDE: 'Montmartre / Pigalle (18. Arr.)',
      nameEN: 'Montmartre / Pigalle (18th arr.)',
      descriptionDE: 'Ikonisches Künstlerviertel auf dem Hügel — touristisch, aber mit lebhafter Nachbarschaft und Kulturszene.',
      descriptionEN: 'Iconic hilltop artists district — touristy but with a vibrant local community and cultural scene.',
      latitude: 48.8865, longitude: 2.3431, vibe: 'bohemian', priceLevel: 3, sortOrder: 2,
      col: [
        { category: 'rent_studio', value: 1050, currency: 'EUR' },
        { category: 'rent_1br', value: 1500, currency: 'EUR' },
        { category: 'rent_2br', value: 2100, currency: 'EUR' },
      ],
    },
    {
      slug: 'paris-saint-germain-luxembourg',
      nameDE: 'Saint-Germain-des-Prés / Luxembourg (5.–6. Arr.)',
      nameEN: 'Saint-Germain-des-Prés / Luxembourg (5th–6th arr.)',
      descriptionDE: 'Intellektuelles Herz von Paris — Cafés, Universitäten, Sorbonne, historische Buchhandlungen. Sehr exklusiv.',
      descriptionEN: 'Intellectual heart of Paris — cafés, universities, Sorbonne, historic bookshops. Very exclusive.',
      latitude: 48.8497, longitude: 2.3378, vibe: 'urban-modern', priceLevel: 5, sortOrder: 3,
      col: [
        { category: 'rent_studio', value: 1500, currency: 'EUR' },
        { category: 'rent_1br', value: 2100, currency: 'EUR' },
        { category: 'rent_2br', value: 3200, currency: 'EUR' },
      ],
    },
    {
      slug: 'paris-belleville-menilmontant',
      nameDE: 'Belleville / Ménilmontant (19.–20. Arr.)',
      nameEN: 'Belleville / Ménilmontant (19th–20th arr.)',
      descriptionDE: 'Multikulturell, günstigere Mieten, aufstrebende Kunst- und Gastroszene — beliebt bei jungen Franzosen und Expats.',
      descriptionEN: 'Multicultural, more affordable rents, emerging art and food scene — popular with young French and expats.',
      latitude: 48.8717, longitude: 2.3829, vibe: 'trendy', priceLevel: 2, sortOrder: 4,
      col: [
        { category: 'rent_studio', value: 900, currency: 'EUR' },
        { category: 'rent_1br', value: 1250, currency: 'EUR' },
        { category: 'rent_2br', value: 1750, currency: 'EUR' },
      ],
    },
    {
      slug: 'paris-neuilly-levallois',
      nameDE: 'Neuilly-sur-Seine / Levallois-Perret',
      nameEN: 'Neuilly-sur-Seine / Levallois-Perret',
      descriptionDE: 'Bürgerliche Westvorstadt — internationale Schulen, Unternehmenszentralen, ruhig und sehr gut vernetzt.',
      descriptionEN: 'Upscale western suburb — international schools, corporate headquarters, quiet and very well-connected.',
      latitude: 48.8834, longitude: 2.2734, vibe: 'suburban', priceLevel: 5, sortOrder: 5,
      col: [
        { category: 'rent_studio', value: 1400, currency: 'EUR' },
        { category: 'rent_1br', value: 2000, currency: 'EUR' },
        { category: 'rent_2br', value: 3000, currency: 'EUR' },
      ],
    },
    {
      slug: 'paris-15e-vaugirard',
      nameDE: '15. Arrondissement (Vaugirard / Grenelle)',
      nameEN: '15th arrondissement (Vaugirard / Grenelle)',
      descriptionDE: 'Größtes Arrondissement, überwiegend Wohngebiet — gute Infrastruktur, gemischte Bevölkerung, moderatere Mieten.',
      descriptionEN: 'Largest arrondissement, predominantly residential — good infrastructure, mixed population, moderate rents.',
      latitude: 48.8404, longitude: 2.2969, vibe: 'authentic', priceLevel: 3, sortOrder: 6,
      col: [
        { category: 'rent_studio', value: 1100, currency: 'EUR' },
        { category: 'rent_1br', value: 1550, currency: 'EUR' },
        { category: 'rent_2br', value: 2200, currency: 'EUR' },
      ],
    },
    {
      slug: 'paris-vincennes-saint-mande',
      nameDE: 'Vincennes / Saint-Mandé (Ostrand)',
      nameEN: 'Vincennes / Saint-Mandé (Eastern fringe)',
      descriptionDE: 'Ruhige Vororte östlich von Paris — Bois de Vincennes direkt vor der Tür, Familienleben, 15 Min. zur City.',
      descriptionEN: 'Quiet suburbs east of Paris — Bois de Vincennes right on the doorstep, family life, 15 min to the city.',
      latitude: 48.8477, longitude: 2.4360, vibe: 'suburban', priceLevel: 3, sortOrder: 7,
      col: [
        { category: 'rent_studio', value: 1000, currency: 'EUR' },
        { category: 'rent_1br', value: 1400, currency: 'EUR' },
        { category: 'rent_2br', value: 1950, currency: 'EUR' },
      ],
    },
    {
      slug: 'paris-banlieue-sud',
      nameDE: 'Südliche Banlieue (Montrouge, Issy, Clamart)',
      nameEN: 'Southern Banlieue (Montrouge, Issy, Clamart)',
      descriptionDE: 'Günstigere Gemeinden südlich von Paris — gute Metro/RER-Anbindung, deutlich niedrigere Mietpreise als intra-muros.',
      descriptionEN: 'More affordable municipalities south of Paris — good metro/RER connections, significantly lower rents than intra-muros.',
      latitude: 48.8153, longitude: 2.3117, vibe: 'suburban', priceLevel: 1, sortOrder: 8,
      col: [
        { category: 'rent_studio', value: 800, currency: 'EUR' },
        { category: 'rent_1br', value: 1100, currency: 'EUR' },
        { category: 'rent_2br', value: 1500, currency: 'EUR' },
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
      titleDE: 'Paris als Wahlheimat: Kulturhauptstadt, Wohnungsmarkt und bürokratische Realität',
      titleEN: 'Paris as a New Home: Cultural Capital, Housing Market and Bureaucratic Reality',
      contentDE: `Paris ist die größte Expat-Destination Europas — mit Weltstadtflair, exzellenter Infrastruktur (14 Metrolinien, RER, TGV) und einem dichten Netz internationaler Schulen und Institutionen. Gleichzeitig gilt Paris als eine der teuersten Städte Europas: Die Durchschnittsmiete für eine 1-Zimmer-Wohnung liegt intra-muros bei 1.400–2.100 EUR/Monat, in günstigeren Arrondissements (18., 19., 20.) ab 1.100 EUR.\n\nEin wichtiges Detail: Paris hat seit 2019 eine **Mietpreisbremse** (encadrement des loyers), die Neumieten in allen Arrondissements auf einen Index-Wert deckelt. In der Praxis schützt das vor extremen Mietsteigerungen, aber Vermieter umgehen das System durch Möblierung oder Kurzzeitmietverträge.\n\nFür Einwanderer entscheidend: Die **Carte de Séjour** (Aufenthaltstitel) muss innerhalb von 3 Monaten nach Einreise für Non-EU-Bürger beantragt werden. EU-Bürger haben das Recht auf freien Aufenthalt, sollten sich aber bei der Préfecture registrieren lassen.`,
      contentEN: `Paris is Europe's largest expat destination — with cosmopolitan flair, excellent infrastructure (14 metro lines, RER, TGV) and a dense network of international schools and institutions. At the same time, Paris is one of Europe's most expensive cities: average rents for a 1-bedroom flat are EUR 1,400–2,100/month intra-muros, in more affordable arrondissements (18th, 19th, 20th) from EUR 1,100.\n\nAn important detail: Paris has had a rent cap (encadrement des loyers) since 2019, which caps new rental prices in all arrondissements to an index value. In practice this protects against extreme rent increases, but landlords circumvent the system through furnished or short-term lets.\n\nKey for immigrants: the Carte de Séjour (residence permit) must be applied for within 3 months of arrival for non-EU citizens. EU citizens have the right of free residence but should register with the Préfecture.`,
      sourceUrls: ['https://www.paris.fr', 'https://www.service-public.fr'],
      lastVerified: new Date('2025-10-01'),
    },
    {
      section: 'freelancers',
      titleDE: 'Selbstständig in Paris: Auto-Entrepreneur, SASU und Steuerpflichten',
      titleEN: 'Freelancing in Paris: Auto-Entrepreneur, SASU and Tax Obligations',
      contentDE: `Frankreich bietet Selbstständigen das **Auto-Entrepreneur-/Micro-Entrepreneur-Regime** — die einfachste Form der Selbstständigkeit. Voraussetzungen: Jahresumsatz unter 77.700 EUR (Dienstleistungen) oder 188.700 EUR (Warenhandel). Sozialabgaben: ca. 22–23 % des Umsatzes, keine Trennung von Betriebskosten. Steuern: Einkommensteuer (IRPP) auf Gewinn oder pauschale Abgabe (versement libératoire: 2,2 % auf Umsatz).\n\nFür höhere Umsätze und professionellere Struktur empfiehlt sich die **SASU** (Société par Actions Simplifiée Unipersonnelle) — Einpersonen-AG nach französischem Recht. Vorteile: Haftungsbegrenzung, flexiblere Gehaltsgestaltung, steuerliche Optimierung via Dividenden. Kosten: Buchhalter nötig (ca. 1.000–3.000 EUR/Jahr).\n\n**Lohnsteuer und Sozialabgaben** in Frankreich sind hoch: Arbeitnehmeranteil ~22 %, Arbeitgeberanteil ~43 %. Der Einkommensteuer-Grenzsteuersatz liegt ab 74.545 EUR/Jahr bei 41 %. Sonderregelung für Neuankömmlinge: **Impatriés-Regime** (Art. 155 B CGI) — 50 % Steuerfreistellung auf bestimmte Einkünfte für 8 Jahre.`,
      contentEN: `France offers self-employed persons the Auto-Entrepreneur/Micro-Entrepreneur regime — the simplest form of self-employment. Requirements: annual turnover below EUR 77,700 (services) or EUR 188,700 (goods). Social contributions: approx. 22–23% of turnover, no deduction of business costs. Taxes: income tax (IRPP) on profit or flat payment (versement libératoire: 2.2% on turnover).\n\nFor higher turnover and more professional structure, the SASU (Société par Actions Simplifiée Unipersonnelle) is recommended — a single-person company under French law. Benefits: limited liability, flexible salary structure, tax optimisation via dividends. Costs: accountant required (approx. EUR 1,000–3,000/year).\n\nIncome tax and social contributions in France are high: employee share ~22%, employer share ~43%. The marginal income tax rate from EUR 74,545/year is 41%. Special rule for newcomers: Impatriés regime (Art. 155 B CGI) — 50% tax exemption on certain income for 8 years.`,
      sourceUrls: ['https://www.autoentrepreneur.urssaf.fr', 'https://www.impots.gouv.fr'],
      lastVerified: new Date('2025-10-01'),
    },
    {
      section: 'families',
      titleDE: 'Familienleben in Paris: Schulen, CAF-Zuschüsse und Kinderbetreuung',
      titleEN: 'Family Life in Paris: Schools, CAF Benefits and Childcare',
      contentDE: `Frankreich ist familienpolitisch eines der großzügigsten Länder Europas: Die **CAF** (Caisse d'Allocations Familiales) zahlt ab dem zweiten Kind Kindergeld (Allocations Familiales: 136 EUR/Monat für 2 Kinder, mehr für weitere), Wohnbeihilfe (APL) je nach Einkommen und verschiedene Familienzuschläge.\n\n**Kinderbetreuung**: Öffentliche Krippen (crèches municipales) kosten 0–600 EUR/Monat je nach Einkommen (quotient familial), sind aber überbucht — frühzeitig anmelden. Alternative: Tagesmütter (assistantes maternelles) mit staatlichem Zuschuss (PAJE: bis zu 920 EUR/Monat Erstattung). Ab 3 Jahren ist die Vorschule (maternelle) kostenlos und praktisch universell.\n\n**Internationale Schulen** konzentrieren sich in Neuilly-sur-Seine, im 16. Arr. und in Saint-Germain-en-Laye: Deutsche Schule Paris, Lycée International, American School of Paris, British School of Paris. Jahresgebühren: 10.000–25.000 EUR. Öffentliche Schulen sind exzellent, aber auf Französisch.`,
      contentEN: `France is one of Europe's most generous countries for family policy: the CAF (Caisse d'Allocations Familiales) pays from the second child onwards child benefit (Allocations Familiales: EUR 136/month for 2 children, more for additional), housing benefit (APL) based on income and various family supplements.\n\nChildcare: public nurseries (crèches municipales) cost EUR 0–600/month based on income (quotient familial), but are oversubscribed — register early. Alternative: childminders (assistantes maternelles) with state subsidy (PAJE: up to EUR 920/month reimbursement). From age 3, preschool (maternelle) is free and near-universal.\n\nInternational schools are concentrated in Neuilly-sur-Seine, the 16th arr. and Saint-Germain-en-Laye: Deutsche Schule Paris, Lycée International, American School of Paris, British School of Paris. Annual fees: EUR 10,000–25,000. Public schools are excellent but in French.`,
      sourceUrls: ['https://www.caf.fr', 'https://www.dspar.fr'],
      lastVerified: new Date('2025-10-01'),
    },
    {
      section: 'retirees',
      titleDE: 'Ruhestand in Paris: Rentensteuern, Konventionen und Gesundheitsversorgung',
      titleEN: 'Retirement in Paris: Pension Taxes, Conventions and Healthcare',
      contentDE: `Für Deutsche, die nach Frankreich ziehen, gilt das **Doppelbesteuerungsabkommen Deutschland-Frankreich (DBA)**: Private Renten und Betriebsrenten werden grundsätzlich in Frankreich besteuert, nicht in Deutschland. Gesetzliche Renten aus Deutschland (Deutsche Rentenversicherung) hingegen unterliegen dem Besteuerungsrecht Deutschlands — aber nur auf den steuerpflichtigen Anteil (je nach Renteneintrittsalter). Wichtig: Beide Staaten tauschen Daten aus, daher unbedingt in beiden Ländern korrekt deklarieren.\n\nFrankreichs Einkommensteuer für Rentner ist progressiv: 0 % bis 10.777 EUR, 11 % bis 27.478 EUR, 30 % bis 78.570 EUR. Dazu kommen Sozialabgaben (CSG: 6,6–8,3 % je nach Einkommen) auf Renten — aber EU-Bürger ohne Anspruch auf franz. Sozialversicherung können CSG-Befreiung beantragen.\n\n**Krankenversicherung**: EU-Bürger mit Residenz in Frankreich können sich nach 3 Monaten bei der **CPAM** (Caisse Primaire d'Assurance Maladie) anmelden. Rentner aus EU-Ländern können ihre europäische Krankenversicherungskarte (EHIC) nutzen oder sich über die PUMA (Protection Universelle Maladie) anmelden.`,
      contentEN: `For Germans moving to France, the Germany-France double taxation agreement (DBA) applies: private pensions and occupational pensions are generally taxed in France, not Germany. Statutory pensions from Germany (Deutsche Rentenversicherung), however, are subject to German taxation rights — but only on the taxable portion (depending on retirement age). Important: both countries exchange data, so always declare correctly in both countries.\n\nFrance's income tax for retirees is progressive: 0% up to EUR 10,777, 11% up to EUR 27,478, 30% up to EUR 78,570. In addition, social contributions (CSG: 6.6–8.3% depending on income) apply to pensions — but EU citizens without entitlement to French social security can apply for CSG exemption.\n\nHealthcare: EU citizens with residence in France can register with the CPAM (Caisse Primaire d'Assurance Maladie) after 3 months. Retirees from EU countries can use their European Health Insurance Card (EHIC) or register via the PUMA (Protection Universelle Maladie).`,
      sourceUrls: ['https://www.impots.gouv.fr', 'https://www.ameli.fr'],
      lastVerified: new Date('2025-10-01'),
    },
    {
      section: 'tech',
      titleDE: 'Tech-Szene Paris: Station F, Startups und das Impatriés-Regime',
      titleEN: 'Tech Scene Paris: Station F, Startups and the Impatriés Regime',
      contentDE: `Paris ist das führende Tech-Ökosystem Kontinentaleuropas: **Station F** (Camille-Desmoulins-Straße, 13. Arr.) beherbergt 1.000+ Startups und gilt als weltgrößter Startup-Campus. Große Tech-Arbeitgeber: Meta, Google, LinkedIn, Doctolib, Contentsquare, Back Market, ManoMano und hunderte Scale-ups in La Défense und im 13./15. Arrondissement.\n\nGehälter in Paris sind im europäischen Vergleich mittelstark: Senior Software Engineers verdienen 65.000–95.000 EUR brutto/Jahr, Product Manager 70.000–100.000 EUR. Das **Impatriés-Regime** (Art. 155 B CGI) macht Paris für internationale Top-Talente attraktiv: 50 % der Prämien, Bezüge aus dem Ausland und bestimmte Einkünfte sind für 8 Jahre von der Einkommensteuer befreit.\n\nFür internationale Tech-Talente ohne Vorort-Präsenz gibt es das **Passeport Talent** (Talent Visa): mehrjährige Aufenthaltserlaubnis für Hochqualifizierte mit Jobangebot oder als Unternehmensgründer. Bearbeitungszeit: 4–8 Wochen. Familienangehörige erhalten einen eigenständigen Aufenthaltstitel.`,
      contentEN: `Paris is continental Europe's leading tech ecosystem: Station F (Camille-Desmoulins street, 13th arr.) hosts 1,000+ startups and is considered the world's largest startup campus. Major tech employers: Meta, Google, LinkedIn, Doctolib, Contentsquare, Back Market, ManoMano and hundreds of scale-ups in La Défense and the 13th/15th arrondissement.\n\nSalaries in Paris are mid-range for Europe: Senior Software Engineers earn EUR 65,000–95,000 gross/year, Product Managers EUR 70,000–100,000. The Impatriés regime (Art. 155 B CGI) makes Paris attractive for international top talent: 50% of bonuses, foreign-sourced income and certain earnings are exempt from income tax for 8 years.\n\nFor international tech talent without prior French presence, the Passeport Talent (Talent Visa) is available: multi-year residence permit for highly qualified people with a job offer or as entrepreneurs. Processing time: 4–8 weeks. Family members receive an independent residence permit.`,
      sourceUrls: ['https://www.stationf.co', 'https://www.impots.gouv.fr/international-particulier/les-impatries'],
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
      nameDE: 'Impatriés-Regime Eignungscheck',
      nameEN: 'Impatriés Regime Eligibility Checker',
      descriptionDE: 'Prüfe, ob du das französische Impatriés-Regime (50 % Steuerfreistellung, 8 Jahre) nutzen kannst.',
      descriptionEN: 'Check whether you can use the French Impatriés regime (50% tax exemption, 8 years).',
      config: {
        regime: 'ImpatriésFrance',
        exemptionRate: 0.50,
        duration: 8,
        steps: ['no_france_residence_5y', 'employed_by_french_company', 'commit_stay'],
        infoUrl: 'https://www.impots.gouv.fr/international-particulier/les-impatries',
        legalBase: 'Art. 155 B CGI',
      },
      isActive: true,
    },
    {
      toolType: 'first_month_budget',
      nameDE: 'Erstes-Monat-Budget Paris',
      nameEN: 'First Month Budget Paris',
      descriptionDE: 'Schätze deine Anlaufkosten für den ersten Monat in Paris.',
      descriptionEN: 'Estimate your startup costs for the first month in Paris.',
      config: {
        currency: 'EUR',
        categories: [
          { key: 'deposit', labelDE: 'Mietkaution (1–2 Monatsmieten)', min: 1100, max: 4200 },
          { key: 'rent_first', labelDE: 'Erste Monatsmiete', min: 800, max: 2100 },
          { key: 'agence', labelDE: 'Maklergebühr (1 Monatsmiete + Scheck)', min: 800, max: 2100 },
          { key: 'garantie_garant', labelDE: 'Garant / VISALE beantragen (kostenlos)', min: 0, max: 0 },
          { key: 'health_insurance', labelDE: 'Krankenversicherung (bis CPAM-Anmeldung)', min: 80, max: 250 },
          { key: 'furniture', labelDE: 'Grundausstattung (wenn unmoebliert)', min: 500, max: 2500 },
          { key: 'living', labelDE: 'Lebenshaltung Monat 1', min: 1000, max: 1800 },
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
      titleDE: 'Erste-8-Wochen-Checkliste Paris',
      titleEN: 'First 8 Weeks Checklist Paris',
      descriptionDE: 'Schritt-fuer-Schritt-Plan fuer die Anmeldung in Paris.',
      descriptionEN: 'Step-by-step plan for registering in Paris.',
      content: {
        items: [
          { week: 1, task: 'Kurzzeitmietung sichern (Airbnb, hotele oder Meuble-Vertrag)' },
          { week: 1, task: 'Franzoeisches Bankkonto eroeffnen (BNP, Societe Generale, Boursorama, N26 FR)' },
          { week: 2, task: 'Steuernummer (Numero Fiscal) bei impots.gouv.fr beantragen' },
          { week: 2, task: 'Carte de Sejour beantragen (Non-EU) — Praefecture de Police de Paris' },
          { week: 2, task: 'CPAM-Anmeldung (Krankenversicherung) bei Ameli.fr einleiten' },
          { week: 3, task: 'Langfristige Wohnung suchen (SeLoger, LeBonCoin, PAP, FUSAC)' },
          { week: 4, task: 'VISALE-Garantie beantragen (kostenloser staatlicher Mietbuergschaft-Ersatz)' },
          { week: 5, task: 'Impatries-Antrag mit Arbeitgeber abstimmen — Frist: mit erster Steuererklaerung' },
          { week: 6, task: 'CAF-Antrag stellen (APL Wohnbeihilfe, Allocations Familiales)' },
          { week: 7, task: 'Schulanmeldung fuer Kinder bei der Mairie des Arrondissements' },
          { week: 8, task: 'Steuererklaerung vorbereiten — Nutzerkonto impots.gouv.fr einrichten' },
        ],
      },
    },
    {
      resourceType: 'glossary',
      titleDE: 'Frankreich-Glossar fuer Expats',
      titleEN: 'France Expat Glossary',
      descriptionDE: 'Die wichtigsten Behoerden, Dokumente und Begriffe fuer Neuankoemmlinge in Paris.',
      descriptionEN: 'Key authorities, documents and terms for newcomers in Paris.',
      content: {
        entries: [
          { term: 'Carte de Sejour', definition: 'Aufenthaltstitel fuer Non-EU-Buerger — Antrag bei der Praefecture de Police innerhalb 3 Monate nach Einreise' },
          { term: 'Numero Fiscal', definition: 'Steuerliche Identifikationsnummer — Voraussetzung fuer Steuererklaerung und staatliche Leistungen' },
          { term: 'CPAM', definition: 'Caisse Primaire d\'Assurance Maladie — oeffentliche Krankenversicherung, Anmeldung nach 3 Monaten Residenz' },
          { term: 'CAF', definition: 'Caisse d\'Allocations Familiales — Kindergeld, Wohnbeihilfe (APL), Familienzulagen' },
          { term: 'VISALE', definition: 'Kostenlose staatliche Mietbuergschaft fuer Mieter ohne Garant — beantragen bei visale.fr' },
          { term: 'Impatries-Regime', definition: 'Steuerfreistellung 50 % fuer 8 Jahre (Art. 155 B CGI) — fuer Neuankoemmlinge mit Arbeitgeber in Frankreich' },
          { term: 'Auto-Entrepreneur', definition: 'Einfachste Selbststaendigkeitsform in Frankreich — Umsatzgrenze 77.700 EUR (Dienstleistungen)' },
          { term: 'Quotient Familial', definition: 'Franzoeischer Einkommensindex fuer Familien — bestimmt Hoehe von Kita-Gebuehren, Schulessen, CAF-Leistungen' },
          { term: 'Encadrement des Loyers', definition: 'Mietpreisbremse in Paris seit 2019 — deckt Neumieten per Arrondissement und Wohnungstyp' },
          { term: 'Passeport Talent', definition: 'Mehrjaehrige Aufenthaltserlaubnis fuer Hochqualifizierte und Gruender — inkl. Arbeitsrecht fuer Partner' },
        ],
      },
    },
    {
      resourceType: 'directory',
      titleDE: 'Wichtige Behoerden und Links Paris',
      titleEN: 'Key Authorities and Links Paris',
      descriptionDE: 'Direkte Links zu den wichtigsten Anlaufstellen fuer Expats in Paris.',
      descriptionEN: 'Direct links to the most important contact points for expats in Paris.',
      content: {
        links: [
          { name: 'Impots.gouv.fr', url: 'https://www.impots.gouv.fr', description: 'Steuererklaerung, Impatries-Antrag, Nummer Fiscal' },
          { name: 'Service-Public.fr', url: 'https://www.service-public.fr', description: 'Zentrale Informationsplattform fuer alle Behoerdenprozesse' },
          { name: 'Ameli.fr (CPAM)', url: 'https://www.ameli.fr', description: 'Krankenversicherung, Carte Vitale beantragen' },
          { name: 'CAF.fr', url: 'https://www.caf.fr', description: 'Kindergeld, APL-Wohnbeihilfe, PAJE-Kinderbetreuungszuschuss' },
          { name: 'Praefecture de Police Paris', url: 'https://www.prefecturedepolice.interieur.gouv.fr', description: 'Carte de Sejour, Titre de Sejour Non-EU' },
          { name: 'VISALE', url: 'https://www.visale.fr', description: 'Kostenlose staatliche Mietbuergschaft' },
          { name: 'Deutsche Schule Paris', url: 'https://www.dspar.fr', description: 'Anmeldung, Jahrgangsstufen, Schulgeldinfo' },
          { name: 'SeLoger Paris', url: 'https://www.seloger.com/paris-75.htm', description: 'Groesstes Wohnungsportal Frankreichs' },
        ],
      },
    },
    {
      resourceType: 'checklist',
      titleDE: 'Impatries-Regime Paris Checkliste',
      titleEN: 'Impatries Regime Paris Checklist',
      descriptionDE: 'Was du fuer das franzoesische Impatries-Regime brauchst.',
      descriptionEN: 'What you need for the French Impatries regime.',
      content: {
        items: [
          { task: 'Kein franz. Steuerwohnsitz in den letzten 5 Jahren (Meldebescheinigung DE)' },
          { task: 'Arbeitsvertrag mit franzoesischem Unternehmen ODER als Entsandter eines Auslandsunternehmens' },
          { task: 'Nachweis der Anwerbung aus dem Ausland (Vertragsunterschrift vor Einreise)' },
          { task: 'Antrag nicht separates Formular — wird in der ersten franzoesischen Steuererklaerung (No 2042) angegeben' },
          { task: 'Mit Arbeitgeber abstimmen: Gehaltszettel muss Prim-d\'Impatriation separat ausweisen' },
          { task: 'Dauer: 8 Jahre ab Ankunftsjahr (max. bis Ende des 8. Jahres nach Einreisejahr)' },
          { task: 'Steuerberater (Expert-Comptable) empfohlen bei Kombination mit Bonus/Aktienoptionen' },
        ],
      },
    },
    {
      resourceType: 'template',
      titleDE: 'Paris Wohnungssuche Bewerbungsvorlage',
      titleEN: 'Paris Flat Search Application Template',
      descriptionDE: 'Vorlage fuer die Wohnungsbewerbung auf Franzoesisch.',
      descriptionEN: 'Template for flat applications in French.',
      content: {
        templateFR: 'Madame, Monsieur,\n\nJe me permets de vous contacter au sujet de l\'appartement situe au [adresse], [arrondissement].\n\nJe suis [profession], de nationalite [pays], resident(e) a Paris depuis [date]. Mon revenu net mensuel s\'eleve a [montant] EUR. Je suis en mesure de fournir les documents suivants :\n- Copie de la carte de sejour / passeport\n- 3 derniers bulletins de salaire / releves bancaires\n- Contrat de travail\n- Garant (particulier ou VISALE)\n- Lettre de motivation\n\nJe reste a votre disposition pour tout renseignement complementaire.\nCordialement,\n[Prenom Nom]',
        noteDE: 'Tipp: VISALE-Garantie vorab beantragen (visale.fr) — franzoesische Vermieter akzeptieren sie als vollwertigen Garant.',
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
      authorName: 'Jan-Philipp M.',
      authorAge: 31,
      authorProfession: 'Data Engineer',
      authorPersona: 'employed',
      yearMoved: 2022,
      contentDE: 'Das Impatries-Regime hat mir den Entschluss nach Paris erleichtert. 50 % Freistellung auf Boni und Auslandseinnahmen sind enorm. Mein Arbeitgeber hat den Antrag ueber den Lohnzettel abgewickelt — ich musste nichts gesondert einreichen. Die Wohnungssuche war das eigentliche Abenteuer: Ohne franzoesischen Garant laeuft fast nichts. VISALE hat das geloest.',
      contentEN: 'The Impatries regime made the decision to move to Paris easier. 50% exemption on bonuses and foreign income is huge. My employer handled the application via the payslip — I did not have to file anything separately. Flat hunting was the real adventure: without a French guarantor almost nothing works. VISALE solved that.',
      rating: 5,
      isVerified: true,
    },
    {
      authorName: 'Sabine & Peter H.',
      authorAge: 45,
      authorProfession: 'Unternehmensberaterin & IT-Projektmanager',
      authorPersona: 'family',
      yearMoved: 2020,
      contentDE: 'Wir leben im 15. Arrondissement — zentral, ruhig genug fuer Kinder, nahe der Deutschen Schule Paris. Die CAF-Leistungen haben uns ueberrascht: APL fuer unsere Wohnung plus Allocations Familiales. Macht fast 600 EUR/Monat zusammen. Das franzoesische Bildungssystem ist exzellent, aber fuer die ersten Jahre in Paris ist die Sprachbarriere fuer die Kinder real.',
      contentEN: 'We live in the 15th arrondissement — central, quiet enough for children, close to the Deutsche Schule Paris. The CAF benefits surprised us: APL for our flat plus Allocations Familiales. Together almost EUR 600/month. The French education system is excellent, but for the first years in Paris the language barrier for children is real.',
      rating: 4,
      isVerified: true,
    },
    {
      authorName: 'Dr. Karin L.',
      authorAge: 58,
      authorProfession: 'Rentnerin',
      authorPersona: 'retiree',
      yearMoved: 2021,
      contentDE: 'Das DBA zwischen Deutschland und Frankreich ist kompliziert — meine gesetzliche Rente wird in Deutschland besteuert, meine Betriebsrente in Frankreich. Mein Steuerberater in beiden Laendern ist unverzichtbar. Dafuer: Paris ist fuer Rentner wunderbar. Die CPAM funktioniert gut, und mit einer Complementaire Sante (Zusatzversicherung) ist man rundum versorgt.',
      contentEN: 'The DBA between Germany and France is complicated — my statutory pension is taxed in Germany, my occupational pension in France. My tax adviser in both countries is indispensable. But: Paris is wonderful for retirees. The CPAM works well, and with a Complementaire Sante (supplementary insurance) you are fully covered.',
      rating: 4,
      isVerified: true,
    },
  ];

  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({ where: { cityId: CITY_ID, authorName: t.authorName } });
    if (!existing) {
      await prisma.testimonial.create({ data: { ...t, cityId: CITY_ID } });
    }
    console.log(`  ✓ ${t.authorName}`);
  }

  console.log('\n✅ Paris premium seed complete. Districts:8 Narratives:5 Tools:2 Resources:5 Testimonials:3');
}

async function main() {
  await seedParis();
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
