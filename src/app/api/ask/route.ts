import { asc, count, desc, gt, ilike, isNotNull, lt, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { students, type StudentRow } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";

export const dynamic = "force-dynamic";

// Mirrors backend/app/routers/assistant.py — the model never writes SQL.
// Safe parameterized ORM queries fetch grounded records; a local Ollama
// server (when OLLAMA_HOST is set) may phrase the final answer.

const STOPWORDS = new Set([
  "the", "a", "an", "of", "in", "on", "is", "are", "who", "what", "which",
  "list", "show", "me", "all", "any", "many", "how", "there", "student",
  "students", "born", "after", "before", "since", "get", "find", "tell",
  "their", "them", "with", "for", "from", "course", "enrolled", "most",
  "recently", "does", "do", "give",
]);

type Intent =
  | "born_after"
  | "born_before"
  | "youngest"
  | "oldest"
  | "recent_enrollments"
  | "count_by_course"
  | "count_all"
  | "list_by_course"
  | "search";

async function distinctCourses(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ course: students.course })
    .from(students)
    .where(isNotNull(students.course));
  return rows.map((r) => r.course).filter((c): c is string => Boolean(c));
}

function detectIntent(
  question: string,
  courses: string[]
): { intent: Intent; params: Record<string, string | number> } {
  const q = question.toLowerCase();
  const yearMatch = /\b(19\d{2}|20\d{2})\b/.exec(q);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : null;
  const matchedCourse = courses.find((c) => q.includes(c.toLowerCase()));

  if (q.includes("born") && year && (q.includes("after") || q.includes("since")))
    return { intent: "born_after", params: { year } };
  if (q.includes("born") && year && (q.includes("before") || q.includes("earlier")))
    return { intent: "born_before", params: { year } };
  if (q.includes("youngest")) return { intent: "youngest", params: {} };
  if (q.includes("oldest")) return { intent: "oldest", params: {} };
  if (q.includes("recent") || q.includes("latest") || q.includes("newest"))
    return { intent: "recent_enrollments", params: {} };
  if (q.includes("how many"))
    return matchedCourse
      ? { intent: "count_by_course", params: { course: matchedCourse } }
      : { intent: "count_all", params: {} };
  if (matchedCourse)
    return { intent: "list_by_course", params: { course: matchedCourse } };
  return { intent: "search", params: {} };
}

async function fetchGrounded(
  intent: Intent,
  params: Record<string, string | number>,
  question: string
): Promise<{ records: StudentRow[]; matched: number }> {
  switch (intent) {
    case "born_after": {
      const year = params.year as number;
      const rows = await db
        .select()
        .from(students)
        .where(gt(students.dob, `${year}-12-31`))
        .orderBy(asc(students.dob))
        .limit(10);
      return { records: rows, matched: rows.length };
    }
    case "born_before": {
      const year = params.year as number;
      const rows = await db
        .select()
        .from(students)
        .where(lt(students.dob, `${year}-01-01`))
        .orderBy(asc(students.dob))
        .limit(10);
      return { records: rows, matched: rows.length };
    }
    case "list_by_course":
    case "count_by_course": {
      const rows = await db
        .select()
        .from(students)
        .where(ilike(students.course, params.course as string))
        .orderBy(asc(students.name))
        .limit(10);
      return { records: rows, matched: rows.length };
    }
    case "youngest": {
      const rows = await db
        .select()
        .from(students)
        .orderBy(desc(students.dob))
        .limit(1);
      return { records: rows, matched: rows.length };
    }
    case "oldest": {
      const rows = await db
        .select()
        .from(students)
        .orderBy(asc(students.dob))
        .limit(1);
      return { records: rows, matched: rows.length };
    }
    case "recent_enrollments": {
      const rows = await db
        .select()
        .from(students)
        .orderBy(desc(students.enrollmentDate))
        .limit(5);
      return { records: rows, matched: rows.length };
    }
    case "count_all": {
      const rows = await db
        .select()
        .from(students)
        .orderBy(asc(students.id))
        .limit(10);
      const [total] = await db.select({ value: count() }).from(students);
      return { records: rows, matched: total?.value ?? 0 };
    }
    case "search": {
      const tokens = question
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((t) => t.length >= 3 && !STOPWORDS.has(t))
        .slice(0, 4);
      if (tokens.length === 0) return { records: [], matched: 0 };
      const conditions = tokens.map((t) =>
        or(
          ilike(students.name, `%${t}%`),
          ilike(students.email, `%${t}%`),
          ilike(students.studentId, `%${t}%`)
        )
      );
      const where = conditions.length === 1 ? conditions[0] : or(...conditions);
      const rows = await db
        .select()
        .from(students)
        .where(where)
        .orderBy(asc(students.name))
        .limit(10);
      return { records: rows, matched: rows.length };
    }
  }
}

function templateAnswer(
  intent: Intent,
  params: Record<string, string | number>,
  records: StudentRow[],
  matched: number,
  total: number
): string {
  const names = records
    .slice(0, 6)
    .map((r) => r.name)
    .join(", ");
  const plural = matched === 1 ? "" : "s";

  switch (intent) {
    case "count_all":
      return `There ${total === 1 ? "is" : "are"} ${total} student${
        total === 1 ? "" : "s"
      } in the database.`;
    case "count_by_course":
      return `${matched} student${plural} are enrolled in ${params.course}: ${names}`;
    case "list_by_course":
      return matched === 0
        ? `No students found in ${params.course}.`
        : `Students in ${params.course} (${matched}): ${names}`;
    case "born_after":
      return `${matched} student${plural} were born after ${params.year}: ${names}`;
    case "born_before":
      return `${matched} student${plural} were born before ${params.year}: ${names}`;
    case "youngest":
      return records[0]
        ? `The youngest student is ${records[0].name}, born ${records[0].dob}.`
        : "No students in the database yet.";
    case "oldest":
      return records[0]
        ? `The oldest student is ${records[0].name}, born ${records[0].dob}.`
        : "No students in the database yet.";
    case "recent_enrollments":
      return records.length
        ? `Most recent enrollments: ${records
            .map((r) => `${r.name} (${r.enrollmentDate})`)
            .join(", ")}.`
        : "No enrollments recorded yet.";
    case "search":
      return matched === 0
        ? "I could not match that question to any records. Try: 'How many students are there?', 'List students born after 2005', 'Students in Data Science', or a student's name."
        : `I found ${matched} matching record${plural}: ${names}`;
  }
}

async function askOllama(
  question: string,
  context: unknown
): Promise<string | null> {
  const host = process.env.OLLAMA_HOST;
  if (!host) return null;
  const model = process.env.OLLAMA_MODEL ?? "llama3.2:1b";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${host.replace(/\/$/, "")}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        stream: false,
        prompt:
          "You are a precise data assistant. Answer the user's question ONLY " +
          "using the JSON data below. Never invent rows, numbers or dates. " +
          "If the data does not contain the answer, say so. Keep it short.\n\n" +
          `DATA (JSON):\n${JSON.stringify(context).slice(0, 6000)}\n\n` +
          `QUESTION: ${question}\nANSWER:`,
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { response?: string };
    return data.response?.trim() || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    question?: unknown;
  } | null;
  const question =
    typeof body?.question === "string" ? body.question.trim() : "";
  if (question.length < 3 || question.length > 500) {
    return NextResponse.json(
      { detail: "question must be 3–500 characters" },
      { status: 422 }
    );
  }

  await ensureSeeded();

  const courses = await distinctCourses();
  const { intent, params } = detectIntent(question, courses);
  const { records, matched } = await fetchGrounded(intent, params, question);
  const [totalRow] = await db.select({ value: count() }).from(students);
  const total = totalRow?.value ?? 0;

  const context = {
    total_students_in_database: total,
    matched_count: matched,
    matched_records: records.slice(0, 10),
  };

  let answer = await askOllama(question, context);
  const source: "ollama" | "local-rule-engine" = answer
    ? "ollama"
    : "local-rule-engine";
  if (!answer) answer = templateAnswer(intent, params, records, matched, total);

  return NextResponse.json({
    answer,
    intent,
    groundedCount: records.length,
    records: records.slice(0, 10),
    source,
  });
}
