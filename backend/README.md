# Students Database CRUD API

**EWB Edu Tech Pvt. Ltd. — Python Backend Development Internship Project**

**Developer:** Mohammad Ramish Ansari
**Program:** B.Tech. Computer Science & Engineering, University of Lucknow
**Contact:** ansariramish35@gmail.com · +91-7007043871
**LinkedIn:** [linkedin.com/in/ramish-ansari](https://www.linkedin.com/in/ramish-ansari/)

---

A production-style backend for managing student records with full
**Create / Read / Update / Delete** operations, built with
**Python · FastAPI · SQLite (SQLAlchemy)**. Includes an **optional bonus
endpoint** that answers natural-language questions using a local
[Ollama](https://ollama.com) model — grounded strictly in records fetched
from the database.

> All sample data is fictional dummy data. No real student information,
> credentials or secrets are stored in this repository.

---

## 1. Features

| Requirement | Status |
|---|---|
| Create students | `POST /students` (auto-generates `STU-XXXX` IDs, returns `201`) |
| Read / list / filter | `GET /students` with `q`, `course`, `born_after`, `born_before`, pagination |
| Read one | `GET /students/{student_id}` |
| Update | `PUT /students/{student_id}` (full) · `PATCH /students/{student_id}` (partial) |
| Delete | `DELETE /students/{student_id}` (`204`) |
| Input validation | Pydantic v2 — email format, DOB not in future, phone pattern, lengths |
| Missing-record handling | JSON `404`, `409` on duplicate student_id/email, `422` on bad input |
| Persistent SQLite storage | `students.db` file, survives restarts |
| **Bonus: local AI** | `POST /assistant/ask` + Ollama (`llama3.2:1b`), template fallback offline |
| Tests | 8 pytest cases covering CRUD, validation, 404s, and the assistant |

---

## 2. Tech Stack

- **Python 3.10+**
- **FastAPI** — web framework (with Swagger UI out of the box)
- **SQLite** via **SQLAlchemy 2.x** ORM
- **Pydantic v2** — validation
- **httpx** — calls the local Ollama server (optional)
- **pytest** — test suite

---

## 3. Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app, CORS, router registration
│   ├── database.py             # SQLite engine + session dependency
│   ├── models.py               # `students` table (SQLAlchemy ORM)
│   ├── schemas.py              # Pydantic schemas + validation rules
│   ├── crud.py                 # all DB operations (single access layer)
│   └── routers/
│       ├── __init__.py
│       ├── students.py         # CRUD endpoints
│       └── assistant.py        # BONUS: natural-language Q&A endpoint
├── tests/
│   └── test_students.py        # pytest suite (in-memory DB)
├── seed.py                     # loads 24 dummy students
├── requirements.txt
├── .gitignore                  # excludes students.db, .env, caches
└── README.md
```

**Architecture:** `router → crud → SQLAlchemy → SQLite`. Routers handle HTTP,
`crud.py` is the only module that touches the database, and `schemas.py` owns
validation. That separation keeps the code easy to demo and easy to test.

---

## 4. Prerequisites

- Python **3.10 or newer**
- (Optional) [Ollama](https://ollama.com/download) for the AI bonus

## 5. Installation & Run

```bash
cd backend

# 1. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. (Recommended) load dummy data
python seed.py

# 4. Start the API
uvicorn app.main:app --reload
```

The API is now live:

- Swagger UI (try every endpoint interactively): **http://127.0.0.1:8000/docs**
- ReDoc: http://127.0.0.1:8000/redoc
- Health check: http://127.0.0.1:8000/health

Data persists in `students.db` (created automatically on first run).

---

## 6. API Reference

| Method | Endpoint | Purpose | Success |
|---|---|---|---|
| `POST` | `/students` | Create a student | `201` |
| `GET` | `/students` | List / filter students | `200` |
| `GET` | `/students/{student_id}` | View one student | `200` |
| `PUT` | `/students/{student_id}` | Full update (all fields required) | `200` |
| `PATCH` | `/students/{student_id}` | Partial update (any subset of fields) | `200` |
| `DELETE` | `/students/{student_id}` | Delete a student | `204` |
| `POST` | `/assistant/ask` | **Bonus:** natural-language Q&A grounded in DB records | `200` |

### Student record fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | int | auto | Internal primary key |
| `student_id` | string | optional on create | Unique `STU-XXXX`; auto-generated if omitted |
| `name` | string | yes | 2–80 chars |
| `dob` | date | yes | `YYYY-MM-DD`, cannot be in the future |
| `email` | string | yes | Unique, valid email format (stored lowercase) |
| `phone` | string | no | Digits / spaces / `() -`, 7–20 chars |
| `course` | string | no | Filterable |
| `address` | string | no | ≤ 200 chars |
| `enrollment_date` | date | no | Defaults to today |
| `created_at` / `updated_at` | datetime | auto | Timestamps maintained by the API |

---

## 7. API Testing with curl

### Create

```bash
curl -X POST http://127.0.0.1:8000/students \
  -H "Content-Type: application/json" \
  -d '{
        "name": "Aarav Mehta",
        "dob": "2004-03-12",
        "email": "aarav.mehta@example.com",
        "phone": "+91-9812345601",
        "course": "Computer Science",
        "address": "14 MG Road, Bengaluru",
        "enrollment_date": "2023-08-01"
      }'
```

**201 response**

```json
{
  "id": 1,
  "student_id": "STU-0001",
  "name": "Aarav Mehta",
  "dob": "2004-03-12",
  "email": "aarav.mehta@example.com",
  "phone": "+91-9812345601",
  "course": "Computer Science",
  "address": "14 MG Road, Bengaluru",
  "enrollment_date": "2023-08-01",
  "created_at": "2026-02-14T10:30:00",
  "updated_at": "2026-02-14T10:30:00"
}
```

### List + filters

```bash
curl "http://127.0.0.1:8000/students"
curl "http://127.0.0.1:8000/students?born_after=2005-12-31"
curl "http://127.0.0.1:8000/students?course=Data%20Science"
curl "http://127.0.0.1:8000/students?q=aarav&limit=10&skip=0"
```

Response envelope: `{"total": 24, "items": [ ... ]}`

### View one

```bash
curl http://127.0.0.1:8000/students/1
```

### Update (partial)

```bash
curl -X PATCH http://127.0.0.1:8000/students/1 \
  -H "Content-Type: application/json" \
  -d '{"course": "Data Science"}'
```

### Update (full replace)

```bash
curl -X PUT http://127.0.0.1:8000/students/1 \
  -H "Content-Type: application/json" \
  -d '{
        "name": "Aarav Mehta",
        "dob": "2004-03-12",
        "email": "aarav.mehta@example.com",
        "course": "Data Science",
        "enrollment_date": "2023-08-01"
      }'
```

### Delete

```bash
curl -i -X DELETE http://127.0.0.1:8000/students/1    # HTTP/1.1 204 No Content
```

### Error handling examples

| Request | Response |
|---|---|
| `GET /students/999` | `404 {"detail": "student with id 999 not found"}` |
| duplicate email on POST | `409 {"detail": "student_id or email already exists"}` |
| `"dob": "2999-01-01"` | `422` — "date of birth cannot be in the future" |
| `"email": "not-an-email"` | `422` — value is not a valid email address |
| `PATCH` with `{}` | `400 {"detail": "empty update payload — provide at least one field"}` |

---

## 8. Optional Bonus — Local AI with Ollama

The `POST /assistant/ask` endpoint answers questions such as:

- “How many students are there?”
- “List students born after 2005.”
- “How many students are in Data Science?”
- “Who enrolled most recently?”

### Security design (important)

The model **never sees or writes SQL**:

1. Python intent-parsing code selects **safe, parameterized ORM queries**.
2. Matching rows are fetched from SQLite by backend code.
3. Only those rows (as JSON) plus the question are sent to the model.
4. The model’s reply is returned alongside the exact records used
   (`grounded_records`), so every answer is verifiable.

If Ollama is offline, the endpoint still returns a deterministic template
answer built from the same records (`"ollama_used": false`).

### Setup

```bash
# 1. Install Ollama, then pull a small model (~1.3 GB)
ollama pull llama3.2:1b

# 2. Make sure the Ollama server is running (it usually starts automatically)
ollama serve

# 3. Restart the FastAPI app, then ask:
curl -X POST http://127.0.0.1:8000/assistant/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "List students born after 2005"}'
```

**Response**

```json
{
  "answer": "6 students were born after 2005: Ananya Das, ...",
  "intent": "born_after",
  "grounded_count": 6,
  "grounded_records": [ { "id": 4, "student_id": "STU-0004", ... } ],
  "ollama_used": true
}
```

Configuration via environment variables:

| Variable | Default | Purpose |
|---|---|---|
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `llama3.2:1b` | Model to query |
| `OLLAMA_TIMEOUT` | `25` | Seconds before falling back to template answer |
| `DATABASE_URL` | `sqlite:///./students.db` | Override the DB location |

---

## 9. Running the Tests

```bash
cd backend
pytest -v
```

Covers: create + auto-ID, duplicate rejection (409), list/filter, the full
get → update → delete lifecycle, 404s, validation (422), empty PATCH (400),
and the assistant answering from real records.

---

## 10. Security & Privacy Notes

- Only **fictional dummy data** is committed; `students.db` is git-ignored.
- No secrets in source — everything configurable via environment variables.
- All SQL goes through the SQLAlchemy ORM (parameterized — no SQL injection).
- The AI model cannot execute SQL; it receives pre-fetched JSON context only.

---

## 11. Reproducibility Checklist (for reviewers)

1. `python -m venv .venv && source .venv/bin/activate`
2. `pip install -r requirements.txt`
3. `python seed.py`
4. `uvicorn app.main:app --reload`
5. Open http://127.0.0.1:8000/docs and exercise all five CRUD routes
6. `pytest -v` — all tests pass
7. (Bonus) `ollama pull llama3.2:1b` → `POST /assistant/ask`

---

---

**Developed by Mohammad Ramish Ansari** · B.Tech. CSE, University of Lucknow
ansariramish35@gmail.com · [LinkedIn](https://www.linkedin.com/in/ramish-ansari/)

*Issued by EWB Edu Tech Pvt. Ltd. — Internship Program · EWB COURSES — Learn. Elevate. Empower.*
