import { getActiveSessions } from '@/lib/services/sessions';
import { getUser } from '@/lib/services/users';
import Link from 'next/link';

export default async function SessionsPage() {
  const sessions = await getActiveSessions();

  return (
    <div className="min-h-screen bg-zinc-950 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Active Sessions</h1>
          <Link 
            href="/sessions/create" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            New Session
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      Created by {creator?.displayName || session.createdBy}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-sm bg-green-500/20 text-green-400">
                    Active
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-zinc-300">
                    <span className="text-zinc-500">Participants:</span>{' '}
                    {session.participants.length}
                  </p>
                  <p className="text-sm text-zinc-300">
                    <span className="text-zinc-500">Started:</span>{' '}
                    {new Date(session.createdAt).toLocaleString()}
                  </p>
                </div>

                <Link
                  href={`/colab/${session.id}`}
                  className="inline-block px-4 py-2 bg-zinc-800 text-zinc-300 rounded-md hover:bg-zinc-700"
                >
                  Join Session
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 