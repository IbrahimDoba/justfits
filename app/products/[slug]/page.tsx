"use client";

import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductImagePlaceholder } from "@/components/ui/ProductImagePlaceholder";
import { ProductCard } from "@/components/ui/ProductCard";
import { getProductBySlug, products, formatPrice } from "@/lib/data/products";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Heart,
  Truck,
  Shield,
  RotateCcw,
  Check,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/components/ui/Toast";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const product = getProductBySlug(slug);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const { addItem } = useCart();
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlist();
  const { showToast } = useToast();
  const isWishlisted = product ? isInWishlist(product.id) : false;

  if (!product) {
    notFound();
  }

  // Get related products (same category, excluding current)
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    // If only one size, auto-select it
    const sizeToUse =
      product.sizes.length === 1 ? product.sizes[0] : selectedSize;

    if (!sizeToUse && product.sizes.length > 1) {
      showToast("Please select a size before adding to cart", "warning");
      return;
    }

    setIsAdding(true);

    // Simulate a brief delay for UX feedback
    setTimeout(() => {
      addItem(product, quantity, sizeToUse);
      setIsAdding(false);
      setJustAdded(true);
      showToast(`${product.name} added to cart`, "success");

      // Reset the "just added" state after 2 seconds
      setTimeout(() => setJustAdded(false), 2000);
    }, 300);
  };

  const handleToggleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
      showToast(`${product.name} removed from wishlist`, "info");
    } else {
      addToWishlist(product);
      showToast(`${product.name} added to wishlist`, "success");
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Breadcrumb */}
      <div className="pt-24 pb-4 bg-gray-50">
        <div className="container mx-auto px-6">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Shop
          </Link>
        </div>
      </div>

      {/* Product Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Product Images */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="sticky top-28">
                {/* Main Image */}
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="aspect-[4/5] rounded-3xl overflow-hidden bg-white shadow-lg mb-4"
                >
                  <ProductImagePlaceholder variant={product.variant} />
                </motion.div>

                {/* Thumbnail Gallery */}
                <div className="grid grid-cols-4 gap-3">
                  {[0, 1, 2, 3].map((index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-xl overflow-hidden bg-white shadow transition-all duration-200 ${
                        selectedImage === index
                          ? "ring-2 ring-black opacity-100"
                          : "opacity-50 hover:opacity-80"
                      }`}
                    >
                      <ProductImagePlaceholder variant={product.variant} />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col"
            >
              {/* Category */}
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">
                {product.category}
              </p>

              {/* Title */}
              <h1 className="font-display text-4xl md:text-5xl text-black tracking-tight mb-4">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-center gap-4 mb-6">
                <span className="font-mono text-2xl text-black">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="font-mono text-lg text-gray-400 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
                {product.compareAtPrice && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {Math.round(
                      (1 - product.price / product.compareAtPrice) * 100
                    )}
                    % OFF
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Size Selector */}
              {product.sizes.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-black">Size</span>
                    <button className="text-xs text-gray-500 underline hover:text-black">
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`
                          px-6 py-3 rounded-full text-sm font-medium transition-all duration-200
                          ${
                            selectedSize === size
                              ? "bg-black text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }
                        `}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-8">
                <span className="text-sm font-medium text-black block mb-3">
                  Quantity
                </span>
                <div className="inline-flex items-center bg-gray-100 rounded-full">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-200 rounded-full transition-colors text-black"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="px-6 font-medium text-black">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-200 rounded-full transition-colors text-black"
                    aria-label="Increase quantity"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mb-8">
                <motion.button
                  whileHover={
                    product.inStock && !isAdding ? { scale: 1.02 } : {}
                  }
                  whileTap={product.inStock && !isAdding ? { scale: 0.98 } : {}}
                  onClick={handleAddToCart}
                  disabled={!product.inStock || isAdding}
                  className={`
                    flex-1 flex items-center justify-center gap-3 py-4 px-8 rounded-full font-medium text-base transition-all
                    ${
                      !product.inStock
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : justAdded
                        ? "bg-green-600 text-white"
                        : "bg-black text-white hover:bg-gray-800"
                    }
                  `}
                >
                  {isAdding ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Adding...
                    </>
                  ) : justAdded ? (
                    <>
                      <Check size={20} />
                      Added to Cart
                    </>
                  ) : !product.inStock ? (
                    "Out of Stock"
                  ) : (
                    <>
                      <ShoppingBag size={20} />
                      Add to Cart
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleToggleWishlist}
                  className={`flex items-center justify-center gap-2 px-6 py-4 rounded-full border-2 font-medium transition-all duration-200 ${
                    isWishlisted
                      ? "border-red-500 bg-red-500 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-red-500 hover:text-red-500"
                  }`}
                  aria-label={
                    isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                  }
                >
                  <Heart
                    size={20}
                    fill={isWishlisted ? "currentColor" : "none"}
                  />
                  <span className="hidden sm:inline">
                    {isWishlisted ? "Saved" : "Wishlist"}
                  </span>
                </motion.button>
              </div>

              {/* Features */}
              <div className="border-t border-gray-200 pt-8 space-y-4">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <Truck size={20} className="text-black" />
                  <span>Free shipping on orders over ₦50,000</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <Shield size={20} className="text-black" />
                  <span>Premium quality guarantee</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <RotateCcw size={20} className="text-black" />
                  <span>30-day easy returns</span>
                </div>
              </div>

              {/* Tags */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <span className="text-sm font-medium text-black block mb-3">
                  Tags
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="font-display text-3xl md:text-4xl text-black text-center mb-12">
              YOU MAY ALSO LIKE
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  title={relatedProduct.name}
                  price={formatPrice(relatedProduct.price)}
                  slug={relatedProduct.slug}
                  variant={relatedProduct.variant}
                  inStock={relatedProduct.inStock}
                  layout="grid"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
