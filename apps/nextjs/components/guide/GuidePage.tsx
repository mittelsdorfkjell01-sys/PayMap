'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
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

const PHASES = [
  { key: 'critical', color: 'border-error/60 bg-error/5', badge: 'bg-error text-on-error', icon: '⚠️' },
  { key: 'before_move', color: 'border-primary/40 bg-primary/5', badge: 'bg-primary text-on-primary', icon: '📋' },
  { key: '3_months', color: 'border-secondary/40 bg-secondary/5', badge: 'bg-secondary text-on-secondary', icon: '🏠' },
  { key: 'arrival', color: 'border-tertiary/40 bg-tertiary/5', badge: 'bg-tertiary text-on-tertiary', icon: '✈️' },
  { key: 'first_month', color: 'border-outline/40 bg-surface-container', badge: 'bg-surface-container-high text-on-surface', icon: '📝' },
  { key: 'first_3_months', color: 'border-outline/40 bg-surface-container', badge: 'bg-surface-container-high text-on-surface', icon: '🎯' },
] as const;

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

// ─── WarnBox ──────────────────────────────────────────────────────────────────

function WarnBox({ type, text }: { type: string; text: string }) {
  const styles: Record<string, string> = {
    danger: 'bg-error-container/40 border-error/40 text-error',
    warning: 'bg-warning-container/40 border-warning/40 text-on-surface',
    info: 'bg-primary/8 border-primary/20 text-on-surface',
  };
  return (
    <div className={cn('border rounded-xl px-4 py-3 text-body-sm leading-relaxed', styles[type] ?? styles.info)}>
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
      'border rounded-xl overflow-hidden transition-all',
      completed ? 'border-outline-variant/30 opacity-60' :
        isHighRisk ? 'border-l-4 border-l-error/70 border-error/40 bg-error/5' :
        isMediumRisk ? 'border-l-4 border-l-warning/70 border-warning/30 bg-warning/5' :
        step.isWarning ? 'border-error/40' : 'border-outline-variant/40',
    )}>
      <div className="flex items-start gap-3 px-4 py-3.5">
        <button
          onClick={() => onToggle(step.id)}
          className={cn(
            'mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
            completed
              ? 'bg-primary border-primary text-on-primary'
              : 'border-outline hover:border-primary',
          )}
        >
          {completed && <span className="text-xs">✓</span>}
        </button>
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex-1 min-w-0">
              <p className={cn('text-body-md font-semibold text-on-surface', completed && 'line-through text-on-surface-variant')}>
                {title}
              </p>
              {subtitle && <p className="text-label-sm text-on-surface-variant">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap shrink-0">
              {isHighRisk && (
                <span className="text-[10px] font-bold bg-error text-on-error px-2 py-0.5 rounded-full">
                  {isDE ? '⚠ Hohes Risiko' : '⚠ High Risk'}
                </span>
              )}
              {isMediumRisk && (
                <span className="text-[10px] font-bold bg-warning text-on-surface px-2 py-0.5 rounded-full">
                  {isDE ? '◈ Mittleres Risiko' : '◈ Medium Risk'}
                </span>
              )}
              {step.requiresLegalAdvice && (
                <span className="text-[10px] font-semibold bg-error-container/60 text-error px-2 py-0.5 rounded-full">
                  {isDE ? 'Rechtsberatung' : 'Legal Advice'}
                </span>
              )}
              <span className="text-label-sm text-on-surface-variant leading-tight">{timing}</span>
            </div>
          </div>
          {step.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {(step.tags as string[]).map((tag) => (
                <span key={tag} className="text-label-sm bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant">
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
                  <span key={i} className="text-label-sm border border-outline-variant/60 rounded-full px-2.5 py-0.5 text-on-surface-variant flex items-center gap-1">
                    <span>📄</span>{docTitle}
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
              className="inline-flex text-label-sm text-error border border-error/40 rounded-full px-3 py-1 hover:bg-error/5 transition-colors"
            >
              🔍 {t('riskWarning.legalAdviceBtn')}
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
    available: 'text-primary',
    uploaded: 'text-primary',
    pending: 'text-on-surface-variant',
    notYetDue: 'text-on-surface-variant opacity-60',
  };

  return (
    <div className="space-y-6">
      {/* Plan header */}
      <div className="glass-card p-5 space-y-4 shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-headline-md font-bold text-on-surface">
              {plan.fromCity.flag} {plan.fromCity.nameDE} → {plan.toCity.flag} {plan.toCity.nameDE}
            </h2>
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">
              {t('countdown').replace('{days}', String(Math.max(0, days)))}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono font-bold text-2xl text-on-surface">{progress}%</p>
            <p className="text-label-sm text-on-surface-variant">{t('progress').replace('{done}', String(doneSteps)).replace('{total}', String(totalSteps))}</p>
          </div>
        </div>
        <div className="w-full bg-surface-container rounded-full h-2">
          <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex flex-wrap gap-4 text-label-sm">
          <span className="text-primary font-semibold">{doneSteps} {t('stats.done')}</span>
          <span className="text-on-surface-variant">{totalSteps - doneSteps} {t('stats.open')}</span>
          {steps.filter((s) => s.isWarning && !completedIds.has(s.id)).length > 0 && (
            <span className="text-error font-semibold">{steps.filter((s) => s.isWarning && !completedIds.has(s.id)).length} {t('stats.urgent')}</span>
          )}
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 bg-surface-container rounded-2xl w-fit">
        {subTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSubTab(tab.key)}
            className={cn(
              'px-4 py-2 rounded-xl text-label-sm font-semibold uppercase tracking-wider transition-colors',
              subTab === tab.key ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mein Plan */}
      {subTab === 'plan' && (
        <div className="space-y-4">
          {/* Filter pills */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'open', 'urgent', 'done'] as FilterKey[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilterKey(f)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-label-sm font-semibold uppercase tracking-wider transition-colors',
                  filterKey === f ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high',
                )}
              >
                {t(`filter.${f}` as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>

          {/* Phase-Warnung Wegzugssteuer */}
          {hasGmbhOrDepot && (
            <div className="border-2 border-error/40 rounded-xl p-4 bg-error/5 space-y-2">
              <p className="font-semibold text-error flex items-center gap-2">⚠️ Wichtig: Wegzugsbesteuerung (§6 AStG)</p>
              <p className="text-body-sm text-on-surface leading-relaxed">
                Du hast GmbH-Anteile oder Wertpapierdepots angegeben. Bei deinem Wegzug greift möglicherweise §6 AStG (fiktive Veräußerung). Bei EU-Zielland ist eine Stundung möglich — aber Zinsen laufen. <strong>Steuerberater beauftragen.</strong>
              </p>
            </div>
          )}

          {/* Phases */}
          {PHASES.map(({ key, color, badge, icon }) => {
            const phaseSteps = filterSteps(steps.filter((s) => s.phase === key));
            if (phaseSteps.length === 0 && filterKey !== 'all') return null;
            const allStepsForPhase = steps.filter((s) => s.phase === key);
            const doneInPhase = allStepsForPhase.filter((s) => completedIds.has(s.id)).length;
            const isExpanded = expandedPhases.has(key);

            return (
              <div key={key} className={cn('border rounded-2xl overflow-hidden', color)}>
                <button
                  onClick={() => togglePhase(key)}
                  className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-black/5 transition-colors"
                >
                  <span className="text-lg">{icon}</span>
                  <div className="flex-1">
                    <span className={cn('text-label-sm font-bold px-2.5 py-1 rounded-full mr-2', badge)}>
                      {t(`phases.${key}` as Parameters<typeof t>[0])}
                    </span>
                  </div>
                  <span className="text-label-sm text-on-surface-variant font-mono">{doneInPhase}/{allStepsForPhase.length}</span>
                  <span className="text-on-surface-variant ml-1">{isExpanded ? '▲' : '▼'}</span>
                </button>
                {isExpanded && phaseSteps.length > 0 && (
                  <div className="px-4 pb-4 space-y-2.5">
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
                  <p className="px-4 pb-4 text-label-sm text-on-surface-variant">Keine Schritte für diesen Filter.</p>
                )}
              </div>
            );
          })}

          {steps.length === 0 && (
            <div className="border border-dashed border-outline-variant rounded-2xl p-12 text-center">
              <p className="text-on-surface-variant text-body-md">Noch keine Guide-Schritte für {plan.toCity.nameDE} vorhanden.</p>
            </div>
          )}
        </div>
      )}

      {/* Budget */}
      {subTab === 'budget' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-4 space-y-1">
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">{t('budget.movingCosts')}</p>
              <p className="text-2xl font-bold font-mono text-on-surface">{formatCurrency(totalBudget)}</p>
            </div>
            <div className="glass-card p-4 space-y-1 col-span-2">
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">{t('budget.breakEven')}</p>
              <p className="text-body-md text-on-surface-variant">{t('budget.breakEvenHint')}</p>
            </div>
          </div>

          <div className="glass-card shadow-sm overflow-hidden">
            <div className="divide-y divide-outline-variant/20">
              {budgetItems.map((item, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="flex-1 text-body-md text-on-surface">{item.label}</span>
                  {item.isEditable ? (
                    <div className="relative">
                      <input
                        type="number"
                        value={item.amount}
                        onChange={(e) => updateBudget(i, parseFloat(e.target.value) || 0)}
                        className="w-28 text-right input-field pr-8 py-1.5 text-body-md"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-label-sm text-on-surface-variant pointer-events-none">€</span>
                    </div>
                  ) : (
                    <span className="font-mono font-bold text-on-surface">{formatCurrency(item.amount)}</span>
                  )}
                </div>
              ))}
              <div className="flex items-center gap-4 px-5 py-4 bg-surface-container-low/50">
                <span className="flex-1 text-body-md font-bold text-on-surface">Gesamt</span>
                <span className="font-mono font-bold text-xl text-on-surface">{formatCurrency(totalBudget)}</span>
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
              <div key={i} className="glass-card px-5 py-4 flex items-center gap-4">
                <span className="text-xl">{doc.status === 'uploaded' ? '✅' : '📄'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-body-md font-semibold text-on-surface">{doc.name}</p>
                  {doc.note && <p className="text-label-sm text-on-surface-variant">{doc.note}</p>}
                  {doc.uploadUrl && (
                    <a href={doc.uploadUrl} target="_blank" rel="noopener noreferrer" className="text-label-sm text-primary underline">
                      Datei ansehen
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={cn('text-label-sm font-semibold uppercase tracking-wider', docStatusColors[doc.status] ?? '')}>
                    {statusLabel[doc.status] ?? doc.status}
                  </span>
                  {canUpload && (
                    <button
                      onClick={() => triggerUpload(i)}
                      disabled={isUploading}
                      className="text-label-sm px-3 py-1.5 border border-outline-variant rounded-lg hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                    >
                      {isUploading ? '…' : 'Hochladen'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {documents.length === 0 && (
            <p className="text-center text-on-surface-variant py-8">Keine Dokumente im Plan.</p>
          )}
          {uploadError && (
            <p className="text-error bg-error-container/30 border border-error/30 rounded-xl px-4 py-3 text-body-sm">{uploadError}</p>
          )}
          <p className="text-label-sm text-on-surface-variant px-1">{t('documents.uploadHint')}</p>
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
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-headline-xl-mobile font-bold text-on-background">{t('wizard.title')}</h2>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-label-sm text-on-surface-variant uppercase tracking-wider">
          <span>Schritt {step} von {steps.length}</span>
        </div>
        <div className="w-full bg-surface-container rounded-full h-1.5">
          <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${((step - 1) / steps.length) * 100}%` }} />
        </div>
      </div>

      <div className="glass-card p-6 space-y-5 shadow-sm">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-headline-md font-semibold text-on-surface">{t('wizard.step1')}</h3>
            <div className="grid grid-cols-2 gap-2">
              {CITIES_SLUGS.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => update('toCitySlug', c.slug)}
                  className={cn(
                    'text-left px-4 py-3 border rounded-xl text-body-md transition-all',
                    state.toCitySlug === c.slug
                      ? 'border-primary bg-primary/8 font-semibold text-on-surface'
                      : 'border-outline-variant text-on-surface-variant hover:border-outline',
                  )}
                >
                  {c.nameDE}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-headline-md font-semibold text-on-surface">{t('wizard.step2')}</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => update('nationality', 'eu')} className={cn('px-4 py-3 border rounded-xl text-body-md transition-all', state.nationality === 'eu' ? 'border-primary bg-primary/8 font-semibold' : 'border-outline-variant text-on-surface-variant')}>🇪🇺 EU-Bürger</button>
              <button onClick={() => update('nationality', 'non-eu')} className={cn('px-4 py-3 border rounded-xl text-body-md transition-all', state.nationality === 'non-eu' ? 'border-primary bg-primary/8 font-semibold' : 'border-outline-variant text-on-surface-variant')}>🌍 Nicht-EU</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-headline-md font-semibold text-on-surface">{t('wizard.step3')}</h3>
            {[['single', 'Single'], ['pair', 'Paar'], ['family', 'Familie']].map(([v, l]) => (
              <button key={v} onClick={() => update('situation', v)} className={cn('w-full text-left px-4 py-3 border rounded-xl text-body-md transition-all', state.situation === v ? 'border-primary bg-primary/8 font-semibold' : 'border-outline-variant text-on-surface-variant')}>
                {l}
              </button>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-headline-md font-semibold text-on-surface">{t('wizard.step4')}</h3>
            {[['employed', 'Angestellt'], ['freelancer', 'Freiberufler'], ['founder', 'Gründer'], ['passive', 'Passiveinkommen']].map(([v, l]) => (
              <button key={v} onClick={() => update('employment', v)} className={cn('w-full text-left px-4 py-3 border rounded-xl text-body-md transition-all', state.employment === v ? 'border-primary bg-primary/8 font-semibold' : 'border-outline-variant text-on-surface-variant')}>
                {l}
              </button>
            ))}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-headline-md font-semibold text-on-surface">{t('wizard.step5')}</h3>
            <p className="text-body-md text-on-surface-variant">Welche Vermögenswerte hast du in Deutschland? (Mehrfachauswahl)</p>
            <div className="space-y-2">
              {[['gmbh', 'GmbH-Anteile'], ['depot', 'Wertpapierdepot > 1%'], ['immobilie', 'Immobilien'], ['pkv', 'Private Krankenversicherung']].map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => toggleAsset(v)}
                  className={cn('w-full text-left px-4 py-3 border rounded-xl text-body-md transition-all flex items-center justify-between', state.assets.includes(v) ? 'border-primary bg-primary/8 font-semibold' : 'border-outline-variant text-on-surface-variant')}
                >
                  <span>{l}</span>
                  {state.assets.includes(v) && <span className="text-primary">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <h3 className="text-headline-md font-semibold text-on-surface">{t('wizard.step6')}</h3>
            <div className="space-y-1.5">
              <label className="label-field">{t('wizard.targetDate')}</label>
              <input
                type="date"
                value={state.targetDate}
                onChange={(e) => update('targetDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="input-field"
              />
              <p className="text-label-sm text-on-surface-variant">{t('wizard.targetDateHint')}</p>
            </div>
            <div className="space-y-1.5">
              <label className="label-field">Heimatstadt</label>
              <select value={state.fromCitySlug} onChange={(e) => update('fromCitySlug', e.target.value)} className="input-field">
                {HOME_CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.nameDE}</option>)}
              </select>
            </div>
          </div>
        )}

        {error && <p className="text-error bg-error-container/30 border border-error/30 rounded-xl px-4 py-3 text-body-md">{error}</p>}
      </div>

      <div className="flex gap-3">
        {step > 1 && <button onClick={() => setStep((s) => s - 1)} className="btn-secondary px-5">Zurück</button>}
        <div className="flex-1" />
        {step < steps.length ? (
          <button onClick={() => setStep((s) => s + 1)} disabled={step === 1 && !state.toCitySlug} className="btn-primary">Weiter</button>
        ) : (
          <button onClick={handleCreate} disabled={saving || !state.toCitySlug} className="btn-primary">
            {saving ? '…' : t('wizard.create')}
          </button>
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
        <h2 className="text-headline-sm font-bold text-on-background">{t('cityBrowse.title')}</h2>
        <p className="text-body-md text-on-surface-variant">{t('cityBrowse.subtitle')}</p>
      </div>

      {/* City picker */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {citiesWithGuide.map((city) => (
          <button
            key={city.slug}
            onClick={() => setSelectedSlug((s) => s === city.slug ? null : city.slug)}
            className={cn(
              'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all text-body-sm',
              selectedSlug === city.slug
                ? 'border-primary bg-primary/8 font-semibold text-on-surface'
                : 'border-outline-variant text-on-surface-variant hover:border-outline hover:text-on-surface',
            )}
          >
            <span className="text-lg leading-none shrink-0">{city.flag}</span>
            <span className="flex-1 min-w-0 truncate">{isDE ? city.nameDE : city.nameEN}</span>
          </button>
        ))}
      </div>

      {/* Selected city guide */}
      {selectedSlug && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-headline-md font-bold text-on-background">
              {guideData?.city.flag} {cityName}
              {guideData && (
                <span className="text-label-sm text-on-surface-variant font-normal ml-2">
                  {guideData.totalSteps} {t('cityBrowse.steps')}
                </span>
              )}
            </h3>
            {guideLink && (
              <a
                href={guideLink}
                className="text-label-sm text-primary font-semibold hover:text-primary/80 transition-colors"
              >
                {t('cityBrowse.viewFull')}
              </a>
            )}
          </div>

          {loadingGuide && (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-surface-container rounded-xl" />
              ))}
            </div>
          )}

          {!loadingGuide && guideData && (
            <CityGuideContent data={guideData} locale={locale} />
          )}

          {!loadingGuide && !guideData && (
            <p className="text-body-md text-on-surface-variant py-8 text-center">
              {t('cityBrowse.noGuide')}
            </p>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-label-sm text-on-surface-variant border border-outline-variant/30 rounded-xl px-4 py-3 leading-relaxed">
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
    <div className="max-w-4xl mx-auto space-y-6">
      <HighRiskWarningDialog
        open={showRiskDialog}
        highRiskTitles={highRiskTitles}
        onConfirm={() => { setRiskConfirmed(true); setShowRiskDialog(false); }}
        onCancel={() => setShowRiskDialog(false)}
      />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-headline-xl-mobile md:text-headline-lg font-bold text-on-background">{t('title')}</h1>
          <p className="text-body-lg text-on-surface-variant">{t('subtitle')}</p>
        </div>
      </div>

      {/* Top-level tabs */}
      <div className="flex gap-1 p-1 bg-surface-container rounded-2xl w-fit">
        {topTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setTopTab(tab.key)}
            className={cn(
              'px-4 py-2 rounded-xl text-label-sm font-semibold uppercase tracking-wider transition-colors',
              topTab === tab.key ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* City guide browser */}
      {topTab === 'cityGuide' && <CityBrowse />}

      {/* Personal plan */}
      {topTab === 'plan' && (
        <>
          {loading && (
            <div className="space-y-4 animate-pulse">
              <div className="glass-card h-32 bg-surface-container" />
              <div className="glass-card h-64 bg-surface-container" />
            </div>
          )}
          {!loading && (!user || !planData) && (
            <div className="border border-dashed border-outline-variant rounded-2xl p-16 text-center space-y-4">
              <p className="text-on-surface font-semibold text-headline-sm">{t('noPlan')}</p>
              <p className="text-on-surface-variant text-body-md">{t('noPlanHint')}</p>
              {!user && <p className="text-label-sm text-on-surface-variant">{t('loginRequired')}</p>}
              <button onClick={handleCreateClick} className="btn-primary">
                {t('createPlan')}
              </button>
            </div>
          )}
          {!loading && planData && highRiskTitles.length > 0 && !riskConfirmed && (
            <button
              onClick={() => setShowRiskDialog(true)}
              className="w-full border border-error/40 bg-error/5 rounded-xl px-4 py-3 text-body-sm text-error text-left hover:bg-error/10 transition-colors"
            >
              ⚠ {t('riskWarning.banner')}
            </button>
          )}
          {!loading && planData && <PlanView data={planData} onUpdate={handleUpdate} />}
        </>
      )}
    </div>
  );
}
