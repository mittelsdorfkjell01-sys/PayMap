'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

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
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
      {tabs.map((tab) => {
        const href = `/${locale}${tab.path}`;
        const active = isActive(tab.path);
        return (
          <Link
            key={tab.key}
            href={href}
            className={cn(
              'px-3 py-1.5 text-sm font-light rounded-md whitespace-nowrap transition-all duration-200',
              active
                ? 'text-primary bg-primary-light/50'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            {t(tab.key)}
          </Link>
        );
      })}
    </div>
  );
}
