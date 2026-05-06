# JobRole AI — Skill-Based Job Role Predictor

A full-stack AI application that predicts the best-matching job role from a candidate's skills, qualification, and experience level. Powered by an XGBoost classifier trained on 998 candidates across 20 job roles with 99% accuracy.

---

## Demo

| Form | Result |
|---|---|
| Enter skills as tags, pick qualification + experience | Get predicted role with confidence % and full probability breakdown |

---

## Features

- **Skill tag input** — type or paste skills as interactive chips
- **Qualification autocomplete** — dropdown suggestions for degrees
- **Experience level selector** — Entry / Mid / Senior pill buttons
- **Prediction result** — confidence badge, top-3 bars, full 20-role breakdown toggle
- **Share result** — one-click copy to clipboard
- **Prediction history** — last 5 session predictions in a side panel
- **Toast notifications** — error feedback without blocking the form
- **Model stats bar** — 998 candidates, 20 roles, 99% accuracy, 7 models compared

---

## Tech Stack

| Layer | Technology |
|---|---|
| ML Model | XGBoost (trained fresh on each Docker build) |
| Feature Engineering | TF-IDF (skills) + ordinal/label encoding (exp, qualification) |
| Backend | FastAPI + Uvicorn |
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Serving | nginx (gzip, 1-year asset cache, security headers) |
| Containerization | Docker + Docker Compose |

---

## Project Structure

```
ai_final_project/
├── backend/
│   ├── main.py           # FastAPI app — 4 endpoints
│   ├── predictor.py      # Inference logic (TF-IDF + XGBoost)
│   ├── schemas.py        # Pydantic request/response models
│   ├── train.py          # Trains XGBoost and saves bundle
│   ├── requirements.txt  # Python dependencies
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── components/
│   │       ├── Header.jsx
│   │       ├── StatsBar.jsx
│   │       ├── SkillTagInput.jsx
│   │       ├── PredictionForm.jsx
│   │       ├── PredictionResult.jsx
│   │       ├── PredictionHistory.jsx
│   │       └── Toast.jsx
│   ├── nginx.conf
│   ├── Dockerfile           # Multi-stage: node build → nginx serve
│   └── Dockerfile.dev       # Hot-reload dev server
├── data/
│   └── candidate_job_role_dataset.csv
├── model_artifacts/         # Generated at Docker build time
├── docker-compose.yml
├── docker-compose.dev.yml
├── Makefile
└── .env.example
```

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)

### Production (Docker)

```bash
# Clone / navigate to project
cd ai_final_project

# Build images and start (model trains automatically inside the container)
docker compose up --build -d

# Or use the Makefile shortcut
make prod
```

| Service | URL |
|---|---|
| Frontend | http://localhost |
| Backend API | http://localhost:8000 |

> The XGBoost model is retrained from the CSV during the Docker build, so there are no sklearn version mismatches.

### Development (hot reload)

```bash
make dev
# Frontend → http://localhost:5173  (Vite HMR)
# Backend  → http://localhost:8000  (uvicorn --reload)
```

### Local (without Docker)

```bash
# Backend
cd backend
pip install -r requirements.txt
python train.py          # train model once
uvicorn main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev              # → http://localhost:5173
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/predict` | Predict job role |
| `GET` | `/api/roles` | List all 20 job roles |
| `GET` | `/api/sample-data` | First 5 rows of the dataset |

### POST `/api/predict`

**Request**
```json
{
  "skills": "Python, SQL, TensorFlow, Machine Learning",
  "qualification": "Master's in Data Science",
  "experience_level": "Senior"
}
```

**Response**
```json
{
  "predicted_role": "Data Scientist",
  "confidence": 0.9921,
  "top_3": [
    { "role": "Data Scientist", "probability": 0.9921 },
    { "role": "Data Analyst",   "probability": 0.0010 },
    { "role": "Full Stack Python Developer", "probability": 0.0010 }
  ],
  "all_probabilities": [ ... ]
}
```

---

## Model

The classifier is trained in `backend/train.py` every time the Docker image is built.

| Step | Detail |
|---|---|
| Dataset | 998 candidates, 20 job roles, 1000 rows (2 rare classes removed) |
| Features | TF-IDF on skills (100 features) + exp level + qualification + skill count + degree level = **104 features** |
| Algorithm | XGBoost (`n_estimators=200, max_depth=6, lr=0.1`) |
| Train accuracy | 100% |
| CV accuracy | ~99% (5-fold stratified) |

### Supported Job Roles

AIML · Backend Developer · Blockchain Developer · C# Developer · Cybersecurity Engineer · Data Analyst · Data Scientist · Designer · DevOps Engineer · Frontend Developer · Full Stack Java Developer · Full Stack Python Developer · Game Developer · HR · Kubernetes Operations Engineer · Marketing · Mobile Developer · PHP Developer · Software Project Manager · Web Developer

---

## Makefile Commands

```bash
make prod    # docker compose up --build -d
make dev     # hot-reload dev mode
make build   # build images only
make down    # stop and remove containers
make logs    # tail logs from all services
```

---

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

```env
# Comma-separated list of allowed CORS origins
ALLOWED_ORIGINS=http://localhost,http://localhost:5173
```

---

## Notebook

The original EDA and model comparison notebook is at `notebooks/final_model.ipynb`. It covers:
- Deep EDA (target distribution, skill co-occurrence, cross-feature heatmaps)
- 7 models compared (Logistic Regression, Random Forest, Extra Trees, SVM, XGBoost, LightGBM, Gradient Boosting)
- All models achieve ~99% test accuracy; XGBoost selected for the production app
