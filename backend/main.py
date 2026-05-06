import logging
import os
from contextlib import asynccontextmanager

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import PredictRequest, PredictResponse, RolePrediction
import predictor

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost,http://localhost:5173,http://127.0.0.1:5173",
).split(",")

_DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'candidate_job_role_dataset.csv')


@asynccontextmanager
async def lifespan(app: FastAPI):
    bundle = predictor._load_bundle()
    logging.info("Model ready: %s | classes: %d", bundle['model_name'], len(bundle['classes']))
    yield


app = FastAPI(title="Job Role Predictor API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/roles")
def get_roles():
    return {"roles": predictor.get_all_roles()}


@app.get("/api/sample-data")
def sample_data():
    df = pd.read_csv(_DATA_PATH)
    return {"rows": df.head(5).to_dict(orient="records")}


@app.post("/api/predict", response_model=PredictResponse)
def predict(body: PredictRequest):
    if body.experience_level not in ("Entry", "Mid", "Senior"):
        raise HTTPException(status_code=422, detail="experience_level must be Entry, Mid, or Senior")
    if not body.skills.strip():
        raise HTTPException(status_code=422, detail="skills must not be empty")

    result = predictor.predict(body.skills, body.qualification, body.experience_level)
    return PredictResponse(
        predicted_role=result['predicted_role'],
        confidence=result['confidence'],
        top_3=[RolePrediction(**r) for r in result['top_3']],
        all_probabilities=[RolePrediction(**r) for r in result.get('all_probabilities', [])],
    )
