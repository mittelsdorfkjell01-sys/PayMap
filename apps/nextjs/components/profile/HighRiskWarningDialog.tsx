'use client';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  highRiskTitles: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function HighRiskWarningDialog({ open, highRiskTitles, onConfirm, onCancel }: Props) {
  const t = useTranslations('guide.riskWarning');

  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop ohne Blur (Spec §6) */}
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(14,14,14,0.4)' }} onClick={onCancel} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="risk-dialog-title"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-line border-l-2 border-l-neg bg-surface shadow-float"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-line px-6 py-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-neg" aria-hidden />
          <h2 id="risk-dialog-title" className="text-h3 text-text">
            {t('title')}
          </h2>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          <p className="text-body text-text">{t('intro')}</p>

          {highRiskTitles.length > 0 && (
            <ul className="space-y-1.5">
              {highRiskTitles.slice(0, 6).map((title, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text">
                  <span className="mt-0.5 shrink-0 text-neg">▸</span>
                  <span>{title}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-3 border-t border-line pt-4">
            <p className="text-sm text-text-2">{t('body1')}</p>
            <p className="text-sm text-text">{t('body2')}</p>
            <ul className="space-y-1">
              {(['bullet1', 'bullet2', 'bullet3'] as const).map((key) => (
                <li key={key} className="flex items-start gap-2 text-sm text-text-2">
                  <span className="mt-0.5 shrink-0">•</span>
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 px-6 pb-5 sm:flex-row">
          <Button onClick={onConfirm} className="flex-1">
            {t('confirm')}
          </Button>
          <Button variant="outline" onClick={onCancel} className="flex-1">
            {t('cancel')}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
