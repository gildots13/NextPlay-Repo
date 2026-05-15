from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # landing page
    path('', include('core.urls')),

    # catálogo
    path('catalogo/', include('projeto.urls')),
]