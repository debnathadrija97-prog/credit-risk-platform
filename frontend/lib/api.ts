import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000 ';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

export interface PredictionInput {
  applicant_name: string;
  income: number;
  loan_amount: number;
  loan_annuity: number;
  age_years: number;
  employment_years: number;
  ext_source_1?: number;
  ext_source_2?: number;
  ext_source_3?: number;
}

export interface ShapDriver {
  feature: string;
  shap_value: number;
  feature_value: number;
  impact: 'increases_risk' | 'decreases_risk';
}

export interface PredictionResult {
  id: number;
  applicant_name: string;
  risk_score: number;
  default_probability: number;
  risk_band: 'GREEN' | 'AMBER' | 'RED';
  decision: 'APPROVED' | 'REVIEW' | 'REJECTED';
  top_drivers: ShapDriver[];
  created_at: string;
}

export const predictDefault = (data: PredictionInput) =>
  api.post<PredictionResult>('/api/predict', data).then(r => r.data);

export const getApplications = (params?: { risk_band?: string }) =>
  api.get('/api/applications', { params }).then(r => r.data);

export const getPortfolioStats = () =>
  api.get('/api/stats/portfolio').then(r => r.data);