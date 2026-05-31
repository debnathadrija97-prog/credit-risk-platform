'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
         ResponsiveContainer, ReferenceLine } from 'recharts';
import type { ShapDriver } from '@/lib/api';

const FEATURE_LABELS: Record<string, string> = {
  'CREDIT_INCOME_RATIO': 'Credit / Income Ratio',
  'EXT_SOURCE_MEAN': 'External Score (Average)',
  'EXT_SOURCE_2': 'External Score 2',
  'EXT_SOURCE_1': 'External Score 1',
  'EXT_SOURCE_3': 'External Score 3',
  'ANNUITY_INCOME_RATIO': 'Annuity / Income Ratio',
  'EMPLOYMENT_YEARS': 'Years Employed',
  'AGE_YEARS': 'Applicant Age',
  'CREDIT_TERM': 'Credit Term Length',
  'EXT_SOURCE_PROD': 'External Score (Product)',
  'EXT_SOURCE_MIN': 'External Score (Min)',
  'AMT_CREDIT': 'Loan Amount',
  'AMT_ANNUITY': 'Annual Annuity',
  'GOODS_CREDIT_RATIO': 'Goods / Credit Ratio',
};

export function ShapWaterfall({ drivers }: { drivers: ShapDriver[] }) {
  const data = drivers.slice(0, 8).map(d => ({
    name: FEATURE_LABELS[d.feature] || d.feature.replace(/_/g, ' '),
    value: d.shap_value,
    isPositive: d.shap_value > 0,
  }));

  return (
    <div className="w-full">
      <h3 className="text-base font-semibold mb-3 text-gray-700">
        Top Risk Drivers
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical"
                  margin={{ left: 20, right: 30, top: 5, bottom: 5 }}>
          <XAxis type="number" tickFormatter={v => v.toFixed(2)} />
          <YAxis type="category" dataKey="name" width={160}
                 tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v: any) => (typeof v === 'number' ? v.toFixed(4) : v?.toString() ?? '')} />
          <ReferenceLine x={0} stroke="#374151" />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={index}
                fill={entry.isPositive ? '#dc2626' : '#16a34a'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-500 mt-2">
        Red bars increase risk. Green bars decrease risk.
      </p>
    </div>
  );
}