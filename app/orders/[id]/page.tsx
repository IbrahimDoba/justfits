"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Phone,
  Mail,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Types matching the API response
interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  variant: {
    name: string;
    size: string;
    color: string;
    product: {
      name: string;
      slug: string;
      images: { url: string }[];
    };
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: string;
  shippingCost: string;
  tax: string;
  total: string;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
}

const statusConfig: Record<
  string,
  { icon: typeof Clock; color: string; bg: string; label: string }
> = {
  PENDING: {
    icon: Clock,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    label: "Pending",
  },
  CONFIRMED: {
    icon: CheckCircle,
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "Confirmed",
  },
  PROCESSING: {
    icon: Package,
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "Processing",
  },
  SHIPPED: {
    icon: Truck,
    color: "text-purple-600",
    bg: "bg-purple-50",
    label: "Shipped",
  },
  DELIVERED: {
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50",
    label: "Delivered",
  },
  CANCELLED: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    label: "Cancelled",
  },
  REFUNDED: {
    icon: RefreshCw,
    color: "text-gray-600",
    bg: "bg-gray-50",
    label: "Refunded",
  },
};

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/auth/login?callbackUrl=/orders/${orderId}`);
      return;
    }

    if (status === "authenticated" && orderId) {
      fetchOrder();
    }
  }, [status, orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/orders/${orderId}`);

      if (!response.ok) {
        if (response.status === 404) throw new Error("Order not found");
        throw new Error("Failed to load order details");
      }

      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      console.error("Error loading order:", err);
      setError("Failed to load order details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(numPrice);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-32 min-h-[60vh]">
          <Loader2 size={32} className="animate-spin text-gray-400" />
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-6 py-32 text-center">
          <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-sm">
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-display text-black mb-2">
              {error || "Order Not Found"}
            </h1>
            <p className="text-gray-600 mb-6">
              We couldn't find the details for this order. It may not exist or
              belongs to another account.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/orders"
                className="px-6 py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
              >
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const statusInfo = statusConfig[order.status] || statusConfig.PENDING;
  const StatusIcon = statusInfo.icon;

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          {/* Breadcrumb / Back Navigation */}
          <div className="max-w-5xl mx-auto mb-8">
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors"
            >
              <ArrowLeft size={16} />
              Back to My Orders
            </Link>
          </div>

          <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-8">
            {/* Left Column: Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <h1 className="font-display text-2xl md:text-3xl text-black">
                      Order #{order.orderNumber}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full self-start md:self-center ${statusInfo.bg} ${statusInfo.color}`}
                  >
                    <StatusIcon size={18} />
                    <span className="font-medium">{statusInfo.label}</span>
                  </div>
                </div>

                {/* Order Items */}
                <h2 className="font-heading font-semibold text-lg text-black mb-4">
                  Items
                </h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden shrink-0 relative border border-gray-100">
                        {item.variant.product.images &&
                        item.variant.product.images[0]?.url ? (
                          <img
                            src={item.variant.product.images[0].url}
                            alt={item.variant.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={24} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.variant.product.slug}`}
                          className="font-medium text-black truncate hover:underline block"
                        >
                          {item.variant.product.name}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.variant.size && `Size: ${item.variant.size}`}
                          {item.variant.color && ` • ${item.variant.color}`}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity}
                          </p>
                          <p className="font-medium text-black">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Payment Info (Simple Placeholder for now if needed, else skipped) */}
            </div>

            {/* Right Column: Summary & Address */}
            <div className="space-y-6">
              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <h2 className="font-heading font-semibold text-lg text-black mb-4">
                  Order Summary
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{formatPrice(order.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>{formatPrice(order.tax)}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between font-semibold text-lg text-black">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </motion.div>

              {/* Shipping Address */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="text-black mt-1" size={20} />
                  <h2 className="font-heading font-semibold text-lg text-black">
                    Shipping Address
                  </h2>
                </div>

                <div className="text-sm text-gray-600 space-y-1 pl-8">
                  <p className="font-medium text-black">
                    {order.shippingAddress.firstName}{" "}
                    {order.shippingAddress.lastName}
                  </p>
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>

                  {order.shippingAddress.phone && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                      <Phone size={14} />
                      <span>{order.shippingAddress.phone}</span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Contact Support */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center">
                <h3 className="font-medium text-black mb-2">Need Help?</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Have issues with your order? Contact our support team.
                </p>
                <Link
                  href="/contact"
                  className="text-sm font-medium text-black underline hover:text-gray-600"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
