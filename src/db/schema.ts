import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// Mirrors the FastAPI + SQLite `students` table from backend/app/models.py.
// ISO date strings ("YYYY-MM-DD") keep parity with SQLite DATE storage and
// make lexicographic comparison (born_after / born_before) safe.
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  studentId: text("student_id").notNull().unique(),
  name: text("name").notNull(),
  dob: text("dob").notNull(), // YYYY-MM-DD
  email: text("email").notNull().unique(),
  phone: text("phone"),
  course: text("course"),
  address: text("address"),
  enrollmentDate: text("enrollment_date").notNull(), // YYYY-MM-DD
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type StudentRow = typeof students.$inferSelect;
