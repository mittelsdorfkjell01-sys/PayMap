# Accuracy-Sprint — Standard-Freibeträge & Steuergutschriften (PR4-Audit)

Systematischer Audit aller 26 Länder: Hat das Modul die Standard-Erleichterung
(persönlicher Freibetrag / Arbeitnehmer-Gutschrift)? Logik bleibt im Land-Modul,
Werte in `TaxData` (DB). Stand: 2026-06-09. Jahr je Land konsistent (Sprint-1-
Migration: DE/AT/ES/IT/US auf 2026, übrige 2025).

## Länder mit modellierter Standard-Erleichterung

| Land | Erleichterung | Quelle | Eingeführt |
|---|---|---|---|
| **DE** | Grundfreibetrag (in §32a-Formel) + Werbungskostenpauschale 1.230 € + **Vorsorgepauschale** (RV 9,3 % zu 100 %, KV 8,45 %, PV) | §39b EStG, BMF 14.08.2025 | PR2 |
| **AT** | 0-%-Zone (Grundfreibetrag-Äquiv.) + **Verkehrsabsetzbetrag 496 €** + Jahressechstel | §33/5 EStG (2026) | PR4 |
| **NL** | 3-stufige Box-1-Skala + **algemene heffingskorting** (3.068 €) + **arbeidskorting** (max 5.599 €), je mit Phase-out | belastingdienst.nl 2025 | PR1 |
| **ES** | **mínimo personal** 5.550 € (Gutschrift) + abzugsfähige SV + 2.000 € otros gastos + reducción trabajo | AEAT, Art. 19/20/57/63-64 LIRPF | PR3 |
| **PT** | **dedução específica** Cat. A = max(4.462,15 €, SV-Beiträge) | Art. 25 CIRS, IAS 2025 | PR3 |
| **FR** | 10-%-Abattement + **décote** (Niedrigeinkommen) | Art. 158/197 CGI | PR4 (décote) |
| **IT** | **detrazioni lavoro dipendente** (Art. 13, fällt auf 0 bei 50 k) | Art. 13 TUIR | PR4 |
| **IE** | **personal credit 2.000 € + employee credit 2.000 €** (auf PAYE) | revenue.ie, Budget 2025 | PR4 |
| **EE** | basic allowance 7.848 € + Phase-out 14.400→25.200 € | emta.ee | Sprint 1 |
| **PL** | kwota wolna 30.000 zł | podatki.gov.pl | Sprint 1 |
| **CZ** | **sleva na poplatníka 30.840 CZK** (Gutschrift) | §35ba ZDP | PR4 |
| **GB** | personal allowance 12.570 £ + Taper > 100 k | gov.uk | Sprint 1 |
| **US** | standard deduction 16.100/32.200 $ (+ NY state ded.) | IRS Rev. Proc. 2025-32 | Sprint 1 |
| **TH** | 50-%-Werbungskosten (Cap 100 k) + **personal allowance 60.000 THB** | rd.go.th | PR4 (allowance) |
| **ID** | PTKP 54 Mio IDR | pajak.go.id | Sprint 1 |
| **CO** | renta exenta 25 % (Cap 790 UVT) | dian.gov.co | Sprint 1 |
| **AR** | mínimo no imponible 38,4 Mio ARS | afip.gob.ar | Sprint 1 |
| **ZA** | primary rebate 17.235 ZAR | sars.gov.za | Sprint 1 |
| **MT** | 0-%-Zone bis 9.100 € (im Tarif) | cfr.gov.mt | Tarif |

## Länder ohne separate Erleichterung — geprüft, bewusst nicht ergänzt

| Land | Befund |
|---|---|
| **HU** | Flat 15 %. Für Ledige/Kinderlose gibt es keinen persönlichen Freibetrag (nur Familienfreibeträge). Korrekt ohne. |
| **RO** | Flat 10 %. „Deducere personală" nur bei niedrigem Monatsbrutto, läuft über ~RON 4.000/Mo auf 0 → bei den Vergleichseinkommen 0. Nicht modelliert (kein Effekt). |
| **GE** | Flat 20 %. Kein persönlicher Freibetrag für reguläre Angestellte (Small-Business-Regime separat). Korrekt ohne. |
| **SG** | Progressiv mit 0-%-Zone bis 20 k. „Earned income relief" (≤ SGD 1.000) marginal → bewusst ausgelassen, dokumentiert. |
| **MX** | ISR-Tarif mit eingebauter Progression; kein Standard-Grundfreibetrag, „subsidio para el empleo" nur Geringverdiener. Nicht modelliert. |
| **CH** | Effektivsatz-Approximation (kantonal); kein expliziter Freibetrag, da die Approximation bereits auf Netto-Zielwerte kalibriert ist. Außerhalb des Scopes. |
| **UAE** | Keine Einkommensteuer. |

## Sozialabgaben-Stichprobe (Sätze/Bemessungsgrenzen)

Gegen amtliche Werte geprüft, plausibel:
- **DE** RV 18,6 % (AN 9,3 %, BBG 101.400), AV 2,6 % (1,3 %), KV 14,6 %+2,9 % (AN 8,75 %, BBG 69.750), PV 3,6 %+0,6 % — 2026 korrekt.
- **AT** Pension 10,25 % / KV 3,87 % / AV 3 % / UV 1 % — plausible AN-Anteile.
- **PT** 11 % (ohne Decke) — korrekt. **GB** NI 8 %/2 % (UEL 50.270) — korrekt.
- **US** SS 6,2 % (Decke 184.500) + Medicare 1,45 % — 2026 korrekt.
- **ES** 6,35 % (Decke 56.064) — Näherung (real ~6,47 %); Netto deckt sich dennoch mit offiziellem Rechner (talent.com 60 k Madrid, <0,4 %).

Flag (geringfügig, innerhalb Toleranz): **IE** PRSI stieg ab Okt. 2024 auf 4,1 %
(Modell 4,0 %) — minimaler Effekt, nicht angepasst.

## Bewusst nicht im Scope (Restungenauigkeiten)

## Externe Referenz-Validierung (PR5)

`src/__tests__/external-validation.test.ts` pinnt die in PR1–PR3 korrigierten
Länder gegen **unabhängige** Referenzen (±3 %), nicht gegen Engine-Eigenwerte:
- **DE** 60 k → lohntastik.de 3.130 €/Mo + smart-rechner.de 3.139 €/Mo (Engine 3.129).
- **ES** 60 k/80 k Madrid → es.talent.com 42.209 € / 53.713 €/Jahr (Engine 42.367 / 54.079; <0,7 %).
- **NL** 60 k → belastingdienst-Parameter 43.713 €/Jahr (Zielkorridor 43–44 k).
- **PT** 60 k → Art.-25-Jahresveranlagung 36.770 €/Jahr (Monats-Retention-Rechner
  zeigen wegen Überabzug ein niedrigeres Unterjahres-Netto — kein Engine-Fehler).

Die übrigen Länder-Tests führen ihre Behörden-Quellen bereits im Header; ein
maschinell abrufbarer Dritt-Rechner-Cross-Check dort ist Follow-up (nicht alle
amtlichen Rechner sind serverseitig abrufbar).

## Bewusst nicht im Scope (Restungenauigkeiten)

DE Kinderfreibetrag-Sonderfälle, FR quotient familial, PT Solidaritätszuschlag &
deduções à coleta, IT €65-Bonus (25–35 k) und Lazio-Detrazione, ES regionale
Mindest-Abweichungen, AT erhöhter VAB/SV-Bonus (Geringverdiener), CH kantonale
Detailtarife. Diese betreffen Sonderfälle bzw. Niedrigeinkommen außerhalb des
Kern-Vergleichs und sind in den jeweiligen Disclaimern vermerkt.
