'use client'

import { motion } from 'framer-motion'
import { ProductCard } from '@/components/ui/ProductCard'
import { Button } from '@/components/ui/Button'
import { ScrollReveal } from '@/components/animations/ScrollReveal'

const products = [
  { title: 'ASPRY x Equinox Lyma', price: 'USD 88.00', variant: 1 as const },
  { title: 'ASPRY x Equinox Lyma', price: 'USD 88.00', variant: 2 as const },
  { title: 'ASPRY x Equinox Lyma', price: 'USD 88.00', variant: 3 as const },
  { title: 'ASPRY x Equinox Lyma', price: 'USD 88.00', variant: 1 as const },
]

export function ProductCarousel() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50">
      <div className="container px-6">
        {/* Horizontal Scrolling Products */}
        <ScrollReveal direction="up">
          <div className="relative">
            <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory">
              {products.map((product, index) => (
                <ProductCard
                  key={index}
                  title={product.title}
                  price={product.price}
                  variant={product.variant}
                />
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* View All Button */}
        <ScrollReveal direction="up" delay={0.2}>
          <div className="flex justify-center mt-12">
            <Button variant="primary" size="lg">
              VIEW ALL BRANDS
            </Button>
          </div>
        </ScrollReveal>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}
