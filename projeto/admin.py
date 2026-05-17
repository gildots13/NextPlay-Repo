from django.contrib import admin
from .models import Titles

@admin.register(Titles)
class TitlesAdmin(admin.ModelAdmin):
    list_display = ('title', 'type', 'release_year', 'tmdb_id', 'vote_average', 'popularity')
    search_fields = ('title', 'type')