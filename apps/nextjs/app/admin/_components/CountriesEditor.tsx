'use client';
import { useState, useEffect, useCallback } from 'react';

interface Country {
  id: string;
  slug: string;
  nameDE: string;
  nameEN: string;
  currency: string;
  taxType: string;
  isActive: boolean;
  sourceUrl: string | null;
  updatedAt: string;
}

const TAX_TYPES = ['progressive', 'flat', 'zero'];
const EMPTY: Omit<Country, 'id' | 'updatedAt'> = { slug: '', nameDE: '', nameEN: '', currency: '', taxType: 'progressive', isActive: true, sourceUrl: '' };

function Modal({ country, onClose, onSaved }: { country: Country | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!country;
  const [form, setForm] = useState(country ?? EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(k: string, v: unknown) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError('');
    const body = { slug: form.slug, nameDE: form.nameDE, nameEN: form.nameEN, currency: form.currency.toUpperCase(), taxType: form.taxType, isActive: form.isActive, sourceUrl: form.sourceUrl || null };
    const res = isEdit
      ? await fetch(`/api/admin/countries?id=${country!.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      : await fetch('/api/admin/countries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) { onSaved(); }
    else { const d = await res.json(); setError(d.error ?? 'Fehler'); setSaving(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{isEdit ? 'Land bearbeiten' : 'Neues Land'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label-admin">Slug (z.B. "de")</label><input value={form.slug} onChange={(e) => set('slug', e.target.value)} className="input-admin" required disabled={isEdit} /></div>
            <div><label className="label-admin">Währung (ISO)</label><input value={form.currency} onChange={(e) => set('currency', e.target.value)} className="input-admin" maxLength={3} required /></div>
            <div><label className="label-admin">Name (DE)</label><input value={form.nameDE} onChange={(e) => set('nameDE', e.target.value)} className="input-admin" required /></div>
            <div><label className="label-admin">Name (EN)</label><input value={form.nameEN} onChange={(e) => set('nameEN', e.target.value)} className="input-admin" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-admin">Steuertyp</label>
              <select value={form.taxType} onChange={(e) => set('taxType', e.target.value)} className="input-admin">
                {TAX_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="rounded" />
                <span className="text-sm text-gray-700">Aktiv</span>
              </label>
            </div>
          </div>
          <div><label className="label-admin">Quell-URL (optional)</label><input type="url" value={form.sourceUrl ?? ''} onChange={(e) => set('sourceUrl', e.target.value)} className="input-admin" /></div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving} className="btn-admin-primary">{saving ? 'Speichern…' : 'Speichern'}</button>
            <button type="button" onClick={onClose} className="btn-admin-ghost">Abbrechen</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CountriesEditor() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Country | 'new' | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/countries');
    setCountries(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function deactivate(id: string) {
    if (!confirm('Land deaktivieren?')) return;
    await fetch(`/api/admin/countries?id=${id}`, { method: 'DELETE' });
    load();
  }

  const visible = showInactive ? countries : countries.filter((c) => c.isActive);

  const taxTypeBadge: Record<string, string> = {
    progressive: 'bg-blue-100 text-blue-700',
    flat:        'bg-amber-100 text-amber-700',
    zero:        'bg-green-100 text-green-700',
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Länder</h1>
          <p className="text-sm text-gray-500 mt-0.5">{countries.filter((c) => c.isActive).length} aktive Länder</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
            Inaktive anzeigen
          </label>
          <button onClick={() => setModal('new')} className="btn-admin-primary">+ Neues Land</button>
        </div>
      </div>

      {loading ? <p className="text-gray-500 text-sm">Lade…</p> : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs text-gray-500">
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 font-semibold">Name (DE)</th>
                <th className="px-4 py-3 font-semibold">Name (EN)</th>
                <th className="px-4 py-3 font-semibold">Währung</th>
                <th className="px-4 py-3 font-semibold">Steuertyp</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Aktualisiert</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visible.map((c) => (
                <tr key={c.id} className={`hover:bg-gray-50 ${!c.isActive ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-2.5 font-mono text-xs font-semibold text-gray-700">{c.slug}</td>
                  <td className="px-4 py-2.5 font-medium text-gray-900">{c.nameDE}</td>
                  <td className="px-4 py-2.5 text-gray-600">{c.nameEN}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{c.currency}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${taxTypeBadge[c.taxType] ?? 'bg-gray-100 text-gray-600'}`}>{c.taxType}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.isActive ? 'Aktiv' : 'Inaktiv'}</span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-400 text-xs">{new Date(c.updatedAt).toLocaleDateString('de-DE')}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-3">
                      <button onClick={() => setModal(c)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Bearbeiten</button>
                      {c.isActive && <button onClick={() => deactivate(c.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Deaktivieren</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && (
        <Modal
          country={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
