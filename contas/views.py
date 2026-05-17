import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_POST
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect


from django.shortcuts import render, redirect
from django.views.decorators.cache import never_cache


@never_cache
def pagina_login(request):
    if request.user.is_authenticated:
        return redirect("/app/")

    return render(request, "contas/login.html")


@never_cache
def pagina_teste(request):
    status = request.GET.get("status", "")
    email = request.GET.get("email", "")

    contexto = {
        "status": status,
        "email": email,
        "usuario_logado": request.user.is_authenticated,
    }

    return render(request, "contas/teste.html", contexto)


@require_POST
@csrf_protect
def api_cadastrar(request):
    try:
        dados = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({
            "status": "erro",
            "mensagem": "Dados inválidos."
        }, status=400)

    email = dados.get("email", "").strip().lower()
    senha = dados.get("senha", "").strip()

    if not email or not senha:
        return JsonResponse({
            "status": "erro",
            "mensagem": "E-mail e senha são obrigatórios."
        }, status=400)

    if len(senha) < 8:
        return JsonResponse({
            "status": "erro",
            "mensagem": "A senha precisa ter pelo menos 8 caracteres."
        }, status=400)

    if User.objects.filter(username=email).exists():
        return JsonResponse({
            "status": "conta_existente",
            "mensagem": "Essa conta já existe."
        }, status=409)

    try:
        User.objects.create_user(
            username=email,
            email=email,
            password=senha
        )

        return JsonResponse({
            "status": "conta_criada",
            "mensagem": "Conta criada com sucesso. Agora faça login.",
            "email": email
        }, status=201)

    except IntegrityError:
        return JsonResponse({
            "status": "conta_existente",
            "mensagem": "Essa conta já existe."
        }, status=409)

    except Exception as erro:
        print("Erro ao cadastrar:", erro)

        return JsonResponse({
            "status": "erro",
            "mensagem": "Erro interno ao cadastrar."
        }, status=500)


@require_POST
@csrf_protect
def api_login(request):
    if request.user.is_authenticated:
        return JsonResponse({
            "status": "conta_logada",
            "mensagem": "Você já está logado."
        }, status=200)

    try:
        dados = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({
            "status": "erro",
            "mensagem": "Dados inválidos."
        }, status=400)

    email = dados.get("email", "").strip().lower()
    senha = dados.get("senha", "").strip()

    if not email or not senha:
        return JsonResponse({
            "status": "erro",
            "mensagem": "E-mail e senha são obrigatórios."
        }, status=400)

    if not User.objects.filter(username=email).exists():
        return JsonResponse({
            "status": "conta_nao_existente",
            "mensagem": "Conta não existente."
        }, status=404)

    usuario = authenticate(
        request,
        username=email,
        password=senha
    )

    if usuario is None:
        return JsonResponse({
            "status": "senha_incorreta",
            "mensagem": "Senha incorreta."
        }, status=401)

    login(request, usuario)

    return JsonResponse({
        "status": "conta_logada",
        "mensagem": "Login efetuado com sucesso.",
        "email": email
    }, status=200)


@never_cache
def sair(request):
    logout(request)

    response = redirect("/login/")

    response["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0"
    response["Pragma"] = "no-cache"
    response["Expires"] = "0"

    return response