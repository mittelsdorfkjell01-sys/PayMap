'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { AlertTriangle, Check, FileText, ExternalLink, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { StatusDot, riskTone } from '@/components/ui/StatusDot';
import CityGuideContent from '@/components/guide/CityGuideContent';
import type { CityGuideData } from '@/lib/city-guide';
import { toEnSlug } from '@/lib/city-guide-slugs';
import { HighRiskWarningDialog } from '@/components/profile/HighRiskWarningDialog';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GuideStep {
  id: string;
  stepOrder: number;
  phase: string;
  titleDE: string;
  titleEN: string;
  subtitleDE: string | null;
  subtitleEN: string | null;
  timingDE: string;
  timingEN: string;
  isWarning: boolean;
  documents: Record<string, string>[];
  infoBoxDE: string | null;
  infoBoxEN: string | null;
  infoBoxType: string | null;
  tags: string[];
  riskLevel: string;
  requiresLegalAdvice: boolean;
  forEmployed: boolean;
  forFreelancer: boolean;
  forFounder: boolean;
}

interface BudgetItem {
  label: string;
  amount: number;
  isCustom: boolean;
  isEditable: boolean;
}

interface PlanDocument {
  name: string;
  status: string;
  uploadUrl?: string;
  note?: string;
}

interface MovingPlan {
  id: string;
  fromCityId: string;
  toCityId: string;
  fromCity: { id: string; slug: string; nameDE: string | null; nameEN: string | null; flag: string };
  toCity: { id: string; slug: string; nameDE: string | null; nameEN: string | null; flag: string };
  employment: string;
  situation: string;
  assets: string[];
  nationality: string;
  targetDate: string;
  completedStepIds: string[];
  skippedStepIds: string[];
  budgetItems: BudgetItem[];
  documents: PlanDocument[];
}

interface PlanData {
  plan: MovingPlan;
  steps: GuideStep[];
}

// Phasen unterscheiden sich über Label + Hairline; kritische Phase mit neg-Linksborder.
const PHASES = [
  { key: 'critical' },
  { key: 'before_move' },
  { key: '3_months' },
  { key: 'arrival' },
  { key: 'first_month' },
  { key: 'first_3_months' },
] as const;

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

// Selektions-Button (Wizard / City-Picker): aktiv = accent-Border + surface-sub.
const selectableCls = (active: boolean) =>
  cn(
    'focus-ring rounded-md border px-4 py-3 text-body transition-colors duration-150 ease-out',
    active ? 'border-accent bg-surface-sub text-text' : 'border-line text-text-2 hover:border-line-strong hover:text-text',
  );

// ─── WarnBox ──────────────────────────────────────────────────────────────────

function WarnBox({ type, text }: { type: string; text: string }) {
  const tone =
    type === 'danger' ? 'border-l-2 border-neg text-neg' :
    type === 'warning' ? 'border-l-2 border-warn text-text-2' :
    'border-l-2 border-line text-text-2';
  return (
    <div className={cn('rounded-md bg-surface-sub px-4 py-3 text-sm leading-relaxed', tone)}>
      {text}
    </div>
  );
}

// ─── StepItem ─────────────────────────────────────────────────────────────────

function StepItem({
  step, locale, completed, onToggle,
}: {
  step: GuideStep;
  locale: string;
  completed: boolean;
  onToggle: (id: string) => void;
}) {
  const t = useTranslations('guide');
  const isDE = locale === 'de';
  const title = isDE ? step.titleDE : step.titleEN;
  const subtitle = isDE ? step.subtitleDE : step.subtitleEN;
  const timing = isDE ? step.timingDE : step.timingEN;
  const infoBox = isDE ? step.infoBoxDE : step.infoBoxEN;
  const isHighRisk = step.riskLevel === 'high';
  const isMediumRisk = step.riskLevel === 'medium';

  const tagLabels: Record<string, string> = {
    doc_needed: isDE ? 'Dokument nötig' : 'Document needed',
    critical: isDE ? 'Kritisch' : 'Critical',
    timing_critical: isDE ? 'Timing kritisch' : 'Timing critical',
    external_expert: isDE ? 'Externer Experte' : 'External expert',
  };

  return (
    <div className={cn(
      'overflow-hidden rounded-md border border-line',
      completed ? 'opacity-60' :
        isHighRisk ? 'border-l-2 border-l-neg' :
        isMediumRisk ? 'border-l-2 border-l-warn' :
        step.isWarning ? 'border-l-2 border-l-neg' : '',
    )}>
      <div className="flex items-start gap-3 px-4 py-3.5">
        <button
          onClick={() => onToggle(step.id)}
          aria-pressed={completed}
          className={cn(
            'focus-ring mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
            completed
              ? 'border-accent bg-accent text-accent-fg'
              : 'border-line-strong hover:border-text',
          )}
        >
          {completed && <Check className="h-3 w-3" aria-hidden />}
        </button>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className={cn('text-body text-text', completed && 'text-text-2 line-through')}>
                {title}
              </p>
              {subtitle && <p className="text-caption text-text-2">{subtitle}</p>}
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              {isHighRisk && (
                <StatusDot tone={riskTone('high')} label={isDE ? 'Hohes Risiko' : 'High Risk'} />
              )}
              {isMediumRisk && (
                <StatusDot tone={riskTone('medium')} label={isDE ? 'Mittleres Risiko' : 'Medium Risk'} />
              )}
              {step.requiresLegalAdvice && (
                <span className="text-caption text-neg">
                  {isDE ? 'Rechtsberatung' : 'Legal Advice'}
                </span>
              )}
              <span className="text-caption leading-tight text-text-3">{timing}</span>
            </div>
          </div>
          {step.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {(step.tags as string[]).map((tag) => (
                <span key={tag} className="rounded-sm bg-surface-sub px-2 py-0.5 text-caption text-text-2">
                  {tagLabels[tag] ?? tag}
                </span>
              ))}
            </div>
          )}
          {infoBox && step.infoBoxType && (
            <WarnBox type={step.infoBoxType} text={infoBox} />
          )}
          {step.documents.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {step.documents.map((doc, i) => {
                const docTitle = isDE ? doc.titleDE : doc.titleEN;
                return docTitle ? (
                  <span key={i} className="flex items-center gap-1.5 rounded-sm border border-line px-2.5 py-0.5 text-caption text-text-2">
                    <FileText className="h-3 w-3" aria-hidden />{docTitle}
                  </span>
                ) : null;
              })}
            </div>
          )}
          {step.requiresLegalAdvice && !completed && (
            <a
              href="https://www.steuerberaterverband.de/steuerberater-suchen"
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1 text-caption text-neg transition-colors hover:border-line-strong"
            >
              <Search className="h-3 w-3" aria-hidden /> {t('riskWarning.legalAdviceBtn')}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Plan View ────────────────────────────────────────────────────────────────

type SubTab = 'plan' | 'budget' | 'documents';
type FilterKey = 'all' | 'open' | 'urgent' | 'done';

function PlanView({ data, onUpdate }: { data: PlanData; onUpdate: (planId: string, patch: Record<string, unknown>) => void }) {
  const t = useTranslations('guide');
  const locale = useLocale();
  const [subTab, setSubTab] = useState<SubTab>('plan');
  const [filterKey, setFilterKey] = useState<FilterKey>('all');
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(['critical', 'before_move']));
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(data.plan.budgetItems ?? []);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetIdx = useRef<number>(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { plan, steps } = data;
  const completedIds = new Set<string>(plan.completedStepIds as string[]);
  const days = daysUntil(plan.targetDate);
  const totalSteps = steps.length;
  const doneSteps = steps.filter((s) => completedIds.has(s.id)).length;
  const progress = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;
  const hasGmbhOrDepot = (plan.assets as string[]).some((a) => ['gmbh', 'depot'].includes(a));

  function togglePhase(phase: string) {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      next.has(phase) ? next.delete(phase) : next.add(phase);
      return next;
    });
  }

  function toggleStep(stepId: string) {
    const next = new Set(completedIds);
    next.has(stepId) ? next.delete(stepId) : next.add(stepId);
    const ids = Array.from(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onUpdate(plan.id, { completedStepIds: ids });
    }, 500);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const idx = uploadTargetIdx.current;
    if (!file || idx < 0) return;
    e.target.value = '';

    setUploadError(null);
    setUploadingIdx(idx);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setUploadError(body.error ?? 'Upload fehlgeschlagen');
        return;
      }
      const { url } = await res.json();
      const updated = (plan.documents as PlanDocument[]).map((d, i) =>
        i === idx ? { ...d, status: 'uploaded', uploadUrl: url } : d,
      );
      onUpdate(plan.id, { documents: updated });
    } catch {
      setUploadError('Netzwerkfehler beim Upload');
    } finally {
      setUploadingIdx(null);
      uploadTargetIdx.current = -1;
    }
  }

  function triggerUpload(idx: number) {
    uploadTargetIdx.current = idx;
    fileInputRef.current?.click();
  }

  function updateBudget(idx: number, amount: number) {
    const updated = budgetItems.map((item, i) => i === idx ? { ...item, amount } : item);
    setBudgetItems(updated);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onUpdate(plan.id, { budgetItems: updated });
    }, 500);
  }

  const subTabs: { key: SubTab; label: string }[] = [
    { key: 'plan', label: t('tabs.plan') },
    { key: 'budget', label: t('tabs.budget') },
    { key: 'documents', label: t('tabs.documents') },
  ];

  const filterSteps = (steps: GuideStep[]) => {
    if (filterKey === 'all') return steps;
    if (filterKey === 'done') return steps.filter((s) => completedIds.has(s.id));
    if (filterKey === 'open') return steps.filter((s) => !completedIds.has(s.id));
    if (filterKey === 'urgent') return steps.filter((s) => s.isWarning && !completedIds.has(s.id));
    return steps;
  };

  const totalBudget = budgetItems.reduce((sum, b) => sum + b.amount, 0);
  const documents = plan.documents as PlanDocument[];

  const docStatusColors: Record<string, string> = {
    available: 'text-pos',
    uploaded: 'text-pos',
    pending: 'text-text-2',
    notYetDue: 'text-text-3',
  };

  return (
    <div className="space-y-6">
      {/* Plan header */}
      <div className="space-y-4 rounded-lg border border-line bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-h2 text-text">
              {plan.fromCity.flag} {plan.fromCity.nameDE} → {plan.toCity.flag} {plan.toCity.nameDE}
            </h2>
            <p className="mt-1 text-caption uppercase tracking-[0.04em] text-text-3">
              {t('countdown').replace('{days}', String(Math.max(0, days)))}
            </p>
          </div>
          <div className="text-right">
            <p className="text-data-xl tabular text-text">{progress}%</p>
            <p className="text-caption text-text-3">{t('progress').replace('{done}', String(doneSteps)).replace('{total}', String(totalSteps))}</p>
          </div>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-line">
          <div className="h-1 rounded-full bg-text transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="text-pos">{doneSteps} {t('stats.done')}</span>
          <span className="text-text-2">{totalSteps - doneSteps} {t('stats.open')}</span>
          {steps.filter((s) => s.isWarning && !completedIds.has(s.id)).length > 0 && (
            <span className="text-neg">{steps.filter((s) => s.isWarning && !completedIds.has(s.id)).length} {t('stats.urgent')}</span>
          )}
        </div>
      </div>

      {/* Sub-tabs */}
      <SegmentedControl
        aria-label={t('tabs.plan')}
        value={subTab}
        onChange={setSubTab}
        options={subTabs.map((tab) => ({ value: tab.key, label: tab.label }))}
      />

      {/* Mein Plan */}
      {subTab === 'plan' && (
        <div className="space-y-4">
          {/* Filter pills */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'open', 'urgent', 'done'] as FilterKey[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilterKey(f)}
                aria-pressed={filterKey === f}
                className={cn(
                  'focus-ring rounded-md border px-3 py-1.5 text-sm transition-colors duration-150 ease-out',
                  filterKey === f ? 'border-accent bg-accent text-accent-fg' : 'border-line text-text-2 hover:border-line-strong hover:text-text',
                )}
              >
                {t(`filter.${f}` as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>

          {/* Phase-Warnung Wegzugssteuer */}
          {hasGmbhOrDepot && (
            <div className="space-y-2 rounded-md border-l-2 border-neg bg-surface-sub p-4">
              <p className="flex items-center gap-2 text-text">
                <AlertTriangle className="h-4 w-4 shrink-0 text-neg" aria-hidden /> Wichtig: Wegzugsbesteuerung (§6 AStG)
              </p>
              <p className="text-sm leading-relaxed text-text-2">
                Du hast GmbH-Anteile oder Wertpapierdepots angegeben. Bei deinem Wegzug greift möglicherweise §6 AStG (fiktive Veräußerung). Bei EU-Zielland ist eine Stundung möglich — aber Zinsen laufen. <strong className="text-text">Steuerberater beauftragen.</strong>
              </p>
            </div>
          )}

          {/* Phases */}
          {PHASES.map(({ key }) => {
            const phaseSteps = filterSteps(steps.filter((s) => s.phase === key));
            if (phaseSteps.length === 0 && filterKey !== 'all') return null;
            const allStepsForPhase = steps.filter((s) => s.phase === key);
            const doneInPhase = allStepsForPhase.filter((s) => completedIds.has(s.id)).length;
            const isExpanded = expandedPhases.has(key);

            return (
              <div key={key} className={cn('overflow-hidden rounded-lg border border-line', key === 'critical' && 'border-l-2 border-l-neg')}>
                <button
                  onClick={() => togglePhase(key)}
                  className="focus-ring flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-sub"
                >
                  <span className="flex-1 text-h3 text-text">
                    {t(`phases.${key}` as Parameters<typeof t>[0])}
                  </span>
                  <span className="text-caption tabular text-text-3">{doneInPhase}/{allStepsForPhase.length}</span>
                  <span className="text-sm text-text-3">{isExpanded ? '▲' : '▼'}</span>
                </button>
                {isExpanded && phaseSteps.length > 0 && (
                  <div className="space-y-2.5 px-4 pb-4">
                    {phaseSteps.map((step) => (
                      <StepItem
                        key={step.id}
                        step={step}
                        locale={locale}
                        completed={completedIds.has(step.id)}
                        onToggle={toggleStep}
                      />
                    ))}
                  </div>
                )}
                {isExpanded && phaseSteps.length === 0 && filterKey !== 'all' && (
                  <p className="px-4 pb-4 text-caption text-text-3">Keine Schritte für diesen Filter.</p>
                )}
              </div>
            );
          })}

          {steps.length === 0 && (
            <div className="rounded-lg border border-dashed border-line p-12 text-center">
              <p className="text-body text-text-2">Noch keine Guide-Schritte für {plan.toCity.nameDE} vorhanden.</p>
            </div>
          )}
        </div>
      )}

      {/* Budget */}
      {subTab === 'budget' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1 rounded-lg border border-line bg-surface p-4">
              <p className="text-caption uppercase tracking-[0.04em] text-text-3">{t('budget.movingCosts')}</p>
              <p className="text-data-xl tabular text-text">{formatCurrency(totalBudget)}</p>
            </div>
            <div className="col-span-2 space-y-1 rounded-lg border border-line bg-surface p-4">
              <p className="text-caption uppercase tracking-[0.04em] text-text-3">{t('budget.breakEven')}</p>
              <p className="text-body text-text-2">{t('budget.breakEvenHint')}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-line bg-surface">
            <div className="divide-y divide-line-soft">
              {budgetItems.map((item, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="flex-1 text-body text-text">{item.label}</span>
                  {item.isEditable ? (
                    <div className="relative">
                      <Input
                        type="number"
                        value={item.amount}
                        onChange={(e) => updateBudget(i, parseFloat(e.target.value) || 0)}
                        className="h-9 w-28 pr-8 text-right text-data-sm"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-caption text-text-3">€</span>
                    </div>
                  ) : (
                    <span className="tabular text-text">{formatCurrency(item.amount)}</span>
                  )}
                </div>
              ))}
              <div className="flex items-center gap-4 bg-surface-sub px-5 py-4">
                <span className="flex-1 text-body text-text">Gesamt</span>
                <span className="text-data-md tabular text-text">{formatCurrency(totalBudget)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dokumente */}
      {subTab === 'documents' && (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={handleFileChange}
          />
          {documents.map((doc, i) => {
            const statusLabel: Record<string, string> = {
              available: t('documents.status.available'),
              uploaded: t('documents.status.uploaded'),
              pending: t('documents.status.pending'),
              notYetDue: t('documents.status.notYetDue'),
            };
            const canUpload = doc.status === 'pending' || doc.status === 'available';
            const isUploading = uploadingIdx === i;
            return (
              <div key={i} className="flex items-center gap-4 rounded-lg border border-line bg-surface px-5 py-4">
                <FileText className={cn('h-5 w-5 shrink-0', doc.status === 'uploaded' ? 'text-pos' : 'text-text-3')} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-body text-text">{doc.name}</p>
                  {doc.note && <p className="text-caption text-text-2">{doc.note}</p>}
                  {doc.uploadUrl && (
                    <a href={doc.uploadUrl} target="_blank" rel="noopener noreferrer" className="focus-ring inline-flex items-center gap-1 rounded-sm text-caption text-focus underline">
                      <ExternalLink className="h-3 w-3" aria-hidden /> Datei ansehen
                    </a>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className={cn('text-caption uppercase tracking-[0.04em]', docStatusColors[doc.status] ?? '')}>
                    {statusLabel[doc.status] ?? doc.status}
                  </span>
                  {canUpload && (
                    <Button variant="outline" size="sm" onClick={() => triggerUpload(i)} disabled={isUploading}>
                      {isUploading ? '…' : 'Hochladen'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          {documents.length === 0 && (
            <p className="py-8 text-center text-text-2">Keine Dokumente im Plan.</p>
          )}
          {uploadError && (
            <p className="rounded-md border border-line bg-surface-sub px-4 py-3 text-sm text-neg">{uploadError}</p>
          )}
          <p className="px-1 text-caption text-text-3">{t('documents.uploadHint')}</p>
        </div>
      )}
    </div>
  );
}

// ─── Plan Wizard ──────────────────────────────────────────────────────────────

const CITIES_SLUGS = [
  { slug: 'lissabon', nameDE: '🇵🇹 Lissabon' },
  { slug: 'barcelona', nameDE: '🇪🇸 Barcelona' },
  { slug: 'madrid', nameDE: '🇪🇸 Madrid' },
  { slug: 'amsterdam', nameDE: '🇳🇱 Amsterdam' },
  { slug: 'dubai', nameDE: '🇦🇪 Dubai' },
  { slug: 'tallinn', nameDE: '🇪🇪 Tallinn' },
  { slug: 'wien', nameDE: '🇦🇹 Wien' },
  { slug: 'prag', nameDE: '🇨🇿 Prag' },
  { slug: 'budapest', nameDE: '🇭🇺 Budapest' },
  { slug: 'porto', nameDE: '🇵🇹 Porto' },
  { slug: 'zuerich', nameDE: '🇨🇭 Zürich' },
  { slug: 'bangkok', nameDE: '🇹🇭 Bangkok' },
  { slug: 'chiang-mai', nameDE: '🇹🇭 Chiang Mai' },
  { slug: 'bali', nameDE: '🇮🇩 Bali' },
];

const HOME_CITIES = [
  { slug: 'berlin', nameDE: '🇩🇪 Berlin' },
  { slug: 'hamburg', nameDE: '🇩🇪 Hamburg' },
  { slug: 'muenchen', nameDE: '🇩🇪 München' },
  { slug: 'wien', nameDE: '🇦🇹 Wien' },
  { slug: 'zuerich', nameDE: '🇨🇭 Zürich' },
];

interface WizardState {
  toCitySlug: string;
  fromCitySlug: string;
  nationality: 'eu' | 'non-eu';
  situation: string;
  employment: string;
  assets: string[];
  targetDate: string;
}

const SELECT_CLS =
  'h-11 w-full rounded-md border border-line bg-surface px-[14px] text-body text-text focus:border-focus focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--focus)_25%,transparent)] focus:outline-none';

function PlanWizard({ onCreated }: { onCreated: () => void }) {
  const t = useTranslations('guide');
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<WizardState>({
    toCitySlug: '',
    fromCitySlug: 'berlin',
    nationality: 'eu',
    situation: 'single',
    employment: 'employed',
    assets: [],
    targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  function update<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function toggleAsset(a: string) {
    setState((prev) => ({
      ...prev,
      assets: prev.assets.includes(a) ? prev.assets.filter((x) => x !== a) : [...prev.assets, a],
    }));
  }

  async function handleCreate() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...state,
          targetDate: new Date(state.targetDate).toISOString(),
          locale: 'de',
        }),
      });
      if (!res.ok) {
        const e = await res.json();
        setError(e.error ?? 'Fehler beim Erstellen des Plans');
        return;
      }
      onCreated();
    } catch {
      setError('Netzwerkfehler');
    } finally {
      setSaving(false);
    }
  }

  const steps = [
    t('wizard.step1'), t('wizard.step2'), t('wizard.step3'),
    t('wizard.step4'), t('wizard.step5'), t('wizard.step6'),
  ];

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-h1 text-text">{t('wizard.title')}</h2>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-caption uppercase tracking-[0.04em] text-text-3">
          <span>Schritt {step} von {steps.length}</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-line">
          <div className="h-1 rounded-full bg-text transition-all" style={{ width: `${((step - 1) / steps.length) * 100}%` }} />
        </div>
      </div>

      <div className="space-y-5 rounded-lg border border-line bg-surface p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-h2 text-text">{t('wizard.step1')}</h3>
            <div className="grid grid-cols-2 gap-2">
              {CITIES_SLUGS.map((c) => (
                <button key={c.slug} onClick={() => update('toCitySlug', c.slug)} className={cn('text-left', selectableCls(state.toCitySlug === c.slug))}>
                  {c.nameDE}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-h2 text-text">{t('wizard.step2')}</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => update('nationality', 'eu')} className={selectableCls(state.nationality === 'eu')}>🇪🇺 EU-Bürger</button>
              <button onClick={() => update('nationality', 'non-eu')} className={selectableCls(state.nationality === 'non-eu')}>Nicht-EU</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-h2 text-text">{t('wizard.step3')}</h3>
            {[['single', 'Single'], ['pair', 'Paar'], ['family', 'Familie']].map(([v, l]) => (
              <button key={v} onClick={() => update('situation', v)} className={cn('w-full text-left', selectableCls(state.situation === v))}>
                {l}
              </button>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-h2 text-text">{t('wizard.step4')}</h3>
            {[['employed', 'Angestellt'], ['freelancer', 'Freiberufler'], ['founder', 'Gründer'], ['passive', 'Passiveinkommen']].map(([v, l]) => (
              <button key={v} onClick={() => update('employment', v)} className={cn('w-full text-left', selectableCls(state.employment === v))}>
                {l}
              </button>
            ))}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-h2 text-text">{t('wizard.step5')}</h3>
            <p className="text-body text-text-2">Welche Vermögenswerte hast du in Deutschland? (Mehrfachauswahl)</p>
            <div className="space-y-2">
              {[['gmbh', 'GmbH-Anteile'], ['depot', 'Wertpapierdepot > 1%'], ['immobilie', 'Immobilien'], ['pkv', 'Private Krankenversicherung']].map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => toggleAsset(v)}
                  className={cn('flex w-full items-center justify-between text-left', selectableCls(state.assets.includes(v)))}
                >
                  <span>{l}</span>
                  {state.assets.includes(v) && <Check className="h-4 w-4 text-text" aria-hidden />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <h3 className="text-h2 text-text">{t('wizard.step6')}</h3>
            <div className="space-y-1.5">
              <label className="block text-sm text-text-2">{t('wizard.targetDate')}</label>
              <Input
                type="date"
                value={state.targetDate}
                onChange={(e) => update('targetDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-caption text-text-3">{t('wizard.targetDateHint')}</p>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm text-text-2">Heimatstadt</label>
              <select value={state.fromCitySlug} onChange={(e) => update('fromCitySlug', e.target.value)} className={SELECT_CLS}>
                {HOME_CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.nameDE}</option>)}
              </select>
            </div>
          </div>
        )}

        {error && <p className="rounded-md border border-line bg-surface-sub px-4 py-3 text-sm text-neg">{error}</p>}
      </div>

      <div className="flex gap-3">
        {step > 1 && <Button variant="outline" onClick={() => setStep((s) => s - 1)}>Zurück</Button>}
        <div className="flex-1" />
        {step < steps.length ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={step === 1 && !state.toCitySlug}>Weiter</Button>
        ) : (
          <Button onClick={handleCreate} disabled={saving || !state.toCitySlug}>
            {saving ? '…' : t('wizard.create')}
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── City Browse ──────────────────────────────────────────────────────────────

interface CityListItem {
  slug: string;
  nameDE: string;
  nameEN: string;
  flag: string;
  guideCount: number;
}

function CityBrowse() {
  const t = useTranslations('guide');
  const locale = useLocale();
  const isDE = locale === 'de';
  const [cities, setCities] = useState<CityListItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [guideData, setGuideData] = useState<CityGuideData | null>(null);
  const [loadingGuide, setLoadingGuide] = useState(false);

  useEffect(() => {
    fetch('/api/city-guide')
      .then((r) => r.json())
      .then((d) => setCities(d.cities ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedSlug) { setGuideData(null); return; }
    setLoadingGuide(true);
    fetch(`/api/city-guide/${selectedSlug}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setGuideData(d as unknown as CityGuideData))
      .catch(() => {})
      .finally(() => setLoadingGuide(false));
  }, [selectedSlug]);

  const citiesWithGuide = cities.filter((c) => c.guideCount > 0);
  const cityName = guideData ? (isDE ? guideData.city.nameDE : guideData.city.nameEN) : '';
  const guideLink = selectedSlug
    ? isDE
      ? `/${locale}/auswandern/${selectedSlug}`
      : `/${locale}/emigrate/${toEnSlug(selectedSlug)}`
    : null;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-h2 text-text">{t('cityBrowse.title')}</h2>
        <p className="text-body text-text-2">{t('cityBrowse.subtitle')}</p>
      </div>

      {/* City picker */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {citiesWithGuide.map((city) => (
          <button
            key={city.slug}
            onClick={() => setSelectedSlug((s) => s === city.slug ? null : city.slug)}
            className={cn('flex items-center gap-2 text-left', selectableCls(selectedSlug === city.slug))}
          >
            <span className="shrink-0 text-lg leading-none">{city.flag}</span>
            <span className="min-w-0 flex-1 truncate">{isDE ? city.nameDE : city.nameEN}</span>
          </button>
        ))}
      </div>

      {/* Selected city guide */}
      {selectedSlug && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-h2 text-text">
              {guideData?.city.flag} {cityName}
              {guideData && (
                <span className="ml-2 text-caption text-text-2">
                  {guideData.totalSteps} {t('cityBrowse.steps')}
                </span>
              )}
            </h3>
            {guideLink && (
              <a href={guideLink} className="focus-ring rounded-sm text-sm text-focus transition-colors hover:underline">
                {t('cityBrowse.viewFull')}
              </a>
            )}
          </div>

          {loadingGuide && (
            <div className="animate-pulse space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-md bg-surface-sub" />
              ))}
            </div>
          )}

          {!loadingGuide && guideData && (
            <CityGuideContent data={guideData} locale={locale} />
          )}

          {!loadingGuide && !guideData && (
            <p className="py-8 text-center text-body text-text-2">
              {t('cityBrowse.noGuide')}
            </p>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <p className="rounded-md border border-line px-4 py-3 text-caption leading-relaxed text-text-3">
        {t('cityBrowse.disclaimer')}
      </p>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function GuidePage() {
  const t = useTranslations('guide');
  const locale = useLocale();
  const { user, openAuthModal } = useAuth();
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [topTab, setTopTab] = useState<'plan' | 'cityGuide'>('plan');
  const [showRiskDialog, setShowRiskDialog] = useState(false);
  const [riskConfirmed, setRiskConfirmed] = useState(false);

  const fetchPlan = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const res = await fetch('/api/plan');
      if (res.ok) {
        const data = await res.json();
        setPlanData(data);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchPlan(); }, [fetchPlan]);

  useEffect(() => {
    if (!planData || riskConfirmed) return;
    const hasHighRisk = planData.steps.some((s) => s.riskLevel === 'high');
    if (hasHighRisk) setShowRiskDialog(true);
  }, [planData, riskConfirmed]);

  async function handleUpdate(planId: string, patch: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/plan/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const updated = await res.json();
        setPlanData((prev) => prev ? { ...prev, plan: updated } : null);
      }
    } catch { /* ignore */ }
  }

  function handleCreateClick() {
    if (!user) { openAuthModal('register'); return; }
    setShowWizard(true);
  }

  async function handleWizardCreated() {
    setShowWizard(false);
    setLoading(true);
    await fetchPlan();
  }

  const highRiskTitles = planData
    ? planData.steps
        .filter((s) => s.riskLevel === 'high')
        .map((s) => (locale === 'de' ? s.titleDE : (s.titleEN || s.titleDE)))
    : [];

  if (showWizard) {
    return <PlanWizard onCreated={handleWizardCreated} />;
  }

  const topTabs: { key: 'plan' | 'cityGuide'; label: string }[] = [
    { key: 'plan', label: t('tabs.plan') },
    { key: 'cityGuide', label: t('tabs.cityGuide') },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <HighRiskWarningDialog
        open={showRiskDialog}
        highRiskTitles={highRiskTitles}
        onConfirm={() => { setRiskConfirmed(true); setShowRiskDialog(false); }}
        onCancel={() => setShowRiskDialog(false)}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h1 text-text">{t('title')}</h1>
          <p className="text-body text-text-2">{t('subtitle')}</p>
        </div>
      </div>

      {/* Top-level tabs */}
      <SegmentedControl
        aria-label={t('title')}
        value={topTab}
        onChange={setTopTab}
        options={topTabs.map((tab) => ({ value: tab.key, label: tab.label }))}
      />

      {/* City guide browser */}
      {topTab === 'cityGuide' && <CityBrowse />}

      {/* Personal plan */}
      {topTab === 'plan' && (
        <>
          {loading && (
            <div className="animate-pulse space-y-4">
              <div className="h-32 rounded-lg border border-line bg-surface-sub" />
              <div className="h-64 rounded-lg border border-line bg-surface-sub" />
            </div>
          )}
          {!loading && (!user || !planData) && (
            <div className="space-y-4 rounded-lg border border-dashed border-line p-16 text-center">
              <p className="text-h3 text-text">{t('noPlan')}</p>
              <p className="text-body text-text-2">{t('noPlanHint')}</p>
              {!user && <p className="text-caption text-text-3">{t('loginRequired')}</p>}
              <div className="flex justify-center pt-2">
                <Button onClick={handleCreateClick}>{t('createPlan')}</Button>
              </div>
            </div>
          )}
          {!loading && planData && highRiskTitles.length > 0 && !riskConfirmed && (
            <button
              onClick={() => setShowRiskDialog(true)}
              className="focus-ring flex w-full items-center gap-2 rounded-md border-l-2 border-neg bg-surface-sub px-4 py-3 text-left text-sm text-neg transition-colors hover:bg-surface-sub"
            >
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden /> {t('riskWarning.banner')}
            </button>
          )}
          {!loading && planData && <PlanView data={planData} onUpdate={handleUpdate} />}
        </>
      )}
    </div>
  );
}
