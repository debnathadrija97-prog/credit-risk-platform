import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Load main training file
df = pd.read_csv('../../data/raw/application_train.csv')

print('Shape:', df.shape)
print('\nTarget distribution:')
print(df['TARGET'].value_counts(normalize=True))

# Check missing values
missing = df.isnull().sum() / len(df) * 100
print('\nColumns with >40% missing:')
print(missing[missing > 40].sort_values(ascending=False))

# Key numeric features
key_features = [
    'AMT_CREDIT', 'AMT_INCOME_TOTAL', 'AMT_ANNUITY',
    'DAYS_BIRTH', 'DAYS_EMPLOYED', 'EXT_SOURCE_2'
]

print('\nBasic stats for key features:')
print(df[key_features].describe())

print('\nEDA complete!')