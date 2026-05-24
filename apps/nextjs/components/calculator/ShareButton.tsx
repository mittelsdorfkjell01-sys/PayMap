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
      className="flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-on-surface bg-surface-container hover:bg-surface-container-high border border-outline-variant rounded-xl px-4 py-2.5 transition-all"
    >
      {state === 'loading' ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : state === 'copied' ? (
        '✓'
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
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
