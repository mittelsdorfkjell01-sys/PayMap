import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import SalarySlider from "@/components/SalarySlider";
import CityDetailsSheet from "@/components/CityDetailsSheet";
import DeltaBanner from "@/components/DeltaBanner";
import ColTable from "@/components/ColTable";
import TaxBreakdown from "@/components/TaxBreakdown";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { ArrowRight, Info } from "lucide-react";
import { fetchCities, type CityTranslated } from "@/api/cities";
import { calculate, type CalculateResponse } from "@/api/calculate";
import { formatMoney } from "@/lib/utils";

export default function Calculator() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith("en") ? "en" : "de";

  const [gross, setGross] = useState(80000);
  const [homeCities, setHomeCities] = useState<CityTranslated[]>([]);
  const [targetCities, setTargetCities] = useState<CityTranslated[]>([]);
  const [homeSlug, setHomeSlug] = useState<string>("");
  const [targetSlug, setTargetSlug] = useState<string>("");
  const [regimeSlug, setRegimeSlug] = useState<string>("");
  const [result, setResult] = useState<CalculateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const langInitialized = useRef(false);

  const homeCity = homeCities.find((c) => c.slug === homeSlug) ?? null;
  const targetCity = targetCities.find((c) => c.slug === targetSlug) ?? null;

  // Initial load — sets default city selections
  useEffect(() => {
    fetchCities()
      .then(({ homeCities: hc, targetCities: tc }) => {
        setHomeCities(hc);
        setTargetCities(tc);
        const defaultHome = hc[0];
        const defaultTarget = tc[0];
        if (defaultHome) setHomeSlug(defaultHome.slug);
        if (defaultTarget) {
          setTargetSlug(defaultTarget.slug);
          const r = defaultTarget.regimes.find((r) => r.isDefault) ?? defaultTarget.regimes[0];
          if (r) setRegimeSlug(r.slug);
        }
        langInitialized.current = true;
      })
      .catch(() => {
        toast({ variant: "destructive", title: t("error.apiUnavailable") });
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch city translations on language switch (preserves selections)
  useEffect(() => {
    if (!langInitialized.current) return;
    fetchCities()
      .then(({ homeCities: hc, targetCities: tc }) => {
        setHomeCities(hc);
        setTargetCities(tc);
      })
      .catch(() => {});
  }, [i18n.language]);

  // Run calculation
  const runCalc = useCallback(
    (g: number, home: string, target: string, regime: string) => {
      if (!home || !target || !regime) return;
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setCalculating(true);
        try {
          const data = await calculate({ gross: g, homeCitySlug: home, targetCitySlug: target, regimeSlug: regime });
          setResult(data);
        } catch {
          toast({ variant: "destructive", title: t("error.apiUnavailable") });
        } finally {
          setCalculating(false);
        }
      }, 300);
    },
    [t]
  );

  useEffect(() => {
    if (homeSlug && targetSlug && regimeSlug) {
      runCalc(gross, homeSlug, targetSlug, regimeSlug);
    }
  }, [gross, homeSlug, targetSlug, regimeSlug, runCalc]);

  // When target city changes, reset regime
  function handleTargetChange(slug: string) {
    setTargetSlug(slug);
    const city = targetCities.find((c) => c.slug === slug);
    const defaultRegime = city?.regimes.find((r) => r.isDefault) ?? city?.regimes[0];
    if (defaultRegime) setRegimeSlug(defaultRegime.slug);
  }

  const activeTargetRegimes = targetCity?.regimes ?? [];
  const positiveOrZero = (result?.delta.monthly ?? 0) >= 0;

  return (
    <div className="min-h-screen dot-grid">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Salary slider */}
        <Card>
          <CardContent className="p-6">
            <SalarySlider value={gross} onChange={setGross} />
          </CardContent>
        </Card>

        {/* City comparison — 3 column */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
          {/* Home city card */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="text-xs text-white/40 uppercase tracking-wider">{t("city.from")}</div>
              {loading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={homeSlug} onValueChange={setHomeSlug}>
                  <SelectTrigger className="border-white/10 bg-transparent">
                    <SelectValue placeholder={t("city.selectHome")} />
                  </SelectTrigger>
                  <SelectContent>
                    {homeCities.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.flag} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <div className="text-center py-2">
                {calculating || !result ? (
                  <Skeleton className="h-12 w-32 mx-auto" />
                ) : (
                  <>
                    <div className="font-serif text-[40px] font-medium leading-none">
                      {formatMoney(result.home.monthly, locale)}
                    </div>
                    <div className="text-xs text-white/40 mt-1">{t("delta.nettoPerMonth")}</div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Arrow + delta badge */}
          <div className="flex flex-col items-center justify-center gap-2 pt-16">
            <ArrowRight className="h-5 w-5 text-white/20" />
            {result && !calculating && (
              <Badge
                className={`text-xs font-mono ${
                  positiveOrZero
                    ? "bg-positive/10 text-positive border-positive/20"
                    : "bg-negative/10 text-negative border-negative/20"
                } border`}
              >
                {positiveOrZero ? "+" : "−"}{Math.abs(result.delta.percent)}%
              </Badge>
            )}
          </div>

          {/* Target city card */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="text-xs text-white/40 uppercase tracking-wider">{t("city.to")}</div>
              {loading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={targetSlug} onValueChange={handleTargetChange}>
                  <SelectTrigger className="border-white/10 bg-transparent">
                    <SelectValue placeholder={t("city.selectTarget")} />
                  </SelectTrigger>
                  <SelectContent>
                    {targetCities.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.flag} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Regime selector or badge */}
              {activeTargetRegimes.length > 1 ? (
                <Select value={regimeSlug} onValueChange={setRegimeSlug}>
                  <SelectTrigger className="border-white/10 bg-transparent text-xs h-8">
                    <SelectValue placeholder={t("regime.select")} />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTargetRegimes.map((r) => (
                      <SelectItem key={r.slug} value={r.slug}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : activeTargetRegimes.length === 1 ? (
                <Badge variant="outline" className="text-[10px] border-accent-blue/30 text-accent-blue">
                  {activeTargetRegimes[0].label}
                </Badge>
              ) : null}

              <div className="text-center py-2">
                {calculating || !result ? (
                  <Skeleton className="h-12 w-32 mx-auto" />
                ) : (
                  <>
                    <div className="font-serif text-[40px] font-medium leading-none">
                      {formatMoney(result.target.monthly, locale)}
                    </div>
                    <div className="text-xs text-white/40 mt-1">{t("delta.nettoPerMonth")}</div>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-xs"
                onClick={() => setDetailsOpen(true)}
                disabled={!targetCity}
              >
                <Info className="h-3 w-3 mr-1.5" />
                {t("city.details")}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Delta banner */}
        {result && !calculating && (
          <DeltaBanner result={result} />
        )}
        {!result && loading && (
          <Skeleton className="h-24 w-full rounded-lg" />
        )}

        {/* Cost of Living table */}
        {result && homeCity && targetCity && (
          <ColTable result={result} homeCity={homeCity} targetCity={targetCity} />
        )}

        {/* Tax breakdown */}
        {result && homeCity && targetCity && (
          <TaxBreakdown
            result={result}
            gross={gross}
            homeCity={homeCity}
            targetCity={targetCity}
            regimeSlug={regimeSlug}
          />
        )}
      </main>

      {/* City details sheet */}
      <CityDetailsSheet
        city={targetCity}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
    </div>
  );
}
