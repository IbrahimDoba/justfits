"use client";

import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Gem, Target, Car } from "lucide-react";

const features = [
  {
    icon: Gem,
    title: "Premium Materials",
    description:
      "Crafted with high-quality fabrics and meticulous attention to detail. Built to last, designed to impress.",
  },
  {
    icon: Target,
    title: "Perfect Fit",
    description:
      "Engineered for comfort and style. Every cap is designed to sit perfectly, all day long.",
  },
  {
    icon: Car,
    title: "Car-Inspired Design",
    description:
      "Authentic automotive heritage meets contemporary streetwear. For those who appreciate the finer things.",
  },
];

export function WhyJustFits() {
  return (
    <section className="relative py-24 md:py-32 bg-gray-50">
      <div className="container px-6">
        {/* Section Header */}
        <ScrollReveal direction="up">
          <div className="text-center mb-16 md:mb-20">
            <p className="text-sm font-body uppercase tracking-[0.3em] text-black/40 mb-4">
              Why Choose Us
            </p>
            <h2 className="font-script text-4xl md:text-5xl italic text-black">
              The JustFits Difference
            </h2>
          </div>
        </ScrollReveal>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <ScrollReveal key={index} direction="up" delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className="text-center group"
              >
                {/* Icon */}
                <div className="inline-flex items-center gap-4 justify-center w-16 h-16 mb-6 border border-black/10 rounded-full group-hover:border-black/20 transition-colors duration-300">
                  <feature.icon
                    size={28}
                    strokeWidth={1.5}
                    className="text-black/50 group-hover:text-black transition-colors duration-300"
                  />
                </div>

                {/* Title */}
                <h3 className="font-body text-lg font-medium text-black mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm font-body text-black/50 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* Decorative Line */}
        <div className="mt-20 flex justify-center w-full">
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-black/20 to-transparent" />
        </div>
      </div>
    </section>
  );
}
