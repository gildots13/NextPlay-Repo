import requests
import time

from projeto.models import Titles

API_KEY = "0f0f928ddea4d74326b5f9f80fe4b4af"

filmes = Titles.objects.exclude(tmdb_id=None)

total = filmes.count()

for i, filme in enumerate(filmes, start=1):
    if filme.description and len(filme.description) > 20:

        palavras_ingles = [
            "the",
            "and",
            "with",
            "from",
            "this"
        ]

        texto = filme.description.lower()

        if any(p in texto for p in palavras_ingles):
            pass
        else:
            print(f"{i}/{total} - Já traduzido")
            continue

    try:

        if filme.type == "movie":

            url = f"https://api.themoviedb.org/3/movie/{filme.tmdb_id}?api_key={API_KEY}&language=pt-BR"

        elif filme.type == "series":

            url = f"https://api.themoviedb.org/3/tv/{filme.tmdb_id}?api_key={API_KEY}&language=pt-BR"

        else:
            continue

        response = requests.get(url)

        if response.status_code != 200:
            print(f"{i}/{total} - Erro API")
            continue

        data = response.json()

        filme.title = data.get("title") or data.get("name")
        filme.description = data.get("overview")

        filme.save()

        print(f"{i}/{total} - Atualizado: {filme.title}")

        time.sleep(0.1)

    except Exception as e:

        print(f"{i}/{total} - Erro:", e)