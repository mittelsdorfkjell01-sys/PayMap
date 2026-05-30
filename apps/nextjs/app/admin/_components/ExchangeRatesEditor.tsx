'use client';
import { useState, useEffect, useCallback } from 'react';

interface Rate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  updatedAt: string;
}

export default function ExchangeRatesEditor() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newFrom, setNewFrom] = useState('EUR');
  const [newTo, setNewTo] = useState('');
  const [newRate, setNewRate] = useState('');

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/exchange-rates');
    setRates(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function updateRate(id: string, value: number) {
    setRates((prev) => prev.map((r) => r.id === id ? { ...r, rate: value } : r));
    setDirty(true); setSaved(false);
  }

  async function save() {
    setSaving(true);
    await fetch('/api/admin/exchange-rates', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rates.map(({ id, fromCurrency, toCurrency, rate }) => ({ id, fromCurrency, toCurrency, rate }))),
    });
    setSaved(true); setDirty(false); setSaving(false);
    load();
  }

  async function addRate() {
    if (!newTo || !newRate) return;
    await fetch('/api/admin/exchange-rates', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ fromCurrency: newFrom.toUpperCase(), toCurrency: newTo.toUpperCase(), rate: parseFloat(newRate) }]),
    });
    setNewTo(''); setNewRate('');
    load();
  }

  async function deleteRate(id: string) {
    if (!confirm('Wechselkurs löschen?')) return;
    await fetch(`/api/admin/exchange-rates?id=${id}`, { method: 'DELETE' });
    load();
  }

  const grouped = rates.reduce<Record<string, Rate[]>>((acc, r) => {
    if (!acc[r.fromCurrency]) acc[r.fromCurrency] = [];
    acc[r.fromCurrency]!.push(r);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h1 text-text">Wechselkurse</h1>
          <p className="mt-0.5 text-sm text-text-2">{rates.length} Paare — werden täglich per Cron aktualisiert</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && !dirty && <span className="text-sm text-pos">Gespeichert ✓</span>}
          <button onClick={save} disabled={!dirty || saving} className="btn-admin-primary">{saving ? 'Speichern…' : 'Änderungen speichern'}</button>
        </div>
      </div>

      {/* Neuen Kurs hinzufügen */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-line bg-surface-sub px-5 py-4">
        <div>
          <label className="label-admin">Von</label>
          <input value={newFrom} onChange={(e) => setNewFrom(e.target.value)} maxLength={3} className="input-admin w-20 uppercase tabular" />
        </div>
        <div>
          <label className="label-admin">Nach</label>
          <input value={newTo} onChange={(e) => setNewTo(e.target.value)} maxLength={3} placeholder="CHF" className="input-admin w-20 uppercase tabular" />
        </div>
        <div>
          <label className="label-admin">Kurs (1 Von = X Nach)</label>
          <input type="number" step="0.0001" value={newRate} onChange={(e) => setNewRate(e.target.value)} placeholder="1.09" className="input-admin w-32 tabular" />
        </div>
        <button onClick={addRate} disabled={!newTo || !newRate} className="btn-admin-primary">+ Hinzufügen</button>
      </div>

      {loading ? <p className="text-sm text-text-2">Lade…</p> : (
        <div className="space-y-4">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([from, group]) => (
            <div key={from} className="overflow-hidden rounded-lg border border-line bg-surface">
              <div className="border-b border-line bg-surface-sub px-5 py-2.5">
                <span className="tabular text-text-2">1 {from} =</span>
              </div>
              <table className="min-w-full text-sm">
                <tbody className="divide-y divide-line-soft">
                  {group.sort((a, b) => a.toCurrency.localeCompare(b.toCurrency)).map((r) => (
                    <tr key={r.id} className="hover:bg-surface-sub">
                      <td className="w-20 px-5 py-2.5 tabular text-text-2">{r.toCurrency}</td>
                      <td className="px-3 py-2">
                        <input
                          type="number" step="0.0001"
                          value={r.rate}
                          onChange={(e) => updateRate(r.id, parseFloat(e.target.value))}
                          className="input-admin w-36 tabular"
                        />
                      </td>
                      <td className="px-3 py-2 text-caption text-text-3">{new Date(r.updatedAt).toLocaleDateString('de-DE')}</td>
                      <td className="px-3 py-2">
                        <button onClick={() => deleteRate(r.id)} className="btn-admin-danger">Löschen</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
