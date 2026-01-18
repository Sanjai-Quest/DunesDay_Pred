import pandas as pd
import numpy as np
import xgboost as xgb
import joblib
import json
import shap
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.multioutput import MultiOutputRegressor

def train_models():
    print("Loading processed data...")
    try:
        df = pd.read_csv('ml/artifacts/processed_data.csv')
    except FileNotFoundError:
        print("Error: processed_data.csv not found. Run preprocessing.py first.")
        return

    # Prepare X and y
    # Drop target columns and metadata
    targets = ['opening_weekend', 'revenue']
    metadata = ['names']
    
    X = df.drop(columns=targets + metadata)
    y = df[targets]
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print(f"Training models on {len(X_train)} samples...")
    
    # Hyperparameter Tuning using RandomizedSearchCV
    from sklearn.model_selection import RandomizedSearchCV
    
    param_dist = {
        'n_estimators': [100, 300, 500, 800],
        'learning_rate': [0.01, 0.05, 0.1],
        'max_depth': [3, 5, 7, 9],
        'min_child_weight': [1, 3, 5],
        'subsample': [0.6, 0.8, 1.0],
        'colsample_bytree': [0.6, 0.8, 1.0],
        'reg_alpha': [0, 0.1, 1],
        'reg_lambda': [1, 1.5, 2]
    }
    
    def tune_and_train(X, y, name):
        print(f"Tuning {name} model...")
        base_model = xgb.XGBRegressor(random_state=42, n_jobs=-1)
        search = RandomizedSearchCV(
            base_model, 
            param_distributions=param_dist, 
            n_iter=10, # limit iterations for speed
            scoring='neg_root_mean_squared_error', 
            cv=3, 
            verbose=1,
            random_state=42,
            n_jobs=-1
        )
        search.fit(X, y)
        print(f"Best params for {name}: {search.best_params_}")
        return search.best_estimator_

    # Model 1: Opening Weekend
    model_opening = tune_and_train(X_train, y_train['opening_weekend'], "Opening Weekend")
    
    # Model 2: Total Revenue
    model_revenue = tune_and_train(X_train, y_train['revenue'], "Total Revenue")
    
    # Evaluate
    print("Evaluating models...")
    preds_opening_test = model_opening.predict(X_test)
    preds_revenue_test = model_revenue.predict(X_test)
    
    metrics = {}
    
    # Opening Weekend Metrics
    rmse_ow = np.sqrt(mean_squared_error(y_test['opening_weekend'], preds_opening_test))
    mae_ow = mean_absolute_error(y_test['opening_weekend'], preds_opening_test)
    r2_ow = r2_score(y_test['opening_weekend'], preds_opening_test)
    
    # Revenue Metrics
    rmse_rev = np.sqrt(mean_squared_error(y_test['revenue'], preds_revenue_test))
    mae_rev = mean_absolute_error(y_test['revenue'], preds_revenue_test)
    r2_rev = r2_score(y_test['revenue'], preds_revenue_test)
    
    metrics['opening_weekend'] = {'RMSE': rmse_ow, 'MAE': mae_ow, 'R2': r2_ow}
    metrics['revenue'] = {'RMSE': rmse_rev, 'MAE': mae_rev, 'R2': r2_rev}
    
    print(json.dumps(metrics, indent=2))
    
    # Initialize SHAP Explainers (TreeExplainer is fast for XGBoost)
    # We use a background dataset (kmeans) to keep the explainer size manageable if data is large, 
    # but here test set is small enough or we can just use the model directly.
    # For TreeExplainer with XGBoost, we don't strictly need background data but it helps for feature perturbation.
    print("Initializing SHAP explainers...")
    explainer_opening = shap.TreeExplainer(model_opening)
    explainer_revenue = shap.TreeExplainer(model_revenue)
    
    # Save Artifacts
    print("Saving models and metrics...")
    joblib.dump(model_opening, 'ml/artifacts/model_opening.pkl')
    joblib.dump(model_revenue, 'ml/artifacts/model_revenue.pkl')
    # Save explainers - we can't easily pickle SHAP explainers sometimes due to versioning, 
    # but saving the model is enough to recreate the TreeExplainer. 
    # We will recreate it in the backend to avoid large file sizes.
    
    # Save metrics JSON
    with open('ml/artifacts/metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)
        
    # Save column names for inference alignment
    with open('ml/artifacts/model_columns.json', 'w') as f:
        json.dump(list(X.columns), f)

    print("Training complete.")

if __name__ == "__main__":
    train_models()
