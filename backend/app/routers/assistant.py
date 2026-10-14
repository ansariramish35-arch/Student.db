"""OPTIONAL BONUS — answer natural-language questions about the student table.

Security model
--------------
The language model NEVER writes or executes SQL. Python code decides which
rows are relevant using safe ORM queries, fetches them, and hands them to a
local Ollama model as plain JSON context. When Ollama is not running, a
deterministic template answers from the same grounded records.
"""
import json
import os
import re
from datetime import date
from typing import Optional

import httpx
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/assistant", tags=["assistant (optional AI)"])

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:1b")
OLLAMA_TIMEOUT = float(os.getenv("OLLAMA_TIMEOUT", "25"))

YEAR_RE = re.compile(r"\b(19\d{2}|20\d{2})\b")
STOPWORDS = {
    "the", "a", "an", "of", "in", "on", "is", "are", "who", "what", "which",
    "list", "show", "me", "all", "any", "many", "how", "there", "student",
    "students", "born", "after", "before", "since", "get", "find", "tell",
    "their", "them", "with", "for", "from", "course", "enrolled", "most",
    "recently", "does", "do", "give",
}


class AskRequest(BaseModel):
    question: str = Field(
        min_length=3, max_length=500, examples=["How many students are there?"]
    )


class AskResponse(BaseModel):
    answer: str
    intent: str
    grounded_count: int
    grounded_records: list[schemas.StudentOut]
    ollama_used: bool


# ---------------------------------------------------------------- intent layer
def _distinct_courses(db: Session) -> list[str]:
    rows = db.execute(
        select(models.Student.course)
        .distinct()
        .where(models.Student.course.isnot(None))
    ).all()
    return [row[0] for row in rows]


def _detect_intent(question: str, db: Session) -> tuple[str, dict]:
    q = question.lower()
    year_match = YEAR_RE.search(q)
    year = int(year_match.group(1)) if year_match else None
    matched_course = next((c for c in _distinct_courses(db) if c.lower() in q), None)

    if "born" in q and year and ("after" in q or "since" in q):
        return "born_after", {"year": year}
    if "born" in q and year and ("before" in q or "earlier" in q):
        return "born_before", {"year": year}
    if "youngest" in q:
        return "youngest", {}
    if "oldest" in q:
        return "oldest", {}
    if "recent" in q or "latest" in q or "newest" in q:
        return "recent_enrollments", {}
    if "how many" in q:
        if matched_course:
            return "count_by_course", {"course": matched_course}
        return "count_all", {}
    if matched_course:
        return "list_by_course", {"course": matched_course}
    return "search", {}


# ------------------------------------------------------------------ data layer
def _base_total(db: Session) -> int:
    return db.scalar(select(func.count(models.Student.id))) or 0


def _serialize(student: models.Student) -> dict:
    return schemas.StudentOut.model_validate(student).model_dump(mode="json")


def _fetch(
    db: Session, intent: str, params: dict, question: str
) -> tuple[list[models.Student], int]:
    """Return (matching rows, matched count) using safe ORM queries only."""
    stmt = select(models.Student)
    fetch_limit = 10

    if intent == "born_after":
        stmt = stmt.where(models.Student.dob > date(params["year"], 12, 31)).order_by(
            models.Student.dob
        )
    elif intent == "born_before":
        stmt = stmt.where(models.Student.dob < date(params["year"], 1, 1)).order_by(
            models.Student.dob
        )
    elif intent in ("list_by_course", "count_by_course"):
        stmt = stmt.where(models.Student.course.ilike(params["course"])).order_by(
            models.Student.name
        )
    elif intent == "count_all":
        stmt = stmt.order_by(models.Student.id)
    elif intent == "youngest":
        stmt = stmt.order_by(models.Student.dob.desc())
        fetch_limit = 1
    elif intent == "oldest":
        stmt = stmt.order_by(models.Student.dob.asc())
        fetch_limit = 1
    elif intent == "recent_enrollments":
        stmt = stmt.order_by(models.Student.enrollment_date.desc())
        fetch_limit = 5
    elif intent == "search":
        tokens = [
            t
            for t in re.split(r"[^a-z0-9]+", question.lower())
            if len(t) >= 3 and t not in STOPWORDS
        ]
        conditions = [
            or_(
                models.Student.name.ilike(f"%{t}%"),
                models.Student.email.ilike(f"%{t}%"),
                models.Student.student_id.ilike(f"%{t}%"),
            )
            for t in tokens[:4]
        ]
        if not conditions:
            return [], 0
        stmt = stmt.where(or_(*conditions)).order_by(models.Student.name)

    records = list(db.scalars(stmt.limit(fetch_limit)).all())
    return records, len(records)


# --------------------------------------------------------------- answer layer
def _template_answer(
    intent: str, params: dict, records: list[models.Student], count: int, total: int
) -> str:
    names = ", ".join(r.name for r in records[:6])
    plural = "s" if count != 1 else ""

    if intent == "count_all":
        return (
            f"There {'is' if total == 1 else 'are'} {total} "
            f"student{'s' if total != 1 else ''} in the database."
        )
    if intent == "count_by_course":
        return f"{count} student{plural} are enrolled in {params['course']}: {names}"
    if intent == "list_by_course":
        if count == 0:
            return f"No students found in {params['course']}."
        return f"Students in {params['course']} ({count}): {names}"
    if intent == "born_after":
        return f"{count} student{plural} were born after {params['year']}: {names}"
    if intent == "born_before":
        return f"{count} student{plural} were born before {params['year']}: {names}"
    if intent == "youngest" and records:
        r = records[0]
        return f"The youngest student is {r.name}, born {r.dob.isoformat()}."
    if intent == "oldest" and records:
        r = records[0]
        return f"The oldest student is {r.name}, born {r.dob.isoformat()}."
    if intent == "recent_enrollments" and records:
        latest = ", ".join(f"{r.name} ({r.enrollment_date.isoformat()})" for r in records)
        return f"Most recent enrollments: {latest}."
    if intent == "search":
        if count == 0:
            return (
                "I could not match that question to any records. Try: 'How many "
                "students are there?', 'List students born after 2005', "
                "'Students in Data Science', or a student's name."
            )
        return f"I found {count} matching record{plural}: {names}"
    return "Here is what I found in the database."


def _ask_ollama(question: str, context: dict) -> Optional[str]:
    """Send grounded context to the local model; None if Ollama is offline."""
    prompt = (
        "You are a precise data assistant. Answer the user's question ONLY "
        "using the JSON data below. Never invent rows, numbers or dates. "
        "If the data does not contain the answer, say so. Keep it short.\n\n"
        f"DATA (JSON):\n{json.dumps(context, default=str)[:6000]}\n\n"
        f"QUESTION: {question}\nANSWER:"
    )
    try:
        with httpx.Client(timeout=OLLAMA_TIMEOUT) as client:
            resp = client.post(
                f"{OLLAMA_HOST}/api/generate",
                json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
            )
            resp.raise_for_status()
            text = resp.json().get("response", "").strip()
            return text or None
    except (httpx.HTTPError, ValueError):
        return None


# ------------------------------------------------------------------- endpoint
@router.post("/ask", response_model=AskResponse, summary="Ask a natural-language question")
def ask(payload: AskRequest, db: Session = Depends(get_db)):
    intent, params = _detect_intent(payload.question, db)
    records, matched = _fetch(db, intent, params, payload.question)
    total = _base_total(db)

    context = {
        "total_students_in_database": total,
        "matched_count": matched,
        "matched_records": [_serialize(r) for r in records[:10]],
    }

    answer = _ask_ollama(payload.question, context)
    ollama_used = answer is not None
    if answer is None:
        answer = _template_answer(intent, params, records, matched, total)

    return AskResponse(
        answer=answer,
        intent=intent,
        grounded_count=len(records),
        grounded_records=[schemas.StudentOut.model_validate(r) for r in records[:10]],
        ollama_used=ollama_used,
    )
