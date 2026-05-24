'use client';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';

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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="risk-dialog-title"
        className="relative z-10 w-full max-w-md bg-background rounded-2xl shadow-2xl border border-error/30 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-error/8 border-b border-error/20 px-6 py-4 flex items-center gap-3">
          <span className="text-2xl leading-none">⚠️</span>
          <h2 id="risk-dialog-title" className="text-title-md font-bold text-error">
            {t('title')}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-body-md text-on-surface font-medium">{t('intro')}</p>

          {highRiskTitles.length > 0 && (
            <ul className="space-y-1.5">
              {highRiskTitles.slice(0, 6).map((title, i) => (
                <li key={i} className="flex items-start gap-2 text-body-sm text-on-surface">
                  <span className="text-error mt-0.5 shrink-0">▸</span>
                  <span>{title}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-outline-variant/30 pt-4 space-y-3">
            <p className="text-body-sm text-on-surface-variant">{t('body1')}</p>
            <p className="text-body-sm text-on-surface font-medium">{t('body2')}</p>
            <ul className="space-y-1">
              {(['bullet1', 'bullet2', 'bullet3'] as const).map((key) => (
                <li key={key} className="flex items-start gap-2 text-body-sm text-on-surface-variant">
                  <span className="shrink-0 mt-0.5">•</span>
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-5 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 btn-primary bg-error hover:bg-error/90 text-on-error py-3 rounded-xl font-semibold text-body-sm"
          >
            {t('confirm')}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-outline-variant rounded-xl text-body-sm text-on-surface-variant hover:border-outline hover:text-on-surface transition-colors"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
