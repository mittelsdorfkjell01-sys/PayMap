'use client';
import { useState, useEffect } from 'react';

interface LifestyleScore {
  id: string;
  category: string;
  score: number;
}

interface City {
  id: string;
  nameDE: string;
  flag: string;
  lifestyle: LifestyleScore[];
}

const CATEGORIES = [
  'safety', 'outdoor', 'gastro', 'social', 'climate',
  'expat_community', 'public_transport', 'healthcare', 'internet',
  'nightlife', 'family_friendly', 'sports',
];

export default function CitiesEditor() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<Record<string, Record<string, number>>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/cities')
      .then((r) => r.json())
      .then(setCities)
      .finally(() => setLoading(false));
  }, []);

  function getScore(city: City, category: string): number {
    if (changes[city.id]?.[category] !== undefined) return changes[city.id][category]!;
    return city.lifestyle.find((l) => l.category === category)?.score ?? 0;
  }

  function setScore(cityId: string, category: string, value: number) {
    setChanges((prev) => ({
      ...prev,
      [cityId]: { ...(prev[cityId] ?? {}), [category]: value },
    }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    const payload: { cityId: string; category: string; score: number }[] = [];
    for (const [cityId, cats] of Object.entries(changes)) {
      for (const [category, score] of Object.entries(cats)) {
        payload.push({ cityId, category, score });
      }
    }
    await fetch('/api/admin/cities', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setChanges({});
    setSaved(true);
    setSaving(false);
  }

  const isDirty = Object.keys(changes).length > 0;

  if (loading) {
    return <div className="text-sm text-text-2">Lade Städte…</div>;
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 text-text">Städte — Lifestyle Scores</h1>
          <p className="mt-1 text-sm text-text-2">Scores 0–100 pro Kategorie und Stadt</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && !isDirty && <span className="text-sm text-pos">Gespeichert ✓</span>}
          <button onClick={save} disabled={!isDirty || saving} className="btn-admin-primary">
            {saving ? 'Speichern…' : `Speichern${isDirty ? ` (${Object.values(changes).reduce((s, c) => s + Object.keys(c).length, 0)} Änderungen)` : ''}`}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-line-strong bg-surface-sub">
              <th className="sticky left-0 min-w-[160px] whitespace-nowrap bg-surface-sub px-4 py-3 text-left text-caption uppercase tracking-[0.04em] text-text-3">Stadt</th>
              {CATEGORIES.map((cat) => (
                <th key={cat} className="min-w-[80px] whitespace-nowrap px-3 py-3 text-center text-caption uppercase tracking-[0.04em] text-text-3">
                  {cat.replace('_', ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {cities.map((city) => (
              <tr key={city.id} className="hover:bg-surface-sub">
                <td className="sticky left-0 whitespace-nowrap bg-surface px-4 py-2 text-text">
                  {city.flag} {city.nameDE}
                </td>
                {CATEGORIES.map((cat) => {
                  const score = getScore(city, cat);
                  const isChanged = changes[city.id]?.[cat] !== undefined;
                  return (
                    <td key={cat} className="px-2 py-1 text-center">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={score}
                        onChange={(e) => setScore(city.id, cat, parseInt(e.target.value) || 0)}
                        className={`w-16 rounded-md border px-2 py-1 text-center text-data-sm tabular text-text focus:border-focus focus:outline-none ${
                          isChanged ? 'border-accent bg-surface-sub' : 'border-line'
                        }`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
