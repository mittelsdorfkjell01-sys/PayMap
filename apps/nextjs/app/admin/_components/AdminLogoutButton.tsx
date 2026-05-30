'use client';

export default function AdminLogoutButton() {
  async function logout() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.href = '/admin';
  }
  return (
    <button
      type="button"
      onClick={logout}
      className="w-full rounded-md px-3 py-2 text-left text-sm text-neg transition-colors hover:bg-surface-sub"
    >
      Abmelden
    </button>
  );
}
