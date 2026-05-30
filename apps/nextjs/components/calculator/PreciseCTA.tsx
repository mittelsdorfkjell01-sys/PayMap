'use client';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
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
      <div className="flex items-center justify-between gap-4 rounded-md border border-line bg-surface-sub px-4 py-3">
        <p className="text-sm text-text-2">{t('cta.hint')}</p>
        <Button type="button" size="sm" onClick={onScrollDown} className="shrink-0 whitespace-nowrap">
          {t('cta.scrollDown')}
        </Button>
      </div>
    );
  }

  if (!user) {
    // Fields set, not logged in → invite to save via login
    return (
      <div className="flex items-center justify-between gap-4 rounded-md border border-line bg-surface-sub px-4 py-3">
        <p className="text-sm text-text-2">{t('cta.saveHint')}</p>
        <Button
          type="button"
          size="sm"
          onClick={() => openAuthModal('register')}
          className="shrink-0 whitespace-nowrap"
        >
          {t('cta.signInToSave')}
        </Button>
      </div>
    );
  }

  // Fields set and logged in → save to profile
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-line bg-surface-sub px-4 py-3">
      <p className="text-sm text-text-2">{t('cta.saveHint')}</p>
      <Button type="button" size="sm" onClick={onSaveToProfile} className="shrink-0 whitespace-nowrap">
        {t('cta.savePreferences')}
      </Button>
    </div>
  );
}
