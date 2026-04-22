"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

type Status = "idle" | "sending" | "success" | "error";

function Field({
  label,
  name,
  type = "text",
  required,
  rows,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  rows?: number;
}) {
  const id = `cf-${name}`;
  const base =
    "w-full bg-surface-600 border border-surface-400 rounded-lg px-4 text-surface-50 placeholder:text-surface-300 focus:outline-none focus:border-cones-blue focus:ring-2 focus:ring-cones-blue/20 transition-all";

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-heading text-[11px] uppercase tracking-[0.25em] text-surface-300">
        {label}{required && <span className="text-cones-orange ml-1">*</span>}
      </label>
      {rows ? (
        <textarea
          id={id}
          name={name}
          required={required}
          rows={rows}
          className={`${base} py-3 resize-none`}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          className={`${base} h-12`}
        />
      )}
    </div>
  );
}

export default function ContactForm() {
  const t = useTranslations("contact");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? "") || undefined,
      message: String(fd.get("message") ?? ""),
    };
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setStatus("success");
      (e.target as HTMLFormElement).reset();
    } else {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="h-14 w-14 rounded-full bg-cones-blue/10 border border-cones-blue/30 flex items-center justify-center text-cones-blue text-2xl">
          ✓
        </div>
        <p className="font-display text-2xl uppercase text-surface-50">{t("successTitle")}</p>
        <p className="text-surface-300 text-sm">{t("success")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label={t("name")} name="name" required />
        <Field label={t("email")} name="email" type="email" required />
      </div>
      <Field label={t("phone")} name="phone" type="tel" />
      <Field label={t("message")} name="message" rows={5} required />

      <div className="flex items-center gap-5 pt-2">
        <button
          type="submit"
          disabled={status === "sending"}
          className="px-8 py-3 bg-cones-blue text-cones-black font-heading text-sm uppercase tracking-[0.2em] rounded-lg hover:bg-cones-blue/90 transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {status === "sending" ? t("sending") : t("submit")}
        </button>
        {status === "error" && (
          <span className="text-sm text-red-400">{t("error")}</span>
        )}
      </div>
    </form>
  );
}
