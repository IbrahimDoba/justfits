"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface CatalogueProduct {
  name: string;
  brand: string | null;
  category: string;
  imageUrl: string | null;
  priceMin: number | null;
  priceMax: number | null;
  sizes: { size: string; quantity: number }[];
  inStock: boolean;
}

const naira = (n: number | null) =>
  n === null
    ? ""
    : new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 0,
      }).format(n);

const priceLabel = (p: CatalogueProduct) =>
  p.priceMin === null
    ? "—"
    : p.priceMin === p.priceMax
      ? naira(p.priceMin)
      : `${naira(p.priceMin)} – ${naira(p.priceMax)}`;

export default function CataloguePage() {
  const [products, setProducts] = useState<CatalogueProduct[]>([]);
  const [whatsapp, setWhatsapp] = useState("2348149113328");
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState<"ALL" | "CAP" | "SHIRT">("ALL");
  const [brand, setBrand] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/catalogue")
      .then((r) => r.json())
      .then((d) => {
        setProducts(Array.isArray(d.products) ? d.products : []);
        if (d.whatsapp) setWhatsapp(d.whatsapp);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const brands = useMemo(
    () =>
      Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).sort() as string[],
    [products]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter(
      (p) =>
        (cat === "ALL" || p.category === cat) &&
        (brand === "ALL" || p.brand === brand) &&
        (!q ||
          p.name.toLowerCase().includes(q) ||
          (p.brand || "").toLowerCase().includes(q))
    );
  }, [products, cat, brand, search]);

  const orderLink = (p: CatalogueProduct) =>
    `https://wa.me/${whatsapp}?text=${encodeURIComponent(
      `Hi JUSTFITS! I'd like to order: ${p.name}${
        p.priceMin ? ` (${priceLabel(p)})` : ""
      }`
    )}`;

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-10 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl sm:text-5xl tracking-wider"
          >
            THE CATALOGUE
          </motion.h1>
          <p className="text-gray-400 mt-3 max-w-lg mx-auto">
            Premium car-themed caps &amp; apparel. Tap any item to order on
            WhatsApp — we&apos;ll sort out your size, payment and delivery.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-0 z-30 bg-gray-50/90 backdrop-blur border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            {(["ALL", "CAP", "SHIRT"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  cat === c
                    ? "bg-black text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {c === "ALL" ? "All" : c === "CAP" ? "Caps" : "Shirts"}
              </button>
            ))}
          </div>

          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="px-3 py-2 text-sm rounded-full border border-gray-200 bg-white text-gray-700"
          >
            <option value="ALL">All brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <div className="relative ml-auto">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="pl-9 pr-3 py-2 text-sm rounded-full border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 w-40 sm:w-56"
            />
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="container mx-auto px-6 py-10">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            <Loader2 className="animate-spin" size={28} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            No products match your filters.
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-5">
              {filtered.length} product{filtered.length === 1 ? "" : "s"}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filtered.map((p) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg group flex flex-col"
                >
                  <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                    {p.imageUrl ? (
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        fill
                        sizes="(max-width:768px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                        No image
                      </div>
                    )}
                    {p.brand && (
                      <span className="absolute top-3 left-3 bg-white/90 text-gray-800 text-[10px] font-semibold px-2 py-1 rounded-full">
                        {p.brand}
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 leading-snug">
                      {p.name}
                    </h3>
                    <p className="text-base font-bold text-gray-900 mt-1">
                      {priceLabel(p)}
                    </p>
                    {p.sizes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {p.sizes.map((s) => (
                          <span
                            key={s.size}
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600"
                          >
                            {s.size}
                          </span>
                        ))}
                      </div>
                    )}
                    <a
                      href={orderLink(p)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto pt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      <WhatsAppIcon /> Order
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </section>

      <Footer />
    </main>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12 2a10 10 0 00-8.6 15.06L2 22l5.06-1.33A10 10 0 1012 2z" />
    </svg>
  );
}
