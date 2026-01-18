from fastapi.testclient import TestClient
from backend.main import app
import pytest

client = TestClient(app)

def test_metrics():
    response = client.get("/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "opening_weekend" in data
    assert "revenue" in data
    assert "RMSE" in data['opening_weekend']

def test_predict():
    payload = {
        "movie1": {
            "title": "Test Movie 1",
            "budget": 50000000,
            "release_date": "2023-01-01",
            "genres": "Action, Adventure",
            "crew": "Tom Cruise, Actor",
            "score": 75
        },
        "movie2": {
            "title": "Test Movie 2",
            "budget": 2000000,
            "release_date": "2023-05-15",
            "genres": "Drama",
            "crew": "Unknown Actor, Actor",
            "score": 60
        }
    }
    response = client.post("/predict", json=payload)
    if response.status_code != 200:
        print(response.json())
        
    assert response.status_code == 200
    data = response.json()
    
    assert "movie1" in data
    assert "movie2" in data
    assert data['movie1']['opening_weekend'] > 0
    assert data['movie1']['roi'] != 0
    assert "shap_values" in data['movie1']
