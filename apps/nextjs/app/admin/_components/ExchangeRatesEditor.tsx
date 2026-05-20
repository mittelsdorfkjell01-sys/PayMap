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
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wechselkurse</h1>
          <p className="text-sm text-gray-500 mt-0.5">{rates.length} Paare — werden täglich per Cron aktualisiert</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && !dirty && <span className="text-sm text-green-600 font-medium">Gespeichert ✓</span>}
          <button onClick={save} disabled={!dirty || saving} className="btn-admin-primary">{saving ? 'Speichern…' : 'Änderungen speichern'}</button>
        </div>
      </div>

      {/* Neuen Kurs hinzufügen */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-4 flex items-end gap-3 flex-wrap">
        <div>
          <label className="label-admin">Von</label>
          <input value={newFrom} onChange={(e) => setNewFrom(e.target.value)} maxLength={3} className="input-admin w-20 uppercase font-mono" />
        </div>
        <div>
          <label className="label-admin">Nach</label>
          <input value={newTo} onChange={(e) => setNewTo(e.target.value)} maxLength={3} placeholder="CHF" className="input-admin w-20 uppercase font-mono" />
        </div>
        <div>
          <label className="label-admin">Kurs (1 Von = X Nach)</label>
          <input type="number" step="0.0001" value={newRate} onChange={(e) => setNewRate(e.target.value)} placeholder="1.09" className="input-admin w-32 font-mono" />
        </div>
        <button onClick={addRate} disabled={!newTo || !newRate} className="btn-admin-primary">+ Hinzufügen</button>
      </div>

      {loading ? <p className="text-gray-500 text-sm">Lade…</p> : (
        <div className="space-y-4">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([from, group]) => (
            <div key={from} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-200">
                <span className="font-mono font-bold text-gray-700">1 {from} =</span>
              </div>
              <table className="min-w-full text-sm">
                <tbody className="divide-y divide-gray-100">
                  {group.sort((a, b) => a.toCurrency.localeCompare(b.toCurrency)).map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-5 py-2.5 font-mono font-semibold text-gray-700 w-20">{r.toCurrency}</td>
                      <td className="px-3 py-2">
                        <input
                          type="number" step="0.0001"
                          value={r.rate}
                          onChange={(e) => updateRate(r.id, parseFloat(e.target.value))}
                          className="input-admin w-36 font-mono"
                        />
                      </td>
                      <td className="px-3 py-2 text-gray-400 text-xs">{new Date(r.updatedAt).toLocaleDateString('de-DE')}</td>
                      <td className="px-3 py-2">
                        <button onClick={() => deleteRate(r.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Löschen</button>
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
