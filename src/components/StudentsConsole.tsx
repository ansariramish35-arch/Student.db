"use client";

import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Pencil,
  Plus,
  RotateCw,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import StudentDrawer from "@/components/StudentDrawer";
import {
  age,
  courseColor,
  formatDate,
  initials,
  type Student,
  type StudentListResponse,
} from "@/lib/students";

const PAGE_SIZE = 8;

const BORN_FILTERS = [
  { label: "Any DOB", value: "" },
  { label: "Born after 2005", value: "2005-12-31" },
  { label: "Born before 2002", value: "2002-01-01:lt" },
];

export default function StudentsConsole() {
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  const [course, setCourse] = useState("");
  const [bornFilter, setBornFilter] = useState("");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<StudentListResponse | null>(null);
  const [courses, setCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [drawer, setDrawer] = useState<{
    open: boolean;
    mode: "create" | "edit";
    student: Student | null;
  }>({ open: false, mode: "create", student: null });
  const requestId = useRef(0);

  // debounce the search box
  useEffect(() => {
    const t = setTimeout(() => {
      setQDebounced(q.trim());
      setPage(0);
    }, 320);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(false);
    const params = new URLSearchParams();
    if (qDebounced) params.set("q", qDebounced);
    if (course) params.set("course", course);
    if (bornFilter.endsWith(":lt")) {
      params.set("born_before", bornFilter.replace(":lt", ""));
    } else if (bornFilter) {
      params.set("born_after", bornFilter);
    }
    params.set("limit", String(PAGE_SIZE));
    params.set("skip", String(page * PAGE_SIZE));

    try {
      const res = await fetch(`/api/students?${params.toString()}`);
      if (!res.ok) throw new Error();
      const body = (await res.json()) as StudentListResponse;
      if (id === requestId.current) setData(body);
    } catch {
      if (id === requestId.current) setError(true);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [qDebounced, course, bornFilter, page]);

  useEffect(() => {
    load();
  }, [load]);

  // unfiltered catalog for the course dropdowns
  const loadCatalog = useCallback(async () => {
    const res = await fetch("/api/students?limit=200");
    if (!res.ok) return;
    const body = (await res.json()) as StudentListResponse;
    setCourses(
      [...new Set(body.items.map((s) => s.course).filter(Boolean))].sort() as string[]
    );
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    if (confirmDelete == null) return;
    const t = setTimeout(() => setConfirmDelete(null), 4000);
    return () => clearTimeout(t);
  }, [confirmDelete]);

  async function handleDelete(id: number) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (res.status === 204) {
        toast.success("Student deleted", { description: "DELETE /students/{id} → 204" });
        setConfirmDelete(null);
        if (data && data.items.length === 1 && page > 0) setPage(page - 1);
        else load();
        loadCatalog();
      } else if (res.status === 404) {
        toast.error("Record already gone (404)");
        load();
      } else {
        toast.error(`Delete failed (${res.status})`);
      }
    } finally {
      setDeleting(false);
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;
  const queryPreview = new URLSearchParams({
    ...(qDebounced ? { q: qDebounced } : {}),
    ...(course ? { course } : {}),
    ...(bornFilter.endsWith(":lt")
      ? { born_before: bornFilter.replace(":lt", "") }
      : bornFilter
        ? { born_after: bornFilter }
        : {}),
    limit: String(PAGE_SIZE),
    skip: String(page * PAGE_SIZE),
  }).toString();

  return (
    <section id="console" className="relative scroll-mt-20">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono2 text-[11px] uppercase tracking-[0.22em] text-[#D2FF3A]">
              01 — Live console
            </p>
            <h2 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.4rem)] font-800 leading-none tracking-tight">
              Every operation, <span className="text-outline-ghost">live.</span>
            </h2>
            <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-white/50">
              This UI is wired straight to the CRUD route handlers — create,
              search, filter, paginate, edit and delete real persisted rows.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono2 text-[10px] uppercase tracking-[0.14em] text-white/35">
            {["POST", "GET", "PATCH", "PUT", "DELETE"].map((m) => (
              <span
                key={m}
                className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/30" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email or student ID…"
              className="field pl-11"
            />
          </div>
          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-white/30" />
            <select
              value={course}
              onChange={(e) => {
                setCourse(e.target.value);
                setPage(0);
              }}
              className="field w-[210px] appearance-none pl-10 pr-8"
            >
              <option value="">All courses</option>
              {courses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <select
            value={bornFilter}
            onChange={(e) => {
              setBornFilter(e.target.value);
              setPage(0);
            }}
            className="field w-[190px] appearance-none"
          >
            {BORN_FILTERS.map((f) => (
              <option key={f.label} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setDrawer({ open: true, mode: "create", student: null })}
            className="inline-flex items-center gap-2 rounded-xl bg-[#D2FF3A] px-5 py-2.5 text-[13px] font-bold text-[#060609] transition-shadow hover:shadow-[0_8px_30px_-6px_rgba(210,255,58,0.55)]"
          >
            <Plus className="size-4" strokeWidth={2.6} />
            Add student
          </button>
        </div>

        {/* request preview */}
        <div className="mb-6 flex items-center gap-3 overflow-x-auto rounded-xl border border-white/[0.07] bg-[#0b0b12] px-4 py-2.5 font-mono2 text-[11px] whitespace-nowrap">
          <span className="font-bold text-sky-300">GET</span>
          <span className="text-white/45">/api/students?{queryPreview}</span>
          <span className="ml-auto flex items-center gap-2 text-white/30">
            {loading ? (
              <RotateCw className="size-3 animate-spin" />
            ) : (
              <span className="size-1.5 rounded-full bg-[#D2FF3A]" />
            )}
            {data ? `${data.total} records` : "…"}
          </span>
        </div>

        {/* table */}
        <div
          className={`overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0b12]/70 transition-opacity ${
            loading && data ? "opacity-50" : ""
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-white/[0.07] text-white/35">
                  <th className="px-5 py-4 font-mono2 text-[10px] font-medium uppercase tracking-[0.16em]">
                    Student
                  </th>
                  <th className="px-5 py-4 font-mono2 text-[10px] font-medium uppercase tracking-[0.16em]">
                    Course
                  </th>
                  <th className="px-5 py-4 font-mono2 text-[10px] font-medium uppercase tracking-[0.16em]">
                    Born
                  </th>
                  <th className="hidden px-5 py-4 font-mono2 text-[10px] font-medium uppercase tracking-[0.16em] md:table-cell">
                    Email
                  </th>
                  <th className="hidden px-5 py-4 font-mono2 text-[10px] font-medium uppercase tracking-[0.16em] lg:table-cell">
                    Enrolled
                  </th>
                  <th className="px-5 py-4 text-right font-mono2 text-[10px] font-medium uppercase tracking-[0.16em]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {!data && loading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/[0.04]">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 w-24 animate-pulse rounded bg-white/[0.06]" />
                        </td>
                      ))}
                    </tr>
                  ))}

                {data?.items.map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.35 }}
                    className="group border-b border-white/[0.04] transition-colors hover:bg-white/[0.025]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="grid size-9 shrink-0 place-items-center rounded-full font-display text-[11px] font-800"
                          style={{
                            backgroundColor: `hsl(${courseColor(s.course)} / 0.14)`,
                            color: `hsl(${courseColor(s.course)})`,
                          }}
                        >
                          {initials(s.name)}
                        </span>
                        <div>
                          <div className="font-semibold text-white/90">
                            {s.name}
                          </div>
                          <div className="font-mono2 text-[11px] text-white/35">
                            {s.studentId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {s.course ? (
                        <span
                          className="inline-block rounded-full border px-2.5 py-1 text-[11px] font-medium"
                          style={{
                            borderColor: `hsl(${courseColor(s.course)} / 0.3)`,
                            backgroundColor: `hsl(${courseColor(s.course)} / 0.08)`,
                            color: `hsl(${courseColor(s.course)})`,
                          }}
                        >
                          {s.course}
                        </span>
                      ) : (
                        <span className="text-white/25">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-white/70">{formatDate(s.dob)}</div>
                      <div className="text-[11px] text-white/30">
                        age {age(s.dob)}
                      </div>
                    </td>
                    <td className="hidden px-5 py-4 text-white/55 md:table-cell">
                      {s.email}
                    </td>
                    <td className="hidden px-5 py-4 text-white/55 lg:table-cell">
                      {formatDate(s.enrollmentDate)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {confirmDelete === s.id ? (
                          <>
                            <button
                              disabled={deleting}
                              onClick={() => handleDelete(s.id)}
                              className="rounded-lg bg-rose-500/90 px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-rose-500"
                            >
                              {deleting ? "…" : "Confirm"}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="rounded-lg border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-white/60 hover:text-white"
                            >
                              Keep
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                setDrawer({ open: true, mode: "edit", student: s })
                              }
                              className="grid size-8 place-items-center rounded-lg border border-white/10 text-white/45 transition-all hover:border-[#D2FF3A]/50 hover:text-[#D2FF3A]"
                              aria-label={`Edit ${s.name}`}
                            >
                              <Pencil className="size-3.5" />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(s.id)}
                              className="grid size-8 place-items-center rounded-lg border border-white/10 text-white/45 transition-all hover:border-rose-400/50 hover:text-rose-400"
                              aria-label={`Delete ${s.name}`}
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.items.length === 0 && (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <CircleAlert className="size-6 text-white/25" />
              <p className="text-[14px] text-white/50">
                No students match these filters.
              </p>
              <button
                onClick={() => {
                  setQ("");
                  setQDebounced("");
                  setCourse("");
                  setBornFilter("");
                  setPage(0);
                }}
                className="text-[12px] font-semibold text-[#D2FF3A] hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center gap-3 px-6 py-14 text-[13px] text-rose-400">
              <CircleAlert className="size-4" /> Could not reach the API.
              <button onClick={load} className="underline">
                Retry
              </button>
            </div>
          )}

          {/* pagination */}
          <div className="flex items-center justify-between border-t border-white/[0.07] px-5 py-3.5">
            <span className="font-mono2 text-[11px] text-white/35">
              {data
                ? `showing ${data.items.length} of ${data.total} · page ${
                    page + 1
                  } / ${totalPages}`
                : "loading…"}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="grid size-8 place-items-center rounded-lg border border-white/10 text-white/50 transition-colors hover:border-white/30 hover:text-white disabled:opacity-30"
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="grid size-8 place-items-center rounded-lg border border-white/10 text-white/50 transition-colors hover:border-white/30 hover:text-white disabled:opacity-30"
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <StudentDrawer
        open={drawer.open}
        mode={drawer.mode}
        student={drawer.student}
        courses={courses}
        onClose={() => setDrawer((d) => ({ ...d, open: false }))}
        onSaved={() => {
          load();
          loadCatalog();
        }}
      />
    </section>
  );
}
