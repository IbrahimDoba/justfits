"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Filter,
  Eye,
  Package,
  ChevronDown,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Order {
  id: string; // Order Number
  customer: {
    name: string;
    email: string;
  };
  items: number;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  shippingCity: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface OrderCounts {
  all: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [counts, setCounts] = useState<OrderCounts>({
    all: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: statusFilter,
      });

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch orders");

      const data = await response.json();
      setOrders(data.orders);
      setPagination(data.pagination);
      setCounts(data.counts);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, pagination.page]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display tracking-tight text-gray-900">
          Orders
        </h1>
        <p className="text-gray-500 mt-1">Manage and track customer orders</p>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(
          [
            "all",
            "pending",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
          ] as const
        ).map((status) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status);
              setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
              statusFilter === status
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {status} ({counts[status]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by order ID, name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
        {/* Additional filters could go here */}
      </div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <Package
                          size={48}
                          className="mx-auto text-gray-300 mb-4"
                        />
                        <p className="text-gray-500">No orders found</p>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <p className="font-mono text-sm font-medium text-gray-900">
                            {order.id}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.shippingCity}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm font-medium text-gray-900">
                            {order.customer.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.customer.email}
                          </p>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {order.items} {order.items === 1 ? "item" : "items"}
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-gray-900">
                          {formatPrice(order.total)}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                              statusColors[order.status] ||
                              "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Eye size={16} />
                              View
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {orders.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  of {pagination.total} orders
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm font-medium text-gray-900">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
