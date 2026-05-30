'use client';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import TabBar from './TabBar';
import LocaleSwitcher from './LocaleSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';
import { AuthButton } from '@/components/auth/UserMenu';

/**
 * Top-Nav (Spec §6). 56px hoch, 1px untere Hairline, bg-bg — kein Glas, kein Blur,
 * bleibt beim Scrollen schlicht solide.
 */
export default function Nav() {
  const locale = useLocale();

  return (
    <nav className="sticky top-0 z-50 border-b border-line bg-bg">
      <div className="mx-auto flex h-14 max-w-content items-center gap-6 px-4 sm:px-6">
        <Link
          href={`/${locale}`}
          className="focus-ring shrink-0 rounded-sm text-h3 font-medium tracking-[-0.02em] text-text"
        >
          paymap
        </Link>
        <div className="min-w-0 flex-1">
          <TabBar />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <LocaleSwitcher />
          <ThemeSwitcher />
          <AuthButton />
        </div>
      </div>
    </nav>
  );
}
