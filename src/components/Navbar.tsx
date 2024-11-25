'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'bg-[#1a1b1e]/80' : 'hover:bg-[#1a1b1e]/40';
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#1a1b1e] bg-gradient-to-b from-[#0a0b0c] via-[#12131a] to-[#12131a] backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link 
              href="/" 
              className="text-xl font-bold text-white hover:text-zinc-200 transition-colors"
            >
              MathSketch
            </Link>
            
            <div className="flex items-center gap-1">
              <Link
                href="/store"
                className={`rounded-md px-3 py-2 text-sm text-zinc-100 transition-colors ${isActive('/store')}`}
              >
                Store
              </Link>
              <Link
                href="/changelog"
                className={`rounded-md px-3 py-2 text-sm text-zinc-100 transition-colors ${isActive('/changelog')}`}
              >
                Changelog
              </Link>
              <Link
                href="/admin/users"
                className={`rounded-md px-3 py-2 text-sm text-zinc-100 transition-colors ${isActive('/admin/users')}`}
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