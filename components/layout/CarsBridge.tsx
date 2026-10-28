"use client";

import { Instagram } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const ACCENT = "#C81018";

/**
 * Bridge to the JF Cars sister brand. Deliberate single dark color-block on
 * an otherwise light page: the "garage door" moment.
 */
export function CarsBridge() {
  return (
    <section className="relative bg-zinc-950 py-24 md:py-32 overflow-hidden">
      <div className="container px-6">
        <div className="mx-auto max-w-3xl text-center">
          <ScrollReveal direction="up">
            <h2 className="font-display text-5xl md:text-7xl text-white leading-[0.95]">
              We also sell{" "}
              <span className="relative inline-block">
                the cars
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 h-[5px] w-full"
                  style={{ backgroundColor: ACCENT }}
                />
              </span>
              .
            </h2>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.1}>
            <p className="mt-6 text-base md:text-lg font-body text-white/60 leading-relaxed max-w-xl mx-auto">
              JustFits Cars sources clean rides in Abuja, delivered nationwide.
              Same taste. Four wheels.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.18}>
            <a
              href="https://www.instagram.com/justfitscars/"
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-10 inline-flex items-center gap-3 border border-white/30 px-8 py-4 text-sm font-body font-medium uppercase tracking-wider text-white transition-colors hover:bg-white hover:text-black"
            >
              <Instagram size={18} />
              Follow @justfitscars
            </a>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
