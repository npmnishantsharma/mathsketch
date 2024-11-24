import { getSessions } from '@/lib/services/sessions';
import { getUser } from '@/lib/services/users';
import Link from 'next/link';

export default async function SessionsAdminPage() {
  const sessions = await getSessions();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Collaborative Sessions</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.map(async (session) => {
          const creator = await getUser(session.createdBy);
          return (
            <div key={session.id} className="bg-zinc-900 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-white">
                    {session.title || 'Untitled Session'}
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Created by {creator?.name || session.createdBy}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  session.status === 'active' 
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-zinc-500/20 text-zinc-400'
                }`}>
                  {session.status}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-zinc-300">
                  <span className="text-zinc-500">Created:</span>{' '}
                  {new Date(session.createdAt).toLocaleString()}
                </p>
                <p className="text-sm text-zinc-300">
                  <span className="text-zinc-500">Last Active:</span>{' '}
                  {new Date(session.lastActive).toLocaleString()}
                </p>
                <p className="text-sm text-zinc-300">
                  <span className="text-zinc-500">Participants:</span>{' '}
                  {session.participants.length}
                </p>
                {session.duration && (
                  <p className="text-sm text-zinc-300">
                    <span className="text-zinc-500">Duration:</span>{' '}
                    {Math.round(session.duration / 60)} minutes
                  </p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-800">
                <Link
                  href={`/colab/${session.id}`}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  View Session →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 