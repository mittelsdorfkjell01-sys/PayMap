import { useTranslation } from "react-i18next";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils";
import type { CalculateResponse } from "@/api/calculate";
import type { CityTranslated } from "@/api/cities";

interface Props {
  result: CalculateResponse;
  homeCity: CityTranslated;
  targetCity: CityTranslated;
}

export default function ColTable({ result, homeCity, targetCity }: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith("en") ? "en" : "de";
  const { col } = result;

  if (!col.home || !col.target) return null;

  const rows = [
    { key: "rent", labelKey: "col.rent", home: col.home.rent, target: col.target.rent },
    { key: "food", labelKey: "col.food", home: col.home.food, target: col.target.food },
    { key: "transport", labelKey: "col.transport", home: col.home.transport, target: col.target.transport },
    { key: "total", labelKey: "col.total", home: col.home.total, target: col.target.total, isTotal: true },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-white/80">{t("col.title")}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead className="text-white/40 text-xs">{t("col.rent")}</TableHead>
              <TableHead className="text-white/40 text-xs">{homeCity.flag} {homeCity.name}</TableHead>
              <TableHead className="text-white/40 text-xs">{targetCity.flag} {targetCity.name}</TableHead>
              <TableHead className="text-white/40 text-xs">{t("col.difference")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const diff = row.target - row.home;
              const positive = diff <= 0;
              return (
                <TableRow
                  key={row.key}
                  className={`border-white/05 ${row.isTotal ? "border-t border-white/10" : ""}`}
                >
                  <TableCell className={`text-sm ${row.isTotal ? "font-medium text-white" : "text-white/60"}`}>
                    {t(row.labelKey)}
                  </TableCell>
                  <TableCell className="text-sm font-mono text-white/70">
                    {formatMoney(row.home, locale)}
                  </TableCell>
                  <TableCell className="text-sm font-mono text-white/70">
                    {formatMoney(row.target, locale)}
                  </TableCell>
                  <TableCell
                    className={`text-sm font-mono font-medium ${positive ? "text-positive" : "text-negative"}`}
                  >
                    {diff === 0 ? "—" : (diff > 0 ? "+" : "−") + formatMoney(Math.abs(diff), locale).replace(/^[−+]?/, "")}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
