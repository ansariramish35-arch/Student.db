import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { students } from "@/db/schema";
import {
  normalizeBody,
  studentCreateSchema,
  studentPatchSchema,
} from "@/lib/validation";


type Ctx = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function isUniqueViolation(err: unknown): boolean {
  const anyErr = err as { code?: string; cause?: { code?: string } } | null;
  return anyErr?.code === "23505" || anyErr?.cause?.code === "23505";
}

function notFound(id: number) {
  return NextResponse.json(
    { detail: `student with id ${id} not found` },
    { status: 404 }
  );
}


// GET /api/students/{id} — view a student
export async function GET(_req: NextRequest, ctx: Ctx) {
  const id = parseId((await ctx.params).id);
  if (!id) return NextResponse.json({ detail: "invalid id" }, { status: 400 });

  const [row] = await db
    .select()
    .from(students)
    .where(eq(students.id, id))
    .limit(1);
  if (!row) return notFound(id);
  return NextResponse.json(row);
}

// PUT /api/students/{id} — full replace (every field required)
export async function PUT(req: NextRequest, ctx: Ctx) {
  const id = parseId((await ctx.params).id);
  if (!id) return NextResponse.json({ detail: "invalid id" }, { status: 400 });

  const parsed = studentCreateSchema.safeParse(
    normalizeBody(await req.json().catch(() => null))
  );
  if (!parsed.success) {
    return NextResponse.json(
      {
        detail: parsed.error.issues.map((i) => ({
          field: i.path.join(".") || "body",
          message: i.message,
        })),
      },
      { status: 422 }
    );
  }
  const data = parsed.data;

  try {
    const [updated] = await db
      .update(students)
      .set({
        name: data.name,
        dob: data.dob,
        email: data.email.toLowerCase().trim(),
        phone: data.phone ?? null,
        course: data.course ?? null,
        address: data.address ?? null,
        enrollmentDate: data.enrollmentDate,
        updatedAt: new Date(),
      })
      .where(eq(students.id, id))
      .returning();
    if (!updated) return notFound(id);
    return NextResponse.json(updated);
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

// PATCH /api/students/{id} — partial update
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const id = parseId((await ctx.params).id);
  if (!id) return NextResponse.json({ detail: "invalid id" }, { status: 400 });

  const parsed = studentPatchSchema.safeParse(
    normalizeBody(await req.json().catch(() => null))
  );
  if (!parsed.success) {
    return NextResponse.json(
      {
        detail: parsed.error.issues.map((i) => ({
          field: i.path.join(".") || "body",
          message: i.message,
        })),
      },
      { status: 422 }
    );
  }

  const changes: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    if (value !== undefined) {
      changes[key] =
        key === "email" && typeof value === "string"
          ? value.toLowerCase().trim()
          : value;
    }
  }

  if (Object.keys(changes).length === 0) {
    return NextResponse.json(
      { detail: "empty update payload — provide at least one field" },
      { status: 400 }
    );
  }

  try {
    const [updated] = await db
      .update(students)
      .set({ ...changes, updatedAt: new Date() })
      .where(eq(students.id, id))
      .returning();
    if (!updated) return notFound(id);
    return NextResponse.json(updated);
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

// DELETE /api/students/{id}
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const id = parseId((await ctx.params).id);
  if (!id) return NextResponse.json({ detail: "invalid id" }, { status: 400 });

  const deleted = await db
    .delete(students)
    .where(eq(students.id, id))
    .returning({ id: students.id });
  if (deleted.length === 0) return notFound(id);
  return new Response(null, { status: 204 });
}
