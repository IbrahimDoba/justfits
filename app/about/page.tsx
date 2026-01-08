'use client'

import { motion } from 'framer-motion'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { fadeInUp, staggerContainer } from '@/animations/variants'
import { Car, Award, Globe, Heart } from 'lucide-react'

const values = [
  {
    icon: Car,
    title: 'Automotive Passion',
    description:
      'Every design is born from our deep love for automotive culture and the legendary machines that shaped it.',
  },
  {
    icon: Award,
    title: 'Premium Quality',
    description:
      'We use only the finest materials and craftsmanship to create caps that stand the test of time.',
  },
  {
    icon: Globe,
    title: 'Global Community',
    description:
      'Connecting car enthusiasts worldwide through fashion that speaks to our shared passion.',
  },
  {
    icon: Heart,
    title: 'Made with Love',
    description:
      'Each piece is designed with attention to detail and care, because we wear them too.',
  },
]

const stats = [
  { value: '10K+', label: 'Happy Customers' },
  { value: '50+', label: 'Unique Designs' },
  { value: '15+', label: 'Countries Shipped' },
  { value: '4.9', label: 'Customer Rating' },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="font-display text-5xl md:text-7xl text-black tracking-tight mb-6">
              OUR STORY
            </h1>
            <p className="text-gray-600 text-lg md:text-xl leading-relaxed">
              Born from a passion for automotive excellence and streetwear culture,
              JUSTFITS creates premium headwear that celebrates the world&apos;s most
              iconic automobiles.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-display text-3xl md:text-4xl text-black mb-6">
                WHERE PASSION MEETS STYLE
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  JUSTFITS was founded in 2024 with a simple mission: to create
                  premium headwear that allows car enthusiasts to wear their
                  passion proudly.
                </p>
                <p>
                  We understand that for many, cars are more than just machines.
                  They&apos;re works of art, feats of engineering, and symbols of
                  dreams fulfilled. From the curves of a Porsche 911 to the raw
                  power of a GT-R, every vehicle tells a story.
                </p>
                <p>
                  Our designs capture the essence of these automotive icons,
                  translating their spirit into wearable art. Each cap is
                  carefully crafted using premium materials, ensuring both style
                  and comfort for the modern enthusiast.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square bg-gray-100 rounded-3xl overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="font-display text-6xl text-gray-400">JF</span>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-black rounded-2xl flex items-center justify-center">
                <span className="font-display text-white text-xl">EST. 2024</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl text-black mb-4">
              WHAT DRIVES US
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our core values shape everything we do, from design to delivery.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                variants={fadeInUp}
                custom={index}
                className="bg-white rounded-2xl p-8 shadow-sm text-center"
              >
                <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center mx-auto mb-6">
                  <value.icon size={24} className="text-white" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-black mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                custom={index}
                className="text-center"
              >
                <p className="font-display text-4xl md:text-5xl text-black mb-2">
                  {stat.value}
                </p>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="font-display text-3xl md:text-4xl text-white mb-4">
              JOIN THE MOVEMENT
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Be part of a growing community of automotive enthusiasts who wear
              their passion with pride.
            </p>
            <a
              href="/shop"
              className="inline-block bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition-colors"
            >
              Shop the Collection
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
