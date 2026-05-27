import pandas as pd
import numpy as np

def engineer_features(df):
    df = df.copy()

    # Fix DAYS_EMPLOYED anomaly (365243 means unemployed)
    df['DAYS_EMPLOYED_ANOM'] = df['DAYS_EMPLOYED'] == 365243
    df['DAYS_EMPLOYED'] = df['DAYS_EMPLOYED'].replace(365243, np.nan)

    # Ratio features
    df['CREDIT_INCOME_RATIO'] = df['AMT_CREDIT'] / (df['AMT_INCOME_TOTAL'] + 1)
    df['ANNUITY_INCOME_RATIO'] = df['AMT_ANNUITY'] / (df['AMT_INCOME_TOTAL'] + 1)
    df['CREDIT_TERM'] = df['AMT_ANNUITY'] / (df['AMT_CREDIT'] + 1)
    df['GOODS_CREDIT_RATIO'] = df['AMT_GOODS_PRICE'] / (df['AMT_CREDIT'] + 1)

    # Age features
    df['AGE_YEARS'] = -df['DAYS_BIRTH'] / 365.25
    df['EMPLOYMENT_YEARS'] = -df['DAYS_EMPLOYED'].clip(upper=0) / 365.25
    df['EMPLOYED_TO_AGE'] = df['EMPLOYMENT_YEARS'] / (df['AGE_YEARS'] + 1)

    # External score combinations
    df['EXT_SOURCE_MEAN'] = df[['EXT_SOURCE_1','EXT_SOURCE_2','EXT_SOURCE_3']].mean(axis=1)
    df['EXT_SOURCE_MIN'] = df[['EXT_SOURCE_1','EXT_SOURCE_2','EXT_SOURCE_3']].min(axis=1)
    df['EXT_SOURCE_PROD'] = df['EXT_SOURCE_1'] * df['EXT_SOURCE_2'] * df['EXT_SOURCE_3']

    # Document flag count
    doc_cols = [c for c in df.columns if 'FLAG_DOCUMENT' in c]
    df['DOCUMENT_COUNT'] = df[doc_cols].sum(axis=1)

    # Drop columns with too many nulls
    null_pct = df.isnull().mean()
    drop_cols = null_pct[null_pct > 0.6].index.tolist()
    df.drop(columns=drop_cols, inplace=True)

    # Drop ID
    drop_always = ['SK_ID_CURR']
    df.drop(columns=[c for c in drop_always if c in df.columns], inplace=True)

    return df


def load_and_prepare(train_path):
    train = pd.read_csv(train_path)
    y = train['TARGET']
    train.drop(columns=['TARGET'], inplace=True)

    train_fe = engineer_features(train)

    # Encode categoricals
    cat_cols = train_fe.select_dtypes(include='object').columns
    train_fe = pd.get_dummies(train_fe, columns=cat_cols, drop_first=True)

    return train_fe, y