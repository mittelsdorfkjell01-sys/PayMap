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
    <div className="bg-white border border-border/60 rounded-xl overflow-hidden">
      {/* Badge */}
      {result.isApproximate && (
        <div className="bg-muted/50 border-b border-border/40 px-5 py-2.5 flex items-center gap-2">
          <span className="text-muted-foreground text-xs font-light">~ {t('approximate')}</span>
          <span className="text-muted-foreground/70 text-xs font-light">{t('approximateAssumptions')}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Net comparison */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => onCityClick?.(fromCity.slug)}
              className="text-xs font-light text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
            >
              {fromCity.flag} {fromCity.nameDE}
            </button>
            <p className="text-2xl font-normal tracking-tight text-foreground">
              {formatCurrency(from.netMonthly, fromCity.currency)}
            </p>
            <p className="text-xs font-light text-muted-foreground/70">{t('netMonthly')}</p>
          </div>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => onCityClick?.(toCity.slug)}
              className="text-xs font-light text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
            >
              {toCity.flag} {toCity.nameDE}
            </button>
            <p className="text-2xl font-normal tracking-tight text-foreground">
              {!regimeEnabled && result.isApproximate && to.netMonthlyMin && to.netMonthlyMax ? (
                <span>
                  {formatCurrency(to.netMonthlyMin, toCity.currency)}
                  <span className="text-muted-foreground/50 text-lg font-light"> – </span>
                  {formatCurrency(to.netMonthlyMax, toCity.currency)}
                </span>
              ) : (
                formatCurrency(activeTo.netMonthly, toCity.currency)
              )}
            </p>
            <p className="text-xs font-light text-muted-foreground/70">{t('netMonthly')}</p>
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
          className={`rounded-lg px-5 py-4 flex items-center justify-between border ${
            positive ? 'bg-primary-light/30 border-primary/20' : 'bg-error-light border-error/20'
          }`}
        >
          <span className="text-sm font-light text-foreground">
            {positive ? t('monthlyDifference') : t('monthlyDifferenceLess')}
          </span>
          <span className={`text-xl font-normal tracking-tight ${positive ? 'text-primary' : 'text-error'}`}>
            {positive ? '+' : ''}
            {formatCurrency(monthlyDiff, toCity.currency)}
          </span>
        </div>

        {/* Equivalence salary */}
        {result.equivalenceSalary && (
          <div className="text-sm font-light text-foreground bg-muted/30 rounded-lg px-5 py-4 border border-border/30">
            <span>{t('equivalenceSalary')}: </span>
            <span className="font-normal">
              {formatCurrency(result.equivalenceSalary, fromCity.currency, 0)}
            </span>
            <span className="text-muted-foreground text-xs block mt-1 font-light">
              {t('equivalenceSalaryHint').replace('{city}', fromCity.nameDE)}
            </span>
          </div>
        )}

        {/* Effective tax rates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-light text-muted-foreground">{t('effectiveTaxRate')} {fromCity.flag}</p>
            <p className="text-lg font-normal text-foreground">
              {(from.effectiveRate * 100).toFixed(1)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-light text-muted-foreground">{t('effectiveTaxRate')} {toCity.flag}</p>
            <p className="text-lg font-normal text-foreground">
              {(activeTo.effectiveRate * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {salaryRefinement && (
          <>
            <div className="h-px bg-border/40" />
            {salaryRefinement}
          </>
        )}

        <p className="text-xs font-light text-muted-foreground/70 border-t border-border/40 pt-4">
          {t('disclaimer')}
        </p>
      </div>
    </div>
  );
}
