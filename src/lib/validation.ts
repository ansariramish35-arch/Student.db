import { z } from "zod";

// Mirrors the Pydantic validation rules in backend/app/schemas.py.

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const PHONE_RE = /^\+?[0-9][0-9\s\-()]{6,19}$/;

export const todayStr = () => new Date().toISOString().slice(0, 10);

function isIsoDate(v: string): boolean {
  if (!DATE_RE.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime());
}

export const isoDate = z
  .string()
  .refine(isIsoDate, "use YYYY-MM-DD format");

export const dobSchema = isoDate.refine(
  (v) => !isIsoDate(v) || v <= todayStr(),
  "date of birth cannot be in the future"
);

export const studentCreateSchema = z.object({
  studentId: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9-]{3,20}$/, "letters, digits and '-' only, 3–20 chars")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  name: z.string().trim().min(2, "at least 2 characters").max(80),
  dob: dobSchema,
  email: z.string().trim().email("enter a valid email").max(120),
  phone: z
    .string()
    .trim()
    .regex(PHONE_RE, "digits, spaces or () / -, 7–20 chars")
    .max(20)
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  course: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  address: z
    .string()
    .trim()
    .max(200)
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  enrollmentDate: isoDate.default(todayStr()),
});

export const studentPatchSchema = z.object({
  name: studentCreateSchema.shape.name.optional(),
  dob: studentCreateSchema.shape.dob.optional(),
  email: studentCreateSchema.shape.email.optional(),
  phone: studentCreateSchema.shape.phone,
  course: studentCreateSchema.shape.course,
  address: studentCreateSchema.shape.address,
  enrollmentDate: studentCreateSchema.shape.enrollmentDate
    .unwrap()
    .optional(),
});

export type StudentCreateInput = z.infer<typeof studentCreateSchema>;
export type StudentPatchInput = z.infer<typeof studentPatchSchema>;

// Accept both camelCase (web UI) and snake_case (FastAPI-style) keys so the
// Next.js demo API stays drop-in compatible with the FastAPI contract.
export function normalizeBody(body: unknown): unknown {
  if (typeof body !== "object" || body === null) return body;
  const b = body as Record<string, unknown>;
  return {
    ...b,
    studentId: b.studentId ?? b.student_id,
    enrollmentDate: b.enrollmentDate ?? b.enrollment_date,
  };
}
