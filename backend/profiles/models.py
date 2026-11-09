from django.db import models
from django.conf import settings

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    profile_pic = models.ImageField(upload_to="photos/", blank=True, null=True)
    cover_img = models.ImageField(upload_to="photos/", blank=True, null=True)
    headline = models.CharField(max_length=50)
    bio = models.TextField(max_length=500, blank=True, null=True) # optional.
    website = models.URLField(blank=True, null=True) # optional.
    location = models.TextField(max_length=100, blank=True, null=True) # optional.
    phone = models.IntegerField(max_length=10, blank=True, null=True) # optional. # TODO: change the dt to 'CharField' with max_length=10.
    linkedin_url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.username

class Experience(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    company = models.CharField(max_length=50)
    start_date = models.DateField()
    end_date = models.DateField()
    role = models.CharField(max_length=100)
    location = models.CharField(max_length=100)

    def __str__(self):
        return self.user.username + '-' + self.company