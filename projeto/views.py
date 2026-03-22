from django.shortcuts import render
from .models import Title

def lista_filmes(request):
    filmes = Title.objects.filmes()  # só filmes pelo type
    return render(request, 'filmes/lista_filmes.html', {'filmes': filmes})

def lista_series(request):
    series = Title.objects.series()  # só series pelo type
    return render(request, 'filmes/lista_series.html', {'series': series})

from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('home') # redireciona após login bem-sucedido
        else: 
            return render(request, 'login.html', {'error': 'Usuário ou senha inválidos.'})
        
    return render(request, 'login.html')
