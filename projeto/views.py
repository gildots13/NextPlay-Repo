from django.shortcuts import render
from .models import Title

def lista_filmes(request):
    filmes = Title.objects.filmes()  # só filmes pelo type
    return render(request, 'filmes/lista_filmes.html', {'filmes': filmes})

def lista_series(request):
    series = Title.objects.series()  # só series pelo type
    return render(request, 'filmes/lista_series.html', {'series': series})