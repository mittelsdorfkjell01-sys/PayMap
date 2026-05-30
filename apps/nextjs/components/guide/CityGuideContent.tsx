'use client';
import { useState } from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusDot, riskTone } from '@/components/ui/StatusDot';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import type { CityGuideData, GuideStep } from '@/lib/city-guide';

// Risiko nur als Punkt + Label + 2px-Linksborder (Spec §3.3), keine Flächen.
const RISK_META = {
  high:   { border: 'border-l-2 border-neg',  label: { de: 'Hohes Risiko',    en: 'High Risk' } },
  medium: { border: 'border-l-2 border-warn', label: { de: 'Mittleres Risiko', en: 'Medium Risk' } },
  low:    { border: '',                        label: { de: '',                 en: '' } },
} as const;

function StepCard({ step, locale }: { step: GuideStep; locale: string }) {
  const [open, setOpen] = useState(false);
  const isDE = locale === 'de';
  const title    = isDE ? step.titleDE    : (step.titleEN    || step.titleDE);
  const subtitle = isDE ? step.subtitleDE : (step.subtitleEN || step.subtitleDE);
  const timing   = isDE ? step.timingDE   : (step.timingEN   || step.timingDE);
  const infoBox  = isDE ? step.infoBoxDE  : (step.infoBoxEN  || step.infoBoxDE);
  const riskKey  = (step.riskLevel as keyof typeof RISK_META) in RISK_META ? (step.riskLevel as keyof typeof RISK_META) : 'low';
  const risk     = RISK_META[riskKey];

  const hasDetails = infoBox || step.documents.length > 0 || step.sourceUrl || step.lastVerified;

  return (
    <div className={cn('overflow-hidden rounded-md border border-line bg-surface', risk.border)}>
      <button
        onClick={() => hasDetails && setOpen((o) => !o)}
        className={cn('flex w-full items-start gap-3 px-4 py-3.5 text-left', hasDetails && 'transition-colors hover:bg-surface-sub')}
      >
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="text-body leading-snug text-text">{title}</p>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              {riskKey !== 'low' && (
                <StatusDot tone={riskTone(riskKey)} label={isDE ? risk.label.de : risk.label.en} />
              )}
              {step.requiresLegalAdvice && (
                <span className="text-caption text-neg">{isDE ? 'Rechtsberatung' : 'Legal Advice'}</span>
              )}
            </div>
          </div>
          {subtitle && <p className="text-caption text-text-2">{subtitle}</p>}
          <p className="text-caption text-text-3">{timing}</p>
        </div>
        {hasDetails && (
          <span className="mt-0.5 shrink-0 text-sm text-text-3">{open ? '▲' : '▼'}</span>
        )}
      </button>

      {open && hasDetails && (
        <div className="space-y-3 border-t border-line px-4 pb-4 pt-3">
          {infoBox && step.infoBoxType && (
            <div className={cn(
              'rounded-md border border-line bg-surface-sub px-4 py-3 text-sm leading-relaxed',
              step.infoBoxType === 'danger' ? 'text-neg' : 'text-text-2',
            )}>
              {infoBox}
            </div>
          )}
          {step.documents.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {step.documents.map((doc, i) => {
                const label = isDE ? doc.titleDE : (doc.titleEN || doc.titleDE);
                return label ? (
                  <span key={i} className="flex items-center gap-1.5 rounded-sm border border-line px-2.5 py-0.5 text-caption text-text-2">
                    <FileText className="h-3 w-3" aria-hidden />{label}
                  </span>
                ) : null;
              })}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {step.sourceUrl && step.sourceLabel && (
              <a
                href={step.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring flex items-center gap-1.5 rounded-sm text-caption text-focus underline-offset-2 hover:underline"
              >
                <ExternalLink className="h-3 w-3" aria-hidden /> {step.sourceLabel}
              </a>
            )}
            {step.lastVerified && (
              <span className="ml-auto text-caption text-text-3">
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
      <SegmentedControl
        aria-label={isDE ? 'Persona-Filter' : 'Persona filter'}
        className="flex-wrap"
        value={persona}
        onChange={setPersona}
        options={personas.map((p) => ({ value: p.key, label: isDE ? p.labelDE : p.labelEN }))}
      />

      {/* Sections */}
      {data.sections.map((section) => {
        const filteredSteps = filterByPersona(section.steps, persona);
        if (filteredSteps.length === 0) return null;
        const isOpen = openSections.has(section.key);
        const highCount = filteredSteps.filter((s) => s.riskLevel === 'high').length;

        return (
          <div key={section.key} className="overflow-hidden rounded-lg border border-line">
            <button
              onClick={() => toggleSection(section.key)}
              className="focus-ring flex w-full items-center gap-3 bg-surface-sub px-5 py-4 text-left transition-colors hover:bg-surface-sub"
            >
              <span className="flex-1 text-h3 text-text">
                {isDE ? section.labelDE : section.labelEN}
              </span>
              <span className="text-caption tabular text-text-3">
                {filteredSteps.length} {isDE ? 'Schritte' : 'steps'}
              </span>
              {highCount > 0 && (
                <StatusDot tone="neg" label={String(highCount)} />
              )}
              <span className="text-sm text-text-3">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
              <div className="space-y-2.5 bg-surface px-4 py-4">
                {filteredSteps.map((step) => (
                  <StepCard key={step.id} step={step} locale={locale} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Disclaimer */}
      <p className="rounded-md border border-line px-4 py-3 text-caption leading-relaxed text-text-3">
        {isDE
          ? 'paymap ersetzt keine individuelle steuerliche oder rechtliche Beratung. Schritte mit erhöhtem Risiko sind entsprechend markiert. Alle Angaben ohne Gewähr — Stand der letzten Prüfung jeweils angegeben.'
          : 'paymap does not replace individual tax or legal advice. Steps with elevated risk are marked accordingly. All information without warranty — date of last review indicated per step.'}
      </p>
    </div>
  );
}
