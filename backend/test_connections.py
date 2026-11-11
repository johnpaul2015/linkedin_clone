import os
import sys
import django
import json

# Setup django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from profiles.models import Profile
from connections.models import Connection

User = get_user_model()

def run_tests():
    print("==================================================")
    print("STARTING COMPREHENSIVE CONNECTION & USER API TESTS")
    print("==================================================")

    # 1. Setup Test Users
    # Clean up any previous test-created data
    User.objects.filter(username__in=["alice_test", "bob_test", "charlie_test", "diana_test"]).delete()

    user_a = User.objects.create_user(
        username="alice_test",
        email="alice@test.com",
        password="Password123!",
        first_name="Alice",
        last_name="Anderson"
    )
    Profile.objects.create(
        user=user_a,
        headline="Senior AI Engineer",
        location="San Francisco, CA",
        linkedin_url="https://linkedin.com/in/alice"
    )

    user_b = User.objects.create_user(
        username="bob_test",
        email="bob@test.com",
        password="Password123!",
        first_name="Bob",
        last_name="Builder"
    )
    Profile.objects.create(
        user=user_b,
        headline="Frontend Architect",
        location="New York, NY",
        linkedin_url="https://linkedin.com/in/bob"
    )

    user_c = User.objects.create_user(
        username="charlie_test",
        email="charlie@test.com",
        password="Password123!",
        first_name="Charlie",
        last_name="Chaplin"
    )
    Profile.objects.create(
        user=user_c,
        headline="Product Manager",
        location="London, UK",
        linkedin_url="https://linkedin.com/in/charlie"
    )

    user_d = User.objects.create_user(
        username="diana_test",
        email="diana@test.com",
        password="Password123!",
        first_name="Diana",
        last_name="Prince"
    )
    # Diana has no profile yet

    client_a = APIClient()
    token_a = str(RefreshToken.for_user(user_a).access_token)
    client_a.credentials(HTTP_AUTHORIZATION=f"Bearer {token_a}")

    client_b = APIClient()
    token_b = str(RefreshToken.for_user(user_b).access_token)
    client_b.credentials(HTTP_AUTHORIZATION=f"Bearer {token_b}")

    client_c = APIClient()
    token_c = str(RefreshToken.for_user(user_c).access_token)
    client_c.credentials(HTTP_AUTHORIZATION=f"Bearer {token_c}")

    client_unauth = APIClient()

    results = {}

    # TEST 1: Unauthenticated request to /api/users/
    res = client_unauth.get("/api/users/")
    assert res.status_code == 401, f"Expected 401, got {res.status_code}"
    print("[PASS] Test 1: Unauthenticated request rejected with 401 Unauthorized")

    # TEST 2: List other users (excludes current user)
    res = client_a.get("/api/users/")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    user_ids = [u["id"] for u in data["results"]]
    assert user_a.id not in user_ids, "Current user was not excluded!"
    assert user_b.id in user_ids, "Bob should be in user listing"
    assert "password" not in data["results"][0], "Password exposed in user listing!"
    results["list_users"] = data
    print(f"[PASS] Test 2: User listing excludes current user and contains {len(user_ids)} users with pagination")

    # TEST 3: Search users by username
    res = client_a.get("/api/users/?search=bob")
    assert res.status_code == 200
    data = res.json()
    assert len(data["results"]) == 1 and data["results"][0]["username"] == "bob_test"
    print("[PASS] Test 3: Search by username successfully found 'bob_test'")

    # TEST 4: Search users by headline
    res = client_a.get("/api/users/?search=Product")
    assert res.status_code == 200
    data = res.json()
    assert len(data["results"]) == 1 and data["results"][0]["username"] == "charlie_test"
    print("[PASS] Test 4: Search by headline successfully found Charlie ('Product Manager')")

    # TEST 5: Search users by location
    res = client_a.get("/api/users/?search=London")
    assert res.status_code == 200
    data = res.json()
    assert len(data["results"]) == 1 and data["results"][0]["username"] == "charlie_test"
    print("[PASS] Test 5: Search by location successfully found Charlie ('London, UK')")

    # TEST 6: Prevent self-connection
    res = client_a.post("/api/connections/request/", {"receiver_id": user_a.id}, format="json")
    assert res.status_code == 400, f"Expected 400 for self connection, got {res.status_code}"
    print("[PASS] Test 6: Self-connection rejected with 400 Bad Request")

    # TEST 7: Send connection request (Alice -> Bob)
    res = client_a.post("/api/connections/request/", {"receiver_id": user_b.id}, format="json")
    assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.data}"
    conn_ab = res.json()
    assert conn_ab["status"] == "pending"
    assert conn_ab["sender"]["username"] == "alice_test"
    assert conn_ab["receiver"]["username"] == "bob_test"
    conn_ab_id = conn_ab["id"]
    results["send_request"] = conn_ab
    print(f"[PASS] Test 7: Connection request sent from Alice to Bob (ID: {conn_ab_id})")

    # TEST 8: Prevent duplicate pending request (Alice -> Bob again)
    res = client_a.post("/api/connections/request/", {"receiver_id": user_b.id}, format="json")
    assert res.status_code == 400, f"Expected 400 for duplicate request, got {res.status_code}"
    print("[PASS] Test 8: Duplicate forward pending request rejected with 400 Bad Request")

    # TEST 9: Prevent reverse duplicate pending request (Bob -> Alice while Alice -> Bob is pending)
    res = client_b.post("/api/connections/request/", {"receiver_id": user_a.id}, format="json")
    assert res.status_code == 400, f"Expected 400 for reverse duplicate, got {res.status_code}"
    print("[PASS] Test 9: Reverse duplicate pending request rejected with 400 Bad Request")

    # TEST 10: View received pending requests
    # Bob should see 1 request from Alice
    res = client_b.get("/api/connections/requests/")
    assert res.status_code == 200
    data = res.json()
    req_ids = [r["id"] for r in data["results"]]
    assert conn_ab_id in req_ids, "Bob should see pending request from Alice"
    results["received_requests"] = data
    # Alice should see 0 received requests
    res_a = client_a.get("/api/connections/requests/")
    assert res_a.json()["count"] == 0, "Alice should have 0 received requests"
    print("[PASS] Test 10: Received pending requests correctly shown to receiver and hidden from sender")

    # TEST 11: Unauthorized accept attempt (Alice tries to accept her own request)
    res = client_a.post(f"/api/connections/requests/{conn_ab_id}/accept/")
    assert res.status_code == 403, f"Expected 403 Forbidden when sender tries to accept, got {res.status_code}"
    print("[PASS] Test 11: Unauthorized accept by sender rejected with 403 Forbidden")

    # TEST 12: Receiver accepts connection request (Bob accepts Alice)
    res = client_b.post(f"/api/connections/requests/{conn_ab_id}/accept/")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.data}"
    conn_accepted = res.json()
    assert conn_accepted["status"] == "accepted"
    results["accept_request"] = conn_accepted
    print(f"[PASS] Test 12: Receiver Bob accepted connection request from Alice (status: accepted)")

    # TEST 13: Attempt to accept an already accepted connection
    res = client_b.post(f"/api/connections/requests/{conn_ab_id}/accept/")
    assert res.status_code == 400, f"Expected 400 when accepting already accepted request, got {res.status_code}"
    print("[PASS] Test 13: Accepting already accepted connection rejected with 400 Bad Request")

    # TEST 14: Prevent duplicate connection when already connected (Alice -> Bob or Bob -> Alice)
    res = client_a.post("/api/connections/request/", {"receiver_id": user_b.id}, format="json")
    assert res.status_code == 400, f"Expected 400 when already connected, got {res.status_code}"
    res_rev = client_b.post("/api/connections/request/", {"receiver_id": user_a.id}, format="json")
    assert res_rev.status_code == 400, f"Expected 400 when already connected in reverse, got {res_rev.status_code}"
    print("[PASS] Test 14: New request when already connected rejected in both directions")

    # TEST 15: View existing connections
    # Alice's connections
    res = client_a.get("/api/connections/")
    assert res.status_code == 200
    alice_conns = res.json()
    assert len(alice_conns) == 1
    assert alice_conns[0]["connected_user"]["username"] == "bob_test"
    results["existing_connections_alice"] = alice_conns

    # Bob's connections
    res = client_b.get("/api/connections/")
    assert res.status_code == 200
    bob_conns = res.json()
    assert len(bob_conns) == 1
    assert bob_conns[0]["connected_user"]["username"] == "alice_test"
    results["existing_connections_bob"] = bob_conns
    print("[PASS] Test 15: Existing connections correctly display other user for both Alice and Bob")

    # TEST 16: Reject flow (Charlie sends to Bob, Bob rejects)
    res = client_c.post("/api/connections/request/", {"receiver_id": user_b.id}, format="json")
    assert res.status_code == 201
    conn_cb_id = res.json()["id"]

    # Charlie (sender) cannot reject
    res = client_c.post(f"/api/connections/requests/{conn_cb_id}/reject/")
    assert res.status_code == 403
    print("[PASS] Test 16a: Sender cannot reject their own request (403 Forbidden)")

    # Bob (receiver) rejects
    res = client_b.post(f"/api/connections/requests/{conn_cb_id}/reject/")
    assert res.status_code == 200
    assert res.json()["status"] == "rejected"
    results["reject_request"] = res.json()
    print("[PASS] Test 16b: Receiver Bob rejected request from Charlie (status: rejected)")

    # TEST 17: Remove connection (Charlie sends to Alice, Alice accepts, then removed)
    res = client_c.post("/api/connections/request/", {"receiver_id": user_a.id}, format="json")
    assert res.status_code == 201
    conn_ca_id = res.json()["id"]
    res = client_a.post(f"/api/connections/requests/{conn_ca_id}/accept/")
    assert res.status_code == 200

    # User B (unauthorized third-party) tries to remove connection between Charlie and Alice
    res = client_b.delete(f"/api/connections/{conn_ca_id}/")
    assert res.status_code == 403, f"Expected 403 Forbidden for third-party delete, got {res.status_code}"
    print("[PASS] Test 17a: Third-party user cannot remove someone else's connection (403 Forbidden)")

    # Alice (participant) removes the connection
    res = client_a.delete(f"/api/connections/{conn_ca_id}/")
    assert res.status_code == 200, f"Expected 200 OK, got {res.status_code}"
    results["remove_connection"] = res.json()
    assert not Connection.objects.filter(id=conn_ca_id).exists()
    print("[PASS] Test 17b: Participant Alice successfully removed connection with Charlie")

    # Clean up test users
    User.objects.filter(username__in=["alice_test", "bob_test", "charlie_test", "diana_test"]).delete()

    print("==================================================")
    print("ALL 17 TESTS PASSED SUCCESSFULLY!")
    print("==================================================")
    return results

if __name__ == "__main__":
    run_tests()

