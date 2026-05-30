'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Flag, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Props = {
  citySlug?: string;
  locale?: string;
};

const FIELD_CLS =
  'w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-text focus:border-focus focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--focus)_25%,transparent)] focus:outline-none';

export function FeedbackButton({ citySlug, locale = 'de' }: Props) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const t = (de: string, en: string) => locale === 'de' ? de : en;

  const categories = [
    { value: 'rent_prices', de: 'Mietpreise veraltet', en: 'Rent prices outdated' },
    { value: 'tax_info', de: 'Steuerinformation ungenau', en: 'Tax information inaccurate' },
    { value: 'visa_rules', de: 'Visa-Regeln geändert', en: 'Visa rules changed' },
    { value: 'bank_info', de: 'Banking-Information veraltet', en: 'Banking information outdated' },
    { value: 'other', de: 'Sonstiges', en: 'Other' },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category || !description.trim()) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/community/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ citySlug, category, description, userEmail: email || undefined }),
      });
      if (!res.ok) throw new Error();
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  const modal = open && (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" style={{ backgroundColor: 'rgba(14,14,14,0.4)' }}>
      <div className="w-full max-w-md space-y-4 rounded-xl border border-line bg-surface p-6 shadow-float">
        <div className="flex items-center justify-between">
          <h2 className="text-h3 text-text">{t('Daten veraltet? Melden', 'Data outdated? Report it')}</h2>
          <button onClick={() => setOpen(false)} aria-label={t('Schließen', 'Close')} className="focus-ring rounded-md p-1 text-text-3 transition-colors hover:text-text">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {status === 'done' ? (
          <div className="py-6 text-center">
            <div className="mb-2 flex justify-center"><Check className="h-7 w-7 text-pos" aria-hidden /></div>
            <p className="text-body text-text">{t('Danke für dein Feedback!', 'Thank you for your feedback!')}</p>
            <p className="mt-1 text-sm text-text-2">{t('Wir prüfen es und aktualisieren die Daten wenn nötig.', 'We will review it and update the data if needed.')}</p>
            <button onClick={() => { setOpen(false); setStatus('idle'); setDescription(''); setCategory(''); setEmail(''); }} className="focus-ring mt-4 rounded-sm text-sm text-focus underline">
              {t('Schließen', 'Close')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-caption uppercase tracking-[0.04em] text-text-3">{t('Kategorie', 'Category')}</label>
              <select value={category} onChange={e => setCategory(e.target.value)} required className={FIELD_CLS}>
                <option value="">{t('Bitte wählen…', 'Please select…')}</option>
                {categories.map(c => <option key={c.value} value={c.value}>{locale === 'de' ? c.de : c.en}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-caption uppercase tracking-[0.04em] text-text-3">{t('Was stimmt nicht?', 'What is wrong?')}</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={3}
                placeholder={t('Beschreibe kurz was veraltet oder falsch ist…', 'Briefly describe what is outdated or incorrect…')}
                className={`${FIELD_CLS} resize-none placeholder:text-text-3`} />
            </div>
            <div>
              <label className="mb-1 block text-caption uppercase tracking-[0.04em] text-text-3">{t('E-Mail (optional, für Rückmeldung)', 'Email (optional, for reply)')}</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="deine@email.de" />
            </div>
            {status === 'error' && (
              <p className="text-sm text-neg">{t('Fehler beim Senden. Bitte nochmals versuchen.', 'Error sending. Please try again.')}</p>
            )}
            <Button type="submit" disabled={status === 'sending'} className="w-full">
              {status === 'sending' ? t('Senden…', 'Sending…') : t('Feedback senden', 'Send feedback')}
            </Button>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="focus-ring inline-flex items-center gap-1.5 rounded-sm text-caption text-text-3 underline-offset-2 transition-colors hover:text-text"
      >
        <Flag className="h-3 w-3" aria-hidden />
        {t('Daten veraltet? Melden', 'Data outdated? Report')}
      </button>
      {typeof document !== 'undefined' && modal && createPortal(modal, document.body)}
    </>
  );
}
