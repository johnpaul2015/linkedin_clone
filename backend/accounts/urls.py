from django.urls import path
from accounts.views import RegisterView, ProfileView

urlpatterns = [
    path("api/register/", RegisterView.as_view()),
    path("api/profile/", ProfileView.as_view()),
]
