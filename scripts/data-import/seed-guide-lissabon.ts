import { prisma } from './_lib/prisma';

const LAST_VERIFIED = new Date('2026-05-22');
const CITY_SLUG    = 'lissabon';
const DRY_RUN      = process.argv.includes('--dry-run');

// ─── Types ────────────────────────────────────────────────────────────────────

interface StepInput {
  stepOrder:           number;
  section:             string;
  phase:               string;
  titleDE:             string;
  titleEN:             string;
  subtitleDE?:         string;
  subtitleEN?:         string;
  timingDE:            string;
  timingEN:            string;
  isWarning?:          boolean;
  documents?:          string[];
  infoBoxDE?:          string;
  infoBoxEN?:          string;
  infoBoxType?:        string;
  tags?:               string[];
  forEmployed?:        boolean;
  forFreelancer?:      boolean;
  forFounder?:         boolean;
  forFamily?:          boolean;
  forPassive?:         boolean;
  forPair?:            boolean;
  riskLevel?:          string;
  requiresLegalAdvice?: boolean;
  sourceUrl?:          string;
  sourceLabel?:        string;
  translationSource?:  string;
}

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS: StepInput[] = [

  // ── BUREAUCRACY ─────────────────────────────────────────────────────────────

  {
    stepOrder: 1, section: 'bureaucracy', phase: 'Bürokratie',
    titleDE: 'Abmeldung in Deutschland',
    titleEN: 'Deregister in Germany',
    subtitleDE: 'Wohnsitz beim Einwohnermeldeamt abmelden',
    subtitleEN: 'Deregister your address at the local registration office',
    timingDE: '4–8 Wochen vor Abreise',
    timingEN: '4–8 weeks before departure',
    documents: ['Personalausweis oder Reisepass', 'Abmeldeformular (Wohnungsgeberbestätigung nicht nötig)'],
    infoBoxDE: 'Nach der Abmeldung bist du in Deutschland nicht mehr melderechtlich erfasst. Wichtig: Die Abmeldung beendet nicht automatisch die steuerliche Ansässigkeit — dafür muss auch der Lebensmittelpunkt verlagert werden. Bewahre die Abmeldebestätigung auf, sie wird häufig von portugiesischen Behörden und Banken verlangt.',
    infoBoxEN: 'Deregistering removes you from German population records. Important: deregistering does not automatically end German tax residency — you must also shift your centre of life. Keep the deregistration certificate; Portuguese authorities and banks often request it.',
    infoBoxType: 'info',
    tags: ['abmeldung', 'deutschland', 'pflicht'],
    riskLevel: 'low', translationSource: 'manual',
    forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true, forPassive: true, forPair: true,
  },

  {
    stepOrder: 2, section: 'bureaucracy', phase: 'Bürokratie',
    titleDE: 'NIF beantragen — Portugiesische Steuer-ID',
    titleEN: 'Apply for NIF — Portuguese Tax ID',
    subtitleDE: 'Número de Identificação Fiscal: Voraussetzung für fast alles',
    subtitleEN: 'Required for banking, renting, employment and tax filing',
    timingDE: 'So früh wie möglich — idealerweise vor der Abmeldung in DE',
    timingEN: 'As early as possible — ideally before deregistering in Germany',
    documents: ['Reisepass oder EU-Personalausweis', 'Wohnsitznachweis (Mietvertrag, Adressbescheinigung)', 'ggf. Vollmacht für Fiskalvertreter (bei Beantragung ohne PT-Adresse)'],
    infoBoxDE: 'Der NIF ist Voraussetzung für Bankkonto, Mietvertrag, Krankenversicherung, Arbeitsverhältnis und Steuererklärung. Als EU-Bürger kannst du ihn kostenlos persönlich bei einem Finanças-Amt (Serviço de Finanças) oder in einer Loja do Cidadão beantragen. Wenn du noch keine portugiesische Adresse hast, ist ein Fiskalvertreter (representante fiscal) vorgeschrieben — du kannst diese Pflicht aufheben, sobald du eine PT-Adresse nachweist. Seit März 2025 gibt es in einigen Loja-do-Cidadão-Standorten einen kombinierten Schalter für NIF + NISS + SNS in einem Besuch.',
    infoBoxEN: 'The NIF is required for a bank account, rental contract, health insurance, employment and tax returns. As an EU citizen you can apply for free in person at any Finanças office or Loja do Cidadão. Without a Portuguese address a fiscal representative is mandatory — this requirement can be lifted once you provide a PT address. Since March 2025 some Loja do Cidadão locations offer a combined one-visit desk for NIF + NISS + SNS.',
    infoBoxType: 'info',
    tags: ['nif', 'steuernummer', 'pflicht'],
    riskLevel: 'low',
    sourceUrl: 'https://info.portaldasfinancas.gov.pt/en/tax-information/getting-started-in-portugal/tax-identification-number/apply-for-your-nif/Pages/default.aspx',
    sourceLabel: 'Portal das Finanças — NIF für Ausländer (EN)',
    translationSource: 'manual',
    forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true, forPassive: true, forPair: true,
  },

  {
    stepOrder: 3, section: 'bureaucracy', phase: 'Bürokratie',
    titleDE: 'CRUE — Anmeldung als EU-Bürger bei der Gemeinde',
    titleEN: 'CRUE — Register as EU citizen at the municipality',
    subtitleDE: 'Certificado de Registo de Cidadão da União Europeia',
    subtitleEN: 'Certificate of Registration for EU Citizens',
    timingDE: 'Innerhalb von 30 Tagen nach Ablauf der ersten 3 Monate',
    timingEN: 'Within 30 days after the first 3-month free-movement period ends',
    documents: ['EU-Personalausweis oder Reisepass', 'Wohnsitznachweis (Mietvertrag oder Atestado de Residência)', 'Nachweis der Lebensgrundlage (Arbeitsvertrag, Gewerbeschein oder Nachweis ausreichender Mittel)', 'Gebühr: €15'],
    infoBoxDE: 'Seit Oktober 2023 ist die frühere Ausländerbehörde SEF aufgelöst. Für EU-Bürger ist die Câmara Municipal (Gemeindeverwaltung) am Wohnort für das CRUE zuständig — nicht AIMA. Das CRUE ist nicht dasselbe wie ein Visum; es bestätigt dein EU-Aufenthaltsrecht. Wichtig: Anträge müssen seit April 2025 vollständig eingereicht werden — Nachlieferung von Dokumenten ist nicht mehr möglich. Nach 5 Jahren kannst du eine Daueraufenthaltsgenehmigung beantragen.',
    infoBoxEN: 'Since October 2023 the former foreigners authority SEF has been dissolved. For EU citizens the Câmara Municipal (municipality) at your place of residence handles CRUE applications — not AIMA. The CRUE is not a visa; it confirms your EU right of residence. Since April 2025 applications must be submitted complete from the outset — supplementary document submission is no longer accepted. After 5 years you can apply for permanent residence.',
    infoBoxType: 'info',
    tags: ['crue', 'aufenthaltsrecht', 'eu-bürger'],
    riskLevel: 'low',
    sourceUrl: 'https://aima.gov.pt/pt/nacionais-ue-e-familiares/nacionais-ue/certificado-de-registo-para-nacionais-ue',
    sourceLabel: 'AIMA — CRUE für EU-Bürger',
    translationSource: 'manual',
    forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true, forPassive: true, forPair: true,
  },

  {
    stepOrder: 4, section: 'bureaucracy', phase: 'Bürokratie',
    titleDE: 'Junta de Freguesia — Atestado de Residência',
    titleEN: 'Parish council — Proof of residence certificate',
    subtitleDE: 'Lokale Wohnsitzbescheinigung für Behörden und Vermieter',
    subtitleEN: 'Local certificate used by authorities and landlords',
    timingDE: 'Nach Mietvertragsabschluss, parallel zu NIF-Beantragung',
    timingEN: 'After signing rental contract, alongside NIF application',
    documents: ['Personalausweis oder Reisepass', 'Mietvertrag oder Eigentumsnachweis'],
    infoBoxDE: 'Das Atestado de Residência ist eine Bescheinigung der lokalen Junta de Freguesia (Bezirksverwaltung), dass du an der angegebenen Adresse wohnst. Es wird für NIF-Beantragung, CRUE und SNS-Registrierung akzeptiert. Kostenlos, sofort ausgestellt. Die Junta des Bezirks findet sich über die Suche bei juntasdefreguesias.pt.',
    infoBoxEN: 'The Atestado de Residência is a certificate from the local Junta de Freguesia (parish council) confirming your address. It is accepted for NIF applications, CRUE and SNS registration. Free and issued on the spot. Find your local Junta at juntasdefreguesias.pt.',
    infoBoxType: 'info',
    tags: ['wohnortnachweis', 'junta', 'bescheinigung'],
    riskLevel: 'low', translationSource: 'manual',
    forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true, forPassive: true, forPair: true,
  },

  {
    stepOrder: 5, section: 'bureaucracy', phase: 'Bürokratie',
    titleDE: 'NISS — Sozialversicherungsnummer beantragen',
    titleEN: 'NISS — Apply for social security number',
    subtitleDE: 'Número de Identificação da Segurança Social',
    subtitleEN: 'Required before starting employment or self-employment',
    timingDE: 'Vor Arbeitsbeginn oder Gewerbanmeldung, nach NIF',
    timingEN: 'Before starting work or registering self-employment, after NIF',
    documents: ['Personalausweis oder Reisepass', 'NIF', 'Wohnsitznachweis (CRUE oder Atestado de Residência)', 'Mietvertrag'],
    infoBoxDE: 'Die NISS (Sozialversicherungsnummer) ist Voraussetzung für Arbeitsverhältnisse und selbstständige Tätigkeit in Portugal. Beantragung kostenlos beim Instituto de Segurança Social (ISS) oder ebenfalls seit März 2025 in einem kombinierten Schalter an Loja do Cidadão-Standorten. Für Angestellte muss der Arbeitgeber die NISS-Anmeldung ergänzen; Selbstständige melden sich über das Finanças-Portal an.',
    infoBoxEN: 'The NISS (social security number) is required for employment and self-employment in Portugal. Free to obtain at Instituto de Segurança Social (ISS) or, since March 2025, at a combined Loja do Cidadão desk. For employees the employer completes the NISS registration; self-employed persons register via the Finanças portal.',
    infoBoxType: 'info',
    tags: ['niss', 'sozialversicherung', 'arbeit'],
    riskLevel: 'low', translationSource: 'manual',
    forEmployed: true, forFreelancer: true, forFounder: true, forFamily: false, forPassive: false, forPair: true,
  },

  {
    stepOrder: 6, section: 'bureaucracy', phase: 'Bürokratie',
    titleDE: 'SNS-Registrierung — Zugang zum Gesundheitssystem',
    titleEN: 'SNS registration — Access to public healthcare',
    subtitleDE: 'Utente-Nummer beim Serviço Nacional de Saúde beantragen',
    subtitleEN: 'Obtain your patient number with the National Health Service',
    timingDE: 'Nach NIF + CRUE, möglichst in der ersten Woche',
    timingEN: 'After NIF + CRUE, ideally in the first week',
    documents: ['Personalausweis oder Reisepass', 'NIF', 'CRUE', 'Wohnsitznachweis', 'Portugiesische Mobilnummer', 'NISS (empfohlen, aber nicht immer erforderlich)'],
    infoBoxDE: 'Reihenfolge beachten: NIF → CRUE → NISS → SNS. Das SNS ist für in Portugal gemeldete EU-Bürger kostenlos zugänglich (geringe Zuzahlungen bei manchen Leistungen). Beantragung persönlich beim zuständigen Centro de Saúde für deine Adresse. Das richtige Zentrum findest du unter sns.gov.pt. Wartezeit für Registrierung: meist am selben Tag; für den ersten Arzttermin: einige Wochen.',
    infoBoxEN: 'Sequence matters: NIF → CRUE → NISS → SNS. The SNS is free for registered EU residents (small co-payments for some services). Register in person at the Centro de Saúde covering your address. Find the right centre at sns.gov.pt. Registration is usually same-day; first GP appointment may take several weeks.',
    infoBoxType: 'info',
    tags: ['sns', 'krankenversicherung', 'gesundheit'],
    riskLevel: 'low',
    sourceUrl: 'https://www.sns.gov.pt/',
    sourceLabel: 'SNS Portugal — Serviço Nacional de Saúde',
    translationSource: 'manual',
    forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true, forPassive: true, forPair: true,
  },

  {
    stepOrder: 7, section: 'bureaucracy', phase: 'Bürokratie',
    titleDE: 'Daueraufenthalt und Staatsbürgerschaft (Langfristig)',
    titleEN: 'Permanent residence and citizenship (long term)',
    subtitleDE: 'Nach 5 Jahren: Permanente Aufenthaltsgenehmigung; nach 5 Jahren: Staatsbürgerschaft möglich',
    subtitleEN: 'After 5 years: permanent residence; citizenship possible from year 5',
    timingDE: 'Ab 5 Jahren ununterbrochener Residenz',
    timingEN: 'From 5 years of uninterrupted residence',
    documents: ['CRUE aller vergangenen Jahre', 'Nachweis der Sprachkenntnisse (A2-Niveau Portugiesisch)', 'Strafregisterauszug'],
    infoBoxDE: 'Portugal erlaubt deutschen Staatsangehörigen die doppelte Staatsbürgerschaft — ein einzigartiger Vorteil für Auswanderer. Die Einbürgerung setzt u.a. A2-Sprachkenntnisse in Portugiesisch, 5 Jahre Residenz und sauberes Strafregister voraus. Ab 5 Jahren ist auch die Daueraufenthaltsgenehmigung möglich, die unbefristet gilt.',
    infoBoxEN: 'Portugal allows German nationals to hold dual citizenship — a unique advantage. Naturalisation requires A2 Portuguese, 5 years of residence and a clean criminal record. From year 5 a permanent residence certificate (unlimited validity) is also available.',
    infoBoxType: 'info',
    tags: ['staatsbürgerschaft', 'daueraufenthalt', 'langfristig'],
    riskLevel: 'low', translationSource: 'manual',
    forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true, forPassive: true, forPair: true,
  },

  // ── TAX PLANNING ─────────────────────────────────────────────────────────────

  {
    stepOrder: 1, section: 'tax_planning', phase: 'Steuer',
    titleDE: 'DBA Deutschland–Portugal: Was bleibt wo steuerpflichtig?',
    titleEN: 'Germany–Portugal tax treaty: what is taxed where?',
    subtitleDE: 'Doppelbesteuerungsabkommen vom 15.7.1980, in Kraft seit 1982',
    subtitleEN: 'Double taxation agreement of 15 July 1980, in force since 1982',
    timingDE: 'Vor dem Wegzug — zwingend mit Steuerberater klären',
    timingEN: 'Before departure — must be clarified with a tax adviser',
    isWarning: true,
    documents: ['Steuerbescheide letzte 3 Jahre (DE)', 'Arbeitsvertrag oder Einkommensnachweis'],
    infoBoxDE: 'Das DBA Deutschland-Portugal weist Besteuerungsrechte nach OECD-Muster zu: Arbeitslohn wird grundsätzlich im Tätigkeitsstaat besteuert; Privatrenten im Ansässigkeitsstaat (Portugal). ACHTUNG: Das DBA enthält eine sogenannte Rückfallklausel (Subject-to-Tax-Klausel, Art. 22). Wenn Portugal Einkünfte nicht besteuert — z.B. weil sie unter das alte NHR-Regime fielen — fällt das Besteuerungsrecht an Deutschland zurück. Der BFH hat dies am 3. September 2025 (Az. X R 1/24) ausdrücklich bestätigt. Unter dem neuen IFICI-Regime sind Renten jedoch nicht mehr befreit, was die Rückfallklausel für Rentenempfänger entschärft — aber nicht für alle Einkunftsarten. Professionelle Beratung ist in jedem Fall Pflicht.',
    infoBoxEN: 'The Germany–Portugal tax treaty allocates taxing rights on an OECD model: employment income is taxed where the work is performed; private pensions in the country of residence (Portugal). WARNING: The treaty contains a subject-to-tax (Rückfall) clause (Art. 22). If Portugal does not tax income — for example because it fell under the old NHR regime — the taxing right reverts to Germany. The Federal Fiscal Court confirmed this on 3 September 2025 (BFH X R 1/24). Under the new IFICI regime pensions are no longer exempt, which mitigates this clause for pension recipients — but not for all income types. Professional advice is mandatory in all cases.',
    infoBoxType: 'warning',
    tags: ['dba', 'doppelbesteuerung', 'steuer', 'portugal'],
    riskLevel: 'high', requiresLegalAdvice: true,
    sourceUrl: 'https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/Internationales_Steuerrecht/Staatenbezogene_Informationen/Laender_A_Z/Portugal/1982-02-13-Portugal-Abkommen-DBA.html',
    sourceLabel: 'Bundesfinanzministerium — DBA Deutschland-Portugal',
    translationSource: 'manual',
    forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true, forPassive: true, forPair: true,
  },

  {
    stepOrder: 2, section: 'tax_planning', phase: 'Steuer',
    titleDE: '§6 AStG — Wegzugsbesteuerung bei GmbH-Anteilen',
    titleEN: '§6 AStG — Exit tax on GmbH / corporation shareholdings',
    subtitleDE: 'Betrifft Anteile ≥1% an Kapitalgesellschaften im Privatvermögen',
    subtitleEN: 'Applies to shareholdings of ≥1% in corporations held privately',
    timingDE: 'Spätestens 6 Monate vor geplantem Wegzug prüfen',
    timingEN: 'Check at least 6 months before planned departure',
    isWarning: true,
    documents: ['Gesellschaftsvertrag / Anteilsscheine', 'Aktuelle Unternehmensbewertung', 'Steuerbescheide letzte 3 Jahre'],
    infoBoxDE: 'Wer Anteile von mindestens 1% an einer GmbH, AG oder anderen Kapitalgesellschaft im Privatvermögen hält und seit mindestens 10 Jahren unbeschränkt steuerpflichtig in Deutschland war, muss beim Wegzug Wegzugssteuer nach §6 AStG zahlen. Seit dem 1. Juli 2021 gilt: Es gibt keine zinsfreie unbegrenzte Stundung mehr für EU/EWR-Staaten. Stattdessen: die Steuer wird sofort festgesetzt, kann aber auf Antrag in 7 gleichen Jahresraten (zinsfrei) bezahlt werden. Portugal ist als EU-Mitglied ratenzahlungsberechtigt. Sicherheitsleistung kann verlangt werden. Das BMF-Schreiben vom 22. April 2025 enthält aktuelle Anwendungsregeln.',
    infoBoxEN: 'Anyone holding at least 1% of a GmbH, AG or other corporation privately, who has been subject to unlimited German income tax for at least 10 years, must pay exit tax under §6 AStG upon emigrating. Since 1 July 2021: there is no longer an unlimited interest-free deferral for EU/EEA moves. Instead: the tax is assessed immediately but can, on request, be paid in 7 equal annual interest-free instalments. Portugal qualifies as an EU member state. Security may be required. The BMF guidance of 22 April 2025 contains current application rules.',
    infoBoxType: 'warning',
    tags: ['wegzugssteuer', 'astg', 'gmbh', 'kapitalgesellschaft'],
    riskLevel: 'high', requiresLegalAdvice: true,
    sourceUrl: 'https://www.gesetze-im-internet.de/astg/__6.html',
    sourceLabel: 'gesetze-im-internet.de — §6 AStG',
    translationSource: 'manual',
    forFreelancer: false, forFounder: true, forPassive: true,
    forEmployed: false, forFamily: false, forPair: false,
  },

  {
    stepOrder: 3, section: 'tax_planning', phase: 'Steuer',
    titleDE: 'IFICI-Regime — Portugals Sondersteuerregime (NHR 2.0)',
    titleEN: 'IFICI regime — Portugal\'s special tax scheme (NHR 2.0)',
    subtitleDE: 'Incentivo Fiscal à Investigação Científica e Inovação — 20% Flat auf qualifizierte Einkünfte für 10 Jahre',
    subtitleEN: '20% flat rate on qualifying income for 10 years',
    timingDE: 'Antrag bis 15. Januar des Folgejahres — erstes Jahr ist entscheidend',
    timingEN: 'Application deadline: 15 January of the following year — the first year is critical',
    isWarning: true,
    documents: ['NIF', 'Nachweis Erstanmeldung als Steuerpflichtiger in Portugal', 'Qualifikationsnachweis (Hochschulabschluss EQF 6+ oder Doktorat EQF 8 + 3 Jahre Berufserfahrung)', 'Nachweis der qualifizierten Tätigkeit (Arbeitsvertrag, AICEP-Zertifizierung o.ä.)'],
    infoBoxDE: 'Das IFICI-Regime (in Kraft seit 1.1.2024, Rechtsgrundlage: Art. 58-A EBF, Portaria 352/2024/1) hat das alte NHR-Regime ersetzt. Kernmerkmale: 20% Flat auf portugiesische Arbeitseinkünfte und Freiberuflereinkommen für qualifizierte Tätigkeiten; ausländische Arbeitseinkommen befreit; ACHTUNG — ausländische Renten (Kategorie H) sind NICHT mehr befreit (wichtige Abweichung vom alten NHR). Voraussetzungen: in den letzten 5 Jahren nicht steueransässig in Portugal; Qualifikation EQF ≥ 6 mit 3 Jahren Erfahrung oder EQF 8; Tätigkeit muss einer der 6 Qualifikationskategorien entsprechen (u.a. IT-Spezialisten, Ingenieure, Unternehmensleiter, Ärzte, Startup-Mitarbeiter). Antragsfrist: 15. Januar des Jahres, das auf das erste Ansässigkeitsjahr folgt. Versäumnis bedeutet Verlust des Regimes für dieses Jahr — mit Steuerberatern vorab terminieren. Gültig für 10 Jahre.',
    infoBoxEN: "The IFICI regime (in force since 1 Jan 2024, legal basis: Art. 58-A EBF, Portaria 352/2024/1) replaced the old NHR. Key features: 20% flat rate on Portuguese employment and self-employment income for qualifying activities; foreign-source employment income is exempt; WARNING — foreign pensions (Category H) are NO LONGER exempt (critical difference from old NHR). Requirements: not tax-resident in Portugal in the last 5 years; qualification EQF ≥ 6 with 3 years' experience or EQF 8; activity must fall in one of 6 qualification categories (IT specialists, engineers, company directors, doctors, startup employees, etc.). Application deadline: 15 January of the year following your first year of residency. Missing this deadline forfeits the regime for that year — arrange with a tax adviser in advance. Valid for 10 years.",
    infoBoxType: 'warning',
    tags: ['ifici', 'nhr', 'sondersteuerregime', 'portugal', '20-prozent'],
    riskLevel: 'high', requiresLegalAdvice: true,
    sourceUrl: 'https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/questoes_frequentes/pages/faqs-01018.aspx',
    sourceLabel: 'Portal das Finanças (AT) — IFICI FAQ',
    translationSource: 'manual',
    forEmployed: true, forFreelancer: true, forFounder: true, forFamily: false, forPassive: true, forPair: false,
  },

  {
    stepOrder: 4, section: 'tax_planning', phase: 'Steuer',
    titleDE: 'Kapitalerträge und Dividenden in Portugal',
    titleEN: 'Capital gains and dividends in Portugal',
    subtitleDE: '28% Flat-Tax auf Dividenden und Veräußerungsgewinne aus Wertpapieren',
    subtitleEN: '28% flat rate on dividends and securities gains',
    timingDE: 'Vor dem Aufbau eines Wertpapierportfolios in Portugal klären',
    timingEN: 'Clarify before building a securities portfolio in Portugal',
    documents: ['Depotauszüge', 'Jahressteuerbescheinigungen Depot DE'],
    infoBoxDE: 'In Portugal werden Dividenden, Zinsen und Veräußerungsgewinne aus Wertpapieren (Kategorie E und G) mit einem pauschalen Steuersatz von 28% belegt (Stand 2025). Alternativ kann zur Regelbesteuerung (progressiver Tarif bis 48%) optiert werden — das kann bei niedrigen Gesamteinkünften vorteilhaft sein. Unter dem IFICI-Regime werden Kapitalerträge aus ausländischen Quellen grundsätzlich befreit, sofern sie kein schwarzgelistetes Steuerparadies betreffen. Bei deutschen Dividenden und dem DBA beachten: Quellensteuer in Deutschland wird in Portugal angerechnet.',
    infoBoxEN: 'In Portugal dividends, interest and capital gains from securities (categories E and G) are taxed at a flat 28% (as of 2025). Alternatively you can opt for the standard progressive rate (up to 48%) — this can be advantageous at low total income levels. Under the IFICI regime capital income from foreign sources is generally exempt, provided it does not involve a blacklisted tax haven. For German dividends: German withholding tax is credited in Portugal under the tax treaty.',
    infoBoxType: 'info',
    tags: ['kapitalerträge', 'dividenden', '28-prozent', 'wertpapiere'],
    riskLevel: 'medium',
    sourceUrl: 'https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/questoes_frequentes/pages/faqs-01018.aspx',
    sourceLabel: 'Portal das Finanças (AT) — IFICI FAQ',
    translationSource: 'manual',
    forEmployed: true, forFreelancer: true, forFounder: true, forFamily: false, forPassive: true, forPair: false,
  },

  {
    stepOrder: 5, section: 'tax_planning', phase: 'Steuer',
    titleDE: 'Erweiterte unbeschränkte Steuerpflicht (§2 AStG) — gilt NICHT für Portugal',
    titleEN: 'Extended unlimited German tax liability (§2 AStG) — does NOT apply to Portugal',
    subtitleDE: 'Portugal ist kein Niedrigsteuerland — keine 5-Jahres-Verlängerung',
    subtitleEN: 'Portugal is not a low-tax jurisdiction — no 5-year extension',
    timingDE: 'Relevant bei Planung des Wegzugs',
    timingEN: 'Relevant when planning departure',
    isWarning: false,
    documents: [],
    infoBoxDE: 'Die erweiterte unbeschränkte Steuerpflicht nach §2 AStG verlängert die deutsche Steuerpflicht um bis zu 10 Jahre für Personen, die in ein Niedrigsteuerland ziehen. Portugal gilt als Niedrigsteuerland, wenn die Steuerbelastung weniger als 25% des vergleichbaren deutschen Einkommens beträgt. Mit einem normalen Einkommensteuersatz von bis zu 48% plus Sozialabgaben ist Portugal kein Niedrigsteuerland. Die §2-AStG-Verlängerung greift daher für einen normalen Umzug nach Lissabon NICHT. Für IFICI-Begünstigte mit effektiv 20% könnte eine andere Einschätzung eintreten — Steuerberatung empfohlen.',
    infoBoxEN: 'Extended unlimited German tax liability under §2 AStG extends German liability for up to 10 years for persons moving to a low-tax jurisdiction. Portugal qualifies as low-tax if the tax burden is less than 25% of equivalent German income. With a standard income tax rate of up to 48% plus social contributions, Portugal is not a low-tax country. §2 AStG does NOT apply to a standard move to Lisbon. For IFICI beneficiaries at effectively 20%, a different assessment could arise — tax advice is recommended.',
    infoBoxType: 'success',
    tags: ['astg', 'niedrigsteuerland', 'steuerpflicht'],
    riskLevel: 'medium', requiresLegalAdvice: false,
    sourceUrl: 'https://www.gesetze-im-internet.de/astg/__2.html',
    sourceLabel: 'gesetze-im-internet.de — §2 AStG',
    translationSource: 'manual',
    forEmployed: true, forFreelancer: true, forFounder: true, forFamily: false, forPassive: true, forPair: false,
  },

  // ── BANKING ──────────────────────────────────────────────────────────────────

  {
    stepOrder: 1, section: 'banking', phase: 'Banking',
    titleDE: 'Bankkonto in Portugal: Die besten Optionen für Deutsche',
    titleEN: 'Bank account in Portugal: best options for Germans',
    subtitleDE: 'ActivoBank, Millennium BCP und Caixa Geral de Depósitos im Vergleich',
    subtitleEN: 'ActivoBank, Millennium BCP and Caixa Geral de Depósitos compared',
    timingDE: 'Nach NIF-Erhalt, parallel zu CRUE-Beantragung',
    timingEN: 'After receiving NIF, alongside CRUE application',
    documents: ['NIF', 'Reisepass oder EU-Personalausweis', 'Wohnsitznachweis (Mietvertrag, Atestado de Residência, max. 12 Monate alt)', 'Nachweis Beschäftigung oder Einkommensquelle'],
    infoBoxDE: 'Drei empfehlenswerte Optionen für Deutsche in Portugal:\n\n**ActivoBank**: Volldigitale Bank, einfachste Kontoeröffnung für Ausländer (auch per Video möglich). Keine Kontoführungsgebühr bei regelmäßiger Nutzung. NIF erforderlich.\n\n**Millennium BCP**: Klassische Großbank mit teilweise deutschsprachigem Service. Online-Eröffnung setzt CRUE oder Aufenthaltserlaubnis voraus; In-Filiale-Eröffnung mit NIF + Ausweis + Adressnachweis möglich. Mindesteinalge ca. €250.\n\n**Caixa Geral de Depósitos (CGD)**: Staatliche Bank, sehr verbreitet, traditionell. Eröffnung meist nur in der Filiale. Gut für staatliche Zahlungen (z.B. Sozialtransfers, Rentenempfang).\n\nAlle drei akzeptieren EU-Bürger ohne Probleme. Compliance-Prüfungen haben sich seit 2024 verschärft — Kontoeröffnung kann 1–3 Wochen dauern.',
    infoBoxEN: 'Three recommended options for Germans in Portugal:\n\n**ActivoBank**: Fully digital bank, simplest account opening for foreigners (video call available). No account fees with regular use. NIF required.\n\n**Millennium BCP**: Major traditional bank with partial German-language service. Online opening requires CRUE or residence permit; in-branch opening possible with NIF + ID + address proof. Minimum deposit ~€250.\n\n**Caixa Geral de Depósitos (CGD)**: State-owned bank, very widespread, traditional. Opening usually in-branch only. Good for state payments (e.g. social transfers, pension receipt).\n\nAll three accept EU citizens without issues. Compliance checks have become stricter since 2024 — account opening can take 1–3 weeks.',
    infoBoxType: 'info',
    tags: ['bankkonto', 'activobank', 'millennium-bcp', 'cgd'],
    riskLevel: 'low',
    sourceUrl: 'https://www.activobank.pt/open-account',
    sourceLabel: 'ActivoBank — Konto eröffnen (Stand 2025)',
    translationSource: 'manual',
    forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true, forPassive: true, forPair: true,
  },

  {
    stepOrder: 2, section: 'banking', phase: 'Banking',
    titleDE: 'Wise, Revolut und N26 in Portugal',
    titleEN: 'Wise, Revolut and N26 in Portugal',
    subtitleDE: 'Neobanken als Überbrückung und Ergänzung — mit wichtigen Einschränkungen',
    subtitleEN: 'Neobanks as bridge and supplement — with important limitations',
    timingDE: 'Sofort nutzbar, aber als Hauptkonto nicht empfohlen',
    timingEN: 'Immediately usable, but not recommended as main account',
    documents: [],
    infoBoxDE: '**Wise**: Voll akzeptiert für Mietzahlungen und in vielen Behördenkontexten. Unterstützt EUR-IBAN. Empfohlen für internationales Geldmanagement und Überweisungen nach Deutschland.\n\n**Revolut**: Für die meisten alltäglichen Zahlungen akzeptiert. Manche Vermieter und traditionelle Institutionen zeigen Skepsis gegenüber Neobank-IBANs.\n\n**N26**: Problematisch in Portugal. Viele Vermieter, Behörden und Arbeitgeber verlangen eine portugiesische IBAN (PT...) — eine deutsche IBAN (DE...) oder litauische N26-IBAN wird oft abgelehnt.\n\nEmpfehlung: Wise oder Revolut als Überbrückung, parallel so früh wie möglich ein portugiesisches Bankkonto eröffnen. Stand: Mai 2026 — Bankpolitiken können sich ändern.',
    infoBoxEN: '**Wise**: Fully accepted for rent payments and in many official contexts. Supports EUR IBAN. Recommended for international money management and transfers to Germany.\n\n**Revolut**: Accepted for most everyday payments. Some landlords and traditional institutions are sceptical of neobank IBANs.\n\n**N26**: Problematic in Portugal. Many landlords, authorities and employers require a Portuguese IBAN (PT...) — a German (DE...) or Lithuanian N26 IBAN is often rejected.\n\nRecommendation: Wise or Revolut as a bridge, while opening a Portuguese bank account as early as possible. As of May 2026 — bank policies can change.',
    infoBoxType: 'info',
    tags: ['wise', 'revolut', 'n26', 'neobank', 'iban'],
    riskLevel: 'medium', translationSource: 'manual',
    forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true, forPassive: true, forPair: true,
  },

  // ── INSURANCE ─────────────────────────────────────────────────────────────────

  {
    stepOrder: 1, section: 'insurance', phase: 'Versicherung',
    titleDE: 'SNS — Das öffentliche Gesundheitssystem',
    titleEN: 'SNS — The public health system',
    subtitleDE: 'Kostenloser Zugang für registrierte EU-Bürger, aber Wartezeiten einplanen',
    subtitleEN: 'Free access for registered EU citizens, but plan for waiting times',
    timingDE: 'Nach SNS-Registrierung sofort verfügbar',
    timingEN: 'Available immediately after SNS registration',
    documents: [],
    infoBoxDE: 'Das SNS bietet Grundversorgung (Hausarzt, Notaufnahme, Facharzt) für registrierte Residenten. Geringe Zuzahlungen (Taxas Moderadoras) bei manchen Leistungen, Ausnahmen für Kinder und Schwangere. Schwachpunkte: lange Wartezeiten für Spezialisten (oft 3–12 Monate), Zahnmedizin nur begrenzt abgedeckt. Private Zusatzversicherung für Zahnarzt und Spezialisten empfohlen (ca. €30–80/Monat für Familien über Groupama, Fidelidade, AdvanceCare).',
    infoBoxEN: 'The SNS provides basic care (GP, emergency, specialist) for registered residents. Small co-payments (Taxas Moderadoras) for some services; exemptions for children and pregnant women. Weaknesses: long waiting times for specialists (often 3–12 months), dental coverage is limited. Private supplementary insurance for dentist and specialists is recommended (approx. €30–80/month for families via Groupama, Fidelidade, AdvanceCare).',
    infoBoxType: 'info',
    tags: ['sns', 'krankenversicherung', 'gesundheit', 'wartezeit'],
    riskLevel: 'low', translationSource: 'manual',
    forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true, forPassive: true, forPair: true,
  },

  {
    stepOrder: 2, section: 'insurance', phase: 'Versicherung',
    titleDE: 'Internationale Krankenversicherung für die Übergangszeit',
    titleEN: 'International health insurance for the transition period',
    subtitleDE: 'Überbrückung bis zur SNS-Registrierung und Gewöhnung ans System',
    subtitleEN: 'Bridge coverage until SNS registration and system acclimatisation',
    timingDE: 'Ab Abreise aus Deutschland bis SNS-Vollzugang (ca. 3–6 Monate)',
    timingEN: 'From departure until full SNS access (approx. 3–6 months)',
    documents: ['EHIC (Europäische Krankenversicherungskarte) — noch bei deutschen Kasse einfordern', 'Nachweis über internationale KV-Police'],
    infoBoxDE: 'Empfohlene internationale Krankenversicherungen für Deutsche in Portugal (Stand 2025, Preise können sich ändern):\n\n**Cigna Global**: Sehr bekannt unter Expats, deutschsprachiger Kundenservice verfügbar. Ca. €80–150/Monat für 35-Jährige je nach Deckungsumfang.\n\n**Allianz Worldwide Care (Allianz Care)**: Stabiler Anbieter, bekannt in Deutschland. Ähnliche Preisspanne.\n\nHinweis: Die EHIC (dt. Krankenkassenkarte) gilt in Portugal für notwendige medizinische Behandlungen für bis zu 6 Monate nach Ausscheiden aus der deutschen gesetzlichen Krankenversicherung — nutze sie als Überbrückung. Preise und Konditionen können sich ändern — vor Abschluss aktuellen Marktvergleich einholen.',
    infoBoxEN: 'Recommended international health insurers for Germans in Portugal (as of 2025, prices subject to change):\n\n**Cigna Global**: Very popular among expats, German-language customer service available. Approx. €80–150/month for a 35-year-old depending on coverage.\n\n**Allianz Care**: Established provider, well-known in Germany. Similar price range.\n\nNote: The EHIC (European Health Insurance Card) is valid in Portugal for necessary medical treatment for up to 6 months after leaving German statutory health insurance — use it as a bridge. Prices and conditions can change — obtain a current market comparison before purchasing.',
    infoBoxType: 'info',
    tags: ['international-kv', 'cigna', 'allianz', 'ehic', 'übergangszeit'],
    riskLevel: 'medium', translationSource: 'manual',
    forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true, forPassive: true, forPair: true,
  },

  // ── HOUSING ──────────────────────────────────────────────────────────────────

  {
    stepOrder: 1, section: 'housing', phase: 'Wohnen',
    titleDE: 'Wohnungssuche in Lissabon: Portale und Tipps',
    titleEN: 'Apartment search in Lisbon: portals and tips',
    subtitleDE: 'idealista.pt, OLX.pt, imovirtual.com — und wie man tatsächlich eine Wohnung bekommt',
    subtitleEN: 'idealista.pt, OLX.pt, imovirtual.com — and how to actually get a flat',
    timingDE: '3–6 Monate vor geplantem Einzug beginnen',
    timingEN: 'Start 3–6 months before planned move-in',
    documents: ['Reisepass', 'Einkommensnachweise (letzte 3 Monate)', 'NIF (sobald vorhanden)', 'Arbeitsvertrag oder Einkommensnachweis'],
    infoBoxDE: 'Der Lissaboner Wohnungsmarkt ist angespannt — Wartezeiten von 3–6 Monaten für geeignete Objekte sind üblich. Top-Portale: idealista.pt, OLX.pt (günstigere Direktvermieter), imovirtual.com.\n\nBegehrte Stadtteile (höhere Preise, mehr Expats): Príncipe Real, Chiado, Bairro Alto, Avenidas Novas.\nFamilienfreundlich: Parque das Nações (modern, teurer), Estrela, Belém.\nGünstiger: Almada oder Cacilhas auf dem südlichen Tejo-Ufer (Fähre in 10 min nach Lissabon).\n\nMaklercourtage: 1–2 Monatsmieten, üblicherweise vom Mieter bezahlt. Kaution: meist 2 Monatsmieten + 1 Monat Vorausmiete.',
    infoBoxEN: "Lisbon's rental market is tight — waiting times of 3–6 months for suitable properties are normal. Top portals: idealista.pt, OLX.pt (cheaper direct landlords), imovirtual.com.\n\nDesirable neighbourhoods (higher prices, more expats): Príncipe Real, Chiado, Bairro Alto, Avenidas Novas.\nFamily-friendly: Parque das Nações (modern, pricier), Estrela, Belém.\nMore affordable: Almada or Cacilhas on the south bank of the Tagus (10-minute ferry to Lisbon).\n\nAgent commission: 1–2 months' rent, typically paid by the tenant. Deposit: usually 2 months' rent + 1 month advance.",
    infoBoxType: 'info',
    tags: ['wohnung', 'idealista', 'miete', 'lissabon-stadtteile'],
    riskLevel: 'low', translationSource: 'manual',
    forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true, forPassive: true, forPair: true,
  },

  {
    stepOrder: 2, section: 'housing', phase: 'Wohnen',
    titleDE: 'Betrugsschutz und Mietvertrag',
    titleEN: 'Fraud protection and rental contracts',
    subtitleDE: 'Keine Vorauszahlung ohne Besichtigung — NIF des Vermieters fordern',
    subtitleEN: 'Never pay before viewing — always ask for landlord\'s NIF',
    timingDE: 'Bei jeder Wohnungssuche beachten',
    timingEN: 'Always observe when searching for accommodation',
    documents: ['Mietvertrag (Contrato de Arrendamento)', 'NIF des Vermieters', 'Personalausweis beider Parteien'],
    infoBoxDE: 'Betrug auf dem Lissaboner Wohnungsmarkt ist verbreitet: Niemals Geld überweisen, ohne die Wohnung persönlich besichtigt zu haben. Immer den NIF des Vermieters fordern — ohne NIF ist der Vertrag nicht steuerpflichtig angemeldet, was für den Mieter Nachteile bei der SNS und Steuererklärung bedeuten kann. Mietverträge müssen beim Finanças-Portal angemeldet werden; der Vermieter ist verpflichtet, dir die Registrierungsbestätigung (Certidão de Registo) auszuhändigen. Mieterrechte: Das portugiesische Mietrecht schützt Mieter gut — unkündbare Mindestlaufzeiten, Kündigungsfristen, Entschädigungspflicht bei vorzeitigem Auszug des Vermieters.',
    infoBoxEN: "Fraud in Lisbon's rental market is common: never transfer money without viewing the property in person. Always ask for the landlord's NIF — without it the contract is not officially registered, which can disadvantage the tenant for SNS and tax purposes. Rental contracts must be registered at the Finanças portal; the landlord is obliged to provide you with the registration certificate (Certidão de Registo). Tenant rights: Portuguese tenancy law protects tenants well — minimum non-cancellable periods, notice requirements, and landlord liability for early termination.",
    infoBoxType: 'warning',
    tags: ['betrug', 'mietvertrag', 'sicherheit', 'nif-vermieter'],
    riskLevel: 'low', translationSource: 'manual',
    forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true, forPassive: true, forPair: true,
  },

  // ── PRACTICAL ────────────────────────────────────────────────────────────────

  {
    stepOrder: 1, section: 'practical', phase: 'Praktisches',
    titleDE: 'Strom, Stecker, Internet',
    titleEN: 'Electricity, plugs, internet',
    subtitleDE: 'Kein Adapter nötig — deutscher Stecker Typ F funktioniert direkt',
    subtitleEN: 'No adapter needed — German Type F plug works directly',
    timingDE: 'Beim Einzug',
    timingEN: 'On moving in',
    documents: [],
    infoBoxDE: 'Stecker: Typ F (Schukostecker) — identisch mit Deutschland, kein Adapter erforderlich. Spannung: 230V / 50Hz. Internetanbieter: NOS, MEO und Vodafone Portugal bieten Glasfaser (FTTH) in den meisten Lissaboner Stadtteilen. Typische Kosten: €25–40/Monat für 1 Gbit/s. Vertragsabschluss erfordert NIF und portugiesische Adresse. Prepaid-SIM: bei NOS, MEO oder Vodafone sofort erhältlich; empfohlen bis zur festen Adresse.',
    infoBoxEN: 'Plugs: Type F (Schuko) — identical to Germany, no adapter needed. Voltage: 230V / 50Hz. Internet providers: NOS, MEO and Vodafone Portugal offer fibre (FTTH) in most Lisbon neighbourhoods. Typical cost: €25–40/month for 1 Gbit/s. Signing a contract requires a NIF and Portuguese address. Prepaid SIM: available instantly from NOS, MEO or Vodafone; recommended until you have a fixed address.',
    infoBoxType: 'info',
    tags: ['strom', 'stecker', 'internet', 'sim'],
    riskLevel: 'low', translationSource: 'manual',
    forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true, forPassive: true, forPair: true,
  },

  {
    stepOrder: 2, section: 'practical', phase: 'Praktisches',
    titleDE: 'Notrufnummern und Deutsche Botschaft',
    titleEN: 'Emergency numbers and German Embassy',
    subtitleDE: '112 gilt in ganz Portugal und der EU',
    subtitleEN: '112 works throughout Portugal and the EU',
    timingDE: 'Sofort bei Ankunft notieren',
    timingEN: 'Note down immediately on arrival',
    documents: [],
    infoBoxDE: 'Notrufnummern Portugal:\n• 112: Allgemeiner Notruf (Polizei, Feuerwehr, Rettungsdienst)\n• 808 24 24 24: Linha de Saúde 24 (telefonische Gesundheitsberatung SNS)\n• 21 765 4242: Polícia de Segurança Pública (PSP) Lissabon\n\nDeutsche Botschaft Lissabon:\nAdresse: Rua de São Bernardo 27, 1249-082 Lissabon\nTel.: +351 21 810 4000\nNot-Telefon (außerhalb Bürozeiten): +351 21 810 4000\nKonsularischer Notfall: konsularnotfall@lissabon.diplo.de\nWebsite: lissabon.diplo.de',
    infoBoxEN: 'Emergency numbers in Portugal:\n• 112: General emergency (police, fire, ambulance)\n• 808 24 24 24: Linha de Saúde 24 (SNS telephone health advice)\n• 21 765 4242: Polícia de Segurança Pública (PSP) Lisbon\n\nGerman Embassy Lisbon:\nAddress: Rua de São Bernardo 27, 1249-082 Lisbon\nPhone: +351 21 810 4000\nEmergency out-of-hours: +351 21 810 4000\nConsular emergency: konsularnotfall@lissabon.diplo.de\nWebsite: lissabon.diplo.de',
    infoBoxType: 'info',
    tags: ['notruf', 'botschaft', 'polizei', '112'],
    riskLevel: 'low', translationSource: 'manual',
    forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true, forPassive: true, forPair: true,
  },

  {
    stepOrder: 3, section: 'practical', phase: 'Praktisches',
    titleDE: 'Führerschein und Fahrzeug-Anmeldung',
    titleEN: 'Driving licence and vehicle registration',
    subtitleDE: 'Deutscher Führerschein unbegrenzt gültig in Portugal',
    subtitleEN: 'German driving licence valid indefinitely in Portugal',
    timingDE: 'Auto-Anmeldung innerhalb 6 Monate nach Wohnsitzverlegung',
    timingEN: 'Vehicle registration within 6 months of establishing residence',
    documents: ['Fahrzeugbrief (Zulassungsbescheinigung Teil II)', 'Fahrzeugschein (Teil I)', 'COC-Dokument (Konformitätsbescheinigung)', 'NIF', 'Personalausweis', 'Nachweis der Kfz-Steuer-Bezahlung in Portugal (IUC)'],
    infoBoxDE: 'Führerschein: Klasse-B-Führerscheine aus Deutschland sind in Portugal unbegrenzt gültig. Ein Umtausch ist optional und nur bei behördlicher Aufforderung erforderlich.\n\nFahrzeug-Anmeldung: Wird ein in Deutschland zugelassenes Fahrzeug dauerhaft nach Portugal mitgenommen, muss es innerhalb von 6 Monaten nach Wohnsitzverlegung auf ein PT-Kennzeichen umgemeldet werden. Zuständig: IMT (Instituto da Mobilidade e dos Transportes). Es fallen IUC (Kfz-Steuer), ISV (Zulassungssteuer, basierend auf CO₂-Emission und Hubraum) sowie IVA (MwSt.) an. Tipp: Alte Fahrzeuge können hohe ISV haben — Kalkulation vorab empfohlen.',
    infoBoxEN: "Driving licence: German Class B licences are valid indefinitely in Portugal. Exchange is optional and only required if the authorities request it.\n\nVehicle registration: A car permanently brought from Germany must be re-registered on a Portuguese plate within 6 months of establishing residence. Contact: IMT (Instituto da Mobilidade e dos Transportes). IUC (annual road tax), ISV (registration tax, based on CO₂ and engine size) and IVA (VAT) apply. Tip: older vehicles can attract high ISV — calculate in advance.",
    infoBoxType: 'info',
    tags: ['führerschein', 'auto', 'imt', 'kfz-steuer'],
    riskLevel: 'low', translationSource: 'manual',
    forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true, forPassive: true, forPair: true,
  },

  {
    stepOrder: 4, section: 'practical', phase: 'Praktisches',
    titleDE: 'Haustiere nach Portugal mitnehmen',
    titleEN: 'Bringing pets to Portugal',
    subtitleDE: 'EU-Heimtierausweis genügt — keine Quarantäne',
    subtitleEN: 'EU pet passport is sufficient — no quarantine',
    timingDE: 'Vor Abreise beim Tierarzt vorbereiten',
    timingEN: 'Prepare with vet before departure',
    documents: ['EU-Heimtierausweis', 'Gültiger Tollwut-Impfnachweis (Hund, Katze, Frettchen)', 'Mikrochip-Nachweis'],
    infoBoxDE: 'Für EU-Bürger, die ein Haustier (Hund, Katze, Frettchen) nach Portugal mitbringen: Der EU-Heimtierausweis (mit Mikrochip, Tollwut-Impfung und Tierarztunterschrift) ist ausreichend. Keine Quarantäne für EU-Haustiere. In Portugal ist die Anmeldung beim SIAC (Sistema de Identificação de Animais de Companhia) empfohlen. Hunde müssen in Portugal gemeldet und geimpft sein (Tollwut, Leptospirose).',
    infoBoxEN: 'For EU citizens bringing a pet (dog, cat, ferret) to Portugal: the EU pet passport (with microchip, rabies vaccination and vet signature) is sufficient. No quarantine for EU pets. In Portugal registration with SIAC (Sistema de Identificação de Animais de Companhia) is recommended. Dogs must be registered and vaccinated in Portugal (rabies, leptospirosis).',
    infoBoxType: 'info',
    tags: ['haustiere', 'hund', 'katze', 'heimtierausweis'],
    riskLevel: 'low', translationSource: 'manual',
    forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true, forPassive: true, forPair: true,
  },

  // ── SOCIAL ───────────────────────────────────────────────────────────────────

  {
    stepOrder: 1, section: 'social', phase: 'Community',
    titleDE: 'Deutsche Community in Lissabon',
    titleEN: 'German community in Lisbon',
    subtitleDE: 'Über 30.000 Deutsche leben in der Region Lissabon',
    subtitleEN: 'Over 30,000 Germans live in the greater Lisbon area',
    timingDE: 'Sofort nach Ankunft Kontakte knüpfen',
    timingEN: 'Start building connections immediately after arrival',
    documents: [],
    infoBoxDE: 'Lissabon hat eine der größten deutschen Expat-Communitys in Europa. Netzwerke und Treffpunkte:\n\n**InterNations Lisbon**: Größte internationale Expat-Community, monatliche Events.\n**Deutsche Auslandsgesellschaft (DAG)**: Regelmäßige Stammtische und kulturelle Events für Deutsche.\n**Goethe-Institut Lissabon**: Kulturveranstaltungen, Sprachkurse, Vernetzung.\n\nFacebook-Gruppen: "Deutsche in Lissabon" (aktiv, mehrere Tausend Mitglieder), "Auswanderer Portugal".\nForum: perspektiveausland.com hat einen aktiven Portugal-Strang.',
    infoBoxEN: 'Lisbon has one of the largest German expat communities in Europe. Networks and meeting points:\n\n**InterNations Lisbon**: Largest international expat community, monthly events.\n**Deutsche Auslandsgesellschaft (DAG)**: Regular stammtisch events and cultural gatherings for Germans.\n**Goethe-Institut Lisbon**: Cultural events, language courses, networking.\n\nFacebook groups: "Deutsche in Lissabon" (active, several thousand members), "Auswanderer Portugal".\nForum: perspektiveausland.com has an active Portugal thread.',
    infoBoxType: 'info',
    tags: ['community', 'deutsche', 'expats', 'netzwerk'],
    riskLevel: 'low', translationSource: 'manual',
    forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true, forPassive: true, forPair: true,
  },

  {
    stepOrder: 2, section: 'social', phase: 'Community',
    titleDE: 'Deutsche Schule Lissabon und deutschsprachige Ärzte',
    titleEN: 'German school Lisbon and German-speaking doctors',
    subtitleDE: 'DSL in Cascais für K–12, Ärztliste beim Konsulat',
    subtitleEN: 'DSL in Cascais for K–12, doctor list at the consulate',
    timingDE: 'Frühzeitig anmelden — Wartelisten möglich',
    timingEN: 'Register early — waiting lists possible',
    documents: ['Schulzeugnisse', 'Impfausweis', 'Geburtsurkunde der Kinder'],
    infoBoxDE: 'Deutsche Schule Lissabon (DSL): Standort in Cascais (ca. 30 km westlich von Lissabon). Vollwertige K–12 Bildung nach deutschem Lehrplan, mit portugiesischem Pflichtpflichtfach. Abschluss gegenseitig anerkannt. Wartelisten möglich — frühzeitig anfragen.\n\nDeutschsprachige Ärzte: Die Deutsche Botschaft Lissabon (lissabon.diplo.de) führt eine aktualisierte Liste deutschsprachiger Ärzte in der Region. Internisten, Kinderärzte und Gynäkologen sind vertreten. Privatpraxen — keine SNS-Abrechnung. Private KV (nationale oder internationale) erforderlich oder Selbstzahler.',
    infoBoxEN: 'German School Lisbon (DSL): Located in Cascais (approx. 30 km west of Lisbon). Full K–12 education following the German curriculum, with Portuguese as a compulsory subject. Qualifications mutually recognised. Waiting lists possible — enquire early.\n\nGerman-speaking doctors: The German Embassy Lisbon (lissabon.diplo.de) maintains an updated list of German-speaking doctors in the region. Internists, paediatricians and gynaecologists are included. Private practices only — no SNS billing. Private health insurance (national or international) required, or self-pay.',
    infoBoxType: 'info',
    tags: ['schule', 'dsl', 'cascais', 'arzt', 'deutschsprachig'],
    riskLevel: 'low', translationSource: 'manual',
    forEmployed: false, forFreelancer: false, forFounder: false, forFamily: true, forPassive: false, forPair: false,
  },

  {
    stepOrder: 3, section: 'social', phase: 'Community',
    titleDE: 'Portugiesisch lernen',
    titleEN: 'Learning Portuguese',
    subtitleDE: 'Investition in Integration — A2 reicht für den Alltag, B2 für Selbstständige',
    subtitleEN: 'Investment in integration — A2 suffices for daily life, B2 for self-employment',
    timingDE: 'So früh wie möglich beginnen, idealerweise vor dem Umzug',
    timingEN: 'Start as early as possible, ideally before moving',
    documents: [],
    infoBoxDE: 'Empfohlene Lernwege:\n\n**Instituto Camões**: Offizielles Kulturinstitut Portugals, günstige Kurse.\n**Lusa Language School Lissabon**: Privat, guter Ruf, Intensivkurse möglich.\n**Practice Portuguese** (App + Podcast): Sehr beliebt in der Expat-Community, auf europäisches Portugiesisch ausgelegt (Vorteil gegenüber brasilianisch-orientiertem Duolingo).\n\nHinweis: Europäisches Portugiesisch klingt für Deutschsprachige anfangs sehr anders als Brasilianisch-Portugiesisch (stark verschluckte Vokale). Bewusst europäische Materialien nutzen.',
    infoBoxEN: 'Recommended learning paths:\n\n**Instituto Camões**: Official Portuguese cultural institute, affordable courses.\n**Lusa Language School Lisbon**: Private, good reputation, intensive courses available.\n**Practice Portuguese** (app + podcast): Very popular in the expat community, focused on European Portuguese (advantage over Brazilian-oriented Duolingo).\n\nNote: European Portuguese sounds very different from Brazilian Portuguese to German speakers at first (strongly reduced vowels). Deliberately use European Portuguese materials.',
    infoBoxType: 'info',
    tags: ['portugiesisch', 'sprache', 'integration', 'sprachkurs'],
    riskLevel: 'low', translationSource: 'manual',
    forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true, forPassive: true, forPair: true,
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const city = await prisma.city.findUnique({ where: { slug: CITY_SLUG } });
  if (!city) throw new Error(`City not found: ${CITY_SLUG}`);

  console.log(`City: ${city.nameDE ?? city.slug} (${city.id})`);
  console.log(`Steps to write: ${STEPS.length}`);

  // Validate: high-risk steps must have sourceUrl + sourceLabel + requiresLegalAdvice
  const violations: string[] = [];
  for (const s of STEPS) {
    if (s.riskLevel === 'high') {
      if (!s.requiresLegalAdvice) violations.push(`[${s.section}/${s.stepOrder}] "${s.titleDE}": high risk but requiresLegalAdvice not set`);
      if (!s.sourceUrl)           violations.push(`[${s.section}/${s.stepOrder}] "${s.titleDE}": high risk but sourceUrl missing`);
      if (!s.sourceLabel)         violations.push(`[${s.section}/${s.stepOrder}] "${s.titleDE}": high risk but sourceLabel missing`);
    }
  }
  if (violations.length > 0) {
    console.error('\n❌ Validation errors:');
    violations.forEach(v => console.error('  ' + v));
    process.exit(1);
  }
  console.log('✓ Validation passed');

  if (DRY_RUN) {
    console.log('\n-- DRY RUN -- Steps that would be written:');
    for (const s of STEPS) {
      console.log(`  [${s.section}/${s.stepOrder}] ${s.titleDE}  risk=${s.riskLevel ?? 'low'}`);
    }
    return;
  }

  // Delete existing steps for this city
  const deleted = await prisma.movingGuide.deleteMany({ where: { cityId: city.id } });
  console.log(`Deleted ${deleted.count} existing steps`);

  // Insert all steps
  let inserted = 0;
  for (const s of STEPS) {
    await prisma.movingGuide.create({
      data: {
        cityId:              city.id,
        stepOrder:           s.stepOrder,
        section:             s.section,
        phase:               s.phase,
        titleDE:             s.titleDE,
        titleEN:             s.titleEN,
        subtitleDE:          s.subtitleDE  ?? null,
        subtitleEN:          s.subtitleEN  ?? null,
        timingDE:            s.timingDE,
        timingEN:            s.timingEN,
        isWarning:           s.isWarning   ?? false,
        documents:           s.documents   ?? [],
        infoBoxDE:           s.infoBoxDE   ?? null,
        infoBoxEN:           s.infoBoxEN   ?? null,
        infoBoxType:         s.infoBoxType ?? null,
        tags:                s.tags        ?? [],
        forEmployed:         s.forEmployed  ?? true,
        forFreelancer:       s.forFreelancer ?? true,
        forFounder:          s.forFounder   ?? true,
        forFamily:           s.forFamily    ?? true,
        forPassive:          s.forPassive   ?? true,
        forPair:             s.forPair      ?? true,
        isActive:            true,
        riskLevel:           s.riskLevel           ?? 'low',
        requiresLegalAdvice: s.requiresLegalAdvice  ?? false,
        sourceUrl:           s.sourceUrl            ?? null,
        sourceLabel:         s.sourceLabel          ?? null,
        lastVerified:        LAST_VERIFIED,
        translationSource:   s.translationSource    ?? 'manual',
      },
    });
    inserted++;
  }

  console.log(`\n✓ Inserted ${inserted} guide steps for ${city.nameDE ?? CITY_SLUG}`);

  // Summary by section
  const sections = [...new Set(STEPS.map(s => s.section))];
  for (const sec of sections) {
    const secSteps = STEPS.filter(s => s.section === sec);
    const highRisk = secSteps.filter(s => s.riskLevel === 'high').length;
    console.log(`  ${sec.padEnd(14)} ${secSteps.length} steps  (${highRisk} high-risk)`);
  }

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(String(err));
  prisma.$disconnect().catch(() => undefined);
  process.exit(1);
});
