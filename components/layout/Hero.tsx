"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { staggerContainer, staggerItem } from "@/animations/variants";

const heroImages = [
  "/justfits/wwbenz2.png",
  "/justfits/bbmw1.png",
  "/justfits/blackbenzcap1.png",
  "/justfits/cbenz1.png",
];

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen bg-white overflow-hidden">
      <div className="container relative z-10 px-6 min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-screen py-24 md:py-32">
          {/* Left Side - Text Content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="w-full max-w-xl"
          >
            {/* Overline */}
            <motion.p
              variants={staggerItem}
              className="text-sm font-body uppercase tracking-[0.3em] text-black/50 mb-6"
            >
              Premium Car-Inspired Caps
            </motion.p>

            {/* Main Headline - Script Style */}
            <motion.h1
              variants={staggerItem}
              className="font-script text-5xl md:text-6xl lg:text-7xl italic text-black mb-6 leading-[1.1]"
            >
              Crown Your Drive.
            </motion.h1>

            {/* Subtext */}
            <motion.p
              variants={staggerItem}
              className="text-lg md:text-xl font-body text-black/60 mb-10 max-w-md leading-relaxed"
            >
              Where automotive excellence meets streetwear culture. Premium caps
              for those who drive with confidence.
            </motion.p>

            {/* CTA Button */}
            <motion.div variants={staggerItem}>
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
            </motion.div>

            {/* Brand Badges */}
            <motion.div
              variants={staggerItem}
              className="flex items-center gap-8 mt-10 pt-8 border-t border-black/10"
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
            </motion.div>
          </motion.div>

          {/* Right Side - Image Carousel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center"
          >
            {/* Background Circle/Shape */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[80%] h-[80%] rounded-full bg-gray-100" />
            </div>

            {/* Image Carousel */}
            <div className="relative w-full h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={heroImages[currentIndex]}
                    alt="JustFits premium cap"
                    fill
                    className="object-contain object-center drop-shadow-2xl"
                    priority
                    quality={90}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Carousel Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-black w-6"
                      : "bg-black/20 hover:bg-black/40"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </motion.div>
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
