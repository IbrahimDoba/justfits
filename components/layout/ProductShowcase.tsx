"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { ArrowUpRight } from "lucide-react";

const products = [
  {
    id: 1,
    name: "BMW Classic Black",
    price: "$59",
    image: "/justfits/bbmw1.png",
    size: "large",
  },
  {
    id: 2,
    name: "Mercedes-Benz Signature",
    price: "$59",
    image: "/justfits/blackbenzcap1.png",
    size: "medium",
  },
  {
    id: 3,
    name: "Benz White Edition",
    price: "$59",
    image: "/justfits/wbenzcap1.png",
    size: "medium",
  },
  {
    id: 4,
    name: "BMW Midnight",
    price: "$59",
    image: "/justfits/bbmw2.png",
    size: "small",
  },
  {
    id: 5,
    name: "Benz Cream Classic",
    price: "$59",
    image: "/justfits/cbenz1.png",
    size: "small",
  },
  {
    id: 6,
    name: "Mercedes Pure White",
    price: "$59",
    image: "/justfits/wwbenz1.png",
    size: "large",
  },
  {
    id: 7,
    name: "BMW Heritage",
    price: "$59",
    image: "/justfits/bbmw3.jpg",
    size: "medium",
  },
  {
    id: 8,
    name: "Mercedes Urban",
    price: "$59",
    image: "/justfits/blackbenzcap2.png",
    size: "medium",
  },
];

export function ProductShowcase() {
  return (
    <section className="relative py-24 md:py-32 bg-white overflow-hidden">
      {/* Section Header */}
      <div className="container px-6 mb-16">
        <ScrollReveal direction="up">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="flex-1">
              <p className="text-sm font-body uppercase tracking-[0.3em] text-black/40 mb-4">
                The Collection
              </p>
              <h2 className="font-script text-4xl md:text-5xl lg:text-6xl italic text-black">
                Caps That Define Your Drive
              </h2>
            </div>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 text-sm font-body uppercase tracking-wider text-black/50 hover:text-black transition-colors shrink-0"
            >
              View All
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </ScrollReveal>
      </div>

      {/* Bento Grid */}
      <div className="container px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Large Card - BMW Classic */}
          <ScrollReveal
            direction="up"
            delay={0.1}
            className="lg:col-span-2 lg:row-span-2"
          >
            <ProductCard product={products[0]} variant="large" />
          </ScrollReveal>

          {/* Medium Card */}
          <ScrollReveal direction="up" delay={0.2}>
            <ProductCard product={products[1]} variant="medium" />
          </ScrollReveal>

          {/* Medium Card */}
          <ScrollReveal direction="up" delay={0.3}>
            <ProductCard product={products[2]} variant="medium" />
          </ScrollReveal>

          {/* Small Card */}
          <ScrollReveal direction="up" delay={0.4}>
            <ProductCard product={products[3]} variant="small" />
          </ScrollReveal>

          {/* Small Card */}
          <ScrollReveal direction="up" delay={0.5}>
            <ProductCard product={products[4]} variant="small" />
          </ScrollReveal>

          {/* Large Card - Bottom */}
          <ScrollReveal direction="up" delay={0.6} className="md:col-span-2">
            <ProductCard product={products[5]} variant="wide" />
          </ScrollReveal>

          {/* Medium Card - BMW Heritage */}
          <ScrollReveal direction="up" delay={0.7}>
            <ProductCard product={products[6]} variant="medium" />
          </ScrollReveal>

          {/* Medium Card - Mercedes Urban */}
          <ScrollReveal direction="up" delay={0.8}>
            <ProductCard product={products[7]} variant="medium" />
          </ScrollReveal>
        </div>
      </div>

      {/* Editorial Quote */}
      <div className="container px-6 mt-24">
        <ScrollReveal direction="up">
          <div className="mx-auto text-center max-w-3xl">
            <p className="font-script text-2xl md:text-3xl italic text-black/50 leading-relaxed">
              &ldquo;Every cap tells a story of craftsmanship, precision, and
              the relentless pursuit of excellence.&rdquo;
            </p>
            <p className="mt-6 text-sm font-body uppercase tracking-wider text-black/30">
              — JustFits Design Philosophy
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: string;
    image: string;
  };
  variant: "large" | "medium" | "small" | "wide";
}

function ProductCard({ product, variant }: ProductCardProps) {
  const aspectRatio = {
    large: "aspect-[4/5]",
    medium: "aspect-[4/5]",
    small: "aspect-[4/5]",
    wide: "aspect-[2/1]",
  }[variant];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={`group relative ${aspectRatio} bg-gray-100 rounded-lg overflow-hidden cursor-pointer w-full h-full`}
    >
      {/* Product Image */}
      <Image
        src={product.image}
        alt={product.name}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

      {/* Content */}
      <div className="absolute inset-0 z-20 p-6 flex flex-col justify-end">
        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-body text-lg font-medium text-white mb-1">
            {product.name}
          </h3>
          <p className="text-sm text-white/70">{product.price}</p>
        </div>

        {/* Add to Cart Button - Appears on Hover */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ scale: 1.02 }}
          className="mt-4 py-3 px-6 bg-white text-black text-sm font-body font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0"
        >
          Add to Cart
        </motion.button>
      </div>
    </motion.div>
  );
}
