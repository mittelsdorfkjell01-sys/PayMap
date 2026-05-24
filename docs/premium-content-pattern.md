# PayMap — Premium Content Pattern

Dieses Dokument beschreibt das etablierte Pattern für Premium-Städte (13 Städte, Sprint 9). Es basiert auf dem Lissabon-Pilot (Task 2) und gilt für alle weiteren Städte.

---

## Pflicht-Sektionen pro Stadt

| Sektion | Inhalt | Mindest-Umfang |
|---------|--------|----------------|
| Stadtteile (Districts) | 5–8 Stadtteile mit Beschreibung, Koordinaten, Vibe, priceLevel, CoL-Daten | 5 min |
| City-Narratives | Persona-Texte in DE + EN | 5 Sektionen min |
| SVG-Infografiken | React-Komponenten (Wrapper um `_shared`) | 5 min |
| Zusatz-Tools | Stadt-spezifische interaktive Rechner | 2 min |
| Ressourcen-Bibliothek | Checklisten, Glossare, Templates, Directories | 5 min |
| Testimonials | Erfahrungsberichte mit `isVerified: false` wenn konstruiert | 3 min |
| FeedbackButton | Community-Melde-System | 1 (global) |

---

## Narratives — Pflicht-Sektionen

Jede Stadt braucht **mindestens diese 5 Narratives**:

| section | Inhalt | Wortanzahl DE |
|---------|--------|---------------|
| `intro` | Stadt-Überblick aus Auswanderer-Perspektive: Pro/Contra, Zielgruppe | 800–1.200 |
| `for_freelancers` | Selbstständige: Steuer-Setup, Banking, Co-Working, Einkommenserwartung | 600–900 |
| `for_families` | Schulen, familienfreundliche Viertel, bester Umzugszeitpunkt | 700–1.000 |
| `for_retirees` | Steuer auf Renten/DBA, Gesundheitsversorgung, Pflegeoptionen | 600–800 |
| `for_tech_workers` | Tech-Ökosystem, Gehaltsniveau, Remote-Setup, Netzwerk | 600–900 |

Optionale Ergänzung wenn relevant: `for_crypto_investors`, `for_employees`.

**DE und EN werden parallel geschrieben** — nicht sequenziell übersetzen.

**Pflicht:** Jeder Narrative braucht `sourceUrls[]` mit mind. 1 offizieller Quelle.

---

## Districts — Daten-Anforderungen

Pro Stadtteil:
- `slug`: URL-sicher, Kleinbuchstaben, Bindestriche
- `nameDE` + `nameEN`: Vollständiger Name
- `descriptionDE` + `descriptionEN`: 3–5 Sätze (charakterisierend, nicht werbend)
- `latitude` + `longitude`: Mittelpunkt des Stadtteils
- `vibe`: Einer aus `DISTRICT_VIBES` (`lebendig`, `ruhig`, `familiär`, `schick`, `alternativ`, `studentisch`, `gehoben`, `aufstrebend`)
- `priceLevel`: 1–5 (1 = sehr günstig, 5 = Toplage)

Pro Stadtteil mindestens **6 CoL-Kategorien**:
- `rent_1br_center` — Miete 1-Zi-Wohnung
- `rent_2br_center` — Miete 2-Zi-Wohnung
- `rent_3br_center` — Miete 3-Zi-Wohnung
- `monthly_meal_inexpensive` — günstiges Restaurant (Tagesgericht)
- `monthly_meal_midrange` — mittleres Restaurant (Hauptgericht)
- `cappuccino` — Kaffeepreis als Orientierungswert

Quelle: `idealista-YYYY-QX` oder `numbeo-YYYY-QX`. Confidence: 60–70 (Schätzwerte).

---

## SVG-Infografiken — Pattern

**5 Standard-Infografiken pro Stadt:**

| Infografik | Shared-Komponente | Stadt-spezifisch |
|------------|-------------------|------------------|
| Stadtteil-Karte | `_shared/DistrictMapGeneric` | Koordinaten + Daten |
| Mietpreis-Vergleich | `_shared/RentComparisonChart` | Mietdaten pro Stadtteil |
| Erste-Monats-Timeline | `_shared/FirstMonthTimelineGeneric` | Lokale Ereignisse |
| Behörden-Flowchart | Stadt-spezifisch (Prozess variiert) | Vollständig |
| Klima-Heatmap | `_shared/ClimateHeatmapGeneric` | Klimadaten |

**Umsetzung:** Lissabon-spezifische Komponenten unter `components/cities/lissabon/` sind **dünne Wrapper** um die `_shared/`-Generics. Neue Städte folgen demselben Muster.

**Styling-Regeln:**
- `currentColor`-kompatibel
- Responsive via `viewBox` (kein hardcodiertes width/height im SVG)
- Quell-Angabe als `<text>` am unteren Rand

---

## Tools — Pattern

**Universelle Tools** (wiederverwendbar für alle Städte):
- `FirstMonthBudgetCalculator` — akzeptiert `config: CityToolConfig` aus DB
- Konfiguration liegt in `CityTool.config` (JSON in DB), nicht im Component

**Stadt-spezifische Tools** (Sonderregelungen eines Landes):
- `IFICIEligibilityChecker` → Portugal (Lissabon, Porto)
- `BeckhamLawChecker` → Spanien (Madrid, Barcelona)
- `ThirtyPercentRulingChecker` → Niederlande (Amsterdam)
- `DTVEligibilityChecker` → Thailand (Bangkok)

Jedes Tool mit Rechts-/Steuercharakter braucht **Pflicht-Disclaimer**:
> "Diese Einschätzung ist nicht verbindlich. Für einen Antrag ist professionelle Beratung unbedingt erforderlich."

---

## Ressourcen — Standard-Set

Jede Stadt bekommt mindestens diese 5 Ressourcen-Typen:

| resourceType | Inhalt |
|-------------|--------|
| `checklist` | "Erste 90 Tage in [Stadt]" — interaktiv abhakbar |
| `glossary` | Wichtige lokale Behördenbegriffe (DE + EN + Lokalsprache) |
| `template` | Wohnungsbesichtigungs-Checkliste (stadt-adaptiert) |
| `template` | Antragsschreiben oder Formular-Vorlage (NIF-Äquivalent lokal) |
| `directory` | Deutschsprachige Anlaufstellen (Botschaft, Steuerberater, Community) |

---

## Testimonials — Regeln

- `isVerified: false` bei konstruierten Personas — **immer**
- Keine echten Namen ohne Zustimmung
- Persona-Diversität: mind. 1 Single, 1 Familie oder Paar, 1 Rentner/Senior
- Inhalt: realistisch, auch Schwierigkeiten benennen — keine Werbetexte
- Wortanzahl: 400–700 pro Testimonial (DE + EN)

---

## Quellen-Anforderungen

| Inhalt-Typ | Bevorzugte Quellen |
|------------|-------------------|
| Mieten | Idealista, Immobilienscout, lokale Portale (datiert, Quartal) |
| Steuer | Offizielle Finanzbehörden-Websites |
| Visa | Offizielle Botschafts- oder Behörden-Websites |
| Banking | Offizielle Bank-Websites (datiert) |
| Gesundheit | Nationale Gesundheitssystem-Websites |
| Schulen | Offizielle Schul-Websites |

**Keine Primärquellen:** Blogs, Reddit, YouTube, Foren — nur als Sekundärquelle für Testimonials.

---

## Wiederverwendungs-Hierarchie für neue Städte

```
1. Shared-Generic-Komponente nutzen (DistrictMapGeneric, etc.)
2. Stadtspezifischer Wrapper: components/cities/<slug>/<ComponentName>.tsx
3. Seed-Datei: packages/db/prisma/seed-sprint9-<slug>.ts
4. Typecheck läuft durch: npm run typecheck
```

**Reihenfolge innerhalb einer Stadt:**
1. Districts + CoL (Seed)
2. Narratives (Seed)
3. Tools-Config (Seed) + Tool-Komponente (falls neu)
4. Ressourcen (Seed)
5. Testimonials (Seed)
6. SVG-Wrapper-Komponenten
7. Guide-Page zeigt neue Inhalte

---

## Update-Pflichten

| Inhalt | Update-Frequenz |
|--------|----------------|
| Mietpreise | Quartalsweise |
| Banken-Konditionen | Halbjährlich |
| Visa-Regeln | Jährlich oder bei Änderung |
| Steuersätze | Jährlich (Q1) |
| Sondersteuerregime | Bei Änderung (sofort) |

`lastVerified` muss bei jedem Update gesetzt werden.
