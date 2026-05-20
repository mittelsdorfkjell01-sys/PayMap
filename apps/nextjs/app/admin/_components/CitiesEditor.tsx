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
    return <div className="text-gray-500 text-sm">Lade Städte…</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Städte — Lifestyle Scores</h1>
          <p className="text-sm text-gray-500 mt-1">Scores 0–100 pro Kategorie und Stadt</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && !isDirty && <span className="text-sm text-green-600 font-medium">Gespeichert ✓</span>}
          <button
            onClick={save}
            disabled={!isDirty || saving}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors"
          >
            {saving ? 'Speichern…' : `Speichern${isDirty ? ` (${Object.values(changes).reduce((s, c) => s + Object.keys(c).length, 0)} Änderungen)` : ''}`}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap min-w-[160px]">Stadt</th>
              {CATEGORIES.map((cat) => (
                <th key={cat} className="px-3 py-3 text-center font-semibold text-gray-600 whitespace-nowrap min-w-[80px] capitalize">
                  {cat.replace('_', ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cities.map((city) => (
              <tr key={city.id} className="hover:bg-gray-50">
                <td className="sticky left-0 bg-white px-4 py-2 font-medium text-gray-900 whitespace-nowrap">
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
                        className={`w-16 px-2 py-1 text-center text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                          isChanged ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200'
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
