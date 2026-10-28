"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { getImageBlurDataURL } from "@/lib/utils/imageBlur";

const heroImages = [
  "/justfits/wwbenz2.webp",
  "/justfits/bbmw1.webp",
  "/justfits/blackbenzcap1.webp",
  "/justfits/cbenz1.webp",
];

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % heroImages.length);
  };

  const getItemPosition = (itemIndex: number) => {
    const diff = itemIndex - currentIndex;
    const normalizedDiff = ((diff + heroImages.length) % heroImages.length);
    const adjustedDiff = normalizedDiff > heroImages.length / 2
      ? normalizedDiff - heroImages.length
      : normalizedDiff;

    return adjustedDiff;
  };

  return (
    <section className="relative min-h-screen bg-white overflow-hidden">
      <div className="container relative z-10 px-6 min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-screen py-24 md:py-32">
          {/* Left Side - Text Content */}
          <div className="w-full max-w-xl">
            {/* Overline */}
            <p
              className="hero-rise text-sm font-body uppercase tracking-[0.3em] text-black/50 mb-6"
            >
              Premium Car-Inspired Caps
            </p>

            {/* Main Headline - Script Style */}
            <h1
              className="hero-rise font-script text-5xl md:text-6xl lg:text-7xl italic text-black mb-6 leading-[1.1]"
              style={{ animationDelay: "80ms" }}
            >
              Crown Your Drive.
            </h1>

            {/* Subtext */}
            <p
              className="hero-rise text-lg md:text-xl font-body text-black/60 mb-10 max-w-md leading-relaxed"
              style={{ animationDelay: "160ms" }}
            >
              Where automotive excellence meets streetwear culture. Premium caps
              for those who drive with confidence.
            </p>

            {/* CTA Button */}
            <div className="hero-rise" style={{ animationDelay: "240ms" }}>
              <Link href="/shop" className="inline-block">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group inline-flex items-center gap-3 px-8 py-4 mt-6  bg-black text-white font-body font-medium text-sm uppercase tracking-wider transition-all duration-300 hover:bg-black/90"
                >
                  Shop the Drop
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </motion.button>
              </Link>
            </div>

            {/* Brand Badges */}
            <div
              className="hero-rise flex items-center gap-8 mt-10 pt-8 border-t border-black/10"
              style={{ animationDelay: "320ms" }}
            >
              <div className="text-center">
                <p className="font-display text-2xl md:text-3xl text-black">BMW</p>
                <p className="text-xs text-black/40 uppercase tracking-wider mt-1">
                  Collection
                </p>
              </div>
              <div className="w-px h-8 bg-black/20" />
              <div className="text-center">
                <p className="font-display text-2xl md:text-3xl text-black">BENZ</p>
                <p className="text-xs text-black/40 uppercase tracking-wider mt-1">
                  Collection
                </p>
              </div>
              <div className="w-px h-8 bg-black/20" />
              <div className="text-center">
                <p className="font-display text-2xl md:text-3xl text-black">MORE</p>
                <p className="text-xs text-black/40 uppercase tracking-wider mt-1">
                  Coming Soon
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - 3D Coverflow Carousel (CSS slide-in, never hidden) */}
          <div
            className="hero-slide relative w-full h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center perspective-[2000px]"
            style={{ perspective: "2000px" }}
          >
            {/* Background Circle/Shape */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[90%] h-[90%] rounded-full bg-gradient-to-br from-gray-50 to-gray-100 opacity-50" />
            </div>

            {/* 3D Coverflow Container */}
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="relative w-full h-full" style={{ transformStyle: "preserve-3d" }}>
                {heroImages.map((image, index) => {
                  const position = getItemPosition(index);
                  const isCenter = position === 0;
                  const absPosition = Math.abs(position);

                  // Calculate transformations for coverflow effect
                  const translateX = position * 45; // Spacing between items (%)
                  const translateZ = isCenter ? 0 : -150 - (absPosition * 50); // Depth
                  const rotateY = position * -35; // Rotation angle
                  const scale = isCenter ? 1 : 0.7 - (absPosition * 0.1); // Size
                  const opacity = absPosition >= 2 ? 0 : isCenter ? 1 : 0.6 - (absPosition * 0.2);
                  const zIndex = isCenter ? 20 : 10 - absPosition;

                  // Don't render items that are too far away
                  if (absPosition >= 2) return null;

                  return (
                    <motion.div
                      key={index}
                      className="absolute inset-0 cursor-pointer"
                      style={{
                        zIndex,
                        transformStyle: "preserve-3d",
                      }}
                      initial={false}
                      animate={{
                        x: `${translateX}%`,
                        z: translateZ,
                        rotateY: rotateY,
                        scale: scale,
                        opacity: opacity,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 30,
                      }}
                      onClick={() => {
                        if (!isCenter) {
                          setDirection(position > 0 ? 1 : -1);
                          setCurrentIndex(index);
                        }
                      }}
                    >
                      <div className="relative w-full h-full flex items-center justify-center">
                        <div className="relative w-[80%] h-[80%]">
                          <Image
                            src={image}
                            alt={`JustFits premium cap ${index + 1}`}
                            fill
                            className="object-contain drop-shadow-2xl pointer-events-none"
                            // Centre image is the LCP: fetch it first, never lazily.
                            preload={index === 0}
                            loading={index === 0 ? "eager" : undefined}
                            fetchPriority={index === 0 ? "high" : "low"}
                            quality={75}
                            // Rendered ~260-320px wide on phones, ~480px on desktop.
                            sizes="(max-width: 768px) 320px, (max-width: 1024px) 400px, 480px"
                            placeholder="blur"
                            blurDataURL={getImageBlurDataURL(image)}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-lg"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} className="text-black" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-lg"
              aria-label="Next image"
            >
              <ChevronRight size={24} className="text-black" />
            </button>

            {/* Carousel Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-black w-8"
                      : "bg-black/30 hover:bg-black/50 w-2"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-black/40 uppercase tracking-widest">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 bg-gradient-to-b from-black/40 to-transparent"
        />
      </motion.div>
    </section>
  );
}
