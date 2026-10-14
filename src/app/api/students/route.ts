import { and, asc, count, gt, ilike, lt, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { students } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { normalizeBody, studentCreateSchema } from "@/lib/validation";


function isUniqueViolation(err: unknown): boolean {
  const anyErr = err as { code?: string; cause?: { code?: string } } | null;
  return anyErr?.code === "23505" || anyErr?.cause?.code === "23505";
}

async function generateStudentId(): Promise<string> {
  const rows = await db.select({ sid: students.studentId }).from(students);
  let highest = 0;
  for (const { sid } of rows) {
    const match = /^STU-(\d+)$/i.exec(sid);
    if (match) highest = Math.max(highest, parseInt(match[1], 10));
  }
  return `STU-${String(highest + 1).padStart(4, "0")}`;
}

// GET /api/students?q=&course=&born_after=&born_before=&skip=&limit=
export async function GET(req: NextRequest) {
  await ensureSeeded();

  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim() || undefined;
  const course = sp.get("course")?.trim() || undefined;
  const bornAfter = sp.get("born_after")?.trim() || undefined;
  const bornBefore = sp.get("born_before")?.trim() || undefined;
  const skip = Math.max(0, parseInt(sp.get("skip") ?? "0", 10) || 0);
  const limit = Math.min(
    200,
    Math.max(1, parseInt(sp.get("limit") ?? "50", 10) || 50)
  );

  const conditions = [];
  if (q) {
    const like = `%${q}%`;
    conditions.push(
      or(
        ilike(students.name, like),
        ilike(students.email, like),
        ilike(students.studentId, like)
      )
    );
  }
  if (course) conditions.push(ilike(students.course, course));
  if (bornAfter) conditions.push(gt(students.dob, bornAfter));
  if (bornBefore) conditions.push(lt(students.dob, bornBefore));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, totalRows] = await Promise.all([
    db
      .select()
      .from(students)
      .where(where)
      .orderBy(asc(students.id))
      .offset(skip)
      .limit(limit),
    db.select({ value: count() }).from(students).where(where),
  ]);

  return NextResponse.json({ total: totalRows[0]?.value ?? 0, items });
}

// POST /api/students
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ detail: "invalid JSON body" }, { status: 400 });
  }

  const parsed = studentCreateSchema.safeParse(normalizeBody(body));
  if (!parsed.success) {
    return NextResponse.json(
      {
        detail: parsed.error.issues.map((issue) => ({
          field: issue.path.join(".") || "body",
          message: issue.message,
        })),
      },
      { status: 422 }
    );
  }

  const data = parsed.data;

  try {
    const [created] = await db
      .insert(students)
      .values({
        studentId: data.studentId || (await generateStudentId()),
        name: data.name,
        dob: data.dob,
        email: data.email.toLowerCase().trim(),
        phone: data.phone ?? null,
        course: data.course ?? null,
        address: data.address ?? null,
        enrollmentDate: data.enrollmentDate,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return NextResponse.json(
        { detail: "student_id or email already exists" },
        { status: 409 }
      );
    }
    throw err;
  }
}
