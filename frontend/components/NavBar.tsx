'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NavBar() {
  const pathname = usePathname();

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
        </div>
      </div>
    </nav>
  );
}