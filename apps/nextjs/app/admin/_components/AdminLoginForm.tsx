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
    <div className="w-full max-w-sm space-y-5 rounded-xl border border-line bg-surface p-8 shadow-float">
      <div className="space-y-1">
        <h1 className="text-h2 text-text">PayMap Admin</h1>
        <p className="text-sm text-text-2">Bitte Passwort eingeben</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Passwort"
          autoFocus
          className="input-admin"
        />
        {error && <p className="text-sm text-neg">{error}</p>}
        <button
          type="submit"
          disabled={!pw || loading}
          className="btn-admin-primary w-full py-2.5"
        >
          {loading ? 'Anmelden…' : 'Anmelden'}
        </button>
      </form>
    </div>
  );
}
