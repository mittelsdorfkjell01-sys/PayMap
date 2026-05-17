import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import i18n from "@/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = location.pathname.startsWith("/admin");

  function toggleLang() {
    const next = i18n.language?.startsWith("en") ? "de" : "en";
    i18n.changeLanguage(next);
  }

  const currentLang = i18n.language?.startsWith("en") ? "en" : "de";

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-6 py-3 border-b"
      style={{ backgroundColor: "#080B12", borderColor: "rgba(255,255,255,0.08)" }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2 cursor-pointer select-none"
        onClick={() => navigate("/")}
      >
        <span className="font-serif text-xl font-semibold tracking-tight">
          pay<span className="text-accent-blue">map</span>
        </span>
        <Badge
          variant="outline"
          className="text-[10px] px-1.5 py-0 border-white/20 text-white/40"
        >
          {t("app.beta")}
        </Badge>
      </div>

      {/* Center: tabs (only on public pages) */}
      {!isAdmin && (
        <Tabs value="calculator">
          <TabsList className="bg-transparent gap-1">
            <TabsTrigger
              value="calculator"
              className="text-sm data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60"
            >
              {t("tab.calculator")}
            </TabsTrigger>
            <TabsTrigger value="workation" disabled className="text-sm text-white/30">
              {t("tab.workation")}
            </TabsTrigger>
            <TabsTrigger value="ranking" disabled className="text-sm text-white/30">
              {t("tab.ranking")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Right: lang toggle */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLang}
          className={`text-xs px-2 h-7 ${currentLang === "de" ? "text-white" : "text-white/40"}`}
        >
          DE
        </Button>
        <span className="text-white/20 text-xs">/</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLang}
          className={`text-xs px-2 h-7 ${currentLang === "en" ? "text-white" : "text-white/40"}`}
        >
          EN
        </Button>
      </div>
    </header>
  );
}
