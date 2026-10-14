import { FolderTree, PlaySquare, ShieldCheck, Terminal } from "lucide-react";

import { methodBadgeClass } from "@/lib/students";

const ENDPOINTS = [
  { method: "POST", path: "/students", purpose: "Create a student", status: "201" },
  { method: "GET", path: "/students", purpose: "List / filter students", status: "200" },
  { method: "GET", path: "/students/{student_id}", purpose: "View a student", status: "200" },
  { method: "PUT", path: "/students/{student_id}", purpose: "Full update (all fields)", status: "200" },
  { method: "PATCH", path: "/students/{student_id}", purpose: "Partial update", status: "200" },
  { method: "DELETE", path: "/students/{student_id}", purpose: "Delete a student", status: "204" },
  { method: "POST", path: "/assistant/ask", purpose: "Bonus: natural-language Q&A", status: "200" },
];

const FILE_TREE = `backend/
├── app/
│   ├── main.py          # FastAPI app + CORS
│   ├── database.py      # SQLite engine/session
│   ├── models.py        # students table (ORM)
│   ├── schemas.py       # Pydantic validation
│   ├── crud.py          # DB access layer
│   └── routers/
│       ├── students.py  # CRUD endpoints
│       └── assistant.py # Ollama bonus endpoint
├── tests/test_students.py
├── seed.py              # 24 dummy students
├── requirements.txt
└── README.md            # full run instructions`;

const QUICKSTART = [
  "python -m venv .venv && source .venv/bin/activate",
  "pip install -r requirements.txt",
  "python seed.py",
  "uvicorn app.main:app --reload → http://127.0.0.1:8000/docs",
];

const CURL = `$ curl -X POST http://127.0.0.1:8000/students \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Aarav Mehta","dob":"2004-03-12",
       "email":"aarav@example.com",
       "course":"Computer Science"}'

← 201 Created
{"student_id":"STU-0025","name":"Aarav Mehta", …}`;

export default function ApiDocs() {
  return (
    <section id="api" className="relative scroll-mt-20">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="mb-12">
          <p className="font-mono2 text-[11px] uppercase tracking-[0.22em] text-[#D2FF3A]">
            03 — Submission assets
          </p>
          <h2 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.4rem)] font-800 leading-none tracking-tight">
            FastAPI + SQLite, <span className="text-outline-ghost">packaged.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-white/50">
            The complete, submission-ready Python project lives in the{" "}
            <span className="font-mono2 text-[12px] text-[#D2FF3A]">backend/</span>{" "}
            directory — same endpoints as the live demo above, backed by SQLite,
            with a README covering prerequisites, install steps, run commands
            and curl-based API testing.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* endpoints table */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0b12]/70">
            <div className="border-b border-white/[0.07] px-6 py-4">
              <h3 className="font-display text-[15px] font-700 tracking-tight">
                Endpoint reference
              </h3>
            </div>
            <ul className="divide-y divide-white/[0.05]">
              {ENDPOINTS.map((e) => (
                <li
                  key={`${e.method}${e.path}`}
                  className="group flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-white/[0.02]"
                >
                  <span
                    className={`w-[74px] shrink-0 rounded-lg border px-2 py-1 text-center font-mono2 text-[10px] font-bold tracking-wider ${methodBadgeClass(e.method)}`}
                  >
                    {e.method}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-mono2 text-[12.5px] text-white/75">
                    {e.path}
                  </span>
                  <span className="hidden text-[12px] text-white/40 sm:block">
                    {e.purpose}
                  </span>
                  <span className="ml-auto rounded-md bg-white/[0.05] px-2 py-0.5 font-mono2 text-[10px] text-white/40">
                    {e.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* right column cards */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/[0.08] bg-[#0b0b12]/70 p-6">
              <div className="mb-4 flex items-center gap-2.5 text-white/70">
                <FolderTree className="size-4 text-[#D2FF3A]" />
                <h3 className="font-display text-[15px] font-700 tracking-tight">
                  Project structure
                </h3>
              </div>
              <pre className="overflow-x-auto font-mono2 text-[11px] leading-relaxed text-white/50">
                {FILE_TREE}
              </pre>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#0b0b12]/70 p-6">
              <div className="mb-4 flex items-center gap-2.5 text-white/70">
                <PlaySquare className="size-4 text-[#D2FF3A]" />
                <h3 className="font-display text-[15px] font-700 tracking-tight">
                  Run it locally
                </h3>
              </div>
              <ol className="space-y-3">
                {QUICKSTART.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full border border-[#D2FF3A]/35 bg-[#D2FF3A]/10 font-mono2 text-[10px] font-bold text-[#D2FF3A]">
                      {i + 1}
                    </span>
                    <code className="pt-0.5 font-mono2 text-[11.5px] leading-relaxed text-white/60">
                      {step}
                    </code>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* curl + security strip */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0b12]/70">
            <div className="flex items-center gap-2.5 border-b border-white/[0.07] px-6 py-4 text-white/70">
              <Terminal className="size-4 text-[#D2FF3A]" />
              <h3 className="font-display text-[15px] font-700 tracking-tight">
                Test with curl
              </h3>
            </div>
            <pre className="overflow-x-auto px-6 py-5 font-mono2 text-[11.5px] leading-relaxed text-white/55">
              {CURL}
            </pre>
          </div>

          <div className="flex flex-col justify-between gap-6 rounded-2xl border border-[#8F85FF]/25 bg-[#8F85FF]/[0.06] p-6">
            <div className="flex items-start gap-3.5">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#8F85FF]" />
              <div>
                <h3 className="font-display text-[15px] font-700 tracking-tight text-white/90">
                  Security, as briefed
                </h3>
                <ul className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-white/55">
                  <li>· The model never executes SQL — backend code fetches records and injects them as JSON context.</li>
                  <li>· Dummy data only; <span className="font-mono2 text-[11px]">.gitignore</span> excludes <span className="font-mono2 text-[11px]">students.db</span>, env files and venvs.</li>
                  <li>· No secrets in source — all config via environment variables.</li>
                  <li>· Validation: 422 on bad input, 404 on missing records, 409 on duplicates.</li>
                </ul>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#060609]/60 px-4 py-3 font-mono2 text-[10.5px] uppercase tracking-[0.14em] text-white/40">
              pytest · 8 tests passing — CRUD, validation, 404s, assistant
            </div>
            <div className="rounded-xl border border-white/10 bg-[#060609]/60 px-4 py-3 text-[11px] text-white/45">
              <span className="font-mono2 text-[10px] uppercase tracking-[0.14em] text-white/30">
                Developer
              </span>
              <span className="ml-3 font-semibold text-white/70">
                Mohammad Ramish Ansari
              </span>
              <span className="ml-2 text-white/30">
                · B.Tech CSE, University of Lucknow
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
