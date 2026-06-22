import { useEffect, useMemo, useState, type ReactNode } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import DonutChart from "@/components/DonutChart";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { ChevronDown, Minus, Plus, TrendingUp } from "lucide-react";
import { cn, formatMoney } from "@/lib/utils";
import { fetchCities, type City } from "@/api/cities";
import { calculate, type CalcSide, type CalculateResponse, type InsuranceOverrides } from "@/api/calculate";

const LOCALE = "de";
const eur = (n: number) => formatMoney(n, LOCALE);

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
  { key: "rent_cold_1br", label: "Kaltmiete" },
  { key: "groceries_monthly", label: "Lebensmittel" },
  { key: "transport_monthly", label: "ÖPNV" },
  { key: "internet_monthly", label: "Internet" },
  { key: "utilities_monthly", label: "Strom/Wasser/Gas" },
  { key: "other_monthly", label: "Sonstiges" },
];

const CITY_PHOTO: Record<string, string> = { berlin: "/figma/berlin.png", porto: "/figma/porto.png" };

/* ── small primitives ─────────────────────────────────────────────────────── */
function Field({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="px-1 text-[13px] font-light text-navy">{label}</span>}
      {children}
    </div>
  );
}

const selectCls =
  "h-[46px] w-full appearance-none rounded-lg border border-input bg-field px-4 text-sm font-light text-navy";

function CitySelect({ value, options, onChange }: { value: string; options: City[]; onChange: (s: string) => void }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectCls}>
        {options.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.flag} {c.nameDE}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/50" />
    </div>
  );
}

function Row({ label, value, muted, strong }: { label: string; value: string; muted?: boolean; strong?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between text-sm", strong ? "font-medium text-navy" : "font-light", muted ? "text-navy/50" : "text-navy")}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

/* ── tax breakdown helpers (extract lines from the engine breakdown) ───────── */
function taxRows(side: CalcSide) {
  const find = (cat: string) => side.breakdown.find((l) => l.category === cat)?.amount ?? 0;
  if (side.country === "de") {
    return [
      { label: "Lohnsteuer", amount: find("income_tax") },
      { label: "Kirchensteuer", amount: find("church_tax") },
      { label: "Soli", amount: find("surcharge") },
    ];
  }
  return [{ label: "Einkommensteuer", amount: find("income_tax") }];
}
function socialRows(side: CalcSide) {
  if (side.country === "de") {
    return [
      { label: "Krankenversicherung", amount: side.social.health },
      { label: "Pflegeversicherung", amount: side.social.care },
      { label: "Rentenversicherung", amount: side.social.pension },
      { label: "Arbeitslosenversicherung", amount: side.social.unemployment },
    ];
  }
  return [{ label: "Sozialabgaben", amount: side.social.total }];
}
function colTotal(col: Record<string, number>) {
  return COL_ROWS.reduce((s, r) => s + (col[r.key] ?? 0), 0);
}
function cityMeta(slug: string, cities: City[]) {
  const c = cities.find((x) => x.slug === slug);
  return { flag: c?.flag ?? "🏳️", name: c?.nameDE ?? slug, country: c?.countryDE ?? "" };
}

/* ── page ─────────────────────────────────────────────────────────────────── */
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
  const [regimeOn, setRegimeOn] = useState(true);

  const [insOpen, setInsOpen] = useState(false);
  const [approxInsurance, setApproxInsurance] = useState(true);
  const [ins, setIns] = useState<InsState>(EMPTY_INS);

  const [result, setResult] = useState<CalculateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  function fillApprox(res: CalculateResponse) {
    const s = res.home.social;
    setIns({
      health: String(Math.round(s.health / 12)),
      care: String(Math.round(s.care / 12)),
      pension: String(Math.round(s.pension / 12)),
      unemployment: String(Math.round(s.unemployment / 12)),
    });
  }

  async function runCalc() {
    setLoading(true);
    setError(null);
    try {
      const res = await calculate({
        gross, homeCitySlug: homeSlug, targetCitySlug: targetSlug, year: 2026,
        employment, familyStatus, children, kvType, insuranceOverrides,
        specialRegimeId: regimeOn ? "ifici" : undefined,
      });
      setResult(res);
      if (approxInsurance) fillApprox(res);
    } catch {
      setError("Berechnung fehlgeschlagen. Läuft das Backend auf :3001?");
    } finally {
      setLoading(false);
    }
  }

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
    if (on && result) fillApprox(result);
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 lg:px-10">
      <div className="mx-auto max-w-[1180px]">
        <Header active="calculator" />
        <div className="mt-8 flex gap-12">
          <div className="hidden w-[210px] shrink-0 lg:block">
            <div className="sticky top-6">
              <Sidebar />
            </div>
          </div>

          <main className="min-w-0 flex-1 space-y-8">
            {/* Hero */}
            <div>
              <div className="mb-2 text-[13px] font-light text-navy">Rechner / Nettovergleichsrechner</div>
              <h1 className="text-[44px] font-semibold leading-[1.1] tracking-tight text-navy">
                Vergleiche Städte.
                <br />
                <span className="text-accent-blue">Prüfe Kosten.</span>
              </h1>
              <p className="mt-4 max-w-md text-sm font-light leading-relaxed text-navy">
                Vergleichen Sie die Lebenshaltungskosten, Steuern und vieles mehr. Finden Sie heraus, wo Sie mit Ihrem
                Gehalt am weitesten kommen.
              </p>
            </div>

            {/* Input card */}
            <section id="rechner" className="rounded-card border border-border bg-card p-7">
              <div className="grid grid-cols-2 gap-6">
                <Field label="Heimstadt">
                  <CitySelect value={homeSlug} options={homeCities} onChange={setHomeSlug} />
                </Field>
                <Field label="Zielstadt">
                  <CitySelect value={targetSlug} options={targetCities} onChange={setTargetSlug} />
                </Field>
              </div>

              <div className="mt-5">
                <div className="flex h-[46px] items-center justify-between rounded-lg border border-input bg-field px-4">
                  <span className="text-sm font-light text-navy">{gross.toLocaleString("de-DE")}</span>
                  <span className="text-sm font-light text-navy/70">€</span>
                </div>
                <div className="mt-3">
                  <Slider value={[gross]} min={20000} max={500000} step={1000} onValueChange={(v) => setGross(v[0])} />
                  <div className="mt-2 flex justify-between text-[11px] font-light text-navy">
                    <span>20.000 €</span>
                    <span>500.000 €</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-4 gap-3">
                <Field label="Kinder">
                  <div className="flex h-[46px] items-center justify-between rounded-lg border border-input bg-field px-4">
                    <button className="text-navy/60 hover:text-navy" onClick={() => setChildren((c) => Math.max(0, c - 1))}>
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-light text-navy">{children}</span>
                    <button className="text-navy/60 hover:text-navy" onClick={() => setChildren((c) => c + 1)}>
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </Field>
                <Field label="Beschäftigung">
                  <select value={employment} onChange={(e) => setEmployment(e.target.value as typeof employment)} className={selectCls}>
                    <option value="employed">Angestellt</option>
                    <option value="freelancer">Freiberuflich</option>
                    <option value="founder">Gründer</option>
                    <option value="passive">Passiv</option>
                  </select>
                </Field>
                <Field label="Status">
                  <select value={familyStatus} onChange={(e) => setFamilyStatus(e.target.value as typeof familyStatus)} className={selectCls}>
                    <option value="single">Ledig</option>
                    <option value="married">Verheiratet</option>
                    <option value="divorced">Geschieden</option>
                  </select>
                </Field>
                <Field label="Versicherung">
                  <button onClick={() => setInsOpen((o) => !o)} className={cn(selectCls, "flex items-center justify-between")}>
                    <span>{kvType === "private" ? "Privat" : "Gesetzlich"}</span>
                    <ChevronDown className={cn("h-4 w-4 text-navy/50 transition-transform", insOpen && "rotate-180")} />
                  </button>
                </Field>
              </div>

              {/* Versicherung accordion (entered values are deducted from gross) */}
              {insOpen && (
                <div className="mt-3 space-y-3 rounded-lg border border-input bg-field p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-navy">Krankenversicherungs-Typ</span>
                    <select value={kvType} onChange={(e) => setKvType(e.target.value as typeof kvType)} className="h-9 rounded-md border border-input bg-card px-3 text-sm font-light text-navy">
                      <option value="statutory">Gesetzlich</option>
                      <option value="private">Privat</option>
                    </select>
                  </div>
                  {INS_BRANCHES.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between gap-4">
                      <span className="text-sm font-light text-navy">{label}</span>
                      <div className="relative w-36">
                        <Input type="number" inputMode="decimal" value={ins[key]} onChange={(e) => editInsurance(key, e.target.value)} className="h-9 bg-card pr-7 text-right" />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-navy/60">€</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 pt-1">
                    <Switch checked={approxInsurance} onCheckedChange={toggleApprox} />
                    <span className="text-sm font-light text-navy">Ungefähre Werte übernehmen</span>
                  </div>
                </div>
              )}

              <div className="mt-5 flex h-[52px] items-center gap-3 rounded-lg border border-input bg-field px-4">
                <Switch checked={regimeOn} onCheckedChange={setRegimeOn} />
                <span className="text-sm font-light text-navy">Regime IFICI</span>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={runCalc}
                  disabled={loading}
                  className="rounded-lg bg-navy px-16 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Berechne…" : "Berechnen"}
                </button>
              </div>
              {error && <p className="mt-4 text-center text-sm text-negative">{error}</p>}
            </section>

            {result && (
              <>
                <ResultsCard result={result} gross={gross} homeCities={homeCities} targetCities={targetCities} />
                {result.target.regime && <SonderregimeBanner regime={result.target.regime} />}
                <ColCard result={result} />
                <DifferenceCard result={result} />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ── results ──────────────────────────────────────────────────────────────── */
function NetHeader({ side, otherNet, meta }: { side: CalcSide; otherNet: number; meta: { flag: string; name: string; country: string } }) {
  const photo = CITY_PHOTO[side.slug];
  const up = side.netMonthly >= otherNet;
  const pct = otherNet > 0 ? Math.abs(((side.netMonthly - otherNet) / otherNet) * 100) : 0;
  return (
    <div className="rounded-xl border border-border p-2">
      <div className="relative h-40 overflow-hidden rounded-lg bg-gradient-to-br from-navy/20 to-navy/5">
        {photo && <img src={photo} alt={meta.name} className="h-full w-full object-cover" />}
        <div className="absolute left-3 top-1/2 flex -translate-y-1/2 items-center gap-2 rounded-lg bg-card/95 px-3 py-2 shadow-sm">
          <span className="text-base leading-none">{meta.flag}</span>
          <div className="leading-tight">
            <div className="text-sm font-light text-navy">{meta.name}</div>
            <div className="text-[12px] font-light text-navy/70">{meta.country}</div>
          </div>
        </div>
      </div>
      <div className="flex items-end justify-between px-3 pb-1 pt-4">
        <div>
          <div className="text-[12px] font-light text-navy">Netto / Monat</div>
          <div className="text-[32px] font-light leading-tight text-navy">{eur(side.netMonthly)}</div>
        </div>
        <div className="flex items-center gap-1.5 pb-1">
          <span
            className={cn(
              "inline-block h-0 w-0 border-x-[5px] border-x-transparent",
              up ? "border-b-[7px] border-b-positive" : "border-t-[7px] border-t-negative"
            )}
          />
          <span className="text-sm font-light text-navy">{pct.toFixed(2)} %</span>
        </div>
      </div>
    </div>
  );
}

function BreakdownBox({ side, gross }: { side: CalcSide; gross: number }) {
  const bruttoMonthly = gross / 12;
  const abgaben = Math.max(0, bruttoMonthly - side.netMonthly);
  return (
    <div className="rounded-xl border border-border p-5">
      <Row label="Brutto / Month" value={eur(bruttoMonthly)} />
      <div className="mt-3 flex flex-col gap-3">
        {taxRows(side).map((r) => (
          <Row key={r.label} label={r.label} value={eur(r.amount / 12)} />
        ))}
      </div>
      <div className="my-4 h-px bg-border" />
      <div className="flex flex-col gap-3">
        {socialRows(side).map((r) => (
          <Row key={r.label} label={r.label} value={eur(r.amount / 12)} />
        ))}
      </div>
      <div className="my-4 h-px bg-border" />
      <Row label="Effektive Abgaben" value={eur(abgaben)} strong />
      <div className="mt-1 text-right text-sm font-light text-navy/50">{Math.round(side.effectiveRate * 100)} %</div>
    </div>
  );
}

function DonutBox({ side }: { side: CalcSide }) {
  const taxMonthly = taxRows(side).reduce((s, r) => s + r.amount, 0) / 12;
  const socialMonthly = side.social.total / 12;
  const legend =
    side.country === "de"
      ? [{ c: "#ffbb33", l: "Versicherung" }, { c: "#0096c7", l: "Steuern & Soli" }]
      : [{ c: "#ffbb33", l: "Sozialabgaben" }, { c: "#0096c7", l: "Steuern" }];
  return (
    <div className="flex items-center gap-6 rounded-xl border border-border p-5">
      <DonutChart
        segments={[{ value: socialMonthly, color: "#ffbb33" }, { value: taxMonthly, color: "#0096c7" }]}
        centerLabel={`${Math.round(side.effectiveRate * 100)}%`}
      />
      <div className="flex flex-col gap-3">
        {legend.map((l) => (
          <div key={l.l} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: l.c }} />
            <span className="text-sm font-light text-navy">{l.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultsCard({ result, gross, homeCities, targetCities }: { result: CalculateResponse; gross: number; homeCities: City[]; targetCities: City[] }) {
  const homeMeta = cityMeta(result.home.slug, homeCities);
  const targetMeta = cityMeta(result.target.slug, targetCities);
  return (
    <section id="steuern" className="space-y-5 rounded-card border border-border bg-card p-7">
      <div className="grid grid-cols-2 gap-6">
        <NetHeader side={result.home} otherNet={result.target.netMonthly} meta={homeMeta} />
        <NetHeader side={result.target} otherNet={result.home.netMonthly} meta={targetMeta} />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <BreakdownBox side={result.home} gross={gross} />
        <BreakdownBox side={result.target} gross={gross} />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <DonutBox side={result.home} />
        <DonutBox side={result.target} />
      </div>
    </section>
  );
}

function SonderregimeBanner({ regime }: { regime: NonNullable<CalcSide["regime"]> }) {
  return (
    <section className="flex items-center justify-between gap-8 rounded-banner bg-navy px-8 py-7">
      <div className="max-w-2xl">
        <span className="inline-block rounded-[3px] bg-navy-soft px-3 py-1 text-[11px] font-medium tracking-wide text-white">
          SONDERREGIME
        </span>
        <h3 className="mt-3 text-lg font-light text-white">{regime.nameDE}</h3>
        <p className="mt-2 text-[13px] font-light leading-relaxed text-white/85">{regime.conditionsDE}</p>
      </div>
      <button className="shrink-0 rounded-lg bg-card px-6 py-3 text-sm font-medium text-navy transition-opacity hover:opacity-90">
        Im Guide erklärt
      </button>
    </section>
  );
}

/* ── cost of living + inflation ───────────────────────────────────────────── */
const INFLATION: { home: [string, string][]; target: [string, string][] } = {
  home: [["Inflation", "2.6 - 2.7 %"], ["Trend", "↗"], ["Prognose 2027", "2.3 %"]],
  target: [["Inflation", "3.3 %"], ["Trend", "↗"], ["Prognose 2027", "2.3 %"]],
};

function ColBox({ side }: { side: CalcSide }) {
  const total = colTotal(side.col);
  return (
    <div id="lebenshaltung" className="rounded-xl border border-border p-6">
      <div className="flex flex-col gap-3">
        {COL_ROWS.map((row) => (
          <Row key={row.key} label={row.label} value={side.col[row.key] != null ? eur(side.col[row.key]) : "—"} />
        ))}
        <div className="my-1 h-px bg-border" />
        <Row label="Gesamte Lebenshaltungskosten" value={eur(total)} strong />
        <Row label="Verfügbar" value={eur(side.netMonthly - total)} />
      </div>
    </div>
  );
}

function InflationBox({ rows }: { rows: [string, string][] }) {
  return (
    <div className="rounded-xl border border-border p-6">
      <div className="flex flex-col gap-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between text-sm font-light text-navy">
            <span>{label}</span>
            {value === "↗" ? <TrendingUp className="h-4 w-4 text-negative" /> : <span>{value}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ColCard({ result }: { result: CalculateResponse }) {
  return (
    <section className="space-y-5 rounded-card border border-border bg-card p-7">
      <div className="grid grid-cols-2 gap-6">
        <ColBox side={result.home} />
        <ColBox side={result.target} />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <InflationBox rows={INFLATION.home} />
        <InflationBox rows={INFLATION.target} />
      </div>
    </section>
  );
}

/* ── difference ───────────────────────────────────────────────────────────── */
function DifferenceCard({ result }: { result: CalculateResponse }) {
  const tax = (s: CalcSide) => taxRows(s).reduce((a, r) => a + r.amount, 0) / 12;
  const rows = [
    { label: "Steuern", home: tax(result.home), target: tax(result.target) },
    { label: "Sozialabgaben", home: result.home.social.total / 12, target: result.target.social.total / 12 },
    { label: "Lebenshaltung", home: colTotal(result.home.col), target: colTotal(result.target.col) },
  ];
  const homeAvail = result.home.netMonthly - colTotal(result.home.col);
  const targetAvail = result.target.netMonthly - colTotal(result.target.col);
  const saved = targetAvail - homeAvail;

  return (
    <section className="rounded-card border border-border bg-card p-7">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-lg text-navy">Wo liegt der Unterschied?</h3>
          <p className="mt-1 text-[13px] text-navy/50">Monatlich&nbsp;&nbsp;Heimstadt vs Zielstadt</p>
        </div>
        <div className="text-right">
          <div className="text-lg text-navy">
            <span className={saved >= 0 ? "text-positive" : "text-negative"}>{eur(Math.abs(saved))}</span>
          </div>
          <p className="mt-1 text-[13px] text-navy/50">gespart / Monat</p>
        </div>
      </div>
      <div className="flex flex-col gap-5">
        {rows.map((row) => {
          const max = Math.max(row.home, row.target, 1);
          const delta = Math.abs(row.home - row.target);
          return (
            <div key={row.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-5">
              <div className="flex items-center justify-end gap-3">
                <span className="w-16 shrink-0 text-right text-sm font-light text-navy">{eur(row.home)}</span>
                <div className="h-9 flex-1 overflow-hidden rounded-lg bg-bar-track">
                  <div className="ml-auto h-full rounded-lg bg-bar-compare" style={{ width: `${(row.home / max) * 100}%` }} />
                </div>
              </div>
              <div className="w-28 text-center">
                <div className="text-sm font-medium text-navy">{row.label}</div>
                <div className="text-[13px] text-positive">{eur(delta)}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 flex-1 overflow-hidden rounded-lg bg-bar-track">
                  <div className="h-full rounded-lg bg-bar-fill" style={{ width: `${(row.target / max) * 100}%` }} />
                </div>
                <span className="w-16 shrink-0 text-sm font-light text-navy">{eur(row.target)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
