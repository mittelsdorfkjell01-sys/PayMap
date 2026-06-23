import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/client";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";
import { LogOut, Plus, Save, Trash2 } from "lucide-react";

/* ── types (mirror the v3 schema / admin API) ──────────────────────────────── */
interface Regime {
  id: string;
  country?: { slug: string; nameDE: string };
  countrySlug?: string;
  slug: string;
  nameDE: string; nameEN: string;
  flatRate: number; durationYears: number;
  qualifications: string[];
  eligibilityCriteria?: unknown;
  regimeEffect?: string | null;
  conditionsDE: string; conditionsEN: string;
  validFrom: string; validTo?: string | null;
  sourceUrl: string; sourceDE: string;
  riskLevel: string; requiresLegalAdvice: boolean;
  disclaimerDE?: string | null; disclaimerEN?: string | null;
  descriptionDE?: string | null; descriptionEN?: string | null;
  backgroundDE?: string | null; backgroundEN?: string | null;
}
interface ExitRule {
  id: string; slug: string; ruleType: string; legalRef?: string | null;
  nameDE: string; nameEN: string;
  descriptionDE: string; descriptionEN: string;
  affectedDE: string; affectedEN: string;
  backgroundDE?: string | null; backgroundEN?: string | null;
  sourceUrl: string; sourceDE: string;
  riskLevel: string; requiresLegalAdvice: boolean;
  disclaimerDE?: string | null; disclaimerEN?: string | null;
  sortOrder: number;
}
interface Meta { countries: { slug: string; nameDE: string }[]; riskLevels: string[]; regimeEffects: string[]; }

const inputCls = "w-full rounded-lg border border-input bg-field px-3 py-2 text-sm font-light text-navy";
const labelCls = "px-1 text-[12px] font-light text-navy/70";
const toDateInput = (s?: string | null) => (s ? new Date(s).toISOString().slice(0, 10) : "");

function F({ label, children }: { label: string; children: ReactNode }) {
  return <label className="flex flex-col gap-1">{<span className={labelCls}>{label}</span>}{children}</label>;
}

export default function AdminRegimes() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"regimes" | "exit">("regimes");
  const [regimes, setRegimes] = useState<Regime[]>([]);
  const [exitRules, setExitRules] = useState<ExitRule[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [editing, setEditing] = useState<Partial<Regime> | null>(null);
  const [editingExit, setEditingExit] = useState<Partial<ExitRule> | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  function reload() {
    api.get<Regime[]>("/api/admin/regimes").then((r) => setRegimes(r.data)).catch(() => setMsg({ kind: "err", text: "Laden fehlgeschlagen (eingeloggt? API :3001?)." }));
    api.get<ExitRule[]>("/api/admin/exit-rules").then((r) => setExitRules(r.data)).catch(() => {});
  }
  useEffect(() => {
    reload();
    api.get<Meta>("/api/admin/regimes/meta").then((r) => setMeta(r.data)).catch(() => {});
  }, []);

  function logout() { sessionStorage.removeItem("paymap_token"); navigate("/admin/login"); }

  /* ── regime save/delete ──────────────────────────────────────────────────── */
  async function saveRegime() {
    if (!editing) return;
    const e = editing;
    let eligibility: unknown = undefined;
    if (typeof (e as { eligibilityText?: string }).eligibilityText === "string") {
      const txt = (e as { eligibilityText?: string }).eligibilityText!.trim();
      if (txt) { try { eligibility = JSON.parse(txt); } catch { setMsg({ kind: "err", text: "eligibilityCriteria: ungültiges JSON" }); return; } }
    }
    const body = {
      countrySlug: e.countrySlug ?? e.country?.slug,
      slug: e.slug, nameDE: e.nameDE, nameEN: e.nameEN,
      flatRate: Number(e.flatRate), durationYears: Number(e.durationYears),
      qualifications: (Array.isArray(e.qualifications) ? e.qualifications : String(e.qualifications ?? "").split("\n")).map((s) => s.trim()).filter(Boolean),
      eligibilityCriteria: eligibility,
      regimeEffect: e.regimeEffect || null,
      conditionsDE: e.conditionsDE, conditionsEN: e.conditionsEN,
      validFrom: e.validFrom, validTo: e.validTo || null,
      sourceUrl: e.sourceUrl, sourceDE: e.sourceDE,
      riskLevel: e.riskLevel ?? "medium", requiresLegalAdvice: !!e.requiresLegalAdvice,
      disclaimerDE: e.disclaimerDE || null, disclaimerEN: e.disclaimerEN || null,
      descriptionDE: e.descriptionDE || null, descriptionEN: e.descriptionEN || null,
      backgroundDE: e.backgroundDE || null, backgroundEN: e.backgroundEN || null,
    };
    setBusy(true); setMsg(null);
    try {
      if (e.id) await api.put(`/api/admin/regimes/${e.id}`, body);
      else await api.post("/api/admin/regimes", body);
      setMsg({ kind: "ok", text: "Regime gespeichert ✓" });
      setEditing(null); reload();
    } catch (err) {
      setMsg({ kind: "err", text: `Fehler: ${(err as { response?: { data?: { error?: string } } }).response?.data?.error ?? "Speichern fehlgeschlagen"}` });
    } finally { setBusy(false); }
  }
  async function deleteRegime(id: string) {
    if (!confirm("Regime wirklich löschen?")) return;
    setBusy(true);
    try { await api.delete(`/api/admin/regimes/${id}`); setMsg({ kind: "ok", text: "Gelöscht ✓" }); setEditing(null); reload(); }
    catch { setMsg({ kind: "err", text: "Löschen fehlgeschlagen" }); }
    finally { setBusy(false); }
  }

  /* ── exit-rule save/delete ─────────────────────────────────────────────────── */
  async function saveExit() {
    if (!editingExit) return;
    const e = editingExit;
    const body = {
      slug: e.slug, ruleType: e.ruleType, legalRef: e.legalRef || null,
      nameDE: e.nameDE, nameEN: e.nameEN,
      descriptionDE: e.descriptionDE, descriptionEN: e.descriptionEN,
      affectedDE: e.affectedDE, affectedEN: e.affectedEN,
      backgroundDE: e.backgroundDE || null, backgroundEN: e.backgroundEN || null,
      sourceUrl: e.sourceUrl, sourceDE: e.sourceDE,
      riskLevel: e.riskLevel ?? "high", requiresLegalAdvice: e.requiresLegalAdvice ?? true,
      disclaimerDE: e.disclaimerDE || null, disclaimerEN: e.disclaimerEN || null,
      sortOrder: Number(e.sortOrder ?? 0),
    };
    setBusy(true); setMsg(null);
    try {
      if (e.id) await api.put(`/api/admin/exit-rules/${e.id}`, body);
      else await api.post("/api/admin/exit-rules", body);
      setMsg({ kind: "ok", text: "Exit-Rule gespeichert ✓" });
      setEditingExit(null); reload();
    } catch (err) {
      setMsg({ kind: "err", text: `Fehler: ${(err as { response?: { data?: { error?: string } } }).response?.data?.error ?? "Speichern fehlgeschlagen"}` });
    } finally { setBusy(false); }
  }
  async function deleteExit(id: string) {
    if (!confirm("Exit-Rule wirklich löschen?")) return;
    setBusy(true);
    try { await api.delete(`/api/admin/exit-rules/${id}`); setMsg({ kind: "ok", text: "Gelöscht ✓" }); setEditingExit(null); reload(); }
    catch { setMsg({ kind: "err", text: "Löschen fehlgeschlagen" }); }
    finally { setBusy(false); }
  }

  const eligibilityText = useMemo(
    () => (editing?.eligibilityCriteria != null ? JSON.stringify(editing.eligibilityCriteria, null, 2) : ""),
    [editing?.id], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <div className="min-h-screen bg-background px-4 py-6 lg:px-10">
      <div className="mx-auto max-w-[1100px]">
        <Header />
        <div className="mt-8 flex items-center justify-between">
          <h1 className="text-xl font-medium text-navy">Sonderregime & Wegzugs-Regeln</h1>
          <div className="flex gap-2">
            <button onClick={() => navigate("/admin/tax")} className="rounded-md border border-input px-3 py-1.5 text-xs font-light text-navy/70 hover:text-navy">Steuertabellen</button>
            <button onClick={() => navigate("/admin/cities")} className="rounded-md border border-input px-3 py-1.5 text-xs font-light text-navy/70 hover:text-navy">Städte</button>
            <button onClick={logout} className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-light text-navy/50 hover:text-navy"><LogOut className="h-3.5 w-3.5" /> Logout</button>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          {(["regimes", "exit"] as const).map((tb) => (
            <button key={tb} onClick={() => setTab(tb)} className={cn("rounded-lg px-4 py-2 text-sm", tab === tb ? "bg-navy text-primary-foreground" : "border border-input text-navy/70")}>
              {tb === "regimes" ? `Sonderregime (${regimes.length})` : `Exit-Rules (${exitRules.length})`}
            </button>
          ))}
        </div>

        {msg && <p className={cn("mt-4 text-sm", msg.kind === "ok" ? "text-positive" : "text-negative")}>{msg.text}</p>}

        {tab === "regimes" ? (
          <div className="mt-5 grid gap-6 lg:grid-cols-[300px_1fr]">
            {/* list */}
            <div className="space-y-1">
              <button onClick={() => setEditing({ riskLevel: "medium", validFrom: "2025-01-01", flatRate: 0, durationYears: 5, qualifications: [] })} className="mb-2 flex w-full items-center gap-2 rounded-lg border border-dashed border-navy/40 px-3 py-2 text-sm text-navy"><Plus className="h-4 w-4" /> Neues Regime</button>
              {regimes.map((r) => (
                <button key={r.id} onClick={() => setEditing({ ...r, countrySlug: r.country?.slug })} className={cn("flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm", editing?.id === r.id ? "border-navy bg-navy/5" : "border-border hover:border-navy/40")}>
                  <span className="font-light text-navy">{r.slug}</span>
                  <span className="text-xs text-navy/50">{r.country?.slug}</span>
                </button>
              ))}
            </div>
            {/* editor */}
            {editing ? (
              <div className="space-y-3 rounded-card border border-border bg-card p-5">
                <div className="grid grid-cols-2 gap-3">
                  <F label="Land (Slug)">
                    <select value={editing.countrySlug ?? ""} onChange={(e) => setEditing({ ...editing, countrySlug: e.target.value })} className={inputCls}>
                      <option value="">—</option>
                      {meta?.countries.map((c) => <option key={c.slug} value={c.slug}>{c.nameDE} ({c.slug})</option>)}
                    </select>
                  </F>
                  <F label="Slug"><input className={inputCls} value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></F>
                  <F label="Name DE"><input className={inputCls} value={editing.nameDE ?? ""} onChange={(e) => setEditing({ ...editing, nameDE: e.target.value })} /></F>
                  <F label="Name EN"><input className={inputCls} value={editing.nameEN ?? ""} onChange={(e) => setEditing({ ...editing, nameEN: e.target.value })} /></F>
                  <F label="flatRate (0–1)"><input type="number" step="0.01" className={inputCls} value={editing.flatRate ?? 0} onChange={(e) => setEditing({ ...editing, flatRate: Number(e.target.value) })} /></F>
                  <F label="durationYears"><input type="number" className={inputCls} value={editing.durationYears ?? 0} onChange={(e) => setEditing({ ...editing, durationYears: Number(e.target.value) })} /></F>
                  <F label="validFrom"><input type="date" className={inputCls} value={toDateInput(editing.validFrom)} onChange={(e) => setEditing({ ...editing, validFrom: e.target.value })} /></F>
                  <F label="validTo (optional)"><input type="date" className={inputCls} value={toDateInput(editing.validTo)} onChange={(e) => setEditing({ ...editing, validTo: e.target.value })} /></F>
                  <F label="riskLevel">
                    <select value={editing.riskLevel ?? "medium"} onChange={(e) => setEditing({ ...editing, riskLevel: e.target.value })} className={inputCls}>
                      {(meta?.riskLevels ?? ["low", "medium", "high"]).map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </F>
                  <F label="regimeEffect">
                    <select value={editing.regimeEffect ?? ""} onChange={(e) => setEditing({ ...editing, regimeEffect: e.target.value })} className={inputCls}>
                      <option value="">—</option>
                      {(meta?.regimeEffects ?? []).map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </F>
                </div>
                <label className="flex items-center gap-2 text-sm text-navy"><input type="checkbox" checked={!!editing.requiresLegalAdvice} onChange={(e) => setEditing({ ...editing, requiresLegalAdvice: e.target.checked })} /> requiresLegalAdvice</label>
                <F label="qualifications (eine pro Zeile)"><textarea rows={4} className={cn(inputCls, "font-mono text-xs")} value={Array.isArray(editing.qualifications) ? editing.qualifications.join("\n") : String(editing.qualifications ?? "")} onChange={(e) => setEditing({ ...editing, qualifications: e.target.value.split("\n") })} /></F>
                <F label="conditionsDE"><textarea rows={3} className={inputCls} value={editing.conditionsDE ?? ""} onChange={(e) => setEditing({ ...editing, conditionsDE: e.target.value })} /></F>
                <F label="conditionsEN"><textarea rows={3} className={inputCls} value={editing.conditionsEN ?? ""} onChange={(e) => setEditing({ ...editing, conditionsEN: e.target.value })} /></F>
                <F label="descriptionDE"><textarea rows={2} className={inputCls} value={editing.descriptionDE ?? ""} onChange={(e) => setEditing({ ...editing, descriptionDE: e.target.value })} /></F>
                <F label="descriptionEN"><textarea rows={2} className={inputCls} value={editing.descriptionEN ?? ""} onChange={(e) => setEditing({ ...editing, descriptionEN: e.target.value })} /></F>
                <F label="backgroundDE"><textarea rows={2} className={inputCls} value={editing.backgroundDE ?? ""} onChange={(e) => setEditing({ ...editing, backgroundDE: e.target.value })} /></F>
                <F label="backgroundEN"><textarea rows={2} className={inputCls} value={editing.backgroundEN ?? ""} onChange={(e) => setEditing({ ...editing, backgroundEN: e.target.value })} /></F>
                <F label="disclaimerDE"><textarea rows={2} className={inputCls} value={editing.disclaimerDE ?? ""} onChange={(e) => setEditing({ ...editing, disclaimerDE: e.target.value })} /></F>
                <F label="disclaimerEN"><textarea rows={2} className={inputCls} value={editing.disclaimerEN ?? ""} onChange={(e) => setEditing({ ...editing, disclaimerEN: e.target.value })} /></F>
                <div className="grid grid-cols-2 gap-3">
                  <F label="sourceUrl"><input className={inputCls} value={editing.sourceUrl ?? ""} onChange={(e) => setEditing({ ...editing, sourceUrl: e.target.value })} /></F>
                  <F label="sourceDE"><input className={inputCls} value={editing.sourceDE ?? ""} onChange={(e) => setEditing({ ...editing, sourceDE: e.target.value })} /></F>
                </div>
                <F label="eligibilityCriteria (JSON, optional)"><textarea rows={3} className={cn(inputCls, "font-mono text-xs")} defaultValue={eligibilityText} onChange={(e) => setEditing({ ...editing, ...({ eligibilityText: e.target.value } as object) })} /></F>
                <div className="flex gap-2 pt-1">
                  <button onClick={saveRegime} disabled={busy} className="flex items-center gap-2 rounded-lg bg-navy px-6 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"><Save className="h-4 w-4" /> Speichern</button>
                  {editing.id && <button onClick={() => deleteRegime(editing.id!)} disabled={busy} className="flex items-center gap-2 rounded-lg border border-negative px-4 py-2.5 text-sm text-negative"><Trash2 className="h-4 w-4" /> Löschen</button>}
                  <button onClick={() => setEditing(null)} className="rounded-lg px-4 py-2.5 text-sm text-navy/60">Abbrechen</button>
                </div>
              </div>
            ) : (
              <p className="text-sm font-light text-navy/50">Regime aus der Liste wählen oder neu anlegen.</p>
            )}
          </div>
        ) : (
          <div className="mt-5 grid gap-6 lg:grid-cols-[300px_1fr]">
            <div className="space-y-1">
              <button onClick={() => setEditingExit({ riskLevel: "high", requiresLegalAdvice: true, sortOrder: exitRules.length })} className="mb-2 flex w-full items-center gap-2 rounded-lg border border-dashed border-navy/40 px-3 py-2 text-sm text-navy"><Plus className="h-4 w-4" /> Neue Exit-Rule</button>
              {exitRules.map((r) => (
                <button key={r.id} onClick={() => setEditingExit({ ...r })} className={cn("flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm", editingExit?.id === r.id ? "border-navy bg-navy/5" : "border-border hover:border-navy/40")}>
                  <span className="font-light text-navy">{r.slug}</span>
                  <span className="text-xs text-navy/50">{r.ruleType}</span>
                </button>
              ))}
            </div>
            {editingExit ? (
              <div className="space-y-3 rounded-card border border-border bg-card p-5">
                <div className="grid grid-cols-2 gap-3">
                  <F label="Slug"><input className={inputCls} value={editingExit.slug ?? ""} onChange={(e) => setEditingExit({ ...editingExit, slug: e.target.value })} /></F>
                  <F label="ruleType"><input className={inputCls} value={editingExit.ruleType ?? ""} onChange={(e) => setEditingExit({ ...editingExit, ruleType: e.target.value })} /></F>
                  <F label="legalRef"><input className={inputCls} value={editingExit.legalRef ?? ""} onChange={(e) => setEditingExit({ ...editingExit, legalRef: e.target.value })} /></F>
                  <F label="sortOrder"><input type="number" className={inputCls} value={editingExit.sortOrder ?? 0} onChange={(e) => setEditingExit({ ...editingExit, sortOrder: Number(e.target.value) })} /></F>
                  <F label="Name DE"><input className={inputCls} value={editingExit.nameDE ?? ""} onChange={(e) => setEditingExit({ ...editingExit, nameDE: e.target.value })} /></F>
                  <F label="Name EN"><input className={inputCls} value={editingExit.nameEN ?? ""} onChange={(e) => setEditingExit({ ...editingExit, nameEN: e.target.value })} /></F>
                  <F label="riskLevel">
                    <select value={editingExit.riskLevel ?? "high"} onChange={(e) => setEditingExit({ ...editingExit, riskLevel: e.target.value })} className={inputCls}>
                      {(meta?.riskLevels ?? ["low", "medium", "high"]).map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </F>
                </div>
                <label className="flex items-center gap-2 text-sm text-navy"><input type="checkbox" checked={editingExit.requiresLegalAdvice ?? true} onChange={(e) => setEditingExit({ ...editingExit, requiresLegalAdvice: e.target.checked })} /> requiresLegalAdvice</label>
                <F label="descriptionDE"><textarea rows={3} className={inputCls} value={editingExit.descriptionDE ?? ""} onChange={(e) => setEditingExit({ ...editingExit, descriptionDE: e.target.value })} /></F>
                <F label="descriptionEN"><textarea rows={3} className={inputCls} value={editingExit.descriptionEN ?? ""} onChange={(e) => setEditingExit({ ...editingExit, descriptionEN: e.target.value })} /></F>
                <F label="affectedDE"><textarea rows={2} className={inputCls} value={editingExit.affectedDE ?? ""} onChange={(e) => setEditingExit({ ...editingExit, affectedDE: e.target.value })} /></F>
                <F label="affectedEN"><textarea rows={2} className={inputCls} value={editingExit.affectedEN ?? ""} onChange={(e) => setEditingExit({ ...editingExit, affectedEN: e.target.value })} /></F>
                <F label="backgroundDE"><textarea rows={2} className={inputCls} value={editingExit.backgroundDE ?? ""} onChange={(e) => setEditingExit({ ...editingExit, backgroundDE: e.target.value })} /></F>
                <F label="backgroundEN"><textarea rows={2} className={inputCls} value={editingExit.backgroundEN ?? ""} onChange={(e) => setEditingExit({ ...editingExit, backgroundEN: e.target.value })} /></F>
                <F label="disclaimerDE"><textarea rows={2} className={inputCls} value={editingExit.disclaimerDE ?? ""} onChange={(e) => setEditingExit({ ...editingExit, disclaimerDE: e.target.value })} /></F>
                <F label="disclaimerEN"><textarea rows={2} className={inputCls} value={editingExit.disclaimerEN ?? ""} onChange={(e) => setEditingExit({ ...editingExit, disclaimerEN: e.target.value })} /></F>
                <div className="grid grid-cols-2 gap-3">
                  <F label="sourceUrl"><input className={inputCls} value={editingExit.sourceUrl ?? ""} onChange={(e) => setEditingExit({ ...editingExit, sourceUrl: e.target.value })} /></F>
                  <F label="sourceDE"><input className={inputCls} value={editingExit.sourceDE ?? ""} onChange={(e) => setEditingExit({ ...editingExit, sourceDE: e.target.value })} /></F>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={saveExit} disabled={busy} className="flex items-center gap-2 rounded-lg bg-navy px-6 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"><Save className="h-4 w-4" /> Speichern</button>
                  {editingExit.id && <button onClick={() => deleteExit(editingExit.id!)} disabled={busy} className="flex items-center gap-2 rounded-lg border border-negative px-4 py-2.5 text-sm text-negative"><Trash2 className="h-4 w-4" /> Löschen</button>}
                  <button onClick={() => setEditingExit(null)} className="rounded-lg px-4 py-2.5 text-sm text-navy/60">Abbrechen</button>
                </div>
              </div>
            ) : (
              <p className="text-sm font-light text-navy/50">Exit-Rule aus der Liste wählen oder neu anlegen.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
