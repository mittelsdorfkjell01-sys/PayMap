'use client';

import { useState } from 'react';

type Props = { locale?: string };

type MoveReason = 'employed_es' | 'employed_foreign_remote' | 'autonomo_foreign' | 'director' | 'other';

const DISCLAIMER_DE = 'Diese Einschätzung ist nicht verbindlich und ersetzt keine Steuerberatung. Für einen Beckham-Antrag (Régimen de Impatriados) ist die Unterstützung eines zugelassenen spanischen Steuerberaters unbedingt erforderlich. Antrag muss innerhalb von 6 Monaten nach Umzug gestellt werden.';
const DISCLAIMER_EN = 'This assessment is not binding and does not replace tax advice. The support of a licensed Spanish tax advisor is essential for a Beckham Law (Régimen de Impatriados) application. Application must be submitted within 6 months of moving.';

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
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-5">
      <h3 className="font-semibold text-gray-900">{t('Beckham-Gesetz Eligibility-Checker', 'Beckham Law Eligibility Checker')}</h3>

      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
        ⚠ {locale === 'de' ? DISCLAIMER_DE : DISCLAIMER_EN}
      </div>

      <div className="space-y-4 text-sm">
        <div>
          <p className="font-medium text-gray-800 mb-2">
            {t('Warst du in den letzten 5 Jahren steuerlich in Spanien ansässig?', 'Were you tax-resident in Spain in the last 5 years?')}
          </p>
          <div className="flex gap-3">
            {([true, false] as const).map(v => (
              <button key={String(v)} onClick={() => { setPriorResidency(v); setMoveReason(null); setForeignIncomeShare(null); setHasContract(null); }}
                className={`px-4 py-2 rounded-lg border font-medium transition-colors ${priorResidency === v ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:border-blue-400'}`}>
                {v ? t('Ja', 'Yes') : t('Nein', 'No')}
              </button>
            ))}
          </div>
        </div>

        {priorResidency === false && (
          <div>
            <p className="font-medium text-gray-800 mb-2">{t('Warum ziehst du nach Spanien?', 'Why are you moving to Spain?')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {moveReasonOptions.map(opt => (
                <button key={opt.value} onClick={() => { setMoveReason(opt.value); setForeignIncomeShare(null); setHasContract(null); }}
                  className={`px-3 py-2 rounded-lg border text-left text-sm transition-colors ${moveReason === opt.value ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:border-blue-400'}`}>
                  {locale === 'de' ? opt.de : opt.en}
                </button>
              ))}
            </div>
          </div>
        )}

        {showForeignIncomeQ && (
          <div>
            <p className="font-medium text-gray-800 mb-2">
              {t('Kommen über 80% deines Einkommens von ausländischen Kunden?', 'Does over 80% of your income come from foreign clients?')}
            </p>
            <div className="flex gap-3">
              {([true, false] as const).map(v => (
                <button key={String(v)} onClick={() => setForeignIncomeShare(v)}
                  className={`px-4 py-2 rounded-lg border font-medium transition-colors ${foreignIncomeShare === v ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:border-blue-400'}`}>
                  {v ? t('Ja', 'Yes') : t('Nein', 'No')}
                </button>
              ))}
            </div>
          </div>
        )}

        {(showContractQ || showContractAfterForeign) && (
          <div>
            <p className="font-medium text-gray-800 mb-2">
              {t('Hast du einen Arbeitsvertrag oder Nachweis deiner Tätigkeit?', 'Do you have an employment contract or proof of your activity?')}
            </p>
            <div className="flex gap-3">
              {([true, false] as const).map(v => (
                <button key={String(v)} onClick={() => setHasContract(v)}
                  className={`px-4 py-2 rounded-lg border font-medium transition-colors ${hasContract === v ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:border-blue-400'}`}>
                  {v ? t('Ja', 'Yes') : t('Nein', 'No')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {r && (
        <div className={`rounded-lg p-4 text-sm ${r.level === 'green' ? 'bg-green-50 border border-green-200 text-green-900' : r.level === 'yellow' ? 'bg-amber-50 border border-amber-200 text-amber-900' : 'bg-red-50 border border-red-200 text-red-900'}`}>
          <span className="font-semibold">{r.level === 'green' ? '✓' : r.level === 'yellow' ? '~' : '✗'} </span>
          {locale === 'de' ? r.de : r.en}
        </div>
      )}

      <p className="text-xs text-gray-400">
        {t('Quelle: Agencia Tributaria — Régimen especial de trabajadores desplazados (Art. 93 LIRPF)', 'Source: Agencia Tributaria — Special regime for displaced workers (Art. 93 LIRPF)')}
      </p>
    </div>
  );
}
