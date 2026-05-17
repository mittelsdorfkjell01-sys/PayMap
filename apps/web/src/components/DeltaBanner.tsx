import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { formatDelta, formatMoney } from "@/lib/utils";
import type { CalculateResponse } from "@/api/calculate";

interface Props {
  result: CalculateResponse;
}

export default function DeltaBanner({ result }: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith("en") ? "en" : "de";
  const { delta } = result;
  const positive = delta.monthly >= 0;

  return (
    <Card>
      <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div
            className={`font-serif text-4xl font-medium ${positive ? "text-positive" : "text-negative"}`}
          >
            {formatDelta(delta.monthly, locale)}
          </div>
          <div className="text-white/50 text-sm mt-1">
            {positive ? t("delta.morePerMonth") : t("delta.lessPerMonth")}
          </div>
        </div>

        <div className="text-right">
          <div className="text-white/60 text-sm">
            <span className="text-white/40">{t("delta.effective")}: </span>
            <span className="font-medium text-white">{delta.effective}%</span>
          </div>
          <div className="text-white/60 text-sm mt-1">
            <span className="text-white/40">{t("delta.perYear")}: </span>
            <span className={`font-serif font-medium ${positive ? "text-positive" : "text-negative"}`}>
              {formatDelta(delta.annual, locale)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
