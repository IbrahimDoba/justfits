'use client'

import { useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CheckCircle, Package, Mail, ArrowRight } from 'lucide-react'
import confetti from 'canvas-confetti'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order') || 'N/A'

  useEffect(() => {
    // Trigger confetti on mount
    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#000000', '#d4af37', '#374151'],
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#000000', '#d4af37', '#374151'],
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()
  }, [])

  return (
    <section className="pt-32 pb-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl mx-auto text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle size={48} className="text-green-600" />
          </motion.div>

          {/* Success Message */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-4xl md:text-5xl text-black mb-4"
          >
            ORDER CONFIRMED!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 text-lg mb-8"
          >
            Thank you for your purchase. Your order has been received and is being processed.
          </motion.p>

          {/* Order Number */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-sm mb-8"
          >
            <p className="text-sm text-gray-500 mb-2">Order Number</p>
            <p className="font-mono text-xl font-semibold text-black">{orderNumber}</p>
          </motion.div>

          {/* What's Next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl p-6 shadow-sm mb-8"
          >
            <h2 className="font-heading font-semibold text-lg text-black mb-4">
              What&apos;s Next?
            </h2>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-black">Confirmation Email</p>
                  <p className="text-sm text-gray-500">
                    You&apos;ll receive an email with your order details shortly.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package size={18} className="text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-black">Shipping Updates</p>
                  <p className="text-sm text-gray-500">
                    We&apos;ll send you updates via SMS when your order ships.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/orders"
              className="inline-flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              View My Orders
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function SuccessLoading() {
  return (
    <section className="pt-32 pb-20">
      <div className="container mx-auto px-6">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-8 animate-pulse" />
          <div className="h-12 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-8 animate-pulse" />
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
            <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-2 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-40 mx-auto animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <Suspense fallback={<SuccessLoading />}>
        <SuccessContent />
      </Suspense>
      <Footer />
    </main>
  )
}
