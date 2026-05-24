import { isAdmin } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

const STATUS_COLORS: Record<string, string> = {
  new:       'bg-blue-100 text-blue-800',
  reviewing: 'bg-yellow-100 text-yellow-800',
  applied:   'bg-green-100 text-green-800',
  rejected:  'bg-gray-100 text-gray-600',
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">User Feedback</h1>
        <div className="flex gap-3 text-sm">
          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{counts.new} neu</span>
          <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">{counts.reviewing} in Prüfung</span>
          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{counts.applied} umgesetzt</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Datum</th>
              <th className="px-4 py-3 text-left">Stadt</th>
              <th className="px-4 py-3 text-left">Kategorie</th>
              <th className="px-4 py-3 text-left">Beschreibung</th>
              <th className="px-4 py-3 text-left">E-Mail</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {item.createdAt.toLocaleDateString('de-DE')}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {item.city?.nameDE ?? <span className="text-gray-400">Global</span>}
                </td>
                <td className="px-4 py-3 text-gray-700">{item.category}</td>
                <td className="px-4 py-3 text-gray-700 max-w-xs">
                  <span className="line-clamp-2">{item.description}</span>
                </td>
                <td className="px-4 py-3 text-gray-500">{item.userEmail ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[item.status] ?? ''}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Noch kein Feedback eingegangen.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
