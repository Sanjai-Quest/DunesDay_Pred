import requests
import json

url = "http://localhost:8000/predict"
data = {
    "movie1": {
        "title": "Avengers",
        "budget": 400000000,
        "release_date": "2026-05-01",
        "genres": "Action, Adventure, Science Fiction",
        "crew": "Russo Brothers, Director, Robert Downey Jr., Actor",
        "score": 90
    },
    "movie2": {
        "title": "Dune 3",
        "budget": 250000000,
        "release_date": "2026-12-18",
        "genres": "Science Fiction, Adventure",
        "crew": "Denis Villeneuve, Director, Timothée Chalamet, Actor",
        "score": 90
    }
}

try:
    response = requests.post(url, json=data)
    print(f"Status: {response.status_code}")
    res_json = response.json()
    print("SHAP Values Movie 1:", res_json['movie1']['shap_values'])
    print("SHAP Values Movie 2:", res_json['movie2']['shap_values'])
except Exception as e:
    print(f"Error: {e}")
