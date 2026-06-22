import { useNavigate } from "react-router-dom";
import i18n from "@/i18n";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { key: "calculator", label: "Calculator", to: "/" },
  { key: "ranking", label: "Ranking", to: "/ranking" },
  { key: "guide", label: "Guide", to: "/guide" },
] as const;

export default function Header({ active = "calculator" }: { active?: string }) {
  const navigate = useNavigate();

  function toggleLang() {
    const next = i18n.language?.startsWith("en") ? "de" : "en";
    i18n.changeLanguage(next);
  }
  const currentLang = i18n.language?.startsWith("en") ? "en" : "de";

  return (
    <header className="sticky top-0 z-40 flex h-[54px] items-center justify-between rounded-2xl border-b border-border bg-card px-5 shadow-header">
      {/* Brand */}
      <div
        className="flex cursor-pointer select-none items-center gap-3"
        onClick={() => navigate("/")}
      >
        <img src="/figma/globe.png" alt="" className="h-10 w-10 object-contain" />
        <span className="text-2xl font-light tracking-tight text-navy">CostofLiving</span>
      </div>

      {/* Center nav */}
      <nav className="flex items-center gap-12">
        {NAV.map((item) => {
          const isActive = item.key === active;
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.to)}
              className={cn(
                "relative text-xl transition-colors",
                isActive ? "text-accent-blue" : "text-navy hover:text-accent-blue"
              )}
            >
              {item.label}
              {isActive && (
                <span className="absolute -bottom-3 left-0 h-px w-full bg-accent-blue" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right: lang toggle + profile */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleLang}
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-navy"
        >
          <span className={currentLang === "de" ? "text-navy" : ""}>DE</span>
          <span className="mx-1 text-muted-foreground/50">/</span>
          <span className={currentLang === "en" ? "text-navy" : ""}>EN</span>
        </button>
        <button
          onClick={() => navigate("/profil")}
          className="flex h-7 w-7 items-center justify-center rounded-full text-navy transition-colors hover:bg-field"
        >
          <User className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
