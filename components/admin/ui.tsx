"use client";

// Shared admin UI primitives (modelled on the ones in app/admin/finance).
import { motion } from "framer-motion";
import { Loader2, X } from "lucide-react";

export const naira = (n: number | null | undefined) =>
  n === null || n === undefined
    ? "—"
    : new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 0,
      }).format(n);

export const fmtDate = (d: string | Date | null | undefined) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export const toDateInput = (d?: string | Date | null) =>
  (d ? new Date(d) : new Date()).toISOString().slice(0, 10);

export const inputCls =
  "w-full min-w-0 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="text-xs font-medium text-gray-600">{label}</span>
      <div className="mt-1">{children}</div>
      {hint && <span className="mt-1 block text-[11px] text-gray-400">{hint}</span>}
    </label>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  tone?: "pos" | "neg" | "warn";
}) {
  const toneCls =
    tone === "pos"
      ? "text-emerald-700"
      : tone === "neg"
        ? "text-red-600"
        : tone === "warn"
          ? "text-amber-600"
          : "text-gray-900";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm min-w-0"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-gray-500 truncate">{label}</span>
        {icon}
      </div>
      <div className={`mt-2 text-xl font-semibold truncate ${toneCls}`}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-gray-400 truncate">{sub}</div>}
    </motion.div>
  );
}

export function ModalShell({
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
        className="bg-white rounded-2xl shadow-xl w-full min-w-0 max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
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

export function ModalActions({
  saving,
  onClose,
  onSubmit,
  label = "Save",
}: {
  saving: boolean;
  onClose: () => void;
  onSubmit: () => void;
  label?: string;
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
        {label}
      </button>
    </div>
  );
}
