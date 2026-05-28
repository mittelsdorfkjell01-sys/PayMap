/**
 * Sprint 9 — Lissabon Premium Content Seed
 * Districts, CoL, Narratives, Tools, Resources, Testimonials
 */
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../apps/nextjs/.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();
const CITY_ID = 'cmpbraeiy000enrhv4y6kxyd6'; // Lissabon
const NOW = new Date('2026-05-25T00:00:00Z');
const SOURCE_IDEALISTA = 'idealista-2026-Q1';

// ─── 2.1 + 2.2  Districts + CoL ──────────────────────────────────────────────

const DISTRICTS = [
  {
    slug: 'principe-real',
    nameDE: 'Príncipe Real',
    nameEN: 'Príncipe Real',
    descriptionDE:
      'Príncipe Real ist Lissabons elegantestes Viertel — ein Hauch Paris mitten in der Hügelstadt. Charakteristische Jugendstil-Palais, Boutiquen unabhängiger Designer und Lissabons kreativste Restaurantszene prägen das Bild. Die wöchentlichen Antiquitätenmärkte und der Jardim do Príncipe Real als Treffpunkt der lokalen Intelligenz machen den Bezirk zum Magneten für Auswanderer mit hohen Ansprüchen. Wer hier lebt, zahlt Lissabons Spitzenpreise — bekommt dafür aber Walkability und Atmosphäre, die ihresgleichen suchen.',
    descriptionEN:
      'Príncipe Real is Lisbon\'s most elegant neighbourhood — a touch of Paris in the middle of the hill city. Art Nouveau palaces, independent designer boutiques and Lisbon\'s most creative restaurant scene define the area. The weekly antique markets and Jardim do Príncipe Real as a meeting point for local intelligentsia make this district a magnet for expats with high standards. Those who live here pay Lisbon\'s top prices — but get walkability and atmosphere that are second to none.',
    latitude: 38.7166,
    longitude: -9.1500,
    vibe: 'schick',
    priceLevel: 5,
    sortOrder: 1,
    col: [
      { category: 'rent_1br_center', value: 2000, currency: 'EUR' },
      { category: 'rent_2br_center', value: 2900, currency: 'EUR' },
      { category: 'rent_3br_center', value: 4200, currency: 'EUR' },
      { category: 'monthly_meal_inexpensive', value: 14, currency: 'EUR' },
      { category: 'monthly_meal_midrange', value: 35, currency: 'EUR' },
      { category: 'cappuccino', value: 1.6, currency: 'EUR' },
    ],
  },
  {
    slug: 'bairro-alto-chiado',
    nameDE: 'Bairro Alto / Chiado',
    nameEN: 'Bairro Alto / Chiado',
    descriptionDE:
      'Das Doppelherz von Lissabons Nachtleben und Kulturszene: Bairro Alto schläft tagsüber und erwacht nach 22 Uhr, während Chiado das literarische, kaffeehausdurchzogene Geschwisterviertel mit Buchhandlungen, Theatern und dem Café A Brasileira ist. Für Auswanderer attraktiv wegen der zentralen Lage und lebendigen Atmosphäre — aber Lärmbelastung in der Nacht ist reales Thema. Wohnungsangebote sind rar und teuer; viele langfristige Mieter weichen in Nachbarviertel aus.',
    descriptionEN:
      'The double heart of Lisbon\'s nightlife and cultural scene: Bairro Alto sleeps during the day and awakens after 10pm, while Chiado is the literary, café-filled sibling neighbourhood with bookshops, theatres and the famous Café A Brasileira. Attractive to expats for its central location and vibrant atmosphere — but noise at night is a real issue. Rental supply is scarce and expensive; many long-term tenants move to adjacent neighbourhoods.',
    latitude: 38.7108,
    longitude: -9.1427,
    vibe: 'lebendig',
    priceLevel: 5,
    sortOrder: 2,
    col: [
      { category: 'rent_1br_center', value: 1950, currency: 'EUR' },
      { category: 'rent_2br_center', value: 2750, currency: 'EUR' },
      { category: 'rent_3br_center', value: 3900, currency: 'EUR' },
      { category: 'monthly_meal_inexpensive', value: 13, currency: 'EUR' },
      { category: 'monthly_meal_midrange', value: 35, currency: 'EUR' },
      { category: 'cappuccino', value: 1.5, currency: 'EUR' },
    ],
  },
  {
    slug: 'estrela-lapa',
    nameDE: 'Estrela / Lapa',
    nameEN: 'Estrela / Lapa',
    descriptionDE:
      'Estrela und Lapa sind die bevorzugten Wohnlagen der diplomatischen Community und wohlhabender Lissabonner Familien. Breite Alleen, ruhige Seitenstraßen, gepflegte Parks wie der Jardim da Estrela — das Viertel bietet Großstadtcharme ohne Großstadtlärm. Viele ausländische Botschaften haben hier ihren Sitz, was dem Viertel einen kosmopolitischen Zug verleiht. Für Familien mit Kindern ist es ideal: nah am Tejo, sicher, mit exzellenter Infrastruktur.',
    descriptionEN:
      'Estrela and Lapa are the preferred residential areas of the diplomatic community and wealthy Lisbon families. Wide avenues, quiet side streets, manicured parks like Jardim da Estrela — the neighbourhood offers big-city charm without big-city noise. Many foreign embassies are located here, lending a cosmopolitan feel. Ideal for families with children: close to the Tagus, safe, with excellent infrastructure.',
    latitude: 38.7098,
    longitude: -9.1589,
    vibe: 'gehoben',
    priceLevel: 4,
    sortOrder: 3,
    col: [
      { category: 'rent_1br_center', value: 1750, currency: 'EUR' },
      { category: 'rent_2br_center', value: 2500, currency: 'EUR' },
      { category: 'rent_3br_center', value: 3500, currency: 'EUR' },
      { category: 'monthly_meal_inexpensive', value: 12, currency: 'EUR' },
      { category: 'monthly_meal_midrange', value: 28, currency: 'EUR' },
      { category: 'cappuccino', value: 1.4, currency: 'EUR' },
    ],
  },
  {
    slug: 'avenidas-novas',
    nameDE: 'Avenidas Novas',
    nameEN: 'Avenidas Novas',
    descriptionDE:
      'Avenidas Novas ist Lissabons modernes Businessviertel, geplant im frühen 20. Jahrhundert mit breiten Boulevards nach Pariser Vorbild. Heute Heimat zahlreicher Unternehmenshauptsitze, Botschaften und des El Corte Inglés. Das Viertel ist weniger touristisch als das historische Zentrum und bietet solide Infrastruktur: gute Schulen, viele Supermärkte, ausgezeichnete ÖPNV-Anbindung. Beliebt bei Expats, die Wert auf Praktikabilität legen — weniger Charme, mehr Effizienz.',
    descriptionEN:
      'Avenidas Novas is Lisbon\'s modern business district, planned in the early 20th century with wide Parisian-style boulevards. Today home to numerous company headquarters, embassies and the El Corte Inglés. Less touristy than the historic centre, the neighbourhood offers solid infrastructure: good schools, many supermarkets, excellent public transport. Popular with expats who value practicality — less charm, more efficiency.',
    latitude: 38.7290,
    longitude: -9.1520,
    vibe: 'schick',
    priceLevel: 4,
    sortOrder: 4,
    col: [
      { category: 'rent_1br_center', value: 1550, currency: 'EUR' },
      { category: 'rent_2br_center', value: 2150, currency: 'EUR' },
      { category: 'rent_3br_center', value: 3100, currency: 'EUR' },
      { category: 'monthly_meal_inexpensive', value: 11, currency: 'EUR' },
      { category: 'monthly_meal_midrange', value: 25, currency: 'EUR' },
      { category: 'cappuccino', value: 1.3, currency: 'EUR' },
    ],
  },
  {
    slug: 'alvalade',
    nameDE: 'Alvalade',
    nameEN: 'Alvalade',
    descriptionDE:
      'Alvalade ist das "echte" Lissabon: ein traditionelles Familienviertel aus den 1940er-Jahren mit eigenem, stolzem Charakter. Breite Straßen, viele Parks, lokale Märkte und eine lebendige Nachbarschaftsstruktur ohne Touristenmassen. Hier leben Lissabonner Familien seit Generationen — was Kontinuität, aber auch günstigere Mieten bedeutet. Für Familien und Auswanderer, die authentisches Stadtleben dem Hochglanz-Erlebnis vorziehen, ist Alvalade eine der besten Optionen.',
    descriptionEN:
      'Alvalade is the "real" Lisbon: a traditional family neighbourhood from the 1940s with its own proud character. Wide streets, many parks, local markets and a vibrant neighbourhood structure without tourist crowds. Lisbon families have lived here for generations — which means continuity, but also more affordable rents. For families and expats who prefer authentic urban living to the high-gloss experience, Alvalade is one of the best options.',
    latitude: 38.7470,
    longitude: -9.1380,
    vibe: 'familiär',
    priceLevel: 3,
    sortOrder: 5,
    col: [
      { category: 'rent_1br_center', value: 1350, currency: 'EUR' },
      { category: 'rent_2br_center', value: 1850, currency: 'EUR' },
      { category: 'rent_3br_center', value: 2600, currency: 'EUR' },
      { category: 'monthly_meal_inexpensive', value: 10, currency: 'EUR' },
      { category: 'monthly_meal_midrange', value: 22, currency: 'EUR' },
      { category: 'cappuccino', value: 1.2, currency: 'EUR' },
    ],
  },
  {
    slug: 'belem',
    nameDE: 'Belém',
    nameEN: 'Belém',
    descriptionDE:
      'Belém liegt im Westen Lissabons direkt am Tejo und ist bekannt für seine historischen Monumente (Torre de Belém, Mosteiro dos Jerónimos) und die weltberühmten Pastéis de Belém. Als Wohnviertel ist Belém ruhig, grün und familienfreundlich — mit dem Vorteil eines direkten Tejo-Zugangs und ausgedehnter Radweginfrastruktur. Die Anbindung an die Innenstadt per Zug dauert 20 Minuten. Beliebt bei Familien, die etwas Platz und Ruhe suchen, ohne komplett ins Umland ziehen zu müssen.',
    descriptionEN:
      'Belém lies in the west of Lisbon directly on the Tagus and is famous for its historic monuments (Torre de Belém, Mosteiro dos Jerónimos) and the world-famous Pastéis de Belém bakery. As a residential neighbourhood, Belém is quiet, green and family-friendly — with the advantage of direct Tagus access and extensive cycling infrastructure. The connection to the city centre by train takes 20 minutes. Popular with families looking for space and tranquillity without moving completely to the suburbs.',
    latitude: 38.6979,
    longitude: -9.2039,
    vibe: 'familiär',
    priceLevel: 3,
    sortOrder: 6,
    col: [
      { category: 'rent_1br_center', value: 1250, currency: 'EUR' },
      { category: 'rent_2br_center', value: 1750, currency: 'EUR' },
      { category: 'rent_3br_center', value: 2450, currency: 'EUR' },
      { category: 'monthly_meal_inexpensive', value: 10, currency: 'EUR' },
      { category: 'monthly_meal_midrange', value: 22, currency: 'EUR' },
      { category: 'cappuccino', value: 1.2, currency: 'EUR' },
    ],
  },
  {
    slug: 'parque-das-nacoes',
    nameDE: 'Parque das Nações',
    nameEN: 'Parque das Nações',
    descriptionDE:
      'Parque das Nações ist Lissabons jüngstes Viertel — vollständig neu gebaut für die Expo 1998 auf ehemaligem Industriegelände am Tejo. Breite Flusspromenaden, moderner Wohnbau, das Oceanarium und viele Grünflächen prägen das Bild. Das Viertel ist jung, sauber und gut geplant mit exzellentem ÖPNV-Anschluss (direkter Zug und Metro). Besonders beliebt bei jungen Familien und Tech-Expats wegen der modernen Infrastruktur und Nähe zu einigen Technologiezentren Lissabons.',
    descriptionEN:
      'Parque das Nações is Lisbon\'s youngest neighbourhood — completely newly built for Expo 1998 on former industrial land by the Tagus. Wide riverfront promenades, modern residential buildings, the Oceanarium and many green spaces define the area. The neighbourhood is young, clean and well-planned with excellent public transport connections (direct train and metro). Particularly popular with young families and tech expats due to the modern infrastructure and proximity to some of Lisbon\'s technology centres.',
    latitude: 38.7660,
    longitude: -9.0960,
    vibe: 'familiär',
    priceLevel: 4,
    sortOrder: 7,
    col: [
      { category: 'rent_1br_center', value: 1650, currency: 'EUR' },
      { category: 'rent_2br_center', value: 2250, currency: 'EUR' },
      { category: 'rent_3br_center', value: 3200, currency: 'EUR' },
      { category: 'monthly_meal_inexpensive', value: 11, currency: 'EUR' },
      { category: 'monthly_meal_midrange', value: 24, currency: 'EUR' },
      { category: 'cappuccino', value: 1.3, currency: 'EUR' },
    ],
  },
  {
    slug: 'almada',
    nameDE: 'Almada (Südliches Ufer)',
    nameEN: 'Almada (South Bank)',
    descriptionDE:
      'Almada liegt auf dem südlichen Tejo-Ufer und ist technisch gesehen eine eigene Stadt — aber durch die Cacilheiros-Fähre in 10 Minuten mit Lissabons Innenstadt verbunden. Almada ist Lissabons günstigste Alternative für Auswanderer, die Innenstadt-Nähe mit erschwinglichen Mieten verbinden möchten. Das Viertel ist aufstrebend: steigende Investitionen, neue Cafés und ein wachsendes Expat-Netzwerk sind erkennbar. Wer die Fähre nicht als tägliches Ritual sieht, sondern als Erlebnis, ist hier richtig.',
    descriptionEN:
      'Almada sits on the south bank of the Tagus and is technically a separate city — but connected to Lisbon\'s city centre in 10 minutes by the Cacilheiros ferry. Almada is Lisbon\'s most affordable alternative for expats wanting inner-city proximity with affordable rents. The neighbourhood is on the rise: increasing investment, new cafés and a growing expat network are evident. If you see the ferry not as a daily chore but as an experience, this is the place for you.',
    latitude: 38.6795,
    longitude: -9.1573,
    vibe: 'aufstrebend',
    priceLevel: 2,
    sortOrder: 8,
    col: [
      { category: 'rent_1br_center', value: 1050, currency: 'EUR' },
      { category: 'rent_2br_center', value: 1450, currency: 'EUR' },
      { category: 'rent_3br_center', value: 2050, currency: 'EUR' },
      { category: 'monthly_meal_inexpensive', value: 9, currency: 'EUR' },
      { category: 'monthly_meal_midrange', value: 18, currency: 'EUR' },
      { category: 'cappuccino', value: 1.1, currency: 'EUR' },
    ],
  },
];

// ─── 2.3  City Narratives ─────────────────────────────────────────────────────

const NARRATIVES = [
  {
    section: 'intro',
    titleDE: 'Lissabon — Sonne, Kapital, Komplexität',
    titleEN: 'Lisbon — Sun, Capital, Complexity',
    contentDE: `Lissabon ist in den letzten zehn Jahren von einer gut gehüteten Geheimtipp-Hauptstadt zur europäischen Auswanderer-Hochburg aufgestiegen. Die Gründe sind offensichtlich: 300 Sonnentage im Jahr, eine der niedrigsten Kriminalitätsraten Westeuropas, ein vergleichsweise günstiges Preisniveau (das sich allerdings in den letzten Jahren deutlich erhöht hat) und — für viele das entscheidende Argument — das IFICI-Steuerregime, das qualifizierte Einwanderer mit einem Flat-Tax-Satz von 20% auf portugiesische Einkünfte aus bestimmten Hochwerttätigkeiten begünstigt.

Was Lissabon attraktiv macht, ist die Kombination von Faktoren, die sich selten so zusammenfinden: Eine lebendige Kulturszene mit wachsender Tech-Community, authentische Stadtteile mit eigenem Charakter, exzellentes Essen zu vertretbaren Preisen, und eine geografische Lage, die Zugang zu Surf, Bergen und dem historischen Hinterland Portugals in unter einer Stunde ermöglicht. Die Stadt ist menschlich in ihrer Größe — rund 545.000 Einwohner im Kernbereich, etwa 2,9 Millionen in der Metropolregion — und lässt sich zu Fuß oder per E-Bike erschließen.

Die Herausforderungen sind real und sollten nicht unterschätzt werden. Der Wohnungsmarkt ist angespannt: Die Nachfrage übersteigt das Angebot erheblich, und die durchschnittlichen Mieten haben sich in populären Vierteln zwischen 2019 und 2026 teilweise verdoppelt. Wer ohne Kontakte oder lokale Kenntnisse sucht, wird mit Besichtigungsschlangen, Bieterkriegen und oft undurchsichtigen Vermieterpraktiken konfrontiert. Eine realistische Vorlaufzeit für die Wohnungssuche beträgt 2-4 Monate — mehr, wenn man spezifische Anforderungen hat.

Die portugiesische Bürokratie ist legendär in ihrer Geduldserprobung. Die Behördenwege folgen eigener Logik: NIF-Antrag, Anmeldung bei der Câmara Municipal, SNS-Registrierung, Bankkonto — jeder Schritt erfordert Dokumente, die oft erst existieren, wenn andere Schritte abgeschlossen sind. Ohne die richtige Reihenfolge kann man sich wochenlang im Kreis drehen. Ein lokaler Steuerberater oder Expat-Lawyer zahlt sich in den ersten drei Monaten fast immer aus.

Die Sprache ist unterschätztes Hindernis für langfristige Integration. Englisch wird in Restaurants, Co-Working-Spaces und der Tech-Community problemlos gesprochen — aber beim Arzt, beim Vermieter oder in der Behörde ist Portugiesisch oft unverzichtbar. Wer plant zu bleiben, sollte von Anfang an in Sprachkurse investieren; Spanisch hilft, ist aber kein Ersatz.

Wer passt nach Lissabon? Tech-Worker und Freelancer mit Einkommen oberhalb der IFICI-Qualifikationsgrenzen (wer für ein ausländisches Unternehmen in Portugal arbeitet oder bestimmte Hochwerttätigkeiten ausübt), digitale Nomaden mit flexiblen Verträgen, Familien die bereit sind, etwas Bürokratie-Friction in Kauf zu nehmen für Lebensqualität, und Rentner, die europäischen Lebensstil mit angenehmerem Klima verbinden wollen.

Wer nicht passt: Menschen, die Effizienz über Atmosphäre stellen, die schnelle Antworten von Behörden erwarten, oder die glauben, dass Lissabon noch immer so günstig ist wie vor zehn Jahren. Die Stadt hat sich verändert. Sie ist nach wie vor attraktiv — aber zu deutlich höheren Einstiegskosten als noch 2019.`,
    contentEN: `Lisbon has risen over the last decade from a well-kept secret capital to Europe's premier expat destination. The reasons are obvious: 300 days of sunshine per year, one of the lowest crime rates in Western Europe, a comparatively affordable cost of living (which has, however, risen significantly in recent years), and — for many the decisive argument — the IFICI tax regime, which benefits qualified immigrants with a flat-tax rate of 20% on Portuguese income from certain high-value activities.

What makes Lisbon attractive is the combination of factors that rarely come together: a vibrant cultural scene with a growing tech community, authentic neighbourhoods with their own character, excellent food at reasonable prices, and a geographic location that provides access to surf, mountains and Portugal's historic hinterland in under an hour. The city is human in scale — around 545,000 residents in the core area, about 2.9 million in the metropolitan region — and can be explored on foot or by e-bike.

The challenges are real and should not be underestimated. The housing market is tight: demand significantly exceeds supply, and average rents in popular neighbourhoods have in some cases doubled between 2019 and 2026. Those searching without contacts or local knowledge face viewing queues, bidding wars and often opaque landlord practices. A realistic lead time for finding housing is 2-4 months — more if you have specific requirements.

Portuguese bureaucracy is legendary for testing patience. The administrative processes follow their own logic: NIF application, registration with the Câmara Municipal, SNS registration, bank account — each step requires documents that often only exist once other steps are completed. Without the right sequence, you can go in circles for weeks. A local tax advisor or expat lawyer almost always pays off in the first three months.

Language is an underestimated obstacle to long-term integration. English is spoken without problems in restaurants, co-working spaces and the tech community — but at the doctor, with the landlord or at the authority, Portuguese is often essential. Those planning to stay should invest in language courses from the start; Spanish helps, but is not a substitute.

Who fits Lisbon? Tech workers and freelancers with income above IFICI qualification thresholds (those working for a foreign company in Portugal or exercising certain high-value activities), digital nomads with flexible contracts, families willing to accept some bureaucratic friction in exchange for quality of life, and retirees wanting European lifestyle with a more pleasant climate.

Who doesn't fit: people who prioritise efficiency over atmosphere, who expect quick responses from authorities, or who believe Lisbon is still as affordable as ten years ago. The city has changed. It remains attractive — but at significantly higher entry costs than in 2019.`,
    sourceUrls: [
      'https://at.gov.pt/en/at/tax-information/personal-income-tax/ifici',
      'https://portaldascomunidades.mne.gov.pt',
      'https://www.idealista.pt/news/imobiliario/habitacao',
    ],
  },
  {
    section: 'for_freelancers',
    titleDE: 'Lissabon als Freelancer — die IFICI-Realität',
    titleEN: 'Lisbon as a Freelancer — the IFICI Reality',
    contentDE: `Für Freelancer ist Lissabon einer der interessantesten Standorte Europas — aber auch einer, der sorgfältige Vorbereitung verlangt. Das IFICI-Regime (Incentivo Fiscal à Investigação Científica e Inovação, der Nachfolger des NHR-Regimes seit 2024) kann für qualifizierte Selbstständige eine erhebliche Steuerersparnis bedeuten: 20% Flat Tax auf portugiesische Einkünfte aus qualifizierenden Tätigkeiten, statt des regulären progressiven Steuersatzes von bis zu 48%.

Die Qualifikation ist der kritische Punkt. IFICI gilt für Einkünfte aus bestimmten Hochwerttätigkeiten — Technologie, Wissenschaft, kreative Wirtschaft, aber auch für Einkünfte aus ausländischen Quellen unter bestimmten Bedingungen. Wer als Freelancer für deutsche oder andere ausländische Auftraggeber arbeitet und seinen steuerlichen Wohnsitz nach Portugal verlegt, sollte die eigene Situation mit einem portugiesischen Steuerberater prüfen — die Grenzen sind nicht trivial.

Das operative Gerüst für Freelancer in Portugal basiert auf Recibos Verdes, dem portugiesischen Äquivalent zur Freiberufler-Rechnung. Die Ausstellung ist über das Portal der Autoridade Tributária (AT, die portugiesische Finanzbehörde) einfach und digital. Allerdings gelten ab einem Jahresumsatz von 14.500€ (Stand 2025) Mehrwertsteuer-Pflichten — die MwSt.-Anmeldung muss rechtzeitig erfolgen.

Die Sozialversicherungsbeiträge sind für Freelancer ein oft unterschätzter Kostenfaktor: 21,4% des Einkommens (mit einer Bemessungsgrundlage von 70% des tatsächlichen Umsatzes bei Dienstleistungen). Im ersten Jahr der selbstständigen Tätigkeit in Portugal besteht Beitragsfreiheit — danach beginnen die Abzüge. Eine Vorauszahlung in Quartalen ist Pflicht.

Banking als Freelancer ist lösbar, aber erfordert Geduld. Die großen Banken (Millennium BCP, Caixa Geral de Depósitos, Banco BPI) verlangen oft einen Nachweis über portugiesische Einkünfte für Geschäftskonten. Viele Freelancer nutzen in der Anfangsphase Revolut Business oder Wise Business als Zwischenlösung bis das reguläre Bankverhältnis aufgebaut ist.

Co-Working-Spaces sind in Lissabon exzellent und nicht nur Büros, sondern Community-Hubs. LX Factory, Second Home, und zahlreiche kleinere Räume in Príncipe Real und Intendente bieten Networking-Möglichkeiten, die bei Mandantenakquise und lokalem Netzaufbau helfen. Viele erfolgreiche Lissabon-Freelancer sagen, dass das erste Jahr primär über Co-Working-Kontakte und Empfehlungen läuft.

Realistische Einkommenserwartung: Lissabon ist kein günstiges Pflaster mehr. Wer als Freelancer hier komfortabel leben möchte — mit vernünftiger Wohnung in guter Lage, Freizeitaktivitäten, Rücklagen — sollte mit einem Netto-Eigenäquivalent von mindestens 3.500-4.000€ monatlich kalkulieren. Unter 2.500€ wird es in den beliebten Vierteln eng.`,
    contentEN: `For freelancers, Lisbon is one of Europe's most interesting locations — but also one that requires careful preparation. The IFICI regime (Incentivo Fiscal à Investigação Científica e Inovação, the successor to the NHR regime since 2024) can mean significant tax savings for qualified self-employed individuals: 20% flat tax on Portuguese income from qualifying activities, instead of the regular progressive rate of up to 48%.

Qualification is the critical point. IFICI applies to income from certain high-value activities — technology, science, creative industries, but also to income from foreign sources under certain conditions. Freelancers working for German or other foreign clients who move their tax residence to Portugal should check their own situation with a Portuguese tax advisor — the boundaries are not trivial.

The operational framework for freelancers in Portugal is based on Recibos Verdes, the Portuguese equivalent of a freelance invoice. Issuing these is simple and digital via the portal of the Autoridade Tributária (AT, the Portuguese tax authority). However, VAT obligations apply from an annual turnover of €14,500 (as of 2025) — VAT registration must be done in time.

Social security contributions are an often underestimated cost factor for freelancers: 21.4% of income (with a contribution base of 70% of actual turnover for services). In the first year of self-employment in Portugal there is an exemption from contributions — after that, deductions begin. Quarterly advance payments are mandatory.

Banking as a freelancer is solvable, but requires patience. The major banks (Millennium BCP, Caixa Geral de Depósitos, Banco BPI) often require proof of Portuguese income for business accounts. Many freelancers use Revolut Business or Wise Business as an interim solution until a regular banking relationship is established.

Co-working spaces in Lisbon are excellent and not just offices, but community hubs. LX Factory, Second Home, and numerous smaller spaces in Príncipe Real and Intendente offer networking opportunities that help with client acquisition and building a local network. Many successful Lisbon freelancers say the first year runs primarily through co-working contacts and referrals.

Realistic income expectation: Lisbon is no longer an inexpensive location. Freelancers wanting to live comfortably here — with a decent apartment in a good location, leisure activities, savings — should budget for a net equivalent of at least €3,500-4,000 per month. Below €2,500 it gets tight in the popular neighbourhoods.`,
    sourceUrls: [
      'https://at.gov.pt/en/at/tax-information/personal-income-tax/ifici',
      'https://www.seg-social.pt/trabalhadores-independentes',
      'https://at.gov.pt/pt/at/impostos/iva',
    ],
  },
  {
    section: 'for_families',
    titleDE: 'Lissabon mit Kindern — Schulen, Wohnen, Alltag',
    titleEN: 'Lisbon with Children — Schools, Housing, Everyday Life',
    contentDE: `Lissabon ist für Familien eine reizvolle, aber anspruchsvolle Option. Die Stadt bietet viel: Sicherheit, Klima, ein familienfreundliches Lebensgefühl und — für Kinder mit internationalem Schulbedarf — eine wachsende Auswahl an Bildungsangeboten. Die Herausforderungen liegen vor allem im Wohnungsmarkt und in der Logistik des Schulalltags.

Die Deutsche Schule Lissabon (DSL) ist die erste Adresse für deutschsprachige Familien. Sie liegt in Carcavelos, etwa 25 Kilometer westlich des Stadtzentrums, und bietet deutschen Lehrplan von der Grundschule bis zum Abitur. Wartelisten sind lang — Anmeldungen sollten 12-18 Monate vor Einschulungsdatum erfolgen. Schulgebühren liegen je nach Jahrgangsstufe zwischen 8.000 und 12.000€ pro Jahr.

Alternativ bieten verschiedene International Schools britisches oder amerikanisches Curriculum: St. Julian's School (Carcavelos), Carlucci American International School (Linhó/Sintra) und CLIP (Oporto International School hat einen Lissabon-Campus) sind die bekanntesten. Schulgebühren variieren zwischen 10.000 und 18.000€ jährlich.

Für Familien mit kleineren Kindern sind portugiesische öffentliche Jardins de Infância (Kindergärten) eine oft unterschätzte Option — sprachliche Immersion von klein auf und günstige bis kostenlose Betreuung. Die örtliche Câmara Municipal vermittelt Plätze; Wartelisten existieren, sind aber in nicht-zentralen Vierteln überschaubar.

Familienfreundliche Stadtteile in Lissabon sind Alvalade (traditionell, parkreich, gute öffentliche Schulen), Belém (ruhig, Tejo-nah, gute Radinfrastruktur), und Parque das Nações (modern, sicher, gut geplant). Aus logistischer Sicht für Familien mit Schulkindern an der DSL ist der Westen attraktiv: Cascais, Estoril und Parede liegen auf dem Schulweg und bieten Einfamilienhäuser oder größere Wohnungen zu moderateren Preisen als das Lissaboner Stadtzentrum.

Der beste Umzugszeitpunkt ist Juli/August — das neue Schuljahr beginnt in Portugal Mitte September. Ein Umzug in dieser Zeit gibt Kindern die Möglichkeit, sich vor Schulbeginn zu akklimatisieren, und Eltern die Chance, bürokratische Basics (NIF, SNS, Bankkonto) in Ruhe zu erledigen. Ein Umzug während des Schuljahres ist möglich, aber deutlich aufwändiger — die Kinder müssen mitten im Lehrplan einsteigen.

Das Leben mit Kindern in Lissabon ist im Alltag angenehm: Parkflächen und Spielplätze sind in den meisten Vierteln gut; öffentlicher Transport ist für Kinder ab 12 Jahren kostenfrei (Viva Viagem Karte); Restaurants sind kinderfreundlich; und das Wetter erlaubt Outdoor-Aktivitäten fast das ganze Jahr.`,
    contentEN: `Lisbon is an attractive but demanding option for families. The city offers much: safety, climate, a family-friendly way of life and — for children needing international schooling — a growing range of educational options. The challenges lie primarily in the housing market and the logistics of school life.

The Deutsche Schule Lissabon (DSL) is the first port of call for German-speaking families. Located in Carcavelos, about 25 kilometres west of the city centre, it offers the German curriculum from primary school through to Abitur. Waiting lists are long — enrolments should be made 12-18 months before the enrolment date. School fees range from €8,000 to €12,000 per year depending on the year group.

Alternatively, various international schools offer British or American curricula: St. Julian's School (Carcavelos), Carlucci American International School (Linhó/Sintra) and CLIP (Oporto International School has a Lisbon campus) are the best known. School fees vary between €10,000 and €18,000 annually.

For families with younger children, Portuguese public Jardins de Infância (kindergartens) are an often underestimated option — linguistic immersion from an early age and low-cost or free childcare. The local Câmara Municipal arranges places; waiting lists exist but are manageable in non-central neighbourhoods.

Family-friendly neighbourhoods in Lisbon include Alvalade (traditional, park-rich, good public schools), Belém (quiet, close to the Tagus, good cycling infrastructure) and Parque das Nações (modern, safe, well-planned). From a logistical perspective for families with school-age children at the DSL, the west is attractive: Cascais, Estoril and Parede lie on the school route and offer houses or larger apartments at more moderate prices than the Lisbon city centre.

The best time to move is July/August — the new school year in Portugal begins in mid-September. Moving at this time gives children the opportunity to acclimatise before school starts and parents the chance to deal with bureaucratic basics (NIF, SNS, bank account) at a relaxed pace. Moving during the school year is possible but considerably more demanding — children have to join in the middle of the curriculum.

Life with children in Lisbon is pleasant day-to-day: parks and playgrounds are good in most neighbourhoods; public transport is free for children from age 12 (Viva Viagem card); restaurants are child-friendly; and the weather allows outdoor activities almost year-round.`,
    sourceUrls: [
      'https://www.dslissabon.com',
      'https://www.stjulians.com',
      'https://www.carlucci.edu.pt',
    ],
  },
  {
    section: 'for_retirees',
    titleDE: 'Lissabon als Ruhestand-Ort',
    titleEN: 'Lisbon as a Retirement Destination',
    contentDE: `Lissabon hat sich zu einem der gefragtesten Rentenstandorte Europas entwickelt — aus nachvollziehbaren Gründen: Das Klima ist mild und sonnig ohne extreme Hitze, die Stadt ist sicher, das Gesundheitssystem akzeptabel, und die Lebenshaltungskosten sind zwar gestiegen, aber im Vergleich zu Deutschland nach wie vor günstig für ein westeuropäisches Niveau.

Das IFICI-Regime und Renten ist ein Thema mit nuancierten Regeln. Renten aus Deutschland fallen grundsätzlich unter das Doppelbesteuerungsabkommen Deutschland-Portugal (DBA). Die Besteuerung hängt von der Rentenart ab: Gesetzliche Renten (Deutsche Rentenversicherung) werden nach dem DBA grundsätzlich nur im Wohnsitzstaat Portugal besteuert — zu den dort geltenden Sätzen. Betriebsrenten und Beamtenpensionen können anders behandelt werden. IFICI kann für bestimmte Rentenarten gelten, aber nicht universell — eine individuelle Steuerberatung ist unbedingt erforderlich.

Die Krankenversicherung im Alter ist der wichtigste praktische Aspekt. EU-Rentner mit dauerhaftem Wohnsitz in Portugal haben Zugang zum SNS (Serviço Nacional de Saúde) — dem portugiesischen Nationalgesundheitsdienst. Die Versorgungsqualität ist in Lissabon gut, allerdings mit teils längeren Wartezeiten bei Spezialisten. Wer auf Garantie-Timings angewiesen ist, ergänzt mit privater Krankenversicherung (Medis, Advance Care oder Fidelidade bieten Tarife für Senioren ab etwa 200-400€ monatlich).

Pflegeoptionen in Portugal haben sich in den letzten Jahren verbessert, sind aber deutlich teurer als in Deutschland, wenn man nicht Sozialleistungen in Anspruch nimmt. Private Pflegeheime kosten 2.000-4.000€ monatlich; die staatliche Option ist günstiger, aber mit Wartelisten. Wer langfristig plant, sollte das Testament und die Vorsorgevollmacht nach deutschem und/oder portugiesischem Recht regeln — beide können nebeneinander existieren.

Das Klima im Winter ist ein reales Thema: Lissabon ist milder als Deutschland, aber nicht "immer warm". Die Winter sind feucht — durchschnittlich 100-120 Regentage im Jahr — und Lissaboner Altbau-Wohnungen sind oft schlecht isoliert. Viele Rentner berichten von empfundener Kälte in Wohnungen trotz vergleichsweise milder Außentemperaturen (10-15°C). Heizkosten sind real. Wer Wärme über alles stellt, sollte weiter südlich (Algarve) in Betracht ziehen.

Praktische Orientierungspunkte für Rentner in Lissabon: Das Senioren-Netzwerk von Portugal Resident (englischsprachiges Expat-Magazin) ist ein guter Einstieg; die AHV Lissabon (Auslandsvertretung der Deutschen Botschaft) hilft mit deutschen Behördenfragen; und viele Rentner finden im Yoga-Studio, in Chorgemeinschaften oder bei organisierten Wanderungen schnell soziale Anschlüsse.`,
    contentEN: `Lisbon has developed into one of the most sought-after retirement destinations in Europe — for understandable reasons: the climate is mild and sunny without extreme heat, the city is safe, the healthcare system acceptable, and while the cost of living has risen, it remains affordable for a Western European standard compared to Germany.

The IFICI regime and pensions is a subject with nuanced rules. Pensions from Germany generally fall under the Germany-Portugal double taxation agreement (DBA). Taxation depends on the type of pension: statutory pensions (German Pension Insurance) are generally only taxed in the country of residence, Portugal, under the DBA — at the rates applicable there. Occupational pensions and civil service pensions may be treated differently. IFICI can apply to certain types of pension income, but not universally — individual tax advice is absolutely essential.

Health insurance in old age is the most important practical aspect. EU retirees with permanent residence in Portugal have access to the SNS (Serviço Nacional de Saúde) — the Portuguese national health service. The quality of care in Lisbon is good, though with sometimes longer waiting times for specialists. Those who need guaranteed timings supplement with private health insurance (Medis, Advance Care or Fidelidade offer rates for seniors from around €200-400 per month).

Care options in Portugal have improved in recent years but are significantly more expensive than in Germany if you don't use social benefits. Private care homes cost €2,000-4,000 per month; the state option is cheaper but has waiting lists. Those planning long-term should arrange their will and lasting power of attorney under German and/or Portuguese law — both can coexist.

The climate in winter is a real issue: Lisbon is milder than Germany, but not "always warm". Winters are wet — an average of 100-120 rainy days per year — and Lisbon's old buildings are often poorly insulated. Many retirees report feeling cold in apartments despite comparatively mild outdoor temperatures (10-15°C). Heating costs are real. Those who prioritise warmth above all should consider further south (Algarve).

Practical reference points for retirees in Lisbon: the senior network of Portugal Resident (English-language expat magazine) is a good starting point; the German Embassy in Lisbon helps with German administrative questions; and many retirees quickly find social connections at yoga studios, choral societies or organised hikes.`,
    sourceUrls: [
      'https://www.bmf.bund.de/bpse/portugiesische-republik',
      'https://www.sns.gov.pt',
      'https://www.portaldascomunidades.mne.gov.pt',
    ],
  },
  {
    section: 'for_tech_workers',
    titleDE: 'Lissabon als Tech-Hub',
    titleEN: 'Lisbon as a Tech Hub',
    contentDE: `Lissabon hat in den letzten Jahren einen realen Wandel zur europäischen Tech-Metropole vollzogen. Auslöser war der Web Summit — einer der größten Tech-Konferenzen der Welt — der 2016 von Dublin nach Lissabon zog und seitdem jährlich über 70.000 Teilnehmer anzieht. Drum herum hat sich ein Ökosystem entwickelt, das selbsttragend geworden ist: Startups, Scale-ups, Investorennetzwerke und internationale Tech-Unternehmen haben sich in Lissabon niedergelassen.

Die Tech-Community konzentriert sich räumlich in einigen Clustern: Startup Lisboa und Hub Criativo do Beato im Osten der Stadt sind die bekanntesten Inkubatoren; Parque das Nações beherbergt mehrere Unternehmenshauptsitze; und im gesamten Stadtbereich zwischen Príncipe Real, Mouraria und Intendente hat sich eine lebendige Co-Working- und Startup-Szene etabliert. Farfetch (Mode-Plattform), Unbabel (KI-Übersetzungen) und Talkdesk (SaaS) haben hier Entwicklerteams aufgebaut.

Das Gehaltsniveau für Tech-Worker in Lissabon liegt deutlich unter Berlin oder Amsterdam — das ist Vor- und Nachteil zugleich. Senior Software Engineers verdienen bei portugiesischen Unternehmen 45.000-70.000€ brutto jährlich; bei internationalen Unternehmen oder Remote-Positionen für ausländische Arbeitgeber können es 80.000-120.000€ sein. Wer Remote für ein ausländisches Unternehmen arbeitet und das IFICI-Regime nutzen kann, hat unter Umständen eine der attraktivsten Netto-Positionen in Europa — 20% Flat Tax plus SNS-Beitrag statt 42-48% in Deutschland.

Das Remote-Working-Setup in Lissabon ist praktisch hervorragend: Die Internetinfrastruktur ist gut (Glasfaser in den meisten Wohngebieten verfügbar, durchschnittliche Downloadgeschwindigkeit >200 Mbit/s), Co-Working-Spaces sind zahlreich und hochwertig, und die Zeitzone (MEZ-1 im Winter, MEZ im Sommer wegen Sommerzeit) ist kompatibel mit europäischen und US-Ost-Küsten-Teams.

IFICI-Eligibility für Tech-Berufe: Das Regime erfordert für Angestellte eine Tätigkeit bei einem als geeignet anerkannten Unternehmen oder in einem als Hochwerttätigkeit eingestuften Bereich. Für Remote-Worker, die für ausländische Unternehmen tätig sind und in Portugal ansässig werden, gibt es spezifische Regelungen — die Anerkennung ist nicht automatisch und muss beim AT beantragt werden. Tech-Berufe (Softwareentwicklung, Data Science, Cybersecurity, KI/ML) fallen typischerweise in die Qualifikationskategorien, aber die genaue Einordnung hängt vom individuellen Vertrag und Arbeitgeber ab.

Der Netzwerk-Aufbau geht in Lissabon für Tech-Worker oft schnell: MeetUp-Gruppen, Startup Lisboa Events und Web Summit Alumni-Netzwerke bieten regelmäßige Anknüpfungspunkte. Die Community ist international und Englisch ist die Lingua Franca im Tech-Bereich — Portugiesisch ist kein Eintrittskriterium, aber langfristig für vollständige Integration empfehlenswert.`,
    contentEN: `Lisbon has undergone a real transformation in recent years into a European tech metropolis. The catalyst was Web Summit — one of the world's largest tech conferences — which moved from Dublin to Lisbon in 2016 and has since attracted over 70,000 participants annually. Around it, an ecosystem has developed that has become self-sustaining: startups, scale-ups, investor networks and international tech companies have established themselves in Lisbon.

The tech community is spatially concentrated in several clusters: Startup Lisboa and Hub Criativo do Beato in the east of the city are the best-known incubators; Parque das Nações houses several company headquarters; and throughout the city between Príncipe Real, Mouraria and Intendente a vibrant co-working and startup scene has established itself. Farfetch (fashion platform), Unbabel (AI translation) and Talkdesk (SaaS) have built developer teams here.

Salary levels for tech workers in Lisbon are significantly below Berlin or Amsterdam — which is both an advantage and disadvantage. Senior Software Engineers earn €45,000-70,000 gross annually at Portuguese companies; at international companies or remote positions for foreign employers it can be €80,000-120,000. Those working remotely for a foreign company who can use the IFICI regime may have one of the most attractive net positions in Europe — 20% flat tax plus SNS contribution instead of 42-48% in Germany.

The remote working setup in Lisbon is practically excellent: internet infrastructure is good (fibre available in most residential areas, average download speed >200 Mbit/s), co-working spaces are numerous and high quality, and the timezone (CET-1 in winter, CET in summer due to daylight saving) is compatible with European and US East Coast teams.

IFICI eligibility for tech professions: the regime requires employees to work at a recognised company or in an area classified as a high-value activity. There are specific regulations for remote workers employed by foreign companies who become resident in Portugal — recognition is not automatic and must be applied for at the AT. Tech professions (software development, data science, cybersecurity, AI/ML) typically fall into the qualifying categories, but the exact classification depends on the individual contract and employer.

Network building goes quickly in Lisbon for tech workers: MeetUp groups, Startup Lisboa events and Web Summit alumni networks provide regular connection points. The community is international and English is the lingua franca in the tech sector — Portuguese is not an entry criterion, but is recommended for complete long-term integration.`,
    sourceUrls: [
      'https://websummit.com',
      'https://www.startuplisboa.com',
      'https://at.gov.pt/en/at/tax-information/personal-income-tax/ifici',
    ],
  },
];

// ─── 2.5  City Tools (config only — components implemented separately) ─────────

const TOOLS = [
  {
    toolType: 'first_month_budget',
    nameDE: 'Erstmonats-Budget-Rechner',
    nameEN: 'First Month Budget Calculator',
    descriptionDE: 'Schätzt dein Budget für den ersten Monat in Lissabon: Kaution, Möbel, Behördengebühren und mehr.',
    descriptionEN: 'Estimates your budget for the first month in Lisbon: deposit, furniture, admin fees and more.',
    config: {
      citySlug: 'lissabon',
      currency: 'EUR',
      defaults: {
        rent1BR: 1500,
        rent2BR: 2100,
        rent3BR: 3000,
        depositMonths: 2,
        agencyFeeMonths: 1,
        furnitureUnfurnished: 4000,
        furnitureSemiFurnished: 1500,
        furnitureFurnished: 0,
        nifFee: 0,
        snsFee: 0,
        bankAccountFee: 0,
        residencyRegistrationFee: 15,
        monthlyGroceries1Person: 300,
        monthlyGroceries2Person: 500,
        monthlyGroceries4Person: 750,
        transportMonthly: 40,
        internetSetup: 50,
        mobileMonthly: 20,
      },
      footnote: 'Werte basieren auf Idealista-Daten Q1 2026 und Community-Erfahrungsberichten. Kaution ist verhandelbar.',
    },
  },
  {
    toolType: 'visa_eligibility',
    nameDE: 'IFICI-Eligibility-Checker',
    nameEN: 'IFICI Eligibility Checker',
    descriptionDE: 'Prüft ob deine Situation für das IFICI-Steuerregime (ehemals NHR) in Frage kommt.',
    descriptionEN: 'Checks whether your situation qualifies for the IFICI tax regime (formerly NHR).',
    config: {
      citySlug: 'lissabon',
      regime: 'IFICI',
      disclaimer: 'Diese Einschätzung ist nicht verbindlich. Für einen IFICI-Antrag ist professionelle Steuerberatung unbedingt erforderlich.',
      disclaimerEN: 'This assessment is not binding. Professional tax advice is essential for an IFICI application.',
      questions: [
        {
          id: 'prior_pt_residency',
          questionDE: 'Warst du in den letzten 5 Jahren steuerlich in Portugal ansässig?',
          questionEN: 'Were you tax-resident in Portugal in the last 5 years?',
          type: 'boolean',
          disqualifyIf: true,
          messageDE: 'IFICI erfordert, dass du in den letzten 5 Jahren nicht in Portugal steuerpflichtig warst.',
          messageEN: 'IFICI requires that you have not been tax-resident in Portugal in the last 5 years.',
        },
        {
          id: 'income_type',
          questionDE: 'Was ist deine primäre Einkommensquelle?',
          questionEN: 'What is your primary income source?',
          type: 'select',
          options: [
            { value: 'employed_pt', labelDE: 'Angestellt bei portugiesischem Unternehmen', labelEN: 'Employed by Portuguese company' },
            { value: 'employed_foreign', labelDE: 'Remote-Angestellt bei ausländischem Unternehmen', labelEN: 'Remote-employed by foreign company' },
            { value: 'freelancer_pt', labelDE: 'Selbstständig mit PT-Kunden', labelEN: 'Self-employed with PT clients' },
            { value: 'freelancer_foreign', labelDE: 'Selbstständig mit ausländischen Kunden', labelEN: 'Self-employed with foreign clients' },
            { value: 'pension', labelDE: 'Rente / Pension', labelEN: 'Pension / Retirement income' },
            { value: 'investment', labelDE: 'Kapitalerträge / Investitionen', labelEN: 'Capital gains / Investments' },
          ],
        },
        {
          id: 'high_value_activity',
          questionDE: 'Arbeitest du in einem der IFICI-qualifizierenden Bereiche (Tech, Wissenschaft, kreative Wirtschaft)?',
          questionEN: 'Do you work in one of the IFICI-qualifying areas (tech, science, creative industries)?',
          type: 'boolean',
        },
      ],
      resultLogic: 'see IFICIEligibilityChecker component',
    },
  },
];

// ─── 2.6  Resources ───────────────────────────────────────────────────────────

const RESOURCES = [
  {
    resourceType: 'checklist',
    titleDE: 'Erste 90 Tage in Lissabon',
    titleEN: 'First 90 Days in Lisbon',
    descriptionDE: 'Interaktive Checkliste aller wichtigen Schritte nach dem Umzug nach Lissabon.',
    descriptionEN: 'Interactive checklist of all important steps after moving to Lisbon.',
    content: {
      sections: [
        {
          titleDE: 'Woche 1-2: Unmittelbar nach Ankunft',
          titleEN: 'Week 1-2: Immediately after arrival',
          items: [
            { de: 'NIF (Steueridentifikationsnummer) beantragen — Finanzamt oder beim Steuerberater', en: 'Apply for NIF (tax identification number) — tax office or via tax advisor' },
            { de: 'Vorläufige Unterkunft sichern (AirBnB/Hotel für erste 4-6 Wochen)', en: 'Secure temporary accommodation (AirBnB/hotel for first 4-6 weeks)' },
            { de: 'Portugiesische SIM-Karte besorgen (MEO, NOS, Vodafone)', en: 'Get a Portuguese SIM card (MEO, NOS, Vodafone)' },
            { de: 'Bankkonto eröffnen (Millennium BCP, BPI oder Revolut/Wise als Zwischenlösung)', en: 'Open a bank account (Millennium BCP, BPI or Revolut/Wise as interim solution)' },
          ],
        },
        {
          titleDE: 'Woche 3-6: Wohnen & Meldung',
          titleEN: 'Week 3-6: Housing & Registration',
          items: [
            { de: 'Langzeitwohnung suchen (Idealista, Imovirtual, lokale Makler)', en: 'Search for long-term apartment (Idealista, Imovirtual, local agents)' },
            { de: 'Mietvertrag prüfen lassen (Rechtsanwalt empfohlen)', en: 'Have rental contract reviewed (lawyer recommended)' },
            { de: 'Ato de Residência — Anmeldung bei der Junta de Freguesia (Gemeindeamt)', en: 'Ato de Residência — register at the Junta de Freguesia (district office)' },
            { de: 'Aufenthaltstitel-Antrag stellen (AIMA — Agência para a Integração, Migrações e Asilo)', en: 'Apply for residence permit (AIMA — Agency for Integration, Migration and Asylum)' },
          ],
        },
        {
          titleDE: 'Monat 2-3: Gesundheit & Alltag',
          titleEN: 'Month 2-3: Health & Everyday Life',
          items: [
            { de: 'SNS-Registrierung — Hausarzt zuweisen lassen (Centro de Saúde)', en: 'SNS registration — get assigned a family doctor (Centro de Saúde)' },
            { de: 'Private Krankenversicherung prüfen (falls SNS-Wartezeiten problematisch)', en: 'Check private health insurance (if SNS waiting times are problematic)' },
            { de: 'Steuererklärung-Setup: Steuerberater für IFICI-Antrag kontaktieren', en: 'Tax return setup: contact tax advisor for IFICI application' },
            { de: 'Portugiesisch-Kurs beginnen (Cervantes, CAPLE oder Volkshochschul-Äquivalente)', en: 'Start Portuguese course (Cervantes, CAPLE or equivalent adult education)' },
            { de: 'Expat-Community: Portugal.resident.com, InterNations Lissabon, Meetup-Gruppen', en: 'Expat community: Portugal.resident.com, InterNations Lisbon, Meetup groups' },
          ],
        },
      ],
    },
  },
  {
    resourceType: 'glossary',
    titleDE: 'Wichtige portugiesische Behördenbegriffe',
    titleEN: 'Important Portuguese Administrative Terms',
    descriptionDE: 'Deutsch-Englisch-Portugiesisch Glossar der häufigsten Behördenbegriffe in Lissabon.',
    descriptionEN: 'German-English-Portuguese glossary of the most common administrative terms in Lisbon.',
    content: {
      entries: [
        { de: 'Steueridentifikationsnummer', en: 'Tax Identification Number', pt: 'NIF (Número de Identificação Fiscal)', note: 'Erste Amtshandlung — ohne NIF läuft nichts' },
        { de: 'Aufenthaltstitel', en: 'Residence Permit', pt: 'Autorização de Residência', note: 'Ausgestellt durch AIMA (früher SEF)' },
        { de: 'Anmeldung beim Gemeindeamt', en: 'Registration at district office', pt: 'Ato de Residência na Junta de Freguesia', note: 'Erforderlich für Aufenthaltstitel-Antrag' },
        { de: 'Nationalgesundheitsdienst', en: 'National Health Service', pt: 'SNS (Serviço Nacional de Saúde)', note: 'Kostenlos nach Registrierung mit NIF' },
        { de: 'Selbstständigen-Rechnung', en: 'Freelance Invoice', pt: 'Recibo Verde', note: 'Ausstellung über Portal das Finanças' },
        { de: 'Finanzbehörde', en: 'Tax Authority', pt: 'AT (Autoridade Tributária e Aduaneira)', note: 'Auch "Portal das Finanças" für Online-Services' },
        { de: 'Mietvertrag', en: 'Rental Contract', pt: 'Contrato de Arrendamento', note: 'Immer schriftlich, Laufzeit min. 1 Jahr' },
        { de: 'Energiezertifikat', en: 'Energy Certificate', pt: 'Certificado Energético', note: 'Pflicht bei Wohnungsvermietung' },
        { de: 'Gemeinderat', en: 'Municipal Council', pt: 'Câmara Municipal', note: 'Übergeordnete Verwaltungsebene zur Junta' },
        { de: 'Migrationsbehörde', en: 'Migration Authority', pt: 'AIMA (Agência para a Integração, Migrações e Asilo)', note: 'Seit 2023 Nachfolger von SEF' },
      ],
    },
  },
  {
    resourceType: 'template',
    titleDE: 'Wohnungsbesichtigungs-Checkliste Lissabon',
    titleEN: 'Apartment Viewing Checklist Lisbon',
    descriptionDE: 'Was du bei jeder Wohnungsbesichtigung prüfen und fragen solltest.',
    descriptionEN: 'What to check and ask at every apartment viewing.',
    content: {
      sections: [
        {
          titleDE: 'Zustand der Wohnung',
          titleEN: 'Condition of the apartment',
          items: [
            { de: 'Wasserflecken / Schimmelspuren (besonders Badezimmer, Außenwände)', en: 'Water stains / mould (especially bathroom, exterior walls)' },
            { de: 'Fensterqualität (Einfach- oder Doppelverglasung? Wichtig für Lärm und Wärme)', en: 'Window quality (single or double glazing? Important for noise and heat)' },
            { de: 'Heizung vorhanden? Art der Heizung (Klimaanlage mit Heizfunktion, Gasheizung, elektrisch)', en: 'Heating available? Type (A/C with heating, gas, electric)' },
            { de: 'Warmwasser: Boiler oder Durchlauferhitzer? Wie schnell kommt Warmwasser?', en: 'Hot water: boiler or instantaneous? How quickly does hot water come?' },
            { de: 'Internetvorbereitung: Glasfaser-Anschluss vorhanden? (MEO/NOS Freiheit)', en: 'Internet preparation: fibre connection available? (MEO/NOS freedom)' },
          ],
        },
        {
          titleDE: 'Rechtliches & Kosten',
          titleEN: 'Legal & Costs',
          items: [
            { de: 'Mietdauer: Mindestlaufzeit, Kündigungsfristen (AT-Standard: 1 Jahr, 2 Monate Kündigung)', en: 'Rental duration: minimum term, notice periods (AT standard: 1 year, 2 months notice)' },
            { de: 'Kaution: Wie viele Monatsmieten? (Standard: 1-2, mehr ist ungewöhnlich)', en: 'Deposit: how many months? (Standard: 1-2, more is unusual)' },
            { de: 'Maklerprovision: Wer zahlt? (Seit 2019 gesetzlich Mieter-Schutz — max. 1 Monatsmiete)', en: 'Agency fee: who pays? (Since 2019 tenant protection — max. 1 month rent)' },
            { de: 'Nebenkosten: Was ist inklusive? (Condomínio/Hausgeld separat?)', en: 'Utilities: what is included? (Condomínio/service charge separate?)' },
            { de: 'Untervermietung erlaubt? (Relevant für AirBnB/Zwischenmiete bei Reisen)', en: 'Subletting allowed? (Relevant for AirBnB/subletting during travel)' },
          ],
        },
      ],
    },
  },
  {
    resourceType: 'template',
    titleDE: 'NIF-Beantragungsschreiben (Vorlage)',
    titleEN: 'NIF Application Letter (Template)',
    descriptionDE: 'Vorlage für das Anschreiben zur NIF-Beantragung beim Finanzamt, falls kein Steuerberater eingeschaltet wird.',
    descriptionEN: 'Template letter for applying for a NIF at the tax office if no tax advisor is engaged.',
    content: {
      template: {
        de: 'Exma. Sra./Sr.,\n\nVenho por este meio solicitar a atribuição do número de identificação fiscal (NIF), na qualidade de cidadão/ã [Nationalität], residente em Portugal desde [Datum].\n\nJunto os seguintes documentos: Passaporte (cópia), Comprovativo de morada em Portugal.\n\nAgradeço a atenção dispensada.\nCom os melhores cumprimentos,\n[Vollständiger Name]\n[Datum]',
        en: 'Dear Sir/Madam,\n\nI hereby request the assignment of a tax identification number (NIF), as a citizen of [Nationality], resident in Portugal since [Date].\n\nI enclose the following documents: Passport (copy), Proof of address in Portugal.\n\nThank you for your attention.\nYours sincerely,\n[Full Name]\n[Date]',
      },
      note: 'Wer einen Steuerberater hat, braucht diesen Brief nicht — der Berater erledigt den NIF-Antrag vollständig. Für Selbstantragsteller: persönlich beim nächsten Finanças-Amt erscheinen.',
    },
  },
  {
    resourceType: 'directory',
    titleDE: 'Deutschsprachige Anlaufstellen in Lissabon',
    titleEN: 'German-speaking contacts in Lisbon',
    descriptionDE: 'Kuratierte Liste deutschsprachiger Dienstleister und Anlaufstellen für Auswanderer in Lissabon.',
    descriptionEN: 'Curated list of German-speaking service providers and contact points for expats in Lisbon.',
    content: {
      entries: [
        { category: 'Behörde', categoryEN: 'Authority', name: 'Deutsche Botschaft Lissabon', description: 'Konsularische Dienstleistungen für deutsche Staatsbürger', url: 'https://lissabon.diplo.de', address: 'Campo dos Mártires da Pátria 38, 1169-043 Lisboa' },
        { category: 'Steuer', categoryEN: 'Tax', name: 'KPMG Portugal', description: 'Internationale Steuerberatung mit deutschsprachigen Ansprechpartnern', url: 'https://home.kpmg/pt/pt/home.html', note: 'Auf Deutschsprachigkeit bei Kontaktaufnahme hinweisen' },
        { category: 'Recht', categoryEN: 'Legal', name: 'Cuatrecasas Portugal', description: 'Internationale Anwaltskanzlei mit Portuguese und German-Speaking Lawyers', url: 'https://www.cuatrecasas.com/pt-pt', note: 'Spezialisiert auf Expat-Residenz und Immobilientransaktionen' },
        { category: 'Community', categoryEN: 'Community', name: 'Deutsche Community Lissabon (Facebook)', description: 'Aktive Facebook-Gruppe für deutschsprachige Expats in Lissabon', url: 'https://www.facebook.com/groups/deutschelissabon', note: 'Ca. 8.000 Mitglieder, aktive Diskussionen zu Wohnen, Behörden, Jobs' },
        { category: 'Schule', categoryEN: 'School', name: 'Deutsche Schule Lissabon', description: 'Deutsche Auslandsschule Klasse 1-12, DSD, Abitur', url: 'https://www.dslissabon.com', address: 'Rua António Maria Cardoso 5, 2775-432 Carcavelos' },
      ],
    },
  },
];

// ─── 2.7  Testimonials ────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    authorName: 'Anna K.',
    authorAge: 34,
    authorProfession: 'Software Engineer',
    authorPersona: 'employed',
    yearMoved: 2023,
    isVerified: false,
    rating: 4,
    contentDE: `Ich bin 2023 als Remote-Software-Engineerin nach Lissabon gezogen, nach zwei Jahren in Berlin. Die Entscheidung war primär steuerlich motiviert — IFICI (damals noch NHR) — aber geblieben bin ich wegen der Lebensqualität.

Das erste Jahr war herausfordernd. Die Wohnungssuche hat drei Monate gedauert, obwohl ich gute Kontakte hatte. Ich habe am Ende eine Wohnung in Alvalade gefunden — 65 Quadratmeter, 1.400€ kalt. In Berlin hätte ich dafür vielleicht 1.200€ gezahlt, aber das Zimmer wäre kleiner gewesen und das Licht schlechter.

Das IFICI-Setup hat gut funktioniert, aber ich hatte einen sehr guten Steuerberater. Die erste Steuererklärung war komplex — ausländische Einkünfte, IFICI-Antrag, Recibos Verdes — und ich wäre ohne Hilfe nicht durchgekommen. Die Steuerersparnis ist real: Ich zahle deutlich weniger als ich in Deutschland gezahlt hätte, selbst mit dem höheren Mietniveau.

Was ich nicht erwartet hatte: Wie gut die Community ist. Lissabon hat eine kritische Masse an deutschen Expats, und das Netzwerk ist warm und hilfsbereit. Ich habe hier Freundschaften geschlossen, die ich in Berlin in der Zeit nicht geschlossen hätte.

Was ich unterschätzt hatte: Den Winter. Meine Wohnung ist schlecht isoliert. Von Dezember bis März ist es in der Wohnung kalt — kälter als man denkt, wenn man "Lissabon im Winter" googelt. Heizung ist Pflicht, und Heizkosten sind real.

Würde ich es wieder tun? Ja, ohne Zögern. Aber mit einem Monat mehr Zeit für die Wohnungssuche und einem Steuerberater von Tag 1.`,
    contentEN: `I moved to Lisbon as a remote software engineer in 2023, after two years in Berlin. The decision was primarily tax-motivated — IFICI (then still called NHR) — but I stayed for the quality of life.

The first year was challenging. The apartment search took three months, even though I had good contacts. I ended up finding an apartment in Alvalade — 65 square metres, €1,400 cold. In Berlin I might have paid €1,200 for that, but the room would have been smaller and the light worse.

The IFICI setup worked well, but I had a very good tax advisor. The first tax return was complex — foreign income, IFICI application, Recibos Verdes — and I wouldn't have managed without help. The tax savings are real: I pay significantly less than I would have in Germany, even accounting for the higher rent level.

What I didn't expect: how good the community is. Lisbon has a critical mass of German expats, and the network is warm and helpful. I've made friendships here that I wouldn't have made in Berlin in the same time.

What I underestimated: the winter. My apartment is poorly insulated. From December to March it's cold inside — colder than you'd think when you google "Lisbon in winter". Heating is a must, and heating costs are real.

Would I do it again? Yes, without hesitation. But with one more month for the apartment search and a tax advisor from day one.`,
  },
  {
    authorName: 'Markus & Lena B.',
    authorAge: 41,
    authorProfession: 'Unternehmer / Lehrerin',
    authorPersona: 'family',
    yearMoved: 2022,
    isVerified: false,
    rating: 4,
    contentDE: `Wir sind 2022 mit unseren zwei Kindern (damals 9 und 12) nach Cascais gezogen — einer kleinen Stadt 30 Kilometer westlich von Lissabon. Cascais ist streng genommen nicht Lissabon, aber für Familien mit Schulkindern an der Deutschen Schule ist es der optimale Kompromiss: Stranddorf-Feeling, exzellente Infrastruktur, und 10 Minuten von der DSL entfernt.

Die Schule war der organisatorische Hauptfaktor. Wir haben uns 18 Monate vor dem Umzug angemeldet — und trotzdem war es knapp. Wartelisten sind real. Ich kann nur empfehlen: So früh wie möglich anmelden, auch wenn der Umzug noch nicht sicher ist. Eine Absage ist immer noch möglich, aber die Anmeldung kostet nichts.

Das Familienleben hier ist anders als in Deutschland — mehr draußen, mehr Spontaneität. Die Kinder sind schnell integriert, auch sprachlich. Mein Sohn (jetzt 14) spricht fließend Portugiesisch, meine Tochter (jetzt 11) ist auf gutem Weg. Die Schule hilft mit Sprachkursen.

Was wir unterschätzt hatten: Die Wohnkosten in Cascais. 2022 war es noch vernünftiger — wir zahlen 2.400€ für ein Haus mit Garten. Für neue Mieter sind ähnliche Objekte jetzt 3.000-3.500€. Die Preissteigerung ist erheblich.

Was uns am meisten überrascht hat: Die medizinische Versorgung ist besser als erwartet. Wir haben private Krankenversicherung (Medis, ca. 350€ monatlich für 4 Personen), und die Wartezeiten bei Spezialisten sind akzeptabel. Das SNS nutzen wir für Notfälle und den Hausarzt.

Die bürokratischen Hürden waren real aber lösbar. Mit einem guten Steuerberater und einem Anwalt für den Mietvertrag hat es funktioniert. Gesamtkosten für die Ersteinrichtung (inkl. Anwalt, Steuerberater, erste Monate): etwa 8.000-10.000€. Das sollte man einplanen.`,
    contentEN: `We moved to Cascais with our two children (then aged 9 and 12) in 2022 — a small town 30 kilometres west of Lisbon. Cascais is strictly speaking not Lisbon, but for families with school-age children at the German School it's the optimal compromise: beach village feel, excellent infrastructure, and 10 minutes from the DSL.

The school was the main organisational factor. We registered 18 months before the move — and it was still close. Waiting lists are real. My only advice: register as early as possible, even if the move isn't yet certain. Rejection is still possible, but registration costs nothing.

Family life here is different from Germany — more outdoors, more spontaneity. The children integrated quickly, including linguistically. My son (now 14) speaks fluent Portuguese, my daughter (now 11) is on track. The school helps with language courses.

What we underestimated: housing costs in Cascais. In 2022 it was still reasonable — we pay €2,400 for a house with a garden. Similar properties for new tenants are now €3,000-3,500. The price increase has been significant.

What surprised us most: the medical care is better than expected. We have private health insurance (Medis, about €350 per month for 4 people), and waiting times for specialists are acceptable. We use the SNS for emergencies and the family doctor.

The bureaucratic hurdles were real but solvable. With a good tax advisor and a lawyer for the rental contract, it worked. Total costs for the initial setup (including lawyer, tax advisor, first months): around €8,000-10,000. That should be planned for.`,
  },
  {
    authorName: 'Robert H.',
    authorAge: 58,
    authorProfession: 'Frührentner (ehemals Ingenieur)',
    authorPersona: 'retiree',
    yearMoved: 2024,
    isVerified: false,
    rating: 5,
    contentDE: `Ich bin 2024 nach Lissabon gegangen — Frührentner mit 58, nach 30 Jahren im Ingenieurswesen. Die Entscheidung war klar: Ich wollte noch jung genug sein, um die Stadt wirklich zu erleben, und nicht warten bis ich 65 bin.

Die steuerliche Situation hat mich zunächst verwirrt. Meine Deutsche Rentenversicherungs-Rente wird laut DBA in Portugal besteuert — zu niedrigeren Sätzen als in Deutschland. Das IFICI-Regime gilt für meine Situation teilweise nicht (gesetzliche Rente ist anders geregelt als Kapitalerträge). Mein Steuerberater hat das geklärt. Unterm Strich zahle ich weniger als in Deutschland.

Ich lebe in Estrela — ruhig, grün, gute Verbindung zum Tejo. Wohnung: 85 Quadratmeter, 1.800€. Das ist teuer, aber ich zahle in Berlin dasselbe und habe dort weniger Sonne.

Das Gesundheitssystem: Ich habe mich beim SNS registriert und habe einen Hausarzt. Für geplante Arztbesuche nutze ich zusätzlich Médis (private Versicherung, 280€ monatlich) — die Wartezeiten sind kürzer und ich kann auf Englisch oder mit Übersetzungshilfe kommunizieren.

Was ich jedem Rentner empfehle: Die ersten sechs Monate sind bürokratisch intensiv. Danach wird es sehr entspannt. Lissabon hat eine aktive Rentner-Community — ich habe über InterNations und eine Wandergruppe schnell Anschluss gefunden.

Ein ehrlicher Hinweis: Lissabon ist nicht mehr günstig. Wer mit 1.500€ Rente nach Lissabon möchte und komfortabel leben will, wird enttäuscht sein. Mit 2.500€ aufwärts wird es realistisch.`,
    contentEN: `I went to Lisbon in 2024 — early retiree at 58, after 30 years in engineering. The decision was clear: I wanted to be young enough to really experience the city, and not wait until I'm 65.

The tax situation initially confused me. My German state pension is taxed in Portugal according to the DBA — at lower rates than in Germany. The IFICI regime doesn't fully apply to my situation (state pensions are regulated differently from capital gains). My tax advisor clarified this. Overall I pay less than I would in Germany.

I live in Estrela — quiet, green, good connection to the Tagus. Apartment: 85 square metres, €1,800. That's expensive, but I pay the same in Berlin and get less sunshine there.

The health system: I registered with the SNS and have a family doctor. For planned medical visits I additionally use Médis (private insurance, €280 per month) — waiting times are shorter and I can communicate in English or with translation support.

What I recommend to every retiree: the first six months are bureaucratically intensive. After that it becomes very relaxed. Lisbon has an active retiree community — I quickly found connections through InterNations and a hiking group.

An honest note: Lisbon is no longer cheap. Those wanting to come to Lisbon with a €1,500 pension and live comfortably will be disappointed. From €2,500 upwards it becomes realistic.`,
  },
];

// ─── Exported seed function ───────────────────────────────────────────────────

export async function seedLissabon(): Promise<void> {
  console.log('🌍 Seeding Lissabon premium content...\n');

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

  console.log('\n✅ Lissabon premium seed complete.');
  console.log(`   Districts: ${DISTRICTS.length}`);
  console.log(`   CoL entries: ${DISTRICTS.reduce((s, d) => s + d.col.length, 0)}`);
  console.log(`   Narratives: ${NARRATIVES.length}`);
  console.log(`   Tools: ${TOOLS.length}`);
  console.log(`   Resources: ${RESOURCES.length}`);
  console.log(`   Testimonials: ${TESTIMONIALS.length}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌍 Seeding Lissabon premium content...\n');

  // ── Districts + CoL ──────────────────────────────────────────────────────────
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

  // ── Narratives ───────────────────────────────────────────────────────────────
  console.log('\n📝 Creating narratives...');
  for (const n of NARRATIVES) {
    await prisma.cityNarrative.upsert({
      where: { cityId_section: { cityId: CITY_ID, section: n.section } },
      update: { ...n, updatedAt: NOW, lastVerified: NOW },
      create: { ...n, cityId: CITY_ID, lastVerified: NOW },
    });
    console.log(`  ✓ ${n.section} (${n.contentDE.length} chars DE)`);
  }

  // ── Tools ────────────────────────────────────────────────────────────────────
  console.log('\n🔧 Creating tools...');
  for (const t of TOOLS) {
    await prisma.cityTool.upsert({
      where: { cityId_toolType: { cityId: CITY_ID, toolType: t.toolType } },
      update: { ...t, updatedAt: NOW },
      create: { ...t, cityId: CITY_ID },
    });
    console.log(`  ✓ ${t.toolType}`);
  }

  // ── Resources ────────────────────────────────────────────────────────────────
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

  // ── Testimonials ─────────────────────────────────────────────────────────────
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

  console.log('\n✅ Lissabon premium seed complete.');
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
