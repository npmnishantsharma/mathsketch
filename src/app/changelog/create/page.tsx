import { Metadata } from 'next';
import ChangelogForm from './ChangelogForm';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';

export const metadata: Metadata = {
  title: 'Create Changelog | MathSketch',
  description: 'Add a new changelog entry',
};

export default async function CreateChangelogPage() {
  const session = await getServerSession(authOptions);
  
  // Protect the page - only allow admins
  // if (!session?.user?.email || !session.user.isAdmin) {
  //   redirect('/');
  // }

  return (
    <div className="min-h-screen bg-zinc-950 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-white mb-8">Create Changelog Entry</h1>
        <ChangelogForm />
      </div>
    </div>
  );
} 