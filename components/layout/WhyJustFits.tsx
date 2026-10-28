"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { getImageBlurDataURL } from "@/lib/utils/imageBlur";

const points = [
  {
    title: "Structured crowns",
    body: "Firm panels and clean stitching that keep their shape, wear after wear.",
  },
  {
    title: "Fitted, not floppy",
    body: "Adjustable closures that sit right on every head, all day.",
  },
  {
    title: "Badge-first design",
    body: "The embroidery is the centerpiece. Everything else stays out of its way.",
  },
];

export function WhyJustFits() {
  const reduce = useReducedMotion();

  return (
    <section className="relative py-24 md:py-32 bg-gray-50 overflow-hidden">
      <div className="container px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Photography */}
          <ScrollReveal direction="up">
            <div className="relative aspect-[4/5] max-h-[640px] w-full rounded-2xl overflow-hidden">
              <motion.div
                initial={reduce ? false : { scale: 1.08 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src="/justfits/bbmw2.webp"
                  alt="The M Motorsport cap, worn"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-top"
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL={getImageBlurDataURL("/justfits/bbmw2.webp")}
                />
              </motion.div>
            </div>
          </ScrollReveal>

          {/* Copy */}
          <div>
            <ScrollReveal direction="up">
              <h2 className="font-display text-5xl md:text-6xl text-black leading-[0.95]">
                Built like the cars
              </h2>
              <p className="mt-4 text-base md:text-lg font-body text-black/50 max-w-md leading-relaxed">
                Premium panels, clean embroidery, fits that last. The details do
                the talking.
              </p>
            </ScrollReveal>

            <div className="mt-10 divide-y divide-black/10 border-t border-black/10">
              {points.map((point, i) => (
                <ScrollReveal key={point.title} direction="up" delay={i * 0.08}>
                  <div className="py-6">
                    <h3 className="font-body text-lg font-medium text-black">
                      {point.title}
                    </h3>
                    <p className="mt-1.5 text-sm font-body text-black/50 leading-relaxed max-w-md">
                      {point.body}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
