"""REST endpoints for the students resource."""
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..database import get_db

router = APIRouter(prefix="/students", tags=["students"])


def _get_or_404(db: Session, student_id: int) -> models.Student:
    student = crud.get_student(db, student_id)
    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"student with id {student_id} not found",
        )
    return student


@router.post(
    "",
    response_model=schemas.StudentOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a student",
)
def create_student(payload: schemas.StudentCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_student(db, payload)
    except crud.DuplicateError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(exc)
        ) from exc


@router.get("", response_model=schemas.StudentList, summary="List / filter students")
def list_students(
    q: Optional[str] = Query(
        default=None, description="Free-text search on name, email or student ID"
    ),
    course: Optional[str] = Query(default=None, description="Exact course name"),
    born_after: Optional[date] = Query(
        default=None, description="Only students born after this date (YYYY-MM-DD)"
    ),
    born_before: Optional[date] = Query(
        default=None, description="Only students born before this date (YYYY-MM-DD)"
    ),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    total, items = crud.list_students(
        db,
        q=q,
        course=course,
        born_after=born_after,
        born_before=born_before,
        skip=skip,
        limit=limit,
    )
    return schemas.StudentList(total=total, items=items)


@router.get(
    "/{student_id}", response_model=schemas.StudentOut, summary="View a student"
)
def get_student(student_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, student_id)


@router.put(
    "/{student_id}",
    response_model=schemas.StudentOut,
    summary="Replace a student (full update)",
)
def replace_student(
    student_id: int, payload: schemas.StudentCreate, db: Session = Depends(get_db)
):
    student = _get_or_404(db, student_id)
    changes = payload.model_dump(exclude={"student_id"})
    changes = {
        **changes,
        "student_id": payload.student_id or student.student_id,
    }
    try:
        return crud.update_student(db, student, changes)
    except crud.DuplicateError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(exc)
        ) from exc


@router.patch(
    "/{student_id}",
    response_model=schemas.StudentOut,
    summary="Update a student (partial)",
)
def patch_student(
    student_id: int, payload: schemas.StudentUpdate, db: Session = Depends(get_db)
):
    student = _get_or_404(db, student_id)
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="empty update payload — provide at least one field",
        )
    try:
        return crud.update_student(db, student, changes)
    except crud.DuplicateError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(exc)
        ) from exc


@router.delete(
    "/{student_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a student",
)
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = _get_or_404(db, student_id)
    crud.delete_student(db, student)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
