'use client';
import { useTranslations } from 'next-intl';
import { formatCurrency, cn } from '@/lib/utils';
import { StatusDot } from '@/components/ui/StatusDot';
import type { CalculateResponse } from './Calculator';
import { RegimeToggle } from './RegimeToggle';

interface ApproximateResultProps {
  result: CalculateResponse;
  regimeEnabled?: boolean;
  onRegimeChange?: (enabled: boolean) => void;
  onCityClick?: (slug: string) => void;
  salaryRefinement?: React.ReactNode;
}

export function ApproximateResult({ result, regimeEnabled = false, onRegimeChange, onCityClick, salaryRefinement }: ApproximateResultProps) {
  const t = useTranslations('results');
  const { from, to, toCity, fromCity, taxWithRegime } = result;

  const activeTo = regimeEnabled && taxWithRegime ? taxWithRegime : to;
  const monthlyDiff = activeTo.netMonthly - from.netMonthly;
  const positive = monthlyDiff >= 0;

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      {/* Confidence-Hinweis bei Näherung (Spec §3.3): Punkt + Caption, keine Fläche */}
      {result.isApproximate && (
        <div className="flex items-center gap-2 border-b border-line px-6 py-2.5">
          <StatusDot tone="warn" label={`~ ${t('approximate')}`} />
          <span className="text-caption text-text-3">{t('approximateAssumptions')}</span>
        </div>
      )}

      <div className="space-y-6 p-6">
        {/* Net comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => onCityClick?.(fromCity.slug)}
              className="focus-ring rounded-sm text-caption uppercase tracking-[0.04em] text-text-3 transition-colors hover:text-text hover:underline"
            >
              {fromCity.flag} {fromCity.nameDE}
            </button>
            <p className="text-data-md tabular text-text sm:text-data-xl">
              {formatCurrency(from.netMonthly, fromCity.currency)}
            </p>
            <p className="text-caption text-text-3">{t('netMonthly')}</p>
          </div>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => onCityClick?.(toCity.slug)}
              className="focus-ring rounded-sm text-caption uppercase tracking-[0.04em] text-text-3 transition-colors hover:text-text hover:underline"
            >
              {toCity.flag} {toCity.nameDE}
            </button>
            <p className="text-data-md tabular text-text sm:text-data-xl">
              {!regimeEnabled && result.isApproximate && to.netMonthlyMin && to.netMonthlyMax ? (
                <span>
                  {formatCurrency(to.netMonthlyMin, toCity.currency)}
                  <span className="text-text-3"> – </span>
                  {formatCurrency(to.netMonthlyMax, toCity.currency)}
                </span>
              ) : (
                formatCurrency(activeTo.netMonthly, toCity.currency)
              )}
            </p>
            <p className="text-caption text-text-3">{t('netMonthly')}</p>
          </div>
        </div>

        {/* Regime toggle */}
        {taxWithRegime && onRegimeChange && (
          <RegimeToggle
            regime={taxWithRegime}
            currency={toCity.currency}
            enabled={regimeEnabled}
            onChange={onRegimeChange}
          />
        )}

        {/* Monthly difference — Delta nur als farbiger Text, keine Fläche (Spec §3.1) */}
        <div className="flex items-center justify-between border-t border-line pt-4">
          <span className="text-sm text-text-2">
            {positive ? t('monthlyDifference') : t('monthlyDifferenceLess')}
          </span>
          <span className={cn('text-data-md tabular', positive ? 'text-pos' : 'text-neg')}>
            {positive ? '+' : ''}
            {formatCurrency(monthlyDiff, toCity.currency)}
          </span>
        </div>

        {/* Equivalence salary */}
        {result.equivalenceSalary && (
          <div className="rounded-md bg-surface-sub px-4 py-3 text-sm text-text-2">
            <span>{t('equivalenceSalary')}: </span>
            <span className="tabular text-text">
              {formatCurrency(result.equivalenceSalary, fromCity.currency, 0)}
            </span>
            <span className="mt-0.5 block text-caption text-text-3">
              {t('equivalenceSalaryHint').replace('{city}', fromCity.nameDE)}
            </span>
          </div>
        )}

        {/* Effective tax rates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-caption text-text-3">{t('effectiveTaxRate')} {fromCity.flag}</p>
            <p className="text-data-sm tabular text-text">
              {(from.effectiveRate * 100).toFixed(1)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-caption text-text-3">{t('effectiveTaxRate')} {toCity.flag}</p>
            <p className="text-data-sm tabular text-text">
              {(activeTo.effectiveRate * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {salaryRefinement && (
          <>
            <hr className="border-line" />
            {salaryRefinement}
          </>
        )}

        <p className="border-t border-line pt-3 text-caption text-text-3">
          {t('disclaimer')}
        </p>
      </div>
    </div>
  );
}
