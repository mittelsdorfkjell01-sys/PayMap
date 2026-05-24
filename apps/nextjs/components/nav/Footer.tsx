'use client';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export function Footer() {
  const locale = useLocale();

  return (
    <footer className="border-t border-outline-variant/40 mt-16 py-6">
      <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
        <p className="text-label-sm text-on-surface-variant">
          © {new Date().getFullYear()} paymap
        </p>
        <nav className="flex items-center gap-4">
          {[
            { href: `/${locale}/impressum`, label: 'Impressum' },
            { href: `/${locale}/datenschutz`, label: 'Datenschutz' },
            { href: `/${locale}/agb`, label: 'AGB' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-label-sm text-on-surface-variant hover:text-on-surface transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
