"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import RevenueChart from "@/components/admin/RevenueChart";

interface DashboardData {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    completedOrders: number;
    totalProducts: number;
    lowStockProducts: number;
    totalUsers: number;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customer: string;
    items: number;
    total: number;
    status: string;
    createdAt: string;
  }>;
  lowStockItems: Array<{
    name: string;
    stock: number;
    threshold: number;
  }>;
  revenueChart: Array<{
    name: string;
    value: number;
  }>;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateString: string) => {
  if (!dateString.includes("T")) return dateString;

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;

  return date.toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
  });
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/admin/dashboard");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>{error || "Something went wrong"}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Revenue",
      value: formatPrice(data.stats.totalRevenue),
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      label: "Orders Today",
      value: data.stats.totalOrders.toString(),
      icon: ShoppingBag,
      color: "bg-blue-500",
    },
    {
      label: "Pending Orders",
      value: data.stats.pendingOrders.toString(),
      icon: Package,
      color: "bg-yellow-500",
    },
    {
      label: "Total Customers",
      value: data.stats.totalUsers.toString(),
      icon: Users,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display tracking-tight text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Welcome back! Here&apos;s what&apos;s happening with your store.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}
              >
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Revenue Overview
        </h2>
        {data && <RevenueChart data={data.revenueChart} />}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
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
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  data.recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6 font-mono text-sm text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">
                        {order.customer}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {order.items}
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Low Stock Alert */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Low Stock</h2>
            </div>
            {data.lowStockItems.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">No low stock items</p>
            ) : (
              <div className="space-y-3">
                {data.lowStockItems.map((product) => (
                  <div
                    key={product.name}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <span
                      className="text-sm text-gray-700 truncate pr-4"
                      title={product.name}
                    >
                      {product.name}
                    </span>
                    <span className="text-sm font-medium text-red-600 whitespace-nowrap">
                      {product.stock} left
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/admin/products"
              className="block mt-4 text-center py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Manage Inventory →
            </Link>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Link
                href="/admin/products/new"
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <Package size={20} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Add New Product
                </span>
              </Link>
              <Link
                href="/admin/orders?status=pending"
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <ShoppingBag size={20} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  View Pending Orders
                </span>
              </Link>
              <Link
                href="/admin/categories"
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <TrendingUp size={20} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Manage Categories
                </span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
