"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/Input";
import { formatPrice } from "@/lib/utils/format";
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  ShoppingBag,
} from "lucide-react";

interface OrderItem {
  product: string;
  variant: string;
  size: string | null;
  color: string | null;
  quantity: number;
  price: number;
}

interface TrackingResult {
  orderNumber: string;
  status: string;
  placedAt: string;
  lastUpdated: string;
  payment: {
    status: string;
    method: string;
    paidAt: string | null;
  } | null;
  items: OrderItem[];
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    country: string;
  };
  notes: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: {
    label: "Order Placed",
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    icon: <Clock size={18} />,
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "text-blue-600 bg-blue-50 border-blue-200",
    icon: <CheckCircle size={18} />,
  },
  PROCESSING: {
    label: "Processing",
    color: "text-purple-600 bg-purple-50 border-purple-200",
    icon: <Package size={18} />,
  },
  SHIPPED: {
    label: "Shipped",
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    icon: <Truck size={18} />,
  },
  DELIVERED: {
    label: "Delivered",
    color: "text-green-600 bg-green-50 border-green-200",
    icon: <CheckCircle size={18} />,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-red-600 bg-red-50 border-red-200",
    icon: <XCircle size={18} />,
  },
};

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get("order") || "");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-lookup if params are pre-filled (e.g. coming from email link)
  useEffect(() => {
    if (searchParams.get("order") && searchParams.get("email")) {
      handleLookup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLookup = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!orderNumber.trim() || !email.trim()) {
      setError("Please enter your order number and email address.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(
        `/api/orders/lookup?orderNumber=${encodeURIComponent(orderNumber.trim())}&email=${encodeURIComponent(email.trim().toLowerCase())}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Order not found. Please check your details.");
        return;
      }

      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const statusInfo = result ? (statusConfig[result.status] ?? statusConfig.PENDING) : null;

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-10">
              <h1 className="font-display text-4xl md:text-5xl text-black mb-3">
                TRACK ORDER
              </h1>
              <p className="text-gray-500">
                Enter your order number and email to check your order status.
              </p>
            </div>

            {/* Lookup Form */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
              <form onSubmit={handleLookup} className="space-y-4">
                <Input
                  label="Order Number"
                  placeholder="JF-XXXXXXXX-XXXX"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                {error && (
                  <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black text-white py-3 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Search size={18} />
                      Track Order
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Result */}
            {result && statusInfo && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                {/* Status Header */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Order Number</p>
                      <p className="font-mono font-semibold text-lg">{result.orderNumber}</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${statusInfo.color}`}
                    >
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-3">
                    Placed on{" "}
                    {new Date(result.placedAt).toLocaleDateString("en-NG", {
                      dateStyle: "long",
                    })}
                  </p>
                </div>

                {/* Items */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="font-heading font-semibold text-sm text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <ShoppingBag size={15} />
                    Items Ordered
                  </h2>
                  <div className="space-y-3">
                    {result.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-medium text-sm">{item.product}</p>
                          <p className="text-xs text-gray-400">
                            {[item.size, item.color].filter(Boolean).join(" · ")} × {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium whitespace-nowrap">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal</span>
                      <span>{formatPrice(result.totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Shipping</span>
                      <span>
                        {result.totals.shipping === 0 ? "Free" : formatPrice(result.totals.shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold text-base pt-1">
                      <span>Total</span>
                      <span>{formatPrice(result.totals.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="font-heading font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <MapPin size={15} />
                    Delivering To
                  </h2>
                  <p className="text-sm leading-relaxed">
                    <span className="font-medium">{result.shippingAddress.name}</span>
                    <br />
                    {result.shippingAddress.street}
                    <br />
                    {result.shippingAddress.city}, {result.shippingAddress.state}
                    <br />
                    {result.shippingAddress.country}
                  </p>
                </div>

                {/* Payment */}
                {result.payment && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="font-heading font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">
                      Payment
                    </h2>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Method</span>
                      <span className="font-medium capitalize">
                        {result.payment.method.replace("_", " ").toLowerCase()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1.5">
                      <span className="text-gray-500">Status</span>
                      <span
                        className={`font-medium ${
                          result.payment.status === "COMPLETED"
                            ? "text-green-600"
                            : result.payment.status === "FAILED"
                            ? "text-red-500"
                            : "text-yellow-600"
                        }`}
                      >
                        {result.payment.status.charAt(0) + result.payment.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </div>
                )}

                <p className="text-center text-sm text-gray-400">
                  Questions about your order?{" "}
                  <a href="mailto:support@justfits.com" className="underline text-black">
                    Contact us
                  </a>
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense>
      <TrackOrderContent />
    </Suspense>
  );
}
