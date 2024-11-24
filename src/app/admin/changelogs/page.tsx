import { getChangelogs } from '@/lib/services/changelog';
import Link from 'next/link';

export default async function ChangelogsAdminPage() {
  const changelogs = await getChangelogs();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Changelogs</h2>
        <Link 
          href="/changelog/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create New
        </Link>
      </div>

      <div className="bg-zinc-900 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-800">
            <tr>
              <th className="px-6 py-3 text-zinc-300">Date</th>
              <th className="px-6 py-3 text-zinc-300">Version</th>
              <th className="px-6 py-3 text-zinc-300">Tag</th>
              <th className="px-6 py-3 text-zinc-300">Features</th>
              <th className="px-6 py-3 text-zinc-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {changelogs.map((changelog) => (
              <tr key={changelog.id} className="hover:bg-zinc-800/50">
                <td className="px-6 py-4 text-zinc-300">{changelog.date}</td>
                <td className="px-6 py-4 text-zinc-300">{changelog.version}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-sm ${changelog.tagColor}`}>
                    {changelog.tag}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-300">
                  {changelog.features.length} features
                </td>
                <td className="px-6 py-4">
                  <Link 
                    href={`/admin/changelogs/${changelog.id}`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 