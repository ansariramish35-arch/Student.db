// Shared client-side types + display helpers (no server imports here).

export interface Student {
  id: number;
  studentId: string;
  name: string;
  dob: string;
  email: string;
  phone: string | null;
  course: string | null;
  address: string | null;
  enrollmentDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentListResponse {
  total: number;
  items: Student[];
}

export interface AskResponseBody {
  answer: string;
  intent: string;
  groundedCount: number;
  records: Student[];
  source: "ollama" | "local-rule-engine";
}

export const COURSES = [
  "Computer Science",
  "Data Science",
  "Mechanical Engineering",
  "Business Administration",
  "Psychology",
  "Design",
  "Mathematics",
  "Biotechnology",
] as const;

export function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function age(dob: string): number {
  const birth = new Date(`${dob}T00:00:00Z`);
  const now = new Date();
  let a = now.getUTCFullYear() - birth.getUTCFullYear();
  const m = now.getUTCMonth() - birth.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < birth.getUTCDate())) a -= 1;
  return a;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

// Deterministic accent per course name — used for avatar + tag styling.
const COURSE_HUES: Record<string, string> = {
  "Computer Science": "196 100% 60%",
  "Data Science": "150 80% 55%",
  "Mechanical Engineering": "24 95% 58%",
  "Business Administration": "265 90% 70%",
  Psychology: "330 85% 65%",
  Design: "55 100% 62%",
  Mathematics: "215 90% 65%",
  Biotechnology: "100 70% 55%",
};

export function courseColor(course: string | null): string {
  if (!course) return "0 0% 65%";
  if (COURSE_HUES[course]) return COURSE_HUES[course];
  let hash = 0;
  for (const ch of course) hash = (hash * 31 + ch.charCodeAt(0)) % 360;
  return `${hash} 80% 60%`;
}

export function methodBadgeClass(method: string): string {
  switch (method.toUpperCase()) {
    case "POST":
      return "text-[#D2FF3A] border-[#D2FF3A]/35 bg-[#D2FF3A]/10";
    case "GET":
      return "text-sky-300 border-sky-300/35 bg-sky-300/10";
    case "PUT":
      return "text-violet-300 border-violet-300/35 bg-violet-300/10";
    case "PATCH":
      return "text-amber-300 border-amber-300/35 bg-amber-300/10";
    case "DELETE":
      return "text-rose-400 border-rose-400/35 bg-rose-400/10";
    default:
      return "text-white/70 border-white/20 bg-white/5";
  }
}

export function ensureArray<T>(v: T[] | undefined | null): T[] {
  return Array.isArray(v) ? v : [];
}
