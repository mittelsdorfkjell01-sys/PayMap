import { isAdmin } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

// Status nur über Textfarbe auf neutraler Fläche (Spec-konform).
const STATUS_TEXT: Record<string, string> = {
  new:       'text-text',
  reviewing: 'text-warn',
  applied:   'text-pos',
  rejected:  'text-text-3',
};

export default async function AdminFeedbackPage() {
  const auth = await isAdmin();
  if (!auth) redirect('/admin');

  const items = await prisma.userFeedback.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { city: { select: { nameDE: true, slug: true } } },
  });

  const counts = {
    new:       items.filter(i => i.status === 'new').length,
    reviewing: items.filter(i => i.status === 'reviewing').length,
    applied:   items.filter(i => i.status === 'applied').length,
    rejected:  items.filter(i => i.status === 'rejected').length,
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h1 text-text">User Feedback</h1>
        <div className="flex gap-2 text-sm">
          <span className="rounded-sm bg-surface-sub px-2 py-0.5 text-caption text-text">{counts.new} neu</span>
          <span className="rounded-sm bg-surface-sub px-2 py-0.5 text-caption text-warn">{counts.reviewing} in Prüfung</span>
          <span className="rounded-sm bg-surface-sub px-2 py-0.5 text-caption text-pos">{counts.applied} umgesetzt</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line-strong bg-surface-sub text-caption uppercase tracking-[0.04em] text-text-3">
              <th className="px-4 py-3 text-left">Datum</th>
              <th className="px-4 py-3 text-left">Stadt</th>
              <th className="px-4 py-3 text-left">Kategorie</th>
              <th className="px-4 py-3 text-left">Beschreibung</th>
              <th className="px-4 py-3 text-left">E-Mail</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-surface-sub">
                <td className="whitespace-nowrap px-4 py-3 text-text-2">
                  {item.createdAt.toLocaleDateString('de-DE')}
                </td>
                <td className="px-4 py-3 text-text-2">
                  {item.city?.nameDE ?? <span className="text-text-3">Global</span>}
                </td>
                <td className="px-4 py-3 text-text-2">{item.category}</td>
                <td className="max-w-xs px-4 py-3 text-text-2">
                  <span className="line-clamp-2">{item.description}</span>
                </td>
                <td className="px-4 py-3 text-text-2">{item.userEmail ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-sm bg-surface-sub px-2 py-0.5 text-caption ${STATUS_TEXT[item.status] ?? 'text-text-2'}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-text-3">Noch kein Feedback eingegangen.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
