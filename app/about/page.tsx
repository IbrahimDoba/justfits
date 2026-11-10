'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { fadeInUp, staggerContainer } from '@/animations/variants'
import { Car, Award, Truck, Heart } from 'lucide-react'

const values = [
  {
    icon: Car,
    title: 'Automotive Passion',
    description:
      'Everything we stock comes from a love of cars and racing: the teams, the badges and the culture around them.',
  },
  {
    icon: Award,
    title: 'Picked with Care',
    description:
      'Every drop is picked by car and F1 fans, for car and F1 fans.',
  },
  {
    icon: Truck,
    title: 'Delivered Nationwide',
    description:
      'Order online or on WhatsApp and we deliver across Nigeria, with GUO pickup centers in many states.',
  },
  {
    icon: Heart,
    title: 'Made with Love',
    description:
      'Each piece is designed with attention to detail and care, because we wear them too.',
  },
]

// Real numbers only. Update as they grow.
const stats = [
  { value: '400+', label: 'Pieces Sold' },
  { value: '60+', label: 'Designs Dropped' },
  { value: '36 + FCT', label: 'States We Deliver To' },
  { value: '2024', label: 'Founded' },
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
              JUSTFITS is a Nigerian automotive and motorsport streetwear brand
              for people who live for cars and racing. F1 team shirts, polos,
              hoodies and caps, delivered anywhere in Nigeria.
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
                  JUSTFITS started in 2024 with car caps: Benz, BMW and AMG
                  badges. Today we carry a full range of motorsport and
                  automotive streetwear.
                </p>
                <p>
                  That means F1 team shirts, polos and driver tees from Scuderia
                  Ferrari, Mercedes-AMG Petronas, Red Bull Racing, McLaren and
                  Aston Martin, BMW M Motorsport pieces, and caps for every badge
                  in the garage.
                </p>
                <p>
                  Our goal is simple: make motorsport fashion easy to get in
                  Nigeria, for fans who want to rep their team beyond race
                  weekend. JUSTFITS. Fits just right.
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
              What we care about, from picking a drop to getting it to your door.
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
              Find your team, pick your badge, and rep it every day.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition-colors"
            >
              Shop the Collection
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
