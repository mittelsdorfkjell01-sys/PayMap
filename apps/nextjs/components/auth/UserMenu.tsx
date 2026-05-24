'use client';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

export function AuthButton() {
  const t = useTranslations('auth');
  const { user, loading, openAuthModal } = useAuth();

  if (loading) return <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />;

  if (user) return <UserMenu />;

  return (
    <button
      onClick={() => openAuthModal('login')}
      className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
        className="w-8 h-8 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center hover:bg-green-700 transition-colors"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <Link
            href={`/${locale}/onboarding`}
            onClick={() => setOpen(false)}
            className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Profil bearbeiten
          </Link>
          <button
            onClick={async () => { setOpen(false); await signOut(); }}
            className="w-full text-left flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            {t('logout')}
          </button>
        </div>
      )}
    </div>
  );
}
