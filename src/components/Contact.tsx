import { useState, type FormEvent } from "react";

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  successMessage: string;
  submitLabel: string;
  fields: {
    name: { label: string; required: boolean };
    phone: { label: string; required: boolean };
    email: { label: string; required: boolean };
    company: { label: string; required: boolean };
    message: { label: string; required: boolean };
  };
};

export default function Contact({
  eyebrow,
  title,
  subtitle,
  successMessage,
  submitLabel,
  fields,
}: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // React clears e.currentTarget once the handler yields, so keep the element before awaiting.
    const formEl = e.currentTarget;
    setStatus("loading");
    setErrorMessage("");
    const payload = Object.fromEntries(new FormData(formEl).entries());
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErrorMessage(res.status === 400 && data?.error ? String(data.error) : "");
        setStatus("error");
        return;
      }
      formEl.reset();
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  const fieldClass =
    "mt-2 w-full border border-[var(--color-line)] bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[var(--color-accent)]";

  return (
    <section id="contacto" className="section-pad bg-[var(--color-surface)]">
      <div className="container-shell grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="eyebrow mb-3 text-[var(--color-accent)]">{eyebrow}</p>
          <h2 className="font-display text-3xl font-700 tracking-tight text-black md:text-4xl">
            {title}
          </h2>
          <p className="mt-4 max-w-md text-[var(--color-ink-soft)]">{subtitle}</p>
        </div>
        <form onSubmit={onSubmit} className="relative space-y-5 bg-white p-6 md:p-8">
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-[9999px] h-px w-px opacity-0"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-xs font-600 tracking-wide text-[var(--color-ink-soft)] uppercase">
              {fields.name.label}
              <input name="name" required={fields.name.required} className={fieldClass} />
            </label>
            <label className="block text-xs font-600 tracking-wide text-[var(--color-ink-soft)] uppercase">
              {fields.phone.label}
              <input name="phone" required={fields.phone.required} className={fieldClass} />
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-xs font-600 tracking-wide text-[var(--color-ink-soft)] uppercase">
              {fields.email.label}
              <input
                type="email"
                name="email"
                required={fields.email.required}
                className={fieldClass}
              />
            </label>
            <label className="block text-xs font-600 tracking-wide text-[var(--color-ink-soft)] uppercase">
              {fields.company.label}
              <input name="company" required={fields.company.required} className={fieldClass} />
            </label>
          </div>
          <label className="block text-xs font-600 tracking-wide text-[var(--color-ink-soft)] uppercase">
            {fields.message.label}
            <textarea
              name="message"
              required={fields.message.required}
              rows={4}
              className={fieldClass}
            />
          </label>
          <button type="submit" disabled={status === "loading"} className="btn-solid disabled:opacity-60">
            {status === "loading" ? "Enviando…" : submitLabel}
          </button>
          {status === "ok" && (
            <p className="text-sm text-[var(--color-accent-deep)]">{successMessage}</p>
          )}
          {status === "error" && (
            <p className="text-sm text-red-600">{errorMessage || "No se pudo enviar. Intenta de nuevo."}</p>
          )}
        </form>
      </div>
    </section>
  );
}
