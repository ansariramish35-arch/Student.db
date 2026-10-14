"use client";

import { motion } from "framer-motion";
import { ArrowDown, BookOpenText, FolderGit2, Sparkles } from "lucide-react";

const ENDPOINTS = [
  "POST /students",
  "GET /students",
  "GET /students/{id}",
  "PATCH /students/{id}",
  "PUT /students/{id}",
  "DELETE /students/{id}",
  "POST /assistant/ask",
];

const ease = [0.16, 1, 0.3, 1] as const;

const rise = {
  hidden: { opacity: 0, y: 34 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.9, ease },
  }),
};

function TerminalCard() {
  const lines = [
    { text: '$ curl -X POST /students -d \'{"name":"Aarav Mehta",', cls: "text-white/85" },
    { text: '      "dob":"2004-03-12","email":"aarav@example.com"}\'', cls: "text-white/85" },
    { text: "← 201 Created", cls: "text-[#D2FF3A]" },
    { text: "{", cls: "text-white/40" },
    { text: '  "student_id": "STU-0025",', cls: "text-sky-300" },
    { text: '  "name": "Aarav Mehta",', cls: "text-white/70" },
    { text: '  "course": "Computer Science",', cls: "text-violet-300" },
    { text: '  "enrollment_date": "2026-02-14"', cls: "text-white/70" },
    { text: "}", cls: "text-white/40" },
  ];

  return (
    <motion.div
      variants={rise}
      initial="hidden"
      animate="show"
      custom={5}
      className="animate-floaty relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0b12]/90 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]"
    >
      <div className="flex items-center gap-2 border-b border-white/[0.07] px-5 py-3.5">
        <span className="size-2.5 rounded-full bg-[#FF5F57]" />
        <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="size-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-3 font-mono2 text-[11px] tracking-wider text-white/35">
          zsh — students-crud-api
        </span>
      </div>
      <div className="space-y-1.5 px-5 py-5 font-mono2 text-[12px] leading-relaxed">
        {lines.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 + i * 0.16, duration: 0.4 }}
            className={line.cls}
          >
            {line.text}
          </motion.p>
        ))}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.6 }}
          className="text-[#D2FF3A]"
        >
          $ <span className="animate-blink">▌</span>
        </motion.p>
      </div>

      <div className="absolute -left-4 -top-4 rounded-full border border-[#D2FF3A]/40 bg-[#060609] px-3.5 py-1.5 font-mono2 text-[10px] uppercase tracking-[0.16em] text-[#D2FF3A] shadow-[0_0_30px_rgba(210,255,58,0.15)]">
        CRUD · verified
      </div>
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="bg-grid absolute inset-0" />
      <div className="absolute -right-40 top-[-20%] size-[42rem] rounded-full bg-[radial-gradient(circle,rgba(210,255,58,0.14),transparent_65%)]" />
      <div className="absolute -left-48 bottom-[-30%] size-[40rem] rounded-full bg-[radial-gradient(circle,rgba(143,133,255,0.16),transparent_65%)]" />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-36 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:pt-44">
        <div>
          <motion.div variants={rise} initial="hidden" animate="show" custom={0}
            className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-2 pr-4 text-[12px] text-white/60">
            <span className="rounded-full bg-[#D2FF3A] px-2.5 py-0.5 font-mono2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#060609]">
              EWB
            </span>
            Built by Mohammad Ramish Ansari · B.Tech CSE, University of Lucknow
          </motion.div>

          <h1 className="font-display font-800 leading-[0.94] tracking-tight">
            <motion.span variants={rise} initial="hidden" animate="show" custom={1}
              className="block text-[clamp(3.4rem,9vw,7.5rem)]">
              Students
            </motion.span>
            <motion.span variants={rise} initial="hidden" animate="show" custom={2}
              className="block text-[clamp(3.4rem,9vw,7.5rem)]">
              <span className="text-outline">database</span>
            </motion.span>
            <motion.span variants={rise} initial="hidden" animate="show" custom={3}
              className="block text-[clamp(2.2rem,5.5vw,4.5rem)] text-white/80">
              CRUD, done <span className="italic text-[#8F85FF]">right.</span>
            </motion.span>
          </h1>

          <motion.p variants={rise} initial="hidden" animate="show" custom={4}
            className="mt-7 max-w-xl text-[15px] leading-relaxed text-white/55">
            A complete backend for managing student records — create, read,
            update and delete — built with{" "}
            <span className="text-white/85">FastAPI + SQLite</span>, validated
            with Pydantic, seeded with dummy data, and extended with an
            optional{" "}
            <span className="text-white/85">local Ollama AI assistant</span>{" "}
            that answers questions grounded in real rows.
          </motion.p>

          <motion.div variants={rise} initial="hidden" animate="show" custom={5}
            className="mt-9 flex flex-wrap items-center gap-3.5">
            <a href="#console"
              className="group inline-flex items-center gap-2.5 rounded-full bg-[#D2FF3A] px-6 py-3.5 text-[14px] font-bold text-[#060609] shadow-[0_10px_40px_-8px_rgba(210,255,58,0.5)] transition-all hover:shadow-[0_10px_50px_-4px_rgba(210,255,58,0.65)]">
              Open live console
              <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" />
            </a>
            <a href="#api"
              className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.03] px-6 py-3.5 text-[14px] font-semibold text-white/80 transition-colors hover:border-white/35 hover:text-white">
              <BookOpenText className="size-4" />
              API reference
            </a>
            <a
              href="https://www.linkedin.com/in/ramish-ansari/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono2 text-[11px] uppercase tracking-[0.14em] text-white/40 transition-colors hover:text-[#D2FF3A]"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              linkedin · ramish ansari
            </a>
          </motion.div>
        </div>

        <div className="relative hidden justify-center lg:flex">
          <TerminalCard />
        </div>
      </div>

      {/* Endpoint marquee */}
      <div className="relative border-y border-white/[0.07] bg-white/[0.015] py-3.5 marquee-mask overflow-hidden">
        <div className="animate-marquee flex w-max items-center gap-3 pr-3">
          {[...ENDPOINTS, ...ENDPOINTS].map((ep, i) => {
            const [method, path] = ep.split(" ");
            return (
              <span key={i}
                className="flex items-center gap-2.5 rounded-full border border-white/10 bg-[#0b0b12] px-4 py-2 font-mono2 text-[12px] whitespace-nowrap">
                <span className={
                  method === "POST" ? "font-bold text-[#D2FF3A]"
                  : method === "GET" ? "font-bold text-sky-300"
                  : method === "DELETE" ? "font-bold text-rose-400"
                  : "font-bold text-amber-300"
                }>
                  {method}
                </span>
                <span className="text-white/60">{path}</span>
                {ep.includes("assistant") && (
                  <Sparkles className="size-3 text-[#8F85FF]" />
                )}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
