from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView
)
from .views import CustomTokenPairView

urlpatterns = [
    path("api/token/", CustomTokenPairView.as_view(), name="custom_token_obtain_pair"),
    path("api/token/refresh", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/token/verify", TokenVerifyView.as_view(), name="token_verify")
]