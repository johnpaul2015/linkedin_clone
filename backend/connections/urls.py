from django.urls import path
from .views import (
    UserListView,
    ConnectionListView,
    SendConnectionRequestView,
    PendingRequestsListView,
    AcceptConnectionRequestView,
    RejectConnectionRequestView,
    RemoveConnectionView,
)

urlpatterns = [
    # 1 & 2: User Listing and Search
    path("api/users/", UserListView.as_view(), name="user_list"),
    path("api/users/search/", UserListView.as_view(), name="user_search"),

    # 3: Sending a connection request
    path("api/connections/request/", SendConnectionRequestView.as_view(), name="connection_request_send"),

    # 4: Viewing received pending requests
    path("api/connections/requests/", PendingRequestsListView.as_view(), name="connection_requests_list"),
    path("api/connections/requests/received/", PendingRequestsListView.as_view(), name="connection_requests_received"),
    path("api/connections/pending/", PendingRequestsListView.as_view(), name="connection_pending"),

    # 5: Accepting a connection request
    path("api/connections/requests/<int:pk>/accept/", AcceptConnectionRequestView.as_view(), name="connection_request_accept"),
    path("api/connections/<int:pk>/accept/", AcceptConnectionRequestView.as_view(), name="connection_accept"),

    # 6: Rejecting a connection request
    path("api/connections/requests/<int:pk>/reject/", RejectConnectionRequestView.as_view(), name="connection_request_reject"),
    path("api/connections/<int:pk>/reject/", RejectConnectionRequestView.as_view(), name="connection_reject"),

    # 7: Viewing existing connections & Sending via base endpoint
    path("api/connections/", ConnectionListView.as_view(), name="connection_list"),

    # 8: Removing an existing connection
    path("api/connections/<int:pk>/", RemoveConnectionView.as_view(), name="connection_remove"),
    path("api/connections/<int:pk>/remove/", RemoveConnectionView.as_view(), name="connection_remove_alias"),
]

