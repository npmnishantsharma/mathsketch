'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'bg-zinc-800/50' : 'hover:bg-zinc-800/30';
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link 
              href="/" 
              className="text-xl font-bold text-zinc-100 hover:text-zinc-200"
            >
              MathSketch
            </Link>
            
            <div className="flex items-center gap-1">
              <Link
                href="/store"
                className={`rounded-md px-3 py-2 text-sm text-zinc-300 transition-colors ${isActive('/store')}`}
              >
                Store
              </Link>
              <Link
                href="/changelog"
                className={`rounded-md px-3 py-2 text-sm text-zinc-300 transition-colors ${isActive('/changelog')}`}
              >
                Changelog
              </Link>
              <Link
                href="/admin/users"
                className={`rounded-md px-3 py-2 text-sm text-zinc-300 transition-colors ${isActive('/admin/users')}`}
              >
                Users
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Add user menu/profile here if needed */}
          </div>
        </div>
      </div>
    </nav>
  );
} 