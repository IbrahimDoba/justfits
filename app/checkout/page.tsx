'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Input, Select } from '@/components/ui/Input'
import { ProductImagePlaceholder } from '@/components/ui/ProductImagePlaceholder'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/components/ui/Toast'
import { formatPrice } from '@/lib/data/products'
import { ArrowLeft, Lock, Truck, CreditCard, ShieldCheck } from 'lucide-react'

const nigerianStates = [
  { value: '', label: 'Select State' },
  { value: 'lagos', label: 'Lagos' },
  { value: 'abuja', label: 'Abuja (FCT)' },
  { value: 'rivers', label: 'Rivers' },
  { value: 'kano', label: 'Kano' },
  { value: 'oyo', label: 'Oyo' },
  { value: 'kaduna', label: 'Kaduna' },
  { value: 'ogun', label: 'Ogun' },
  { value: 'enugu', label: 'Enugu' },
  { value: 'delta', label: 'Delta' },
  { value: 'anambra', label: 'Anambra' },
  { value: 'edo', label: 'Edo' },
  { value: 'imo', label: 'Imo' },
  { value: 'kwara', label: 'Kwara' },
  { value: 'osun', label: 'Osun' },
  { value: 'ondo', label: 'Ondo' },
  { value: 'akwa-ibom', label: 'Akwa Ibom' },
  { value: 'cross-river', label: 'Cross River' },
  { value: 'abia', label: 'Abia' },
  { value: 'ekiti', label: 'Ekiti' },
  { value: 'other', label: 'Other' },
]

interface FormData {
  email: string
  firstName: string
  lastName: string
  phone: string
  address: string
  city: string
  state: string
  postalCode: string
}

interface FormErrors {
  [key: string]: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalItems, totalPrice, clearCart } = useCart()
  const { showToast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const shippingCost = totalPrice >= 50000 ? 0 : 3500
  const orderTotal = totalPrice + shippingCost

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.firstName) newErrors.firstName = 'First name is required'
    if (!formData.lastName) newErrors.lastName = 'Last name is required'

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^(\+234|0)[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Nigerian phone number'
    }

    if (!formData.address) newErrors.address = 'Address is required'
    if (!formData.city) newErrors.city = 'City is required'
    if (!formData.state) newErrors.state = 'State is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      showToast('Please fill in all required fields', 'error')
      return
    }

    if (items.length === 0) {
      showToast('Your cart is empty', 'error')
      return
    }

    setIsProcessing(true)

    try {
      // Prepare order data
      const orderData = {
        email: formData.email,
        phone: formData.phone,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        items: items.map(item => ({
          productSlug: item.product.slug,
          productName: item.product.name,
          size: item.size,
          quantity: item.quantity,
          price: item.product.price,
        })),
        subtotal: totalPrice,
        shippingCost: shippingCost,
        total: orderTotal,
      }

      // Send order to API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order')
      }

      // Clear cart and show success
      clearCart()
      showToast('Order placed successfully!', 'success')

      // Redirect to success page with order number
      router.push(`/checkout/success?order=${data.order.orderNumber}`)
    } catch (error) {
      console.error('Checkout error:', error)
      showToast(error instanceof Error ? error.message : 'Payment failed. Please try again.', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  // Redirect if cart is empty
  if (items.length === 0 && typeof window !== 'undefined') {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-32 pb-20">
          <div className="container mx-auto px-6 text-center">
            <h1 className="font-display text-4xl text-black mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some items to your cart to checkout</p>
            <Link
              href="/shop"
              className="inline-block bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="pt-24 pb-4 bg-white border-b border-gray-100">
        <div className="container mx-auto px-6">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Cart
          </Link>
        </div>
      </div>

      {/* Checkout Content */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left Column - Form */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="font-display text-3xl md:text-4xl text-black mb-8">
                  CHECKOUT
                </h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Contact Information */}
                  <div>
                    <h2 className="font-heading font-semibold text-lg text-black mb-4 flex items-center gap-2">
                      <span className="w-7 h-7 bg-black text-white text-sm rounded-full flex items-center justify-center">
                        1
                      </span>
                      Contact Information
                    </h2>
                    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
                      <Input
                        label="Email Address"
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        error={errors.email}
                        required
                      />
                      <Input
                        label="Phone Number"
                        type="tel"
                        name="phone"
                        placeholder="+234 800 000 0000"
                        value={formData.phone}
                        onChange={handleInputChange}
                        error={errors.phone}
                        helperText="We'll send order updates via SMS"
                        required
                      />
                    </div>
                  </div>

                  {/* Shipping Information */}
                  <div>
                    <h2 className="font-heading font-semibold text-lg text-black mb-4 flex items-center gap-2">
                      <span className="w-7 h-7 bg-black text-white text-sm rounded-full flex items-center justify-center">
                        2
                      </span>
                      Shipping Address
                    </h2>
                    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="First Name"
                          name="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          error={errors.firstName}
                          required
                        />
                        <Input
                          label="Last Name"
                          name="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          error={errors.lastName}
                          required
                        />
                      </div>
                      <Input
                        label="Street Address"
                        name="address"
                        placeholder="123 Main Street, Apartment 4B"
                        value={formData.address}
                        onChange={handleInputChange}
                        error={errors.address}
                        required
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="City"
                          name="city"
                          placeholder="Lagos"
                          value={formData.city}
                          onChange={handleInputChange}
                          error={errors.city}
                          required
                        />
                        <Select
                          label="State"
                          name="state"
                          options={nigerianStates}
                          value={formData.state}
                          onChange={handleInputChange}
                          error={errors.state}
                          required
                        />
                      </div>
                      <Input
                        label="Postal Code"
                        name="postalCode"
                        placeholder="100001"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        error={errors.postalCode}
                        helperText="Optional"
                      />
                    </div>
                  </div>

                  {/* Payment Section */}
                  <div>
                    <h2 className="font-heading font-semibold text-lg text-black mb-4 flex items-center gap-2">
                      <span className="w-7 h-7 bg-black text-white text-sm rounded-full flex items-center justify-center">
                        3
                      </span>
                      Payment
                    </h2>
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-4">
                        <CreditCard size={24} className="text-gray-600" />
                        <div>
                          <p className="font-medium text-black">Pay with Card</p>
                          <p className="text-sm text-gray-500">
                            Secure payment via Paystack
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <Lock size={14} />
                        Your payment information is encrypted and secure
                      </p>
                    </div>
                  </div>

                  {/* Submit Button - Mobile */}
                  <div className="lg:hidden">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className={`
                        w-full py-4 px-6 rounded-full font-medium text-base transition-all
                        flex items-center justify-center gap-3
                        ${isProcessing
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-black text-white hover:bg-gray-800'
                        }
                      `}
                    >
                      {isProcessing ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock size={18} />
                          Pay {formatPrice(orderTotal)}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>

            {/* Right Column - Order Summary */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:sticky lg:top-28"
              >
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="font-heading font-semibold text-lg text-black mb-6">
                    Order Summary
                  </h2>

                  {/* Cart Items */}
                  <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                          <ProductImagePlaceholder variant={item.product.variant} />
                          <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-black text-sm truncate">
                            {item.product.name}
                          </p>
                          {item.size && (
                            <p className="text-xs text-gray-500">Size: {item.size}</p>
                          )}
                        </div>
                        <p className="font-mono text-sm text-black">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                      <span className="font-mono text-black">{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-mono text-black">
                        {shippingCost === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          formatPrice(shippingCost)
                        )}
                      </span>
                    </div>
                    <div className="border-t border-gray-100 pt-3 flex justify-between">
                      <span className="font-semibold text-black">Total</span>
                      <span className="font-mono text-xl font-semibold text-black">
                        {formatPrice(orderTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Free Shipping Progress */}
                  {totalPrice < 50000 && (
                    <div className="mt-4 p-3 bg-amber-50 rounded-xl">
                      <p className="text-xs text-amber-800">
                        Add {formatPrice(50000 - totalPrice)} more for free shipping
                      </p>
                    </div>
                  )}

                  {/* Submit Button - Desktop */}
                  <div className="hidden lg:block mt-6">
                    <button
                      type="submit"
                      form="checkout-form"
                      onClick={handleSubmit}
                      disabled={isProcessing}
                      className={`
                        w-full py-4 px-6 rounded-full font-medium text-base transition-all
                        flex items-center justify-center gap-3
                        ${isProcessing
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-black text-white hover:bg-gray-800'
                        }
                      `}
                    >
                      {isProcessing ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock size={18} />
                          Pay {formatPrice(orderTotal)}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <ShieldCheck size={18} className="text-green-600" />
                      <span>Secure checkout</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Truck size={18} className="text-black" />
                      <span>Delivery within 3-5 business days</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
