import { useState, type FormEvent } from "react";
import { imageUrl, imageSrcset } from "../lib/utils";

type Props = {
  title: string;
  image?: string;
  successMessage: string;
  submitLabel: string;
  locale?: "es" | "en";
  fields: {
    name: { label: string; required: boolean };
    phone: { label: string; required: boolean };
    email: { label: string; required: boolean };
    company: { label: string; required: boolean };
    message: { label: string; required: boolean };
  };
};

export default function CtaContact({
  title,
  image = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=960&q=65",
  successMessage,
  submitLabel,
  locale = "es",
  fields,
}: Props) {
  const sending = locale === "en" ? "Sending…" : "Enviando…";
  const errorText =
    locale === "en" ? "Could not send. Please try again." : "No se pudo enviar. Intenta de nuevo.";

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
    "w-full border border-white/35 bg-white/15 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/55 focus:border-[var(--color-accent)] md:bg-white/10 md:backdrop-blur-sm";

  return (
    <section id="contacto" className="reveal-section relative overflow-hidden text-white">
      <div className="absolute inset-0">
        <img
          src={imageUrl(image, 1280, 60)}
          srcSet={imageSrcset(image, [800, 1280, 1600], 60)}
          sizes="100vw"
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(6,8,13,0.92)_0%,rgba(20,18,16,0.78)_48%,rgba(250,150,88,0.42)_100%)]" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="relative mx-auto grid max-w-[1120px] gap-10 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="reveal-item">
          <h2 className="font-display max-w-md text-3xl leading-tight font-700 tracking-tight md:text-5xl">
            {title}
          </h2>
        </div>

        <form onSubmit={onSubmit} className="reveal-item space-y-4">
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-[9999px] h-px w-px opacity-0"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-600 tracking-wide text-white/80 uppercase">
              {fields.name.label}
              <div className="relative mt-2">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-white/60" aria-hidden>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path d="M20 21a8 8 0 0 0-16 0" />
                    <circle cx="12" cy="8" r="4" />
                  </svg>
                </span>
                <input
                  name="name"
                  required={fields.name.required}
                  className={`${fieldClass} pl-10`}
                  placeholder={fields.name.label}
                />
              </div>
            </label>
            <label className="block text-xs font-600 tracking-wide text-white/80 uppercase">
              {fields.phone.label}
              <div className="relative mt-2">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-white/60" aria-hidden>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path d="M22 16.9v2a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h2a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7.1 9.5a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6A2 2 0 0 1 22 16.9z" />
                  </svg>
                </span>
                <input
                  name="phone"
                  required={fields.phone.required}
                  className={`${fieldClass} pl-10`}
                  placeholder={fields.phone.label}
                />
              </div>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-600 tracking-wide text-white/80 uppercase">
              {fields.email.label}
              <div className="relative mt-2">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-white/60" aria-hidden>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 7 9-7" />
                  </svg>
                </span>
                <input
                  type="email"
                  name="email"
                  required={fields.email.required}
                  className={`${fieldClass} pl-10`}
                  placeholder={fields.email.label}
                />
              </div>
            </label>
            <label className="block text-xs font-600 tracking-wide text-white/80 uppercase">
              {fields.company.label}
              <div className="relative mt-2">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-white/60" aria-hidden>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
                  </svg>
                </span>
                <input
                  name="company"
                  required={fields.company.required}
                  className={`${fieldClass} pl-10`}
                  placeholder={fields.company.label}
                />
              </div>
            </label>
          </div>

          <label className="block text-xs font-600 tracking-wide text-white/80 uppercase">
            {fields.message.label}
            <div className="relative mt-2">
              <span className="pointer-events-none absolute top-3 left-3 text-white/60" aria-hidden>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M21 15a2 2 0 0 1-2 2H8l-4 3V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              <textarea
                name="message"
                required={fields.message.required}
                rows={4}
                className={`${fieldClass} pl-10`}
                placeholder={fields.message.label}
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-full bg-black px-7 py-3 text-sm font-600 text-white transition hover:bg-[#111] disabled:opacity-60"
          >
            {status === "loading" ? sending : submitLabel}
          </button>

          {status === "ok" && <p className="text-sm text-white">{successMessage}</p>}
          {status === "error" && <p className="text-sm text-red-200">{errorMessage || errorText}</p>}

        </form>
      </div>
    </section>
  );
}
