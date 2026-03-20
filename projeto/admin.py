from django.contrib import admin
from .models import Title

# Admin prévio
@admin.register(Title)
class TitleAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'type', 'diretor', 'criador', 'ano', 'temporadas')
    list_filter = ('type',)  # filtro por tipo no admin
    search_fields = ('titulo', 'diretor', 'criador')