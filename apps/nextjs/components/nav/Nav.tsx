'use client';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import TabBar from './TabBar';
import LocaleSwitcher from './LocaleSwitcher';
import { AuthButton } from '@/components/auth/UserMenu';

export default function Nav() {
  const locale = useLocale();

  return (
    <nav className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-8">
        <Link
          href={`/${locale}`}
          className="font-normal text-lg tracking-tight text-primary shrink-0 hover:opacity-80 transition-opacity"
        >
          paymap
        </Link>
        <div className="flex-1 min-w-0">
          <TabBar />
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <LocaleSwitcher />
          <AuthButton />
        </div>
      </div>
    </nav>
  );
}
