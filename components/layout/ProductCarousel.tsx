"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  image: string | null;
  inStock: boolean;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);
}

export function ProductCarousel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products?featured=true&limit=6");
        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50">
        <div className="container px-6 flex justify-center items-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50">
      <div className="container px-6">
        {/* Horizontal Scrolling Products */}
        <ScrollReveal direction="up">
          <div className="relative">
            <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  title={product.name}
                  price={formatPrice(product.price)}
                  compareAtPrice={
                    product.compareAtPrice
                      ? formatPrice(product.compareAtPrice)
                      : undefined
                  }
                  slug={product.slug}
                  image={product.image}
                  inStock={product.inStock}
                />
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* View All Button */}
        <ScrollReveal direction="up" delay={0.2}>
          <div className="flex justify-center mt-12">
            <Link href="/shop">
              <Button variant="primary" size="lg">
                VIEW ALL PRODUCTS
              </Button>
            </Link>
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
  );
}
