import { useTranslation } from "react-i18next";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";

interface Props {
  value: number;
  onChange: (v: number) => void;
}

const QUICK = [50000, 60000, 70000, 80000, 100000, 120000, 150000];

export default function SalarySlider({ value, onChange }: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith("en") ? "en" : "de";

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <div className="font-serif text-[26px] font-medium tracking-tight">
          {formatNumber(value, locale)} €
        </div>
        <div className="text-xs text-white/40 mt-0.5">{t("salary.label")} {t("salary.perYear")}</div>
      </div>

      <Slider
        min={30000}
        max={250000}
        step={5000}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />

      <div className="flex flex-wrap gap-2 justify-center">
        {QUICK.map((q) => (
          <Button
            key={q}
            variant="outline"
            size="sm"
            onClick={() => onChange(q)}
            className={`text-xs h-7 px-3 border-white/10 hover:bg-white/10 ${
              value === q ? "bg-white/10 border-white/30 text-white" : "text-white/50"
            }`}
          >
            {q / 1000}k
          </Button>
        ))}
      </div>
    </div>
  );
}
