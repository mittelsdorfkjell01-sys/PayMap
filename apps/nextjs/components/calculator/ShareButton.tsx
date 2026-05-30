'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

interface ShareButtonProps {
  payload: Record<string, unknown> | null;
}

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://paymap.io').replace(/\/$/, '');

export function ShareButton({ payload }: ShareButtonProps) {
  const t = useTranslations('results');
  const locale = useLocale();
  const [state, setState] = useState<'idle' | 'loading' | 'copied' | 'error'>('idle');

  if (!payload) return null;

  async function handleShare() {
    if (state === 'loading') return;
    setState('loading');
    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, persistShare: true, locale }),
      });
      if (!res.ok) { setState('error'); setTimeout(() => setState('idle'), 3000); return; }
      const data = await res.json();
      const url = `${APP_URL}/${locale}/c/${data.shareToken}`;
      await navigator.clipboard.writeText(url);
      setState('copied');
      setTimeout(() => setState('idle'), 3000);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={state === 'loading'}
      aria-label={t('share')}
      className="focus-ring flex h-10 items-center gap-2 rounded-md border border-line bg-surface px-4 text-sm text-text-2 transition-colors duration-150 ease-out hover:border-line-strong hover:text-text disabled:opacity-40"
    >
      {state === 'loading' ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : state === 'copied' ? (
        <span className="text-pos">✓</span>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      )}
      <span>
        {state === 'copied' ? t('linkCopied') : state === 'error' ? t('shareFailed') : t('share')}
      </span>
    </button>
  );
}
