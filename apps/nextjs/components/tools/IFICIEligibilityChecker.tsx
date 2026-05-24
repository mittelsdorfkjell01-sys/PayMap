'use client';

import { useState } from 'react';

type Props = { locale?: string };

type IncomeType = 'employed_pt' | 'employed_foreign' | 'freelancer_pt' | 'freelancer_foreign' | 'pension' | 'investment';

const DISCLAIMER_DE = 'Diese Einschätzung ist nicht verbindlich und ersetzt keine Steuerberatung. Für einen IFICI-Antrag ist die Unterstützung eines zugelassenen portugiesischen Steuerberaters unbedingt erforderlich.';
const DISCLAIMER_EN = 'This assessment is not binding and does not replace tax advice. The support of a licensed Portuguese tax advisor is essential for an IFICI application.';

export function IFICIEligibilityChecker({ locale = 'de' }: Props) {
  const [priorResidency, setPriorResidency] = useState<boolean | null>(null);
  const [incomeType, setIncomeType] = useState<IncomeType | null>(null);
  const [highValueActivity, setHighValueActivity] = useState<boolean | null>(null);

  const t = (de: string, en: string) => locale === 'de' ? de : en;

  const result = (): { level: 'green' | 'yellow' | 'red'; de: string; en: string } | null => {
    if (priorResidency === true) return {
      level: 'red',
      de: 'Nicht qualifiziert: IFICI erfordert, dass du in den letzten 5 Jahren nicht steuerlich in Portugal ansässig warst.',
      en: 'Not qualified: IFICI requires that you were not tax-resident in Portugal in the last 5 years.',
    };
    if (priorResidency === false && incomeType === 'employed_foreign' && highValueActivity === true) return {
      level: 'green',
      de: 'Hohe Wahrscheinlichkeit: Remote-Angestellte ausländischer Unternehmen in qualifizierenden Bereichen erfüllen typischerweise die IFICI-Kriterien. Steuerberater kontaktieren zur finalen Bestätigung.',
      en: 'High probability: Remote employees of foreign companies in qualifying areas typically meet IFICI criteria. Contact a tax advisor for final confirmation.',
    };
    if (priorResidency === false && incomeType === 'freelancer_foreign' && highValueActivity === true) return {
      level: 'green',
      de: 'Hohe Wahrscheinlichkeit: Selbstständige mit ausländischen Kunden in qualifizierenden Bereichen können IFICI beantragen. Die genaue Einordnung hängt vom Tätigkeitsprofil ab — Steuerberater notwendig.',
      en: 'High probability: Self-employed with foreign clients in qualifying areas can apply for IFICI. The exact classification depends on the activity profile — tax advisor necessary.',
    };
    if (incomeType === 'pension') return {
      level: 'yellow',
      de: 'Teilweise möglich: Renten werden unter IFICI unterschiedlich behandelt. Ausländische Renten können begünstigt sein, deutsche Renten unterliegen dem DBA. Individuelle Prüfung unbedingt erforderlich.',
      en: 'Partially possible: Pensions are treated differently under IFICI. Foreign pensions may qualify, German pensions are subject to the DBA. Individual review absolutely necessary.',
    };
    if (incomeType === 'investment') return {
      level: 'yellow',
      de: 'Möglicherweise möglich: Kapitalerträge können unter IFICI begünstigt sein, aber die Regeln sind komplex und abhängig von der Kapitalquelle. Steuerberater notwendig.',
      en: 'Possibly possible: Capital gains may qualify under IFICI, but the rules are complex and depend on the source of capital. Tax advisor necessary.',
    };
    if (priorResidency === false && highValueActivity === false) return {
      level: 'red',
      de: 'Unwahrscheinlich: IFICI richtet sich primär an Hochwerttätigkeiten. Ohne qualifizierende Tätigkeit ist eine Genehmigung in der Regel nicht möglich.',
      en: 'Unlikely: IFICI primarily targets high-value activities. Without a qualifying activity, approval is generally not possible.',
    };
    if (priorResidency === false && incomeType === 'employed_pt') return {
      level: 'yellow',
      de: 'Möglicherweise: Angestellte portugiesischer Unternehmen können IFICI beantragen, wenn das Unternehmen als qualifying anerkannt ist. Prüfung durch Steuerberater notwendig.',
      en: 'Possibly: Employees of Portuguese companies can apply for IFICI if the company is recognised as qualifying. Review by tax advisor necessary.',
    };
    return null;
  };

  const r = result();

  const incomeOptions: { value: IncomeType; de: string; en: string }[] = [
    { value: 'employed_foreign', de: 'Remote-Angestellt (ausländisches Unternehmen)', en: 'Remote-employed (foreign company)' },
    { value: 'employed_pt', de: 'Angestellt (portugiesisches Unternehmen)', en: 'Employed (Portuguese company)' },
    { value: 'freelancer_foreign', de: 'Selbstständig (ausländische Kunden)', en: 'Self-employed (foreign clients)' },
    { value: 'freelancer_pt', de: 'Selbstständig (PT-Kunden)', en: 'Self-employed (PT clients)' },
    { value: 'pension', de: 'Rente / Pension', en: 'Pension / retirement income' },
    { value: 'investment', de: 'Kapitalerträge', en: 'Capital gains / investments' },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-5">
      <h3 className="font-semibold text-gray-900">{t('IFICI-Eligibility-Checker', 'IFICI Eligibility Checker')}</h3>

      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
        ⚠ {locale === 'de' ? DISCLAIMER_DE : DISCLAIMER_EN}
      </div>

      <div className="space-y-4 text-sm">
        {/* Q1: Prior residency */}
        <div>
          <p className="font-medium text-gray-800 mb-2">
            {t('Warst du in den letzten 5 Jahren steuerlich in Portugal ansässig?', 'Were you tax-resident in Portugal in the last 5 years?')}
          </p>
          <div className="flex gap-3">
            {([true, false] as const).map(v => (
              <button key={String(v)} onClick={() => setPriorResidency(v)}
                className={`px-4 py-2 rounded-lg border font-medium transition-colors ${priorResidency === v ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:border-blue-400'}`}>
                {v ? t('Ja', 'Yes') : t('Nein', 'No')}
              </button>
            ))}
          </div>
        </div>

        {/* Q2: Income type */}
        {priorResidency === false && (
          <div>
            <p className="font-medium text-gray-800 mb-2">{t('Deine primäre Einkommensquelle?', 'Your primary income source?')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {incomeOptions.map(opt => (
                <button key={opt.value} onClick={() => setIncomeType(opt.value)}
                  className={`px-3 py-2 rounded-lg border text-left text-sm transition-colors ${incomeType === opt.value ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:border-blue-400'}`}>
                  {locale === 'de' ? opt.de : opt.en}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Q3: High value activity */}
        {priorResidency === false && incomeType && !['pension', 'investment'].includes(incomeType) && (
          <div>
            <p className="font-medium text-gray-800 mb-2">
              {t('Arbeitest du in Tech, Wissenschaft, Forschung oder kreativer Wirtschaft?', 'Do you work in tech, science, research or creative industries?')}
            </p>
            <div className="flex gap-3">
              {([true, false] as const).map(v => (
                <button key={String(v)} onClick={() => setHighValueActivity(v)}
                  className={`px-4 py-2 rounded-lg border font-medium transition-colors ${highValueActivity === v ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:border-blue-400'}`}>
                  {v ? t('Ja', 'Yes') : t('Nein', 'No')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Result */}
      {r && (
        <div className={`rounded-lg p-4 text-sm ${r.level === 'green' ? 'bg-green-50 border border-green-200 text-green-900' : r.level === 'yellow' ? 'bg-amber-50 border border-amber-200 text-amber-900' : 'bg-red-50 border border-red-200 text-red-900'}`}>
          <span className="font-semibold">{r.level === 'green' ? '✓' : r.level === 'yellow' ? '~' : '✗'} </span>
          {locale === 'de' ? r.de : r.en}
        </div>
      )}

      <p className="text-xs text-gray-400">
        {t('Quellen: AT (at.gov.pt/en/at/tax-information/personal-income-tax/ifici)', 'Source: AT (at.gov.pt/en/at/tax-information/personal-income-tax/ifici)')}
      </p>
    </div>
  );
}
