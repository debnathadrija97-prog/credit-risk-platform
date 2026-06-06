'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send standard JSON! This perfectly matches your new mock auth.py
      const res = await api.post('/api/auth/login', {
        username: username,
        password: password
      });

      console.log('Login response:', res.data);
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('full_name', res.data.full_name);
      localStorage.setItem('role', res.data.role);

      router.push('/dashboard');
    } catch (err: any) {
      console.log('Login API error details:', err.response?.data || err.message);
      
      const detail = err.response?.data?.detail;
      
      if (Array.isArray(detail)) {
        const errorMessages = detail.map((d: any) => `${d.loc.slice(-1)}: ${d.msg}`).join(' | ');
        setError(`Validation error -> ${errorMessages}`);
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Invalid username or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center
                          justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">CR</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">CreditRisk AI</h1>
          <p className="text-gray-500 text-sm mt-1">
            Sign in to your account
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700
                          rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2
                         text-sm text-black focus:outline-none focus:ring-2
                         focus:ring-blue-500"
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2
                         text-sm text-black focus:outline-none focus:ring-2
                         focus:ring-blue-500"
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg
                       font-medium hover:bg-blue-700 disabled:opacity-50
                       transition-colors mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account?{' '}
            <a
              href="/register"
              onClick={(e) => { e.preventDefault(); window.location.href = '/register'; }}
              className="text-blue-600 hover:underline font-medium"
            >
              Sign Up
            </a>
          </p>
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <p className="text-xs font-medium text-gray-600 mb-2">
            Demo Credentials:
          </p>
          <div className="space-y-1 text-xs text-gray-500">
            <p>👤 Admin: <span className="font-mono">admin</span> /
              <span className="font-mono"> admin123</span></p>
            <p>👤 Officer: <span className="font-mono">officer</span> /
              <span className="font-mono"> officer123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}