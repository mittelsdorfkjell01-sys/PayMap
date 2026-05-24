'use client';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { formatCurrency } from '@/lib/utils';
import type { TaxWithRegime } from './Calculator';

interface RegimeToggleProps {
  regime: TaxWithRegime;
  currency: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function RegimeToggle({ regime, currency, enabled, onChange }: RegimeToggleProps) {
  const t = useTranslations('results');
  const locale = useLocale();
  const regimeName = locale === 'de' ? regime.regimeNameDE : regime.regimeNameEN;

  return (
    <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 gap-4">
      <div className="space-y-0.5 min-w-0">
        <p className="text-sm font-semibold text-on-surface truncate">
          {t('withRegime', { regime: regimeName })}
        </p>
        {regime.savings > 0 && (
          <p className="text-xs text-green-700 font-medium">
            +{formatCurrency(regime.savings, currency, 0)} {t('savingsPerYear')}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`shrink-0 relative w-11 h-6 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          enabled ? 'bg-primary' : 'bg-outline-variant'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
