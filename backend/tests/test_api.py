import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import Base, engine
from app.database.seed import seed_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    seed_db()

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["app"] == "G KORALINK"

def test_admin_login():
    response = client.post("/api/auth/login", json={
        "phone_number": "0784772228",
        "password": "Enock@KoralinK"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "ADMIN"
    assert "access_token" in data

def test_user_registration_and_login():
    phone = "0789999111"
    reg_data = {
        "amazina_ya_mbere": "Kagabo",
        "izina_rya_kabiri": "PATRICK",
        "phone_number": phone,
        "location": "Kigali, Kicukiro",
        "password": "Password123",
        "confirm_password": "Password123"
    }
    res = client.post("/api/auth/register", json=reg_data)
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "UMUKORESHA"
    token = data["access_token"]

    # Check profile
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["full_name"] == "Kagabo PATRICK"

def test_full_financial_flow():
    # 1. Admin login
    admin_res = client.post("/api/auth/login", json={
        "phone_number": "0784772228",
        "password": "Enock@KoralinK"
    })
    assert admin_res.status_code == 200, f"Admin login failed: {admin_res.json()}"
    admin_token = admin_res.json()["access_token"]

    # 2. User login
    user_res = client.post("/api/auth/login", json={
        "phone_number": "0781234567",
        "password": "User123456"
    })
    assert user_res.status_code == 200, f"User login failed: {user_res.json()}"
    user_token = user_res.json()["access_token"]
    user_headers = {"Authorization": f"Bearer {user_token}"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 3. Check Ikibina groups
    groups_res = client.get("/api/ikibina", headers=user_headers)
    assert groups_res.status_code == 200
    groups = groups_res.json()
    assert len(groups) > 0
    group_id = groups[0]["id"]

    # 4. Submit savings transaction
    savings_res = client.post("/api/savings", json={
        "group_id": group_id,
        "amount": 9000.0,
        "payment_reference": "MOMO-TEST-1234"
    }, headers=user_headers)
    assert savings_res.status_code == 200
    savings_id = savings_res.json()["id"]

    # 5. Admin approves savings
    approve_sav = client.post(f"/api/savings/admin/{savings_id}/approve", headers=admin_headers)
    assert approve_sav.status_code == 200

    # 6. Check user dashboard stats
    dash_res = client.get("/api/users/me/dashboard", headers=user_headers)
    assert dash_res.status_code == 200
    assert dash_res.json()["total_savings"] >= 9000.0

    print("--> All backend API tests passed successfully!")
