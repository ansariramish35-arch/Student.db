"""Students Database CRUD API — FastAPI + SQLite (+ optional Ollama assistant).

Developer: Mohammad Ramish Ansari
           B.Tech. CSE, University of Lucknow
           ansariramish35@gmail.com

Run from the `backend/` directory:

    uvicorn app.main:app --reload

Interactive docs: http://127.0.0.1:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import assistant, students

# Create tables on startup (safe no-op when they already exist).
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Students CRUD API",
    version="1.0.0",
    description=(
        "Manage student records with full Create / Read / Update / Delete "
        "operations. Bonus: POST /assistant/ask answers natural-language "
        "questions using records fetched from the database (optional local "
        "Ollama model).\n\n"
        "**Developer:** Mohammad Ramish Ansari · B.Tech. CSE, "
        "University of Lucknow · ansariramish35@gmail.com"
    ),
    contact={
        "name": "Mohammad Ramish Ansari",
        "url": "https://www.linkedin.com/in/ramish-ansari/",
        "email": "ansariramish35@gmail.com",
    },
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(students.router)
app.include_router(assistant.router)


@app.get("/", tags=["health"])
def root():
    return {
        "service": "students-crud-api",
        "status": "ok",
        "docs": "/docs",
        "endpoints": {
            "students": ["/students", "/students/{student_id}"],
            "assistant": ["/assistant/ask"],
        },
    }


@app.get("/health", tags=["health"])
def health():
    return {"status": "healthy"}
