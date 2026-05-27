'use client';
import { useEffect, useState } from 'react';
import { getPortfolioStats } from '@/lib/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getPortfolioStats().then(setStats).catch(console.error);
  }, []);

  if (!stats) return <div className="p-6">Loading...</div>;

  const pieData = [
    { name: 'Approved', value: stats.approved, color: '#16a34a' },
    { name: 'Review', value: stats.review, color: '#d97706' },
    { name: 'Rejected', value: stats.rejected, color: '#dc2626' },
  ];

  const cards = [
    { label: 'Total Applications', value: stats.total, color: 'text-blue-800' },
{ label: 'Approved', value: stats.approved, color: 'text-green-800' },
{ label: 'Under Review', value: stats.review, color: 'text-yellow-800' },
{ label: 'Rejected', value: stats.rejected, color: 'text-red-800' },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Portfolio Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-xl border p-5 shadow-sm">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className={`text-3xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <h3 className="text-base font-semibold mb-4">Decision Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%"
                   innerRadius={60} outerRadius={100}
                   paddingAngle={5} dataKey="value"
                   label={({ name, percent }) =>
                     `${name} ${(percent*100).toFixed(0)}%`}>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <h3 className="text-base font-semibold mb-4">Portfolio Metrics</h3>
          <div className="space-y-4 mt-6">
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-gray-600">Avg. Risk Score</span>
              <span className="font-bold text-lg">{stats.avg_risk_score}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-gray-600">Rejection Rate</span>
              <span className="font-bold text-lg text-red-800">
                {stats.default_rate}%
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600">Override Rate</span>
              <span className="font-bold text-lg text-blue-600">
                {stats.override_rate}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}