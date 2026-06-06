'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [fullName, setFullName] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const name = localStorage.getItem('full_name');
    const token = localStorage.getItem('token');
    // Normalize pathname (strip trailing slash) for robust comparisons
    const cleanPath = pathname?.endsWith('/') && pathname.length > 1
      ? pathname.slice(0, -1)
      : pathname;
    // Allow unauthenticated access to the login and register pages
    if (!token && cleanPath !== '/login' && cleanPath !== '/register') {
      router.push('/login');
    }
    if (name) setFullName(name);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('full_name');
    localStorage.removeItem('role');
    router.push('/login');
  };

  if (!mounted) return null;
  const cleanPath = pathname?.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  if (cleanPath === '/login' || cleanPath === '/register') return null;

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-xl text-blue-700">
          CreditRisk AI
        </span>
        <div className="flex gap-6 text-sm font-medium items-center">
          <Link href="/dashboard"
            className="text-gray-600 hover:text-blue-600 transition-colors">
            Dashboard
          </Link>
          <Link href="/predict"
            className="text-gray-600 hover:text-blue-600 transition-colors">
            New Application
          </Link>
          <Link href="/history"
            className="text-gray-600 hover:text-blue-600 transition-colors">
            History
          </Link>
          <div className="flex items-center gap-3 ml-4 pl-4 border-l">
            <span className="text-gray-600">{fullName}</span>
            <button onClick={handleLogout}
              className="bg-red-50 text-red-600 px-3 py-1 rounded-lg
                         text-xs font-medium hover:bg-red-100 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}