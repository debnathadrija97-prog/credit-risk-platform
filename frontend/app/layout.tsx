import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Credit Risk Platform',
  description: 'ML-powered credit risk assessment',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white border-b shadow-sm">
            <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
              <span className="font-bold text-xl text-blue-700">
                CreditRisk AI
              </span>
              <div className="flex gap-6 text-sm font-medium">
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
          <main className="py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}