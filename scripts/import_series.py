import requests
import psycopg2
from psycopg2.extras import execute_batch

API_KEY = "0f0f928ddea4d74326b5f9f80fe4b4af"

conn = psycopg2.connect(
    host="shortline.proxy.rlwy.net",
    database="railway",
    user="postgres",
    password="KfKfEidMEqbMgScSzfzarnkyWFjXzhoz",
    port="18463"
)

cur = conn.cursor()

TOTAL_PAGES = 500

for page in range(1, TOTAL_PAGES + 1):

    print(f"Importando página {page} de séries")

    url = f"https://api.themoviedb.org/3/discover/tv?api_key={API_KEY}&page={page}"

    response = requests.get(url)
    data = response.json()

    batch = []

    for series in data["results"]:

        tmdb_id = series["id"]
        title = series["name"]
        description = series["overview"]
        poster = series["poster_path"]
        rating = series["vote_average"]
        popularity = series["popularity"]

        year = None
        if series.get("first_air_date"):
            year = series["first_air_date"][:4]

        batch.append((
            tmdb_id,
            title,
            description,
            year,
            poster,
            rating,
            popularity
        ))

    execute_batch(cur, """
        INSERT INTO titles
        (tmdb_id, title, description, release_year, poster_path, vote_average, popularity, type)
        VALUES (%s,%s,%s,%s,%s,%s,%s,'series')
        ON CONFLICT (tmdb_id) DO NOTHING
    """, batch)

    conn.commit()

cur.close()
conn.close()

print("Importação de séries finalizada!")