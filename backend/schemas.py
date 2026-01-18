from pydantic import BaseModel
from typing import List, Optional, Dict

class MovieFeatures(BaseModel):
    title: Optional[str] = "Unknown"
    budget: float
    is_estimated_budget: bool = False
    release_date: str # YYYY-MM-DD
    genres: str # Comma separated
    crew: str # Comma separated
    score: Optional[float] = 0.0

class PredictionRequest(BaseModel):
    movie1: MovieFeatures
    movie2: MovieFeatures

class SinglePrediction(BaseModel):
    opening_weekend: float
    total_gross: float
    opening_weekend_ci: List[float] # [lower, upper]
    total_gross_ci: List[float] # [lower, upper]
    roi: float
    star_power: float # Historical/Franchise score
    shap_values: Dict[str, float] # Top contributing features
    explanation: Optional[str] = ""
    context_flags: Optional[Dict[str, bool]] = {}
    marketing_stats: Optional[Dict[str, str]] = {}

class PredictionResponse(BaseModel):
    movie1: SinglePrediction
    movie2: SinglePrediction
