function ts(): string {
  return new Date().toISOString().slice(11, 19);
}

export function log(task: string, action: string, details: string): void {
  console.log(`[${ts()}] [${task}] ${action}: ${details}`);
}

export function warn(task: string, action: string, details: string): void {
  console.warn(`[${ts()}] [WARN] [${task}] ${action}: ${details}`);
}

export function logError(task: string, action: string, details: string): void {
  console.error(`[${ts()}] [ERROR] [${task}] ${action}: ${details}`);
}

export interface SummaryRow {
  label: string;
  value: string | number;
}

export function printSummary(title: string, rows: SummaryRow[]): void {
  const maxLabel = Math.max(...rows.map(r => r.label.length), title.length);
  const sep = '─'.repeat(maxLabel + 22);
  console.log(`\n${sep}`);
  console.log(` ${title}`);
  console.log(sep);
  for (const row of rows) {
    console.log(`  ${row.label.padEnd(maxLabel)}  ${String(row.value)}`);
  }
  console.log(`${sep}\n`);
}
