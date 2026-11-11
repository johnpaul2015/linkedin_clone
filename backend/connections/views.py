from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import status
from rest_framework.exceptions import PermissionDenied, NotFound, ValidationError
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Connection
from .serializers import (
    UserSummarySerializer,
    ConnectionSerializer,
    ConnectionCreateSerializer,
    ConnectedUserSerializer,
)

User = get_user_model()


class StandardResultsPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50


class UserListView(ListAPIView):
    """
    List and search registered users excluding the current user.
    Supports searching by username, headline, and location.
    """
    serializer_class = UserSummarySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        user = self.request.user
        queryset = User.objects.exclude(id=user.id).select_related("profile").order_by("id")

        search = self.request.query_params.get("search") or self.request.query_params.get("q")
        if search:
            search = search.strip()
            queryset = queryset.filter(
                Q(username__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(profile__headline__icontains=search)
                | Q(profile__location__icontains=search)
            ).distinct()

        return queryset


class ConnectionListView(APIView):
    """
    GET: List all accepted connections for the authenticated user.
    POST: Send a connection request to another user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        connections = Connection.objects.filter(
            (Q(sender=user) | Q(receiver=user)),
            status="accepted"
        ).select_related("sender", "receiver", "sender__profile", "receiver__profile").order_by("-updated_at")

        serializer = ConnectedUserSerializer(connections, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ConnectionCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        connection = serializer.save()
        response_serializer = ConnectionSerializer(connection, context={"request": request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class SendConnectionRequestView(APIView):
    """
    Dedicated endpoint to send a connection request.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ConnectionCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        connection = serializer.save()
        response_serializer = ConnectionSerializer(connection, context={"request": request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class PendingRequestsListView(ListAPIView):
    """
    List pending connection requests received by the authenticated user.
    """
    serializer_class = ConnectionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        return Connection.objects.filter(
            receiver=self.request.user,
            status="pending"
        ).select_related("sender", "receiver", "sender__profile", "receiver__profile").order_by("-created_at")


class AcceptConnectionRequestView(APIView):
    """
    Accept a pending connection request.
    Only the receiver can accept.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        return self._accept(request, pk)

    def patch(self, request, pk):
        return self._accept(request, pk)

    def _accept(self, request, pk):
        try:
            connection = Connection.objects.get(pk=pk)
        except Connection.DoesNotExist:
            raise NotFound("Connection request not found.")

        # Only the recipient can accept
        if connection.receiver != request.user:
            raise PermissionDenied("Only the receiver can accept this connection request.")

        if connection.status != "pending":
            raise ValidationError(f"Cannot accept request with status '{connection.status}'.")

        connection.status = "accepted"
        connection.save()

        serializer = ConnectionSerializer(connection, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class RejectConnectionRequestView(APIView):
    """
    Reject a pending connection request.
    Only the receiver can reject.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        return self._reject(request, pk)

    def patch(self, request, pk):
        return self._reject(request, pk)

    def _reject(self, request, pk):
        try:
            connection = Connection.objects.get(pk=pk)
        except Connection.DoesNotExist:
            raise NotFound("Connection request not found.")

        # Only the recipient can reject
        if connection.receiver != request.user:
            raise PermissionDenied("Only the receiver can reject this connection request.")

        if connection.status != "pending":
            raise ValidationError(f"Cannot reject request with status '{connection.status}'.")

        connection.status = "rejected"
        connection.save()

        serializer = ConnectionSerializer(connection, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class RemoveConnectionView(APIView):
    """
    Remove an existing connection.
    Only sender or receiver of the connection can remove it.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            connection = Connection.objects.get(pk=pk)
        except Connection.DoesNotExist:
            raise NotFound("Connection not found.")

        # Must be sender or receiver
        if connection.sender != request.user and connection.receiver != request.user:
            raise PermissionDenied("You are not authorized to remove this connection.")

        connection.delete()
        return Response({"detail": "Connection removed successfully."}, status=status.HTTP_200_OK)

