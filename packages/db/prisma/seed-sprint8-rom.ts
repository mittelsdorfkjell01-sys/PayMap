/**
 * Sprint 8 — Rom (Rome) Moving Guide Seed
 * Nachzug für Sprint 8 — ROM fehlte in seed-sprint8-guides.ts.
 * Erstellt auch den City-Eintrag falls noch nicht vorhanden.
 * Run: npx ts-node --project tsconfig.json prisma/seed-sprint8-rom.ts
 * Sources: agenziaentrate.gov.it, comune.roma.it, mise.gov.it, esteri.it
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();
const NOW = new Date('2026-05-28T00:00:00Z');

type Doc = { titleDE: string; titleEN: string };

type GuideStep = {
  stepOrder: number;
  phase: string;
  section: string;
  titleDE: string;
  titleEN: string;
  subtitleDE?: string;
  subtitleEN?: string;
  timingDE: string;
  timingEN: string;
  isWarning?: boolean;
  documents: Doc[];
  infoBoxDE?: string;
  infoBoxEN?: string;
  infoBoxType?: string;
  tags?: string[];
  riskLevel: 'low' | 'medium' | 'high';
  requiresLegalAdvice?: boolean;
  sourceUrl?: string;
  sourceLabel?: string;
  forEmployed?: boolean;
  forFreelancer?: boolean;
  forFounder?: boolean;
  forFamily?: boolean;
};

// ─── 1 · BUREAUCRACY ─────────────────────────────────────────────────────────

const rom_bureaucracy: GuideStep[] = [
  {
    stepOrder: 0,
    phase: 'critical',
    section: 'bureaucracy',
    titleDE: 'Wegzugsbesteuerung §6 AStG prüfen',
    titleEN: 'Check exit taxation §6 AStG',
    subtitleDE: 'Gilt bei GmbH-Anteilen ≥ 1 % oder stillen Reserven im Wertpapierdepot',
    subtitleEN: 'Applies to GmbH stakes ≥ 1% or unrealised gains in securities',
    timingDE: 'Sofort — vor jeder weiteren Planung',
    timingEN: 'Immediately — before any further planning',
    isWarning: true,
    riskLevel: 'high',
    requiresLegalAdvice: true,
    sourceUrl: 'https://www.gesetze-im-internet.de/astg/__6.html',
    sourceLabel: '§6 AStG – Außensteuergesetz, gesetze-im-internet.de (2025)',
    documents: [
      { titleDE: 'GmbH-Gesellschaftsvertrag / Depotauszug 12 Monate', titleEN: 'GmbH articles / depot statement 12 months' },
    ],
    infoBoxDE: '§6 AStG löst bei Wegzug aus Deutschland eine fiktive Veräußerung aus — für GmbH-Beteiligungen ≥ 1 % und Wertpapierpositionen mit stillen Reserven. Zielland Italien ist EU: Stundung möglich, aber Zinsen laufen ab Wegzugsjahr. Ratenzahlung in 7 Jahresraten möglich. Steuerberater beauftragen — Versäumnisse sind teuer. Diese Information ersetzt keine steuerliche Beratung.',
    infoBoxEN: '§6 AStG triggers a deemed disposal on leaving Germany — for GmbH stakes ≥ 1% and securities with unrealised gains. Italy is EU: deferral possible, but interest accrues from year of departure. Instalment over 7 years possible. Engage a tax adviser — omissions are costly. This information is for guidance only.',
    infoBoxType: 'danger',
    tags: ['critical', 'external_expert'],
  },
  {
    stepOrder: 1,
    phase: 'before_move',
    section: 'bureaucracy',
    titleDE: 'Abmeldung in Deutschland',
    titleEN: 'Deregistration in Germany',
    timingDE: 'Frühestens 1 Woche vor, spätestens 2 Wochen nach Auszug',
    timingEN: 'Earliest 1 week before, latest 2 weeks after moving out',
    riskLevel: 'medium',
    requiresLegalAdvice: false,
    sourceUrl: 'https://www.bmi.bund.de/DE/themen/verfassung/staatliche-ordnung/meldewesen/meldewesen-node.html',
    sourceLabel: 'Bundesmeldegesetz §17 – BMI (2025)',
    documents: [
      { titleDE: 'Personalausweis / Reisepass', titleEN: 'National ID / passport' },
      { titleDE: 'Abmeldeformular (Einwohnermeldeamt)', titleEN: 'Deregistration form (registration office)' },
    ],
    infoBoxDE: 'Abmeldung beim Einwohnermeldeamt der letzten deutschen Wohngemeinde. Danach: Finanzamt informieren, Krankenversicherung kündigen/übertragen, GEZ abmelden. Abmeldebestätigung aufbewahren — wird für die Residenza-Anmeldung in Rom und für dt. Steuererklärungen benötigt.',
    infoBoxEN: 'Deregister at the registration office of your last German municipality. Afterwards: notify the Finanzamt, cancel/transfer health insurance, deregister from GEZ. Keep the confirmation — needed for Residenza registration in Rome and German tax returns.',
    infoBoxType: 'info',
    tags: ['paperwork'],
  },
  {
    stepOrder: 2,
    phase: 'arrival',
    section: 'bureaucracy',
    titleDE: 'Codice Fiscale beantragen — italienische Steuernummer',
    titleEN: 'Apply for Codice Fiscale — Italian tax ID number',
    subtitleDE: 'Ohne Codice Fiscale keine Wohnung, kein Bankkonto, kein Arzt',
    subtitleEN: 'Without Codice Fiscale no flat, no bank account, no doctor',
    timingDE: 'Erster Tag nach Ankunft — höchste Priorität',
    timingEN: 'First day after arrival — top priority',
    riskLevel: 'low',
    requiresLegalAdvice: false,
    sourceUrl: 'https://www.agenziaentrate.gov.it/portale/web/guest/schede/istanze/richiesta-tesserino-codice-fiscale',
    sourceLabel: 'Codice Fiscale – Agenzia delle Entrate (2025)',
    documents: [
      { titleDE: 'Reisepass oder Personalausweis (EU-Bürger)', titleEN: 'Passport or national ID (EU citizen)' },
    ],
    infoBoxDE: 'Der Codice Fiscale (CF) ist die 16-stellige alphanumerische Steuernummer — Voraussetzung für nahezu alles in Italien. In Rom: Agenzia delle Entrate persönlich aufsuchen (mehrere Büros in Roma; Termin buchbar auf agenziaentrate.gov.it). Alternativ: dt. Botschaft Rom (Via San Martino della Battaglia 4) kann CF für EU-Bürger vorab ausstellen. Bearbeitungszeit vor Ort: 15–30 Minuten. Kostenlos.',
    infoBoxEN: 'The Codice Fiscale (CF) is the 16-character alphanumeric tax number — a prerequisite for almost everything in Italy. In Rome: visit the Agenzia delle Entrate in person (several offices in Rome; appointments via agenziaentrate.gov.it). Alternatively: the German Embassy Rome (Via San Martino della Battaglia 4) can issue a CF for EU citizens. On-site: 15–30 minutes. Free.',
    infoBoxType: 'info',
    tags: ['codice_fiscale', 'tax_id', 'paperwork'],
  },
  {
    stepOrder: 3,
    phase: 'arrival',
    section: 'bureaucracy',
    titleDE: 'Residenza — Anmeldung beim Municipio (Comune di Roma)',
    titleEN: 'Residenza — registration at the Municipio (Comune di Roma)',
    subtitleDE: 'EU-Bürger müssen sich innerhalb von 3 Monaten beim Comune anmelden',
    subtitleEN: 'EU citizens must register within 3 months',
    timingDE: 'Innerhalb von 3 Monaten nach Einzug',
    timingEN: 'Within 3 months of moving in',
    riskLevel: 'medium',
    requiresLegalAdvice: false,
    sourceUrl: 'https://www.comune.roma.it/web/it/scheda-servizio.page?contentId=INF9116',
    sourceLabel: 'Iscrizione Anagrafica – Comune di Roma (2025)',
    documents: [
      { titleDE: 'Reisepass / Personalausweis', titleEN: 'Passport / national ID' },
      { titleDE: 'Mietvertrag (registriert bei Agenzia delle Entrate)', titleEN: 'Rental agreement (registered with Agenzia delle Entrate)' },
      { titleDE: 'Codice Fiscale', titleEN: 'Codice Fiscale' },
      { titleDE: 'Nachweis Krankenversicherung oder Arbeitsverhältnis', titleEN: 'Proof of health insurance or employment' },
    ],
    infoBoxDE: 'EU-Bürger melden sich beim Municipio/Anagrafe an, das für ihren Wohnbezirk in Rom zuständig ist (Roma ist in 15 Municipii aufgeteilt). Termin online buchbar über roma.it. Hinweis: Rom hat deutlich längere Wartezeiten als Mailand — 60–90 Tage Bearbeitung sind normal. Statt Termin beim Municipio kann die Anmeldung auch per PEC (zertifiziertes E-Mail) eingereicht werden (Ausdruck + Selfie + Dokumente). Die Residenza ist Voraussetzung für Tessera Sanitaria und Medico di Base.',
    infoBoxEN: 'EU citizens register at the Municipio/Anagrafe responsible for their residential district in Rome (Rome is divided into 15 Municipii). Appointments bookable online via roma.it. Note: Rome has significantly longer processing times than Milan — 60–90 days is normal. Instead of an appointment, registration can also be submitted by PEC (certified email) with printout + selfie + documents. Residenza is a prerequisite for the Tessera Sanitaria and GP registration.',
    infoBoxType: 'info',
    tags: ['residenza', 'registration', 'comune'],
  },
  {
    stepOrder: 4,
    phase: 'first_month',
    section: 'bureaucracy',
    titleDE: 'Tessera Sanitaria — Gesundheitskarte und Medico di Base (Hausarzt)',
    titleEN: 'Tessera Sanitaria — health card and GP registration',
    timingDE: 'Nach Residenza-Anmeldung — innerhalb von 4 Wochen',
    timingEN: 'After Residenza registration — within 4 weeks',
    riskLevel: 'low',
    requiresLegalAdvice: false,
    documents: [
      { titleDE: 'Residenza-Bescheinigung', titleEN: 'Residenza certificate' },
      { titleDE: 'Codice Fiscale', titleEN: 'Codice Fiscale' },
    ],
    infoBoxDE: 'Tessera Sanitaria: ASL Roma (Azienda Sanitaria Locale Roma 1-6, je nach Wohnbezirk). Gleichzeitig: Medico di Base aus der ASL-Liste wählen. Wartezeiten für den Hausarzt in Rom oft 3–6 Wochen — als Überbrückung Poliambulatori oder Pronto Soccorso (Notaufnahme) nutzen. EHIC (europäische Krankenkassenkarte) gilt bis zur Tessera, max. 3 Monate.',
    infoBoxEN: 'Tessera Sanitaria: ASL Roma (Azienda Sanitaria Locale Roma 1-6, depending on district). At the same time: choose GP from the ASL list. GP waiting times in Rome often 3–6 weeks — use Poliambulatori or Pronto Soccorso as stopgap. EHIC valid until Tessera, max. 3 months.',
    infoBoxType: 'info',
    tags: ['health_card', 'gp', 'nhs'],
  },
  {
    stepOrder: 5,
    phase: 'first_3_months',
    section: 'bureaucracy',
    titleDE: 'KFZ-Ummeldung und Führerschein',
    titleEN: 'Vehicle re-registration and driving licence',
    timingDE: '60 Tage nach Residenza-Anmeldung',
    timingEN: '60 days after Residenza registration',
    riskLevel: 'low',
    requiresLegalAdvice: false,
    documents: [],
    infoBoxDE: 'EU-Führerschein dauerhaft gültig in Italien — kein Umtausch nötig. Deutsches KFZ: innerhalb von 60 Tagen nach Residenza auf IT-Kennzeichen ummelden (Motorizzazione Civile). Alternativ: KFZ in DE abmelden und in IT neu zulassen. Bollo (KFZ-Steuer): ca. 150–500 € jährlich je nach PS.',
    infoBoxEN: 'EU driving licence permanently valid in Italy — no exchange required. German vehicle: re-register with Italian plates within 60 days of Residenza (Motorizzazione Civile). Alternative: deregister vehicle in Germany and re-register in Italy. Bollo (road tax): approx. €150–500 annually depending on engine power.',
    infoBoxType: 'info',
    tags: ['driving_licence', 'vehicle'],
  },
];

// ─── 2 · TAX PLANNING ────────────────────────────────────────────────────────

const rom_tax_planning: GuideStep[] = [
  {
    stepOrder: 10,
    phase: 'critical',
    section: 'tax_planning',
    titleDE: 'DBA Deutschland–Italien und steuerliche Ansässigkeit',
    titleEN: 'Germany–Italy DTA and tax residency',
    subtitleDE: 'Doppelbesteuerungsabkommen DE–IT bestimmt primäres Besteuerungsrecht',
    subtitleEN: 'DTA determines which state has primary taxing rights',
    timingDE: 'Vor Wegzug — spätestens bei Residenza-Anmeldung',
    timingEN: 'Before departure — at the latest on Residenza registration',
    isWarning: true,
    riskLevel: 'high',
    requiresLegalAdvice: true,
    sourceUrl: 'https://www.bundesfinanzministerium.de/Web/DE/Themen/Steuern/Internationales_Steuerrecht/Staatenbezogene_Informationen/Laenderinformationen/H-L/Italien.html',
    sourceLabel: 'DBA Deutschland–Italien – Bundesfinanzministerium (2025)',
    documents: [
      { titleDE: 'Letzter dt. Steuerbescheid', titleEN: 'Most recent German tax assessment' },
      { titleDE: 'Residenza-Bescheinigung', titleEN: 'Residenza certificate' },
    ],
    infoBoxDE: 'Das DBA DE–IT (in Kraft seit 1992, Revisionsprotokoll 2015) bestimmt bei Doppelansässigkeit, welchem Staat das primäre Besteuerungsrecht zusteht. Wer in IT Residenza anmeldet und in DE keine Wohnung mehr hält, wird steuerlich IT-Ansässiger ab Meldedatum. Grenzgänger und Remote-Worker mit dt. Arbeitgeber: 183-Tage-Regel beachten (Art. 15 DBA). Wichtig: Abmeldung beim deutschen Finanzamt (nicht nur beim Einwohnermeldeamt). Steuerberater mit DBA DE-IT-Erfahrung einschalten. Diese Information ersetzt keine steuerliche Beratung.',
    infoBoxEN: 'The Germany–Italy DTA (in force since 1992, revision protocol 2015) determines, in cases of dual residency, which state has primary taxing rights. Those who register Residenza in Italy and no longer maintain a dwelling in Germany become Italian tax residents from the registration date. Cross-border and remote workers with German employer: observe 183-day rule (Art. 15 DTA). Key: deregister with German Finanzamt. Engage a DBA DE-IT expert. This information does not constitute tax advice.',
    infoBoxType: 'danger',
    tags: ['critical', 'external_expert', 'dba'],
  },
  {
    stepOrder: 11,
    phase: 'before_move',
    section: 'tax_planning',
    titleDE: 'Regime degli Impatriati — 50 % Steuerbefreiung für Zuzügler (ab 2024)',
    titleEN: 'Regime degli Impatriati — 50% tax exemption for new residents (from 2024)',
    subtitleDE: 'Bedeutendstes Steuerprivileg Italiens — Antrag im ersten Steuerjahr stellen',
    subtitleEN: "Italy's most significant tax incentive for newcomers",
    timingDE: 'Antrag im ersten Jahr der IT-Steueransässigkeit',
    timingEN: 'Apply in the first year of Italian tax residency',
    riskLevel: 'medium',
    requiresLegalAdvice: false,
    sourceUrl: 'https://www.agenziaentrate.gov.it/portale/web/guest/schede/agevolazioni/regime-impatriati',
    sourceLabel: 'Regime degli Impatriati – Agenzia delle Entrate (2025)',
    documents: [
      { titleDE: 'Nachweis mind. 3 Jahre Auslandsaufenthalt', titleEN: 'Proof of at least 3 years abroad' },
      { titleDE: 'Arbeitsvertrag oder Freiberufler-Nachweis IT', titleEN: 'Employment contract or freelance documentation Italy' },
    ],
    infoBoxDE: 'Seit D.Lgs. 209/2023 (ab Steuerjahr 2024): 50 % des Einkommens steuerfrei, max. steuerpflichtiges Einkommen 600.000 €/Jahr. Voraussetzungen: (1) mind. 3 Steuerjahre NICHT in IT steueransässig, (2) Verpflichtung mind. 4 Jahre in IT zu bleiben, (3) Beschäftigung oder selbstständige Tätigkeit in IT. Gilt 5 Jahre (nicht verlängerbar). Beispiel: 80.000 € Brutto → 40.000 € steuerpflichtig → ca. 11.000 € IRPEF (eff. 13,8 %). Antrag über Arbeitgeber oder Modello Redditi.',
    infoBoxEN: 'Since D.Lgs. 209/2023 (from tax year 2024): 50% of income is tax-exempt, max. taxable income €600,000/year. Requirements: (1) NOT tax resident in Italy for at least 3 tax years, (2) commitment to remain tax resident in Italy for at least 4 years, (3) employment or self-employment in Italy. Valid 5 years (not extendable). Example: €80,000 gross → €40,000 taxable → approx. €11,000 IRPEF (eff. 13.8%). Application via employer or Modello Redditi.',
    infoBoxType: 'info',
    tags: ['impatriati', 'tax_incentive', 'special_regime'],
  },
  {
    stepOrder: 12,
    phase: 'before_move',
    section: 'tax_planning',
    titleDE: 'Wegzugsbesteuerung §6 AStG — Zusammenfassung EU-Fall',
    titleEN: 'Exit taxation §6 AStG — EU case summary',
    timingDE: 'Sofort bei Planung',
    timingEN: 'Immediately on planning',
    isWarning: true,
    riskLevel: 'high',
    requiresLegalAdvice: true,
    sourceUrl: 'https://www.gesetze-im-internet.de/astg/__6.html',
    sourceLabel: '§6 AStG — Außensteuergesetz (2025)',
    documents: [
      { titleDE: 'Depotauszüge letzten 12 Monate', titleEN: 'Portfolio statements last 12 months' },
      { titleDE: 'GmbH-Gesellschafterliste falls zutreffend', titleEN: 'GmbH shareholder list if applicable' },
    ],
    infoBoxDE: '§6 AStG: Wegzug nach IT (EU) → Stundung der §6-Steuerschuld möglich (§6 Abs. 5 AStG), aber Zinsen (1,8 %/Jahr ab Wegzugsjahr) laufen. Zahlungsplan: 7 Jahresraten auf Antrag. Rückkehr innerhalb von 7 Jahren: Steuer entfällt rückwirkend. Versäumte Meldung beim Finanzamt: erhebliches Bußgeldrisiko. Regime degli Impatriati und §6 AStG können zeitgleich laufen — Steuerberater mit beiden Rechtsordnungen beauftragen. Diese Information ersetzt keine steuerliche Beratung.',
    infoBoxEN: '§6 AStG: departure to Italy (EU) → deferral of §6 tax liability possible (§6 para. 5 AStG), but interest (1.8%/year from year of departure) accrues. Payment plan: 7 annual instalments on application. Return within 7 years: tax lapses retrospectively. Missed notification to Finanzamt: significant penalty risk. Impatriati regime and §6 AStG can run simultaneously — engage a tax adviser with expertise in both jurisdictions. This information does not constitute tax advice.',
    infoBoxType: 'danger',
    tags: ['critical', 'external_expert'],
  },
  {
    stepOrder: 13,
    phase: 'arrival',
    section: 'tax_planning',
    titleDE: 'Partita IVA — Mehrwertsteuernummer für Selbstständige',
    titleEN: 'Partita IVA — VAT number for the self-employed',
    timingDE: 'Vor Beginn der selbstständigen Tätigkeit in IT',
    timingEN: 'Before starting self-employed activity in Italy',
    riskLevel: 'medium',
    requiresLegalAdvice: false,
    sourceUrl: 'https://www.agenziaentrate.gov.it/portale/web/guest/schede/istanze/apertura-partita-iva',
    sourceLabel: 'Apertura Partita IVA – Agenzia delle Entrate (2025)',
    documents: [
      { titleDE: 'Codice Fiscale', titleEN: 'Codice Fiscale' },
      { titleDE: 'Residenza-Bescheinigung', titleEN: 'Residenza certificate' },
    ],
    infoBoxDE: 'Wer in Italien selbstständig tätig ist, muss eine Partita IVA bei der Agenzia delle Entrate eröffnen. Beantragung kostenlos, online oder persönlich. Relevant ist der ATECO-Code (Tätigkeitsschlüssel) — falsche Codierung kann zu steuerlichen Problemen führen. Kleinstunternehmer mit ≤ 85.000 €/Jahr: Forfettario-Regime (15 % Pauschalsteuer) oft sinnvoll — prüfen ob vereinbar mit Regime Impatriati (nicht gleichzeitig möglich). Commercialista (Steuerberater) beauftragen.',
    infoBoxEN: 'Anyone self-employed in Italy must open a Partita IVA at the Agenzia delle Entrate. Application free, online or in person. The ATECO code (activity code) is important — wrong classification can cause tax issues. Micro-entrepreneurs with ≤ €85,000/year: Forfettario regime (15% flat tax) often beneficial — check compatibility with Impatriati regime (not simultaneously possible). Engage a Commercialista (Italian tax adviser).',
    infoBoxType: 'info',
    tags: ['vat', 'freelancer', 'partita_iva'],
    forFreelancer: true,
    forFounder: true,
    forEmployed: false,
  },
  {
    stepOrder: 14,
    phase: 'arrival',
    section: 'tax_planning',
    titleDE: 'Deutsche Rente in Italien — DBA-Besteuerungsrecht',
    titleEN: 'German pension in Italy — DTA taxing rights',
    timingDE: 'Klärung vor Rentenbeginn im Ausland',
    timingEN: 'Clarify before pension starts abroad',
    riskLevel: 'medium',
    requiresLegalAdvice: false,
    sourceUrl: 'https://www.bmas.de/DE/Soziales/Rentenversicherung/Rente-im-Ausland/rente-im-ausland.html',
    sourceLabel: 'Deutsche Rentenversicherung im Ausland – BMAS (2025)',
    documents: [],
    infoBoxDE: 'Gesetzliche dt. Renten werden nach dem DBA DE–IT im Wohnsitzstaat (IT) besteuert. Betriebsrenten und Pensionen: Besteuerungsrecht hängt vom Arbeitgeber ab (öffentlicher vs. privater Dienst). Private Rentenversicherungen (Riester, Basis-Rente): Quellenstaat-Regelung beachten. Doppelbesteuerung durch DBA-Anrechnung vermeidbar — Steuerberater empfohlen für individuelle Prüfung.',
    infoBoxEN: 'Statutory German pensions are taxed in the country of residence (Italy) under the Germany–Italy DTA. Occupational pensions: taxing rights depend on the employer (public vs. private sector). Private pension insurance (Riester, Basis-Rente): observe source-state rules. Double taxation avoidable through DTA credits — tax adviser recommended for individual review.',
    infoBoxType: 'info',
    tags: ['pension', 'retiree'],
    forEmployed: false,
    forFreelancer: false,
    forFounder: false,
    forFamily: false,
  },
];

// ─── 3 · BANKING ─────────────────────────────────────────────────────────────

const rom_banking: GuideStep[] = [
  {
    stepOrder: 20,
    phase: 'arrival',
    section: 'banking',
    titleDE: 'Bankkonto in Rom eröffnen — Reihenfolge wichtig',
    titleEN: 'Opening a bank account in Rome — order matters',
    subtitleDE: 'Codice Fiscale und Residenza (oder Residenznachweis) nötig',
    subtitleEN: 'Codice Fiscale and Residenza (or address proof) needed',
    timingDE: 'Erst nach CF, Wohnungsvertrag oder Residenza',
    timingEN: 'Only after CF, rental contract or Residenza',
    riskLevel: 'low',
    requiresLegalAdvice: false,
    documents: [
      { titleDE: 'Codice Fiscale', titleEN: 'Codice Fiscale' },
      { titleDE: 'Reisepass', titleEN: 'Passport' },
      { titleDE: 'Mietvertrag (registriert)', titleEN: 'Rental agreement (registered)' },
    ],
    infoBoxDE: 'Empfohlene Banken für Neuresident*innen in Rom: UniCredit (IT-weit präsent, gute Online-Infrastruktur), Intesa Sanpaolo (flächendeckend, gute Filialdichte), Banca Mediolanum (digital, wenig Filialen). Poste Italiane (BancoPosta) — sehr weit verbreitet, für einfache Konten. Neobanken: Revolut und N26 als Übergangslösung bis zum Hauptkonto. Ohne Codice Fiscale kein reguläres IT-Konto möglich.',
    infoBoxEN: 'Recommended banks for new residents in Rome: UniCredit (nationwide, good online infrastructure), Intesa Sanpaolo (widespread, dense branch network), Banca Mediolanum (digital, few branches). Poste Italiane (BancoPosta) — very widespread, for basic accounts. Neobanks: Revolut and N26 as bridging solution until main account opened. No Codice Fiscale = no regular Italian account.',
    infoBoxType: 'info',
    tags: ['banking', 'account'],
  },
  {
    stepOrder: 21,
    phase: 'arrival',
    section: 'banking',
    titleDE: 'Deutsches Konto parallel behalten',
    titleEN: 'Keep German bank account in parallel',
    timingDE: 'Mindestens 6 Monate nach Umzug',
    timingEN: 'At least 6 months after relocation',
    riskLevel: 'low',
    requiresLegalAdvice: false,
    documents: [],
    infoBoxDE: 'Dt. Konto für: schwebende Zahlungen, dt. Steuerrückzahlungen, Arbeitgeber-Überweisungen in Übergangsphase. Wise-Konto (EUR → EUR) als kostengünstiger Transfer zwischen DE und IT empfohlen. Viele deutsche Direktbanken (ING, DKB) kündigen Konten nicht sofort nach Abmeldung — Priorität: kein Hauptwohnsitz mehr in DE = Konto aktiv halten solange erlaubt.',
    infoBoxEN: 'Keep German account for: pending payments, German tax refunds, employer payments in transition phase. Wise account (EUR → EUR) recommended for cost-efficient transfers between DE and IT. Many German direct banks (ING, DKB) don\'t immediately close accounts after deregistration — priority: no main domicile in Germany = keep account active as long as allowed.',
    infoBoxType: 'info',
    tags: ['banking', 'transfer'],
  },
  {
    stepOrder: 22,
    phase: 'arrival',
    section: 'banking',
    titleDE: 'IBAN für Behörden und Arbeitgeber hinterlegen',
    titleEN: 'Register IBAN with authorities and employer',
    timingDE: 'Sobald IT-Konto eröffnet',
    timingEN: 'As soon as Italian account is open',
    riskLevel: 'low',
    requiresLegalAdvice: false,
    documents: [
      { titleDE: 'IBAN-Bescheinigung (Kontoauszug oder Online-Banking)', titleEN: 'IBAN confirmation (bank statement or online banking)' },
    ],
    infoBoxDE: 'IT-IBAN bei: INPS (Sozialversicherung), Agenzia delle Entrate (Steuerrückerstattungen), Arbeitgeber. SEPA-Zahlungen aus DE nach IT: Standard, keine Mehrkosten. Einige IT-Behörden akzeptieren noch keinen ausländischen IBAN — dann IT-Konto prioritär.',
    infoBoxEN: 'Register IT IBAN with: INPS (social security), Agenzia delle Entrate (tax refunds), employer. SEPA payments from Germany to Italy: standard, no extra cost. Some Italian authorities do not yet accept foreign IBAN — Italian account is then a priority.',
    infoBoxType: 'info',
    tags: ['banking', 'iban'],
  },
];

// ─── 4 · INSURANCE ───────────────────────────────────────────────────────────

const rom_insurance: GuideStep[] = [
  {
    stepOrder: 30,
    phase: 'arrival',
    section: 'insurance',
    titleDE: 'SSN (Servizio Sanitario Nazionale) — staatliche Krankenversorgung',
    titleEN: 'SSN (Servizio Sanitario Nazionale) — public health system',
    timingDE: 'Zugang nach Residenza-Anmeldung und Tessera Sanitaria',
    timingEN: 'Access after Residenza registration and Tessera Sanitaria',
    riskLevel: 'low',
    requiresLegalAdvice: false,
    documents: [
      { titleDE: 'Tessera Sanitaria', titleEN: 'Tessera Sanitaria' },
    ],
    infoBoxDE: 'Das SSN (staatliches Gesundheitssystem) ist in Rom über die ASL Roma 1-6 zugänglich. Qualität schwankend — Wartezeiten in öffentlichen Strukturen oft lang (Spezialist 4–12 Wochen), Notaufnahme (Pronto Soccorso) funktioniert gut. Viele Expats ergänzen mit privater Zusatzversicherung. Beitragsfreier Zugang für EU-Bürger mit Residenza.',
    infoBoxEN: 'The SSN (public health system) in Rome is accessible via ASL Roma 1-6. Quality varies — waiting times in public facilities often long (specialist 4–12 weeks), emergency (Pronto Soccorso) works well. Many expats supplement with private insurance. Free access for EU citizens with Residenza.',
    infoBoxType: 'info',
    tags: ['health', 'ssn', 'public_health'],
  },
  {
    stepOrder: 31,
    phase: 'arrival',
    section: 'insurance',
    titleDE: 'Private Krankenversicherung als Ergänzung',
    titleEN: 'Private health insurance as supplement',
    timingDE: 'Empfohlen ab Ankunft oder parallel zu SSN',
    timingEN: 'Recommended from arrival or alongside SSN',
    riskLevel: 'low',
    requiresLegalAdvice: false,
    documents: [],
    infoBoxDE: 'Empfohlene private KV-Anbieter in IT: UniSalute, Generali Welthundert/Italia, Allianz Care (für Expats), AXA Italy. Kosten: ca. 50–200 €/Monat je nach Alter und Umfang. Wichtig für: kürzere Wartezeiten, private Spezialistenbesuche, Zahnbehandlung (SSN-Leistung sehr eingeschränkt). Deutsche gesetzliche KV (GKV): kündigen oder ruhend stellen — für Rückkehroption prüfen.',
    infoBoxEN: 'Recommended private health insurers in Italy: UniSalute, Generali, Allianz Care (for expats), AXA Italy. Costs: approx. €50–200/month depending on age and coverage. Important for: shorter waiting times, private specialist visits, dental (SSN coverage very limited). German statutory health insurance (GKV): cancel or put on hold — check for return option.',
    infoBoxType: 'info',
    tags: ['health', 'private_insurance'],
  },
  {
    stepOrder: 32,
    phase: 'before_move',
    section: 'insurance',
    titleDE: 'Haftpflicht, Hausrat und Rechtsschutz in Italien',
    titleEN: 'Liability, contents and legal expenses insurance in Italy',
    timingDE: 'Vor oder kurz nach Einzug',
    timingEN: 'Before or shortly after moving in',
    riskLevel: 'low',
    requiresLegalAdvice: false,
    documents: [],
    infoBoxDE: 'Haftpflicht (Responsabilità Civile Privata): in IT weniger verbreitet als in DE, aber empfohlen. Hausratversicherung: oft Pflicht im Mietvertrag (Verhandlungssache). Anbieter: Generali, Allianz IT, AXA IT, ConTe.it (Online). KFZ-Versicherung: Pflicht ab erster Nutzung in IT. Deutscher Anbieter kann ggf. ital. Zusatztarif anbieten.',
    infoBoxEN: 'Liability insurance (Responsabilità Civile Privata): less common in Italy than in Germany, but recommended. Contents insurance: often required in rental contracts (negotiable). Providers: Generali, Allianz IT, AXA IT, ConTe.it (online). Car insurance: mandatory from first use in Italy. German provider may offer Italian add-on tariff.',
    infoBoxType: 'info',
    tags: ['insurance', 'liability', 'contents'],
  },
];

// ─── 5 · HOUSING ─────────────────────────────────────────────────────────────

const rom_housing: GuideStep[] = [
  {
    stepOrder: 40,
    phase: 'before_move',
    section: 'housing',
    titleDE: 'Wohnungssuche in Rom — Plattformen und Realismus',
    titleEN: 'Apartment search in Rome — platforms and realistic expectations',
    timingDE: '3-6 Monate vor Umzug beginnen',
    timingEN: 'Start 3-6 months before moving',
    riskLevel: 'low',
    requiresLegalAdvice: false,
    documents: [],
    infoBoxDE: 'Wichtigste Plattformen: immobiliare.it (größtes IT-Portal), idealista.it (Expats-freundlich, gute Karte), casa.it, Subito.it. Immobilienmakler (Agenzie Immobiliari): in Rom sehr verbreitet — Provision oft 1 Monatsmiete + MwSt von Mieter. Populäre Auswanderer-Viertel: Prati (sicher, zentral), Trastevere (lebendig), Testaccio (authentisch), EUR (modern, ruhig), Parioli (gehoben). Mietpreise 2026: 1-Zi ca. 1.000–2.200 €, 2-Zi 1.400–3.200 € je nach Lage.',
    infoBoxEN: 'Key platforms: immobiliare.it (largest Italian portal), idealista.it (expat-friendly, good map), casa.it, Subito.it. Estate agents (Agenzie Immobiliari): very common in Rome — commission often 1 month\'s rent + VAT from tenant. Popular expat districts: Prati (safe, central), Trastevere (lively), Testaccio (authentic), EUR (modern, quiet), Parioli (upscale). Rents 2026: 1-bed approx. €1,000–2,200, 2-bed €1,400–3,200 depending on location.',
    infoBoxType: 'info',
    tags: ['housing', 'rent', 'search'],
  },
  {
    stepOrder: 41,
    phase: 'arrival',
    section: 'housing',
    titleDE: 'Mietvertrag — Typen und rechtliche Anforderungen',
    titleEN: 'Rental contract — types and legal requirements',
    timingDE: 'Vor Vertragsunterzeichnung prüfen',
    timingEN: 'Check before signing',
    riskLevel: 'medium',
    requiresLegalAdvice: false,
    sourceUrl: 'https://www.agenziaentrate.gov.it/portale/web/guest/schede/istanze/registrazione-contratti-di-locazione',
    sourceLabel: 'Locazioni – Agenzia delle Entrate (2025)',
    documents: [
      { titleDE: 'Mietvertrag (Contratto di Locazione)', titleEN: 'Rental contract (Contratto di Locazione)' },
      { titleDE: 'Codice Fiscale', titleEN: 'Codice Fiscale' },
    ],
    infoBoxDE: 'Vertragtypen in IT: (1) 4+4 (Standard, 4 Jahre + 4 Jahre Verlängerung), (2) 3+2 (kürzere Laufzeit), (3) Transitorio (bis 18 Monate, höherer Preis). Alle Verträge müssen bei Agenzia delle Entrate registriert werden — sonst ungültig und Residenza nicht möglich. Kaution: max. 3 Monatsmieten gesetzlich (anders als in ES/PT). Wichtig: Apartmentübergabe-Protokoll (Verbale di Consegna) unterzeichnen.',
    infoBoxEN: 'Contract types in Italy: (1) 4+4 (standard, 4 years + 4-year renewal), (2) 3+2 (shorter term), (3) Transitorio (up to 18 months, higher price). All contracts must be registered at Agenzia delle Entrate — otherwise invalid and Residenza not possible. Deposit: max. 3 months\' rent by law (unlike Spain/Portugal). Important: sign the handover protocol (Verbale di Consegna).',
    infoBoxType: 'info',
    tags: ['housing', 'contract', 'legal'],
  },
  {
    stepOrder: 42,
    phase: 'arrival',
    section: 'housing',
    titleDE: 'Utilities (Strom, Gas, Wasser, Internet) anmelden',
    titleEN: 'Set up utilities (electricity, gas, water, internet)',
    timingDE: 'Bei oder kurz nach Einzug',
    timingEN: 'At or shortly after moving in',
    riskLevel: 'low',
    requiresLegalAdvice: false,
    documents: [
      { titleDE: 'Codice Fiscale', titleEN: 'Codice Fiscale' },
      { titleDE: 'IBAN / IT-Bankkonto', titleEN: 'IBAN / Italian bank account' },
    ],
    infoBoxDE: 'Strom: Enel (Marktführer), Edison, Plenitude. Gas: Eni, Italgas. Internet: TIM Fibra, Vodafone IT, Fastweb, WINDTRE — Glasfaser in Römer Innenstadt weitgehend verfügbar, Außenbezirke manchmal nur FTTC. Utilities-Übertragung bei Eigentümerwechsel: Vermieter organisiert oft; Neuanmeldung bei Direktbuchung ca. 2–4 Wochen. Tipp: IT-Konto und Codice Fiscale vorher bereithalten — ohne CF kein Strom-/Gas-Vertrag.',
    infoBoxEN: 'Electricity: Enel (market leader), Edison, Plenitude. Gas: Eni, Italgas. Internet: TIM Fibra, Vodafone IT, Fastweb, WINDTRE — fibre in Rome\'s inner city largely available, outer districts sometimes FTTC only. Utility transfer on change of occupant: landlord often organises; new registration if direct booking takes approx. 2–4 weeks. Tip: have Italian account and Codice Fiscale ready — no utility contract without CF.',
    infoBoxType: 'info',
    tags: ['utilities', 'internet', 'electricity'],
  },
];

// ─── 6 · PRACTICAL ───────────────────────────────────────────────────────────

const rom_practical: GuideStep[] = [
  {
    stepOrder: 50,
    phase: 'arrival',
    section: 'practical',
    titleDE: 'Notrufnummern und Notfalldienste in Rom',
    titleEN: 'Emergency numbers and emergency services in Rome',
    timingDE: 'Sofort notieren',
    timingEN: 'Note immediately',
    riskLevel: 'low',
    requiresLegalAdvice: false,
    documents: [],
    infoBoxDE: 'Wichtige Nummern: 112 (Europäischer Notruf, gilt für Polizei/Feuerwehr/Rettung), 118 (Krankenwagen/Rettungsdienst), 113 (Polizia di Stato), 115 (Vigili del Fuoco/Feuerwehr), 1515 (Forstschutzbehörde). Private Ambulanzen: teurer aber oft schneller. Deutsche Botschaft Rom: +39 06 492131 (Via San Martino della Battaglia 4). Konsularischer Notdienst: +49 30 18172000 (aus IT)',
    infoBoxEN: 'Key numbers: 112 (European emergency, covers police/fire/rescue), 118 (ambulance), 113 (Polizia di Stato), 115 (Vigili del Fuoco/fire), 1515 (forest protection). Private ambulances: more expensive but often faster. German Embassy Rome: +39 06 492131 (Via San Martino della Battaglia 4). Consular emergency: +49 30 18172000 (from Italy)',
    infoBoxType: 'info',
    tags: ['emergency', 'safety'],
  },
  {
    stepOrder: 51,
    phase: 'arrival',
    section: 'practical',
    titleDE: 'Öffentlicher Nahverkehr in Rom',
    titleEN: 'Public transport in Rome',
    timingDE: 'Ab Ankunft nutzbar',
    timingEN: 'Available from arrival',
    riskLevel: 'low',
    requiresLegalAdvice: false,
    documents: [],
    infoBoxDE: 'ATAC (Azienda Tramvie e Autobus del Comune di Roma): Metro (A, B, B1, C), Tram, Bus. App: ATAC Roma, Moovit. Tageskarte: 7 €, Monatskarte: 35 € (stark subventioniert). Taxifahrten: Uber (normal Uber Black in Rom), Freenow — oder offizielle Taxis (Telefono: 060606). Wichtig: Entwerten beim Einsteigen (Kontrollen!). E-Scooter: Lime, Dott, Bird in der Innenstadt. Fahrrad: wenig Infrastruktur in Rom — weniger alltagstauglich als in anderen Hauptstädten.',
    infoBoxEN: 'ATAC (Azienda Tramvie e Autobus del Comune di Roma): Metro (A, B, B1, C), tram, bus. App: ATAC Roma, Moovit. Day pass: €7, monthly: €35 (heavily subsidised). Taxis: Uber (Uber Black mainly in Rome), Freenow — or official taxis (phone: 060606). Important: validate on entry (inspections!). E-scooters: Lime, Dott, Bird in the city centre. Cycling: poor infrastructure in Rome — less practical than other capitals.',
    infoBoxType: 'info',
    tags: ['transport', 'metro', 'bus'],
  },
  {
    stepOrder: 52,
    phase: 'before_move',
    section: 'practical',
    titleDE: 'Stecker und Spannungsversorgung in Italien',
    titleEN: 'Power plugs and voltage in Italy',
    timingDE: 'Vor dem Umzug klären',
    timingEN: 'Check before moving',
    riskLevel: 'low',
    requiresLegalAdvice: false,
    documents: [],
    infoBoxDE: 'Spannung: 230 V (wie DE). Frequenz: 50 Hz (wie DE). Steckertypen: Typ F (wie DE) und Typ L (3-poliger Schuko mit versetzten Stiften — IT-spezifisch). Deutsche Geräte mit Typ-F-Stecker funktionieren direkt. Adapter Typ L → Typ F für IT-Steckdosen mit kleinen Löchern. Einfache Adapter günstig in IT-Supermärkten erhältlich.',
    infoBoxEN: 'Voltage: 230 V (same as Germany). Frequency: 50 Hz (same as Germany). Plug types: Type F (same as Germany) and Type L (3-pin with offset pins — Italy-specific). German devices with Type F plugs work directly. Adapter Type L → Type F for Italian sockets with small holes. Simple adapters cheaply available in Italian supermarkets.',
    infoBoxType: 'info',
    tags: ['practical', 'electricity'],
  },
  {
    stepOrder: 53,
    phase: 'arrival',
    section: 'practical',
    titleDE: 'Haustiere nach Italien mitbringen — EU-Heimtierausweis',
    titleEN: 'Bringing pets to Italy — EU pet passport',
    timingDE: 'Vor Umzug klären (mind. 3 Wochen Vorlauf)',
    timingEN: 'Check before moving (min. 3 weeks lead time)',
    riskLevel: 'low',
    requiresLegalAdvice: false,
    sourceUrl: 'https://www.salute.gov.it/portale/temi/p2_6.jsp?lingua=italiano&id=5252&area=animali&menu=vuoto',
    sourceLabel: 'Animali da compagnia – Ministero della Salute (2025)',
    documents: [
      { titleDE: 'EU-Heimtierausweis mit Impfnachweis', titleEN: 'EU pet passport with vaccination record' },
      { titleDE: 'Gültiger Tollwutimpfschutz', titleEN: 'Valid rabies vaccination' },
    ],
    infoBoxDE: 'EU-Heimtierausweis (EU Pet Passport) gilt in IT direkt. Voraussetzung: gültige Tollwutimpfung, Microchip. Registrierung beim ital. Tierarzt (Veterinario) für IT-Ausweisdokument empfohlen. Hunde: Leinenpflicht in öffentlichen Räumen (Städte variieren). Keine spezifischen Rassenverbote national, aber einige Kommunen haben eigene Regelungen.',
    infoBoxEN: 'EU Pet Passport valid in Italy directly. Requirements: valid rabies vaccination, microchip. Registration with Italian vet (Veterinario) for Italian documentation recommended. Dogs: leash required in public spaces (cities vary). No national breed bans, but some municipalities have their own regulations.',
    infoBoxType: 'info',
    tags: ['pets', 'practical'],
  },
];

// ─── 7 · SOCIAL ──────────────────────────────────────────────────────────────

const rom_social: GuideStep[] = [
  {
    stepOrder: 60,
    phase: 'arrival',
    section: 'social',
    titleDE: 'Deutsche Schule Rom (DSR) — Bildungsoptionen für Kinder',
    titleEN: 'German School Rome (DSR) — educational options for children',
    timingDE: 'Anmeldung mind. 12 Monate vor Schulbeginn',
    timingEN: 'Enrolment at least 12 months before school start',
    riskLevel: 'low',
    requiresLegalAdvice: false,
    sourceUrl: 'https://www.dsrom.de',
    sourceLabel: 'Deutsche Schule Rom (DSR) — dsrom.de',
    documents: [
      { titleDE: 'Schulzeugnisse letzten 2 Jahre', titleEN: 'School reports last 2 years' },
      { titleDE: 'Sprachkompetenznachweis falls gefordert', titleEN: 'Language competence certificate if required' },
    ],
    infoBoxDE: 'Deutsche Schule Rom (DSR): Klasse 1–12, Dt. Abitur, anerkannte Auslandsschule. Standort: Viale Angelico 5–7, 00195 Roma. Schulgebühren: ca. 700–1.100 €/Monat je nach Klasse (Stand 2026). Warteliste — frühzeitig anmelden. Alternativ: Ambrit International School (IB-Programm), Marymount International School, St. George\'s British International School. Kindergärten: DSR hat auch Vorschule (Kindergarten). Öffentliche IT-Schulen: kostenlos, aber auf Italienisch.',
    infoBoxEN: 'German School Rome (DSR): grades 1–12, German Abitur, recognised overseas school. Location: Viale Angelico 5–7, 00195 Roma. School fees: approx. €700–1,100/month depending on year (2026). Waiting list — enrol early. Alternatives: Ambrit International School (IB), Marymount International School, St. George\'s British International School. Kindergartens: DSR also has pre-school. Italian state schools: free, but in Italian.',
    infoBoxType: 'info',
    tags: ['school', 'family', 'children'],
    forFamily: true,
  },
  {
    stepOrder: 61,
    phase: 'arrival',
    section: 'social',
    titleDE: 'Deutsche Community in Rom',
    titleEN: 'German community in Rome',
    timingDE: 'Ab Ankunft — Community-Kontakt aufbauen',
    timingEN: 'From arrival — build community connections',
    riskLevel: 'low',
    requiresLegalAdvice: false,
    sourceUrl: 'https://rom.diplo.de',
    sourceLabel: 'Deutsche Botschaft Rom — rom.diplo.de',
    documents: [],
    infoBoxDE: 'Anlaufstellen: Deutsche Botschaft Rom (Via San Martino della Battaglia 4, 00185 Roma) für konsularische Dienste. AHK Italien (Deutsch-Italienische Handelskammer, mailand.ahk.de — auch Büro in Rom). Goethe-Institut Rom für Kulturveranstaltungen und Sprachunterricht. Facebook-Gruppe "Deutsche in Rom" (ca. 8.000 Mitglieder). Meetup-Gruppen: Internations Rome, Expats in Rome. InterNations Rome-Chapter für anglophone + internationale Community.',
    infoBoxEN: 'Contact points: German Embassy Rome (Via San Martino della Battaglia 4, 00185 Roma) for consular services. AHK Italia (German-Italian Chamber of Commerce — also office in Rome). Goethe-Institut Rome for cultural events and language courses. Facebook group "Deutsche in Rom" (approx. 8,000 members). Meetup groups: InterNations Rome, Expats in Rome.',
    infoBoxType: 'info',
    tags: ['community', 'networking', 'expat'],
  },
  {
    stepOrder: 62,
    phase: 'arrival',
    section: 'social',
    titleDE: 'Italienisch lernen in Rom',
    titleEN: 'Learning Italian in Rome',
    timingDE: 'Empfohlen ab Ankunft',
    timingEN: 'Recommended from arrival',
    riskLevel: 'low',
    requiresLegalAdvice: false,
    documents: [],
    infoBoxDE: 'Sprachschulen in Rom: Scuola Leonardo da Vinci (Intensivkurse), Instituto Italiano (Gruppenkurse, günstig), Goethe-Institut (nur DE, für kulturelle Veranstaltungen). Online: Babbel, Duolingo als Ergänzung. A2-Niveau reicht für den Alltag; B1 für Behördengänge sinnvoll. Wichtig: Rohform-Italienisch wird akzeptiert — Rom ist tourismuserfahren, aber Englisch in Behörden oft kaum vorhanden.',
    infoBoxEN: 'Language schools in Rome: Scuola Leonardo da Vinci (intensive courses), Instituto Italiano (group courses, affordable), Goethe-Institut (German only, cultural events). Online: Babbel, Duolingo as supplement. A2 level sufficient for daily life; B1 useful for administrative tasks. Important: basic Italian is accepted — Rome is experienced with tourism, but English in authorities is often scarce.',
    infoBoxType: 'info',
    tags: ['language', 'integration'],
  },
  {
    stepOrder: 63,
    phase: 'arrival',
    section: 'social',
    titleDE: 'Deutschsprachige Ärzte und Rechtsanwälte in Rom',
    titleEN: 'German-speaking doctors and lawyers in Rome',
    timingDE: 'Liste frühzeitig recherchieren',
    timingEN: 'Research list early',
    riskLevel: 'low',
    requiresLegalAdvice: false,
    sourceUrl: 'https://rom.diplo.de/ro-de/service/arztliste',
    sourceLabel: 'Ärzte-/Anwaltsliste – Deutsche Botschaft Rom (2025)',
    documents: [],
    infoBoxDE: 'Deutsche Botschaft Rom führt eine Liste deutschsprachiger Ärzte und Rechtsanwälte (rom.diplo.de → Service → Ärzte/Anwälte). Wichtige Anlaufstellen: Salvator Mundi Hospital (private, internationale Patienten), Gemelli Polyclinic (öffentlich, exzellent). Steuerberater (Commercialista) mit DE-IT-Erfahrung: AHK Italia vermittelt Kontakte. Allgemein: Private Kliniken in Rom haben deutlich bessere Versorgungsqualität als öffentliche, aber höhere Kosten.',
    infoBoxEN: 'German Embassy Rome maintains a list of German-speaking doctors and lawyers (rom.diplo.de → Service → Doctors/Lawyers). Key facilities: Salvator Mundi Hospital (private, international patients), Gemelli Polyclinic (public, excellent). Tax advisers (Commercialista) with DE-IT experience: AHK Italia provides contacts. In general: private clinics in Rome have significantly better quality than public ones, but higher costs.',
    infoBoxType: 'info',
    tags: ['healthcare', 'legal', 'community'],
  },
];

// ─── ALL STEPS ────────────────────────────────────────────────────────────────

const romSteps: GuideStep[] = [
  ...rom_bureaucracy,
  ...rom_tax_planning,
  ...rom_banking,
  ...rom_insurance,
  ...rom_housing,
  ...rom_practical,
  ...rom_social,
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

async function ensureRomCity(): Promise<string> {
  const existing = await prisma.city.findUnique({ where: { slug: 'rom' } });
  if (existing) {
    console.log(`  ~ City "rom" already exists (id: ${existing.id})`);
    return existing.id;
  }

  const itCountry = await prisma.country.findUnique({ where: { slug: 'it' } });
  if (!itCountry) throw new Error('Country "it" not found — run main seed first');

  const city = await prisma.city.create({
    data: {
      slug: 'rom',
      flag: '🇮🇹',
      nameDE: 'Rom',
      nameEN: 'Rome',
      countryId: itCountry.id,
      currency: 'EUR',
      lat: 41.90,
      lng: 12.50,
      timezone: 'Europe/Rome',
      isCapital: true,
      isActive: true,
      sortOrder: 13,
    },
  });

  // Lifestyle scores via CityLifestyle
  const lifestyleData = [
    { category: 'safety', score: 68 },
    { category: 'cost_of_living', score: 55 },
    { category: 'quality_of_life', score: 72 },
    { category: 'english_proficiency', score: 55 },
    { category: 'climate', score: 82 },
    { category: 'bike_friendly', score: 28 },
    { category: 'public_transport', score: 62 },
    { category: 'outdoor', score: 75 },
    { category: 'gastro', score: 90 },
    { category: 'social', score: 78 },
  ];
  for (const ls of lifestyleData) {
    await prisma.cityLifestyle.upsert({
      where: { id: `${city.id}_${ls.category}` },
      create: { id: `${city.id}_${ls.category}`, cityId: city.id, category: ls.category, score: ls.score, source: 'internal_estimate', confidence: 70 },
      update: { score: ls.score },
    });
  }

  console.log(`  ✓ City "rom" created (id: ${city.id})`);
  return city.id;
}

async function seedCityGuideRom(): Promise<void> {
  for (const s of romSteps) {
    if (s.riskLevel === 'high') {
      if (!s.sourceUrl || !s.sourceLabel) {
        throw new Error(`[rom] "${s.titleDE}" — riskLevel=high requires sourceUrl + sourceLabel`);
      }
      if (!s.requiresLegalAdvice) {
        throw new Error(`[rom] "${s.titleDE}" — riskLevel=high requires requiresLegalAdvice=true`);
      }
    }
  }

  const city = await prisma.city.findUnique({ where: { slug: 'rom' } });
  if (!city) throw new Error('City "rom" not found — ensureRomCity() must run first');

  const deleted = await prisma.movingGuide.deleteMany({ where: { cityId: city.id } });
  if (deleted.count > 0) console.log(`  Deleted ${deleted.count} existing steps for rom`);

  for (const s of romSteps) {
    await prisma.movingGuide.create({
      data: {
        cityId: city.id,
        stepOrder: s.stepOrder,
        phase: s.phase,
        section: s.section,
        titleDE: s.titleDE,
        titleEN: s.titleEN,
        subtitleDE: s.subtitleDE,
        subtitleEN: s.subtitleEN,
        timingDE: s.timingDE,
        timingEN: s.timingEN,
        isWarning: s.isWarning ?? false,
        documents: s.documents as object[],
        infoBoxDE: s.infoBoxDE,
        infoBoxEN: s.infoBoxEN,
        infoBoxType: s.infoBoxType,
        tags: (s.tags ?? []) as unknown as object[],
        riskLevel: s.riskLevel,
        requiresLegalAdvice: s.requiresLegalAdvice ?? false,
        sourceUrl: s.sourceUrl,
        sourceLabel: s.sourceLabel,
        lastVerified: NOW,
        translationSource: 'manual',
        forEmployed: s.forEmployed ?? true,
        forFreelancer: s.forFreelancer ?? true,
        forFounder: s.forFounder ?? true,
        forFamily: s.forFamily ?? true,
        forPassive: true,
        forPair: true,
        isActive: true,
      },
    });
  }

  console.log(`  ✓ ${romSteps.length} steps seeded for rom`);
}

export async function seedRom(): Promise<void> {
  await ensureRomCity();
  await seedCityGuideRom();
}

async function main() {
  console.log('Sprint 8 — Rom Guide Seed\n');
  await seedRom();
  console.log('\nDone.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
