import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/lib/utils";
import type { CalculateResponse } from "@/api/calculate";
import type { CityTranslated } from "@/api/cities";

interface Props {
  result: CalculateResponse;
  gross: number;
  homeCity: CityTranslated;
  targetCity: CityTranslated;
  regimeSlug: string;
}

export default function TaxBreakdown({ result, gross, homeCity, targetCity, regimeSlug }: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith("en") ? "en" : "de";
  const isEN = locale === "en";

  const activeRegime = targetCity.regimes.find((r) => r.slug === regimeSlug);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-white/80">{t("tax.title")}</CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Home side */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span>{homeCity.flag}</span>
            <span className="text-sm font-medium text-white/80">{homeCity.name}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/40">{t("tax.gross")}</span>
              <span className="font-mono text-white/70">{formatMoney(gross, locale)}</span>
            </div>
            <Separator className="bg-white/10" />
            {result.home.breakdown.map((item) => (
              <div key={item.slug} className="flex justify-between text-sm">
                <span className="text-white/50">{isEN ? item.labelEn : item.labelDe}</span>
                <span className="font-mono text-negative">−{formatMoney(item.amount, locale).replace(/^[−+]?/, "")}</span>
              </div>
            ))}
            <Separator className="bg-white/10" />
            <div className="flex justify-between text-sm font-medium">
              <span className="text-white">{t("tax.netto")}</span>
              <span className="font-serif font-medium text-white">{formatMoney(result.home.netto, locale)}</span>
            </div>
          </div>
        </div>

        {/* Target side */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span>{targetCity.flag}</span>
            <span className="text-sm font-medium text-white/80">{targetCity.name}</span>
            {activeRegime && (
              <Badge variant="outline" className="text-[10px] border-accent-blue/40 text-accent-blue px-1.5">
                {activeRegime.label}
              </Badge>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/40">{t("tax.gross")}</span>
              <span className="font-mono text-white/70">{formatMoney(gross, locale)}</span>
            </div>
            <Separator className="bg-white/10" />
            {result.target.breakdown.map((item) => (
              <div key={item.slug} className="flex justify-between text-sm">
                <span className="text-white/50">{isEN ? item.labelEn : item.labelDe}</span>
                <span className="font-mono text-negative">−{formatMoney(item.amount, locale).replace(/^[−+]?/, "")}</span>
              </div>
            ))}
            <Separator className="bg-white/10" />
            <div className="flex justify-between text-sm font-medium">
              <span className="text-white">{t("tax.netto")}</span>
              <span className="font-serif font-medium text-white">{formatMoney(result.target.netto, locale)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
