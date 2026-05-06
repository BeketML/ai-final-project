import os
import sys
import numpy as np
import scipy.sparse as sp
import joblib


def skill_tokenizer(x):
    return [s.strip() for s in x.split(',')]


# The TF-IDF vectorizer was pickled with skill_tokenizer defined in __main__.
# Re-inject it so joblib can unpickle successfully.
import __main__
__main__.skill_tokenizer = skill_tokenizer

_BUNDLE_PATH = os.path.join(os.path.dirname(__file__), '..', 'model_artifacts', 'xgboost_model.joblib')

_bundle = None


def _load_bundle():
    global _bundle
    if _bundle is None:
        _bundle = joblib.load(_BUNDLE_PATH)
    return _bundle


def get_all_roles() -> list[str]:
    bundle = _load_bundle()
    return bundle['classes']


def predict(skills: str, qualification: str, experience_level: str) -> dict:
    bundle = _load_bundle()
    model   = bundle['model']
    tfidf   = bundle['tfidf']
    le_qual = bundle['le_qual']
    le_tgt  = bundle['le_target']
    exp_map = bundle['exp_map']

    skills_clean = ', '.join([s.strip() for s in skills.split(',')])
    X_tfidf = tfidf.transform([skills_clean])

    exp_enc = exp_map.get(experience_level.strip(), 1)
    try:
        qual_enc = le_qual.transform([qualification.strip()])[0]
    except ValueError:
        qual_enc = 0

    skill_count = len(skills.split(','))
    degree_num  = 2 if 'PhD' in qualification else (1 if 'Master' in qualification else 0)

    X_cat = sp.csr_matrix([[exp_enc, qual_enc, skill_count, degree_num]])
    X = sp.hstack([X_tfidf, X_cat])

    pred_idx  = model.predict(X)[0]
    pred_role = le_tgt.inverse_transform([pred_idx])[0]

    proba    = model.predict_proba(X)[0]
    top3_idx = np.argsort(proba)[::-1][:3]
    top_3    = [
        {'role': le_tgt.inverse_transform([i])[0], 'probability': round(float(proba[i]), 4)}
        for i in top3_idx
    ]
    all_idx = np.argsort(proba)[::-1]
    all_probabilities = [
        {'role': le_tgt.inverse_transform([i])[0], 'probability': round(float(proba[i]), 4)}
        for i in all_idx
    ]

    return {
        'predicted_role': pred_role,
        'confidence': round(float(proba[pred_idx]), 4),
        'top_3': top_3,
        'all_probabilities': all_probabilities,
    }
