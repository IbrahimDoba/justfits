"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Package,
  Plus,
  Search,
  Sparkles,
  Loader2,
  Pencil,
  Trash2,
  X,
  FileText,
} from "lucide-react";

/* ------------------------------ types ------------------------------ */

type PaymentStatus = "PAID" | "PARTIAL" | "PENDING";

interface Sale {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string | null;
  productText: string;
  variantText: string | null;
  quantity: number;
  unitPrice: number;
  deliveryFee: number | null;
  deliveryPaidBy: string | null;
  location: string | null;
  totalCollected: number;
  profit: number | null;
  paymentStatus: PaymentStatus;
  notes: string | null;
  items?: SaleLineItem[];
}

interface SaleLineItem {
  id?: string;
  inventoryItemId: string | null;
  name: string;
  size: string | null;
  quantity: number;
  unitPrice: number;
  costPrice?: number | null;
}

interface InventoryOption {
  id: string;
  name: string;
  costPrice: number | null;
  size: string | null;
  sellingPrice: number | null;
  quantity: number;
}

interface Expense {
  id: string;
  date: string;
  category: string;
  description: string | null;
  amount: number;
  notes: string | null;
}

interface Summary {
  totals: {
    totalRevenue: number;
    totalProfit: number;
    totalExpenses: number;
    salesDeliveryFees: number;
    net: number;
    netByProfit: number;
    unitsSold: number;
    salesCount: number;
    expensesCount: number;
  };
  expensesByCategory: Array<{ category: string; amount: number }>;
  monthly: Array<{
    name: string;
    revenue: number;
    expenses: number;
    net: number;
  }>;
}

const EXPENSE_CATEGORIES = [
  "STOCK",
  "PACKAGING",
  "ADS",
  "DELIVERY",
  "LOSS",
  "RENT",
  "SALARIES",
  "FEES",
  "OTHER",
] as const;

const PAYMENT_STATUSES: PaymentStatus[] = ["PAID", "PARTIAL", "PENDING"];

/* ------------------------------ helpers ------------------------------ */

const naira = (n: number | null | undefined) =>
  n === null || n === undefined
    ? "—"
    : new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 0,
      }).format(n);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const toDateInput = (iso?: string) =>
  iso ? new Date(iso).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

const statusStyles: Record<PaymentStatus, string> = {
  PAID: "bg-green-100 text-green-800",
  PARTIAL: "bg-yellow-100 text-yellow-800",
  PENDING: "bg-red-100 text-red-800",
};

const categoryStyles: Record<string, string> = {
  STOCK: "bg-blue-100 text-blue-800",
  PACKAGING: "bg-purple-100 text-purple-800",
  ADS: "bg-pink-100 text-pink-800",
  DELIVERY: "bg-amber-100 text-amber-800",
  LOSS: "bg-red-100 text-red-800",
  RENT: "bg-teal-100 text-teal-800",
  SALARIES: "bg-indigo-100 text-indigo-800",
  FEES: "bg-orange-100 text-orange-800",
  OTHER: "bg-gray-100 text-gray-800",
};

type Tab = "overview" | "sales" | "expenses";

/* ------------------------------ page ------------------------------ */

export default function FinancePage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [search, setSearch] = useState("");

  const [saleModal, setSaleModal] = useState<{ open: boolean; edit?: Sale }>({
    open: false,
  });
  const [expenseModal, setExpenseModal] = useState<{
    open: boolean;
    edit?: Expense;
  }>({ open: false });

  const loadAll = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [s, sl, ex] = await Promise.all([
        fetch("/api/admin/finance/summary").then((r) => r.json()),
        fetch("/api/admin/finance/sales").then((r) => r.json()),
        fetch("/api/admin/finance/expenses").then((r) => r.json()),
      ]);
      // Only accept well-formed responses; a non-200 returns { error } instead.
      setSummary(s && s.totals ? s : null);
      setSales(Array.isArray(sl?.sales) ? sl.sales : []);
      setExpenses(Array.isArray(ex?.expenses) ? ex.expenses : []);
      if (!s || !s.totals) {
        setLoadError(s?.error || "Failed to load finance summary.");
      }
    } catch (e) {
      console.error("Failed to load finance data", e);
      setLoadError("Failed to load finance data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const filteredSales = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return sales;
    return sales.filter(
      (s) =>
        s.customerName.toLowerCase().includes(q) ||
        (s.customerPhone || "").toLowerCase().includes(q) ||
        s.productText.toLowerCase().includes(q) ||
        (s.variantText || "").toLowerCase().includes(q)
    );
  }, [sales, search]);

  const filteredExpenses = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return expenses;
    return expenses.filter(
      (e) =>
        (e.description || "").toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
    );
  }, [expenses, search]);

  const importHistorical = async () => {
    if (
      !confirm(
        "Import the historical spreadsheet records (31 sales + 26 expenses)? This only runs if the ledger is empty."
      )
    )
      return;
    setImporting(true);
    try {
      const res = await fetch("/api/admin/finance/import", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      alert(data.message || "Done");
      await loadAll();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const deleteSale = async (id: string) => {
    if (!confirm("Delete this sale? This cannot be undone.")) return;
    await fetch(`/api/admin/finance/sales/${id}`, { method: "DELETE" });
    loadAll();
  };

  const deleteExpense = async (id: string) => {
    if (!confirm("Delete this expense? This cannot be undone.")) return;
    await fetch(`/api/admin/finance/expenses/${id}`, { method: "DELETE" });
    loadAll();
  };

  const t = summary?.totals;

  return (
    <div className="light-theme p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet size={26} /> Finance
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Offline sales &amp; expenses ledger
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSaleModal({ open: true })}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800"
          >
            <Plus size={16} /> Sale
          </button>
          <button
            onClick={() => setExpenseModal({ open: true })}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-200"
          >
            <Plus size={16} /> Expense
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Revenue collected"
          value={naira(t?.totalRevenue)}
          sub={`${t?.salesCount ?? 0} sales · ${t?.unitsSold ?? 0} units`}
          icon={<TrendingUp className="text-green-600" size={20} />}
          loading={loading}
        />
        <StatCard
          label="Expenses"
          value={naira(t?.totalExpenses)}
          sub={`${t?.expensesCount ?? 0} entries · incl. ${naira(
            t?.salesDeliveryFees
          )} sales delivery`}
          icon={<TrendingDown className="text-red-600" size={20} />}
          loading={loading}
        />
        <StatCard
          label="Net (revenue − expenses)"
          value={naira(t?.net)}
          sub={(t?.net ?? 0) >= 0 ? "In profit" : "In deficit"}
          icon={<Wallet className="text-blue-600" size={20} />}
          loading={loading}
          highlight={(t?.net ?? 0) >= 0 ? "pos" : "neg"}
        />
        <StatCard
          label="Sales profit"
          value={naira(t?.totalProfit)}
          sub="Recorded profit on sales"
          icon={<Package className="text-purple-600" size={20} />}
          loading={loading}
        />
      </div>

      {/* Empty ledger — offer one-click historical import */}
      {!loading &&
        t &&
        t.salesCount === 0 &&
        t.expensesCount === 0 && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 px-4 py-4 rounded-xl bg-amber-50 border border-amber-200">
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Your ledger is empty
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Import your historical records from the spreadsheet (31 sales +
                26 expenses).
              </p>
            </div>
            <button
              onClick={importHistorical}
              disabled={importing}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50"
            >
              {importing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              Import historical data
            </button>
          </div>
        )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 mb-4">
        {(["overview", "sales", "expenses"] as Tab[]).map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
              tab === tb
                ? "border-black text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {tb}
          </button>
        ))}
      </div>

      {loadError && !loading && (
        <div className="mb-4 flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
          <span>{loadError}</span>
          <button
            onClick={loadAll}
            className="px-3 py-1 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">
          <Loader2 className="animate-spin" size={28} />
        </div>
      ) : tab === "overview" ? (
        <OverviewTab summary={summary} />
      ) : (
        <>
          {/* Search */}
          <div className="relative mb-4 max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${tab}…`}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>

          {tab === "sales" ? (
            <SalesTable
              sales={filteredSales}
              onEdit={(s) => setSaleModal({ open: true, edit: s })}
              onDelete={deleteSale}
            />
          ) : (
            <ExpensesTable
              expenses={filteredExpenses}
              onEdit={(e) => setExpenseModal({ open: true, edit: e })}
              onDelete={deleteExpense}
            />
          )}
        </>
      )}

      {saleModal.open && (
        <SaleModal
          edit={saleModal.edit}
          onClose={() => setSaleModal({ open: false })}
          onSaved={() => {
            setSaleModal({ open: false });
            loadAll();
          }}
        />
      )}
      {expenseModal.open && (
        <ExpenseModal
          edit={expenseModal.edit}
          onClose={() => setExpenseModal({ open: false })}
          onSaved={() => {
            setExpenseModal({ open: false });
            loadAll();
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------ stat card ------------------------------ */

function StatCard({
  label,
  value,
  sub,
  icon,
  loading,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  loading?: boolean;
  highlight?: "pos" | "neg";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        {icon}
      </div>
      <div
        className={`mt-2 text-xl font-bold ${
          highlight === "neg" ? "text-red-600" : "text-gray-900"
        }`}
      >
        {loading ? "…" : value}
      </div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </motion.div>
  );
}

/* ------------------------------ overview ------------------------------ */

function OverviewTab({ summary }: { summary: Summary | null }) {
  if (!summary) {
    return (
      <EmptyState label="No summary data available yet. Add a sale or expense to get started." />
    );
  }
  const monthly = summary.monthly ?? [];
  const byCategory = summary.expensesByCategory ?? [];
  const money = (v: number) =>
    v >= 1_000_000
      ? `₦${(v / 1_000_000).toFixed(1)}M`
      : v >= 1000
        ? `₦${(v / 1000).toFixed(0)}k`
        : `₦${v}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Revenue vs Expenses (monthly)
        </h3>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly} margin={{ top: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickFormatter={money}
              />
              <Tooltip
                formatter={(v) => naira(Number(v))}
                contentStyle={{ borderRadius: 8, border: "1px solid #f1f5f9" }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="revenue" name="Revenue" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Expenses by category
        </h3>
        <div className="space-y-3">
          {byCategory.map((c) => {
            const max = byCategory[0]?.amount || 1;
            return (
              <div key={c.category}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span
                    className={`px-2 py-0.5 rounded font-medium ${
                      categoryStyles[c.category] || categoryStyles.OTHER
                    }`}
                  >
                    {c.category}
                  </span>
                  <span className="text-gray-700 font-medium">{naira(c.amount)}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-800 rounded-full"
                    style={{ width: `${(c.amount / max) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
          {byCategory.length === 0 && (
            <p className="text-sm text-gray-400">No expenses yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ tables ------------------------------ */

function SalesTable({
  sales,
  onEdit,
  onDelete,
}: {
  sales: Sale[];
  onEdit: (s: Sale) => void;
  onDelete: (id: string) => void;
}) {
  if (sales.length === 0)
    return <EmptyState label="No sales found." />;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
            <Th>Date</Th>
            <Th>Customer</Th>
            <Th>Product</Th>
            <Th className="text-right">Qty</Th>
            <Th className="text-right">Unit</Th>
            <Th className="text-right">Delivery</Th>
            <Th className="text-right">Collected</Th>
            <Th className="text-right">Profit</Th>
            <Th>Status</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
              <Td className="whitespace-nowrap text-gray-600">{fmtDate(s.date)}</Td>
              <Td className="font-medium text-gray-900">
                {s.customerName}
                {s.customerPhone && (
                  <div className="text-[10px] font-normal text-gray-400">
                    {s.customerPhone}
                  </div>
                )}
                {s.location && (
                  <div className="text-[10px] font-normal text-gray-400">
                    {s.location}
                  </div>
                )}
              </Td>
              <Td className="max-w-[220px]">
                <div className="text-gray-900">{s.productText}</div>
                {s.variantText && (
                  <div className="text-xs text-gray-400 truncate">{s.variantText}</div>
                )}
              </Td>
              <Td className="text-right text-gray-700">{s.quantity}</Td>
              <Td className="text-right text-gray-700">{naira(s.unitPrice)}</Td>
              <Td className="text-right text-gray-500">
                {s.deliveryFee === null ? "—" : naira(s.deliveryFee)}
                {s.deliveryPaidBy && (
                  <div className="text-[10px] text-gray-400">{s.deliveryPaidBy}</div>
                )}
              </Td>
              <Td className="text-right font-medium text-gray-900">
                {naira(s.totalCollected)}
              </Td>
              <Td className="text-right text-gray-700">{naira(s.profit)}</Td>
              <Td>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${statusStyles[s.paymentStatus]}`}
                >
                  {s.paymentStatus}
                </span>
              </Td>
              <Td>
                <div className="flex items-center gap-1 justify-end">
                  <a
                    href={`/admin/finance/invoice/${s.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Create invoice"
                    className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded"
                  >
                    <FileText size={15} />
                  </a>
                  <button
                    onClick={() => onEdit(s)}
                    className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => onDelete(s.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExpensesTable({
  expenses,
  onEdit,
  onDelete,
}: {
  expenses: Expense[];
  onEdit: (e: Expense) => void;
  onDelete: (id: string) => void;
}) {
  if (expenses.length === 0) return <EmptyState label="No expenses found." />;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
            <Th>Date</Th>
            <Th>Category</Th>
            <Th>Description</Th>
            <Th className="text-right">Amount</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
              <Td className="whitespace-nowrap text-gray-600">{fmtDate(e.date)}</Td>
              <Td>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    categoryStyles[e.category] || categoryStyles.OTHER
                  }`}
                >
                  {e.category}
                </span>
              </Td>
              <Td className="text-gray-900">{e.description || "—"}</Td>
              <Td className="text-right font-medium text-gray-900">{naira(e.amount)}</Td>
              <Td>
                <RowActions onEdit={() => onEdit(e)} onDelete={() => onDelete(e.id)} />
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const Th = ({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) => <th className={`px-4 py-3 font-medium ${className}`}>{children}</th>;

const Td = ({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) => <td className={`px-4 py-3 ${className}`}>{children}</td>;

function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-1 justify-end">
      <button
        onClick={onEdit}
        className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded"
      >
        <Pencil size={15} />
      </button>
      <button
        onClick={onDelete}
        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="bg-white border border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-400 text-sm">
      {label}
    </div>
  );
}

/* ------------------------------ AI compose ------------------------------ */

function AiCompose({
  kind,
  onDraft,
}: {
  kind: "sale" | "expense";
  onDraft: (draft: Record<string, unknown>) => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/finance/ai-row", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onDraft(data.draft || {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4 p-3 bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-100 rounded-lg">
      <div className="flex items-center gap-2 text-xs font-semibold text-violet-700 mb-2">
        <Sparkles size={14} /> Describe it — AI fills the form
      </div>
      <div className="flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder={
            kind === "sale"
              ? "e.g. sold 2 black Benz caps to Musa for 26k each, he paid 3500 delivery"
              : "e.g. paid 15k for meta ads yesterday"
          }
          className="flex-1 px-3 py-2 border border-violet-200 rounded-lg text-sm text-gray-900 bg-white/70 focus:outline-none focus:ring-2 focus:ring-violet-200 resize-none"
        />
        <button
          onClick={generate}
          disabled={loading || !text.trim()}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 self-stretch"
        >
          {loading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Sparkles size={15} />
          )}
          Generate
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

/* ------------------------------ modals ------------------------------ */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-600">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputCls =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10";

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </div>
  );
}

function SaleModal({
  edit,
  onClose,
  onSaved,
}: {
  edit?: Sale;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    date: toDateInput(edit?.date),
    customerName: edit?.customerName ?? "",
    customerPhone: edit?.customerPhone ?? "",
    productText: edit?.productText ?? "",
    variantText: edit?.variantText ?? "",
    quantity: edit?.quantity ?? 1,
    unitPrice: edit?.unitPrice ?? 0,
    deliveryFee: edit?.deliveryFee ?? "",
    deliveryPaidBy: edit?.deliveryPaidBy ?? "",
    location: edit?.location ?? "",
    totalCollected: edit?.totalCollected ?? "",
    profit: edit?.profit ?? "",
    paymentStatus: edit?.paymentStatus ?? "PAID",
    notes: edit?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  // Inventory item picker (create mode). Editing an itemised sale shows its
  // items read-only, since stock was already deducted at creation.
  const [inventory, setInventory] = useState<InventoryOption[]>([]);
  const [items, setItems] = useState<SaleLineItem[]>([]);

  useEffect(() => {
    if (edit) return;
    fetch("/api/admin/inventory")
      .then((r) => r.json())
      .then((d) => setInventory(Array.isArray(d.items) ? d.items : []))
      .catch(() => setInventory([]));
  }, [edit]);

  const itemsSubtotal = items.reduce(
    (s, i) => s + i.quantity * i.unitPrice,
    0
  );

  // Preview of the server's auto profit: collected − item costs − delivery.
  // Only when every line is linked to inventory with a known cost price.
  const allCosted =
    items.length > 0 &&
    items.every((i) => i.inventoryItemId && i.costPrice != null);
  const previewFee =
    form.deliveryFee === "" ? 0 : Number(form.deliveryFee) || 0;
  const previewCollected =
    form.totalCollected === ""
      ? itemsSubtotal + previewFee
      : Number(form.totalCollected) || 0;
  const estProfit = allCosted
    ? previewCollected -
      items.reduce((s, i) => s + i.quantity * (i.costPrice ?? 0), 0) -
      previewFee
    : null;

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { inventoryItemId: null, name: "", size: null, quantity: 1, unitPrice: 0 },
    ]);
  const removeItem = (idx: number) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));
  const setItem = (idx: number, patch: Partial<SaleLineItem>) =>
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...patch } : it))
    );
  const pickInventory = (idx: number, invId: string) => {
    const inv = inventory.find((v) => v.id === invId);
    if (!inv) {
      setItem(idx, { inventoryItemId: null });
      return;
    }
    setItem(idx, {
      inventoryItemId: inv.id,
      name: inv.name,
      size: inv.size,
      unitPrice: inv.sellingPrice ?? 0,
      costPrice: inv.costPrice,
    });
  };

  const applyDraft = (d: Record<string, unknown>) => {
    setForm((f) => ({
      ...f,
      date: d.date ? String(d.date).slice(0, 10) : f.date,
      customerName: (d.customerName as string) ?? f.customerName,
      customerPhone: (d.customerPhone as string) ?? f.customerPhone ?? "",
      productText: (d.productText as string) ?? f.productText,
      variantText: (d.variantText as string) ?? f.variantText ?? "",
      deliveryFee: d.deliveryFee == null ? "" : (d.deliveryFee as number),
      deliveryPaidBy: (d.deliveryPaidBy as string) ?? "",
      location: (d.location as string) ?? f.location ?? "",
      totalCollected: d.totalCollected == null ? "" : (d.totalCollected as number),
      profit: d.profit == null ? "" : (d.profit as number),
      paymentStatus: (d.paymentStatus as PaymentStatus) ?? f.paymentStatus,
      notes: (d.notes as string) ?? "",
    }));
    // AI-selected items
    const draftItems = Array.isArray(d.items) ? d.items : [];
    if (draftItems.length) {
      setItems(
        draftItems.map((raw) => {
          const it = raw as Record<string, unknown>;
          return {
            inventoryItemId: it.inventoryItemId
              ? String(it.inventoryItemId)
              : null,
            name: String(it.name || ""),
            size: it.size ? String(it.size) : null,
            quantity: Number(it.quantity) || 1,
            unitPrice: Number(it.unitPrice) || 0,
          };
        })
      );
    }
  };

  const submit = async () => {
    const cleanItems = items.filter((i) => i.name.trim() || i.inventoryItemId);
    if (!form.customerName.trim()) {
      alert("Customer is required.");
      return;
    }
    if (!edit && cleanItems.length === 0 && !form.productText.trim()) {
      alert("Add at least one item, or type a product.");
      return;
    }
    setSaving(true);
    try {
      const url = edit
        ? `/api/admin/finance/sales/${edit.id}`
        : "/api/admin/finance/sales";
      const res = await fetch(url, {
        method: edit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          edit ? form : { ...form, items: cleanItems }
        ),
      });
      if (!res.ok) throw new Error("Save failed");
      onSaved();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const hasItems = items.length > 0;

  return (
    <ModalShell title={edit ? "Edit sale" : "Add sale"} onClose={onClose}>
      {!edit && <AiCompose kind="sale" onDraft={applyDraft} />}

      {/* Items sold from inventory (create mode) */}
      {!edit && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-700">
              Items sold{" "}
              <span className="font-normal text-gray-400">
                (deducted from stock)
              </span>
            </span>
            <button
              onClick={addItem}
              className="flex items-center gap-1 text-xs font-medium text-black hover:underline"
            >
              <Plus size={13} /> Add item
            </button>
          </div>
          {items.length === 0 ? (
            <p className="text-xs text-gray-400">
              No items selected. Add items from inventory, or just type a product
              below for a manual sale.
            </p>
          ) : (
            <div className="space-y-2">
              {items.map((it, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-gray-200 p-3 bg-gray-50/50"
                >
                  {/* Item name on its own line (names are long) */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`text-sm font-medium leading-snug ${
                        it.name ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {it.name
                        ? `${it.name}${it.size ? ` · ${it.size}` : ""}`
                        : "No item selected"}
                    </span>
                    <button
                      onClick={() => removeItem(idx)}
                      title="Remove"
                      className="p-1 -m-1 text-gray-400 hover:text-red-600 rounded shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <select
                    value={it.inventoryItemId ?? ""}
                    onChange={(e) => pickInventory(idx, e.target.value)}
                    className={`${inputCls} w-full`}
                  >
                    <option value="">Select item…</option>
                    {inventory.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.name}
                        {inv.size ? ` - ${inv.size}` : ""} ({inv.quantity} in
                        stock)
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <label className="block">
                      <span className="text-[11px] font-medium text-gray-500">
                        Quantity
                      </span>
                      <input
                        type="number"
                        min={1}
                        value={it.quantity}
                        onChange={(e) =>
                          setItem(idx, { quantity: Number(e.target.value) })
                        }
                        className={`${inputCls} mt-0.5`}
                      />
                    </label>
                    <label className="block">
                      <span className="text-[11px] font-medium text-gray-500">
                        Sold price each (₦)
                      </span>
                      <input
                        type="number"
                        value={it.unitPrice}
                        onChange={(e) =>
                          setItem(idx, { unitPrice: Number(e.target.value) })
                        }
                        className={`${inputCls} mt-0.5`}
                      />
                    </label>
                  </div>

                  {it.quantity > 0 && it.unitPrice > 0 && (
                    <div className="text-right text-xs text-gray-500 mt-1.5">
                      Line total:{" "}
                      <span className="font-medium text-gray-700">
                        {naira(it.quantity * it.unitPrice)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              <div className="text-right text-xs text-gray-600">
                Subtotal:{" "}
                <span className="font-semibold">{naira(itemsSubtotal)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Existing items on an itemised sale (edit mode, read-only) */}
      {edit?.items && edit.items.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-100 rounded-lg">
          <span className="text-xs font-semibold text-gray-700">Items</span>
          <ul className="mt-1 space-y-0.5">
            {edit.items.map((it, i) => (
              <li
                key={i}
                className="text-xs text-gray-600 flex justify-between gap-2"
              >
                <span>
                  {it.name}
                  {it.size ? ` (${it.size})` : ""} × {it.quantity}
                </span>
                <span>{naira(it.unitPrice)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Date">
          <input
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Customer">
          <input
            value={form.customerName}
            onChange={(e) => set("customerName", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Phone number">
          <input
            type="tel"
            value={form.customerPhone}
            onChange={(e) => set("customerPhone", e.target.value)}
            placeholder="for new-stock reminders"
            className={inputCls}
          />
        </Field>
        {!hasItems && (
          <>
            <Field label="Product">
              <input
                value={form.productText}
                onChange={(e) => set("productText", e.target.value)}
                placeholder="e.g. Benz / Ferrari"
                className={inputCls}
              />
            </Field>
            <Field label="Variant / colour">
              <input
                value={form.variantText}
                onChange={(e) => set("variantText", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Quantity">
              <input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => set("quantity", Number(e.target.value))}
                className={inputCls}
              />
            </Field>
            <Field label="Unit price (₦)">
              <input
                type="number"
                value={form.unitPrice}
                onChange={(e) => set("unitPrice", Number(e.target.value))}
                className={inputCls}
              />
            </Field>
          </>
        )}
        <Field label="Delivery fee (₦)">
          <input
            type="number"
            value={form.deliveryFee}
            onChange={(e) => set("deliveryFee", e.target.value)}
            placeholder="optional"
            className={inputCls}
          />
        </Field>
        <Field label="Delivery paid by">
          <input
            value={form.deliveryPaidBy}
            onChange={(e) => set("deliveryPaidBy", e.target.value)}
            placeholder="Him / Her / Pickup…"
            className={inputCls}
          />
        </Field>
        <Field label="Location">
          <input
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="e.g. Abuja, Lagos - Lekki"
            className={inputCls}
          />
        </Field>
        <Field label="Total collected (₦)">
          <input
            type="number"
            value={form.totalCollected}
            onChange={(e) => set("totalCollected", e.target.value)}
            placeholder="auto if blank"
            className={inputCls}
          />
        </Field>
        <Field label="Profit (₦)">
          <input
            type="number"
            value={form.profit}
            onChange={(e) => set("profit", e.target.value)}
            placeholder={
              estProfit !== null
                ? `auto: ₦${estProfit.toLocaleString()} (real profit)`
                : "blank = none yet"
            }
            className={inputCls}
          />
        </Field>
        <Field label="Payment status">
          <select
            value={form.paymentStatus}
            onChange={(e) => set("paymentStatus", e.target.value)}
            className={inputCls}
          >
            {PAYMENT_STATUSES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Notes">
          <input
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>
      <ModalActions saving={saving} onClose={onClose} onSubmit={submit} />
    </ModalShell>
  );
}

function ExpenseModal({
  edit,
  onClose,
  onSaved,
}: {
  edit?: Expense;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    date: toDateInput(edit?.date),
    category: edit?.category ?? "ADS",
    description: edit?.description ?? "",
    amount: edit?.amount ?? "",
    notes: edit?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const applyDraft = (d: Record<string, unknown>) => {
    setForm((f) => ({
      ...f,
      date: d.date ? String(d.date).slice(0, 10) : f.date,
      category: (d.category as string) ?? f.category,
      description: (d.description as string) ?? f.description,
      amount: d.amount == null ? f.amount : (d.amount as number),
      notes: (d.notes as string) ?? "",
    }));
  };

  const submit = async () => {
    if (!form.amount || Number(form.amount) <= 0) {
      alert("A positive amount is required.");
      return;
    }
    setSaving(true);
    try {
      const url = edit
        ? `/api/admin/finance/expenses/${edit.id}`
        : "/api/admin/finance/expenses";
      const res = await fetch(url, {
        method: edit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      onSaved();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={edit ? "Edit expense" : "Add expense"} onClose={onClose}>
      {!edit && <AiCompose kind="expense" onDraft={applyDraft} />}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date">
          <input
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Category">
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className={inputCls}
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <div className="col-span-2">
          <Field label="Description">
            <input
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Amount (₦)">
          <input
            type="number"
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Notes">
          <input
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>
      <ModalActions saving={saving} onClose={onClose} onSubmit={submit} />
    </ModalShell>
  );
}

function ModalActions({
  saving,
  onClose,
  onSubmit,
}: {
  saving: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="flex justify-end gap-2 mt-5">
      <button
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
      >
        Cancel
      </button>
      <button
        onClick={onSubmit}
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50"
      >
        {saving && <Loader2 size={15} className="animate-spin" />}
        Save
      </button>
    </div>
  );
}
