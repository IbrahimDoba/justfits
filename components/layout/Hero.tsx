'use client'

import { motion } from 'framer-motion'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { Button } from '@/components/ui/Button'
import { ProductImagePlaceholder } from '@/components/ui/ProductImagePlaceholder'
import { ArrowRight } from 'lucide-react'
import { fadeInUp, staggerContainer, staggerItem } from '@/animations/variants'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-[#c5d3d9] pt-20">
      {/* Main Content */}
      <div className="container relative z-10 px-6 py-16 md:py-24">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto text-center"
        >
          {/* Main Headline */}
          <motion.h1
            variants={staggerItem}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-black mb-8 leading-tight"
          >
            GEAR UP EVERY SEASON
            <br />
            EVERY WORKOUT!
          </motion.h1>

          {/* CTA Buttons */}
          <motion.div
            variants={staggerItem}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button size="lg" variant="primary">
              SHOP NOW
            </Button>
            <Button size="lg" variant="outline">
              EXPLORE ALL
            </Button>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            variants={staggerItem}
            className="relative mx-auto max-w-2xl"
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden">
              <ProductImagePlaceholder variant={2} />
            </div>

            {/* User Avatars - Bottom Left */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute bottom-8 left-4 md:left-8 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg max-w-xs"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-white" />
                  <div className="w-8 h-8 rounded-full bg-gray-600 border-2 border-white" />
                  <div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-white" />
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Stay warm, stay fit. Our winter-workout wear blends insulation with flexibility.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
