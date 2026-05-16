from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .models import Titles


@login_required
def app(request):

    populares = Titles.objects.all()[:20]

    filmes = Titles.objects.filter(type='movie')[:20]

    series = Titles.objects.filter(type='series')[:20]

    contexto = {

        'populares': populares,
        'filmes': filmes,
        'series': series

    }

    return render(
        request,
        'projeto/app.html',
        contexto
    )