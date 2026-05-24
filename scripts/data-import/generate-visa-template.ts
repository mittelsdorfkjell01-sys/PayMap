import { prisma } from './_lib/prisma';
import { log, logError } from './_lib/logger';
import { writeFileSync } from 'fs';
import { join } from 'path';

// ── CSV helpers ───────────────────────────────────────────────────────────────

function csvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

function csvRow(fields: string[]): string {
  return fields.map(csvField).join(',');
}

// ── Main ──────────────────────────────────────────────────────────────────────

const COLUMNS = [
  'country_slug',
  'from_nationality',
  'visa_type',
  'name_de',
  'name_en',
  'requirements_de',
  'requirements_en',
  'processing_days',
  'cost_eur',
  'min_income_eur',
  'duration_months',
  'renewable',
  'path_citizenship_years',
  'source_url',
] as const;

async function main() {
  const countries = await prisma.country.findMany({
    select: { slug: true, nameDE: true, nameEN: true },
    where:  { isActive: true },
    orderBy: { slug: 'asc' },
  });
  log('visa-template', 'setup', `${countries.length} active countries`);

  const rows: string[] = [csvRow([...COLUMNS])];

  for (const c of countries) {
    rows.push(csvRow([
      c.slug,
      'DE',            // from_nationality — most relevant for PayMap's audience
      '',              // visa_type
      '',              // name_de
      '',              // name_en
      '',              // requirements_de
      '',              // requirements_en
      '',              // processing_days  (e.g. "30-60 Werktage")
      '',              // cost_eur
      '',              // min_income_eur
      '',              // duration_months
      'false',         // renewable
      '',              // path_citizenship_years
      '',              // source_url
    ]));
  }

  const outPath = join(__dirname, 'data', 'visa-rules-template.csv');
  writeFileSync(outPath, rows.join('\n'), 'utf-8');
  log('visa-template', 'done', `Wrote ${rows.length - 1} rows → ${outPath}`);

  await prisma.$disconnect();
}

main().catch(err => {
  logError('visa-template', 'fatal', String(err));
  prisma.$disconnect().catch(() => undefined);
  process.exit(1);
});
