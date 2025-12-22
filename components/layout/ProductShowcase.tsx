'use client'

import { motion } from 'framer-motion'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { ProductImagePlaceholder } from '@/components/ui/ProductImagePlaceholder'

export function ProductShowcase() {
  return (
    <section className="relative py-24 md:py-32 bg-white overflow-hidden">
      {/* Large Background Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 0.04, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="font-display text-[15rem] md:text-[25rem] lg:text-[35rem] font-black leading-none tracking-tighter text-gray-400 select-none whitespace-nowrap"
        >
          WOOD
        </motion.h2>
      </div>

      {/* Main Content */}
      <div className="container relative z-10 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Product Grid */}
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {/* Product Card 1 */}
              <ScrollReveal direction="left" delay={0.1}>
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-white shadow-xl"
                >
                  <ProductImagePlaceholder variant={1} />
                </motion.div>
              </ScrollReveal>

              {/* Product Card 2 - Center (Slightly taller) */}
              <ScrollReveal direction="up" delay={0.2}>
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="relative aspect-[3/4] md:aspect-[2/3] rounded-3xl overflow-hidden bg-white shadow-xl"
                >
                  <ProductImagePlaceholder variant={2} />
                </motion.div>
              </ScrollReveal>

              {/* Product Card 3 */}
              <ScrollReveal direction="right" delay={0.3}>
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-white shadow-xl"
                >
                  <ProductImagePlaceholder variant={3} />
                </motion.div>
              </ScrollReveal>
            </div>

            {/* Supporting Text - Left Side */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="absolute left-0 bottom-12 max-w-[160px] hidden lg:block"
            >
              <p className="text-xs text-gray-500 leading-relaxed">
                Performance-driven gear for men—built for summer heat and winter cold.
              </p>
            </motion.div>

            {/* Supporting Text - Right Side */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="absolute right-0 top-12 max-w-[180px] hidden lg:block"
            >
              <p className="text-xs text-gray-500 leading-relaxed text-right">
                Stay warm, stay fit. Our winter-workout wear blends insulation with flexibility to keep you going in the toughest conditions.
              </p>
            </motion.div>
          </div>

          {/* Section Title - Bottom */}
          <ScrollReveal direction="up" delay={0.4}>
            <div className="mt-20 text-center">
              <p className="text-sm text-gray-600 uppercase tracking-wider font-heading mb-4">
                Our Top Focus
              </p>
              <h3 className="font-display text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-black">
                TOP WORKOUT GEAR FOR
                <br />
                <span className="text-[#d4af37]">PEAK PERFORMANCE!</span>
              </h3>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
