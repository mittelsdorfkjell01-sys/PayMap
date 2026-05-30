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
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h1 text-text">Steuersätze</h1>
          <p className="mt-1 text-sm text-text-2">Einkommensteuertabellen pro Land und Jahr</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && !dirty && <span className="text-sm text-pos">Gespeichert ✓</span>}
          <button onClick={save} disabled={!dirty || saving} className="btn-admin-primary">
            {saving ? 'Speichern…' : 'Speichern'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="label-admin">Land</label>
          <select value={countrySlug} onChange={(e) => setCountrySlug(e.target.value)} className="input-admin w-44">
            {COUNTRIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label-admin">Jahr</label>
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="input-admin w-28">
            {[CURRENT_YEAR + 1, CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-text-2">Lade…</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-line-strong bg-surface-sub text-left text-caption uppercase tracking-[0.04em] text-text-3">
                <th className="px-5 py-3">Von (€)</th>
                <th className="px-5 py-3">Bis (€)</th>
                <th className="px-5 py-3">Satz (%)</th>
                <th className="px-5 py-3">Beschäft.-typ</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {brackets.map((b, i) => (
                <tr key={i} className="hover:bg-surface-sub">
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={b.fromAmount}
                      onChange={(e) => updateBracket(i, 'fromAmount', parseFloat(e.target.value) || 0)}
                      className="input-admin w-32 tabular"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={b.toAmount ?? ''}
                      placeholder="∞"
                      onChange={(e) => updateBracket(i, 'toAmount', e.target.value ? parseFloat(e.target.value) : null)}
                      className="input-admin w-32 tabular"
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
                      className="input-admin w-20 tabular"
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
                    <button onClick={() => removeRow(i)} className="btn-admin-danger">Entfernen</button>
                  </td>
                </tr>
              ))}
              {brackets.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-text-3">
                    Keine Steuertabelle für {countrySlug.toUpperCase()} / {year}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="border-t border-line px-5 py-3">
            <button onClick={addRow} className="text-sm text-focus hover:underline">
              + Zeile hinzufügen
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
