"""Load deterministic DUMMY students so the API has data to play with.

    python seed.py

Safe to re-run: it does nothing when rows already exist.
No real personal data is used — all names/emails are fictional.
"""
from datetime import date
from random import Random

from app.database import Base, SessionLocal, engine
from app.models import Student

FIRST_NAMES = [
    "Aarav", "Diya", "Kabir", "Meera", "Rohan", "Ananya", "Vivaan", "Isha",
    "Arjun", "Sana", "Aditya", "Navya", "Karthik", "Zara", "Dev", "Priya",
    "Rahul", "Tara", "Nikhil", "Aisha", "Varun", "Kavya", "Imran", "Riya",
]
LAST_NAMES = [
    "Mehta", "Sharma", "Iyer", "Khan", "Patel", "Nair", "Singh", "Das",
    "Kulkarni", "Reddy", "Verma", "Gupta",
]
COURSES = [
    "Computer Science", "Data Science", "Mechanical Engineering",
    "Business Administration", "Psychology", "Design", "Mathematics",
    "Biotechnology",
]
CITIES = ["Bengaluru", "Pune", "Mumbai", "Hyderabad", "Chennai", "Delhi"]

rng = Random(42)


def build_dummy_students(count: int = 24) -> list[Student]:
    students: list[Student] = []
    used_pairs: set[tuple[str, str]] = set()
    i = 1
    while len(students) < count:
        first = rng.choice(FIRST_NAMES)
        last = rng.choice(LAST_NAMES)
        if (first, last) in used_pairs:
            continue
        used_pairs.add((first, last))
        students.append(
            Student(
                student_id=f"STU-{i:04d}",
                name=f"{first} {last}",
                dob=date(rng.randint(1998, 2008), rng.randint(1, 12), rng.randint(1, 28)),
                email=f"{first.lower()}.{last.lower()}{i}@example.com",
                phone=f"+91-98{rng.randint(10000000, 99999999)}",
                course=rng.choice(COURSES),
                address=f"{rng.randint(1, 200)} MG Road, {rng.choice(CITIES)}",
                enrollment_date=date(
                    rng.randint(2021, 2026),
                    rng.randint(1, 12),
                    rng.randint(1, 28),
                ),
            )
        )
        i += 1
    return students


def main() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(Student).count()
        if existing > 0:
            print(f"Database already contains {existing} students — nothing to do.")
            return
        rows = build_dummy_students()
        db.add_all(rows)
        db.commit()
        print(f"Seeded {len(rows)} dummy students into students.db")
    finally:
        db.close()


if __name__ == "__main__":
    main()
