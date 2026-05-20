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
      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
    >
      Abmelden
    </button>
  );
}
