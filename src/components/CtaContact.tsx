import { useState, type FormEvent } from "react";

type Option = { value: string; label: string };

type Props = {
  title?: string;
  titleLight?: string;
  titleBold?: string;
  eyebrow?: string;
  subtitle?: string;
  successMessage: string;
  submitLabel: string;
  whatsappHint?: string;
  locale?: "es" | "en";
  /** Número WhatsApp destino (envío); no se muestra en la sección */
  phone?: string;
  serviceLabel?: string;
  budgetLabel?: string;
  serviceOptions?: Option[];
  budgetOptions?: Option[];
  fields: {
    name: { label: string; required: boolean };
    phone: { label: string; required: boolean };
    email: { label: string; required: boolean };
    company: { label: string; required: boolean };
    message: { label: string; required: boolean };
  };
};

function digitsOnly(phone: string) {
  return phone.replace(/\D/g, "");
}

export default function CtaContact({
  title,
  titleLight = "",
  titleBold = "",
  eyebrow = "",
  subtitle = "",
  successMessage,
  submitLabel,
  whatsappHint = "",
  locale = "es",
  phone = "",
  serviceLabel = "",
  budgetLabel = "",
  serviceOptions = [],
  budgetOptions = [],
  fields,
}: Props) {
  const isEn = locale === "en";
  const opening = isEn ? "Opening WhatsApp…" : "Abriendo WhatsApp…";
  const hint = whatsappHint;
  const svcLabel = serviceLabel || (isEn ? "Service of interest" : "Servicio de interés");
  const budLabel = budgetLabel || (isEn ? "Estimated budget" : "Presupuesto estimado");

  const services = serviceOptions;
  const budgets = budgetOptions;

  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const data = new FormData(formEl);
    const website = String(data.get("website") || "");
    if (website) return;

    const waDigits = digitsOnly(phone);
    if (!waDigits || waDigits.includes("00000000")) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    const name = String(data.get("name") || "").trim();
    const company = String(data.get("company") || "").trim();
    const mail = String(data.get("email") || "").trim();
    const tel = String(data.get("phone") || "").trim();
    const serviceVal = String(data.get("service") || "");
    const budgetVal = String(data.get("budget") || "");
    const message = String(data.get("message") || "").trim();

    const serviceText =
      services.find((o) => o.value === serviceVal)?.label || serviceVal || "—";
    const budgetText =
      budgets.find((o) => o.value === budgetVal)?.label || budgetVal || "—";

    const lines = isEn
      ? [
          "Hi GDT DevSur, I'd like a quote.",
          "",
          `Name: ${name}`,
          company ? `Company: ${company}` : null,
          `Email: ${mail}`,
          `Phone: ${tel}`,
          `Service: ${serviceText}`,
          `Budget: ${budgetText}`,
          "",
          `Project: ${message}`,
        ]
      : [
          "Hola GDT DevSur, quiero solicitar una cotización.",
          "",
          `Nombre: ${name}`,
          company ? `Empresa: ${company}` : null,
          `Correo: ${mail}`,
          `Teléfono: ${tel}`,
          `Servicio: ${serviceText}`,
          `Presupuesto: ${budgetText}`,
          "",
          `Proyecto: ${message}`,
        ];
    const body = lines.filter((line) => line !== null).join("\n");

    const href = `https://wa.me/${waDigits}?text=${encodeURIComponent(body)}`;
    const popup = window.open(href, "_blank");
    if (popup) {
      try {
        popup.opener = null;
      } catch {
        /* ignore */
      }
      formEl.reset();
      setStatus("ok");
      return;
    }
    formEl.reset();
    setStatus("ok");
    window.location.assign(href);
  }

  const fieldClass = "cta-mmd__field";
  const labelClass = "cta-mmd__label";

  function SelectChevron() {
    return (
      <svg
        className="cta-mmd__chevron pointer-events-none absolute top-1/2 right-3.5 h-3.5 w-3.5 -translate-y-1/2"
        viewBox="0 0 12 12"
        aria-hidden="true"
      >
        <path
          d="M2.5 4.5 6 8l3.5-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  const light = titleLight || title || "";
  const bold = titleBold || "";

  return (
    <section
      id="contacto"
      className="cta-mmd reveal-section relative overflow-hidden bg-[var(--color-ink)] text-[var(--color-paper)]"
    >
      <div className="cta-mmd__lines" aria-hidden="true" />
      <div className="cta-mmd__glow" aria-hidden="true" />

      <div className="relative z-[2] mx-auto grid max-w-[1120px] gap-10 px-5 py-16 md:gap-12 md:px-8 md:py-24 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:items-start">
        <div className="cta-mmd__intro lg:sticky lg:top-28">
          <span className="cta-mmd__ey font-condensed">{eyebrow}</span>
          <h2 className="cta-mmd__cd font-condensed" data-split-words>
            <span className="cta-mmd__l">{light}</span>{" "}
            <b>{bold}</b>
          </h2>
          {subtitle ? (
            <p className="cta-mmd__sub mt-6 max-w-md text-[0.95rem] leading-relaxed text-white/55">
              {subtitle}
            </p>
          ) : null}
        </div>

        <form onSubmit={onSubmit} className="cta-mmd__form relative space-y-4 sm:space-y-5">
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-[9999px] h-px w-px opacity-0"
          />

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            <label className={labelClass}>
              {fields.name.label}
              <input
                name="name"
                required={fields.name.required}
                className={fieldClass}
                autoComplete="name"
              />
            </label>
            <label className={labelClass}>
              {fields.company.label}
              <input
                name="company"
                required={fields.company.required}
                className={fieldClass}
                autoComplete="organization"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            <label className={labelClass}>
              {fields.email.label}
              <input
                type="email"
                name="email"
                required={fields.email.required}
                className={fieldClass}
                autoComplete="email"
              />
            </label>
            <label className={labelClass}>
              {fields.phone.label}
              <input
                name="phone"
                required={fields.phone.required}
                className={fieldClass}
                autoComplete="tel"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            <label className={labelClass}>
              {svcLabel}
              <span className="cta-mmd__select-wrap relative block">
                <select name="service" required defaultValue="" className={`${fieldClass} cta-mmd__select`}>
                  {services.map((o) => (
                    <option
                      key={o.value || "empty-service"}
                      value={o.value}
                      disabled={!o.value}
                    >
                      {o.label}
                    </option>
                  ))}
                </select>
                <SelectChevron />
              </span>
            </label>
            <label className={labelClass}>
              {budLabel}
              <span className="cta-mmd__select-wrap relative block">
                <select name="budget" required defaultValue="" className={`${fieldClass} cta-mmd__select`}>
                  {budgets.map((o) => (
                    <option key={o.value || "empty"} value={o.value} disabled={!o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <SelectChevron />
              </span>
            </label>
          </div>

          <label className={labelClass}>
            {fields.message.label}
            <textarea
              name="message"
              required={fields.message.required}
              rows={4}
              className={`${fieldClass} cta-mmd__textarea resize-none`}
            />
          </label>

          <div className="flex flex-col items-start gap-3 pt-1">
            <button type="submit" className="btn-solid cta-mmd__btn" disabled={status === "loading"}>
              <span>{status === "loading" ? opening : submitLabel}</span>
              {status !== "loading" ? (
                <span className="cta-mmd__btn-arrow" aria-hidden="true">
                  →
                </span>
              ) : null}
            </button>
            <p className="text-[12px] leading-relaxed text-white/40">{hint}</p>
            {status === "ok" ? (
              <p className="text-sm text-[color:var(--cta-accent)]" role="status" aria-live="polite">
                {successMessage}
              </p>
            ) : null}
            {status === "error" ? (
              <p className="text-sm text-red-300" role="alert" aria-live="assertive">
                {isEn
                  ? "Could not open WhatsApp. Allow popups or check the phone number."
                  : "No se pudo abrir WhatsApp. Permite ventanas emergentes o revisa el número."}
              </p>
            ) : null}
          </div>
        </form>
      </div>

      <style>{`
        .cta-mmd {
          --cta-accent: #fa9658;
          --cta-accent-deep: #e07d3f;
          --cta-field-bg: color-mix(in oklab, #06080d 72%, #1a1d24);
          --cta-field-border: color-mix(in oklab, var(--color-paper) 14%, transparent);
          --cta-field-border-hover: color-mix(in oklab, var(--color-paper) 28%, transparent);
        }

        .cta-mmd__lines {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          background-image: linear-gradient(90deg, currentColor 1px, transparent 1px);
          background-size: calc(100% / 6) 100%;
          opacity: 0.055;
          color: var(--color-paper);
        }

        .cta-mmd__glow {
          position: absolute;
          right: -12%;
          bottom: -28%;
          width: min(52vw, 520px);
          height: min(52vw, 520px);
          pointer-events: none;
          z-index: 1;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            color-mix(in oklab, var(--cta-accent) 14%, transparent) 0%,
            transparent 68%
          );
          opacity: 0.7;
        }

        .cta-mmd__ey {
          display: block;
          margin-bottom: 1rem;
          font-size: 0.8125rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: color-mix(in oklab, var(--color-paper) 55%, transparent);
        }

        .cta-mmd__cd {
          margin: 0;
          max-width: 14ch;
          font-size: clamp(2.2rem, 4.5vw, 3.5rem);
          font-weight: 300;
          line-height: 0.98;
          text-transform: uppercase;
        }

        .cta-mmd__cd b {
          font-weight: 800;
        }

        .cta-mmd__l {
          font-weight: 300;
          color: color-mix(in oklab, var(--color-paper) 55%, transparent);
        }

        .cta-mmd__label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: color-mix(in oklab, var(--color-paper) 52%, transparent);
        }

        .cta-mmd__field {
          display: block;
          width: 100%;
          margin-top: 0.45rem;
          min-height: 48px;
          padding: 0.8rem 0.95rem;
          appearance: none;
          border: 1px solid var(--cta-field-border);
          border-radius: 0.45rem;
          background: var(--cta-field-bg);
          color: var(--color-paper);
          font-family: var(--font-sans);
          font-size: 0.9375rem;
          line-height: 1.4;
          outline: none;
          transition:
            border-color 0.2s ease,
            background-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .cta-mmd__field::placeholder {
          color: color-mix(in oklab, var(--color-paper) 32%, transparent);
        }

        .cta-mmd__field:hover {
          border-color: var(--cta-field-border-hover);
        }

        .cta-mmd__field:focus {
          border-color: color-mix(in oklab, var(--cta-accent) 72%, white);
          box-shadow: 0 0 0 3px color-mix(in oklab, var(--cta-accent) 22%, transparent);
          background: color-mix(in oklab, var(--cta-field-bg) 88%, #10131a);
        }

        .cta-mmd__select {
          padding-right: 2.5rem;
          cursor: pointer;
        }

        .cta-mmd__select option {
          background: #10131a;
          color: #f5f5f2;
        }

        .cta-mmd__select option:disabled {
          color: #888;
        }

        .cta-mmd__chevron {
          color: color-mix(in oklab, var(--color-paper) 48%, transparent);
          transition: color 0.2s ease, transform 0.2s ease;
        }

        .cta-mmd__select-wrap:focus-within .cta-mmd__chevron {
          color: var(--cta-accent);
          transform: translateY(-35%) rotate(180deg);
        }

        .cta-mmd__textarea {
          min-height: 7.5rem;
          padding-top: 0.9rem;
          padding-bottom: 0.9rem;
        }

        .cta-mmd__btn {
          min-height: 52px;
          padding: 0.9rem 1.85rem;
          font-weight: 700;
        }

        .cta-mmd__btn-arrow {
          display: inline-block;
          transition: transform 0.2s ease;
        }

        .cta-mmd__btn:hover .cta-mmd__btn-arrow {
          transform: translateX(3px);
        }

        .cta-mmd__btn:focus-visible {
          outline: 2px solid var(--color-paper);
          outline-offset: 3px;
        }

        .cta-mmd__btn:disabled {
          opacity: 0.72;
          cursor: wait;
        }

        @media (prefers-reduced-motion: reduce) {
          .cta-mmd__field,
          .cta-mmd__btn,
          .cta-mmd__btn-arrow,
          .cta-mmd__chevron {
            transition: none;
          }

          .cta-mmd__btn:hover,
          .cta-mmd__btn:hover .cta-mmd__btn-arrow,
          .cta-mmd__select-wrap:focus-within .cta-mmd__chevron {
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
