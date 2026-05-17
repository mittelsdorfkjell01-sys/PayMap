# PayMap

Decision tool for remote workers considering relocation abroad.

## Setup (5 steps)

1. `docker compose up -d`
2. Copy env: `cp .env.example .env` (also copy to apps/api/.env)
3. `npm run db:migrate`
4. `npm run db:seed`
5. `npm run dev`

Open http://localhost:5173 — Admin: admin@paymap.io / paymap2024!
