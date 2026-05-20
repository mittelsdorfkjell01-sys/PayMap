import Link from 'next/link';
import { isAdmin } from '@/lib/admin-auth';
import AdminLoginForm from './_components/AdminLoginForm';
import AdminLogoutButton from './_components/AdminLogoutButton';
import '../globals.css';

const navSections = [
  {
    label: 'Inhalt',
    links: [
      { href: '/admin', label: 'Dashboard' },
      { href: '/admin/countries', label: '🌍 Länder' },
      { href: '/admin/cities', label: '🏙 Städte (Scores)' },
      { href: '/admin/moving-guide', label: '📋 Moving Guide' },
      { href: '/admin/regimes', label: '🏛 Steuerregimes' },
    ],
  },
  {
    label: 'Steuersysteme',
    links: [
      { href: '/admin/tax-brackets', label: '📊 Steuersätze' },
      { href: '/admin/social-contributions', label: '🤝 Sozialabgaben' },
      { href: '/admin/deductions', label: '✂️ Freibeträge' },
      { href: '/admin/exchange-rates', label: '💱 Wechselkurse' },
    ],
  },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {

  if (!await isAdmin()) {
    return (
      <html lang="de">
        <body className="min-h-screen bg-gray-100 flex items-center justify-center">
          <AdminLoginForm />
        </body>
      </html>
    );
  }

  return (
    <html lang="de">
      <body className="min-h-screen bg-gray-50 flex text-gray-900 text-sm">
        <nav className="w-56 bg-white border-r border-gray-200 flex flex-col py-5 px-3 gap-4 shrink-0 min-h-screen">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 px-2">PayMap Admin</p>
          {navSections.map((section) => (
            <div key={section.label} className="space-y-0.5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-1">{section.label}</p>
              {section.links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
          <div className="mt-auto pt-4 border-t border-gray-100">
            <AdminLogoutButton />
          </div>
        </nav>
        <main className="flex-1 p-8 min-h-screen overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}
