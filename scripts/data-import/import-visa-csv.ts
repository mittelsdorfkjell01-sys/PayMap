import { prisma } from './_lib/prisma';
import { log, warn, logError, printSummary } from './_lib/logger';
import { readFileSync } from 'fs';
import { join } from 'path';

// ── Args ──────────────────────────────────────────────────────────────────────

const args       = process.argv.slice(2);
const isDryRun   = args.includes('--dry-run');
const fileArg    = args.find(a => a.startsWith('--file='))?.split('=')[1];
const csvPath    = fileArg
  ? join(process.cwd(), fileArg)
  : join(__dirname, 'data', 'visa-rules.csv');

// ── CSV parser ────────────────────────────────────────────────────────────────

function parseCSV(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const ch   = content[i];
    const next = content[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') { field += '"'; i++; }
      else if (ch === '"')            { inQuotes = false; }
      else                            { field += ch; }
    } else {
      if      (ch === '"')  { inQuotes = true; }
      else if (ch === ',')  { row.push(field); field = ''; }
      else if (ch === '\r' && next === '\n') {
        i++;
        row.push(field); field = '';
        rows.push(row);  row   = [];
      } else if (ch === '\n') {
        row.push(field); field = '';
        rows.push(row);  row   = [];
      } else { field += ch; }
    }
  }
  if (field || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface VisaRow {
  country_slug:             string;
  from_nationality:         string;
  visa_type:                string;
  name_de:                  string;
  name_en:                  string;
  requirements_de:          string;
  requirements_en:          string;
  processing_days:          string;
  cost_eur:                 string;
  min_income_eur:           string;
  duration_months:          string;
  renewable:                string;
  path_citizenship_years:   string;
  source_url:               string;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  log('visa', 'start', isDryRun ? `DRY-RUN — ${csvPath}` : `LIVE — ${csvPath}`);

  const content = readFileSync(csvPath, 'utf-8');
  const [header, ...dataRows] = parseCSV(content).filter(r => r.some(f => f.trim()));

  if (!header) {
    logError('visa', 'parse', 'CSV is empty');
    process.exit(1);
  }

  const col = (name: string) => header.indexOf(name);
  const required = ['country_slug','from_nationality','visa_type','name_de','name_en',
                    'requirements_de','requirements_en','processing_days','source_url'];
  const missing = required.filter(n => col(n) === -1);
  if (missing.length) {
    logError('visa', 'parse', `Missing columns: ${missing.join(', ')}`);
    process.exit(1);
  }

  log('visa', 'parse', `${dataRows.length} data rows, ${header.length} columns`);

  // Build country slug → id map
  const countries = await prisma.country.findMany({ select: { id: true, slug: true } });
  const countryMap = new Map(countries.map(c => [c.slug, c.id]));

  const counters = { created: 0, updated: 0, skipped: 0, errors: 0 };

  for (let i = 0; i < dataRows.length; i++) {
    const raw = dataRows[i];
    if (raw.length < header.length) {
      warn('visa', 'parse', `Row ${i + 2}: only ${raw.length} columns, expected ${header.length} — skipping`);
      counters.skipped++;
      continue;
    }

    const r: VisaRow = {
      country_slug:           raw[col('country_slug')]?.trim()           ?? '',
      from_nationality:       raw[col('from_nationality')]?.trim()       ?? '',
      visa_type:              raw[col('visa_type')]?.trim()               ?? '',
      name_de:                raw[col('name_de')]?.trim()                 ?? '',
      name_en:                raw[col('name_en')]?.trim()                 ?? '',
      requirements_de:        raw[col('requirements_de')]?.trim()         ?? '',
      requirements_en:        raw[col('requirements_en')]?.trim()         ?? '',
      processing_days:        raw[col('processing_days')]?.trim()         ?? '',
      cost_eur:               raw[col('cost_eur')]?.trim()                ?? '',
      min_income_eur:         raw[col('min_income_eur')]?.trim()          ?? '',
      duration_months:        raw[col('duration_months')]?.trim()         ?? '',
      renewable:              raw[col('renewable')]?.trim()               ?? 'false',
      path_citizenship_years: raw[col('path_citizenship_years')]?.trim()  ?? '',
      source_url:             raw[col('source_url')]?.trim()              ?? '',
    };

    if (!r.country_slug || !r.from_nationality || !r.visa_type) {
      warn('visa', 'skip', `Row ${i + 2}: missing required key fields — skipping`);
      counters.skipped++;
      continue;
    }

    const countryId = countryMap.get(r.country_slug);
    if (!countryId) {
      warn('visa', 'skip', `Row ${i + 2}: unknown country_slug "${r.country_slug}" — skipping`);
      counters.skipped++;
      continue;
    }

    const data = {
      countryId,
      fromNationality:        r.from_nationality,
      visaType:               r.visa_type,
      nameDE:                 r.name_de,
      nameEN:                 r.name_en,
      requirementsDE:         r.requirements_de,
      requirementsEN:         r.requirements_en,
      processingDays:         r.processing_days,
      costEUR:                r.cost_eur    ? parseInt(r.cost_eur, 10)    : null,
      minIncomeEUR:           r.min_income_eur ? parseInt(r.min_income_eur, 10) : null,
      durationMonths:         r.duration_months ? parseInt(r.duration_months, 10) : null,
      renewable:              r.renewable.toLowerCase() === 'true',
      pathToCitizenshipYears: r.path_citizenship_years ? parseInt(r.path_citizenship_years, 10) : null,
      sourceUrl:              r.source_url,
    };

    if (isDryRun) {
      const action = 'create/update';
      console.log(
        `  [dry-run] ${r.country_slug.padEnd(10)} ` +
        `${r.from_nationality}→${r.visa_type.padEnd(20)} ` +
        `${r.name_en} [${action}]`
      );
      counters.created++;
      continue;
    }

    try {
      const existing = await prisma.visaRule.findUnique({
        where: { countryId_fromNationality_visaType: {
          countryId, fromNationality: r.from_nationality, visaType: r.visa_type,
        }},
      });

      if (existing) {
        await prisma.visaRule.update({ where: { id: existing.id }, data });
        counters.updated++;
        log('visa', 'update', `${r.country_slug} ${r.from_nationality}→${r.visa_type}`);
      } else {
        await prisma.visaRule.create({ data });
        counters.created++;
        log('visa', 'create', `${r.country_slug} ${r.from_nationality}→${r.visa_type}`);
      }
    } catch (err) {
      logError('visa', 'db', `Row ${i + 2} ${r.country_slug}: ${String(err)}`);
      counters.errors++;
    }
  }

  await prisma.$disconnect();

  printSummary('Visa CSV Import', [
    { label: 'Mode',    value: isDryRun ? 'DRY-RUN' : 'LIVE' },
    { label: 'File',    value: csvPath },
    { label: 'Created', value: counters.created },
    { label: 'Updated', value: counters.updated },
    { label: 'Skipped', value: counters.skipped },
    { label: 'Errors',  value: counters.errors  },
  ]);
}

main().catch(err => {
  logError('visa', 'fatal', String(err));
  prisma.$disconnect().catch(() => undefined);
  process.exit(1);
});
