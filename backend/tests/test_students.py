"""CRUD + validation tests. Run from backend/:  pytest -v

Uses an isolated in-memory SQLite database, so nothing touches students.db.
"""
import os
import sys

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402

test_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture()
def client():
    Base.metadata.create_all(bind=test_engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=test_engine)


VALID = {
    "name": "Test Student",
    "dob": "2004-05-10",
    "email": "test.student@example.com",
    "phone": "+91-9812345678",
    "course": "Computer Science",
    "address": "1 Test Lane, Pune",
    "enrollment_date": "2023-08-01",
}


def test_create_student(client):
    resp = client.post("/students", json=VALID)
    assert resp.status_code == 201
    body = resp.json()
    assert body["student_id"] == "STU-0001"  # auto-generated
    assert body["email"] == "test.student@example.com"


def test_duplicate_email_rejected(client):
    client.post("/students", json=VALID)
    resp = client.post("/students", json=VALID)
    assert resp.status_code == 409


def test_list_and_filter(client):
    client.post("/students", json=VALID)
    client.post(
        "/students",
        json={**VALID, "name": "Young One", "dob": "2007-01-01",
              "email": "young.one@example.com"},
    )
    assert client.get("/students").json()["total"] == 2
    born_after = client.get("/students", params={"born_after": "2006-12-31"})
    assert born_after.json()["total"] == 1
    assert born_after.json()["items"][0]["name"] == "Young One"
    by_q = client.get("/students", params={"q": "young"})
    assert by_q.json()["total"] == 1
    by_course = client.get("/students", params={"course": "computer science"})
    assert by_course.json()["total"] == 2


def test_get_update_delete_flow(client):
    created = client.post("/students", json=VALID).json()
    sid = created["id"]

    fetched = client.get(f"/students/{sid}")
    assert fetched.status_code == 200
    assert fetched.json()["name"] == "Test Student"

    patched = client.patch(f"/students/{sid}", json={"course": "Data Science"})
    assert patched.status_code == 200
    assert patched.json()["course"] == "Data Science"

    replaced = client.put(
        f"/students/{sid}", json={**VALID, "name": "Renamed Student"}
    )
    assert replaced.status_code == 200
    assert replaced.json()["name"] == "Renamed Student"

    assert client.delete(f"/students/{sid}").status_code == 204
    assert client.get(f"/students/{sid}").status_code == 404


def test_missing_record_returns_404(client):
    assert client.get("/students/999").status_code == 404
    assert client.patch("/students/999", json={"name": "Nobody"}).status_code == 404
    assert client.delete("/students/999").status_code == 404


def test_validation_errors(client):
    bad_email = client.post("/students", json={**VALID, "email": "not-an-email"})
    assert bad_email.status_code == 422

    future_dob = client.post("/students", json={**VALID, "dob": "2999-01-01"})
    assert future_dob.status_code == 422

    short_name = client.post("/students", json={**VALID, "name": "X"})
    assert short_name.status_code == 422

    bad_phone = client.post("/students", json={**VALID, "phone": "abc"})
    assert bad_phone.status_code == 422


def test_empty_patch_rejected(client):
    created = client.post("/students", json=VALID).json()
    resp = client.patch(f"/students/{created['id']}", json={})
    assert resp.status_code == 400


def test_assistant_answers_from_records(client):
    client.post("/students", json=VALID)
    resp = client.post("/assistant/ask", json={"question": "How many students are there?"})
    assert resp.status_code == 200
    body = resp.json()
    assert "1 student" in body["answer"]
    assert body["intent"] == "count_all"
