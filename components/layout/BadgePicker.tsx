"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { TiltCard } from "@/components/animations/TiltCard";
import { getImageBlurDataURL } from "@/lib/utils/imageBlur";

const badges = [
  {
    name: "Benz",
    sub: "Three-pointed star",
    href: "/shop/benz",
    image: "/justfits/cbenz1.webp",
  },
  {
    name: "BMW",
    sub: "M Motorsport",
    href: "/shop/bmw",
    image: "/justfits/bbmw3.webp",
  },
  {
    name: "AMG",
    sub: "Petronas team",
    href: "/shop/amg",
    image: "/justfits/blackbenzcap1.webp",
  },
];

export function BadgePicker() {
  return (
    <section className="relative py-24 md:py-32 bg-white">
      <div className="container px-6">
        <ScrollReveal direction="up">
          <div className="mb-12 md:mb-16 max-w-2xl">
            <h2 className="font-display text-5xl md:text-6xl text-black">
              Pick your badge
            </h2>
            <p className="mt-4 text-base md:text-lg font-body text-black/50 leading-relaxed">
              Every garage has a loyalty. Shop by the badge you rep.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {badges.map((badge, i) => (
            <ScrollReveal key={badge.name} direction="up" delay={i * 0.08}>
              <TiltCard max={6} className="h-full">
                <Link
                  href={badge.href}
                  className="group block h-full rounded-2xl overflow-hidden border border-black/10 bg-[#f4f3f0]"
                >
                  <div className="relative aspect-[4/4] overflow-hidden">
                    <Image
                      src={badge.image}
                      alt={`${badge.name} caps`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL={getImageBlurDataURL(badge.image)}
                    />
                    {/* Light sweep on hover */}
                    <span
                      aria-hidden
                      className="absolute inset-y-0 -left-1/2 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:translate-x-[320%] transition-all duration-700 ease-out"
                    />
                  </div>
                  <div className="flex items-center justify-between px-5 py-4 border-t border-black/10">
                    <div>
                      <p className="font-display text-2xl text-black">
                        {badge.name}
                      </p>
                      <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-black/40 mt-0.5">
                        {badge.sub}
                      </p>
                    </div>
                    <ArrowUpRight
                      size={18}
                      className="text-black/40 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-black"
                    />
                  </div>
                </Link>
              </TiltCard>
            </ScrollReveal>
          ))}

          {/* Everything else */}
          <ScrollReveal direction="up" delay={0.24}>
            <TiltCard max={6} className="h-full">
              <Link
                href="/shop"
                className="group flex h-full min-h-[320px] flex-col justify-between rounded-2xl bg-zinc-950 p-6 text-white overflow-hidden relative"
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 -left-1/2 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:translate-x-[320%] transition-all duration-700 ease-out"
                />
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-white/50">
                  Ferrari, F1, Audi, Aston and more
                </p>
                <div>
                  <p className="font-display text-5xl leading-none">
                    All caps
                  </p>
                  <p className="mt-3 inline-flex items-center gap-2 text-sm font-body uppercase tracking-wider text-white/70 group-hover:text-white transition-colors">
                    View all
                    <ArrowUpRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </p>
                </div>
              </Link>
            </TiltCard>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
