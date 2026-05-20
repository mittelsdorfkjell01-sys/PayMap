'use client';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import TabBar from './TabBar';
import LocaleSwitcher from './LocaleSwitcher';
import { AuthButton } from '@/components/auth/UserMenu';

export default function Nav() {
  const locale = useLocale();

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
        <Link
          href={`/${locale}`}
          className="font-bold text-xl text-green-600 shrink-0"
        >
          paymap
        </Link>
        <div className="flex-1 min-w-0">
          <TabBar />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <LocaleSwitcher />
          <AuthButton />
        </div>
      </div>
    </nav>
  );
}
