import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/client";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";
import { LogOut, Save, AlertTriangle } from "lucide-react";

type CountryOpt = { slug: string; nameDE: string; years: number[] };
interface Tables {
  country: { slug: string; nameDE: string };
  year: number;
  regions: string[];
  brackets: unknown[];
  social: unknown[];
  deductions: unknown[];
  surcharges: unknown[];
  fixedAmounts: unknown[];
}

const SECTIONS = [
  { key: "brackets", label: "Steuerstufen — TaxBracket", rows: 14 },
  { key: "social", label: "Sozialabgaben — SocialContribution", rows: 8 },
  { key: "deductions", label: "Abzüge — Deduction", rows: 8 },
  { key: "surcharges", label: "Zuschläge — Surcharge", rows: 10 },
  { key: "fixedAmounts", label: "Festbeträge — FixedAmount", rows: 8 },
] as const;
type SecKey = (typeof SECTIONS)[number]["key"];

const emptyDrafts = (): Record<SecKey, string> => ({
  brackets: "", social: "", deductions: "", surcharges: "", fixedAmounts: "",
});

export default function AdminTax() {
  const navigate = useNavigate();
  const [countries, setCountries] = useState<CountryOpt[]>([]);
  const [country, setCountry] = useState("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [tables, setTables] = useState<Tables | null>(null);
  const [drafts, setDrafts] = useState<Record<SecKey, string>>(emptyDrafts());
  const [jsonErr, setJsonErr] = useState<Record<SecKey, boolean>>({} as Record<SecKey, boolean>);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    api
      .get<CountryOpt[]>("/api/admin/tax-tables/countries")
      .then((r) => {
        setCountries(r.data);
        if (r.data[0]) {
          setCountry(r.data[0].slug);
          setYear(r.data[0].years[0] ?? new Date().getFullYear());
        }
      })
      .catch(() => setMsg({ kind: "err", text: "Länder konnten nicht geladen werden (API auf :3001? eingeloggt?)." }));
  }, []);

  const yearsForCountry = countries.find((c) => c.slug === country)?.years ?? [];

  function load() {
    if (!country || !Number.isInteger(year)) return;
    setLoading(true);
    setMsg(null);
    api
      .get<Tables>(`/api/admin/tax-tables/${country}/${year}`)
      .then((r) => {
        setTables(r.data);
        setDrafts({
          brackets: JSON.stringify(r.data.brackets, null, 2),
          social: JSON.stringify(r.data.social, null, 2),
          deductions: JSON.stringify(r.data.deductions, null, 2),
          surcharges: JSON.stringify(r.data.surcharges, null, 2),
          fixedAmounts: JSON.stringify(r.data.fixedAmounts, null, 2),
        });
        setJsonErr({} as Record<SecKey, boolean>);
      })
      .catch(() => setMsg({ kind: "err", text: "Tabellen konnten nicht geladen werden." }))
      .finally(() => setLoading(false));
  }

  // (re)load whenever country or year changes
  useEffect(load, [country, year]);

  function edit(key: SecKey, value: string) {
    setDrafts((p) => ({ ...p, [key]: value }));
    let bad = false;
    try { JSON.parse(value); } catch { bad = true; }
    setJsonErr((p) => ({ ...p, [key]: bad }));
  }

  async function save() {
    const body: Record<SecKey, unknown> = {} as Record<SecKey, unknown>;
    for (const { key } of SECTIONS) {
      try { body[key] = JSON.parse(drafts[key]); }
      catch { setMsg({ kind: "err", text: `Ungültiges JSON in „${key}".` }); return; }
    }
    setSaving(true);
    setMsg(null);
    try {
      const r = await api.put<{ ok: boolean; counts: Record<string, number> }>(
        `/api/admin/tax-tables/${country}/${year}`,
        body,
      );
      setMsg({ kind: "ok", text: `Gespeichert ✓ — ${JSON.stringify(r.data.counts)}` });
      load();
    } catch (e) {
      const err = e as { response?: { data?: { error?: string } } };
      setMsg({ kind: "err", text: `Fehler: ${err.response?.data?.error ?? "Speichern fehlgeschlagen"}` });
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    sessionStorage.removeItem("paymap_token");
    navigate("/admin/login");
  }

  const anyErr = SECTIONS.some((s) => jsonErr[s.key]);
  const selectCls = "h-10 rounded-lg border border-input bg-field px-3 text-sm font-light text-navy";

  return (
    <div className="min-h-screen bg-background px-4 py-6 lg:px-10">
      <div className="mx-auto max-w-[1000px]">
        <Header />
        <div className="mt-8 flex items-center justify-between">
          <h1 className="text-xl font-medium text-navy">Steuertabellen-Admin</h1>
          <div className="flex gap-2">
            <button onClick={() => navigate("/admin/cities")} className="rounded-md border border-input px-3 py-1.5 text-xs font-light text-navy/70 hover:text-navy">
              Städte
            </button>
            <button onClick={logout} className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-light text-navy/50 hover:text-navy">
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-sm font-light text-amber-700">
            Änderungen wirken sofort auf die Berechnung (loadTaxData). Speichern ersetzt alle Zeilen für das gewählte
            Land + Jahr. Regionen werden per Slug referenziert.
          </p>
        </div>

        {/* selectors */}
        <div className="mt-5 flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="px-1 text-[13px] font-light text-navy">Land</span>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className={selectCls}>
              {countries.map((c) => (
                <option key={c.slug} value={c.slug}>{c.nameDE} ({c.slug})</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="px-1 text-[13px] font-light text-navy">Jahr</span>
            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className={cn(selectCls, "w-28")} />
          </label>
          {yearsForCountry.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="px-1 text-[13px] font-light text-navy/60">Vorhandene Jahre</span>
              <div className="flex gap-1.5">
                {yearsForCountry.map((y) => (
                  <button key={y} onClick={() => setYear(y)} className={cn("rounded-md border px-2.5 py-1.5 text-xs", y === year ? "border-navy bg-navy/5 text-navy" : "border-input text-navy/60 hover:text-navy")}>
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {tables && tables.regions.length > 0 && (
          <p className="mt-3 text-xs font-light text-navy/60">
            Regionen-Slugs für dieses Land: {tables.regions.join(", ")}
          </p>
        )}

        {msg && (
          <p className={cn("mt-4 text-sm", msg.kind === "ok" ? "text-positive" : "text-negative")}>{msg.text}</p>
        )}

        {/* editors */}
        <div className="mt-6 space-y-5">
          {loading ? (
            <p className="text-sm font-light text-navy/60">Lade…</p>
          ) : (
            SECTIONS.map((s) => (
              <div key={s.key} className="rounded-card border border-border bg-card p-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-navy">{s.label}</span>
                  {jsonErr[s.key] && <span className="text-xs text-negative">Ungültiges JSON</span>}
                </div>
                <textarea
                  value={drafts[s.key]}
                  onChange={(e) => edit(s.key, e.target.value)}
                  rows={s.rows}
                  spellCheck={false}
                  className={cn(
                    "w-full resize-y rounded-lg border bg-field p-3 font-mono text-xs text-navy",
                    jsonErr[s.key] ? "border-negative" : "border-input",
                  )}
                />
              </div>
            ))
          )}
        </div>

        <button
          onClick={save}
          disabled={saving || loading || anyErr || !country}
          className="mt-6 flex items-center gap-2 rounded-lg bg-navy px-8 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> {saving ? "Speichere…" : `Speichern (${country} ${year})`}
        </button>
      </div>
    </div>
  );
}
