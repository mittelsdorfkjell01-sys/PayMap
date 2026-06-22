import { useEffect, useMemo, useState, type ReactNode } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import DonutChart from "@/components/DonutChart";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { cn, formatMoney } from "@/lib/utils";
import { fetchCities, type City } from "@/api/cities";
import { calculate, type CalcSide, type CalculateResponse, type InsuranceOverrides } from "@/api/calculate";

const LOCALE = "de";
const eur = (n: number) => formatMoney(n, LOCALE);

/* Insurance branches the user can enter (monthly €). Keys match the engine. */
const INS_BRANCHES = [
  { key: "health", label: "Krankenversicherung" },
  { key: "care", label: "Pflegeversicherung" },
  { key: "pension", label: "Rentenversicherung" },
  { key: "unemployment", label: "Arbeitslosenversicherung" },
] as const;
type InsKey = (typeof INS_BRANCHES)[number]["key"];
type InsState = Record<InsKey, string>;
const EMPTY_INS: InsState = { health: "", care: "", pension: "", unemployment: "" };

const COL_ROWS: { key: string; label: string }[] = [
  { key: "rent_cold_1br", label: "Miete (kalt)" },
  { key: "groceries_monthly", label: "Lebensmittel" },
  { key: "transport_monthly", label: "ÖPNV" },
  { key: "internet_monthly", label: "Internet" },
  { key: "utilities_monthly", label: "Strom/Wasser/Gas" },
  { key: "other_monthly", label: "Sonstiges" },
];

function Field({ label, children, className }: { label?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && <span className="px-1 text-sm font-light text-navy">{label}</span>}
      {children}
    </div>
  );
}

function CitySelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: City[];
  onChange: (slug: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[51px] w-full appearance-none rounded-lg border border-input bg-field px-4 text-sm font-light text-navy"
      >
        {options.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.flag} {c.nameDE}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/60" />
    </div>
  );
}

function CityHeader({ flag, city, country }: { flag: string; city: string; country: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-card px-3 py-2 shadow-sm">
      <span className="text-lg leading-none">{flag}</span>
      <div className="leading-tight">
        <div className="text-base font-light text-navy">{city}</div>
        <div className="text-[13px] font-light text-navy/70">{country}</div>
      </div>
    </div>
  );
}

export default function Calculator() {
  const [homeCities, setHomeCities] = useState<City[]>([]);
  const [targetCities, setTargetCities] = useState<City[]>([]);
  const [homeSlug, setHomeSlug] = useState("berlin");
  const [targetSlug, setTargetSlug] = useState("porto");

  const [gross, setGross] = useState(66000);
  const [children, setChildren] = useState(0);
  const [familyStatus, setFamilyStatus] = useState<"single" | "married" | "divorced">("single");
  const [employment, setEmployment] = useState<"employed" | "freelancer" | "founder" | "passive">("employed");
  const [kvType, setKvType] = useState<"statutory" | "private">("statutory");
  // IFICI on by default for Portugal targets (its main draw): 20% flat on
  // qualifying income. The engine applies it via specialRegimeId "ifici".
  const [regimeOn, setRegimeOn] = useState(true);

  // Insurance: approx = use the auto-computed amounts (no override); manual edits
  // turn an explicit override on for that branch (deducted from gross).
  const [insOpen, setInsOpen] = useState(false);
  const [approxInsurance, setApproxInsurance] = useState(true);
  const [ins, setIns] = useState<InsState>(EMPTY_INS);

  const [result, setResult] = useState<CalculateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build the override payload from the entered (non-empty) fields, but only
  // when the user opted out of "approximate" — otherwise the backend uses the
  // automatic rate-based amounts.
  const insuranceOverrides = useMemo<InsuranceOverrides | undefined>(() => {
    if (approxInsurance) return undefined;
    const ov: InsuranceOverrides = {};
    for (const { key } of INS_BRANCHES) {
      const v = parseFloat(ins[key]);
      if (!Number.isNaN(v)) ov[key] = v;
    }
    return Object.keys(ov).length > 0 ? ov : undefined;
  }, [approxInsurance, ins]);

  useEffect(() => {
    fetchCities()
      .then((r) => {
        setHomeCities(r.homeCities);
        setTargetCities(r.targetCities);
      })
      .catch(() => setError("Städte konnten nicht geladen werden."));
  }, []);

  async function runCalc() {
    setLoading(true);
    setError(null);
    try {
      const res = await calculate({
        gross,
        homeCitySlug: homeSlug,
        targetCitySlug: targetSlug,
        year: 2026,
        employment,
        familyStatus,
        children,
        kvType,
        insuranceOverrides,
        specialRegimeId: regimeOn ? "ifici" : undefined,
      });
      setResult(res);
      // When in "approximate" mode, mirror the auto amounts into the fields so
      // the user sees realistic monthly numbers they can then tweak.
      if (approxInsurance) {
        const s = res.home.social;
        setIns({
          health: String(Math.round(s.health / 12)),
          care: String(Math.round(s.care / 12)),
          pension: String(Math.round(s.pension / 12)),
          unemployment: String(Math.round(s.unemployment / 12)),
        });
      }
    } catch {
      setError("Berechnung fehlgeschlagen. Läuft das Backend auf :3001?");
    } finally {
      setLoading(false);
    }
  }

  // Initial calculation once cities are known.
  useEffect(() => {
    if (homeCities.length && targetCities.length) runCalc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeCities.length, targetCities.length]);

  function editInsurance(key: InsKey, value: string) {
    setApproxInsurance(false);
    setIns((prev) => ({ ...prev, [key]: value }));
  }

  function toggleApprox(on: boolean) {
    setApproxInsurance(on);
    if (on && result) {
      const s = result.home.social;
      setIns({
        health: String(Math.round(s.health / 12)),
        care: String(Math.round(s.care / 12)),
        pension: String(Math.round(s.pension / 12)),
        unemployment: String(Math.round(s.unemployment / 12)),
      });
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <Header active="calculator" />
        <div className="mt-8 flex gap-8">
          <div className="hidden w-[300px] shrink-0 lg:block">
            <Sidebar />
          </div>

          <main className="flex-1 space-y-8">
            {/* Hero */}
            <div className="mb-6">
              <div className="mb-2 text-base font-light text-navy">Rechner / Nettovergleichsrechner</div>
              <h1 className="text-5xl font-medium leading-tight text-navy">
                Vergleiche Städte. <span className="text-accent-blue">Prüfe Kosten.</span>
              </h1>
            </div>

            {/* Input card */}
            <section className="rounded-card border border-border bg-card p-8">
              <div className="grid grid-cols-2 gap-8">
                <Field label="Heimstadt">
                  <CitySelect value={homeSlug} options={homeCities} onChange={setHomeSlug} />
                </Field>
                <Field label="Zielstadt">
                  <CitySelect value={targetSlug} options={targetCities} onChange={setTargetSlug} />
                </Field>
              </div>

              {/* Salary */}
              <div className="mt-6">
                <div className="flex h-[51px] items-center justify-between rounded-lg border border-input bg-field px-4">
                  <span className="text-base font-light text-navy">{gross.toLocaleString("de-DE")}</span>
                  <span className="text-sm font-light text-navy">€ / Jahr</span>
                </div>
                <div className="mt-3">
                  <Slider
                    value={[gross]}
                    min={20000}
                    max={500000}
                    step={1000}
                    onValueChange={(v) => setGross(v[0])}
                  />
                  <div className="mt-2 flex justify-between text-xs font-light text-navy">
                    <span>20.000 €</span>
                    <span>500.000 €</span>
                  </div>
                </div>
              </div>

              {/* Kinder + dropdowns */}
              <div className="mt-6 grid grid-cols-4 gap-4">
                <Field label="Kinder">
                  <div className="flex h-[51px] items-center justify-between rounded-lg border border-input bg-field px-4">
                    <button className="text-navy/70 hover:text-navy" onClick={() => setChildren((c) => Math.max(0, c - 1))}>
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-base font-light text-navy">{children}</span>
                    <button className="text-navy/70 hover:text-navy" onClick={() => setChildren((c) => c + 1)}>
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </Field>
                <Field label="Beschäftigung">
                  <select
                    value={employment}
                    onChange={(e) => setEmployment(e.target.value as typeof employment)}
                    className="h-[51px] w-full appearance-none rounded-lg border border-input bg-field px-4 text-sm font-light text-navy"
                  >
                    <option value="employed">Angestellt</option>
                    <option value="freelancer">Freiberuflich</option>
                    <option value="founder">Gründer</option>
                    <option value="passive">Passiv</option>
                  </select>
                </Field>
                <Field label="Status">
                  <select
                    value={familyStatus}
                    onChange={(e) => setFamilyStatus(e.target.value as typeof familyStatus)}
                    className="h-[51px] w-full appearance-none rounded-lg border border-input bg-field px-4 text-sm font-light text-navy"
                  >
                    <option value="single">Ledig</option>
                    <option value="married">Verheiratet</option>
                    <option value="divorced">Geschieden</option>
                  </select>
                </Field>
                <Field label="KV-Typ">
                  <select
                    value={kvType}
                    onChange={(e) => setKvType(e.target.value as typeof kvType)}
                    className="h-[51px] w-full appearance-none rounded-lg border border-input bg-field px-4 text-sm font-light text-navy"
                  >
                    <option value="statutory">Gesetzlich</option>
                    <option value="private">Privat</option>
                  </select>
                </Field>
              </div>

              {/* Versicherung accordion — entered values are deducted from gross */}
              <div className="mt-6 rounded-lg border border-input bg-field">
                <button
                  className="flex w-full items-center justify-between px-4 py-3"
                  onClick={() => setInsOpen((o) => !o)}
                >
                  <span className="text-sm font-light text-navy">Versicherung (Beiträge)</span>
                  <ChevronDown className={cn("h-4 w-4 text-navy/60 transition-transform", insOpen && "rotate-180")} />
                </button>
                {insOpen && (
                  <div className="space-y-3 px-4 pb-4">
                    {INS_BRANCHES.map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between gap-4">
                        <span className="text-sm font-light text-navy">{label}</span>
                        <div className="relative w-36">
                          <Input
                            type="number"
                            inputMode="decimal"
                            value={ins[key]}
                            onChange={(e) => editInsurance(key, e.target.value)}
                            className="h-10 bg-card pr-7 text-right"
                          />
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-navy/60">
                            €
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-3 pt-1">
                      <Switch checked={approxInsurance} onCheckedChange={toggleApprox} />
                      <span className="text-sm font-light text-navy">Ungefähre Werte übernehmen</span>
                    </div>
                    <p className="text-xs font-light text-navy/60">
                      Eingetragene Beiträge (€/Monat) werden vom Brutto abgezogen. Toggle an = automatische
                      Richtwerte; eigene Eingabe überschreibt den jeweiligen Wert.
                    </p>
                  </div>
                )}
              </div>

              {/* Regime + submit */}
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch checked={regimeOn} onCheckedChange={setRegimeOn} />
                  <span className="text-sm font-light text-navy">Regime IFICI</span>
                </div>
                <button
                  className="rounded-lg bg-navy px-12 py-3 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                  onClick={runCalc}
                  disabled={loading}
                >
                  {loading ? "Berechne…" : "Berechnen"}
                </button>
              </div>
              {error && <p className="mt-4 text-sm text-negative">{error}</p>}
            </section>

            {/* Results */}
            {result && (
              <>
                <section className="rounded-card border border-border bg-card p-8">
                  <div className="grid grid-cols-2 gap-8">
                    <TaxColumn side={result.home} gross={gross} cities={homeCities} />
                    <TaxColumn side={result.target} gross={gross} cities={targetCities} />
                  </div>
                </section>

                <CostOfLivingSection result={result} homeCities={homeCities} targetCities={targetCities} />

                <DifferenceSection result={result} />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function cityMeta(slug: string, cities: City[]) {
  const c = cities.find((x) => x.slug === slug);
  return { flag: c?.flag ?? "🏳️", name: c?.nameDE ?? slug, country: c?.countryDE ?? "" };
}

function TaxColumn({ side, gross, cities }: { side: CalcSide; gross: number; cities: City[] }) {
  const meta = cityMeta(side.slug, cities);
  const bruttoMonthly = gross / 12;
  const abgabenMonthly = Math.max(0, bruttoMonthly - side.netMonthly);
  const taxMonthly = abgabenMonthly - side.social.total / 12;

  const deductions = side.breakdown.filter((l) => l.isDeduction && Math.round(l.amount) !== 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border p-5">
        <div className="mb-4">
          <CityHeader flag={meta.flag} city={meta.name} country={meta.country} />
        </div>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[13px] font-light text-navy">Netto / Monat</div>
            <div className="text-4xl font-light text-navy">{eur(side.netMonthly)}</div>
          </div>
          <span className="pt-2 text-base font-light text-navy">{Math.round(side.effectiveRate * 100)} %</span>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <div className="flex justify-between text-sm font-light text-navy">
            <span>Brutto / Monat</span>
            <span>{eur(bruttoMonthly)}</span>
          </div>
          <div className="h-px bg-border" />
          {deductions.map((l, i) => (
            <div key={i} className="flex justify-between text-sm font-light text-navy">
              <span>{l.label}</span>
              <span>{eur(l.amount / 12)}</span>
            </div>
          ))}
          <div className="h-px bg-border" />
          <div className="flex justify-between text-sm font-medium text-navy">
            <span>Effektive Abgaben</span>
            <span>{eur(abgabenMonthly)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 rounded-lg border border-border p-5">
        <DonutChart
          segments={[
            { value: Math.max(0, side.social.total / 12), color: "#ffbb33" },
            { value: Math.max(0, taxMonthly), color: "#0096c7" },
          ]}
          centerLabel={`${Math.round(side.effectiveRate * 100)}%`}
        />
        <div className="flex flex-col gap-3">
          <Legend color="#ffbb33" label="Versicherung / Sozial" />
          <Legend color="#0096c7" label="Steuern" />
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
      <span className="text-sm font-light text-navy">{label}</span>
    </div>
  );
}

function colTotal(col: Record<string, number>) {
  return COL_ROWS.reduce((s, r) => s + (col[r.key] ?? 0), 0);
}

function CostOfLivingSection({
  result,
  homeCities,
  targetCities,
}: {
  result: CalculateResponse;
  homeCities: City[];
  targetCities: City[];
}) {
  const home = cityMeta(result.home.slug, homeCities);
  const target = cityMeta(result.target.slug, targetCities);
  const homeTotal = colTotal(result.home.col);
  const targetTotal = colTotal(result.target.col);

  return (
    <section className="rounded-card border border-border bg-card p-8">
      <div className="mb-4 grid grid-cols-2 gap-8">
        <CityHeader flag={home.flag} city={home.name} country={home.country} />
        <CityHeader flag={target.flag} city={target.name} country={target.country} />
      </div>
      <div className="grid grid-cols-2 gap-8">
        {[result.home, result.target].map((side, idx) => (
          <div key={idx} className="rounded-lg border border-border p-6">
            <div className="flex flex-col gap-3">
              {COL_ROWS.map((row) => (
                <div key={row.key} className="flex justify-between text-sm font-light text-navy">
                  <span>{row.label}</span>
                  <span>{side.col[row.key] != null ? eur(side.col[row.key]) : "—"}</span>
                </div>
              ))}
              <div className="my-1 h-px bg-border" />
              <div className="flex justify-between text-sm font-medium text-navy">
                <span>Gesamte Lebenshaltungskosten</span>
                <span>{eur(idx === 0 ? homeTotal : targetTotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-light text-navy">
                <span>Verfügbar (Netto − Kosten)</span>
                <span>{eur(side.netMonthly - (idx === 0 ? homeTotal : targetTotal))}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DifferenceSection({ result }: { result: CalculateResponse }) {
  const rows = [
    {
      label: "Netto / Monat",
      home: result.home.netMonthly,
      target: result.target.netMonthly,
    },
    {
      label: "Lebenshaltung",
      home: colTotal(result.home.col),
      target: colTotal(result.target.col),
    },
    {
      label: "Verfügbar",
      home: result.home.netMonthly - colTotal(result.home.col),
      target: result.target.netMonthly - colTotal(result.target.col),
    },
  ];

  return (
    <section className="rounded-lg border border-border bg-card p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-xl text-navy">Wo liegt der Unterschied?</h3>
          <p className="mt-1 text-sm text-navy/50">Monatlich &nbsp;&nbsp;Heimstadt vs Zielstadt</p>
        </div>
        <div className="text-right">
          <div className="text-xl text-navy">
            <span className={result.delta.monthly >= 0 ? "text-positive" : "text-negative"}>
              {eur(result.delta.monthly)}
            </span>
          </div>
          <p className="mt-1 text-sm text-navy/50">Netto-Differenz / Monat</p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {rows.map((row) => {
          const max = Math.max(Math.abs(row.home), Math.abs(row.target), 1);
          return (
            <div key={row.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
              <div className="flex items-center justify-end gap-3">
                <span className="w-20 shrink-0 text-right text-sm font-light text-navy">{eur(row.home)}</span>
                <div className="h-10 flex-1 overflow-hidden rounded-lg bg-bar-track">
                  <div
                    className="ml-auto h-full rounded-lg bg-bar-compare"
                    style={{ width: `${(Math.abs(row.home) / max) * 100}%` }}
                  />
                </div>
              </div>
              <div className="w-32 text-center text-sm font-medium text-navy">{row.label}</div>
              <div className="flex items-center gap-3">
                <div className="h-10 flex-1 overflow-hidden rounded-lg bg-bar-track">
                  <div
                    className="h-full rounded-lg bg-bar-fill"
                    style={{ width: `${(Math.abs(row.target) / max) * 100}%` }}
                  />
                </div>
                <span className="w-20 shrink-0 text-sm font-light text-navy">{eur(row.target)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
