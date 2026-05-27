'use client';
import { useState } from 'react';
import { predictDefault, PredictionResult } from '@/lib/api';
import { RiskGauge } from '@/components/RiskGauge';
import { ShapWaterfall } from '@/components/ShapWaterfall';

export default function PredictPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [form, setForm] = useState({
    applicant_name: '', income: '', loan_amount: '',
    loan_annuity: '', age_years: '', employment_years: '',
    ext_source_2: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await predictDefault({
        applicant_name: form.applicant_name,
        income: Number(form.income),
        loan_amount: Number(form.loan_amount),
        loan_annuity: Number(form.loan_annuity),
        age_years: Number(form.age_years),
        employment_years: Number(form.employment_years),
        ext_source_2: form.ext_source_2 ? Number(form.ext_source_2) : undefined,
      });
      setResult(res);
    } catch (err) {
      alert('Error connecting to API. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  const decisionColors = {
    APPROVED: 'bg-green-100 text-green-800 border-green-200',
    REVIEW: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        New Loan Application
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Applicant Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input className={inputClass} value={form.applicant_name}
                onChange={e => setForm({...form, applicant_name: e.target.value})}
                placeholder="e.g. Priya Sharma" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Annual Income (₹)</label>
                <input className={inputClass} type="number" value={form.income}
                  onChange={e => setForm({...form, income: e.target.value})}
                  placeholder="e.g. 600000" required />
              </div>
              <div>
                <label className={labelClass}>Loan Amount (₹)</label>
                <input className={inputClass} type="number" value={form.loan_amount}
                  onChange={e => setForm({...form, loan_amount: e.target.value})}
                  placeholder="e.g. 1500000" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Annual Annuity (₹)</label>
                <input className={inputClass} type="number" value={form.loan_annuity}
                  onChange={e => setForm({...form, loan_annuity: e.target.value})}
                  placeholder="e.g. 80000" required />
              </div>
              <div>
                <label className={labelClass}>Age</label>
                <input className={inputClass} type="number" value={form.age_years}
                  onChange={e => setForm({...form, age_years: e.target.value})}
                  placeholder="e.g. 35" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Years Employed</label>
                <input className={inputClass} type="number" value={form.employment_years}
                  onChange={e => setForm({...form, employment_years: e.target.value})}
                  placeholder="e.g. 5" required />
              </div>
              <div>
                <label className={labelClass}>Credit Score (0-1, optional)</label>
                <input className={inputClass} type="number" step="0.01"
                  min="0" max="1" value={form.ext_source_2}
                  onChange={e => setForm({...form, ext_source_2: e.target.value})}
                  placeholder="e.g. 0.65" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium
                         hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {loading ? 'Assessing Risk...' : 'Assess Credit Risk'}
            </button>
          </form>
        </div>

        {result && (
          <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Risk Assessment</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border
                ${decisionColors[result.decision]}`}>
                {result.decision}
              </span>
            </div>
            <RiskGauge score={result.risk_score} band={result.risk_band} />
            <p className="text-sm text-gray-600 text-center">
              Probability of default: <strong>{result.default_probability}%</strong>
            </p>
            <ShapWaterfall drivers={result.top_drivers} />
          </div>
        )}

        {!result && (
          <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200
                          flex items-center justify-center p-12">
            <p className="text-gray-400 text-center">
              Fill in the form and click Assess Credit Risk to see results
            </p>
          </div>
        )}
      </div>
    </div>
  );
}