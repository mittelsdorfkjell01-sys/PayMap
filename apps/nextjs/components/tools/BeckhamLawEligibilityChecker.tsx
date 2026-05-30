'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusDot } from '@/components/ui/StatusDot';

type Props = { locale?: string };

type MoveReason = 'employed_es' | 'employed_foreign_remote' | 'autonomo_foreign' | 'director' | 'other';

const DISCLAIMER_DE = 'Diese Einschätzung ist nicht verbindlich und ersetzt keine Steuerberatung. Für einen Beckham-Antrag (Régimen de Impatriados) ist die Unterstützung eines zugelassenen spanischen Steuerberaters unbedingt erforderlich. Antrag muss innerhalb von 6 Monaten nach Umzug gestellt werden.';
const DISCLAIMER_EN = 'This assessment is not binding and does not replace tax advice. The support of a licensed Spanish tax advisor is essential for a Beckham Law (Régimen de Impatriados) application. Application must be submitted within 6 months of moving.';

const LEVEL_TONE = { green: 'pos', yellow: 'warn', red: 'neg' } as const;
const LEVEL_BORDER = { green: 'border-l-pos', yellow: 'border-l-warn', red: 'border-l-neg' } as const;

const choiceCls = (active: boolean) =>
  cn('focus-ring rounded-md border px-4 py-2 text-sm transition-colors duration-150 ease-out', active ? 'border-accent bg-accent text-accent-fg' : 'border-line text-text-2 hover:border-line-strong hover:text-text');
const optionCls = (active: boolean) =>
  cn('focus-ring rounded-md border px-3 py-2 text-left text-sm transition-colors duration-150 ease-out', active ? 'border-accent bg-accent text-accent-fg' : 'border-line text-text-2 hover:border-line-strong hover:text-text');

export function BeckhamLawEligibilityChecker({ locale = 'de' }: Props) {
  const [priorResidency, setPriorResidency] = useState<boolean | null>(null);
  const [moveReason, setMoveReason] = useState<MoveReason | null>(null);
  const [foreignIncomeShare, setForeignIncomeShare] = useState<boolean | null>(null);
  const [hasContract, setHasContract] = useState<boolean | null>(null);

  const t = (de: string, en: string) => locale === 'de' ? de : en;

  const result = (): { level: 'green' | 'yellow' | 'red'; de: string; en: string } | null => {
    if (priorResidency === true) return {
      level: 'red',
      de: 'Nicht qualifiziert: Das Beckham-Regime erfordert, dass du in den letzten 5 Jahren nicht steuerlich in Spanien ansässig warst.',
      en: 'Not qualified: The Beckham Law requires that you were not tax-resident in Spain in the last 5 years.',
    };
    if (moveReason === 'other') return {
      level: 'red',
      de: 'Nicht qualifiziert: Das Beckham-Regime gilt nur für Arbeitnehmer, Remote-Worker und Selbstständige mit Auslandsauftraggebern — nicht für Rentner oder reine Kapitalanleger.',
      en: 'Not qualified: The Beckham Law only applies to employees, remote workers and self-employed with foreign clients — not to retirees or pure investors.',
    };
    if (priorResidency === false && moveReason === 'employed_es' && hasContract === true) return {
      level: 'green',
      de: 'Hohe Wahrscheinlichkeit: Angestellte spanischer Unternehmen mit Arbeitsvertrag sind der klassische Anwendungsfall. Steuerberater für den Antrag empfohlen.',
      en: 'High probability: Employees of Spanish companies with an employment contract are the classic use case. Tax advisor recommended for the application.',
    };
    if (priorResidency === false && moveReason === 'employed_foreign_remote' && hasContract === true) return {
      level: 'green',
      de: 'Hohe Wahrscheinlichkeit: Remote-Angestellte ausländischer Unternehmen qualifizieren seit der Reform 2023. Steuerberater für den Antrag kontaktieren.',
      en: 'High probability: Remote employees of foreign companies qualify since the 2023 reform. Contact a tax advisor for the application.',
    };
    if (priorResidency === false && moveReason === 'autonomo_foreign' && foreignIncomeShare === true) return {
      level: 'green',
      de: 'Hohe Wahrscheinlichkeit: Autónomos mit über 80% Auslandseinnahmen qualifizieren seit der Reform 2023. Nachweis der ausländischen Einnahmen und Steuerberater-Unterstützung sind Pflicht.',
      en: 'High probability: Autónomos with over 80% foreign income qualify since the 2023 reform. Proof of foreign income and tax advisor support are mandatory.',
    };
    if (priorResidency === false && moveReason === 'autonomo_foreign' && foreignIncomeShare === false) return {
      level: 'red',
      de: 'Nicht qualifiziert: Als Autónomo musst du über 80% deines Einkommens aus ausländischen Quellen beziehen, um das Beckham-Regime nutzen zu können.',
      en: 'Not qualified: As an Autónomo, you must earn over 80% of your income from foreign sources to use the Beckham Law.',
    };
    if (priorResidency === false && moveReason === 'director') return {
      level: 'yellow',
      de: 'Möglicherweise qualifiziert: Direktoren und Geschäftsführer spanischer Gesellschaften können das Beckham-Regime nutzen, aber die Anforderungen sind komplex. Individuelle Prüfung durch Steuerberater unbedingt erforderlich.',
      en: 'Possibly qualified: Directors and managing directors of Spanish companies can use the Beckham Law, but the requirements are complex. Individual review by a tax advisor is absolutely necessary.',
    };
    if (hasContract === false) return {
      level: 'red',
      de: 'Nicht qualifiziert: Ein Arbeitsvertrag oder Nachweis der selbstständigen Tätigkeit ist Voraussetzung für den Beckham-Antrag.',
      en: 'Not qualified: An employment contract or proof of self-employed activity is a prerequisite for the Beckham application.',
    };
    return null;
  };

  const r = result();

  const moveReasonOptions: { value: MoveReason; de: string; en: string }[] = [
    { value: 'employed_es', de: 'Angestellt bei spanischem Unternehmen', en: 'Employed by Spanish company' },
    { value: 'employed_foreign_remote', de: 'Remote-Angestellt bei ausländischem Unternehmen', en: 'Remote-employed by foreign company' },
    { value: 'autonomo_foreign', de: 'Selbstständig mit ausländischen Kunden', en: 'Self-employed with foreign clients' },
    { value: 'director', de: 'Direktor / Geschäftsführer spanischer GmbH', en: 'Director / Managing Director of Spanish company' },
    { value: 'other', de: 'Anderer Grund (Rente, Investitionen etc.)', en: 'Other reason (retirement, investments etc.)' },
  ];

  const showForeignIncomeQ = priorResidency === false && moveReason === 'autonomo_foreign';
  const showContractQ = priorResidency === false && moveReason && !['other'].includes(moveReason) && !showForeignIncomeQ;
  const showContractAfterForeign = showForeignIncomeQ && foreignIncomeShare !== null;

  return (
    <div className="space-y-5 rounded-lg border border-line bg-surface p-5">
      <h3 className="text-h3 text-text">{t('Beckham-Gesetz Eligibility-Checker', 'Beckham Law Eligibility Checker')}</h3>

      <div className="flex items-start gap-2 rounded-md border-l-2 border-warn bg-surface-sub p-3 text-caption text-text-2">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warn" aria-hidden />
        <span>{locale === 'de' ? DISCLAIMER_DE : DISCLAIMER_EN}</span>
      </div>

      <div className="space-y-4 text-sm">
        <div>
          <p className="mb-2 text-sm text-text">
            {t('Warst du in den letzten 5 Jahren steuerlich in Spanien ansässig?', 'Were you tax-resident in Spain in the last 5 years?')}
          </p>
          <div className="flex gap-3">
            {([true, false] as const).map(v => (
              <button key={String(v)} onClick={() => { setPriorResidency(v); setMoveReason(null); setForeignIncomeShare(null); setHasContract(null); }} className={choiceCls(priorResidency === v)}>
                {v ? t('Ja', 'Yes') : t('Nein', 'No')}
              </button>
            ))}
          </div>
        </div>

        {priorResidency === false && (
          <div>
            <p className="mb-2 text-sm text-text">{t('Warum ziehst du nach Spanien?', 'Why are you moving to Spain?')}</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {moveReasonOptions.map(opt => (
                <button key={opt.value} onClick={() => { setMoveReason(opt.value); setForeignIncomeShare(null); setHasContract(null); }} className={optionCls(moveReason === opt.value)}>
                  {locale === 'de' ? opt.de : opt.en}
                </button>
              ))}
            </div>
          </div>
        )}

        {showForeignIncomeQ && (
          <div>
            <p className="mb-2 text-sm text-text">
              {t('Kommen über 80% deines Einkommens von ausländischen Kunden?', 'Does over 80% of your income come from foreign clients?')}
            </p>
            <div className="flex gap-3">
              {([true, false] as const).map(v => (
                <button key={String(v)} onClick={() => setForeignIncomeShare(v)} className={choiceCls(foreignIncomeShare === v)}>
                  {v ? t('Ja', 'Yes') : t('Nein', 'No')}
                </button>
              ))}
            </div>
          </div>
        )}

        {(showContractQ || showContractAfterForeign) && (
          <div>
            <p className="mb-2 text-sm text-text">
              {t('Hast du einen Arbeitsvertrag oder Nachweis deiner Tätigkeit?', 'Do you have an employment contract or proof of your activity?')}
            </p>
            <div className="flex gap-3">
              {([true, false] as const).map(v => (
                <button key={String(v)} onClick={() => setHasContract(v)} className={choiceCls(hasContract === v)}>
                  {v ? t('Ja', 'Yes') : t('Nein', 'No')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {r && (
        <div className={cn('flex items-start gap-2 rounded-md border border-line border-l-2 bg-surface-sub p-4 text-sm text-text', LEVEL_BORDER[r.level])}>
          <StatusDot tone={LEVEL_TONE[r.level]} className="mt-1" />
          <span>{locale === 'de' ? r.de : r.en}</span>
        </div>
      )}

      <p className="text-caption text-text-3">
        {t('Quelle: Agencia Tributaria — Régimen especial de trabajadores desplazados (Art. 93 LIRPF)', 'Source: Agencia Tributaria — Special regime for displaced workers (Art. 93 LIRPF)')}
      </p>
    </div>
  );
}
