/**
 * Master Premium Content Seed Orchestrator
 * Runs all Sprint 9 premium city seeds sequentially.
 * Run: npm run seed:premium (from packages/db)
 *
 * Each city seed manages its own Prisma connection. To seed a single city:
 *   npm run seed:premium:lissabon
 *   npm run seed:premium:madrid
 *   npm run seed:guides:rom
 */

import { execSync } from 'child_process';
import * as path from 'path';

const SEEDS: Array<{ label: string; script: string }> = [
  { label: 'Rom (Sprint 8 gap)', script: 'seed-sprint8-rom.ts' },
  { label: 'Lissabon (Sprint 9)', script: 'seed-sprint9-lissabon.ts' },
  { label: 'Madrid (Sprint 9)', script: 'seed-sprint9-madrid.ts' },
];

const tsnode = path.resolve(__dirname, '../../../node_modules/.bin/ts-node');
const tsconfig = path.resolve(__dirname, '../tsconfig.json');

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  PayMap — Premium Content Seeds');
  console.log(`  ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════\n');

  for (const { label, script } of SEEDS) {
    console.log(`\n▶ ${label}`);
    console.log('─'.repeat(50));
    const scriptPath = path.join(__dirname, script);
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
