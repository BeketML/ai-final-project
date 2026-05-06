from pydantic import BaseModel


class PredictRequest(BaseModel):
    skills: str
    qualification: str
    experience_level: str


class RolePrediction(BaseModel):
    role: str
    probability: float


class PredictResponse(BaseModel):
    predicted_role: str
    confidence: float
    top_3: list[RolePrediction]
    all_probabilities: list[RolePrediction]
