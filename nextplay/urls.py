from django.contrib import admin
from django.urls import path, include

from core import views as core_views

urlpatterns = [
    path("admin/", admin.site.urls),

    # ROTA PRINCIPAL DO SITE
    # Aqui fica a tela inicial antes do login
    path("", core_views.home, name="home"),

    # ROTAS DE LOGIN, CADASTRO E LOGOUT
    path("", include("contas.urls")),

    # ÁREA LOGADA DO SISTEMA
    path("app/", include("projeto.urls")),
]