"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Save, UserPlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { initials, type Student } from "@/lib/students";
import { studentCreateSchema } from "@/lib/validation";

interface Props {
  open: boolean;
  mode: "create" | "edit";
  student: Student | null;
  courses: string[];
  onClose: () => void;
  onSaved: () => void;
}

type Fields = {
  name: string;
  email: string;
  phone: string;
  dob: string;
  course: string;
  address: string;
  enrollmentDate: string;
};

const EMPTY: Fields = {
  name: "",
  email: "",
  phone: "",
  dob: "",
  course: "",
  address: "",
  enrollmentDate: new Date().toISOString().slice(0, 10),
};

export default function StudentDrawer({
  open,
  mode,
  student,
  courses,
  onClose,
  onSaved,
}: Props) {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && student) {
      setFields({
        name: student.name,
        email: student.email,
        phone: student.phone ?? "",
        dob: student.dob,
        course: student.course ?? "",
        address: student.address ?? "",
        enrollmentDate: student.enrollmentDate,
      });
    } else {
      setFields(EMPTY);
    }
    setErrors({});
  }, [open, mode, student]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const set = (key: keyof Fields) => (value: string) => {
    setFields((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const payload = {
      name: fields.name,
      email: fields.email,
      phone: fields.phone || null,
      dob: fields.dob,
      course: fields.course || null,
      address: fields.address || null,
      enrollmentDate: fields.enrollmentDate,
    };

    const parsed = studentCreateSchema.safeParse(payload);
    if (!parsed.success) {
      const mapped: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".") || "body";
        if (!mapped[key]) mapped[key] = issue.message;
      }
      setErrors(mapped);
      toast.error("Fix the highlighted fields and try again");
      return;
    }

    setSubmitting(true);
    try {
      const isEdit = mode === "edit" && student;
      const res = await fetch(
        isEdit ? `/api/students/${student.id}` : "/api/students",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (res.status === 422) {
        const body = (await res.json()) as {
          detail?: { field: string; message: string }[];
        };
        const mapped: Record<string, string> = {};
        for (const d of body.detail ?? []) mapped[d.field] = d.message;
        setErrors(mapped);
        toast.error("Server rejected the payload (422)");
        return;
      }
      if (res.status === 409) {
        toast.error("A student with that email already exists (409)");
        setErrors({ email: "already in use by another record" });
        return;
      }
      if (!res.ok) {
        toast.error(`Unexpected error (${res.status})`);
        return;
      }

      const saved = (await res.json()) as Student;
      toast.success(
        isEdit
          ? `${saved.name} updated`
          : `${saved.name} created as ${saved.studentId}`,
        { description: isEdit ? "PATCH /students/{id}" : "POST /students" }
      );
      onSaved();
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  const input = (
    key: keyof Fields,
    label: string,
    opts: {
      type?: string;
      placeholder?: string;
      required?: boolean;
      span2?: boolean;
      list?: string;
    } = {}
  ) => (
    <label className={`block ${opts.span2 ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 flex items-baseline justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
        {label}
        {opts.required && <span className="text-[#D2FF3A]">required</span>}
      </span>
      <input
        type={opts.type ?? "text"}
        list={opts.list}
        value={fields[key]}
        placeholder={opts.placeholder}
        onChange={(e) => set(key)(e.target.value)}
        className={`field ${errors[key] ? "field-error" : ""}`}
      />
      {errors[key] && (
        <span className="mt-1.5 block text-[12px] text-rose-400">
          {errors[key]}
        </span>
      )}
    </label>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm"
          />
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-[90] flex h-full w-full max-w-lg flex-col border-l border-white/10 bg-[#0b0b13]"
          >
            <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5">
              <div className="flex items-center gap-3.5">
                <span className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] font-display text-[13px] font-800 text-[#D2FF3A]">
                  {mode === "edit" && student
                    ? initials(student.name)
                    : <UserPlus className="size-4.5" />}
                </span>
                <div>
                  <h3 className="font-display text-lg font-800 tracking-tight">
                    {mode === "edit" ? "Edit student" : "New student"}
                  </h3>
                  <p className="font-mono2 text-[11px] uppercase tracking-[0.14em] text-white/35">
                    {mode === "edit"
                      ? `PATCH /students/${student?.id}`
                      : "POST /students"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="grid size-9 place-items-center rounded-lg border border-white/10 text-white/50 transition-colors hover:border-white/30 hover:text-white"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-1 flex-col overflow-y-auto"
            >
              <div className="grid flex-1 content-start gap-5 px-6 py-7 sm:grid-cols-2">
                {input("name", "Full name", {
                  placeholder: "e.g. Aarav Mehta",
                  required: true,
                  span2: true,
                })}
                {input("email", "Email", {
                  type: "email",
                  placeholder: "name@example.com",
                  required: true,
                  span2: true,
                })}
                {input("dob", "Date of birth", { type: "date", required: true })}
                {input("enrollmentDate", "Enrollment date", { type: "date" })}
                {input("phone", "Phone", { placeholder: "+91-98XXXXXXXX" })}
                {input("course", "Course", {
                  placeholder: "Pick or type a course",
                  list: "course-options",
                })}
                {input("address", "Address", {
                  placeholder: "Street, city",
                  span2: true,
                })}
                <datalist id="course-options">
                  {courses.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div className="sticky bottom-0 mt-auto border-t border-white/[0.07] bg-[#0b0b13]/95 px-6 py-5 backdrop-blur">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-white/12 px-5 py-3 text-[13px] font-semibold text-white/60 transition-colors hover:border-white/30 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex flex-1 items-center justify-center gap-2.5 rounded-xl bg-[#D2FF3A] px-5 py-3 text-[13px] font-bold text-[#060609] transition-all hover:shadow-[0_8px_30px_-6px_rgba(210,255,58,0.55)] disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Save className="size-4" />
                    )}
                    {mode === "edit" ? "Save changes" : "Create student"}
                  </button>
                </div>
                <p className="mt-3 text-center font-mono2 text-[10px] uppercase tracking-[0.14em] text-white/30">
                  validated by the same rules as the FastAPI schema
                </p>
              </div>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
