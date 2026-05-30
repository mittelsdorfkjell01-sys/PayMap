'use client';
import { useState, useEffect } from 'react';

interface Regime {
  id: string;
  nameDE: string;
  nameEN: string;
  flatRate: number;
  durationYears: number;
  qualifications: string[];
  conditionsDE: string;
  conditionsEN: string;
  validFrom: string;
  validTo: string | null;
  sourceUrl: string;
  sourceDE: string;
  updatedAt: string;
  country: { slug: string; nameDE: string };
}

function RegimeModal({ regime, onClose, onSaved }: { regime: Regime; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    nameDE: regime.nameDE,
    nameEN: regime.nameEN,
    flatRate: (regime.flatRate * 100).toString(),
    durationYears: regime.durationYears.toString(),
    conditionsDE: regime.conditionsDE,
    conditionsEN: regime.conditionsEN,
    qualifications: regime.qualifications.join('\n'),
    validFrom: regime.validFrom.slice(0, 10),
    validTo: regime.validTo ? regime.validTo.slice(0, 10) : '',
    sourceUrl: regime.sourceUrl,
    sourceDE: regime.sourceDE,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload: Record<string, unknown> = {
      nameDE: form.nameDE,
      nameEN: form.nameEN,
      flatRate: parseFloat(form.flatRate) / 100,
      durationYears: parseInt(form.durationYears),
      conditionsDE: form.conditionsDE,
      conditionsEN: form.conditionsEN,
      qualifications: form.qualifications.split('\n').map((s) => s.trim()).filter(Boolean),
      validFrom: new Date(form.validFrom).toISOString(),
      validTo: form.validTo ? new Date(form.validTo).toISOString() : null,
      sourceUrl: form.sourceUrl,
      sourceDE: form.sourceDE,
    };
    const res = await fetch(`/api/admin/regimes?id=${regime.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      onSaved();
    } else {
      const d = await res.json();
      setError(JSON.stringify(d.error ?? 'Fehler'));
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(14,14,14,0.4)' }}>
      <div className="max-h-[90vh] w-full max-w-2xl space-y-5 overflow-y-auto rounded-xl border border-line bg-surface p-6 shadow-float">
        <div className="flex items-center justify-between">
          <h2 className="text-h3 text-text">Regime bearbeiten — {regime.country.nameDE}</h2>
          <button onClick={onClose} className="text-xl leading-none text-text-3 transition-colors hover:text-text">✕</button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-admin">Name (DE)</label>
              <input value={form.nameDE} onChange={(e) => setForm((f) => ({ ...f, nameDE: e.target.value }))} className="input-admin" required />
            </div>
            <div>
              <label className="label-admin">Name (EN)</label>
              <input value={form.nameEN} onChange={(e) => setForm((f) => ({ ...f, nameEN: e.target.value }))} className="input-admin" required />
            </div>
            <div>
              <label className="label-admin">Steuersatz (%)</label>
              <input type="number" step="0.1" min="0" max="100" value={form.flatRate} onChange={(e) => setForm((f) => ({ ...f, flatRate: e.target.value }))} className="input-admin" required />
            </div>
            <div>
              <label className="label-admin">Dauer (Jahre)</label>
              <input type="number" value={form.durationYears} onChange={(e) => setForm((f) => ({ ...f, durationYears: e.target.value }))} className="input-admin" required />
            </div>
            <div>
              <label className="label-admin">Gültig ab</label>
              <input type="date" value={form.validFrom} onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))} className="input-admin" required />
            </div>
            <div>
              <label className="label-admin">Gültig bis (leer = unbegrenzt)</label>
              <input type="date" value={form.validTo} onChange={(e) => setForm((f) => ({ ...f, validTo: e.target.value }))} className="input-admin" />
            </div>
            <div>
              <label className="label-admin">Quell-URL</label>
              <input type="url" value={form.sourceUrl} onChange={(e) => setForm((f) => ({ ...f, sourceUrl: e.target.value }))} className="input-admin" required />
            </div>
            <div>
              <label className="label-admin">Quelle (Bezeichnung)</label>
              <input value={form.sourceDE} onChange={(e) => setForm((f) => ({ ...f, sourceDE: e.target.value }))} className="input-admin" required />
            </div>
          </div>

          <div>
            <label className="label-admin">Bedingungen (DE)</label>
            <textarea value={form.conditionsDE} onChange={(e) => setForm((f) => ({ ...f, conditionsDE: e.target.value }))} rows={4} className="input-admin" required />
          </div>
          <div>
            <label className="label-admin">Bedingungen (EN)</label>
            <textarea value={form.conditionsEN} onChange={(e) => setForm((f) => ({ ...f, conditionsEN: e.target.value }))} rows={4} className="input-admin" required />
          </div>
          <div>
            <label className="label-admin">Qualifikationen (eine pro Zeile)</label>
            <textarea value={form.qualifications} onChange={(e) => setForm((f) => ({ ...f, qualifications: e.target.value }))} rows={3} className="input-admin" />
          </div>

          {error && <p className="text-sm text-neg">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-admin-primary py-2">
              {saving ? 'Speichern…' : 'Speichern'}
            </button>
            <button type="button" onClick={onClose} className="btn-admin-ghost py-2">
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RegimesEditor() {
  const [regimes, setRegimes] = useState<Regime[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Regime | null>(null);

  async function load() {
    const res = await fetch('/api/admin/regimes');
    setRegimes(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  if (loading) return <p className="text-sm text-text-2">Lade…</p>;

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-h1 text-text">Steuerregimes</h1>
        <p className="mt-1 text-sm text-text-2">{regimes.length} Sonderregimes</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-line-strong bg-surface-sub text-left text-caption uppercase tracking-[0.04em] text-text-3">
              <th className="px-5 py-3">Land</th>
              <th className="px-5 py-3">Name (DE)</th>
              <th className="px-5 py-3">Steuersatz</th>
              <th className="px-5 py-3">Dauer</th>
              <th className="px-5 py-3">Gültig ab</th>
              <th className="px-5 py-3">Aktualisiert</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {regimes.map((r) => (
              <tr key={r.id} className="hover:bg-surface-sub">
                <td className="px-5 py-3 text-text">{r.country.nameDE}</td>
                <td className="px-5 py-3 text-text-2">{r.nameDE}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-sm bg-surface-sub px-2 py-0.5 text-caption tabular ${r.flatRate === 0 ? 'text-pos' : 'text-text-2'}`}>
                    {(r.flatRate * 100).toFixed(0)} %
                  </span>
                </td>
                <td className="px-5 py-3 text-text-2">
                  {r.durationYears >= 90 ? 'unbegrenzt' : `${r.durationYears} J.`}
                </td>
                <td className="px-5 py-3 tabular text-text-2">{new Date(r.validFrom).getFullYear()}</td>
                <td className="px-5 py-3 text-caption text-text-3">{new Date(r.updatedAt).toLocaleDateString('de-DE')}</td>
                <td className="px-5 py-3">
                  <button onClick={() => setEditing(r)} className="text-sm text-focus hover:underline">Bearbeiten</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <RegimeModal
          regime={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}

    </div>
  );
}
