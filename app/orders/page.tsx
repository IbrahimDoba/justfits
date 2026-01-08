"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  ShoppingBag,
  ChevronRight,
  XCircle,
  RefreshCw,
} from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  price: string;
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
    city: string;
    state: string;
  };
}

const statusConfig = {
  PENDING: {
    icon: Clock,
    color: "text-yellow-600 bg-yellow-50",
    label: "Pending",
  },
  CONFIRMED: {
    icon: CheckCircle,
    color: "text-blue-600 bg-blue-50",
    label: "Confirmed",
  },
  PROCESSING: {
    icon: Package,
    color: "text-blue-600 bg-blue-50",
    label: "Processing",
  },
  SHIPPED: {
    icon: Truck,
    color: "text-purple-600 bg-purple-50",
    label: "Shipped",
  },
  DELIVERED: {
    icon: CheckCircle,
    color: "text-green-600 bg-green-50",
    label: "Delivered",
  },
  CANCELLED: {
    icon: XCircle,
    color: "text-red-600 bg-red-50",
    label: "Cancelled",
  },
  REFUNDED: {
    icon: RefreshCw,
    color: "text-gray-600 bg-gray-50",
    label: "Refunded",
  },
};

type OrderStatus = keyof typeof statusConfig;

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">(
    "all"
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/orders");

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not authenticated
  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <section className="pt-32 pb-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3" />
                <div className="h-12 bg-gray-200 rounded-xl" />
                <div className="h-40 bg-gray-200 rounded-2xl" />
                <div className="h-40 bg-gray-200 rounded-2xl" />
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/login?callbackUrl=/orders");
    return null;
  }

  // Filter orders based on active tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    if (activeTab === "active")
      return ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"].includes(
        order.status
      );
    if (activeTab === "completed")
      return ["DELIVERED", "CANCELLED", "REFUNDED"].includes(order.status);
    return true;
  });

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
    });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="font-display text-4xl text-black mb-2">
                MY ORDERS
              </h1>
              <p className="text-gray-600">Track and manage your orders</p>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                {error}
                <button
                  onClick={fetchOrders}
                  className="ml-4 underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-8 bg-white rounded-xl p-1.5 shadow-sm">
              {[
                { id: "all", label: "All Orders" },
                { id: "active", label: "Active" },
                { id: "completed", label: "Completed" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-black text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Orders List */}
            {filteredOrders.length > 0 ? (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const statusInfo =
                    statusConfig[order.status as OrderStatus] ||
                    statusConfig.PENDING;
                  const StatusIcon = statusInfo.icon;

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl p-6 shadow-sm"
                    >
                      {/* Order Header */}
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                        <div>
                          <p className="font-semibold text-black">
                            {order.orderNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusInfo.color}`}
                        >
                          <StatusIcon size={16} />
                          <span className="text-sm font-medium">
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-3 mb-4">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-4"
                          >
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 relative">
                              {item.variant?.product?.images?.[0]?.url ? (
                                <img
                                  src={item.variant.product.images[0].url}
                                  alt={item.variant.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package
                                    size={24}
                                    className="text-gray-400"
                                  />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-black">
                                {item.variant?.product?.name ||
                                  item.variant?.name ||
                                  "Product"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {item.variant?.size &&
                                  `Size: ${item.variant.size}`}
                                {item.variant?.size &&
                                  item.variant?.color &&
                                  " | "}
                                {item.variant?.color &&
                                  `Color: ${item.variant.color}`}
                                {" | "}Qty: {item.quantity}
                              </p>
                            </div>
                            <p className="font-medium text-black">
                              {formatPrice(item.price)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Shipping Address */}
                      {order.shippingAddress && (
                        <div className="text-sm text-gray-500 mb-4">
                          <span className="font-medium text-gray-700">
                            Ship to:{" "}
                          </span>
                          {order.shippingAddress.firstName}{" "}
                          {order.shippingAddress.lastName},{" "}
                          {order.shippingAddress.city},{" "}
                          {order.shippingAddress.state}
                        </div>
                      )}

                      {/* Order Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="text-xl font-semibold text-black">
                            {formatPrice(order.total)}
                          </p>
                        </div>
                        <Link
                          href={`/orders/${order.id}`}
                          className="flex items-center gap-2 text-black hover:underline"
                        >
                          View Details
                          <ChevronRight size={16} />
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">
                  No orders yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Looks like you haven&apos;t placed any orders yet.
                  <br />
                  Start shopping to see your orders here.
                </p>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                >
                  Start Shopping
                  <ChevronRight size={18} />
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
