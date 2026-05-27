'use client';
import { useEffect, useState } from 'react';
import { getApplications } from '@/lib/api';

const bandColors: Record<string, string> = {
  GREEN: 'bg-green-100 text-green-700',
  AMBER: 'bg-yellow-100 text-yellow-700',
  RED: 'bg-red-100 text-red-700',
};

export default function HistoryPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    getApplications(filter ? { risk_band: filter } : {}).then(d => setApps(d.items));
  }, [filter]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Application History</h1>
        <select className="border rounded-lg px-3 py-2 text-sm"
                value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Applications</option>
          <option value="GREEN">Low Risk Only</option>
          <option value="AMBER">Medium Risk Only</option>
          <option value="RED">High Risk Only</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['ID','Applicant','Risk Score','Band','Decision','Overridden','Date']
                .map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">
                    {h}
                  </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {apps.map(app => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">#{app.id}</td>
                <td className="px-4 py-3 font-medium text-gray-400">{app.applicant_name}</td>
                <td className="px-4 py-3 text-gray-400">{app.risk_score}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                    ${bandColors[app.risk_band]}`}>{app.risk_band}</span>
                </td>
                <td className="px-4 py-3 text-gray-400">{app.decision}</td>
                <td className="px-4 py-3 text-gray-400">{app.overridden ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3 text-gray-400">
                  {new Date(app.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {apps.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                No applications yet. Submit one from the New Application page.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}