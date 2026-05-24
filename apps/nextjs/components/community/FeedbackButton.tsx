'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  citySlug?: string;
  locale?: string;
};

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">{t('Daten veraltet? Melden', 'Data outdated? Report it')}</h2>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        {status === 'done' ? (
          <div className="py-6 text-center">
            <div className="text-3xl mb-2">✓</div>
            <p className="text-gray-700 font-medium">{t('Danke für dein Feedback!', 'Thank you for your feedback!')}</p>
            <p className="text-sm text-gray-500 mt-1">{t('Wir prüfen es und aktualisieren die Daten wenn nötig.', 'We will review it and update the data if needed.')}</p>
            <button onClick={() => { setOpen(false); setStatus('idle'); setDescription(''); setCategory(''); setEmail(''); }} className="mt-4 text-blue-600 text-sm underline">
              {t('Schließen', 'Close')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('Kategorie', 'Category')}</label>
              <select value={category} onChange={e => setCategory(e.target.value)} required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">{t('Bitte wählen…', 'Please select…')}</option>
                {categories.map(c => <option key={c.value} value={c.value}>{locale === 'de' ? c.de : c.en}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('Was stimmt nicht?', 'What is wrong?')}</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={3}
                placeholder={t('Beschreibe kurz was veraltet oder falsch ist…', 'Briefly describe what is outdated or incorrect…')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('E-Mail (optional, für Rückmeldung)', 'Email (optional, for reply)')}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="deine@email.de"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {status === 'error' && (
              <p className="text-red-600 text-sm">{t('Fehler beim Senden. Bitte nochmals versuchen.', 'Error sending. Please try again.')}</p>
            )}
            <button type="submit" disabled={status === 'sending'}
              className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {status === 'sending' ? t('Senden…', 'Sending…') : t('Feedback senden', 'Send feedback')}
            </button>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
      >
        <span>⚑</span>
        {t('Daten veraltet? Melden', 'Data outdated? Report')}
      </button>
      {typeof document !== 'undefined' && modal && createPortal(modal, document.body)}
    </>
  );
}
