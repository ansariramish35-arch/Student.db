import { Database, ExternalLink, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.07]">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        {/* creator banner */}
        <div className="mb-12 rounded-2xl border border-[#D2FF3A]/20 bg-[#D2FF3A]/[0.035] p-8 sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono2 text-[10px] uppercase tracking-[0.22em] text-[#D2FF3A]">
                Developed by
              </p>
              <h3 className="mt-2 font-display text-[clamp(1.6rem,3vw,2.4rem)] font-800 tracking-tight">
                Mohammad Ramish Ansari
              </h3>
              <p className="mt-1 text-[14px] text-white/55">
                B.Tech. Computer Science &amp; Engineering · University of Lucknow
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-white/45">
                <a
                  href="mailto:ansariramish35@gmail.com"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-[#D2FF3A]"
                >
                  <Mail className="size-3" />
                  ansariramish35@gmail.com
                </a>
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="size-3" />
                  +91-7007043871
                </span>
                <a
                  href="https://www.linkedin.com/in/ramish-ansari/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-[#D2FF3A]"
                >
                  <svg className="size-3" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                  <ExternalLink className="size-2.5" />
                </a>
              </div>
            </div>
            <div className="shrink-0">
              <div className="grid size-20 place-items-center rounded-2xl border border-[#D2FF3A]/30 bg-[#D2FF3A]/10 font-display text-2xl font-800 text-[#D2FF3A] shadow-[0_0_40px_rgba(210,255,58,0.12)]">
                RA
              </div>
            </div>
          </div>
        </div>

        {/* bottom bar */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-8 place-items-center rounded-lg bg-[#D2FF3A] text-[#060609]">
                <Database className="size-4" strokeWidth={2.4} />
              </span>
              <span className="font-display text-lg font-800 tracking-tight">
                students<span className="text-[#D2FF3A]">.db</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-white/40">
              Python Backend Development internship project — FastAPI + SQLite
              CRUD with an optional Ollama AI extension. All data is fictional
              dummy data.
            </p>
          </div>
          <div className="text-right font-mono2 text-[11px] uppercase tracking-[0.16em] text-white/30">
            <p>EWB Edu Tech Pvt. Ltd. — Internship Program</p>
            <p className="mt-1.5 text-white/50">
              EWB Courses ·{" "}
              <span className="text-[#D2FF3A]">Learn. Elevate. Empower.</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
