"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  Copy,
  Edit,
  Loader2,
  Save,
} from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
  image: string | null;
}

interface OrderHistory {
  status: string;
  date: string;
  note: string;
}

interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string | null;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  trackingNumber: string | null;
  carrierName: string | null;
  internalNotes: string;
  createdAt: string;
  statusHistory: OrderHistory[];
}

const statusConfig: Record<
  string,
  { icon: typeof Clock; color: string; bgColor: string }
> = {
  pending: { icon: Clock, color: "text-yellow-600", bgColor: "bg-yellow-100" },
  processing: { icon: Package, color: "text-blue-600", bgColor: "bg-blue-100" },
  shipped: { icon: Truck, color: "text-purple-600", bgColor: "bg-purple-100" },
  delivered: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  cancelled: { icon: XCircle, color: "text-red-600", bgColor: "bg-red-100" },
};

const allStatuses = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Edit State
  const [notes, setNotes] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/admin/orders/${orderId}`);
        if (!response.ok) throw new Error("Failed to fetch order");
        const data = await response.json();
        setOrder(data.order);
        setNotes(data.order.internalNotes || "");
        setTrackingNumber(data.order.trackingNumber || "");
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      const data = await response.json();
      setOrder((prev) =>
        prev ? { ...prev, status: data.order.status } : null
      );
      setShowStatusDropdown(false);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveDetails = async () => {
    if (!order) return;
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, trackingNumber }),
      });

      if (!response.ok) throw new Error("Failed to save details");

      alert("Details saved successfully");
    } catch (err) {
      console.error("Error saving details:", err);
      alert("Failed to save details");
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>{error || "Order not found"}</p>
        <Link
          href="/admin/orders"
          className="mt-4 inline-block px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const StatusIcon = statusConfig[order.status]?.icon || Clock;
  const currentStatusIndex = allStatuses.indexOf(order.status);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={16} />
          Back to Orders
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-display tracking-tight text-gray-900">
              {order.id}
            </h1>
            <button
              onClick={() => copyToClipboard(order.id)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Copy Order ID"
            >
              <Copy size={16} className="text-gray-400" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                disabled={isUpdating}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium capitalize ${
                  statusConfig[order.status]?.bgColor
                } ${statusConfig[order.status]?.color}`}
              >
                <StatusIcon size={18} />
                {order.status}
                <Edit size={14} />
              </button>
              {showStatusDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10">
                  {allStatuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(status)}
                      className={`w-full px-4 py-2 text-left text-sm capitalize hover:bg-gray-50 ${
                        status === order.status
                          ? "font-medium text-black"
                          : "text-gray-600"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <p className="text-gray-500 mt-2">
          Placed on {formatDate(order.createdAt)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Order Timeline
            </h2>
            <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4">
              {allStatuses.slice(0, -1).map((status, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const Icon = statusConfig[status]?.icon || Clock;
                return (
                  <div key={status} className="flex-1 relative min-w-[80px]">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? isCurrent
                              ? statusConfig[status]?.bgColor
                              : "bg-green-100"
                            : "bg-gray-100"
                        }`}
                      >
                        <Icon
                          size={20}
                          className={
                            isCompleted
                              ? isCurrent
                                ? statusConfig[status]?.color
                                : "text-green-600"
                              : "text-gray-400"
                          }
                        />
                      </div>
                      <span
                        className={`mt-2 text-xs font-medium capitalize ${
                          isCompleted ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                    {index < allStatuses.length - 2 && (
                      <div
                        className={`hidden sm:block absolute top-5 left-[60%] right-0 h-0.5 ${
                          index < currentStatusIndex
                            ? "bg-green-500"
                            : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* History */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                History
              </h3>
              <div className="space-y-3">
                {order.statusHistory.map((entry, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5" />
                    <div>
                      <p className="text-sm text-gray-900 capitalize">
                        {entry.status}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(entry.date)} - {entry.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                >
                  <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden shrink-0 relative">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={24} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      Size: {item.size} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 mt-6 pt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">
                  {formatPrice(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="text-gray-900">
                  {formatPrice(order.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-100">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Internal Notes & Tracking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Tracking & Notes
              </h2>
              <button
                onClick={handleSaveDetails}
                disabled={isUpdating}
                className="text-blue-600 hover:text-blue-800"
              >
                <Save size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Enter tracking number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Internal Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  placeholder="Private notes for admins..."
                />
              </div>
            </div>
          </motion.div>

          {/* Customer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Customer
            </h2>
            <div className="space-y-3">
              <p className="font-medium text-gray-900">{order.customer.name}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={16} />
                {order.customer.email}
              </div>
              {order.customer.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={16} />
                  {order.customer.phone}
                </div>
              )}
            </div>
          </motion.div>

          {/* Shipping Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Shipping Address
            </h2>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin size={16} className="mt-0.5 shrink-0" />
              <div>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}
                </p>
                <p>
                  {order.shippingAddress.postalCode},{" "}
                  {order.shippingAddress.country}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
