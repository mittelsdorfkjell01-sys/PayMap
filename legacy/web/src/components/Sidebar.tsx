import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  /** Element id on the current page to smooth-scroll to. */
  scrollTo?: string;
  /** Route to navigate to. */
  to?: string;
  active?: boolean;
}

// Primary items jump to sections on the calculator page; secondary items go to
// (placeholder) pages.
const PRIMARY: NavItem[] = [
  { label: "Rechner", scrollTo: "rechner", active: true },
  { label: "Steuern & Sozialabgaben", scrollTo: "steuern" },
  { label: "Lebenshaltungskosten", scrollTo: "lebenshaltung" },
];

const SECONDARY: NavItem[] = [
  { label: "Einstellungen", to: "/einstellungen" },
  { label: "Profil", to: "/profil" },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Item({ item }: { item: NavItem }) {
  const navigate = useNavigate();
  function onClick() {
    if (item.scrollTo) scrollToId(item.scrollTo);
    else if (item.to) navigate(item.to);
  }
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-lg px-6 py-3 text-left text-xl font-light text-navy transition-colors",
        item.active ? "border border-input bg-field" : "hover:bg-field"
      )}
    >
      {item.label}
    </button>
  );
}

export default function Sidebar() {
  return (
    <aside className="flex h-full w-full flex-col rounded-card border border-border bg-card p-6">
      <h2 className="mb-8 px-2 text-base font-light text-navy">Menü</h2>

      <nav className="flex flex-col gap-3">
        {PRIMARY.map((item) => (
          <Item key={item.label} item={item} />
        ))}
      </nav>

      <div className="my-6 h-px bg-border" />

      <nav className="flex flex-col gap-3">
        {SECONDARY.map((item) => (
          <Item key={item.label} item={item} />
        ))}
      </nav>
    </aside>
  );
}
