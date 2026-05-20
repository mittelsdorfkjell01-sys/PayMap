'use client';
import { useState, useEffect, useCallback } from 'react';

interface GuideStep {
  id: string;
  cityId: string;
  stepOrder: number;
  phase: string;
  titleDE: string;
  titleEN: string;
  subtitleDE: string | null;
  subtitleEN: string | null;
  timingDE: string;
  timingEN: string;
  isWarning: boolean;
  tags: string[];
  isActive: boolean;
  infoBoxDE: string | null;
  infoBoxType: string | null;
  forEmployed: boolean;
  forFreelancer: boolean;
  forFamily: boolean;
  city: { slug: string; nameDE: string };
}

const PHASES = ['preparation', 'phase_1', 'phase_2', 'phase_3', 'phase_4', 'first_3_months'];
const TAGS = ['doc_needed', 'critical', 'timing_critical', 'external_expert'];

function StepModal({
  step,
  cityOptions,
  onClose,
  onSaved,
}: {
  step: GuideStep | null;
  cityOptions: { id: string; nameDE: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!step;
  const [form, setForm] = useState({
    cityId: step?.cityId ?? '',
    stepOrder: step?.stepOrder ?? 1,
    phase: step?.phase ?? 'preparation',
    titleDE: step?.titleDE ?? '',
    titleEN: step?.titleEN ?? '',
    subtitleDE: step?.subtitleDE ?? '',
    subtitleEN: step?.subtitleEN ?? '',
    timingDE: step?.timingDE ?? '',
    timingEN: step?.timingEN ?? '',
    isWarning: step?.isWarning ?? false,
    infoBoxDE: step?.infoBoxDE ?? '',
    infoBoxType: step?.infoBoxType ?? 'info',
    tags: step?.tags ?? [] as string[],
    forEmployed: step?.forEmployed ?? true,
    forFreelancer: step?.forFreelancer ?? true,
    forFamily: step?.forFamily ?? true,
    isActive: step?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function toggleTag(tag: string) {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      subtitleDE: form.subtitleDE || undefined,
      subtitleEN: form.subtitleEN || undefined,
      infoBoxDE: form.infoBoxDE || undefined,
    };
    const res = isEdit
      ? await fetch(`/api/admin/moving-guide/${step!.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      : await fetch('/api/admin/moving-guide', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

    if (res.ok) {
      onSaved();
    } else {
      const d = await res.json();
      setError(JSON.stringify(d.error ?? 'Fehler'));
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{isEdit ? 'Schritt bearbeiten' : 'Neuer Schritt'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Stadt</label>
              <select value={form.cityId} onChange={(e) => setForm((f) => ({ ...f, cityId: e.target.value }))} className="input-admin" required>
                <option value="">— wählen —</option>
                {cityOptions.map((c) => <option key={c.id} value={c.id}>{c.nameDE}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Phase</label>
              <select value={form.phase} onChange={(e) => setForm((f) => ({ ...f, phase: e.target.value }))} className="input-admin">
                {PHASES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Titel (DE)</label>
              <input value={form.titleDE} onChange={(e) => setForm((f) => ({ ...f, titleDE: e.target.value }))} className="input-admin" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Titel (EN)</label>
              <input value={form.titleEN} onChange={(e) => setForm((f) => ({ ...f, titleEN: e.target.value }))} className="input-admin" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Untertitel (DE)</label>
              <input value={form.subtitleDE} onChange={(e) => setForm((f) => ({ ...f, subtitleDE: e.target.value }))} className="input-admin" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Untertitel (EN)</label>
              <input value={form.subtitleEN} onChange={(e) => setForm((f) => ({ ...f, subtitleEN: e.target.value }))} className="input-admin" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Timing (DE)</label>
              <input value={form.timingDE} onChange={(e) => setForm((f) => ({ ...f, timingDE: e.target.value }))} className="input-admin" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Timing (EN)</label>
              <input value={form.timingEN} onChange={(e) => setForm((f) => ({ ...f, timingEN: e.target.value }))} className="input-admin" required />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Info-Box Text (DE)</label>
            <textarea value={form.infoBoxDE} onChange={(e) => setForm((f) => ({ ...f, infoBoxDE: e.target.value }))} rows={2} className="input-admin" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 text-xs rounded-full font-semibold transition-colors ${
                    form.tags.includes(tag)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            {(['isWarning', 'forEmployed', 'forFreelancer', 'forFamily', 'isActive'] as const).map((key) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[key] as boolean}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-gray-700">{key}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Reihenfolge</label>
            <input
              type="number"
              value={form.stepOrder}
              onChange={(e) => setForm((f) => ({ ...f, stepOrder: parseInt(e.target.value) || 1 }))}
              className="input-admin w-24"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Speichern…' : 'Speichern'}
            </button>
            <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200">
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MovingGuideEditor() {
  const [steps, setSteps] = useState<GuideStep[]>([]);
  const [cityOptions, setCityOptions] = useState<{ id: string; slug: string; nameDE: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('');
  const [modalStep, setModalStep] = useState<GuideStep | 'new' | null>(null);

  const load = useCallback(async () => {
    const url = cityFilter ? `/api/admin/moving-guide?city=${cityFilter}` : '/api/admin/moving-guide';
    const res = await fetch(url);
    const data: GuideStep[] = await res.json();
    setSteps(data);
    const unique = Array.from(new Map(data.map((s) => [s.cityId, { id: s.cityId, slug: s.city.slug, nameDE: s.city.nameDE }])).values());
    setCityOptions(unique);
    setLoading(false);
  }, [cityFilter]);

  useEffect(() => { load(); }, [load]);

  async function deleteStep(id: string) {
    if (!confirm('Schritt deaktivieren?')) return;
    await fetch(`/api/admin/moving-guide/${id}`, { method: 'DELETE' });
    load();
  }

  const grouped = steps.reduce<Record<string, GuideStep[]>>((acc, s) => {
    const key = s.city.nameDE;
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Moving Guide</h1>
          <p className="text-sm text-gray-500 mt-1">{steps.length} aktive Schritte</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="input-admin w-48"
          >
            <option value="">Alle Städte</option>
            {cityOptions.map((c) => <option key={c.id} value={c.slug}>{c.nameDE}</option>)}
          </select>
          <button
            onClick={() => setModalStep('new')}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700"
          >
            + Neuer Schritt
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Lade…</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([city, citySteps]) => (
            <div key={city} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">{city}</h2>
              </div>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                    <th className="px-5 py-2 font-semibold">#</th>
                    <th className="px-5 py-2 font-semibold">Phase</th>
                    <th className="px-5 py-2 font-semibold">Titel (DE)</th>
                    <th className="px-5 py-2 font-semibold">Timing</th>
                    <th className="px-5 py-2 font-semibold">Tags</th>
                    <th className="px-5 py-2 font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {citySteps.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-5 py-2.5 text-gray-500 font-mono">{s.stepOrder}</td>
                      <td className="px-5 py-2.5">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{s.phase}</span>
                      </td>
                      <td className="px-5 py-2.5 font-medium text-gray-900">{s.titleDE}</td>
                      <td className="px-5 py-2.5 text-gray-500">{s.timingDE}</td>
                      <td className="px-5 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {s.tags.map((t) => (
                            <span key={t} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded">{t}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="flex gap-2">
                          <button onClick={() => setModalStep(s)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Bearbeiten</button>
                          <button onClick={() => deleteStep(s.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Löschen</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          {steps.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-12">Keine Schritte gefunden.</p>
          )}
        </div>
      )}

      {modalStep !== null && (
        <StepModal
          step={modalStep === 'new' ? null : modalStep}
          cityOptions={cityOptions}
          onClose={() => setModalStep(null)}
          onSaved={() => { setModalStep(null); load(); }}
        />
      )}

    </div>
  );
}
