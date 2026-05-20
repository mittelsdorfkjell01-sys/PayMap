'use client';
import { useState } from 'react';

export default function AdminLoginForm() {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      window.location.href = '/admin';
    } else {
      setError('Falsches Passwort');
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 space-y-5">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-gray-900">PayMap Admin</h1>
        <p className="text-sm text-gray-500">Bitte Passwort eingeben</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Passwort"
          autoFocus
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={!pw || loading}
          className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Anmelden…' : 'Anmelden'}
        </button>
      </form>
    </div>
  );
}
