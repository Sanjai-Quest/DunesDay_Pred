import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer

def load_data(filepath):
    try:
        df = pd.read_csv(filepath, encoding='utf-8')
    except UnicodeDecodeError:
        df = pd.read_csv(filepath, encoding='latin-1')
    return df

def split_genre(x):
    return [i.strip() for i in x.split(',')]

def clean_data(df):
    print(f"Initial rows: {len(df)}")
    
    # Debug numeric conversion
    df['budget_x'] = pd.to_numeric(df['budget_x'], errors='coerce')
    df['revenue'] = pd.to_numeric(df['revenue'], errors='coerce')
    
    missing_budget = df['budget_x'].isna().sum()
    missing_revenue = df['revenue'].isna().sum()
    print(f"Missing budget: {missing_budget}, Missing revenue: {missing_revenue}")
    
    # Drop rows where budget or revenue is missing 
    df = df.dropna(subset=['budget_x', 'revenue', 'date_x'])
    print(f"Rows after dropping missing numeric: {len(df)}")
    
    # Filter small budgets
    df = df[(df['budget_x'] > 1000) & (df['revenue'] > 1000)]
    print(f"Rows after filtering > 1000: {len(df)}")
    
    # Parse date
    # Try multiple formats or generic
    # Check sample dates first
    print("Sample dates before parsing:", df['date_x'].head().tolist())
    
    # Trying fixed format first
    df['date_parser_1'] = pd.to_datetime(df['date_x'].str.strip(), format='%m/%d/%Y', errors='coerce')
    
    # Check how many failed
    failed_dates = df['date_parser_1'].isna().sum()
    print(f"Failed date parsing (MM/DD/YYYY): {failed_dates}")
    
    if failed_dates > len(df) * 0.5:
        print("Falling back to infer_datetime_format...")
        df['date_x'] = pd.to_datetime(df['date_x'].str.strip(), errors='coerce')
    else:
        df['date_x'] = df['date_parser_1']
        
    df = df.dropna(subset=['date_x'])
    print(f"Rows after date parsing: {len(df)}")
    
    return df

def simulate_data(df):
    np.random.seed(42)
    # Opening weekend is highly correlated with "Hype" (Budget + Star Power + Genre)
    # Blockbusters (Action, Adventure, Sci-Fi) tend to have higher opening % (30-50%)
    # Dramas/Comedies might have lower (20-30%) but longer tails (better legs)
    
    # Base percentage
    df['opening_pct'] = 0.25 # Base 25%
    
    # Budget Impact: Higher budget -> Higher marketing -> Higher Opening %
    # Normalize budget roughly
    budget_factor = np.log1p(df['budget_x']) / 20.0 # Scale roughly 0 to 1
    df['opening_pct'] += budget_factor * 0.15 
    
    # Genre Impact
    def get_genre_boost(g):
        g = str(g).lower()
        if 'action' in g or 'adventure' in g or 'science fiction' in g:
            return 0.15
        if 'horror' in g:
            return 0.10 # Horror opens big then drops
        if 'animation' in g:
            return 0.05
        return 0.0
        
    df['opening_pct'] += df['genre'].apply(get_genre_boost)
    
    # Add some smaller noise (5%)
    noise = np.random.normal(0, 0.05, size=len(df))
    df['opening_pct'] += noise
    
    # Clip to realistic bounds (10% to 60%)
    df['opening_pct'] = df['opening_pct'].clip(0.10, 0.60)
    
    df['opening_weekend'] = df['revenue'] * df['opening_pct']
    
    # Drop temp cols
    df = df.drop(columns=['opening_pct'])
    
    return df

def engineer_features(df):
    df['release_year'] = df['date_x'].dt.year
    df['release_month'] = df['date_x'].dt.month
    df['release_quarter'] = df['date_x'].dt.quarter
    
    df['log_budget'] = np.log1p(df['budget_x'])
    
    # Handle Genre - Pre-clean
    df['genre'] = df['genre'].astype(str).str.replace('\xa0', ' ').fillna('Unknown')
    
    # Star Power
    person_revenues = {}
    for idx, row in df.iterrows():
        if pd.isna(row['crew']):
            continue
        parts = [x.strip() for x in row['crew'].split(',')]
        names = parts[0::2]
        for name in names:
            if name not in person_revenues:
                person_revenues[name] = []
            person_revenues[name].append(row['revenue'])
            
    person_power = {k: np.mean(v) for k, v in person_revenues.items() if len(v) >= 1}
    
    def calculate_movie_power(crew_str):
        if pd.isna(crew_str):
            return 0
        parts = [x.strip() for x in crew_str.split(',')]
        names = parts[0::2]
        if not names:
            return 0
        powers = [person_power.get(n, 0) for n in names]
        return np.mean(powers)
    
    df['star_power'] = df['crew'].apply(calculate_movie_power)
    df['log_star_power'] = np.log1p(df['star_power'])

    return df, person_power

def main():
    if not os.path.exists('data/movies.csv'):
        print("Error: data/movies.csv not found.")
        return

    print("Loading data...")
    df = load_data('data/movies.csv')
    
    print("Cleaning data...")
    df = clean_data(df)
    
    if len(df) == 0:
        print("Error: No data left after cleaning!")
        return
    
    print("Simulating missing targets...")
    df = simulate_data(df)
    
    print("Engineering features...")
    df, person_power_dict = engineer_features(df)
    
    # Genre Encoding
    print(f"Encoding genres for {len(df)} movies...")
    
    # Preprocess genres to be space-separated tokens with underscores for multi-word genres
    # e.g. "Science Fiction, Action" -> "Science_Fiction Action"
    def process_genre_string(s):
        if not isinstance(s, str): return "Unknown"
        parts = [x.strip().replace(' ', '_') for x in s.split(',')]
        return ' '.join(parts)
        
    df['genre_clean'] = df['genre'].apply(process_genre_string)
    
    # Use default tokenizer (splits by whitespace)
    vectorizer = CountVectorizer(min_df=1)
    
    try:
        genre_matrix = vectorizer.fit_transform(df['genre_clean'])
        print(f"Genre vocabulary size: {len(vectorizer.vocabulary_)}")
    except Exception as e:
        print(f"Genre Vectorization Failed: {e}")
        return

    genre_df = pd.DataFrame(genre_matrix.toarray(), columns=vectorizer.get_feature_names_out())
    genre_df.index = df.index
    
    features_numeric = df[['log_budget', 'release_year', 'release_month', 'release_quarter', 'log_star_power', 'score']]
    X = pd.concat([features_numeric, genre_df], axis=1)
    
    y = df[['opening_weekend', 'revenue']]
    
    print("Saving artifacts...")
    os.makedirs('ml/artifacts', exist_ok=True)
    
    joblib.dump(vectorizer, 'ml/artifacts/genre_vectorizer.pkl')
    joblib.dump(person_power_dict, 'ml/artifacts/person_power.pkl')
    
    processed_data = pd.concat([X, y, df[['names']]], axis=1)
    processed_data.to_csv('ml/artifacts/processed_data.csv', index=False)
    
    print(f"Preprocessing complete. {len(df)} rows processed.")

if __name__ == "__main__":
    main()
