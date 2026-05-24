'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { CityGuideData, GuideStep } from '@/lib/city-guide';

const RISK_STYLES = {
  high:   { badge: 'bg-error text-on-error',   border: 'border-l-4 border-error/70 bg-error/5',    label: { de: '⚠ Hohes Risiko',    en: '⚠ High Risk' } },
  medium: { badge: 'bg-warning text-on-surface', border: 'border-l-4 border-warning/70 bg-warning/5', label: { de: '◈ Mittleres Risiko', en: '◈ Medium Risk' } },
  low:    { badge: null,                          border: '',                                           label: { de: '',                   en: '' } },
};

const INFOBOX_STYLES: Record<string, string> = {
  danger:  'bg-error-container/40 border-error/40 text-error',
  warning: 'bg-warning-container/40 border-warning/40 text-on-surface',
  info:    'bg-primary/8 border-primary/20 text-on-surface',
};

function StepCard({ step, locale }: { step: GuideStep; locale: string }) {
  const [open, setOpen] = useState(false);
  const isDE = locale === 'de';
  const title    = isDE ? step.titleDE    : (step.titleEN    || step.titleDE);
  const subtitle = isDE ? step.subtitleDE : (step.subtitleEN || step.subtitleDE);
  const timing   = isDE ? step.timingDE   : (step.timingEN   || step.timingDE);
  const infoBox  = isDE ? step.infoBoxDE  : (step.infoBoxEN  || step.infoBoxDE);
  const risk     = RISK_STYLES[step.riskLevel as keyof typeof RISK_STYLES] ?? RISK_STYLES.low;

  const hasDetails = infoBox || step.documents.length > 0 || step.sourceUrl || step.lastVerified;

  return (
    <div className={cn('rounded-xl border border-outline-variant/40 overflow-hidden bg-surface transition-all', risk.border)}>
      <button
        onClick={() => hasDetails && setOpen((o) => !o)}
        className={cn('w-full text-left px-4 py-3.5 flex items-start gap-3', hasDetails && 'hover:bg-surface-container/50 transition-colors')}
      >
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <p className="text-body-md font-semibold text-on-surface leading-snug">{title}</p>
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {risk.badge && (
                <span className={cn('text-label-sm font-bold px-2 py-0.5 rounded-full', risk.badge)}>
                  {isDE ? risk.label.de : risk.label.en}
                </span>
              )}
              {step.requiresLegalAdvice && (
                <span className="text-label-sm bg-error-container/60 text-error px-2 py-0.5 rounded-full font-semibold">
                  {isDE ? 'Rechtsberatung' : 'Legal Advice'}
                </span>
              )}
            </div>
          </div>
          {subtitle && <p className="text-label-sm text-on-surface-variant">{subtitle}</p>}
          <p className="text-label-sm text-on-surface-variant">{timing}</p>
        </div>
        {hasDetails && (
          <span className="text-on-surface-variant text-sm mt-0.5 shrink-0">{open ? '▲' : '▼'}</span>
        )}
      </button>

      {open && hasDetails && (
        <div className="px-4 pb-4 space-y-3 border-t border-outline-variant/20 pt-3">
          {infoBox && step.infoBoxType && (
            <div className={cn('border rounded-xl px-4 py-3 text-body-sm leading-relaxed', INFOBOX_STYLES[step.infoBoxType] ?? INFOBOX_STYLES.info)}>
              {infoBox}
            </div>
          )}
          {step.documents.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {step.documents.map((doc, i) => {
                const label = isDE ? doc.titleDE : (doc.titleEN || doc.titleDE);
                return label ? (
                  <span key={i} className="text-label-sm border border-outline-variant/60 rounded-full px-2.5 py-0.5 text-on-surface-variant flex items-center gap-1">
                    <span>📄</span>{label}
                  </span>
                ) : null;
              })}
            </div>
          )}
          <div className="flex items-center justify-between flex-wrap gap-2">
            {step.sourceUrl && step.sourceLabel && (
              <a
                href={step.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-label-sm text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
              >
                🔗 {step.sourceLabel}
              </a>
            )}
            {step.lastVerified && (
              <span className="text-label-sm text-on-surface-variant ml-auto">
                {isDE ? 'Geprüft' : 'Verified'}: {new Date(step.lastVerified).toLocaleDateString(isDE ? 'de-DE' : 'en-GB', { month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type Persona = 'all' | 'employed' | 'freelancer' | 'founder' | 'family';

function filterByPersona(steps: GuideStep[], persona: Persona): GuideStep[] {
  if (persona === 'all') return steps;
  const key = { employed: 'forEmployed', freelancer: 'forFreelancer', founder: 'forFounder', family: 'forFamily' }[persona] as keyof GuideStep;
  return steps.filter((s) => s[key] === true);
}

export default function CityGuideContent({ data, locale }: { data: CityGuideData; locale: string }) {
  const isDE = locale === 'de';
  const [openSections, setOpenSections] = useState<Set<string>>(new Set([data.sections[0]?.key ?? '']));
  const [persona, setPersona] = useState<Persona>('all');

  function toggleSection(key: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const personas: { key: Persona; labelDE: string; labelEN: string }[] = [
    { key: 'all',        labelDE: 'Alle',          labelEN: 'All' },
    { key: 'employed',   labelDE: 'Angestellt',     labelEN: 'Employed' },
    { key: 'freelancer', labelDE: 'Freelancer',     labelEN: 'Freelancer' },
    { key: 'founder',    labelDE: 'Gründer',        labelEN: 'Founder' },
    { key: 'family',     labelDE: 'Mit Familie',    labelEN: 'With Family' },
  ];

  return (
    <div className="space-y-6">
      {/* Persona filter */}
      <div className="flex flex-wrap gap-2">
        {personas.map((p) => (
          <button
            key={p.key}
            onClick={() => setPersona(p.key)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-label-sm font-semibold uppercase tracking-wider transition-colors',
              persona === p.key
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high',
            )}
          >
            {isDE ? p.labelDE : p.labelEN}
          </button>
        ))}
      </div>

      {/* Sections */}
      {data.sections.map((section) => {
        const filteredSteps = filterByPersona(section.steps, persona);
        if (filteredSteps.length === 0) return null;
        const isOpen = openSections.has(section.key);
        const highCount = filteredSteps.filter((s) => s.riskLevel === 'high').length;

        return (
          <div key={section.key} className="rounded-2xl border border-outline-variant/40 overflow-hidden">
            <button
              onClick={() => toggleSection(section.key)}
              className="w-full flex items-center gap-3 px-5 py-4 bg-surface-container/50 hover:bg-surface-container transition-colors text-left"
            >
              <span className="flex-1 text-label-lg font-bold text-on-surface uppercase tracking-wider">
                {isDE ? section.labelDE : section.labelEN}
              </span>
              <span className="text-label-sm text-on-surface-variant font-mono">
                {filteredSteps.length} {isDE ? 'Schritte' : 'steps'}
              </span>
              {highCount > 0 && (
                <span className="text-label-sm bg-error/15 text-error px-2 py-0.5 rounded-full font-semibold">
                  {highCount} ⚠
                </span>
              )}
              <span className="text-on-surface-variant text-sm">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
              <div className="px-4 py-4 space-y-2.5 bg-surface">
                {filteredSteps.map((step) => (
                  <StepCard key={step.id} step={step} locale={locale} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Disclaimer */}
      <p className="text-label-sm text-on-surface-variant border border-outline-variant/30 rounded-xl px-4 py-3 leading-relaxed">
        {isDE
          ? 'paymap ersetzt keine individuelle steuerliche oder rechtliche Beratung. Inhalte mit ⚠ markiert sind besonders prüfungsbedürftig. Alle Angaben ohne Gewähr — Stand der letzten Prüfung jeweils angegeben.'
          : 'paymap does not replace individual tax or legal advice. Content marked ⚠ requires particular verification. All information without warranty — date of last review indicated per step.'}
      </p>
    </div>
  );
}
