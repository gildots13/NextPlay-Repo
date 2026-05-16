from django.shortcuts import render
from .models import Titles

def app(request):

    populares = Titles.objects.all().order_by("-popularity")[:40]

    filmes = Titles.objects.filter(
        type="movie"
    ).order_by("-popularity")[:40]

    series = Titles.objects.filter(
        type="tv"
    ).order_by("-popularity")[:40]

    context = {
        "populares": populares,
        "filmes": filmes,
        "series": series,
    }

    return render(request, "projeto/app.html", context)