"use client";

import { animate, useInView } from "framer-motion";
import { CalendarClock, GraduationCap, Library, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { age, formatDate, type StudentListResponse } from "@/lib/students";

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, value, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current)
          ref.current.textContent = `${Math.round(v)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, value, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

interface Stats {
  total: number;
  courses: number;
  avgAge: number;
  latestEnrollment: string;
}

export default function StatsStrip() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/students?limit=200")
      .then((r) => r.json())
      .then((data: StudentListResponse) => {
        const items = data.items ?? [];
        const courses = new Set(items.map((s) => s.course).filter(Boolean));
        const avgAge = items.length
          ? Math.round(items.reduce((sum, s) => sum + age(s.dob), 0) / items.length)
          : 0;
        const latest = items.reduce(
          (max, s) => (s.enrollmentDate > max ? s.enrollmentDate : max),
          ""
        );
        setStats({
          total: data.total,
          courses: courses.size,
          avgAge,
          latestEnrollment: latest,
        });
      })
      .catch(() => setStats(null));
  }, []);

  const cells = [
    {
      icon: Users,
      label: "Students in database",
      value: stats ? <Counter value={stats.total} /> : "—",
      foot: "persisted rows",
    },
    {
      icon: Library,
      label: "Active courses",
      value: stats ? <Counter value={stats.courses} /> : "—",
      foot: "distinct programs",
    },
    {
      icon: GraduationCap,
      label: "Average age",
      value: stats ? <Counter value={stats.avgAge} /> : "—",
      foot: "across all records",
    },
    {
      icon: CalendarClock,
      label: "Latest enrollment",
      value: stats ? formatDate(stats.latestEnrollment) : "—",
      foot: "most recent record",
      small: true,
    },
  ];

  return (
    <section className="relative border-b border-white/[0.07]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/[0.07] lg:grid-cols-4">
        {cells.map((cell) => (
          <div key={cell.label} className="group px-6 py-9 sm:px-9">
            <div className="flex items-center gap-2 text-white/35">
              <cell.icon className="size-3.5" />
              <span className="font-mono2 text-[10px] uppercase tracking-[0.18em]">
                {cell.label}
              </span>
            </div>
            <div
              className={`mt-3 font-display font-800 tracking-tight text-white transition-colors group-hover:text-[#D2FF3A] ${
                cell.small
                  ? "text-[clamp(1.4rem,3vw,2.2rem)]"
                  : "text-[clamp(2.2rem,4.5vw,3.6rem)]"
              }`}
            >
              {cell.value}
            </div>
            <div className="mt-1 text-[12px] text-white/30">{cell.foot}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
