'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

/**
 * TabBar (Spec §6). Aktiver Tab: text-text + 2px untere Border in --text.
 * Inaktiv: text-2. Keine Flächen, keine Grün-Hervorhebung.
 */
const tabs = [
  { key: 'calculator', path: '' },
  { key: 'ranking', path: '/ranking' },
  { key: 'steuerGuide', path: '/steuer-guide' },
  { key: 'guide', path: '/guide' },
] as const;

export default function TabBar() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('nav.tabs');

  function isActive(tabPath: string): boolean {
    const fullPath = `/${locale}${tabPath}`;
    if (tabPath === '') {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname.startsWith(fullPath);
  }

  return (
    <div className="scrollbar-none flex items-center gap-6 overflow-x-auto">
      {tabs.map((tab) => {
        const href = `/${locale}${tab.path}`;
        const active = isActive(tab.path);
        return (
          <Link
            key={tab.key}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'focus-ring whitespace-nowrap border-b-2 py-[18px] text-sm transition-colors duration-150 ease-out',
              active
                ? 'border-text text-text'
                : 'border-transparent text-text-2 hover:text-text'
            )}
          >
            {t(tab.key)}
          </Link>
        );
      })}
    </div>
  );
}
