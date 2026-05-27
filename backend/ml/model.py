import joblib
import numpy as np
import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv()


class ModelService:
    def __init__(self):
        base = os.path.dirname(__file__)
        self.model = joblib.load(os.path.join(base, 'model.pkl'))
        self.explainer = joblib.load(os.path.join(base, 'explainer.pkl'))
        self.feature_names = joblib.load(os.path.join(base, 'feature_names.pkl'))
        self.feature_medians = joblib.load(os.path.join(base, 'feature_medians.pkl'))
        print(f'Model loaded. Features: {len(self.feature_names)}')

    def preprocess(self, input_dict: dict) -> pd.DataFrame:
        row = self.feature_medians.copy()

        mapping = {
            'AMT_INCOME_TOTAL': input_dict.get('income', 0),
            'AMT_CREDIT': input_dict.get('loan_amount', 0),
            'AMT_ANNUITY': input_dict.get('loan_annuity', 0),
            'AGE_YEARS': input_dict.get('age_years', 35),
            'EMPLOYMENT_YEARS': input_dict.get('employment_years', 5),
            'EXT_SOURCE_1': input_dict.get('ext_source_1'),
            'EXT_SOURCE_2': input_dict.get('ext_source_2'),
            'EXT_SOURCE_3': input_dict.get('ext_source_3'),
        }
        row.update({k: v for k, v in mapping.items() if k in row})

        inc = max(row.get('AMT_INCOME_TOTAL', 1), 1)
        row['CREDIT_INCOME_RATIO'] = row.get('AMT_CREDIT', 0) / inc
        row['ANNUITY_INCOME_RATIO'] = row.get('AMT_ANNUITY', 0) / inc
        row['CREDIT_TERM'] = row.get('AMT_ANNUITY', 0) / max(row.get('AMT_CREDIT', 1), 1)
        row['EMPLOYED_TO_AGE'] = row.get('EMPLOYMENT_YEARS', 0) / max(row.get('AGE_YEARS', 1), 1)

        srcs = [row.get(k) for k in ['EXT_SOURCE_1', 'EXT_SOURCE_2', 'EXT_SOURCE_3']]
        srcs = [float(s) if s is not None else np.nan for s in srcs]
        row['EXT_SOURCE_MEAN'] = np.nanmean(srcs)
        row['EXT_SOURCE_MIN'] = np.nanmin(srcs)
        valid_srcs = [s for s in srcs if not np.isnan(s)]
        row['EXT_SOURCE_PROD'] = np.nanprod(valid_srcs) if valid_srcs else 0.0

        df = pd.DataFrame([row])[self.feature_names]
        df = df.apply(pd.to_numeric, errors='coerce')
        df.fillna(df.median(), inplace=True)
        return df

    def safe_float(self, val):
        try:
            f = float(val)
            return 0.0 if np.isnan(f) or np.isinf(f) else f
        except:
            return 0.0

    def predict(self, input_dict: dict) -> dict:
        df = self.preprocess(input_dict)
        prob = self.safe_float(self.model.predict_proba(df)[0][1])
        score = round(prob * 100, 1)

        if prob < 0.3:
            band, decision = 'GREEN', 'APPROVED'
        elif prob < 0.6:
            band, decision = 'AMBER', 'REVIEW'
        else:
            band, decision = 'RED', 'REJECTED'

        return {'probability': prob, 'score': score, 'band': band, 'decision': decision}

    def explain(self, input_dict: dict) -> list:
        df = self.preprocess(input_dict)
        shap_values = self.explainer.shap_values(df)
        vals = shap_values[0] if isinstance(shap_values, list) else shap_values[0]

        explanations = []
        for feat, val in zip(self.feature_names, vals):
            explanations.append({
                'feature': feat,
                'shap_value': self.safe_float(val),
                'feature_value': self.safe_float(df[feat].values[0]),
                'impact': 'increases_risk' if self.safe_float(val) > 0 else 'decreases_risk'
            })

        explanations.sort(key=lambda x: abs(x['shap_value']), reverse=True)
        return explanations[:10]


_model_service = None


def get_model_service() -> ModelService:
    global _model_service
    if _model_service is None:
        _model_service = ModelService()
    return _model_service