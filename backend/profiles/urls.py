from django.urls import path
from .views import ProfileView, ExperienceView

urlpatterns = [
    path("api/profiles/me/", ProfileView.as_view()),
    path("api/experience/me/", ExperienceView.as_view()),
]
