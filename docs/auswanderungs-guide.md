# PayMap — Auswanderungs-Guide: Konzept & Redaktionsrichtlinien

Dieses Dokument beschreibt den Aufbau, die Qualitätsanforderungen und den Pflegeprozess der stadtspezifischen Auswanderungs-Guides auf paymap.io.

---

## Übersicht Sektionen

Jede Stadt erhält genau **7 Sektionen** in dieser Reihenfolge:

| Key | Deutsch | English | Mindest-Steps |
|-----|---------|---------|---------------|
| `bureaucracy` | Bürokratie & Anmeldung | Bureaucracy & Registration | 3 |
| `tax_planning` | Steuerplanung | Tax Planning | 4 |
| `banking` | Banking & Konto | Banking & Account | 3 |
| `insurance` | Versicherungen | Insurance | 3 |
| `housing` | Wohnen | Housing | 3 |
| `practical` | Praktisches | Practical Matters | 3 |
| `social` | Soziales Leben | Social Life | 3 |

**Minimum gesamt:** 25 Steps pro Stadt. Realistisches Ziel: 30–40 Steps.

---

## Risiko-Klassifizierung

### `riskLevel: 'low'`
- Rein informative Fakten ohne Handlungskonsequenz
- Praktische Tipps (Stecker, Trinkwasser, Apotheken)
- Allgemeine Kulturhinweise

### `riskLevel: 'medium'`
- Schritte mit Timing- oder Reihenfolge-Risiko
- Informationen die sich ändern können (Bankkonditionen, Visa-Gebühren)
- DBA-Erläuterungen (schützend, aber komplex)

### `riskLevel: 'high'` — Pflichtfelder
Bei `riskLevel: 'high'` **müssen** folgende Felder gesetzt sein:
- `requiresLegalAdvice: true`
- `sourceUrl`: URL zur primären Quelle (offizielle Behörde oder Gesetz)
- `sourceLabel`: Lesbarer Name der Quelle, z.B. `"BMF — DBA-Übersicht"`
- `lastVerified`: Datum der letzten inhaltlichen Prüfung

Beispiele für zwingend `high`:
- Wegzugsbesteuerung §6 AStG
- Erweiterte unbeschränkte Steuerpflicht §2 AStG
- FBAR/FATCA-Meldepflichten (USA)
- DBA-Kündigung (z.B. UAE 2021)
- Sondersteuerregime mit Voraussetzungen (NHR/IFICI, 30%-Ruling, Beckham Law)

---

## Quellen-Anforderungen

| Typ | Bevorzugte Quellen |
|-----|-------------------|
| Deutsches Steuerrecht | bmf.bund.de, bzst.de, gesetze-im-internet.de |
| Internationales Steuerrecht | Offizielle DBA-Texte auf bmf.bund.de |
| Lokale Steuer (AT) | bmf.gv.at |
| Lokale Steuer (PT) | at.gov.pt, portaldascomunidades.mne.gov.pt |
| Lokale Steuer (ES) | agenciatributaria.gob.es |
| Lokale Steuer (NL) | belastingdienst.nl |
| Lokale Steuer (US) | irs.gov |
| Lokale Steuer (UAE) | mof.gov.ae |
| Visa/Aufenthalt | Auswärtiges Amt (auswaertiges-amt.de) |
| Banking | Offizielle Bank-Websites, datiert |

**Regel:** Keine journalistischen Artikel oder Foren als Primärquelle für High-Risk-Inhalte.

---

## Nicht-EU-Städte: Pflicht-Disclaimer

Für alle Städte außerhalb der EU/EWR **muss** in der Sektion `tax_planning` mindestens ein `riskLevel: 'high'`-Step enthalten sein, der auf die deutsche Steuerpflicht bei Wegzug hinweist.

Bei Ländern **ohne aktives DBA mit Deutschland** (aktuell: UAE seit 2021):
- Alle `tax_planning`-Steps müssen `riskLevel: 'high'` haben
- Jeder Step braucht expliziten Disclaimer zur fehlenden DBA-Protection

---

## Neue Stadt hinzufügen

### Schritt 1: Prisma Seed erweitern

In `packages/db/prisma/seed.ts` die Stadt-ID raussuchen und eine `seedMovingGuide`-Gruppe erstellen:

```typescript
const NOW = new Date();
const STEPS: Parameters<typeof seedMovingGuide>[1][] = [
  {
    stepOrder: 1,
    phase: 'before_move',
    section: 'bureaucracy',
    titleDE: 'Abmeldung in Deutschland',
    titleEN: 'Deregistration in Germany',
    timingDE: '4-6 Wochen vor Abreise',
    timingEN: '4-6 weeks before departure',
    riskLevel: 'medium',
    requiresLegalAdvice: false,
    lastVerified: NOW,
  },
  // ... weitere Steps
];
```

### Schritt 2: Alle 7 Sektionen abdecken

Checkliste vor dem Commit:
- [ ] 7 Sektionen vorhanden (`bureaucracy`, `tax_planning`, `banking`, `insurance`, `housing`, `practical`, `social`)
- [ ] ≥ 25 Steps insgesamt
- [ ] Alle `high`-Steps haben `sourceUrl` + `sourceLabel` + `requiresLegalAdvice: true`
- [ ] Alle Steps haben `titleEN` und `timingEN`
- [ ] Non-EU: mindestens 1 `high`-Step in `tax_planning`

### Schritt 3: Integrity-Test laufen lassen

```bash
npm run test:guide
```

Alle 9 Tests müssen grün sein.

### Schritt 4: EN-Slug eintragen (falls abweichend)

In `apps/nextjs/lib/city-guide-slugs.ts` den Mapping-Eintrag ergänzen:

```typescript
export const EN_TO_DB_SLUG: Record<string, string> = {
  // ...
  'new-city': 'neue-stadt',
};
```

---

## Jährliches Update-Schedule

| Quartal | Themen |
|---------|--------|
| **Q1 (Jan–Mär)** | Steuersätze aktualisieren (neues Steuerjahr), Sondersteuerregime-Bedingungen prüfen |
| **Q2 (Apr–Jun)** | Banking-Konditionen, Mindestkapital für Visa-Programme |
| **Q3 (Jul–Sep)** | Wohnungsmarkt-Preise, Lebenshaltungskosten |
| **Q4 (Okt–Dez)** | DBA-Status prüfen (Neuigkeiten aus BMF), Sozialversicherung, Jahresrückblick |

**Trigger für sofortiges Update:**
- DBA-Kündigung oder -Neuabschluss
- Sondersteuerregime abgeschafft oder geändert (z.B. Portugal NHR → IFICI 2024)
- Neue Visa-Kategorien oder -Abschaffung
- Wesentliche Steuerreform im Zielland

**`lastVerified`** muss bei jedem inhaltlichen Update gesetzt werden.

---

## Status-Report ausführen

```bash
npm run check:guide
```

Gibt pro Stadt aus: Anzahl Steps, Sektionen-Coverage, High-Risk-Anteil mit Quellen.

---

## Qualitätssicherung

```bash
npm run test:guide     # 9 Integritäts-Tests gegen echte DB
npm run typecheck      # TypeScript-Kompilierung
npm run build          # Production-Build (Next.js)
```
