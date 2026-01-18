from backend.main import app
from fastapi.testclient import TestClient
import sys

def test_metrics(client):
    print("Testing /metrics...")
    try:
        response = client.get("/metrics")
        print(f"Status: {response.status_code}")
        if response.status_code != 200:
            print(response.text)
            return False
        print("Metrics OK")
        return True
    except Exception as e:
        print(f"Metrics exception: {e}")
        return False

def test_predict(client):
    print("Testing /predict...")
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
            "crew": "Unknown, Actor",
            "score": 60
        }
    }
    try:
        response = client.post("/predict", json=payload)
        print(f"Status: {response.status_code}")
        if response.status_code != 200:
            print(f"Error Response: {response.text}")
            return False
        data = response.json()
        print("Prediction Keys:", data.keys())
        return True
    except Exception as e:
        print(f"Predict exception: {e}")
        return False

if __name__ == "__main__":
    with TestClient(app) as client:
        success = True
        if not test_metrics(client): success = False
        if not test_predict(client): success = False
        
        if success:
            print("ALL TESTS PASSED")
            sys.exit(0)
        else:
            print("TESTS FAILED")
            sys.exit(1)
