from django.db import models
from django.contrib.auth.models import User

class Titles(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    release_year = models.IntegerField(blank=True, null=True)
    type = models.CharField(max_length=10, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    poster_path = models.TextField(blank=True, null=True)
    tmdb_id = models.IntegerField(unique=True, blank=True, null=True)
    vote_average = models.FloatField(blank=True, null=True)
    popularity = models.FloatField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} ({self.type})"

    class Meta:
        managed = False
        db_table = 'titles'

class Comment(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    title = models.ForeignKey(
        Titles,
        on_delete=models.CASCADE
    )

    text = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

class Rating(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    title = models.ForeignKey(
        Titles,
        on_delete=models.CASCADE
    )

    stars = models.IntegerField()

