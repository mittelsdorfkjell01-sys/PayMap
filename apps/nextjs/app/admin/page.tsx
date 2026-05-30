import Link from 'next/link';
import { prisma } from '@/lib/prisma';

async function getStats() {
  const [cities, countries, regimes, guideSteps, brackets, social, deductions, rates] = await Promise.all([
    prisma.city.count({ where: { isActive: true } }),
    prisma.country.count({ where: { isActive: true } }),
    prisma.specialRegime.count(),
    prisma.movingGuide.count({ where: { isActive: true } }),
    prisma.taxBracket.count(),
    prisma.socialContribution.count(),
    prisma.deduction.count(),
    prisma.exchangeRate.count(),
  ]);
  return { cities, countries, regimes, guideSteps, brackets, social, deductions, rates };
}

const sections = [
  { href: '/admin/countries',            title: '🌍 Länder',           desc: 'Länder anlegen, bearbeiten und deaktivieren.' },
  { href: '/admin/cities',               title: '🏙 Städte (Scores)',   desc: 'Lifestyle-Scores pro Stadt und Kategorie pflegen.' },
  { href: '/admin/moving-guide',         title: '📋 Moving Guide',      desc: 'Checklisten-Schritte für Auswanderungsziele verwalten.' },
  { href: '/admin/regimes',              title: '🏛 Steuerregimes',     desc: 'Sondersteuerregimes (NHR, Beckham, UAE, etc.) bearbeiten.' },
  { href: '/admin/tax-brackets',         title: '📊 Steuersätze',       desc: 'Einkommensteuertabellen pro Land und Jahr pflegen.' },
  { href: '/admin/social-contributions', title: '🤝 Sozialabgaben',     desc: 'Arbeitnehmer-Beitragssätze und Bemessungsgrenzen pro Land.' },
  { href: '/admin/deductions',           title: '✂️ Freibeträge',       desc: 'Pauschalen und Prozentabzüge pro Land und Jahr.' },
  { href: '/admin/exchange-rates',       title: '💱 Wechselkurse',      desc: 'Manuelle Kurspflege; automatisch aktualisiert per Cron.' },
  { href: '/admin/stale-content',        title: '⏰ Veraltete Inhalte',  desc: 'Inhalte ohne Prüfung seit >90 Tagen — Guide-Steps, Narratives, CoL.' },
];

export default async function AdminDashboard() {
  const s = await getStats();

  const statRows = [
    { label: 'Aktive Länder',    value: s.countries },
    { label: 'Aktive Städte',    value: s.cities },
    { label: 'Steuerregimes',    value: s.regimes },
    { label: 'Guide-Schritte',   value: s.guideSteps },
    { label: 'Steuerklassen',    value: s.brackets },
    { label: 'Sozialabgaben',    value: s.social },
    { label: 'Freibeträge',      value: s.deductions },
    { label: 'Wechselkurse',     value: s.rates },
  ];

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-h1 text-text">Dashboard</h1>
        <p className="mt-1 text-sm text-text-2">PayMap Admin — Übersicht aller Datenbereiche</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statRows.map((row) => (
          <div key={row.label} className="rounded-lg border border-line bg-surface p-5">
            <p className="text-data-xl tabular text-text">{row.value}</p>
            <p className="mt-1 text-caption text-text-2">{row.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {sections.map((sec) => (
          <Link key={sec.href} href={sec.href} className="block rounded-lg border border-line bg-surface p-5 transition-colors hover:border-line-strong hover:bg-surface-sub">
            <p className="text-text">{sec.title}</p>
            <p className="mt-1 text-sm text-text-2">{sec.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
