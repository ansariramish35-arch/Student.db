"""Pydantic request/response schemas with input-validation rules."""
import re
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

PHONE_RE = re.compile(r"^\+?[0-9][0-9\s\-()]{6,19}$")
STUDENT_ID_RE = re.compile(r"^[A-Za-z0-9-]{3,20}$")


def _validate_dob(v: date) -> date:
    if v > date.today():
        raise ValueError("date of birth cannot be in the future")
    if v < date(1900, 1, 1):
        raise ValueError("date of birth looks unrealistic")
    return v


def _validate_enrollment(v: date) -> date:
    if v > date.today():
        raise ValueError("enrollment date cannot be in the future")
    return v


def _validate_phone(v: Optional[str]) -> Optional[str]:
    if v is not None and v != "" and not PHONE_RE.match(v):
        raise ValueError("phone must be digits, spaces or () / - and 7-20 chars")
    return v or None


class StudentBase(BaseModel):
    """Fields shared by create / full-update payloads and API responses."""

    name: str = Field(min_length=2, max_length=80, examples=["Aarav Mehta"])
    dob: date = Field(examples=["2004-03-12"])
    email: EmailStr = Field(examples=["aarav.mehta@example.com"])
    phone: Optional[str] = Field(default=None, max_length=20)
    course: Optional[str] = Field(default=None, max_length=80)
    address: Optional[str] = Field(default=None, max_length=200)
    enrollment_date: date = Field(default_factory=date.today)

    _dob_ok = field_validator("dob")(_validate_dob)
    _enrollment_ok = field_validator("enrollment_date")(_validate_enrollment)
    _phone_ok = field_validator("phone")(_validate_phone)


class StudentCreate(StudentBase):
    """Payload for POST /students and PUT /students/{id}."""

    # Optional — the backend auto-generates "STU-XXXX" when omitted.
    student_id: Optional[str] = Field(default=None)

    @field_validator("student_id")
    @classmethod
    def student_id_format(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not STUDENT_ID_RE.match(v):
            raise ValueError("student_id may only contain letters, digits and '-'")
        return v


class StudentUpdate(BaseModel):
    """Payload for PATCH /students/{id} — every field is optional."""

    name: Optional[str] = Field(default=None, min_length=2, max_length=80)
    dob: Optional[date] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, max_length=20)
    course: Optional[str] = Field(default=None, max_length=80)
    address: Optional[str] = Field(default=None, max_length=200)
    enrollment_date: Optional[date] = None

    _dob_ok = field_validator("dob")(_validate_dob)
    _enrollment_ok = field_validator("enrollment_date")(_validate_enrollment)
    _phone_ok = field_validator("phone")(_validate_phone)


class StudentOut(StudentBase):
    """What the API returns for a single student."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    student_id: str
    created_at: datetime
    updated_at: datetime


class StudentList(BaseModel):
    """Envelope for GET /students."""

    total: int
    items: list[StudentOut]
