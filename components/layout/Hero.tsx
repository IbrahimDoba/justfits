"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getImageBlurDataURL } from "@/lib/utils/imageBlur";

// The showroom lineup. Real product photography; each chip hex mirrors the
// cap's actual colour so the selector reads like a paint-chip row.
const colorways = [
  {
    id: "amg-white",
    label: "AMG White",
    spec: "MERCEDES-AMG F1 / WHITE",
    chip: "#f1efe9",
    image: "/justfits/wwbenz2.webp",
  },
  {
    id: "m-black",
    label: "M Black",
    spec: "BMW M MOTORSPORT / BLACK",
    chip: "#161616",
    image: "/justfits/bbmw1.webp",
  },
  {
    id: "lh44",
    label: "LH44",
    spec: "MERCEDES-AMG LH44 / WHITE",
    chip: "#fafafa",
    image: "/justfits/wbenzcap1.webp",
  },
];

const ACCENT = "#C81018";

export function Hero() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Pointer-driven tilt. Motion values only, never React state (perf).
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [7, -7]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(px, [0, 1], [-9, 9]), {
    stiffness: 150,
    damping: 20,
  });
  const glareX = useTransform(px, [0, 1], ["25%", "75%"]);
  const glareY = useTransform(py, [0, 1], ["20%", "70%"]);
  const glare = useMotionTemplate`radial-gradient(420px circle at ${glareX} ${glareY}, rgba(255,255,255,0.28), transparent 60%)`;

  const go = (next: number, dir: number) => {
    setDirection(dir);
    setActive((next + colorways.length) % colorways.length);
  };

  // Gentle auto-advance, paused on interaction and under reduced motion.
  useEffect(() => {
    if (reduce || paused) return;
    const t = setInterval(() => {
      setDirection(1);
      setActive((prev) => (prev + 1) % colorways.length);
    }, 6000);
    return () => clearInterval(t);
  }, [reduce, paused]);

  const current = colorways[active];

  return (
    <section className="relative min-h-[100dvh] bg-white overflow-hidden">
      <div className="container relative z-10 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center min-h-[100dvh] pt-24 pb-16 lg:py-24">
          {/* Copy. CSS-animated (hero-rise) so it is never hidden pre-hydration. */}
          <div className="lg:col-span-5 w-full max-w-xl">
            <h1 className="hero-rise font-display text-6xl md:text-7xl lg:text-8xl text-black leading-[0.95] tracking-wide">
              Wear the badge.
            </h1>

            <p
              className="hero-rise mt-6 text-lg md:text-xl font-body text-black/60 max-w-md leading-relaxed"
              style={{ animationDelay: "120ms" }}
            >
              Car-culture caps for Benz people, BMW people, and everyone who
              knows the difference.
            </p>

            <div className="hero-rise mt-10" style={{ animationDelay: "240ms" }}>
              <Link href="/shop" className="inline-block">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-black text-white font-body font-medium text-sm uppercase tracking-wider hover:bg-black/90 transition-colors"
                >
                  Shop the Drop
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </motion.span>
              </Link>
            </div>
          </div>

          {/* Showroom card. CSS slide-in; the LCP image inside is never hidden. */}
          <div
            className="hero-slide lg:col-span-7 w-full"
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
          >
            <div
              style={{ perspective: 1400 }}
              className="relative mx-auto max-w-[640px]"
            >
              <motion.div
                ref={cardRef}
                style={
                  reduce
                    ? undefined
                    : { rotateX, rotateY, transformStyle: "preserve-3d" }
                }
                onPointerMove={(e) => {
                  if (reduce) return;
                  const rect = cardRef.current?.getBoundingClientRect();
                  if (!rect) return;
                  px.set((e.clientX - rect.left) / rect.width);
                  py.set((e.clientY - rect.top) / rect.height);
                }}
                onPointerLeave={() => {
                  px.set(0.5);
                  py.set(0.5);
                }}
                className="relative h-[440px] md:h-[540px] lg:h-[620px] rounded-3xl overflow-hidden bg-[#efede8] shadow-[0_30px_80px_-30px_rgba(23,23,23,0.35)]"
              >
                {/* Colorway image, flips like a display stand on swap */}
                <AnimatePresence
                  initial={false}
                  custom={direction}
                  mode="popLayout"
                >
                  <motion.div
                    key={current.id}
                    custom={direction}
                    initial={
                      reduce
                        ? { opacity: 0 }
                        : { opacity: 0, rotateY: direction * 60, scale: 0.96 }
                    }
                    animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                    exit={
                      reduce
                        ? { opacity: 0 }
                        : { opacity: 0, rotateY: direction * -45, scale: 0.97 }
                    }
                    transition={{ type: "spring", stiffness: 190, damping: 24 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={current.image}
                      alt={`${current.label} cap`}
                      fill
                      // The hero card is the LCP: fetch the first image eagerly.
                      preload={active === 0}
                      loading={active === 0 ? "eager" : undefined}
                      fetchPriority={active === 0 ? "high" : "low"}
                      quality={80}
                      // Card renders ~92vw on phones (px-6 container), capped at 640px.
                      sizes="(max-width: 767px) 92vw, 640px"
                      className="object-cover object-top pointer-events-none"
                      placeholder="blur"
                      blurDataURL={getImageBlurDataURL(current.image)}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Glare that follows the pointer */}
                {!reduce && (
                  <motion.div
                    aria-hidden
                    style={{ background: glare }}
                    className="absolute inset-0 pointer-events-none mix-blend-soft-light"
                  />
                )}

                {/* Spec plate, floats on a nearer 3D plane */}
                <div
                  style={{ transform: "translateZ(46px)" }}
                  className="absolute bottom-5 left-5 bg-white/90 backdrop-blur-sm border border-black/10 rounded-lg px-4 py-2.5"
                >
                  <p className="font-mono text-[11px] tracking-[0.08em] text-black/80">
                    {current.spec}
                  </p>
                </div>

                {/* Drag layer: swipe to spin the stand */}
                {!reduce && (
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.18}
                    dragSnapToOrigin
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -60 || info.velocity.x < -500) {
                        go(active + 1, 1);
                      } else if (info.offset.x > 60 || info.velocity.x > 500) {
                        go(active - 1, -1);
                      }
                    }}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                  />
                )}
              </motion.div>

              {/* Paint-chip selector */}
              <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
                {colorways.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => go(i, i > active ? 1 : -1)}
                    aria-label={`Show the ${c.label} cap`}
                    aria-pressed={i === active}
                    className={`flex items-center gap-2.5 rounded-full border px-3.5 py-2 transition-colors ${
                      i === active
                        ? "border-black bg-black text-white"
                        : "border-black/15 bg-white text-black/60 hover:border-black/40"
                    }`}
                  >
                    <span
                      aria-hidden
                      className="h-4 w-4 rounded-[4px] border border-black/15"
                      style={{
                        backgroundColor: c.chip,
                        boxShadow:
                          i === active ? `0 0 0 2px ${ACCENT}` : undefined,
                      }}
                    />
                    <span className="font-mono text-[11px] uppercase tracking-[0.08em]">
                      {c.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
