import { useState } from "react";
import { cn } from "../lib/utils";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

type Props = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  items: FaqItem[];
};

export default function Faq({ eyebrow, title, subtitle, items }: Props) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <section id="faq" className="reveal-section bg-[var(--color-surface)] px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[820px]">
        <div className="reveal-item text-center">
          {eyebrow ? (
            <p className="mb-3 text-[11px] font-600 tracking-[0.22em] text-[var(--color-accent)] uppercase md:text-xs">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="font-display text-[1.85rem] leading-tight font-700 tracking-tight text-[#2a2a2a] md:text-[2.35rem]">
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#6b6b6b] md:text-base">
            {subtitle}
          </p>
        </div>

        <div className="mt-10 space-y-3">
          {items.map((item, index) => {
            const open = openId === item.id;
            return (
              <div
                key={item.id}
                className="reveal-item overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_rgba(0,0,0,0.06)]"
                style={{ "--stagger": `${index * 60}ms` } as React.CSSProperties}
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left md:px-6 md:py-5"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : item.id)}
                >
                  <span className="pr-2 text-sm font-600 text-[#2a2a2a] md:text-base">
                    {item.question}
                  </span>
                  <span
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--color-accent)] text-white transition-transform duration-300",
                      open && "rotate-180",
                    )}
                    aria-hidden
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-350",
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="border-t border-[#f0f0f0] px-5 pt-3 pb-5 text-sm leading-relaxed text-[#6b6b6b] md:px-6 md:text-[0.95rem]">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
