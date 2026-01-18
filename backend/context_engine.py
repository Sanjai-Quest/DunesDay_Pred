
class ContextEngine:
    @staticmethod
    def generate_explanation(movie_features, prediction, media_data):
        explanation = []
        flags = {}
        marketing_stats = {}

        title = movie_features.title or "The movie"
        
        # 1. Budget Context
        if movie_features.is_estimated_budget:
            explanation.append(f"Prediction uses an **estimated budget** of ${movie_features.budget/1_000_000:.1f}M. Actual performance may vary if the confirmed budget differs significantly.")
            flags['is_estimated'] = True

        # 2. Marketing / Trailer Context
        # Heuristic: Check if we have high trailer views (mocked or real)
        # Using media_data passed from service
        trailer_views = media_data.get('metrics', {}).get('trailer_views_approx', 0)
        
        if trailer_views > 50_000_000:
            explanation.append(f"Strong **organic marketing surge** detected with ~{trailer_views/1_000_000:.1f}M+ trailer views, indicating high pre-release hype.")
            flags['high_marketing'] = True
            marketing_stats['Organic Reach'] = "High"
        
        # 3. Trailer Absence / Franchise Legacy
        has_trailers = len(media_data.get('trailers', [])) > 0
        star_power = prediction.star_power
        
        if not has_trailers:
            if star_power > 80:
                explanation.append(f"No official trailer released yet, but **Franchise Legacy** (Score: {star_power:.0f}/100) acts as a strong compensating signal. Historical performance of related movies supports the high prediction.")
                flags['franchise_legacy'] = True
            else:
                explanation.append("Lack of official trailers contributes to higher uncertainty in the opening weekend prediction.")
                flags['missing_marketing'] = True
        
        # 4. Opening Weekend vs Total Gross Context
        if prediction.total_gross > prediction.opening_weekend * 3.5:
            explanation.append("Long run potential is high based on genre and release window (legs > 3.5x).")
            
        return " ".join(explanation), flags, marketing_stats
