/**
 * Master Premium Content Seed Orchestrator
 * Runs all Sprint 9 premium city seeds sequentially.
 * Run: npm run seed:premium (from packages/db)
 *
 * Each city seed manages its own Prisma connection. To seed a single city:
 *   npm run seed:premium:lissabon
 *   npm run seed:premium:madrid
 *   npm run seed:premium:amsterdam
 *   npm run seed:premium:wien
 *   npm run seed:premium:dubai
 *   npm run seed:premium:porto
 *   npm run seed:premium:barcelona
 *   npm run seed:premium:rom
 *   npm run seed:premium:paris
 *   npm run seed:premium:prag
 *   npm run seed:premium:budapest
 *   npm run seed:premium:zuerich
 *   npm run seed:premium:bangkok
 *   npm run seed:guides:rom
 */

import { execSync } from 'child_process';
import * as path from 'path';

const SEEDS: Array<{ label: string; script: string }> = [
  { label: 'Rom (Sprint 8 gap)',       script: 'seed-sprint8-rom.ts' },
  { label: 'Lissabon (Sprint 9)',      script: 'seed-sprint9-lissabon.ts' },
  { label: 'Madrid (Sprint 9)',        script: 'seed-sprint9-madrid.ts' },
  { label: 'Amsterdam (Sprint 9)',     script: 'seed-sprint9-amsterdam.ts' },
  { label: 'Wien (Sprint 9)',          script: 'seed-sprint9-wien.ts' },
  { label: 'Dubai (Sprint 9)',         script: 'seed-sprint9-dubai.ts' },
  { label: 'Porto (Sprint 9)',         script: 'seed-sprint9-porto.ts' },
  { label: 'Barcelona (Sprint 9)',     script: 'seed-sprint9-barcelona.ts' },
  { label: 'Rom Premium (Sprint 9)',   script: 'seed-sprint9-rom-premium.ts' },
  { label: 'Paris (Sprint 9)',         script: 'seed-sprint9-paris.ts' },
  { label: 'Prag (Sprint 9)',          script: 'seed-sprint9-prag.ts' },
  // Budapest, Zürich, Bangkok added in Task 5 completion:
  { label: 'Budapest (Sprint 9)',      script: 'seed-sprint9-budapest.ts' },
  { label: 'Zürich (Sprint 9)',        script: 'seed-sprint9-zuerich.ts' },
  { label: 'Bangkok (Sprint 9)',       script: 'seed-sprint9-bangkok.ts' },
];

const tsnode = path.resolve(__dirname, '../../../node_modules/.bin/ts-node');
const tsconfig = path.resolve(__dirname, '../tsconfig.json');

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  PayMap — Premium Content Seeds');
  console.log(`  ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════\n');

  for (const { label, script } of SEEDS) {
    const scriptPath = path.join(__dirname, script);
    const fs = require('fs');
    if (!fs.existsSync(scriptPath)) {
      console.log(`\n⚠  ${label} — script not found, skipping: ${script}`);
      continue;
    }
    console.log(`\n▶ ${label}`);
    console.log('─'.repeat(50));
    execSync(`"${tsnode}" --project "${tsconfig}" "${scriptPath}"`, {
      stdio: 'inherit',
      env: process.env,
    });
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  All premium seeds complete.');
  console.log('═══════════════════════════════════════════════════');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
