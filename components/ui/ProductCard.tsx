'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ProductImagePlaceholder } from './ProductImagePlaceholder'

interface ProductCardProps {
  title: string
  price: string
  slug?: string
  compareAtPrice?: string
  image?: string | null
  variant?: 1 | 2 | 3
  inStock?: boolean
  layout?: 'carousel' | 'grid'
}

export function ProductCard({
  title,
  price,
  slug,
  compareAtPrice,
  image,
  variant = 1,
  inStock = true,
  layout = 'carousel'
}: ProductCardProps) {
  const cardContent = (
    <motion.div
      whileHover={{ y: -4 }}
      className={`
        bg-white rounded-3xl overflow-hidden shadow-lg group
        ${layout === 'carousel' ? 'flex-shrink-0 w-[280px] md:w-[320px]' : 'w-full'}
      `}
    >
      {/* Product Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <ProductImagePlaceholder variant={variant} />
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}
        {compareAtPrice && inStock && (
          <div className="absolute top-4 left-4">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Sale
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6 flex items-center justify-between">
        <div>
          <h4 className="font-heading font-semibold text-sm text-black mb-1 group-hover:text-gray-700 transition-colors line-clamp-1">
            {title}
          </h4>
          <div className="flex items-center gap-2">
            <p className="font-mono text-xs text-gray-900">{price}</p>
            {compareAtPrice && (
              <p className="font-mono text-xs text-gray-400 line-through">{compareAtPrice}</p>
            )}
          </div>
        </div>
        <motion.div
          whileHover={{ x: 4 }}
          className="p-2 rounded-full bg-black text-white group-hover:bg-gray-800 transition-colors"
        >
          <ArrowRight size={16} />
        </motion.div>
      </div>
    </motion.div>
  )

  if (slug) {
    return (
      <Link href={`/products/${slug}`} className="block">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}
