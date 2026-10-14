"""SQLAlchemy ORM model for the `students` table."""
from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    # Public, human-friendly identifier, e.g. "STU-0007" (auto-generated if omitted).
    student_id: Mapped[str] = mapped_column(
        String(20), unique=True, index=True, nullable=False
    )
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    dob: Mapped[date] = mapped_column(Date, nullable=False)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, index=True, nullable=False
    )
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    course: Mapped[Optional[str]] = mapped_column(String(80), index=True, nullable=True)
    address: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    enrollment_date: Mapped[date] = mapped_column(
        Date, nullable=False, default=date.today
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now(), onupdate=func.now()
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging helper
        return f"<Student {self.student_id} {self.name!r}>"
