import requests
import functools
import os

class MediaService:
    def __init__(self):
        # In a real app, this should be in .env, but for now we use the key found in fetch_movies.py
        self.api_key = "04e15725458337cecdb9cdfe0d430876"
        self.base_url = "https://api.themoviedb.org/3"
        self.image_base_url = "https://image.tmdb.org/t/p/w500" # w500 is a good size for web
        self.backdrop_base_url = "https://image.tmdb.org/t/p/w1280"

    def _make_request(self, endpoint, params=None):
        if params is None:
            params = {}
        params['api_key'] = self.api_key
        try:
            response = requests.get(f"{self.base_url}{endpoint}", params=params, timeout=5)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching {endpoint}: {e}")
            return None

    def search_movie(self, query):
        data = self._make_request("/search/movie", {"query": query})
        if data and data.get("results"):
            # Return the first result (most relevant)
            return data["results"][0]
        return None

    def get_videos(self, movie_id):
        data = self._make_request(f"/movie/{movie_id}/videos")
        if not data:
            return []
        
        results = data.get("results", [])
        # Filter for YouTube trailers
        trailers = [
            v for v in results 
            if v.get("site") == "YouTube" and v.get("type") in ["Trailer", "Teaser"]
        ]
        # Sort: Trailer > Teaser
        trailers.sort(key=lambda x: 0 if x.get("type") == "Trailer" else 1)
        return trailers

    def get_collection_trailer(self, collection_id, current_movie_id):
        data = self._make_request(f"/collection/{collection_id}")
        if not data:
            return None
        
        parts = data.get("parts", [])
        # Sort by release date to find previous movies
        parts.sort(key=lambda x: x.get("release_date") or "9999-12-31")
        
        # Try to find a previous movie in the collection
        for part in parts:
            if part["id"] == current_movie_id:
                continue # Skip self if we are looking for valid fallback (though arguably self's other trailers should be checked first)
            
            # Check if this part has videos
            videos = self.get_videos(part["id"])
            if videos:
                # Tag it as related
                for v in videos:
                    v['name'] = f"[Related] {part['title']}: {v['name']}"
                return videos
        
        return []

    @functools.lru_cache(maxsize=50)
    def get_movie_media(self, title):
        movie = self.search_movie(title)
        if not movie:
            return {
                "found": False,
                "poster_url": None,
                "backdrop_url": None,
                "trailers": []
            }

        movie_id = movie["id"]
        
        # Get full details (for collection info)
        details = self._make_request(f"/movie/{movie_id}")
        
        poster_path = movie.get("poster_path")
        backdrop_path = movie.get("backdrop_path")
        
        poster_url = f"{self.image_base_url}{poster_path}" if poster_path else None
        backdrop_url = f"{self.backdrop_base_url}{backdrop_path}" if backdrop_path else None
        
        trailers = self.get_videos(movie_id)
        
        # Fallback logic
        if not trailers and details and details.get("belongs_to_collection"):
            collection = details["belongs_to_collection"]
            print(f"No direct trailer for {title}. Checking collection: {collection['name']}")
            fallback_trailers = self.get_collection_trailer(collection["id"], movie_id)
            if fallback_trailers:
                trailers = fallback_trailers

        return {
            "found": True,
            "title": movie.get("title"),
            "year": movie.get("release_date", "")[:4],
            "poster_url": poster_url,
            "backdrop_url": backdrop_url,
            "trailers": trailers,
            "metrics": self.get_social_stats_mock(movie.get("title"))
        }

    def get_social_stats_mock(self, title):
        # Simulation of social intelligence API
        # In production this would query YouTube/Twitter APIs
        
        stats = {
            "trailer_views_approx": 0,
            "social_buzz_score": 0
        }
        
        if not title: return stats
        
        t_lower = title.lower()
        
        # Mocking for demo cases
        if "avengers" in t_lower and "doomsday" in t_lower:
            stats["trailer_views_approx"] = 1_020_000_000 # 1.02B
            stats["social_buzz_score"] = 98
        elif "dune" in t_lower and ("3" in t_lower or "part three" in t_lower):
             # Dune 3: No trailer yet, but people search for it
            stats["trailer_views_approx"] = 0 
            stats["social_buzz_score"] = 85 # High anticipation
        elif "dune" in t_lower:
            stats["trailer_views_approx"] = 150_000_000
            stats["social_buzz_score"] = 90
            
        return stats
