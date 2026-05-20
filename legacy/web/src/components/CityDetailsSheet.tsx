import { useTranslation } from "react-i18next";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import type { CityTranslated } from "@/api/cities";

const SECTIONS = ["fin", "cost", "sec", "climate", "sport", "social"] as const;

interface Props {
  city: CityTranslated | null;
  open: boolean;
  onClose: () => void;
}

export default function CityDetailsSheet({ city, open, onClose }: Props) {
  const { t } = useTranslation();

  if (!city) return null;

  const visibleSections = SECTIONS.filter((s) => {
    const items = city.details[s];
    return items && items.length > 0;
  });

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-[430px] overflow-y-auto" style={{ maxWidth: "430px" }}>
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2 text-xl font-serif">
            <span>{city.flag}</span>
            <span>{city.name}</span>
            <span className="text-white/40 font-sans text-sm font-normal">{city.country}</span>
          </SheetTitle>
        </SheetHeader>

        {visibleSections.length === 0 ? (
          <p className="text-white/40 text-sm">{t("noData")}</p>
        ) : (
          <Accordion type="multiple" defaultValue={visibleSections.slice(0, 2)} className="w-full">
            {visibleSections.map((section) => (
              <AccordionItem key={section} value={section} className="border-white/10">
                <AccordionTrigger className="text-sm font-medium hover:no-underline text-white/80 hover:text-white">
                  {t(`details.section.${section}`)}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {city.details[section].map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm text-white/60">
                        <span className="text-accent-blue mt-0.5 shrink-0">›</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </SheetContent>
    </Sheet>
  );
}
