import asyncio
from media_service import MediaService

async def test():
    ms = MediaService()
    
    print("--- Test 1: Known Movie with Trailers (Avengers) ---")
    avengers = ms.get_movie_media("The Avengers")
    print(f"Title: {avengers.get('title')}")
    print(f"Poster: {avengers.get('poster_url')}")
    print(f"Trailers Found: {len(avengers.get('trailers', []))}")
    if avengers.get('trailers'):
        print(f"Top Trailer: {avengers['trailers'][0]['name']}")

    print("\n--- Test 2: Future Movie/Fallback Check (Dune 3/Part Three) ---")
    # "Dune: Part Three" might exist as a placeholder. check if fallback logic triggers.
    # Note: If it doesn't exist in TMDB yet, search might fail or return something else.
    # Let's try "Dune Part Three"
    dune3 = ms.get_movie_media("Dune Part Three")
    
    if not dune3['found']:
        print("Dune 3 not found in TMDB. Trying 'Dune: Part Two' to see normal behavior.")
        dune2 = ms.get_movie_media("Dune: Part Two")
        print(f"Title: {dune2.get('title')}")
        print(f"Trailers: {len(dune2.get('trailers', []))}")
    else:
        print(f"Title: {dune3.get('title')}")
        trailers = dune3.get('trailers', [])
        print(f"Trailers Found: {len(trailers)}")
        for t in trailers:
            print(f" - {t['name']}")

if __name__ == "__main__":
    asyncio.run(test())
