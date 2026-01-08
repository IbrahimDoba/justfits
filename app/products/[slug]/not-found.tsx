import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function ProductNotFound() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="font-display text-6xl md:text-8xl text-black mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">
            Product not found. It may have been removed or doesn&apos;t exist.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            Back to Shop
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  )
}
