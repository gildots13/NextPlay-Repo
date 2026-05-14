from django.shortcuts import render
from django.core.paginator import Paginator
from .models import Titles


def home(request):

    busca = request.GET.get('busca')

    filmes = Titles.objects.filter(type='movie')

    if busca:
        filmes = filmes.filter(title__icontains=busca)

    filmes = filmes[:500]

    paginator = Paginator(filmes, 20)

    page_number = request.GET.get('page')

    filmes = paginator.get_page(page_number)

    return render(request, 'projeto/index.html', {
        'filmes': filmes,
        'busca': busca
    })