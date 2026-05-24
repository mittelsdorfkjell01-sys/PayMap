'use client';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/lib/utils';
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
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Badge */}
      {result.isApproximate && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center gap-2">
          <span className="text-amber-600 text-xs font-medium">~ {t('approximate')}</span>
          <span className="text-amber-500 text-xs">{t('approximateAssumptions')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Net comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => onCityClick?.(fromCity.slug)}
              className="text-xs text-gray-500 font-medium uppercase tracking-wide hover:text-gray-800 hover:underline transition-colors"
            >
              {fromCity.flag} {fromCity.nameDE}
            </button>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(from.netMonthly, fromCity.currency)}
            </p>
            <p className="text-xs text-gray-400">{t('netMonthly')}</p>
          </div>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => onCityClick?.(toCity.slug)}
              className="text-xs text-gray-500 font-medium uppercase tracking-wide hover:text-gray-800 hover:underline transition-colors"
            >
              {toCity.flag} {toCity.nameDE}
            </button>
            <p className="text-2xl font-bold text-gray-900">
              {!regimeEnabled && result.isApproximate && to.netMonthlyMin && to.netMonthlyMax ? (
                <span>
                  {formatCurrency(to.netMonthlyMin, toCity.currency)}
                  <span className="text-gray-400 text-lg"> – </span>
                  {formatCurrency(to.netMonthlyMax, toCity.currency)}
                </span>
              ) : (
                formatCurrency(activeTo.netMonthly, toCity.currency)
              )}
            </p>
            <p className="text-xs text-gray-400">{t('netMonthly')}</p>
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

        {/* Monthly difference */}
        <div
          className={`rounded-xl px-4 py-3 flex items-center justify-between ${
            positive ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}
        >
          <span className="text-sm font-medium text-gray-700">
            {positive ? t('monthlyDifference') : t('monthlyDifferenceLess')}
          </span>
          <span className={`text-xl font-bold ${positive ? 'text-green-700' : 'text-red-700'}`}>
            {positive ? '+' : ''}
            {formatCurrency(monthlyDiff, toCity.currency)}
          </span>
        </div>

        {/* Equivalence salary */}
        {result.equivalenceSalary && (
          <div className="text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-3">
            <span className="font-medium">{t('equivalenceSalary')}: </span>
            <span className="font-bold text-gray-900">
              {formatCurrency(result.equivalenceSalary, fromCity.currency, 0)}
            </span>
            <span className="text-gray-400 text-xs block mt-0.5">
              {t('equivalenceSalaryHint').replace('{city}', fromCity.nameDE)}
            </span>
          </div>
        )}

        {/* Effective tax rates */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <p className="text-xs text-gray-500">{t('effectiveTaxRate')} {fromCity.flag}</p>
            <p className="font-semibold text-gray-800">
              {(from.effectiveRate * 100).toFixed(1)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">{t('effectiveTaxRate')} {toCity.flag}</p>
            <p className="font-semibold text-gray-800">
              {(activeTo.effectiveRate * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {salaryRefinement && (
          <>
            <hr className="border-gray-100" />
            {salaryRefinement}
          </>
        )}

        <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
          {t('disclaimer')}
        </p>
      </div>
    </div>
  );
}
