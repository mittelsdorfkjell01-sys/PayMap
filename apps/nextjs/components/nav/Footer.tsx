'use client';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export function Footer() {
  const locale = useLocale();

  return (
    <footer className="mt-16 border-t border-line py-6">
      <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-4 px-4 sm:px-6">
        <p className="text-caption text-text-2">
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
              className="focus-ring rounded-sm text-caption text-text-2 transition-colors hover:text-text"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
