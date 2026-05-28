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
      <h3 className="font-semibold text-gray-900 text-base">{t(titleDE, titleEN)}</h3>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-sm text-gray-900 pr-4">
                {t(item.questionDE, item.questionEN)}
              </span>
              <span className="text-gray-400 text-sm shrink-0">{isOpen ? '▲' : '▼'}</span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed pt-3">
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
