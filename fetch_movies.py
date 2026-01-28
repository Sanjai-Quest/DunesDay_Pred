import requests
import pandas as pd
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

API_KEY = os.getenv("TMDB_API_KEY")
if not API_KEY:
    raise ValueError("TMDB_API_KEY environment variable is not set. Please check your .env file.")
BASE_URL = "https://api.themoviedb.org/3"


# ---------------------------
# Utility Functions
# ---------------------------

def search_movie(title, year=None):
    url = f"{BASE_URL}/search/movie"
    params = {
        "api_key": API_KEY,
        "query": title,
        "year": year
    }
    r = requests.get(url, params=params)
    results = r.json().get("results", [])
    return results[0] if results else None


def get_movie_details(movie_id):
    url = f"{BASE_URL}/movie/{movie_id}"
    params = {"api_key": API_KEY}
    return requests.get(url, params=params).json()


def get_movie_credits(movie_id):
    url = f"{BASE_URL}/movie/{movie_id}/credits"
    params = {"api_key": API_KEY}
    return requests.get(url, params=params).json()


# ---------------------------
# Feature Extraction
# ---------------------------

def extract_cast_director_features(credits):
    cast = credits.get("cast", [])[:3]
    crew = credits.get("crew", [])

    cast_popularity = sum(actor.get("popularity", 0) for actor in cast)

    director_popularity = 0
    for member in crew:
        if member.get("job") == "Director":
            director_popularity = member.get("popularity", 0)
            break

    return cast_popularity, director_popularity


def process_movie(title, year=None):
    movie = search_movie(title, year)
    if not movie:
        print(f"❌ Movie not found: {title}")
        return None

    movie_id = movie["id"]
    details = get_movie_details(movie_id)
    credits = get_movie_credits(movie_id)

    cast_pop, director_pop = extract_cast_director_features(credits)

    return {
        "movie_id": movie_id,
        "title": details.get("title"),
        "release_date": details.get("release_date"),
        "popularity": details.get("popularity"),
        "vote_average": details.get("vote_average"),
        "vote_count": details.get("vote_count"),
        "genres": ",".join([g["name"] for g in details.get("genres", [])]),
        "cast_popularity": cast_pop,
        "director_popularity": director_pop,
        "status": details.get("status")
    }


# ---------------------------
# Movies to Fetch
# ---------------------------

movies_list = [
    # Avengers
    ("The Avengers", 2012),
    ("Avengers: Age of Ultron", 2015),
    ("Avengers: Infinity War", 2018),
    ("Avengers: Endgame", 2019),

    # Dune
    ("Dune", 2021),
    ("Dune: Part Two", 2024),

    # Upcoming
    ("Dune: Part Three", None)
]


# ---------------------------
# Main Execution
# ---------------------------

all_movies = []

for title, year in movies_list:
    print(f"Fetching: {title}")
    data = process_movie(title, year)
    if data:
        all_movies.append(data)

df = pd.DataFrame(all_movies)
df.to_csv("movies_dataset.csv", index=False)

print("\n✅ Dataset saved as movies_dataset.csv")
print(df)
