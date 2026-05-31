'use client';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export function Footer() {
  const locale = useLocale();

  return (
    <footer className="border-t border-border/30 mt-20 py-8">
      <div className="max-w-3xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs font-light text-muted-foreground tracking-wide">
          © {new Date().getFullYear()} paymap
        </p>
        <nav className="flex items-center gap-6">
          {[
            { href: `/${locale}/impressum`, label: 'Impressum' },
            { href: `/${locale}/datenschutz`, label: 'Datenschutz' },
            { href: `/${locale}/agb`, label: 'AGB' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs font-light text-muted-foreground hover:text-foreground transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
