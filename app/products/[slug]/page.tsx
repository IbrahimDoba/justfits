"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductImagePlaceholder } from "@/components/ui/ProductImagePlaceholder";
import { ProductCard } from "@/components/ui/ProductCard";
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
  Loader2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/components/ui/Toast";

interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  size: string;
  color: string;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  category: string;
  categorySlug: string;
  sizes: string[];
  inStock: boolean;
  featured: boolean;
  variants: ProductVariant[];
  avgRating: number;
  reviewCount: number;
}

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  category: string;
  inStock: boolean;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

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

  // Fetch product data
  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            setNotFoundState(true);
            return;
          }
          throw new Error("Failed to fetch product");
        }
        const data = await res.json();
        setProduct(data.product);
        setRelatedProducts(data.relatedProducts || []);
      } catch (error) {
        console.error("Error fetching product:", error);
        setNotFoundState(true);
      } finally {
        setIsLoading(false);
      }
    }
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  // Reset quantity if it exceeds max stock when size changes
  // This hook must be before any conditional returns
  useEffect(() => {
    if (!product) return;
    const variant = selectedSize
      ? product.variants.find((v) => v.size === selectedSize)
      : product.variants[0];
    const stock = variant?.stockQuantity || 0;
    if (quantity > stock && stock > 0) {
      setQuantity(stock);
    }
  }, [product, selectedSize, quantity]);

  const isWishlisted = product ? isInWishlist(product.id) : false;

  if (notFoundState) {
    notFound();
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-32 flex justify-center items-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
        <Footer />
      </main>
    );
  }

  if (!product) {
    return null;
  }

  // Calculate max stock for selected variant (for rendering)
  const selectedVariant = selectedSize
    ? product.variants.find((v) => v.size === selectedSize)
    : product.variants[0];
  const maxStock = selectedVariant?.stockQuantity || 0;

  const handleAddToCart = () => {
    // If only one size, auto-select it
    const sizeToUse =
      product.sizes.length === 1 ? product.sizes[0] : selectedSize;

    if (!sizeToUse && product.sizes.length > 1) {
      showToast("Please select a size before adding to cart", "warning");
      return;
    }

    // Find the variant for the selected size
    const variant = product.variants.find((v) => v.size === sizeToUse);
    if (!variant || variant.stockQuantity < 1) {
      showToast("Selected size is out of stock", "error");
      return;
    }

    if (quantity > variant.stockQuantity) {
      showToast(`Only ${variant.stockQuantity} items available`, "error");
      setQuantity(variant.stockQuantity);
      return;
    }

    setIsAdding(true);

    // Create product object compatible with cart
    const cartProduct = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice || undefined,
      images: product.images,
      category: product.category,
      tags: [],
      sizes: product.sizes,
      inStock: product.inStock,
      featured: product.featured,
      variant: 1 as const,
    };

    setTimeout(() => {
      // Pass stockQuantity as maxStock
      addItem(cartProduct, quantity, sizeToUse, variant.stockQuantity);
      setIsAdding(false);
      setJustAdded(true);
      showToast(`${product.name} added to cart`, "success");

      setTimeout(() => setJustAdded(false), 2000);
    }, 300);
  };

  const handleToggleWishlist = () => {
    const wishlistProduct = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice || undefined,
      images: product.images,
      category: product.category,
      tags: [],
      sizes: product.sizes,
      inStock: product.inStock,
      featured: product.featured,
      variant: 1 as const,
    };

    if (isWishlisted) {
      removeFromWishlist(product.id);
      showToast(`${product.name} removed from wishlist`, "info");
    } else {
      addToWishlist(wishlistProduct);
      showToast(`${product.name} added to wishlist`, "success");
    }
  };

  const isOutOfStock = maxStock === 0;

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
                  {product.images.length > 0 ? (
                    <Image
                      src={product.images[selectedImage] || product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <ProductImagePlaceholder variant={1} />
                  )}
                </motion.div>

                {/* Thumbnail Gallery */}
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {product.images.slice(0, 4).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square rounded-xl overflow-hidden bg-white shadow transition-all duration-200 relative ${
                          selectedImage === index
                            ? "ring-2 ring-black opacity-100"
                            : "opacity-50 hover:opacity-80"
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          fill
                          sizes="100px"
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
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
                    {product.sizes.map((size) => {
                      const variant = product.variants.find(
                        (v) => v.size === size
                      );
                      const isAvailable = variant && variant.stockQuantity > 0;

                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          disabled={!isAvailable}
                          className={`
                            px-6 py-3 rounded-full text-sm font-medium transition-all duration-200
                            ${
                              selectedSize === size
                                ? "bg-black text-white"
                                : isAvailable
                                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                : "bg-gray-100 text-gray-300 cursor-not-allowed line-through"
                            }
                          `}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-black block">
                    Quantity
                  </span>
                  {maxStock > 0 && maxStock < 5 && (
                    <span className="text-xs font-medium text-red-600 animate-pulse">
                      Only {maxStock} left in stock!
                    </span>
                  )}
                </div>

                <div className="inline-flex items-center bg-gray-100 rounded-full">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-3 hover:bg-gray-200 rounded-full transition-colors text-black disabled:text-gray-400"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="px-6 font-medium text-black">
                    {isOutOfStock ? 0 : quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(maxStock, quantity + 1))
                    }
                    disabled={quantity >= maxStock || isOutOfStock}
                    className="p-3 hover:bg-gray-200 rounded-full transition-colors text-black disabled:text-gray-400"
                    aria-label="Increase quantity"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mb-8">
                <motion.button
                  whileHover={!isOutOfStock && !isAdding ? { scale: 1.02 } : {}}
                  whileTap={!isOutOfStock && !isAdding ? { scale: 0.98 } : {}}
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAdding}
                  className={`
                    flex-1 flex items-center justify-center gap-3 py-4 px-8 rounded-full font-medium text-base transition-all
                    ${
                      isOutOfStock
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
                  ) : isOutOfStock ? (
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
                  image={relatedProduct.image}
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
