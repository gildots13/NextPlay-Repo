import json
import random
from collections import Counter

from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from django.views.decorators.http import require_POST

from .models import Titles, Comment, Rating, Favorite


def montar_url_imagem(poster_path):
    if not poster_path:
        return ""

    if poster_path.startswith("http"):
        return poster_path

    return f"https://image.tmdb.org/t/p/w500{poster_path}"


def aplicar_estado_do_usuario(lista, usuario):
    lista = list(lista)

    if not usuario.is_authenticated:
        for item in lista:
            item.user_rating = 0
            item.is_favorite = False
        return lista

    ids = [item.id for item in lista]

    ratings = Rating.objects.filter(
        user=usuario,
        title_id__in=ids
    )

    mapa_ratings = {
        rating.title_id: rating.stars
        for rating in ratings
    }

    favoritos_ids = set(
        Favorite.objects.filter(
            user=usuario,
            title_id__in=ids
        ).values_list("title_id", flat=True)
    )

    for item in lista:
        item.user_rating = mapa_ratings.get(item.id, 0)
        item.is_favorite = item.id in favoritos_ids

    return lista


def recomendar_titulos(usuario, tipo=None, limite=40):
    avaliacoes = list(
        Rating.objects.filter(user=usuario)
        .select_related("title")
    )

    ids_ruins = [
        avaliacao.title_id
        for avaliacao in avaliacoes
        if avaliacao.stars <= 2
    ]

    avaliacoes_boas = [
        avaliacao
        for avaliacao in avaliacoes
        if avaliacao.stars >= 4
    ]

    tipos_curtidos = Counter()
    anos_curtidos = []

    for avaliacao in avaliacoes_boas:
        titulo = avaliacao.title

        if titulo.type:
            tipos_curtidos[titulo.type.lower()] += avaliacao.stars

        if titulo.release_year:
            anos_curtidos.append(titulo.release_year)

    base = Titles.objects.all()

    if tipo:
        base = base.filter(type__iexact=tipo)

    if ids_ruins:
        base = base.exclude(id__in=ids_ruins)

    pool = list(
        base.order_by("-popularity")[:500]
    )

    def pontuar_item(item):
        popularidade = float(item.popularity or 0)

        pontuacao = min(popularidade, 1000)

        pontuacao += random.uniform(0, 850)

        tipo_item = (item.type or "").lower()

        if tipo_item in tipos_curtidos:
            pontuacao += tipos_curtidos[tipo_item] * 180

        if item.release_year and anos_curtidos:
            menor_distancia = min(
                abs(item.release_year - ano)
                for ano in anos_curtidos
            )

            if menor_distancia <= 3:
                pontuacao += 220
            elif menor_distancia <= 7:
                pontuacao += 100

        return pontuacao

    random.shuffle(pool)

    pool.sort(
        key=pontuar_item,
        reverse=True
    )

    recomendados = pool[:limite]

    return aplicar_estado_do_usuario(
        recomendados,
        usuario
    )


@login_required(login_url="/login/")
def app(request):
    populares = recomendar_titulos(
        usuario=request.user,
        tipo=None,
        limite=40
    )

    filmes = recomendar_titulos(
        usuario=request.user,
        tipo="movie",
        limite=40
    )

    series = recomendar_titulos(
        usuario=request.user,
        tipo="series",
        limite=40
    )

    favoritos_query = [
        favorito.title
        for favorito in Favorite.objects.filter(
            user=request.user
        ).select_related("title").order_by("-created_at")[:80]
    ]

    favoritos = aplicar_estado_do_usuario(
        favoritos_query,
        request.user
    )

    return render(request, "projeto/app.html", {
        "populares": populares,
        "filmes": filmes,
        "series": series,
        "favoritos": favoritos,
    })


@login_required(login_url="/login/")
def pesquisar_titulos(request):
    termo = request.GET.get("q", "").strip()

    if len(termo) < 2:
        return JsonResponse({
            "status": "ok",
            "resultados": []
        })

    resultados_query = Titles.objects.filter(
        Q(title__icontains=termo) |
        Q(description__icontains=termo)
    ).order_by("-popularity")[:48]

    resultados_lista = list(resultados_query)

    ids = [item.id for item in resultados_lista]

    favoritos_ids = set(
        Favorite.objects.filter(
            user=request.user,
            title_id__in=ids
        ).values_list("title_id", flat=True)
    )

    resultados = []

    for item in resultados_lista:
        tipo_label = "Título"

        if item.type:
            if item.type.lower() == "movie":
                tipo_label = "Filme"

            if item.type.lower() == "series":
                tipo_label = "Série"

        resultados.append({
            "id": item.id,
            "title": item.title,
            "description": item.description or "Sem descrição disponível.",
            "release_year": item.release_year or "",
            "type": item.type or "",
            "type_label": tipo_label,
            "image": montar_url_imagem(item.poster_path),
            "is_favorite": item.id in favoritos_ids,
        })

    return JsonResponse({
        "status": "ok",
        "resultados": resultados
    })


@login_required(login_url="/login/")
def listar_comentarios(request, title_id):
    titulo = get_object_or_404(Titles, id=title_id)

    comentarios = Comment.objects.filter(
        title=titulo
    ).select_related("user").order_by("-created_at")

    dados = []

    for comentario in comentarios:
        dados.append({
            "id": comentario.id,
            "usuario": comentario.user.username,
            "texto": comentario.text,
            "criado_em": comentario.created_at.strftime("%d/%m/%Y %H:%M"),
            "pode_editar": comentario.user == request.user
        })

    rating = Rating.objects.filter(
        user=request.user,
        title=titulo
    ).first()

    favorito = Favorite.objects.filter(
        user=request.user,
        title=titulo
    ).exists()

    return JsonResponse({
        "status": "ok",
        "comentarios": dados,
        "minha_avaliacao": rating.stars if rating else 0,
        "favorito": favorito,
    })


@login_required(login_url="/login/")
@require_POST
def criar_comentario(request, title_id):
    titulo = get_object_or_404(Titles, id=title_id)

    try:
        dados = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({
            "status": "erro",
            "mensagem": "Dados inválidos."
        }, status=400)

    texto = dados.get("text", "").strip()

    if not texto:
        return JsonResponse({
            "status": "erro",
            "mensagem": "O comentário não pode ficar vazio."
        }, status=400)

    comentario = Comment.objects.create(
        user=request.user,
        title=titulo,
        text=texto
    )

    return JsonResponse({
        "status": "comentario_criado",
        "comentario": {
            "id": comentario.id,
            "usuario": comentario.user.username,
            "texto": comentario.text,
            "criado_em": comentario.created_at.strftime("%d/%m/%Y %H:%M"),
            "pode_editar": True
        }
    }, status=201)


@login_required(login_url="/login/")
@require_POST
def editar_comentario(request, comment_id):
    comentario = get_object_or_404(Comment, id=comment_id)

    if comentario.user != request.user:
        return JsonResponse({
            "status": "erro",
            "mensagem": "Você só pode editar seus próprios comentários."
        }, status=403)

    try:
        dados = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({
            "status": "erro",
            "mensagem": "Dados inválidos."
        }, status=400)

    novo_texto = dados.get("text", "").strip()

    if not novo_texto:
        return JsonResponse({
            "status": "erro",
            "mensagem": "O comentário não pode ficar vazio."
        }, status=400)

    comentario.text = novo_texto
    comentario.save()

    return JsonResponse({
        "status": "comentario_editado",
        "comentario": {
            "id": comentario.id,
            "usuario": comentario.user.username,
            "texto": comentario.text,
            "criado_em": comentario.created_at.strftime("%d/%m/%Y %H:%M"),
            "pode_editar": True
        }
    })


@login_required(login_url="/login/")
@require_POST
def excluir_comentario(request, comment_id):
    comentario = get_object_or_404(Comment, id=comment_id)

    if comentario.user != request.user:
        return JsonResponse({
            "status": "erro",
            "mensagem": "Você só pode excluir seus próprios comentários."
        }, status=403)

    comentario.delete()

    return JsonResponse({
        "status": "comentario_excluido"
    })


@login_required(login_url="/login/")
@require_POST
def salvar_avaliacao(request, title_id):
    titulo = get_object_or_404(Titles, id=title_id)

    try:
        dados = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({
            "status": "erro",
            "mensagem": "Dados inválidos."
        }, status=400)

    stars = dados.get("stars")

    try:
        stars = int(stars)
    except (TypeError, ValueError):
        return JsonResponse({
            "status": "erro",
            "mensagem": "Avaliação inválida."
        }, status=400)

    if stars < 1 or stars > 5:
        return JsonResponse({
            "status": "erro",
            "mensagem": "A avaliação precisa ser de 1 a 5."
        }, status=400)

    Rating.objects.update_or_create(
        user=request.user,
        title=titulo,
        defaults={
            "stars": stars
        }
    )

    return JsonResponse({
        "status": "avaliacao_salva",
        "stars": stars,
        "recomendacoes_atualizadas": True
    })


@login_required(login_url="/login/")
@require_POST
def alternar_favorito(request, title_id):
    titulo = get_object_or_404(Titles, id=title_id)

    favorito, criado = Favorite.objects.get_or_create(
        user=request.user,
        title=titulo
    )

    if criado:
        return JsonResponse({
            "status": "favorito_adicionado",
            "favorito": True,
            "mensagem": "Adicionado aos favoritos."
        })

    favorito.delete()

    return JsonResponse({
        "status": "favorito_removido",
        "favorito": False,
        "mensagem": "Removido dos favoritos."
    })