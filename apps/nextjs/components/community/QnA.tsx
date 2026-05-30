'use client';

import { useState } from 'react';

export type QnAItem = {
  questionDE: string;
  questionEN: string;
  answerDE: string;
  answerEN: string;
};

type Props = {
  items: QnAItem[];
  locale?: string;
  titleDE?: string;
  titleEN?: string;
};

export function QnA({ items, locale = 'de', titleDE = 'Häufige Fragen', titleEN = 'Frequently Asked Questions' }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const t = (de: string, en: string) => locale === 'de' ? de : en;

  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-h3 text-text">{t(titleDE, titleEN)}</h3>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className="overflow-hidden rounded-md border border-line">
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="focus-ring flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-surface-sub"
            >
              <span className="pr-4 text-sm text-text">
                {t(item.questionDE, item.questionEN)}
              </span>
              <span className="shrink-0 text-sm text-text-3">{isOpen ? '▲' : '▼'}</span>
            </button>
            {isOpen && (
              <div className="border-t border-line px-4 pb-4 pt-0">
                <p className="pt-3 text-sm leading-relaxed text-text-2">
                  {t(item.answerDE, item.answerEN)}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
