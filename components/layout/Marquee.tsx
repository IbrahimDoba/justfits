"use client";

import { motion, useReducedMotion } from "framer-motion";

const marqueeItems = [
  "Benz",
  "BMW",
  "AMG",
  "F1",
  "Ferrari",
  "Limited drops",
  "Abuja",
];

function MarqueeRow({ decorative = false }: { decorative?: boolean }) {
  return (
    <div aria-hidden={decorative || undefined} className="flex items-center shrink-0">
      {marqueeItems.map((item) => (
        <div key={item} className="flex items-center">
          <span className="px-8 font-display text-3xl md:text-5xl text-black/80 whitespace-nowrap">
            {item}
          </span>
          <span aria-hidden className="font-display text-2xl md:text-4xl text-black/15">
            /
          </span>
        </div>
      ))}
    </div>
  );
}

export function Marquee() {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <section className="py-8 bg-white border-y border-black/10 overflow-hidden">
        <MarqueeRow />
      </section>
    );
  }

  return (
    <section className="relative py-8 bg-white border-y border-black/10 overflow-hidden">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
        className="flex w-max"
      >
        <MarqueeRow />
        <MarqueeRow decorative />
      </motion.div>
    </section>
  );
}
