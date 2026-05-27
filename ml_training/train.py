import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__)))

import pandas as pd
import numpy as np
import xgboost as xgb
import optuna
import joblib
import shap
import json
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.metrics import roc_auc_score
from feature_engineering import load_and_prepare

# Load data
print('Loading data...')
X, y = load_and_prepare('data/raw/application_train.csv')
print(f'Dataset shape: {X.shape}, Default rate: {y.mean():.2%}')

# Handle missing values
X.fillna(X.median(numeric_only=True), inplace=True)

# Optuna tuning
def objective(trial):
    params = {
        'n_estimators': trial.suggest_int('n_estimators', 100, 300),
        'max_depth': trial.suggest_int('max_depth', 3, 6),
        'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3, log=True),
        'subsample': trial.suggest_float('subsample', 0.6, 1.0),
        'colsample_bytree': trial.suggest_float('colsample_bytree', 0.6, 1.0),
        'scale_pos_weight': int((y==0).sum() / (y==1).sum()),
        'eval_metric': 'auc',
        'random_state': 42
    }
    model = xgb.XGBClassifier(**params)
    cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)
    scores = cross_val_score(model, X, y, cv=cv, scoring='roc_auc', n_jobs=-1)
    return scores.mean()

print('Running Optuna tuning (20 trials)...')
optuna.logging.set_verbosity(optuna.logging.WARNING)
study = optuna.create_study(direction='maximize')
study.optimize(objective, n_trials=20, show_progress_bar=True)
print(f'Best AUC: {study.best_value:.4f}')

# Train final model
best_params = study.best_params
best_params['scale_pos_weight'] = int((y==0).sum() / (y==1).sum())
best_params['eval_metric'] = 'auc'
best_params['random_state'] = 42

print('Training final model...')
final_model = xgb.XGBClassifier(**best_params)
final_model.fit(X, y)

# Build SHAP Explainer
print('Building SHAP explainer...')
explainer = shap.TreeExplainer(final_model)

# Save everything
os.makedirs('backend/ml', exist_ok=True)
joblib.dump(final_model, 'backend/ml/model.pkl')
joblib.dump(explainer, 'backend/ml/explainer.pkl')
joblib.dump(list(X.columns), 'backend/ml/feature_names.pkl')
joblib.dump(X.median().to_dict(), 'backend/ml/feature_medians.pkl')

with open('backend/ml/model_params.json', 'w') as f:
    json.dump({'best_auc': study.best_value, 'params': study.best_params}, f, indent=2)

print('Done! Model saved to backend/ml/')
print(f'Total features: {X.shape[1]}')