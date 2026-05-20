'use client';
import { useState, useEffect, useCallback } from 'react';

interface Deduction {
  id: string;
  type: string;
  amount: number | null;
  percentage: number | null;
  condition: string | null;
  year: number;
  countryId: string;
}

interface Country { id: string; slug: string; nameDE: string; }

const CURRENT_YEAR = new Date().getFullYear();

export default function DeductionsEditor() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [countrySlug, setCountrySlug] = useState('de');
  const [year, setYear] = useState(CURRENT_YEAR);
  const [items, setItems] = useState<Deduction[]>([]);
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
    const res = await fetch(`/api/admin/deductions?country=${countrySlug}&year=${year}`);
    const data: Deduction[] = await res.json();
    setItems(data);
    const c = countries.find((x) => x.slug === countrySlug);
    if (c) setCountryId(c.id);
    setLoading(false);
  }, [countrySlug, year, countries]);

  useEffect(() => { if (countries.length) load(); }, [load, countries.length]);

  function update(idx: number, field: keyof Deduction, value: unknown) {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
    setDirty(true); setSaved(false);
  }

  function addRow() {
    setItems((prev) => [...prev, { id: '', type: '', amount: null, percentage: null, condition: null, year, countryId }]);
    setDirty(true);
  }

  async function deleteRow(item: Deduction, idx: number) {
    if (item.id) {
      await fetch(`/api/admin/deductions?id=${item.id}`, { method: 'DELETE' });
      load();
    } else {
      setItems((prev) => prev.filter((_, i) => i !== idx));
    }
  }

  async function save() {
    setSaving(true);
    await fetch('/api/admin/deductions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items.map((item) => ({ ...item, countryId }))),
    });
    setSaved(true); setDirty(false); setSaving(false);
    load();
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Freibeträge & Abzüge</h1>
          <p className="text-sm text-gray-500 mt-0.5">Pauschalbeträge und Prozentabzüge pro Land und Jahr</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && !dirty && <span className="text-sm text-green-600 font-medium">Gespeichert ✓</span>}
          <button onClick={save} disabled={!dirty || saving} className="btn-admin-primary">{saving ? 'Speichern…' : 'Speichern'}</button>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
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

      {loading ? <p className="text-gray-500 text-sm">Lade…</p> : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 text-left">
                <th className="px-4 py-3 font-semibold">Typ / Bezeichnung</th>
                <th className="px-4 py-3 font-semibold">Betrag (€ / Währung)</th>
                <th className="px-4 py-3 font-semibold">Prozent (%)</th>
                <th className="px-4 py-3 font-semibold">Bedingung</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <input value={item.type} onChange={(e) => update(idx, 'type', e.target.value)} className="input-admin w-44" placeholder="z.B. grundfreibetrag" />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number" step="1"
                      value={item.amount ?? ''}
                      placeholder="—"
                      onChange={(e) => update(idx, 'amount', e.target.value ? parseFloat(e.target.value) : null)}
                      className="input-admin w-32 font-mono"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number" step="0.1" min="0" max="100"
                      value={item.percentage != null ? (item.percentage * 100).toFixed(1) : ''}
                      placeholder="—"
                      onChange={(e) => update(idx, 'percentage', e.target.value ? parseFloat(e.target.value) / 100 : null)}
                      className="input-admin w-24 font-mono"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input value={item.condition ?? ''} onChange={(e) => update(idx, 'condition', e.target.value || null)} className="input-admin w-36" placeholder="z.B. employed" />
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => deleteRow(item, idx)} className="text-xs text-red-500 hover:text-red-700 font-medium">Entfernen</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Keine Freibeträge für {countrySlug.toUpperCase()} / {year}</td></tr>
              )}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-gray-100">
            <button onClick={addRow} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">+ Zeile hinzufügen</button>
          </div>
        </div>
      )}
    </div>
  );
}
