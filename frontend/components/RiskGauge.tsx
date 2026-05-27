'use client';

interface RiskGaugeProps {
  score: number;
  band: 'GREEN' | 'AMBER' | 'RED';
}

export function RiskGauge({ score, band }: RiskGaugeProps) {
  const colors = { GREEN: '#16a34a', AMBER: '#d97706', RED: '#dc2626' };
  const labels = { GREEN: 'Low Risk', AMBER: 'Medium Risk', RED: 'High Risk' };
  const color = colors[band];

  const radius = 80;
  const circumference = Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="120" viewBox="0 0 200 120">
        <path d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none" stroke="#e5e7eb" strokeWidth="16"
          strokeLinecap="round" />
        <path d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none" stroke={color} strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`} />
        <text x="100" y="90" textAnchor="middle"
          fontSize="32" fontWeight="bold" fill={color}>
          {score}
        </text>
        <text x="100" y="112" textAnchor="middle"
          fontSize="11" fill="#6b7280">
          out of 100
        </text>
      </svg>
      <span className="text-lg font-semibold mt-1" style={{ color }}>
        {labels[band]}
      </span>
    </div>
  );
}