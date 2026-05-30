'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type Answer = 'yes' | 'no' | null;

type Result = {
  eligible: 'yes' | 'likely' | 'no';
  titleDE: string;
  titleEN: string;
  textDE: string;
  textEN: string;
};

function getResult(recruited: Answer, salary: Answer, expertise: Answer, distance: Answer): Result | null {
  if (!recruited || !salary || !expertise || !distance) return null;

  if (distance === 'no') {
    return {
      eligible: 'no',
      titleDE: 'Nicht förderfähig — Wohnsitz-Kriterium',
      titleEN: 'Not eligible — residence criterion',
      textDE: 'Die 30%-Regelung setzt voraus, dass du in den letzten 24 Monaten vor Beschäftigungsbeginn mindestens 16 Monate mehr als 150 km von der NL-Grenze entfernt gewohnt hast.',
      textEN: 'The 30% ruling requires that you lived more than 150 km from the Dutch border for at least 16 of the 24 months before starting employment.',
    };
  }
  if (recruited === 'no') {
    return {
      eligible: 'no',
      titleDE: 'Nicht förderfähig — Anwerbung aus dem Ausland',
      titleEN: 'Not eligible — recruited from abroad',
      textDE: 'Die 30%-Regelung gilt nur für Arbeitnehmer, die aus dem Ausland (nicht aus den Niederlanden) angeworben wurden oder dorthin versetzt wurden.',
      textEN: 'The 30% ruling only applies to employees recruited from abroad or transferred to the Netherlands, not local hires.',
    };
  }
  if (salary === 'no') {
    return {
      eligible: 'no',
      titleDE: 'Nicht förderfähig — Mindestgehalt',
      titleEN: 'Not eligible — minimum salary',
      textDE: 'Das Brutto-Jahresgehalt muss mindestens €46.107 (2024, für unter 30 Jahre: €35.048) betragen. Praktikanten und Geringverdiener sind ausgeschlossen.',
      textEN: 'Gross annual salary must be at least €46,107 (2024; for under-30s: €35,048). Interns and low-wage earners are excluded.',
    };
  }
  if (expertise === 'no') {
    return {
      eligible: 'likely',
      titleDE: 'Möglicherweise förderfähig — Qualifikation prüfen',
      titleEN: 'Possibly eligible — check qualifications',
      textDE: 'Spezifische Expertise (Hochschulabschluss + Erfahrung in deinem Fachgebiet) ist Voraussetzung. Ohne nachweisbare Qualifikation ist die Genehmigung unsicher. Lass die Situation durch einen Steuerberater prüfen.',
      textEN: 'Specific expertise (university degree + experience in your field) is required. Without demonstrable qualifications, approval is uncertain. Have the situation reviewed by a tax advisor.',
    };
  }
  return {
    eligible: 'yes',
    titleDE: 'Wahrscheinlich förderfähig',
    titleEN: 'Likely eligible',
    textDE: 'Du erfüllst die Hauptvoraussetzungen. Beantrage die 30%-Regelung über deinen Arbeitgeber innerhalb von 4 Monaten nach Beschäftigungsbeginn beim Belastingdienst. Die Regelung gilt für max. 5 Jahre. Effektiver Steuersatz sinkt von ~49% auf ~34% auf 30% des Gehalts.',
    textEN: 'You meet the main requirements. Apply for the 30% ruling through your employer within 4 months of starting employment at the Belastingdienst. The ruling applies for max. 5 years. Effective tax rate drops from ~49% to ~34% on 30% of your salary being tax-free.',
  };
}

// Ergebnis nur über Linksborder + Textfarbe (Spec §3.3), keine gesättigte Fläche.
const RESULT_BORDER: Record<Result['eligible'], string> = {
  yes: 'border-l-pos',
  likely: 'border-l-warn',
  no: 'border-l-neg',
};

export function ThirtyPercentRulingChecker({ locale = 'de' }: { locale?: string }) {
  const [recruited, setRecruited] = useState<Answer>(null);
  const [salary, setSalary] = useState<Answer>(null);
  const [expertise, setExpertise] = useState<Answer>(null);
  const [distance, setDistance] = useState<Answer>(null);

  const result = getResult(recruited, salary, expertise, distance);
  const de = locale === 'de';

  function RadioGroup({ label, value, onChange }: { label: string; value: Answer; onChange: (v: Answer) => void }) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-text">{label}</p>
        <div className="flex gap-3">
          {(['yes', 'no'] as const).map(opt => (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              aria-pressed={value === opt}
              className={cn(
                'focus-ring rounded-md border px-4 py-2 text-sm transition-colors duration-150 ease-out',
                value === opt
                  ? 'border-accent bg-accent text-accent-fg'
                  : 'border-line text-text-2 hover:border-line-strong hover:text-text',
              )}
            >
              {opt === 'yes' ? (de ? 'Ja' : 'Yes') : (de ? 'Nein' : 'No')}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <RadioGroup
        label={de
          ? '1. Wirst du aus dem Ausland für eine NL-Stelle angeworben (nicht lokale Einstellung)?'
          : '1. Are you recruited from abroad for a Dutch position (not a local hire)?'}
        value={recruited}
        onChange={setRecruited}
      />
      <RadioGroup
        label={de
          ? '2. Beträgt dein Brutto-Jahresgehalt mindestens €46.107 (unter 30 Jahre: €35.048)?'
          : '2. Is your gross annual salary at least €46,107 (under 30: €35,048)?'}
        value={salary}
        onChange={setSalary}
      />
      <RadioGroup
        label={de
          ? '3. Hast du eine spezifische Expertise (Uni-Abschluss + Berufserfahrung in deinem Fachgebiet)?'
          : '3. Do you have specific expertise (university degree + professional experience in your field)?'}
        value={expertise}
        onChange={setExpertise}
      />
      <RadioGroup
        label={de
          ? '4. Hast du in den letzten 24 Monaten mind. 16 Monate mehr als 150 km von der NL-Grenze entfernt gewohnt?'
          : '4. Have you lived more than 150 km from the Dutch border for at least 16 of the last 24 months?'}
        value={distance}
        onChange={setDistance}
      />

      {result && (
        <div className={cn('space-y-2 rounded-md border border-line border-l-2 bg-surface-sub p-4', RESULT_BORDER[result.eligible])}>
          <p className="text-body text-text">{de ? result.titleDE : result.titleEN}</p>
          <p className="text-sm leading-relaxed text-text-2">{de ? result.textDE : result.textEN}</p>
        </div>
      )}

      <p className="text-caption text-text-3">
        {de
          ? 'Kein Rechtsrat. Beantragung über Arbeitgeber beim Belastingdienst (belastingdienst.nl). Stand: 2024.'
          : 'Not legal advice. Apply through employer at Belastingdienst (belastingdienst.nl). As of 2024.'}
      </p>
    </div>
  );
}
