import { Navbar } from '@/components/layout/Navbar'
import { Hero } from '@/components/layout/Hero'
import { Marquee } from '@/components/layout/Marquee'
import { ProductShowcase } from '@/components/layout/ProductShowcase'
import { WhyJustFits } from '@/components/layout/WhyJustFits'
import { Footer } from '@/components/layout/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Marquee />
      <ProductShowcase />
      <WhyJustFits />
      <Footer />
    </main>
  )
}
