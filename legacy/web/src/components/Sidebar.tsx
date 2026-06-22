import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  active?: boolean;
}

const PRIMARY: NavItem[] = [
  { label: "Rechner", active: true },
  { label: "Steuern & Sozialabgaben" },
  { label: "Lebenshaltungskosten" },
];

const SECONDARY: NavItem[] = [{ label: "Einstellungen" }, { label: "Profil" }];

function Item({ item }: { item: NavItem }) {
  return (
    <button
      className={cn(
        "w-full rounded-lg px-6 py-3 text-left text-xl font-light text-navy transition-colors",
        item.active
          ? "border border-input bg-field"
          : "hover:bg-field"
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
