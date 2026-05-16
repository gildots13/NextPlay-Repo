import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_POST


def pagina_login(request):

    if request.user.is_authenticated:
        return redirect("app")

    return render(request, "contas/login.html")


def pagina_teste(request):

    return render(request, "contas/teste.html")


@require_POST
def api_cadastrar(request):

    try:
        dados = json.loads(request.body)

    except json.JSONDecodeError:

        return JsonResponse({
            "status": "erro"
        }, status=400)

    email = dados.get("email", "").strip().lower()

    senha = dados.get("senha", "").strip()

    if not email or not senha:

        return JsonResponse({
            "status": "erro"
        }, status=400)

    if User.objects.filter(username=email).exists():

        return JsonResponse({
            "status": "conta_existente"
        }, status=409)

    usuario = User.objects.create_user(
        username=email,
        email=email,
        password=senha
    )

    login(request, usuario)

    return JsonResponse({
        "status": "conta_criada"
    })


@require_POST
def api_login(request):

    try:
        dados = json.loads(request.body)

    except json.JSONDecodeError:

        return JsonResponse({
            "status": "erro"
        }, status=400)

    email = dados.get("email", "").strip().lower()

    senha = dados.get("senha", "").strip()

    usuario = authenticate(
        request,
        username=email,
        password=senha
    )

    if usuario is None:

        return JsonResponse({
            "status": "erro"
        }, status=401)

    login(request, usuario)

    return JsonResponse({
        "status": "ok"
    })


def sair(request):

    logout(request)

    return redirect("login")