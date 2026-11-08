from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    email = models.EmailField(unique=True)
    bio = models.TextField(max_length=500, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    location = models.TextField(max_length=100, blank=True, null=True)
    phone = models.IntegerField(max_length=10, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username + '-' + self.email
