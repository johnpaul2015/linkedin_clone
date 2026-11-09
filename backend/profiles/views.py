from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError

from .models import Profile, Experience
from .serializers import ProfileSerializer, ExperienceSerializer


# list/create view.
# TODO: probably 'ListCreateAPIView' might get replaced with 'APIView' in the future.
class ProfileView(ListCreateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Profile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        if Profile.objects.filter(user=self.request.user).exists(): # only one profile for one user (onetoone rel).
            raise ValidationError("You already have a profile!")
        serializer.save(user=self.request.user)

# TODO: update view; if 'APIView' doesn't get implemented.

class ExperienceView(ListCreateAPIView):
    serializer_class = ExperienceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Experience.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)