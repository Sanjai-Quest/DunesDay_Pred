# DunesDay Prediction System 🎬

A full-stack AI application to predict movie box office performance (Opening Weekend & Total Gross) and compare two movies side-by-side.

## Features
- **Dual Prediction**: Predicts 'Opening Weekend' and 'Total Revenue' using XGBoost.
- **Side-by-Side Comparison**: Analyze two movies to see which one wins.
- **Explainable AI**: View Top 5 SHAP features driving the prediction.
- **Premium UI**: Dark-mode, Glassmorphism design with React & Tailwind CSS.
- **Interactive**: "Tweak" features (budget, star power via crew) and re-predict instantly.

## Architecture
- **ML**: XGBoost, Scikit-Learn, SHAP (Python)
- **Backend**: FastAPI (Python)
- **Frontend**: React, Vite, Tailwind CSS, Recharts

## Setup & Running

### 1. Backend (FastAPI)
The backend serves the ML model and predictions.

```bash
cd backend
# Install dependencies (if not already done)
pip install -r requirements.txt
pip install scikit-learn xgboost shap joblib fastapi uvicorn python-multipart

# Start the server
uvicorn main:app --reload
```
*Port: http://localhost:8000*

### 2. Frontend (React)
The frontend provides the user interface.

```bash
cd frontend
# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```
*URL: http://localhost:5173*

## Model Performance
- **Total Revenue R²**: ~0.87
- **Opening Weekend R²**: ~0.84 (Simulated refined target)

## Project Structure
- `data/`: Contains `movies.csv`.
- `ml/`: Training scripts (`train.py`) and artifacts (`artifacts/`).
- `backend/`: FastAPI application (`main.py`, `schemas.py`).
- `frontend/`: React application (`src/`).
