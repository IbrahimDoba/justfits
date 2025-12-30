'use client'

import { motion } from 'framer-motion'

const marqueeItems = [
  'Automotive Inspired',
  'Premium Caps',
  'BMW',
  'Mercedes-Benz',
  'Car Culture',
  'JustFits',
  'Limited Drops',
  'Streetwear',
]

export function Marquee() {
  return (
    <section className="relative py-6 bg-white border-y border-black/10 overflow-hidden">
      <div className="flex">
        <motion.div
          animate={{ x: [0, -1920] }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="flex items-center gap-12 whitespace-nowrap"
        >
          {/* First set */}
          {marqueeItems.map((item, index) => (
            <div key={`first-${index}`} className="flex items-center gap-12">
              <span className="text-sm font-body uppercase tracking-[0.2em] text-black/50">
                {item}
              </span>
              <span className="text-black/20">✦</span>
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {marqueeItems.map((item, index) => (
            <div key={`second-${index}`} className="flex items-center gap-12">
              <span className="text-sm font-body uppercase tracking-[0.2em] text-black/50">
                {item}
              </span>
              <span className="text-black/20">✦</span>
            </div>
          ))}
          {/* Third set for extra coverage */}
          {marqueeItems.map((item, index) => (
            <div key={`third-${index}`} className="flex items-center gap-12">
              <span className="text-sm font-body uppercase tracking-[0.2em] text-black/50">
                {item}
              </span>
              <span className="text-black/20">✦</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
