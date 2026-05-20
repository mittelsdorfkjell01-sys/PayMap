# PayMap

Netto-Gehaltsvergleich für Remote Worker und Auswanderer. Berechnet Netto-Gehalt nach lokalen Steuern, Sozialabgaben und Lebenshaltungskosten — für 17 Länder.

## Architektur

```
apps/
  nextjs/        # Next.js 14 App (Frontend + API-Routes)
packages/
  db/            # Prisma Schema + Migrations + Seed
  tax-engine/    # Steuerrechner-Paket (@paymap/tax-engine, 17 Länder-Module)
legacy/          # Archivierter Vorgänger-Code (nicht entwickeln)
  api/           # Express-API (abgelöst durch Next.js API-Routes)
  web/           # Vite-React-App (abgelöst durch apps/nextjs)
```

## Setup

### 1. Voraussetzungen

- Node.js 20+
- Docker (für PostgreSQL) oder eine externe PostgreSQL-Instanz

### 2. Datenbank starten

```bash
docker compose up -d
```

### 3. Umgebungsvariablen

```bash
cp .env.example .env
# Werte in .env befüllen (DB-URL, Supabase-Keys, Admin-Passwort)
cp apps/nextjs/.env.local.example apps/nextjs/.env.local
# Supabase-Keys in apps/nextjs/.env.local eintragen
```

### 4. Dependencies installieren

```bash
npm install
```

### 5. Datenbank einrichten

```bash
npm run db:generate   # Prisma Client generieren
npm run db:migrate    # Migrationen ausführen
npm run db:seed       # Seed-Daten laden (32 Städte, 26 Länder)
```

### 6. Dev-Server starten

```bash
npm run dev           # Next.js auf http://localhost:3000
```

## Nützliche Befehle

```bash
npm run build         # Production Build
npm run typecheck     # TypeScript-Check (Next.js + Tax Engine)
npm test              # Unit-Tests (Tax Engine)
```

## Umgebungsvariablen

Alle benötigten Variablen sind in `.env.example` dokumentiert. Vor dem Start ausfüllen.
