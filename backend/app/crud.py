"""Database access layer — the only module that talks to SQLAlchemy."""
from datetime import date
from typing import Optional

from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from . import models, schemas


class DuplicateError(Exception):
    """Raised when student_id or email violates a UNIQUE constraint."""


def _next_student_id(db: Session) -> str:
    """Generate the next sequential public ID, e.g. STU-0007."""
    ids = db.scalars(select(models.Student.student_id)).all()
    highest = 0
    for sid in ids:
        if sid.upper().startswith("STU-"):
            try:
                highest = max(highest, int(sid.split("-", 1)[1]))
            except ValueError:
                continue
    return f"STU-{highest + 1:04d}"


def create_student(db: Session, payload: schemas.StudentCreate) -> models.Student:
    data = payload.model_dump(exclude={"student_id"})
    student = models.Student(
        **data,
        email=data["email"].lower(),
        student_id=payload.student_id or _next_student_id(db),
    )
    db.add(student)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise DuplicateError("student_id or email already exists") from exc
    db.refresh(student)
    return student


def get_student(db: Session, student_pk: int) -> Optional[models.Student]:
    return db.get(models.Student, student_pk)


def list_students(
    db: Session,
    *,
    q: Optional[str] = None,
    course: Optional[str] = None,
    born_after: Optional[date] = None,
    born_before: Optional[date] = None,
    skip: int = 0,
    limit: int = 50,
) -> tuple[int, list[models.Student]]:
    stmt = select(models.Student)
    count_stmt = select(func.count(models.Student.id))

    filters = []
    if q:
        like = f"%{q}%"
        filters.append(
            or_(
                models.Student.name.ilike(like),
                models.Student.email.ilike(like),
                models.Student.student_id.ilike(like),
            )
        )
    if course:
        filters.append(models.Student.course.ilike(course))
    if born_after:
        filters.append(models.Student.dob > born_after)
    if born_before:
        filters.append(models.Student.dob < born_before)

    for condition in filters:
        stmt = stmt.where(condition)
        count_stmt = count_stmt.where(condition)

    total = db.scalar(count_stmt) or 0
    items = list(
        db.scalars(
            stmt.order_by(models.Student.id).offset(skip).limit(limit)
        ).all()
    )
    return total, items


def update_student(
    db: Session, student: models.Student, changes: dict
) -> models.Student:
    for field, value in changes.items():
        if field == "email" and isinstance(value, str):
            value = value.lower()
        setattr(student, field, value)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise DuplicateError("student_id or email already exists") from exc
    db.refresh(student)
    return student


def delete_student(db: Session, student: models.Student) -> None:
    db.delete(student)
    db.commit()
