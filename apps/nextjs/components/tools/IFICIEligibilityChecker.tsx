'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusDot } from '@/components/ui/StatusDot';

type Props = { locale?: string };

type IncomeType = 'employed_pt' | 'employed_foreign' | 'freelancer_pt' | 'freelancer_foreign' | 'pension' | 'investment';

const DISCLAIMER_DE = 'Diese Einschätzung ist nicht verbindlich und ersetzt keine Steuerberatung. Für einen IFICI-Antrag ist die Unterstützung eines zugelassenen portugiesischen Steuerberaters unbedingt erforderlich.';
const DISCLAIMER_EN = 'This assessment is not binding and does not replace tax advice. The support of a licensed Portuguese tax advisor is essential for an IFICI application.';

const LEVEL_TONE = { green: 'pos', yellow: 'warn', red: 'neg' } as const;
const LEVEL_BORDER = { green: 'border-l-pos', yellow: 'border-l-warn', red: 'border-l-neg' } as const;

const choiceCls = (active: boolean) =>
  cn('focus-ring rounded-md border px-4 py-2 text-sm transition-colors duration-150 ease-out', active ? 'border-accent bg-accent text-accent-fg' : 'border-line text-text-2 hover:border-line-strong hover:text-text');
const optionCls = (active: boolean) =>
  cn('focus-ring rounded-md border px-3 py-2 text-left text-sm transition-colors duration-150 ease-out', active ? 'border-accent bg-accent text-accent-fg' : 'border-line text-text-2 hover:border-line-strong hover:text-text');

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
    <div className="space-y-5 rounded-lg border border-line bg-surface p-5">
      <h3 className="text-h3 text-text">{t('IFICI-Eligibility-Checker', 'IFICI Eligibility Checker')}</h3>

      <div className="flex items-start gap-2 rounded-md border-l-2 border-warn bg-surface-sub p-3 text-caption text-text-2">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warn" aria-hidden />
        <span>{locale === 'de' ? DISCLAIMER_DE : DISCLAIMER_EN}</span>
      </div>

      <div className="space-y-4 text-sm">
        {/* Q1: Prior residency */}
        <div>
          <p className="mb-2 text-sm text-text">
            {t('Warst du in den letzten 5 Jahren steuerlich in Portugal ansässig?', 'Were you tax-resident in Portugal in the last 5 years?')}
          </p>
          <div className="flex gap-3">
            {([true, false] as const).map(v => (
              <button key={String(v)} onClick={() => setPriorResidency(v)} className={choiceCls(priorResidency === v)}>
                {v ? t('Ja', 'Yes') : t('Nein', 'No')}
              </button>
            ))}
          </div>
        </div>

        {/* Q2: Income type */}
        {priorResidency === false && (
          <div>
            <p className="mb-2 text-sm text-text">{t('Deine primäre Einkommensquelle?', 'Your primary income source?')}</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {incomeOptions.map(opt => (
                <button key={opt.value} onClick={() => setIncomeType(opt.value)} className={optionCls(incomeType === opt.value)}>
                  {locale === 'de' ? opt.de : opt.en}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Q3: High value activity */}
        {priorResidency === false && incomeType && !['pension', 'investment'].includes(incomeType) && (
          <div>
            <p className="mb-2 text-sm text-text">
              {t('Arbeitest du in Tech, Wissenschaft, Forschung oder kreativer Wirtschaft?', 'Do you work in tech, science, research or creative industries?')}
            </p>
            <div className="flex gap-3">
              {([true, false] as const).map(v => (
                <button key={String(v)} onClick={() => setHighValueActivity(v)} className={choiceCls(highValueActivity === v)}>
                  {v ? t('Ja', 'Yes') : t('Nein', 'No')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Result */}
      {r && (
        <div className={cn('flex items-start gap-2 rounded-md border border-line border-l-2 bg-surface-sub p-4 text-sm text-text', LEVEL_BORDER[r.level])}>
          <StatusDot tone={LEVEL_TONE[r.level]} className="mt-1" />
          <span>{locale === 'de' ? r.de : r.en}</span>
        </div>
      )}

      <p className="text-caption text-text-3">
        {t('Quellen: AT (at.gov.pt/en/at/tax-information/personal-income-tax/ifici)', 'Source: AT (at.gov.pt/en/at/tax-information/personal-income-tax/ifici)')}
      </p>
    </div>
  );
}
