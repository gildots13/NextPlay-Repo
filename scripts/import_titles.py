import requests
import psycopg2
import time

API_KEY = "0f0f928ddea4d74326b5f9f80fe4b4af" # CHAVE DO TMBD

conn = psycopg2.connect(
    host="shortline.proxy.rlwy.net",
    database="railway",
    user="postgres",
    password="KfKfEidMEqbMgScSzfzarnkyWFjXzhoz",
    port="18463"
)

cur = conn.cursor()

TOTAL_PAGES = 500   # DEVE SER ALTERADO SE DER BUG!!!!

for page in range(1, TOTAL_PAGES + 1):

    print(f"Importando página {page}")

    url = f"https://api.themoviedb.org/3/discover/movie?api_key={API_KEY}&page={page}"

    response = requests.get(url)
    data = response.json()

    for movie in data["results"]:

        tmdb_id = movie["id"]
        title = movie["title"]
        description = movie["overview"]
        poster = movie["poster_path"]
        rating = movie["vote_average"]
        popularity = movie["popularity"]

        year = None
        if movie["release_date"]:
            year = movie["release_date"][:4]

        cur.execute("""
        INSERT INTO titles
        (tmdb_id, title, description, release_year, poster_path, vote_average, popularity, type)
        VALUES (%s,%s,%s,%s,%s,%s,%s,'movie')
        ON CONFLICT (tmdb_id) DO NOTHING
        """, (tmdb_id, title, description, year, poster, rating, popularity))

    conn.commit()

    time.sleep(0.2)

cur.close()
conn.close()

print("Importação de filmes finalizada")