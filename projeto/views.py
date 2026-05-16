from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import Titles


@login_required(login_url="/login/")
def app(request):
    populares = Titles.objects.all().order_by("-popularity")[:40]

    filmes = Titles.objects.filter(
        type__iexact="movie"
    ).order_by("-popularity")[:40]

    series = Titles.objects.filter(
        type__iexact="series"
    ).order_by("-popularity")[:40]

    context = {
        "populares": populares,
        "filmes": filmes,
        "series": series,
    }

    return render(request, "projeto/app.html", context)