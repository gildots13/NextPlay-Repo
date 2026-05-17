from django.urls import path
from . import views

urlpatterns = [
    path("", views.app, name="app"),

    path("api/search/", views.pesquisar_titulos, name="pesquisar_titulos"),

    path(
        "api/titles/<int:title_id>/comments/",
        views.listar_comentarios,
        name="listar_comentarios"
    ),

    path(
        "api/titles/<int:title_id>/comments/create/",
        views.criar_comentario,
        name="criar_comentario"
    ),

    path(
        "api/comments/<int:comment_id>/edit/",
        views.editar_comentario,
        name="editar_comentario"
    ),

    path(
        "api/comments/<int:comment_id>/delete/",
        views.excluir_comentario,
        name="excluir_comentario"
    ),

    path(
        "api/titles/<int:title_id>/rating/",
        views.salvar_avaliacao,
        name="salvar_avaliacao"
    ),

    path(
        "api/titles/<int:title_id>/favorite/",
        views.alternar_favorito,
        name="alternar_favorito"
    ),
]