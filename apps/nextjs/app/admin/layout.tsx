import Link from 'next/link';
import { GeistSans } from 'geist/font/sans';
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
      { href: '/admin/stale-content', label: '⏰ Veraltete Inhalte' },
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
      <html lang="de" className={GeistSans.variable}>
        <body className="flex min-h-screen items-center justify-center bg-bg font-sans">
          <AdminLoginForm />
        </body>
      </html>
    );
  }

  return (
    <html lang="de" className={GeistSans.variable}>
      <body className="flex min-h-screen bg-bg font-sans text-sm text-text">
        <nav className="flex min-h-screen w-56 shrink-0 flex-col gap-4 border-r border-line bg-surface px-3 py-5">
          <p className="px-2 text-caption font-medium uppercase tracking-[0.04em] text-text-3">PayMap Admin</p>
          {navSections.map((section) => (
            <div key={section.label} className="space-y-0.5">
              <p className="mb-1 px-2 text-caption uppercase tracking-[0.04em] text-text-3">{section.label}</p>
              {section.links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-text-2 transition-colors hover:bg-surface-sub hover:text-text"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
          <div className="mt-auto border-t border-line pt-4">
            <AdminLogoutButton />
          </div>
        </nav>
        <main className="min-h-screen flex-1 overflow-y-auto p-8">{children}</main>
      </body>
    </html>
  );
}
