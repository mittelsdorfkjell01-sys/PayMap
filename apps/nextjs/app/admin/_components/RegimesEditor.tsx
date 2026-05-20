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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Regime bearbeiten — {regime.country.nameDE}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Name (DE)</label>
              <input value={form.nameDE} onChange={(e) => setForm((f) => ({ ...f, nameDE: e.target.value }))} className="input-admin" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Name (EN)</label>
              <input value={form.nameEN} onChange={(e) => setForm((f) => ({ ...f, nameEN: e.target.value }))} className="input-admin" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Steuersatz (%)</label>
              <input type="number" step="0.1" min="0" max="100" value={form.flatRate} onChange={(e) => setForm((f) => ({ ...f, flatRate: e.target.value }))} className="input-admin" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Dauer (Jahre)</label>
              <input type="number" value={form.durationYears} onChange={(e) => setForm((f) => ({ ...f, durationYears: e.target.value }))} className="input-admin" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Gültig ab</label>
              <input type="date" value={form.validFrom} onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))} className="input-admin" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Gültig bis (leer = unbegrenzt)</label>
              <input type="date" value={form.validTo} onChange={(e) => setForm((f) => ({ ...f, validTo: e.target.value }))} className="input-admin" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Quell-URL</label>
              <input type="url" value={form.sourceUrl} onChange={(e) => setForm((f) => ({ ...f, sourceUrl: e.target.value }))} className="input-admin" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Quelle (Bezeichnung)</label>
              <input value={form.sourceDE} onChange={(e) => setForm((f) => ({ ...f, sourceDE: e.target.value }))} className="input-admin" required />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Bedingungen (DE)</label>
            <textarea value={form.conditionsDE} onChange={(e) => setForm((f) => ({ ...f, conditionsDE: e.target.value }))} rows={4} className="input-admin" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Bedingungen (EN)</label>
            <textarea value={form.conditionsEN} onChange={(e) => setForm((f) => ({ ...f, conditionsEN: e.target.value }))} rows={4} className="input-admin" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Qualifikationen (eine pro Zeile)</label>
            <textarea value={form.qualifications} onChange={(e) => setForm((f) => ({ ...f, qualifications: e.target.value }))} rows={3} className="input-admin" />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Speichern…' : 'Speichern'}
            </button>
            <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200">
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

  if (loading) return <p className="text-gray-500 text-sm">Lade…</p>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Steuerregimes</h1>
        <p className="text-sm text-gray-500 mt-1">{regimes.length} Sonderregimes</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs text-gray-500">
              <th className="px-5 py-3 font-semibold">Land</th>
              <th className="px-5 py-3 font-semibold">Name (DE)</th>
              <th className="px-5 py-3 font-semibold">Steuersatz</th>
              <th className="px-5 py-3 font-semibold">Dauer</th>
              <th className="px-5 py-3 font-semibold">Gültig ab</th>
              <th className="px-5 py-3 font-semibold">Aktualisiert</th>
              <th className="px-5 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {regimes.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{r.country.nameDE}</td>
                <td className="px-5 py-3 text-gray-800">{r.nameDE}</td>
                <td className="px-5 py-3 font-mono">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    r.flatRate === 0 ? 'bg-green-100 text-green-700' : r.flatRate <= 0.15 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {(r.flatRate * 100).toFixed(0)} %
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-600">
                  {r.durationYears >= 90 ? 'unbegrenzt' : `${r.durationYears} J.`}
                </td>
                <td className="px-5 py-3 text-gray-500">{new Date(r.validFrom).getFullYear()}</td>
                <td className="px-5 py-3 text-gray-400 text-xs">{new Date(r.updatedAt).toLocaleDateString('de-DE')}</td>
                <td className="px-5 py-3">
                  <button onClick={() => setEditing(r)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Bearbeiten</button>
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
