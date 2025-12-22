'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { ProductImagePlaceholder } from './ProductImagePlaceholder'

interface ProductCardProps {
  title: string
  price: string
  variant?: 1 | 2 | 3
}

export function ProductCard({ title, price, variant = 1 }: ProductCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="flex-shrink-0 w-[280px] md:w-[320px] bg-white rounded-3xl overflow-hidden shadow-lg"
    >
      {/* Product Image */}
      <div className="relative aspect-[4/5]">
        <ProductImagePlaceholder variant={variant} />
      </div>

      {/* Product Info */}
      <div className="p-6 flex items-center justify-between">
        <div>
          <h4 className="font-heading font-semibold text-sm text-black mb-1">
            {title}
          </h4>
          <p className="font-mono text-xs text-gray-600">{price}</p>
        </div>
        <motion.button
          whileHover={{ x: 4 }}
          className="p-2 rounded-full bg-black text-white hover:bg-gray-800 transition-colors"
          aria-label="View product"
        >
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </motion.div>
  )
}
