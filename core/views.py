from django.shortcuts import render, redirect
from django.views.decorators.cache import never_cache


@never_cache
def home(request):
    # Se o usuário já estiver logado, ele NÃO fica voltando para a tela inicial.
    # Ele vai direto para o app.
    if request.user.is_authenticated:
        return redirect("/app/")

    # Se não estiver logado, mostra a tela inicial normal.
    return render(request, "core/home.html")