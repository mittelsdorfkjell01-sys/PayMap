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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(14,14,14,0.4)' }}>
      <div className="w-full max-w-lg space-y-4 rounded-xl border border-line bg-surface p-6 shadow-float">
        <div className="flex items-center justify-between">
          <h2 className="text-h3 text-text">{isEdit ? 'Land bearbeiten' : 'Neues Land'}</h2>
          <button onClick={onClose} className="text-xl text-text-3 transition-colors hover:text-text">✕</button>
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
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="accent-accent" />
                <span className="text-sm text-text">Aktiv</span>
              </label>
            </div>
          </div>
          <div><label className="label-admin">Quell-URL (optional)</label><input type="url" value={form.sourceUrl ?? ''} onChange={(e) => set('sourceUrl', e.target.value)} className="input-admin" /></div>
          {error && <p className="text-sm text-neg">{error}</p>}
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

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h1 text-text">Länder</h1>
          <p className="mt-0.5 text-sm text-text-2">{countries.filter((c) => c.isActive).length} aktive Länder</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-text-2">
            <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} className="accent-accent" />
            Inaktive anzeigen
          </label>
          <button onClick={() => setModal('new')} className="btn-admin-primary">+ Neues Land</button>
        </div>
      </div>

      {loading ? <p className="text-sm text-text-2">Lade…</p> : (
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-line-strong bg-surface-sub text-left text-caption uppercase tracking-[0.04em] text-text-3">
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Name (DE)</th>
                <th className="px-4 py-3">Name (EN)</th>
                <th className="px-4 py-3">Währung</th>
                <th className="px-4 py-3">Steuertyp</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Aktualisiert</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {visible.map((c) => (
                <tr key={c.id} className={`hover:bg-surface-sub ${!c.isActive ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-2.5 tabular text-caption text-text-2">{c.slug}</td>
                  <td className="px-4 py-2.5 text-text">{c.nameDE}</td>
                  <td className="px-4 py-2.5 text-text-2">{c.nameEN}</td>
                  <td className="px-4 py-2.5 tabular text-caption text-text-2">{c.currency}</td>
                  <td className="px-4 py-2.5">
                    <span className="rounded-sm bg-surface-sub px-2 py-0.5 text-caption text-text-2">{c.taxType}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded-sm bg-surface-sub px-2 py-0.5 text-caption ${c.isActive ? 'text-pos' : 'text-text-3'}`}>{c.isActive ? 'Aktiv' : 'Inaktiv'}</span>
                  </td>
                  <td className="px-4 py-2.5 text-caption text-text-3">{new Date(c.updatedAt).toLocaleDateString('de-DE')}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-3">
                      <button onClick={() => setModal(c)} className="text-sm text-focus hover:underline">Bearbeiten</button>
                      {c.isActive && <button onClick={() => deactivate(c.id)} className="btn-admin-danger">Deaktivieren</button>}
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
