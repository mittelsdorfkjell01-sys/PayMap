import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const passwordHash = await bcrypt.hash("paymap2024!", 10);
  await prisma.adminUser.upsert({
    where: { email: "admin@paymap.io" },
    update: {},
    create: { email: "admin@paymap.io", passwordHash },
  });

  // HomeTaxConfig — Deutschland
  await prisma.homeTaxConfig.upsert({
    where: { countrySlug: "de" },
    update: {},
    create: {
      countrySlug: "de",
      label: "Deutschland 2024",
      brackets: [
        { upTo: 11604, type: "zero" },
        { upTo: 17005, type: "formula", a: 979.18, b: 1400, offset: 11604 },
        { upTo: 66760, type: "formula", a: 192.59, b: 2397, offset: 17005, base: 966.53 },
        { upTo: 277825, type: "linear", rate: 0.42, deduct: 10602.13 },
        { upTo: null, type: "linear", rate: 0.45, deduct: 18936.88 },
      ],
      social: [
        { slug: "pension", rate: 0.093, cap: 87600 },
        { slug: "unemployment", rate: 0.013, cap: 87600 },
        { slug: "health", rate: 0.073, cap: 59850 },
        { slug: "ltc", rate: 0.018, cap: 59850 },
      ],
    },
  });

  // Helper to create a city
  async function createCity(data: {
    slug: string;
    flag: string;
    isHomeCity: boolean;
    sortOrder: number;
    nameDE: string;
    nameEN: string;
    countryDE: string;
    countryEN: string;
    col: { rent: number; food: number; transport: number };
    regimes?: Array<{
      slug: string;
      labelDE: string;
      labelEN: string;
      incomeRate: number;
      socialRate: number;
      exemptFrac?: number;
      isDefault: boolean;
      sortOrder: number;
    }>;
    detailsDE?: Record<string, string[]>;
    detailsEN?: Record<string, string[]>;
  }) {
    const city = await prisma.city.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        slug: data.slug,
        flag: data.flag,
        isHomeCity: data.isHomeCity,
        sortOrder: data.sortOrder,
        isActive: true,
        translations: {
          create: [
            { locale: "de", name: data.nameDE, country: data.countryDE },
            { locale: "en", name: data.nameEN, country: data.countryEN },
          ],
        },
        col: {
          create: data.col,
        },
      },
    });

    if (data.regimes) {
      for (const r of data.regimes) {
        await prisma.taxRegime.upsert({
          where: { id: `${data.slug}-${r.slug}` },
          update: {},
          create: {
            id: `${data.slug}-${r.slug}`,
            cityId: city.id,
            slug: r.slug,
            incomeRate: r.incomeRate,
            socialRate: r.socialRate,
            exemptFrac: r.exemptFrac,
            isDefault: r.isDefault,
            sortOrder: r.sortOrder,
            translations: {
              create: [
                { locale: "de", label: r.labelDE },
                { locale: "en", label: r.labelEN },
              ],
            },
          },
        });
      }
    }

    const sections = ["fin", "cost", "sec", "climate", "sport", "social"] as const;
    if (data.detailsDE) {
      for (const section of sections) {
        const items = data.detailsDE[section];
        if (items && items.length > 0) {
          await prisma.cityDetail.upsert({
            where: { cityId_section_locale: { cityId: city.id, section, locale: "de" } },
            update: { items },
            create: { cityId: city.id, section, locale: "de", items },
          });
        }
      }
    }
    if (data.detailsEN) {
      for (const section of sections) {
        const items = data.detailsEN[section];
        if (items && items.length > 0) {
          await prisma.cityDetail.upsert({
            where: { cityId_section_locale: { cityId: city.id, section, locale: "en" } },
            update: { items },
            create: { cityId: city.id, section, locale: "en", items },
          });
        }
      }
    }

    return city;
  }

  // Home cities
  await createCity({
    slug: "berlin",
    flag: "🇩🇪",
    isHomeCity: true,
    sortOrder: 0,
    nameDE: "Berlin",
    nameEN: "Berlin",
    countryDE: "Deutschland",
    countryEN: "Germany",
    col: { rent: 1850, food: 450, transport: 86 },
  });

  await createCity({
    slug: "hamburg",
    flag: "🇩🇪",
    isHomeCity: true,
    sortOrder: 1,
    nameDE: "Hamburg",
    nameEN: "Hamburg",
    countryDE: "Deutschland",
    countryEN: "Germany",
    col: { rent: 2100, food: 480, transport: 107 },
  });

  await createCity({
    slug: "muenchen",
    flag: "🇩🇪",
    isHomeCity: true,
    sortOrder: 2,
    nameDE: "München",
    nameEN: "Munich",
    countryDE: "Deutschland",
    countryEN: "Germany",
    col: { rent: 2650, food: 520, transport: 57 },
  });

  // Target cities
  await createCity({
    slug: "lissabon",
    flag: "🇵🇹",
    isHomeCity: false,
    sortOrder: 0,
    nameDE: "Lissabon",
    nameEN: "Lisbon",
    countryDE: "Portugal",
    countryEN: "Portugal",
    col: { rent: 1250, food: 320, transport: 40 },
    regimes: [
      { slug: "ifici", labelDE: "IFICI · 20 % flat", labelEN: "IFICI · 20% flat", incomeRate: 0.20, socialRate: 0.11, isDefault: true, sortOrder: 0 },
      { slug: "standard", labelDE: "Standard · 27,5 %", labelEN: "Standard · 27.5%", incomeRate: 0.275, socialRate: 0.11, isDefault: false, sortOrder: 1 },
    ],
    detailsDE: {
      fin: ["NHR-Nachfolge IFICI: 20 % Flat Tax auf ausländische Einkünfte", "Sozialabgaben: 11 % (Arbeitnehmer)", "Keine Gewerbesteuer für Freiberufler unter 200.000 €", "Bankkonten bei Millennium, BCP oder N26 PT eröffenbar"],
      cost: ["Miete Zentrum 1-Zi: 1.100–1.500 €/Mo", "Supermarkt (Pingo Doce, Continente): günstig vs. DE", "ÖPNV-Monatskarte Lissabon: 40 €", "Restaurantmittagessen: 9–13 €"],
      sec: ["Aufenthaltserlaubnis für EU-Bürger: Anmeldung Câmara Municipal", "Krankenversicherung: SNS (staatlich) oder Multicare privat ca. 50 €/Mo", "Kriminalitätsrate deutlich unter EU-Durchschnitt", "D7-Visum für Nicht-EU-Bürger ab 760 €/Mo Nachweis"],
      climate: ["Sonnenstunden/Jahr: ~2.800", "Durchschnittstemperatur Januar: 12 °C", "Sommer trocken, 25–35 °C, Nordatlantik-Brise", "Keine extremen Wetterereignisse"],
      sport: ["Atlantikküste: Surfen, SUP, Kite ab 30 Minuten Fahrt", "Stadtradwege 400 km Netz im Ausbau", "Fitnessstudios: 25–40 €/Mo (Holmes Place, Virgin)", "Padel sehr verbreitet, Platz ab 10 €/h"],
      social: ["Große deutsche Expat-Community (ca. 50.000)", "Coworking: Second Home, Heden, Factory Lisbon", "Sprache: Englisch in Tech-Branche weitgehend ausreichend", "NomadX- und RemoteWork-Meetups wöchentlich"],
    },
    detailsEN: {
      fin: ["IFICI successor to NHR: 20% flat tax on foreign income", "Social contributions: 11% (employee share)", "No trade tax for freelancers under €200,000", "Bank accounts available at Millennium, BCP or N26 PT"],
      cost: ["City-centre 1-bed rent: €1,100–1,500/mo", "Supermarkets (Pingo Doce, Continente): cheaper than Germany", "Lisbon monthly transit pass: €40", "Lunch at a restaurant: €9–13"],
      sec: ["EU citizens: registration at Câmara Municipal", "Health: SNS (public) or private (Multicare) ~€50/mo", "Crime rate well below EU average", "D7 visa for non-EU: proof of €760/mo income"],
      climate: ["Sunshine hours/year: ~2,800", "Average January temperature: 12 °C", "Dry summers 25–35 °C with Atlantic breeze", "No extreme weather events"],
      sport: ["Atlantic coast: surfing, SUP, kite — 30 min away", "City cycle network: 400 km and expanding", "Gyms: €25–40/mo (Holmes Place, Virgin)", "Padel very popular, courts from €10/h"],
      social: ["Large German expat community (~50,000)", "Coworking: Second Home, Heden, Factory Lisbon", "English sufficient in the tech sector", "NomadX and RemoteWork meetups weekly"],
    },
  });

  await createCity({
    slug: "barcelona",
    flag: "🇪🇸",
    isHomeCity: false,
    sortOrder: 1,
    nameDE: "Barcelona",
    nameEN: "Barcelona",
    countryDE: "Spanien",
    countryEN: "Spain",
    col: { rent: 1600, food: 380, transport: 55 },
    regimes: [
      { slug: "beckham", labelDE: "Beckham Law · 24 %", labelEN: "Beckham Law · 24%", incomeRate: 0.24, socialRate: 0.0635, isDefault: true, sortOrder: 0 },
      { slug: "standard", labelDE: "Standard · ~37 %", labelEN: "Standard · ~37%", incomeRate: 0.37, socialRate: 0.0635, isDefault: false, sortOrder: 1 },
    ],
    detailsDE: {
      fin: ["Beckham Law: 24 % auf Einkommen bis 600.000 €, 47 % darüber", "Sozialabgaben Arbeitnehmer: 6,35 %", "Gültig für 6 Jahre, Antrag innerhalb 6 Monate nach Wohnsitznahme", "Keine Vermögenssteuer auf ausländisches Vermögen (Beckham-Status)"],
      cost: ["Miete Eixample 2-Zi: 1.400–2.000 €/Mo", "ÖPNV-Monatskarte T-Casual 10 Fahrten: 11,35 €", "Supermärkte: Vergleichbar mit Deutschland", "Restaurantmittagsmenü: 12–16 €"],
      sec: ["EU-Bürger: Empadronamiento + NIE Pflicht", "Krankenversicherung: CatSalut (öffentlich) oder privat Sanitas 50–80 €/Mo", "Kriminalität: Taschendiebstahl in Touristenzonen erhöht", "Wohnungsmarkt sehr angespannt, Mietpreisbremse aktiv"],
      climate: ["Sonnenstunden/Jahr: ~2.500", "Mildes Klima, selten unter 5 °C", "Sommer heiß: 28–35 °C", "Gelegentliche Sturmregenperioden im Herbst"],
      sport: ["Strand Barceloneta direkt in der Stadt", "Ski: Andorra/Pyrenäen 2 Stunden entfernt", "Padel und Tennis sehr verbreitet, CF3 ab 8 €/h", "Badegewässer: Mittelmeer, warm Mai–Oktober"],
      social: ["Internationale Tech-Szene, 22@-Viertel als Hub", "Coworking: Betahaus, Mob, Aticco", "Amtssprachen Katalanisch + Spanisch; Englisch in Tech-Jobs", "Große deutsche Community, DSBA Verein aktiv"],
    },
    detailsEN: {
      fin: ["Beckham Law: 24% on income up to €600,000, 47% above", "Employee social contributions: 6.35%", "Valid 6 years, apply within 6 months of establishing residence", "No wealth tax on foreign assets under Beckham status"],
      cost: ["Eixample 2-bed rent: €1,400–2,000/mo", "T-Casual 10-trip transit card: €11.35", "Supermarkets: comparable to Germany", "Set lunch menu: €12–16"],
      sec: ["EU citizens: Empadronamiento + NIE required", "Health: CatSalut (public) or private Sanitas €50–80/mo", "Crime: pickpocketing elevated in tourist areas", "Housing market very tight, rent control active"],
      climate: ["Sunshine hours/year: ~2,500", "Mild climate, rarely below 5 °C", "Hot summers: 28–35 °C", "Occasional heavy rain in autumn"],
      sport: ["Barceloneta beach in the city", "Skiing: Andorra/Pyrenees 2 hours away", "Padel and tennis popular, CF3 from €8/h", "Swimming: Mediterranean, warm May–October"],
      social: ["International tech scene, 22@ district as hub", "Coworking: Betahaus, Mob, Aticco", "Official languages Catalan + Spanish; English in tech jobs", "Large German community, DSBA association active"],
    },
  });

  await createCity({
    slug: "amsterdam",
    flag: "🇳🇱",
    isHomeCity: false,
    sortOrder: 2,
    nameDE: "Amsterdam",
    nameEN: "Amsterdam",
    countryDE: "Niederlande",
    countryEN: "Netherlands",
    col: { rent: 1900, food: 440, transport: 100 },
    regimes: [
      { slug: "ruling30", labelDE: "30 %-Ruling", labelEN: "30% Ruling", incomeRate: 0.3697, socialRate: 0.138, exemptFrac: 0.30, isDefault: true, sortOrder: 0 },
      { slug: "standard", labelDE: "Standard · ~37 %", labelEN: "Standard · ~37%", incomeRate: 0.3697, socialRate: 0.138, isDefault: false, sortOrder: 1 },
    ],
    detailsDE: {
      fin: ["30%-Ruling: 30 % des Bruttogehalts steuerfrei für max. 5 Jahre", "Effektiver Steuersatz mit Ruling ca. 25–28 % bei 80k Brutto", "Voraussetzung: Anwerbung aus dem Ausland, Mindestgehalt 46.107 €", "Sozialabgaben: ~13,8 % gesamt (Arbeitnehmer-Anteil)"],
      cost: ["Miete Jordaan 2-Zi: 1.800–2.400 €/Mo", "GVB-Monatskarte: 100 €", "Lebensmittel teurer als DE-Durchschnitt", "Café-Kaffee: 3,50–5 €"],
      sec: ["BSN-Nummer innerhalb 5 Tage nach Ankunft beim Gemeente", "Krankenversicherung: Basispakket Pflicht, ca. 140 €/Mo + Eigenbeteiligung", "Wohnungsmarkt extrem angespannt, Wartelisten bis 15 Jahre Sozialwohnungen", "Sicheres Stadtbild, Fahrrad-Infrastruktur erstklassig"],
      climate: ["Sonnenstunden/Jahr: ~1.600", "Graue Herbst/Wintertage, häufiger Regen", "Sommer mild: 18–24 °C", "Starke Westwinde, kein Frost-Extremwinter"],
      sport: ["Fahrrad: über 500 km Radwege, Stadtverkehr primär per Rad", "Schwimmen: Freibäder und Maarssense Plassen-See", "Skateparks und Sportplätze gut verteilt", "Hockey sehr populär: Vereinsangebot ab 15 €/Mo"],
      social: ["Internationalste Stadt NL, Englisch Alltagssprache", "Coworking: WeWork, Spaces, Rockstart", "Startup-Ökosystem TQ, Rockstart", "Deutsche Community: AHK-Niederland, reguläre Stammtische"],
    },
    detailsEN: {
      fin: ["30% Ruling: 30% of gross salary tax-free for up to 5 years", "Effective rate with ruling ~25–28% at €80k gross", "Requirement: recruited from abroad, minimum salary €46,107", "Social contributions: ~13.8% total (employee share)"],
      cost: ["Jordaan 2-bed rent: €1,800–2,400/mo", "GVB monthly transit pass: €100", "Groceries more expensive than German average", "Café coffee: €3.50–5"],
      sec: ["BSN number within 5 days of arrival at Gemeente office", "Health insurance: Basispakket mandatory, ~€140/mo + deductible", "Housing market extremely tight, social housing waitlists up to 15 years", "Safe city environment, world-class cycling infrastructure"],
      climate: ["Sunshine hours/year: ~1,600", "Grey autumn/winter days, frequent rain", "Mild summers: 18–24 °C", "Strong westerly winds, no extreme frost winters"],
      sport: ["Cycling: 500+ km of cycle paths, bike is primary transport", "Swimming: outdoor pools and Maarssense Plassen lake", "Skateparks and sports fields well distributed", "Hockey very popular: club membership from €15/mo"],
      social: ["Most international Dutch city, English everyday language", "Coworking: WeWork, Spaces, Rockstart", "Startup ecosystem: TQ, Rockstart", "German community: AHK Netherlands, regular Stammtische"],
    },
  });

  await createCity({
    slug: "wien",
    flag: "🇦🇹",
    isHomeCity: false,
    sortOrder: 3,
    nameDE: "Wien",
    nameEN: "Vienna",
    countryDE: "Österreich",
    countryEN: "Austria",
    col: { rent: 1400, food: 400, transport: 51 },
    regimes: [
      { slug: "standard", labelDE: "Standard · ~43 %", labelEN: "Standard · ~43%", incomeRate: 0.43, socialRate: 0.185, isDefault: true, sortOrder: 0 },
    ],
    detailsDE: {
      fin: ["Steuersatz bis 60.000 € Einkommen: 43 %", "Sozialabgaben Arbeitnehmer: ca. 18,5 %", "Keine Quellensteuer auf Dividenden für Neubürger", "Lohnsteuerabrechnung: Jahresausgleich automatisch"],
      cost: ["Miete Innere Stadt 2-Zi: 1.300–1.800 €/Mo", "Wiener Linien Jahreskarte: 365 € (1 €/Tag)", "Supermärkte (Billa, Hofer): günstiger als München", "Heuriger Abend mit Wein: 20–30 €"],
      sec: ["Meldezettel Pflicht innerhalb 3 Tage nach Einzug", "e-card: kostenlose Krankenversicherung nach Anmeldung", "Sehr niedrige Kriminalitätsrate, Platz 1–3 weltweit", "Bürokratie: gut digitalisiert, aber papierbasiert"],
      climate: ["Kontinentalklima: heiße Sommer bis 35 °C", "Winter: 0–5 °C, gelegentlich Schnee", "Donaukanal-Freizeitgelände April–Oktober belebt", "Föhnwinde aus den Alpen möglich"],
      sport: ["Donauinsel: 21 km Strand, Radfahren, Beachvolleyball", "Skigebiete: 1,5–2 Stunden entfernt (Semmering, Schneeberg)", "Wien hat 330 Sportvereine, Tennis und Schwimmen stark", "Marathon Wien im April, großer Laufpark Prater"],
      social: ["Deutsche Sprache, sofortiger Kulturanschluss", "Kaffeehauskultur: Stammcafés als Sozialraum", "Coworking: Sektor5, Stockwerk, Impact Hub", "Deutsche Community: sehr groß, kaum kulturelle Barriere"],
    },
    detailsEN: {
      fin: ["Tax rate on income up to €60,000: 43%", "Employee social contributions: ~18.5%", "No withholding tax on dividends for new residents", "Income tax: automatic annual adjustment"],
      cost: ["Innere Stadt 2-bed rent: €1,300–1,800/mo", "Wiener Linien annual pass: €365 (€1/day)", "Supermarkets (Billa, Hofer): cheaper than Munich", "Evening at a Heuriger with wine: €20–30"],
      sec: ["Meldezettel registration required within 3 days of moving in", "e-card: free health insurance after registration", "Very low crime rate, ranks 1–3 globally", "Bureaucracy: increasingly digital but still paper-based"],
      climate: ["Continental climate: hot summers up to 35 °C", "Winters: 0–5 °C, occasional snow", "Danube Canal leisure area busy April–October", "Föhn winds from the Alps possible"],
      sport: ["Danube Island: 21 km beach, cycling, beach volleyball", "Ski resorts: 1.5–2 hours away (Semmering, Schneeberg)", "Vienna has 330 sports clubs, tennis and swimming strong", "Vienna Marathon in April, large running park in Prater"],
      social: ["German language, immediate cultural connection", "Coffee house culture: regular cafés as social spaces", "Coworking: Sektor5, Stockwerk, Impact Hub", "Large German community, minimal cultural barrier"],
    },
  });

  await createCity({
    slug: "valletta",
    flag: "🇲🇹",
    isHomeCity: false,
    sortOrder: 4,
    nameDE: "Valletta",
    nameEN: "Valletta",
    countryDE: "Malta",
    countryEN: "Malta",
    col: { rent: 1100, food: 350, transport: 30 },
    regimes: [
      { slug: "grp", labelDE: "GRP · 15 % flat", labelEN: "GRP · 15% flat", incomeRate: 0.15, socialRate: 0.10, isDefault: true, sortOrder: 0 },
      { slug: "standard", labelDE: "Standard · 35 %", labelEN: "Standard · 35%", incomeRate: 0.35, socialRate: 0.10, isDefault: false, sortOrder: 1 },
    ],
    detailsDE: {
      fin: ["Global Residence Programme: 15 % flat auf ausländische Einkünfte", "Mindeststeuer: 15.000 €/Jahr", "Sozialabgaben: ca. 10 % Arbeitnehmer", "Malta hat kein Quellensteuerabkommen mit Deutschland → Doppelbesteuerungsabkommen prüfen"],
      cost: ["Miete Valletta/Sliema 2-Zi: 900–1.400 €/Mo", "ÖPNV Malta: Busnetz, Monatskarte 26 €", "Lebensmittel importiert, etwas teurer als EU-Durchschnitt", "Restaurant-Durchschnitt: 12–18 €"],
      sec: ["EU-Bürger: Aufenthaltsgenehmigung Identity Malta, schnell", "Staatliches Gesundheitssystem: Mater Dei Hospital", "Sehr niedriges Kriminalitätsniveau", "Englisch Amtssprache neben Maltesisch"],
      climate: ["Sonnenstunden/Jahr: ~3.000 (meiste in Europa)", "Winter: 12–17 °C, selten Frost", "Sommer: 28–36 °C, Mittelmeer", "Mistral-Winde gelegentlich im Frühling"],
      sport: ["Tauchen: Crystal Lagoon Gozo, Blue Grotto", "Segeln und Kitesurfen sehr verbreitet", "Tennis und Padel: Malta Sports Complex", "Marathon Malta im Februar, flache Strecke"],
      social: ["Englischsprachige Expat-Community sehr aktiv", "Coworking: BnBros, AIS, Malta Business Hub", "Lebhafte Bar-Szene in Paceville", "Deutsche Community klein aber wachsend"],
    },
    detailsEN: {
      fin: ["Global Residence Programme: 15% flat on foreign income", "Minimum tax: €15,000/year", "Social contributions: ~10% employee share", "Malta has no withholding tax treaty with Germany → check double taxation agreement"],
      cost: ["Valletta/Sliema 2-bed rent: €900–1,400/mo", "Malta public transport: bus network, monthly pass €26", "Groceries imported, slightly above EU average", "Restaurant average: €12–18"],
      sec: ["EU citizens: residence permit via Identity Malta, fast process", "Public health: Mater Dei Hospital", "Very low crime level", "English is an official language alongside Maltese"],
      climate: ["Sunshine hours/year: ~3,000 (most in Europe)", "Winters: 12–17 °C, rarely frost", "Summers: 28–36 °C, Mediterranean", "Mistral winds occasionally in spring"],
      sport: ["Diving: Crystal Lagoon Gozo, Blue Grotto", "Sailing and kitesurfing very popular", "Tennis and padel: Malta Sports Complex", "Malta Marathon in February, flat course"],
      social: ["English-speaking expat community very active", "Coworking: BnBros, AIS, Malta Business Hub", "Lively bar scene in Paceville", "German community small but growing"],
    },
  });

  await createCity({
    slug: "tbilisi",
    flag: "🇬🇪",
    isHomeCity: false,
    sortOrder: 5,
    nameDE: "Tbilisi",
    nameEN: "Tbilisi",
    countryDE: "Georgien",
    countryEN: "Georgia",
    col: { rent: 650, food: 200, transport: 20 },
    regimes: [
      { slug: "standard", labelDE: "Virtual Zone · 20 %", labelEN: "Virtual Zone · 20%", incomeRate: 0.20, socialRate: 0.02, isDefault: true, sortOrder: 0 },
    ],
    detailsDE: {
      fin: ["Virtual Zone: IT-Unternehmen zahlen 0 % Körperschaftsteuer auf ausländische Umsätze", "Einkommensteuer: 20 % (Freiberufler), keine Quellensteuer-Pflicht auf Auslandseinkünfte", "Sozialversicherung: 2 % gesamt (freiwillig)", "Kein Doppelbesteuerungsabkommen mit Deutschland — Steuerpflicht in DE prüfen"],
      cost: ["Miete Vake/Saburtalo 2-Zi: 500–800 €/Mo", "Lebensmittelmarkt: sehr günstig, ca. 150–200 €/Mo", "U-Bahn und Minibus: 0,25 GEL (~0,09 €) pro Fahrt", "Restaurantessen lokal: 4–8 €"],
      sec: ["Visa-freier Aufenthalt für Deutsche bis 365 Tage", "Krankenversicherung: privat notwendig, ca. 30–60 €/Mo", "Kriminalität niedrig in Touristenzonen", "Politische Lage: Westorientierung unsicher"],
      climate: ["Sommerhitze: 32–38 °C, trocken", "Winter: 0–5 °C, Schnee selten in der Stadt", "Kaukasus-Gebirge in 1–2 Stunden erreichbar", "Herbst: angenehm 15–22 °C"],
      sport: ["Skifahren: Gudauri, 2 Stunden, Weltklasse-Pisten", "Wandern im Kaukasus: Kazbegi, Svaneti", "Fitnessstudios: 20–40 €/Mo", "Radsport und Running: Mtatsminda Park"],
      social: ["Riesige Nomaden-Community, Fabrika als Treffpunkt", "Coworking: Impact Hub Tbilisi, Fabrika", "Georgische Gastfreundschaft legendär", "Deutsche Community wächst schnell seit 2022"],
    },
    detailsEN: {
      fin: ["Virtual Zone: IT companies pay 0% corporate tax on foreign revenue", "Income tax: 20% (freelancers), no withholding on foreign income", "Social insurance: 2% total (voluntary)", "No double tax treaty with Germany — check German tax residency rules"],
      cost: ["Vake/Saburtalo 2-bed rent: €500–800/mo", "Food market: very cheap, ~€150–200/mo", "Metro and minibus: 0.25 GEL (~€0.09) per ride", "Local restaurant meal: €4–8"],
      sec: ["Visa-free stay for German nationals up to 365 days", "Health insurance: private necessary, ~€30–60/mo", "Low crime in tourist areas", "Political situation: Western orientation uncertain"],
      climate: ["Summer heat: 32–38 °C, dry", "Winters: 0–5 °C, rarely snows in the city", "Caucasus mountains 1–2 hours away", "Autumn: pleasant 15–22 °C"],
      sport: ["Skiing: Gudauri, 2 hours, world-class slopes", "Hiking in the Caucasus: Kazbegi, Svaneti", "Gyms: €20–40/mo", "Cycling and running: Mtatsminda Park"],
      social: ["Huge nomad community, Fabrika as gathering point", "Coworking: Impact Hub Tbilisi, Fabrika", "Georgian hospitality legendary", "German community growing fast since 2022"],
    },
  });

  await createCity({
    slug: "prag",
    flag: "🇨🇿",
    isHomeCity: false,
    sortOrder: 6,
    nameDE: "Prag",
    nameEN: "Prague",
    countryDE: "Tschechien",
    countryEN: "Czech Republic",
    col: { rent: 1100, food: 320, transport: 25 },
    regimes: [
      { slug: "standard", labelDE: "Standard · 22 %", labelEN: "Standard · 22%", incomeRate: 0.22, socialRate: 0.11, isDefault: true, sortOrder: 0 },
    ],
    detailsDE: {
      fin: ["Einkommensteuer: 15 % bis ~2,5 Mio. CZK, 23 % darüber (effektiv ~22 %)", "Sozialabgaben Arbeitnehmer: ~11 % (Pension + Kranken)", "Kein besonderes Expat-Steuerregime", "DBA Deutschland-Tschechien aktiv"],
      cost: ["Miete Žižkov/Vinohrady 2-Zi: 800–1.200 €/Mo", "PID-Monatskarte: 25 €", "Lebensmittel günstig, ca. 30 % unter DE-Niveau", "Restaurant: 7–12 €"],
      sec: ["EU-Bürger: Anmeldung Fremdpolizei innerhalb 30 Tage", "Krankenversicherung: VZP oder privat ~50 €/Mo", "Sehr sichere Stadt, wenig Gewaltkriminalität", "Tschechisch nötig für Behörden, viele Englisch-Formulare"],
      climate: ["Kontinentalklima: 4 Jahreszeiten ausgeprägt", "Sommer: 22–30 °C, gelegentliche Gewitter", "Winter: −5 bis 3 °C, Schnee möglich", "~1.700 Sonnenstunden/Jahr"],
      sport: ["Moldau-Ufer: Radfahren, Rudern, SUP", "Divoká Šárka: Freibad, Wanderwege, MTB", "Sportvereine: Fußball und Eishockey dominant", "Fitnessstudios: 20–40 €/Mo"],
      social: ["Etablierte deutsche Expat-Szene", "Coworking: Locus Workspace, Opero, Officehub", "Englisch in Tech-Jobs Standard", "Lebhaftes Nachtleben, niedrige Getränkepreise"],
    },
    detailsEN: {
      fin: ["Income tax: 15% up to ~CZK 2.5m, 23% above (effective ~22%)", "Employee social contributions: ~11% (pension + health)", "No special expat tax regime", "Germany–Czech double taxation treaty in force"],
      cost: ["Žižkov/Vinohrady 2-bed rent: €800–1,200/mo", "PID monthly transit pass: €25", "Groceries cheap, ~30% below German level", "Restaurant meal: €7–12"],
      sec: ["EU citizens: register at Foreign Police within 30 days", "Health insurance: VZP or private ~€50/mo", "Very safe city, low violent crime", "Czech needed for authorities, many English forms available"],
      climate: ["Continental climate: four distinct seasons", "Summers: 22–30 °C, occasional thunderstorms", "Winters: −5 to 3 °C, snow possible", "~1,700 sunshine hours/year"],
      sport: ["Vltava riverbank: cycling, rowing, SUP", "Divoká Šárka: outdoor pool, hiking trails, MTB", "Sports clubs: football and ice hockey dominant", "Gyms: €20–40/mo"],
      social: ["Established German expat scene", "Coworking: Locus Workspace, Opero, Officehub", "English standard in tech jobs", "Lively nightlife, low drink prices"],
    },
  });

  await createCity({
    slug: "budapest",
    flag: "🇭🇺",
    isHomeCity: false,
    sortOrder: 7,
    nameDE: "Budapest",
    nameEN: "Budapest",
    countryDE: "Ungarn",
    countryEN: "Hungary",
    col: { rent: 900, food: 280, transport: 30 },
    regimes: [
      { slug: "standard", labelDE: "Flat Tax · 15 %", labelEN: "Flat Tax · 15%", incomeRate: 0.15, socialRate: 0.185, isDefault: true, sortOrder: 0 },
    ],
    detailsDE: {
      fin: ["Einkommensteuer: 15 % Flat Tax auf alle Einkünfte", "Sozialabgaben Arbeitnehmer: 18,5 % (Pension + Kranken + Arbeitslosenversicherung)", "DBA Deutschland-Ungarn: Besteuerung in Ungarn bei Wohnsitz", "KATA-Regime für Selbstständige: günstig, aber auf HU-Kunden beschränkt"],
      cost: ["Miete District VII 2-Zi: 650–1.000 €/Mo", "BKK-Monatskarte Budapest: 15 €", "Lebensmittel ca. 40 % unter DE-Niveau", "Széchenyi-Thermalbad: 22 € Tageseintritt"],
      sec: ["EU-Bürger: Registrierung Bevándorlási Hivatal", "Krankenversicherung: TAJ-Karte öffentlich, privat 50–70 €/Mo", "Korruptionswahrnehmung erhöht, für Privatpersonen kaum spürbar", "Rechtsstaalichkeit: EU-Rechtsstaatsverfahren läuft"],
      climate: ["Kontinentalklima, Donau prägt Mikroklima", "Sommer: 28–35 °C, schwül", "Winter: −5 bis 3 °C, gelegentlich Schnee", "Thermalbäder ganzjährig als Ausgleich"],
      sport: ["Donau-Ufer: Radwege beidseitig 20+ km", "Thermalbäder: Széchenyi, Gellért, Rudas", "Rennradszene sehr aktiv, Balaton 70 km entfernt", "Fitnessstudios: 15–30 €/Mo"],
      social: ["Wachsende internationale Szene, günstigste EU-Hauptstadt", "Coworking: Loffice, Kaptar, OneStop", "Ungarisch schwierig, Englisch in Tech weit verbreitet", "Ruin-Bar-Szene in Erzsébetváros (District VII)"],
    },
    detailsEN: {
      fin: ["Income tax: 15% flat tax on all income", "Employee social contributions: 18.5% (pension + health + unemployment)", "Germany–Hungary double taxation treaty: taxed in Hungary if resident", "KATA regime for self-employed: favourable but limited to HU clients"],
      cost: ["District VII 2-bed rent: €650–1,000/mo", "BKK monthly transit pass Budapest: €15", "Groceries ~40% below German level", "Széchenyi thermal bath: €22 day ticket"],
      sec: ["EU citizens: registration at Bevándorlási Hivatal", "Health insurance: TAJ card (public), private €50–70/mo", "Corruption perception elevated, rarely affects private individuals", "Rule of law: EU rule-of-law proceedings ongoing"],
      climate: ["Continental climate, Danube shapes microclimate", "Summers: 28–35 °C, humid", "Winters: −5 to 3 °C, occasional snow", "Thermal baths year-round as counterbalance"],
      sport: ["Danube riverbank: cycle paths both sides 20+ km", "Thermal baths: Széchenyi, Gellért, Rudas", "Road cycling very active scene, Lake Balaton 70 km away", "Gyms: €15–30/mo"],
      social: ["Growing international scene, cheapest EU capital", "Coworking: Loffice, Kaptar, OneStop", "Hungarian difficult, English widespread in tech", "Ruin bar scene in Erzsébetváros (District VII)"],
    },
  });

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
