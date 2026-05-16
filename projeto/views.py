from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .models import Titles


def app(request):

    filmes = Titles.objects.filter(type='movie')[:20]

    series = Titles.objects.filter(type='series')[:20]

    contexto = {
        'filmes': filmes,
        'series': series
    }

    return render(
        request,
        'projeto/app.html',
        contexto
    )