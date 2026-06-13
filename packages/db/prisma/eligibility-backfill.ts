/**
 * PayMap — Eligibility-Backfill für SpecialRegime.
 *
 * Quelle der Wahrheit für `SpecialRegime.eligibilityCriteria` (typisierte Regeln)
 * und `SpecialRegime.regimeEffect` (wie das Regime mit dem berechneten
 * Gehalts-Netto interagiert). Wird vom Backfill-Script (prisma/backfill-eligibility.ts)
 * per upsert je slug eingespielt.
 *
 * Stand: Juni 2026 (web-verifiziert). Werte wie NL-Gehaltsnorm und MT-Mindestvergütung
 * sind jährlich/regelbasiert; vor produktivem Einsatz juristisch reviewen.
 *
 * Klassifizierung je Bedingung:
 *   derived   — aus den Formular-/Profil-Eingaben berechenbar
 *   attested  — Ja/Nein-Selbstauskunft (Label = Bedingung, die zutreffen MUSS)
 *   advisory  — nicht maschinell prüfbar, nur Hinweis
 *
 * Die Typen spiegeln packages/tax-engine/src/eligibility.ts. Sie sind hier lokal
 * definiert, damit das Seed-Script ohne Cross-Package-Build läuft; bei Änderungen
 * beide Stellen synchron halten.
 */

export type EligibilityRule =
  | {
      kind: 'derived';
      field: 'employment' | 'grossAnnualEUR' | 'children' | 'moveYear';
      op: 'eq' | 'neq' | 'gte' | 'lte' | 'in';
      value: string | number | string[];
      labelDE: string;
      labelEN: string;
    }
  | { kind: 'attested'; id: string; labelDE: string; labelEN: string; mustBe: boolean }
  | { kind: 'advisory'; labelDE: string; labelEN: string };

export type RegimeEffect =
  | 'replaces_income_tax' // Pauschalsatz ersetzt die ESt auf das Gehalt
  | 'reduces_taxable_base' // Befreiungsquote senkt die Bemessungsgrundlage
  | 'foreign_income_only' // Begünstigung nur für Auslandseinkünfte, nicht das Gehalt
  | 'not_applicable_to_salary' // für ein Angestelltengehalt im Szenario nicht anwendbar
  | 'partial_not_quantifiable'; // betrifft nur Teileinkünfte, aus Angaben nicht berechenbar

/** Wie jedes Regime mit dem berechneten Gehalts-Netto interagiert. */
export const REGIME_EFFECT: Record<string, RegimeEffect> = {
  'ifici-pt': 'replaces_income_tax',
  'beckham-es': 'replaces_income_tax',
  'highly-skilled-mt': 'replaces_income_tax',
  'zero-uae': 'replaces_income_tax',
  'small-business-ge': 'replaces_income_tax',
  'ou-ee': 'replaces_income_tax',
  'impatriate-it': 'reduces_taxable_base',
  'ruling30-nl': 'reduces_taxable_base',
  'ulga-powrot-pl': 'reduces_taxable_base',
  'fig-gb': 'foreign_income_only',
  'grp-mt': 'foreign_income_only',
  'ltr-th': 'foreign_income_only',
  'lump-sum-ch': 'not_applicable_to_salary',
  'nor-sg': 'not_applicable_to_salary',
  'impatries-fr': 'partial_not_quantifiable',
  'zuzug-at': 'partial_not_quantifiable',
};

/** Typisierte Eignungsregeln je Regime-slug. */
export const ELIGIBILITY_BACKFILL: Record<string, EligibilityRule[]> = {
  // ── Portugal: IFICI / „NHR 2.0" (20 % flat, 10 J., low risk) ──────────────
  'ifici-pt': [
    {
      kind: 'derived',
      field: 'moveYear',
      op: 'gte',
      value: 2024,
      labelDE: 'Erstmals PT-Steuerresident ab dem 1.1.2024',
      labelEN: 'First became a PT tax resident on/after 1 Jan 2024',
    },
    {
      kind: 'derived',
      field: 'employment',
      op: 'in',
      value: ['employed', 'freelancer', 'founder'],
      labelDE: 'Qualifizierte Erwerbs- oder Selbstständigeneinkünfte (keine reinen Passiveinkünfte)',
      labelEN: 'Qualifying employment or self-employment income (not purely passive)',
    },
    {
      kind: 'attested',
      id: 'pt_not_resident_5y',
      mustBe: true,
      labelDE: 'In den letzten 5 Jahren nicht in Portugal steuerlich ansässig',
      labelEN: 'Not a Portuguese tax resident in the previous 5 years',
    },
    {
      kind: 'attested',
      id: 'pt_no_old_nhr',
      mustBe: true,
      labelDE: 'Nie zuvor das alte NHR-Regime genutzt',
      labelEN: 'Never previously used the old NHR regime',
    },
    {
      kind: 'attested',
      id: 'pt_innovation_role',
      mustBe: true,
      labelDE: 'Tätigkeit in einem qualifizierten Innovationssektor (Wissenschaft, Tech, Gesundheit, F&E)',
      labelEN: 'Activity in a qualifying innovation sector (science, tech, health, R&D)',
    },
    {
      kind: 'advisory',
      labelDE: 'Anerkennung läuft über IAPMEI/AICEP; Hochschulabschluss EQF 6+ meist erforderlich',
      labelEN: 'Recognition via IAPMEI/AICEP; a degree at EQF 6+ is usually required',
    },
  ],

  // ── Spanien: Beckham Law (24 % flat bis 600k, 6 J., low risk) ─────────────
  'beckham-es': [
    {
      kind: 'derived',
      field: 'employment',
      op: 'in',
      value: ['employed', 'founder'],
      labelDE: 'Zuzug über Arbeitsvertrag/Entsendung oder als Start-up-Gründer (<25 % Anteil)',
      labelEN: 'Relocation via employment/secondment or as a start-up founder (<25% stake)',
    },
    {
      kind: 'attested',
      id: 'es_not_resident_5y',
      mustBe: true,
      labelDE: 'In den letzten 5 Jahren nicht in Spanien steuerlich ansässig',
      labelEN: 'Not a Spanish tax resident in the previous 5 years',
    },
    {
      kind: 'advisory',
      labelDE: 'Antrag binnen 6 Monaten nach Anmeldung (Modelo 149) zwingend',
      labelEN: 'Application within 6 months of registration (Modelo 149) is mandatory',
    },
    {
      kind: 'advisory',
      labelDE: 'Seit 2023 auch über Digital-Nomad-Visum möglich; klassische Freelancer und Berufssportler ausgeschlossen',
      labelEN: 'Since 2023 also via digital-nomad visa; classic freelancers and professional athletes excluded',
    },
  ],

  // ── Niederlande: Expat-Ruling (30 % 2026 / 27 % ab 2027, 5 J., low risk) ──
  'ruling30-nl': [
    {
      kind: 'derived',
      field: 'employment',
      op: 'eq',
      value: 'employed',
      labelDE: 'Angestelltenverhältnis bei einem NL-Arbeitgeber (Arbeitgeber-gewährte Regelung)',
      labelEN: 'Employment with a Dutch employer (employer-granted ruling)',
    },
    {
      kind: 'derived',
      field: 'grossAnnualEUR',
      op: 'gte',
      value: 48013,
      labelDE: 'Steuerpflichtiges Gehalt erreicht die Norm 2026 (≥ 48.013 € nach 30 %-Abzug)',
      labelEN: 'Taxable salary meets the 2026 norm (≥ €48,013 after the 30% deduction)',
    },
    {
      kind: 'attested',
      id: 'nl_recruited_abroad',
      mustBe: true,
      labelDE: 'Aus dem Ausland angeworben, mit am NL-Markt knapper Expertise',
      labelEN: 'Recruited from abroad with expertise scarce on the Dutch market',
    },
    {
      kind: 'advisory',
      labelDE: 'Volle 30 %-Nutzung erst ab ~68.590 € Brutto (2026); Cap 262.000 €; ab 2027 27 %; U30 mit Master ~36.497 €',
      labelEN: 'Full 30% use only from ~€68,590 gross (2026); cap €262,000; 27% from 2027; under-30 with master ~€36,497',
    },
  ],

  // ── Estland: Distributed-Profit CIT / E-Residency OÜ (22 %, high, legal) ──
  'ou-ee': [
    {
      kind: 'derived',
      field: 'employment',
      op: 'eq',
      value: 'founder',
      labelDE: 'Unternehmerische Tätigkeit über eine estnische OÜ',
      labelEN: 'Business activity via an Estonian OÜ',
    },
    {
      kind: 'attested',
      id: 'ee_ou_founded',
      mustBe: true,
      labelDE: 'Estnische OÜ gegründet (ggf. über E-Residency)',
      labelEN: 'Estonian OÜ incorporated (optionally via e-Residency)',
    },
    {
      kind: 'advisory',
      labelDE: 'Gewinne werden erst bei Ausschüttung besteuert (22/78 ≈ 22 %); 0 % auf reinvestierte Gewinne',
      labelEN: 'Profits taxed only on distribution (22/78 ≈ 22%); 0% on reinvested profits',
    },
    {
      kind: 'advisory',
      labelDE: '⚠ E-Residency ist KEIN Steuerstatus. Bei fortbestehendem deutschen Wohnsitz volle DE-Steuerpflicht (§ 49 EStG) — Beratung dringend',
      labelEN: '⚠ E-Residency is NOT a tax status. With ongoing German residence, full German tax liability (§49 EStG) — advice strongly recommended',
    },
  ],

  // ── VAE/Dubai: 0 % Einkommensteuer (Grundregel, high risk, legal) ─────────
  'zero-uae': [
    {
      kind: 'attested',
      id: 'uae_residence_visa',
      mustBe: true,
      labelDE: 'Gültiges VAE-Aufenthaltsvisum vorhanden',
      labelEN: 'Holds a valid UAE residence visa',
    },
    {
      kind: 'attested',
      id: 'uae_center_of_life',
      mustBe: true,
      labelDE: 'Tatsächlicher Lebensmittelpunkt liegt in den VAE',
      labelEN: 'Actual center of vital interests is in the UAE',
    },
    {
      kind: 'attested',
      id: 'uae_no_german_source',
      mustBe: true,
      labelDE: 'Kein Einkommen aus deutschen Quellen (§ 49 EStG)',
      labelEN: 'No income from German sources (§49 EStG)',
    },
    {
      kind: 'advisory',
      labelDE: '⚠ Kein aktives DBA mit Deutschland (seit 2021); Wegzugsbesteuerung (§ 6 AStG) und erweiterte beschränkte Steuerpflicht (§ 2 AStG) prüfen — Beratung zwingend',
      labelEN: '⚠ No active tax treaty with Germany (since 2021); review exit tax (§6 AStG) and extended limited liability (§2 AStG) — advice essential',
    },
  ],

  // ── Georgien: Small Business Status (1 % Umsatz, high, legal) ─────────────
  'small-business-ge': [
    {
      kind: 'derived',
      field: 'employment',
      op: 'in',
      value: ['freelancer', 'founder'],
      labelDE: 'Selbstständige Tätigkeit als Einzelunternehmer',
      labelEN: 'Self-employed activity as an individual entrepreneur',
    },
    {
      kind: 'attested',
      id: 'ge_sbs_registered',
      mustBe: true,
      labelDE: 'Als Einzelunternehmer mit Small Business Status registriert',
      labelEN: 'Registered as an individual entrepreneur with Small Business Status',
    },
    {
      kind: 'advisory',
      labelDE: 'Jahresumsatz unter 500.000 GEL (3 % auf den Teil darüber); bei zweijähriger Überschreitung Statusentzug',
      labelEN: 'Annual turnover below 500,000 GEL (3% above; status revoked after two years over the threshold)',
    },
    {
      kind: 'advisory',
      labelDE: 'Definition „georgische Quelle" im Einzelfall zu prüfen',
      labelEN: 'Definition of "Georgian source" must be checked case by case',
    },
    {
      kind: 'advisory',
      labelDE: '⚠ Kein DBA mit Deutschland. Bei DE-Wohnsitz oder wesentlicher Bindung volle DE-Steuerpflicht trotz 1 %-Regime — Beratung erforderlich',
      labelEN: '⚠ No tax treaty with Germany. With German residence or material ties, full German tax liability despite the 1% regime — advice required',
    },
  ],

  // ── Malta: Global Residence Programme (15 % Remittance, low) ──────────────
  'grp-mt': [
    {
      kind: 'attested',
      id: 'mt_property',
      mustBe: true,
      labelDE: 'Qualifizierte Immobilie gekauft (≥ 275.000 € / Gozo 220.000 €) oder Mindestmiete (≥ 9.600 € / Gozo 8.750 €/Jahr)',
      labelEN: 'Qualifying property bought (≥€275,000 / Gozo €220,000) or minimum rent (≥€9,600 / Gozo €8,750/yr)',
    },
    {
      kind: 'attested',
      id: 'mt_non_eu',
      mustBe: true,
      labelDE: 'Nicht-EU-/EWR-Staatsangehöriger (EU-Bürger nutzen das ORP)',
      labelEN: 'Non-EU/EEA national (EU citizens use the ORP instead)',
    },
    {
      kind: 'advisory',
      labelDE: 'Mindeststeuer 15.000 €/Jahr; nur nach Malta überwiesenes Auslandseinkommen wird besteuert (Remittance-Basis)',
      labelEN: 'Minimum tax €15,000/yr; only foreign income remitted to Malta is taxed (remittance basis)',
    },
  ],

  // ── Malta: Highly Skilled / HSI (15 %, 5 J., low; ab 2026 konsolidiert) ───
  'highly-skilled-mt': [
    {
      kind: 'derived',
      field: 'employment',
      op: 'eq',
      value: 'employed',
      labelDE: 'Angestelltenverhältnis in einem qualifizierten „eligible office"',
      labelEN: 'Employment in a qualifying "eligible office"',
    },
    {
      kind: 'derived',
      field: 'grossAnnualEUR',
      op: 'gte',
      value: 65000,
      labelDE: 'Mindestvergütung erreicht (≥ 65.000 €, HSI-Regime 2026)',
      labelEN: 'Minimum remuneration met (≥ €65,000, HSI regime 2026)',
    },
    {
      kind: 'attested',
      id: 'mt_hqp_sector',
      mustBe: true,
      labelDE: 'Tätigkeit in Finanzdienstleistungen (MFSA), Online-Gaming (MGA) oder Luftfahrt (Transport Malta)',
      labelEN: 'Activity in financial services (MFSA), online gaming (MGA) or aviation (Transport Malta)',
    },
    {
      kind: 'advisory',
      labelDE: 'HSI-Regime ab 1.1.2026 (LN 20/2026); Schwelle +10.000 € alle 5 Jahre, Cap 7 Mio. €; HQP-Altfälle wechseln bis 31.12.2028',
      labelEN: 'HSI regime from 1 Jan 2026 (LN 20/2026); threshold +€10,000 every 5 years, cap €7m; legacy HQP transition by 31 Dec 2028',
    },
  ],

  // ── Singapur: Territorial / NOR (seit YA 2021 eingestellt, medium, legal) ──
  'nor-sg': [
    {
      kind: 'attested',
      id: 'sg_nor_legacy',
      mustBe: true,
      labelDE: 'NOR-Status wurde vor dem Steuerjahr 2021 (YA 2021) gewährt (Altfall)',
      labelEN: 'NOR status was granted before YA 2021 (legacy holder)',
    },
    {
      kind: 'advisory',
      labelDE: 'Das NOR-Schema ist für Neuanträge ab YA 2021 eingestellt — Neuzuzügler profitieren nicht mehr',
      labelEN: 'The NOR scheme is discontinued for new applicants from YA 2021 — new arrivals no longer benefit',
    },
    {
      kind: 'advisory',
      labelDE: 'Territoriale Besteuerung gilt fort: nicht nach SG überwiesene Auslandseinkünfte meist steuerfrei; Remittance-Regeln prüfen',
      labelEN: 'Territorial taxation continues: foreign income not remitted to SG is mostly tax-free; check remittance rules',
    },
  ],

  // ── Italien: Regime Impatriati (50 % / 60 % Befreiung, 5 J., low risk) ────
  'impatriate-it': [
    {
      kind: 'derived',
      field: 'employment',
      op: 'in',
      value: ['employed', 'freelancer', 'founder'],
      labelDE: 'Qualifizierte italienische Erwerbs-/Selbstständigeneinkünfte',
      labelEN: 'Qualifying Italian employment/self-employment income',
    },
    {
      kind: 'attested',
      id: 'it_not_resident_3y',
      mustBe: true,
      labelDE: 'In den letzten 3 Jahren nicht in Italien steuerlich ansässig',
      labelEN: 'Not an Italian tax resident in the previous 3 years',
    },
    {
      kind: 'attested',
      id: 'it_high_qualification',
      mustBe: true,
      labelDE: 'Hohe Qualifikation/Spezialisierung (ISTAT-Level 1–3, i. d. R. ≥ 3 Jahre Hochschule)',
      labelEN: 'High qualification/specialisation (ISTAT level 1–3, usually ≥3 years tertiary)',
    },
    {
      kind: 'advisory',
      labelDE: 'Mit minderjährigem Kind 60 % Befreiung statt 50 %; Cap 600.000 €/Jahr. Bei Rückkehr zum selben Arbeitgeber/Konzern 6–7 Jahre Nicht-Ansässigkeit; Clawback bei zu frühem Wegzug',
      labelEN: 'With a minor child 60% exemption instead of 50%; cap €600,000/yr. If returning to the same employer/group 6–7 years of non-residence; clawback if you leave too early',
    },
  ],

  // ── UK: 4-Year FIG Regime (0 % auf Auslandseinkünfte, 4 J., medium, legal) ─
  'fig-gb': [
    {
      kind: 'attested',
      id: 'gb_not_resident_10y',
      mustBe: true,
      labelDE: 'In den letzten 10 zusammenhängenden Jahren nicht UK-steuerlich ansässig',
      labelEN: 'Not UK tax resident in the previous 10 consecutive years',
    },
    {
      kind: 'advisory',
      labelDE: 'Übergang: am 6.4.2025 weniger als 4 Jahre UK-ansässig; jährliche Antragstellung (claim) nötig — verliert Personal Allowance + CGT-Freibetrag im Jahr',
      labelEN: 'Transition: fewer than 4 years UK resident on 6 Apr 2025; annual claim required — forfeits the personal allowance + CGT exemption for that year',
    },
    {
      kind: 'advisory',
      labelDE: '⚠ Die 0 % gelten NUR für Auslandseinkünfte, NICHT für UK-Gehalt — der Vergleichswert ist für Gehaltsbezieher irreführend. Tax cliff nach 4 Jahren',
      labelEN: '⚠ The 0% applies ONLY to foreign income, NOT to UK salary — the comparison is misleading for salary earners. Tax cliff after 4 years',
    },
  ],

  // ── Frankreich: Régime des impatriés (30 % Prämien-Befreiung, 8 J., legal) ─
  'impatries-fr': [
    {
      kind: 'derived',
      field: 'employment',
      op: 'eq',
      value: 'employed',
      labelDE: 'Aus dem Ausland angeworbenes oder entsandtes Angestelltenverhältnis',
      labelEN: 'Employment recruited or seconded from abroad',
    },
    {
      kind: 'attested',
      id: 'fr_not_resident_5y',
      mustBe: true,
      labelDE: 'In den 5 Kalenderjahren vor Amtsantritt nicht in Frankreich steuerlich ansässig',
      labelEN: 'Not a French tax resident in the 5 calendar years before taking up duties',
    },
    {
      kind: 'advisory',
      labelDE: 'Die 30 % sind eine Pauschaloption für die Impatriierungs-Prämie, kein Satz aufs Gesamteinkommen — der Vergleichswert ist nur eine grobe Annäherung',
      labelEN: 'The 30% is a flat option for the impatriation bonus, not a rate on total income — the comparison is only a rough approximation',
    },
  ],

  // ── Österreich: Zuzugsbegünstigung § 103 EStG (30 %, nur Forscher, legal) ──
  'zuzug-at': [
    {
      kind: 'attested',
      id: 'at_relocation',
      mustBe: true,
      labelDE: 'Verlagerung des Mittelpunkts der Lebensinteressen nach Österreich (Zuzug aus dem Ausland)',
      labelEN: 'Shifted centre of vital interests to Austria (relocation from abroad)',
    },
    {
      kind: 'attested',
      id: 'at_researcher',
      mustBe: true,
      labelDE: 'Tätigkeit als Wissenschaftler/Forscher (Voraussetzung für den 30 %-Zuzugsfreibetrag)',
      labelEN: 'Activity as a scientist/researcher (required for the 30% relocation allowance)',
    },
    {
      kind: 'advisory',
      labelDE: 'Die 30 % gelten nur für wissenschaftliche Einkünfte; die Mehrbelastungs-Beseitigung ist eine Ermessensentscheidung des BMF — Vergleichswert grobe Näherung',
      labelEN: 'The 30% applies only to scientific income; the burden-elimination is a discretionary BMF decision — comparison is a rough approximation',
    },
  ],

  // ── Schweiz: Pauschalbesteuerung / Aufwand (kantonal, medium, legal) ──────
  'lump-sum-ch': [
    {
      kind: 'attested',
      id: 'ch_no_employment',
      mustBe: true,
      labelDE: 'Keine Erwerbstätigkeit in der Schweiz',
      labelEN: 'No gainful employment in Switzerland',
    },
    {
      kind: 'attested',
      id: 'ch_inbound',
      mustBe: true,
      labelDE: 'Erstmaliger oder erneuter Zuzug in die Schweiz',
      labelEN: 'First-time or renewed relocation to Switzerland',
    },
    {
      kind: 'advisory',
      labelDE: 'Kantonal unterschiedlich; in ZH, SH, AR, BL, BS abgeschafft. Steuer wird nach Aufwand individuell verhandelt — Vergleichswert grobe Näherung',
      labelEN: 'Varies by canton; abolished in ZH, SH, AR, BL, BS. Tax is negotiated individually on expenditure — comparison is a rough approximation',
    },
  ],

  // ── Thailand: LTR-Visum + Remittance (10 J., medium, legal) ───────────────
  'ltr-th': [
    {
      kind: 'attested',
      id: 'th_resident_183',
      mustBe: true,
      labelDE: 'Steuerresident in Thailand (≥ 183 Tage/Jahr)',
      labelEN: 'Thai tax resident (≥183 days/year)',
    },
    {
      kind: 'attested',
      id: 'th_ltr_visa',
      mustBe: true,
      labelDE: 'LTR-Visum in einer qualifizierenden Kategorie (z. B. Wealthy Global Citizen, Wealthy Pensioner, Work-From-Thailand Professional)',
      labelEN: 'LTR visa in a qualifying category (e.g. Wealthy Global Citizen, Wealthy Pensioner, Work-From-Thailand Professional)',
    },
    {
      kind: 'advisory',
      labelDE: 'Begünstigung der Auslandseinkünfte ist je LTR-Kategorie unterschiedlich; Remittance-Regeln im Einzelfall prüfen',
      labelEN: 'Relief on foreign income varies by LTR category; check remittance rules case by case',
    },
  ],

  // ── Polen: Rückkehrer-Entlastung Ulga na powrót (4 J., low risk) ──────────
  'ulga-powrot-pl': [
    {
      kind: 'derived',
      field: 'moveYear',
      op: 'gte',
      value: 2022,
      labelDE: 'Verlegung des Steuerwohnsitzes nach Polen nach dem 31.12.2021',
      labelEN: 'Shifted tax residence to Poland after 31 Dec 2021',
    },
    {
      kind: 'derived',
      field: 'employment',
      op: 'in',
      value: ['employed', 'freelancer', 'founder'],
      labelDE: 'Qualifizierende polnische Einkünfte (Anstellung/Gewerbe)',
      labelEN: 'Qualifying Polish income (employment/business)',
    },
    {
      kind: 'attested',
      id: 'pl_not_resident_3y',
      mustBe: true,
      labelDE: 'In den 3 vorangegangenen Kalenderjahren kein PL-Steuerresident',
      labelEN: 'Not a Polish tax resident in the previous 3 calendar years',
    },
    {
      kind: 'advisory',
      labelDE: 'Befreiung bis 85.528 PLN/Jahr über 4 Jahre; Nachweis des vorherigen Auslandswohnsitzes erforderlich',
      labelEN: 'Exemption up to PLN 85,528/yr over 4 years; proof of prior foreign residence required',
    },
  ],
};
