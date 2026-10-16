import { useId, useState } from "react";
import { cn } from "../lib/utils";

type FaqItem = {
  id?: string;
  question: string;
  answer: string;
};

type Props = {
  eyebrow?: string;
  title?: string;
  titleOutline?: string;
  titleSolid?: string;
  subtitle: string;
  ctaLabel?: string;
  ctaHref?: string;
  items: FaqItem[];
};

export default function Faq({
  eyebrow = "",
  titleOutline = "",
  titleSolid = "",
  title,
  subtitle,
  ctaLabel = "",
  ctaHref = "#contacto",
  items,
}: Props) {
  const uid = useId();
  const [openId, setOpenId] = useState<string | null>(null);
  const outline = titleOutline || (title ? title.split(" ")[0] : "");
  const solid = titleSolid || (title ? title.split(" ").slice(1).join(" ") : "");

  return (
    <section
      id="faq"
      className="faq-mmd reveal-section relative overflow-hidden bg-[var(--color-ink)] px-5 py-20 text-[var(--color-paper)] md:px-8 md:py-28"
    >
      <div className="faq-mmd__lines" aria-hidden="true" />

      <div className="relative z-[2] mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:items-start">
        <div className="mmd-rv">
          <span className="faq-mmd__ey font-condensed">{eyebrow}</span>
          <h2 className="faq-mmd__cd font-condensed" data-split-words>
            <span className="faq-mmd__out">{outline}</span>{" "}
            <b>{solid}</b>
          </h2>
          <p className="mt-5 max-w-[32ch] text-[0.975rem] leading-relaxed text-[var(--color-paper)]/65">
            {subtitle}
          </p>
          <a href={ctaHref} className="btn-solid mt-8 inline-flex">
            {ctaLabel}
          </a>
        </div>

        <div className="faq-mmd__list">
          {items.map((item, index) => {
            const id = item.id || `${uid}-${index}`;
            const open = openId === id;
            const panelId = `${id}-panel`;
            return (
              <div key={id} className="faq-mmd__item mmd-rv">
                <button
                  type="button"
                  className="faq-mmd__q"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setOpenId(open ? null : id)}
                >
                  <span className="font-condensed">{item.question}</span>
                  <span className={cn("faq-mmd__icon", open && "is-open")} aria-hidden="true">
                    +
                  </span>
                </button>
                <div
                  id={panelId}
                  className={cn("faq-mmd__panel", open && "is-open")}
                  role="region"
                  aria-hidden={!open}
                >
                  <div className="faq-mmd__panel-inner">
                    <p>{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .faq-mmd__lines {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          background-image: linear-gradient(90deg, currentColor 1px, transparent 1px);
          background-size: calc(100% / 6) 100%;
          opacity: 0.07;
          color: var(--color-paper);
        }
        .faq-mmd__ey {
          display: block;
          margin-bottom: 1.1rem;
          font-size: 0.8125rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: color-mix(in oklab, var(--color-paper) 55%, transparent);
        }
        .faq-mmd__cd {
          margin: 0;
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 800;
          line-height: 0.95;
          letter-spacing: -0.01em;
          text-transform: uppercase;
        }
        .faq-mmd__out {
          color: transparent;
          -webkit-text-stroke: 1.5px var(--color-paper);
        }
        .faq-mmd__cd b {
          font-weight: 800;
        }
        .faq-mmd__list {
          border-top: 1px solid color-mix(in oklab, var(--color-paper) 16%, transparent);
        }
        .faq-mmd__item {
          border-bottom: 1px solid color-mix(in oklab, var(--color-paper) 16%, transparent);
        }
        .faq-mmd__q {
          display: flex;
          width: 100%;
          min-height: 3.5rem;
          align-items: center;
          justify-content: space-between;
          gap: 1.25rem;
          padding: 1.5rem 0;
          text-align: left;
          color: inherit;
          cursor: pointer;
          background: transparent;
          border: 0;
        }
        .faq-mmd__q > span:first-child {
          font-size: clamp(1rem, 2.2vw, 1.5rem);
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: 0.01em;
          text-transform: uppercase;
        }
        .faq-mmd__icon {
          flex-shrink: 0;
          display: grid;
          place-items: center;
          width: 1.75rem;
          height: 1.75rem;
          font-size: 1.875rem;
          font-weight: 400;
          line-height: 0.8;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .faq-mmd__icon.is-open {
          transform: rotate(45deg);
        }
        .faq-mmd__panel {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .faq-mmd__panel.is-open {
          grid-template-rows: 1fr;
        }
        .faq-mmd__panel-inner {
          overflow: hidden;
          min-height: 0;
        }
        .faq-mmd__panel-inner p {
          max-width: 54ch;
          margin: 0;
          padding: 0 2.5rem 1.5rem 0;
          font-size: 1rem;
          line-height: 1.55;
          color: color-mix(in oklab, var(--color-paper) 70%, transparent);
          opacity: 0;
          transform: translateY(-6px);
          transition:
            opacity 0.35s ease 0.05s,
            transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.05s;
        }
        .faq-mmd__panel.is-open .faq-mmd__panel-inner p {
          opacity: 1;
          transform: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .faq-mmd__icon,
          .faq-mmd__panel,
          .faq-mmd__panel-inner p {
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}
