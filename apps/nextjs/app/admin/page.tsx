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
  { href: '/admin/countries',            title: '🌍 Länder',           desc: 'Länder anlegen, bearbeiten und deaktivieren.',                     color: 'bg-slate-50   border-slate-200' },
  { href: '/admin/cities',               title: '🏙 Städte (Scores)',   desc: 'Lifestyle-Scores pro Stadt und Kategorie pflegen.',                color: 'bg-blue-50    border-blue-200' },
  { href: '/admin/moving-guide',         title: '📋 Moving Guide',      desc: 'Checklisten-Schritte für Auswanderungsziele verwalten.',           color: 'bg-green-50   border-green-200' },
  { href: '/admin/regimes',              title: '🏛 Steuerregimes',     desc: 'Sondersteuerregimes (NHR, Beckham, UAE, etc.) bearbeiten.',        color: 'bg-purple-50  border-purple-200' },
  { href: '/admin/tax-brackets',         title: '📊 Steuersätze',       desc: 'Einkommensteuertabellen pro Land und Jahr pflegen.',               color: 'bg-orange-50  border-orange-200' },
  { href: '/admin/social-contributions', title: '🤝 Sozialabgaben',     desc: 'Arbeitnehmer-Beitragssätze und Bemessungsgrenzen pro Land.',      color: 'bg-rose-50    border-rose-200' },
  { href: '/admin/deductions',           title: '✂️ Freibeträge',       desc: 'Pauschalen und Prozentabzüge pro Land und Jahr.',                  color: 'bg-yellow-50  border-yellow-200' },
  { href: '/admin/exchange-rates',       title: '💱 Wechselkurse',      desc: 'Manuelle Kurspflege; automatisch aktualisiert per Cron.',         color: 'bg-teal-50    border-teal-200' },
  { href: '/admin/stale-content',        title: '⏰ Veraltete Inhalte',  desc: 'Inhalte ohne Prüfung seit >90 Tagen — Guide-Steps, Narratives, CoL.', color: 'bg-amber-50   border-amber-200' },
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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">PayMap Admin — Übersicht aller Datenbereiche</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statRows.map((row) => (
          <div key={row.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-3xl font-bold text-gray-900 font-mono">{row.value}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{row.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((sec) => (
          <Link key={sec.href} href={sec.href} className={`block border rounded-xl p-5 hover:shadow-sm transition-shadow ${sec.color}`}>
            <p className="font-semibold text-gray-900">{sec.title}</p>
            <p className="text-sm text-gray-600 mt-1">{sec.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
