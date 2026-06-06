'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: '', email: '', username: '', password: '', confirm_password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/register', {
        full_name: form.full_name,
        email: form.email,
        username: form.username,
        password: form.password,
      });
      router.push('/login?registered=true');
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">CR</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Sign up for CreditRisk AI</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className={labelClass}>Full Name</label>
            <input className={inputClass} value={form.full_name}
              onChange={e => setForm({...form, full_name: e.target.value})}
              placeholder="e.g. Adrija Debnath" required />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input className={inputClass} type="email" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              placeholder="e.g. adrija@example.com" required />
          </div>
          <div>
            <label className={labelClass}>Username</label>
            <input className={inputClass} value={form.username}
              onChange={e => setForm({...form, username: e.target.value})}
              placeholder="e.g. adrija123" required />
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <input className={inputClass} type="password" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              placeholder="Min 6 characters" required />
          </div>
          <div>
            <label className={labelClass}>Confirm Password</label>
            <input className={inputClass} type="password" value={form.confirm_password}
              onChange={e => setForm({...form, confirm_password: e.target.value})}
              placeholder="Repeat your password" required />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors mt-2"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}