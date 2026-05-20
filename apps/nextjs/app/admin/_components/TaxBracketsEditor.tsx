'use client';
import { useState, useEffect, useCallback } from 'react';

interface Bracket {
  id?: string;
  fromAmount: number;
  toAmount: number | null;
  rate: number;
  year: number;
  employmentType: string;
  countryId: string;
}

const COUNTRIES = [
  { slug: 'de', name: 'Deutschland', id: '' },
  { slug: 'at', name: 'Österreich', id: '' },
  { slug: 'ch', name: 'Schweiz', id: '' },
  { slug: 'nl', name: 'Niederlande', id: '' },
  { slug: 'pt', name: 'Portugal', id: '' },
  { slug: 'es', name: 'Spanien', id: '' },
  { slug: 'fr', name: 'Frankreich', id: '' },
  { slug: 'it', name: 'Italien', id: '' },
  { slug: 'ee', name: 'Estland', id: '' },
  { slug: 'pl', name: 'Polen', id: '' },
  { slug: 'us', name: 'USA', id: '' },
];

const CURRENT_YEAR = new Date().getFullYear();

function fmt(n: number) {
  return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(n);
}

export default function TaxBracketsEditor() {
  const [countrySlug, setCountrySlug] = useState('de');
  const [year, setYear] = useState(CURRENT_YEAR);
  const [brackets, setBrackets] = useState<Bracket[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setSaved(false);
    setDirty(false);
    const res = await fetch(`/api/admin/tax-brackets?country=${countrySlug}&year=${year}`);
    const data: Bracket[] = await res.json();
    setBrackets(data);
    setLoading(false);
  }, [countrySlug, year]);

  useEffect(() => { load(); }, [load]);

  function updateBracket(idx: number, field: keyof Bracket, value: unknown) {
    setBrackets((prev) => prev.map((b, i) => i === idx ? { ...b, [field]: value } : b));
    setDirty(true);
    setSaved(false);
  }

  function addRow() {
    const last = brackets[brackets.length - 1];
    setBrackets((prev) => [
      ...prev,
      {
        fromAmount: last ? (last.toAmount ?? 0) + 1 : 0,
        toAmount: null,
        rate: 0,
        year,
        employmentType: 'employee',
        countryId: last?.countryId ?? '',
      },
    ]);
    setDirty(true);
  }

  function removeRow(idx: number) {
    setBrackets((prev) => prev.filter((_, i) => i !== idx));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    const res = await fetch('/api/admin/tax-brackets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brackets),
    });
    if (res.ok) {
      setSaved(true);
      setDirty(false);
      await load();
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Steuersätze</h1>
          <p className="text-sm text-gray-500 mt-1">Einkommensteuertabellen pro Land und Jahr</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && !dirty && <span className="text-sm text-green-600 font-medium">Gespeichert ✓</span>}
          <button
            onClick={save}
            disabled={!dirty || saving}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-40"
          >
            {saving ? 'Speichern…' : 'Speichern'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Land</label>
          <select value={countrySlug} onChange={(e) => setCountrySlug(e.target.value)} className="input-admin w-44">
            {COUNTRIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Jahr</label>
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="input-admin w-28">
            {[CURRENT_YEAR + 1, CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Lade…</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 text-left">
                <th className="px-5 py-3 font-semibold">Von (€)</th>
                <th className="px-5 py-3 font-semibold">Bis (€)</th>
                <th className="px-5 py-3 font-semibold">Satz (%)</th>
                <th className="px-5 py-3 font-semibold">Beschäft.-typ</th>
                <th className="px-5 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {brackets.map((b, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={b.fromAmount}
                      onChange={(e) => updateBracket(i, 'fromAmount', parseFloat(e.target.value) || 0)}
                      className="input-admin w-32 font-mono"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={b.toAmount ?? ''}
                      placeholder="∞"
                      onChange={(e) => updateBracket(i, 'toAmount', e.target.value ? parseFloat(e.target.value) : null)}
                      className="input-admin w-32 font-mono"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={(b.rate * 100).toFixed(1)}
                      onChange={(e) => updateBracket(i, 'rate', parseFloat(e.target.value) / 100)}
                      className="input-admin w-20 font-mono"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={b.employmentType}
                      onChange={(e) => updateBracket(i, 'employmentType', e.target.value)}
                      className="input-admin w-36"
                    >
                      <option value="employee">employee</option>
                      <option value="self_employed">self_employed</option>
                      <option value="all">all</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <button onClick={() => removeRow(i)} className="text-xs text-red-500 hover:text-red-700 font-medium">Entfernen</button>
                  </td>
                </tr>
              ))}
              {brackets.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-sm">
                    Keine Steuertabelle für {countrySlug.toUpperCase()} / {year}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-gray-100">
            <button onClick={addRow} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              + Zeile hinzufügen
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
