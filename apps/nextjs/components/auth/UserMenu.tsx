'use client';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export function AuthButton() {
  const t = useTranslations('auth');
  const { user, loading, openAuthModal } = useAuth();

  if (loading) return <div className="h-8 w-8 animate-pulse rounded-full bg-surface-sub" />;

  if (user) return <UserMenu />;

  return (
    <button
      onClick={() => openAuthModal('login')}
      className="focus-ring rounded-md border border-line px-3 py-1.5 text-sm text-text-2 transition-colors hover:border-line-strong hover:text-text"
    >
      {t('login')}
    </button>
  );
}

function UserMenu() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-accent text-data-sm tabular text-accent-fg transition-opacity hover:opacity-90"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-48 rounded-md border border-line bg-surface py-1 shadow-float">
          <div className="border-b border-line px-3 py-2">
            <p className="truncate text-caption text-text-2">{user?.email}</p>
          </div>
          <Link
            href={`/${locale}/onboarding`}
            onClick={() => setOpen(false)}
            className="flex items-center px-3 py-2 text-sm text-text transition-colors hover:bg-surface-sub"
          >
            Profil bearbeiten
          </Link>
          <button
            onClick={async () => { setOpen(false); await signOut(); }}
            className="flex w-full items-center px-3 py-2 text-left text-sm text-neg transition-colors hover:bg-surface-sub"
          >
            {t('logout')}
          </button>
        </div>
      )}
    </div>
  );
}
