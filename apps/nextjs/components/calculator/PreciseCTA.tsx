'use client';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth';
import type { RefineFields } from './RefineAccordion';

interface PreciseCTAProps {
  isApproximate: boolean;
  refineFields: RefineFields;
  onScrollDown: () => void;
  onSaveToProfile: () => void;
}

export function PreciseCTA({ isApproximate, refineFields, onScrollDown, onSaveToProfile }: PreciseCTAProps) {
  const t = useTranslations('calculator.refine');
  const { user, openAuthModal } = useAuth();

  const hasAnyField =
    refineFields.employment !== null ||
    refineFields.familyStatus !== null ||
    refineFields.children > 0 ||
    refineFields.kvType !== null;

  // Nothing to show once result is precise and no fields have been touched
  if (!isApproximate && !hasAnyField) return null;

  if (!hasAnyField) {
    // Approximate result, no refinements yet → invite to refine
    return (
      <div className="bg-muted/50 border border-border/40 rounded-lg p-4 flex items-center justify-between gap-4">
        <p className="text-sm font-light text-muted-foreground">
          {t('cta.hint')}
        </p>
        <button
          type="button"
          onClick={onScrollDown}
          className="shrink-0 bg-foreground text-background text-sm font-light px-4 py-2 rounded-lg transition-all hover:opacity-90 whitespace-nowrap"
        >
          {t('cta.scrollDown')}
        </button>
      </div>
    );
  }

  if (!user) {
    // Fields set, not logged in → invite to save via login
    return (
      <div className="bg-primary-light/30 border border-primary/20 rounded-lg p-4 flex items-center justify-between gap-4">
        <p className="text-sm font-light text-muted-foreground">
          {t('cta.saveHint')}
        </p>
        <button
          type="button"
          onClick={() => openAuthModal('register')}
          className="shrink-0 btn-primary text-sm px-4 py-2 whitespace-nowrap"
        >
          {t('cta.signInToSave')}
        </button>
      </div>
    );
  }

  // Fields set and logged in → save to profile
  return (
    <div className="bg-primary-light/30 border border-primary/20 rounded-lg p-4 flex items-center justify-between gap-4">
      <p className="text-sm font-light text-muted-foreground">
        {t('cta.saveHint')}
      </p>
      <button
        type="button"
        onClick={onSaveToProfile}
        className="shrink-0 btn-primary text-sm px-4 py-2 whitespace-nowrap"
      >
        {t('cta.savePreferences')}
      </button>
    </div>
  );
}
