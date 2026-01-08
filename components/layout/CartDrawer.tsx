'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/data/products'
import { ProductImagePlaceholder } from '@/components/ui/ProductImagePlaceholder'

const drawerVariants = {
  closed: {
    x: '100%',
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 40,
    },
  },
  open: {
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 40,
    },
  },
}

const backdropVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
}

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1 },
  }),
  exit: { opacity: 0, x: -20 },
}

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    totalItems,
    totalPrice,
  } = useCart()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            variants={drawerVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <ShoppingBag size={22} className="text-black" />
                <h2 className="font-display text-xl text-black tracking-wide">YOUR CART</h2>
                {totalItems > 0 && (
                  <span className="bg-black text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                    {totalItems}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close cart"
              >
                <X size={22} className="text-black" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-900 font-medium text-lg mb-2">Your cart is empty</p>
                  <p className="text-gray-500 text-sm mb-8 max-w-[240px]">
                    Add some premium caps to get started
                  </p>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="bg-black text-white px-8 py-3.5 rounded-full font-medium hover:bg-gray-800 transition-colors"
                  >
                    Browse Collection
                  </Link>
                </div>
              ) : (
                <div className="px-6 py-5 space-y-4">
                  <AnimatePresence mode="popLayout">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        custom={index}
                        layout
                        className="flex gap-4 bg-gray-50 rounded-2xl p-4"
                      >
                        {/* Product Image */}
                        <Link
                          href={`/products/${item.product.slug}`}
                          onClick={closeCart}
                          className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white"
                        >
                          <ProductImagePlaceholder variant={item.product.variant} />
                        </Link>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0 flex flex-col">
                          <Link
                            href={`/products/${item.product.slug}`}
                            onClick={closeCart}
                            className="font-heading font-semibold text-black text-sm truncate hover:text-gray-700 transition-colors"
                          >
                            {item.product.name}
                          </Link>
                          {item.size && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              Size: {item.size}
                            </p>
                          )}
                          <p className="font-mono text-sm font-medium text-black mt-1">
                            {formatPrice(item.product.price)}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-auto pt-3">
                            <div className="flex items-center bg-white rounded-full border border-gray-200">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.size,
                                    item.quantity - 1
                                  )
                                }
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors text-black"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-8 text-center text-sm font-medium text-black">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.size,
                                    item.quantity + 1
                                  )
                                }
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors text-black"
                                aria-label="Increase quantity"
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.product.id, item.size)}
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                              aria-label="Remove item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 px-6 py-5 bg-gray-50">
                {/* Subtotal */}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-600 text-sm">Subtotal</span>
                  <span className="font-mono text-lg font-semibold text-black">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-5">
                  Shipping and taxes calculated at checkout
                </p>

                {/* Actions */}
                <div className="space-y-3">
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="block w-full text-center py-3.5 px-6 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                  >
                    Checkout
                  </Link>
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="block w-full text-center py-3 px-6 text-gray-600 hover:text-black transition-colors text-sm"
                  >
                    View Cart
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
