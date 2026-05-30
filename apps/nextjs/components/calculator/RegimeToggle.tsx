'use client';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { formatCurrency } from '@/lib/utils';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import type { TaxWithRegime } from './Calculator';

interface RegimeToggleProps {
  regime: TaxWithRegime;
  currency: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

/**
 * Sondersteuerregime-Umschaltung (Spec §6): Segmented Control mit zwei Feldern.
 * Ersparnis als Caption darunter, keine farbige Fläche.
 */
export function RegimeToggle({ regime, currency, enabled, onChange }: RegimeToggleProps) {
  const t = useTranslations('results');
  const locale = useLocale();
  const regimeName = locale === 'de' ? regime.regimeNameDE : regime.regimeNameEN;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <SegmentedControl
        aria-label={t('withRegime', { regime: regimeName })}
        value={enabled ? 'regime' : 'standard'}
        onChange={(v) => onChange(v === 'regime')}
        options={[
          { value: 'standard', label: 'Standard' },
          { value: 'regime', label: regimeName },
        ]}
      />
      {regime.savings > 0 && (
        <p className="text-caption text-pos">
          +{formatCurrency(regime.savings, currency, 0)} {t('savingsPerYear')}
        </p>
      )}
    </div>
  );
}
