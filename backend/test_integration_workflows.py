import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def make_request(path, method="GET", data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    encoded_data = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            status = response.status
            body = response.read().decode("utf-8")
            return status, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            parsed = json.loads(body) if body else {}
        except Exception:
            parsed = body
        return e.code, parsed

def run():
    print("==================================================")
    print("CONNECTLY FULL INTEGRATION & WORKFLOW VERIFICATION")
    print("==================================================")

    import uuid
    suffix = uuid.uuid4().hex[:6]
    u1_name = f"user1_{suffix}"
    u1_email = f"user1_{suffix}@example.com"
    u2_name = f"user2_{suffix}"
    u2_email = f"user2_{suffix}@example.com"
    pwd = "TestPassword123!"

    # 1. User Registration Workflow
    print("\n[Workflow 1] User Registration:")
    status, res = make_request("/api/register/", "POST", {
        "username": u1_name,
        "email": u1_email,
        "password": pwd
    })
    assert status == 201, f"User 1 registration failed: {status} {res}"
    print(f" -> User 1 ({u1_name}) registered successfully (HTTP 201)")

    status, res = make_request("/api/register/", "POST", {
        "username": u2_name,
        "email": u2_email,
        "password": pwd
    })
    assert status == 201, f"User 2 registration failed: {status} {res}"
    print(f" -> User 2 ({u2_name}) registered successfully (HTTP 201)")

    # 2. User Login Workflow
    print("\n[Workflow 2] User Login:")
    status, token_res_1 = make_request("/api/token/", "POST", {
        "email": u1_email,
        "password": pwd
    })
    assert status == 200 and "access" in token_res_1, f"User 1 login failed: {status} {token_res_1}"
    token_1 = token_res_1["access"]
    print(f" -> User 1 authenticated successfully, received JWT tokens (HTTP 200)")

    status, token_res_2 = make_request("/api/token/", "POST", {
        "email": u2_email,
        "password": pwd
    })
    assert status == 200 and "access" in token_res_2, f"User 2 login failed: {status} {token_res_2}"
    token_2 = token_res_2["access"]
    print(f" -> User 2 authenticated successfully, received JWT tokens (HTTP 200)")

    # 3. Profile Creation Workflow
    print("\n[Workflow 3] Profile Creation:")
    # Check existing profile (should be empty array for new user)
    status, profs = make_request("/api/profiles/me/", "GET", token=token_1)
    assert status == 200 and len(profs) == 0, f"Expected empty profile list: {status} {profs}"
    print(" -> GET /api/profiles/me/ verified empty for fresh account")

    # Create profile
    status, new_prof = make_request("/api/profiles/me/", "POST", {
        "headline": "Full Stack Architect",
        "linkedin_url": f"https://linkedin.com/in/{u1_name}",
        "location": "San Francisco, CA",
        "bio": "Building reliable web systems."
    }, token=token_1)
    assert status == 201, f"Profile creation failed: {status} {new_prof}"
    print(" -> User 1 profile created via POST /api/profiles/me/ (HTTP 201)")

    # Create profile for User 2 as well
    status, _ = make_request("/api/profiles/me/", "POST", {
        "headline": "Staff Security Engineer",
        "linkedin_url": f"https://linkedin.com/in/{u2_name}",
        "location": "New York, NY"
    }, token=token_2)
    assert status == 201
    print(" -> User 2 profile created via POST /api/profiles/me/ (HTTP 201)")

    # 4. Dashboard Profile Information Loading
    print("\n[Workflow 4] Dashboard Profile Information Loading:")
    status, user_info = make_request("/api/profile/", "GET", token=token_1)
    assert status == 200 and user_info["username"] == u1_name, f"Account info failed: {status} {user_info}"
    status, prof_info = make_request("/api/profiles/me/", "GET", token=token_1)
    assert status == 200 and len(prof_info) == 1 and prof_info[0]["headline"] == "Full Stack Architect"
    print(f" -> Dashboard successfully queried account: {user_info['username']} and headline: {prof_info[0]['headline']}")

    # 5. My Network User Search
    print("\n[Workflow 5] My Network User Search:")
    status, search_res = make_request(f"/api/users/?search={u2_name}", "GET", token=token_1)
    assert status == 200 and search_res["count"] >= 1, f"User search failed: {status} {search_res}"
    user_2_record = next(u for u in search_res["results"] if u["username"] == u2_name)
    user_2_id = user_2_record["id"]
    print(f" -> Search for '{u2_name}' found User 2 (ID: {user_2_id}, headline: {user_2_record['profile']['headline']})")

    # 6. Sending Connection Request
    print("\n[Workflow 6] Sending Connection Request:")
    status, req_res = make_request("/api/connections/request/", "POST", {
        "receiver_id": user_2_id
    }, token=token_1)
    assert status == 201 and req_res["status"] == "pending", f"Send connection failed: {status} {req_res}"
    conn_id = req_res["id"]
    print(f" -> Connection request sent from User 1 to User 2 (Connection ID: {conn_id}, HTTP 201)")

    # 7. Receiving Connection Request
    print("\n[Workflow 7] Receiving Connection Request:")
    status, pending_res = make_request("/api/connections/requests/", "GET", token=token_2)
    assert status == 200 and any(p["id"] == conn_id for p in pending_res["results"]), f"Pending failed: {pending_res}"
    print(f" -> User 2 successfully received pending invitation from User 1 (HTTP 200)")

    # 8. Accepting Connection Request
    print("\n[Workflow 8] Accepting Connection Request:")
    status, accept_res = make_request(f"/api/connections/requests/{conn_id}/accept/", "POST", token=token_2)
    assert status == 200 and accept_res["status"] == "accepted", f"Accept failed: {status} {accept_res}"
    print(f" -> User 2 accepted invitation from User 1 (Status: accepted, HTTP 200)")

    # 9. Viewing Existing Connections
    print("\n[Workflow 9] Viewing Existing Connections:")
    status, conns_1 = make_request("/api/connections/", "GET", token=token_1)
    assert status == 200 and any(c["connected_user"]["username"] == u2_name for c in conns_1), f"Conns 1 failed: {conns_1}"
    status, conns_2 = make_request("/api/connections/", "GET", token=token_2)
    assert status == 200 and any(c["connected_user"]["username"] == u1_name for c in conns_2), f"Conns 2 failed: {conns_2}"
    print(f" -> Both User 1 and User 2 see each other in their connection lists (HTTP 200)")

    # 10. Rejecting Connection Request
    print("\n[Workflow 10] Rejecting Connection Request:")
    # Register third user
    u3_name = f"user3_{suffix}"
    status, _ = make_request("/api/register/", "POST", {"username": u3_name, "email": f"{u3_name}@example.com", "password": pwd})
    status, t3_res = make_request("/api/token/", "POST", {"email": f"{u3_name}@example.com", "password": pwd})
    token_3 = t3_res["access"]
    # User 3 sends to User 1
    u1_record = next(u for u in make_request(f"/api/users/?search={u1_name}", "GET", token=token_3)[1]["results"] if u["username"] == u1_name)
    status, req31 = make_request("/api/connections/request/", "POST", {"receiver_id": u1_record["id"]}, token=token_3)
    conn31_id = req31["id"]
    # User 1 rejects
    status, rej_res = make_request(f"/api/connections/requests/{conn31_id}/reject/", "POST", token=token_1)
    assert status == 200 and rej_res["status"] == "rejected", f"Reject failed: {status} {rej_res}"
    print(f" -> User 1 rejected invitation from User 3 (Status: rejected, HTTP 200)")

    # 11. Removing Connection
    print("\n[Workflow 11] Removing Existing Connection:")
    status, del_res = make_request(f"/api/connections/{conn_id}/", "DELETE", token=token_1)
    assert status == 200, f"Delete connection failed: {status} {del_res}"
    status, conns_after = make_request("/api/connections/", "GET", token=token_1)
    assert not any(c["id"] == conn_id for c in conns_after), "Connection still present after deletion"
    print(f" -> Connection {conn_id} removed successfully (HTTP 200)")

    # 12. Logout / Unauthenticated Protection
    print("\n[Workflow 12] Logout & Route Protection:")
    status, unauth_res = make_request("/api/users/", "GET")
    assert status == 401, f"Expected 401 for unauthenticated request, got {status}"
    print(" -> Unauthenticated request correctly rejected with HTTP 401 Unauthorized")

    print("\n==================================================")
    print("ALL 12 INTEGRATION WORKFLOWS PASSED WITH 100% SUCCESS!")
    print("==================================================")

if __name__ == "__main__":
    run()

