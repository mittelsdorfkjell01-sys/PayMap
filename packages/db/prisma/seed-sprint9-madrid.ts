/**
 * Sprint 9 — Madrid Premium Content Seed
 * Districts, CoL, Narratives, Tools, Resources, Testimonials
 */
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();
const CITY_ID = 'cmpbrant5008hnrhvrnrff85f'; // Madrid
const NOW = new Date('2026-05-25T00:00:00Z');
const SOURCE_IDEALISTA = 'idealista-2026-Q1';

// ─── Districts + CoL ──────────────────────────────────────────────────────────

const DISTRICTS = [
  {
    slug: 'salamanca',
    nameDE: 'Salamanca',
    nameEN: 'Salamanca',
    descriptionDE:
      'Salamanca ist Madrids Nobelviertel schlechthin — breite, schachbrettartig angelegte Boulevards aus dem 19. Jahrhundert, Flagship-Stores internationaler Luxusmarken und Restaurantkonzepte der Haute Cuisine. Das Viertel zieht wohlhabende Madrider Familien, Diplomaten und internationale Expats an, die Lage über Budget stellen. Calle Serrano und Calle Ortega y Gasset sind die Hauptverkehrsadern des luxuriösen Einzelhandels. Für Auswanderer attraktiv wegen exzellenter Infrastruktur und sicherer Lage — allerdings zum höchsten Mietpreis der Stadt.',
    descriptionEN:
      'Salamanca is Madrid\'s premier upscale neighbourhood — wide, grid-planned 19th-century boulevards, flagship stores of international luxury brands and haute cuisine restaurant concepts. The neighbourhood attracts wealthy Madrid families, diplomats and international expats who prioritise location over budget. Calle Serrano and Calle Ortega y Gasset are the main arteries of luxury retail. Attractive to expats for its excellent infrastructure and safe location — but at the city\'s highest rent prices.',
    latitude: 40.4285,
    longitude: -3.6834,
    vibe: 'gehoben',
    priceLevel: 5,
    sortOrder: 1,
    col: [
      { category: 'rent_1br_center', value: 2200, currency: 'EUR' },
      { category: 'rent_2br_center', value: 3200, currency: 'EUR' },
      { category: 'rent_3br_center', value: 4800, currency: 'EUR' },
      { category: 'monthly_meal_inexpensive', value: 14, currency: 'EUR' },
      { category: 'monthly_meal_midrange', value: 40, currency: 'EUR' },
      { category: 'cappuccino', value: 2.2, currency: 'EUR' },
    ],
  },
  {
    slug: 'chamberi',
    nameDE: 'Chamberí',
    nameEN: 'Chamberí',
    descriptionDE:
      'Chamberí ist das authentischste gehobene Wohnviertel Madrids — eleganter als Malasaña, lebendiger als Salamanca. Das Viertel verbindet gründerzeitliche Architektur mit einer modernen Gastronomie- und Barszene rund um die Plaza de Olavide. Viele junge Familien und erfolgreiche Professionals der Mittelklasse haben sich hier niedergelassen. Die Metro-Anbindung ist exzellent, die Nähe zum Parque del Retiro und zur Innenstadt ein dauerhafter Vorteil. Als Wohnstandort bietet Chamberí das beste Verhältnis von Qualität, Lage und Preis im gehobenen Segment.',
    descriptionEN:
      'Chamberí is Madrid\'s most authentic upscale residential neighbourhood — more elegant than Malasaña, livelier than Salamanca. The neighbourhood combines fin-de-siècle architecture with a modern gastronomy and bar scene around the Plaza de Olavide. Many young families and successful middle-class professionals have settled here. Metro connections are excellent, and proximity to Parque del Retiro and the city centre is a permanent advantage. As a residential location, Chamberí offers the best ratio of quality, location and price in the upscale segment.',
    latitude: 40.4368,
    longitude: -3.7053,
    vibe: 'schick',
    priceLevel: 4,
    sortOrder: 2,
    col: [
      { category: 'rent_1br_center', value: 2000, currency: 'EUR' },
      { category: 'rent_2br_center', value: 2900, currency: 'EUR' },
      { category: 'rent_3br_center', value: 4200, currency: 'EUR' },
      { category: 'monthly_meal_inexpensive', value: 13, currency: 'EUR' },
      { category: 'monthly_meal_midrange', value: 35, currency: 'EUR' },
      { category: 'cappuccino', value: 2.0, currency: 'EUR' },
    ],
  },
  {
    slug: 'malasana',
    nameDE: 'Malasaña',
    nameEN: 'Malasaña',
    descriptionDE:
      'Malasaña war das Epizentrum der Movida Madrileña — Madrids kultureller Explosion nach dem Ende des Franquismus in den 1980er-Jahren — und hat diesen kreativen Geist bis heute bewahrt. Vintage-Läden, unabhängige Cafés, Musikkneipen und eine der lebendigsten Nachtszenen der Stadt prägen das Bild. Heute ist Malasaña gentrifiziert, aber noch nicht steril: Kreative, Studenten und internationale Auswanderer leben hier Seite an Seite. Die Nähe zum Gran Vía und Parque del Oeste sind praktische Vorteile. Für unter-40-Jährige ohne Kinder oft die erste Wahl.',
    descriptionEN:
      'Malasaña was the epicentre of the Movida Madrileña — Madrid\'s cultural explosion after the end of Francoism in the 1980s — and has preserved that creative spirit to this day. Vintage shops, independent cafés, music bars and one of the city\'s liveliest nightlife scenes define the area. Today Malasaña is gentrified, but not yet sterile: creatives, students and international expats live side by side here. Proximity to Gran Vía and Parque del Oeste are practical advantages. For under-40s without children, often the first choice.',
    latitude: 40.4263,
    longitude: -3.7047,
    vibe: 'alternativ',
    priceLevel: 3,
    sortOrder: 3,
    col: [
      { category: 'rent_1br_center', value: 1900, currency: 'EUR' },
      { category: 'rent_2br_center', value: 2700, currency: 'EUR' },
      { category: 'rent_3br_center', value: 3900, currency: 'EUR' },
      { category: 'monthly_meal_inexpensive', value: 12, currency: 'EUR' },
      { category: 'monthly_meal_midrange', value: 30, currency: 'EUR' },
      { category: 'cappuccino', value: 1.8, currency: 'EUR' },
    ],
  },
  {
    slug: 'chueca',
    nameDE: 'Chueca',
    nameEN: 'Chueca',
    descriptionDE:
      'Chueca grenzt an Malasaña und war Madrids erstes offen queeres Viertel — heute ist es eines der inklusivsten und lebendigsten Stadtteile Europas, weit über die LGBTQ+-Community hinaus beliebt. Die Plaza de Chueca ist der soziale Mittelpunkt mit Terrassen, die das ganze Jahr genutzt werden. Die Architektur ist gründerzeitlich, die Gastronomie hochwertig und vielfältig, die Nachbarschaft durchmischt und weltoffen. Für internationale Auswanderer ist Chueca oft attraktiver als das konservativere Salamanca — lebendiger, mit mehr Charakter.',
    descriptionEN:
      'Chueca borders Malasaña and was Madrid\'s first openly queer neighbourhood — today it is one of the most inclusive and vibrant districts in Europe, popular far beyond the LGBTQ+ community. Plaza de Chueca is the social centre with terraces used year-round. The architecture is fin-de-siècle, the gastronomy high-quality and diverse, the neighbourhood mixed and cosmopolitan. For international expats, Chueca is often more attractive than the more conservative Salamanca — livelier, with more character.',
    latitude: 40.4245,
    longitude: -3.6986,
    vibe: 'lebendig',
    priceLevel: 4,
    sortOrder: 4,
    col: [
      { category: 'rent_1br_center', value: 1850, currency: 'EUR' },
      { category: 'rent_2br_center', value: 2650, currency: 'EUR' },
      { category: 'rent_3br_center', value: 3800, currency: 'EUR' },
      { category: 'monthly_meal_inexpensive', value: 12, currency: 'EUR' },
      { category: 'monthly_meal_midrange', value: 30, currency: 'EUR' },
      { category: 'cappuccino', value: 1.9, currency: 'EUR' },
    ],
  },
  {
    slug: 'retiro',
    nameDE: 'Retiro',
    nameEN: 'Retiro',
    descriptionDE:
      'Retiro ist das grüne Herz Madrids — benannt nach dem gleichnamigen 118 Hektar großen Park, der das Viertel südöstlich begrenzt. Das Viertel selbst ist ruhig, familienorientiert und gehobener Mittelklasse. Breite Alleen, gepflegte Gebäude aus den 1920er-1960er Jahren und exzellente öffentliche Schulen machen Retiro zum bevorzugten Wohnviertel für Familien, die nicht die extremen Preise von Salamanca zahlen wollen. Der tägliche Spaziergang durch den Retiro-Park ist ein Privileg, das kaum Vergleich hat.',
    descriptionEN:
      'Retiro is the green heart of Madrid — named after the 118-hectare park that borders the neighbourhood to the southeast. The neighbourhood itself is quiet, family-oriented and upper-middle class. Wide avenues, well-maintained buildings from the 1920s-1960s and excellent public schools make Retiro the preferred residential neighbourhood for families who don\'t want to pay the extreme prices of Salamanca. The daily walk through Retiro Park is a privilege that is hard to match.',
    latitude: 40.4110,
    longitude: -3.6855,
    vibe: 'familiär',
    priceLevel: 4,
    sortOrder: 5,
    col: [
      { category: 'rent_1br_center', value: 1800, currency: 'EUR' },
      { category: 'rent_2br_center', value: 2600, currency: 'EUR' },
      { category: 'rent_3br_center', value: 3700, currency: 'EUR' },
      { category: 'monthly_meal_inexpensive', value: 12, currency: 'EUR' },
      { category: 'monthly_meal_midrange', value: 28, currency: 'EUR' },
      { category: 'cappuccino', value: 1.8, currency: 'EUR' },
    ],
  },
  {
    slug: 'lavapies',
    nameDE: 'Lavapiés',
    nameEN: 'Lavapiés',
    descriptionDE:
      'Lavapiés ist das multikulturellste und am stärksten diversifizierte Viertel Madrids — eine lebendige Mischung aus arabischen Teestuben, indischen Restaurants, lokalen Tascas und internationalen Kulturzentren rund um das Reina Sofía. Das Viertel ist im starken Wandel: Gentrifizierungstendenzen sind erkennbar, aber Lavapiés hat noch seinen rohen, unpolierten Charakter bewahrt. Für internationale Auswanderer mit knappem Budget und urbanem Interesse ist es eine der authentischsten Optionen Madrids. Nicht für alle — aber für die richtigen Auswanderer ideal.',
    descriptionEN:
      'Lavapiés is Madrid\'s most multicultural and diverse neighbourhood — a vibrant mix of Arabic tea houses, Indian restaurants, local tascas and international cultural centres around the Reina Sofía. The neighbourhood is undergoing strong change: signs of gentrification are evident, but Lavapiés has preserved its raw, unpolished character. For international expats on a tighter budget with urban interests, it is one of Madrid\'s most authentic options. Not for everyone — but ideal for the right expats.',
    latitude: 40.4070,
    longitude: -3.7027,
    vibe: 'aufstrebend',
    priceLevel: 2,
    sortOrder: 6,
    col: [
      { category: 'rent_1br_center', value: 1500, currency: 'EUR' },
      { category: 'rent_2br_center', value: 2100, currency: 'EUR' },
      { category: 'rent_3br_center', value: 3000, currency: 'EUR' },
      { category: 'monthly_meal_inexpensive', value: 9, currency: 'EUR' },
      { category: 'monthly_meal_midrange', value: 22, currency: 'EUR' },
      { category: 'cappuccino', value: 1.5, currency: 'EUR' },
    ],
  },
  {
    slug: 'carabanchel',
    nameDE: 'Carabanchel',
    nameEN: 'Carabanchel',
    descriptionDE:
      'Carabanchel liegt südwestlich des Zentrums und ist Madrids erschwinglichste Option mit echter U-Bahn-Anbindung. Das Viertel ist traditionell, mit starker Arbeiterschicht-Identität und wachsender junger Bevölkerung, die von den niedrigeren Mieten angezogen wird. Für Auswanderer, die Madrid auf einem begrenzten Budget erleben wollen, ohne auf Infrastruktur zu verzichten, ist Carabanchel eine ernsthafte Option. Die U-Bahn-Linien 5 und 11 bringen einen in 20-25 Minuten ins Zentrum. Die Gastronomie ist günstig und authentisch — weit entfernt vom touristischen Madrid.',
    descriptionEN:
      'Carabanchel lies southwest of the centre and is Madrid\'s most affordable option with genuine metro connectivity. The neighbourhood is traditional, with a strong working-class identity and a growing young population attracted by the lower rents. For expats wanting to experience Madrid on a limited budget without sacrificing infrastructure, Carabanchel is a serious option. Metro lines 5 and 11 take you to the centre in 20-25 minutes. Gastronomy is affordable and authentic — far from tourist Madrid.',
    latitude: 40.3845,
    longitude: -3.7270,
    vibe: 'aufstrebend',
    priceLevel: 1,
    sortOrder: 7,
    col: [
      { category: 'rent_1br_center', value: 1100, currency: 'EUR' },
      { category: 'rent_2br_center', value: 1550, currency: 'EUR' },
      { category: 'rent_3br_center', value: 2200, currency: 'EUR' },
      { category: 'monthly_meal_inexpensive', value: 8, currency: 'EUR' },
      { category: 'monthly_meal_midrange', value: 18, currency: 'EUR' },
      { category: 'cappuccino', value: 1.4, currency: 'EUR' },
    ],
  },
  {
    slug: 'las-tablas',
    nameDE: 'Las Tablas / Norte',
    nameEN: 'Las Tablas / Norte',
    descriptionDE:
      'Las Tablas ist Madrids modernes Businessviertel im Norden der Stadt — rund um das CTBA (Cuatro Torres Business Area) mit Spaniens höchsten Wolkenkratzern. Das Viertel ist jung, gut geplant und international ausgerichtet: Viele multinationale Unternehmen haben hier ihren Spaniensitz. Für Tech-Expats und Angestellte internationaler Konzerne, die nah am Büro wohnen wollen, ist Las Tablas attraktiv — es fehlt aber der urbane Charme der zentralen Viertel. Gute Schulen (darunter das Deutsche Lyceum) und familienfreundliche Infrastruktur machen es auch für Familien interessant.',
    descriptionEN:
      'Las Tablas is Madrid\'s modern business district in the north of the city — centred around the CTBA (Cuatro Torres Business Area) with Spain\'s tallest skyscrapers. The neighbourhood is young, well-planned and internationally oriented: many multinational companies have their Spain headquarters here. For tech expats and employees of international corporations who want to live close to the office, Las Tablas is attractive — but it lacks the urban character of the central neighbourhoods. Good schools (including the German Lyceum) and family-friendly infrastructure also make it interesting for families.',
    latitude: 40.4870,
    longitude: -3.6887,
    vibe: 'schick',
    priceLevel: 3,
    sortOrder: 8,
    col: [
      { category: 'rent_1br_center', value: 1300, currency: 'EUR' },
      { category: 'rent_2br_center', value: 1800, currency: 'EUR' },
      { category: 'rent_3br_center', value: 2500, currency: 'EUR' },
      { category: 'monthly_meal_inexpensive', value: 11, currency: 'EUR' },
      { category: 'monthly_meal_midrange', value: 25, currency: 'EUR' },
      { category: 'cappuccino', value: 1.8, currency: 'EUR' },
    ],
  },
];

// ─── Narratives ───────────────────────────────────────────────────────────────

const NARRATIVES = [
  {
    section: 'intro',
    titleDE: 'Madrid — Europas unterschätzte Metropole',
    titleEN: 'Madrid — Europe\'s Underrated Metropolis',
    contentDE: `Madrid ist nicht Barcelonas Strand, nicht Lissabons Melancholie und nicht Amsterdams Kanäle — und genau das ist seine Stärke. Die spanische Hauptstadt mit rund 3,3 Millionen Einwohnern (6,8 Millionen in der Metropolitanregion) ist eine vollständig europäische Metropole mit allem, was dazu gehört: exzellente Infrastruktur, Weltklasse-Museen, eine der ausgefeiltesten Gastronomieszenen des Kontinents und ein Klima, das mehr Sonnenstunden bietet als fast jede andere europäische Hauptstadt.

Für Auswanderer aus dem deutschsprachigen Raum war Madrid lange hinter Barcelona der zweite Gedanke — zu Unrecht. Die Stadt ist in vielerlei Hinsicht praktischer als Barcelona: Weniger touristisch überlaufen, günstiger als Zürich oder Amsterdam, mit einem Wohnungsmarkt, der trotz deutlicher Preissteigerungen seit 2019 noch erschwinglich bleibt. Die Mietpreise liegen je nach Viertel bei 1.100-4.800€ für Einzimmerwohnungen — ein breites Spektrum für verschiedene Budgets.

Das entscheidende finanzielle Argument für viele Auswanderer ist das Beckham-Gesetz (Ley Beckham, offiziell Régimen de Impatriados gemäß Art. 93 LIRPF). Wer aus dem Ausland nach Spanien zieht, um dort zu arbeiten, kann unter bestimmten Voraussetzungen für sechs Jahre als steuerlicher Nicht-Resident behandelt werden und zahlt einen Flat Tax von 24% auf spanische Einkünfte bis 600.000€ — statt des progressiven Steuersatzes von bis zu 47%. Seit der Reform 2023 können auch Remote-Worker und Selbstständige das Regime nutzen, sofern sie die Bedingungen erfüllen.

Die Stadt hat in den letzten Jahren einen merklichen Tech-Aufstieg erlebt. Madrid ist Sitz zahlreicher internationaler Tech-Konzerne (Amazon, Google, Microsoft, Vodafone haben Spanien-Zentren hier) und beheimatet eine wachsende Startup-Szene in der Gegend rund um Puerta del Sol und die Tetuán-Viertel. Die Kombination aus wachsendem Tech-Ökosystem, attraktivem Steuersystem und vergleichsweise günstigen Lebenshaltungskosten hat Madrid zu einem der gefragtesten Standorte für internationale Fachkräfte gemacht.

Die Herausforderungen sind real: Der Wohnungsmarkt ist angespannt. Die Nachfrage übersteigt das Angebot erheblich, Besichtigungswarteschlangen sind normal, und Vermieter verlangen zunehmend lange Einkommensnachweise — ein Problem für Freiberufler und Neuankömmlinge ohne spanische Lohnabrechnung. Realistische Vorlaufzeit für die Wohnungssuche: 4-8 Wochen, mehr für spezifische Anforderungen.

Die Bürokratie ist strukturierter als in Portugal, aber nicht schnell. NIE-Antrag, Empadronamiento, Tarjeta Sanitaria — die Schritte folgen einer logischen Reihenfolge, aber Terminvereinbarungen bei der Ausländerbehörde können 4-8 Wochen Wartezeit bedeuten. Spanischkenntnisse sind keine Pflicht für die ersten Monate, aber entscheidend für die langfristige Integration — Englisch wird in der Tech-Community gesprochen, aber in Behörden und beim Vermieter oft wenig.

Wer passt nach Madrid: Tech-Worker und Manager, die das Beckham-Gesetz nutzen können; internationale Fachkräfte, die in einem der zahlreichen multinationalen Konzerne arbeiten; Familien, die europäischen Lebensstil mit mehr Sonne und günstigerem Preisniveau suchen; und Auswanderer, die eine echte europäische Hauptstadt wollen, ohne die extremen Kosten von Zürich oder London.

Wer nicht passt: Menschen, die primär aufs Meer oder den Strand angewiesen sind (Madrid liegt 650m über dem Meeresspiegel, 3h vom Meer entfernt); wer im Sommer keine Hitze verträgt (Madrid hat regelmäßig 38-42°C im Juli/August); und wer schnelle Bürokratie erwartet — die gibt es auch hier nicht.`,
    contentEN: `Madrid is not Barcelona's beach, not Lisbon's melancholy and not Amsterdam's canals — and that is precisely its strength. The Spanish capital with around 3.3 million inhabitants (6.8 million in the metropolitan region) is a fully European metropolis with everything that entails: excellent infrastructure, world-class museums, one of the most refined gastronomic scenes on the continent and a climate that offers more sunshine hours than almost any other European capital.

For expats from German-speaking countries, Madrid has long been the second thought behind Barcelona — unjustifiably. The city is more practical than Barcelona in many respects: less touristy, cheaper than Zurich or Amsterdam, with a housing market that, despite significant price increases since 2019, remains affordable. Rents range from €1,100 to €4,800 for one-bedroom apartments depending on the neighbourhood — a wide spectrum for different budgets.

The decisive financial argument for many expats is the Beckham Law (Ley Beckham, officially Régimen de Impatriados under Art. 93 LIRPF). Those moving from abroad to Spain to work can, under certain conditions, be treated as tax non-residents for six years and pay a flat tax of 24% on Spanish income up to €600,000 — instead of the progressive rate of up to 47%. Since the 2023 reform, remote workers and the self-employed can also use the regime, provided they meet the conditions.

The city has experienced a notable tech rise in recent years. Madrid is home to numerous international tech corporations (Amazon, Google, Microsoft, Vodafone have Spain centres here) and hosts a growing startup scene in the area around Puerta del Sol and the Tetuán neighbourhoods. The combination of a growing tech ecosystem, attractive tax regime and comparatively affordable cost of living has made Madrid one of the most sought-after locations for international professionals.

The challenges are real: the housing market is tight. Demand significantly exceeds supply, viewing queues are normal, and landlords increasingly require long income documentation — a problem for freelancers and newcomers without Spanish payslips. Realistic lead time for the apartment search: 4-8 weeks, more for specific requirements.

The bureaucracy is more structured than in Portugal, but not fast. NIE application, Empadronamiento, Tarjeta Sanitaria — the steps follow a logical sequence, but appointments at the foreigners' authority can mean 4-8 weeks of waiting time. Spanish language skills are not mandatory for the first months, but decisive for long-term integration — English is spoken in the tech community, but rarely at authorities or by landlords.

Who fits Madrid: tech workers and managers who can benefit from the Beckham Law; international professionals working at one of the numerous multinational corporations; families looking for a European lifestyle with more sunshine and lower cost of living; and expats who want a genuine European capital without the extreme costs of Zurich or London.

Who doesn't fit: people who primarily depend on the sea or beach (Madrid lies 650m above sea level, 3 hours from the sea); those who can't handle summer heat (Madrid regularly reaches 38-42°C in July/August); and those expecting fast bureaucracy — that doesn't exist here either.`,
    sourceUrls: [
      'https://www.agenciatributaria.es/AEAT.internet/Inicio/La_Agencia_Tributaria/Campanas/Campanas_/Regimen_especial_trabajadores_desplazados/Regimen_especial_trabajadores_desplazados.shtml',
      'https://www.idealista.com/news/inmobiliario/vivienda',
      'https://madrid.es/portales/munimadrid/es/inicio',
    ],
  },
  {
    section: 'for_freelancers',
    titleDE: 'Madrid als Freelancer — Beckham Law und Autonomo-Realität',
    titleEN: 'Madrid as a Freelancer — Beckham Law and Autonomo Reality',
    contentDE: `Für Selbstständige ist Madrid seit der Beckham-Gesetz-Reform 2023 deutlich attraktiver geworden. Bis 2023 galt das Regime nur für Angestellte mit Arbeitsvertrag bei einem spanischen Unternehmen — seitdem können auch Selbstständige (Autónomos) das Beckham-Regime nutzen, sofern sie mindestens 80% ihres Einkommens von ausländischen Auftraggebern erhalten.

Der operative Rahmen für Freelancer in Spanien basiert auf dem Autónomo-System: Wer selbstständig tätig ist, muss sich beim Régimen Especial de Trabajadores Autónomos (RETA) anmelden. Die Sozialversicherungsbeiträge sind seit der Reform 2023 einkommensabhängig gestaffelt: Wer unter 670€ netto monatlich verdient, zahlt 230€ Mindestbeitrag; ab höheren Einkommen steigen die Beiträge proportional. Bei mittlerem Freelancer-Einkommen (4.000-6.000€/Monat) ist mit Beiträgen von 400-600€ monatlich zu rechnen.

Das Beckham-Regime für Autónomos bedeutet: 24% Flat Tax auf Einkünfte aus spanischer Quelle bis 600.000€. Wichtig: Einkünfte aus ausländischen Quellen (Kunden außerhalb Spaniens) unterliegen einer anderen Regelung — typischerweise werden diese mit dem normalen Nicht-Residenten-Satz von 24% auf alle Einkünfte versteuert, aber Details hängen vom Wohnsitzstatus und den Doppelbesteuerungsabkommen ab. Professionelle Steuerberatung von Beginn an ist bei Autónomos unter dem Beckham-Regime kein Luxus, sondern Pflicht.

Für die Rechnungsstellung nutzen spanische Autónomos Facturas (Mehrwertsteuer-Rechnungen). IVA (spanische MwSt.) beträgt standardmäßig 21% für Dienstleistungen und muss quartalsweise abgeführt werden. Die Steuererklärungen sind quartalsweise (Modelo 303 für IVA, Modelo 130 für IRPF-Vorauszahlungen) und jährlich (Modelo 100). Ein gesierter Buchhaltungsdienstleister (Gestor, typisch: 80-200€ monatlich) macht diese Arbeit deutlich einfacher.

Banking für Selbstständige ist in Spanien unkomplizierter als in Portugal. Die großen Banken (BBVA, Santander, CaixaBank) haben gut zugängliche Selbstständigen-Konten, und auch Neobanken wie N26 oder Revolut Business werden für Freelancer akzeptiert, solange Steuernachweise korrekt eingereicht werden.

Madrid bietet Freelancern exzellente Co-Working-Infrastruktur: WeWork, Utopicus, MOB (Makers of Barcelona hat auch Madrid-Standorte) und zahlreiche kleinere Spaces in Malasaña und Chueca bieten Community-Anschluss und Netzwerk. Viele Freelancer berichten, dass ihre ersten Madrider Kunden über Co-Working-Kontakte kamen.

Realistische Einkommenserwartung: Madrid ist günstiger als Lissabon in Teilen, aber das zentrale Wohnen ist nicht billig. Wer als Freelancer komfortabel in Chamberí oder Malasaña leben will, braucht 4.000-5.000€ Netto-Äquivalent. Unter 2.500€ wird es auch in Madrid eng — besonders wenn das Beckham-Regime greift und die Sozialabgaben (RETA) hinzukommen.`,
    contentEN: `For the self-employed, Madrid has become significantly more attractive since the 2023 Beckham Law reform. Until 2023, the regime only applied to employees with an employment contract at a Spanish company — since then, the self-employed (Autónomos) can also use the Beckham regime, provided they receive at least 80% of their income from foreign clients.

The operational framework for freelancers in Spain is based on the Autónomo system: anyone working independently must register with the Régimen Especial de Trabajadores Autónomos (RETA). Social security contributions have been graduated by income since the 2023 reform: those earning less than €670 net per month pay a minimum contribution of €230; contributions rise proportionally from higher incomes. At a medium freelancer income (€4,000-6,000/month), expect contributions of €400-600 per month.

The Beckham regime for Autónomos means: 24% flat tax on income from Spanish sources up to €600,000. Important: income from foreign sources (clients outside Spain) is subject to a different regulation — typically taxed at the normal non-resident rate of 24% on all income, but details depend on residence status and double taxation agreements. Professional tax advice from the start is not a luxury for Autónomos under the Beckham regime, but essential.

For invoicing, Spanish Autónomos use Facturas (VAT invoices). IVA (Spanish VAT) is 21% by default for services and must be remitted quarterly. Tax returns are quarterly (Modelo 303 for IVA, Modelo 130 for IRPF advance payments) and annual (Modelo 100). A licensed accounting service provider (Gestor, typically €80-200 per month) makes this work significantly easier.

Banking for the self-employed is more straightforward in Spain than in Portugal. The major banks (BBVA, Santander, CaixaBank) have well-accessible self-employed accounts, and neobanks like N26 or Revolut Business are also accepted for freelancers, as long as tax records are correctly filed.

Madrid offers freelancers excellent co-working infrastructure: WeWork, Utopicus, MOB (Makers of Barcelona also has Madrid locations) and numerous smaller spaces in Malasaña and Chueca offer community connection and networking. Many freelancers report that their first Madrid clients came through co-working contacts.

Realistic income expectation: Madrid is cheaper than Lisbon in some respects, but central living is not cheap. Freelancers wanting to live comfortably in Chamberí or Malasaña need a net equivalent of €4,000-5,000. Below €2,500 it gets tight in Madrid too — especially when the Beckham regime applies and RETA social contributions are added.`,
    sourceUrls: [
      'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/Afiliacion/10774',
      'https://www.agenciatributaria.es/AEAT.internet/Inicio/La_Agencia_Tributaria/Campanas/Campanas_/Regimen_especial_trabajadores_desplazados/Regimen_especial_trabajadores_desplazados.shtml',
      'https://sede.agenciatributaria.gob.es/Sede/iva/modelo-303.html',
    ],
  },
  {
    section: 'for_families',
    titleDE: 'Madrid mit Kindern — Schulen, Viertel, Alltag',
    titleEN: 'Madrid with Children — Schools, Neighbourhoods, Everyday Life',
    contentDE: `Madrid ist für Familien eine der attraktivsten europäischen Hauptstädte — besonders wegen der Kombination aus gutem Klima, hoher Sicherheit, exzellenter Familieninfrastruktur und einem relativen Preisvorteil gegenüber Paris, London oder Amsterdam. Die Herausforderungen liegen in der Wohnungssuche, der Schulplatzfrage und der Hitze im Sommer.

Das Deutsche Gymnasium Madrid (Deutsche Schule Madrid) und das Colegio Alemán de Madrid sind die zentralen Anlaufstellen für deutschsprachige Schulkinder. Die Deutsche Schule liegt im Stadtviertel Hortaleza im Norden Madrids und bietet deutschen Lehrplan von Klasse 1 bis Abitur. Anmeldungen sollten 12-18 Monate vor dem gewünschten Eintrittsdatum erfolgen. Die Schulgebühren liegen je nach Jahrgangsstufe zwischen 7.000 und 11.000€ jährlich — günstiger als Lissabon oder Amsterdam.

Für Familien, die ein internationales Curriculum bevorzugen, bieten die King's College School (britisch), Runnymede College und das American School of Madrid Alternativen. Schulgebühren variieren zwischen 9.000 und 20.000€ jährlich. Einige internationale Schulen bieten auch spanisch-internationale Bilingualklassen, die für Kinder mit Spanisch-Ambitionen interessant sind.

Familienfreundliche Viertel für Auswanderer:
- **Retiro**: ruhig, parkreich, gute öffentliche Schulen, gut angebunden
- **Chamberí**: gehoben, sicher, exzellente Infrastruktur, viele Spielplätze
- **Las Tablas / Norte**: modern, günstiger als das Zentrum, nah an der Deutschen Schule
- **Pozuelo de Alarcón** (Vorort): viele internationale Familien, ruhig, Einfamilienhäuser verfügbar, 20 Min U-Bahn

Der beste Umzugszeitpunkt ist Juni/Juli — das neue Schuljahr beginnt in Spanien Mitte September. Ein Sommer zum Akklimatisieren gibt Kindern Vorlauf und Eltern Zeit für Behördengänge. Wichtig: Die Sommermonate Juli und August sind in Madrid extrem heiß (regelmäßig 38-42°C), was die Stadtbesichtigungs- und Eingewöhnungsphase anspruchsvoll macht. Wer im August anreist, sollte auf Klimaanlagen-Ausstattung der Wohnung bestehen.

Das Familienleben in Madrid ist gastfreundlich und kinderfreundlich: Restaurants nehmen Kinder bis spät abends mit (typische Essenszeit in Madrid: 21-23 Uhr), Parks und Spielplätze sind zahlreich und gepflegt, und die Stadtverkehr-Infrastruktur (Metro, EMT-Busse) ist für Familien mit Kinder gut nutzbar. Unter 6 Jahren ist der ÖPNV kostenlos; danach gilt der reguläre Tarif.`,
    contentEN: `Madrid is one of Europe's most attractive capital cities for families — particularly because of the combination of good climate, high safety, excellent family infrastructure and a relative price advantage over Paris, London or Amsterdam. The challenges lie in finding housing, securing school places and coping with the summer heat.

The Deutsche Gymnasium Madrid (German School Madrid) and the Colegio Alemán de Madrid are the central contact points for German-speaking school-age children. The German School is located in the Hortaleza neighbourhood in the north of Madrid and offers the German curriculum from Grade 1 to Abitur. Enrolments should be made 12-18 months before the desired start date. School fees range from €7,000 to €11,000 per year depending on the year group — cheaper than Lisbon or Amsterdam.

For families preferring an international curriculum, King's College School (British), Runnymede College and American School of Madrid offer alternatives. School fees vary between €9,000 and €20,000 annually. Some international schools also offer Spanish-international bilingual classes, which are interesting for children with Spanish ambitions.

Family-friendly neighbourhoods for expats:
- **Retiro**: quiet, park-rich, good public schools, well connected
- **Chamberí**: upscale, safe, excellent infrastructure, many playgrounds
- **Las Tablas / Norte**: modern, cheaper than the centre, close to the German School
- **Pozuelo de Alarcón** (suburb): many international families, quiet, detached houses available, 20 min metro

The best time to move is June/July — the new school year in Spain begins in mid-September. A summer to acclimatise gives children a head start and parents time for administrative tasks. Important: the summer months of July and August are extremely hot in Madrid (regularly 38-42°C), which makes the city exploration and settling-in phase demanding. Those arriving in August should insist on well air-conditioned accommodation.

Family life in Madrid is hospitable and child-friendly: restaurants welcome children until late in the evening (typical dining time in Madrid: 9pm-11pm), parks and playgrounds are numerous and well-maintained, and the public transport infrastructure (Metro, EMT buses) is well usable for families with children. Under 6 years old, public transport is free; after that the regular fare applies.`,
    sourceUrls: [
      'https://www.deutscheschule.es',
      'https://www.kingscollegeschools.org/madrid',
      'https://www.madrid.es/portales/munimadrid/es/inicio/transporte',
    ],
  },
  {
    section: 'for_retirees',
    titleDE: 'Madrid im Ruhestand',
    titleEN: 'Madrid in Retirement',
    contentDE: `Madrid ist als Rentenstandort in Deutschland weniger bekannt als Lissabon oder die Costa del Sol — zu Unrecht. Die Hauptstadt bietet Rentnern etwas Entscheidendes, das Ferienorte nicht haben: echtes Stadtleben. Weltklasse-Museen (Prado, Reina Sofía, Thyssen), ein dichtes Kulturprogramm, exzellente Gesundheitsversorgung und eine gut funktionierende öffentliche Infrastruktur machen Madrid für aktive Rentner attraktiv, die nicht auf dem Land oder am Strand vegetieren wollen.

Das Beckham-Gesetz gilt auch für Rentner unter bestimmten Bedingungen — aber die Klassifizierung von Renteneinkünften ist komplex. Gesetzliche Deutsche Rentenversicherungs-Renten werden nach dem DBA Deutschland-Spanien grundsätzlich im Wohnsitzstaat Spanien besteuert. Das Beckham-Regime kann auf Renten angewendet werden, wenn bestimmte Voraussetzungen erfüllt sind (insbesondere der Erst-Umzug nach Spanien). Kapitalerträge aus deutschen Quellen unterliegen dem DBA und werden in Deutschland an der Quelle besteuert (Quellensteuer), können aber im Rahmen des DBA angerechnet werden. Eine individuelle Steuerberatung ist unbedingt erforderlich — die Interaktion zwischen Beckham-Regime, DBA und verschiedenen Rentenarten ist nicht trivial.

Die Gesundheitsversorgung in Madrid ist eine der besten in Spanien und vergleichbar mit deutschen Standards in öffentlichen Krankenhäusern. Die großen öffentlichen Krankenhäuser (Hospital Gregorio Marañón, Hospital La Paz, Hospital Clínico San Carlos) bieten Spezialistenversorgung auf hohem Niveau. EU-Rentner mit dauerhaftem Wohnsitz in Spanien haben Zugang zum spanischen Sistema Nacional de Salud (SNS). Private Krankenversicherung (Sanitas, Adeslas, Asisa) kostet für Senioren ab 200-450€ monatlich und bietet kürzere Wartezeiten und mehr Komfort.

Das Klima im Winter: Madrid hat einen kontinentalen Charakter — die Sommer sind heiß und trocken, die Winter kalt (durchschnittlich 6-8°C im Januar/Februar, gelegentlich unter Null). Der Winter ist milder als in Deutschland, aber Madrider Altbauwohnungen sind oft schlecht isoliert. Wer warme Winter schätzt, ist in der Costa del Sol oder auf den Kanarischen Inseln besser aufgehoben.

Praktisches für Rentner: Madrid hat ein gut ausgebautes Senioren-Netzwerk über die städtischen Centros de Mayores (Senioren-Zentren) in jedem Viertel — Sprachkurse, gesellige Aktivitäten, Hilfe bei Behördengängen. Für deutschsprachige Rentner ist die Deutsche Botschaft Madrid und die DAAD-angebundene Auslandsgesellschaft hilfreiche Anlaufstelle.`,
    contentEN: `Madrid is less well known in Germany as a retirement destination than Lisbon or the Costa del Sol — unjustifiably. The capital offers retirees something decisive that holiday resorts don't have: genuine city life. World-class museums (Prado, Reina Sofía, Thyssen), a dense cultural programme, excellent healthcare and a well-functioning public infrastructure make Madrid attractive for active retirees who don't want to vegetate in the countryside or on the beach.

The Beckham Law also applies to retirees under certain conditions — but the classification of pension income is complex. German statutory pensions (Deutsche Rentenversicherung) are generally taxed in the country of residence, Spain, under the Germany-Spain DBA. The Beckham regime can be applied to pensions if certain conditions are met (in particular, the first-time move to Spain). Capital gains from German sources are subject to the DBA and taxed at source in Germany (withholding tax), but can be credited under the DBA. Individual tax advice is essential — the interaction between the Beckham regime, DBA and different pension types is not trivial.

Healthcare in Madrid is one of the best in Spain and comparable to German standards in public hospitals. The major public hospitals (Hospital Gregorio Marañón, Hospital La Paz, Hospital Clínico San Carlos) offer specialist care at a high level. EU retirees with permanent residence in Spain have access to the Spanish Sistema Nacional de Salud (SNS). Private health insurance (Sanitas, Adeslas, Asisa) costs from €200-450 per month for seniors and offers shorter waiting times and more comfort.

The climate in winter: Madrid has a continental character — summers are hot and dry, winters cold (average 6-8°C in January/February, occasionally below zero). Winter is milder than in Germany, but Madrid's old buildings are often poorly insulated. Those who value warm winters are better off on the Costa del Sol or the Canary Islands.

Practical notes for retirees: Madrid has a well-developed senior network through the municipal Centros de Mayores (senior centres) in every neighbourhood — language courses, social activities, help with administrative tasks. For German-speaking retirees, the German Embassy Madrid and DAAD-affiliated foreign societies are helpful contacts.`,
    sourceUrls: [
      'https://www.bmas.de/DE/Soziales/Rentenversicherung/Rente-im-Ausland/rente-im-ausland.html',
      'https://www.comunidad.madrid/servicios/salud',
      'https://www.madrid.es/portales/munimadrid/es/inicio/servicios-sociales-y-salud/centros-de-mayores',
    ],
  },
  {
    section: 'for_tech_workers',
    titleDE: 'Madrid als Tech-Standort',
    titleEN: 'Madrid as a Tech Location',
    contentDE: `Madrid hat sich in den letzten fünf Jahren zu einem ernsthaften Tech-Standort entwickelt — nicht mit der Startup-Romantik von Berlin oder dem Venture-Kapital-Volumen von London, aber mit echtem Substanz: internationale Konzernpräsenz, wachsende Startup-Szene und eines der attraktivsten Steuerregime für Tech-Fachkräfte in Europa.

Die Unternehmenslandschaft ist eindrucksvoll: Amazon Web Services hat sein Europäisches Headquarter für Cloud-Infrastruktur in Madrid; Google hat ein bedeutendes Engineering-Center etabliert; Microsoft, Vodafone, Orange und Accenture haben große Spanien-Teams in der Hauptstadt. Für Tech-Worker bedeutet das: Direkteinstieg bei internationalen Konzernen ohne Relocation-Umweg über London oder Amsterdam ist realistisch. Auch die Startup-Szene wächst — Madrid Proptech, Fintech-Cluster rund um Cibeles und KI-Startups im Bereich Puerta del Sol sind erkennbare Cluster.

Das Gehaltsniveau liegt deutlich unter Zürich oder Amsterdam, aber auch unter Berlin-Niveau — mit dem Unterschied, dass das Beckham-Regime die Nettoposition erheblich verbessert. Ein Senior Software Engineer bei einem internationalen Unternehmen in Madrid verdient typischerweise 55.000-80.000€ brutto; bei Remote-Arbeit für ein ausländisches Unternehmen können es 80.000-130.000€ sein. Mit 24% Flat Tax (statt 37-47% Normalsatz) ergibt sich eine Netto-Position, die effektiv besser sein kann als in Deutschland — abhängig vom individuellen Setup.

Das Remote-Working-Setup ist praktisch solide: Glasfaser-Internet ist in den meisten Madrider Wohngebieten verfügbar; die Zeitzone (MEZ-1 im Winter, MEZ im Sommer) ist für europäische Teams ideal. Die Co-Working-Landschaft umfasst WeWork (mehrere Standorte), Utopicus, la Nave (städtischer Innovationshub) und Wework Campus Canillas. Für Vollzeit-Remote-Worker ist Madrid sehr kompatibel.

Das Tech-Netzwerk: Meetup-Gruppen (Madrid.js, Python Madrid, AI Madrid), Spain Startup Ecosystem, und die vierteljährlichen South Summit-Events (Europas drittgrößte Startup-Konferenz, in Madrid) bieten Anknüpfungspunkte. Die Community ist internationaler als ihr Ruf — Englisch ist im Tech-Bereich vollständig akzeptiert, auch bei Events und in Co-Working-Spaces.

Das Beckham-Regime für Tech-Worker: Arbeitsverträge bei spanischen Unternehmen qualifizieren direkt; Remote-Verträge bei ausländischen Unternehmen qualifizieren seit 2023 ebenfalls, wenn die Anforderungen erfüllt sind (kein spanischer Wohnsitz in den letzten 5 Jahren, Nachweis des ausländischen Arbeitsvertrags, mind. 80% Einkommen aus ausländischer Quelle bei Autónomos). Der Antrag wird beim Finanzamt Agencia Tributaria eingereicht und dauert 4-8 Wochen.`,
    contentEN: `Madrid has developed into a serious tech location over the last five years — not with the startup romanticism of Berlin or the venture capital volumes of London, but with real substance: international corporate presence, a growing startup scene and one of the most attractive tax regimes for tech professionals in Europe.

The corporate landscape is impressive: Amazon Web Services has its European headquarters for cloud infrastructure in Madrid; Google has established a significant engineering centre; Microsoft, Vodafone, Orange and Accenture have large Spain teams in the capital. For tech workers, this means direct entry at international corporations without a relocation detour via London or Amsterdam is realistic. The startup scene is also growing — Madrid PropTech, a fintech cluster around Cibeles and AI startups in the Puerta del Sol area are recognisable clusters.

Salary levels are significantly below Zurich or Amsterdam, but also below Berlin levels — with the difference that the Beckham regime substantially improves the net position. A senior software engineer at an international company in Madrid typically earns €55,000-80,000 gross; for remote work for a foreign company it can be €80,000-130,000. With 24% flat tax (instead of the normal 37-47% rate) the net position can effectively be better than in Germany — depending on individual setup.

The remote working setup is practically solid: fibre-optic internet is available in most Madrid residential areas; the timezone (CET-1 in winter, CET in summer) is ideal for European teams. The co-working landscape includes WeWork (multiple locations), Utopicus, la Nave (municipal innovation hub) and WeWork Campus Canillas. For full-time remote workers, Madrid is very compatible.

The tech network: Meetup groups (Madrid.js, Python Madrid, AI Madrid), Spain Startup Ecosystem, and the quarterly South Summit events (Europe's third-largest startup conference, in Madrid) provide connection points. The community is more international than its reputation — English is fully accepted in the tech sector, even at events and in co-working spaces.

The Beckham regime for tech workers: employment contracts at Spanish companies qualify directly; remote contracts at foreign companies have also qualified since 2023, when requirements are met (no Spanish residence in the last 5 years, proof of foreign employment contract, at least 80% income from foreign source for Autónomos). The application is submitted to the tax authority Agencia Tributaria and takes 4-8 weeks.`,
    sourceUrls: [
      'https://www.agenciatributaria.es/AEAT.internet/Inicio/La_Agencia_Tributaria/Campanas/Campanas_/Regimen_especial_trabajadores_desplazados/Regimen_especial_trabajadores_desplazados.shtml',
      'https://southsummit.co',
      'https://www.madrid.es/portales/munimadrid/es/inicio/empleo-y-formacion/empleo/la-nave',
    ],
  },
];

// ─── Tools ────────────────────────────────────────────────────────────────────

const TOOLS = [
  {
    toolType: 'first_month_budget',
    nameDE: 'Erstmonats-Budget-Rechner Madrid',
    nameEN: 'First Month Budget Calculator Madrid',
    descriptionDE: 'Schätzt dein Budget für den ersten Monat in Madrid: Kaution, Möbel, NIE-Gebühren und mehr.',
    descriptionEN: 'Estimates your budget for the first month in Madrid: deposit, furniture, NIE fees and more.',
    config: {
      citySlug: 'madrid',
      currency: 'EUR',
      defaults: {
        rent1BR: 1700,
        rent2BR: 2400,
        rent3BR: 3400,
        depositMonths: 2,
        agencyFeeMonths: 1,
        furnitureUnfurnished: 3500,
        furnitureSemiFurnished: 1200,
        furnitureFurnished: 0,
        nifFee: 10,
        residencyRegistrationFee: 15,
        monthlyGroceries1Person: 280,
        monthlyGroceries2Person: 450,
        monthlyGroceries4Person: 680,
        transportMonthly: 54,
        internetSetup: 60,
        mobileMonthly: 20,
      },
      footnote: 'Werte basieren auf Idealista-Daten Q1 2026. NIE = 10,15 €, TIE-Erstausstellung = 15,96 €. Kaution ist gesetzlich auf 2 Monatsmieten begrenzt (neue Verträge ab 2019).',
    },
  },
  {
    toolType: 'visa_eligibility',
    nameDE: 'Beckham-Gesetz-Eligibility-Checker',
    nameEN: 'Beckham Law Eligibility Checker',
    descriptionDE: 'Prüft ob du für das Beckham-Regime (Régimen de Impatriados) in Spanien infrage kommst.',
    descriptionEN: 'Checks whether you qualify for the Beckham Law (Régimen de Impatriados) in Spain.',
    config: {
      citySlug: 'madrid',
      regime: 'BeckhamLaw',
      disclaimer: 'Diese Einschätzung ist nicht verbindlich. Für einen Antrag auf das Beckham-Regime ist professionelle Steuerberatung unbedingt erforderlich.',
      disclaimerEN: 'This assessment is not binding. Professional tax advice is essential for a Beckham Law application.',
      questions: [
        {
          id: 'prior_es_residency',
          questionDE: 'Warst du in den letzten 5 Jahren steuerlich in Spanien ansässig?',
          questionEN: 'Were you tax-resident in Spain in the last 5 years?',
          type: 'boolean',
          disqualifyIf: true,
          messageDE: 'Das Beckham-Regime erfordert, dass du in den letzten 5 Jahren nicht in Spanien steuerpflichtig warst.',
          messageEN: 'The Beckham Law requires that you have not been tax-resident in Spain in the last 5 years.',
        },
        {
          id: 'move_reason',
          questionDE: 'Was ist der Hauptgrund deines Umzugs nach Spanien?',
          questionEN: 'What is the main reason for your move to Spain?',
          type: 'select',
          options: [
            { value: 'employed_es', labelDE: 'Angestellt bei spanischem Unternehmen', labelEN: 'Employed by Spanish company' },
            { value: 'employed_foreign_remote', labelDE: 'Remote-Angestellt bei ausländischem Unternehmen', labelEN: 'Remote-employed by foreign company' },
            { value: 'autonomo_foreign', labelDE: 'Selbstständig mit überwiegend ausländischen Kunden', labelEN: 'Self-employed with predominantly foreign clients' },
            { value: 'director', labelDE: 'Direktor / Geschäftsführer spanischer Gesellschaft', labelEN: 'Director / Managing Director of Spanish company' },
            { value: 'other', labelDE: 'Anderer Grund (Rente, Investitionen, etc.)', labelEN: 'Other reason (retirement, investments, etc.)' },
          ],
        },
        {
          id: 'foreign_income_share',
          questionDE: 'Kommt dein Einkommen überwiegend (>80%) aus dem Ausland?',
          questionEN: 'Does your income predominantly (>80%) come from abroad?',
          type: 'boolean',
          relevantFor: ['autonomo_foreign', 'employed_foreign_remote'],
        },
        {
          id: 'has_work_contract',
          questionDE: 'Hast du einen Arbeitsvertrag oder Nachweis der selbstständigen Tätigkeit?',
          questionEN: 'Do you have an employment contract or proof of self-employed activity?',
          type: 'boolean',
        },
      ],
      resultLogic: 'see BeckhamLawEligibilityChecker component',
    },
  },
];

// ─── Resources ────────────────────────────────────────────────────────────────

const RESOURCES = [
  {
    resourceType: 'checklist',
    titleDE: 'Erste 90 Tage in Madrid',
    titleEN: 'First 90 Days in Madrid',
    descriptionDE: 'Interaktive Checkliste aller wichtigen Schritte nach dem Umzug nach Madrid.',
    descriptionEN: 'Interactive checklist of all important steps after moving to Madrid.',
    content: {
      sections: [
        {
          titleDE: 'Woche 1-2: Unmittelbar nach Ankunft',
          titleEN: 'Week 1-2: Immediately after arrival',
          items: [
            { de: 'NIE (Número de Identificación de Extranjero) beantragen — Ausländerbehörde (termin via sede.administracion.gob.es)', en: 'Apply for NIE (Número de Identificación de Extranjero) — foreigners authority (appointment via sede.administracion.gob.es)' },
            { de: 'Vorläufige Unterkunft sichern (AirBnB/Hotel für erste 4-6 Wochen, idealerweise inkl. WLAN und Küche)', en: 'Secure temporary accommodation (AirBnB/hotel for first 4-6 weeks, ideally including WiFi and kitchen)' },
            { de: 'Spanische SIM-Karte besorgen (Movistar, Vodafone, Orange, Yoigo)', en: 'Get a Spanish SIM card (Movistar, Vodafone, Orange, Yoigo)' },
            { de: 'Empadronamiento — Anmeldung beim Stadtbezirksamt (Junta Municipal) mit Wohnungsnachweis', en: 'Empadronamiento — registration at the district office (Junta Municipal) with housing proof' },
          ],
        },
        {
          titleDE: 'Woche 3-6: Wohnen & Meldung',
          titleEN: 'Week 3-6: Housing & Registration',
          items: [
            { de: 'Langzeitwohnung suchen (Idealista, Fotocasa, lokale Makler)', en: 'Search for long-term apartment (Idealista, Fotocasa, local agents)' },
            { de: 'Mietvertrag prüfen: max. 2 Monate Kaution (gesetzlich ab 2019); Provision max. 1 Monatsmiete wenn Makler Vermieterbeauftragter', en: 'Check rental contract: max. 2 months deposit (statutory since 2019); agency fee max. 1 month rent if agent acts for landlord' },
            { de: 'TIE (Tarjeta de Identidad de Extranjero) beantragen — nach Anmeldung der Residencia', en: 'Apply for TIE (Tarjeta de Identidad de Extranjero) — after registering residency' },
            { de: 'Bankkonto eröffnen (BBVA, Santander, CaixaBank oder N26/Revolut als Zwischenlösung)', en: 'Open a bank account (BBVA, Santander, CaixaBank or N26/Revolut as interim solution)' },
          ],
        },
        {
          titleDE: 'Monat 2-3: Gesundheit, Steuer & Alltag',
          titleEN: 'Month 2-3: Health, Tax & Everyday Life',
          items: [
            { de: 'Tarjeta Sanitaria Individual (TSI) beantragen — beim zuständigen Centro de Salud', en: 'Apply for Tarjeta Sanitaria Individual (TSI) — at the responsible Centro de Salud' },
            { de: 'Private Krankenversicherung prüfen (Sanitas, Adeslas, Asisa)', en: 'Check private health insurance (Sanitas, Adeslas, Asisa)' },
            { de: 'Beckham-Gesetz: Antrag bei der Agencia Tributaria innerhalb der ersten 6 Monate nach Umzug', en: 'Beckham Law: application at Agencia Tributaria within the first 6 months after moving' },
            { de: 'Gestor (Steuerberater/Buchhalter) beauftragen für IRPF-Setup und quartalsweise Steuererklärungen', en: 'Engage a Gestor (tax advisor/accountant) for IRPF setup and quarterly tax returns' },
            { de: 'Spanisch-Kurs beginnen — Instituto Cervantes, Volkshochschul-Äquivalente, oder private Tutoren', en: 'Start Spanish course — Instituto Cervantes, adult education equivalents, or private tutors' },
          ],
        },
      ],
    },
  },
  {
    resourceType: 'glossary',
    titleDE: 'Wichtige spanische Behördenbegriffe',
    titleEN: 'Important Spanish Administrative Terms',
    descriptionDE: 'Deutsch-Englisch-Spanisch Glossar der häufigsten Behördenbegriffe in Madrid.',
    descriptionEN: 'German-English-Spanish glossary of the most common administrative terms in Madrid.',
    content: {
      entries: [
        { de: 'Ausländeridentifikationsnummer', en: 'Foreigner ID Number', es: 'NIE (Número de Identificación de Extranjero)', note: 'Erste Amtshandlung — ohne NIE kein Konto, keine Wohnung, keine Steuer' },
        { de: 'Ausländeridentifikationskarte', en: 'Foreigner ID Card', es: 'TIE (Tarjeta de Identidad de Extranjero)', note: 'Physische Karte nach Residencia-Antrag; wird jährlich erneuert' },
        { de: 'Wohnsitzanmeldung', en: 'Residence Registration', es: 'Empadronamiento', note: 'Pflicht für alle Residenten; ermöglicht Tarjeta Sanitaria und TIE' },
        { de: 'Gesundheitskarte', en: 'Health Card', es: 'Tarjeta Sanitaria Individual (TSI)', note: 'Zugang zum staatlichen Gesundheitssystem SNS' },
        { de: 'Selbstständiger', en: 'Self-employed', es: 'Autónomo', note: 'Offizieller Begriff; RETA = Sozialversicherungssystem für Autónomos' },
        { de: 'Steuerberater/Buchhalter', en: 'Tax advisor/accountant', es: 'Gestor (Gestoría)', note: 'Unverzichtbar für Autónomos; typisch 80-200€ monatlich' },
        { de: 'Mehrwertsteuer', en: 'Value Added Tax', es: 'IVA (Impuesto sobre el Valor Añadido)', note: 'Standard 21% für Dienstleistungen; quartalsweise abführen (Modelo 303)' },
        { de: 'Einkommensteuer', en: 'Income Tax', es: 'IRPF (Impuesto sobre la Renta de las Personas Físicas)', note: 'Jährliche Erklärung (Modelo 100); bei Autónomos auch quartalsweise Vorauszahlungen' },
        { de: 'Sondersteuerstatus für Zuzügler', en: 'Special tax status for incomers', es: 'Régimen de Impatriados (Ley Beckham)', note: '24% Flat Tax für bis zu 6 Jahre; Antrag innerhalb der ersten 6 Monate' },
        { de: 'Sozialversicherung Selbstständige', en: 'Social security for self-employed', es: 'RETA (Régimen Especial de Trabajadores Autónomos)', note: 'Einkommensabhängige Beiträge seit 2023; ca. 230-500€/Monat' },
      ],
    },
  },
  {
    resourceType: 'template',
    titleDE: 'Wohnungsbesichtigungs-Checkliste Madrid',
    titleEN: 'Apartment Viewing Checklist Madrid',
    descriptionDE: 'Was du bei jeder Wohnungsbesichtigung in Madrid prüfen und fragen solltest.',
    descriptionEN: 'What to check and ask at every apartment viewing in Madrid.',
    content: {
      sections: [
        {
          titleDE: 'Zustand der Wohnung',
          titleEN: 'Condition of the apartment',
          items: [
            { de: 'Klimaanlage vorhanden? (In Madrid im Sommer unverzichtbar — 38-42°C; Prüfen ob Kühlen UND Heizen)', en: 'Air conditioning available? (Essential in Madrid summers — 38-42°C; check if cooling AND heating)' },
            { de: 'Fensterqualität (Doppelverglasung? Jalousien oder Rollläden? Wichtig für Sommerhitze)', en: 'Window quality (double glazing? Blinds or shutters? Important for summer heat)' },
            { de: 'Wasserflecken / Schimmel (Badezimmer, Außenwände)', en: 'Water stains / mould (bathroom, exterior walls)' },
            { de: 'Heizungsanlage: Gas-Zentralheizung oder elektrisch? (Gas ist Standard, deutlich günstiger)', en: 'Heating system: central gas heating or electric? (Gas is standard, significantly cheaper)' },
            { de: 'Hausgemeinschaft (Comunidad de Propietarios): monatliche Kosten? Hausordnung?', en: 'Home owners\' association (Comunidad de Propietarios): monthly costs? House rules?' },
          ],
        },
        {
          titleDE: 'Rechtliches & Madrid-spezifisch',
          titleEN: 'Legal & Madrid-specific',
          items: [
            { de: 'Kaution: max. 2 Monatsmieten gesetzlich; mehr verlangen ist bei neuen Verträgen unzulässig', en: 'Deposit: max. 2 months rent by law; demanding more is unlawful in new contracts' },
            { de: 'Vertragsdauer: Mindestlaufzeit 5 Jahre für Wohnmietverträge (Gesetz 2019); Kündigung 2 Monate', en: 'Contract duration: minimum 5 years for residential rental contracts (Law 2019); 2 months notice' },
            { de: 'IBI (Grundsteuer): Wer zahlt? (Normalerweise Vermieter, aber manchmal auf Mieter umgelegt)', en: 'IBI (property tax): who pays? (Normally the landlord, but sometimes passed on to tenant)' },
            { de: 'Internetanschluss: Glasfaser vorhanden (Movistar/Orange)? Freie Anbieterwahl?', en: 'Internet connection: fibre available (Movistar/Orange)? Free choice of provider?' },
            { de: 'Haustiere erlaubt? (Spanisches Recht schützt Haustierhalter seit 2021 — aber vertragliche Klärung wichtig)', en: 'Pets allowed? (Spanish law protects pet owners since 2021 — but contractual clarification important)' },
          ],
        },
      ],
    },
  },
  {
    resourceType: 'template',
    titleDE: 'NIE-Antragsschreiben (Vorlage)',
    titleEN: 'NIE Application Letter (Template)',
    descriptionDE: 'Vorlage für das Begleitschreiben bei der NIE-Beantragung bei der Ausländerbehörde.',
    descriptionEN: 'Template cover letter for NIE application at the foreigners authority.',
    content: {
      template: {
        de: 'A la Oficina de Extranjería / Comisaría de Policía:\n\nSolicito la asignación del Número de Identificación de Extranjero (NIE) en calidad de ciudadano/a de [Nationalität], con intención de residir en España por motivos de [Arbeit/Studium/persönliche Gründe].\n\nAdjunto documentación: Pasaporte en vigor (original y copia), Formulario EX-15 cumplimentado, Justificante de pago de tasa (modelo 790-012), Fotografía reciente.\n\nEn [Ort], a [Datum]\n[Vollständiger Name]',
        en: 'To the Foreigners\' Office / Police Station:\n\nI request the assignment of a Foreigner Identification Number (NIE) as a citizen of [Nationality], with the intention of residing in Spain for reasons of [work/study/personal reasons].\n\nI enclose: Valid passport (original and copy), Completed form EX-15, Payment receipt (form 790-012), Recent photograph.\n\nIn [City], on [Date]\n[Full Name]',
      },
      note: 'NIE-Antrag muss persönlich gestellt werden (Auslandsvertretungen in Deutschland möglich für EU-Bürger). Formulare: EX-15 für erstmaligen NIE ohne Residencia. Gebühr: 10,15€ (Tasa 790 Código 012). Termine über: sede.administracion.gob.es',
    },
  },
  {
    resourceType: 'directory',
    titleDE: 'Deutschsprachige Anlaufstellen in Madrid',
    titleEN: 'German-speaking contacts in Madrid',
    descriptionDE: 'Kuratierte Liste deutschsprachiger Dienstleister und Anlaufstellen für Auswanderer in Madrid.',
    descriptionEN: 'Curated list of German-speaking service providers and contact points for expats in Madrid.',
    content: {
      entries: [
        { category: 'Behörde', categoryEN: 'Authority', name: 'Deutsche Botschaft Madrid', description: 'Konsularische Dienstleistungen für deutsche Staatsbürger', url: 'https://madrid.diplo.de', address: 'Calle de Fortuny 8, 28010 Madrid' },
        { category: 'Steuer', categoryEN: 'Tax', name: 'KPMG España', description: 'Internationale Steuerberatung mit deutschsprachigen Ansprechpartnern; auf Beckham-Regime spezialisiert', url: 'https://home.kpmg/es/es/home.html', note: 'Auf Deutschsprachigkeit und Beckham-Expertise bei Kontaktaufnahme hinweisen' },
        { category: 'Recht', categoryEN: 'Legal', name: 'Dentons Spain', description: 'Internationale Kanzlei mit German Desk und Expat-Residenz-Expertise', url: 'https://www.dentons.com/en/find-us/spain', note: 'German Desk für deutschsprachige Mandanten' },
        { category: 'Community', categoryEN: 'Community', name: 'Deutsche Community Madrid (Facebook)', description: 'Aktive Facebook-Gruppe für deutschsprachige Expats in Madrid', url: 'https://www.facebook.com/groups/deutschemadrid', note: 'Ca. 6.000 Mitglieder; aktive Diskussionen zu Wohnen, Beckham-Gesetz, Schulen' },
        { category: 'Schule', categoryEN: 'School', name: 'Deutsche Schule Madrid', description: 'Deutsche Auslandsschule Klasse 1-12; Abitur; Lehrplan nach NRW-Standard', url: 'https://www.deutscheschule.es', address: 'Calle Málaga 16, 28224 Pozuelo de Alarcón, Madrid' },
      ],
    },
  },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    authorName: 'Kai M.',
    authorAge: 31,
    authorProfession: 'Product Manager (Remote)',
    authorPersona: 'employed',
    yearMoved: 2024,
    isVerified: false,
    rating: 5,
    contentDE: `Ich bin Anfang 2024 nach Madrid gezogen — als Remote-Product-Manager für ein deutsches SaaS-Unternehmen. Die primäre Motivation war das Beckham-Gesetz: 24% Flat Tax statt 42% in Deutschland ist bei meinem Gehalt ein sehr spürbarer Unterschied.

Der Umzug selbst war logistisch komplexer als erwartet. Der NIE-Termin hat sechs Wochen gedauert — ich hatte ihn von Deutschland aus reserviert, aber der erste verfügbare Termin war trotzdem erst Mitte Februar, obwohl ich im Januar ankam. In der Zwischenzeit war ich quasi administrativ unsichtbar: Kein NIE, kein Bankkonto, keine offizielle Wohnungsregistrierung.

Die Wohnungssuche war anstrengend. Chamberí war mein Wunsch-Viertel — ich habe 40+ Besichtigungen gemacht, bevor ich eine 55m²-Wohnung für 1.850€ gefunden habe. Viele Vermieter wollten Nachweise über spanisches Einkommen, was für mich als Remote-Worker am Anfang problematisch war. Am Ende hat ein Bürge (mein Arbeitgeber hat eine spanische Holdinggesellschaft) geholfen.

Das Beckham-Gesetz-Setup hat geklappt, aber mit einem Steuerberater (Gestoría) von Tag 1. Kosten: ca. 150€ monatlich für die Steuerberatung plus Ersteinrichtung 800€ für den Beckham-Antrag. Die Steuerersparnis rechtfertigt das deutlich.

Was mich am meisten überrascht hat: Das Madrider Leben ist sozial hervorragend. Die Stadt schläft spät, isst spät (21-23 Uhr normal), und die Co-Working-Community in Malasaña ist warm und vernetzt. Ich habe hier schneller Freunde gefunden als ich es in einer vergleichbaren Situation in Berlin erwartet hätte.

Einziger echter Nachpunkt: der Sommer. Juli und August sind brutal heiß. Ich habe zeitweise mit dem Laptop in Cafés mit guter Klimaanlage gearbeitet, weil meine Wohnung trotz eigenem A/C-Gerät tagsüber nicht ausreichend kühl wurde. Nächstes Jahr suche ich gezielt eine Wohnung mit Zentralklimaanlage — nicht nur mit Mobilklimagerät.`,
    contentEN: `I moved to Madrid at the start of 2024 — as a remote product manager for a German SaaS company. The primary motivation was the Beckham Law: 24% flat tax instead of 42% in Germany is a very noticeable difference at my salary level.

The move itself was more logistically complex than expected. The NIE appointment took six weeks — I had reserved it from Germany, but the first available appointment was still mid-February, even though I arrived in January. In the meantime I was practically administratively invisible: no NIE, no bank account, no official housing registration.

The apartment search was exhausting. Chamberí was my desired neighbourhood — I did 40+ viewings before finding a 55m² apartment for €1,850. Many landlords wanted proof of Spanish income, which was problematic for me as a remote worker at the beginning. In the end, a guarantor (my employer has a Spanish holding company) helped.

The Beckham Law setup worked, but with a tax advisor (Gestoría) from day one. Costs: about €150 per month for the ongoing tax advisory plus €800 initial setup for the Beckham application. The tax savings clearly justify this.

What surprised me most: Madrid social life is excellent. The city sleeps late, eats late (9pm-11pm is normal), and the co-working community in Malasaña is warm and well-connected. I found friends here faster than I would have expected in a comparable situation in Berlin.

Only real downside: the summer. July and August are brutally hot. I worked partly from cafés with good air conditioning because my apartment, despite its own A/C unit, wasn't sufficiently cool during the day. Next year I'll specifically look for an apartment with central air conditioning — not just a mobile A/C unit.`,
  },
  {
    authorName: 'Petra & Jonas H.',
    authorAge: 43,
    authorProfession: 'Unternehmensberaterin / Ingenieur (Konzern)',
    authorPersona: 'family',
    yearMoved: 2023,
    isVerified: false,
    rating: 4,
    contentDE: `Wir sind 2023 mit unseren drei Kindern (damals 8, 11 und 14) nach Pozuelo de Alarcón gezogen — einem Vorort von Madrid, 20 Minuten mit der Metro ins Zentrum. Der Grund: Jonas hat eine Position beim europäischen Headquarter eines amerikanischen Technologiekonzerns angenommen; für mich als Beraterin mit deutschen Kunden lief weiterhin Remote.

Die Deutsche Schule war der zentrale Planungsfaktor. Wir haben uns 16 Monate vor dem Umzug angemeldet — und es war trotzdem knapp für den ältesten, der dann doch noch einen Platz bekam. Mein dringlicher Rat: So früh wie möglich anmelden, auch wenn der Umzug noch spekulativ ist. Schulgebühren: ca. 8.500€ pro Jahr und Kind.

Pozuelo war die richtige Wahl für uns. Ruhig, sicher, viele internationale Familien, gute lokale Schulen als Alternative für die kleineren Kinder und eine echte Wohnhausstruktur — wir haben ein Reihenhaus mit Garten für 2.800€ monatlich, was in Madrid-Zentrum für vergleichbares Objekt 4.500€+ wären.

Das Beckham-Gesetz war für Jonas' Arbeitgeber Standardprozess — sein HR hat alles koordiniert. Für mich als Autónoma war es komplizierter: Ich musste nachweisen, dass mehr als 80% meines Einkommens aus Deutschland kam, was mit meiner Kundenliste gut funktioniert hat.

Was wir unterschätzt hatten: Die Sprachbarriere für die Kinder in der Anfangszeit. Die Deutsche Schule hilft, aber außerhalb der Schule ist Spanisch unverzichtbar — und das kommt nicht von selbst. Wir haben von Tag 1 auf Spanisch-Privatunterricht gesetzt: 2 Mal wöchentlich, 50€/Stunde. Das hat sich definitiv ausgezahlt. Nach einem Jahr sprechen alle drei Kinder Alltagsspanisch.`,
    contentEN: `We moved to Pozuelo de Alarcón with our three children (then aged 8, 11 and 14) in 2023 — a suburb of Madrid, 20 minutes from the centre by metro. The reason: Jonas accepted a position at the European headquarters of an American technology corporation; I continued remotely as a consultant with German clients.

The German School was the central planning factor. We registered 16 months before the move — and it was still close for the eldest, who ultimately did get a place. My urgent advice: register as early as possible, even if the move is still speculative. School fees: about €8,500 per year per child.

Pozuelo was the right choice for us. Quiet, safe, many international families, good local schools as an alternative for the younger children and a genuine residential house structure — we have a terraced house with garden for €2,800 per month, which for a comparable property in central Madrid would be €4,500+.

The Beckham Law was standard procedure for Jonas' employer — their HR coordinated everything. For me as an Autónoma it was more complex: I had to prove that more than 80% of my income came from Germany, which worked well with my client list.

What we underestimated: the language barrier for the children in the initial period. The German School helps, but outside school Spanish is essential — and it doesn't come by itself. We invested in Spanish private lessons from day one: twice a week, €50/hour. That definitely paid off. After a year all three children speak everyday Spanish.`,
  },
  {
    authorName: 'Gerd F.',
    authorAge: 61,
    authorProfession: 'Frührentner (ehemals Selbstständiger)',
    authorPersona: 'retiree',
    yearMoved: 2023,
    isVerified: false,
    rating: 4,
    contentDE: `Ich bin 2023 nach Madrid gezogen — mit 61, nach über 30 Jahren als selbstständiger Unternehmensberater. Lissabon war mein erster Gedanke, aber ich habe mich letztendlich für Madrid entschieden: größere Stadt, bessere Kulturinfrastruktur, und ein Klima, das mir mehr liegt.

Die steuerliche Situation war der aufwändigste Teil der Planung. Ich habe Einkünfte aus deutschen Kapitalerträgen, einer kleinen GmbH-Beteiligung und der Deutschen Rentenversicherung ab 2026. Das Zusammenspiel von Beckham-Gesetz, DBA Deutschland-Spanien und meinen verschiedenen Einkommensquellen war nicht trivial — ich habe einen deutschen und einen spanischen Steuerberater parallel eingeschaltet. Ergebnis: Das Beckham-Regime lohnt sich für mich wegen der Kapitalerträge; die Rente wird nach DBA in Spanien besteuert (günstiger als in Deutschland).

In Madrid lebe ich in Retiro — für mich das perfekte Viertel. Täglich der Spaziergang durch den Retiro-Park, exzellente Anbindung, ruhig aber nicht tot. Die Wohnung (90m², 2.100€) ist teurer als ich ursprünglich geplant hatte, aber die Lage rechtfertigt es.

Das Gesundheitssystem: Ich habe die TSI (staatliche Gesundheitskarte) und ergänze mit Sanitas-Privatversicherung (320€/Monat). Die Erstaufnahme beim Centro de Salud war problemlos. Einen Hausarzt, der Englisch spricht, habe ich über die Expat-Community gefunden — das SNS weist automatisch zu, und der zugewiesene Arzt sprach leider kein Englisch.

Was ich gerne früher gewusst hätte: Madrid ist im August leer. Restaurants schließen, Aktivitäten pausieren — viele Madrider fahren in der Hitze an die Küste. Als Neuankömmling im August kann das einsam sein. Am besten Mai/Juni für den Umzug — dann erlebt man die Stadt in ihrer besten Jahreszeit.`,
    contentEN: `I moved to Madrid in 2023 — at 61, after more than 30 years as a self-employed management consultant. Lisbon was my first thought, but I ultimately decided on Madrid: bigger city, better cultural infrastructure, and a climate that suits me better.

The tax situation was the most demanding part of the planning. I have income from German capital gains, a small GmbH shareholding and the German state pension from 2026. The interplay of the Beckham Law, the Germany-Spain DBA and my various income sources was not trivial — I engaged a German and a Spanish tax advisor in parallel. Result: the Beckham regime is worthwhile for me because of the capital gains; the pension is taxed in Spain under the DBA (cheaper than in Germany).

In Madrid I live in Retiro — for me the perfect neighbourhood. The daily walk through Retiro Park, excellent connectivity, quiet but not dead. The apartment (90m², €2,100) is more expensive than I originally planned, but the location justifies it.

The health system: I have the TSI (state health card) and supplement with Sanitas private insurance (€320/month). The initial registration at the Centro de Salud was straightforward. I found an English-speaking family doctor through the expat community — the SNS assigns automatically, and unfortunately the assigned doctor didn't speak English.

What I wish I'd known earlier: Madrid is empty in August. Restaurants close, activities pause — many Madriders head to the coast to escape the heat. As a newcomer in August, that can feel lonely. Best to move in May/June — then you experience the city at its best.`,
  },
];

// ─── Exported seed function ───────────────────────────────────────────────────

export async function seedMadrid(): Promise<void> {
  console.log('🌍 Seeding Madrid premium content...\n');

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
        update: { value: c.value, source: SOURCE_IDEALISTA },
        create: { districtId: district.id, category: c.category, value: c.value, currency: c.currency, source: SOURCE_IDEALISTA, confidence: 65, validFrom: NOW },
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

  console.log('\n✅ Madrid premium seed complete.');
  console.log(`   Districts: ${DISTRICTS.length}`);
  console.log(`   CoL entries: ${DISTRICTS.reduce((s, d) => s + d.col.length, 0)}`);
  console.log(`   Narratives: ${NARRATIVES.length}`);
  console.log(`   Tools: ${TOOLS.length}`);
  console.log(`   Resources: ${RESOURCES.length}`);
  console.log(`   Testimonials: ${TESTIMONIALS.length}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌍 Seeding Madrid premium content...\n');

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
        update: { value: c.value, source: SOURCE_IDEALISTA },
        create: { districtId: district.id, category: c.category, value: c.value, currency: c.currency, source: SOURCE_IDEALISTA, confidence: 65, validFrom: NOW },
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

  console.log('\n✅ Madrid premium seed complete.');
  console.log(`   Districts: ${DISTRICTS.length}`);
  console.log(`   CoL entries: ${DISTRICTS.reduce((s, d) => s + d.col.length, 0)}`);
  console.log(`   Narratives: ${NARRATIVES.length}`);
  console.log(`   Tools: ${TOOLS.length}`);
  console.log(`   Resources: ${RESOURCES.length}`);
  console.log(`   Testimonials: ${TESTIMONIALS.length}`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  prisma.$disconnect().catch(() => undefined);
  process.exit(1);
});
