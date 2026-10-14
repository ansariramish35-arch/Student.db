import { Database } from "lucide-react";

const LINKS = [
  { href: "#console", label: "Console" },
  { href: "#assistant", label: "Assistant" },
  { href: "#api", label: "API Reference" },
];

export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.07] bg-[#060609]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="group flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-[#D2FF3A] text-[#060609] shadow-[0_0_24px_rgba(210,255,58,0.35)] transition-transform duration-300 group-hover:rotate-[-8deg]">
            <Database className="size-4.5" strokeWidth={2.4} />
          </span>
          <span className="font-display text-[15px] font-800 tracking-tight">
            students<span className="text-[#D2FF3A]">.db</span>
          </span>
          <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono2 text-[10px] uppercase tracking-[0.14em] text-white/50 md:block">
            by Ramish Ansari
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="https://www.linkedin.com/in/ramish-ansari/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[12px] font-medium text-white/70 transition-colors hover:border-[#D2FF3A]/40 hover:text-[#D2FF3A]"
        >
          <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          Ramish Ansari
        </a>
      </div>
    </header>
  );
}
