import { getUsers } from '@/lib/services/users';
import Image from 'next/image';
import AdminToggle from './AdminToggle';

export default async function UsersAdminPage() {
  const users = await getUsers();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-100">Users</h2>
      </div>

      <div className="relative bg-zinc-900/50 rounded-lg overflow-hidden border border-zinc-800/50 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 animate-gradient-x" />
        <div className="relative">
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-6 py-3 text-zinc-400 font-medium">User</th>
                <th className="px-6 py-3 text-zinc-400 font-medium">Email</th>
                <th className="px-6 py-3 text-zinc-400 font-medium">Role</th>
                <th className="px-6 py-3 text-zinc-400 font-medium">Joined</th>
                <th className="px-6 py-3 text-zinc-400 font-medium">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.profileImage && (
                        <Image
                          src={user.profileImage}
                          alt={user.displayName || 'User'}
                          width={32}
                          height={32}
                          className="rounded-full ring-1 ring-zinc-700/50"
                        />
                      )}
                      <span className="text-zinc-200">{user.displayName || 'Anonymous'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">{user.email}</td>
                  <td className="px-6 py-4">
                    <AdminToggle 
                      email={user.email} 
                      initialIsAdmin={user.isAdmin ?? false}
                      displayName={user.displayName}
                    />
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {user.createdAt.toDate().toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {user.lastLogin 
                      ? user.lastLogin.toDate().toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 