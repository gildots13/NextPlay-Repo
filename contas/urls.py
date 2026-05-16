from django.urls import path
from . import views

urlpatterns = [
    path("login/", views.pagina_login, name="login"),
    path("teste/", views.pagina_teste, name="teste"),

    path("api/cadastrar/", views.api_cadastrar, name="api_cadastrar"),
    path("api/login/", views.api_login, name="api_login"),

    path("logout/", views.sair, name="logout"),
]