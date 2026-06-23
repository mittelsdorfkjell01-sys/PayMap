# PayMap

Netto-Gehaltsvergleich für Remote Worker und Auswanderer. Berechnet Netto-Gehalt nach lokalen Steuern, Sozialabgaben und Lebenshaltungskosten.

## Architektur

```
packages/
  db/            # Prisma Schema + Migrations + Seeds (PostgreSQL/Neon)
  tax-engine/    # Steuerrechner-Paket (@paymap/tax-engine, 17 Länder-Module)
legacy/          # Aktives Frontend + Backend (Ordnername historisch — siehe Hinweis)
  api/           # Express-API (@paymap/api)  → http://localhost:3001
  web/           # Vite + React (@paymap/web) → http://localhost:5173
```

> **Hinweis zum Ordner `legacy/`:** Trotz des Namens ist das hier liegende
> Vite/Express-Paar das **aktive** Frontend und Backend. Das frühere
> `apps/nextjs`-Frontend wurde entfernt; `apps/` ist leer. Das Web nutzt im Dev
> einen Vite-Proxy (`/api` → `:3001`), Frontend und API laufen als zwei Prozesse.

Daten (Stand): 35 Städte, 26 Länder, inkl. Auswanderungs-Guides, Sonderregimes
(`SpecialRegime`) und deutscher Wegzugs-Regeln (`ExitRule`).

## Setup

### 1. Voraussetzungen

- Node.js 20+
- Eine PostgreSQL-Datenbank. In Staging/Prod ist das Neon; lokal optional via
  `docker compose up -d` (siehe `docker-compose.yml`).

### 2. Umgebungsvariablen

Die echten `.env`-Dateien sind gitignored. Aus den Templates anlegen:

```bash
# API (Express) — DATABASE_URL, JWT_SECRET, CORS_ORIGIN, PORT
cp legacy/api/.env.example legacy/api/.env

# Web (Vite) — VITE_API_URL (im Dev leer lassen; der Vite-Proxy übernimmt)
cp legacy/web/.env.example legacy/web/.env
```

Zusätzlich liest **Prisma** (Migrationen + Seeds) die `DATABASE_URL` aus
`packages/db/.env`:

```bash
# packages/db/.env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require&channel_binding=require
# Nur für den vollständigen Seed (db:seed) zusätzlich nötig:
SEED_ADMIN_PASSWORD=...
```

### 3. Dependencies installieren

```bash
npm install
```

### 4. Datenbank einrichten

```bash
npm run db:generate   # Prisma Client generieren
npm run db:migrate    # Migrationen ausführen (lokal)
npm run db:seed       # Voll-Seed (benötigt SEED_ADMIN_PASSWORD)
```

Gegen eine bestehende (gemigrate-te) DB nur den Schema-Stand prüfen bzw.
deployen — **kein** `migrate reset`/`db push` gegen Staging/Prod:

```bash
npx prisma migrate status  --schema packages/db/prisma/schema.prisma
npx prisma migrate deploy  --schema packages/db/prisma/schema.prisma
```

### 5. Dev-Server starten (zwei Prozesse)

```bash
# Terminal 1 — API auf :3001
npm run dev --workspace=@paymap/api

# Terminal 2 — Web auf :5173 (Proxy /api → :3001)
npm run dev --workspace=@paymap/web
```

## Seeds

Der Voll-Seed (`npm run db:seed`) lädt alle Tabellen. Daneben gibt es gezielte,
idempotente Seeds im `@paymap/db`-Workspace, u. a.:

```bash
# Nur Sonderregimes + Wegzugs-Regeln neu einspielen (rührt sonst nichts an):
npm run seed:regimes --workspace=@paymap/db   # → specialRegime, exitRule

# Weitere: seed:guides, seed:premium*, seed:col*, seed:taxdata,
# seed:inflation:forecast (siehe packages/db/package.json)
```

Die Regime/Exit-Rule-Daten liegen kanonisch in
`packages/db/prisma/regime-data.ts` und werden sowohl vom Voll-Seed als auch von
`seed:regimes` genutzt (eine Quelle, kein Duplikat).

## Auswanderungs-Guide

PayMap enthält vollständige Auswanderungs-Guides je Stadt — auf Deutsch und Englisch.

- **7 Sektionen pro Stadt**: Bürokratie, Steuerplanung, Banking, Versicherungen, Wohnen, Praktisches, Soziales Leben
- **Risiko-Klassifizierung**: `low` / `medium` / `high` — High-Risk-Steps enthalten Quellen-URL und Rechtsberatungs-Hinweis
- **Persona-Filter**: Alle/Angestellt/Freelancer/Gründer/Mit Familie
- **Strukturierte Daten**: HowTo- und FAQPage-Schema für SEO

Redaktionsrichtlinien und Update-Schedule: [`docs/auswanderungs-guide.md`](docs/auswanderungs-guide.md)

## Nützliche Befehle

```bash
npm run typecheck     # TypeScript-Check (Tax Engine + DB)
npm test              # Unit-Tests (Tax Engine)
npm run check:guide   # Status-Report: Steps, Sektionen, High-Risk-Coverage pro Stadt
npm run studio --workspace=@paymap/db      # Prisma Studio
```
