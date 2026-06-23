import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/client";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";
import { LogOut, Plus, Save, Trash2 } from "lucide-react";

interface City {
  id: string; slug: string; flag: string; nameDE: string; nameEN: string; currency: string;
  countrySlug: string | null; regionSlug: string | null;
  lat: number | null; lng: number | null; timezone: string | null;
  isCapital: boolean; isActive: boolean; sortOrder: number;
}
interface Meta { countries: { slug: string; nameDE: string; regions: { slug: string; nameDE: string }[] }[]; }

const inputCls = "w-full rounded-lg border border-input bg-field px-3 py-2 text-sm font-light text-navy";
const labelCls = "px-1 text-[12px] font-light text-navy/70";

function F({ label, children }: { label: string; children: ReactNode }) {
  return <label className="flex flex-col gap-1"><span className={labelCls}>{label}</span>{children}</label>;
}

export default function AdminCities() {
  const navigate = useNavigate();
  const [cities, setCities] = useState<City[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [editing, setEditing] = useState<Partial<City> | null>(null);
  const [col, setCol] = useState<string>("");
  const [colErr, setColErr] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  function reload() {
    api.get<City[]>("/api/admin/cities").then((r) => setCities(r.data)).catch(() => setMsg({ kind: "err", text: "Laden fehlgeschlagen (eingeloggt? API :3001?)." }));
  }
  useEffect(() => {
    reload();
    api.get<Meta>("/api/admin/cities/meta").then((r) => setMeta(r.data)).catch(() => {});
  }, []);

  function selectCity(c: City) {
    setEditing({ ...c });
    setCol(""); setColErr(false);
    api.get(`/api/admin/cities/${c.id}/col`).then((r) => setCol(JSON.stringify(r.data, null, 2))).catch(() => {});
  }
  function newCity() {
    setEditing({ flag: "🏳️", currency: "EUR", isCapital: false, isActive: true, sortOrder: cities.length });
    setCol("[]"); setColErr(false);
  }

  function logout() { sessionStorage.removeItem("paymap_token"); navigate("/admin/login"); }

  async function saveCity() {
    if (!editing) return;
    const e = editing;
    const body = {
      slug: e.slug, flag: e.flag, nameDE: e.nameDE, nameEN: e.nameEN, currency: e.currency,
      countrySlug: e.countrySlug, regionSlug: e.regionSlug || null,
      lat: e.lat ?? null, lng: e.lng ?? null, timezone: e.timezone || null,
      isCapital: !!e.isCapital, isActive: e.isActive ?? true, sortOrder: Number(e.sortOrder ?? 0),
    };
    setBusy(true); setMsg(null);
    try {
      if (e.id) await api.put(`/api/admin/cities/${e.id}`, body);
      else await api.post("/api/admin/cities", body);
      setMsg({ kind: "ok", text: "Stadt gespeichert ✓" });
      setEditing(null); reload();
    } catch (err) {
      setMsg({ kind: "err", text: `Fehler: ${(err as { response?: { data?: { error?: string } } }).response?.data?.error ?? "Speichern fehlgeschlagen"}` });
    } finally { setBusy(false); }
  }

  async function deleteCity(id: string) {
    if (!confirm("Stadt wirklich löschen?")) return;
    setBusy(true);
    try { await api.delete(`/api/admin/cities/${id}`); setMsg({ kind: "ok", text: "Gelöscht ✓" }); setEditing(null); reload(); }
    catch (err) { setMsg({ kind: "err", text: `Fehler: ${(err as { response?: { data?: { error?: string } } }).response?.data?.error ?? "Löschen fehlgeschlagen"}` }); }
    finally { setBusy(false); }
  }

  async function saveCol() {
    if (!editing?.id) { setMsg({ kind: "err", text: "Stadt zuerst speichern, dann COL." }); return; }
    let parsed: unknown;
    try { parsed = JSON.parse(col); } catch { setColErr(true); setMsg({ kind: "err", text: "COL: ungültiges JSON" }); return; }
    setBusy(true); setMsg(null);
    try {
      const r = await api.put<{ ok: boolean; count: number }>(`/api/admin/cities/${editing.id}/col`, parsed);
      setMsg({ kind: "ok", text: `COL gespeichert ✓ (${r.data.count} Einträge)` });
    } catch (err) {
      setMsg({ kind: "err", text: `Fehler: ${(err as { response?: { data?: { error?: string } } }).response?.data?.error ?? "COL-Speichern fehlgeschlagen"}` });
    } finally { setBusy(false); }
  }

  const regionsForCountry = meta?.countries.find((c) => c.slug === editing?.countrySlug)?.regions ?? [];

  return (
    <div className="min-h-screen bg-background px-4 py-6 lg:px-10">
      <div className="mx-auto max-w-[1100px]">
        <Header />
        <div className="mt-8 flex items-center justify-between">
          <h1 className="text-xl font-medium text-navy">Städte-Admin</h1>
          <div className="flex gap-2">
            <button onClick={() => navigate("/admin/tax")} className="rounded-md border border-input px-3 py-1.5 text-xs font-light text-navy/70 hover:text-navy">Steuertabellen</button>
            <button onClick={() => navigate("/admin/regimes")} className="rounded-md border border-input px-3 py-1.5 text-xs font-light text-navy/70 hover:text-navy">Regimes</button>
            <button onClick={logout} className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-light text-navy/50 hover:text-navy"><LogOut className="h-3.5 w-3.5" /> Logout</button>
          </div>
        </div>

        {msg && <p className={cn("mt-4 text-sm", msg.kind === "ok" ? "text-positive" : "text-negative")}>{msg.text}</p>}

        <div className="mt-5 grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* list */}
          <div className="space-y-1">
            <button onClick={newCity} className="mb-2 flex w-full items-center gap-2 rounded-lg border border-dashed border-navy/40 px-3 py-2 text-sm text-navy"><Plus className="h-4 w-4" /> Neue Stadt</button>
            {cities.map((c) => (
              <button key={c.id} onClick={() => selectCity(c)} className={cn("flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm", editing?.id === c.id ? "border-navy bg-navy/5" : "border-border hover:border-navy/40")}>
                <span className="font-light text-navy">{c.flag} {c.nameDE}</span>
                <span className={cn("text-xs", c.isActive ? "text-navy/40" : "text-negative")}>{c.countrySlug}{c.isActive ? "" : " ·aus"}</span>
              </button>
            ))}
          </div>

          {/* editor */}
          {editing ? (
            <div className="space-y-4">
              <div className="space-y-3 rounded-card border border-border bg-card p-5">
                <div className="grid grid-cols-2 gap-3">
                  <F label="Slug"><input className={inputCls} value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></F>
                  <F label="Flag (Emoji)"><input className={inputCls} value={editing.flag ?? ""} onChange={(e) => setEditing({ ...editing, flag: e.target.value })} /></F>
                  <F label="Name DE"><input className={inputCls} value={editing.nameDE ?? ""} onChange={(e) => setEditing({ ...editing, nameDE: e.target.value })} /></F>
                  <F label="Name EN"><input className={inputCls} value={editing.nameEN ?? ""} onChange={(e) => setEditing({ ...editing, nameEN: e.target.value })} /></F>
                  <F label="Währung"><input className={inputCls} value={editing.currency ?? ""} onChange={(e) => setEditing({ ...editing, currency: e.target.value })} /></F>
                  <F label="Land">
                    <select value={editing.countrySlug ?? ""} onChange={(e) => setEditing({ ...editing, countrySlug: e.target.value, regionSlug: null })} className={inputCls}>
                      <option value="">—</option>
                      {meta?.countries.map((c) => <option key={c.slug} value={c.slug}>{c.nameDE} ({c.slug})</option>)}
                    </select>
                  </F>
                  <F label="Region (optional)">
                    <select value={editing.regionSlug ?? ""} onChange={(e) => setEditing({ ...editing, regionSlug: e.target.value || null })} className={inputCls} disabled={regionsForCountry.length === 0}>
                      <option value="">—</option>
                      {regionsForCountry.map((r) => <option key={r.slug} value={r.slug}>{r.nameDE} ({r.slug})</option>)}
                    </select>
                  </F>
                  <F label="Zeitzone"><input className={inputCls} value={editing.timezone ?? ""} onChange={(e) => setEditing({ ...editing, timezone: e.target.value })} /></F>
                  <F label="lat"><input type="number" step="0.0001" className={inputCls} value={editing.lat ?? ""} onChange={(e) => setEditing({ ...editing, lat: e.target.value === "" ? null : Number(e.target.value) })} /></F>
                  <F label="lng"><input type="number" step="0.0001" className={inputCls} value={editing.lng ?? ""} onChange={(e) => setEditing({ ...editing, lng: e.target.value === "" ? null : Number(e.target.value) })} /></F>
                  <F label="sortOrder"><input type="number" className={inputCls} value={editing.sortOrder ?? 0} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })} /></F>
                </div>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm text-navy"><input type="checkbox" checked={!!editing.isCapital} onChange={(e) => setEditing({ ...editing, isCapital: e.target.checked })} /> isCapital</label>
                  <label className="flex items-center gap-2 text-sm text-navy"><input type="checkbox" checked={editing.isActive ?? true} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} /> isActive</label>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={saveCity} disabled={busy} className="flex items-center gap-2 rounded-lg bg-navy px-6 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"><Save className="h-4 w-4" /> Stadt speichern</button>
                  {editing.id && <button onClick={() => deleteCity(editing.id!)} disabled={busy} className="flex items-center gap-2 rounded-lg border border-negative px-4 py-2.5 text-sm text-negative"><Trash2 className="h-4 w-4" /> Löschen</button>}
                  <button onClick={() => setEditing(null)} className="rounded-lg px-4 py-2.5 text-sm text-navy/60">Abbrechen</button>
                </div>
              </div>

              {/* COL editor */}
              <div className="space-y-2 rounded-card border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-navy">Lebenshaltungskosten (CostOfLivingItem)</span>
                  {colErr && <span className="text-xs text-negative">Ungültiges JSON</span>}
                </div>
                <p className="text-xs font-light text-navy/50">Array von {`{category, value, currency, source, confidence (0–100), periodStart (YYYY-MM-DD), periodEnd?}`}. Ersetzt alle COL-Zeilen der Stadt.</p>
                <textarea
                  rows={14} spellCheck={false}
                  className={cn("w-full resize-y rounded-lg border bg-field p-3 font-mono text-xs text-navy", colErr ? "border-negative" : "border-input")}
                  value={col}
                  onChange={(e) => { setCol(e.target.value); try { JSON.parse(e.target.value); setColErr(false); } catch { setColErr(true); } }}
                />
                <button onClick={saveCol} disabled={busy || colErr || !editing.id} className="flex items-center gap-2 rounded-lg bg-navy px-6 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"><Save className="h-4 w-4" /> COL speichern</button>
                {!editing.id && <p className="text-xs text-navy/50">Stadt zuerst speichern, dann COL bearbeiten.</p>}
              </div>
            </div>
          ) : (
            <p className="text-sm font-light text-navy/50">Stadt aus der Liste wählen oder neu anlegen.</p>
          )}
        </div>
      </div>
    </div>
  );
}
