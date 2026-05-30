'use client';
import { useState, useEffect, useCallback } from 'react';

interface SocialContrib {
  id: string;
  type: string;
  rate: number;
  ceiling: number | null;
  employeeSide: boolean;
  year: number;
  countryId: string;
}

interface Country { id: string; slug: string; nameDE: string; }

const CURRENT_YEAR = new Date().getFullYear();

export default function SocialContribEditor() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [countrySlug, setCountrySlug] = useState('de');
  const [year, setYear] = useState(CURRENT_YEAR);
  const [items, setItems] = useState<SocialContrib[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [countryId, setCountryId] = useState('');

  useEffect(() => {
    fetch('/api/admin/countries').then((r) => r.json()).then((data: Country[]) => {
      setCountries(data.filter((c: any) => c.isActive));
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setDirty(false); setSaved(false);
    const res = await fetch(`/api/admin/social-contributions?country=${countrySlug}&year=${year}`);
    const data: SocialContrib[] = await res.json();
    setItems(data);
    const c = countries.find((x) => x.slug === countrySlug);
    if (c) setCountryId(c.id);
    setLoading(false);
  }, [countrySlug, year, countries]);

  useEffect(() => { if (countries.length) load(); }, [load, countries.length]);

  function update(idx: number, field: keyof SocialContrib, value: unknown) {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
    setDirty(true); setSaved(false);
  }

  function addRow() {
    setItems((prev) => [...prev, { id: '', type: '', rate: 0, ceiling: null, employeeSide: true, year, countryId }]);
    setDirty(true);
  }

  async function deleteRow(item: SocialContrib, idx: number) {
    if (item.id) {
      await fetch(`/api/admin/social-contributions?id=${item.id}`, { method: 'DELETE' });
      load();
    } else {
      setItems((prev) => prev.filter((_, i) => i !== idx));
    }
  }

  async function save() {
    setSaving(true);
    await fetch('/api/admin/social-contributions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items.map((item) => ({ ...item, countryId }))),
    });
    setSaved(true); setDirty(false); setSaving(false);
    load();
  }

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h1 text-text">Sozialabgaben</h1>
          <p className="mt-0.5 text-sm text-text-2">Arbeitnehmer-Beiträge pro Land und Jahr</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && !dirty && <span className="text-sm text-pos">Gespeichert ✓</span>}
          <button onClick={save} disabled={!dirty || saving} className="btn-admin-primary">{saving ? 'Speichern…' : 'Speichern'}</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div>
          <label className="label-admin">Land</label>
          <select value={countrySlug} onChange={(e) => setCountrySlug(e.target.value)} className="input-admin w-48">
            {countries.map((c) => <option key={c.id} value={c.slug}>{c.nameDE}</option>)}
          </select>
        </div>
        <div>
          <label className="label-admin">Jahr</label>
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="input-admin w-28">
            {[CURRENT_YEAR + 1, CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? <p className="text-sm text-text-2">Lade…</p> : (
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-line-strong bg-surface-sub text-left text-caption uppercase tracking-[0.04em] text-text-3">
                <th className="px-4 py-3">Beitragsart</th>
                <th className="px-4 py-3">Satz (%)</th>
                <th className="px-4 py-3">Beitragsbemessungsgrenze</th>
                <th className="px-4 py-3">Seite</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {items.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-surface-sub">
                  <td className="px-3 py-2">
                    <input value={item.type} onChange={(e) => update(idx, 'type', e.target.value)} className="input-admin w-44" placeholder="z.B. pension" />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number" step="0.01" min="0" max="100"
                      value={(item.rate * 100).toFixed(2)}
                      onChange={(e) => update(idx, 'rate', parseFloat(e.target.value) / 100)}
                      className="input-admin w-24 tabular"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={item.ceiling ?? ''}
                      placeholder="kein Limit"
                      onChange={(e) => update(idx, 'ceiling', e.target.value ? parseFloat(e.target.value) : null)}
                      className="input-admin w-36 tabular"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select value={item.employeeSide ? 'employee' : 'employer'} onChange={(e) => update(idx, 'employeeSide', e.target.value === 'employee')} className="input-admin w-28">
                      <option value="employee">Arbeitnehmer</option>
                      <option value="employer">Arbeitgeber</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => deleteRow(item, idx)} className="btn-admin-danger">Entfernen</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-text-3">Keine Sozialabgaben für {countrySlug.toUpperCase()} / {year}</td></tr>
              )}
            </tbody>
          </table>
          <div className="border-t border-line px-4 py-3">
            <button onClick={addRow} className="text-sm text-focus hover:underline">+ Zeile hinzufügen</button>
          </div>
        </div>
      )}
    </div>
  );
}
