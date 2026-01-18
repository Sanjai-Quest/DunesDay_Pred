import requests

API_KEY = "04e15725458337cecdb9cdfe0d430876"
url = "https://api.themoviedb.org/3/movie/popular"

params = {
    "api_key": API_KEY,
    "language": "en-US",
    "page": 1
}

response = requests.get(url, params=params)
print(response.json())
