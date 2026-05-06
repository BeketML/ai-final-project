"""
Trains an XGBoost job-role classifier on the CSV and saves the full bundle
to model_artifacts/job_role_predictor.joblib.
Run once: python train.py
"""
import os, sys
import numpy as np
import pandas as pd
import scipy.sparse as sp
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier

DATA_PATH   = os.path.join(os.path.dirname(__file__), '..', 'data', 'candidate_job_role_dataset.csv')
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), '..', 'model_artifacts', 'xgboost_model.joblib')


def skill_tokenizer(x):
    return [s.strip() for s in x.split(',')]


def main():
    print("Loading data...")
    df = pd.read_csv(DATA_PATH)
    df.drop('candidate_id', axis=1, inplace=True)

    for col in ['qualification', 'experience_level', 'job_role']:
        df[col] = df[col].str.strip().str.rstrip(',')

    role_counts = df['job_role'].value_counts()
    rare = role_counts[role_counts < 5].index.tolist()
    df = df[~df['job_role'].isin(rare)].reset_index(drop=True)
    print(f"Dataset: {df.shape[0]} rows, {df['job_role'].nunique()} classes")

    tfidf = TfidfVectorizer(tokenizer=skill_tokenizer, token_pattern=None, max_features=100)
    X_skills = tfidf.fit_transform(df['skills'])

    exp_map = {'Entry': 0, 'Mid': 1, 'Senior': 2}
    df['exp_enc'] = df['experience_level'].map(exp_map)

    le_qual = LabelEncoder()
    df['qual_enc'] = le_qual.fit_transform(df['qualification'])

    df['skill_count']    = df['skills'].apply(lambda x: len(x.split(',')))
    df['degree_level']   = df['qualification'].apply(
        lambda x: 2 if 'PhD' in x else (1 if 'Master' in x else 0)
    )

    X_cat = sp.csr_matrix(df[['exp_enc', 'qual_enc', 'skill_count', 'degree_level']].values)
    X = sp.hstack([X_skills, X_cat])

    le_target = LabelEncoder()
    y = le_target.fit_transform(df['job_role'])

    print("Training XGBoost...")
    model = XGBClassifier(
        n_estimators=200,
        learning_rate=0.1,
        max_depth=6,
        eval_metric='mlogloss',
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X, y)

    preds = model.predict(X)
    acc = (preds == y).mean()
    print(f"Train accuracy: {acc:.4f}")

    bundle = {
        'model':       model,
        'tfidf':       tfidf,
        'le_qual':     le_qual,
        'le_target':   le_target,
        'exp_map':     exp_map,
        'model_name':  'XGBoost',
        'classes':     list(le_target.classes_),
    }

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    joblib.dump(bundle, OUTPUT_PATH)
    print(f"Bundle saved → {OUTPUT_PATH}")


if __name__ == '__main__':
    main()
