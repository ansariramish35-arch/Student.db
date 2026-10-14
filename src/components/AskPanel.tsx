"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Database, SendHorizontal, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  courseColor,
  ensureArray,
  type AskResponseBody,
  type Student,
} from "@/lib/students";

interface Message {
  role: "user" | "assistant";
  text: string;
  intent?: string;
  source?: string;
  records?: Student[];
}

const SUGGESTIONS = [
  "How many students are there?",
  "List students born after 2005",
  "How many students in Data Science?",
  "Who enrolled most recently?",
  "Find Aarav",
];

const CAPABILITIES = [
  "Counts — “how many students…”",
  "Filters — “born after 2005”, “in Design”",
  "Superlatives — oldest, youngest, latest enrollment",
  "Lookups — find any student by name",
];

export default function AskPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Ask me anything about the student records. I answer only from rows fetched out of the database — never invented data.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      if (!res.ok) throw new Error();
      const body = (await res.json()) as AskResponseBody;
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: body.answer,
          intent: body.intent,
          source: body.source,
          records: ensureArray(body.records),
        },
      ]);
    } catch {
      toast.error("Assistant request failed");
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: "Something went wrong reaching the database. Try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="assistant" className="relative scroll-mt-20 border-y border-white/[0.07] bg-[#0a0a12]">
      <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_80%_20%,rgba(143,133,255,0.08),transparent_70%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="font-mono2 text-[11px] uppercase tracking-[0.22em] text-[#8F85FF]">
            02 — Bonus · local AI assistant
          </p>
          <h2 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.4rem)] font-800 leading-[1.02] tracking-tight">
            Ask the database
            <span className="text-outline-ghost"> anything.</span>
          </h2>
          <p className="mt-5 max-w-md text-[14px] leading-relaxed text-white/50">
            Built exactly as the brief specifies: backend code decides which
            queries are safe, fetches the rows, and hands them to the model as
            context — optionally via a local Ollama server running{" "}
            <span className="font-mono2 text-[12px] text-white/70">
              llama3.2:1b
            </span>
            . Offline? A deterministic engine answers from the same records.
          </p>

          <ul className="mt-7 space-y-2.5">
            {CAPABILITIES.map((c) => (
              <li key={c} className="flex items-center gap-3 text-[13px] text-white/60">
                <Sparkles className="size-3.5 shrink-0 text-[#8F85FF]" />
                {c}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-start gap-3.5 rounded-2xl border border-[#D2FF3A]/20 bg-[#D2FF3A]/[0.045] p-5">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#D2FF3A]" />
            <p className="text-[13px] leading-relaxed text-white/60">
              <span className="font-semibold text-white/90">
                Grounded, never raw SQL.
              </span>{" "}
              Every answer ships with the exact{" "}
              <span className="font-mono2 text-[12px]">grounded_records</span>{" "}
              used to produce it, so responses are verifiable against the
              database.
            </p>
          </div>
        </div>

        {/* chat card */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b13] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="grid size-7 place-items-center rounded-lg bg-[#8F85FF]/15 text-[#8F85FF]">
                <Database className="size-3.5" />
              </span>
              <span className="font-mono2 text-[11px] tracking-wider text-white/45">
                POST /assistant/ask
              </span>
            </div>
            <span className="flex items-center gap-2 font-mono2 text-[10px] uppercase tracking-[0.14em] text-white/35">
              <span className="size-1.5 rounded-full bg-[#D2FF3A] animate-pulse-dot" />
              grounded engine
            </span>
          </div>

          <div ref={scrollRef} className="h-[380px] space-y-4 overflow-y-auto px-5 py-5">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                      m.role === "user"
                        ? "rounded-br-sm bg-[#D2FF3A] font-medium text-[#060609]"
                        : "rounded-bl-sm border border-white/[0.08] bg-white/[0.04] text-white/80"
                    }`}
                  >
                    <p>{m.text}</p>

                    {m.records && m.records.length > 0 && (
                      <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
                        <p className="font-mono2 text-[9px] uppercase tracking-[0.16em] text-white/35">
                          grounded records · {m.records.length}
                        </p>
                        {m.records.slice(0, 6).map((r) => (
                          <div
                            key={r.id}
                            className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-[11px]"
                          >
                            <span className="font-mono2 text-white/40">
                              {r.studentId}
                            </span>
                            <span className="font-semibold text-white/80">
                              {r.name}
                            </span>
                            <span
                              className="ml-auto"
                              style={{ color: `hsl(${courseColor(r.course)})` }}
                            >
                              {r.course ?? "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {m.intent && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-0.5 font-mono2 text-[9px] uppercase tracking-[0.12em] text-white/40">
                          intent: {m.intent}
                        </span>
                        <span className="rounded-md border border-[#8F85FF]/25 bg-[#8F85FF]/10 px-2 py-0.5 font-mono2 text-[9px] uppercase tracking-[0.12em] text-[#8F85FF]">
                          {m.source === "ollama" ? "ollama" : "rule engine"}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-white/[0.08] bg-white/[0.04] px-4 py-3.5">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="size-1.5 animate-bounce rounded-full bg-white/50"
                      style={{ animationDelay: `${d * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/[0.07] px-5 py-4">
            {messages.length <= 2 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => ask(s)}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] text-white/55 transition-colors hover:border-[#D2FF3A]/40 hover:text-[#D2FF3A]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(input);
              }}
              className="flex items-center gap-2.5"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. List students born after 2005"
                className="field flex-1"
              />
              <button
                type="submit"
                disabled={loading || input.trim().length < 3}
                className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#D2FF3A] text-[#060609] transition-all hover:shadow-[0_8px_30px_-6px_rgba(210,255,58,0.55)] disabled:opacity-40"
                aria-label="Ask"
              >
                <SendHorizontal className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
